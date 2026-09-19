import { overlapScore, normalizeText } from "../knowledge/normalize.mjs";

export const SOURCE_BASE_QUALITY = {
  PRIMARY_OFFICIAL:.96,
  OFFICIAL_DOCUMENTATION:.94,
  OFFICIAL_PATCH_NOTES:.94,
  DEVELOPER_STATEMENT:.9,
  STRUCTURED_DATABASE:.82,
  WIKI:.86,
  FANDOM:.78,
  TRELLO:.88,
  YOUTUBE:.68,
  COMMUNITY_WIKI:.66,
  VIDEO_GUIDE:.62,
  COMMUNITY_DISCUSSION:.52,
  SOCIAL_POST:.46,
  CURATED_SEED:.72,
  UNKNOWN:.38
};

export function rankSource(doc,{query,intent="",entityName="",gameName=""}={}) {
  const base=Number(doc.quality ?? SOURCE_BASE_QUALITY[doc.sourceType] ?? .4);
  const hay=`${doc.title} ${doc.rawText?.slice(0,2200)||""}`;
  const queryFit=overlapScore(query,hay);
  const entityFit=entityName ? Math.max(overlapScore(entityName,doc.title),overlapScore(entityName,hay)) : 0;
  const gameFit=gameName ? Math.max(overlapScore(gameName,doc.title),overlapScore(gameName,hay)) : .5;
  let intentBoost=0;
  if (["release","update","platforms"].includes(intent) && String(doc.sourceType).startsWith("OFFICIAL")) intentBoost=.09;
  if (["lore","theory"].includes(intent) && ["WIKI","FANDOM","COMMUNITY_WIKI","COMMUNITY_DISCUSSION"].includes(doc.sourceType)) intentBoost=.04;
  if (["update","mechanic","gameplay","HOW_TO"].includes(intent) && ["TRELLO","YOUTUBE"].includes(doc.sourceType)) intentBoost=.05;
  const titleExact=entityName && normalizeText(doc.title)===normalizeText(entityName) ? .11 : 0;
  let penalty=0;
  if(entityName && entityFit<.12)penalty+=.12;
  if(gameName && gameFit<.1 && !String(doc.sourceType).startsWith("OFFICIAL"))penalty+=.13;
  return Math.max(0,Math.min(1,base*.5 + queryFit*.22 + entityFit*.16 + gameFit*.12 + intentBoost + titleExact - penalty));
}

export function rankSources(docs,context={}) {
  return docs
    .map(doc=>({...doc,rankScore:rankSource(doc,context)}))
    .sort((a,b)=>b.rankScore-a.rankScore);
}
