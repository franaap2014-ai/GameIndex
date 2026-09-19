import { currentAuth } from "../auth/auth-service.mjs";
import { requireAdmin, adminSession } from "../admin/admin-auth.mjs";
import { getGameById, getGameBySlug } from "../database/repositories/game-repository.mjs";
import { getEntityById } from "../database/repositories/entity-repository.mjs";
import { createGenerationJob, getGenerationJob, listGenerationJobs, requestCancel } from "../database/repositories/generation-job-repository.mjs";
import { scheduleGeneration } from "../pages/generation-runner.mjs";
import { getPageById, getPageForEntity, listPages, listPageValidations, setPageStatus } from "../database/repositories/page-repository.mjs";
import { createDatabaseBackup, latestBackup, schemaVersion, verifyDatabase } from "../database/connection.mjs";
import { logAdminAction } from "../database/repositories/admin-repository.mjs";
import { normalizeLanguage } from "../i18n/language-service.mjs";

function cleanPage(page){return page?{...page}:null;}
function gameFrom(input){return getGameBySlug(String(input||""))||getGameById(String(input||""));}
function safeError(res,error,status=400){return res.status(status).json({erro:error?.message||"Falha na operação."});}

export function registerBeta067Routes(app,{generationLimiter}={}){
  const generationEnabled=String(process.env.GAMEVAULT_PAGE_GENERATION_ENABLED??"true").toLowerCase()==="true";
  app.get("/api/beta067/status",(req,res)=>res.json({version:"Beta 0.705",codename:"Discovery, Intelligence & Automation",brain:"STABLE_PIPELINE",languages:["pt-BR","en-US","es-ES"],persistentSaves:true,autoPageBuilder:generationEnabled,admin:Boolean(adminSession(req))}));

  app.get("/api/pages/:id",(req,res)=>{
    const page=getPageById(req.params.id);if(!page)return res.status(404).json({erro:"Página não encontrada."});
    const admin=adminSession(req);if(page.status!=="PUBLISHED"&&!admin)return res.status(404).json({erro:"Página não encontrada."});
    res.json({...cleanPage(page),validations:admin?listPageValidations(page.id):undefined});
  });
  app.get("/api/pages/by-entity/:entityId",(req,res)=>{
    const entity=getEntityById(req.params.entityId);if(!entity)return res.status(404).json({erro:"Entidade não encontrada."});
    const lang=normalizeLanguage(req.query.lang)||"pt-BR";const page=getPageForEntity(entity.gameId,entity.id,{language:lang});
    if(!page||page.status!=="PUBLISHED")return res.status(404).json({erro:"Página publicada ainda não disponível."});res.json(page);
  });

  app.post("/api/pages/generate",generationLimiter||((req,res,next)=>next()),requireAdmin,(req,res)=>{
    if(!generationEnabled)return res.status(503).json({erro:"Auto Page Builder está desativado por configuração local."});
    try{
      const game=gameFrom(req.body?.game);if(!game)return res.status(404).json({erro:"Jogo não encontrado."});
      const entity=req.body?.entityId?getEntityById(req.body.entityId):null;if(req.body?.entityId&&(!entity||entity.gameId!==game.id))return res.status(400).json({erro:"Entidade inválida para este jogo."});
      const mode=String(req.body?.researchMode||"STANDARD").toUpperCase()==="DEEP"?"DEEP":"STANDARD";const language=normalizeLanguage(req.body?.language)||"pt-BR";
      const job=createGenerationJob({userId:req.gameVaultAdmin.user.id,gameId:game.id,entityId:entity?.id||null,researchMode:mode,language});scheduleGeneration(job.id);
      logAdminAction({adminUserId:req.gameVaultAdmin.user.id,actionType:"GENERATE_PAGE",targetType:"GENERATION_JOB",targetId:job.id,metadata:{gameId:game.id,entityId:entity?.id||null,researchMode:mode}});
      res.status(202).json(job);
    }catch(error){safeError(res,error);}
  });
  app.get("/api/generation/:jobId",requireAdmin,(req,res)=>{const job=getGenerationJob(req.params.jobId);if(!job)return res.status(404).json({erro:"Geração não encontrada."});res.json(job);});
  app.get("/api/generation/:jobId/result",requireAdmin,(req,res)=>{const job=getGenerationJob(req.params.jobId);if(!job)return res.status(404).json({erro:"Geração não encontrada."});if(!job.resultPageId)return res.status(409).json({erro:"A geração ainda não produziu uma página."});res.json({job,page:getPageById(job.resultPageId),validations:listPageValidations(job.resultPageId)});});
  app.post("/api/generation/:jobId/cancel",requireAdmin,(req,res)=>{const job=getGenerationJob(req.params.jobId);if(!job)return res.status(404).json({erro:"Geração não encontrada."});res.json(requestCancel(job.id));});

  app.get("/api/admin/pages",requireAdmin,(req,res)=>res.json(listPages({status:req.query.status||null,gameId:req.query.gameId||null,language:req.query.lang||null,limit:req.query.limit||50,offset:req.query.offset||0})));
  app.get("/api/admin/generation-jobs",requireAdmin,(req,res)=>res.json({entries:listGenerationJobs({status:req.query.status||null,limit:req.query.limit||50,offset:req.query.offset||0})}));
  app.post("/api/admin/pages/:id/status",requireAdmin,(req,res)=>{
    try{const current=getPageById(req.params.id);if(!current)return res.status(404).json({erro:"Página não encontrada."});const requested=String(req.body?.status||"").toUpperCase();
      if(new Set(["READY","PUBLISHED"]).has(requested)){const checks=listPageValidations(current.id);const required=new Set(["FACT_SAFETY","SOURCE_SAFETY","CONTEXT_SAFETY"]);if(![...required].every(type=>checks.some(c=>c.type===type&&c.result==="PASS")))return res.status(409).json({erro:"A página ainda não passou pelos três níveis do Triple Safety."});}
      const page=setPageStatus(current.id,requested);logAdminAction({adminUserId:req.gameVaultAdmin.user.id,actionType:"PAGE_STATUS",targetType:"PAGE",targetId:page.id,metadata:{status:requested}});res.json({page});
    }catch(error){safeError(res,error);}
  });
  app.post("/api/admin/database/backup",requireAdmin,(req,res)=>{
    try{const backup=createDatabaseBackup({fromVersion:"0.7",toVersion:"0.7",label:"manual"});logAdminAction({adminUserId:req.gameVaultAdmin.user.id,actionType:"DATABASE_BACKUP",targetType:"DATABASE",targetId:"main",metadata:{filename:backup?.filename||""}});res.json({ok:true,backup:backup?{filename:backup.filename,verification:backup.verification}:null,schemaVersion:schemaVersion()});}catch(error){safeError(res,error,500);}
  });
  app.get("/api/admin/database/status",requireAdmin,(req,res)=>res.json({schemaVersion:schemaVersion(),latestBackup:latestBackup(),integrity:verifyDatabase(),persistent:true}));
}
