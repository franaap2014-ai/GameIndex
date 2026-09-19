import { getGameById, getGameBySlug } from "../database/repositories/game-repository.mjs";
import { getEntityById, getEntityBySlug, listEntities } from "../database/repositories/entity-repository.mjs";
import { listKnowledge } from "../database/repositories/knowledge-repository.mjs";
import { listArticles } from "../database/repositories/article-repository.mjs";
import { upsertPage, replacePageValidations, getPageById } from "../database/repositories/page-repository.mjs";
import { runTripleSafety } from "../articles/triple-safety.mjs";
import { normalizePageType, pageTemplate } from "./page-templates.mjs";
import { slugify, normalizeText, overlapScore } from "../knowledge/normalize.mjs";
import { translateStoredText } from "../i18n/language-service.mjs";
import { isGenericFiller, classifyEntityType } from "../core85/deterministic-intelligence.mjs";

const BAD=new Set(["REJECTED","OUTDATED","SUPERSEDED"]);
function resolveGame(gameInput){return typeof gameInput==="string"?(getGameBySlug(gameInput)||getGameById(gameInput)):gameInput;}
function resolveEntity(game,entityInput){if(!entityInput)return null;return typeof entityInput==="string"?(getEntityById(entityInput)||getEntityBySlug(game.id,slugify(entityInput))):entityInput;}
function usefulKnowledgeItem(k){const texts=[k.summary,...(k.claims||[]).map(c=>c.text)].filter(Boolean);return texts.some(text=>!isGenericFiller(text)&&String(text).trim().length>28);}
function relevantKnowledge(gameId,entityId){const all=listKnowledge({gameId,limit:1500}).entries.filter(k=>!BAD.has(k.status)&&usefulKnowledgeItem(k));if(!entityId)return all.slice(0,120);const direct=all.filter(k=>k.entityId===entityId);return (direct.length?direct:[]).slice(0,120);}
function unique(values=[]){return [...new Set(values.filter(Boolean))];}
function clean(value,max=520){const text=String(value||"").replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim();if(!text||isGenericFiller(text))return "";if(text.length<=max)return text;return `${text.slice(0,max).trim()}…`;}
function yearOf(game){return String(game.releaseDate||game.lancamento||"").match(/\b(19|20)\d{2}\b/)?.[0]||"";}
function listText(values=[]){return values.map(x=>String(x||"").trim()).filter(Boolean).slice(0,4).join(" · ");}
function metadataSummary(game){const genres=listText(game.genres||game.generos||[]),platforms=listText(game.platforms||game.plataformas||[]),developer=String(game.developer||game.desenvolvedor||"").trim(),year=yearOf(game);let text=`${game.nome} é um jogo`;if(genres)text+=` de ${genres}`;if(developer)text+=` desenvolvido por ${developer}`;if(year)text+=` e lançado em ${year}`;text+=".";if(platforms)text+=` Está registrado no GameIndex para ${platforms}.`;return text;}
function sectionKeywords(heading=""){const h=normalizeText(heading);const groups=[
  [/craft|receita|fabric|material|recipe/, ["craft","receita","recipe","material","fabric","stick","diamante","diamond"]],
  [/obter|obtain|unlock|desbloq|requisit|require/, ["obter","obtain","unlock","desbloq","require","requisit"]],
  [/local|where|onde|spawn|encontr|find/, ["onde","where","spawn","local","find","encontr"]],
  [/drop|loot|recompensa|reward/, ["drop","loot","recompensa","reward"]],
  [/durab|estat|stats|damage|dano|capabil|minerar|mining/, ["durab","stats","damage","dano","minerar","mining","block","bloco"]],
  [/encant|enchant/, ["enchant","encant","fortune","silk touch","mending","unbreaking","efficiency"]],
  [/progress|progress[aã]o|upgrade/, ["progress","upgrade","iron","diamond","netherite"]],
  [/dica|tip|pr[aá]tic|strategy|estrat/, ["dica","tip","strategy","estrat","pratic","use","usar"]],
  [/vis[aã]o|overview|what is|o que/, []]
];for(const [re,keys] of groups)if(re.test(h))return keys;return h.split(" ").filter(x=>x.length>3);}
function sectionPointScore(heading,k){const choices=[k.title,k.summary,...(k.claims||[]).map(c=>c.text)].filter(Boolean).filter(x=>!isGenericFiller(x));const hay=normalizeText(choices.join(" "));if(!hay)return -1;const keys=sectionKeywords(heading);let score=overlapScore(heading,hay)*.45+Number(k.confidence||0)*.15;for(const key of keys)if(hay.includes(normalizeText(key)))score+=.18;const h=normalizeText(heading);if(/overview|visao geral|resumen/.test(h))score+=.28;if(choices.some(x=>String(x).length>70))score+=.05;return score;}
function buildSections(headings,knowledge,language){
  const used=new Set();
  return headings.filter(h=>!/fontes|sources|fuentes/i.test(h)).map((heading,index)=>{
    const ranked=knowledge.filter(k=>!used.has(k.id)).map(k=>({k,score:sectionPointScore(heading,k)})).sort((a,b)=>b.score-a.score);
    const threshold=index===0?.12:.22,points=[];
    for(const row of ranked){if(row.score<threshold)continue;const k=row.k,choices=[k.summary,...(k.claims||[]).map(c=>c.text)].filter(x=>x&&!isGenericFiller(x));const text=String(choices.sort((a,b)=>String(b).length-String(a).length)[0]||"").trim();if(!text)continue;used.add(k.id);points.push({knowledgeId:k.id,title:k.title,text:translateStoredText(text,language),canonStatus:k.canonStatus,status:k.status,confidence:k.confidence,relevance:row.score});if(points.length>=4)break;}
    return {id:slugify(heading),heading,paragraphs:points.map(p=>p.text),points};
  }).filter(section=>section.points.length);
}
function basicGameSections(game,language){
  const description=clean(game.description||game.descricao,520),summary=translateStoredText(description||metadataSummary(game),language);
  const franchise=String(game.franchise||game.franquia||"").trim(),developer=String(game.developer||game.desenvolvedor||"").trim(),year=yearOf(game);
  const contextBits=[];
  if(franchise)contextBits.push(`${game.nome} faz parte da franquia ${franchise}.`);
  else contextBits.push(`${game.nome} possui uma página básica criada a partir dos dados locais já registrados no GameIndex.`);
  if(developer||year)contextBits.push(`O registro atual confirma ${developer?`desenvolvimento por ${developer}`:""}${developer&&year?" e ":""}${year?`lançamento em ${year}`:""}.`);
  contextBits.push("Detalhes narrativos mais específicos só são adicionados quando já existem em conhecimento verificado.");
  const characters=listEntities({gameId:game.id,limit:300}).filter(e=>["CHARACTER","NPC","VILLAIN","ALLY"].includes(String(e.type||"").toUpperCase())).slice(0,10);
  const characterParagraphs=characters.map(e=>`${e.name} — ${clean(e.summary,220)||`personagem registrado no GameIndex para ${game.nome}.`}`);
  return [
    {id:"visao-geral",heading:"Visão geral",paragraphs:[summary],points:[]},
    {id:"contextualizacao",heading:"Contextualização",paragraphs:[translateStoredText(contextBits.join(" "),language)],points:[]},
    {id:"personagens-principais",heading:"Personagens principais",paragraphs:characterParagraphs.length?characterParagraphs:[`O GameIndex ainda não possui personagens verificados suficientes para listar nesta página básica.`],points:[]},
  ];
}
function enrichGameSections(game,sections,language){
  if(sections.some(s=>/contextualiza|context/i.test(s.heading))&&sections.some(s=>/personagens|characters/i.test(s.heading)))return sections;
  const basic=basicGameSections(game,language),out=[...sections];
  if(!out.some(s=>/contextualiza|context/i.test(s.heading)))out.splice(Math.min(1,out.length),0,basic[1]);
  if(!out.some(s=>/personagens|characters/i.test(s.heading)))out.push(basic[2]);
  return out;
}

export function buildPageFromKnowledge({game:gameInput,entity:entityInput=null,language="pt-BR",pageType=null,status=null}={}){
  const game=resolveGame(gameInput);if(!game)throw new Error("Jogo não encontrado para geração da página.");
  const entity=resolveEntity(game,entityInput);if(entityInput&&!entity)throw new Error("Entidade não encontrada para geração da página.");
  const intel=classifyEntityType({entity,subject:entity?.name||game.nome,question:`${entity?.name||game.nome} guide`});
  const type=normalizePageType(pageType||intel.type||entity?.type||"GAME");
  const knowledge=relevantKnowledge(game.id,entity?.id||null),basicMode=!knowledge.length&&type==="GAME"&&!entity;
  if(!knowledge.length&&!basicMode)throw new Error("GENERIC_OR_INSUFFICIENT_KNOWLEDGE");
  const headings=pageTemplate(type,language);
  let sections=basicMode?basicGameSections(game,language):buildSections(headings,knowledge,language);
  if(!sections.length)throw new Error("GENERIC_FILLER_DETECTED");
  if(type==="GAME"&&!entity)sections=enrichGameSections(game,sections,language);
  const safety=runTripleSafety({game,entity,knowledge});
  const sourceIds=unique(knowledge.flatMap(k=>(k.claims||[]).flatMap(c=>c.sourceIds||[])));
  const articles=listArticles({gameId:game.id,entityId:entity?.id||null,limit:12}).entries;
  const title=entity?.name||game.nome;
  const rawSummary=[entity?.summary,knowledge[0]?.summary,game.descricao].find(x=>x&&!isGenericFiller(x))||metadataSummary(game);
  const summary=translateStoredText(clean(rawSummary,520)||metadataSummary(game),language);
  const languageLeak=language==="pt-BR"&&sections.some(section=>section.paragraphs.some(text=>/\b(the|this|with|from|where|which|can|requires|found)\b/i.test(text)&&!/\b(o|a|de|do|da|como|onde|que|para|com)\b/i.test(text)));
  const pageStatus=status||(basicMode?"NEEDS_REVIEW":languageLeak?"NEEDS_REVIEW":safety.status==="APPROVED"?"READY":safety.status==="NEEDS_RESEARCH"||safety.status==="REJECTED"?"NEEDS_RESEARCH":"NEEDS_REVIEW");
  const page=upsertPage({
    gameId:game.id,entityId:entity?.id||null,pageType:type,slug:slugify(title),title,subtitle:`${game.nome} · ${type}`,summary,
    content:{sections,relatedEntities:unique(knowledge.flatMap(k=>(k.relationships||[]).map(r=>r.target).filter(Boolean))).slice(0,12),generatedBy:"GameIndex Beta 0.99 · GI Core Scripts",recipeContract:basicMode?"BASIC_LOCAL_OVERVIEW_WITH_CONTEXT_AND_CHARACTERS":"DETAILED_TYPE_SPECIFIC",localeValidation:{language,languageLeak,approved:!languageLeak},basicMode},
    knowledgeIds:knowledge.map(k=>k.id),articleIds:articles.map(a=>a.id),sourceIds,
    imageRequests:[{gameId:game.id,entityId:entity?.id||null,role:type==="GAME"?"COVER":type,mediaContext:["IN_GAME","OFFICIAL_ARTWORK","GAME_SCREENSHOT"]}],
    versionContext:{gameVersion:knowledge.find(k=>k.gameVersion)?.gameVersion||"",generatedAt:new Date().toISOString(),aiVersion:"DEXTER_OPTIONAL",packetVersion:"0.99",orchestration:basicMode?"LOCAL_BASIC_PRESENTATION":"GI_CORE_GENERATION_STATE_MACHINE_TO_IMAGE3"},
    generationVersion:"0.99",status:pageStatus,confidence:basicMode?Math.max(.2,safety.overallConfidence):safety.overallConfidence,language,...safety,verifiedAt:pageStatus==="READY"?new Date().toISOString():"",
  });
  replacePageValidations(page.id,safety.checks);
  return {...getPageById(page.id),safety,game:{id:game.id,slug:game.slug,name:game.nome},entity,basicMode};
}
