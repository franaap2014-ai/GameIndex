import { listGames, getGameById } from "../database/repositories/game-repository.mjs";
import { searchEntities } from "../database/repositories/entity-repository.mjs";
import { searchKnowledge } from "../database/repositories/knowledge-repository.mjs";
import { gamePublicVisual } from "../images/public-visual.mjs";
import { listArticles } from "../database/repositories/article-repository.mjs";
import { listPages } from "../database/repositories/page-repository.mjs";
import { jaccardScore, normalizeText, overlapScore } from "../knowledge/normalize.mjs";
import { db } from "../database/connection.mjs";

function gameScore(game,query) {
  const n=normalizeText(query);
  const names=[game.nome,game.slug,...(game.aliases||[])];
  let score=0;
  for (const name of names) {
    const nn=normalizeText(name);
    if (nn===n) score=Math.max(score,1);
    else if (nn.includes(n) || n.includes(nn)) score=Math.max(score,.75);
    else score=Math.max(score,jaccardScore(n,nn),overlapScore(n,nn)*.8);
  }
  score=Math.max(score,jaccardScore(n,`${game.nome} ${game.descricao} ${(game.generos||[]).join(" ")}`)*.75);
  return score;
}

function prePublicIndexed(query,{gameId=null,limit=30,language="pt-BR"}={}){
  try{
    const exists=db.prepare(`SELECT 1 FROM sqlite_master WHERE type='table' AND name='pre_public_search_index'`).get();
    if(!exists)return [];
    const n=normalizeText(query),where=[`publish_state='PUBLISHED'`,`language=?`],args=[language];
    if(gameId){where.push(`game_id=?`);args.push(gameId);}
    const rows=db.prepare(`SELECT * FROM pre_public_search_index WHERE ${where.join(" AND ")} ORDER BY updated_at DESC LIMIT 300`).all(...args);
    return rows.map(row=>{const hay=`${row.title} ${row.subtitle} ${row.summary} ${row.keywords}`,titleN=normalizeText(row.title);let score=Math.max(jaccardScore(n,hay),overlapScore(n,hay)*.88);if(titleN===n)score=1;else if(titleN.includes(n)||n.includes(titleN))score=Math.max(score,.82);return {type:row.subject_type||"PAGE",score,title:row.title,subtitle:row.subtitle||"GameIndex Universe",description:localizedText(row.summary||"Página verificada do GameIndex",language),url:row.href,gameId:row.game_id,pageId:row.subject_type==="PAGE"?row.subject_id:null,prePublicIndexed:true};}).filter(x=>x.score>.08).sort((a,b)=>b.score-a.score).slice(0,limit);
  }catch{return [];}
}
function localizedText(text="",language="pt-BR") { const value=String(text||""),low=` ${value.toLowerCase()} `,en=[" the "," with "," from "," where "," which "," can "].filter(x=>low.includes(x)).length,pt=[" para "," com "," jogo "," onde "," que "," uma "].filter(x=>low.includes(x)).length,es=[" para "," con "," juego "," dónde "," que "," una "].filter(x=>low.includes(x)).length;if(language==="pt-BR"&&en>=2&&pt===0)return "Conteúdo verificado disponível ao abrir este resultado.";if(language==="en-US"&&pt>=2&&en===0)return "Verified content is available when you open this result.";if(language==="es-ES"&&(en>=2||pt>=2)&&es===0)return "Contenido verificado disponible al abrir este resultado.";return value; }

export function searchGameVault(query,{gameId=null,limit=30,language="pt-BR"}={}) {
  const q=String(query||"").trim();
  if (!q) return {query:q,results:[],total:0};
  const publishedGames=listGames({includeDrafts:false});
  const publishedIds=new Set(publishedGames.map(g=>g.id));
  const games=publishedGames.map(game=>({...game,score:gameScore(game,q)})).filter(game=>game.score>.08).map(game=>{const isExperience=game.entityType==="EXPERIENCE";const parent=isExperience&&game.parentGameId?getGameById(game.parentGameId):null;return {type:isExperience?"EXPERIENCE":"GAME",score:game.score,title:game.nome,subtitle:isExperience?`${parent?.nome||"Roblox"} Experience`:(game.generos||[]).join(" · "),description:localizedText(game.descricao,language),url:isExperience&&parent?`/game/${encodeURIComponent(parent.slug)}/${encodeURIComponent(game.slug)}`:`/game.html?slug=${encodeURIComponent(game.slug)}`,game:{id:game.id,name:game.nome,slug:game.slug,entityType:game.entityType||"GAME",parentGameId:game.parentGameId||null},visual:gamePublicVisual(game)};});
  const entities=searchEntities(q,{gameId,limit:limit}).filter(entity=>publishedIds.has(entity.gameId)).map(entity=>({type:"ENTITY",score:Math.min(.98,entity.score+.03),title:entity.name,subtitle:entity.type,description:localizedText(entity.summary,language),url:`/entity.html?id=${encodeURIComponent(entity.id)}`,gameId:entity.gameId,entity:{id:entity.id,slug:entity.slug,type:entity.type}}));
  const knowledge=searchKnowledge(q,{gameId,limit}).filter(item=>publishedIds.has(item.gameId)).map(item=>({type:"KNOWLEDGE",score:item.score,title:item.title,subtitle:`${item.tabId} · ${item.sectionId}`,description:localizedText(item.summary,language),url:`/knowledge.html?id=${encodeURIComponent(item.id)}`,gameId:item.gameId,knowledgeId:item.id,status:item.status,canonStatus:item.canonStatus}));
  const articles=listArticles({gameId,status:"PUBLISHED",language,limit:200}).entries.filter(article=>publishedIds.has(article.gameId)).map(article=>{const hay=[article.title,article.articleType,article.content?.summary,...(article.content?.sections||[]).map(s=>s.heading)].filter(Boolean).join(" ");let score=Math.max(jaccardScore(q,hay),overlapScore(q,hay)*.82);if(normalizeText(article.title)===normalizeText(q))score=1;else if(normalizeText(hay).includes(normalizeText(q))&&normalizeText(q).length>2)score=Math.max(score,.72);return {type:"ARTICLE",score,title:article.title,subtitle:`Article · ${article.articleType}`,description:localizedText(article.content?.summary||"GameIndex Article",language),url:`/article.html?id=${encodeURIComponent(article.id)}`,gameId:article.gameId,articleId:article.id};}).filter(a=>a.score>.08);
  const pages=listPages({status:"PUBLISHED",language,limit:200}).entries.filter(page=>publishedIds.has(page.gameId)).map(page=>{const hay=[page.title,page.subtitle,page.summary,...(page.content?.sections||[]).map(s=>`${s.heading||""} ${(s.paragraphs||[]).join(" ")}`)].filter(Boolean).join(" ");let score=Math.max(jaccardScore(q,hay),overlapScore(q,hay)*.84);if(normalizeText(page.title)===normalizeText(q))score=1;else if(normalizeText(hay).includes(normalizeText(q))&&normalizeText(q).length>2)score=Math.max(score,.72);return {type:"PAGE",score,title:page.title,subtitle:`${page.pageType} · GameIndex Page`,description:localizedText(page.summary||"Página estruturada do GameIndex",language),url:`/generated-page.html?id=${encodeURIComponent(page.id)}`,gameId:page.gameId,pageId:page.id};}).filter(p=>p.score>.08);
  const indexed=prePublicIndexed(q,{gameId,limit,language});
  const merged=[...games,...entities,...knowledge,...articles,...pages,...indexed].sort((a,b)=>b.score-a.score),seen=new Set(),results=[];for(const item of merged){const key=`${item.type}:${item.url}`;if(seen.has(key))continue;seen.add(key);results.push(item);if(results.length>=limit)break;}
  return {query:q,results,total:results.length,indexedResults:results.filter(x=>x.prePublicIndexed).length};
}
