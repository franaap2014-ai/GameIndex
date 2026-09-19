import { bulletBody, localize, safeClaims } from "./common.mjs";

const INTENT_HEADINGS={
  HOW_TO_TRANSFORM:{pt:"Como obter a transformação",en:"How to transform",es:"Cómo obtener la transformación"},
  HOW_TO_CRAFT:{pt:"Materiais e processo",en:"Materials and process",es:"Materiales y proceso"},
  HOW_TO_UNLOCK:{pt:"Como desbloquear",en:"How to unlock",es:"Cómo desbloquear"},
  HOW_TO_GET:{pt:"Como obter",en:"How to obtain",es:"Cómo obtener"},
  WHERE_TO_FIND:{pt:"Onde encontrar",en:"Where to find",es:"Dónde encontrar"},
  WHAT_IT_DROPS:{pt:"Drops e recompensas",en:"Drops and rewards",es:"Drops y recompensas"},
  HOW_TO_DEFEAT:{pt:"Como derrotar",en:"How to defeat",es:"Cómo derrotar"},
  HOW_TO_USE:{pt:"Como usar",en:"How to use",es:"Cómo usar"},
  GUIDE:{pt:"Informações práticas",en:"Practical information",es:"Información práctica"}
};

function titleFor(plan){
  const target=plan.entity?.name||plan.topic;
  if(plan.intent==="HOW_TO_TRANSFORM")return localize(plan,{pt:`Como virar ${target}`,en:`How to become ${target}`,es:`Cómo convertirse en ${target}`});
  if(plan.intent==="HOW_TO_CRAFT")return localize(plan,{pt:`Como fazer ${target}`,en:`How to craft ${target}`,es:`Cómo fabricar ${target}`});
  if(plan.intent==="WHERE_TO_FIND")return localize(plan,{pt:`Onde encontrar ${target}`,en:`Where to find ${target}`,es:`Dónde encontrar ${target}`});
  return localize(plan,{pt:`${target} — Guia`,en:`${target} — Guide`,es:`${target} — Guía`});
}

function overviewHeading(plan){return localize(plan,{pt:"Visão geral",en:"Overview",es:"Descripción general"});}
function relatedHeading(plan){return localize(plan,{pt:"Relacionado",en:"Related",es:"Relacionado"});}

export function createGuide(plan){
  const primary=plan.primaryKnowledge?.length?plan.primaryKnowledge:plan.knowledge;
  const primaryClaims=[];
  for(const entry of primary)primaryClaims.push(...safeClaims(entry));
  const unique=[...new Set(primaryClaims)];
  if(!unique.length)throw new Error(localize(plan,{pt:"Ainda não há conhecimento específico e confiável suficiente para criar este guia.",en:"There is not enough specific reliable knowledge to create this guide yet.",es:"Todavía no hay conocimiento específico y confiable suficiente para crear esta guía."}));

  const sections=[];
  const overview=unique[0];
  if(overview)sections.push({heading:overviewHeading(plan),body:overview,knowledgeIds:primary.map(k=>k.id)});
  const practical=unique.slice(1,7);
  if(practical.length){
    const heading=localize(plan,INTENT_HEADINGS[plan.intent]||INTENT_HEADINGS.GUIDE);
    sections.push({heading,body:bulletBody(practical),knowledgeIds:primary.map(k=>k.id)});
  }

  const related=(plan.relatedKnowledge||[]).slice(0,4).filter(item=>item?.summary).map(item=>`${item.title}: ${item.summary}`);
  if(related.length)sections.push({heading:relatedHeading(plan),body:bulletBody(related),knowledgeIds:(plan.relatedKnowledge||[]).slice(0,4).map(k=>k.id)});

  if(sections.length<2&&plan.intent==="GUIDE")throw new Error(localize(plan,{pt:"A GameIndex encontrou apenas uma informação específica sobre este tema. O guia foi bloqueado para evitar conteúdo genérico; faça uma pesquisa mais completa antes de gerar.",en:"GameIndex found only one specific fact about this topic. The guide was blocked to avoid generic filler; run deeper research before generating it.",es:"GameIndex encontró solo un dato específico sobre este tema. La guía fue bloqueada para evitar contenido genérico; realiza una investigación más completa antes de generarla."}));

  return {
    title:titleFor(plan),
    intro:localize(plan,{pt:`Guia sobre ${plan.entity?.name||plan.topic} em ${plan.game.nome}, criado apenas com conhecimento específico disponível no GameIndex.`,en:`Guide to ${plan.entity?.name||plan.topic} in ${plan.game.nome}, built only from specific knowledge currently available in GameIndex.`,es:`Guía sobre ${plan.entity?.name||plan.topic} en ${plan.game.nome}, creada solo con conocimiento específico disponible en GameIndex.`}),
    sections,
    conclusion:""
  };
}
