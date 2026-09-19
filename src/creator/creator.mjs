import { findGameByNameOrAlias, getGameBySlug } from "../database/repositories/game-repository.mjs";
import { getKnowledgeById, listKnowledge, searchKnowledge } from "../database/repositories/knowledge-repository.mjs";
import { findBestEntity } from "../database/repositories/entity-repository.mjs";
import { saveCreatorOutput } from "../database/repositories/creator-repository.mjs";
import { researchGameVault } from "../research/orchestrator.mjs";
import { persistResearchKnowledge } from "../knowledge/knowledge-service.mjs";
import { normalizeText } from "../knowledge/normalize.mjs";
import { classifyEntityType, intentKeywords, isGenericFiller, resolveIntent, typeCompatibility } from "../core85/deterministic-intelligence.mjs";
import { planContent, normalizeContentType } from "./planner.mjs";
import { factCheckGeneratedContent } from "./fact-checker.mjs";
import { createGuide } from "./formats/guide.mjs";
import { createArticle } from "./formats/article.mjs";
import { createList } from "./formats/list.mjs";
import { createComparison } from "./formats/comparison.mjs";
import { createLoreSummary } from "./formats/lore-summary.mjs";
import { createTips } from "./formats/tips.mjs";
import { createVideoScript } from "./formats/video-script.mjs";

const generators={GUIDE:createGuide,ARTICLE:createArticle,LIST:createList,COMPARISON:createComparison,LORE_SUMMARY:createLoreSummary,TIPS:createTips,VIDEO_SCRIPT:createVideoScript};
const PUBLIC_STATUSES=new Set(["CURRENT","VALIDATED"]);
function resolveGame(game){const target=getGameBySlug(String(game||""))||findGameByNameOrAlias(String(game||""));return target?.status==="PUBLISHED"?target:null;}
function hydrate(entry){const full=entry?.id?getKnowledgeById(entry.id,{includeClaims:true,includeRelationships:true})||entry:entry;if(!full)return full;const claims=(full.claims||[]).filter(c=>c?.text&&!isGenericFiller(c.text));const summary=!isGenericFiller(full.summary||"")?full.summary:(claims[0]?.text||"");return {...full,summary,claims};}
function safeText(entry){return [entry?.title,entry?.summary,...(entry?.claims||[]).map(c=>c.text)].filter(Boolean).join(" ");}
function allowed(entry){return entry&&PUBLIC_STATUSES.has(entry.status)&&Number(entry.confidence||0)>=.58&&[entry.summary,...(entry.claims||[]).map(c=>c.text)].filter(Boolean).some(t=>!isGenericFiller(t)&&String(t).trim().length>18);}
function semanticEntity(target,topic){const best=findBestEntity(target.id,topic,.28);const entity=best?.entity||null;const intel=classifyEntityType({entity,subject:entity?.name||topic,question:topic});return {entity,type:intel.type,confidence:entity?Math.max(.55,intel.confidence):.3};}
function typeLegacyIntent(type){return type==="LORE_SUMMARY"?"LORE":type==="COMPARISON"?"COMPARISON":type==="GUIDE"?"HOW_TO_USE":"OVERVIEW";}
function retrieve(target,topic,type){const intel=semanticEntity(target,topic),entity=intel.entity,intent=resolveIntent(topic,typeLegacyIntent(type));const search=searchKnowledge(topic,{gameId:target.id,limit:40}).map(hydrate);const same=entity?listKnowledge({gameId:target.id,entityId:entity.id,limit:500}).entries.map(hydrate):[];const seen=new Set(),pool=[...same,...search].filter(x=>x?.id&&!seen.has(x.id)&&seen.add(x.id)).filter(allowed);const keys=intentKeywords(intent.intent).map(normalizeText);const ranked=pool.map(entry=>{const hay=normalizeText(safeText(entry));let score=Number(entry.confidence||0)*.32+(entry.entityId===entity?.id?.toString()?0:.0);if(entity&&entry.entityId===entity.id)score+=.55;const q=normalizeText(topic);if(q&&hay.includes(q))score+=.42;score+=Math.min(.24,keys.filter(k=>hay.includes(k)).length*.06);return {...entry,creatorScore:score};}).sort((a,b)=>b.creatorScore-a.creatorScore);return {intent,intel,primary:ranked.slice(0,12),related:ranked.slice(12,16),knowledge:ranked.slice(0,16)};}
function sufficient(bundle,type){if(!bundle.knowledge.length)return false;if(typeCompatibility(bundle.intel.type,bundle.intent.intent)<.5)return false;if(type==="GUIDE")return bundle.knowledge.length>=2||bundle.knowledge.some(k=>(k.claims||[]).length>=2);return true;}
async function researchMissing(target,topic,bundle,language){const research=await researchGameVault({game:target,query:`${topic} ${target.nome}`,entity:bundle.intel.entity,intent:bundle.intent.intent,language});return persistResearchKnowledge({understanding:{question:topic,game:target,entity:bundle.intel.entity,intent:bundle.intent.intent,subject:bundle.intel.entity?.name||topic},research});}
export async function generateGameVaultContent({game,topic="",contentType="GUIDE",depth="STANDARD",language="pt-BR",userId=null,save=false}={}){
  const target=resolveGame(game);if(!target)throw new Error("GameIndex could not identify the requested game.");const type=normalizeContentType(contentType);const subject=topic||target.nome;let bundle=retrieve(target,subject,type);
  if(!sufficient(bundle,type)&&topic){try{await researchMissing(target,topic,bundle,language);bundle=retrieve(target,subject,type);}catch{}}
  if(!bundle.knowledge.length)throw new Error(language.toLowerCase().startsWith("pt")?"A GameIndex ainda não tem conhecimento específico e confiável suficiente para criar este conteúdo.":"GameIndex does not yet have enough specific reliable knowledge to create this content.");
  if(type==="GUIDE"&&!sufficient(bundle,type))throw new Error(language.toLowerCase().startsWith("pt")?"Ainda não há informações verificadas suficientes para montar um guia útil sobre esse tema.":"There is not enough verified information to build a useful guide yet.");
  const plan=planContent({contentType:type,game:target,topic:subject,depth,knowledge:bundle.knowledge,language,entity:bundle.intel.entity,entityType:bundle.intel.type,intent:bundle.intent.intent,primaryKnowledge:bundle.primary,relatedKnowledge:bundle.related});const content=generators[type](plan);const check=factCheckGeneratedContent({sections:[...(content.sections||[]),...(content.items||[])],knowledge:plan.knowledge});if(!check.passed)throw new Error("Creator fact-check failed. The content was not saved.");
  const result={game:{id:target.id,slug:target.slug,name:target.nome},contentType:type,topic:plan.topic,depth:plan.depth,content,knowledgeIds:check.knowledgeIds,sourceIds:check.sourceIds,factCheck:{passed:true,knowledgeCount:check.knowledgeIds.length,sourceCount:check.sourceIds.length,sourceLinked:check.sourceIds.length>0,semanticEntity:bundle.intel.entity?{id:bundle.intel.entity.id,name:bundle.intel.entity.name,type:bundle.intel.type}:null,intent:bundle.intent.intent,genericFillerBlocked:true,engine:"GI_CORE_SCRIPT_CREATOR"}};
  if(save){if(!userId)throw new Error("Sign in to save Creator content.");result.saved=saveCreatorOutput({userId,gameId:target.id,contentType:type,topic:plan.topic,title:content.title,content,knowledgeIds:check.knowledgeIds,sourceIds:check.sourceIds});}
  return result;
}
