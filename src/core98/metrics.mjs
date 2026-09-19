import { randomUUID } from "node:crypto";
import { db, json, nowIso } from "../database/connection.mjs";

export function recordOperation({type="CORE",name="UNKNOWN",gameId=null,entityId=null,durationMs=0,success=true,aiInvoked=false,aiAvoided=false,fallbackUsed=false,details={}}={}){
  try{
    const id=`op98-${randomUUID()}`;
    db.prepare(`INSERT INTO gi_operation_metrics(id,operation_type,operation_name,game_id,entity_id,duration_ms,success,ai_invoked,ai_avoided,fallback_used,details_json,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)`)
      .run(id,String(type).toUpperCase(),String(name).slice(0,120),gameId||null,entityId||null,Number(durationMs)||0,success?1:0,aiInvoked?1:0,aiAvoided?1:0,fallbackUsed?1:0,json(details||{}),nowIso());
    return id;
  }catch{return null;}
}

export function operationSummary({minutes=1440}={}){
  const since=new Date(Date.now()-Math.max(1,Number(minutes)||1440)*60000).toISOString();
  const row=db.prepare(`SELECT COUNT(*) total,COALESCE(SUM(CASE WHEN ai_invoked=0 THEN 1 ELSE 0 END),0) deterministic,COALESCE(SUM(ai_invoked),0) ai,COALESCE(SUM(ai_avoided),0) avoided,COALESCE(SUM(CASE WHEN ai_invoked=1 AND success=0 THEN 1 ELSE 0 END),0) ai_failures,COALESCE(SUM(fallback_used),0) fallbacks FROM gi_operation_metrics WHERE created_at>=?`).get(since)||{};
  return {total:Number(row.total||0),deterministic:Number(row.deterministic||0),ai:Number(row.ai||0),aiAvoided:Number(row.avoided||0),aiFailures:Number(row.ai_failures||0),fallbacks:Number(row.fallbacks||0),since};
}
