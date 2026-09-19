import { db, nowIso } from "../connection.mjs";

function mapGame(row){
  return row?{id:row.id,slug:row.slug,nome:row.name,descricao:row.description,desenvolvedor:row.developer,franquia:row.franchise,followedAt:row.followed_at}:null;
}

export function followGame(userId,gameId){
  db.prepare(`INSERT INTO user_followed_games(user_id,game_id,followed_at) VALUES(?,?,?) ON CONFLICT(user_id,game_id) DO NOTHING`).run(userId,gameId,nowIso());
  return isFollowing(userId,gameId);
}
export function unfollowGame(userId,gameId){db.prepare(`DELETE FROM user_followed_games WHERE user_id=? AND game_id=?`).run(userId,gameId);return false;}
export function isFollowing(userId,gameId){return Boolean(db.prepare(`SELECT 1 ok FROM user_followed_games WHERE user_id=? AND game_id=?`).get(userId,gameId));}
export function listFollowedGames(userId,{limit=100}={}){
  return db.prepare(`SELECT g.*,f.followed_at FROM user_followed_games f JOIN games g ON g.id=f.game_id WHERE f.user_id=? AND g.status='PUBLISHED' ORDER BY f.followed_at DESC LIMIT ?`).all(userId,limit).map(mapGame);
}
export function followedCount(userId){return Number(db.prepare(`SELECT COUNT(*) count FROM user_followed_games WHERE user_id=?`).get(userId).count);}
