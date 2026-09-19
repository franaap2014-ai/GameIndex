import { researchGameWiki } from "./source-adapters/wiki.mjs";
import { researchFandom } from "./source-adapters/fandom.mjs";
import { researchTrello } from "./source-adapters/trello.mjs";
import { researchYouTube } from "./source-adapters/youtube.mjs";
import { rankSources } from "./source-ranker.mjs";
import { extractEvidenceFromSources } from "./evidence.mjs";
import { detectConflicts } from "./conflict-detector.mjs";
import { validateEvidence } from "../knowledge/validator.mjs";

export const UNIVERSE_RESEARCH_SOURCE_FAMILIES=Object.freeze(["WIKI","FANDOM","TRELLO","YOUTUBE"]);

export function buildResearchSearchQuery({game,query,entity=null}={}) {
  const explicit=String(query||"").trim();
  const gameName=String(game?.nome||game?.name||"").trim();
  const entityName=String(entity?.name||"").trim();
  if(explicit){
    if(!gameName)return explicit;
    const a=explicit.normalize("NFKC").toLowerCase();
    const b=gameName.normalize("NFKC").toLowerCase();
    return a.includes(b)?explicit:`${explicit} ${gameName}`.trim();
  }
  return [entityName,gameName].filter(Boolean).join(" ").trim();
}

function familyFor(doc){
  if(doc?.sourceType==="WIKI")return "WIKI";
  if(doc?.sourceType==="FANDOM")return "FANDOM";
  if(doc?.sourceType==="TRELLO")return "TRELLO";
  if(doc?.sourceType==="YOUTUBE")return "YOUTUBE";
  return "";
}

export async function researchGameVault({game,query,entity=null,intent="overview",language="pt-BR",signal=null}={}) {
  const timeoutMs=Math.max(2500,Number(process.env.GAMEVAULT_RESEARCH_TIMEOUT_MS||9000));
  const maxSources=Math.max(2,Math.min(16,Number(process.env.GAMEVAULT_MAX_RESEARCH_SOURCES||8)));
  const subject=entity?.name || query;
  const searchQuery=buildResearchSearchQuery({game,query,entity});
  if(signal?.aborted)throw Object.assign(new Error("RESEARCH_CANCELLED"),{code:"RESEARCH_CANCELLED"});

  // Beta 0.99 source policy: Wiki means a game/experience-specific Wiki, NOT Wikipedia.
  // No API key is required by any adapter. All adapters fail closed/gracefully.
  const jobs=[
    researchGameWiki({query:searchQuery,timeoutMs,limit:4}),
    researchFandom({query:searchQuery,timeoutMs,limit:4}),
    researchTrello({query:searchQuery,timeoutMs,limit:3}),
    researchYouTube({query:searchQuery,timeoutMs,limit:4})
  ];

  const settled=await Promise.allSettled(jobs);
  if(signal?.aborted)throw Object.assign(new Error("RESEARCH_CANCELLED"),{code:"RESEARCH_CANCELLED"});
  const docs=settled.flatMap(result=>result.status==="fulfilled"?result.value:[])
    .filter(doc=>UNIVERSE_RESEARCH_SOURCE_FAMILIES.includes(familyFor(doc)));
  const dedup=new Map();
  for (const doc of docs) if (doc?.url && doc?.rawText) dedup.set(doc.url,doc);

  const ranked=rankSources([...dedup.values()],{
    query,
    entityName:entity?.name || subject,
    gameName:game?.nome || game?.name || "",
    intent
  }).filter(doc=>doc.rankScore>=.40).slice(0,maxSources);

  const evidence=extractEvidenceFromSources(ranked,{
    gameId:game?.id,
    entityId:entity?.id||null,
    query,
    entityName:entity?.name || subject,
    gameName:game?.nome || game?.name || ""
  });
  const conflicts=detectConflicts(evidence);
  const validation=validateEvidence({evidence,conflicts,intent});
  const sourceFamilies=Object.fromEntries(UNIVERSE_RESEARCH_SOURCE_FAMILIES.map(key=>[key,ranked.filter(doc=>familyFor(doc)===key).length]));
  return {query:searchQuery,sources:ranked,evidence,conflicts,validation,sourceFamilies,sourcePolicy:"GAME_WIKI_FANDOM_TRELLO_YOUTUBE_NO_API_KEY"};
}
