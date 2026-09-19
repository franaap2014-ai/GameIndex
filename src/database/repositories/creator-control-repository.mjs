import { randomUUID } from "node:crypto";
import { db, json, nowIso, parseJson, transaction } from "../connection.mjs";
import { deleteSessionsForUser } from "./user-repository.mjs";
import { accessSnapshotForUser, CAPABILITIES } from "../../access/capability-service.mjs";

const MUTABLE_ROLES=new Set(["DEV","TESTER","NONE"]);
function tableExists(name){return Boolean(db.prepare(`SELECT 1 FROM sqlite_master WHERE type='table' AND name=?`).get(name));}
function cleanReason(value){const reason=String(value||"").replace(/[<>\u0000-\u001f]/g," ").replace(/\s+/g," ").trim().slice(0,500);if(reason.length<3)throw new Error("Informe um motivo com pelo menos 3 caracteres.");return reason;}
function creatorId(){return String(db.prepare(`SELECT value FROM meta WHERE key='primary_creator_user_id'`).get()?.value||"");}
function safeDay(value){return value?String(value).slice(0,10):"";}
function safeUser(row){if(!row)return null;const access=accessSnapshotForUser(row.id);return {id:row.id,username:row.username||"",displayName:row.display_name||"",createdAt:row.created_at,lastActiveDate:safeDay(row.last_active_at||row.last_login_at),accountStatus:access.suspended?"STAFF_SUSPENDED":"ACTIVE",roleAssignmentStatus:access.legacy?"LEGACY_COMPATIBILITY":"ASSIGNED",...access};}
function userRow(id){return db.prepare(`SELECT u.id,u.display_name,u.created_at,u.last_login_at,p.username FROM users u LEFT JOIN user_profiles p ON p.user_id=u.id WHERE u.id=?`).get(id);}
function revision(userId){return tableExists("user_access_revisions")?Number(db.prepare(`SELECT revision FROM user_access_revisions WHERE user_id=?`).get(userId)?.revision||1):1;}
function assertRevision(userId,expected){if(expected===null||expected===undefined||expected==="")return;const current=revision(userId);if(current!==Number(expected))throw Object.assign(new Error("A conta mudou em outra sessão; recarregue antes de confirmar."),{code:"ACCESS_REVISION_CONFLICT",currentRevision:current});}
function bumpRevision(userId){if(!tableExists("user_access_revisions"))return;const now=nowIso();db.prepare(`INSERT INTO user_access_revisions(user_id,revision,last_active_at,updated_at) VALUES(?,2,'',?) ON CONFLICT(user_id) DO UPDATE SET revision=revision+1,updated_at=excluded.updated_at`).run(userId,now);}
function writeAudit({requestId,actorUserId,targetUserId,eventType,before,after,reason,context={}}){
  db.prepare(`INSERT INTO role_change_audit(id,request_id,actor_user_id,target_user_id,event_type,previous_staff_role,next_staff_role,previous_plan,next_plan,changed_capabilities_json,reason,context_json,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)`)
    .run(randomUUID(),String(requestId||randomUUID()).slice(0,120),actorUserId,targetUserId,eventType,before.staffRole,after.staffRole,before.plan,after.plan,json([...new Set([...(before.capabilities||[]),...(after.capabilities||[])])].filter(cap=>(before.capabilities||[]).includes(cap)!==(after.capabilities||[]).includes(cap))),reason,json(context),nowIso());
}
function assertCreator(actorUserId){if(!actorUserId||actorUserId!==creatorId()||accessSnapshotForUser(actorUserId).staffRole!=="CREATOR")throw new Error("Somente o Creator verificado pode executar esta ação.");}
function assertTarget(targetUserId){const row=userRow(targetUserId);if(!row)throw new Error("Usuário não encontrado.");if(targetUserId===creatorId())throw new Error("A identidade Creator não pode ser alterada por este painel.");return row;}

export function searchCreatorUsers({q="",role="",plan="",status="",sort="createdAt",direction="desc",limit=30,offset=0}={}){
  const normalized=String(q||"").normalize("NFKC").trim().replace(/^@/,"").toLocaleLowerCase("en-US").slice(0,80),n=Math.min(100,Math.max(1,Number(limit)||30)),o=Math.max(0,Number(offset)||0),roleFilter=String(role||"").toUpperCase(),planFilter=String(plan||"").toUpperCase(),statusFilter=String(status||"").toUpperCase();
  const sql=tableExists("user_access_revisions")?`SELECT u.id,u.display_name,u.created_at,u.last_login_at,p.username,r.last_active_at FROM users u LEFT JOIN user_profiles p ON p.user_id=u.id LEFT JOIN user_access_revisions r ON r.user_id=u.id ORDER BY u.created_at DESC`:`SELECT u.id,u.display_name,u.created_at,u.last_login_at,p.username,'' last_active_at FROM users u LEFT JOIN user_profiles p ON p.user_id=u.id ORDER BY u.created_at DESC`;
  const rows=db.prepare(sql).all().map(safeUser).filter(user=>{
    const username=String(user.username||"").normalize("NFKC").toLocaleLowerCase("en-US"),name=String(user.displayName||"").normalize("NFKC").toLocaleLowerCase("en-US");
    const textOk=!normalized||username===normalized||username.startsWith(normalized)||name.includes(normalized),roleOk=!roleFilter||user.staffRole===roleFilter,planOk=!planFilter||user.plan===planFilter,statusOk=!statusFilter||user.accountStatus===statusFilter;
    return textOk&&roleOk&&planOk&&statusOk;
  });
  const selectors={displayName:user=>user.displayName||"",username:user=>user.username||"",role:user=>user.staffRole,plan:user=>user.plan,createdAt:user=>user.createdAt||"",lastActive:user=>user.lastActiveDate||""},selector=selectors[sort]||selectors.createdAt,sign=String(direction).toLowerCase()==="asc"?1:-1;
  rows.sort((a,b)=>String(selector(a)).localeCompare(String(selector(b)),"pt-BR",{sensitivity:"base"})*sign||a.id.localeCompare(b.id));
  return {entries:rows.slice(o,o+n),total:rows.length,limit:n,offset:o,filters:{q:normalized,role:roleFilter,plan:planFilter,status:statusFilter,sort,direction:sign===1?"asc":"desc"}};
}
export function getCreatorUser(id){return safeUser(userRow(id));}

export function creatorSummary(){
  const roles=Object.fromEntries(db.prepare(`SELECT role,COUNT(*) count FROM staff_role_assignments WHERE suspended=0 GROUP BY role`).all().map(r=>[r.role,Number(r.count)]));
  const suspended=Number(db.prepare(`SELECT COUNT(*) count FROM staff_role_assignments WHERE suspended=1`).get()?.count||0),users=db.prepare(`SELECT id FROM users`).all().map(r=>accessSnapshotForUser(r.id)),plans={PRO:users.filter(x=>x.plan==="PRO").length,FREE:users.filter(x=>x.plan==="FREE").length};
  const scalar=(sql)=>{try{return Number(db.prepare(sql).get()?.count||0);}catch{return 0;}};
  return {counts:{total:users.length,active:users.filter(x=>!x.suspended).length,CREATOR:roles.CREATOR||0,DEV:roles.DEV||0,TESTER:roles.TESTER||0,...plans,suspended},activeTesterInvitations:scalar(`SELECT COUNT(*) count FROM tester_invitations WHERE status='PENDING' AND expires_at>datetime('now')`),openTesterFeedback:scalar(`SELECT COUNT(*) count FROM test_feedback WHERE status NOT IN ('RESOLVED','CLOSED')`),activeConstructionRuns:scalar(`SELECT COUNT(*) count FROM construction_runs WHERE status IN ('QUEUED','RUNNING','PAUSED','RETRY_SCHEDULED')`),socialLabUsers:roles.TESTER||0,recentSimulatorRuns:scalar(`SELECT COUNT(*) count FROM simulator_runs WHERE created_at>=datetime('now','-7 days')`),unresolvedCriticalBugs:scalar(`SELECT COUNT(*) count FROM bugs WHERE severity IN ('CRITICAL','SECURITY') AND status NOT IN ('VERIFIED','WONT_FIX','DUPLICATE')`),awaitingPublication:scalar(`SELECT COUNT(*) count FROM creator_drafts WHERE status IN ('READY_FOR_REVIEW','READY_TO_PUBLISH')`),recentAudit:listRoleAudit({limit:8}).entries};
}

export function setStaffRole({actorUserId,targetUserId,nextRole,reason,requestId,expectedRole=null,expectedRevision=null}){
  assertCreator(actorUserId);assertTarget(targetUserId);assertRevision(targetUserId,expectedRevision);const role=String(nextRole||"").toUpperCase();if(!MUTABLE_ROLES.has(role))throw new Error("Papel de staff inválido.");const why=cleanReason(reason),before=accessSnapshotForUser(targetUserId);if(expectedRole&&before.staffRole!==String(expectedRole).toUpperCase())throw Object.assign(new Error("O papel mudou em outra sessão; recarregue antes de confirmar."),{code:"ROLE_REVISION_CONFLICT",currentRevision:revision(targetUserId)});if(before.staffRole===role)return {ok:true,idempotent:true,user:getCreatorUser(targetUserId),sessionsRotated:false};
  transaction(()=>{const now=nowIso();db.prepare(`INSERT INTO staff_role_assignments(user_id,role,suspended,assigned_by,reason,created_at,updated_at) VALUES(?,?,?,?,?,?,?) ON CONFLICT(user_id) DO UPDATE SET role=excluded.role,suspended=0,assigned_by=excluded.assigned_by,reason=excluded.reason,updated_at=excluded.updated_at`).run(targetUserId,role,0,actorUserId,why,now,now);bumpRevision(targetUserId);const after=accessSnapshotForUser(targetUserId);writeAudit({requestId,actorUserId,targetUserId,eventType:"STAFF_ROLE_CHANGED",before,after,reason:why,context:{expectedRole:expectedRole||before.staffRole,sessionRefresh:"HOT"}});});
  return {ok:true,idempotent:false,user:getCreatorUser(targetUserId),sessionsRotated:false,sessionRefresh:"HOT",accessRevision:revision(targetUserId)};
}

export function setStaffSuspension({actorUserId,targetUserId,suspended,reason,requestId,expectedRevision=null}){
  assertCreator(actorUserId);assertTarget(targetUserId);assertRevision(targetUserId,expectedRevision);const why=cleanReason(reason),before=accessSnapshotForUser(targetUserId),next=Boolean(suspended);if(before.suspended===next)return {ok:true,idempotent:true,user:getCreatorUser(targetUserId),sessionsRotated:false};
  transaction(()=>{const now=nowIso();db.prepare(`INSERT INTO staff_role_assignments(user_id,role,suspended,assigned_by,reason,created_at,updated_at) VALUES(?,?,?,?,?,?,?) ON CONFLICT(user_id) DO UPDATE SET suspended=excluded.suspended,assigned_by=excluded.assigned_by,reason=excluded.reason,updated_at=excluded.updated_at`).run(targetUserId,before.staffRole,next?1:0,actorUserId,why,now,now);bumpRevision(targetUserId);const after=accessSnapshotForUser(targetUserId);writeAudit({requestId,actorUserId,targetUserId,eventType:next?"STAFF_SUSPENDED":"STAFF_RESTORED",before,after,reason:why});deleteSessionsForUser(targetUserId);});
  return {ok:true,idempotent:false,user:getCreatorUser(targetUserId),sessionsRotated:true};
}

export function setManualPlan({actorUserId,targetUserId,active,reason,expiresAt="",requestId,expectedRevision=null}){
  assertCreator(actorUserId);assertTarget(targetUserId);assertRevision(targetUserId,expectedRevision);const why=cleanReason(reason),before=accessSnapshotForUser(targetUserId),enabled=Boolean(active),expiry=expiresAt?new Date(expiresAt).toISOString():"";if(expiry&&Date.parse(expiry)<=Date.now())throw new Error("A expiração precisa estar no futuro.");
  transaction(()=>{const now=nowIso();if(enabled)db.prepare(`INSERT INTO manual_plan_grants(id,user_id,plan,active,granted_by,reason,expires_at,created_at,updated_at) VALUES(?,?,'PRO',1,?,?,?,?,?)`).run(randomUUID(),targetUserId,actorUserId,why,expiry,now,now);else db.prepare(`UPDATE manual_plan_grants SET active=0,updated_at=? WHERE user_id=? AND active=1`).run(now,targetUserId);bumpRevision(targetUserId);const after=accessSnapshotForUser(targetUserId);if(before.plan===after.plan&&before.plan===(enabled?"PRO":"FREE"))return;writeAudit({requestId,actorUserId,targetUserId,eventType:enabled?"MANUAL_PRO_GRANTED":"MANUAL_PRO_REVOKED",before,after,reason:why,context:{expiresAt:expiry}});});
  return {ok:true,user:getCreatorUser(targetUserId)};
}

export function listRoleAudit({limit=50,offset=0,targetUserId=null}={}){const n=Math.min(200,Math.max(1,Number(limit)||50)),o=Math.max(0,Number(offset)||0),rows=targetUserId?db.prepare(`SELECT * FROM role_change_audit WHERE target_user_id=? ORDER BY created_at DESC LIMIT ? OFFSET ?`).all(targetUserId,n,o):db.prepare(`SELECT * FROM role_change_audit ORDER BY created_at DESC LIMIT ? OFFSET ?`).all(n,o);return {entries:rows.map(r=>({id:r.id,requestId:r.request_id,actorUserId:r.actor_user_id,targetUserId:r.target_user_id,eventType:r.event_type,previousStaffRole:r.previous_staff_role,nextStaffRole:r.next_staff_role,previousPlan:r.previous_plan,nextPlan:r.next_plan,changedCapabilities:parseJson(r.changed_capabilities_json,[]).filter(x=>CAPABILITIES.includes(x)),reason:r.reason,context:parseJson(r.context_json,{}),createdAt:r.created_at})),limit:n,offset:o};}
