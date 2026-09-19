import { randomUUID } from "node:crypto";
import { db, json, nowIso, parseJson } from "../connection.mjs";

function map(row){return row?{id:row.id,userId:row.user_id,gameId:row.game_id,contentType:row.content_type,topic:row.topic,title:row.title,content:parseJson(row.content_json,{}),knowledgeIds:parseJson(row.knowledge_ids_json,[]),sourceIds:parseJson(row.source_ids_json,[]),createdAt:row.created_at,updatedAt:row.updated_at}:null;}
export function saveCreatorOutput({id=randomUUID(),userId=null,gameId,contentType,topic="",title,content={},knowledgeIds=[],sourceIds=[]}){
  const now=nowIso();
  db.prepare(`INSERT INTO creator_outputs(id,user_id,game_id,content_type,topic,title,content_json,knowledge_ids_json,source_ids_json,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)`).run(id,userId,gameId,contentType,topic,title,json(content),json(knowledgeIds),json(sourceIds),now,now);
  return getCreatorOutput(id);
}
export function getCreatorOutput(id){return map(db.prepare(`SELECT * FROM creator_outputs WHERE id=?`).get(id));}
export function listCreatorOutputs(userId,{limit=30}={}){return db.prepare(`SELECT * FROM creator_outputs WHERE user_id=? ORDER BY created_at DESC LIMIT ?`).all(userId,Math.max(1,Math.min(100,limit))).map(map);}
export function creatorOutputCount(userId){return Number(db.prepare(`SELECT COUNT(*) count FROM creator_outputs WHERE user_id=?`).get(userId).count);}
