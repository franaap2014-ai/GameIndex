import { schemaVersion, storageOrigin } from "../database/connection.mjs";
import { gameCount, getGameBySlug } from "../database/repositories/game-repository.mjs";
import { knowledgeCount } from "../database/repositories/knowledge-repository.mjs";
import { pageCount } from "../database/repositories/page-repository.mjs";
import { operationSummary } from "../core98/metrics.mjs";
import { devAccessSnapshot, requirePageGenerationDev } from "../admin/dev-access.mjs";
import { normalizeLanguage } from "../i18n/language-service.mjs";
import { adminRecoveryStatus, claimAdminRecovery } from "../auth/admin-recovery.mjs";
import { imageEngine3Summary, resolveImage3 } from "../images/image-engine3.mjs";
import { gamePublicVisual } from "../images/public-visual.mjs";
import { handleConstructionStart } from "./beta092-routes.mjs";

function error(res,status,code,message,retryable=false){return res.status(status).json({ok:false,error:{code,message,retryable}});}
function validLanguage(value){return normalizeLanguage(value)||"pt-BR";}
export function registerBeta091Routes(app,{recoveryLimiter,generationLimiter}={}){
  app.get(["/api/beta09/status","/api/beta091/status"],(req,res)=>res.json({product:"GameIndex",version:"Beta 0.986",semanticVersion:"0.986.0",codename:"Production Consolidation",schema:schemaVersion(),games:gameCount(),knowledge:knowledgeCount(),pages:pageCount(),storageOrigin,runtime:"LOCAL_FIRST_NO_API_KEY",apiKeyRequired:false,architecture:"GI_CORE_SCRIPTS_PLUS_OPTIONAL_DEXTER",images:imageEngine3Summary(),operations:operationSummary({minutes:1440}),capabilities:{pageGeneration:true,legacyGameBuild:false,ownerRecovery:true}}));
  app.get("/api/admin-recovery/status",(req,res)=>res.json(adminRecoveryStatus(req)));
  app.post("/api/admin-recovery/claim",recoveryLimiter||((req,res,next)=>next()),(req,res)=>{try{res.json(claimAdminRecovery(req,res,req.body||{}));}catch(e){error(res,400,"ADMIN_RECOVERY_FAILED",e.message||"Não foi possível concluir a recuperação.");}});
  app.get("/api/dev/access",(req,res)=>res.json(devAccessSnapshot(req)));
  app.post("/api/games/:slug/pages/generate-all",generationLimiter||((req,res,next)=>next()),requirePageGenerationDev,async(req,res)=>{try{return await handleConstructionStart(req,res);}catch(e){return res.status(500).json({ok:false,error:{code:"CONSTRUCTION_INTERNAL_ERROR",message:"O Construction System registrou um erro interno.",component:"CONSTRUCTION_API",retryable:true}});}});
  for(const route of ["/api/games/:slug/build-status","/api/game-builds/:id","/api/game-builds/:id/items"]){app.get(route,requirePageGenerationDev,(req,res)=>res.status(410).json({ok:false,error:{code:"LEGACY_GAME_BUILD_REMOVED",message:"O Game Build legado foi substituído pelo Construction System determinístico."}}));}
  for(const route of ["/api/game-builds/:id/cancel","/api/game-builds/:id/retry","/api/game-builds/:id/publish"]){app.post(route,requirePageGenerationDev,(req,res)=>res.status(410).json({ok:false,error:{code:"LEGACY_GAME_BUILD_REMOVED",message:"Use o Construction System atual."}}));}
  app.post("/api/games/:slug/images/research",generationLimiter||((req,res,next)=>next()),requirePageGenerationDev,async(req,res)=>{const game=getGameBySlug(req.params.slug);if(!game)return error(res,404,"GAME_NOT_FOUND","Jogo não encontrado.");try{const asset=await resolveImage3({game,role:req.body?.role||"COVER",language:validLanguage(req.body?.language),forceDiscovery:true});res.status(asset?.currentRevision?202:424).json({ok:Boolean(asset?.currentRevision),engine:"IMAGE_ENGINE_3_NATIVE",asset,visual:gamePublicVisual(game)});}catch(e){error(res,502,"IMAGE_RESEARCH_FAILED","Image Engine 3 não encontrou um ativo válido agora.",true);}});
}
