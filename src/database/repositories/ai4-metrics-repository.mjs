import { randomUUID } from "node:crypto";
import { db, json, nowIso, parseJson } from "../connection.mjs";

export function logAI4Event({userId=null,conversationId="",gameId=null,entityId=null,component,eventType,success=true,durationMs=0,metadata={}}={}){if(!component||!eventType)return null;const id=randomUUID();db.prepare(`INSERT INTO ai_pipeline_events(id,user_id,conversation_id,game_id,entity_id,component,event_type,success,duration_ms,metadata_json,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)`).run(id,userId,conversationId,gameId,entityId,String(component).toUpperCase(),String(eventType).toUpperCase(),success?1:0,Math.max(0,Math.round(Number(durationMs||0))),json(metadata),nowIso());return id;}
function count(component,eventType=null){const row=eventType?db.prepare(`SELECT COUNT(*) count FROM ai_pipeline_events WHERE component=? AND event_type=?`).get(component,eventType):db.prepare(`SELECT COUNT(*) count FROM ai_pipeline_events WHERE component=?`).get(component);return Number(row?.count||0);}
function avg(component){return Math.round(Number(db.prepare(`SELECT AVG(duration_ms) value FROM ai_pipeline_events WHERE component=?`).get(component)?.value||0));}
function componentMetrics(component){return {events:count(component),success:Number(db.prepare(`SELECT COUNT(*) count FROM ai_pipeline_events WHERE component=? AND success=1`).get(component)?.count||0),failures:Number(db.prepare(`SELECT COUNT(*) count FROM ai_pipeline_events WHERE component=? AND success=0`).get(component)?.count||0),averageDurationMs:avg(component)};}
export function ai4Metrics(){return {
  boss:{...componentMetrics("BOSS"),memoryOnly:count("BOSS","ROUTED_MEMORY"),researchRouted:count("BOSS","ROUTED_RESEARCH")},
  research:{...componentMetrics("RESEARCH"),jobs:count("RESEARCH","COMPLETED"),failed:count("RESEARCH","FAILED"),cacheHits:count("RESEARCH","CACHE_HIT")},
  consult:{...componentMetrics("CONSULT"),consultations:count("CONSULT","COMPLETED"),additionalResearchRequested:count("CONSULT","MORE_RESEARCH")},
  refinement:{...componentMetrics("REFINEMENT"),runs:count("REFINEMENT","COMPLETED")},
  review:{...componentMetrics("REVIEW"),approved:count("REVIEW","APPROVED"),limitations:count("REVIEW","APPROVED_WITH_LIMITATIONS"),needsMoreResearch:count("REVIEW","NEEDS_MORE_RESEARCH"),rejected:count("REVIEW","REJECTED")},
  response:{...componentMetrics("GAMEVAULT_AI")}
};}
export function listAI4Events({limit=50}={}){return db.prepare(`SELECT * FROM ai_pipeline_events ORDER BY created_at DESC LIMIT ?`).all(Math.min(200,Math.max(1,Number(limit)||50))).map(r=>({id:r.id,userId:r.user_id,conversationId:r.conversation_id,gameId:r.game_id,entityId:r.entity_id,component:r.component,eventType:r.event_type,success:Boolean(r.success),durationMs:r.duration_ms,metadata:parseJson(r.metadata_json,{}),createdAt:r.created_at}));}
