import { db, nowIso } from "../connection.mjs";
import { clamp } from "../../knowledge/normalize.mjs";

function map(row){return row?{gameId:row.game_id,categoryId:row.category_id,expectedEntityCount:row.expected_entity_count,knownEntityCount:row.known_entity_count,validatedKnowledgeCount:row.validated_knowledge_count,coverageScore:row.coverage_score,currentKnowledgeQuality:Number(row.current_knowledge_quality||0),lastExpansionAt:row.last_expansion_at,lastReviewedAt:row.last_reviewed_at||""}:null;}
export function upsertCoverage({gameId,categoryId,expectedEntityCount=0,knownEntityCount=0,validatedKnowledgeCount=0,coverageScore=0,lastExpansionAt="",currentKnowledgeQuality=0,lastReviewedAt=""}){
  db.prepare(`INSERT INTO knowledge_coverage(game_id,category_id,expected_entity_count,known_entity_count,validated_knowledge_count,coverage_score,last_expansion_at,current_knowledge_quality,last_reviewed_at) VALUES(?,?,?,?,?,?,?,?,?) ON CONFLICT(game_id,category_id) DO UPDATE SET expected_entity_count=excluded.expected_entity_count,known_entity_count=excluded.known_entity_count,validated_knowledge_count=excluded.validated_knowledge_count,coverage_score=excluded.coverage_score,last_expansion_at=excluded.last_expansion_at,current_knowledge_quality=excluded.current_knowledge_quality,last_reviewed_at=excluded.last_reviewed_at`).run(gameId,categoryId,expectedEntityCount,knownEntityCount,validatedKnowledgeCount,clamp(coverageScore),lastExpansionAt||nowIso(),clamp(currentKnowledgeQuality),lastReviewedAt||nowIso());
  return getCoverage(gameId,categoryId);
}
export function getCoverage(gameId,categoryId){return map(db.prepare(`SELECT * FROM knowledge_coverage WHERE game_id=? AND category_id=?`).get(gameId,categoryId));}
export function listCoverage(gameId){return db.prepare(`SELECT * FROM knowledge_coverage WHERE game_id=? ORDER BY category_id`).all(gameId).map(map);}
