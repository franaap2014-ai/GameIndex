import { localize } from "./common.mjs";
export function createList(plan){
  return {title:`${plan.topic} — ${localize(plan,{pt:"Lista",en:"List",es:"Lista"})}`,intro:localize(plan,{pt:`Lista estruturada para ${plan.game.nome} usando conhecimento específico do GameIndex.`,en:`Structured list for ${plan.game.nome} using specific GameIndex knowledge.`,es:`Lista estructurada para ${plan.game.nome} usando conocimiento específico de GameIndex.`}),items:plan.knowledge.map((k,i)=>({rank:i+1,title:k.title,description:k.summary,knowledgeIds:[k.id]})),sections:[]};
}
