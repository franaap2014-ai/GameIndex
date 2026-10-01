import compression from "compression";
import {constants} from "node:zlib";
import { performanceConfig, PERFORMANCE_MODE } from "../config/performance-config.mjs";
import { listGamesPage } from "../database/repositories/game-repository.mjs";
import { gamePublicVisual } from "../images/public-visual.mjs";

function clamp(n,min,max,fallback){n=Number(n);return Number.isFinite(n)?Math.min(max,Math.max(min,Math.trunc(n))):fallback;}
function publicCache(res){res.setHeader("Cache-Control",`public, max-age=${performanceConfig.publicCacheSeconds}, stale-while-revalidate=${performanceConfig.staleWhileRevalidateSeconds}`);return res;}

export function installPerformanceMiddleware(app){
  app.use((req,res,next)=>{res.setHeader("X-GameIndex-Performance-Mode",PERFORMANCE_MODE?"1":"0");next();});
  // Stream compression covers express.static and sendFile as well as JSON responses.
  app.use(compression({
    threshold:1024,
    brotli:{params:{[constants.BROTLI_PARAM_QUALITY]:4}},
    filter(req,res){
      if(!['GET','HEAD'].includes(req.method)||req.headers.range||res.statusCode===206)return false;
      if(/text\/event-stream/i.test(String(res.getHeader('Content-Type')||'')))return false;
      return compression.filter(req,res);
    }
  }));
}

export function paginatedPublicGames(req,res){
  const page=clamp(req.query.page,1,1_000_000,1);
  const limit=clamp(req.query.limit,1,performanceConfig.maxGameLimit,performanceConfig.initialGameLimit);
  const q=String(req.query.q||"").trim(),offset=(page-1)*limit;
  const result=listGamesPage({includeDrafts:false,q,limit,offset});
  const items=result.items.map(game=>({
    id:game.id,slug:game.slug,nome:game.nome,title:game.nome,
    rating:null,platforms:game.plataformas??game.platforms??[],genres:game.generos??[],
    visual:gamePublicVisual(game),
  }));
  publicCache(res);
  res.setHeader("X-Total-Count",String(result.total));
  res.setHeader("X-Page",String(page));
  res.setHeader("X-Limit",String(limit));
  return res.json(items);
}
