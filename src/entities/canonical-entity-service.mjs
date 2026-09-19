import { randomUUID } from "node:crypto";
import { db, json, nowIso, parseJson } from "../database/connection.mjs";
import { normalizeText } from "../knowledge/normalize.mjs";

export const ENTITY_TYPES=new Set([
  "GAME","CHARACTER","TRANSFORMATION","FORM","ABILITY","POWER","WEAPON","ITEM","TOOL","ARMOR","MATERIAL","RESOURCE","MOB","BOSS","NPC","LOCATION","MAP","BIOME","STRUCTURE","VEHICLE","FACTION","QUEST","MISSION","OBJECTIVE","MECHANIC","MODE","SEASON","CHAPTER","LORE_EVENT","STATUS_EFFECT","CRAFTING_RECIPE","COLLECTIBLE","CURRENCY","SYSTEM","TECHNOLOGY","GUIDE_TOPIC","OTHER"
]);

const ALIASES={
  "lore-topic":"LORE_EVENT",lore_topic:"LORE_EVENT",rank_system:"SYSTEM",system:"SYSTEM",guide:"GUIDE_TOPIC",unknown:"OTHER",concept:"OTHER",form:"TRANSFORMATION",virtual_currency:"CURRENCY"
};
const SPECIFICITY={OTHER:0,MECHANIC:2,SYSTEM:2,TECHNOLOGY:3,GUIDE_TOPIC:2,RESOURCE:4,MATERIAL:4,ITEM:5,TOOL:6,WEAPON:6,ARMOR:6,CURRENCY:7,LOCATION:6,MAP:6,BIOME:6,STRUCTURE:6,MOB:6,BOSS:7,NPC:6,CHARACTER:7,ABILITY:7,POWER:7,TRANSFORMATION:9,FORM:9,QUEST:6,MISSION:6,MODE:5,SEASON:5,CHAPTER:5,LORE_EVENT:6,STATUS_EFFECT:6,CRAFTING_RECIPE:6,COLLECTIBLE:5,VEHICLE:6,FACTION:6,OBJECTIVE:5,GAME:10};
const TRANSFORM_PREFIX=new Set(["super","hyper","ultra","mega","dark","golden","gold","perfect","awakened","ascended"]);

export function normalizeEntityType(type="OTHER"){
  const raw=String(type||"OTHER").trim().toLowerCase().replaceAll("-","_").replaceAll(" ","_");
  const normalized=ALIASES[raw]||raw.toUpperCase();
  return ENTITY_TYPES.has(normalized)?normalized:"OTHER";
}

function baseCharacterExists(gameId,name=""){
  const words=String(name||"").trim().split(/\s+/).filter(Boolean);if(words.length<2||!TRANSFORM_PREFIX.has(normalizeText(words[0])))return false;
  const tail=words.slice(1).join(" ");
  const row=db.prepare(`SELECT type FROM entities WHERE game_id=? AND lower(name)=lower(?) LIMIT 1`).get(gameId,tail);
  return row&&normalizeEntityType(row.type)==="CHARACTER";
}

function lexicalType(name="",gameId=null){
  const n=normalizeText(name);
  if(!n)return null;
  if(n==="robux"||/\b(currency|moeda|coins?|credits?)\b/i.test(name))return "CURRENCY";
  if(/\b(pickaxe|picareta|shovel|hoe|fishing rod|wrench|hammer|martelo)\b/i.test(name))return "TOOL";
  if(/\b(sword|espada|rifle|pistol|pistola|shotgun|bow|crossbow|gun|arma|blade|launcher)\b/i.test(name))return "WEAPON";
  if(/\b(armor|armadura|helmet|chestplate|boots|leggings)\b/i.test(name))return "ARMOR";
  if(/\b(city|cidade|zone|zona|palace|temple|forest|cave|island|ilha)\b/i.test(name))return "LOCATION";
  if(gameId&&baseCharacterExists(gameId,name))return "TRANSFORMATION";
  return null;
}

function tableExists(){try{return Boolean(db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name='entity_canonical_state'`).get());}catch{return false;}}
export function getCanonicalState(entityId){if(!entityId||!tableExists())return null;const r=db.prepare(`SELECT * FROM entity_canonical_state WHERE entity_id=?`).get(entityId);return r?{entityId:r.entity_id,gameId:r.game_id,canonicalType:r.canonical_type,confidence:Number(r.confidence||0),validationStatus:r.validation_status,source:r.source,reason:r.reason,updatedAt:r.updated_at}:null;}

export function inferCanonicalType({entity=null,name="",gameId=null,storedType="OTHER"}={}){
  const targetName=entity?.name||name||"",gid=entity?.gameId||gameId||null,stored=normalizeEntityType(entity?.type||storedType);
  const exact=lexicalType(targetName,gid);
  if(exact)return {type:exact,confidence:exact==="TRANSFORMATION"?.98:.94,reason:"LEXICAL_OR_RELATIONAL_CANONICALIZATION"};
  return {type:stored,confidence:stored==="OTHER"?.45:.76,reason:"STORED_TYPE"};
}

export function resolveCanonicalType(entity,{candidateType=null}={}){
  if(!entity)return {type:"OTHER",confidence:.2,validationStatus:"CANDIDATE",reason:"NO_ENTITY",source:"NONE"};
  const state=getCanonicalState(entity.id);
  if(state&&new Set(["MANUAL_VALIDATED","VALIDATED"]).has(state.validationStatus))return {type:normalizeEntityType(state.canonicalType),confidence:state.confidence||.9,validationStatus:state.validationStatus,reason:state.reason||"CANONICAL_STORE",source:state.source||"CANONICAL_STORE"};
  const inferred=inferCanonicalType({entity});
  const candidate=normalizeEntityType(candidateType||"OTHER");
  const chosen=(SPECIFICITY[candidate]||0)>(SPECIFICITY[inferred.type]||0)?{type:candidate,confidence:.72,reason:"MORE_SPECIFIC_CANDIDATE"}:inferred;
  return {...chosen,validationStatus:state?.validationStatus||"CANDIDATE",source:state?.source||"INFERENCE"};
}

export function chooseEntityType({existingType="OTHER",incomingType="OTHER",name="",gameId=null}={}){
  const existing=normalizeEntityType(existingType),incoming=normalizeEntityType(incomingType),lex=lexicalType(name,gameId);
  if(lex)return lex.toLowerCase();
  if(incoming==="OTHER")return existing.toLowerCase();
  if(existing==="OTHER")return incoming.toLowerCase();
  if((SPECIFICITY[incoming]||0)>(SPECIFICITY[existing]||0))return incoming.toLowerCase();
  return existing.toLowerCase();
}

export function registerCanonicalEntity({entityId,gameId,canonicalType,confidence=.8,validationStatus="VALIDATED",source="SYSTEM",reason=""}={}){
  if(!entityId||!gameId||!tableExists())return null;const type=normalizeEntityType(canonicalType),now=nowIso();
  const current=getCanonicalState(entityId);
  if(current?.validationStatus==="MANUAL_VALIDATED"&&validationStatus!=="MANUAL_VALIDATED")return current;
  db.prepare(`INSERT INTO entity_canonical_state(entity_id,game_id,canonical_type,confidence,validation_status,source,reason,updated_at) VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(entity_id) DO UPDATE SET game_id=excluded.game_id,canonical_type=excluded.canonical_type,confidence=excluded.confidence,validation_status=excluded.validation_status,source=excluded.source,reason=excluded.reason,updated_at=excluded.updated_at`).run(entityId,gameId,type,Number(confidence||0),validationStatus,source,reason,now);
  return getCanonicalState(entityId);
}

export function recordEntityConsistency({entityId,gameId,canonicalType,subsystem,observedType,details={}}={}){
  if(!entityId||!gameId||!tableExists())return null;const canonical=normalizeEntityType(canonicalType),observed=normalizeEntityType(observedType),status=canonical===observed?"CONSISTENT":"CONFLICT",id=`entity-consistency-${randomUUID()}`;
  db.prepare(`INSERT INTO entity_consistency_events(id,entity_id,game_id,canonical_type,subsystem,observed_type,status,details_json,created_at) VALUES(?,?,?,?,?,?,?,?,?)`).run(id,entityId,gameId,canonical,subsystem||"UNKNOWN",observed,status,json(details),nowIso());
  return {id,entityId,gameId,canonicalType:canonical,subsystem,observedType:observed,status,details};
}

export function entityConsistencyReport({limit=100,onlyConflicts=false}={}){
  if(!tableExists())return [];
  const rows=db.prepare(`SELECT e.id,e.game_id,e.name,e.type stored_type,c.canonical_type,c.confidence,c.validation_status,g.name game_name FROM entities e JOIN games g ON g.id=e.game_id LEFT JOIN entity_canonical_state c ON c.entity_id=e.id ${onlyConflicts?`WHERE upper(replace(e.type,'-','_'))<>c.canonical_type`:``} ORDER BY e.name LIMIT ?`).all(Math.min(500,Math.max(1,Number(limit)||100)));
  return rows.map(r=>({entityId:r.id,gameId:r.game_id,gameName:r.game_name,name:r.name,storedType:normalizeEntityType(r.stored_type),canonicalType:normalizeEntityType(r.canonical_type||r.stored_type),confidence:Number(r.confidence||0),validationStatus:r.validation_status||"CANDIDATE",consistent:normalizeEntityType(r.stored_type)===normalizeEntityType(r.canonical_type||r.stored_type)}));
}

export function setManualCanonicalType({entityId,type,reason="Manual correction"}={}){
  const entity=db.prepare(`SELECT * FROM entities WHERE id=?`).get(entityId);if(!entity)throw new Error("Entidade não encontrada.");const canonical=normalizeEntityType(type);if(!ENTITY_TYPES.has(canonical))throw new Error("Tipo canônico inválido.");
  db.prepare(`UPDATE entities SET type=?,updated_at=? WHERE id=?`).run(canonical.toLowerCase(),nowIso(),entityId);
  return registerCanonicalEntity({entityId,gameId:entity.game_id,canonicalType:canonical,confidence:1,validationStatus:"MANUAL_VALIDATED",source:"DATABASE_EXPLORER",reason});
}
