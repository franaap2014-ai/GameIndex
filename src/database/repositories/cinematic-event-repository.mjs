import { db, nowIso, json, parseJson } from "../connection.mjs";

function rowToEvent(row){
  if(!row)return null;
  return {
    userId:row.user_id,eventKey:row.event_key,eventType:row.event_type,identity:row.identity||"",version:row.version||"1",
    status:row.status,eligibleAt:row.eligible_at||"",startedAt:row.started_at||"",completedAt:row.completed_at||"",updatedAt:row.updated_at||"",
    metadata:parseJson(row.metadata_json,{})||{}
  };
}

export function cinematicEvent(userId,eventKey){
  return rowToEvent(db.prepare(`SELECT * FROM user_cinematic_events WHERE user_id=? AND event_key=?`).get(String(userId),String(eventKey)));
}

export function listCinematicEvents(userId){
  return db.prepare(`SELECT * FROM user_cinematic_events WHERE user_id=? ORDER BY eligible_at, event_key`).all(String(userId)).map(rowToEvent);
}

export function ensureCinematicEvent(userId,{eventKey,eventType="SYSTEM",identity="",version="1",metadata={}}={}){
  const now=nowIso();
  db.prepare(`INSERT INTO user_cinematic_events(user_id,event_key,event_type,identity,version,status,eligible_at,started_at,completed_at,updated_at,metadata_json)
    VALUES(?,?,?,?,?,'ELIGIBLE',?,'','',?,?) ON CONFLICT(user_id,event_key) DO NOTHING`)
    .run(String(userId),String(eventKey),String(eventType),String(identity||""),String(version||"1"),now,now,json(metadata||{}));
  return cinematicEvent(userId,eventKey);
}

export function startCinematicEvent(userId,eventKey){
  const current=cinematicEvent(userId,eventKey);if(!current)return null;if(current.status==="COMPLETED"||current.status==="SKIPPED")return current;
  const now=nowIso();
  db.prepare(`UPDATE user_cinematic_events SET status='STARTED',started_at=CASE WHEN started_at='' THEN ? ELSE started_at END,updated_at=? WHERE user_id=? AND event_key=?`).run(now,now,String(userId),String(eventKey));
  return cinematicEvent(userId,eventKey);
}

export function completeCinematicEvent(userId,eventKey,{metadata=null}={}){
  const current=cinematicEvent(userId,eventKey);if(!current)return null;const now=nowIso(),nextMeta=metadata===null?current.metadata:{...current.metadata,...metadata};
  db.prepare(`UPDATE user_cinematic_events SET status='COMPLETED',completed_at=CASE WHEN completed_at='' THEN ? ELSE completed_at END,updated_at=?,metadata_json=? WHERE user_id=? AND event_key=?`).run(now,now,json(nextMeta),String(userId),String(eventKey));
  return cinematicEvent(userId,eventKey);
}

export function skipCinematicEvent(userId,eventKey,{reason=""}={}){
  const current=cinematicEvent(userId,eventKey);if(!current)return null;const now=nowIso();
  db.prepare(`UPDATE user_cinematic_events SET status='SKIPPED',completed_at=CASE WHEN completed_at='' THEN ? ELSE completed_at END,updated_at=?,metadata_json=? WHERE user_id=? AND event_key=?`).run(now,now,json({...current.metadata,skipReason:String(reason||"")}),String(userId),String(eventKey));
  return cinematicEvent(userId,eventKey);
}


export function resetCinematicEvent(userId,eventKey,{reason=""}={}){
  const current=cinematicEvent(userId,eventKey);if(!current)return null;const now=nowIso();
  db.prepare(`UPDATE user_cinematic_events
    SET status='ELIGIBLE',started_at='',completed_at='',updated_at=?,metadata_json=?
    WHERE user_id=? AND event_key=?`)
    .run(now,json({...current.metadata,resetReason:String(reason||"").slice(0,240),resetAt:now}),String(userId),String(eventKey));
  return cinematicEvent(userId,eventKey);
}
