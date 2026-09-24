import { normalizeText, overlapScore, stableId } from "../knowledge/normalize.mjs";

function splitSentences(text="") {
  return String(text)
    .replace(/\s+/g," ")
    .split(/(?<=[.!?])\s+(?=[A-ZÀ-Ý0-9])/u)
    .map(s=>s.trim())
    .filter(s=>s.length>=45 && s.length<=520);
}

function cleanClaim(sentence){return sentence.replace(/\s+/g," ").trim();}

export function extractEvidence(doc,{gameId,entityId=null,query,entityName="",gameName=""}={}) {
  const sentences=splitSentences(doc.rawText||"");
  const scored=sentences.map(sentence=>{
    const queryFit=overlapScore(query,sentence);
    const entityFit=entityName?overlapScore(entityName,sentence):0;
    const gameFit=gameName?overlapScore(gameName,`${doc.title} ${sentence}`):.5;
    const titleMatch=overlapScore(doc.title,sentence)*.05;
    const score=Math.min(1,Math.max(queryFit,entityFit)*.66 + (doc.rankScore||doc.quality||.5)*.22 + gameFit*.07 + titleMatch);
    return {sentence,score,queryFit,entityFit,gameFit};
  })
  .filter(item=>item.score>=.2 && (item.queryFit>=.1 || item.entityFit>=.16))
  .sort((a,b)=>b.score-a.score);

  const seen=new Set();
  const result=[];
  for (const item of scored) {
    const key=normalizeText(item.sentence).slice(0,180);
    if (seen.has(key)) continue;
    seen.add(key);
    const claim=cleanClaim(item.sentence);
    result.push({
      id:stableId("evidence",gameId,entityId||"",doc.sourceId,claim),
      gameId,
      entityId,
      claim,
      sourceDocument:doc,
      relevance:item.score,
      sourceQuality:doc.rankScore||doc.quality||.5,
      extractedAt:new Date().toISOString(),
      metadata:{adapterKey:doc.adapterKey,sourceType:doc.sourceType,queryFit:item.queryFit,entityFit:item.entityFit,gameFit:item.gameFit}
    });
    if (result.length>=4) break;
  }
  return result;
}

export function extractEvidenceFromSources(docs,context) {
  const ranked=docs.flatMap(doc=>extractEvidence(doc,context))
    .sort((a,b)=>(b.relevance+b.sourceQuality)-(a.relevance+a.sourceQuality));
  // Repeated claims from mirror pages must not crowd out distinct useful facts.
  const seen=new Set(),unique=[],corroborating=[];
  for(const item of ranked){const key=normalizeText(item.claim);if(seen.has(key))corroborating.push(item);else{seen.add(key);unique.push(item);}}
  return [...unique,...corroborating].slice(0,16);
}
