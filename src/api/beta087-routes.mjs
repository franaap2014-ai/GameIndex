import { requireDevArea } from "../admin/dev-access.mjs";
import { currentAuth } from "../auth/auth-service.mjs";
import { databaseExplorerOverview, browseDatabaseTable, getDatabaseRecord, databaseIntegrityDiagnostics, editEntityCanonicalType, markEntityForReview, databaseReadProbe, databaseWriteProbe, updateDatabaseRecord, listDatabaseRecordHistory } from "../database/repositories/database-explorer-repository.mjs";
import { logAdminAction } from "../database/repositories/admin-repository.mjs";
import { createDatabaseBackup, schemaVersion } from "../database/connection.mjs";
import { entityConsistencyReport } from "../entities/canonical-entity-service.mjs";
import { accessSnapshot, requireSameOriginMutation } from "../access/capability-service.mjs";

function user(req){return currentAuth(req)?.user||null;}
function creatorEdit(req,res,next){
  const snapshot=accessSnapshot(req);
  if(!snapshot.authenticated)return res.status(401).json({ok:false,error:{code:"AUTH_REQUIRED",message:"Faça login para continuar.",component:"DATABASE_EXPLORER",retryable:false}});
  if(snapshot.staffRole!=="CREATOR")return res.status(403).json({ok:false,error:{code:"CREATOR_REQUIRED",message:"Somente o Creator pode editar registros diretamente no banco.",component:"DATABASE_EXPLORER",retryable:false}});
  req.gameIndexAccess=snapshot;next();
}
export function registerBeta087Routes(app){
  app.get("/api/beta087/status",(req,res)=>res.json({product:"GameIndex",version:"Beta 0.87",codename:"Stability & Integration",ai:"Dexter IA",aiSystem:"5.0",databaseExplorer:"V1",schema:schemaVersion(),stabilityRelease:true}));
  app.get("/api/admin/database-explorer",requireDevArea("DATABASE_EXPLORER"),(req,res)=>{const snapshot=accessSnapshot(req);res.json({...databaseExplorerOverview(),access:{staffRole:snapshot.staffRole||"NONE",canEdit:snapshot.staffRole==="CREATOR",mode:snapshot.staffRole==="CREATOR"?"CREATOR_CONTROLLED_EDIT":"READ_ONLY"}});});
  app.get("/api/admin/database-explorer/integrity",requireDevArea("DATABASE_EXPLORER"),(req,res)=>res.json(databaseIntegrityDiagnostics()));
  app.post("/api/admin/database-explorer/test-read",requireDevArea("DATABASE_EXPLORER"),(req,res)=>res.json(databaseReadProbe()));
  app.post("/api/admin/database-explorer/test-write",requireDevArea("DATABASE_EXPLORER"),(req,res)=>{const result=databaseWriteProbe();res.status(result.ok?200:503).json(result);});
  app.get("/api/admin/database-explorer/entity-consistency",requireDevArea("DATABASE_EXPLORER"),(req,res)=>res.json({entries:entityConsistencyReport({limit:req.query.limit||200,onlyConflicts:String(req.query.conflicts||"")==="1"})}));
  app.get("/api/admin/database-explorer/table/:table",requireDevArea("DATABASE_EXPLORER"),(req,res)=>{try{res.json(browseDatabaseTable({table:req.params.table,q:req.query.q||"",limit:req.query.limit||50,offset:req.query.offset||0}));}catch(error){res.status(400).json({erro:error.message});}});
  app.get("/api/admin/database-explorer/table/:table/:id",requireDevArea("DATABASE_EXPLORER"),(req,res)=>{try{const record=getDatabaseRecord({table:req.params.table,id:req.params.id});if(!record)return res.status(404).json({erro:"Registro não encontrado."});const snapshot=accessSnapshot(req);res.json({...record,access:{canEdit:snapshot.staffRole==="CREATOR",mode:snapshot.staffRole==="CREATOR"?"CREATOR_CONTROLLED_EDIT":"READ_ONLY"}});}catch(error){res.status(400).json({erro:error.message});}});
  app.get("/api/admin/database-explorer/table/:table/:id/history",requireDevArea("DATABASE_EXPLORER"),(req,res)=>{try{res.json({entries:listDatabaseRecordHistory({table:req.params.table,id:req.params.id,limit:req.query.limit||30})});}catch(error){res.status(400).json({erro:error.message});}});
  app.patch("/api/admin/database-explorer/table/:table/:id",creatorEdit,requireSameOriginMutation,(req,res)=>{try{const u=user(req),result=updateDatabaseRecord({table:req.params.table,id:req.params.id,changes:req.body?.changes||{},reason:req.body?.reason||"",expectedFingerprint:req.body?.expectedFingerprint||"",actorUserId:u.id});res.json(result);}catch(error){const status=error?.code==="STALE_RECORD"?409:400;res.status(status).json({ok:false,error:{code:error?.code||"DATABASE_EDIT_REJECTED",message:error.message||"Alteração rejeitada.",component:"DATABASE_EXPLORER",retryable:error?.code==="STALE_RECORD"}});}});
  app.post("/api/admin/database-explorer/entity/:id/type",requireDevArea("DATABASE_EXPLORER"),(req,res)=>{try{const u=user(req),type=String(req.body?.type||"").toUpperCase(),reason=String(req.body?.reason||"Database Explorer correction").slice(0,500);const result=editEntityCanonicalType({entityId:req.params.id,type,reason});logAdminAction({adminUserId:u.id,actionType:"UPDATE_ENTITY_TYPE",targetType:"ENTITY",targetId:req.params.id,metadata:{before:result.before?.type,after:result.after?.type,canonicalType:result.canonical?.canonicalType,reason}});res.json({ok:true,...result});}catch(error){res.status(400).json({erro:error.message});}});
  app.post("/api/admin/database-explorer/entity/:id/review",requireDevArea("DATABASE_EXPLORER"),(req,res)=>{try{const u=user(req),result=markEntityForReview(req.params.id);logAdminAction({adminUserId:u.id,actionType:"MARK_ENTITY_REVIEW",targetType:"ENTITY",targetId:req.params.id,metadata:{reason:"Database Explorer"}});res.json({ok:true,...result});}catch(error){res.status(400).json({erro:error.message});}});
  app.post("/api/admin/database-explorer/backup",requireDevArea("DATABASE_EXPLORER"),(req,res)=>{try{const u=user(req),backup=createDatabaseBackup({fromVersion:"0.965",toVersion:"0.965",label:"database-explorer"});logAdminAction({adminUserId:u.id,actionType:"CREATE_DATABASE_BACKUP",targetType:"DATABASE",targetId:backup?.filename||"",metadata:{source:"DATABASE_EXPLORER"}});res.json({ok:true,backup:backup?{filename:backup.filename,verification:backup.verification}:null});}catch(error){res.status(500).json({erro:error.message});}});
}
