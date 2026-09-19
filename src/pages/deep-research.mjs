import { researchGameVault } from "../research/orchestrator.mjs";
import { persistResearchKnowledge } from "../knowledge/knowledge-service.mjs";
import { listKnowledge } from "../database/repositories/knowledge-repository.mjs";
import { resolveIntent } from "../core85/deterministic-intelligence.mjs";

function researchQuestions(game,entity,pageType){
  const subject=entity?.name||game.nome;
  const common=[`${subject} ${game.nome} overview`,`${subject} ${game.nome} gameplay mechanics`,`${subject} ${game.nome} guide`];
  const byType={
    WEAPON:[`${subject} ${game.nome} stats damage obtaining`,`${subject} ${game.nome} strategy`],
    TOOL:[`${subject} ${game.nome} recipe durability obtaining`,`${subject} ${game.nome} uses`],
    LOCATION:[`${subject} ${game.nome} location how to find`,`${subject} ${game.nome} access hazards`],
    MOB:[`${subject} ${game.nome} behavior drops spawning`,`${subject} ${game.nome} combat`],
    BOSS:[`${subject} ${game.nome} boss strategy drops`,`${subject} ${game.nome} requirements`],
    CHARACTER:[`${subject} ${game.nome} story role abilities`,`${subject} ${game.nome} relationships`],
    LORE:[`${subject} ${game.nome} official lore`,`${subject} ${game.nome} canon evidence`]
  };
  return [...new Set([...common,...(byType[String(pageType||"").toUpperCase()]||[])])].slice(0,5);
}
function localSnapshot(game,entity){const knowledge=listKnowledge({gameId:game.id,entityId:entity?.id||null,limit:1500}).entries;const sourceIds=[...new Set(knowledge.flatMap(k=>(k.claims||[]).flatMap(c=>c.sourceIds||[])))];return {knowledgeCount:knowledge.length,sourceIds};}
export async function deepResearchForPage({game,entity,pageType,language="pt-BR",onQuestion=()=>{},shouldCancel=()=>false}={}){
  const results=[],before=localSnapshot(game,entity);let sourceCount=0,evidenceCount=0,acceptedEvidence=0,conflicts=0,knowledgeCreated=0;
  for(const question of researchQuestions(game,entity,pageType)){
    if(shouldCancel())break;onQuestion(question);
    try{
      const intent=resolveIntent(question,"OVERVIEW").intent;
      const research=await researchGameVault({game,query:question,entity,intent,language});
      sourceCount+=research.sources?.length||0;evidenceCount+=research.evidence?.length||0;acceptedEvidence+=research.validation?.accepted?.length||0;conflicts+=research.conflicts?.length||0;
      const understanding={question,game,entity,intent,subject:entity?.name||game.nome};
      const persisted=persistResearchKnowledge({understanding,research});if(persisted?.knowledge)knowledgeCreated++;
      results.push({question,sourceCount:research.sources?.length||0,evidenceCount:research.evidence?.length||0,acceptedEvidence:research.validation?.accepted?.length||0,conflicts:research.conflicts?.length||0,persistedKnowledgeId:persisted?.knowledge?.id||null});
    }catch(error){results.push({question,error:String(error.message||"RESEARCH_FAILED")});}
  }
  const after=localSnapshot(game,entity);return {results,sourceCount:Math.max(sourceCount,after.sourceIds.length,before.sourceIds.length),evidenceCount,acceptedEvidence,conflicts,knowledgeCreated,localKnowledgeCount:after.knowledgeCount,completedQuestions:results.filter(x=>!x.error).length,failedQuestions:results.filter(x=>x.error).length,engine:"GI_CORE_SCRIPT_RESEARCH"};
}
