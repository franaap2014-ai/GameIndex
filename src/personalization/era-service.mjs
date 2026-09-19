import { db, nowIso, parseJson } from "../database/connection.mjs";

const TABLE="game_era_profiles";
function tableExists(){return Boolean(db.prepare(`SELECT 1 FROM sqlite_master WHERE type='table' AND name=?`).get(TABLE));}
function key(value,name="ERA"){const v=String(value||"").trim().toLowerCase();if(!/^[a-z0-9-]{1,40}$/.test(v))throw new Error(`INVALID_${name}_KEY`);return v;}
function obj(value){return value&&typeof value==="object"&&!Array.isArray(value)?value:{};}
function map(row){return row?{gameId:row.game_id,experienceKey:row.experience_key,eraKey:row.era_key,label:row.label||row.era_key,subtitle:row.subtitle||"",theme:parseJson(row.theme_json,{}),font:parseJson(row.font_json,{}),components:parseJson(row.component_json,{}),motion:parseJson(row.motion_json,{}),musicSlot:row.music_slot||"",enabled:Boolean(row.enabled),updatedAt:row.updated_at}:null;}

export function eraProfile(gameId,experienceKey="main",eraKey=""){
  if(!tableExists()||!eraKey)return null;
  const row=db.prepare(`SELECT * FROM game_era_profiles WHERE game_id=? AND experience_key=? AND era_key=? AND enabled=1 LIMIT 1`).get(String(gameId||""),key(experienceKey,"EXPERIENCE"),key(eraKey));
  return map(row);
}

export function listEraProfiles(gameId,experienceKey="main"){
  if(!tableExists())return [];
  return db.prepare(`SELECT * FROM game_era_profiles WHERE game_id=? AND experience_key=? AND enabled=1 ORDER BY era_key`).all(String(gameId||""),key(experienceKey,"EXPERIENCE")).map(map);
}

export function setEraProfile({gameId,experienceKey="main",eraKey,label="",subtitle="",theme={},font={},components={},motion={},musicSlot="",enabled=true,userId=null}={}){
  if(!gameId)throw new Error("GAME_REQUIRED");
  if(!tableExists())throw new Error("ERA_PROFILES_UNAVAILABLE");
  const exp=key(experienceKey,"EXPERIENCE"),era=key(eraKey),now=nowIso();
  const parent=db.prepare(`SELECT 1 FROM game_experience_profiles WHERE game_id=? AND experience_key=?`).get(String(gameId),exp);
  if(!parent)throw new Error("EXPERIENCE_NOT_FOUND");
  const duration=Math.max(0,Math.min(600,Math.round(Number(obj(motion).durationMs)||220)));
  const safeMotion={...obj(motion),durationMs:duration,reducedMotionSafe:obj(motion).reducedMotionSafe!==false};
  db.prepare(`INSERT INTO game_era_profiles(game_id,experience_key,era_key,label,subtitle,theme_json,font_json,component_json,motion_json,music_slot,enabled,updated_by,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(game_id,experience_key,era_key) DO UPDATE SET label=excluded.label,subtitle=excluded.subtitle,theme_json=excluded.theme_json,font_json=excluded.font_json,component_json=excluded.component_json,motion_json=excluded.motion_json,music_slot=excluded.music_slot,enabled=excluded.enabled,updated_by=excluded.updated_by,updated_at=excluded.updated_at`).run(String(gameId),exp,era,String(label||era).slice(0,80),String(subtitle||"").slice(0,180),JSON.stringify(obj(theme)),JSON.stringify(obj(font)),JSON.stringify(obj(components)),JSON.stringify(safeMotion),String(musicSlot||"").toLowerCase().replace(/[^a-z0-9-]/g,"").slice(0,40),enabled?1:0,userId,now,now);
  return eraProfile(gameId,exp,era);
}
