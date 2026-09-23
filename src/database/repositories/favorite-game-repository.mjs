import { db, nowIso } from "../connection.mjs";

function mapGame(row){
  return row?{
    id:row.id,slug:row.slug,nome:row.name,descricao:row.description,desenvolvedor:row.developer,franquia:row.franchise,
    favoritedAt:row.created_at,sortOrder:Number(row.sort_order||0)
  }:null;
}

function favoriteTableReady(){
  try{return Boolean(db.prepare(`SELECT 1 FROM sqlite_master WHERE type='table' AND name='user_favorite_games' LIMIT 1`).get());}
  catch{return false;}
}

function requireFavoriteTable(){
  if(favoriteTableReady())return;
  throw Object.assign(new Error("Jogos favoritos estão temporariamente indisponíveis enquanto a atualização do perfil é concluída."),{
    code:"FAVORITES_SCHEMA_REQUIRED",
    status:503
  });
}

export function favoriteGame(userId,gameId){
  requireFavoriteTable();
  const game=db.prepare(`SELECT id FROM games WHERE id=? AND status='PUBLISHED'`).get(String(gameId));
  if(!game)throw Object.assign(new Error("Jogo não encontrado."),{code:"GAME_NOT_FOUND"});
  const next=Number(db.prepare(`SELECT COALESCE(MAX(sort_order),-1)+1 value FROM user_favorite_games WHERE user_id=?`).get(String(userId))?.value||0);
  db.prepare(`INSERT INTO user_favorite_games(user_id,game_id,sort_order,created_at) VALUES(?,?,?,?) ON CONFLICT(user_id,game_id) DO NOTHING`).run(String(userId),String(gameId),next,nowIso());
  return true;
}
export function unfavoriteGame(userId,gameId){
  requireFavoriteTable();
  db.prepare(`DELETE FROM user_favorite_games WHERE user_id=? AND game_id=?`).run(String(userId),String(gameId));
  return false;
}
export function isGameFavorite(userId,gameId){
  if(!favoriteTableReady())return false;
  return Boolean(db.prepare(`SELECT 1 FROM user_favorite_games WHERE user_id=? AND game_id=?`).get(String(userId),String(gameId)));
}
export function favoriteGameCount(userId){
  if(!favoriteTableReady())return 0;
  return Number(db.prepare(`SELECT COUNT(*) count FROM user_favorite_games WHERE user_id=?`).get(String(userId))?.count||0);
}
export function listFavoriteGames(userId,{limit=20,offset=0}={}){
  if(!favoriteTableReady())return [];
  const n=Math.trunc(Math.max(1,Math.min(100,Number(limit)||20))),o=Math.trunc(Math.max(0,Math.min(100000,Number(offset)||0)));
  return db.prepare(`SELECT g.*,f.created_at,f.sort_order FROM user_favorite_games f JOIN games g ON g.id=f.game_id WHERE f.user_id=? AND g.status='PUBLISHED' ORDER BY f.sort_order ASC,f.created_at DESC LIMIT ? OFFSET ?`).all(String(userId),n,o).map(mapGame);
}
export function reorderFavoriteGames(userId,gameIds=[]){
  requireFavoriteTable();
  if(!Array.isArray(gameIds))throw Object.assign(new Error("Envie uma lista de jogos."),{status:422,code:"FAVORITES_LIST_INVALID"});
  const ids=[...new Set(gameIds.map(String))].slice(0,100);
  const stmt=db.prepare(`UPDATE user_favorite_games SET sort_order=? WHERE user_id=? AND game_id=?`);
  ids.forEach((id,index)=>stmt.run(index,String(userId),id));
  return listFavoriteGames(userId,{limit:100});
}
