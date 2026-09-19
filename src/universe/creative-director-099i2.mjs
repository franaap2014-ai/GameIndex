import { getGameById, getGameBySlug, parentGameFor } from "../database/repositories/game-repository.mjs";
import { resolveIdentityProfile } from "../identity/experience-identity-service.mjs";
import { listUniverseStructure } from "./universe-structure-service.mjs";
import { interactionPresetsForEntity } from "../interactions/universe-interaction-service.mjs";
import { runDexterTask } from "../dexter/dexter-service.mjs";

function gameFrom(value){return typeof value==="object"&&value?.id?value:getGameById(String(value||""))||getGameBySlug(String(value||""));}
function clean(value,max=240){return String(value??"").replace(/<[^>]*>/g," ").replace(/[<>]/g,"").replace(/\s+/g," ").trim().slice(0,max);}
function deterministicSuggestions(game,identity,structure){
  const pages=(structure?.pages||[]).map(x=>x.canonicalKey),grounding=identity?.visualGrounding,motifs=(grounding?.motifs||identity?.motifs||[]).slice(0,8),presets=interactionPresetsForEntity(game.id).slice(0,6);
  const suggestions=[];
  if(motifs.length)suggestions.push({type:"VISUAL_CONTINUITY",title:"Repeat the motif family across major sections",reason:`Use ${motifs.slice(0,4).join(", ")} as recurring accents instead of concentrating identity in the hero.`,priority:"HIGH"});
  if(grounding?.density)suggestions.push({type:"VISUAL_DENSITY",title:`Keep authoring density at ${grounding.density}`,reason:"Preserve strong game recognition while runtime performance adaptation limits expensive motion, not core identity.",priority:"HIGH"});
  if(presets.length)suggestions.push({type:"INTERACTION",title:"Activate contextual motif interactions",reason:`${presets.length} safe declarative interaction preset(s) are available for this identity.`,priority:"HIGH"});
  if(pages.length>2)suggestions.push({type:"NAVIGATION",title:"Use universe motifs as secondary navigation",reason:`The universe currently exposes ${pages.length} structured pages; motif actions can jump to existing page keys without adding a new navigation system.`,priority:"MEDIUM"});
  suggestions.push({type:"PERFORMANCE",title:"Keep non-essential effects lazy",reason:"Initialize galleries, sounds and heavy animation only when visible or explicitly invoked.",priority:"HIGH"});
  return suggestions;
}
function sanitizeAiSections(sections=[]){if(!Array.isArray(sections))return [];return sections.slice(0,8).map((row,index)=>{if(typeof row==="string")return {type:"AI_SUGGESTION",title:clean(row,120),reason:"Local Creative Director suggestion.",priority:"MEDIUM"};const x=row&&typeof row==="object"?row:{};return {type:clean(x.type||"AI_SUGGESTION",50).toUpperCase().replace(/[^A-Z0-9_-]/g,"_")||"AI_SUGGESTION",title:clean(x.title||x.name||`Suggestion ${index+1}`,120),reason:clean(x.reason||x.description||x.summary||"",300),priority:["LOW","MEDIUM","HIGH"].includes(String(x.priority||"").toUpperCase())?String(x.priority).toUpperCase():"MEDIUM"};}).filter(x=>x.title);}

export async function creativeDirectorReview(gameInput,{language="pt-BR",allowLocalAI=true}={}){
  const game=gameFrom(gameInput);if(!game)throw Object.assign(new Error("GAME_NOT_FOUND"),{code:"GAME_NOT_FOUND"});
  const parent=parentGameFor(game),identity=resolveIdentityProfile(game.id),structure=listUniverseStructure(game.id,{status:"PUBLISHED",language}),fallback=deterministicSuggestions(game,identity,structure);
  if(!allowLocalAI)return {mode:"DETERMINISTIC",apiKeyRequired:false,localAIInvoked:false,entity:{id:game.id,name:game.nome,entityType:game.entityType||"GAME"},suggestions:fallback};
  const input={entity:{name:game.nome,entityType:game.entityType||"GAME",parent:parent?.nome||null},identity:{themeKey:identity?.themeKey||"gameindex-default",visualDensity:identity?.visualDensity||"RICH",visualLanguage:identity?.visualGrounding?.visualLanguage||"",motifs:(identity?.visualGrounding?.motifs||identity?.motifs||[]).slice(0,12)},pages:(structure.pages||[]).map(p=>({key:p.canonicalKey,title:p.titleText||p.canonicalKey,sections:[...(p.sections||[]),...(p.tabs||[]).flatMap(t=>t.sections||[])].map(s=>s.canonicalKey)})).slice(0,12),safeInteractionPresets:interactionPresetsForEntity(game.id).map(p=>({elementKey:p.elementKey,eventType:p.eventType,actionType:p.actionType,targetType:p.targetType,targetId:p.targetId})).slice(0,12)};
  const result=await runDexterTask({taskType:"CONTENT_SYNTHESIS",gameId:game.id,input,system:"You are the optional local GameIndex Creative Director. Suggest presentation and interaction improvements only. Never produce HTML, JavaScript, CSS, executable code, fabricated facts, or external API requirements. Keep deterministic GameIndex engines authoritative.",prompt:`Review this GameIndex universe design. Return JSON with title, summary, sections. sections must be a short array of objects with type, title, reason, priority. Focus on visual continuity, contextual interaction, navigation and performance. Input JSON: ${JSON.stringify(input)}`});
  if(!result?.ok)return {mode:"DETERMINISTIC_FALLBACK",apiKeyRequired:false,localAIInvoked:true,localAIAvailable:false,reasonCode:result?.reasonCode||"LOCAL_AI_UNAVAILABLE",entity:{id:game.id,name:game.nome,entityType:game.entityType||"GAME"},suggestions:fallback};
  const ai=sanitizeAiSections(result.data?.sections||[]),suggestions=[...ai,...fallback.filter(f=>!ai.some(a=>a.type===f.type))].slice(0,10);
  return {mode:"LOCAL_AI_ADVISORY",apiKeyRequired:false,localAIInvoked:true,localAIAvailable:true,entity:{id:game.id,name:game.nome,entityType:game.entityType||"GAME"},title:clean(result.data?.title||"Creative Director",120),summary:clean(result.data?.summary||"",400),suggestions};
}
