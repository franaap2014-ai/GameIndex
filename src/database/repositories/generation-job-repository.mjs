import { db, json, nowIso, parseJson } from "../connection.mjs";
import { randomUUID } from "node:crypto";

export const GENERATION_VERSION="0.986";
export const GENERATION_ENGINE="GI_CORE_GENERATION";
export const TERMINAL_GENERATION_STATUSES=new Set([
  "READY","NEEDS_REVIEW","BLOCKED_KNOWLEDGE_INSUFFICIENT","FAILED","CANCELLED"
]);

function map(r){
  return r?{
    id:r.id,userId:r.user_id,gameId:r.game_id,entityId:r.entity_id,jobType:r.job_type,
    researchMode:r.research_mode,language:r.language,status:r.status,progress:Number(r.progress||0),
    currentStage:r.current_stage,estimatedSecondsRemaining:0,stageHistory:parseJson(r.stage_history_json,[]),
    resultPageId:r.result_page_id,errorCode:r.error_code,errorMessage:r.error_message,
    cancelRequested:Boolean(r.cancel_requested),sourceCount:Number(r.source_count||0),
    knowledgeCreated:Number(r.knowledge_created||0),imagesUsed:Number(r.images_used||0),
    generationVersion:r.generation_version||GENERATION_VERSION,
    generationEngine:r.generation_engine||GENERATION_ENGINE,
    state:parseJson(r.state_json,{}),researchState:parseJson(r.research_state_json,{}),
    knowledgeState:parseJson(r.knowledge_state_json,{}),blockingReason:r.blocking_reason||"",
    failureStage:r.failure_stage||"",failureSummary:r.failure_summary||"",
    retryCount:Number(r.retry_count||0),traceId:r.trace_id||"",nextEligibleRetry:r.next_eligible_retry||"",
    lastHeartbeatAt:r.last_heartbeat_at||"",recoveredAt:r.recovered_at||"",
    createdAt:r.created_at,startedAt:r.started_at,updatedAt:r.updated_at,completedAt:r.completed_at,
    terminal:TERMINAL_GENERATION_STATUSES.has(String(r.status||""))
  }:null;
}

export function createGenerationJob({userId=null,gameId,entityId=null,jobType="PAGE",researchMode="STANDARD",language="pt-BR"}){
  if(!gameId)throw new Error("Generation job requires gameId.");
  const id=randomUUID(),now=nowIso();
  db.prepare(`INSERT INTO generation_jobs(
    id,user_id,game_id,entity_id,job_type,research_mode,language,status,progress,current_stage,
    estimated_seconds_remaining,stage_history_json,created_at,updated_at,source_count,knowledge_created,
    images_used,generation_version,generation_engine,state_json,research_state_json,knowledge_state_json,
    blocking_reason,last_heartbeat_at,recovered_at
  ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(
    id,userId,gameId,entityId,jobType,researchMode,language,"QUEUED",0,"QUEUED",0,json([]),now,now,0,0,0,
    GENERATION_VERSION,GENERATION_ENGINE,json({requestedAt:now}),json({status:"NOT_STARTED"}),json({status:"NOT_CHECKED"}),"",now,""
  );
  return getGenerationJob(id);
}

export function getGenerationJob(id){return map(db.prepare(`SELECT * FROM generation_jobs WHERE id=?`).get(id));}

export function updateGenerationJob(id,{
  status,progress,currentStage,resultPageId,errorCode,errorMessage,started=false,completed=false,stageHistory,
  sourceCount,knowledgeCreated,imagesUsed,failureStage,failureSummary,retryCount,traceId,nextEligibleRetry,
  state,researchState,knowledgeState,blockingReason,lastHeartbeatAt,recoveredAt
}={}){
  const current=getGenerationJob(id);if(!current)return null;const now=nowIso();
  db.prepare(`UPDATE generation_jobs SET
    status=?,progress=?,current_stage=?,estimated_seconds_remaining=0,result_page_id=?,error_code=?,error_message=?,
    started_at=?,completed_at=?,stage_history_json=?,source_count=?,knowledge_created=?,images_used=?,failure_stage=?,
    failure_summary=?,retry_count=?,trace_id=?,next_eligible_retry=?,generation_version=?,generation_engine=?,state_json=?,
    research_state_json=?,knowledge_state_json=?,blocking_reason=?,last_heartbeat_at=?,recovered_at=?,updated_at=? WHERE id=?`).run(
      status??current.status,
      Math.max(0,Math.min(100,Number(progress??current.progress))),
      currentStage??current.currentStage,
      resultPageId??current.resultPageId,errorCode??current.errorCode,errorMessage??current.errorMessage,
      started&&!current.startedAt?now:current.startedAt,completed?now:current.completedAt,
      json(stageHistory??current.stageHistory),Number(sourceCount??current.sourceCount),Number(knowledgeCreated??current.knowledgeCreated),
      Number(imagesUsed??current.imagesUsed),failureStage??current.failureStage,failureSummary??current.failureSummary,
      Number(retryCount??current.retryCount),traceId??current.traceId,nextEligibleRetry??current.nextEligibleRetry,
      GENERATION_VERSION,GENERATION_ENGINE,json(state??current.state),json(researchState??current.researchState),
      json(knowledgeState??current.knowledgeState),blockingReason??current.blockingReason,lastHeartbeatAt??now,recoveredAt??current.recoveredAt,
      now,id
    );
  return getGenerationJob(id);
}

export function requestCancel(id){
  db.prepare(`UPDATE generation_jobs SET cancel_requested=1,last_heartbeat_at=?,updated_at=? WHERE id=?`).run(nowIso(),nowIso(),id);
  return getGenerationJob(id);
}

export function listGenerationJobs({status=null,limit=50,offset=0}={}){
  const n=Math.min(200,Math.max(1,Number(limit)||50)),o=Math.max(0,Number(offset)||0);
  const rows=status
    ?db.prepare(`SELECT * FROM generation_jobs WHERE status=? ORDER BY created_at DESC LIMIT ? OFFSET ?`).all(status,n,o)
    :db.prepare(`SELECT * FROM generation_jobs ORDER BY created_at DESC LIMIT ? OFFSET ?`).all(n,o);
  return rows.map(map);
}

export function listRecoverableGenerationJobs({limit=100}={}){
  const terminal=[...TERMINAL_GENERATION_STATUSES];
  const placeholders=terminal.map(()=>"?").join(",");
  return db.prepare(`SELECT * FROM generation_jobs
    WHERE status NOT IN (${placeholders}) AND cancel_requested=0
    ORDER BY created_at ASC LIMIT ?`).all(...terminal,Math.min(500,Math.max(1,Number(limit)||100))).map(map);
}

export function markGenerationRecovered(id){
  const now=nowIso();
  db.prepare(`UPDATE generation_jobs SET recovered_at=?,last_heartbeat_at=?,updated_at=?,generation_version=?,generation_engine=?,estimated_seconds_remaining=0,completed_at='',cancel_requested=0 WHERE id=?`)
    .run(now,now,now,GENERATION_VERSION,GENERATION_ENGINE,id);
  return getGenerationJob(id);
}
