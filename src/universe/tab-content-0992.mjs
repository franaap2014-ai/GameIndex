import {createHash} from 'node:crypto';
import {db,json,nowIso,parseJson} from '../database/connection.mjs';
import {planForTab} from './tab-research-0992.mjs';
import {upsertUniverseFact,upsertUniversePage,upsertUniverseTab,upsertUniverseSection} from './universe-structure-service.mjs';
export function appendTabEvidence(game,revisionId,descriptor,accepted){
 const plan=planForTab(game,descriptor.topic);if(!plan)return 0;
 let sections=db.prepare(`SELECT s.* FROM universe_sections s JOIN universe_pages p ON p.id=s.page_id WHERE s.entity_game_id=? AND s.revision_id=? AND p.canonical_key=? AND s.canonical_key=? AND s.ownership='UNIVERSE_BUILDER' AND p.ownership<>'MANUAL' AND s.status<>'PUBLISHED'`).all(game.id,revisionId,plan.pageKey,plan.sectionKey);
 if(!sections.length&&accepted.length){if(db.prepare("SELECT 1 FROM universe_sections s JOIN universe_pages p ON p.id=s.page_id WHERE p.entity_game_id=? AND p.canonical_key=? AND (p.revision_id=? OR p.status='PUBLISHED') AND (p.ownership='MANUAL' OR s.ownership='MANUAL')").get(game.id,plan.pageKey,revisionId))return 0;const page=upsertUniversePage({entityGameId:game.id,canonicalKey:plan.pageKey,title:plan.pageTitle,status:'DRAFT',displayOrder:plan.order,revisionId});if(page.ownership==='MANUAL'||db.prepare("SELECT 1 FROM universe_builder_component_locks WHERE component_id=? AND locked=1").get(page.id))return 0;const tab=upsertUniverseTab({entityGameId:game.id,pageId:page.id,canonicalKey:plan.tabKey,title:plan.pageTitle,status:'DRAFT',revisionId});const section=upsertUniverseSection({entityGameId:game.id,pageId:page.id,tabId:tab.id,canonicalKey:plan.sectionKey,title:plan.sectionTitle,sectionType:plan.sectionType,content:{canonicalClaims:[]},status:'DRAFT',revisionId});sections=[db.prepare('SELECT * FROM universe_sections WHERE id=?').get(section.id)];}
 let count=0;
 for(const section of sections){
  if(section.ownership!=='UNIVERSE_BUILDER')continue;
  if(db.prepare(`SELECT 1 FROM universe_builder_component_locks WHERE entity_game_id=? AND locked=1 AND component_id IN (?,?,?)`).get(game.id,section.id,section.page_id,section.tab_id||''))continue;
  const content=parseJson(section.content_json,{}),claims=[...(content.canonicalClaims||[])],ids=new Set(content.sourceEvidenceIds||[]);
  for(const ev of accepted){if(claims.includes(ev.claim))continue;claims.push(ev.claim);ids.add(ev.id);count++;upsertUniverseFact({entityGameId:game.id,topicKey:descriptor.topic,factKey:'ENHANCE_'+createHash('sha256').update(ev.claim).digest('hex').slice(0,16),value:ev.claim,confidence:Math.min(.97,Number(ev.qualityScore||0)/100),conflictStatus:'NONE',evidenceIds:[ev.id],sourceLanguage:'pt-BR',retrievedAt:nowIso(),lastVerifiedAt:nowIso(),targetSectionKey:plan.sectionKey,revisionId});}
  if(claims.length===(content.canonicalClaims||[]).length)continue;
  // Preserve existing translations and authored fields; do not invent translations.
  const next={...content,canonicalClaims:claims,sourceEvidenceIds:[...ids],translations:{...(content.translations||{}),'pt-BR':claims}};
  db.prepare('UPDATE universe_sections SET content_json=?,updated_at=? WHERE id=?').run(json(next),nowIso(),section.id);
 }
 return count;
}
