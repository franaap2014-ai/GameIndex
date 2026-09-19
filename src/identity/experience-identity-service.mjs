import { db, json, nowIso, parseJson } from "../database/connection.mjs";
import { getGameById } from "../database/repositories/game-repository.mjs";

const ALLOWED_MOTIFS=new Set([
  "FISCH_FISH","WATER_DETAIL","FISHING_ELEMENT","FISHING_HOOK","WATER_WAVE","FISHING_LINE","BOAT_DETAIL",
  "DOORS_DOOR","DOOR_FRAME","ROOM_NUMBER","CORRIDOR","HOTEL_CORRIDOR","ELEVATOR","ELEVATOR_DETAIL",
  "BLOX_FRUIT","FRUIT_SYMBOL","MARITIME_ELEMENT","JOLLY_ROGER","PIRATE_MAP","NAVAL_COMPASS","KATANA_SILHOUETTE",
  "PIZZA","GAME_PIZZA","PIZZA_BOX","GAME_PIZZA_BOX","RESTAURANT_ELEMENT","RESTAURANT_COUNTER",
  "PRISON_CLASSIC","PRISON_BAR","PRISON_SIGN","SECURITY_LIGHT","ROBLOX_2016","CLASSIC_ROBLOX_BLOCK_DETAIL"
]);
const TOKEN_KEYS=new Set(["pageBg","panelBg","panelAlt","text","muted","border","accent","accentStrong","interactiveBg","headerBg"]);
const DENSITIES=Object.freeze(["SPARSE","BALANCED","RICH","IMMERSIVE"]);
const DENSITY_SET=new Set(DENSITIES);
const DEFAULT_TOKENS=Object.freeze({pageBg:"#0b0f14",panelBg:"#111821",panelAlt:"#17202b",text:"#f5f7fa",muted:"#aab6c4",border:"#2d3a49",accent:"#76a9ff",accentStrong:"#9fc2ff",interactiveBg:"#121d2a",headerBg:"#080c11"});
const DEFAULT_POLICY=Object.freeze({continuity:true,sectionReinforcement:true,adaptivePerformance:true,maxAnimatedMotifs:4});

// I2 reviewed motif families. Density intent is RICH by default; runtime may reduce only
// expensive decoration on constrained devices while preserving identity continuity.
const VISUAL_GROUNDING_BY_THEME=Object.freeze({
  "blox-fruits-adventure":Object.freeze({density:"RICH",motifs:["JOLLY_ROGER","BLOX_FRUIT","FRUIT_SYMBOL","NAVAL_COMPASS","PIRATE_MAP","KATANA_SILHOUETTE"],placements:["HERO_ORNAMENT","TOP_RIGHT","SECTION_CORNER","BETWEEN_SECTIONS","CARD_ORNAMENT","NAVIGATION_ACCENT"],visualLanguage:"pirate-fruit-naval"}),
  "doors-corridor":Object.freeze({density:"RICH",motifs:["DOOR_FRAME","ROOM_NUMBER","HOTEL_CORRIDOR","ELEVATOR_DETAIL"],placements:["HERO_ORNAMENT","EDGE_RIGHT","SECTION_CORNER","BETWEEN_SECTIONS","NAVIGATION_ACCENT"],visualLanguage:"doors-hotel-corridor"}),
  "fisch-aquatic":Object.freeze({density:"RICH",motifs:["FISCH_FISH","FISHING_HOOK","WATER_WAVE","FISHING_LINE","BOAT_DETAIL"],placements:["HERO_ORNAMENT","TOP_RIGHT","SECTION_CORNER","BETWEEN_SECTIONS","CARD_ORNAMENT","NAVIGATION_ACCENT"],visualLanguage:"fisch-fishing-aquatic"}),
  "pizza-place-workshop":Object.freeze({density:"RICH",motifs:["GAME_PIZZA","GAME_PIZZA_BOX","RESTAURANT_COUNTER"],placements:["HERO_ORNAMENT","TOP_LEFT","TOP_RIGHT","SECTION_CORNER","BETWEEN_SECTIONS","CARD_ORNAMENT"],visualLanguage:"pizza-place-workplace"}),
  "prison-life-2016":Object.freeze({density:"RICH",motifs:["PRISON_BAR","PRISON_SIGN","SECURITY_LIGHT","CLASSIC_ROBLOX_BLOCK_DETAIL"],placements:["HERO_ORNAMENT","EDGE_LEFT","EDGE_RIGHT","SECTION_CORNER","BETWEEN_SECTIONS","NAVIGATION_ACCENT"],visualLanguage:"prison-life-classic-2016"})
});

function tableExists(){try{return Boolean(db.prepare(`SELECT 1 FROM sqlite_master WHERE type='table' AND name='entity_identity_profiles'`).get());}catch{return false;}}
function hasColumn(name){if(!tableExists())return false;try{return db.prepare(`PRAGMA table_info(entity_identity_profiles)`).all().some(row=>row.name===name);}catch{return false;}}
function cleanText(value,max=80){return String(value||"").replace(/[<>]/g,"").trim().slice(0,max);}
function validCssColor(value){const v=String(value||"").trim();return /^#[0-9a-f]{3,8}$/i.test(v)||/^rgba?\([0-9.,%\s]+\)$/i.test(v)||/^hsla?\([0-9.,%\s]+\)$/i.test(v);}
function plainObject(value){return value&&typeof value==="object"&&!Array.isArray(value)?value:{};}
function normalizeDensity(value,fallback="RICH"){const v=String(value||fallback).toUpperCase();return DENSITY_SET.has(v)?v:fallback;}
function sanitizePolicy(value={}){const input=plainObject(value);return {continuity:input.continuity!==false,sectionReinforcement:input.sectionReinforcement!==false,adaptivePerformance:input.adaptivePerformance!==false,maxAnimatedMotifs:Math.max(0,Math.min(8,Number(input.maxAnimatedMotifs??4)||0))};}
function groundingFor(themeKey,density="RICH",policy=DEFAULT_POLICY){const g=VISUAL_GROUNDING_BY_THEME[String(themeKey||"")]||null;if(!g)return null;return {density:normalizeDensity(density,g.density),semanticMotifs:[...g.motifs],motifs:[...g.motifs],placements:[...g.placements],visualLanguage:g.visualLanguage,policy:sanitizePolicy(policy),renderStrategy:"APPROVED_GAME_ASSETS_ONLY",gameSourcedVisualsRequired:true,genericGeneratedIdentityAllowed:false};}
function mergeGrounding(profile){if(!profile)return profile;const grounding=groundingFor(profile.themeKey,profile.visualDensity,profile.visualPolicy);if(!grounding)return {...profile,visualGrounding:null};return {...profile,motifs:[...new Set([...(profile.motifs||[]),...grounding.motifs])],visualGrounding:grounding};}

export function validateIdentityProfile(input={}){
  const rawSerialized=JSON.stringify(input||{});if(/<script|javascript:|onerror\s*=|onload\s*=/i.test(rawSerialized))throw new Error("IDENTITY_EXECUTABLE_CONTENT_REJECTED");
  const tokens={...DEFAULT_TOKENS};for(const [key,value] of Object.entries(input.tokens||{})){if(TOKEN_KEYS.has(key)&&validCssColor(value))tokens[key]=String(value);}
  const motifs=[...new Set((Array.isArray(input.motifs)?input.motifs:[]).map(x=>String(x).toUpperCase()).filter(x=>ALLOWED_MOTIFS.has(x)))];
  const decorations=(Array.isArray(input.decorations)?input.decorations:[]).filter(x=>typeof x==="string"&&x.length<=80&&!/[<>]/.test(x)).slice(0,24);
  const visualDensity=normalizeDensity(input.visualDensity||input.visual_density||"RICH");
  const visualPolicy=sanitizePolicy(input.visualPolicy||input.visual_policy||DEFAULT_POLICY);
  const serialized=JSON.stringify({tokens,motifs,decorations,typography:input.typography||{},musicProfile:input.musicProfile||{},visualPolicy});if(/<script|javascript:|onerror\s*=|onload\s*=/i.test(serialized))throw new Error("IDENTITY_EXECUTABLE_CONTENT_REJECTED");
  return {themeKey:cleanText(input.themeKey||"gameindex-default",80)||"gameindex-default",tokens,typography:plainObject(input.typography),motifs,decorations,layoutVariant:cleanText(input.layoutVariant||"STANDARD",60)||"STANDARD",interactionStyle:cleanText(input.interactionStyle||"DEFAULT",60)||"DEFAULT",technicalStyle:cleanText(input.technicalStyle||"DEFAULT",60)||"DEFAULT",musicProfile:plainObject(input.musicProfile),visualDensity,visualPolicy,status:["DRAFT","APPROVED","ARCHIVED"].includes(String(input.status).toUpperCase())?String(input.status).toUpperCase():"DRAFT"};
}
function map(row){return row?mergeGrounding({entityGameId:row.entity_game_id,themeKey:row.theme_key,tokens:{...DEFAULT_TOKENS,...parseJson(row.tokens_json,{})},typography:parseJson(row.typography_json,{}),motifs:parseJson(row.motifs_json,[]),decorations:parseJson(row.decorations_json,[]),layoutVariant:row.layout_variant,interactionStyle:row.interaction_style,technicalStyle:row.technical_style,musicProfile:parseJson(row.music_profile_json,{}),visualDensity:normalizeDensity(row.visual_density||VISUAL_GROUNDING_BY_THEME[row.theme_key]?.density||"RICH"),visualPolicy:sanitizePolicy(parseJson(row.visual_policy_json,DEFAULT_POLICY)),status:row.status,updatedBy:row.updated_by||null,createdAt:row.created_at,updatedAt:row.updated_at}):null;}
export function getIdentityProfile(entityGameId){if(!tableExists())return null;return map(db.prepare(`SELECT * FROM entity_identity_profiles WHERE entity_game_id=? LIMIT 1`).get(String(entityGameId||"")));}
export function setIdentityProfile(entityGameId,input={},userId=null){
  if(!tableExists())throw new Error("IDENTITY_SCHEMA_REQUIRED");const profile=validateIdentityProfile(input),now=nowIso();
  if(hasColumn("visual_density")){
    db.prepare(`INSERT INTO entity_identity_profiles(entity_game_id,theme_key,tokens_json,typography_json,motifs_json,decorations_json,layout_variant,interaction_style,technical_style,music_profile_json,visual_density,visual_policy_json,status,updated_by,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(entity_game_id) DO UPDATE SET theme_key=excluded.theme_key,tokens_json=excluded.tokens_json,typography_json=excluded.typography_json,motifs_json=excluded.motifs_json,decorations_json=excluded.decorations_json,layout_variant=excluded.layout_variant,interaction_style=excluded.interaction_style,technical_style=excluded.technical_style,music_profile_json=excluded.music_profile_json,visual_density=excluded.visual_density,visual_policy_json=excluded.visual_policy_json,status=excluded.status,updated_by=excluded.updated_by,updated_at=excluded.updated_at`).run(String(entityGameId),profile.themeKey,json(profile.tokens),json(profile.typography),json(profile.motifs),json(profile.decorations),profile.layoutVariant,profile.interactionStyle,profile.technicalStyle,json(profile.musicProfile),profile.visualDensity,json(profile.visualPolicy),profile.status,userId||null,now,now);
  }else{
    db.prepare(`INSERT INTO entity_identity_profiles(entity_game_id,theme_key,tokens_json,typography_json,motifs_json,decorations_json,layout_variant,interaction_style,technical_style,music_profile_json,status,updated_by,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(entity_game_id) DO UPDATE SET theme_key=excluded.theme_key,tokens_json=excluded.tokens_json,typography_json=excluded.typography_json,motifs_json=excluded.motifs_json,decorations_json=excluded.decorations_json,layout_variant=excluded.layout_variant,interaction_style=excluded.interaction_style,technical_style=excluded.technical_style,music_profile_json=excluded.music_profile_json,status=excluded.status,updated_by=excluded.updated_by,updated_at=excluded.updated_at`).run(String(entityGameId),profile.themeKey,json(profile.tokens),json(profile.typography),json(profile.motifs),json(profile.decorations),profile.layoutVariant,profile.interactionStyle,profile.technicalStyle,json(profile.musicProfile),profile.status,userId||null,now,now);
  }
  return getIdentityProfile(entityGameId);
}
export function setVisualPolicy(entityGameId,{visualDensity,visualPolicy}={},userId=null){
  const current=getIdentityProfile(entityGameId)||resolveIdentityProfile(entityGameId);if(!current)throw new Error("IDENTITY_PROFILE_NOT_FOUND");
  return setIdentityProfile(entityGameId,{...current,visualDensity:normalizeDensity(visualDensity||current.visualDensity),visualPolicy:{...current.visualPolicy,...plainObject(visualPolicy)},status:"APPROVED"},userId);
}
export function resolveIdentityProfile(entityGameId){const game=getGameById(String(entityGameId||""));if(!game)return null;const own=getIdentityProfile(game.id);if(own?.status==="APPROVED")return {...own,source:"ENTITY"};if(game.parentGameId){const parent=getIdentityProfile(game.parentGameId);if(parent?.status==="APPROVED")return {...parent,entityGameId:game.id,source:"PARENT_FALLBACK",inheritedFrom:game.parentGameId};}return {entityGameId:game.id,themeKey:"gameindex-default",tokens:{...DEFAULT_TOKENS},typography:{},motifs:[],decorations:[],visualDensity:"RICH",visualPolicy:{...DEFAULT_POLICY},visualGrounding:null,layoutVariant:"STANDARD",interactionStyle:"DEFAULT",technicalStyle:"DEFAULT",musicProfile:{sourceType:"NONE"},status:"APPROVED",source:"GAMEINDEX_DEFAULT"};}
export function identityCssVariables(profile){const p=profile||{tokens:DEFAULT_TOKENS};const t={...DEFAULT_TOKENS,...p.tokens};return {"--gi-page-bg":t.pageBg,"--gi-panel-bg":t.panelBg,"--gi-panel-alt":t.panelAlt,"--gi-text":t.text,"--gi-muted":t.muted,"--gi-border":t.border,"--gi-accent":t.accent,"--gi-accent-strong":t.accentStrong,"--gi-interactive-bg":t.interactiveBg,"--gi-header-bg":t.headerBg};}
export const IDENTITY_ALLOWED_MOTIFS=Object.freeze([...ALLOWED_MOTIFS]);
export const IDENTITY_VISUAL_GROUNDING=VISUAL_GROUNDING_BY_THEME;
export const IDENTITY_VISUAL_DENSITIES=DENSITIES;
