import { getSourceById } from "../database/repositories/source-repository.mjs";

const BAD_STATUSES=new Set(["REJECTED","OUTDATED","SUPERSEDED"]);
const factResult=score=>score>=.72?"PASS":score>=.52?"NEEDS_RESEARCH":"FAIL";
const sourceResult=score=>score>=.68?"PASS":score>=.48?"NEEDS_RESEARCH":"FAIL";
const contextResult=score=>score>=.78?"PASS":score>=.58?"NEEDS_REVIEW":"FAIL";

export function runTripleSafety({game,entity=null,knowledge=[]}={}){
  const usable=knowledge.filter(k=>!BAD_STATUSES.has(k.status));
  const claimRows=usable.flatMap(k=>(k.claims||[]).map(c=>({knowledge:k,claim:c}))).filter(x=>x.claim?.text);
  const supported=claimRows.filter(x=>Number(x.claim.confidence??x.knowledge.confidence)>=.62&&!BAD_STATUSES.has(x.claim.status||x.knowledge.status));
  const factScore=claimRows.length?Math.min(1,(supported.length/claimRows.length)*.72+(usable.reduce((a,k)=>a+Number(k.confidence||0),0)/Math.max(1,usable.length))*.28):0;

  const sourceIds=[...new Set(claimRows.flatMap(x=>x.claim.sourceIds||[]))];
  const sources=sourceIds.map(getSourceById).filter(Boolean);
  const quality=sources.length?sources.reduce((a,s)=>a+Number(s.quality||0),0)/sources.length:0;
  const diversity=Math.min(1,new Set(sources.map(s=>s.sourceType||s.adapterKey||s.url)).size/Math.max(1,Math.min(3,sources.length)));
  const externalSources=sources.filter(s=>!/(CURATED|KNOWLEDGE_MAP|ADMIN_ONBOARDING|SEED)/i.test(String(s.sourceType||s.adapterKey||"")));
  let sourceScore=sources.length?Math.min(1,quality*.82+diversity*.18):0;
  // Internal curated seed material is useful memory, but it is not independent evidence.
  // Article AI may use it to draft, while Triple Safety keeps the article in review/research
  // until external/official evidence supports publication.
  if(sources.length&&!externalSources.length)sourceScore=Math.min(sourceScore,.64);

  let gameMatch=usable.length?usable.filter(k=>k.gameId===game?.id).length/usable.length:0;
  let entityMatch=1;
  if(entity) entityMatch=usable.length?usable.filter(k=>!k.entityId||k.entityId===entity.id).length/usable.length:0;
  const conflictPenalty=usable.some(k=>k.status==="CONFLICTED") ? .16 : 0;
  const contextScore=Math.max(0,Math.min(1,gameMatch*.58+entityMatch*.34+.08-conflictPenalty));

  const checks=[
    {type:"FACT_SAFETY",result:factResult(factScore),score:factScore,details:{knowledge:usable.length,claims:claimRows.length,supportedClaims:supported.length}},
    {type:"SOURCE_SAFETY",result:sourceResult(sourceScore),score:sourceScore,details:{sourceCount:sources.length,externalSourceCount:externalSources.length,averageQuality:quality,sourceTypes:[...new Set(sources.map(s=>s.sourceType))]}},
    {type:"CONTEXT_SAFETY",result:contextResult(contextScore),score:contextScore,details:{gameId:game?.id||null,entityId:entity?.id||null,gameMatch,entityMatch}}
  ];
  const hardFail=checks.some(c=>c.result==="FAIL");
  const needsResearch=checks.some(c=>c.result==="NEEDS_RESEARCH");
  const needsReview=checks.some(c=>c.result==="NEEDS_REVIEW");
  const overall=(factScore+sourceScore+contextScore)/3;
  const status=hardFail?"REJECTED":needsResearch?"NEEDS_RESEARCH":needsReview?"NEEDS_REVIEW":overall>=.76?"APPROVED":"NEEDS_REVIEW";
  return {status,overallConfidence:overall,factSafetyScore:factScore,sourceSafetyScore:sourceScore,contextSafetyScore:contextScore,checks};
}
