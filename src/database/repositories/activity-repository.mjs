import { randomUUID } from "node:crypto";
import { db, json, nowIso, parseJson } from "../connection.mjs";

function map(row){return row?{id:row.id,userId:row.user_id,eventType:row.event_type,gameId:row.game_id,entityId:row.entity_id,metadata:parseJson(row.metadata_json,{}),createdAt:row.created_at}:null;}
export function recordActivity({userId,eventType,gameId=null,entityId=null,metadata={}}){
  if(!userId||!eventType)return null;
  const id=randomUUID();
  db.prepare(`INSERT INTO user_activity(id,user_id,event_type,game_id,entity_id,metadata_json,created_at) VALUES(?,?,?,?,?,?,?)`).run(id,userId,eventType,gameId,entityId,json(metadata||{}),nowIso());
  return map(db.prepare(`SELECT * FROM user_activity WHERE id=?`).get(id));
}
export function listActivity(userId,{limit=30}={}){return db.prepare(`SELECT * FROM user_activity WHERE user_id=? ORDER BY created_at DESC LIMIT ?`).all(userId,Math.max(1,Math.min(100,limit))).map(map);}
export function activityCount(userId){return Number(db.prepare(`SELECT COUNT(*) count FROM user_activity WHERE user_id=?`).get(userId).count);}
