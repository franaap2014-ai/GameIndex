import { getGameBySlug, getGameById, listGames } from "../database/repositories/game-repository.mjs";
import { searchKnowledge, retrieveMemory } from "../database/repositories/knowledge-repository.mjs";
import { getSourceById } from "../database/repositories/source-repository.mjs";
import { researchGameVault } from "../research/orchestrator.mjs";
import { persistResearchKnowledge } from "../knowledge/knowledge-service.mjs";
import { resolveIntent } from "../core85/deterministic-intelligence.mjs";
import { runDexterTask } from "./dexter-service.mjs";
import { ollamaHealth } from "./ollama-provider.mjs";

function norm(value){return String(value||"").normalize("NFKC").toLowerCase().replace(/[^a-z0-9à-ÿ]+/g," ").trim();}
function autoGame(question){const q=norm(question);if(!q)return null;const games=listGames({includeDrafts:false});let best=null,bestLen=0;for(const g of games){for(const term of [g.nome,g.slug,g.franquia].filter(Boolean)){const n=norm(term);if(n.length>=3&&q.includes(n)&&n.length>bestLen){best=g;bestLen=n.length;}}}return best;}
function sourceList(memory=[]){
  const ids=[...new Set(memory.flatMap(k=>(k.claims||[]).flatMap(c=>c.sourceIds||[])))];
  return ids.slice(0,8).map(getSourceById).filter(Boolean).map(s=>({id:s.id,title:s.title||s.url||s.sourceType,sourceType:s.sourceType||"SOURCE",url:s.url||""}));
}
function fallback(memory,language){
  const top=memory[0];
  if(!top){const msg=language.startsWith("en")?"GameIndex could not verify enough information for this question yet.":language.startsWith("es")?"GameIndex todavía no pudo verificar información suficiente para esta pregunta.":"O GameIndex ainda não conseguiu verificar informação suficiente para responder esta pergunta.";return {directAnswer:msg,details:[],confidence:0,status:"WAITING_KNOWLEDGE"};}
  const details=(top.claims||[]).map(c=>c.text).filter(Boolean).slice(0,5);
  return {directAnswer:top.summary||top.title,details,confidence:Math.max(.35,Math.min(.94,Number(top.confidence||.5))),status:"SCRIPT_MEMORY_ANSWER"};
}
function researchSummary(research){return {engine:"GI_CORE_SCRIPT_RESEARCH",sources:Number(research?.sources?.length||0),accepted:Number(research?.validation?.accepted?.length||0),confidence:Number(research?.validation?.confidence||0),status:research?.validation?.status||"NO_RESULT"};}

export async function publicDexterConsult({question,selectedGame="AUTOMATIC",currentGame="",language="pt-BR",forceResearch=false}={}){
  const q=String(question||"").trim();if(!q)throw new Error("QUESTION_REQUIRED");
  const gameKey=String(currentGame||selectedGame||"");
  const game=gameKey&&gameKey!=="AUTOMATIC"?(getGameBySlug(gameKey)||getGameById(gameKey)):autoGame(q);
  const intent=resolveIntent(q,"overview");
  let memory=game?retrieveMemory({gameId:game.id,query:q,intent,limit:8}):searchKnowledge(q,{limit:8});
  let researched=false,research=null,persisted=false;

  // HF2: deterministic research is primary when memory is insufficient. Ollama is never required for acquisition.
  if(game&&(forceResearch||memory.length===0)){
    try{
      research=await researchGameVault({game,query:q,entity:null,intent,language});
      if(research?.validation?.accepted?.length){
        const stored=persistResearchKnowledge({understanding:{question:q,game,entity:null,intent,subject:q,tabId:"overview",sectionId:"summary"},research});
        persisted=Boolean(stored?.knowledge);researched=true;
        memory=retrieveMemory({gameId:game.id,query:q,intent,limit:8});
      }else researched=true;
    }catch(error){research={errorCode:String(error?.code||"SCRIPT_RESEARCH_FAILED"),validation:{accepted:[],confidence:0,status:"FAILED"},sources:[]};}
  }

  const sources=sourceList(memory),base=fallback(memory,language);
  let semantic=null,providerHealth=null;
  if(memory.length){
    providerHealth=await ollamaHealth();
    if(providerHealth.reachable&&providerHealth.modelInstalled){
      const evidence=memory.slice(0,8).map(k=>({title:k.title,summary:k.summary,confidence:k.confidence,claims:(k.claims||[]).map(c=>c.text).filter(Boolean).slice(0,6)}));
      semantic=await runDexterTask({taskType:"PUBLIC_ANSWER",gameId:game?.id||null,input:{question:q,language,intent,game:game?{id:game.id,name:game.nome,slug:game.slug}:null,evidence},system:"You are Dexter, the optional GameIndex semantic answer layer. Use only supplied verified evidence. Never invent facts. Return JSON with directAnswer, details array, confidence 0..1, and optional related array.",prompt:"Improve the clarity of the evidence-backed answer. If evidence is insufficient, say so."});
    }else semantic={ok:false,degraded:true,reasonCode:providerHealth.reachable?"MODEL_NOT_INSTALLED":"OLLAMA_OFFLINE"};
  }
  const model=semantic?.ok?semantic.data:null;
  const answer={directAnswer:String(model?.directAnswer||base.directAnswer),details:Array.isArray(model?.details)?model.details.slice(0,6):base.details,sources,related:Array.isArray(model?.related)?model.related.slice(0,6):[],origin:model?"dexter-ollama":"gi-core-scripts",confidence:Number(model?.confidence??base.confidence),status:model?"ANSWERED_DEXTER":memory.length?"ANSWERED_SCRIPT":"WAITING_KNOWLEDGE",researched,game:game?{id:game.id,name:game.nome,slug:game.slug}:null};
  return {ok:true,answer,understanding:{game:answer.game,intent,specialist:"GI_CORE_SCRIPT_ROUTER"},pipeline:[{component:"GI CORE 8.5 SCRIPTS",status:"PASS"},{component:"VERIFIED MEMORY",status:memory.length?"PASS":"WAITING_KNOWLEDGE"},{component:"SCRIPT RESEARCH",status:researched?(research?.validation?.accepted?.length?"PASS":"NO_VERIFIED_RESULT"):"NOT_REQUIRED"},{component:"DEXTER GEMMA3:4B",status:model?"PASS":semantic?.reasonCode||"OPTIONAL_OFFLINE"}],dexter:{provider:"ollama",model:"gemma3:4b",invoked:Boolean(memory.length&&providerHealth?.reachable&&providerHealth?.modelInstalled),used:Boolean(model),requiredForSiteSurvival:false,reasonCode:semantic?.reasonCode||"",providerReachable:providerHealth?.reachable??null,modelInstalled:providerHealth?.modelInstalled??null},memory:{count:memory.length},research:{enabled:true,requested:Boolean(forceResearch),ran:researched,persisted,...researchSummary(research)}};
}
