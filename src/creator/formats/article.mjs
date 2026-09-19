import { localize, paragraph } from "./common.mjs";
export function createArticle(plan){
  const sections=plan.knowledge.map(k=>({heading:k.title,body:paragraph(k),knowledgeIds:[k.id]})).filter(s=>s.body);
  return {title:`${plan.topic} — ${plan.game.nome}`,intro:localize(plan,{pt:"Visão geral criada somente a partir do conhecimento específico disponível no GameIndex.",en:"Overview created only from specific knowledge currently available in GameIndex.",es:"Descripción general creada solo con conocimiento específico disponible en GameIndex."}),sections,conclusion:localize(plan,{pt:"O conteúdo acima usa o conhecimento atual selecionado pelo GameIndex para este tema.",en:"The content above uses the current GameIndex knowledge selected for this topic.",es:"El contenido anterior usa el conocimiento actual de GameIndex seleccionado para este tema."})};
}
