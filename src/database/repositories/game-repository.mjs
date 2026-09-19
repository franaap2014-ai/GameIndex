import { db, json, nowIso, parseJson, transaction } from "../connection.mjs";
import { buildMenu } from "../../games/templates.mjs";
import { slugify, stableId } from "../../knowledge/normalize.mjs";

function hasGameEntityColumns(){try{return db.prepare(`PRAGMA table_info(games)`).all().some(row=>row.name==="entity_type");}catch{return false;}}

function mapGame(row, menu = null) {
  if (!row) return null;
  return {
    id: row.id,
    slug: row.slug,
    nome: row.name,
    name: row.name,
    descricao: row.description,
    description: row.description,
    desenvolvedor: row.developer,
    developer: row.developer,
    publicadora: row.publisher,
    publisher: row.publisher,
    lancamento: row.release_date,
    releaseDate: row.release_date,
    plataformas: parseJson(row.platforms_json, []),
    platforms: parseJson(row.platforms_json, []),
    generos: parseJson(row.genres_json, []),
    genres: parseJson(row.genres_json, []),
    franquia: row.franchise,
    franchise: row.franchise,
    siteOficial: row.official_url,
    officialUrl: row.official_url,
    status: row.status,
    template: row.template,
    aliases: parseJson(row.aliases_json, []),
    visualQuery: row.visual_query,
    entityType: row.entity_type || "GAME",
    parentGameId: row.parent_game_id || null,
    rootGameId: row.root_game_id || row.id,
    relationshipType: row.relationship_type || "",
    visibility: row.visibility || "PUBLIC",
    menu
  };
}

function getMenu(gameId) {
  const tabs = db.prepare(`SELECT * FROM game_tabs WHERE game_id=? ORDER BY position, tab_id`).all(gameId);
  const sectionStmt = db.prepare(`SELECT * FROM game_sections WHERE game_id=? AND tab_id=? ORDER BY position, section_id`);
  return tabs.map(tab => ({
    id: tab.tab_id,
    label: tab.label,
    icon: tab.icon,
    description: tab.description,
    sections: sectionStmt.all(gameId, tab.tab_id).map(section => ({ id: section.section_id, label: section.label, description: section.description }))
  }));
}

function mapGameLite(row) {
  if (!row) return null;
  return {
    id: row.id, slug: row.slug, nome: row.name, name: row.name,
    plataformas: parseJson(row.platforms_json, []), platforms: parseJson(row.platforms_json, []),
    generos: parseJson(row.genres_json, []), genres: parseJson(row.genres_json, []),
    franquia: row.franchise || "", franchise: row.franchise || "",
    status: row.status, visualQuery: row.visual_query || row.name,
    entityType: row.entity_type || "GAME", parentGameId: row.parent_game_id || null, rootGameId: row.root_game_id || row.id, relationshipType: row.relationship_type || "", visibility: row.visibility || "PUBLIC"
  };
}

export function listGamesPage({ includeDrafts = false, q = "", limit = 24, offset = 0, entityType = "GAME" } = {}) {
  const safeLimit = Math.min(100, Math.max(1, Number(limit) || 24));
  const safeOffset = Math.max(0, Number(offset) || 0);
  const query = String(q || "").trim();
  const where = []; const args = [];
  if (!includeDrafts) where.push("status='PUBLISHED'");
  if (hasGameEntityColumns() && entityType) { where.push("entity_type=?"); args.push(String(entityType).toUpperCase()); where.push("visibility='PUBLIC'"); }
  if (query) { where.push("(name LIKE ? COLLATE NOCASE OR slug LIKE ? COLLATE NOCASE OR franchise LIKE ? COLLATE NOCASE)"); const like=`%${query}%`; args.push(like,like,like); }
  const whereSql = where.length ? ` WHERE ${where.join(" AND ")}` : "";
  const total = Number(db.prepare(`SELECT COUNT(*) AS count FROM games${whereSql}`).get(...args)?.count || 0);
  const entityColumns=hasGameEntityColumns()?",entity_type,parent_game_id,root_game_id,relationship_type,visibility":"";
  const rows = db.prepare(`SELECT id,slug,name,platforms_json,genres_json,franchise,status,visual_query${entityColumns} FROM games${whereSql} ORDER BY name LIMIT ? OFFSET ?`).all(...args,safeLimit,safeOffset);
  return { total, items: rows.map(mapGameLite) };
}

export function listGames({ includeDrafts = true } = {}) {
  const rows = includeDrafts
    ? db.prepare(`SELECT * FROM games ORDER BY name`).all()
    : db.prepare(`SELECT * FROM games WHERE status='PUBLISHED' ORDER BY name`).all();
  return rows.map(row => mapGame(row));
}

export function getGameBySlug(slug) {
  const row = db.prepare(`SELECT * FROM games WHERE slug=?`).get(slug);
  return row ? mapGame(row, getMenu(row.id)) : null;
}

export function getGameById(id) {
  const row = db.prepare(`SELECT * FROM games WHERE id=?`).get(id);
  return row ? mapGame(row, getMenu(row.id)) : null;
}

export function findGameByNameOrAlias(value = "") {
  const normalized = String(value).trim().toLowerCase();
  if (!normalized) return null;
  const rows = db.prepare(`SELECT * FROM games`).all();
  for (const row of rows) {
    const aliases = parseJson(row.aliases_json, []);
    if (row.name.toLowerCase() === normalized || row.slug.toLowerCase() === normalized || aliases.some(alias => String(alias).toLowerCase() === normalized)) {
      return mapGame(row, getMenu(row.id));
    }
  }
  return null;
}

export function relatedByFranchise(game, limit = 6, { includeDrafts = false, includeExperiences = false } = {}) {
  if (!game?.franchise && !game?.franquia) return [];
  const franchise = game.franchise || game.franquia, entityFilter=hasGameEntityColumns()&&!includeExperiences?" AND entity_type='GAME'":"";
  const sql = includeDrafts
    ? `SELECT id,slug,name,description,release_date FROM games WHERE franchise=? AND id<>?${entityFilter} ORDER BY release_date,name LIMIT ?`
    : `SELECT id,slug,name,description,release_date FROM games WHERE franchise=? AND id<>? AND status='PUBLISHED'${entityFilter} ORDER BY release_date,name LIMIT ?`;
  return db.prepare(sql).all(franchise, game.id, limit).map(row => ({
    id: row.id, slug: row.slug, nome: row.name, name: row.name, descricao: row.description, releaseDate: row.release_date
  }));
}

export function listChildGameEntities(parentGameId,{includeDrafts=false,limit=100}={}){
  if(!hasGameEntityColumns())return [];
  const where=["parent_game_id=?","entity_type='EXPERIENCE'"];const args=[String(parentGameId||"")];
  if(!includeDrafts)where.push("status='PUBLISHED'","visibility='PUBLIC'");
  const rows=db.prepare(`SELECT * FROM games WHERE ${where.join(" AND ")} ORDER BY name LIMIT ?`).all(...args,Math.min(500,Math.max(1,Number(limit)||100)));
  return rows.map(row=>mapGame(row));
}

export function parentGameFor(gameOrId){
  const game=typeof gameOrId==="object"?gameOrId:getGameById(String(gameOrId||""));
  if(!game?.parentGameId)return null;return getGameById(game.parentGameId);
}

export function setGameEntityClassification(gameId,{entityType="GAME",parentGameId=null,relationshipType="",visibility="PUBLIC"}={}){
  if(!hasGameEntityColumns())throw new Error("ENTITY_CLASSIFICATION_SCHEMA_REQUIRED");
  const type=String(entityType||"GAME").toUpperCase();if(!["GAME","EXPERIENCE"].includes(type))throw new Error("INVALID_ENTITY_TYPE");
  const vis=String(visibility||"PUBLIC").toUpperCase();if(!["PUBLIC","UNLISTED","PRIVATE"].includes(vis))throw new Error("INVALID_VISIBILITY");
  const parent=parentGameId?getGameById(String(parentGameId)):null;if(type==="EXPERIENCE"&&!parent)throw new Error("PARENT_GAME_REQUIRED");
  const root=type==="EXPERIENCE"?(parent.rootGameId||parent.id):String(gameId);
  db.prepare(`UPDATE games SET entity_type=?,parent_game_id=?,root_game_id=?,relationship_type=?,visibility=?,updated_at=? WHERE id=?`).run(type,type==="EXPERIENCE"?parent.id:null,root,type==="EXPERIENCE"?(relationshipType||"EXPERIENCE_OF"):String(relationshipType||""),vis,nowIso(),String(gameId));
  return getGameById(gameId);
}

export function upsertGame(input) {
  const now = nowIso();
  const slug = input.slug || slugify(input.name || input.nome);
  const name = input.name || input.nome;
  if (!name) throw new Error("Nome do jogo é obrigatório.");
  const existing = db.prepare(`SELECT id,created_at FROM games WHERE slug=?`).get(slug);
  const id = existing?.id || stableId("game", slug);
  const template = input.template || "generic";
  const aliases = input.aliases || [];
  const tabs = buildMenu({ tabs: input.tabs || [], template });

  transaction(() => {
    db.prepare(`INSERT INTO games(id,slug,name,description,developer,publisher,release_date,platforms_json,genres_json,franchise,official_url,status,template,aliases_json,visual_query,created_at,updated_at)
      VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
      ON CONFLICT(slug) DO UPDATE SET name=excluded.name,description=excluded.description,developer=excluded.developer,publisher=excluded.publisher,release_date=excluded.release_date,platforms_json=excluded.platforms_json,genres_json=excluded.genres_json,franchise=excluded.franchise,official_url=excluded.official_url,status=excluded.status,template=excluded.template,aliases_json=excluded.aliases_json,visual_query=excluded.visual_query,updated_at=excluded.updated_at`)
      .run(id, slug, name, input.description || input.descricao || "", input.developer || input.desenvolvedor || "", input.publisher || input.publicadora || "", input.releaseDate || input.lancamento || "", json(input.platforms || input.plataformas || []), json(input.genres || input.generos || []), input.franchise || input.franquia || "", input.officialUrl || input.siteOficial || "", input.status || "PUBLISHED", template, json(aliases), input.visualQuery || name, existing?.created_at || now, now);

    db.prepare(`DELETE FROM game_tabs WHERE game_id=?`).run(id);
    db.prepare(`DELETE FROM game_sections WHERE game_id=?`).run(id);
    const tabStmt = db.prepare(`INSERT INTO game_tabs(id,game_id,tab_id,label,icon,description,position) VALUES(?,?,?,?,?,?,?)`);
    const sectionStmt = db.prepare(`INSERT INTO game_sections(id,game_id,tab_id,section_id,label,description,position) VALUES(?,?,?,?,?,?,?)`);
    tabs.forEach((tab, tabIndex) => {
      tabStmt.run(stableId("tab", id, tab.id), id, tab.id, tab.label, tab.icon || "•", tab.description || "", tabIndex);
      (tab.sections || []).forEach((section, sectionIndex) => {
        sectionStmt.run(stableId("section", id, tab.id, section.id), id, tab.id, section.id, section.label, section.description || "", sectionIndex);
      });
    });
  });

  return getGameBySlug(slug);
}


export function setGameStatus(id,status) {
  const allowed=new Set(["DRAFT","PUBLISHED","ARCHIVED"]);
  if(!allowed.has(status))throw new Error("Status de jogo inválido.");
  db.prepare(`UPDATE games SET status=?,updated_at=? WHERE id=?`).run(status,nowIso(),id);
  return getGameById(id);
}

export function gameCount({entityType="GAME"}={}) {
  if(hasGameEntityColumns()&&entityType)return Number(db.prepare(`SELECT COUNT(*) AS count FROM games WHERE entity_type=?`).get(String(entityType).toUpperCase()).count);
  return Number(db.prepare(`SELECT COUNT(*) AS count FROM games`).get().count);
}
