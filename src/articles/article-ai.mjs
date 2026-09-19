import { getGameById, getGameBySlug } from "../database/repositories/game-repository.mjs";
import { getEntityById, getEntityBySlug } from "../database/repositories/entity-repository.mjs";
import { listKnowledge } from "../database/repositories/knowledge-repository.mjs";
import { articleTemplate, normalizeArticleType } from "./article-templates.mjs";
import { runTripleSafety } from "./triple-safety.mjs";
import { getArticleById, replaceArticleValidations, upsertArticle } from "../database/repositories/article-repository.mjs";
import { slugify } from "../knowledge/normalize.mjs";
import { fillerAudit, classifyEntityType } from "../core85/deterministic-intelligence.mjs";
import { recordEntityConsistency } from "../entities/canonical-entity-service.mjs";

const bad=new Set(["REJECTED","OUTDATED","SUPERSEDED"]);
function useful(k){return k&&!bad.has(k.status)&&String(k.summary||"").trim()&&!fillerAudit([k.summary]).detected;}
function chooseKnowledge(gameId,entityId=null,limit=80){
  const all=listKnowledge({gameId,limit:1500}).entries.filter(useful);
  // Beta 0.87: an entity article MUST NOT silently fall back to unrelated game-wide knowledge.
  const selected=entityId?all.filter(k=>k.entityId===entityId):all.filter(k=>!k.entityId||k.tabId==="overview");
  return selected.sort((a,b)=>Number(b.confidence)-Number(a.confidence)).slice(0,limit);
}
function buildSections(template,knowledge){
  const groups=new Map();for(const k of knowledge){const key=k.tabId||"overview";if(!groups.has(key))groups.set(key,[]);groups.get(key).push(k);}
  const all=[...knowledge],used=new Set();return template.map((heading,index)=>{let candidates=[];const lower=heading.toLowerCase();for(const [key,rows] of groups){if(lower.includes(key)||key.includes(lower.split(" ")[0]))candidates.push(...rows);}if(!candidates.length)candidates=all.filter(k=>!used.has(k.id)).slice(0,5);const seen=new Set();const points=candidates.filter(k=>{const x=k.summary?.trim();if(!x||seen.has(x)||fillerAudit([x]).detected)return false;seen.add(x);used.add(k.id);return true;}).slice(0,5).map(k=>({knowledgeId:k.id,title:k.title,text:k.summary,canonStatus:k.canonStatus,status:k.status,confidence:k.confidence}));return {heading,paragraphs:points.map(p=>p.text),points};}).filter(s=>s.points.length);
}
export function generateArticle({game:gameInput,entity:entityInput=null,language="pt-BR",title=null,articleType=null,createdBy="GI_CORE_SCRIPT_ARTICLE"}={}){
  const game=typeof gameInput==="string"?(getGameBySlug(gameInput)||getGameById(gameInput)):gameInput;if(!game)throw new Error("Jogo não encontrado para geração do artigo.");
  let entity=null;if(entityInput)entity=typeof entityInput==="string"?(getEntityById(entityInput)||getEntityBySlug(game.id,slugify(entityInput))):entityInput;
  const canonicalType=entity?classifyEntityType({entity,subject:entity.name,question:`${entity.name} article`}):(entity?.type||"game");const type=normalizeArticleType(articleType||canonicalType);const knowledge=chooseKnowledge(game.id,entity?.id||null,90);
  if(entity&&knowledge.length<2)throw new Error("INSUFFICIENT_ENTITY_KNOWLEDGE");if(!knowledge.length)throw new Error("Não há conhecimento suficiente para criar este artigo.");
  if(entity){try{recordEntityConsistency({entityId:entity.id,gameId:game.id,canonicalType:String(canonicalType).toUpperCase(),subsystem:"GI_CORE_SCRIPT_ARTICLE",observedType:String(type).toUpperCase(),details:{knowledgeCount:knowledge.length}});}catch{}}
  const template=articleTemplate(type),sections=buildSections(template,knowledge);if(entity&&sections.length<2)throw new Error("INSUFFICIENT_ENTITY_SPECIFIC_CONTENT");
  const articleTitle=title||`${entity?.name||game.nome} — GameIndex Article`;
  const content={summary:entity?.summary||game.descricao||knowledge[0]?.summary||"",sections,relatedKnowledge:knowledge.slice(0,12).map(k=>({id:k.id,title:k.title,summary:k.summary,status:k.status,confidence:k.confidence})),generatedFrom:"GameIndex canonical structured knowledge",language,entityType:String(canonicalType).toUpperCase()};
  const safety=runTripleSafety({game,entity,knowledge});
  const claimIds=[...new Set(knowledge.flatMap(k=>(k.claims||[]).map(c=>c.id)).filter(Boolean))],sourceIds=[...new Set(knowledge.flatMap(k=>(k.claims||[]).flatMap(c=>c.sourceIds||[])))],evidenceIds=[...new Set(knowledge.flatMap(k=>(k.claims||[]).flatMap(c=>c.evidenceIds||[])))];
  const requestedStatus=safety.status==="APPROVED"?"APPROVED":safety.status;
  const article=upsertArticle({gameId:game.id,entityId:entity?.id||null,title:articleTitle,slug:slugify(entity?.name||title||game.nome),articleType:String(type).toUpperCase(),status:requestedStatus,language,content,knowledgeIds:knowledge.map(k=>k.id),claimIds,sourceIds,evidenceIds,gameVersion:knowledge.find(k=>k.gameVersion)?.gameVersion||"",...safety,createdBy,verifiedAt:safety.status==="APPROVED"?new Date().toISOString():""});
  replaceArticleValidations(article.id,safety.checks);return {...getArticleById(article.id),safety};
}
export function generateFeaturedArticlesForGame(game,{limit=6,language="pt-BR"}={}){const all=listKnowledge({gameId:game.id,limit:1000}).entries.filter(useful);const byEntity=new Map();for(const k of all){if(!k.entityId)continue;const arr=byEntity.get(k.entityId)||[];arr.push(k);byEntity.set(k.entityId,arr);}const ranked=[...byEntity.entries()].filter(([,rows])=>rows.length>=2).sort((a,b)=>b[1].length-a[1].length).slice(0,Math.max(0,limit-1));const out=[];try{out.push(generateArticle({game,language}));}catch{}for(const [entityId] of ranked){try{out.push(generateArticle({game,entity:entityId,language}));}catch{}}return out;}
