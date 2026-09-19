import { db } from "../database/connection.mjs";
import { listGames } from "../database/repositories/game-repository.mjs";
import { listInterestSignals, recommendationsEnabled, recordRecommendationEvent } from "../database/repositories/interest-repository.mjs";

const DAY=86400000;
const WEIGHTS={FOLLOW_GAME:50,VIEW_GAME:14,SEARCH_GAME:10,VIEW_ENTITY:7,VIEW_ARTICLE:5,SAVE_KNOWLEDGE:8,FRANCHISE_INTEREST:24,GENRE_INTEREST:20,RECOMMENDATION_CLICK:9,DISMISS_RECOMMENDATION:-45,UNFOLLOW_GAME:-30};
function ageDecay(iso){const age=Math.max(0,Date.now()-new Date(iso).getTime());return Math.max(.12,Math.exp(-age/(45*DAY)));}
function communityScore(gameId){
  const base=Number(db.prepare(`SELECT baseline_community_score FROM game_discovery_metrics WHERE game_id=?`).get(gameId)?.baseline_community_score||50);
  const follows=Number(db.prepare(`SELECT COUNT(*) count FROM user_followed_games WHERE game_id=?`).get(gameId)?.count||0);
  const activity=Number(db.prepare(`SELECT COUNT(*) count FROM user_activity WHERE game_id=? AND created_at>=?`).get(gameId,new Date(Date.now()-30*DAY).toISOString())?.count||0);
  return base+Math.min(30,follows*3)+Math.min(20,activity*.35);
}
function reasonFor(game,parts){
  if(parts.follow>0)return `Você segue ${game.nome}.`;
  if(parts.franchise>0)return `Relacionado à franquia ${game.franquia}.`;
  if(parts.genre>0)return `Combina com seus gêneros de interesse.`;
  if(parts.activity>0)return `Baseado na sua atividade recente no GameIndex.`;
  return `Popular na comunidade do GameIndex.`;
}
function topCommunity(games,limit){return games.map(game=>({game,score:communityScore(game.id),reason:"TOP_COMMUNITY_FALLBACK",personalized:false})).sort((a,b)=>b.score-a.score||a.game.nome.localeCompare(b.game.nome)).slice(0,limit);}
export function recommendGames({userId=null,limit=10,record=false}={}){
  const games=listGames({includeDrafts:false}).filter(game=>String(game.entityType||"GAME").toUpperCase()==="GAME"),n=Math.min(20,Math.max(1,Number(limit)||10));
  if(!userId||!recommendationsEnabled(userId)){
    const rows=topCommunity(games,n);if(record)rows.forEach(r=>recordRecommendationEvent({userId,gameId:r.game.id,eventType:"IMPRESSION",reason:r.reason,score:r.score}));return {mode:"TOP_COMMUNITY",personalized:false,entries:rows};
  }
  const signals=listInterestSignals(userId,{limit:1000});
  const follows=new Set(db.prepare(`SELECT game_id FROM user_followed_games WHERE user_id=?`).all(userId).map(r=>r.game_id));
  const hasMeaningful=signals.some(s=>["FOLLOW_GAME","VIEW_GAME","SEARCH_GAME","VIEW_ENTITY","GENRE_INTEREST","FRANCHISE_INTEREST"].includes(s.signalType))||follows.size>0;
  if(!hasMeaningful){const rows=topCommunity(games,n);if(record)rows.forEach(r=>recordRecommendationEvent({userId,gameId:r.game.id,eventType:"IMPRESSION",reason:r.reason,score:r.score}));return {mode:"TOP_COMMUNITY",personalized:false,entries:rows};}
  const franchiseScore=new Map(),genreScore=new Map(),gameScore=new Map(),dismissed=new Set();
  for(const s of signals){const w=(s.weight||WEIGHTS[s.signalType]||0)*ageDecay(s.createdAt);if(s.gameId)gameScore.set(s.gameId,(gameScore.get(s.gameId)||0)+w);if(s.franchise)franchiseScore.set(s.franchise.toLowerCase(),(franchiseScore.get(s.franchise.toLowerCase())||0)+w);if(s.genre)genreScore.set(s.genre.toLowerCase(),(genreScore.get(s.genre.toLowerCase())||0)+w);if(s.signalType==="DISMISS_RECOMMENDATION"&&s.gameId)dismissed.add(s.gameId);}
  for(const id of follows)gameScore.set(id,(gameScore.get(id)||0)+50);
  for(const followedId of follows){const fg=games.find(g=>g.id===followedId);if(fg?.franquia)franchiseScore.set(fg.franquia.toLowerCase(),(franchiseScore.get(fg.franquia.toLowerCase())||0)+30);for(const genre of fg?.generos||[])genreScore.set(genre.toLowerCase(),(genreScore.get(genre.toLowerCase())||0)+25);}
  const rows=games.map(game=>{const parts={follow:follows.has(game.id)?50:0,franchise:game.franquia?franchiseScore.get(game.franquia.toLowerCase())||0:0,genre:(game.generos||[]).reduce((s,g)=>s+(genreScore.get(g.toLowerCase())||0),0),activity:gameScore.get(game.id)||0};let score=communityScore(game.id)*.08+parts.follow+parts.franchise*.45+parts.genre*.35+parts.activity;if(dismissed.has(game.id))score-=60;return {game,score,reason:reasonFor(game,parts),personalized:true,parts};}).sort((a,b)=>b.score-a.score||a.game.nome.localeCompare(b.game.nome));
  // Diversity: cap each franchise at 3 entries, unless the catalog is too small.
  const chosen=[],franchiseCounts=new Map();
  for(const row of rows){const key=(row.game.franquia||row.game.slug).toLowerCase();if((franchiseCounts.get(key)||0)>=3)continue;chosen.push(row);franchiseCounts.set(key,(franchiseCounts.get(key)||0)+1);if(chosen.length>=n)break;}
  if(record)chosen.forEach(r=>recordRecommendationEvent({userId,gameId:r.game.id,eventType:"IMPRESSION",reason:r.reason,score:r.score}));
  return {mode:"PERSONALIZED",personalized:true,entries:chosen};
}

function filteredDiscoveryGames({q="",genre="",platform="",franchise="",sort="community"}={}){
  let games=listGames({includeDrafts:false}).filter(game=>String(game.entityType||"GAME").toUpperCase()==="GAME");const term=String(q||"").trim().toLowerCase();
  if(term)games=games.filter(g=>[g.nome,g.slug,...(g.aliases||[])].some(v=>String(v||"").toLowerCase().includes(term)));
  if(genre)games=games.filter(g=>(g.generos||[]).some(x=>String(x).toLowerCase()===String(genre).toLowerCase()));
  if(platform)games=games.filter(g=>(g.plataformas||[]).some(x=>String(x).toLowerCase().includes(String(platform).toLowerCase())));
  if(franchise)games=games.filter(g=>String(g.franquia||"").toLowerCase()===String(franchise).toLowerCase());
  const mapped=games.map(game=>({...game,communityScore:communityScore(game.id)}));
  if(sort==="name")mapped.sort((a,b)=>a.nome.localeCompare(b.nome));else if(sort==="recent")mapped.sort((a,b)=>String(b.lancamento||"").localeCompare(String(a.lancamento||"")));else mapped.sort((a,b)=>b.communityScore-a.communityScore||a.nome.localeCompare(b.nome));
  return mapped;
}

export function discoveryGamesPage({q="",genre="",platform="",franchise="",sort="community",limit=24,offset=0}={}){
  const safeLimit=Math.min(48,Math.max(1,Number(limit)||24)),safeOffset=Math.max(0,Number(offset)||0);
  const mapped=filteredDiscoveryGames({q,genre,platform,franchise,sort});
  return {total:mapped.length,entries:mapped.slice(safeOffset,safeOffset+safeLimit)};
}

export function discoveryGames(options={}){
  return discoveryGamesPage({...options,offset:0,limit:options.limit||100}).entries;
}

export function discoveryFacets(){
  const games=listGames({includeDrafts:false}).filter(game=>String(game.entityType||"GAME").toUpperCase()==="GAME"),genres=new Set(),platforms=new Set();
  for(const game of games){
    for(const value of game.generos||[])if(value)genres.add(String(value));
    for(const value of game.plataformas||[])if(value)platforms.add(String(value));
  }
  const sort=(a,b)=>a.localeCompare(b,undefined,{sensitivity:'base'});
  return {genres:[...genres].sort(sort),platforms:[...platforms].sort(sort)};
}
