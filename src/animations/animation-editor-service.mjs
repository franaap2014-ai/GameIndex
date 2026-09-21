import { randomUUID } from "node:crypto";
import { flushDurablePersistence } from "../database/connection.mjs";
import { CINEMATIC_EVENTS } from "../identity/cinematic-service.mjs";
import { validateAnimationDefinition, animationSchemaCatalog } from "./animation-schema.mjs";
import {
  archiveAnimationProject,getAnimationPreset,getAnimationProject,getCurrentAnimationRevision,getPublishedAnimationRevision,
  insertAnimationProject,listAnimationAudit,listAnimationPresets,listAnimationProjects,listAnimationRevisions,
  publishAnimationRevision,rollbackAnimationRevision,saveAnimationDraft,setAnimationBinding,setAnimationPreviewState,
  upsertBuiltInAnimationPreset
} from "../database/repositories/animation-repository.mjs";

function safeKey(value="animation"){
  const base=String(value||"animation").normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,48)||"animation";
  return `${base}-${randomUUID().slice(0,8)}`;
}
function k(time,props={},easing="GI_SOFT"){return {time,easing,...props};}
function definition(name,type,durationMs,tracks,background={mode:"GAMEINDEX_DARK"}){return {name,type,durationMs,background,tracks};}
function track(id,component,name,color,keyframes,text=""){return {id,component,name,color,text,keyframes};}

const BUILTIN_PRESETS=Object.freeze([
  {
    key:"creator-intro",name:"Creator Intro",category:"CINEMATIC",
    definition:definition("Creator Intro","CINEMATIC",4200,[
      track("logo","GI_LOGO","Game Index Logo","CREATOR_GOLD",[k(0,{opacity:0,scale:.9}),k(450,{opacity:1,scale:1},"GI_BOOT"),k(3200,{opacity:1}),k(3900,{opacity:0})]),
      track("rails","RAIL","Technological Rails","CREATOR_GOLD",[k(0,{opacity:0,lineProgress:0}),k(620,{opacity:.9,lineProgress:1},"GI_TECH"),k(3300,{opacity:.7}),k(4000,{opacity:0})]),
      track("nodes","NODE","Creator Nodes","CREATOR_RED",[k(350,{opacity:0,glow:0}),k(900,{opacity:1,glow:.65},"GI_POWER"),k(2700,{glow:1}),k(3900,{opacity:0})]),
      track("title","TITLE","Creator Title","CREATOR_GOLD",[k(500,{opacity:0,y:12}),k(1200,{opacity:1,y:0},"GI_SOFT"),k(3200,{opacity:1}),k(3900,{opacity:0})],"CREATOR"),
      track("iris","IRIS","Iris Exit","CREATOR_RED",[k(0,{opacity:0,clipProgress:0}),k(3450,{opacity:0,clipProgress:0}),k(4200,{opacity:1,clipProgress:1},"GI_IRIS")])
    ])
  },
  {
    key:"dev-intro",name:"DEV Intro",category:"CINEMATIC",
    definition:definition("DEV Intro","CINEMATIC",4000,[
      track("logo","GI_G_MARK","G Mark","DEV_RED",[k(0,{opacity:0,scale:.85}),k(500,{opacity:1,scale:1},"GI_BOOT"),k(3400,{opacity:0})]),
      track("scan","SCAN","Diagnostic Scan","DEV_BLUE",[k(300,{opacity:0,scanPosition:0}),k(2500,{opacity:.8,scanPosition:1},"GI_SCAN"),k(3500,{opacity:0})]),
      track("title","CLASSIFICATION","DEV Classification","DEV_RED",[k(700,{opacity:0,y:10}),k(1300,{opacity:1,y:0}),k(3300,{opacity:0})],"DEV")
    ])
  },
  {
    key:"tester-intro",name:"Tester Intro",category:"CINEMATIC",
    definition:definition("Tester Intro","CINEMATIC",3600,[
      track("grid","GRID","Diagnostic Grid","TESTER_BLUE",[k(0,{opacity:0}),k(500,{opacity:.45}),k(3000,{opacity:.35}),k(3500,{opacity:0})]),
      track("scan","SCAN","Blue Scan","TESTER_BLUE",[k(250,{opacity:0,scanPosition:0}),k(2600,{opacity:.9,scanPosition:1},"GI_SCAN"),k(3300,{opacity:0})]),
      track("title","CLASSIFICATION","Tester Classification","TESTER_BLUE",[k(600,{opacity:0}),k(1150,{opacity:1}),k(3100,{opacity:0})],"TESTER")
    ])
  },
  {
    key:"pro-intro",name:"PRO Intro",category:"CINEMATIC",
    definition:definition("PRO Intro","CINEMATIC",3400,[
      track("logo","GI_LOGO","Game Index Logo","PRO_GREEN",[k(0,{opacity:0,scale:.94}),k(450,{opacity:1,scale:1}),k(2900,{opacity:0})]),
      track("glow","GLOW","Clean Light Pulse","PRO_GREEN",[k(400,{opacity:0,glow:0}),k(1300,{opacity:.8,glow:1}),k(2500,{opacity:.25,glow:.3}),k(3100,{opacity:0})]),
      track("title","CLASSIFICATION","PRO Classification","PRO_GREEN",[k(650,{opacity:0}),k(1150,{opacity:1}),k(2900,{opacity:0})],"PRO")
    ])
  },
  {
    key:"welcome",name:"Welcome",category:"CINEMATIC",
    definition:definition("Welcome","CINEMATIC",4200,[
      track("logo","GI_LOGO","Game Index Logo","GAMEINDEX_WHITE",[k(0,{opacity:0,scale:.92}),k(700,{opacity:1,scale:1},"GI_BOOT"),k(3400,{opacity:0})]),
      track("rails","RAIL","Technology Rails","GAMEINDEX_BORDER",[k(0,{opacity:0,lineProgress:0}),k(900,{opacity:.8,lineProgress:1}),k(3500,{opacity:0})]),
      track("title","TITLE","Welcome Title","GAMEINDEX_WHITE",[k(500,{opacity:0,y:10}),k(1200,{opacity:1,y:0}),k(3300,{opacity:0})],"BEM-VINDO")
    ])
  },
  {
    key:"theme-power-transfer",name:"Theme Power Transfer",category:"CINEMATIC",
    definition:definition("Theme Power Transfer","CINEMATIC",4200,[
      track("blackout","BLACKOUT","Blackout","GAMEINDEX_BLACK",[k(0,{opacity:0}),k(380,{opacity:1},"GI_POWER"),k(3350,{opacity:1}),k(4100,{opacity:0})]),
      track("socket","SOCKET","Power Socket","GAMEINDEX_BORDER",[k(420,{opacity:0}),k(900,{opacity:1}),k(3200,{opacity:0})]),
      track("cable","CABLE","Power Cable","DARK_CABLE",[k(700,{opacity:0,lineProgress:0}),k(1700,{opacity:1,lineProgress:1},"GI_POWER"),k(3150,{opacity:0})]),
      track("energy","ENERGY_PULSE","Energy Pulse","DEV_BLUE",[k(1500,{opacity:0,energy:0}),k(2300,{opacity:1,energy:1},"GI_POWER"),k(3000,{opacity:0,energy:0})]),
      track("boot","BOOT","Boot","GAMEINDEX_WHITE",[k(2200,{opacity:0,brightness:0}),k(3200,{opacity:1,brightness:1.6},"GI_BOOT"),k(3900,{opacity:0})])
    ])
  }
]);

function legacyCatalog(){
  const entries=[];
  for(const [key,event] of Object.entries(CINEMATIC_EVENTS)){
    const preset=BUILTIN_PRESETS.find(p=>p.key===(key==="CREATOR"?"creator-intro":key==="DEV"?"dev-intro":key==="TESTER"?"tester-intro":key==="PRO"?"pro-intro":"welcome"));
    if(preset)entries.push({key:`legacy-${key.toLowerCase()}`,name:`${event.fallbackTitle} · 0.991 I1`,kind:"LEGACY_REFERENCE",eventKey:event.eventKey,identity:event.identity,definition:preset.definition,fidelity:"APPROXIMATION"});
  }
  const theme=BUILTIN_PRESETS.find(p=>p.key==="theme-power-transfer");
  entries.push({key:"legacy-theme-change",name:"Theme Change / Power Transfer",kind:"LEGACY_REFERENCE",eventKey:"theme-change",identity:"THEME_CHANGE",definition:theme.definition,fidelity:"APPROXIMATION"});
  return entries;
}

export function ensureBuiltInAnimationPresets(){
  for(const preset of BUILTIN_PRESETS){
    const normalized=validateAnimationDefinition(preset.definition,{name:preset.name,type:preset.definition.type});
    upsertBuiltInAnimationPreset({key:preset.key,name:preset.name,category:preset.category,definition:normalized});
  }
  return listAnimationPresets();
}
export function animationEditorCatalog(){
  return {schema:animationSchemaCatalog(),presets:listAnimationPresets(),existing:legacyCatalog().map(({definition,...entry})=>entry)};
}
export function animationProjectDetails(value){
  const project=getAnimationProject(value);if(!project)return null;
  const current=getCurrentAnimationRevision(project.id),published=getPublishedAnimationRevision(project.id);
  return {project,current,published,revisions:listAnimationRevisions(project.id),audit:listAnimationAudit(project.id)};
}
export function createAnimationProject({name="Nova animação",type="CINEMATIC",durationMs=4200,definition:input=null,actorUserId,source="CREATED"}={}){
  const normalized=validateAnimationDefinition(input||{name,type,durationMs,background:{mode:"GAMEINDEX_DARK"},tracks:[]},{name,type,durationMs});
  const project=insertAnimationProject({key:safeKey(name),name:normalized.name,type:normalized.type,durationMs:normalized.durationMs,definition:normalized,actorUserId,source});
  return animationProjectDetails(project.id);
}
export function createAnimationFromPreset({presetKey,actorUserId}={}){
  const preset=getAnimationPreset(presetKey);if(!preset)throw Object.assign(new Error("ANIMATION_PRESET_NOT_FOUND"),{code:"ANIMATION_PRESET_NOT_FOUND"});
  return createAnimationProject({name:`${preset.name} Copy`,type:preset.definition.type,durationMs:preset.definition.durationMs,definition:{...preset.definition,name:`${preset.name} Copy`},actorUserId,source:`PRESET:${preset.key}`});
}
export function createAnimationFromExisting({existingKey,actorUserId}={}){
  const existing=legacyCatalog().find(x=>x.key===String(existingKey));if(!existing)throw Object.assign(new Error("ANIMATION_LEGACY_REFERENCE_NOT_FOUND"),{code:"ANIMATION_LEGACY_REFERENCE_NOT_FOUND"});
  return createAnimationProject({name:`${existing.name} Copy`,type:existing.definition.type,durationMs:existing.definition.durationMs,definition:{...existing.definition,name:`${existing.name} Copy`},actorUserId,source:`LEGACY:${existing.eventKey}`});
}
export function saveAnimationProject({projectId,definition:input,actorUserId}={}){
  const project=getAnimationProject(projectId);if(!project)throw Object.assign(new Error("ANIMATION_PROJECT_NOT_FOUND"),{code:"ANIMATION_PROJECT_NOT_FOUND"});
  if(project.status==="ARCHIVED")throw Object.assign(new Error("ANIMATION_PROJECT_ARCHIVED"),{code:"ANIMATION_PROJECT_ARCHIVED"});
  const normalized=validateAnimationDefinition(input,{name:project.name,type:project.type,durationMs:project.durationMs});
  const saved=saveAnimationDraft({projectId:project.id,name:normalized.name,type:normalized.type,durationMs:normalized.durationMs,definition:normalized,actorUserId});
  return {...animationProjectDetails(project.id),savedRevision:saved?.revision?.revision||null};
}
export function previewAnimationProject({projectId,definition:input=null,actorUserId}={}){
  const project=getAnimationProject(projectId);if(!project)throw Object.assign(new Error("ANIMATION_PROJECT_NOT_FOUND"),{code:"ANIMATION_PROJECT_NOT_FOUND"});
  const source=input||getCurrentAnimationRevision(project.id)?.definition;
  const normalized=validateAnimationDefinition(source,{name:project.name,type:project.type,durationMs:project.durationMs});
  setAnimationPreviewState({projectId:project.id,actorUserId});
  return {project:getAnimationProject(project.id),runtime:normalized,historyMutation:false};
}
export async function publishAnimationProject({projectId,actorUserId}={}){
  const project=getAnimationProject(projectId);if(!project)throw Object.assign(new Error("ANIMATION_PROJECT_NOT_FOUND"),{code:"ANIMATION_PROJECT_NOT_FOUND"});
  const current=getCurrentAnimationRevision(project.id);if(!current)throw Object.assign(new Error("ANIMATION_REVISION_NOT_FOUND"),{code:"ANIMATION_REVISION_NOT_FOUND"});
  validateAnimationDefinition(current.definition,{name:project.name,type:project.type,durationMs:project.durationMs});
  const published=publishAnimationRevision({projectId:project.id,actorUserId});
  await flushDurablePersistence({force:true,reason:"animation-publish"});
  return {...animationProjectDetails(project.id),publishedRevision:published?.revision?.revision||null};
}
export async function rollbackAnimationProject({projectId,revision,actorUserId}={}){
  const result=rollbackAnimationRevision({projectId,revision,actorUserId});
  if(!result)throw Object.assign(new Error("ANIMATION_REVISION_NOT_FOUND"),{code:"ANIMATION_REVISION_NOT_FOUND"});
  await flushDurablePersistence({force:true,reason:"animation-rollback"});
  return animationProjectDetails(result.project.id);
}
export async function archiveAnimation({projectId,actorUserId}={}){
  const project=archiveAnimationProject({projectId,actorUserId});if(!project)throw Object.assign(new Error("ANIMATION_PROJECT_NOT_FOUND"),{code:"ANIMATION_PROJECT_NOT_FOUND"});
  await flushDurablePersistence({force:true,reason:"animation-archive"});
  return project;
}
export async function bindPublishedAnimation({projectId,contextType="CUSTOM",contextKey="",revision,enabled=true,actorUserId}={}){
  const allowed=new Set(["WELCOME","IDENTITY_CREATOR","IDENTITY_DEV","IDENTITY_TESTER","IDENTITY_PRO","THEME_CHANGE","GAME_REVEAL","ADMIN_PANEL_OPEN","CUSTOM"]);
  const type=String(contextType||"CUSTOM").toUpperCase();if(!allowed.has(type))throw Object.assign(new Error("ANIMATION_BINDING_CONTEXT_INVALID"),{code:"ANIMATION_BINDING_CONTEXT_INVALID"});
  const binding=setAnimationBinding({projectId,contextType:type,contextKey:String(contextKey||"").slice(0,120),revision:Number(revision),enabled:Boolean(enabled),actorUserId});
  if(!binding)throw Object.assign(new Error("ANIMATION_REVISION_NOT_FOUND"),{code:"ANIMATION_REVISION_NOT_FOUND"});
  await flushDurablePersistence({force:true,reason:"animation-binding"});
  return binding;
}
export function listAnimationEditorProjects(options={}){return listAnimationProjects(options);}
export function animationExistingCatalog(){return legacyCatalog().map(entry=>({...entry,definition:validateAnimationDefinition(entry.definition)}));}
