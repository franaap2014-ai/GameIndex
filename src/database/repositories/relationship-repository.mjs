import { db, json, nowIso } from "../connection.mjs";
import { stableId } from "../../knowledge/normalize.mjs";

export function upsertRelationship({ gameId, sourceEntityId, relationType, targetEntityId, metadata={} }) {
  const id = stableId("rel", gameId, sourceEntityId, relationType, targetEntityId);
  db.prepare(`INSERT INTO relationships(id,game_id,source_entity_id,relation_type,target_entity_id,metadata_json,created_at) VALUES(?,?,?,?,?,?,?) ON CONFLICT(game_id,source_entity_id,relation_type,target_entity_id) DO UPDATE SET metadata_json=excluded.metadata_json`)
    .run(id, gameId, sourceEntityId, relationType, targetEntityId, json(metadata), nowIso());
  return id;
}

export function relationshipsForEntity(entityId) {
  return db.prepare(`SELECT r.relation_type,e.id target_id,e.name target_name,e.slug target_slug,e.type target_type FROM relationships r JOIN entities e ON e.id=r.target_entity_id WHERE r.source_entity_id=? ORDER BY r.relation_type,e.name`).all(entityId).map(row => ({ type:row.relation_type, target:{ id:row.target_id,name:row.target_name,slug:row.target_slug,type:row.target_type } }));
}
