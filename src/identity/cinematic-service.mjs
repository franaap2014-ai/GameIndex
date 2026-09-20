import { accessSnapshotForUser } from "../access/capability-service.mjs";
import { cinematicEvent, completeCinematicEvent, ensureCinematicEvent, startCinematicEvent } from "../database/repositories/cinematic-event-repository.mjs";
import { getPreference, setPreference } from "../database/repositories/user-repository.mjs";
import { themePublicState } from "../themes/theme-service.mjs";

export const CINEMATIC_EVENTS=Object.freeze({
  WELCOME:{eventKey:"welcome_0991_hf1_visual_v2",eventType:"WELCOME",identity:"WELCOME",version:"1",titleKey:"cinematic.welcome",fallbackTitle:"BEM-VINDO",color:"NEUTRAL"},
  PRO:{eventKey:"pro_intro_v2",eventType:"IDENTITY",identity:"PRO",version:"1",titleKey:"cinematic.pro",fallbackTitle:"PRO",color:"GREEN",theme:"PRO_GREEN"},
  TESTER:{eventKey:"tester_intro_v2",eventType:"IDENTITY",identity:"TESTER",version:"1",titleKey:"cinematic.tester",fallbackTitle:"TESTER",color:"BLUE",theme:"TESTER_BLUE"},
  DEV:{eventKey:"dev_intro_v2",eventType:"IDENTITY",identity:"DEV",version:"1",titleKey:"cinematic.dev",fallbackTitle:"DEV",color:"RED",theme:"DEV_RED"},
  CREATOR:{eventKey:"creator_intro_v2",eventType:"IDENTITY",identity:"CREATOR",version:"1",titleKey:"cinematic.creator",fallbackTitle:"CREATOR",color:"GOLD",theme:"CREATOR_TECH"}
});

export function resolvePrimaryIdentity(userId){
  const access=accessSnapshotForUser(String(userId));
  if(!access.authenticated)return "FREE";
  if(access.staffRole==="CREATOR")return "CREATOR";
  if(access.staffRole==="DEV")return "DEV";
  if(access.staffRole==="TESTER")return "TESTER";
  if(access.plan==="PRO")return "PRO";
  return "FREE";
}

function clientEvent(def,state){return {eventKey:def.eventKey,eventType:def.eventType,identity:def.identity,version:def.version,titleKey:def.titleKey,fallbackTitle:def.fallbackTitle,color:def.color,theme:def.theme||null,status:state?.status||"ELIGIBLE"};}
function recentlyStarted(state){if(!state||state.status!=="STARTED"||!state.updatedAt)return false;return Date.now()-Date.parse(state.updatedAt)<90_000;}

export function cinematicQueueForUser(userId){
  const user=String(userId),identity=resolvePrimaryIdentity(user),queue=[];
  const welcome=ensureCinematicEvent(user,{...CINEMATIC_EVENTS.WELCOME,metadata:{release:"0.991-HF1"}});
  if(welcome.status!=="COMPLETED"&&welcome.status!=="SKIPPED"&&!recentlyStarted(welcome))queue.push(clientEvent(CINEMATIC_EVENTS.WELCOME,welcome));
  if(identity!=="FREE"){
    const def=CINEMATIC_EVENTS[identity],state=ensureCinematicEvent(user,{...def,metadata:{identity,release:"0.991-HF1"}});
    if(state.status!=="COMPLETED"&&state.status!=="SKIPPED"&&!recentlyStarted(state))queue.push(clientEvent(def,state));
  }
  return {identity,queue,theme:themePublicState(user,getPreference(user).theme)};
}

export function startAccountCinematic(userId,eventKey){
  const queue=cinematicQueueForUser(userId),allowed=[CINEMATIC_EVENTS.WELCOME,...Object.values(CINEMATIC_EVENTS).filter(x=>x.identity===queue.identity)].find(x=>x.eventKey===eventKey);
  if(!allowed)throw Object.assign(new Error("CINEMATIC_NOT_ELIGIBLE"),{code:"CINEMATIC_NOT_ELIGIBLE"});
  const state=startCinematicEvent(userId,eventKey);if(!state)throw Object.assign(new Error("CINEMATIC_EVENT_NOT_FOUND"),{code:"CINEMATIC_EVENT_NOT_FOUND"});return clientEvent(allowed,state);
}

export function completeAccountCinematic(userId,eventKey){
  const def=Object.values(CINEMATIC_EVENTS).find(x=>x.eventKey===String(eventKey));if(!def)throw Object.assign(new Error("CINEMATIC_EVENT_UNKNOWN"),{code:"CINEMATIC_EVENT_UNKNOWN"});
  const current=cinematicEvent(userId,eventKey);if(!current)throw Object.assign(new Error("CINEMATIC_EVENT_NOT_FOUND"),{code:"CINEMATIC_EVENT_NOT_FOUND"});
  const primary=resolvePrimaryIdentity(userId);
  if(def.eventType==="IDENTITY"&&def.identity!==primary)throw Object.assign(new Error("CINEMATIC_IDENTITY_CHANGED"),{code:"CINEMATIC_IDENTITY_CHANGED"});
  const completed=completeCinematicEvent(userId,eventKey,{metadata:{completedIdentity:primary}});
  let preferences=getPreference(userId);
  if(def.theme){preferences=setPreference(userId,{theme:def.theme});}
  return {event:clientEvent(def,completed),identity:primary,preferences,theme:themePublicState(userId,preferences.theme)};
}
