import { brotliCompress, gzip } from "node:zlib";
import { performanceConfig, PERFORMANCE_MODE } from "../config/performance-config.mjs";
import { listGamesPage } from "../database/repositories/game-repository.mjs";
import { gamePublicVisual } from "../images/public-visual.mjs";

function clamp(n,min,max,fallback){n=Number(n);return Number.isFinite(n)?Math.min(max,Math.max(min,Math.trunc(n))):fallback;}
function publicCache(res){res.setHeader("Cache-Control",`public, max-age=${performanceConfig.publicCacheSeconds}, stale-while-revalidate=${performanceConfig.staleWhileRevalidateSeconds}`);return res;}

export function installPerformanceMiddleware(app){
  app.use((req,res,next)=>{
    res.setHeader("X-GameIndex-Performance-Mode",PERFORMANCE_MODE?"1":"0");
    if(req.method!=="GET"&&req.method!=="HEAD")return next();
    const accepted=req.acceptsEncodings("br","gzip");
    if(!accepted)return next();
    const originalSend=res.send.bind(res);
    res.send=function compressedSend(body){
      if(res.getHeader("Content-Encoding")||res.statusCode===204||res.statusCode===304)return originalSend(body);
      const type=String(res.getHeader("Content-Type")||"");
      if(!/(json|javascript|text|xml|svg|css|html)/i.test(type))return originalSend(body);
      const source=Buffer.isBuffer(body)?body:typeof body==="string"?Buffer.from(body):null;
      if(!source||source.length<1024)return originalSend(body);
      const done=encoding=>(error,compressed)=>{
        if(error)return originalSend(body);
        res.setHeader("Content-Encoding",encoding);
        res.vary("Accept-Encoding");
        res.removeHeader("Content-Length");
        return originalSend(compressed);
      };
      if(accepted==="br"){brotliCompress(source,done("br"));return res;}
      gzip(source,done("gzip"));return res;
    };
    next();
  });
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
