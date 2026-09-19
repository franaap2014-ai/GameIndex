import { retrieveMemory } from "../database/repositories/knowledge-repository.mjs";
import { overlapScore } from "../knowledge/normalize.mjs";

export function retrieveGameVaultMemory(understanding) {
  if (!understanding.game) return [];
  return retrieveMemory({
    gameId:understanding.game.id,
    query:understanding.question,
    entityId:understanding.entity?.id || null,
    intent:understanding.intent,
    tabId:understanding.tabId,
    sectionId:understanding.sectionId,
    limit:8
  });
}

export function memorySufficiency(memory,understanding) {
  if (!memory.length) return {sufficient:false,score:0,reason:"EMPTY"};
  const top=memory[0];
  let score=(top.score||0)*.55 + (top.confidence||0)*.36;

  if (top.status==="OUTDATED" || top.status==="UNVERIFIED") score-=.22;
  if (top.status==="CONFLICTED") score-=.16;

  if (understanding.entity) {
    if (top.entityId===understanding.entity.id) score+=.12;
    else if (top.entityId) score-=.3;
  } else if (understanding.subject) {
    const subjectFit=Math.max(
      overlapScore(understanding.subject,top.title||""),
      overlapScore(understanding.subject,top.summary||""),
      overlapScore(understanding.subject,(top.topics||[]).join(" "))
    );
    if(subjectFit<.16)score-=.18;
    else score+=Math.min(.08,subjectFit*.08);
  }

  if (understanding.tabId && top.tabId===understanding.tabId) score+=.05;
  if (understanding.sectionId && top.sectionId===understanding.sectionId) score+=.04;
  if (understanding.intent==="theory" && top.canonStatus==="THEORY") score+=.1;
  if (understanding.intent==="lore" && ["OFFICIAL","COMMUNITY","THEORY","MIXED","UNKNOWN"].includes(top.canonStatus)) score+=.05;

  score=Math.max(0,Math.min(1,score));
  const threshold=understanding.entity ? .72 : .68;
  return {sufficient:score>=threshold,score,reason:score>=threshold?"ENOUGH_REUSABLE_KNOWLEDGE":"LOW_CONFIDENCE_OR_MATCH"};
}
