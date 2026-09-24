import {canonicalKey} from './universe-structure-service.mjs';
import {parentGameFor} from '../database/repositories/game-repository.mjs';
// The persisted page menu owns both ordering and categories. No per-game schema.
export function tabResearchPlan(game,scope='FULL_ENTITY_BUILD'){
 const parent=parentGameFor(game),context=game.entityType==='EXPERIENCE'?`${parent?.nome||''} experience`:'';
 const tabs=game.menu||[];
 return tabs.filter(t=>scope!=='TECHNICAL_REFRESH'||t.id==='overview').map((tab,index)=>({topic:canonicalKey(tab.id),intent:tab.id,tabId:tab.id,sectionId:tab.sections?.[0]?.id||'summary',label:tab.label,order:(index+1)*10,query:`${game.nome} ${context} ${tab.id} ${(tab.sections||[]).map(s=>s.id).join(' ')}`.trim()}));
}
export function planForTab(game,topic){
 const d=tabResearchPlan(game).find(t=>t.topic===canonicalKey(topic));
 if(!d)return null;
 const title={'pt-BR':d.label,'en-US':d.label,'es-ES':d.label};
 return {pageKey:d.topic,tabKey:d.topic,sectionKey:canonicalKey(d.sectionId),pageTitle:title,sectionTitle:title,sectionType:d.tabId==='overview'?'TEXT':'LIST',order:d.order};
}
