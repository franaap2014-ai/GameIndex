import { createHash, randomUUID, timingSafeEqual } from "node:crypto";
import { db, nowIso, transaction } from "../database/connection.mjs";
import { currentAuth, rotateLoginSession, verifyUserPassword } from "./auth-service.mjs";
import { getUserById, setUserRole } from "../database/repositories/user-repository.mjs";
import { setInternalTier } from "../database/repositories/entitlement-repository.mjs";
import { firstAdminSetupState } from "./first-admin-setup.mjs";
import { ensureAdminConnection, setAdminConnection } from "../access/admin-connection-service.mjs";

function meta(key){try{return db.prepare(`SELECT value FROM meta WHERE key=?`).get(key)?.value||"";}catch{return "";}}
function setMeta(key,value){db.prepare(`INSERT INTO meta(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value`).run(key,String(value));}
function normalizedEmail(value=""){return String(value||"").trim().toLowerCase();}
function configuredEmail(){return normalizedEmail(process.env.GAMEINDEX_BOOTSTRAP_ADMIN_EMAIL||"");}
function recoveryCode(){return String(process.env.GAMEINDEX_ADMIN_RECOVERY_CODE||"");}
function codeConfigured(){return recoveryCode().length>=12;}
function codeMatches(candidate){const expected=recoveryCode();if(expected.length<12)return false;const a=createHash("sha256").update(String(candidate||"")).digest(),b=createHash("sha256").update(expected).digest();return timingSafeEqual(a,b);}
function actorHash(req){const value=String(req.ip||req.socket?.remoteAddress||req.headers?.["x-forwarded-for"]||"unknown");return createHash("sha256").update(`gameindex-09-recovery:${value}`).digest("hex").slice(0,24);}
function record(req,userId,outcome,reason=""){try{db.prepare(`INSERT INTO admin_recovery_attempts(id,user_id,actor_hash,outcome,reason,created_at) VALUES(?,?,?,?,?,?)`).run(randomUUID(),userId||null,actorHash(req),outcome,String(reason||"").slice(0,120),nowIso());}catch{}}
function completed(){return meta("beta_09_admin_recovery_completed")==="1";}

export function adminRecoveryStatus(req){
  const session=currentAuth(req),first=firstAdminSetupState(),email=configuredEmail(),configured=Boolean(email&&codeConfigured()&&!completed()),eligible=Boolean(session?.user&&normalizedEmail(session.user.email)===email);
  let state="ADMIN_EXISTS";if(first.available)state="READY";else if(!first.adminExists&&!first.configured)state="SETUP_CODE_MISSING";else if(configured)state="RECOVERY_AVAILABLE";else if(completed())state="SETUP_COMPLETED";
  return {state,firstAdminAvailable:first.available,recoveryAvailable:configured,adminExists:first.adminExists,signedIn:Boolean(session),currentUserEligible:eligible,minimumCodeLength:12};
}

export function claimAdminRecovery(req,res,{password,recoveryCode:code}={}){
  const session=currentAuth(req),status=adminRecoveryStatus(req),userId=session?.user?.id||null;
  try{
    if(!session)throw new Error("Faça login na conta que será promovida.");
    if(!status.recoveryAvailable)throw new Error("A recuperação administrativa não está disponível.");
    if(!status.currentUserEligible)throw new Error("Esta conta não está autorizada para a recuperação.");
    if(!verifyUserPassword(userId,password))throw new Error("Senha atual incorreta.");
    if(!codeMatches(code))throw new Error("Código de recuperação inválido.");
    transaction(()=>{
      setUserRole(userId,"ADMIN");setInternalTier(userId,"DEV");
      db.prepare(`INSERT INTO developer_permissions(user_id,database_explorer,ai_flow_inspector,bug_tracker,image_diagnostics,deployment_monitor,page_generation,granted_by,updated_at) VALUES(?,?,?,?,?,?,?,?,?) ON CONFLICT(user_id) DO UPDATE SET database_explorer=1,ai_flow_inspector=1,bug_tracker=1,image_diagnostics=1,deployment_monitor=1,page_generation=1,granted_by=excluded.granted_by,updated_at=excluded.updated_at`).run(userId,1,1,1,1,1,1,"BETA_09_OWNER_RECOVERY",nowIso());
      setMeta("primary_admin_user_id",userId);setMeta("admin_setup_required","0");setMeta("first_admin_setup_completed","1");setMeta("beta_09_admin_recovery_completed","1");setMeta("beta_09_admin_recovery_completed_at",nowIso());
      const creator=db.prepare(`SELECT user_id FROM staff_role_assignments WHERE role='CREATOR'`).get();
      // Activate the recovered owner first so Creator authority is never temporarily absent.
      ensureAdminConnection({userId,role:"CREATOR",status:"ACTIVE",actorUserId:userId,reason:"Secure owner recovery",reactivate:true});
      if(creator&&creator.user_id!==userId){
        setAdminConnection({userId:creator.user_id,role:"DEV",status:"ACTIVE",actorUserId:userId,reason:"Secure owner recovery transfer"});
        try{db.prepare(`INSERT INTO role_change_audit(id,actor_user_id,target_user_id,action,previous_value,new_value,reason,request_id,created_at) VALUES(?,?,?,?,?,?,?,?,?)`).run(randomUUID(),userId,creator.user_id,"STAFF_ROLE_CHANGED","CREATOR","DEV","Secure owner recovery transfer","OWNER_RECOVERY",nowIso());}catch{}
      }
      try{db.prepare(`INSERT INTO role_change_audit(id,actor_user_id,target_user_id,action,previous_value,new_value,reason,request_id,created_at) VALUES(?,?,?,?,?,?,?,?,?)`).run(randomUUID(),userId,userId,"OWNER_RECOVERY","NONE","CREATOR","Secure recovery with password and configured code","OWNER_RECOVERY",nowIso());}catch{}
      setMeta("primary_creator_user_id",userId);setMeta("creator_setup_required","0");
    });
    record(req,userId,"SUCCESS","OWNER_RECOVERED");const user=getUserById(userId),renewed=rotateLoginSession(req,res,user);return {...renewed,authenticated:true,user:{...renewed.user,role:"ADMIN",tier:"DEV",accountTier:"DEV",staffRole:"CREATOR",badge:"CREATOR",staffSuspended:false},recoveryCompleted:true,removeAzureRecoverySettings:true};
  }catch(error){record(req,userId,"FAILED",error.message);throw error;}
}
