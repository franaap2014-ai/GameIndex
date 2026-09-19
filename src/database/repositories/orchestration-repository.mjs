import { createHash, randomUUID } from "node:crypto";
import { db, json, nowIso, parseJson, transaction } from "../connection.mjs";

function clamp(value){return Math.max(0,Math.min(1,Number(value)||0));}
function checksum(value){return createHash("sha256").update(JSON.stringify(value??{})).digest("hex");}
function packetMetrics(input={}){return {claimCount:input.claims?.length||0,sourceCount:input.sources?.length||0,evidenceCount:(input.claims||[]).reduce((n,c)=>n+(c.evidenceIds?.length||0),0),imageCandidateCount:input.imageCandidates?.length||0};}

function mapPacket(row){if(!row)return null;return {packetVersion:row.packet_version,packetId:row.id,requestId:row.request_id,traceId:row.trace_id,userId:row.user_id,requestType:row.request_type,mode:row.mode,language:row.language,game:{id:row.game_id||"",confidence:Number(row.game_confidence||0)},entity:row.entity_id?{id:row.entity_id,confidence:Number(row.entity_confidence||0)}:null,intent:{candidate:row.intent||"",confidence:Number(row.intent_confidence||0)},missingKnowledge:parseJson(row.missing_json,[]),conflicts:parseJson(row.conflicts_json,[]),metrics:parseJson(row.metrics_json,{}),createdAt:row.created_at};}

export function createResearchPacket(input={}){
  const packetId=input.packetId||randomUUID(),requestId=input.requestId||randomUUID(),traceId=input.traceId||randomUUID(),createdAt=nowIso(),metrics=packetMetrics(input);
  transaction(()=>{
    db.prepare(`INSERT INTO research_packets(id,request_id,trace_id,user_id,request_type,mode,language,game_id,entity_id,intent,game_confidence,entity_confidence,intent_confidence,missing_json,conflicts_json,metrics_json,packet_version,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
      .run(packetId,requestId,traceId,input.userId||null,input.requestType||"QUESTION",input.mode||"LOCAL_MEMORY",input.language||"pt-BR",input.game?.id||null,input.entity?.id||null,input.intent?.candidate||input.intent||"",clamp(input.game?.confidence),clamp(input.entity?.confidence),clamp(input.intent?.confidence),json(input.missingKnowledge||[]),json(input.conflicts||[]),json(metrics),"0.95",createdAt);
    const claimStmt=db.prepare(`INSERT INTO research_packet_claims(id,packet_id,claim_id,text,language,confidence,canon_status,source_ids_json,evidence_ids_json,freshness,conflict,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)`);
    for(const claim of input.claims||[])claimStmt.run(randomUUID(),packetId,claim.claimId||claim.id||"",String(claim.text||"").slice(0,8000),claim.language||input.language||"pt-BR",clamp(claim.confidence),claim.canonStatus||"UNKNOWN",json(claim.sourceIds||[]),json(claim.evidenceIds||[]),claim.freshness||"UNKNOWN",claim.conflict?1:0,createdAt);
    const sourceStmt=db.prepare(`INSERT INTO research_packet_sources(id,packet_id,source_id,url,title,publisher,source_type,retrieved_at,quality,checksum,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)`);
    for(const source of input.sources||[])if(source.url)sourceStmt.run(randomUUID(),packetId,source.sourceId||source.id||"",source.url,String(source.title||"").slice(0,1000),String(source.publisher||"").slice(0,300),source.sourceType||"UNKNOWN",source.retrievedAt||createdAt,clamp(source.quality),source.checksum||checksum({url:source.url,title:source.title}),createdAt);
    const imageStmt=db.prepare(`INSERT INTO research_packet_images(id,packet_id,candidate_id,role,remote_url,source_url,source_id,confidence,license,people_state,decision,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)`);
    for(const image of input.imageCandidates||[])if(image.remoteUrl)imageStmt.run(randomUUID(),packetId,image.candidateId||image.id||"",image.role||"CANDIDATE",image.remoteUrl,image.sourceUrl||"",image.sourceId||"",clamp(image.confidence),image.license||"",image.peopleState||"UNCERTAIN",image.decision||"CANDIDATE",createdAt);
  });
  return getResearchPacket(packetId);
}

export function getResearchPacket(id){
  const packet=mapPacket(db.prepare(`SELECT * FROM research_packets WHERE id=?`).get(id));if(!packet)return null;
  packet.claims=db.prepare(`SELECT * FROM research_packet_claims WHERE packet_id=? ORDER BY rowid`).all(id).map(row=>({claimId:row.claim_id,text:row.text,language:row.language,confidence:Number(row.confidence),canonStatus:row.canon_status,sourceIds:parseJson(row.source_ids_json,[]),evidenceIds:parseJson(row.evidence_ids_json,[]),freshness:row.freshness,conflict:Boolean(row.conflict)}));
  packet.sources=db.prepare(`SELECT * FROM research_packet_sources WHERE packet_id=? ORDER BY quality DESC`).all(id).map(row=>({sourceId:row.source_id,url:row.url,title:row.title,publisher:row.publisher,sourceType:row.source_type,retrievedAt:row.retrieved_at,quality:Number(row.quality),checksum:row.checksum}));
  packet.imageCandidates=db.prepare(`SELECT * FROM research_packet_images WHERE packet_id=? ORDER BY confidence DESC`).all(id).map(row=>({candidateId:row.candidate_id,role:row.role,remoteUrl:row.remote_url,sourceUrl:row.source_url,sourceId:row.source_id,confidence:Number(row.confidence),license:row.license,peopleState:row.people_state,decision:row.decision}));
  return packet;
}

export function createOrchestrationRun({packet,route="",status="RUNNING"}={}){
  const id=randomUUID(),now=nowIso();db.prepare(`INSERT INTO ai_orchestration_runs(id,request_id,trace_id,packet_id,request_type,route,status,language,game_id,entity_id,started_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)`).run(id,packet.requestId,packet.traceId,packet.packetId,packet.requestType,route,status,packet.language,packet.game?.id||null,packet.entity?.id||null,now,now);return getOrchestrationRun(id);
}

export function addOrchestrationStage(runId,{component,status="COMPLETE",errorCode="",counts={},context={},summary={}}={}){
  const sequence=Number(db.prepare(`SELECT COALESCE(MAX(sequence),0)+1 value FROM ai_orchestration_stages WHERE run_id=?`).get(runId)?.value||1),id=randomUUID();
  db.prepare(`INSERT INTO ai_orchestration_stages(id,run_id,sequence,component,status,error_code,claim_count,source_count,evidence_count,image_count,game_id,entity_id,intent,language,summary_json,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(id,runId,sequence,component,status,errorCode,Number(counts.claims||counts.claimCount||0),Number(counts.sources||counts.sourceCount||0),Number(counts.evidence||counts.evidenceCount||0),Number(counts.images||counts.imageCount||0),context.gameId||"",context.entityId||"",context.intent||"",context.language||"",json(summary),nowIso());
  db.prepare(`UPDATE ai_orchestration_runs SET updated_at=? WHERE id=?`).run(nowIso(),runId);return {id,runId,sequence,component,status,errorCode};
}

function normalizedCounts(value={}){return {claims:Number(value.claims??value.claimCount??0),sources:Number(value.sources??value.sourceCount??0),evidence:Number(value.evidence??value.evidenceCount??0),images:Number(value.images??value.imageCount??0),gameId:value.gameId||"",entityId:value.entityId||"",intent:value.intent||"",language:value.language||""};}
function informationLoss(output={},input={}){const a=normalizedCounts(output),b=normalizedCounts(input),loss=[];if(a.claims>0&&b.claims===0)loss.push("CLAIM_LOSS");if(a.sources>0&&b.sources===0)loss.push("SOURCE_LOSS");if(a.gameId&&b.gameId&&a.gameId!==b.gameId)loss.push("GAME_ID_CHANGE");if(a.entityId&&b.entityId&&a.entityId!==b.entityId)loss.push("ENTITY_ID_CHANGE");if(a.intent&&b.intent&&a.intent!==b.intent)loss.push("INTENT_RESET");if(a.language&&b.language&&a.language!==b.language)loss.push("LANGUAGE_CHANGE");return loss;}

export function recordAIHandoff(runId,{packetId,from,to,output={},input={}}={}){
  const loss=informationLoss(output,input),status=loss.length?"FAIL":"PASS",errorCode=loss.length?"PIPELINE_INFORMATION_LOSS":"",safeOutput=normalizedCounts(output),safeInput=normalizedCounts(input),id=randomUUID();
  db.prepare(`INSERT INTO ai_handoffs(id,run_id,packet_id,from_component,to_component,input_json,output_json,checksum,status,error_code,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)`).run(id,runId,packetId,from,to,json(safeInput),json(safeOutput),checksum({from,to,safeOutput,safeInput}),status,errorCode,nowIso());
  if(loss.length)finishOrchestrationRun(runId,{status:"SAFE_BLOCK",errorCode,summary:{loss}});return {id,status,errorCode,loss};
}

export function finishOrchestrationRun(id,{status="COMPLETE",route,errorCode="",summary={}}={}){const now=nowIso();db.prepare(`UPDATE ai_orchestration_runs SET status=?,route=COALESCE(?,route),error_code=?,summary_json=?,updated_at=?,completed_at=? WHERE id=?`).run(status,route??null,errorCode,json(summary),now,now,id);return getOrchestrationRun(id);}

export function getOrchestrationRun(id){const row=db.prepare(`SELECT * FROM ai_orchestration_runs WHERE id=?`).get(id);if(!row)return null;return {id:row.id,requestId:row.request_id,traceId:row.trace_id,packetId:row.packet_id,requestType:row.request_type,route:row.route,status:row.status,language:row.language,gameId:row.game_id,entityId:row.entity_id,errorCode:row.error_code,summary:parseJson(row.summary_json,{}),startedAt:row.started_at,updatedAt:row.updated_at,completedAt:row.completed_at,stages:listOrchestrationStages(id)};}
export function listOrchestrationStages(runId){return db.prepare(`SELECT * FROM ai_orchestration_stages WHERE run_id=? ORDER BY sequence`).all(runId).map(row=>({sequence:row.sequence,component:row.component,status:row.status,errorCode:row.error_code,claimCount:Number(row.claim_count),sourceCount:Number(row.source_count),evidenceCount:Number(row.evidence_count),imageCount:Number(row.image_count),gameId:row.game_id,entityId:row.entity_id,intent:row.intent,language:row.language,summary:parseJson(row.summary_json,{}),createdAt:row.created_at}));}
export function orchestrationMetrics(){const scalar=sql=>Number(db.prepare(sql).get()?.value||0);return {packets:scalar(`SELECT COUNT(*) value FROM research_packets`),runs:scalar(`SELECT COUNT(*) value FROM ai_orchestration_runs`),complete:scalar(`SELECT COUNT(*) value FROM ai_orchestration_runs WHERE status='COMPLETE'`),safeBlocks:scalar(`SELECT COUNT(*) value FROM ai_orchestration_runs WHERE status='SAFE_BLOCK'`),informationLoss:scalar(`SELECT COUNT(*) value FROM ai_handoffs WHERE error_code='PIPELINE_INFORMATION_LOSS'`)};}
