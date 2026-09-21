import { db, nowIso } from "../connection.mjs";

function mapGame(row){
  return row?{
    id:row.id,slug:row.slug,nome:row.name,descricao:row.description,desenvolvedor:row.developer,franquia:row.franchise,
    favoritedAt:row.created_at,sortOrder:Number(row.sort_order||0)
  }:null;
}
export function favoriteGame(userId,gameId){
  const game=db.prepare(`SELECT id FROM games WHERE id=? AND status='PUBLISHED'`).get(String(gameId));
  if(!game)throw Object.assign(new Error("Jogo não encontrado."),{code:"GAME_NOT_FOUND"});
  const next=Number(db.prepare(`SELECT COALESCE(MAX(sort_order),-1)+1 value FROM user_favorite_games WHERE user_id=?`).get(String(userId))?.value||0);
  db.prepare(`INSERT INTO user_favorite_games(user_id,game_id,sort_order,created_at) VALUES(?,?,?,?) ON CONFLICT(user_id,game_id) DO NOTHING`).run(String(userId),String(gameId),next,nowIso());
  return true;
}
export function unfavoriteGame(userId,gameId){
  db.prepare(`DELETE FROM user_favorite_games WHERE user_id=? AND game_id=?`).run(String(userId),String(gameId));
  return false;
}
export function isGameFavorite(userId,gameId){
  return Boolean(db.prepare(`SELECT 1 FROM user_favorite_games WHERE user_id=? AND game_id=?`).get(String(userId),String(gameId)));
}
export function favoriteGameCount(userId){
  return Number(db.prepare(`SELECT COUNT(*) count FROM user_favorite_games WHERE user_id=?`).get(String(userId))?.count||0);
}
export function listFavoriteGames(userId,{limit=20,offset=0}={}){
  const n=Math.max(1,Math.min(100,Number(limit)||20)),o=Math.max(0,Number(offset)||0);
  return db.prepare(`SELECT g.*,f.created_at,f.sort_order FROM user_favorite_games f JOIN games g ON g.id=f.game_id WHERE f.user_id=? AND g.status='PUBLISHED' ORDER BY f.sort_order ASC,f.created_at DESC LIMIT ? OFFSET ?`).all(String(userId),n,o).map(mapGame);
}
export function reorderFavoriteGames(userId,gameIds=[]){
  const ids=[...new Set((gameIds||[]).map(String))].slice(0,100);
  const stmt=db.prepare(`UPDATE user_favorite_games SET sort_order=? WHERE user_id=? AND game_id=?`);
  ids.forEach((id,index)=>stmt.run(index,String(userId),id));
  return listFavoriteGames(userId,{limit:100});
}
