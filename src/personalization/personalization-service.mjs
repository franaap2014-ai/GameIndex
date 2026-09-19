import { getGameById, getGameBySlug } from "../database/repositories/game-repository.mjs";
import { experienceProfile, listExperiences, parentExperienceForGame } from "../games/game-experience-service.mjs";
import { eraProfile, listEraProfiles } from "./era-service.mjs";
import { eraMediaProfile, experienceMediaProfile, gameMediaProfile } from "../images/game-media-service.mjs";
import { gamePublicVisual } from "../images/public-visual.mjs";
import { gameMusicProfile, gameAltMusicProfile } from "../music/youtube-music-service.mjs";
import { THEMES, normalizeTheme } from "../themes/theme-service.mjs";

const COMPONENTS=Object.freeze({
  header:new Set(["default","ecosystem-modern","ecosystem-classic","compact"]),
  gameCard:new Set(["default","modern","classic-grid","compact-classic"]),
  navigation:new Set(["default","ecosystem-modern","ecosystem-classic"]),
  panel:new Set(["standard","modern-soft","modern-glass","classic-web"]),
  button:new Set(["default","modern-flat","classic-rectangular"]),
  density:new Set(["comfortable","compact"])
});
const DEFAULT_COMPONENTS=Object.freeze({header:"default",gameCard:"default",navigation:"default",panel:"standard",button:"default",density:"comfortable"});
const MEDIA_SLOTS=["LOGO","BANNER","HERO","BACKGROUND","CARD","GALLERY","ARTWORK"];
const GAME_SLOT={LOGO:"COVER",BANNER:"HERO",HERO:"HERO",BACKGROUND:"PAGE_BACKGROUND",CARD:"COVER",GALLERY:"ARTWORK",ARTWORK:"ARTWORK"};

function gameFrom(value){if(value&&typeof value==="object"&&value.id)return value;return getGameById(String(value||""))||getGameBySlug(String(value||""));}
function obj(value){return value&&typeof value==="object"&&!Array.isArray(value)?value:{};}
function merge(...values){return Object.assign({},...values.map(obj));}
function cleanKey(value,fallback="main"){const v=String(value||fallback).trim().toLowerCase();return /^[a-z0-9-]{1,40}$/.test(v)?v:fallback;}
function chooseExperience(gameId,key){const list=listExperiences(gameId);const wanted=cleanKey(key,"main");return list.find(x=>x.key===wanted)||list.find(x=>x.key==="main")||list[0]||null;}
function chooseEra(gameId,experience,eraKey){if(!experience)return null;const list=listEraProfiles(gameId,experience.key);if(!list.length)return null;const wanted=cleanKey(eraKey||experience.defaultEraKey||"","");return list.find(x=>x.eraKey===wanted)||list.find(x=>x.eraKey===experience.defaultEraKey)||list[0]||null;}
function themeDescriptor(themeId){const id=normalizeTheme(themeId||"FREE_DARK"),theme=THEMES[id]||THEMES.FREE_DARK;return {id,name:theme.name,identity:theme.identity,mode:theme.mode,accent:theme.accent};}
function safeComponents(...layers){const merged=merge(...layers),out={...DEFAULT_COMPONENTS};for(const [key,allowed] of Object.entries(COMPONENTS)){const value=String(merged[key]||"");if(allowed.has(value))out[key]=value;}return out;}
function safeMotion(...layers){const merged=merge(...layers),duration=Math.max(0,Math.min(600,Math.round(Number(merged.durationMs)||220)));return {durationMs:duration,reducedMotionSafe:merged.reducedMotionSafe!==false};}
function mediaRecord(profile,source){return profile?.imageUrl?{...profile,source}:null;}
function resolveSlot({game,parentGame,experience,parentExperience,era,parentEra,slot}){
  const candidates=[];
  // 0.9875 primary media: LOGO + BANNER. BANNER is canonical for experience/era,
  // while game-level BANNER maps to the existing HERO slot to preserve the production schema.
  if(slot==="BANNER"){
    if(era)candidates.push(mediaRecord(eraMediaProfile(game.id,experience.key,era.eraKey,"BANNER"),"ERA"));
    if(experience)candidates.push(mediaRecord(experienceMediaProfile(game.id,experience.key,"BANNER"),"EXPERIENCE"));
    candidates.push(mediaRecord(gameMediaProfile(game.id,"HERO"),"GAME"));
    // Legacy compatibility is fallback only; existing records are never deleted or rewritten.
    if(era)candidates.push(mediaRecord(eraMediaProfile(game.id,experience.key,era.eraKey,"HERO"),"ERA_LEGACY_HERO"));
    if(experience)candidates.push(mediaRecord(experienceMediaProfile(game.id,experience.key,"HERO"),"EXPERIENCE_LEGACY_HERO"));
    candidates.push(mediaRecord(gameMediaProfile(game.id,"PAGE_BACKGROUND"),"GAME_LEGACY_BACKGROUND"));
    if(parentGame){
      if(parentEra&&parentExperience)candidates.push(mediaRecord(eraMediaProfile(parentGame.id,parentExperience.key,parentEra.eraKey,"BANNER"),"PARENT_ERA"));
      if(parentExperience)candidates.push(mediaRecord(experienceMediaProfile(parentGame.id,parentExperience.key,"BANNER"),"PARENT_EXPERIENCE"));
      candidates.push(mediaRecord(gameMediaProfile(parentGame.id,"HERO"),"PARENT_GAME"));
      if(parentEra&&parentExperience)candidates.push(mediaRecord(eraMediaProfile(parentGame.id,parentExperience.key,parentEra.eraKey,"HERO"),"PARENT_ERA_LEGACY_HERO"));
      if(parentExperience)candidates.push(mediaRecord(experienceMediaProfile(parentGame.id,parentExperience.key,"HERO"),"PARENT_EXPERIENCE_LEGACY_HERO"));
    }
  }else{
    if(era)candidates.push(mediaRecord(eraMediaProfile(game.id,experience.key,era.eraKey,slot),"ERA"));
    if(experience)candidates.push(mediaRecord(experienceMediaProfile(game.id,experience.key,slot),"EXPERIENCE"));
    candidates.push(mediaRecord(gameMediaProfile(game.id,GAME_SLOT[slot]),"GAME"));
    if(parentGame){
      if(parentEra&&parentExperience)candidates.push(mediaRecord(eraMediaProfile(parentGame.id,parentExperience.key,parentEra.eraKey,slot),"PARENT_ERA"));
      if(parentExperience)candidates.push(mediaRecord(experienceMediaProfile(parentGame.id,parentExperience.key,slot),"PARENT_EXPERIENCE"));
      candidates.push(mediaRecord(gameMediaProfile(parentGame.id,GAME_SLOT[slot]),"PARENT_GAME"));
    }
  }
  const hit=candidates.find(Boolean);
  if(hit)return hit;
  if(["LOGO","CARD"].includes(slot)){
    const cover=gamePublicVisual(game)?.cover;
    if(cover)return {imageUrl:cover,url:cover,source:"GAMEINDEX_VISUAL_FALLBACK",slot};
  }
  if(slot==="BANNER"){
    const cover=gamePublicVisual(game)?.cover;
    if(cover)return {imageUrl:cover,url:cover,source:"GAMEINDEX_VISUAL_FALLBACK",slot};
  }
  return null;
}
function resolveMusic({game,parentGame,experience,parentExperience,era,parentEra}){
  const candidates=[];
  const ownSlot=era?.musicSlot||experience?.musicSlot||"main";
  candidates.push({profile:ownSlot==="main"?gameMusicProfile(game.id):gameAltMusicProfile(game.id,ownSlot),source:era?.musicSlot?"ERA":experience?.musicSlot&&experience.musicSlot!=="main"?"EXPERIENCE":"GAME"});
  if(parentGame&&parentExperience){
    const parentSlot=parentEra?.musicSlot||parentExperience.musicSlot||"main";
    candidates.push({profile:parentSlot==="main"?gameMusicProfile(parentGame.id):gameAltMusicProfile(parentGame.id,parentSlot),source:parentEra?.musicSlot?"PARENT_ERA":"PARENT_EXPERIENCE"});
  }
  const hit=candidates.find(x=>x.profile?.enabled!==false&&x.profile?.youtubeVideoId);
  return hit?{...hit.profile,source:hit.source}:null;
}

export function resolvePersonalization({game:gameInput,experienceKey="main",eraKey="",ecosystemExperienceKey="main",ecosystemEraKey="",userTheme="FREE_DARK"}={}){
  const game=gameFrom(gameInput);if(!game)throw new Error("GAME_NOT_FOUND");
  const parentRef=parentExperienceForGame(game.id),parentGame=parentRef?gameFrom(parentRef.id):null;
  const selected=chooseExperience(game.id,experienceKey);const experience=selected?experienceProfile(game.id,selected.key):null;
  const era=chooseEra(game.id,experience,eraKey);
  const parentSelected=parentGame?chooseExperience(parentGame.id,ecosystemExperienceKey):null;
  const parentExperience=parentSelected?experienceProfile(parentGame.id,parentSelected.key):null;
  const parentEra=parentGame?chooseEra(parentGame.id,parentExperience,ecosystemEraKey):null;

  const theme=merge(parentExperience?.theme,parentEra?.theme,experience?.theme,era?.theme);
  const font=merge(parentExperience?.font,parentEra?.font,experience?.font,era?.font);
  const components=safeComponents(parentExperience?.components,parentEra?.components,experience?.components,era?.components);
  const motion=safeMotion(parentExperience?.motion,parentEra?.motion,experience?.motion,era?.motion);
  const media=Object.fromEntries(MEDIA_SLOTS.map(slot=>[slot.toLowerCase(),resolveSlot({game,parentGame,experience,parentExperience,era,parentEra,slot})]));
  const music=resolveMusic({game,parentGame,experience,parentExperience,era,parentEra});
  const userThemeState=themeDescriptor(userTheme);
  const identity=String(era?.theme?.identity||experience?.theme?.identity||parentEra?.theme?.identity||parentExperience?.theme?.identity||game.slug||"").slice(0,80);

  return {
    version:"0.9875",
    game:{id:game.id,slug:game.slug,name:game.nome||game.name},
    parent:parentGame?{id:parentGame.id,slug:parentGame.slug,name:parentGame.nome||parentGame.name}:null,
    userTheme:userThemeState,
    experience,
    era,
    parentExperience:parentExperience?{key:parentExperience.key,label:parentExperience.label,theme:parentExperience.theme,font:parentExperience.font,components:parentExperience.components,motion:parentExperience.motion,defaultEraKey:parentExperience.defaultEraKey}:null,
    parentEra,
    resolved:{identity,theme,font,components,motion,media,music},
    available:{experiences:listExperiences(game.id).map(x=>({key:x.key,label:x.label,defaultEraKey:x.defaultEraKey||""})),eras:experience?listEraProfiles(game.id,experience.key):[],parentExperiences:parentGame?listExperiences(parentGame.id).map(x=>({key:x.key,label:x.label,defaultEraKey:x.defaultEraKey||""})):[]},
    inspector:{
      layers:["GAME_INDEX_BASE","USER_THEME",...(parentGame?["PARENT_ECOSYSTEM"]:[]),"GAME_IDENTITY","EXPERIENCE_PROFILE",...(era?["ERA_PROFILE"]:[]),"MEDIA_OVERRIDES","MUSIC_CONTEXT"],
      identitySource:era?.theme?.identity?"ERA_PROFILE":experience?.theme?.identity?"EXPERIENCE_PROFILE":parentEra?.theme?.identity?"PARENT_ERA":"GAME_IDENTITY",
      mediaSources:Object.fromEntries(Object.entries(media).map(([k,v])=>[k,v?.source||"GAME_INDEX_DEFAULT"])),
      musicSource:music?.source||"NONE",
      componentProfile:components
    }
  };
}
