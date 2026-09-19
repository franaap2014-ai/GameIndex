import { randomUUID } from "node:crypto";
import { getGameById } from "../database/repositories/game-repository.mjs";
import { getEntityById } from "../database/repositories/entity-repository.mjs";
import { createGenerationJob } from "../database/repositories/generation-job-repository.mjs";
import { attachPageImages } from "../database/repositories/page-repository.mjs";
import { runGeneration } from "../pages/generation-runner.mjs";
import { ensurePageImages3 } from "../images/page-image3.mjs";
import {
  acquireConstructionLease,addConstructionEvent,errorFingerprint,finishConstructionAttempt,getConstructionItem,getConstructionRun,
  listConstructionItems,pendingConstructionRuns,recoverExpiredConstructionRuns,refreshConstructionSummary,releaseConstructionLease,renewConstructionLease,
  startConstructionAttempt,updateConstructionItem,updateConstructionRun
} from "../database/repositories/construction-repository.mjs";

const active=new Set(),owner=`construction-${process.pid}-${randomUUID().slice(0,8)}`;
const TRANSIENT=/BUSY|LOCKED|TIMEOUT|TEMPORARY|ECONN|NETWORK|RETRY|LEASE/i;
function safe(value="",limit=600){return String(value||"").replace(/\b(sk-(?:proj-)?[\w-]+|Bearer\s+\S+)\b/gi,"[REDACTED]").slice(0,limit);}
function itemError(code,message,component="PAGE_CONSTRUCTION",retryable=TRANSIENT.test(code||message)){const error=new Error(message||code||"CONSTRUCTION_ITEM_FAILED");error.code=code||"CONSTRUCTION_ITEM_FAILED";error.component=component;error.retryable=Boolean(retryable);return error;}
function testFault(stage,item){if(process.env.NODE_ENV!=="test"||process.env.GAMEINDEX_ENABLE_TEST_FAULTS!=="1")return;let config={};try{config=JSON.parse(process.env.GAMEINDEX_CONSTRUCTION_TEST_FAULTS||"{}");}catch{}const values=config[stage]||config.ALL||[];if(values===true||values.includes?.(item.sequence+1)||values.includes?.(item.id))throw itemError(`TEST_FAULT_${stage}`,`Falha de teste injetada em ${stage}.`,stage,false);}
function publicError(error,component="CONSTRUCTION_CONTROLLER"){const code=safe(error?.code||error?.message||"CONSTRUCTION_FAILED",120),message=safe(error?.publicMessage||error?.message||"A construção não pôde continuar.");return {code,message,component:safe(error?.component||component,120),retryable:Boolean(error?.retryable??TRANSIENT.test(code)),suggestedAction:error?.suggestedAction||"Abra os eventos da construção e repita somente os itens recuperáveis."};}
function terminalItem(status){return new Set(["COMPLETED","FAILED","BLOCKED","SKIPPED","CANCELLED"]).has(status);}

async function constructItem(run,item){
  const game=getGameById(run.gameId),entity=item.entityId?getEntityById(item.entityId):null;if(!game)throw itemError("CONSTRUCTION_GAME_NOT_FOUND","O jogo não existe mais.","PAGE_CONSTRUCTION",false);if(item.entityId&&!entity)throw itemError("CONSTRUCTION_ENTITY_NOT_FOUND","A entidade planejada não existe mais.","PAGE_CONSTRUCTION",false);
  if(item.currentStage==="IMAGE_CONSTRUCTION"&&item.resultPageId){
    testFault("IMAGE_CONSTRUCTION",item);updateConstructionItem(item.id,{imageStatus:"RUNNING"});
    const images=await ensurePageImages3({game,entity,pageType:item.pageType,language:run.language}),imageIds=images.map(image=>image.id).filter(Boolean);
    if(imageIds.length)attachPageImages(item.resultPageId,imageIds);
    const imageStatus=imageIds.length?"COMPLETE":"FALLBACK";
    addConstructionEvent(run.id,{itemId:item.id,component:"IMAGE_ENGINE_3",stage:"IMAGE_CONSTRUCTION",status:imageStatus,attempt:item.attempts+1,message:imageIds.length?`${imageIds.length} imagem(ns) reparada(s) sem reconstruir a página.`:"Fallback visual seguro preservado.",details:{pageId:item.resultPageId,imageIds,imageOnly:true}});
    return {pageId:item.resultPageId,imageIds,imageStatus,imageErrorCode:"",imageOnly:true};
  }
  testFault("PAGE_CONSTRUCTION",item);
  const child=createGenerationJob({userId:run.userId,gameId:game.id,entityId:item.entityId,jobType:"CONSTRUCTION_ITEM",researchMode:run.demoMode?"STANDARD":run.researchMode,language:run.language});
  updateConstructionItem(item.id,{generationJobId:child.id,currentStage:"PAGE_CONSTRUCTION"});
  const generated=await runGeneration(child.id,{includeImages:false});
  if(!generated?.resultPageId){
    const code=generated?.errorCode||"CONSTRUCTION_PAGE_NOT_CREATED";
    if(generated?.status==="NEEDS_RESEARCH"||code==="INSUFFICIENT_KNOWLEDGE_PREBUILD")throw itemError(code,"O item ainda não possui conhecimento validado suficiente.","CONTENT_VALIDATION",false);
    throw itemError(code,generated?.errorMessage||"O Page Builder não criou a página.",generated?.failureStage||"PAGE_CONSTRUCTION",TRANSIENT.test(code));
  }
  updateConstructionItem(item.id,{resultPageId:generated.resultPageId,currentStage:"CONTENT_VALIDATION"});
  addConstructionEvent(run.id,{itemId:item.id,component:"PAGE_BUILDER",stage:"PAGE_CONSTRUCTION",status:"COMPLETE",attempt:item.attempts+1,message:"Página salva em preview antes das imagens.",details:{pageId:generated.resultPageId,status:generated.status,language:run.language}});
  let imageStatus=run.includeImages?"QUEUED":"SKIPPED",imageIds=[],imageErrorCode="";
  if(run.includeImages){
    try{
      testFault("IMAGE_CONSTRUCTION",item);updateConstructionItem(item.id,{currentStage:"IMAGE_CONSTRUCTION",imageStatus:"RUNNING"});
      const images=await ensurePageImages3({game,entity,pageType:item.pageType,language:run.language});imageIds=images.map(image=>image.id).filter(Boolean);if(imageIds.length)attachPageImages(generated.resultPageId,imageIds);imageStatus=imageIds.length?"COMPLETE":"FALLBACK";
      addConstructionEvent(run.id,{itemId:item.id,component:"IMAGE_ENGINE_3",stage:"IMAGE_CONSTRUCTION",status:imageStatus,attempt:item.attempts+1,message:imageIds.length?`${imageIds.length} imagem(ns) ligada(s) à página.`:"Página preservada com fallback visual seguro.",details:{imageIds}});
    }catch(error){imageStatus="FAILED";imageErrorCode=safe(error.code||error.message||"IMAGE_CONSTRUCTION_FAILED",120);addConstructionEvent(run.id,{itemId:item.id,component:"IMAGE_ENGINE_3",stage:"IMAGE_CONSTRUCTION",status:"FAILED",attempt:item.attempts+1,errorCode:imageErrorCode,message:"A imagem falhou, mas a página pronta foi preservada.",details:{retryable:true}});}
  }
  return {pageId:generated.resultPageId,imageIds,imageStatus,imageErrorCode,status:generated.status};
}

async function executeItem(run,item,{processor=null}={}){
  const stage=item.currentStage==="IMAGE_CONSTRUCTION"&&item.resultPageId?"IMAGE_CONSTRUCTION":"PAGE_CONSTRUCTION",attempt=startConstructionAttempt(item.id,stage),started=Date.now();
  addConstructionEvent(run.id,{itemId:item.id,component:"CONSTRUCTION_CONTROLLER",stage,status:"RUNNING",attempt:attempt.attempt,message:stage==="IMAGE_CONSTRUCTION"?`Reparando somente a imagem do item ${item.sequence+1}.`:`Construindo item ${item.sequence+1}/${run.totalItems}.`});
  try{
    const result=processor?await processor({run,item:getConstructionItem(item.id),attempt:attempt.attempt}):await constructItem(run,getConstructionItem(item.id));
    finishConstructionAttempt(attempt.id,{status:"COMPLETE"});
    const resultPageId=result.pageId||result.resultPageId||getConstructionItem(item.id)?.resultPageId||null;
    updateConstructionItem(item.id,{status:"COMPLETED",currentStage:"PREVIEW",resultPageId,resultImageIds:result.imageIds||[],imageStatus:result.imageStatus||"SKIPPED",imageErrorCode:result.imageErrorCode||"",errorCode:"",errorMessage:"",errorComponent:"",errorRetryable:false});
    addConstructionEvent(run.id,{itemId:item.id,component:"CONSTRUCTION_CONTROLLER",stage:"PREVIEW",status:"COMPLETE",attempt:attempt.attempt,durationMs:Date.now()-started,message:result.imageOnly?"Imagem reparada; a página original não foi reconstruída.":"Item concluído e preservado em preview.",details:{pageId:resultPageId||"",imageStatus:result.imageStatus||"SKIPPED",imageOnly:Boolean(result.imageOnly)}});
    return {ok:true,item:getConstructionItem(item.id)};
  }catch(raw){const error=publicError(raw,"PAGE_CONSTRUCTION"),status=error.retryable&&attempt.attempt<item.maxAttempts?"RETRY_SCHEDULED":error.code==="INSUFFICIENT_KNOWLEDGE_PREBUILD"?"BLOCKED":"FAILED",fingerprint=errorFingerprint(error.component,error.code,error.message);finishConstructionAttempt(attempt.id,{status,errorCode:error.code,errorMessage:error.message,retryable:error.retryable});updateConstructionItem(item.id,{status,currentStage:error.component,errorCode:error.code,errorMessage:error.message,errorComponent:error.component,errorRetryable:error.retryable,errorFingerprint:fingerprint});addConstructionEvent(run.id,{itemId:item.id,component:error.component,stage:error.component,status,attempt:attempt.attempt,durationMs:Date.now()-started,errorCode:error.code,message:error.message,details:{retryable:error.retryable,fingerprint}});return {ok:false,error:{...error,fingerprint},item:getConstructionItem(item.id)};}
}

export function scheduleConstructionRun(runId){if(active.has(runId))return false;active.add(runId);setImmediate(()=>runConstructionRun(runId).finally(()=>active.delete(runId)));return true;}
export async function runConstructionRun(runId,{processor=null}={}){
  let run=getConstructionRun(runId);if(!run)return null;if(!acquireConstructionLease(runId,owner))return run;let orchestrationRunId="",consecutiveFingerprint="",consecutiveCount=0;
  const testProcessor=process.env.NODE_ENV==="test"?processor:null;
  try{
    updateConstructionRun(runId,{status:"RUNNING",currentStage:"RESEARCH",progress:2,started:true});run=getConstructionRun(runId);const game=getGameById(run.gameId);if(!game)throw itemError("CONSTRUCTION_GAME_NOT_FOUND","O jogo não foi encontrado.","RESEARCH",false);
    try{testFault("RESEARCH",{sequence:0,id:"SYSTEM"});orchestrationRunId="GI_CORE_SCRIPT_RESEARCH";updateConstructionRun(runId,{packetId:orchestrationRunId,currentStage:"KNOWLEDGE_GATE",progress:7});addConstructionEvent(runId,{component:"GI_CORE",stage:"RESEARCH",status:"COMPLETE",message:"Controle determinístico liberou o plano; cada item passa pelo Knowledge Gate antes da construção.",details:{engine:"GI_CORE_SCRIPTS"}});}catch(raw){const error=publicError(raw,"RESEARCH");updateConstructionRun(runId,{status:"BLOCKED_SYSTEMIC",currentStage:error.component,errorCode:error.code,errorMessage:error.message,errorComponent:error.component,errorRetryable:error.retryable,suggestedAction:error.suggestedAction});addConstructionEvent(runId,{component:error.component,stage:"RESEARCH",status:"BLOCKED_SYSTEMIC",errorCode:error.code,message:error.message,details:{retryable:error.retryable}});return getConstructionRun(runId);}
    const items=listConstructionItems(runId);
    for(let index=0;index<items.length;index++){
      run=getConstructionRun(runId);renewConstructionLease(runId,owner);
      if(run.cancelRequested){for(const pending of items.slice(index))if(!terminalItem(getConstructionItem(pending.id)?.status))updateConstructionItem(pending.id,{status:"CANCELLED",currentStage:"CANCELLED"});refreshConstructionSummary(runId);updateConstructionRun(runId,{status:"CANCELLED",currentStage:"CANCELLED",progress:getConstructionRun(runId).progress});addConstructionEvent(runId,{component:"CONSTRUCTION_CONTROLLER",stage:"CANCEL",status:"CANCELLED",message:"Construção cancelada; resultados concluídos foram preservados."});return getConstructionRun(runId);}
      if(run.pauseRequested){updateConstructionRun(runId,{status:"PAUSED",currentStage:"PAUSED"});addConstructionEvent(runId,{component:"CONSTRUCTION_CONTROLLER",stage:"PAUSE",status:"PAUSED",message:"Construção pausada em checkpoint seguro."});return getConstructionRun(runId);}
      const current=getConstructionItem(items[index].id);if(!current||current.status==="COMPLETED"||current.status==="SKIPPED"||current.status==="CANCELLED")continue;if(current.status==="BLOCKED"&&!current.error.retryable)continue;if(current.attempts>=current.maxAttempts){updateConstructionItem(current.id,{status:"FAILED",currentStage:"MAX_ATTEMPTS"});continue;}
      updateConstructionRun(runId,{currentStage:`PAGE_CONSTRUCTION:${index+1}/${items.length}`,progress:10+Math.round((index/Math.max(1,items.length))*80)});
      const result=await executeItem(getConstructionRun(runId),current,{processor:testProcessor});refreshConstructionSummary(runId);
      if(result.ok){consecutiveFingerprint="";consecutiveCount=0;continue;}
      if(result.error.fingerprint===consecutiveFingerprint)consecutiveCount++;else{consecutiveFingerprint=result.error.fingerprint;consecutiveCount=1;}
      if(consecutiveCount>=3&&getConstructionRun(runId).completedItems===0){for(const pending of items.slice(index+1)){const candidate=getConstructionItem(pending.id);if(candidate&&!terminalItem(candidate.status))updateConstructionItem(candidate.id,{status:"BLOCKED",currentStage:"SYSTEMIC_CIRCUIT_BREAKER",errorCode:result.error.code,errorMessage:"Item não executado porque a mesma causa sistêmica já falhou três vezes.",errorComponent:result.error.component,errorRetryable:result.error.retryable,errorFingerprint:result.error.fingerprint});}refreshConstructionSummary(runId);updateConstructionRun(runId,{status:"BLOCKED_SYSTEMIC",currentStage:"SYSTEMIC_CIRCUIT_BREAKER",errorCode:result.error.code,errorMessage:"A mesma causa falhou três vezes; os itens restantes foram bloqueados sem fabricar novos erros.",errorComponent:result.error.component,errorRetryable:result.error.retryable,suggestedAction:result.error.suggestedAction});addConstructionEvent(runId,{component:"CONSTRUCTION_CONTROLLER",stage:"SYSTEMIC_CIRCUIT_BREAKER",status:"BLOCKED_SYSTEMIC",errorCode:result.error.code,message:"Circuit breaker ativado após três falhas idênticas.",details:{fingerprint:result.error.fingerprint,blockedWithoutExecution:Math.max(0,items.length-index-1)}});return getConstructionRun(runId);}
    }
    run=refreshConstructionSummary(runId);const unresolved=run.failedItems+run.blockedItems+run.retryScheduledItems,status=run.completedItems===run.totalItems?"COMPLETED":run.completedItems>0?"PARTIAL_SUCCESS":unresolved?"FAILED":"COMPLETED";updateConstructionRun(runId,{status,currentStage:status==="COMPLETED"?"PREVIEW":"REVIEW_ERRORS",progress:100,errorCode:unresolved?"CONSTRUCTION_ITEMS_REMAIN":"",errorMessage:unresolved?`${unresolved} item(ns) ainda precisam de atenção.`:"",errorComponent:unresolved?"CONSTRUCTION_CONTROLLER":"",errorRetryable:run.retryScheduledItems>0,suggestedAction:unresolved?"Use Reparar erros para repetir somente os itens recuperáveis.":""});addConstructionEvent(runId,{component:"CONSTRUCTION_CONTROLLER",stage:"FINAL_VALIDATION",status,message:status==="COMPLETED"?"Construção concluída em preview.":"Construção parcial preservada; os demais itens podem ser reparados.",details:{completed:run.completedItems,failed:run.failedItems,blocked:run.blockedItems,retryScheduled:run.retryScheduledItems,orchestrationRunId}});return getConstructionRun(runId);
  }catch(raw){const error=publicError(raw);updateConstructionRun(runId,{status:"BLOCKED_SYSTEMIC",currentStage:error.component,errorCode:error.code,errorMessage:error.message,errorComponent:error.component,errorRetryable:error.retryable,suggestedAction:error.suggestedAction});addConstructionEvent(runId,{component:error.component,stage:"SYSTEM",status:"BLOCKED_SYSTEMIC",errorCode:error.code,message:error.message,details:{retryable:error.retryable}});return getConstructionRun(runId);}finally{releaseConstructionLease(runId,owner);}
}

export function startConstructionWorker(){const enabled=String(process.env.GAMEINDEX_CONSTRUCTION_ENABLED??process.env.GAMEINDEX_FULL_BUILD_ENABLED??"true").toLowerCase()!=="false";if(!enabled)return {enabled:false,recovered:0,scheduled:0};const recovered=recoverExpiredConstructionRuns(),jobs=pendingConstructionRuns();jobs.forEach(run=>scheduleConstructionRun(run.id));return {enabled:true,recovered:Number(recovered||0),scheduled:jobs.length};}
