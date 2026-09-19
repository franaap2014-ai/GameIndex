import { randomUUID } from "node:crypto";
import { db, nowIso } from "../database/connection.mjs";
import { adminSession } from "./admin-auth.mjs";
import { getEffectiveTier } from "../database/repositories/entitlement-repository.mjs";
import { currentAuth } from "../auth/auth-service.mjs";

function primaryAdminId(){try{return db.prepare(`SELECT value FROM meta WHERE key='primary_admin_user_id'`).get()?.value||"";}catch{return "";}}
function permissionRow(userId){try{return db.prepare(`SELECT * FROM developer_permissions WHERE user_id=?`).get(userId)||null;}catch{return null;}}
const STAFF_AREA_CAPABILITIES=Object.freeze({DATABASE_EXPLORER:"database_explorer",AI_FLOW_INSPECTOR:"ai_diagnostics",BUG_TRACKER:"bug_triage",IMAGE_DIAGNOSTICS:"image_management",DEPLOYMENT_MONITOR:"deployment_monitor",PAGE_GENERATION:"page_generation"});
const DEV_CAPABILITIES=new Set(Object.values(STAFF_AREA_CAPABILITIES));
function staffRoleRow(userId){try{return db.prepare(`SELECT role,suspended FROM staff_role_assignments WHERE user_id=?`).get(userId)||null;}catch{return null;}}
export function devAccessSnapshot(req,area="DEV"){
  const auth=currentAuth(req),staff=auth?staffRoleRow(auth.user.id):null;
  if(staff){
    const staffRole=String(staff.role||"NONE").toUpperCase(),capability=STAFF_AREA_CAPABILITIES[area],suspended=Boolean(staff.suspended),permission=!suspended&&(staffRole==="CREATOR"||(staffRole==="DEV"&&(!capability||DEV_CAPABILITIES.has(capability)))),authorized=permission;
    return {authenticated:true,userId:auth.user.id,username:auth.user.username||"",role:staffRole,tier:getEffectiveTier(auth.user.id),primaryAdmin:auth.user.id===primaryAdminId(),permission,authorized,suspended,result:authorized?"GRANTED":"DENIED",reason:authorized?"AUTHORIZED":suspended?"STAFF_SUSPENDED":"STAFF_CAPABILITY_MISSING"};
  }
  const session=adminSession(req);if(!session)return {authenticated:Boolean(auth),authorized:false,role:"",tier:"FREE",permission:false,result:"DENIED",reason:auth?"NOT_ADMIN":"NOT_AUTHENTICATED"};
  const tier=getEffectiveTier(session.user.id),primary=session.user.id===primaryAdminId(),row=permissionRow(session.user.id);const column={DATABASE_EXPLORER:"database_explorer",AI_FLOW_INSPECTOR:"ai_flow_inspector",BUG_TRACKER:"bug_tracker",IMAGE_DIAGNOSTICS:"image_diagnostics",DEPLOYMENT_MONITOR:"deployment_monitor",PAGE_GENERATION:"page_generation"}[area];
  const permission=column?Boolean(row?.[column]):(tier==="DEV"||primary);const authorized=session.user.role==="ADMIN"&&(tier==="DEV"||primary)&&(!column||permission||primary);
  return {authenticated:true,userId:session.user.id,username:session.user.username||"",role:session.user.role,tier,primaryAdmin:primary,permission,authorized,result:authorized?"GRANTED":"DENIED",reason:authorized?"AUTHORIZED":tier!=="DEV"&&!primary?"DEV_ENTITLEMENT_MISSING":column&&!permission?"AREA_PERMISSION_MISSING":"DENIED"};
}
export function recordAuthorizationDiagnostic(snapshot,area){try{db.prepare(`INSERT INTO authorization_diagnostics(id,user_id,area,authenticated,role,tier,permission,result,reason,created_at) VALUES(?,?,?,?,?,?,?,?,?,?)`).run(`authdiag-${randomUUID()}`,snapshot.userId||null,area,snapshot.authenticated?1:0,snapshot.role||"",snapshot.tier||"",snapshot.permission?1:0,snapshot.result||"DENIED",snapshot.reason||"",nowIso());}catch{}return snapshot;}
export function requireDevArea(area){return function(req,res,next){const snap=recordAuthorizationDiagnostic(devAccessSnapshot(req,area),area);if(!snap.authorized)return res.status(403).json({erro:"Acesso DEV/ADMIN necessário.",authorization:{authenticated:snap.authenticated,role:snap.role,tier:snap.tier,permission:snap.permission,result:snap.result,reason:snap.reason}});req.gameIndexDevAccess=snap;next();};}
export function requirePageGenerationDev(req,res,next){if(!currentAuth(req))return res.status(401).json({erro:"Faça login para criar páginas.",error:{code:"AUTH_REQUIRED",message:"Faça login para criar páginas.",retryable:false}});return requireDevArea("PAGE_GENERATION")(req,res,next);}
export function requireImageManagementDev(req,res,next){if(!currentAuth(req))return res.status(401).json({erro:"Faça login para adicionar imagens.",error:{code:"AUTH_REQUIRED",message:"Faça login para adicionar imagens.",retryable:false}});return requireDevArea("IMAGE_DIAGNOSTICS")(req,res,next);}
