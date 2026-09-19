import { db, nowIso } from "../connection.mjs";

export function saveKnowledgeForUser(userId,knowledgeId){
  db.prepare(`INSERT INTO user_saved_knowledge(user_id,knowledge_id,saved_at) VALUES(?,?,?) ON CONFLICT(user_id,knowledge_id) DO NOTHING`).run(userId,knowledgeId,nowIso());
  return isKnowledgeSaved(userId,knowledgeId);
}
export function unsaveKnowledgeForUser(userId,knowledgeId){db.prepare(`DELETE FROM user_saved_knowledge WHERE user_id=? AND knowledge_id=?`).run(userId,knowledgeId);return false;}
export function isKnowledgeSaved(userId,knowledgeId){return Boolean(db.prepare(`SELECT 1 ok FROM user_saved_knowledge WHERE user_id=? AND knowledge_id=?`).get(userId,knowledgeId));}
export function listSavedKnowledge(userId,{limit=50}={}){
  return db.prepare(`SELECT k.*,e.name entity_name,e.type entity_type,s.saved_at FROM user_saved_knowledge s JOIN knowledge k ON k.id=s.knowledge_id JOIN games g ON g.id=k.game_id LEFT JOIN entities e ON e.id=k.entity_id WHERE s.user_id=? AND g.status='PUBLISHED' ORDER BY s.saved_at DESC LIMIT ?`).all(userId,Math.max(1,Math.min(100,limit))).map(row=>({id:row.id,gameId:row.game_id,entityId:row.entity_id,title:row.title,summary:row.summary,canonStatus:row.canon_status,status:row.status,confidence:row.confidence,tabId:row.tab_id,sectionId:row.section_id,entityName:row.entity_name||null,entityType:row.entity_type||null,savedAt:row.saved_at}));
}
export function savedKnowledgeCount(userId){return Number(db.prepare(`SELECT COUNT(*) count FROM user_saved_knowledge WHERE user_id=?`).get(userId).count);}
