import { db, json, nowIso, parseJson } from "../connection.mjs";
import { stableId } from "../../knowledge/normalize.mjs";

function map(row) { return row ? { id:row.id, sourceType:row.source_type, title:row.title, url:row.url, adapterKey:row.adapter_key, quality:row.quality, retrievedAt:row.retrieved_at, metadata:parseJson(row.metadata_json,{}) } : null; }

export function upsertSource(source) {
  if (!source?.url) throw new Error("Fonte sem URL.");
  const id = source.id || source.sourceId || stableId("source", source.url);
  const retrievedAt = source.retrievedAt || nowIso();
  db.prepare(`INSERT INTO sources(id,source_type,title,url,adapter_key,quality,retrieved_at,metadata_json) VALUES(?,?,?,?,?,?,?,?)
    ON CONFLICT(url) DO UPDATE SET source_type=excluded.source_type,title=excluded.title,adapter_key=excluded.adapter_key,quality=excluded.quality,retrieved_at=excluded.retrieved_at,metadata_json=excluded.metadata_json`)
    .run(id, source.sourceType || "UNKNOWN", source.title || "", source.url, source.adapterKey || source.providerKey || "", Number(source.quality ?? .5), retrievedAt, json(source.metadata || {}));
  return getSourceByUrl(source.url);
}

export function getSourceByUrl(url) { return map(db.prepare(`SELECT * FROM sources WHERE url=?`).get(url)); }
export function getSourceById(id) { return map(db.prepare(`SELECT * FROM sources WHERE id=?`).get(id)); }
export function sourceCount() { return Number(db.prepare(`SELECT COUNT(*) AS count FROM sources`).get().count); }
