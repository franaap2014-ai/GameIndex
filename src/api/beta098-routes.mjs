import { getGameById, getGameBySlug } from "../database/repositories/game-repository.mjs";
import { requireCapability } from "../access/capability-service.mjs";
import { startUniverseV2, universeV2Status } from "../universe/universe-builder-v2.mjs";
import { listJobs } from "../core98/job-engine.mjs";
import { core98WorkerStatus } from "../core98/worker-runtime.mjs";
import { operationSummary } from "../core98/metrics.mjs";
import { recentCoreEvents } from "../core98/message-bus.mjs";
import { imageEngine3Summary } from "../images/image-engine3.mjs";
import { schemaVersion } from "../database/connection.mjs";

function gameFrom(value){return getGameById(String(value||""))||getGameBySlug(String(value||""));}
function actor(req){return req.user?.id||req.auth?.user?.id||req.session?.user?.id||null;}
export function registerBeta098Routes(app){
  // Media Runtime 2 is intentionally removed in HF2. Keep explicit compatibility responses.
  app.get("/media/images/:id/rev/:revision",(req,res)=>res.status(410).json({error:"MEDIA_RUNTIME_2_REMOVED",replacement:"/media/v3/images/:assetId/rev/:revision"}));
  app.post("/api/media/runtime/browser-result",(req,res)=>res.status(410).json({ok:false,error:{code:"MEDIA_RUNTIME_2_REMOVED",replacement:"/api/image-engine3/browser-result"}}));
  app.get("/api/media/runtime/summary",requireCapability("image_management"),(req,res)=>res.json({ok:true,deprecated:true,replacedBy:"IMAGE_ENGINE_3",media:imageEngine3Summary()}));
  app.post("/api/universe-v2/games/:game/build-entire",requireCapability("universe_build"),(req,res)=>{const game=gameFrom(req.params.game);if(!game)return res.status(404).json({ok:false,error:{code:"GAME_NOT_FOUND",message:"Jogo não encontrado."}});const status=startUniverseV2(game,{language:req.body?.language||"pt-BR",userId:actor(req)});res.status(202).json({ok:true,accepted:true,build:"0.986",status});});
  app.get("/api/universe-v2/games/:game/status",requireCapability("universe_build"),(req,res)=>{const game=gameFrom(req.params.game);if(!game)return res.status(404).json({ok:false,error:{code:"GAME_NOT_FOUND",message:"Jogo não encontrado."}});res.json({ok:true,status:universeV2Status(game,{language:req.query.language||"pt-BR"})});});
  app.get("/api/universe-v2/games/:game/jobs",requireCapability("universe_build"),(req,res)=>{const game=gameFrom(req.params.game);if(!game)return res.status(404).json({ok:false,error:{code:"GAME_NOT_FOUND"}});res.json({ok:true,...listJobs({gameId:game.id,state:req.query.state||null,jobType:req.query.jobType||null,limit:req.query.limit||50,offset:req.query.offset||0})});});
  app.get("/api/ai-complex-8/status",requireCapability("ai_diagnostics"),(req,res)=>res.json({ok:true,version:"8.5",runtime:"LOCAL_FIRST_NO_API_KEY",apiKeyRequired:false,core:{orchestrator:"DETERMINISTIC",messageBus:"DETERMINISTIC",stateMachine:"DETERMINISTIC",queueEngine:"DETERMINISTIC",imageRuntime:"IMAGE_ENGINE_3_NATIVE",searchIndexer:"DETERMINISTIC",relationshipEngine:"DETERMINISTIC_FIRST"},intelligence:{scripts:"PRIMARY",dexterOllama:"OPTIONAL_SEMANTIC_EDGE",legacyAI:"REMOVED"},operations:operationSummary({minutes:req.query.minutes||1440}),workers:core98WorkerStatus()}));
  app.get("/api/ai-complex-8/events",requireCapability("ai_diagnostics"),(req,res)=>res.json({ok:true,entries:recentCoreEvents({gameId:req.query.gameId||null,limit:req.query.limit||50})}));
  app.get("/api/beta098/release-contract",requireCapability("creator_control"),(req,res)=>res.json({ok:true,deprecated:true,gate:{release:"0.986",status:"SUPERSEDED_BY_0_986",imageRuntime:"IMAGE_ENGINE_3_NATIVE",legacyMediaRuntime:"REMOVED",apiKeyRequired:false,azureLiveValidation:"PENDING"}}));
  app.get("/api/beta098/status",(req,res)=>res.json({ok:true,version:"0.986",build:"DELIVERY_RECOVERY",schema:schemaVersion(),runtime:"LOCAL_FIRST_NO_API_KEY",apiKeyRequired:false,manualAzureImageApprovalRequired:false,universeDiscoveryJobRequired:true,media:imageEngine3Summary(),legacyMediaRuntime:"REMOVED"}));
}
