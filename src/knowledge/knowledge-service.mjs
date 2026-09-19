import { upsertEntity } from "../database/repositories/entity-repository.mjs";
import { upsertSource } from "../database/repositories/source-repository.mjs";
import { insertEvidence } from "../database/repositories/evidence-repository.mjs";
import { upsertKnowledge } from "../database/repositories/knowledge-repository.mjs";
import { normalizeText, overlapScore } from "./normalize.mjs";

function compact(text,max=360) {
  const clean=String(text||"").replace(/\s+/g," ").trim();
  return clean.length<=max?clean:`${clean.slice(0,max-1).trim()}…`;
}

function routeExists(game,tabId,sectionId) {
  const tab=game?.menu?.find(item=>item.id===tabId);
  if (!tab) return {tabId:"overview",sectionId:"summary"};
  if (!sectionId || tab.sections?.some(section=>section.id===sectionId)) return {tabId,sectionId:sectionId||tab.sections?.[0]?.id||"summary"};
  return {tabId,sectionId:tab.sections?.[0]?.id||"summary"};
}

function chooseEntity(understanding,research) {
  if (understanding.entity) return understanding.entity;
  const top=research.sources?.[0];
  if (!top || !understanding.game || !understanding.subject) return null;
  const subject=normalizeText(understanding.subject);
  const title=normalizeText(top.title);
  const score=Math.max(overlapScore(understanding.subject,top.title),overlapScore(understanding.question,top.title));
  const titleContainsSubject=subject.length>=4 && (title.includes(subject)||subject.includes(title));
  if (score<.58 || !titleContainsSubject) return null;
  return upsertEntity({gameId:understanding.game.id,name:top.title,type:"unknown",aliases:[understanding.subject].filter(Boolean),summary:compact(top.rawText,240)});
}

export function persistResearchKnowledge({understanding,research}) {
  if (!understanding.game || !research?.validation?.accepted?.length) return {knowledge:null,entity:understanding.entity||null,sourceIds:[],evidenceIds:[]};

  const sourceMap=new Map();
  for (const doc of research.sources || []) {
    const stored=upsertSource({sourceId:doc.sourceId,sourceType:doc.sourceType,title:doc.title,url:doc.url,adapterKey:doc.adapterKey,quality:doc.rankScore||doc.quality,retrievedAt:doc.retrievedAt,metadata:doc.metadata});
    sourceMap.set(doc.url,stored);
  }

  const entity=chooseEntity(understanding,research);
  const evidenceIds=[];
  for (const item of research.validation.accepted) {
    const source=sourceMap.get(item.sourceDocument?.url);
    if (!source) continue;
    const stored=insertEvidence({gameId:understanding.game.id,entityId:entity?.id||null,claim:item.claim,sourceId:source.id,relevance:item.relevance,sourceQuality:item.sourceQuality,extractedAt:item.extractedAt,metadata:item.metadata});
    evidenceIds.push(stored.id);
  }

  const accepted=research.validation.accepted.slice(0,5);
  const sourceIds=[...new Set(accepted.map(item=>sourceMap.get(item.sourceDocument?.url)?.id).filter(Boolean))];
  const summary=compact(accepted[0]?.claim||"",320);
  const route=routeExists(understanding.game,understanding.tabId,understanding.sectionId);
  const title=entity?.name || compact(understanding.subject || `${understanding.game.nome} — pesquisa`,120);
  const now=new Date().toISOString();

  const knowledge=upsertKnowledge({
    gameId:understanding.game.id,
    entityId:entity?.id||null,
    title,
    summary,
    canonStatus:research.validation.canonStatus,
    status:research.validation.status,
    confidence:research.validation.confidence,
    verifiedAt:now,
    tabId:route.tabId,
    sectionId:route.sectionId,
    topics:[understanding.intent,entity?.type,route.tabId,route.sectionId].filter(Boolean),
    claims:accepted.map((item,index)=>({
      text:compact(item.claim,420),
      canonStatus:research.validation.canonStatus,
      confidence:Math.min(.97,(item.relevance+item.sourceQuality)/2),
      status:research.validation.status,
      sourceIds:[sourceMap.get(item.sourceDocument?.url)?.id].filter(Boolean),
      evidenceIds:[evidenceIds[index]].filter(Boolean),
      verifiedAt:now
    }))
  });

  // HF2: research media is not written to the legacy image tables. Image Engine 3 performs its own discovery and persistence.

  return {knowledge,entity,sourceIds,evidenceIds};
}
