import { classifyEntityType } from "../core85/deterministic-intelligence.mjs";
import { recordOperation } from "./metrics.mjs";

export function classifyEntityDeterministically({game,entity}={}){
  const started=Date.now();
  const result=classifyEntityType({entity,subject:entity?.name||"",question:`${entity?.name||""} ${game?.nome||game?.name||""}`});
  recordOperation({type:"CORE",name:"ENTITY_CLASSIFICATION",gameId:game?.id,entityId:entity?.id,durationMs:Date.now()-started,aiAvoided:true,details:{type:result.type,confidence:result.confidence,reason:result.reason}});
  return result;
}
