const labels={GUIDE:"Guide",ARTICLE:"Article",LIST:"List",COMPARISON:"Comparison",LORE_SUMMARY:"Lore Summary",TIPS:"Tips",VIDEO_SCRIPT:"Video Script"};
export function normalizeContentType(value){
  const key=String(value||"GUIDE").trim().toUpperCase().replace(/[ -]+/g,"_");
  return Object.hasOwn(labels,key)?key:"GUIDE";
}
export function planContent({contentType,game,topic="",depth="STANDARD",knowledge=[],language="pt-BR",entity=null,entityType="OTHER",intent="GUIDE",primaryKnowledge=[],relatedKnowledge=[]}){
  const type=normalizeContentType(contentType);
  const cleanTopic=String(topic||"").trim()||entity?.name||game.nome;
  const max={SHORT:4,STANDARD:7,DETAILED:12}[String(depth||"STANDARD").toUpperCase()]||7;
  const selected=knowledge.slice(0,max);
  const ids=new Set(selected.map(k=>k.id));
  return {type,label:labels[type],game,topic:cleanTopic,depth:String(depth||"STANDARD").toUpperCase(),language,entity,entityType,intent,knowledge:selected,primaryKnowledge:primaryKnowledge.filter(k=>ids.has(k.id)),relatedKnowledge:relatedKnowledge.filter(k=>ids.has(k.id))};
}
