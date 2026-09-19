import { requireAdmin, adminSession } from "../admin/admin-auth.mjs";
import { brainMetrics } from "../database/repositories/brain-metrics-repository.mjs";
import { listUsernameConflicts } from "../database/repositories/profile-repository.mjs";
import { db, createDatabaseBackup, latestBackup, schemaVersion, verifyDatabase } from "../database/connection.mjs";
import { logAdminAction } from "../database/repositories/admin-repository.mjs";

export function registerBeta0675Routes(app){
  app.get("/api/beta0675/status",(req,res)=>res.json({
    version:"Beta 0.675",
    codename:"Admin & Identity Stability",
    admin:Boolean(adminSession(req)),
    uniqueUsernames:true,
    adminDashboard:true,
    stickyTopBar:true,
    pageBuilder:String(process.env.GAMEVAULT_PAGE_GENERATION_ENABLED??"true").toLowerCase()==="true"?"ACTIVE":"NOT_ACTIVE",
    persistentSaves:true
  }));

  app.get("/api/admin/brain/status",requireAdmin,(req,res)=>res.json(brainMetrics()));
  app.get("/api/admin/username-conflicts",requireAdmin,(req,res)=>res.json({entries:listUsernameConflicts({limit:req.query.limit||100})}));
  app.get("/api/admin/system-status",requireAdmin,(req,res)=>{
    const migration=db.prepare(`SELECT version,name,applied_at,status FROM schema_migrations ORDER BY applied_at DESC LIMIT 1`).get()||null;
    res.json({version:"Beta 0.675",schemaVersion:schemaVersion(),database:verifyDatabase(),latestBackup:latestBackup(),lastMigration:migration,pageBuilder:String(process.env.GAMEVAULT_PAGE_GENERATION_ENABLED??"true").toLowerCase()==="true"?"ACTIVE":"NOT_ACTIVE",uptimeSeconds:Math.round(process.uptime())});
  });
  app.post("/api/admin/database/backup-0675",requireAdmin,(req,res)=>{
    try{
      const backup=createDatabaseBackup({fromVersion:"0.675",toVersion:"0.675",label:"manual"});
      logAdminAction({adminUserId:req.gameVaultAdmin.user.id,actionType:"DATABASE_BACKUP",targetType:"DATABASE",targetId:"main",metadata:{filename:backup?.filename||""}});
      res.json({ok:true,backup:backup?{filename:backup.filename,verification:backup.verification}:null,schemaVersion:schemaVersion()});
    }catch(error){res.status(500).json({erro:"Não foi possível criar o backup do GameVault."});}
  });
}
