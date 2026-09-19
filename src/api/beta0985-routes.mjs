import { db, schemaVersion } from "../database/connection.mjs";
import { getGameById, getGameBySlug } from "../database/repositories/game-repository.mjs";
import { getEntityById } from "../database/repositories/entity-repository.mjs";
import { requireCapability, requireSameOriginMutation } from "../access/capability-service.mjs";
import { currentAuth } from "../auth/auth-service.mjs";
import { dexterStatus, recentDexterTasks, runDexterTask } from "../dexter/dexter-service.mjs";
import { getImage3Binary, image3AssetDetail, imageEngine3Summary, registerImage3BrowserResult, resolveImage3, scheduleImage3Repair } from "../images/image-engine3.mjs";
import { gamePublicVisual, entityPublicVisual } from "../images/public-visual.mjs";
import { core85Health, performanceSnapshot, reindexMissingPages, repairStalledJobs, retryDegradedImages } from "../core85/control-plane.mjs";
import { generationRuntimeSummary } from "../pages/generation-runner.mjs";

function gameFrom(value){return getGameById(String(value||""))||getGameBySlug(String(value||""));}
function actor(req){return currentAuth(req)?.user?.id||null;}
function noStore(res){res.setHeader("Cache-Control","no-store");return res;}

export function registerBeta0985Routes(app){
  app.get("/media/v3/images/:assetId/rev/:revision",(req,res)=>{
    const binary=getImage3Binary(req.params.assetId,Number(req.params.revision));if(!binary)return res.status(404).json({error:"MEDIA_NOT_FOUND"});
    res.setHeader("Content-Type",binary.mimeType||"application/octet-stream");res.setHeader("Content-Length",String(binary.byteSize||binary.bytes.length));res.setHeader("Cache-Control","public, max-age=31536000, immutable");res.setHeader("ETag",`"${binary.checksum}"`);res.setHeader("X-Content-Type-Options","nosniff");res.setHeader("Cross-Origin-Resource-Policy","same-origin");res.send(Buffer.from(binary.bytes));
  });

  app.get("/api/beta0985/status",async(req,res)=>{const health=await core85Health({probeDexter:false});res.json({ok:true,version:"0.986",semanticVersion:"0.986.0",hotfix:"CONSOLIDATED",codename:"PRODUCTION_CONSOLIDATION",schema:schemaVersion(),runtime:"LOCAL_FIRST_NO_API_KEY",apiKeyRequired:false,manualAzureImageApprovalRequired:false,generation:generationRuntimeSummary(),imageEngine:imageEngine3Summary(),music:{runtime:"YOUTUBE_MUSIC_MANAGER_1",player:"SINGLE_LAZY_GLOBAL",apiKeyRequired:false,bundledTracks:0,legacyAudioRuntime:false},core:"GI_CORE_8.5",dexter:{provider:"ollama",model:"gemma3:4b",optional:true,requiredForSiteSurvival:false},health});});
  app.get("/api/core85/health",requireCapability("ai_diagnostics"),async(req,res)=>noStore(res).json({ok:true,health:await core85Health({probeDexter:req.query.probe==="1"})}));
  app.get("/api/core85/performance",requireCapability("ai_diagnostics"),(req,res)=>noStore(res).json({ok:true,performance:performanceSnapshot()}));
  app.post("/api/core85/repair-stalled",requireSameOriginMutation,requireCapability("universe_build"),(req,res)=>res.json({ok:true,result:repairStalledJobs()}));
  app.post("/api/core85/retry-images",requireSameOriginMutation,requireCapability("image_management"),(req,res)=>res.json({ok:true,result:retryDegradedImages({limit:req.body?.limit||100})}));
  app.post("/api/core85/reindex",requireSameOriginMutation,requireCapability("creator_control"),(req,res)=>res.json({ok:true,result:reindexMissingPages({limit:req.body?.limit||250})}));

  app.get("/api/dexter/games",(req,res)=>res.json({ok:true,entries:db.prepare(`SELECT id,slug,name FROM games WHERE status='PUBLISHED' ORDER BY name COLLATE NOCASE`).all().map(row=>({id:row.id,slug:row.slug,name:row.name}))}));
  app.get("/api/dexter/status",requireCapability("ai_diagnostics"),async(req,res)=>noStore(res).json({ok:true,status:await dexterStatus({probe:req.query.probe!=="0"})}));
  app.get("/api/dexter/tasks",requireCapability("ai_diagnostics"),(req,res)=>noStore(res).json({ok:true,entries:recentDexterTasks({limit:req.query.limit||50})}));
  app.post("/api/dexter/semantic-review",requireSameOriginMutation,requireCapability("ai_diagnostics"),async(req,res)=>{const result=await runDexterTask({taskType:"SEMANTIC_REVIEW",gameId:req.body?.gameId||null,entityId:req.body?.entityId||null,input:req.body?.input||{},system:"You are Dexter, the GameIndex semantic reviewer. Return only structured JSON and do not invent evidence.",prompt:req.body?.prompt||"Review the supplied structured input and return JSON with accepted, confidence, reasonCode."});res.status(result.ok?200:503).json(result);});

  app.get("/api/image-engine3/summary",requireCapability("image_management"),(req,res)=>noStore(res).json({ok:true,summary:imageEngine3Summary()}));
  app.get("/api/image-engine3/assets/:id",requireCapability("image_management"),(req,res)=>{const asset=image3AssetDetail(req.params.id,{candidateLimit:req.query.candidates||50,attemptLimit:req.query.attempts||100});if(!asset)return res.status(404).json({ok:false,error:{code:"ASSET_NOT_FOUND"}});res.json({ok:true,asset});});
  app.post("/api/image-engine3/browser-result",requireSameOriginMutation,(req,res)=>{const b=req.body||{};res.json(registerImage3BrowserResult({assetId:String(b.assetId||""),revision:Number(b.revision||0),width:Number(b.width||0),height:Number(b.height||0),contextMatch:b.contextMatch!==false}));});
  app.post("/api/image-engine3/games/:game/resolve",requireSameOriginMutation,requireCapability("image_management"),async(req,res)=>{const game=gameFrom(req.params.game);if(!game)return res.status(404).json({ok:false,error:{code:"GAME_NOT_FOUND"}});const asset=await resolveImage3({game,role:req.body?.role||"COVER",language:req.body?.language||"pt-BR",forceDiscovery:Boolean(req.body?.forceDiscovery)});res.json({ok:true,asset,visual:gamePublicVisual(game)});});
  app.post("/api/image-engine3/entities/:id/resolve",requireSameOriginMutation,requireCapability("image_management"),async(req,res)=>{const entity=getEntityById(req.params.id);if(!entity)return res.status(404).json({ok:false,error:{code:"ENTITY_NOT_FOUND"}});const game=getGameById(entity.gameId);const asset=await resolveImage3({game,entity,role:req.body?.role||null,language:req.body?.language||"pt-BR",forceDiscovery:Boolean(req.body?.forceDiscovery)});res.json({ok:true,asset,visual:entityPublicVisual(entity,game.id)});});
  app.post("/api/image-engine3/assets/:id/repair",requireSameOriginMutation,requireCapability("image_management"),(req,res)=>res.status(202).json({ok:true,result:scheduleImage3Repair(req.params.id,"USER_TRIGGERED_REPAIR")}));

  app.all(["/media/audio/:assetId","/api/games/:game/audio-profile","/api/audio/assets"],(req,res)=>res.status(410).json({ok:false,error:{code:"LEGACY_AUDIO_REMOVED",message:"O antigo runtime de áudio local foi removido. Use o YouTube Music Manager."}}));
}
