import { db, json, nowIso, parseJson } from "../connection.mjs";
import { getUserById } from "./user-repository.mjs";
import { slugify } from "../../knowledge/normalize.mjs";
import { assertAllowedUsername, normalizeUsername, isReservedUsername } from "../../users/username-policy.mjs";
import { avatarDisplayUrl } from "../../users/avatar-view.mjs";

function usernameBlockedByLegacyConflict(normalized){
  try{return Boolean(db.prepare(`SELECT 1 FROM username_conflicts WHERE normalized_username=? AND status='OPEN' LIMIT 1`).get(normalized));}catch{return false;}
}
function normalizedExists(normalized,userId=null){
  const row=userId?db.prepare(`SELECT user_id FROM user_profiles WHERE normalized_username=? AND user_id<>?`).get(normalized,userId):db.prepare(`SELECT user_id FROM user_profiles WHERE normalized_username=?`).get(normalized);
  return Boolean(row)||usernameBlockedByLegacyConflict(normalized);
}
function uniqueUsername(user){
  const base=(slugify(user.displayName||"player")||"player").slice(0,18).replace(/-/g,"_").replace(/[^a-z0-9_]/g,"")||"player";
  const short=user.id.replace(/-/g,"").slice(0,6).toLowerCase();
  let candidate=`${base}_${short}`.slice(0,30);
  let normalized=normalizeUsername(candidate),i=2;
  while(normalizedExists(normalized,user.id)||isReservedUsername(normalized)){
    candidate=`${base}_${i++}_${short.slice(0,4)}`.slice(0,30);
    normalized=normalizeUsername(candidate);
  }
  return {username:candidate,normalizedUsername:normalized};
}
function map(row){if(!row)return null;const avatarUrl=row.avatar_url||"",updatedAt=row.updated_at||"";return {userId:row.user_id,username:row.username,normalizedUsername:row.normalized_username||normalizeUsername(row.username),displayName:row.display_name,bio:row.bio,avatarUrl,avatarDisplayUrl:avatarDisplayUrl(avatarUrl,updatedAt),avatarRevision:updatedAt,privacy:parseJson(row.privacy_json,{}),updatedAt};}

export function isUsernameAvailable(username,{forUserId=null}={}){
  const {normalizedUsername}=assertAllowedUsername(username);
  return !normalizedExists(normalizedUsername,forUserId);
}

export function ensureProfile(userId,{preferredUsername=null}={}){
  let row=db.prepare(`SELECT * FROM user_profiles WHERE user_id=?`).get(userId);
  if(row)return map(row);
  const user=getUserById(userId);if(!user)return null;
  let identity;
  if(preferredUsername){
    identity=assertAllowedUsername(preferredUsername);
    if(normalizedExists(identity.normalizedUsername,userId))throw new Error("Esse nome de usuário já está em uso. Escolha outro.");
  }else identity=uniqueUsername(user);
  db.prepare(`INSERT INTO user_profiles(user_id,username,display_name,bio,avatar_url,privacy_json,updated_at,normalized_username) VALUES(?,?,?,?,?,?,?,?)`).run(userId,identity.username,user.displayName||"","","",json({publicProfile:true}),nowIso(),identity.normalizedUsername);
  return map(db.prepare(`SELECT * FROM user_profiles WHERE user_id=?`).get(userId));
}
export function getProfileByUserId(userId){return ensureProfile(userId);}
export function getProfileByUsername(username){
  const normalized=normalizeUsername(username);if(!normalized)return null;
  const row=db.prepare(`SELECT * FROM user_profiles WHERE normalized_username=?`).get(normalized);
  return row?map(row):null;
}
export function updateProfile(userId,{displayName,bio,username,avatarUrl,privacy}={}){
  const current=ensureProfile(userId);if(!current)throw new Error("Perfil não encontrado.");
  const nextName=String(displayName??current.displayName).trim().slice(0,60);
  const nextBio=String(bio??current.bio).trim().slice(0,280);
  let identity={username:current.username,normalizedUsername:current.normalizedUsername};
  if(username!==undefined && String(username).trim()!==current.username){
    identity=assertAllowedUsername(username);
    if(normalizedExists(identity.normalizedUsername,userId))throw new Error("Esse nome de usuário já está em uso. Escolha outro.");
  }
  const nextAvatar=avatarUrl===undefined?current.avatarUrl:String(avatarUrl||"").slice(0,500);
  db.prepare(`UPDATE user_profiles SET username=?,normalized_username=?,display_name=?,bio=?,avatar_url=?,privacy_json=?,updated_at=? WHERE user_id=?`).run(identity.username,identity.normalizedUsername,nextName,nextBio,nextAvatar,json(privacy??current.privacy??{}),nowIso(),userId);
  db.prepare(`UPDATE users SET display_name=?,updated_at=? WHERE id=?`).run(nextName,nowIso(),userId);
  return getProfileByUserId(userId);
}
export function listProfiles({q="",limit=30,offset=0}={}){
  const term=`%${normalizeUsername(q)}%`;const n=Math.min(100,Math.max(1,Number(limit)||30));const o=Math.max(0,Number(offset)||0);
  const rows=db.prepare(`SELECT p.* FROM user_profiles p WHERE ?='' OR p.normalized_username LIKE ? OR lower(p.display_name) LIKE ? ORDER BY p.display_name,p.username LIMIT ? OFFSET ?`).all(q?term:"",term,term,n,o);
  return rows.map(map);
}

export function listUsernameConflicts({limit=100}={}){
  return db.prepare(`SELECT c.id,c.normalized_username,c.user_id,c.original_username,c.status,c.created_at,c.resolved_at,u.email,u.display_name FROM username_conflicts c JOIN users u ON u.id=c.user_id WHERE c.status='OPEN' ORDER BY c.created_at LIMIT ?`).all(Math.min(500,Math.max(1,Number(limit)||100))).map(r=>({id:r.id,normalizedUsername:r.normalized_username,userId:r.user_id,username:r.original_username,status:r.status,createdAt:r.created_at,email:r.email,displayName:r.display_name}));
}
