import { createHash, randomUUID } from "node:crypto";
import { db, json, nowIso, parseJson } from "../database/connection.mjs";
import { ollamaConfig, ollamaHealth, ollamaStructured } from "./ollama-provider.mjs";
import { capabilityForTaskType } from "../ai/runtime/ai-capabilities.mjs";
import { routeAITask } from "../ai/runtime/task-router.mjs";
import { localAIRuntimeStatus } from "../ai/runtime/local-ai-runtime.mjs";

const MAX_CONCURRENCY=Math.max(1,Math.min(2,Number(process.env.MAX_CONCURRENT_AI_TASKS||process.env.DEXTER_MAX_CONCURRENCY||1)||1));
let active=0;
const waiters=[];
let circuit={failures:0,openUntil:0,lastError:"",lastSuccess:""};

const CONTRACTS={
  PUBLIC_ANSWER:{timeoutClass:"STANDARD",maxInputChars:24000,required:["directAnswer","details","confidence"]},
  IMAGE_SEMANTIC_REVIEW:{timeoutClass:"VISION",maxInputChars:5000,required:["accepted","confidence","reasonCode"]},
  RESEARCH_SYNTHESIS:{timeoutClass:"DEEP",maxInputChars:60000,required:["summary","facts","confidence"]},
  CONTENT_SYNTHESIS:{timeoutClass:"STANDARD",maxInputChars:30000,required:["title","summary","sections"]},
  SEMANTIC_REVIEW:{timeoutClass:"FAST",maxInputChars:12000,required:["accepted","confidence","reasonCode"]},
  QUERY_REFINEMENT:{timeoutClass:"FAST",maxInputChars:8000,required:["queries"]}
};
function contract(type){return CONTRACTS[String(type||"").toUpperCase()]||CONTRACTS.SEMANTIC_REVIEW;}
function digest(value){return createHash("sha256").update(JSON.stringify(value??null)).digest("hex");}
function canRun(){return Date.now()>=circuit.openUntil;}
async function acquire(){if(active<MAX_CONCURRENCY){active++;return;}await new Promise(resolve=>waiters.push(resolve));active++;}
function release(){active=Math.max(0,active-1);waiters.shift()?.();}
function validateResult(type,result){
  const c=contract(type);if(!result||typeof result!=="object"||Array.isArray(result))return {ok:false,reason:"RESULT_NOT_OBJECT"};
  for(const key of c.required)if(!(key in result))return {ok:false,reason:`MISSING_${key.toUpperCase()}`};
  if("confidence" in result){const n=Number(result.confidence);if(!Number.isFinite(n)||n<0||n>1)return {ok:false,reason:"CONFIDENCE_OUT_OF_RANGE"};}
  return {ok:true};
}
function taskRow(id){const r=db.prepare(`SELECT * FROM dexter_tasks WHERE id=?`).get(id);return r?{id:r.id,taskType:r.task_type,schemaVersion:r.schema_version,gameId:r.game_id,entityId:r.entity_id,provider:r.provider,model:r.model,status:r.status,timeoutClass:r.timeout_class,inputDigest:r.input_digest,result:parseJson(r.result_json,{}),reasonCode:r.reason_code,durationMs:Number(r.duration_ms||0),createdAt:r.created_at,startedAt:r.started_at,completedAt:r.completed_at}:null;}

export async function runDexterTask({taskType,schemaVersion="1",gameId=null,entityId=null,input={},system="",prompt="",images=[],signal=null}={}){
  const type=String(taskType||"SEMANTIC_REVIEW").toUpperCase(),c=contract(type),cfg=ollamaConfig(),id=`dexter-${randomUUID()}`,now=nowIso();
  const compactInput=JSON.stringify(input??{}).slice(0,c.maxInputChars);
  db.prepare(`INSERT INTO dexter_tasks(id,task_type,schema_version,game_id,entity_id,provider,model,status,timeout_class,input_digest,result_json,reason_code,duration_ms,created_at,started_at,completed_at) VALUES(?,?,?,?,?,?,?,'QUEUED',?,?, '{}','',0,?,'','')`).run(id,type,schemaVersion,gameId,entityId,cfg.provider,cfg.model,c.timeoutClass,digest(input),now);
  if(!canRun()){
    db.prepare(`UPDATE dexter_tasks SET status='WAITING_PROVIDER',reason_code='CIRCUIT_OPEN',completed_at=?,duration_ms=0 WHERE id=?`).run(nowIso(),id);
    return {ok:false,degraded:true,reasonCode:"CIRCUIT_OPEN",task:taskRow(id)};
  }
  await acquire();const started=Date.now();
  try{
    db.prepare(`UPDATE dexter_tasks SET status='RUNNING',started_at=? WHERE id=?`).run(nowIso(),id);
    const requestPrompt=prompt||`Task type: ${type}\nInput JSON:\n${compactInput}`;
    const routed=await routeAITask({capability:capabilityForTaskType(type),source:"dexter",signal,execute:async()=>{
      let modelResult=await ollamaStructured({system,prompt:requestPrompt,images,timeoutClass:c.timeoutClass,signal});
      let verdict=validateResult(type,modelResult.data);
      if(!verdict.ok){
        modelResult=await ollamaStructured({system:"Repair the previous output. Return only a JSON object matching the required contract.",prompt:`Task: ${type}\nValidation error: ${verdict.reason}\nOriginal input: ${compactInput}\nPrevious output: ${JSON.stringify(modelResult.data).slice(0,6000)}`,images:[],timeoutClass:"FAST",temperature:0.1,signal});
        verdict=validateResult(type,modelResult.data);
      }
      if(!verdict.ok)throw Object.assign(new Error("DEXTER_SCHEMA_REJECTED"),{code:"DEXTER_SCHEMA_REJECTED",reason:verdict.reason});
      return modelResult;
    }});
    const modelResult=routed;
    const duration=Date.now()-started;circuit={failures:0,openUntil:0,lastError:"",lastSuccess:nowIso()};
    db.prepare(`UPDATE dexter_tasks SET status='COMPLETED',result_json=?,reason_code='OK',duration_ms=?,completed_at=? WHERE id=?`).run(json(modelResult.data),duration,nowIso(),id);
    return {ok:true,data:modelResult.data,model:modelResult.model,durationMs:duration,task:taskRow(id)};
  }catch(error){
    circuit.failures++;circuit.lastError=String(error?.code||error?.message||"DEXTER_FAILED");if(circuit.failures>=3)circuit.openUntil=Date.now()+30000;
    const duration=Date.now()-started,reason=String(error?.code||"DEXTER_PROVIDER_OFFLINE").slice(0,120);
    db.prepare(`UPDATE dexter_tasks SET status='FAILED',reason_code=?,duration_ms=?,completed_at=? WHERE id=?`).run(reason,duration,nowIso(),id);
    return {ok:false,degraded:true,reasonCode:reason,error:String(error?.message||error).slice(0,500),task:taskRow(id)};
  }finally{release();}
}

export async function dexterStatus({probe=true}={}){
  const cfg=ollamaConfig(),provider=probe?await ollamaHealth():null;
  const summary={};for(const r of db.prepare(`SELECT status,COUNT(*) count FROM dexter_tasks GROUP BY status`).all())summary[r.status]=Number(r.count);
  const perf=db.prepare(`SELECT COUNT(*) count,COALESCE(AVG(duration_ms),0) avg_ms,COALESCE(MAX(duration_ms),0) max_ms FROM dexter_tasks WHERE created_at>=? AND duration_ms>0`).get(new Date(Date.now()-24*60*60*1000).toISOString());
  return {provider:"ollama",model:cfg.model,apiKeyRequired:false,runtime:"LOCAL_SHARED_LAZY",reachable:provider?.reachable??null,modelInstalled:provider?.modelInstalled??null,providerHealth:provider,active,concurrency:MAX_CONCURRENCY,sharedRuntime:localAIRuntimeStatus(),queue:summary,recent:{count:Number(perf?.count||0),avgLatencyMs:Math.round(Number(perf?.avg_ms||0)),maxLatencyMs:Math.round(Number(perf?.max_ms||0))},circuit:{open:!canRun(),failures:circuit.failures,lastError:circuit.lastError,lastSuccess:circuit.lastSuccess}};
}

export function recentDexterTasks({limit=50}={}){return db.prepare(`SELECT id FROM dexter_tasks ORDER BY created_at DESC LIMIT ?`).all(Math.min(200,Math.max(1,Number(limit)||50))).map(r=>taskRow(r.id));}
