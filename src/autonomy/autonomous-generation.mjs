import { db } from "../database/connection.mjs";
import { getEntityById } from "../database/repositories/entity-repository.mjs";
import { getGameById } from "../database/repositories/game-repository.mjs";
import { getPageForEntity } from "../database/repositories/page-repository.mjs";
import { createGenerationJob, getGenerationJob } from "../database/repositories/generation-job-repository.mjs";
import { upsertAutogenCandidate, listAutogenQueue, updateAutogenCandidate, autogenMetrics } from "../database/repositories/autogen-repository.mjs";
import { scheduleGeneration } from "../pages/generation-runner.mjs";
import { normalizePageType } from "../pages/page-templates.mjs";
import { setAutogenKnowledgeState, autogenStateMetrics } from "../database/repositories/autogen-state-repository.mjs";
import { evaluateKnowledgeQuality } from "./knowledge-quality-gate.mjs";
import { getCanonicalState, recordEntityConsistency, normalizeEntityType } from "../entities/canonical-entity-service.mjs";
import { recordGenerationDiagnostic } from "../database/repositories/generation-diagnostics-repository.mjs";
import { describeKnowledgeGap } from "../quality/knowledge-gap.mjs";
import { classifyEntityType } from "../core85/deterministic-intelligence.mjs";
import { researchGameVault } from "../research/orchestrator.mjs";
import { persistResearchKnowledge } from "../knowledge/knowledge-service.mjs";

let timer=null,running=false;
function enabled(){return String(process.env.GAMEVAULT_AUTOGEN_ENABLED??"true").toLowerCase()!=="false";}
function batchSize(){return Math.max(1,Math.min(5,Number(process.env.GAMEVAULT_AUTOGEN_BATCH||2)));}
function pageTypeFor(entity,game=null){const type=classifyEntityType({entity,subject:entity?.name||"",question:`${entity?.name||""} page`});return normalizePageType(type||entity?.type||"OTHER");}
function priorityFor(count,confidence){if(count>=10&&confidence>=.8)return "HIGH";if(count>=5&&confidence>=.65)return "NORMAL";return "LOW";}
function getAutogenScore(candidateId){try{return Number(db.prepare(`SELECT knowledge_score FROM autogen_knowledge_states WHERE candidate_id=?`).get(candidateId)?.knowledge_score||0)}catch{return 0}}
function retryAt(hours=6){return new Date(Date.now()+Math.max(1,Number(hours)||6)*3600_000).toISOString();}
function retryDue(item){if(!item?.nextAttemptAt)return true;const t=Date.parse(item.nextAttemptAt);return !Number.isFinite(t)||t<=Date.now();}
export function selectAutogenWork({limit=batchSize()}={}){
  const pool=[
    ...listAutogenQueue({status:"QUEUED",limit:100}),
    ...listAutogenQueue({status:"CANDIDATE",limit:100}),
    ...listAutogenQueue({status:"WAITING_FOR_RESEARCH",limit:100}).filter(x=>Number(x.attempts||0)<3&&retryDue(x)),
    ...listAutogenQueue({status:"WAITING_FOR_KNOWLEDGE",limit:100}).filter(x=>Number(x.attempts||0)<2&&retryDue(x))
  ];
  const seen=new Set();return pool.filter(x=>x?.id&&!seen.has(x.id)&&seen.add(x.id)).slice(0,Math.max(1,Number(limit)||batchSize()));
}
export function evaluateAutogenKnowledgeQuality(entityId,pageType="OTHER"){
  return evaluateKnowledgeQuality({entityId,pageType});
}

export function discoverAutogenCandidates({limit=30,language="pt-BR"}={}){
  const rows=db.prepare(`SELECT e.id entity_id,e.game_id,e.type,COUNT(k.id) knowledge_count,AVG(k.confidence) confidence FROM entities e JOIN games g ON g.id=e.game_id AND g.status='PUBLISHED' JOIN knowledge k ON k.entity_id=e.id AND k.status NOT IN ('REJECTED','OUTDATED','SUPERSEDED') LEFT JOIN pages p ON p.game_id=e.game_id AND p.entity_id=e.id AND p.language=? WHERE p.id IS NULL GROUP BY e.id HAVING COUNT(k.id)>=3 AND AVG(k.confidence)>=0.52 ORDER BY COUNT(k.id) DESC,AVG(k.confidence) DESC LIMIT ?`).all(language,Math.min(200,Math.max(1,Number(limit)||30)));
  return rows.map(row=>{const game=getGameById(row.game_id),entity=getEntityById(row.entity_id);return upsertAutogenCandidate({gameId:row.game_id,entityId:row.entity_id,pageType:pageTypeFor(entity||{type:row.type},game),language,priority:priorityFor(Number(row.knowledge_count),Number(row.confidence)),reason:"MISSING_PAGE_WITH_VALIDATED_KNOWLEDGE",knowledgeCount:Number(row.knowledge_count),confidence:Number(row.confidence)});});
}
export function reconcileAutogenQueue(){
  for(const item of listAutogenQueue({limit:200}).filter(x=>x.generationJobId&&new Set(["RUNNING","QUEUED","BUILDING","READY_TO_BUILD"]).has(x.status))){
    const job=getGenerationJob(item.generationJobId);if(!job)continue;
    if(new Set(["READY","NEEDS_REVIEW","NEEDS_RESEARCH"]).has(job.status)){
      const next=job.status==="READY"?"READY":job.status==="NEEDS_RESEARCH"?"WAITING_FOR_RESEARCH":"NEEDS_REVIEW";
      updateAutogenCandidate(item.id,{status:next,resultPageId:job.resultPageId});
      setAutogenKnowledgeState(item.id,{knowledgeScore:getAutogenScore(item.id),state:next,reason:`Generation job ${job.status}`});
    }else if(job.status==="FAILED"){
      updateAutogenCandidate(item.id,{status:"FAILED",errorCode:job.errorCode||"GENERATION_FAILED"});
      setAutogenKnowledgeState(item.id,{knowledgeScore:getAutogenScore(item.id),state:"FAILED",reason:job.errorCode||"GENERATION_FAILED",lastFailure:job.errorCode||"GENERATION_FAILED"});
    }else if(job.status==="CANCELLED") updateAutogenCandidate(item.id,{status:"SKIPPED",errorCode:"CANCELLED"});
  }
  return {...autogenMetrics(),states:autogenStateMetrics()};
}
async function startCandidate(item){
  const game=getGameById(item.gameId),entity=item.entityId?getEntityById(item.entityId):null;
  if(!game||!entity){recordGenerationDiagnostic({gameId:item.gameId,entityId:item.entityId,stage:"ENTITY_VALIDATION",status:"FAILED",progress:5,errorCode:"ENTITY_OR_GAME_MISSING"});return updateAutogenCandidate(item.id,{status:"FAILED",errorCode:"ENTITY_OR_GAME_MISSING"});}
  if(getPageForEntity(game.id,entity.id,{pageType:item.pageType,language:item.language}))return updateAutogenCandidate(item.id,{status:"SKIPPED",errorCode:"PAGE_ALREADY_EXISTS"});
  const canonical=getCanonicalState(entity.id);const canonicalType=normalizeEntityType(canonical?.canonicalType||entity.type);const requestedType=normalizeEntityType(item.pageType);
  try{recordEntityConsistency({entityId:entity.id,gameId:game.id,canonicalType,subsystem:"AUTOGEN_V3",observedType:requestedType,details:{candidateId:item.id}});}catch{}
  if(requestedType!=="OTHER"&&requestedType!=="GUIDE_TOPIC"&&canonicalType!==requestedType){
    recordGenerationDiagnostic({gameId:game.id,entityId:entity.id,stage:"ENTITY_VALIDATION",status:"SAFE_BLOCK",progress:5,errorCode:"ENTITY_TYPE_CONFLICT",details:{candidateType:requestedType,canonicalType}});
    setAutogenKnowledgeState(item.id,{knowledgeScore:0,state:"NEEDS_DEV_REVIEW",reason:`Entity type conflict: ${requestedType} vs ${canonicalType}`,lastFailure:"ENTITY_TYPE_CONFLICT"});
    return updateAutogenCandidate(item.id,{status:"NEEDS_DEV_REVIEW",errorCode:"ENTITY_TYPE_CONFLICT",reason:`Canonical ${canonicalType}; candidate ${requestedType}`});
  }
  const effectiveType=canonicalType||requestedType;updateAutogenCandidate(item.id,{status:"ENTITY_VALIDATION",reason:`Canonical type: ${effectiveType}`});
  recordGenerationDiagnostic({gameId:game.id,entityId:entity.id,stage:"ENTITY_VALIDATION",status:"COMPLETE",progress:5,details:{canonicalType:effectiveType}});
  let quality=evaluateAutogenKnowledgeQuality(entity.id,effectiveType);setAutogenKnowledgeState(item.id,{knowledgeScore:quality.score,state:quality.passed?"READY_TO_BUILD":"WAITING_FOR_RESEARCH",reason:`${quality.knowledgeCount} knowledge · ${quality.claimCount} claims · ${quality.sourceCount} sources · missing ${quality.missing.join(",")||"none"}`});
  if(!quality.passed){
    let knowledgeGap=describeKnowledgeGap({game,entity,intent:"",entityType:effectiveType,quality,pageType:effectiveType});
    updateAutogenCandidate(item.id,{status:"WAITING_FOR_RESEARCH",attempts:item.attempts+1,errorCode:"INSUFFICIENT_KNOWLEDGE_PREBUILD",reason:knowledgeGap.missing.join(",")||quality.missing.join(",")});
    recordGenerationDiagnostic({gameId:game.id,entityId:entity.id,stage:"KNOWLEDGE_QUALITY_GATE",status:"SAFE_BLOCK",progress:12,errorCode:"INSUFFICIENT_KNOWLEDGE_PREBUILD",details:{...quality,knowledgeGap}});
    const researchEnabled=String(process.env.GAMEVAULT_AUTOGEN_RESEARCH??"true").toLowerCase()!=="false";
    if(researchEnabled){
      updateAutogenCandidate(item.id,{status:"RESEARCHING"});setAutogenKnowledgeState(item.id,{knowledgeScore:quality.score,state:"RESEARCHING",reason:"GI Core script research in progress."});
      recordGenerationDiagnostic({gameId:game.id,entityId:entity.id,stage:"AUTOGEN_RESEARCH",status:"RESEARCHING",progress:28,details:{before:quality,engine:"GI_CORE_SCRIPT_RESEARCH"}});
      const query=`${entity.name} ${game.nome} ${effectiveType} requisitos como obter usar localização informações específicas`;
      const research=await researchGameVault({game,entity,query,intent:"overview",language:item.language});
      const persisted=persistResearchKnowledge({understanding:{question:query,game,entity,intent:"overview",subject:entity.name,tabId:"overview",sectionId:"summary"},research});
      quality=evaluateAutogenKnowledgeQuality(entity.id,effectiveType);
      knowledgeGap=describeKnowledgeGap({game,entity,intent:"overview",entityType:effectiveType,quality,pageType:effectiveType});
      recordGenerationDiagnostic({gameId:game.id,entityId:entity.id,stage:"AUTOGEN_RESEARCH",status:quality.passed?"COMPLETE":"SAFE_BLOCK",progress:42,errorCode:quality.passed?"":"INSUFFICIENT_KNOWLEDGE",details:{after:quality,knowledgeGap,research:{engine:"GI_CORE_SCRIPT_RESEARCH",sources:research.sources?.length||0,accepted:research.validation?.accepted?.length||0,persisted:Boolean(persisted?.knowledge)}}});
    }
    if(!quality.passed){const reason=knowledgeGap?.missing?.join(",")||quality.missing.join(",")||"INSUFFICIENT_FACTUAL_COVERAGE";setAutogenKnowledgeState(item.id,{knowledgeScore:quality.score,state:"WAITING_FOR_KNOWLEDGE",reason:`Missing: ${reason}`,retryCount:item.attempts+1,lastFailure:"INSUFFICIENT_KNOWLEDGE"});return updateAutogenCandidate(item.id,{status:"WAITING_FOR_KNOWLEDGE",attempts:item.attempts+1,nextAttemptAt:retryAt(6),errorCode:"INSUFFICIENT_KNOWLEDGE",reason});}
  }
  setAutogenKnowledgeState(item.id,{knowledgeScore:quality.score,state:"READY_TO_BUILD",reason:"Knowledge Quality Gate V3 passed."});
  updateAutogenCandidate(item.id,{status:"READY_TO_BUILD",pageType:effectiveType,knowledgeCount:quality.knowledgeCount,confidence:quality.confidence,nextAttemptAt:"",errorCode:"",reason:"QUALITY_GATE_PASS"});
  recordGenerationDiagnostic({gameId:game.id,entityId:entity.id,stage:"KNOWLEDGE_QUALITY_GATE",status:"COMPLETE",progress:55,details:quality});
  const job=createGenerationJob({userId:null,gameId:game.id,entityId:entity.id,jobType:"AUTONOMOUS_PAGE",researchMode:"STANDARD",language:item.language});
  updateAutogenCandidate(item.id,{status:"BUILDING",generationJobId:job.id});setAutogenKnowledgeState(item.id,{knowledgeScore:quality.score,state:"BUILDING",reason:"Page Builder started after quality gate."});
  recordGenerationDiagnostic({gameId:game.id,entityId:entity.id,stage:"AUTOGEN_QUEUE",status:"QUEUED",progress:60,details:{jobId:job.id,priority:item.priority,knowledgeScore:quality.score,entityType:effectiveType,engine:"GI_CORE_SCRIPT_AUTOGEN"}});scheduleGeneration(job.id);return updateAutogenCandidate(item.id,{status:"BUILDING",generationJobId:job.id});
}

export async function processAutogenCandidate(candidate){const item=typeof candidate==="string"?listAutogenQueue({limit:500}).find(x=>x.id===candidate):candidate;if(!item)throw new Error("AUTOGEN_CANDIDATE_NOT_FOUND");return startCandidate(item);}

export async function runAutonomousGenerationCycle({language="pt-BR"}={}){
  if(running)return {skipped:true,reason:"CYCLE_ALREADY_RUNNING",metrics:autogenMetrics()};if(!enabled())return {skipped:true,reason:"AUTOGEN_DISABLED",metrics:autogenMetrics()};running=true;const started=Date.now();try{reconcileAutogenQueue();const discovered=discoverAutogenCandidates({language,limit:50});const queued=selectAutogenWork({limit:batchSize()});const startedJobs=[];for(const item of queued)startedJobs.push(await startCandidate(item));return {skipped:false,engine:"GI_CORE_SCRIPT_AUTOGEN",durationMs:Date.now()-started,discovered:discovered.length,started:startedJobs,metrics:{...autogenMetrics(),states:autogenStateMetrics()}};}catch(error){return {skipped:false,engine:"GI_CORE_SCRIPT_AUTOGEN",durationMs:Date.now()-started,error:String(error.message||"AUTOGEN_FAILED"),metrics:{...autogenMetrics(),states:autogenStateMetrics()}};}finally{running=false;}
}
export function startAutonomousGenerationWorker(){if(timer||!enabled())return {active:Boolean(timer),enabled:enabled()};const interval=Math.max(60_000,Number(process.env.GAMEVAULT_AUTOGEN_INTERVAL_MS||90000));const first=Math.max(2500,Math.min(30_000,Number(process.env.GAMEVAULT_AUTOGEN_FIRST_RUN_MS||4000)));setTimeout(()=>runAutonomousGenerationCycle().catch(()=>{}),first).unref?.();timer=setInterval(()=>runAutonomousGenerationCycle().catch(()=>{}),interval);timer.unref?.();return {active:true,enabled:true,intervalMs:interval};}
export function autonomousGenerationStatus(){return {enabled:enabled(),workerActive:Boolean(timer),running,batchSize:batchSize(),research:String(process.env.GAMEVAULT_AUTOGEN_RESEARCH??"true").toLowerCase()!=="false",metrics:{...autogenMetrics(),states:autogenStateMetrics()}};}
