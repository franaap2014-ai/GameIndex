import { createHash, randomUUID, timingSafeEqual } from "node:crypto";
import { db, nowIso } from "../database/connection.mjs";
import { entitlementSnapshot, setInternalTier } from "../database/repositories/entitlement-repository.mjs";
import { getUserByEmail, setUserRole } from "../database/repositories/user-repository.mjs";
import { login, register } from "./auth-service.mjs";
import { ensureAdminConnection } from "../access/admin-connection-service.mjs";

function meta(key){try{return db.prepare(`SELECT value FROM meta WHERE key=?`).get(key)?.value||"";}catch{return "";}}
function setMeta(key,value){db.prepare(`INSERT INTO meta(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value`).run(key,String(value));}
function adminCount(){return Number(db.prepare(`SELECT COUNT(*) count FROM users WHERE role='ADMIN'`).get()?.count||0);}
function actorHash(req){const value=String(req.ip||req.socket?.remoteAddress||req.headers?.["x-forwarded-for"]||"unknown");return createHash("sha256").update(`gameindex-089:${value}`).digest("hex").slice(0,24);}
function audit(req,outcome,details={}){try{db.prepare(`INSERT INTO auth_audit(id,event,outcome,actor_hash,details_json,created_at) VALUES(?,?,?,?,?,?)`).run(`auth-${randomUUID()}`,"FIRST_ADMIN_SETUP",outcome,actorHash(req),JSON.stringify(details),nowIso());}catch{}}
function codeMatches(candidate){const expected=String(process.env.GAMEINDEX_SETUP_CODE||"");if(expected.length<12)return false;const a=createHash("sha256").update(String(candidate||"")).digest(),b=createHash("sha256").update(expected).digest();return timingSafeEqual(a,b);}

export function firstAdminSetupState(){
  const configured=String(process.env.GAMEINDEX_SETUP_CODE||"").length>=12,admins=adminCount(),completed=meta("first_admin_setup_completed")==="1"||admins>0;
  return {available:configured&&!completed&&admins===0,configured,completed,adminExists:admins>0,minimumCodeLength:12};
}

export function setupFirstAdmin(req,res,input={}){
  const state=firstAdminSetupState();
  try{
    if(!state.configured)throw new Error("A configuração inicial ainda não foi habilitada no deployment.");
    if(!state.available)throw new Error("A configuração do primeiro administrador já foi concluída.");
    if(!codeMatches(input.setupCode))throw new Error("Código de configuração inválido.");
    const email=String(input.email||"").trim().toLowerCase(),existing=getUserByEmail(email);
    const session=existing?login(req,res,{email,password:input.password}):register(req,res,{email,password:input.password,displayName:input.displayName,username:input.username});
    const userId=session.user.id;
    setUserRole(userId,"ADMIN");setInternalTier(userId,"DEV");
    db.prepare(`INSERT INTO developer_permissions(user_id,database_explorer,ai_flow_inspector,bug_tracker,image_diagnostics,deployment_monitor,page_generation,granted_by,updated_at) VALUES(?,?,?,?,?,?,?,?,?) ON CONFLICT(user_id) DO UPDATE SET database_explorer=1,ai_flow_inspector=1,bug_tracker=1,image_diagnostics=1,deployment_monitor=1,page_generation=1,granted_by=excluded.granted_by,updated_at=excluded.updated_at`).run(userId,1,1,1,1,1,1,"BETA_09_FIRST_ADMIN",nowIso());
    setMeta("primary_admin_user_id",userId);setMeta("admin_setup_required","0");setMeta("first_admin_setup_completed","1");
    const creator=db.prepare(`SELECT user_id FROM staff_role_assignments WHERE role='CREATOR'`).get();if(creator&&creator.user_id!==userId)throw new Error("Já existe um Creator primário diferente.");
    ensureAdminConnection({userId,role:"CREATOR",status:"ACTIVE",actorUserId:userId,reason:"Secure first owner setup",reactivate:true});
    setMeta("primary_creator_user_id",userId);setMeta("creator_setup_required","0");
    const entitlements=entitlementSnapshot(userId);audit(req,"SUCCESS",{userId});
    return {...session,user:{...session.user,role:"ADMIN",accountTier:"DEV",tier:"DEV",staffRole:"CREATOR",badge:"CREATOR",staffSuspended:false,entitlements},subscription:{...session.subscription,tier:"DEV",entitlements},setupCompleted:true};
  }catch(error){audit(req,"FAILED",{reason:String(error.message||"SETUP_FAILED").slice(0,120)});throw error;}
}
