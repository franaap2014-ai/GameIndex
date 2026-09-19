import { db, migrateDatabase, schemaVersion, verifyDatabase } from "./connection.mjs";
import { GAME_SEEDS, ENTITY_SEEDS, GAME_KNOWLEDGE_SEEDS, ENTITY_KNOWLEDGE_SEEDS } from "./seed-data.mjs";
import { upsertGame, getGameBySlug, findGameByNameOrAlias } from "./repositories/game-repository.mjs";
import { upsertEntity, getEntityBySlug } from "./repositories/entity-repository.mjs";
import { upsertKnowledge } from "./repositories/knowledge-repository.mjs";
import { upsertRelationship } from "./repositories/relationship-repository.mjs";
import { upsertSource } from "./repositories/source-repository.mjs";
import { slugify } from "../knowledge/normalize.mjs";
import { seedBeta06Knowledge } from "./seed-beta06.mjs";
import { seedBeta065Knowledge } from "./seed-beta065.mjs";
import { generateFeaturedArticlesForGame } from "../articles/article-ai.mjs";
import { listArticles } from "./repositories/article-repository.mjs";
import { listGames, getGameBySlug as getGameBySlugForArticles } from "./repositories/game-repository.mjs";

function gameSeedSource(game) {
  return upsertSource({
    url:`gamevault://seed/${game.slug}`,
    title:`GameIndex curated seed — ${game.nome}`,
    sourceType:"CURATED_SEED",
    adapterKey:"seed",
    quality:.72,
    metadata:{ purpose:"Initial Beta knowledge package", revalidationRecommended:true }
  });
}

function seededClaim(text, sourceId, confidence=.72, canonStatus="NOT_APPLICABLE", status="CURRENT") {
  return { text, sourceIds:[sourceId], confidence, canonStatus, status };
}

export function initializeDatabase() {
  let migrationError=null;
  try{migrateDatabase();}catch(error){migrationError=error;}
  let games=0;
  try{games=Number(db.prepare(`SELECT COUNT(*) count FROM games`).get()?.count||0);}catch{}
  if(migrationError&&(!verifyDatabase().ok||games===0))throw migrationError;
  if(games>0)return {ready:true,seeded:false,degraded:Boolean(migrationError),migrationError:migrationError?String(migrationError.message||migrationError):"",schema:schemaVersion(),games};
  seedDatabase({skipMigration:true});
  games=Number(db.prepare(`SELECT COUNT(*) count FROM games`).get()?.count||0);
  return {ready:true,seeded:true,degraded:false,migrationError:"",schema:schemaVersion(),games};
}

export function seedDatabase({skipMigration=false}={}) {
  if(!skipMigration)migrateDatabase();

  for (const input of GAME_SEEDS) upsertGame(input);

  const sourceByGame = new Map();
  for (const input of GAME_SEEDS) {
    const game = getGameBySlug(slugify(input.name));
    if (!game) continue;
    const source = gameSeedSource(game);
    sourceByGame.set(game.id, source);
    upsertKnowledge({
      gameId:game.id,
      title:`${game.nome} — visão geral`,
      summary:game.descricao,
      canonStatus:"NOT_APPLICABLE",
      status:"CURRENT",
      confidence:.78,
      tabId:"overview",
      sectionId:"summary",
      topics:["overview","game"],
      claims:[
        seededClaim(`${game.nome} é desenvolvido por ${game.desenvolvedor || "desenvolvedor ainda a revalidar"}.`,source.id,.75),
        ...(game.lancamento ? [seededClaim(`O lançamento original registrado no pacote base é ${game.lancamento}.`,source.id,.72)] : []),
        ...(game.generos?.length ? [seededClaim(`O GameIndex classifica o jogo principalmente como ${game.generos.join(" e ")}.`,source.id,.68)] : [])
      ]
    });
  }

  for (const seed of GAME_KNOWLEDGE_SEEDS) {
    const game = findGameByNameOrAlias(seed.game);
    if (!game) continue;
    const source = sourceByGame.get(game.id) || gameSeedSource(game);
    const confidence = seed.confidence ?? .72;
    const canonStatus = seed.canon || "NOT_APPLICABLE";
    const status = seed.status || "CURRENT";
    upsertKnowledge({
      gameId:game.id,
      title:seed.title,
      summary:seed.summary,
      canonStatus,
      status,
      confidence,
      tabId:seed.tab,
      sectionId:seed.section,
      topics:seed.topics || [],
      claims:(seed.claims || []).map(text=>seededClaim(text,source.id,confidence,canonStatus,status))
    });
  }

  const pendingRelations = [];
  for (const seed of ENTITY_SEEDS) {
    const game = findGameByNameOrAlias(seed.game);
    if (!game) continue;
    const source = sourceByGame.get(game.id) || gameSeedSource(game);
    const entity = upsertEntity({ gameId:game.id, name:seed.name, type:seed.type, aliases:seed.aliases || [], summary:seed.summary });
    const canonStatus = seed.canon || "NOT_APPLICABLE";
    upsertKnowledge({
      gameId:game.id,
      entityId:entity.id,
      title:seed.name,
      summary:seed.summary,
      canonStatus,
      status:"CURRENT",
      confidence:seed.canon === "THEORY" ? .66 : .76,
      tabId:seed.tab,
      sectionId:seed.section,
      topics:[seed.type, seed.tab, seed.section],
      claims:(seed.claims || []).map(text=>seededClaim(text,source.id,seed.canon === "THEORY" ? .66 : .76,canonStatus,"CURRENT"))
    });
    for (const relationship of seed.relationships || []) pendingRelations.push({game,sourceEntity:entity,relationship});
  }

  for (const item of pendingRelations) {
    let target = getEntityBySlug(item.game.id, slugify(item.relationship.target));
    if (!target) target = upsertEntity({ gameId:item.game.id, name:item.relationship.target, type:"unknown", aliases:[], summary:"" });
    upsertRelationship({ gameId:item.game.id, sourceEntityId:item.sourceEntity.id, relationType:item.relationship.type, targetEntityId:target.id });
  }

  for (const seed of ENTITY_KNOWLEDGE_SEEDS) {
    const game = findGameByNameOrAlias(seed.game);
    if (!game) continue;
    const entity = getEntityBySlug(game.id, slugify(seed.entity));
    if (!entity) continue;
    const source = sourceByGame.get(game.id) || gameSeedSource(game);
    const canonStatus = seed.canon || "UNKNOWN";
    const confidence = seed.confidence ?? .7;
    upsertKnowledge({ gameId:game.id, entityId:entity.id, title:seed.title, summary:seed.summary, canonStatus, status:"CURRENT", confidence, tabId:seed.tab, sectionId:seed.section, topics:seed.topics||[], claims:(seed.claims||[]).map(text=>seededClaim(text,source.id,confidence,canonStatus,"CURRENT")) });
  }

  seedBeta06Knowledge();
  seedBeta065Knowledge();
  for (const row of listGames({includeDrafts:false})) {
    const game=getGameBySlugForArticles(row.slug);
    if(!game)continue;
    // Beta 0.87 stability: seed articles only when the game has no article records yet.
    // Startup must not continually rewrite review states or reintroduce legacy misclassification.
    if(listArticles({gameId:game.id,limit:1}).total===0){try { generateFeaturedArticlesForGame(game,{limit:4,language:"pt-BR"}); } catch {}}
  }
  // Beta 0.705: never blanket-downgrade previously approved images at startup.
  // Legacy verified remote assets remain displayable through the central resolver
  // until Image Memory can migrate them safely.
}
