import { db, json, nowIso, parseJson } from "../connection.mjs";
import { stableId } from "../../knowledge/normalize.mjs";

function map(row) { return row ? { id:row.id, gameId:row.game_id, entityId:row.entity_id, claim:row.claim_text, sourceId:row.source_id, relevance:row.relevance, sourceQuality:row.source_quality, extractedAt:row.extracted_at, metadata:parseJson(row.metadata_json,{}) } : null; }

export function insertEvidence(item) {
  const id = item.id || stableId("evidence", item.gameId, item.entityId || "", item.sourceId, item.claim);
  db.prepare(`INSERT INTO evidence(id,game_id,entity_id,claim_text,source_id,relevance,source_quality,extracted_at,metadata_json) VALUES(?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING`)
    .run(id, item.gameId, item.entityId || null, item.claim, item.sourceId, Number(item.relevance || 0), Number(item.sourceQuality || .5), item.extractedAt || nowIso(), json(item.metadata || {}));
  return getEvidenceById(id);
}

export function getEvidenceById(id) { return map(db.prepare(`SELECT * FROM evidence WHERE id=?`).get(id)); }
export function listEvidenceForGame(gameId, limit=100) { return db.prepare(`SELECT * FROM evidence WHERE game_id=? ORDER BY relevance DESC LIMIT ?`).all(gameId,limit).map(map); }
