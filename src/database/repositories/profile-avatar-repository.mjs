import { db, nowIso, parseJson, json, transaction } from "../connection.mjs";

function avatarTablesReady(){
  try{
    const rows=db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name IN ('profile_avatar_catalog','user_profile_avatar_selections')`).all();
    return new Set(rows.map(row=>row.name)).size===2;
  }catch{return false;}
}
function requireAvatarTables(){
  if(avatarTablesReady())return;
  throw Object.assign(new Error("Biblioteca de avatares temporariamente indisponível enquanto a atualização do perfil é concluída."),{code:"PROFILE_AVATAR_SCHEMA_REQUIRED",status:503});
}

function map(row){
  if(!row)return null;
  return {
    id:row.id,key:row.avatar_key,name:row.name,class:row.class,assetUrl:row.asset_url,
    accentColor:row.accent_color,styleTags:parseJson(row.style_tags_json,[]),
    dominantClassColor:Boolean(row.dominant_class_color),enabled:Boolean(row.enabled),
    builtIn:Boolean(row.built_in),placeholder:Boolean(row.placeholder),sortOrder:Number(row.sort_order||0),
    createdAt:row.created_at,updatedAt:row.updated_at
  };
}

export function listProfileAvatars({classes=[],includeDisabled=false}={}){
  if(!avatarTablesReady())return [];
  const allowed=[...new Set((classes||[]).map(x=>String(x).toUpperCase()).filter(Boolean))];
  const where=[includeDisabled?"1=1":"enabled=1"],args=[];
  if(allowed.length){where.push(`class IN (${allowed.map(()=>"?").join(",")})`);args.push(...allowed);}
  return db.prepare(`SELECT * FROM profile_avatar_catalog WHERE ${where.join(" AND ")} ORDER BY CASE class WHEN 'FREE' THEN 1 WHEN 'PRO' THEN 2 WHEN 'TESTER' THEN 3 WHEN 'DEV' THEN 4 WHEN 'CREATOR' THEN 5 ELSE 9 END,sort_order,name`).all(...args).map(map);
}
export function getProfileAvatar(value){
  if(!avatarTablesReady())return null;
  const key=String(value||"");
  return map(db.prepare(`SELECT * FROM profile_avatar_catalog WHERE id=? OR avatar_key=? LIMIT 1`).get(key,key));
}
export function selectedProfileAvatar(userId){
  if(!avatarTablesReady())return null;
  const row=db.prepare(`SELECT a.* FROM user_profile_avatar_selections s JOIN profile_avatar_catalog a ON a.id=s.avatar_id WHERE s.user_id=? AND a.enabled=1`).get(String(userId));
  return map(row);
}
export function selectProfileAvatar(userId,avatarId){
  requireAvatarTables();
  const avatar=getProfileAvatar(avatarId);if(!avatar||!avatar.enabled)throw Object.assign(new Error("Avatar indisponível."),{code:"PROFILE_AVATAR_NOT_FOUND"});
  const now=nowIso();
  transaction(()=>{db.prepare(`INSERT INTO user_profile_avatar_selections(user_id,avatar_id,selected_at) VALUES(?,?,?) ON CONFLICT(user_id) DO UPDATE SET avatar_id=excluded.avatar_id,selected_at=excluded.selected_at`).run(String(userId),avatar.id,now);
  db.prepare(`UPDATE user_profiles SET avatar_url=?,updated_at=? WHERE user_id=?`).run(avatar.assetUrl,now,String(userId));});
  return avatar;
}
export function clearSelectedProfileAvatar(userId){
  requireAvatarTables();
  db.prepare(`DELETE FROM user_profile_avatar_selections WHERE user_id=?`).run(String(userId));
  return true;
}
export function updateProfileAvatarCatalog(avatarId,{name,assetUrl,accentColor,styleTags,dominantClassColor,enabled,placeholder,sortOrder}={}){
  requireAvatarTables();
  const current=getProfileAvatar(avatarId);if(!current)throw Object.assign(new Error("Avatar não encontrado."),{code:"PROFILE_AVATAR_NOT_FOUND"});
  const now=nowIso();
  db.prepare(`UPDATE profile_avatar_catalog SET name=?,asset_url=?,accent_color=?,style_tags_json=?,dominant_class_color=?,enabled=?,placeholder=?,sort_order=?,updated_at=? WHERE id=?`).run(
    String(name??current.name).trim().slice(0,80),
    String(assetUrl??current.assetUrl).trim().slice(0,500),
    String(accentColor??current.accentColor).trim().slice(0,32),
    json(Array.isArray(styleTags)?styleTags.slice(0,20):current.styleTags),
    dominantClassColor===undefined?(current.dominantClassColor?1:0):(dominantClassColor?1:0),
    enabled===undefined?(current.enabled?1:0):(enabled?1:0),
    placeholder===undefined?(current.placeholder?1:0):(placeholder?1:0),
    Number.isFinite(Number(sortOrder))?Math.max(0,Math.min(999,Number(sortOrder))):current.sortOrder,
    now,current.id
  );
  return getProfileAvatar(current.id);
}
export function profileAvatarCatalogAudit(){
  if(!avatarTablesReady())return [];
  const rows=db.prepare(`SELECT class,COUNT(*) total,SUM(CASE WHEN enabled=1 THEN 1 ELSE 0 END) enabled,SUM(CASE WHEN enabled=1 AND dominant_class_color=1 THEN 1 ELSE 0 END) dominant,SUM(CASE WHEN enabled=1 AND placeholder=1 THEN 1 ELSE 0 END) placeholders FROM profile_avatar_catalog GROUP BY class ORDER BY class`).all();
  return rows.map(r=>({class:r.class,total:Number(r.total||0),enabled:Number(r.enabled||0),dominantClassColor:Number(r.dominant||0),placeholders:Number(r.placeholders||0)}));
}
