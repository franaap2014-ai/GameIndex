import { currentAuth } from "../auth/auth-service.mjs";
import { db, nowIso } from "../database/connection.mjs";
import { getEffectiveTier } from "../database/repositories/entitlement-repository.mjs";
import { adminConnectionForUser } from "./admin-connection-service.mjs";

export const CAPABILITIES=Object.freeze([
  "creator_control","music_management","manage_staff_roles","manage_account_plans","view_role_audit","page_generation","universe_build",
  "creator_studio_edit","content_publish","image_management","game_submission","tester_preview","tester_feedback","bug_triage",
  "database_explorer","ai_diagnostics","deployment_monitor","social_lab_access","social_group_create",
  "social_community_access","social_report","social_moderation_review","simulator_run_safe","simulator_configure",
  "simulator_review_all","ai_sharpener","animation_edit","animation_publish","cinematic_test","profile_avatar_management"
]);


export const USER_RANK_POWER=Object.freeze({FREE:1,PRO:2,TESTER:3,DEV:4,CREATOR:5});
export const USER_RANK_LORE=Object.freeze({FREE:"PEASANTS",PRO:"BOURGEOISIE",TESTER:"ROYALTY",DEV:"COURT",CREATOR:"KING"});
export function rankPower(snapshot={}){const rank=snapshot.staffRole&&snapshot.staffRole!=="NONE"?snapshot.staffRole:(snapshot.plan||"FREE");return USER_RANK_POWER[rank]||USER_RANK_POWER.FREE;}

const ROLE_CAPABILITIES=Object.freeze({
  CREATOR:new Set(CAPABILITIES),
  DEV:new Set(["page_generation","universe_build","creator_studio_edit","image_management","music_management","game_submission","bug_triage","ai_diagnostics","animation_edit","cinematic_test"]),
  TESTER:new Set(["game_submission","tester_preview","tester_feedback","social_lab_access","social_group_create","social_community_access","social_report","simulator_run_safe","cinematic_test"]),
  NONE:new Set()
});

function tableExists(name){try{return Boolean(db.prepare(`SELECT 1 FROM sqlite_master WHERE type='table' AND name=?`).get(name));}catch{return false;}}
function roleRow(userId){if(!tableExists("staff_role_assignments"))return null;return db.prepare(`SELECT * FROM staff_role_assignments WHERE user_id=?`).get(userId)||null;}
function legacyRole(user){if(!user)return "NONE";if(user.role==="ADMIN"&&String(user.account_tier||"").toUpperCase()==="DEV")return "DEV";return "NONE";}
function manualCapabilities(userId){
  if(!tableExists("staff_capability_grants"))return [];
  return db.prepare(`SELECT capability,effect,expires_at FROM staff_capability_grants WHERE user_id=? AND (expires_at='' OR expires_at>?)`).all(userId,nowIso());
}

export function accessSnapshotForUser(userId){
  const user=db.prepare(`SELECT u.id,u.role,u.account_tier,p.username,u.display_name FROM users u LEFT JOIN user_profiles p ON p.user_id=u.id WHERE u.id=?`).get(userId);
  if(!user)return {authenticated:false,userId:"",staffRole:"NONE",plan:"FREE",badge:"FREE",suspended:false,capabilities:[],legacy:false,accessRevision:0,roleTheme:"FREE"};
  const assignment=roleRow(user.id),staffRole=assignment?.role||legacyRole(user),connection=adminConnectionForUser(user.id),connectionRequired=["CREATOR","DEV"].includes(staffRole),connectionBlocked=connectionRequired&&!connection?.active,suspended=Boolean(assignment?.suspended)||connectionBlocked,caps=new Set(suspended?[]:(ROLE_CAPABILITIES[staffRole]||ROLE_CAPABILITIES.NONE));
  if(!suspended)for(const row of manualCapabilities(user.id)){if(!CAPABILITIES.includes(row.capability))continue;if(row.effect==="DENY")caps.delete(row.capability);else caps.add(row.capability);}
  const plan=getEffectiveTier(user.id)==="PRO"?"PRO":"FREE";
  const badge=staffRole!=="NONE"?staffRole:plan;
  const accessRevision=tableExists("user_access_revisions")?Number(db.prepare(`SELECT revision FROM user_access_revisions WHERE user_id=?`).get(user.id)?.revision||1):1,roleTheme=staffRole==="CREATOR"?"CREATOR":staffRole==="DEV"?"DEV":staffRole==="TESTER"?"TESTER":plan;
  return {authenticated:true,userId:user.id,username:user.username||"",displayName:user.display_name||"",staffRole,plan,badge,suspended,capabilities:[...caps].sort(),legacy:!assignment,accessRevision,roleTheme,adminConnection:connection?{role:connection.role,status:connection.status,active:connection.active}:null};
}

export function accessSnapshot(req){const auth=currentAuth(req);return auth?accessSnapshotForUser(auth.user.id):{authenticated:false,userId:"",staffRole:"NONE",plan:"FREE",badge:"FREE",suspended:false,capabilities:[]};}
export function hasCapability(subject,capability){const snapshot=typeof subject==="string"?accessSnapshotForUser(subject):subject?.headers?accessSnapshot(subject):subject;return Boolean(snapshot?.authenticated&&!snapshot.suspended&&snapshot.capabilities?.includes(capability));}

export function requireCapability(capability){
  return function(req,res,next){
    const snapshot=accessSnapshot(req);req.gameIndexAccess=snapshot;
    if(!snapshot.authenticated)return res.status(401).json({ok:false,error:{code:"AUTH_REQUIRED",message:"Faça login para continuar.",component:"CAPABILITY_AUTH",retryable:false}});
    if(!hasCapability(snapshot,capability))return res.status(403).json({ok:false,error:{code:"CAPABILITY_DENIED",message:"Sua conta não possui autorização para esta área.",component:"CAPABILITY_AUTH",capability,retryable:false}});
    next();
  };
}

export function requireAnyCapability(capabilities=[]){
  const required=[...new Set((Array.isArray(capabilities)?capabilities:[capabilities]).map(String).filter(Boolean))];
  return function(req,res,next){
    const snapshot=accessSnapshot(req);req.gameIndexAccess=snapshot;
    if(!snapshot.authenticated)return res.status(401).json({ok:false,error:{code:"AUTH_REQUIRED",message:"Faça login para continuar.",component:"CAPABILITY_AUTH",retryable:false}});
    if(!required.some(capability=>hasCapability(snapshot,capability)))return res.status(403).json({ok:false,error:{code:"CAPABILITY_DENIED",message:"Sua conta não possui autorização para esta área.",component:"CAPABILITY_AUTH",capabilities:required,retryable:false}});
    next();
  };
}

export function requireSameOriginMutation(req,res,next){
  if(!["POST","PUT","PATCH","DELETE"].includes(req.method))return next();
  const origin=String(req.headers.origin||"");
  const forwardedHost=String(req.headers["x-forwarded-host"]||req.headers.host||"").split(",")[0].trim();
  if(origin){try{if(new URL(origin).host!==forwardedHost)return res.status(403).json({ok:false,error:{code:"ORIGIN_DENIED",message:"Origem da solicitação não permitida.",component:"REQUEST_SECURITY",retryable:false}});}catch{return res.status(403).json({ok:false,error:{code:"ORIGIN_INVALID",message:"Origem inválida.",component:"REQUEST_SECURITY",retryable:false}});}}
  if(req.headers["sec-fetch-site"]==="cross-site")return res.status(403).json({ok:false,error:{code:"ORIGIN_DENIED",message:"Origem da solicitação não permitida."}});
  if(req.method==="DELETE"&&!req.headers["transfer-encoding"]&&!Number(req.headers["content-length"]||0))return next();
  if(req.is?.("application/json")||req.is?.("application/x-www-form-urlencoded"))return next();
  return res.status(415).json({ok:false,error:{code:"CONTENT_TYPE_REQUIRED",message:"Envie dados estruturados pelo próprio GameIndex.",component:"REQUEST_SECURITY",retryable:false}});
}

export function requireSocialLab(req,res,next){return requireCapability("social_lab_access")(req,res,next);}
export function requireSimulator(req,res,next){return requireCapability("simulator_run_safe")(req,res,next);}
