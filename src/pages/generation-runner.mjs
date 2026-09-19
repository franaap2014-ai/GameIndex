import {
  getGenerationJob, updateGenerationJob, listRecoverableGenerationJobs, markGenerationRecovered,
  TERMINAL_GENERATION_STATUSES
} from "../database/repositories/generation-job-repository.mjs";
import { getGameById } from "../database/repositories/game-repository.mjs";
import { getEntityById } from "../database/repositories/entity-repository.mjs";
import { listKnowledge } from "../database/repositories/knowledge-repository.mjs";
import { attachPageImages, getPageById } from "../database/repositories/page-repository.mjs";
import { deepResearchForPage } from "./deep-research.mjs";
import { buildPageFromKnowledge } from "./page-builder.mjs";
import { ensurePageImages3 } from "../images/page-image3.mjs";
import { recordGenerationDiagnostic } from "../database/repositories/generation-diagnostics-repository.mjs";
import { evaluateKnowledgeQuality } from "../autonomy/knowledge-quality-gate.mjs";
import { getCanonicalState, normalizeEntityType } from "../entities/canonical-entity-service.mjs";
import { fillerAudit } from "../core85/deterministic-intelligence.mjs";

const active=new Set();
let recoveryTimer=null,recoveryBusy=false;

export const GENERATION_STAGES=[
  "IDENTIFY_TARGET","CHECK_EXISTING_KNOWLEDGE","RESEARCH_REQUIRED","RESEARCH","VERIFY_EVIDENCE",
  "BUILD_CONTENT","CONTENT_VALIDATION","IMAGE_RESOLVE","RELATIONSHIP_BUILD","INDEX","FINAL_VERIFY","READY"
];
const PROGRESS={
  QUEUED:0,IDENTIFY_TARGET:5,CHECK_EXISTING_KNOWLEDGE:14,RESEARCH_REQUIRED:20,RESEARCH:35,
  VERIFY_EVIDENCE:55,BUILD_CONTENT:68,CONTENT_VALIDATION:76,IMAGE_RESOLVE:84,
  RELATIONSHIP_BUILD:90,INDEX:94,FINAL_VERIFY:98,READY:100
};
function jobCancelled(id){return Boolean(getGenerationJob(id)?.cancelRequested);}
function sourceCountFor(entries=[]){return new Set(entries.flatMap(k=>(k.claims||[]).flatMap(c=>c.sourceIds||[])).filter(Boolean)).size;}
function usefulEntries(entries=[]){return entries.filter(k=>{const texts=[k.summary,...(k.claims||[]).map(c=>c.text)].filter(Boolean);return texts.some(t=>String(t).trim().length>28&&!fillerAudit([t]).detected);});}
function snapshot(game,entity){
  const all=listKnowledge({gameId:game.id,limit:1500}).entries;
  const scoped=entity?all.filter(k=>k.entityId===entity.id):all;
  const useful=usefulEntries(scoped);
  return {all,scoped,useful,sourceCount:sourceCountFor(useful)};
}
function gameQuality(snap){
  const claims=snap.useful.flatMap(k=>k.claims||[]).filter(c=>String(c.text||"").trim().length>28);
  const confidence=snap.useful.length?snap.useful.reduce((n,k)=>n+Number(k.confidence||0),0)/snap.useful.length:0;
  const passed=snap.useful.length>=3&&claims.length>=3&&snap.sourceCount>=1&&confidence>=.52;
  const missing=[];if(snap.useful.length<3)missing.push("KNOWLEDGE");if(claims.length<3)missing.push("CLAIMS");if(snap.sourceCount<1)missing.push("SOURCES");if(confidence<.52)missing.push("CONFIDENCE");
  return {passed,score:Number(Math.min(1,snap.useful.length/6*.3+claims.length/6*.3+Math.min(1,snap.sourceCount/2)*.2+confidence*.2).toFixed(3)),threshold:.58,type:"GAME",knowledgeCount:snap.useful.length,claimCount:claims.length,sourceCount:snap.sourceCount,confidence:Number(confidence.toFixed(3)),missing,reasons:passed?[]:["INSUFFICIENT_KNOWLEDGE"]};
}
function evaluateTargetQuality(game,entity,snap){
  if(!entity)return gameQuality(snap);
  const canonicalType=normalizeEntityType(getCanonicalState(entity.id)?.canonicalType||entity.type);
  return evaluateKnowledgeQuality({entityId:entity.id,pageType:canonicalType});
}
function stageUpdater(id,history,job){
  let started=Date.now();
  return async(stage,status=stage,extra={})=>{
    const prev=history.at(-1);if(prev&&!prev.durationMs)prev.durationMs=Date.now()-started;started=Date.now();
    history.push({stage,startedAt:new Date().toISOString()});
    const state={...(getGenerationJob(id)?.state||{}),stage,status,lastTransitionAt:new Date().toISOString()};
    updateGenerationJob(id,{status,progress:PROGRESS[stage]??0,currentStage:stage,started:true,stageHistory:history,state,...extra});
    recordGenerationDiagnostic({generationJobId:id,gameId:job?.gameId||null,entityId:job?.entityId||null,stage,status,progress:PROGRESS[stage]??0,details:{sourceCount:extra.sourceCount||0,knowledgeCreated:extra.knowledgeCreated||0,imagesUsed:extra.imagesUsed||0}});
    await new Promise(r=>setTimeout(r,0));
  };
}
function finalizeHistory(history,stage){const prev=history.at(-1);if(prev&&!prev.durationMs)prev.durationMs=Math.max(0,Date.now()-new Date(prev.startedAt).getTime());history.push({stage,startedAt:new Date().toISOString(),durationMs:0});}

export function scheduleGeneration(jobId){
  if(active.has(jobId))return {scheduled:false,reused:true};
  active.add(jobId);setImmediate(()=>runGeneration(jobId).finally(()=>active.delete(jobId)));
  return {scheduled:true};
}

export function recoverPersistedGenerations({limit=100}={}){
  const jobs=listRecoverableGenerationJobs({limit});let scheduled=0;
  for(const job of jobs){if(active.has(job.id))continue;markGenerationRecovered(job.id);if(scheduleGeneration(job.id).scheduled)scheduled++;}
  return {found:jobs.length,scheduled,active:active.size};
}

export function startGenerationRecoveryWorker({intervalMs=5000}={}){
  if(recoveryTimer)return {enabled:true,recovered:0};
  const initial=recoverPersistedGenerations({limit:200});
  const tick=()=>{if(recoveryBusy)return;recoveryBusy=true;try{recoverPersistedGenerations({limit:100});}finally{recoveryBusy=false;}};
  recoveryTimer=setInterval(tick,Math.max(2000,Number(intervalMs)||5000));recoveryTimer.unref?.();
  return {enabled:true,recovered:initial.scheduled};
}

export function generationRuntimeSummary(){return {engine:"GI_CORE_GENERATION",version:"0.987",active:active.size,recoveryWorker:Boolean(recoveryTimer),artificialEta:false,persistentJobs:true};}

export async function runGeneration(jobId,{includeImages=true}={}){
  const original=getGenerationJob(jobId);if(!original)return null;if(TERMINAL_GENERATION_STATUSES.has(original.status))return original;
  const history=Array.isArray(original.stageHistory)?[...original.stageHistory]:[],step=stageUpdater(jobId,history,original);
  let sourceCount=Number(original.sourceCount||0),knowledgeCreated=Number(original.knowledgeCreated||0),imagesUsed=Number(original.imagesUsed||0);
  try{
    await step("IDENTIFY_TARGET","IDENTIFYING");
    const game=getGameById(original.gameId),entity=original.entityId?getEntityById(original.entityId):null;
    if(!game)throw new Error("GAME_NOT_FOUND");if(original.entityId&&!entity)throw new Error("ENTITY_NOT_FOUND");
    if(jobCancelled(jobId)){finalizeHistory(history,"CANCELLED");return updateGenerationJob(jobId,{status:"CANCELLED",currentStage:"CANCELLED",completed:true,stageHistory:history});}

    await step("CHECK_EXISTING_KNOWLEDGE","CHECKING_KNOWLEDGE");
    let snap=snapshot(game,entity),quality=evaluateTargetQuality(game,entity,snap);sourceCount=Math.max(sourceCount,snap.sourceCount);
    updateGenerationJob(jobId,{knowledgeState:{status:quality.passed?"SUFFICIENT":"INSUFFICIENT",checkedAt:new Date().toISOString(),quality},sourceCount});

    const researchRequested=String(original.researchMode||"STANDARD").toUpperCase()==="DEEP"||!quality.passed;
    if(researchRequested){
      await step("RESEARCH_REQUIRED","RESEARCH_REQUIRED",{sourceCount,knowledgeCreated,imagesUsed,researchState:{status:"REQUIRED",reason:String(original.researchMode).toUpperCase()==="DEEP"?"DEEP_REQUESTED":"KNOWLEDGE_INSUFFICIENT"}});
      await step("RESEARCH","RESEARCHING",{sourceCount,knowledgeCreated,imagesUsed,researchState:{status:"RUNNING",startedAt:new Date().toISOString()}});
      const report=await deepResearchForPage({game,entity,pageType:entity?.type||"GAME",language:original.language,onQuestion:q=>updateGenerationJob(jobId,{currentStage:`RESEARCH: ${q.slice(0,96)}`,sourceCount,knowledgeCreated,imagesUsed,researchState:{status:"RUNNING",currentQuestion:q}}),shouldCancel:()=>jobCancelled(jobId)});
      sourceCount=Math.max(sourceCount,report.sourceCount||0);knowledgeCreated+=Number(report.knowledgeCreated||0);
      updateGenerationJob(jobId,{sourceCount,knowledgeCreated,researchState:{status:"COMPLETE",completedAt:new Date().toISOString(),report:{sourceCount:report.sourceCount,evidenceCount:report.evidenceCount,acceptedEvidence:report.acceptedEvidence,knowledgeCreated:report.knowledgeCreated,failedQuestions:report.failedQuestions}}});
    }
    if(jobCancelled(jobId)){finalizeHistory(history,"CANCELLED");return updateGenerationJob(jobId,{status:"CANCELLED",currentStage:"CANCELLED",completed:true,sourceCount,knowledgeCreated,imagesUsed,stageHistory:history});}

    await step("VERIFY_EVIDENCE","VERIFYING",{sourceCount,knowledgeCreated,imagesUsed});
    snap=snapshot(game,entity);quality=evaluateTargetQuality(game,entity,snap);sourceCount=Math.max(sourceCount,snap.sourceCount);
    updateGenerationJob(jobId,{knowledgeState:{status:quality.passed?"SUFFICIENT":"INSUFFICIENT",checkedAt:new Date().toISOString(),quality},sourceCount});
    recordGenerationDiagnostic({generationJobId:jobId,gameId:original.gameId,entityId:original.entityId,stage:"KNOWLEDGE_QUALITY_GATE",status:quality.passed?"PASS":"SAFE_BLOCK",progress:PROGRESS.VERIFY_EVIDENCE,errorCode:quality.passed?"":"BLOCKED_KNOWLEDGE_INSUFFICIENT",details:quality});
    if(!quality.passed){
      finalizeHistory(history,"BLOCKED_KNOWLEDGE_INSUFFICIENT");
      return updateGenerationJob(jobId,{status:"BLOCKED_KNOWLEDGE_INSUFFICIENT",progress:PROGRESS.VERIFY_EVIDENCE,currentStage:"BLOCKED_KNOWLEDGE_INSUFFICIENT",errorCode:"BLOCKED_KNOWLEDGE_INSUFFICIENT",errorMessage:"O GameIndex não possui evidência verificada suficiente para construir esta página sem inventar conteúdo.",blockingReason:(quality.missing||[]).join(", ")||"INSUFFICIENT_KNOWLEDGE",failureStage:"VERIFY_EVIDENCE",failureSummary:(quality.missing||[]).join(", "),completed:true,sourceCount,knowledgeCreated,imagesUsed,stageHistory:history});
    }

    await step("BUILD_CONTENT","BUILDING",{sourceCount,knowledgeCreated,imagesUsed});
    let page=buildPageFromKnowledge({game,entity,language:original.language,pageType:getCanonicalState(entity?.id)?.canonicalType||entity?.type||"GAME"});
    if(!page?.id)throw new Error("PAGE_BUILD_EMPTY");

    await step("CONTENT_VALIDATION","VALIDATING_CONTENT",{sourceCount,knowledgeCreated,imagesUsed});
    const sections=page.content?.sections||[];const paragraphCount=sections.reduce((n,s)=>n+(s.paragraphs||[]).length,0);
    if(!sections.length||paragraphCount<1)throw new Error("CONTENT_VALIDATION_EMPTY");
    if(page.safety?.status==="REJECTED")throw new Error("PAGE_SAFETY_REJECTED");

    await step("IMAGE_RESOLVE","RESOLVING_IMAGES",{sourceCount,knowledgeCreated,imagesUsed});
    const images=includeImages?await ensurePageImages3({game,entity,pageType:page.pageType,language:original.language}):[];
    imagesUsed=images.length;if(imagesUsed)page=attachPageImages(page.id,images.map(x=>x.id));

    await step("RELATIONSHIP_BUILD","BUILDING_RELATIONSHIPS",{sourceCount,knowledgeCreated,imagesUsed});
    // Relationships are already derived by Page Builder from verified knowledge. This stage records the durable boundary.
    await step("INDEX","INDEXING",{sourceCount,knowledgeCreated,imagesUsed});
    // upsertPage writes the indexed page record transactionally; no in-memory result is authoritative.

    await step("FINAL_VERIFY","FINAL_VERIFY",{sourceCount,knowledgeCreated,imagesUsed});
    const finalPage=getPageById(page.id);
    if(!finalPage?.id)throw new Error("FINAL_PAGE_MISSING");
    const finalStatus=finalPage.status==="READY"?"READY":"NEEDS_REVIEW";
    finalizeHistory(history,finalStatus);
    recordGenerationDiagnostic({generationJobId:jobId,gameId:original.gameId,entityId:original.entityId,stage:"READY",status:finalStatus,progress:100,details:{resultPageId:finalPage.id,sourceCount,knowledgeCreated,imagesUsed}});
    return updateGenerationJob(jobId,{status:finalStatus,progress:100,currentStage:"READY",resultPageId:finalPage.id,completed:true,sourceCount,knowledgeCreated,imagesUsed,stageHistory:history,state:{stage:"READY",status:finalStatus,completedAt:new Date().toISOString()},blockingReason:""});
  }catch(error){
    const errorCode=String(error?.code||error?.message||"GENERATION_FAILED").slice(0,100),current=getGenerationJob(jobId);
    finalizeHistory(history,"FAILED");recordGenerationDiagnostic({generationJobId:jobId,gameId:original.gameId,entityId:original.entityId,stage:"FAILED",status:"FAILED",progress:Number(current?.progress||0),errorCode,details:{sourceCount,knowledgeCreated,imagesUsed}});
    return updateGenerationJob(jobId,{status:"FAILED",currentStage:"FAILED",errorCode,errorMessage:"GameIndex não conseguiu concluir esta página com segurança.",failureStage:current?.currentStage||"UNKNOWN",failureSummary:errorCode,retryCount:Number(original.retryCount||0)+1,completed:true,sourceCount,knowledgeCreated,imagesUsed,stageHistory:history,state:{stage:"FAILED",status:"FAILED",failedAt:new Date().toISOString(),errorCode}});
  }
}
