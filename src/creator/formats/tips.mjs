import { localize } from "./common.mjs";
export function createTips(plan){
  return {title:`${plan.topic} — ${localize(plan,{pt:"Dicas",en:"Tips",es:"Consejos"})}`,intro:localize(plan,{pt:"Pontos práticos extraídos do conhecimento específico disponível no GameIndex.",en:"Practical points extracted from specific knowledge available in GameIndex.",es:"Puntos prácticos extraídos del conocimiento específico disponible en GameIndex."}),items:plan.knowledge.map((k,i)=>({rank:i+1,title:k.title,description:k.summary,knowledgeIds:[k.id]})),sections:[]};
}
