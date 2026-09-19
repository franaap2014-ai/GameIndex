import { db, nowIso } from "../database/connection.mjs";
import { randomUUID } from "node:crypto";

function tableExists(name){try{return Boolean(db.prepare(`SELECT 1 FROM sqlite_master WHERE type='table' AND name=?`).get(name));}catch{return false;}}
function activeCreatorCount(){
  if(!tableExists("admin_connections"))return 0;
  return Number(db.prepare(`SELECT COUNT(*) AS n FROM admin_connections WHERE connection_role='CREATOR' AND status='ACTIVE'`).get()?.n||0);
}

export function adminConnectionForUser(userId){
  if(!userId||!tableExists("admin_connections"))return null;
  const row=db.prepare(`SELECT ac.*,p.username,u.display_name FROM admin_connections ac JOIN users u ON u.id=ac.user_id LEFT JOIN user_profiles p ON p.user_id=u.id WHERE ac.user_id=?`).get(String(userId));
  return row?{userId:row.user_id,username:row.username||"",displayName:row.display_name||"",role:row.connection_role,status:row.status,active:row.status==="ACTIVE",createdBy:row.created_by||"",reason:row.reason||"",createdAt:row.created_at,updatedAt:row.updated_at}:null;
}
export function listAdminConnections(){
  if(!tableExists("admin_connections"))return [];
  return db.prepare(`SELECT ac.*,p.username,u.display_name,u.email FROM admin_connections ac JOIN users u ON u.id=ac.user_id LEFT JOIN user_profiles p ON p.user_id=u.id ORDER BY CASE ac.connection_role WHEN 'CREATOR' THEN 0 ELSE 1 END, lower(COALESCE(p.username,u.display_name,u.email))`).all().map(row=>({userId:row.user_id,username:row.username||"",displayName:row.display_name||"",email:row.email||"",role:row.connection_role,status:row.status,active:row.status==="ACTIVE",reason:row.reason||"",createdAt:row.created_at,updatedAt:row.updated_at}));
}
export function setAdminConnection({userId,role,status="ACTIVE",actorUserId,reason=""}={}){
  if(!userId||!actorUserId)throw new Error("IDENTITY_REQUIRED");
  const cleanRole=String(role||"").toUpperCase(),cleanStatus=String(status||"ACTIVE").toUpperCase();
  if(!["CREATOR","DEV"].includes(cleanRole)||!["ACTIVE","INACTIVE","REVOKED"].includes(cleanStatus))throw new Error("INVALID_ADMIN_CONNECTION");
  const user=db.prepare(`SELECT id FROM users WHERE id=?`).get(String(userId));if(!user)throw new Error("USER_NOT_FOUND");
  const previous=adminConnectionForUser(userId);
  if(previous?.active&&previous.role==="CREATOR"&&(cleanRole!=="CREATOR"||cleanStatus!=="ACTIVE")&&activeCreatorCount()<=1)throw new Error("LAST_CREATOR_REQUIRED");
  const now=nowIso();
  db.prepare(`INSERT INTO admin_connections(user_id,connection_role,status,created_by,reason,created_at,updated_at) VALUES(?,?,?,?,?,?,?) ON CONFLICT(user_id) DO UPDATE SET connection_role=excluded.connection_role,status=excluded.status,reason=excluded.reason,updated_at=excluded.updated_at`).run(String(userId),cleanRole,cleanStatus,String(actorUserId),String(reason||"").slice(0,240),now,now);
  // Reuse the established capability model instead of creating a parallel permission system.
  db.prepare(`INSERT INTO staff_role_assignments(user_id,role,suspended,assigned_by,reason,created_at,updated_at) VALUES(?,?,?,?,?,?,?) ON CONFLICT(user_id) DO UPDATE SET role=excluded.role,suspended=excluded.suspended,assigned_by=excluded.assigned_by,reason=excluded.reason,updated_at=excluded.updated_at`).run(String(userId),cleanRole,cleanStatus==="ACTIVE"?0:1,String(actorUserId),`0.986 admin connection: ${String(reason||"").slice(0,160)}`,now,now);
  try{db.prepare(`INSERT INTO role_change_audit(id,request_id,actor_user_id,target_user_id,event_type,previous_staff_role,next_staff_role,previous_plan,next_plan,changed_capabilities_json,reason,context_json,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(randomUUID(),randomUUID(),String(actorUserId),String(userId),"ADMIN_CONNECTION_UPDATED",previous?.role||"NONE",cleanRole,"FREE","FREE","[]",String(reason||"0.986 admin connection update").slice(0,240),JSON.stringify({status:cleanStatus}),now);}catch{}
  return adminConnectionForUser(userId);
}
