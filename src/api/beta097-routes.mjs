import { randomUUID } from "node:crypto";
import { schemaVersion } from "../database/connection.mjs";
import { currentAuth } from "../auth/auth-service.mjs";
import { accessSnapshot, requireCapability, requireSameOriginMutation } from "../access/capability-service.mjs";
import { aiSharpenerSummary, approveAISharpenerRun, cancelAISharpenerRun, createAISharpenerRun, getAISharpenerRun, listAISharpenerGoldenCases, listAISharpenerRuns, pauseAISharpenerRun, resumeAISharpenerRun } from "../sharpener/sharpener-service.mjs";
import { ensureSharpenerScheduled, scheduleSharpenerRun, sharpenerWorkerState } from "../sharpener/sharpener-runner.mjs";
import { recordImageRenderEvent, imageRenderMetrics } from "../database/repositories/image-render-repository.mjs";
import { ensure0975BFReleaseContract, releaseContract0975Dashboard, run0975BFReleaseContract } from "../release-contract/release-contract-0975-service.mjs";
import { listSharpenerMemories } from "../database/repositories/sharpener-learning-repository.mjs";
import { pageSharpenerAttempts } from "../database/repositories/sharpener-repository.mjs";

function actor(req){return currentAuth(req)?.user?.id||null;}
function requestId(req){return String(req.headers["x-request-id"]||randomUUID()).slice(0,120);}
function status(error){return /NOT_FOUND/.test(error?.code||"")?404:/DENIED|REQUIRED/.test(error?.code||"")?403:/CONFLICT/.test(error?.code||"")?409:400;}
function fail(res,error,req){return res.status(status(error)).json({ok:false,error:{code:String(error?.code||"BETA097_REQUEST_FAILED"),message:String(error?.message||"Falha no AI Sharpener.").slice(0,700),requestId:requestId(req),retryable:false}});}
function route(handler){return (req,res)=>Promise.resolve().then(()=>handler(req,res)).catch(error=>fail(res,error,req));}

export function registerBeta097Routes(app,{sharpenerLimiter}={}){
  const limit=sharpenerLimiter||((req,res,next)=>next());
  ensure0975BFReleaseContract();
  const statusPayload=req=>({product:"GameIndex",version:"Beta 0.975 BF",semanticVersion:"0.975.0",releaseLabel:"0.975-BF",codename:"Adaptive Intelligence & Regression Recovery",channel:"BUG_FIX_INTELLIGENCE",schema:schemaVersion(),ai:"Dexter IA — AI System 7.x",aiSharpener:{enabled:true,version:"V3",maxAttempts:10000,creatorOnly:true,targetIsEvaluator:true,expectedResultIsolation:true,researchFirst:true,evidencePool:"V2",queryFamilies:true,intentLock:true,semanticRequirements:true,breakthroughTruthfulness:true,waitingKnowledge:true,autoApply:false,worker:sharpenerWorkerState()},imagePipeline:{manualWorkflow:false,placeholderCountsAsSuccess:false,renderTelemetry:true,contextValidation:true,azureLiveRequired:true},releaseContract:{id:"RELEASE_CONTRACT_0.975_BF",auditor:true,releaseMemory:true},access:accessSnapshot(req)});
  app.get("/api/beta097/status",(req,res)=>res.json(statusPayload(req)));
  app.get("/api/beta0975/status",(req,res)=>res.json(statusPayload(req)));

  app.post("/api/beta097/image-render-events",requireSameOriginMutation,route((req,res)=>{recordImageRenderEvent({pagePath:req.body?.pagePath||"",gameSlug:req.body?.gameSlug||"",entityId:req.body?.entityId||"",imageUrl:req.body?.imageUrl||"",renderState:req.body?.renderState||"FAIL",width:req.body?.width||0,height:req.body?.height||0,isFallback:Boolean(req.body?.isFallback),userAgent:req.headers["user-agent"]||"",expectedContext:req.body?.expectedContext||req.body?.gameSlug||req.body?.entityId||"",contextStatus:req.body?.contextStatus||"UNKNOWN",browserVerified:req.body?.browserVerified!==false});res.status(201).json({ok:true});}));
  app.get("/api/beta097/image-render-metrics",requireCapability("image_management"),route((req,res)=>res.json({ok:true,metrics:imageRenderMetrics({minutes:req.query.minutes||180})})));
  app.get("/api/beta097/release-contract",requireCapability("creator_control"),route((req,res)=>res.json({ok:true,...releaseContract0975Dashboard()})));
  app.post("/api/beta097/release-contract/audit",requireSameOriginMutation,requireCapability("creator_control"),route((req,res)=>res.status(201).json({ok:true,audit:run0975BFReleaseContract({actorUserId:actor(req),environment:req.body?.environment||(process.env.WEBSITE_INSTANCE_ID?"AZURE_LIVE":"LOCAL"),autoFileBugs:req.body?.autoFileBugs!==false})})));

  app.use("/api/ai-sharpener",requireSameOriginMutation,requireCapability("ai_sharpener"));
  app.get("/api/ai-sharpener/summary",route((req,res)=>res.json({ok:true,summary:aiSharpenerSummary(actor(req)),worker:sharpenerWorkerState()})));
  app.get("/api/ai-sharpener/runs",route((req,res)=>res.json({ok:true,entries:listAISharpenerRuns(actor(req),{limit:req.query.limit||30})})));
  app.post("/api/ai-sharpener/runs",limit,route((req,res)=>{const run=createAISharpenerRun({actorUserId:actor(req),game:req.body?.game,question:req.body?.question,expectedAnswer:req.body?.expectedAnswer,maxAttempts:req.body?.maxAttempts??10000,targetScore:req.body?.targetScore??.96,plateauWindow:req.body?.plateauWindow??500});scheduleSharpenerRun(run.id);res.status(202).json({ok:true,run,statusUrl:`/api/ai-sharpener/runs/${run.id}`});}));
  app.get("/api/ai-sharpener/runs/:id",route((req,res)=>{const run=getAISharpenerRun(req.params.id,actor(req));if(!run)return res.status(404).json({ok:false,error:{code:"SHARPENER_RUN_NOT_FOUND",message:"Afiamento não encontrado."}});res.json({ok:true,run});}));
  app.get("/api/ai-sharpener/runs/:id/attempts",route((req,res)=>{const run=getAISharpenerRun(req.params.id,actor(req));if(!run)return res.status(404).json({ok:false,error:{code:"SHARPENER_RUN_NOT_FOUND",message:"Afiamento não encontrado."}});res.json({ok:true,...pageSharpenerAttempts(run.id,{page:req.query.page||1,limit:req.query.limit||25})});}));
  app.post("/api/ai-sharpener/runs/:id/pause",route((req,res)=>res.json({ok:true,run:pauseAISharpenerRun(req.params.id,actor(req))})));
  app.post("/api/ai-sharpener/runs/:id/resume",route((req,res)=>{const run=resumeAISharpenerRun(req.params.id,actor(req));ensureSharpenerScheduled(run.id);res.status(202).json({ok:true,run});}));
  app.post("/api/ai-sharpener/runs/:id/cancel",route((req,res)=>res.json({ok:true,run:cancelAISharpenerRun(req.params.id,actor(req))})));
  app.post("/api/ai-sharpener/runs/:id/approve",route((req,res)=>res.json({ok:true,...approveAISharpenerRun(req.params.id,actor(req))})));
  app.get("/api/ai-sharpener/golden-cases",route((req,res)=>res.json({ok:true,entries:listAISharpenerGoldenCases(actor(req),{limit:req.query.limit||100})})));
  app.get("/api/ai-sharpener/memories",route((req,res)=>res.json({ok:true,entries:listSharpenerMemories({gameId:req.query.gameId||"",memoryType:req.query.memoryType||"",limit:req.query.limit||100})})));
}
