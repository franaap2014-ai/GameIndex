import { localize } from "./common.mjs";
export function createLoreSummary(plan){
  const groups={OFFICIAL:[],COMMUNITY:[],THEORY:[],RUMOR:[],MIXED:[],UNKNOWN:[]};
  for(const k of plan.knowledge){(groups[k.canonStatus]||groups.UNKNOWN).push(k);}
  const sections=Object.entries(groups).filter(([,items])=>items.length).map(([status,items])=>({heading:status,body:items.map(x=>`${x.title}: ${x.summary}`).join("\n"),knowledgeIds:items.map(x=>x.id)}));
  return {title:`${plan.topic} — ${localize(plan,{pt:"Resumo de Lore",en:"Lore Summary",es:"Resumen de Lore"})}`,intro:localize(plan,{pt:"A lore é separada por status de cânone para que teorias e informações da comunidade não sejam apresentadas como fatos oficiais.",en:"Lore is separated by canon status so theories and community information are not presented as official facts.",es:"La lore se separa por estado de canon para que teorías e información de la comunidad no se presenten como hechos oficiales."}),sections,conclusion:localize(plan,{pt:"As classificações de cânone acima são preservadas da base de conhecimento do GameIndex.",en:"The canon classifications above are preserved from GameIndex Knowledge.",es:"Las clasificaciones de canon anteriores se conservan de la base de conocimiento de GameIndex."})};
}
