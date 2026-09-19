import { randomUUID } from "node:crypto";
import { db, json, nowIso, parseJson } from "../connection.mjs";

const ALLOWED=new Set(["FOLLOW_GAME","UNFOLLOW_GAME","VIEW_GAME","SEARCH_GAME","VIEW_ENTITY","VIEW_ARTICLE","SAVE_KNOWLEDGE","FRANCHISE_INTEREST","GENRE_INTEREST","DISMISS_RECOMMENDATION","RECOMMENDATION_CLICK"]);

export function recordInterestSignal({userId,gameId=null,genre="",franchise="",signalType,weight=0,metadata={},expiresAt=""}){
  if(!userId||!ALLOWED.has(String(signalType||"").toUpperCase()))return null;
  const type=String(signalType).toUpperCase(),id=randomUUID(),createdAt=nowIso();
  db.prepare(`INSERT INTO user_interest_signals(id,user_id,game_id,genre,franchise,signal_type,weight,metadata_json,created_at,expires_at) VALUES(?,?,?,?,?,?,?,?,?,?)`)
    .run(id,userId,gameId||null,String(genre||""),String(franchise||""),type,Number(weight||0),json(metadata||{}),createdAt,String(expiresAt||""));
  return {id,userId,gameId,genre,franchise,signalType:type,weight:Number(weight||0),metadata,createdAt,expiresAt};
}

export function listInterestSignals(userId,{limit=500}={}){
  return db.prepare(`SELECT * FROM user_interest_signals WHERE user_id=? ORDER BY created_at DESC LIMIT ?`).all(userId,Math.min(2000,Math.max(1,Number(limit)||500))).map(r=>({id:r.id,userId:r.user_id,gameId:r.game_id,genre:r.genre,franchise:r.franchise,signalType:r.signal_type,weight:r.weight,metadata:parseJson(r.metadata_json,{}),createdAt:r.created_at,expiresAt:r.expires_at}));
}

export function clearRecommendationHistory(userId){
  const a=db.prepare(`DELETE FROM user_interest_signals WHERE user_id=? AND signal_type NOT IN ('FOLLOW_GAME')`).run(userId);
  const b=db.prepare(`DELETE FROM recommendation_events WHERE user_id=?`).run(userId);
  return {signalsDeleted:Number(a.changes||0),eventsDeleted:Number(b.changes||0)};
}

export function setRecommendationsEnabled(userId,enabled){
  db.prepare(`UPDATE user_preferences SET recommendations_enabled=?,updated_at=? WHERE user_id=?`).run(enabled?1:0,nowIso(),userId);
  return recommendationsEnabled(userId);
}

export function recommendationsEnabled(userId){
  const row=db.prepare(`SELECT recommendations_enabled FROM user_preferences WHERE user_id=?`).get(userId);
  return row?Boolean(row.recommendations_enabled):true;
}

export function recordRecommendationEvent({userId=null,gameId,eventType="IMPRESSION",reason="",score=0}){
  if(!gameId)return null;const id=randomUUID();
  db.prepare(`INSERT INTO recommendation_events(id,user_id,game_id,event_type,reason,score,created_at) VALUES(?,?,?,?,?,?,?)`).run(id,userId||null,gameId,String(eventType||"IMPRESSION").toUpperCase(),String(reason||"").slice(0,240),Number(score||0),nowIso());
  return id;
}

export function recommendationMetrics(){
  const scalar=(sql,args=[])=>Number(db.prepare(sql).get(...args)?.count||0);
  return {
    served:scalar(`SELECT COUNT(*) count FROM recommendation_events WHERE event_type='IMPRESSION'`),
    interactions:scalar(`SELECT COUNT(*) count FROM recommendation_events WHERE event_type IN ('CLICK','FOLLOW','DISMISS')`),
    followSignals:scalar(`SELECT COUNT(*) count FROM user_interest_signals WHERE signal_type='FOLLOW_GAME'`),
    fallbackUsage:scalar(`SELECT COUNT(*) count FROM recommendation_events WHERE reason='TOP_COMMUNITY_FALLBACK'`),
    personalizedUsers:scalar(`SELECT COUNT(DISTINCT user_id) count FROM recommendation_events WHERE user_id IS NOT NULL AND reason<>'TOP_COMMUNITY_FALLBACK'`),
    personalizationDisabled:scalar(`SELECT COUNT(*) count FROM user_preferences WHERE recommendations_enabled=0`)
  };
}
