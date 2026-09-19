import { db, nowIso } from "../../database/connection.mjs";

const maxConcurrency=Math.max(1,Math.min(2,Number(process.env.MAX_CONCURRENT_AI_TASKS||process.env.DEXTER_MAX_CONCURRENCY||1)||1));
let active=0;
const queue=[];
const state={started:false,completed:0,failed:0,totalDurationMs:0,lastCapability:"",lastSource:"",lastStartedAt:"",lastCompletedAt:"",lastError:""};

function persistCounters(){
  try{db.prepare(`INSERT INTO ai_runtime_counters(runtime_key,completed_count,failed_count,total_duration_ms,updated_at) VALUES('local',?,?,?,?) ON CONFLICT(runtime_key) DO UPDATE SET completed_count=excluded.completed_count,failed_count=excluded.failed_count,total_duration_ms=excluded.total_duration_ms,updated_at=excluded.updated_at`).run(state.completed,state.failed,state.totalDurationMs,nowIso());}catch{}
}
function wake(){while(active<maxConcurrency&&queue.length){const next=queue.shift();active++;next();}}
function acquire(){return new Promise(resolve=>{queue.push(resolve);wake();});}
function release(){active=Math.max(0,active-1);wake();}

export async function runLocalAITask({capability="unknown",source="unknown",execute,signal=null}={}){
  if(typeof execute!=="function")throw new TypeError("AI_RUNTIME_EXECUTE_REQUIRED");
  if(signal?.aborted)throw signal.reason||new Error("AI_TASK_ABORTED");
  await acquire();
  const started=Date.now();
  state.started=true;state.lastCapability=String(capability||"unknown");state.lastSource=String(source||"unknown");state.lastStartedAt=nowIso();state.lastError="";
  try{
    const result=await execute();
    state.completed++;state.lastCompletedAt=nowIso();state.totalDurationMs+=Date.now()-started;persistCounters();
    return result;
  }catch(error){
    state.failed++;state.lastCompletedAt=nowIso();state.lastError=String(error?.code||error?.message||error||"AI_RUNTIME_FAILED").slice(0,160);state.totalDurationMs+=Date.now()-started;persistCounters();throw error;
  }finally{release();}
}

export function localAIRuntimeStatus(){
  return {runtime:"LOCAL_SHARED_LAZY",provider:"ollama",model:String(process.env.OLLAMA_MODEL||process.env.DEXTER_MODEL||"gemma3:4b"),started:state.started,active,queued:queue.length,concurrency:maxConcurrency,completed:state.completed,failed:state.failed,averageMs:state.completed+state.failed?Math.round(state.totalDurationMs/(state.completed+state.failed)):0,lastCapability:state.lastCapability,lastSource:state.lastSource,lastStartedAt:state.lastStartedAt,lastCompletedAt:state.lastCompletedAt,lastError:state.lastError};
}
