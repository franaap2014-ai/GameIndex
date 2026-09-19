import { db, json, nowIso, parseJson } from "../connection.mjs";
import { stableId } from "../../knowledge/normalize.mjs";

export function recordResearch(input) {
  const id = input.id || stableId("research", input.sessionId||"", input.query, nowIso(), Math.random());
  db.prepare(`INSERT INTO research_history(id,session_id,query,game_id,entity_name,result_status,sources_json,knowledge_created_json,created_at) VALUES(?,?,?,?,?,?,?,?,?)`)
    .run(id,input.sessionId||"",input.query,input.gameId||null,input.entityName||"",input.resultStatus||"",json(input.sources||[]),json(input.knowledgeCreated||[]),input.createdAt||nowIso());
  return id;
}
export function recentResearch(limit=50) { return db.prepare(`SELECT * FROM research_history ORDER BY created_at DESC LIMIT ?`).all(limit).map(row=>({id:row.id,sessionId:row.session_id,query:row.query,gameId:row.game_id,entityName:row.entity_name,resultStatus:row.result_status,sources:parseJson(row.sources_json,[]),knowledgeCreated:parseJson(row.knowledge_created_json,[]),createdAt:row.created_at})); }
export function researchCount() { return Number(db.prepare(`SELECT COUNT(*) count FROM research_history`).get().count); }
