import { db, json, nowIso, parseJson } from "../connection.mjs";
import { jaccardScore, normalizeText, slugify, stableId } from "../../knowledge/normalize.mjs";
import { chooseEntityType, registerCanonicalEntity, resolveCanonicalType } from "../../entities/canonical-entity-service.mjs";

function map(row) {
  if (!row) return null;
  return { id:row.id, gameId:row.game_id, slug:row.slug, name:row.name, type:row.type, aliases:parseJson(row.aliases_json,[]), summary:row.summary, createdAt:row.created_at, updatedAt:row.updated_at };
}

function mergeAliases(existing=[],incoming=[],name="") {
  const seen=new Set();
  const out=[];
  for (const value of [...existing,...incoming]) {
    const clean=String(value||"").trim();
    const key=normalizeText(clean);
    if(!clean||!key||key===normalizeText(name)||seen.has(key))continue;
    seen.add(key);out.push(clean);
  }
  return out.slice(0,40);
}

export function upsertEntity({ gameId, name, type="unknown", aliases=[], summary="" }) {
  if (!gameId || !name) throw new Error("gameId e nome da entidade são obrigatórios.");
  const slug = slugify(name);
  const existing = db.prepare(`SELECT * FROM entities WHERE game_id=? AND slug=?`).get(gameId, slug);
  const now = nowIso();
  const id = existing?.id || stableId("entity", gameId, slug);
  const mergedAliases=mergeAliases(existing?parseJson(existing.aliases_json,[]):[],Array.isArray(aliases)?aliases:[],name);
  // Beta 0.87: low-specificity bulk seeds must never downgrade a more precise type.
  // Example: Robux=CURRENCY must not become SYSTEM and Hyper Sonic must not settle as MECHANIC.
  const chosenType=chooseEntityType({existingType:existing?.type||"unknown",incomingType:type,name,gameId});
  db.prepare(`INSERT INTO entities(id,game_id,slug,name,type,aliases_json,summary,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?)
    ON CONFLICT(game_id,slug) DO UPDATE SET name=excluded.name,type=excluded.type,aliases_json=excluded.aliases_json,summary=CASE WHEN excluded.summary='' THEN entities.summary ELSE excluded.summary END,updated_at=excluded.updated_at`)
    .run(id, gameId, slug, name, chosenType, json(mergedAliases), summary, existing?.created_at || now, now);
  const saved=getEntityById(id);
  try{const canonical=resolveCanonicalType(saved,{candidateType:chosenType});registerCanonicalEntity({entityId:id,gameId,canonicalType:canonical.type,confidence:canonical.confidence,validationStatus:canonical.type==="OTHER"?"CANDIDATE":"VALIDATED",source:"ENTITY_REPOSITORY",reason:canonical.reason});}catch{}
  return getEntityById(id);
}

export function getEntityById(id) { return map(db.prepare(`SELECT * FROM entities WHERE id=?`).get(id)); }
export function getEntityBySlug(gameId, slug) { return map(db.prepare(`SELECT * FROM entities WHERE game_id=? AND slug=?`).get(gameId, slug)); }

export function listEntities({ gameId=null, limit=200 } = {}) {
  const rows = gameId ? db.prepare(`SELECT * FROM entities WHERE game_id=? ORDER BY name LIMIT ?`).all(gameId, limit) : db.prepare(`SELECT * FROM entities ORDER BY name LIMIT ?`).all(limit);
  return rows.map(map);
}

export function findBestEntity(gameId, query, minScore=0.42) {
  const normalized = normalizeText(query);
  if (!normalized) return null;
  const rows = db.prepare(`SELECT * FROM entities WHERE game_id=?`).all(gameId);
  let best = null;
  for (const row of rows) {
    const aliases = parseJson(row.aliases_json, []);
    const fields = [row.name, row.slug, ...aliases];
    for (const field of fields) {
      const n = normalizeText(field);
      if(!n)continue;
      let score = 0;
      if (normalized === n) score = 1;
      else if (normalized.includes(n) && n.length > 2) score = Math.min(.96, .68 + n.length / Math.max(30, normalized.length));
      else if (n.includes(normalized) && normalized.length > 2) score = .72;
      else score = jaccardScore(normalized, n);
      // Prefer the most specific matching entity when one alias is contained in the question.
      // Example: "espada de diamante" must outrank the broader material alias "diamante".
      if(normalized.includes(n)&&n.length>2)score+=Math.min(.08,n.length/200);
      if (!best || score > best.score) best = { entity:map(row), score:Math.min(1,score) };
    }
  }
  return best?.score >= minScore ? best : null;
}

export function searchEntities(query, { gameId=null, limit=20 }={}) {
  const rows = gameId ? db.prepare(`SELECT * FROM entities WHERE game_id=?`).all(gameId) : db.prepare(`SELECT * FROM entities`).all();
  return rows.map(row => {
    const aliases = parseJson(row.aliases_json, []);
    const hay = [row.name,row.summary,...aliases].join(" ");
    const nquery = normalizeText(query);
    const nhay = normalizeText(hay);
    let score = jaccardScore(nquery, nhay);
    if (normalizeText(row.name) === nquery) score = 1;
    else if (nhay.includes(nquery) && nquery.length > 2) score = Math.max(score,.72);
    return { ...map(row), score };
  }).filter(item => item.score > .08).sort((a,b)=>b.score-a.score).slice(0,limit);
}

export function findGlobalEntityMention(query){
  const normalized=normalizeText(query);if(!normalized)return null;const rows=db.prepare(`SELECT * FROM entities`).all();const matches=[];
  for(const row of rows){const aliases=parseJson(row.aliases_json,[]);for(const field of [row.name,row.slug,...aliases]){const n=normalizeText(field);if(!n||n.length<3)continue;let score=0;if(normalized===n)score=1;else if(normalized.includes(n))score=.90+Math.min(.09,n.length/200);else if(n.includes(normalized)&&normalized.length>3)score=.78;if(score)matches.push({entity:map(row),score,matched:n});}}
  matches.sort((a,b)=>b.score-a.score||b.matched.length-a.matched.length);const top=matches[0];if(!top)return null;const sameNameGames=new Set(matches.filter(x=>x.matched===top.matched&&x.score>=top.score-.02).map(x=>x.entity.gameId));return {...top,ambiguous:sameNameGames.size>1};
}
