import "dotenv/config";
// Current release metadata: version:"0.99-I6-HF1" · release:"BETA_0_99_I6_HF1_BUILD_RELIABILITY"
// Release lineage compatibility: version:"0.9875" · release:"BETA_0_9875_FULL_PAGE_PERSONALIZATION"
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { initializeDatabase } from "./src/database/seed.mjs";
import { avatarsDir, latestBackup, schemaVersion, storageOrigin } from "./src/database/connection.mjs";
import { publicDexterConsult } from "./src/dexter/public-consult.mjs";
import { availableTemplates, templateTabs } from "./src/games/templates.mjs";
import { gameCount, getGameById, getGameBySlug, listGames, listChildGameEntities, parentGameFor, relatedByFranchise, upsertGame } from "./src/database/repositories/game-repository.mjs";
import { getEntityById } from "./src/database/repositories/entity-repository.mjs";
import { claimCount, getKnowledgeById, knowledgeCount, listKnowledge } from "./src/database/repositories/knowledge-repository.mjs";
import { getSourceById, sourceCount } from "./src/database/repositories/source-repository.mjs";
import { researchCount } from "./src/database/repositories/research-repository.mjs";
import { searchGameVault } from "./src/api/search.mjs";
import { entityPublicVisual, gamePublicVisual } from "./src/images/public-visual.mjs";
import { imageEngine3Summary, resolveImage3, startImageEngine3RepairWorker } from "./src/images/image-engine3.mjs";
import { authPayload, currentAuth, login, logout, register, updatePreferences } from "./src/auth/auth-service.mjs";
import { rateLimit } from "./src/security/rate-limit.mjs";
import { PLANS, billingStatus, subscriptionPublicState } from "./src/subscriptions/subscription-service.mjs";
import { followGame, unfollowGame, isFollowing, listFollowedGames } from "./src/database/repositories/follow-repository.mjs";
import { recordActivity } from "./src/database/repositories/activity-repository.mjs";
import { recordInterestSignal } from "./src/database/repositories/interest-repository.mjs";
import { saveKnowledgeForUser, unsaveKnowledgeForUser, isKnowledgeSaved } from "./src/database/repositories/saved-knowledge-repository.mjs";
import { buildProfile } from "./src/users/profile-service.mjs";
import { generateGameVaultContent } from "./src/creator/creator.mjs";
import { listCoverage } from "./src/database/repositories/coverage-repository.mjs";
import { registerBeta065Routes } from "./src/api/beta065-routes.mjs";
import { registerBeta067Routes } from "./src/api/beta067-routes.mjs";
import { registerBeta0675Routes } from "./src/api/beta0675-routes.mjs";
import { registerBeta07Routes } from "./src/api/beta07-routes.mjs";
import { registerBeta08Routes } from "./src/api/beta08-routes.mjs";
import { registerBeta086Routes } from "./src/api/beta086-routes.mjs";
import { registerBeta087Routes } from "./src/api/beta087-routes.mjs";
import { registerBeta088Routes } from "./src/api/beta088-routes.mjs";
import { registerBeta0885Routes } from "./src/api/beta0885-routes.mjs";
import { registerBeta089Routes } from "./src/api/beta089-routes.mjs";
import { registerBeta091Routes } from "./src/api/beta09-routes.mjs";
import { registerBeta092Routes } from "./src/api/beta092-routes.mjs";
import { registerBeta095Routes } from "./src/api/beta095-routes.mjs";
import { registerBeta096Routes } from "./src/api/beta096-routes.mjs";
import { registerBeta0975PrePublicRoutes } from "./src/api/beta0975-prepublic-routes.mjs";
import { registerBeta098Routes } from "./src/api/beta098-routes.mjs";
import { registerBeta0985Routes } from "./src/api/beta0985-routes.mjs";
import { installPerformanceMiddleware, paginatedPublicGames } from "./src/api/performance-runtime.mjs";
import { registerBeta0986Routes } from "./src/api/beta0986-routes.mjs";
import { registerBeta0987Routes } from "./src/api/beta0987-routes.mjs";
import { registerBeta099Routes } from "./src/api/beta099-routes.mjs";
import { registerBeta099I5Routes } from "./src/api/beta099-i5-routes.mjs";
import { registerBeta099I6Routes } from "./src/api/beta099-i6-routes.mjs";
import { registerBeta0991HF1Routes } from "./src/api/beta0991-hf1-routes.mjs";
import { registerBeta0991I1Routes } from "./src/api/beta0991-i1-routes.mjs";
import { recoverInterruptedFoundationBuilds } from "./src/universe/universe-builder-099.mjs";
import { PUBLIC_VERSION, INTERNAL_RELEASE, INTERNAL_RELEASE_CODE } from "./src/config/release-099i6.mjs";
import { gameMediaDir } from "./src/images/game-media-service.mjs";
import { PERFORMANCE_MODE } from "./src/config/performance-config.mjs";
import { requireDev } from "./src/admin/dev-auth.mjs";
import { requireDevArea } from "./src/admin/dev-access.mjs";
import { startAutonomousGenerationWorker } from "./src/autonomy/autonomous-generation.mjs";
import { requireAdmin, adminSession } from "./src/admin/admin-auth.mjs";
import { articleCount } from "./src/database/repositories/article-repository.mjs";
import { pageCount } from "./src/database/repositories/page-repository.mjs";
import { recordBrainRequest } from "./src/database/repositories/brain-metrics-repository.mjs";
import { degradedAIResponse, PRODUCT_CODENAME, PRODUCT_LABEL, publicHealthSnapshot, runtimeEnvironment, runtimeLog, startupPrerequisites, startedAt } from "./src/runtime/deployment-runtime.mjs";
import { firstAdminSetupState, setupFirstAdmin } from "./src/auth/first-admin-setup.mjs";
import { adminRecoveryStatus } from "./src/auth/admin-recovery.mjs";
import { startConstructionWorker } from "./src/construction/construction-runner.mjs";
import { requireCapability } from "./src/access/capability-service.mjs";
import { startPrePublicWorker } from "./src/prepublic/pre-public-service.mjs";
import { startCore98Workers } from "./src/core98/worker-runtime.mjs";
import { startGenerationRecoveryWorker } from "./src/pages/generation-runner.mjs";

const startupDatabase=initializeDatabase();
const startupUniverseBuildRecovery=recoverInterruptedFoundationBuilds();
const startupAssets=startupPrerequisites();

const app=express();
// Azure App Service Windows/IISNode can provide PORT as a named-pipe path.
// Keep it as-is instead of coercing it to a number; Express/Node supports both
// numeric TCP ports and named pipes in app.listen().
const rawPort=process.env.PORT||3000;
const PORT=typeof rawPort==="string"&&/^\d+$/.test(rawPort)?Number(rawPort):rawPort;
const root=path.dirname(fileURLToPath(import.meta.url));
const publicDir=path.join(root,"public");

app.disable("x-powered-by");
app.set("trust proxy",1);
app.use(express.json({limit:"12mb"}));
installPerformanceMiddleware(app);
app.use("/user-content/avatars",express.static(avatarsDir,{maxAge:"1d",immutable:false,index:false,fallthrough:false}));
app.use("/user-content/game-media",express.static(gameMediaDir,{maxAge:"7d",immutable:false,index:false,fallthrough:false}));

// Admin HTML is protected by the backend. Hiding a link is never authorization.
app.get(["/setup-admin","/setup-admin.html"],(req,res)=>res.sendFile(path.join(publicDir,"setup-admin.html")));
app.get(["/admin-recovery","/admin-recovery.html"],(req,res)=>res.sendFile(path.join(publicDir,"admin-recovery.html")));
app.get(["/admin","/admin.html"],requireCapability("creator_control"),(req,res)=>res.sendFile(path.join(publicDir,"admin.html")));
app.get(["/music-manager","/music-manager.html"],requireCapability("music_management"),(req,res)=>res.sendFile(path.join(publicDir,"music-manager.html")));
app.get(["/add-game","/add-game.html"],requireCapability("creator_control"),(req,res)=>res.sendFile(path.join(publicDir,"add-game.html")));
app.get(["/generate-page","/generate-page.html"],requireCapability("page_generation"),(req,res)=>res.sendFile(path.join(publicDir,"generate-page.html")));
app.get(["/ai-control","/ai-control.html"],requireCapability("ai_diagnostics"),(req,res)=>res.sendFile(path.join(publicDir,"ai-control.html")));
app.get(["/database-explorer","/database-explorer.html"],requireCapability("database_explorer"),(req,res)=>res.sendFile(path.join(publicDir,"database-explorer.html")));
app.get(["/ai-flow","/ai-flow.html"],requireCapability("ai_diagnostics"),(req,res)=>res.sendFile(path.join(publicDir,"ai-flow.html")));
app.get(["/bug-tracker","/bug-tracker.html"],requireCapability("bug_triage"),(req,res)=>res.sendFile(path.join(publicDir,"bug-tracker.html")));
app.get(["/release-contract-auditor","/release-contract-auditor.html"],requireCapability("creator_control"),(req,res)=>res.sendFile(path.join(publicDir,"release-contract-auditor.html")));
app.get(["/deployment-monitor","/deployment-monitor.html"],requireCapability("deployment_monitor"),(req,res)=>res.sendFile(path.join(publicDir,"deployment-monitor.html")));
app.get(["/creator-control","/creator-control.html"],requireCapability("creator_control"),(req,res)=>res.sendFile(path.join(publicDir,"creator-control.html")));
app.get(["/universe-builder","/universe-builder.html"],requireCapability("universe_build"),(req,res)=>res.sendFile(path.join(publicDir,"universe-builder.html")));
app.get(["/pre-public-readiness","/pre-public-readiness.html"],requireCapability("creator_control"),(req,res)=>res.sendFile(path.join(publicDir,"pre-public-readiness.html")));
app.get(["/creator-studio","/creator-studio.html"],requireCapability("creator_studio_edit"),(req,res)=>res.sendFile(path.join(publicDir,"creator-studio.html")));
app.get(["/tester-lab","/tester-lab.html"],requireCapability("tester_preview"),(req,res)=>res.sendFile(path.join(publicDir,"tester-lab.html")));
app.get(["/image-library","/image-library.html"],requireCapability("image_management"),(req,res)=>res.sendFile(path.join(publicDir,"image-library.html")));
app.get(["/game-experience-manager","/game-experience-manager.html"],requireCapability("creator_control"),(req,res)=>res.sendFile(path.join(publicDir,"game-experience-manager.html")));
app.get(["/social","/social.html"],(req,res)=>res.sendFile(path.join(publicDir,"social.html")));
app.get(["/mega-simulator","/mega-simulator.html"],requireCapability("simulator_run_safe"),(req,res)=>res.sendFile(path.join(publicDir,"mega-simulator.html")));
app.get(["/ai-sharpener","/ai-sharpener.html"],requireCapability("ai_sharpener"),(req,res)=>res.status(410).send("AI Sharpener removido do runtime atual do GameIndex Beta 0.99."));
app.get(["/game/roblox","/game/roblox/"],(req,res)=>res.sendFile(path.join(publicDir,"game.html")));
app.get("/game/roblox/:child",(req,res,next)=>{const parent=getGameBySlug("roblox"),child=getGameBySlug(String(req.params.child||"").toLowerCase());if(!parent||!child||child.entityType!=="EXPERIENCE"||child.parentGameId!==parent.id||child.status!=="PUBLISHED")return next();res.sendFile(path.join(publicDir,"game.html"));});
app.use(express.static(publicDir,{extensions:["html"],maxAge:0,etag:true,lastModified:true,setHeaders(res,file){
  const normalized=String(file||"").replaceAll("\\","/");
  const hotEntry=/\/(?:index|games|game|admin|music-manager|image-library|universe-builder|login|settings|ai-control|ai-flow)\.html$/i.test(normalized)||/\/(?:shell-0986|cinematic-0991-hf1|gameindex-0991-i1|experience-engine|game-experience-manager|app|games|game|music-manager|image-library|image-crop-editor|universe-builder|visual-grounding-099i1|visual-grounding-099i2|universe-interaction-engine-099i2|universe-runtime-099|interactive-runtime-099|auth|settings)\.js$/i.test(normalized)||/\/(?:gameindex-0986|gameindex-0991-hf1|gameindex-0991-i1|cinematic-0991-hf1|universe-builder-v3|experience-engine|game|image-manager-hf1|final-foundation-099)\.css$/i.test(normalized);
  if(hotEntry){res.setHeader("Cache-Control","no-cache, max-age=0, must-revalidate");return;}
  if(PERFORMANCE_MODE&&/\.(?:js|mjs|css|woff2|webp|avif|svg)$/i.test(normalized))res.setHeader("Cache-Control","public, max-age=7200, stale-while-revalidate=86400");
}}));

const brainLimiter=rateLimit({name:"brain",windowMs:60_000,max:18,message:"Muitas consultas ao Dexter em pouco tempo. Aguarde alguns segundos."});
const generationLimiter=rateLimit({name:"generation",windowMs:60_000,max:8,message:"Muitas gerações iniciadas em pouco tempo. Aguarde alguns segundos."});
const authLimiter=rateLimit({name:"auth",windowMs:10*60_000,max:25,message:"Muitas tentativas de login. Tente novamente mais tarde."});
const recoveryLimiter=rateLimit({name:"admin-recovery",windowMs:15*60_000,max:8,message:"Muitas tentativas de recuperação. Aguarde antes de tentar novamente."});
const publicBugLimiter=rateLimit({name:"public-bug-report",windowMs:15*60_000,max:6,message:"Muitos relatórios enviados. Aguarde antes de tentar novamente."});
const socialLimiter=rateLimit({name:"social-lab",windowMs:60_000,max:45,message:"Muitas ações sociais em pouco tempo. Aguarde alguns segundos."});
const simulatorLimiter=rateLimit({name:"mega-simulator",windowMs:10*60_000,max:8,message:"Muitas simulações iniciadas. Aguarde a execução atual."});

function accessibleGame(req,slug){const game=getGameBySlug(slug);if(!game)return null;return game.status==="PUBLISHED"||adminSession(req)?game:null;}
function accessibleGameById(req,id){const game=getGameById(id);if(!game)return null;return game.status==="PUBLISHED"||adminSession(req)?game:null;}
function cleanPublicError(res,status,message){return res.status(status).json({erro:message});}
function relatedForGame(game,includeDrafts=false){if(game?.entityType==="EXPERIENCE"&&game.parentGameId){return listChildGameEntities(game.parentGameId,{includeDrafts,limit:8}).filter(entry=>entry.id!==game.id).slice(0,6);}return relatedByFranchise(game,6,{includeDrafts});}

app.get("/api/health",(req,res)=>{try{const health=publicHealthSnapshot();res.status(health.status==="unhealthy"?503:200).json({...health,version:PUBLIC_VERSION,release:INTERNAL_RELEASE_CODE,ai:"idle",aiRuntime:"LOCAL_SHARED_LAZY"});}catch(error){res.status(503).json({status:"unhealthy",version:PUBLIC_VERSION,release:INTERNAL_RELEASE_CODE,timestamp:new Date().toISOString(),error:"HEALTH_CHECK_UNAVAILABLE"});}});
app.get("/api/stats",(req,res)=>{const media=imageEngine3Summary();res.json({games:gameCount(),knowledge:knowledgeCount(),claims:claimCount(),sources:sourceCount(),images:media.ready,imageAssetsStored:media.stored,research:researchCount(),articles:articleCount(),pages:pageCount(),imageEngine:"3.0_NATIVE"});});
app.get("/api/templates",(req,res)=>res.json(availableTemplates.map(id=>({id,tabs:templateTabs(id)}))));

app.get("/api/games",paginatedPublicGames);
app.get("/api/games/:slug",(req,res)=>{const game=accessibleGame(req,req.params.slug);if(!game)return cleanPublicError(res,404,"Jogo não encontrado.");const session=currentAuth(req);if(session?.user?.id){recordActivity({userId:session.user.id,eventType:"GAME_PAGE_VIEW",gameId:game.id,metadata:{slug:game.slug}});recordInterestSignal({userId:session.user.id,gameId:game.id,genre:game.generos?.[0]||"",franchise:game.franquia||"",signalType:"VIEW_GAME",weight:14});}res.json({...game,visual:gamePublicVisual(game),relatedGames:relatedForGame(game,Boolean(adminSession(req))),parentGame:(()=>{const p=parentGameFor(game);return p?{id:p.id,slug:p.slug,name:p.nome}:null;})(),tabInicial:game.menu?.[0]?.id||"overview",following:session?.user?.id?isFollowing(session.user.id,game.id):false});});
app.get("/api/games/:slug/visual",(req,res)=>{const game=accessibleGame(req,req.params.slug);if(!game)return cleanPublicError(res,404,"Jogo não encontrado.");res.json(gamePublicVisual(game));});
app.post("/api/games/:slug/visual/resolve",generationLimiter,async(req,res)=>{const game=accessibleGame(req,req.params.slug);if(!game)return cleanPublicError(res,404,"Jogo não encontrado.");try{await resolveImage3({game,role:"COVER",language:req.body?.language||req.query.lang||"pt-BR",forceDiscovery:true});res.json(gamePublicVisual(game));}catch(error){runtimeLog("image3_public_game_resolve_failed",{gameId:game.id,error:String(error?.code||error?.message||error)});res.json(gamePublicVisual(game));}});
app.get("/api/games/:slug/tabs/:tabId",(req,res)=>{const game=accessibleGame(req,req.params.slug);if(!game)return cleanPublicError(res,404,"Jogo não encontrado.");const tab=game.menu?.find(item=>item.id===req.params.tabId);if(!tab)return cleanPublicError(res,404,"Aba não existe para este jogo.");const overview=tab.id==="overview"?{descricao:game.descricao,desenvolvedor:game.desenvolvedor,publicadora:game.publicadora,lancamento:game.lancamento,plataformas:game.plataformas,generos:game.generos,franquia:game.franquia,siteOficial:game.siteOficial}:null;res.json({tab,sections:tab.sections||[],overview});});
app.get("/api/games/:slug/tab/:tabId",(req,res)=>{const game=accessibleGame(req,req.params.slug);if(!game)return cleanPublicError(res,404,"Jogo não encontrado.");const tab=game.menu?.find(item=>item.id===req.params.tabId);if(!tab)return cleanPublicError(res,404,"Aba não existe para este jogo.");const overview=tab.id==="overview"?{descricao:game.descricao,desenvolvedor:game.desenvolvedor,publicadora:game.publicadora,lancamento:game.lancamento,plataformas:game.plataformas,generos:game.generos,franquia:game.franquia,siteOficial:game.siteOficial}:null;res.json({tab,sections:tab.sections||[],overview});});
function sectionHandler(req,res){const game=accessibleGame(req,req.params.slug);if(!game)return cleanPublicError(res,404,"Jogo não encontrado.");const tab=game.menu?.find(item=>item.id===req.params.tabId),section=tab?.sections?.find(item=>item.id===req.params.sectionId);if(!tab||!section)return cleanPublicError(res,404,"Seção não existe para este jogo.");const limit=Math.min(60,Math.max(1,Number(req.query.limit||24))),offset=Math.max(0,Number(req.query.offset||0));res.json({tab:{id:tab.id,label:tab.label},section,...listKnowledge({gameId:game.id,tabId:tab.id,sectionId:section.id,limit,offset})});}
app.get("/api/games/:slug/tabs/:tabId/:sectionId",sectionHandler);
app.get("/api/games/:slug/tab/:tabId/section/:sectionId",sectionHandler);

app.get("/api/entities/:id",(req,res)=>{const entity=getEntityById(req.params.id);if(!entity)return cleanPublicError(res,404,"Entidade não encontrada.");const game=accessibleGameById(req,entity.gameId);if(!game)return cleanPublicError(res,404,"Entidade não encontrada.");const knowledge=listKnowledge({gameId:entity.gameId,entityId:entity.id,limit:120}).entries;res.json({entity,game:{id:game.id,name:game.nome,slug:game.slug},knowledge,visual:entityPublicVisual(entity,entity.gameId)});});
app.get("/api/entities/:id/visual",(req,res)=>{const entity=getEntityById(req.params.id);if(!entity||!accessibleGameById(req,entity.gameId))return cleanPublicError(res,404,"Entidade não encontrada.");res.json(entityPublicVisual(entity,entity.gameId));});
app.post("/api/entities/:id/visual/resolve",generationLimiter,async(req,res)=>{const entity=getEntityById(req.params.id);if(!entity)return cleanPublicError(res,404,"Entidade não encontrada.");const game=accessibleGameById(req,entity.gameId);if(!game)return cleanPublicError(res,404,"Jogo da entidade não encontrado.");try{await resolveImage3({game,entity,language:req.body?.language||req.query.lang||"pt-BR",forceDiscovery:true});res.json(entityPublicVisual(entity,game.id));}catch(error){runtimeLog("image3_public_entity_resolve_failed",{gameId:game.id,entityId:entity.id,error:String(error?.code||error?.message||error)});res.json(entityPublicVisual(entity,game.id));}});
app.get("/api/knowledge/:id",(req,res)=>{const item=getKnowledgeById(req.params.id,{includeClaims:true,includeRelationships:true});if(!item||!accessibleGameById(req,item.gameId))return cleanPublicError(res,404,"Conhecimento não encontrado.");const sourceIds=[...new Set((item.claims||[]).flatMap(claim=>claim.sourceIds||[]))],sources=sourceIds.map(getSourceById).filter(Boolean);const game=getGameById(item.gameId);res.json({...item,sources,game:game?{id:game.id,name:game.nome,slug:game.slug}:null});});

app.get("/api/search",(req,res)=>{const game=req.query.game?getGameBySlug(String(req.query.game)):null,session=currentAuth(req),language=req.query.lang||authPayload(req).preferences?.language||"pt-BR";if(session?.user?.id&&String(req.query.q||"").trim())recordActivity({userId:session.user.id,eventType:"SEARCH",gameId:game?.id||null,metadata:{query:String(req.query.q).slice(0,180)}});res.json(searchGameVault(req.query.q,{gameId:game?.id||null,limit:Math.min(50,Math.max(1,Number(req.query.limit||30))),language}));});

async function brainHandler(req,res){
  const auth=authPayload(req);const answerLang=String(auth.preferences?.answerLanguage||"AUTO").toUpperCase();const selectedLanguage=answerLang==="PT-BR"?"pt-BR":answerLang==="EN"?"en-US":answerLang==="ES"?"es-ES":req.body?.language||auth.preferences?.language||"pt-BR";const started=Date.now();const session=currentAuth(req);
  try{const result=await publicDexterConsult({...req.body,language:selectedLanguage});if(session?.user?.id&&auth.preferences?.saveDexterHistory!==false)recordActivity({userId:session.user.id,eventType:"BRAIN_QUERY",gameId:result?.answer?.game?.id||null,metadata:{language:selectedLanguage,dexter:"gemma3:4b"}});recordBrainRequest({userId:session?.user?.id||null,language:selectedLanguage,status:"SUCCESS",durationMs:Date.now()-started,usedMemory:Boolean(result?.memory?.count),usedResearch:false});return res.json(result);}catch(error){console.error("[Dexter request failure]",error?.message);try{recordBrainRequest({userId:session?.user?.id||null,language:selectedLanguage,status:"FAILED",durationMs:Date.now()-started,usedResearch:false,errorCode:"DEXTER_PUBLIC_FAILED"});}catch{}return res.status(200).json(degradedAIResponse({language:selectedLanguage,reason:"DEXTER_REQUEST_FAILED"}));}
}
app.post("/api/ai/consult",brainLimiter,brainHandler);
app.post("/api/brain/consult",brainLimiter,brainHandler);

app.post("/api/games",requireAdmin,(req,res)=>{try{const game=upsertGame({...req.body,status:req.body?.status||"DRAFT"});res.status(201).json({sucesso:true,jogo:game,pagina:`/game.html?slug=${encodeURIComponent(game.slug)}`});}catch(error){cleanPublicError(res,400,error.message||"Falha ao adicionar jogo.");}});

app.get("/api/auth/me",(req,res)=>res.json(authPayload(req)));
app.post("/api/auth/register",authLimiter,(req,res)=>{try{res.status(201).json({authenticated:true,...register(req,res,req.body||{})});}catch(error){cleanPublicError(res,400,error.message);}});
// Beta 0.9875 login is registered below with optional email two-step verification.
app.post("/api/auth/login-legacy-disabled",authLimiter,(req,res)=>res.status(410).json({erro:"Use /api/auth/login."}));
app.post("/api/auth/logout",(req,res)=>res.json(logout(req,res)));
app.get("/api/setup/status",(req,res)=>res.json({...firstAdminSetupState(),...adminRecoveryStatus(req)}));
app.post("/api/setup/first-admin",authLimiter,(req,res)=>{try{res.status(201).json({authenticated:true,...setupFirstAdmin(req,res,req.body||{})});}catch(error){cleanPublicError(res,400,error.message||"Não foi possível concluir a configuração.");}});
app.get("/api/preferences",(req,res)=>res.json(authPayload(req).preferences||{language:null,theme:"dark",stored:false}));
app.post("/api/preferences",(req,res)=>{try{res.json(updatePreferences(req,req.body||{}));}catch(error){cleanPublicError(res,401,error.message);}});
app.get("/api/subscriptions/plans",(req,res)=>{const session=currentAuth(req);res.json({plans:PLANS,billing:billingStatus(),current:session?.user?.id?subscriptionPublicState(session.user.id):{tier:"FREE",entitlements:{tier:"FREE",free:true,pro:false,dev:false}}});});

app.post("/api/creator/generate",brainLimiter,async(req,res)=>{try{const session=currentAuth(req),save=Boolean(req.body?.save),result=await generateGameVaultContent({...req.body,userId:session?.user?.id||null,save});if(session?.user?.id)recordActivity({userId:session.user.id,eventType:"CREATOR_REQUEST",gameId:result.game.id,metadata:{contentType:result.contentType,topic:result.topic}});res.json(result);}catch(error){cleanPublicError(res,400,error.message||"GameIndex Creator could not generate this content.");}});

app.get("/api/profile",(req,res)=>{const session=currentAuth(req);if(!session)return cleanPublicError(res,401,"Faça login para abrir o perfil.");const profile=buildProfile(session.user.id);if(!profile)return cleanPublicError(res,404,"Perfil não encontrado.");res.json(profile);});
app.get("/api/profile/followed-games",(req,res)=>{const session=currentAuth(req);if(!session)return cleanPublicError(res,401,"Faça login.");res.json({games:listFollowedGames(session.user.id)});});
app.get("/api/profile/activity",(req,res)=>{const session=currentAuth(req);if(!session)return cleanPublicError(res,401,"Faça login.");res.json({activity:buildProfile(session.user.id)?.recentActivity||[]});});
app.get("/api/profile/creator-history",(req,res)=>{const session=currentAuth(req);if(!session)return cleanPublicError(res,401,"Faça login.");res.json({entries:buildProfile(session.user.id)?.creatorHistory||[]});});

app.get("/api/games/:slug/follow",(req,res)=>{const session=currentAuth(req),game=accessibleGame(req,req.params.slug);if(!game)return cleanPublicError(res,404,"Jogo não encontrado.");res.json({authenticated:Boolean(session),following:session?isFollowing(session.user.id,game.id):false});});
app.post("/api/games/:slug/follow",(req,res)=>{const session=currentAuth(req);if(!session)return cleanPublicError(res,401,"Faça login para seguir jogos.");const game=accessibleGame(req,req.params.slug);if(!game)return cleanPublicError(res,404,"Jogo não encontrado.");followGame(session.user.id,game.id);recordActivity({userId:session.user.id,eventType:"GAME_FOLLOW",gameId:game.id});recordInterestSignal({userId:session.user.id,gameId:game.id,genre:game.generos?.[0]||"",franchise:game.franquia||"",signalType:"FOLLOW_GAME",weight:50});res.json({following:true,game:{id:game.id,slug:game.slug,name:game.nome}});});
app.delete("/api/games/:slug/follow",(req,res)=>{const session=currentAuth(req);if(!session)return cleanPublicError(res,401,"Faça login.");const game=accessibleGame(req,req.params.slug);if(!game)return cleanPublicError(res,404,"Jogo não encontrado.");unfollowGame(session.user.id,game.id);recordActivity({userId:session.user.id,eventType:"GAME_UNFOLLOW",gameId:game.id});recordInterestSignal({userId:session.user.id,gameId:game.id,genre:game.generos?.[0]||"",franchise:game.franquia||"",signalType:"UNFOLLOW_GAME",weight:-30});res.json({following:false});});

app.get("/api/knowledge/:id/save",(req,res)=>{const item=getKnowledgeById(req.params.id);if(!item||!accessibleGameById(req,item.gameId))return cleanPublicError(res,404,"Conhecimento não encontrado.");const session=currentAuth(req);res.json({authenticated:Boolean(session),saved:session?isKnowledgeSaved(session.user.id,req.params.id):false});});
app.post("/api/knowledge/:id/save",(req,res)=>{const session=currentAuth(req);if(!session)return cleanPublicError(res,401,"Faça login para salvar conhecimento.");const item=getKnowledgeById(req.params.id);if(!item||!accessibleGameById(req,item.gameId))return cleanPublicError(res,404,"Conhecimento não encontrado.");saveKnowledgeForUser(session.user.id,req.params.id);recordActivity({userId:session.user.id,eventType:"KNOWLEDGE_SAVE",gameId:item.gameId,metadata:{knowledgeId:req.params.id}});res.json({saved:true});});
app.delete("/api/knowledge/:id/save",(req,res)=>{const session=currentAuth(req);if(!session)return cleanPublicError(res,401,"Faça login.");const item=getKnowledgeById(req.params.id);if(!item||!accessibleGameById(req,item.gameId))return cleanPublicError(res,404,"Conhecimento não encontrado.");unsaveKnowledgeForUser(session.user.id,req.params.id);res.json({saved:false});});

app.get("/api/coverage/:gameId",(req,res)=>{const bySlug=getGameBySlug(req.params.gameId),game=bySlug?accessibleGame(req,bySlug.slug):accessibleGameById(req,req.params.gameId);if(!game)return cleanPublicError(res,404,"Jogo não encontrado.");res.json({game:{id:game.id,slug:game.slug,name:game.nome},coverage:listCoverage(game.id)});});

registerBeta065Routes(app,{brainLimiter});
registerBeta067Routes(app,{generationLimiter});
registerBeta0675Routes(app);
registerBeta07Routes(app);
registerBeta08Routes(app);
registerBeta086Routes(app);
registerBeta087Routes(app);
registerBeta088Routes(app);
registerBeta0885Routes(app);
registerBeta089Routes(app);
registerBeta091Routes(app,{recoveryLimiter,generationLimiter});
registerBeta092Routes(app,{generationLimiter});
registerBeta095Routes(app,{publicBugLimiter,generationLimiter});
registerBeta096Routes(app,{socialLimiter,simulatorLimiter,generationLimiter});
registerBeta0975PrePublicRoutes(app);
registerBeta098Routes(app);
registerBeta0985Routes(app);
registerBeta0986Routes(app,{authLimiter});
registerBeta0987Routes(app);
registerBeta099Routes(app);
registerBeta099I5Routes(app);
registerBeta099I6Routes(app);
registerBeta0991HF1Routes(app);
registerBeta0991I1Routes(app);

app.get("/",(req,res)=>res.sendFile(path.join(publicDir,"index.html")));
app.use((req,res,next)=>{if(req.path.startsWith("/api/"))return res.status(404).json({erro:"Rota da API não encontrada."});next();});

app.listen(PORT,()=>{
  let autogen={enabled:false};try{if(!PERFORMANCE_MODE||String(process.env.GAMEINDEX_BACKGROUND_WORKERS||"false").toLowerCase()==="true")autogen=startAutonomousGenerationWorker();else autogen={enabled:false,deferred:true};}catch(error){runtimeLog("autogen_start_failed",{error:String(error.message||error)});}
  let construction={enabled:false};try{if(!PERFORMANCE_MODE||String(process.env.GAMEINDEX_BACKGROUND_WORKERS||"false").toLowerCase()==="true")construction=startConstructionWorker();else construction={enabled:false,deferred:true};}catch(error){runtimeLog("construction_worker_start_failed",{error:String(error.message||error)});}
  let prePublic={enabled:false};try{if(!PERFORMANCE_MODE||String(process.env.GAMEINDEX_BACKGROUND_WORKERS||"false").toLowerCase()==="true")prePublic=startPrePublicWorker();else prePublic={enabled:false,deferred:true};}catch(error){runtimeLog("pre_public_worker_start_failed",{error:String(error.message||error)});}
  let core98={enabled:false};try{if(!PERFORMANCE_MODE||String(process.env.GAMEINDEX_CORE98_WORKERS||process.env.GAMEINDEX_BACKGROUND_WORKERS||"false").toLowerCase()==="true")core98=startCore98Workers();else core98={enabled:false,deferred:true};}catch(error){runtimeLog("core98_worker_start_failed",{error:String(error.message||error)});}
  let imageEngine3={enabled:false};try{if(!PERFORMANCE_MODE||String(process.env.GAMEINDEX_IMAGE_REPAIR_WORKER||"false").toLowerCase()==="true")imageEngine3=startImageEngine3RepairWorker();else imageEngine3={enabled:false,deferred:true};}catch(error){runtimeLog("image_engine3_worker_start_failed",{error:String(error.message||error)});}
  let generationRecovery={enabled:false,recovered:0};try{if(!PERFORMANCE_MODE||String(process.env.GAMEINDEX_BACKGROUND_WORKERS||"false").toLowerCase()==="true")generationRecovery=startGenerationRecoveryWorker();else generationRecovery={enabled:false,recovered:0,deferred:true};}catch(error){runtimeLog("generation_recovery_start_failed",{error:String(error.message||error)});}
  runtimeLog("server_started",{port:PORT,environment:runtimeEnvironment(),schema:schemaVersion(),games:gameCount(),storageOrigin,database:startupDatabase,assets:startupAssets,startupDurationMs:Math.max(0,Date.now()-Date.parse(startedAt)),autogenEnabled:Boolean(autogen.enabled),constructionWorker:Boolean(construction.enabled),constructionRecovered:Number(construction.recovered||0),externalAiConfigured:false,aiMode:"LOCAL_FIRST_NO_API_KEY",prePublicWorker:Boolean(prePublic.enabled),core98Worker:Boolean(core98.enabled),generationRecoveryWorker:Boolean(generationRecovery.enabled),generationRecovered:Number(generationRecovery.recovered||0),universeBuildsRecovered:Number(startupUniverseBuildRecovery.recovered||0),version:PUBLIC_VERSION,release:INTERNAL_RELEASE_CODE,aiRuntime:"LOCAL_SHARED_LAZY"});
  const endpoint=typeof PORT==="string"&&!/^\d+$/.test(PORT)?"Azure IIS named pipe":`http://localhost:${PORT}`;
  console.log(`\n================================================\n GAMEINDEX BETA 0.991 I1 — RELIABILITY & NAVIGATION ONLINE\n================================================\n ${endpoint}\n Ambiente: ${runtimeEnvironment()}\n AI Slim Runtime: Ollama gemma3:4b · shared lazy runtime · optional\n Modo sem API externa: SUPORTADO\n Universe Builder 2.0 + Visual Grounding Engine 2.1 + GI Core 8.5: ACTIVE
 Pre-Public Worker: ${prePublic.enabled?"ACTIVE":"OFFLINE"}\n GI Core 8.5: ${core98.enabled?"ACTIVE":"OFFLINE"}\n Social Lab (TESTER/CREATOR): ACTIVE\n Mega Simulator: ACTIVE\n Legacy AI Systems: REMOVED\n Construction Worker: ${construction.enabled?"ACTIVE":"OFFLINE"}\n Billing: ${billingStatus().provider}\n Auto Page Builder: ${String(process.env.GAMEVAULT_PAGE_GENERATION_ENABLED??"true").toLowerCase()==="true"?"ACTIVE":"OFFLINE"}\n Generation Recovery: ${generationRecovery.enabled?"ACTIVE":"OFFLINE"} · recovered=${generationRecovery.recovered||0}\n Schema: ${schemaVersion()}\n Storage: ${storageOrigin}\n`);
});

process.on("unhandledRejection",reason=>runtimeLog("unhandled_rejection",{error:String(reason?.message||reason||"UNKNOWN")}));
