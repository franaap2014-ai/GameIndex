import { db, nowIso, parseJson } from "../database/connection.mjs";
import { getGameById, getGameBySlug } from "../database/repositories/game-repository.mjs";
import { gameMediaProfile, experienceMediaProfile } from "../images/game-media-service.mjs";
import { gamePublicVisual } from "../images/public-visual.mjs";
import { gameMusicProfile, gameAltMusicProfile } from "../music/youtube-music-service.mjs";
import { listEraProfiles, eraProfile } from "../personalization/era-service.mjs";

const PROFILE_TABLE="game_experience_profiles";
function safeKey(value){const v=String(value||"main").trim().toLowerCase();if(!/^[a-z0-9-]{1,40}$/.test(v))throw new Error("INVALID_EXPERIENCE_KEY");return v;}
function safeSlug(value){const v=String(value||"").trim().toLowerCase();if(v&&!/^[a-z0-9-]{1,80}$/.test(v))throw new Error("INVALID_EXPERIENCE_SLUG");return v;}
function tableExists(name){return Boolean(db.prepare(`SELECT 1 FROM sqlite_master WHERE type='table' AND name=?`).get(name));}
function tableColumn(name,column){try{return db.prepare(`PRAGMA table_info(${name})`).all().some(row=>row.name===column);}catch{return false;}}
function cleanMenu(value){const rows=Array.isArray(value)?value:[];return rows.map((x,i)=>({id:String(x?.id||"").toLowerCase().replace(/[^a-z0-9-]/g,"-").slice(0,40),label:String(x?.label||x?.id||"").trim().slice(0,60),labelKey:String(x?.labelKey||"").trim().slice(0,100),icon:String(x?.icon||"•").slice(0,8),order:Number.isFinite(Number(x?.order))?Number(x.order):(i+1)*10,requires:String(x?.requires||"").trim().slice(0,50)})).filter(x=>x.id&&x.label).sort((a,b)=>a.order-b.order);}
function cleanObject(value){return value&&typeof value==="object"&&!Array.isArray(value)?value:{};}
function legacyMap(row){return row?{gameId:row.game_id,key:row.experience_key,label:row.label||row.experience_key,backgroundSlot:row.background_slot||"PAGE_BACKGROUND",heroSlot:row.hero_slot||"HERO",musicSlot:row.music_slot||"main",theme:parseJson(row.accent_json,{}),font:{},menu:[],experienceType:"GAME_VARIANT",parentGameId:null,slug:row.experience_key,enabled:Boolean(row.enabled),updatedAt:row.updated_at}:null;}
function profileMap(row){return row?{gameId:row.game_id,key:row.experience_key,experienceType:row.experience_type||"GAME_VARIANT",parentGameId:row.parent_game_id||null,slug:row.slug||row.experience_key,label:row.label||row.experience_key,subtitle:row.subtitle||"",theme:parseJson(row.theme_json,{}),font:parseJson(row.font_json,{}),menu:cleanMenu(parseJson(row.menu_json,[])),components:parseJson(row.component_json,{}),motion:parseJson(row.motion_json,{}),defaultEraKey:row.default_era_key||"",musicSlot:row.music_slot||"main",logoSlot:row.logo_slot||"COVER",heroSlot:row.hero_slot||"HERO",backgroundSlot:row.background_slot||"PAGE_BACKGROUND",cardSlot:row.card_slot||"COVER",enabled:Boolean(row.enabled),updatedAt:row.updated_at}:null;}
function rawProfile(gameId,experienceKey="main"){
  const k=safeKey(experienceKey);
  if(tableExists(PROFILE_TABLE)){
    const row=db.prepare(`SELECT * FROM game_experience_profiles WHERE game_id=? AND experience_key=? LIMIT 1`).get(String(gameId||""),k);
    if(row)return profileMap(row);
  }
  const legacy=db.prepare(`SELECT * FROM game_experiences WHERE game_id=? AND experience_key=? LIMIT 1`).get(String(gameId||""),k);
  return legacyMap(legacy)||{gameId:String(gameId||""),key:k,experienceType:"GAME_VARIANT",parentGameId:null,slug:k,label:k==="main"?"Principal":k,subtitle:"",theme:{},font:{},menu:[],musicSlot:k==="main"?"main":k,logoSlot:"COVER",heroSlot:"HERO",backgroundSlot:k==="main"?"PAGE_BACKGROUND":"ARTWORK",cardSlot:"COVER",enabled:true,updatedAt:""};
}
function mediaFor(gameId,slot){try{return gameMediaProfile(gameId,slot);}catch{return null;}}
function experienceMediaFor(gameId,key,slot){try{return experienceMediaProfile(gameId,key,slot);}catch{return null;}}
function musicFor(gameId,slot){try{return slot==="main"?gameMusicProfile(gameId):gameAltMusicProfile(gameId,slot);}catch{return null;}}
export function experienceProfile(gameId,experienceKey="main"){
  const base=rawProfile(gameId,experienceKey);
  const parent=base.parentGameId?getGameById(base.parentGameId):null;
  const eras=listEraProfiles(gameId,base.key);const selectedEra=base.defaultEraKey?eraProfile(gameId,base.key,base.defaultEraKey):null;
  return {...base,parent:parent?{id:parent.id,slug:parent.slug,name:parent.nome}:null,eras,defaultEra:selectedEra,logo:experienceMediaFor(gameId,base.key,"LOGO")||mediaFor(gameId,base.logoSlot),banner:experienceMediaFor(gameId,base.key,"BANNER")||experienceMediaFor(gameId,base.key,"HERO")||mediaFor(gameId,base.heroSlot),background:experienceMediaFor(gameId,base.key,"BACKGROUND")||mediaFor(gameId,base.backgroundSlot),hero:experienceMediaFor(gameId,base.key,"HERO")||mediaFor(gameId,base.heroSlot),card:experienceMediaFor(gameId,base.key,"CARD")||experienceMediaFor(gameId,base.key,"BANNER")||mediaFor(gameId,base.cardSlot),gallery:experienceMediaFor(gameId,base.key,"GALLERY"),music:musicFor(gameId,base.musicSlot)};
}
export function listExperiences(gameId){
  if(tableExists(PROFILE_TABLE)){
    const rows=db.prepare(`SELECT * FROM game_experience_profiles WHERE game_id=? AND enabled=1 ORDER BY CASE experience_key WHEN 'main' THEN 0 ELSE 1 END,experience_key`).all(String(gameId||""));
    if(rows.length)return rows.map(profileMap);
  }
  return db.prepare(`SELECT * FROM game_experiences WHERE game_id=? AND enabled=1 ORDER BY experience_key`).all(String(gameId||"")).map(legacyMap);
}
export function listChildExperiences(parentGameId){
  if(!tableExists("game_parent_links"))return [];
  const entityFilter=tableColumn("games","entity_type")?" AND g.entity_type='EXPERIENCE'":"";
  const rows=db.prepare(`SELECT g.*,l.display_order,p.experience_key,p.label AS experience_label,p.subtitle,p.theme_json,p.font_json,p.menu_json,p.music_slot,p.logo_slot,p.hero_slot,p.background_slot,p.card_slot,p.enabled AS profile_enabled FROM game_parent_links l JOIN games g ON g.id=l.child_game_id LEFT JOIN game_experience_profiles p ON p.game_id=g.id AND p.experience_key='main' WHERE l.parent_game_id=? AND l.enabled=1 AND g.status='PUBLISHED'${entityFilter} ORDER BY l.display_order,g.name`).all(String(parentGameId||""));
  return rows.map(row=>{const game=getGameById(row.id),profile=game?experienceProfile(game.id,"main"):null,visual=game?gamePublicVisual(game):null;return{game:{id:row.id,slug:row.slug,name:row.name,description:row.description||"",franchise:row.franchise||"Roblox",entityType:game?.entityType||"EXPERIENCE",parentGameId:game?.parentGameId||String(parentGameId||"")},profile,visual};});
}
export function parentExperienceForGame(gameId){
  if(!tableExists("game_parent_links"))return null;
  const row=db.prepare(`SELECT p.id,p.slug,p.name,l.relation_type,l.display_order FROM game_parent_links l JOIN games p ON p.id=l.parent_game_id WHERE l.child_game_id=? AND l.enabled=1 LIMIT 1`).get(String(gameId||""));
  return row?{id:row.id,slug:row.slug,name:row.name,relationType:row.relation_type,displayOrder:Number(row.display_order||0)}:null;
}
export function robloxExperienceHub(){const roblox=getGameBySlug("roblox");if(!roblox)return null;return{parent:{id:roblox.id,slug:roblox.slug,name:roblox.nome,visual:gamePublicVisual(roblox)},variants:listExperiences(roblox.id).map(x=>experienceProfile(roblox.id,x.key)),children:listChildExperiences(roblox.id)};}
export function experienceByChildSlug(parentSlug,childSlug){const parent=getGameBySlug(safeSlug(parentSlug)),child=getGameBySlug(safeSlug(childSlug));if(!parent||!child)return null;const semantic=tableColumn("games","entity_type")?child.entityType==="EXPERIENCE"&&child.parentGameId===parent.id:false;const link=tableExists("game_parent_links")?db.prepare(`SELECT 1 FROM game_parent_links WHERE parent_game_id=? AND child_game_id=? AND enabled=1`).get(parent.id,child.id):null;if(!semantic&&!link)return null;return{parent:{id:parent.id,slug:parent.slug,name:parent.nome},game:child,profile:experienceProfile(child.id,"main")};}
export function setExperience({gameId,experienceKey="main",label="",subtitle="",experienceType="GAME_VARIANT",parentGameId=null,slug="",backgroundSlot="PAGE_BACKGROUND",heroSlot="HERO",logoSlot="COVER",cardSlot="COVER",musicSlot="main",theme=null,accent=null,font={},menu=[],components={},motion={},defaultEraKey="",enabled=true,userId=null}={}){
  if(!gameId)throw new Error("GAME_REQUIRED");const k=safeKey(experienceKey),now=nowIso();const visualTheme=cleanObject(theme)||{};const mergedTheme=Object.keys(visualTheme).length?visualTheme:cleanObject(accent);
  db.prepare(`INSERT INTO game_experiences(game_id,experience_key,label,background_slot,hero_slot,music_slot,accent_json,enabled,updated_by,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(game_id,experience_key) DO UPDATE SET label=excluded.label,background_slot=excluded.background_slot,hero_slot=excluded.hero_slot,music_slot=excluded.music_slot,accent_json=excluded.accent_json,enabled=excluded.enabled,updated_by=excluded.updated_by,updated_at=excluded.updated_at`).run(String(gameId),k,String(label||k).slice(0,80),String(backgroundSlot||"PAGE_BACKGROUND").toUpperCase(),String(heroSlot||"HERO").toUpperCase(),String(musicSlot||"main").toLowerCase(),JSON.stringify(mergedTheme),enabled?1:0,userId,now,now);
  if(tableExists(PROFILE_TABLE)){
    const role=["GAME_VARIANT","CHILD_GAME"].includes(String(experienceType).toUpperCase())?String(experienceType).toUpperCase():"GAME_VARIANT";
    const hasV2=tableColumn(PROFILE_TABLE,"component_json");
    if(hasV2)db.prepare(`INSERT INTO game_experience_profiles(game_id,experience_key,experience_type,parent_game_id,slug,label,subtitle,theme_json,font_json,menu_json,component_json,motion_json,default_era_key,music_slot,logo_slot,hero_slot,background_slot,card_slot,enabled,updated_by,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(game_id,experience_key) DO UPDATE SET experience_type=excluded.experience_type,parent_game_id=excluded.parent_game_id,slug=excluded.slug,label=excluded.label,subtitle=excluded.subtitle,theme_json=excluded.theme_json,font_json=excluded.font_json,menu_json=excluded.menu_json,component_json=excluded.component_json,motion_json=excluded.motion_json,default_era_key=excluded.default_era_key,music_slot=excluded.music_slot,logo_slot=excluded.logo_slot,hero_slot=excluded.hero_slot,background_slot=excluded.background_slot,card_slot=excluded.card_slot,enabled=excluded.enabled,updated_by=excluded.updated_by,updated_at=excluded.updated_at`).run(String(gameId),k,role,parentGameId||null,safeSlug(slug||k),String(label||k).slice(0,80),String(subtitle||"").slice(0,180),JSON.stringify(mergedTheme),JSON.stringify(cleanObject(font)),JSON.stringify(cleanMenu(menu)),JSON.stringify(cleanObject(components)),JSON.stringify(cleanObject(motion)),safeSlug(defaultEraKey||""),String(musicSlot||"main").toLowerCase(),String(logoSlot||"COVER").toUpperCase(),String(heroSlot||"HERO").toUpperCase(),String(backgroundSlot||"PAGE_BACKGROUND").toUpperCase(),String(cardSlot||"COVER").toUpperCase(),enabled?1:0,userId,now,now);
    else db.prepare(`INSERT INTO game_experience_profiles(game_id,experience_key,experience_type,parent_game_id,slug,label,subtitle,theme_json,font_json,menu_json,music_slot,logo_slot,hero_slot,background_slot,card_slot,enabled,updated_by,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(game_id,experience_key) DO UPDATE SET experience_type=excluded.experience_type,parent_game_id=excluded.parent_game_id,slug=excluded.slug,label=excluded.label,subtitle=excluded.subtitle,theme_json=excluded.theme_json,font_json=excluded.font_json,menu_json=excluded.menu_json,music_slot=excluded.music_slot,logo_slot=excluded.logo_slot,hero_slot=excluded.hero_slot,background_slot=excluded.background_slot,card_slot=excluded.card_slot,enabled=excluded.enabled,updated_by=excluded.updated_by,updated_at=excluded.updated_at`).run(String(gameId),k,role,parentGameId||null,safeSlug(slug||k),String(label||k).slice(0,80),String(subtitle||"").slice(0,180),JSON.stringify(mergedTheme),JSON.stringify(cleanObject(font)),JSON.stringify(cleanMenu(menu)),String(musicSlot||"main").toLowerCase(),String(logoSlot||"COVER").toUpperCase(),String(heroSlot||"HERO").toUpperCase(),String(backgroundSlot||"PAGE_BACKGROUND").toUpperCase(),String(cardSlot||"COVER").toUpperCase(),enabled?1:0,userId,now,now);
  }
  return experienceProfile(gameId,k);
}
