import { randomUUID } from "node:crypto";
import { db, json, nowIso, parseJson, transaction } from "../connection.mjs";

function projectMap(row){
  if(!row)return null;
  return {
    id:row.id,key:row.project_key,name:row.name,type:row.animation_type,status:row.status,
    durationMs:Number(row.duration_ms||0),currentRevision:Number(row.current_revision||0),
    publishedRevision:Number(row.published_revision||0),createdBy:row.created_by||null,
    createdAt:row.created_at,updatedAt:row.updated_at
  };
}
function revisionMap(row){
  if(!row)return null;
  return {
    id:row.id,projectId:row.project_id,revision:Number(row.revision||0),definition:parseJson(row.definition_json,{}),
    status:row.status,createdBy:row.created_by||null,createdAt:row.created_at,updatedAt:row.updated_at,publishedAt:row.published_at||""
  };
}
function presetMap(row){
  if(!row)return null;
  return {id:row.id,key:row.preset_key,name:row.name,category:row.category,definition:parseJson(row.definition_json,{}),builtIn:Boolean(row.built_in),createdAt:row.created_at,updatedAt:row.updated_at};
}
export function listAnimationProjects({limit=100,status=""}={}){
  const cap=Math.max(1,Math.min(300,Number(limit)||100));
  const rows=status
    ?db.prepare(`SELECT * FROM animation_projects WHERE status=? ORDER BY updated_at DESC LIMIT ?`).all(String(status).toUpperCase(),cap)
    :db.prepare(`SELECT * FROM animation_projects ORDER BY CASE status WHEN 'DRAFT' THEN 0 WHEN 'PREVIEW' THEN 1 WHEN 'PUBLISHED' THEN 2 ELSE 3 END,updated_at DESC LIMIT ?`).all(cap);
  return rows.map(projectMap);
}
export function getAnimationProject(value){
  const key=String(value||"");
  return projectMap(db.prepare(`SELECT * FROM animation_projects WHERE id=? OR project_key=? LIMIT 1`).get(key,key));
}
export function getAnimationRevision(projectId,revision){
  return revisionMap(db.prepare(`SELECT * FROM animation_revisions WHERE project_id=? AND revision=? LIMIT 1`).get(String(projectId),Number(revision)));
}
export function getCurrentAnimationRevision(projectId){
  return revisionMap(db.prepare(`SELECT r.* FROM animation_revisions r JOIN animation_projects p ON p.id=r.project_id AND p.current_revision=r.revision WHERE p.id=? LIMIT 1`).get(String(projectId)));
}
export function getPublishedAnimationRevision(projectId){
  return revisionMap(db.prepare(`SELECT r.* FROM animation_revisions r JOIN animation_projects p ON p.id=r.project_id AND p.published_revision=r.revision WHERE p.id=? AND p.published_revision>0 LIMIT 1`).get(String(projectId)));
}
export function listAnimationRevisions(projectId,{limit=100}={}){
  return db.prepare(`SELECT * FROM animation_revisions WHERE project_id=? ORDER BY revision DESC LIMIT ?`).all(String(projectId),Math.max(1,Math.min(300,Number(limit)||100))).map(revisionMap);
}
export function listAnimationPresets(){
  return db.prepare(`SELECT * FROM animation_presets ORDER BY built_in DESC,lower(name)`).all().map(presetMap);
}
export function getAnimationPreset(key){
  return presetMap(db.prepare(`SELECT * FROM animation_presets WHERE preset_key=? LIMIT 1`).get(String(key||"")));
}
export function upsertBuiltInAnimationPreset({key,name,category,definition}={}){
  const now=nowIso(),id=`preset-${String(key||"").replace(/[^a-z0-9_-]/gi,"-").toLowerCase()}`;
  db.prepare(`INSERT INTO animation_presets(id,preset_key,name,category,definition_json,built_in,created_at,updated_at)
    VALUES(?,?,?,?,?,1,?,?)
    ON CONFLICT(preset_key) DO UPDATE SET name=excluded.name,category=excluded.category,definition_json=excluded.definition_json,built_in=1,updated_at=excluded.updated_at`)
    .run(id,String(key),String(name),String(category),json(definition),now,now);
  return getAnimationPreset(key);
}
export function recordAnimationAudit({actorUserId=null,projectId=null,revisionId=null,action,metadata={}}={}){
  db.prepare(`INSERT INTO animation_audit(id,actor_user_id,project_id,revision_id,action,metadata_json,created_at) VALUES(?,?,?,?,?,?,?)`)
    .run(randomUUID(),actorUserId||null,projectId||null,revisionId||null,String(action||"UNKNOWN").slice(0,80),json(metadata||{}),nowIso());
}
export function listAnimationAudit(projectId,{limit=80}={}){
  return db.prepare(`SELECT id,actor_user_id,project_id,revision_id,action,metadata_json,created_at FROM animation_audit WHERE project_id=? ORDER BY created_at DESC LIMIT ?`)
    .all(String(projectId),Math.max(1,Math.min(200,Number(limit)||80)))
    .map(row=>({...row,metadata:parseJson(row.metadata_json,{})}));
}
export function insertAnimationProject({key,name,type,durationMs,definition,actorUserId,source="CREATED"}={}){
  const id=randomUUID(),revisionId=randomUUID(),now=nowIso();
  transaction(()=>{
    db.prepare(`INSERT INTO animation_projects(id,project_key,name,animation_type,status,duration_ms,current_revision,published_revision,created_by,created_at,updated_at) VALUES(?,?,?,?, 'DRAFT',?,1,0,?,?,?)`)
      .run(id,String(key),String(name),String(type),Number(durationMs),actorUserId||null,now,now);
    db.prepare(`INSERT INTO animation_revisions(id,project_id,revision,definition_json,status,created_by,created_at,updated_at,published_at) VALUES(?,?,1,?,'DRAFT',?,?,?,'')`)
      .run(revisionId,id,json(definition),actorUserId||null,now,now);
    recordAnimationAudit({actorUserId,projectId:id,revisionId,action:"PROJECT_CREATED",metadata:{source}});
  });
  return getAnimationProject(id);
}
export function saveAnimationDraft({projectId,name,type,durationMs,definition,actorUserId}={}){
  const project=getAnimationProject(projectId);if(!project)return null;
  const current=getCurrentAnimationRevision(project.id),now=nowIso();
  let revision=current?.revision||project.currentRevision||1,revisionId=current?.id||null;
  transaction(()=>{
    if(!current||!["DRAFT","PREVIEW"].includes(current.status)){
      revision=Number(db.prepare(`SELECT COALESCE(MAX(revision),0)+1 AS next FROM animation_revisions WHERE project_id=?`).get(project.id)?.next||1);
      revisionId=randomUUID();
      db.prepare(`INSERT INTO animation_revisions(id,project_id,revision,definition_json,status,created_by,created_at,updated_at,published_at) VALUES(?,?,?,?,'DRAFT',?,?,?,'')`)
        .run(revisionId,project.id,revision,json(definition),actorUserId||null,now,now);
    }else{
      db.prepare(`UPDATE animation_revisions SET definition_json=?,status='DRAFT',updated_at=? WHERE id=?`).run(json(definition),now,current.id);
    }
    db.prepare(`UPDATE animation_projects SET name=?,animation_type=?,status='DRAFT',duration_ms=?,current_revision=?,updated_at=? WHERE id=?`)
      .run(String(name),String(type),Number(durationMs),revision,now,project.id);
    recordAnimationAudit({actorUserId,projectId:project.id,revisionId,action:"DRAFT_SAVED",metadata:{revision}});
  });
  return {project:getAnimationProject(project.id),revision:getAnimationRevision(project.id,revision)};
}
export function setAnimationPreviewState({projectId,actorUserId}={}){
  const project=getAnimationProject(projectId);if(!project)return null;
  const current=getCurrentAnimationRevision(project.id);if(!current)return null;
  const now=nowIso();
  transaction(()=>{
    if(current.status==="DRAFT")db.prepare(`UPDATE animation_revisions SET status='PREVIEW',updated_at=? WHERE id=?`).run(now,current.id);
    db.prepare(`UPDATE animation_projects SET status='PREVIEW',updated_at=? WHERE id=?`).run(now,project.id);
    recordAnimationAudit({actorUserId,projectId:project.id,revisionId:current.id,action:"PREVIEWED",metadata:{revision:current.revision}});
  });
  return {project:getAnimationProject(project.id),revision:getAnimationRevision(project.id,current.revision)};
}
export function publishAnimationRevision({projectId,actorUserId}={}){
  const project=getAnimationProject(projectId);if(!project)return null;
  const current=getCurrentAnimationRevision(project.id);if(!current)return null;
  const now=nowIso();
  transaction(()=>{
    db.prepare(`UPDATE animation_revisions SET status='PUBLISHED',published_at=CASE WHEN published_at='' THEN ? ELSE published_at END,updated_at=? WHERE id=?`).run(now,now,current.id);
    db.prepare(`UPDATE animation_projects SET status='PUBLISHED',published_revision=?,current_revision=?,updated_at=? WHERE id=?`).run(current.revision,current.revision,now,project.id);
    recordAnimationAudit({actorUserId,projectId:project.id,revisionId:current.id,action:"PUBLISHED",metadata:{revision:current.revision}});
  });
  return {project:getAnimationProject(project.id),revision:getAnimationRevision(project.id,current.revision)};
}
export function rollbackAnimationRevision({projectId,revision,actorUserId}={}){
  const project=getAnimationProject(projectId);if(!project)return null;
  const target=getAnimationRevision(project.id,revision);if(!target||target.status!=="PUBLISHED")return null;
  const now=nowIso();
  transaction(()=>{
    db.prepare(`UPDATE animation_projects SET status='PUBLISHED',published_revision=?,updated_at=? WHERE id=?`).run(target.revision,now,project.id);
    recordAnimationAudit({actorUserId,projectId:project.id,revisionId:target.id,action:"ROLLBACK",metadata:{revision:target.revision,from:project.publishedRevision}});
  });
  return {project:getAnimationProject(project.id),revision:target};
}
export function archiveAnimationProject({projectId,actorUserId}={}){
  const project=getAnimationProject(projectId);if(!project)return null;
  const now=nowIso();
  transaction(()=>{
    db.prepare(`UPDATE animation_projects SET status='ARCHIVED',updated_at=? WHERE id=?`).run(now,project.id);
    recordAnimationAudit({actorUserId,projectId:project.id,action:"ARCHIVED",metadata:{publishedRevision:project.publishedRevision}});
  });
  return getAnimationProject(project.id);
}
export function setAnimationBinding({projectId,contextType,contextKey="",revision,enabled=true,actorUserId}={}){
  const project=getAnimationProject(projectId);if(!project)return null;
  const rev=getAnimationRevision(project.id,revision);if(!rev||rev.status!=="PUBLISHED")return null;
  const now=nowIso(),id=randomUUID();
  transaction(()=>{
    db.prepare(`INSERT INTO animation_bindings(id,animation_project_id,context_type,context_key,active_revision,enabled,updated_by,updated_at)
      VALUES(?,?,?,?,?,?,?,?)
      ON CONFLICT(context_type,context_key) DO UPDATE SET animation_project_id=excluded.animation_project_id,active_revision=excluded.active_revision,enabled=excluded.enabled,updated_by=excluded.updated_by,updated_at=excluded.updated_at`)
      .run(id,project.id,String(contextType),String(contextKey||""),rev.revision,enabled?1:0,actorUserId||null,now);
    recordAnimationAudit({actorUserId,projectId:project.id,revisionId:rev.id,action:"BINDING_CHANGED",metadata:{contextType,contextKey,enabled:Boolean(enabled)}});
  });
  return db.prepare(`SELECT * FROM animation_bindings WHERE context_type=? AND context_key=?`).get(String(contextType),String(contextKey||""));
}
