import { randomUUID } from "node:crypto";
import { currentAuth } from "../auth/auth-service.mjs";
import { requireCapability, requireSameOriginMutation } from "../access/capability-service.mjs";
import { startPrePublicUniverseBuild, prePublicRun, listPrePublicRuns, listPrePublicJobs, prePublicReadinessSummary, gamePrePublicInventory, recordPerformanceTelemetry, recordLiveValidation, advancePrePublicRun } from "../prepublic/pre-public-service.mjs";

function actor(req){return currentAuth(req)?.user?.id||null;}
function requestId(req){return String(req.headers["x-request-id"]||randomUUID()).slice(0,120);}
function route(handler){return (req,res)=>Promise.resolve().then(()=>handler(req,res)).catch(error=>res.status(/NOT_FOUND/.test(error?.code||"")?404:400).json({ok:false,error:{code:String(error?.code||"PRE_PUBLIC_REQUEST_FAILED"),message:String(error?.message||error||"Falha no Pre-Public Gate.").slice(0,700),requestId:requestId(req)}}));}
export function registerBeta0975PrePublicRoutes(app){
  app.get("/api/pre-public/summary",requireCapability("creator_control"),route((req,res)=>res.json({ok:true,...prePublicReadinessSummary()})));
  app.get("/api/pre-public/gate",requireCapability("creator_control"),route((req,res)=>{const summary=prePublicReadinessSummary();res.json({ok:true,release:"0.986",imageRuntime:"IMAGE_ENGINE_3_NATIVE",legacyImageRuntime:"REMOVED",azureLiveValidation:"PENDING",summary});}));
  app.get("/api/pre-public/runs",requireCapability("universe_build"),route((req,res)=>res.json({ok:true,entries:listPrePublicRuns({gameId:req.query.gameId||null,limit:req.query.limit||30})})));
  app.get("/api/pre-public/runs/:id",requireCapability("universe_build"),route((req,res)=>{const run=prePublicRun(req.params.id);if(!run)return res.status(404).json({ok:false,error:{code:"PRE_PUBLIC_RUN_NOT_FOUND",message:"Run Pre-Public não encontrado."}});res.json({ok:true,run});}));
  app.post("/api/pre-public/runs/:id/advance",requireSameOriginMutation,requireCapability("universe_build"),route(async(req,res)=>res.json({ok:true,run:await advancePrePublicRun(req.params.id)})));
  app.get("/api/pre-public/jobs",requireCapability("universe_build"),route((req,res)=>res.json({ok:true,...listPrePublicJobs({runId:req.query.runId||null,gameId:req.query.gameId||null,status:req.query.status||null,page:req.query.page||1,limit:req.query.limit||25})})));
  app.get("/api/pre-public/games/:game/inventory",requireCapability("universe_build"),route((req,res)=>res.json({ok:true,inventory:gamePrePublicInventory(req.params.game,{language:req.query.language||"pt-BR"})})));
  app.post("/api/pre-public/games/:game/build-entire",requireSameOriginMutation,requireCapability("universe_build"),route((req,res)=>res.status(202).json({ok:true,run:startPrePublicUniverseBuild(req.params.game,{language:req.body?.language||"pt-BR",userId:actor(req)})})));
  app.post("/api/pre-public/performance",requireSameOriginMutation,requireCapability("creator_control"),route((req,res)=>res.status(201).json({ok:true,event:recordPerformanceTelemetry({...req.body,pagePath:req.body?.pagePath||req.headers.referer||""})})));
  app.post("/api/pre-public/live-validation",requireSameOriginMutation,requireCapability("deployment_monitor"),route((req,res)=>res.status(201).json({ok:true,validation:recordLiveValidation({contractKey:req.body?.contractKey,environment:"AZURE_LIVE",result:req.body?.result||"PENDING",evidence:req.body?.evidence||{},verifiedBy:actor(req)})})));
}
