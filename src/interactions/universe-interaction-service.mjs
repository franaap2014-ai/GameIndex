import { randomUUID } from "node:crypto";
import { db, json, nowIso, parseJson } from "../database/connection.mjs";
import { getGameById } from "../database/repositories/game-repository.mjs";
import { resolveIdentityProfile } from "../identity/experience-identity-service.mjs";

export const UNIVERSE_INTERACTION_EVENTS=Object.freeze(["CLICK","HOVER","FOCUS","ENTER_SECTION","LEAVE_SECTION"]);
export const UNIVERSE_INTERACTION_ACTIONS=Object.freeze(["OPEN","REVEAL","HIDE","NAVIGATE","PLAY_ANIMATION","PLAY_SOUND","CHANGE_STATE","SHOW_INFO","OPEN_CHARACTER","OPEN_LOCATION","OPEN_MEDIA","OPEN_GALLERY","SCROLL_TO"]);
export const UNIVERSE_ELEMENT_ROLES=Object.freeze(["DECORATIVE","INTERACTIVE","NAVIGATION","CONTENT"]);
const EVENT_SET=new Set(UNIVERSE_INTERACTION_EVENTS),ACTION_SET=new Set(UNIVERSE_INTERACTION_ACTIONS),ROLE_SET=new Set(UNIVERSE_ELEMENT_ROLES);
const STATUS_SET=new Set(["DRAFT","PUBLISHED","ARCHIVED","INVALID"]),SOURCE_SET=new Set(["MANUAL","BUILDER","PRESET","AI_SUGGESTION"]);

const PRESET_BY_THEME=Object.freeze({
  "blox-fruits-adventure":[
    {name:"Pirate navigation",elementKey:"MOTIF:JOLLY_ROGER",elementRole:"NAVIGATION",eventType:"CLICK",actionType:"SCROLL_TO",targetType:"PAGE",targetId:"GAMEPLAY",parameters:{label:"Open gameplay"}},
    {name:"Fruit collection",elementKey:"MOTIF:BLOX_FRUIT",elementRole:"NAVIGATION",eventType:"CLICK",actionType:"SCROLL_TO",targetType:"PAGE",targetId:"COLLECTIONS",parameters:{label:"Open collections"}},
    {name:"Compass motion",elementKey:"MOTIF:NAVAL_COMPASS",elementRole:"INTERACTIVE",eventType:"HOVER",actionType:"PLAY_ANIMATION",targetType:"SELF",targetId:"",parameters:{animation:"pulse-rotate",label:"Compass detail"}}
  ],
  "doors-corridor":[
    {name:"Door navigation",elementKey:"MOTIF:DOOR_FRAME",elementRole:"NAVIGATION",eventType:"CLICK",actionType:"SCROLL_TO",targetType:"PAGE",targetId:"OVERVIEW",parameters:{label:"Open overview"}},
    {name:"Room number navigation",elementKey:"MOTIF:ROOM_NUMBER",elementRole:"NAVIGATION",eventType:"CLICK",actionType:"SCROLL_TO",targetType:"PAGE",targetId:"TECHNICAL_INFORMATION",parameters:{label:"Open technical information"}},
    {name:"Elevator response",elementKey:"MOTIF:ELEVATOR_DETAIL",elementRole:"INTERACTIVE",eventType:"FOCUS",actionType:"PLAY_ANIMATION",targetType:"SELF",targetId:"",parameters:{animation:"lift",label:"Elevator detail"}}
  ],
  "fisch-aquatic":[
    {name:"Fish navigation",elementKey:"MOTIF:FISCH_FISH",elementRole:"NAVIGATION",eventType:"CLICK",actionType:"SCROLL_TO",targetType:"PAGE",targetId:"COLLECTIONS",parameters:{label:"Open collections"}},
    {name:"Fish swim",elementKey:"MOTIF:FISCH_FISH",elementRole:"INTERACTIVE",eventType:"HOVER",actionType:"PLAY_ANIMATION",targetType:"SELF",targetId:"",parameters:{animation:"swim",label:"Fish detail"}},
    {name:"Hook gameplay",elementKey:"MOTIF:FISHING_HOOK",elementRole:"NAVIGATION",eventType:"CLICK",actionType:"SCROLL_TO",targetType:"PAGE",targetId:"GAMEPLAY",parameters:{label:"Open gameplay"}}
  ],
  "pizza-place-workshop":[
    {name:"Pizza gameplay",elementKey:"MOTIF:GAME_PIZZA",elementRole:"NAVIGATION",eventType:"CLICK",actionType:"SCROLL_TO",targetType:"PAGE",targetId:"GAMEPLAY",parameters:{label:"Open gameplay"}},
    {name:"Pizza box details",elementKey:"MOTIF:GAME_PIZZA_BOX",elementRole:"NAVIGATION",eventType:"CLICK",actionType:"SCROLL_TO",targetType:"PAGE",targetId:"OVERVIEW",parameters:{label:"Open overview"}},
    {name:"Counter response",elementKey:"MOTIF:RESTAURANT_COUNTER",elementRole:"INTERACTIVE",eventType:"HOVER",actionType:"PLAY_ANIMATION",targetType:"SELF",targetId:"",parameters:{animation:"pop",label:"Restaurant detail"}}
  ],
  "prison-life-2016":[
    {name:"Prison sign navigation",elementKey:"MOTIF:PRISON_SIGN",elementRole:"NAVIGATION",eventType:"CLICK",actionType:"SCROLL_TO",targetType:"PAGE",targetId:"OVERVIEW",parameters:{label:"Open overview"}},
    {name:"Bars gameplay",elementKey:"MOTIF:PRISON_BAR",elementRole:"NAVIGATION",eventType:"CLICK",actionType:"SCROLL_TO",targetType:"PAGE",targetId:"GAMEPLAY",parameters:{label:"Open gameplay"}},
    {name:"Security light response",elementKey:"MOTIF:SECURITY_LIGHT",elementRole:"INTERACTIVE",eventType:"HOVER",actionType:"PLAY_ANIMATION",targetType:"SELF",targetId:"",parameters:{animation:"beacon",label:"Security light detail"}}
  ]
});

function tableExists(){try{return Boolean(db.prepare(`SELECT 1 FROM sqlite_master WHERE type='table' AND name='universe_interaction_bindings'`).get());}catch{return false;}}
function plain(value){return value&&typeof value==="object"&&!Array.isArray(value)?value:{};}
function clean(value,max=160){return String(value??"").replace(/<[^>]*>/g," ").replace(/[<>]/g,"").replace(/\s+/g," ").trim().slice(0,max);}
function safeKey(value,max=160){const v=String(value??"").trim().toUpperCase().replace(/[^A-Z0-9:_-]+/g,"_").replace(/^_+|_+$/g,"").slice(0,max);if(!v)throw Object.assign(new Error("INTERACTION_ELEMENT_KEY_REQUIRED"),{code:"INTERACTION_ELEMENT_KEY_REQUIRED"});return v;}
function safeParameters(value={}){
  const input=plain(value),out={};
  for(const [key,raw] of Object.entries(input).slice(0,24)){
    const k=clean(key,60);if(!k)continue;
    if(typeof raw==="boolean")out[k]=raw;
    else if(typeof raw==="number"&&Number.isFinite(raw))out[k]=Math.max(-100000,Math.min(100000,raw));
    else if(typeof raw==="string")out[k]=clean(raw,500);
    else if(Array.isArray(raw))out[k]=raw.slice(0,20).map(x=>clean(x,160)).filter(Boolean);
  }
  const serialized=JSON.stringify(out);if(/<script|javascript:|data:text\/html|onerror\s*=|onload\s*=|eval\s*\(/i.test(serialized))throw Object.assign(new Error("INTERACTION_EXECUTABLE_CONFIG_REJECTED"),{code:"INTERACTION_EXECUTABLE_CONFIG_REJECTED"});
  return out;
}
function validateTarget(action,targetType,targetId){
  const type=clean(targetType||"NONE",60).toUpperCase().replace(/[^A-Z0-9_-]/g,"")||"NONE",id=clean(targetId||"",220);
  if(action==="PLAY_SOUND"&&type!=="AUDIO_ASSET")throw Object.assign(new Error("INTERACTION_AUDIO_ASSET_REQUIRED"),{code:"INTERACTION_AUDIO_ASSET_REQUIRED"});
  if(action==="NAVIGATE"&&id&&!id.startsWith("/"))throw Object.assign(new Error("INTERACTION_NAVIGATION_MUST_BE_SAME_ORIGIN_PATH"),{code:"INTERACTION_NAVIGATION_MUST_BE_SAME_ORIGIN_PATH"});
  if(action==="PLAY_SOUND"&&!/^[a-zA-Z0-9._:-]+$/.test(id))throw Object.assign(new Error("INTERACTION_AUDIO_ASSET_INVALID"),{code:"INTERACTION_AUDIO_ASSET_INVALID"});
  return {targetType:type,targetId:id};
}
export function validateUniverseInteraction(input={}){
  const eventType=String(input.eventType||input.event_type||"").toUpperCase(),actionType=String(input.actionType||input.action_type||"").toUpperCase(),elementRole=String(input.elementRole||input.element_role||"INTERACTIVE").toUpperCase();
  if(!EVENT_SET.has(eventType))throw Object.assign(new Error("INTERACTION_EVENT_NOT_ALLOWED"),{code:"INTERACTION_EVENT_NOT_ALLOWED"});
  if(!ACTION_SET.has(actionType))throw Object.assign(new Error("INTERACTION_ACTION_NOT_ALLOWED"),{code:"INTERACTION_ACTION_NOT_ALLOWED"});
  if(!ROLE_SET.has(elementRole))throw Object.assign(new Error("INTERACTION_ROLE_NOT_ALLOWED"),{code:"INTERACTION_ROLE_NOT_ALLOWED"});
  const target=validateTarget(actionType,input.targetType||input.target_type,input.targetId||input.target_id);
  const status=STATUS_SET.has(String(input.status||"DRAFT").toUpperCase())?String(input.status||"DRAFT").toUpperCase():"DRAFT",source=SOURCE_SET.has(String(input.source||"MANUAL").toUpperCase())?String(input.source||"MANUAL").toUpperCase():"MANUAL";
  return {elementKey:safeKey(input.elementKey||input.element_key),elementRole,eventType,actionType,...target,parameters:safeParameters(input.parameters||input.parameters_json||{}),status,source};
}
function map(row){return row?{id:row.id,entityGameId:row.entity_game_id,pageId:row.page_id||null,sectionId:row.section_id||null,elementKey:row.element_key,elementRole:row.element_role,eventType:row.event_type,actionType:row.action_type,targetType:row.target_type,targetId:row.target_id||"",parameters:parseJson(row.parameters_json,{}),status:row.status,source:row.source,revisionId:row.revision_id||null,createdBy:row.created_by||null,createdAt:row.created_at,updatedAt:row.updated_at}:null;}

export function upsertUniverseInteraction({id=null,entityGameId,pageId=null,sectionId=null,revisionId=null,createdBy=null,...input}={}){
  if(!tableExists())throw Object.assign(new Error("INTERACTION_BINDING_SCHEMA_REQUIRED"),{code:"INTERACTION_BINDING_SCHEMA_REQUIRED"});
  const game=getGameById(String(entityGameId||""));if(!game)throw Object.assign(new Error("GAME_NOT_FOUND"),{code:"GAME_NOT_FOUND"});
  const v=validateUniverseInteraction(input),now=nowIso();
  // I5: a preset/application is identified by its persisted behavior, not by a newly generated id.
  // Re-applying the same element/event/action/target must update/reuse the existing active row.
  const duplicate=!id?db.prepare(`SELECT id FROM universe_interaction_bindings WHERE entity_game_id=? AND revision_id IS ? AND element_key=? AND event_type=? AND action_type=? AND target_type=? AND COALESCE(target_id,'')=? AND status<>'ARCHIVED' ORDER BY created_at LIMIT 1`).get(game.id,revisionId||null,v.elementKey,v.eventType,v.actionType,v.targetType,v.targetId||""):null;
  const bindingId=id||duplicate?.id||`uib-${randomUUID()}`;
  db.prepare(`INSERT INTO universe_interaction_bindings(id,entity_game_id,page_id,section_id,element_key,element_role,event_type,action_type,target_type,target_id,parameters_json,status,source,revision_id,created_by,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET page_id=excluded.page_id,section_id=excluded.section_id,element_key=excluded.element_key,element_role=excluded.element_role,event_type=excluded.event_type,action_type=excluded.action_type,target_type=excluded.target_type,target_id=excluded.target_id,parameters_json=excluded.parameters_json,status=CASE WHEN universe_interaction_bindings.status='PUBLISHED' AND excluded.status='DRAFT' THEN universe_interaction_bindings.status ELSE excluded.status END,source=excluded.source,revision_id=excluded.revision_id,updated_at=excluded.updated_at`).run(bindingId,game.id,pageId||null,sectionId||null,v.elementKey,v.elementRole,v.eventType,v.actionType,v.targetType,v.targetId,json(v.parameters),v.status,v.source,revisionId||null,createdBy||null,now,now);
  return getUniverseInteraction(bindingId);
}
export function getUniverseInteraction(id){if(!tableExists())return null;return map(db.prepare(`SELECT * FROM universe_interaction_bindings WHERE id=?`).get(String(id||"")));}
export function listUniverseInteractions(entityGameId,{status="PUBLISHED",revisionId=null,includeManual=true}={}){
  if(!tableExists())return [];const clauses=["entity_game_id=?"],args=[String(entityGameId||"")];
  if(revisionId){clauses.push(`(revision_id=?${includeManual?" OR (revision_id IS NULL AND status='PUBLISHED')":""})`);args.push(String(revisionId));}
  else if(status){clauses.push("status=?");args.push(String(status).toUpperCase());}
  return db.prepare(`SELECT * FROM universe_interaction_bindings WHERE ${clauses.join(" AND ")} ORDER BY created_at,id`).all(...args).map(map);
}
export function archiveUniverseInteraction(id,entityGameId=null){if(!tableExists())return null;const now=nowIso(),args=[now,String(id||"")],where=entityGameId?"id=? AND entity_game_id=?":"id=?";if(entityGameId)args.push(String(entityGameId));db.prepare(`UPDATE universe_interaction_bindings SET status='ARCHIVED',updated_at=? WHERE ${where}`).run(...args);return getUniverseInteraction(id);}
export function interactionPresetsForEntity(entityGameId){const identity=resolveIdentityProfile(entityGameId),rows=PRESET_BY_THEME[identity?.themeKey]||[];return rows.map((row,index)=>({id:`preset-${identity?.themeKey||"default"}-${index+1}`,...row,themeKey:identity?.themeKey||"gameindex-default"}));}
export function seedInteractionPresets(entityGameId,{revisionId=null,pageKeys=[],createdBy=null}={}){
  if(!tableExists())return [];const available=new Set((pageKeys||[]).map(x=>String(x).toUpperCase())),existing=listUniverseInteractions(entityGameId,{status:null,revisionId,includeManual:false}),seen=new Set(existing.map(x=>`${x.elementKey}|${x.eventType}|${x.actionType}|${x.targetType}|${x.targetId}`)),out=[];
  for(const preset of interactionPresetsForEntity(entityGameId)){
    if(preset.targetType==="PAGE"&&preset.targetId&&!available.has(String(preset.targetId).toUpperCase()))continue;
    const key=`${preset.elementKey}|${preset.eventType}|${preset.actionType}|${preset.targetType}|${preset.targetId}`;if(seen.has(key))continue;
    out.push(upsertUniverseInteraction({entityGameId,revisionId,createdBy,...preset,status:"DRAFT",source:"PRESET"}));seen.add(key);
  }
  return out;
}
export function interactionBindingStats(entityGameId){const all=listUniverseInteractions(entityGameId,{status:null}),rows=all.filter(x=>x.status!=="ARCHIVED");return {total:rows.length,archived:all.length-rows.length,published:rows.filter(x=>x.status==="PUBLISHED").length,draft:rows.filter(x=>x.status==="DRAFT").length,interactiveElements:new Set(rows.map(x=>x.elementKey)).size,byEvent:Object.fromEntries(UNIVERSE_INTERACTION_EVENTS.map(e=>[e,rows.filter(x=>x.eventType===e).length])),byAction:Object.fromEntries(UNIVERSE_INTERACTION_ACTIONS.map(a=>[a,rows.filter(x=>x.actionType===a).length]))};}
export function validateInteractionTargets(entityGameId,{revisionId=null,pageKeys=[],sectionKeys=[],includeManual=true}={}){
  const rows=listUniverseInteractions(entityGameId,{status:null,revisionId,includeManual}),pages=new Set(pageKeys.map(x=>String(x).toUpperCase())),sections=new Set(sectionKeys.map(x=>String(x).toUpperCase())),errors=[];
  for(const row of rows){if(row.targetType==="PAGE"&&row.targetId&&!pages.has(String(row.targetId).toUpperCase()))errors.push({id:row.id,code:"TARGET_PAGE_NOT_FOUND",targetId:row.targetId});if(row.targetType==="SECTION"&&row.targetId&&!sections.has(String(row.targetId).toUpperCase()))errors.push({id:row.id,code:"TARGET_SECTION_NOT_FOUND",targetId:row.targetId});}
  return {valid:errors.length===0,total:rows.length,errors};
}

// I3: one authoritative lifecycle view derived from persisted binding rows plus their revision state.
// "planned" is never an in-memory recommendation: it means a persisted revision-linked binding exists.
export function interactionLifecycleStats(entityGameId){
  if(!tableExists())return {planned:0,draft:0,validated:0,published:0,archived:0,totalPersisted:0,byState:{}};
  const rows=db.prepare(`SELECT b.*,r.status revision_status FROM universe_interaction_bindings b LEFT JOIN universe_revisions r ON r.id=b.revision_id WHERE b.entity_game_id=? ORDER BY b.created_at,b.id`).all(String(entityGameId||""));
  const active=rows.filter(r=>r.status!=="ARCHIVED");
  const planned=active.filter(r=>Boolean(r.revision_id)).length;
  const draft=active.filter(r=>r.status==="DRAFT").length;
  const validated=active.filter(r=>r.revision_id&&["VALIDATED","PUBLISHED"].includes(String(r.revision_status||"").toUpperCase())).length;
  const published=active.filter(r=>r.status==="PUBLISHED").length;
  const archived=rows.length-active.length;
  return {planned,draft,validated,published,archived,totalPersisted:active.length,byState:{PLANNED:planned,DRAFT:draft,VALIDATED:validated,PUBLISHED:published,ARCHIVED:archived},consistent:planned<=active.length&&published<=active.length};
}
