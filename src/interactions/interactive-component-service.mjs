import { randomUUID } from "node:crypto";
import { db, json, nowIso, parseJson } from "../database/connection.mjs";

export const INTERACTIVE_COMPONENT_TYPES=Object.freeze(["WHEEL","CALCULATOR","COMPARATOR","FILTER","PROGRESSION_TREE","CHECKLIST","TIMELINE","GALLERY","TABLE","SEARCHABLE_COLLECTION","MAP","STAT_EXPLORER","CUSTOM_SAFE_COMPONENT"]);
const TYPE_SET=new Set(INTERACTIVE_COMPONENT_TYPES);

function tableExists(){try{return Boolean(db.prepare(`SELECT 1 FROM sqlite_master WHERE type='table' AND name='interactive_components'`).get());}catch{return false;}}
function safeType(value){const type=String(value||"").toUpperCase();if(!TYPE_SET.has(type))throw Object.assign(new Error("INTERACTIVE_COMPONENT_TYPE_NOT_ALLOWED"),{code:"INTERACTIVE_COMPONENT_TYPE_NOT_ALLOWED"});return type;}
function plainObject(value){return value&&typeof value==="object"&&!Array.isArray(value)?value:{};}
function cleanLabel(value,max=100){return String(value||"").replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim().slice(0,max);}

export function normalizeWheelItems(items=[]){
  if(!Array.isArray(items)||!items.length)throw Object.assign(new Error("WHEEL_DATA_EMPTY"),{code:"WHEEL_DATA_EMPTY"});
  const out=[],ids=new Set();
  for(let index=0;index<items.length;index++){
    const row=items[index]||{},label=cleanLabel(row.label||row.name,100),weight=Number(row.weight??row.probability),id=cleanLabel(row.id||label.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,""),80);
    if(!label||!id||ids.has(id))continue;
    if(!Number.isFinite(weight)||weight<0)throw Object.assign(new Error("WHEEL_WEIGHT_INVALID"),{code:"WHEEL_WEIGHT_INVALID"});
    if(weight===0)continue;
    ids.add(id);out.push({id,label,weight,image:/^https?:\/\//i.test(String(row.image||""))?String(row.image):"",metadata:plainObject(row.metadata)});
  }
  if(!out.length)throw Object.assign(new Error("WHEEL_DATA_EMPTY"),{code:"WHEEL_DATA_EMPTY"});
  const total=out.reduce((sum,row)=>sum+row.weight,0);if(!Number.isFinite(total)||total<=0)throw Object.assign(new Error("WHEEL_WEIGHT_TOTAL_INVALID"),{code:"WHEEL_WEIGHT_TOTAL_INVALID"});
  return out.map(row=>({...row,probability:row.weight/total}));
}

export function validateInteractiveConfig(type,config={},data={}){
  const t=safeType(type),safeConfig=plainObject(config),safeData=plainObject(data);
  if(/[<>]|javascript:/i.test(JSON.stringify({safeConfig,safeData})))throw Object.assign(new Error("INTERACTIVE_EXECUTABLE_CONFIG_REJECTED"),{code:"INTERACTIVE_EXECUTABLE_CONFIG_REJECTED"});
  if(t==="WHEEL")return {type:t,config:{title:cleanLabel(safeConfig.title||"Simulator",120),resultLabel:cleanLabel(safeConfig.resultLabel||"Result",80),disclaimer:cleanLabel(safeConfig.disclaimer||"Game Index simulation",180)},data:{...safeData,items:normalizeWheelItems(safeData.items||[])}};
  return {type:t,config:safeConfig,data:safeData};
}

export function selectWeighted(items=[],randomValue=Math.random()){
  const normalized=normalizeWheelItems(items),r=Math.max(0,Math.min(.999999999999,Number(randomValue)||0));let cursor=0;
  for(const item of normalized){cursor+=item.probability;if(r<cursor)return item;}
  return normalized.at(-1);
}

export function upsertInteractiveComponent({id=null,entityGameId,pageId=null,sectionId=null,componentType,config={},data={},dataRevision=1,identityVariant="",localeConfig={},status="DRAFT",sourceIds=[],lastVerifiedAt="",revisionId=null}={}){
  if(!tableExists())throw new Error("INTERACTIVE_SCHEMA_REQUIRED");if(!entityGameId)throw new Error("ENTITY_GAME_REQUIRED");
  const validated=validateInteractiveConfig(componentType,config,data),componentId=id||`interaction-${randomUUID()}`,now=nowIso(),allowedStatus=new Set(["DRAFT","PUBLISHED","ARCHIVED","INVALID"]),state=allowedStatus.has(String(status).toUpperCase())?String(status).toUpperCase():"DRAFT";
  db.prepare(`INSERT INTO interactive_components(id,entity_game_id,page_id,section_id,component_type,config_json,data_json,data_revision,identity_variant,locale_config_json,status,source_ids_json,last_verified_at,revision_id,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET page_id=excluded.page_id,section_id=excluded.section_id,component_type=excluded.component_type,config_json=excluded.config_json,data_json=excluded.data_json,data_revision=excluded.data_revision,identity_variant=excluded.identity_variant,locale_config_json=excluded.locale_config_json,status=excluded.status,source_ids_json=excluded.source_ids_json,last_verified_at=excluded.last_verified_at,revision_id=excluded.revision_id,updated_at=excluded.updated_at`)
    .run(componentId,String(entityGameId),pageId||null,sectionId||null,validated.type,json(validated.config),json(validated.data),Math.max(1,Number(dataRevision)||1),cleanLabel(identityVariant,80),json(plainObject(localeConfig)),state,json([...new Set((sourceIds||[]).filter(Boolean))]),String(lastVerifiedAt||""),revisionId||null,now,now);
  return getInteractiveComponent(componentId);
}
function map(row){return row?{id:row.id,entityGameId:row.entity_game_id,pageId:row.page_id,sectionId:row.section_id,componentType:row.component_type,config:parseJson(row.config_json,{}),data:parseJson(row.data_json,{}),dataRevision:Number(row.data_revision||1),identityVariant:row.identity_variant||"",localeConfig:parseJson(row.locale_config_json,{}),status:row.status,sourceIds:parseJson(row.source_ids_json,[]),lastVerifiedAt:row.last_verified_at||"",revisionId:row.revision_id||null,createdAt:row.created_at,updatedAt:row.updated_at}:null;}
export function getInteractiveComponent(id){if(!tableExists())return null;return map(db.prepare(`SELECT * FROM interactive_components WHERE id=?`).get(String(id||"")));}
export function listInteractiveComponents(entityGameId,{status="PUBLISHED",pageId=null}={}){if(!tableExists())return [];const where=["entity_game_id=?"],args=[String(entityGameId||"")];if(status){where.push("status=?");args.push(String(status).toUpperCase());}if(pageId){where.push("page_id=?");args.push(String(pageId));}return db.prepare(`SELECT * FROM interactive_components WHERE ${where.join(" AND ")} ORDER BY created_at,id`).all(...args).map(map);}

// Generic parser: extracts explicit "label ... 12.5%" style statements from accepted evidence.
// It does not know Blox Fruits item names and never invents missing probabilities.
export function extractProbabilityItemsFromEvidence(evidence=[]){
  const items=[],seen=new Set();
  for(const item of Array.isArray(evidence)?evidence:[]){
    const claim=String(item?.claim||item?.text||"").replace(/\s+/g," ").trim();if(!claim)continue;
    const re=/([A-ZÀ-Ý][A-Za-zÀ-ÿ0-9'’\- ]{1,55}?)\s*(?:[:=\-–—]|has|chance|probability|chance of|probabilidade|chance de)?\s*(\d+(?:[.,]\d+)?)\s*%/g;
    let match;while((match=re.exec(claim))){const label=cleanLabel(match[1].replace(/^(?:the|a|an|o|a)\s+/i,""),60),weight=Number(match[2].replace(",","."));if(!label||!Number.isFinite(weight)||weight<=0||weight>100)continue;const key=label.toLowerCase();if(seen.has(key))continue;seen.add(key);items.push({id:key.replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,""),label,weight,metadata:{evidenceId:item.id||""}});}
  }
  return items.length>=2?normalizeWheelItems(items):[];
}
