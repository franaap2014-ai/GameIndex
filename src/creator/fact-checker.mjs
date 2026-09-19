export function factCheckGeneratedContent({sections=[],knowledge=[]}){
  const knowledgeIds=new Set(knowledge.map(k=>k.id));
  const sourceIds=[...new Set(knowledge.flatMap(k=>(k.claims||[]).flatMap(c=>c.sourceIds||[])))];
  const unsupported=sections.filter(section=>Array.isArray(section.knowledgeIds)&&section.knowledgeIds.some(id=>!knowledgeIds.has(id)));
  return {passed:unsupported.length===0,unsupportedSections:unsupported.map(x=>x.heading||x.title||"section"),knowledgeIds:[...knowledgeIds],sourceIds};
}
