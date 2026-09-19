import { db, json, nowIso, parseJson, transaction } from "../connection.mjs";
import { clamp, jaccardScore, normalizeText, overlapScore, stableId } from "../../knowledge/normalize.mjs";
import { relationshipsForEntity } from "./relationship-repository.mjs";

function mapClaim(row) {
  return row ? {
    id:row.id, knowledgeId:row.knowledge_id, text:row.text, canonStatus:row.canon_status,
    confidence:row.confidence, gameVersion:row.game_version, status:row.status,
    sourceIds:parseJson(row.source_ids_json,[]), evidenceIds:parseJson(row.evidence_ids_json,[]), verifiedAt:row.verified_at
  } : null;
}

function mapKnowledge(row, { includeClaims=false, includeRelationships=false }={}) {
  if (!row) return null;
  const item = {
    id:row.id, gameId:row.game_id, entityId:row.entity_id, title:row.title, summary:row.summary,
    canonStatus:row.canon_status, status:row.status, confidence:row.confidence, gameVersion:row.game_version,
    validFrom:row.valid_from, validUntil:row.valid_until, verifiedAt:row.verified_at,
    tabId:row.tab_id, sectionId:row.section_id, topics:parseJson(row.topics_json,[]),
    createdAt:row.created_at, updatedAt:row.updated_at,
    entityName:row.entity_name || null, entityType:row.entity_type || null, entitySlug:row.entity_slug || null
  };
  if (includeClaims) item.claims = db.prepare(`SELECT * FROM claims WHERE knowledge_id=? ORDER BY rowid`).all(row.id).map(mapClaim);
  if (includeRelationships && row.entity_id) item.relationships = relationshipsForEntity(row.entity_id);
  return item;
}

export function upsertKnowledge(input) {
  if (!input.gameId || !input.title) throw new Error("Conhecimento precisa de gameId e título.");
  const id = input.id || stableId("knowledge", input.gameId, input.entityId || "", input.tabId || "overview", input.sectionId || "summary", input.title);
  const existing = db.prepare(`SELECT * FROM knowledge WHERE id=?`).get(id);
  const now = nowIso();
  transaction(() => {
    db.prepare(`INSERT INTO knowledge(id,game_id,entity_id,title,summary,canon_status,status,confidence,game_version,valid_from,valid_until,verified_at,tab_id,section_id,topics_json,created_at,updated_at)
      VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
      ON CONFLICT(id) DO UPDATE SET entity_id=excluded.entity_id,title=excluded.title,summary=excluded.summary,canon_status=excluded.canon_status,status=excluded.status,confidence=excluded.confidence,game_version=excluded.game_version,valid_from=excluded.valid_from,valid_until=excluded.valid_until,verified_at=excluded.verified_at,tab_id=excluded.tab_id,section_id=excluded.section_id,topics_json=excluded.topics_json,updated_at=excluded.updated_at`)
      .run(id, input.gameId, input.entityId || null, input.title, input.summary || "", input.canonStatus || "UNKNOWN", input.status || "CURRENT", clamp(input.confidence ?? .5), input.gameVersion || "", input.validFrom || "", input.validUntil || "", input.verifiedAt || "", input.tabId || "overview", input.sectionId || "summary", json(input.topics || []), existing?.created_at || now, now);

    if (Array.isArray(input.claims)) {
      db.prepare(`DELETE FROM claims WHERE knowledge_id=?`).run(id);
      const stmt = db.prepare(`INSERT INTO claims(id,knowledge_id,text,canon_status,confidence,game_version,status,source_ids_json,evidence_ids_json,verified_at) VALUES(?,?,?,?,?,?,?,?,?,?)`);
      input.claims.forEach((claim,index) => {
        const text = typeof claim === "string" ? claim : claim.text;
        if (!text) return;
        const data = typeof claim === "string" ? {} : claim;
        stmt.run(data.id || stableId("claim", id, index, text), id, text, data.canonStatus || input.canonStatus || "UNKNOWN", clamp(data.confidence ?? input.confidence ?? .5), data.gameVersion || input.gameVersion || "", data.status || input.status || "CURRENT", json(data.sourceIds || []), json(data.evidenceIds || []), data.verifiedAt || input.verifiedAt || "");
      });
    }
  });
  return getKnowledgeById(id, { includeClaims:true, includeRelationships:true });
}

export function getKnowledgeById(id, options={}) {
  const row = db.prepare(`SELECT k.*,e.name entity_name,e.type entity_type,e.slug entity_slug FROM knowledge k LEFT JOIN entities e ON e.id=k.entity_id WHERE k.id=?`).get(id);
  return mapKnowledge(row, options);
}

export function listKnowledge({ gameId, entityId=null, tabId=null, sectionId=null, limit=24, offset=0 }={}) {
  if (!gameId) return { entries:[], total:0, limit, offset };
  let where = `k.game_id=?`;
  const args = [gameId];
  if (entityId) { where += ` AND k.entity_id=?`; args.push(entityId); }
  if (tabId) { where += ` AND k.tab_id=?`; args.push(tabId); }
  if (sectionId) { where += ` AND k.section_id=?`; args.push(sectionId); }
  const total = Number(db.prepare(`SELECT COUNT(*) count FROM knowledge k WHERE ${where}`).get(...args).count);
  const rows = db.prepare(`SELECT k.*,e.name entity_name,e.type entity_type,e.slug entity_slug FROM knowledge k LEFT JOIN entities e ON e.id=k.entity_id WHERE ${where} ORDER BY k.confidence DESC,k.updated_at DESC LIMIT ? OFFSET ?`).all(...args, limit, offset);
  return { entries:rows.map(row => mapKnowledge(row,{includeClaims:true,includeRelationships:true})), total, limit, offset };
}

export function searchKnowledge(query, { gameId=null, limit=20 }={}) {
  const rows = gameId
    ? db.prepare(`SELECT k.*,e.name entity_name,e.type entity_type,e.slug entity_slug FROM knowledge k LEFT JOIN entities e ON e.id=k.entity_id WHERE k.game_id=? AND k.status IN ('CURRENT','VALIDATED')`).all(gameId)
    : db.prepare(`SELECT k.*,e.name entity_name,e.type entity_type,e.slug entity_slug FROM knowledge k LEFT JOIN entities e ON e.id=k.entity_id WHERE k.status IN ('CURRENT','VALIDATED')`).all();
  const nquery = normalizeText(query);
  return rows.map(row => {
    const topics = parseJson(row.topics_json,[]);
    const hay = [row.title,row.summary,row.entity_name,row.entity_type,...topics].filter(Boolean).join(" ");
    let score = Math.max(jaccardScore(nquery, hay), overlapScore(nquery, hay) * .75);
    const ntitle = normalizeText(row.title);
    const nentity = normalizeText(row.entity_name || "");
    if (nquery === ntitle || (nentity && nquery === nentity)) score = 1;
    else if (normalizeText(hay).includes(nquery) && nquery.length > 2) score = Math.max(score,.72);
    score += Math.min(.08, Number(row.confidence || 0) * .08);
    return { ...mapKnowledge(row), score:Math.min(1,score) };
  }).filter(item => item.score > .08).sort((a,b)=>b.score-a.score).slice(0,limit);
}

export function retrieveMemory({ gameId, query, entityId=null, intent=null, tabId=null, sectionId=null, limit=8 }) {
  let candidates = [];
  if (entityId) {
    const rows = db.prepare(`SELECT k.*,e.name entity_name,e.type entity_type,e.slug entity_slug FROM knowledge k LEFT JOIN entities e ON e.id=k.entity_id WHERE k.game_id=? AND k.entity_id=? AND k.status IN ('CURRENT','VALIDATED') ORDER BY k.confidence DESC`).all(gameId,entityId);
    candidates.push(...rows.map(row=>mapKnowledge(row,{includeClaims:true,includeRelationships:true})).map(item=>({ ...item, score:.78 + item.confidence*.18 })));
  }
  const semantic = searchKnowledge(query,{gameId,limit:Math.max(limit*3,20)}).map(item=>({ ...item }));
  const byId = new Map();
  for (const item of [...candidates,...semantic]) {
    let score = item.score || .2;
    if (tabId && item.tabId === tabId) score += .08;
    if (sectionId && item.sectionId === sectionId) score += .07;
    if (intent && item.topics?.includes(intent)) score += .06;
    score = Math.min(1,score);
    const previous = byId.get(item.id);
    if (!previous || score > previous.score) byId.set(item.id,{...item,score});
  }
  return [...byId.values()].sort((a,b)=>b.score-a.score).slice(0,limit);
}

export function knowledgeCount() { return Number(db.prepare(`SELECT COUNT(*) count FROM knowledge`).get().count); }
export function claimCount() { return Number(db.prepare(`SELECT COUNT(*) count FROM claims`).get().count); }

export function markKnowledgeStatus(id,status) {
  db.prepare(`UPDATE knowledge SET status=?,updated_at=? WHERE id=?`).run(status,nowIso(),id);
}
