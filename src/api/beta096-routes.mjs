import { randomUUID } from "node:crypto";
import { db, schemaVersion, storageOrigin } from "../database/connection.mjs";
import { currentAuth } from "../auth/auth-service.mjs";
import { accessSnapshot, requireCapability, requireSameOriginMutation, requireSimulator } from "../access/capability-service.mjs";
import { createResearchBatch, processResearchBatch, getResearchBatch, pauseResearchBatch, resumeResearchBatch, cancelResearchBatch, retryResearchBatch, validateManifestReadiness, listSystemicIncidents, getSystemicIncident, retrySystemicIncident } from "../research/research-batch-service.mjs";
import { dexterStatus, recentDexterTasks } from "../dexter/dexter-service.mjs";
import { core85Health } from "../core85/control-plane.mjs";
import { acceptSocialFriendRequest, addChecklistItem, blockUser, cancelSocialFriendRequest, createBoard, createCard, createCommunity, createGroup, deleteMessage, editMessage, ensureDirectConversation, getBoard, getCommunity, getGroup, getWiki, getPublicCommunity, getPublicWiki, joinCommunity, leaveGroup, listCommunities, listPublicCommunities, listConversations, listGroups, listMessages, markConversationRead, markNotificationRead, muteTarget, notifications, rejectSocialFriendRequest, reportSocialContent, saveWiki, searchSocialUsers, sendFriendRequest, sendMessage, socialFriendRequests, socialFriends, socialSnapshot, unblockUser, unfriend, unmuteTarget, updateGroup } from "../social/social-lab-service.mjs";
import { cancelSimulatorRun, ensureSimulatorSuite, getSimulatorRun, listSimulatorRuns, listSimulatorSuites, runSimulatorSuite, sendSimulatorFailuresToBugs, simulatorExport, simulatorReport } from "../simulator/mega-simulator.mjs";
import { gameCount } from "../database/repositories/game-repository.mjs";
import { pageCount } from "../database/repositories/page-repository.mjs";
import { inspectKnowledgeQuality } from "../quality/knowledge-quality-inspector.mjs";
import { listKnowledgeGaps } from "../quality/knowledge-gap.mjs";
import { imageEngine3Summary } from "../images/image-engine3.mjs";
import { PUBLIC_VERSION } from "../config/release-099i6.mjs";

function actor(req){return currentAuth(req)?.user?.id||null;}
function requireSocialLogin(req,res,next){const userId=actor(req);if(!userId)return res.status(401).json({ok:false,error:{code:"LOGIN_REQUIRED",message:"Faça login para participar do GameIndex Social.",component:"SOCIAL_AUTH",retryable:false}});next();}
function requestId(req){return String(req.headers["x-request-id"]||randomUUID()).slice(0,120);}
function errorStatus(error){return Number(error?.status)||(/CONFLICT|EXPIRED/.test(error?.code||"")?409:/DENIED|BLOCKED|REQUIRED/.test(error?.code||"")?403:/NOT_FOUND/.test(error?.code||"")?404:400);}
function failure(res,error,req){return res.status(errorStatus(error)).json({ok:false,error:{code:String(error?.code||"BETA096_REQUEST_FAILED").slice(0,120),message:String(error?.message||"Não foi possível concluir a operação.").slice(0,600),stage:String(error?.stage||"").slice(0,80),retryable:Boolean(error?.retryable),requestId:requestId(req),details:error?.currentRevision?{currentRevision:error.currentRevision}:{}}});}
function route(handler){return (req,res)=>Promise.resolve().then(()=>handler(req,res)).catch(error=>failure(res,error,req));}
function table(name){return Boolean(db.prepare(`SELECT 1 FROM sqlite_master WHERE type='table' AND name=?`).get(name));}

export function registerBeta096Routes(app,{socialLimiter,simulatorLimiter,generationLimiter}={}){
  const socialLimit=socialLimiter||((req,res,next)=>next()),simulatorLimit=simulatorLimiter||((req,res,next)=>next()),generationLimit=generationLimiter||((req,res,next)=>next());
  app.get("/api/beta096/status",(req,res)=>res.json({product:"GameIndex",version:"Beta 0.986",semanticVersion:"0.986.0",codename:"Production Consolidation",schema:schemaVersion(),games:gameCount(),pages:pageCount(),storageOrigin,intelligence:"GI_CORE_8.5_SCRIPTS + DEXTER_OLLAMA_OPTIONAL",architecture:"DETERMINISTIC_CORE_SEMANTIC_EDGE",mode:"LOCAL_FIRST_NO_API_KEY",apiKeyRequired:false,imageRuntime:"IMAGE_ENGINE_3_NATIVE",socialLab:"PUBLIC_BETA",simulator:"MEGA_SIMULATOR",workers:{construction:true,researchRecovery:true},access:accessSnapshot(req)}));
  app.get("/api/runtime/version",(req,res)=>res.json({app:"GameIndex",version:PUBLIC_VERSION,label:`Beta ${PUBLIC_VERSION}`,channel:"BETA",schema:schemaVersion(),socialAccess:"PUBLIC"}));
  app.get("/api/beta096/diagnostics",requireCapability("deployment_monitor"),route((req,res)=>{const required=["user_access_revisions","research_batches","ai7_handoffs","social_messages","social_communities","simulator_runs"],tables=Object.fromEntries(required.map(name=>[name,table(name)]));res.json({ok:true,version:"0.975.0",schema:schemaVersion(),storageOrigin,tables,creatorAssignments:Number(db.prepare(`SELECT COUNT(*) count FROM staff_role_assignments WHERE role='CREATOR'`).get()?.count||0),researchBatches:Number(db.prepare(`SELECT COUNT(*) count FROM research_batches`).get()?.count||0),socialMessages:Number(db.prepare(`SELECT COUNT(*) count FROM social_messages`).get()?.count||0),simulatorRuns:Number(db.prepare(`SELECT COUNT(*) count FROM simulator_runs`).get()?.count||0),intelligence:"GI_CORE_8.5_SCRIPTS",images:imageEngine3Summary(),secretsRedacted:true});}));

  app.use("/api/universe",requireSameOriginMutation);
  app.post("/api/universe/manifests/:id/research-runs",generationLimit,requireCapability("universe_build"),route((req,res)=>{const batch=createResearchBatch(req.params.id,{requestedBy:actor(req),mode:req.body?.mode||"MISSING",selectedItemIds:req.body?.selectedItemIds||[]});setImmediate(()=>{try{processResearchBatch(batch.id);}catch{}});res.status(202).json({ok:true,batch,statusUrl:`/api/universe/research-runs/${batch.id}`});}));
  app.get("/api/universe/research-runs/:id",requireCapability("universe_build"),route((req,res)=>{const batch=getResearchBatch(req.params.id);if(!batch)return res.status(404).json({ok:false,error:{code:"RESEARCH_BATCH_NOT_FOUND",message:"Lote não encontrado."}});res.json({ok:true,batch});}));
  app.post("/api/universe/research-runs/:id/pause",requireCapability("universe_build"),route((req,res)=>res.json({ok:true,batch:pauseResearchBatch(req.params.id)})));
  app.post("/api/universe/research-runs/:id/resume",requireCapability("universe_build"),route((req,res)=>{const batch=resumeResearchBatch(req.params.id);setImmediate(()=>{try{processResearchBatch(batch.id);}catch{}});res.status(202).json({ok:true,batch});}));
  app.post("/api/universe/research-runs/:id/cancel",requireCapability("universe_build"),route((req,res)=>res.json({ok:true,batch:cancelResearchBatch(req.params.id)})));
  app.post("/api/universe/research-runs/:id/retry",requireCapability("universe_build"),route((req,res)=>{const batch=retryResearchBatch(req.params.id);setImmediate(()=>{try{processResearchBatch(batch.id);}catch{}});res.status(202).json({ok:true,batch});}));
  app.post("/api/universe/manifests/:id/validate",generationLimit,requireCapability("universe_build"),route((req,res)=>res.json({ok:true,readiness:validateManifestReadiness(req.params.id,{batchId:req.body?.batchId||null})})));
  app.get("/api/universe/manifests/:id/readiness",requireCapability("universe_build"),route((req,res)=>res.json({ok:true,readiness:validateManifestReadiness(req.params.id)})));
  app.get("/api/universe/incidents",requireCapability("universe_build"),route((req,res)=>res.json({ok:true,entries:listSystemicIncidents({status:req.query.status||"",limit:req.query.limit||100})})));
  app.get("/api/universe/incidents/:id",requireCapability("universe_build"),route((req,res)=>{const incident=getSystemicIncident(req.params.id);if(!incident)return res.status(404).json({ok:false,error:{code:"INCIDENT_NOT_FOUND",message:"Causa sistêmica não encontrada."}});res.json({ok:true,incident});}));
  app.post("/api/universe/incidents/:id/retry",requireCapability("universe_build"),route((req,res)=>res.status(202).json({ok:true,incident:retrySystemicIncident(req.params.id)})));

  // HF2 compatibility for retired AI System 7 diagnostics.
  app.get("/api/ai7/status",requireCapability("ai_diagnostics"),route(async(req,res)=>res.json({ok:true,deprecated:true,replacedBy:"GI_CORE_8.5 + DEXTER",core:await core85Health({probeDexter:false}),dexter:await dexterStatus({probe:false})})));
  app.get("/api/ai7/runs",requireCapability("ai_diagnostics"),route((req,res)=>res.json({ok:true,deprecated:true,entries:recentDexterTasks({limit:req.query.limit||50})})));
  app.get("/api/ai7/runs/:id",requireCapability("ai_diagnostics"),route((req,res)=>res.status(410).json({ok:false,error:{code:"AI7_RUNS_REMOVED",message:"AI System 7 foi removido. Consulte /api/dexter/tasks."}})));
  app.get("/api/ai7/evaluations",requireCapability("ai_diagnostics"),route((req,res)=>res.json({ok:true,deprecated:true,entries:[]})));
  app.post("/api/ai7/evaluations/:suite/run",requireSameOriginMutation,requireCapability("creator_control"),route((req,res)=>res.status(410).json({ok:false,error:{code:"AI7_REMOVED",message:"A avaliação AI7 foi substituída pelos testes determinísticos HF2."}})));
  app.get("/api/ai7/knowledge-quality",requireCapability("ai_diagnostics"),route((req,res)=>res.json({ok:true,deprecated:true,report:inspectKnowledgeQuality({gameId:req.query.gameId||"",limit:req.query.limit||5000})})));
  app.get("/api/ai7/knowledge-gaps",requireCapability("ai_diagnostics"),route((req,res)=>res.json({ok:true,deprecated:true,entries:listKnowledgeGaps({limit:req.query.limit||100})})));
  app.get("/api/ai7/image-health",requireCapability("ai_diagnostics"),route((req,res)=>res.json({ok:true,deprecated:true,replacedBy:"IMAGE_ENGINE_3",report:imageEngine3Summary()})));

  app.use("/api/social",requireSameOriginMutation,requireSocialLogin);
  app.get("/api/social/me",route((req,res)=>res.json({ok:true,...socialSnapshot(actor(req))})));
  app.get("/api/social/users",socialLimit,route((req,res)=>res.json({ok:true,...searchSocialUsers(actor(req),req.query)})));
  app.get("/api/social/friends",route((req,res)=>res.json({ok:true,entries:socialFriends(actor(req),req.query)})));
  app.get("/api/social/friend-requests",route((req,res)=>res.json({ok:true,...socialFriendRequests(actor(req))})));
  app.post("/api/social/friend-requests",socialLimit,route((req,res)=>res.status(201).json({ok:true,request:sendFriendRequest(actor(req),req.body?.targetUserId)})));
  app.post("/api/social/friend-requests/:id/accept",socialLimit,route((req,res)=>res.json({ok:true,...acceptSocialFriendRequest(actor(req),req.params.id)})));
  app.post("/api/social/friend-requests/:id/reject",socialLimit,route((req,res)=>res.json({ok:true,...rejectSocialFriendRequest(actor(req),req.params.id)})));
  app.delete("/api/social/friend-requests/:id",socialLimit,route((req,res)=>res.json({ok:true,...cancelSocialFriendRequest(actor(req),req.params.id)})));
  app.delete("/api/social/friends/:userId",socialLimit,route((req,res)=>res.json({ok:true,...unfriend(actor(req),req.params.userId)})));
  app.post("/api/social/blocks",socialLimit,route((req,res)=>res.status(201).json({ok:true,...blockUser(actor(req),req.body?.targetUserId)})));
  app.delete("/api/social/blocks/:userId",route((req,res)=>res.json({ok:true,...unblockUser(actor(req),req.params.userId)})));
  app.post("/api/social/mutes",route((req,res)=>res.status(201).json({ok:true,...muteTarget(actor(req),req.body||{})})));
  app.delete("/api/social/mutes/:targetType/:targetId",route((req,res)=>res.json({ok:true,...unmuteTarget(actor(req),req.params.targetType,req.params.targetId)})));
  app.get("/api/social/conversations",route((req,res)=>res.json({ok:true,entries:listConversations(actor(req),req.query)})));
  app.post("/api/social/conversations/direct",socialLimit,route((req,res)=>res.status(201).json({ok:true,conversation:ensureDirectConversation(actor(req),req.body?.targetUserId)})));
  app.get("/api/social/conversations/:id/messages",route((req,res)=>res.json({ok:true,entries:listMessages(actor(req),req.params.id,req.query)})));
  app.post("/api/social/conversations/:id/messages",socialLimit,route((req,res)=>res.status(201).json({ok:true,...sendMessage(actor(req),req.params.id,req.body||{})})));
  app.post("/api/social/conversations/:id/read",route((req,res)=>res.json(markConversationRead(actor(req),req.params.id,req.body?.messageId||""))));
  app.patch("/api/social/messages/:id",socialLimit,route((req,res)=>res.json(editMessage(actor(req),req.params.id,req.body||{}))));
  app.delete("/api/social/messages/:id",route((req,res)=>res.json(deleteMessage(actor(req),req.params.id))));
  app.post("/api/social/messages/:id/report",socialLimit,route((req,res)=>res.status(201).json({ok:true,report:reportSocialContent(actor(req),{targetType:"MESSAGE",targetId:req.params.id,category:req.body?.category,description:req.body?.description})})));
  app.get("/api/social/groups",route((req,res)=>res.json({ok:true,entries:listGroups(actor(req))})));
  app.post("/api/social/groups",socialLimit,route((req,res)=>res.status(201).json({ok:true,group:createGroup(actor(req),req.body||{})})));
  app.get("/api/social/groups/:id",route((req,res)=>res.json({ok:true,group:getGroup(actor(req),req.params.id)})));
  app.patch("/api/social/groups/:id",socialLimit,route((req,res)=>res.json({ok:true,group:updateGroup(actor(req),req.params.id,req.body||{})})));
  app.post("/api/social/groups/:id/leave",route((req,res)=>res.json({ok:true,...leaveGroup(actor(req),req.params.id,req.body||{})})));
  app.get("/api/social/communities",route((req,res)=>res.json({ok:true,entries:listCommunities(actor(req))})));
  app.post("/api/social/communities",socialLimit,route((req,res)=>res.status(201).json({ok:true,community:createCommunity(actor(req),req.body||{})})));
  app.get("/api/social/communities/:id",route((req,res)=>res.json({ok:true,community:getCommunity(actor(req),req.params.id)})));
  app.post("/api/social/communities/:id/join",socialLimit,route((req,res)=>res.status(201).json({ok:true,...joinCommunity(actor(req),req.params.id)})));
  app.post("/api/social/communities/:id/wiki",socialLimit,route((req,res)=>res.status(201).json({ok:true,wiki:saveWiki(actor(req),req.params.id,req.body||{})})));
  app.get("/api/social/wiki/:id",route((req,res)=>res.json({ok:true,wiki:getWiki(actor(req),req.params.id)})));
  app.post("/api/social/boards",socialLimit,route((req,res)=>res.status(201).json({ok:true,board:createBoard(actor(req),req.body||{})})));
  app.get("/api/social/boards/:id",route((req,res)=>res.json({ok:true,board:getBoard(actor(req),req.params.id)})));
  app.post("/api/social/board-columns/:id/cards",socialLimit,route((req,res)=>res.status(201).json({ok:true,card:createCard(actor(req),req.params.id,req.body||{})})));
  app.post("/api/social/cards/:id/checklist",socialLimit,route((req,res)=>res.status(201).json({ok:true,item:addChecklistItem(actor(req),req.params.id,req.body||{})})));
  app.get("/api/social/notifications",route((req,res)=>res.json({ok:true,entries:notifications(actor(req),req.query)})));
  app.post("/api/social/notifications/:id/read",route((req,res)=>res.json(markNotificationRead(actor(req),req.params.id))));
  app.post("/api/social/reports",socialLimit,route((req,res)=>res.status(201).json({ok:true,report:reportSocialContent(actor(req),req.body||{})})));

  app.use("/api/simulator",requireSameOriginMutation,requireSimulator);
  app.get("/api/simulator/suites",route((req,res)=>{ensureSimulatorSuite();res.json({ok:true,entries:listSimulatorSuites()});}));
  app.post("/api/simulator/runs",simulatorLimit,route((req,res)=>res.status(202).json({ok:true,run:runSimulatorSuite({suiteId:req.body?.suiteId||"sim-suite-core-096",actorUserId:actor(req)})})));
  app.get("/api/simulator/runs",route((req,res)=>res.json({ok:true,entries:listSimulatorRuns(actor(req),req.query)})));
  app.get("/api/simulator/runs/:id",route((req,res)=>{const run=getSimulatorRun(req.params.id,actor(req));if(!run)return res.status(404).json({ok:false,error:{code:"SIMULATOR_RUN_NOT_FOUND",message:"Execução não encontrada."}});res.json({ok:true,run});}));
  app.post("/api/simulator/runs/:id/cancel",route((req,res)=>res.json({ok:true,run:cancelSimulatorRun(req.params.id,actor(req))})));
  app.get("/api/simulator/runs/:id/report",route((req,res)=>{const report=simulatorReport(req.params.id,actor(req));if(!report)return res.status(404).json({ok:false,error:{code:"SIMULATOR_RUN_NOT_FOUND",message:"Execução não encontrada."}});res.json({ok:true,report});}));
  app.get("/api/simulator/runs/:id/export",route((req,res)=>{const report=simulatorExport(req.params.id,actor(req));if(!report)return res.status(404).json({ok:false,error:{code:"SIMULATOR_RUN_NOT_FOUND",message:"Execução não encontrada."}});res.json(report);}));
  app.post("/api/simulator/runs/:id/send-to-bugs",simulatorLimit,route((req,res)=>res.status(201).json(sendSimulatorFailuresToBugs(req.params.id,actor(req)))));
}
