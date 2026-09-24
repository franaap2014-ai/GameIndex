import { randomUUID } from "node:crypto";
import { currentAuth } from "../auth/auth-service.mjs";
import { CAPABILITIES, accessSnapshotForUser, requireCapability, requireSameOriginMutation } from "../access/capability-service.mjs";
import { db, databaseStorageState, json, nowIso, productionStorageSafety } from "../database/connection.mjs";
import { CINEMATIC_EVENTS, cinematicQueueForUser, resolvePrimaryIdentity } from "../identity/cinematic-service.mjs";
import { listCinematicEvents, resetCinematicEvent } from "../database/repositories/cinematic-event-repository.mjs";
import { developerReportForBug, listBugDiagnostics } from "../database/repositories/bug-diagnostic-repository.mjs";
import { getBug } from "../database/repositories/bug-tracker-repository.mjs";

function userId(req){return currentAuth(req)?.user?.id||null;}
function noStore(res){res.setHeader("Cache-Control","no-store");return res;}
function fail(res,status,code,message){return noStore(res).status(status).json({ok:false,error:{code,message}});}

function audit(actor,target,eventKey,actionType,metadata={}){
  const id="cine-admin-"+randomUUID();
  db.prepare("INSERT INTO cinematic_admin_actions(id,actor_user_id,target_user_id,event_key,action_type,metadata_json,created_at) VALUES(?,?,?,?,?,?,?)").run(id,actor,target,eventKey,actionType,json(metadata||{}),nowIso());
  try{
    db.prepare("INSERT INTO admin_audit_events(id,actor_user_id,target_user_id,action_type,target_type,target_id,reason,metadata_json,created_at) VALUES(?,?,?,?,?,?,?,?,?)")
      .run("admin-audit-"+randomUUID(),actor,target,"CINEMATIC_"+actionType,"CINEMATIC",eventKey,"Beta 0.991 I1 Cinematics Center",json(metadata||{}),nowIso());
  }catch{}
}

export function registerBeta0991I1Routes(app){
  app.get("/api/admin/i1/authority",requireCapability("creator_control"),(req,res)=>{
    const actor=userId(req);if(!actor)return fail(res,401,"AUTH_REQUIRED","Faça login.");
    const access=accessSnapshotForUser(actor),primaryCreator=String(db.prepare(`SELECT value FROM meta WHERE key='primary_creator_user_id'`).get()?.value||"");
    return noStore(res).json({ok:true,authority:{
      staffRole:access.staffRole||"NONE",
      suspended:Boolean(access.suspended),
      roleTheme:access.roleTheme||"FREE",
      adminConnection:access.adminConnection||null,
      capabilityCount:(access.capabilities||[]).length,
      capabilityTotal:CAPABILITIES.length,
      primaryCreator:Boolean(primaryCreator&&primaryCreator===actor)
    }});
  });

  app.get("/api/admin/i1/storage",requireCapability("creator_control"),(req,res)=>{
    const state=databaseStorageState({includePath:false,probeWrite:false}),safety=productionStorageSafety();
    return noStore(res).json({ok:true,storage:{status:state.status,origin:state.origin,provider:state.provider,persistent:state.persistent,read:state.read,write:state.write,readOnly:state.readOnly,sizeBytes:state.sizeBytes,modifiedAt:state.modifiedAt,remote:state.remote||null},safety});
  });

  app.get("/api/admin/i1/cinematics",requireCapability("cinematic_test"),(req,res)=>{
    const actor=userId(req);if(!actor)return fail(res,401,"AUTH_REQUIRED","Faça login.");
    const queue=cinematicQueueForUser(actor);
    return noStore(res).json({
      ok:true,
      identity:resolvePrimaryIdentity(actor),
      theme:queue.theme,
      queue:queue.queue,
      events:listCinematicEvents(actor),
      catalog:Object.entries(CINEMATIC_EVENTS).map(([key,value])=>({key,...value}))
    });
  });

  app.post("/api/admin/i1/cinematics/:event/reset",requireSameOriginMutation,requireCapability("creator_control"),(req,res)=>{
    const actor=userId(req);if(!actor)return fail(res,401,"AUTH_REQUIRED","Faça login.");
    const def=Object.values(CINEMATIC_EVENTS).find(x=>x.eventKey===String(req.params.event));
    if(!def)return fail(res,404,"CINEMATIC_UNKNOWN","Cinematic não encontrada.");
    const target=String(req.body?.userId||actor);
    if(target!==actor&&!req.body?.confirmTarget)return fail(res,400,"CONFIRM_TARGET_REQUIRED","Confirme explicitamente o usuário alvo.");
    const event=resetCinematicEvent(target,def.eventKey,{reason:String(req.body?.reason||"Admin Cinematics Center").slice(0,240)});
    audit(actor,target,def.eventKey,"RESET_ELIGIBILITY",{reason:String(req.body?.reason||"")});
    return noStore(res).json({ok:true,event});
  });

  app.get("/api/admin/i1/bugs/:id/diagnostics",requireCapability("bug_triage"),(req,res)=>{
    const bug=getBug(String(req.params.id));if(!bug)return fail(res,404,"BUG_NOT_FOUND","Bug não encontrado.");
    return noStore(res).json({ok:true,bug,diagnostics:listBugDiagnostics(bug.id)});
  });

  app.get("/api/admin/i1/bugs/:id/developer-report",requireCapability("bug_triage"),(req,res)=>{
    const report=developerReportForBug(String(req.params.id));if(!report)return fail(res,404,"BUG_NOT_FOUND","Bug não encontrado.");
    return noStore(res).json({ok:true,...report});
  });
}
