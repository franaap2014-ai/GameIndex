import { EventEmitter } from "node:events";
import { randomUUID } from "node:crypto";
import { db, json, nowIso } from "../database/connection.mjs";
import { recordOperation } from "./metrics.mjs";

const bus=new EventEmitter();
bus.setMaxListeners(80);

export function publishCoreEvent(eventType,payload={}){
  const started=Date.now(),type=String(eventType||"UNKNOWN").toUpperCase();
  const event={id:`evt98-${randomUUID()}`,event:type,gameId:payload.gameId||null,entityId:payload.entityId||null,subjectType:payload.subjectType||"",subjectId:payload.subjectId||"",payload,createdAt:nowIso()};
  try{db.prepare(`INSERT INTO gi_core_events(id,event_type,game_id,entity_id,subject_type,subject_id,payload_json,status,created_at) VALUES(?,?,?,?,?,?,?,'PUBLISHED',?)`).run(event.id,type,event.gameId,event.entityId,event.subjectType,event.subjectId,json(payload||{}),event.createdAt);}catch{}
  bus.emit(type,event);bus.emit("*",event);
  recordOperation({type:"CORE",name:"MESSAGE_BUS_ROUTE",gameId:event.gameId,entityId:event.entityId,durationMs:Date.now()-started,aiAvoided:true,details:{event:type}});
  return event;
}
export function onCoreEvent(eventType,handler){bus.on(String(eventType||"*").toUpperCase(),handler);return ()=>bus.off(String(eventType||"*").toUpperCase(),handler);}
export function recentCoreEvents({gameId=null,limit=50}={}){const n=Math.min(200,Math.max(1,Number(limit)||50));const rows=gameId?db.prepare(`SELECT * FROM gi_core_events WHERE game_id=? ORDER BY created_at DESC LIMIT ?`).all(gameId,n):db.prepare(`SELECT * FROM gi_core_events ORDER BY created_at DESC LIMIT ?`).all(n);return rows.map(r=>({id:r.id,event:r.event_type,gameId:r.game_id,entityId:r.entity_id,subjectType:r.subject_type,subjectId:r.subject_id,payload:JSON.parse(r.payload_json||"{}"),createdAt:r.created_at}));}
