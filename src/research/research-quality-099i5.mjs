import {tabDefinition} from "../games/templates.mjs";
import { createHash, randomUUID } from "node:crypto";
import { db, nowIso } from "../database/connection.mjs";

export const I5_CONTENT_CLASSES=Object.freeze([
  "GAME_FACT","GAME_MECHANIC","CHARACTER_FACT","LOCATION_FACT","ITEM_FACT","UPDATE_FACT","GUIDE_INFORMATION",
  "SOURCE_METADATA","LEGAL_NOTICE","COPYRIGHT","NAVIGATION","FOOTER","HEADER","ADVERTISEMENT","BOILERPLATE","COOKIE_NOTICE","SITE_DESCRIPTION"
]);

const REJECT_CLASSES=new Set(["SOURCE_METADATA","LEGAL_NOTICE","COPYRIGHT","NAVIGATION","FOOTER","HEADER","ADVERTISEMENT","BOILERPLATE","COOKIE_NOTICE","SITE_DESCRIPTION"]);
const BOILERPLATE_PATTERNS=[
  /\b(unofficial|fan[- ]made)\s+(wiki|site|community)\b/i,
  /\bnot\s+(affiliated|associated)\s+with\b/i,
  /\bnot\s+(endorsed|sponsored)\s+by\b/i,
  /\ball\s+trademarks?\s+(and\s+copyrights?\s+)?(are|belong)\b/i,
  /\bprivacy\s+policy\b/i,/\bcookie\s+(policy|settings|consent)\b/i,/\bterms\s+of\s+(use|service)\b/i,
  /\ball\s+rights\s+reserved\b/i,/©\s*\d{4}/i,/\bcontact\s+us\b/i,/\badvertis(e|ement|ing)\b/i,
  /\bsign\s+(in|up)\b.*\b(create|account|wiki)\b/i,/\bskip\s+to\s+content\b/i
];
const NAV_PATTERNS=[/^(home|menu|navigation|search|login|register|games|community|wiki|about)$/i,/\bprevious\s+page\b|\bnext\s+page\b/i];
const TOPIC_TERMS={
  WEAPONS:['weapon','weapons','rifle','rifles','pistol','damage','ammo','armas'],
  MAPS:['map','maps','location','locations','area','region','mapa'],
  SKINS:['skin','skins','cosmetic','collection','rarity','cosmeticos'],
  RANKS:['rank','ranks','ranking','competitive','rating','tier','patente'],
  GUIDES:['guide','guides','strategy','tips','progression','tutorial','guia'],
  ITEMS:['item','items','fruit','weapon','inventory','equipment','itens'],
  MOBS:['mob','mobs','creature','enemy','boss','monsters'],
  OVERVIEW:["game","experience","released","developer","developed","history","overview","roblox","play","players","world"],
  TECHNICAL:["platform","release","developer","engine","id","universe","place","server","device","version","interface","system"],
  GAMEPLAY:["gameplay","mechanics","progression","mechanic","combat","ability","abilities","quest","level","movement","fight","boss","progress","skill","system"],
  UPDATES:["update","patch","version","change","added","removed","rework","release","event","season"],
  COLLECTIONS:["item","items","fruit","weapon","collection","collect","rarity","chance","drop","inventory","equipment","probability"]
};

function clean(value,max=1600){return String(value??"").replace(/<[^>]*>/g," ").replace(/[\u0000-\u001f\u007f]/g," ").replace(/\s+/g," ").trim().slice(0,max);}
function norm(value){return clean(value,3000).normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase();}
function words(value){return new Set(norm(value).split(/[^a-z0-9]+/).filter(x=>x.length>=3));}
function clamp(n){return Math.max(0,Math.min(100,Math.round(Number(n||0)*10)/10));}
function hash(value){return createHash("sha256").update(String(value||"")).digest("hex");}
function table(){try{return Boolean(db.prepare(`SELECT 1 FROM sqlite_master WHERE type='table' AND name='research_fact_quality'`).get());}catch{return false;}}

export function classifyResearchText(text,{topic="",gameName="",sourceTitle=""}={}){
  const raw=clean(text),n=norm(raw),topicKey=String(topic||"OVERVIEW").toUpperCase();
  if(!raw)return {contentClass:"BOILERPLATE",accepted:false,rejectionReason:"EMPTY_TEXT"};
  if(BOILERPLATE_PATTERNS.some(r=>r.test(raw)))return {contentClass:/trademark|copyright|©|rights reserved/i.test(raw)?"COPYRIGHT":/privacy|cookie|terms of/i.test(raw)?"LEGAL_NOTICE":"BOILERPLATE",accepted:false,rejectionReason:"SOURCE_BOILERPLATE"};
  if(NAV_PATTERNS.some(r=>r.test(raw)))return {contentClass:"NAVIGATION",accepted:false,rejectionReason:"SOURCE_NAVIGATION"};
  if(raw.length<24)return {contentClass:"BOILERPLATE",accepted:false,rejectionReason:"TOO_SHORT_TO_BE_FACT"};

  const tokenSet=words(raw),entityTokens=[...words(gameName)].filter(x=>x.length>=3),topicTerms=TOPIC_TERMS[topicKey]||[...words(topicKey+' '+tabDefinition(topicKey.toLowerCase()).description)];
  const topicHits=topicTerms.filter(t=>tokenSet.has(t)).length;
  const entityHits=entityTokens.filter(t=>tokenSet.has(t)).length;
  let contentClass="GAME_FACT";
  if(topicKey==="GAMEPLAY")contentClass="GAME_MECHANIC";
  else if(topicKey==="UPDATES")contentClass="UPDATE_FACT";
  else if(topicKey==="COLLECTIONS")contentClass="ITEM_FACT";
  else if(/character|npc|boss|protagonist|villain/i.test(n))contentClass="CHARACTER_FACT";
  else if(/island|location|map|world|biome|place/i.test(n))contentClass="LOCATION_FACT";

  const sourceWords=words(sourceTitle),sourceOnly=[...tokenSet].filter(x=>sourceWords.has(x)).length;
  const topicMatch=clamp(32+topicHits*14+(topicKey==="OVERVIEW"?12:0));
  const entityMatch=clamp(entityHits?72+entityHits*10:(/roblox/i.test(gameName)&&/roblox/i.test(raw)?72:38));
  const usefulness=clamp(Math.min(95,40+Math.min(35,raw.length/18)+topicHits*7-sourceOnly*1.5));
  const accepted=topicMatch>=45&&usefulness>=55&&(entityMatch>=45||topicHits>=2);
  return {contentClass,accepted,rejectionReason:accepted?"":"LOW_TOPIC_OR_ENTITY_RELEVANCE",topicMatch,entityMatch,usefulness};
}

export function scoreResearchClaim(claim,{topic="",gameName="",sourceTitle="",sourceQuality=0,relevance=0}={}){
  const classification=classifyResearchText(claim,{topic,gameName,sourceTitle}),sourceConfidence=clamp(Number(sourceQuality||0)*100),providedRelevance=clamp(Number(relevance||0)*100),topicMatch=classification.topicMatch??0,entityMatch=classification.entityMatch??0,usefulness=classification.usefulness??0;
  const relevanceScore=clamp(providedRelevance*.28+sourceConfidence*.18+topicMatch*.22+entityMatch*.14+usefulness*.18);
  const accepted=classification.accepted&&relevanceScore>=52&&!REJECT_CLASSES.has(classification.contentClass);
  return {...classification,sourceConfidence,providedRelevance,relevanceScore,accepted,rejectionReason:accepted?"":classification.rejectionReason||"QUALITY_SCORE_BELOW_THRESHOLD"};
}

export function persistResearchQuality({entityGameId,buildId=null,revisionId=null,topic="",claim="",sourceId=null,evidenceId=null,sourceTitle="",sourceQuality=0,relevance=0,gameName=""}={}){
  const score=scoreResearchClaim(claim,{topic,gameName,sourceTitle,sourceQuality,relevance});if(!table())return score;const now=nowIso(),claimText=clean(claim),claimHash=hash(claimText),existing=db.prepare(`SELECT id,created_at FROM research_fact_quality WHERE entity_game_id=? AND build_id IS ? AND topic_key=? AND claim_hash=?`).get(entityGameId,buildId||null,String(topic).toUpperCase(),claimHash);
  db.prepare(`INSERT INTO research_fact_quality(id,entity_game_id,build_id,revision_id,topic_key,claim_hash,claim_text,content_class,relevance_score,source_confidence,topic_match_score,entity_match_score,usefulness_score,accepted,rejection_reason,source_id,evidence_id,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(entity_game_id,build_id,topic_key,claim_hash) DO UPDATE SET revision_id=excluded.revision_id,content_class=excluded.content_class,relevance_score=excluded.relevance_score,source_confidence=excluded.source_confidence,topic_match_score=excluded.topic_match_score,entity_match_score=excluded.entity_match_score,usefulness_score=excluded.usefulness_score,accepted=excluded.accepted,rejection_reason=excluded.rejection_reason,source_id=COALESCE(excluded.source_id,research_fact_quality.source_id),evidence_id=COALESCE(excluded.evidence_id,research_fact_quality.evidence_id),updated_at=excluded.updated_at`).run(existing?.id||`rfq-${randomUUID()}`,entityGameId,buildId||null,revisionId||null,String(topic).toUpperCase(),claimHash,claimText,score.contentClass,score.relevanceScore,score.sourceConfidence,score.topicMatch||0,score.entityMatch||0,score.usefulness||0,score.accepted?1:0,score.rejectionReason||"",sourceId||null,evidenceId||null,existing?.created_at||now,now);
  return score;
}

export function researchQualitySummary(entityGameId,{buildId=null,revisionId=null}={}){
  if(!table())return {usefulFacts:0,rejected:0,boilerplateRejected:0,duplicatesMerged:0,topicsSupported:0,classes:{}};const where=["entity_game_id=?"],args=[entityGameId];if(buildId){where.push("build_id=?");args.push(buildId);}if(revisionId){where.push("revision_id=?");args.push(revisionId);}const rows=db.prepare(`SELECT * FROM research_fact_quality WHERE ${where.join(" AND ")}`).all(...args),accepted=rows.filter(r=>r.accepted),classes={};for(const r of rows)classes[r.content_class]=(classes[r.content_class]||0)+1;return {usefulFacts:accepted.length,rejected:rows.length-accepted.length,boilerplateRejected:rows.filter(r=>!r.accepted&&["BOILERPLATE","LEGAL_NOTICE","COPYRIGHT","NAVIGATION","FOOTER","HEADER","ADVERTISEMENT","COOKIE_NOTICE","SOURCE_METADATA","SITE_DESCRIPTION"].includes(r.content_class)).length,duplicatesMerged:0,topicsSupported:new Set(accepted.map(r=>r.topic_key)).size,classes};
}

export function filterAcceptedEvidence(game,descriptor,evidenceEntries=[]){const seen=new Set(),accepted=[],rejected=[];for(const ev of evidenceEntries){const claim=clean(ev.claim),fingerprint=norm(claim).replace(/[^a-z0-9]+/g," ").slice(0,420);if(seen.has(fingerprint)){rejected.push({ev,score:{accepted:false,contentClass:"BOILERPLATE",rejectionReason:"DUPLICATE_CLAIM"}});continue;}seen.add(fingerprint);const score=scoreResearchClaim(claim,{topic:descriptor.topic,gameName:game.nome,sourceTitle:ev.sourceDocument?.title||"",sourceQuality:ev.sourceQuality,relevance:ev.relevance});(score.accepted?accepted:rejected).push({ev,score});}return {accepted,rejected};}
