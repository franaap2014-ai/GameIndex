import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";
import { validateAnimationDefinition } from "../src/animations/animation-schema.mjs";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=p=>readFileSync(path.join(root,p),"utf8");

const release=read("src/config/release-099i6.mjs");
const connection=read("src/database/connection.mjs");
const migration=read("src/database/migrations/044_beta_0991_i1_hf2.sql");
const capability=read("src/access/capability-service.mjs");
const adminConnections=read("src/access/admin-connection-service.mjs");
const setup=read("src/auth/first-admin-setup.mjs");
const recovery=read("src/auth/admin-recovery.mjs");
const shell=read("public/js/shell-0986.js");
const server=read("server.mjs");
const routes=read("src/api/animation-editor-routes.mjs");
const service=read("src/animations/animation-editor-service.mjs");
const repository=read("src/database/repositories/animation-repository.mjs");
const editorHtml=read("public/animation-editor.html");
const editorJs=read("public/js/animation-editor.js");
const editorCss=read("public/css/animation-editor.css");
const browserRuntime=read("public/js/animation-runtime.js");
const adminHtml=read("public/admin.html");
const adminJs=read("public/js/admin.js");
const pkg=JSON.parse(read("package.json"));

assert.match(release,/INTERNAL_RELEASE="0\.991-I1-HF2"/);
assert.match(release,/BETA_0_991_I1_HF2_CREATOR_ANIMATION_EDITOR/);
assert.match(release,/TARGET_SCHEMA=44/);
assert.match(connection,/044_beta_0991_i1_hf2\.sql/);
assert.match(connection,/GAMEINDEX_TARGET_SCHEMA\|\|44/);
assert.match(connection,/animation_/);
assert.match(connection,/Render production requires DATABASE_URL/);

assert.match(capability,/"animation_edit"/);
assert.match(capability,/"animation_publish"/);
assert.match(capability,/CREATOR:new Set\(CAPABILITIES\)/);
assert.doesNotMatch(capability,/DEV:new Set\([^\n]*animation_publish/);

assert.match(adminConnections,/ensureAdminConnection/);
assert.match(setup,/ensureAdminConnection\(\{userId,role:"CREATOR",status:"ACTIVE"/);
assert.match(recovery,/ensureAdminConnection\(\{userId,role:"CREATOR",status:"ACTIVE"/);
assert.match(recovery,/setAdminConnection\(\{userId:creator\.user_id,role:"DEV",status:"ACTIVE"/);

assert.match(migration,/INSERT OR IGNORE INTO admin_connections/);
assert.match(migration,/CREATE TABLE IF NOT EXISTS animation_projects/);
assert.match(migration,/CREATE TABLE IF NOT EXISTS animation_revisions/);
assert.match(migration,/CREATE TABLE IF NOT EXISTS animation_bindings/);
assert.match(migration,/CREATE TABLE IF NOT EXISTS animation_presets/);
assert.match(migration,/CREATE TABLE IF NOT EXISTS animation_audit/);

assert.match(shell,/Animation Editor/);
assert.match(shell,/data-cap="animation_edit"/);
assert.match(shell,/admin\.html#connections/);
assert.match(server,/requireCapability\("animation_edit"\)/);
assert.match(server,/registerAnimationEditorRoutes/);
assert.match(routes,/requireCapability\("animation_publish"\)/);
assert.match(routes,/requireSameOriginMutation/);
assert.match(service,/flushDurablePersistence\(\{force:true,reason:"animation-publish"/);
assert.match(repository,/status='PUBLISHED'/);
assert.match(editorHtml,/TIMELINE/);
assert.match(editorJs,/bindKeyframeDrag/);
assert.match(editorJs,/INSPECTOR_PROPERTIES/);
assert.match(editorJs,/TECH_CORNER/);
assert.match(editorJs,/Custom color/);
assert.match(editorJs,/1800/);
assert.match(editorCss,/grid-template-columns:250px minmax\(420px,1fr\) 280px/);
assert.match(browserRuntime,/function easeValue/);
assert.match(browserRuntime,/GI_POWER/);
assert.match(adminHtml,/data-admin-section="connections"/);
assert.match(adminHtml,/adminConnectionsList/);
assert.match(adminJs,/loadConnections/);
assert.match(adminJs,/currentPassword/);

assert.equal(pkg.version,"0.991.4");
assert.equal(pkg.scripts["test:0991i1hf2"],"node tests/beta0991-i1-hf2-creator-animation-editor.mjs");

const safe=validateAnimationDefinition({
  name:"Creator Intro Test",type:"CINEMATIC",durationMs:4200,background:{mode:"GAMEINDEX_DARK"},
  tracks:[{id:"logo",component:"GI_LOGO",name:"Logo",color:"CREATOR_GOLD",keyframes:[{time:0,opacity:0},{time:450,opacity:1,scale:1}]}]
});
assert.equal(safe.tracks[0].component,"GI_LOGO");
assert.equal(safe.durationMs,4200);
assert.throws(()=>validateAnimationDefinition({name:"Bad",type:"CINEMATIC",durationMs:1000,tracks:[{id:"x",component:"SCRIPT",keyframes:[]}]}),/Componente desconhecido/);
assert.throws(()=>validateAnimationDefinition({name:"Bad",type:"CINEMATIC",durationMs:1000,tracks:[{id:"x",component:"GLOW",keyframes:[{time:0,evil:1}]}]}),/Propriedade de keyframe não permitida/);

const db=new DatabaseSync(":memory:");
db.exec(`
  PRAGMA foreign_keys=ON;
  CREATE TABLE users(id TEXT PRIMARY KEY);
  CREATE TABLE meta(key TEXT PRIMARY KEY,value TEXT NOT NULL);
  CREATE TABLE staff_role_assignments(
    user_id TEXT PRIMARY KEY,role TEXT NOT NULL,suspended INTEGER NOT NULL DEFAULT 0,
    assigned_by TEXT,reason TEXT NOT NULL DEFAULT '',created_at TEXT NOT NULL,updated_at TEXT NOT NULL
  );
  CREATE TABLE admin_connections(
    user_id TEXT PRIMARY KEY,connection_role TEXT NOT NULL,status TEXT NOT NULL,
    created_by TEXT,reason TEXT NOT NULL DEFAULT '',created_at TEXT NOT NULL,updated_at TEXT NOT NULL
  );
`);
db.prepare("INSERT INTO users(id) VALUES(?)").run("creator-1");
db.prepare("INSERT INTO users(id) VALUES(?)").run("dev-revoked");
db.prepare("INSERT INTO staff_role_assignments(user_id,role,suspended,assigned_by,reason,created_at,updated_at) VALUES(?,?,?,?,?,?,?)").run("creator-1","CREATOR",0,"creator-1","test","2026-01-01","2026-01-01");
db.prepare("INSERT INTO staff_role_assignments(user_id,role,suspended,assigned_by,reason,created_at,updated_at) VALUES(?,?,?,?,?,?,?)").run("dev-revoked","DEV",0,"creator-1","test","2026-01-01","2026-01-01");
db.prepare("INSERT INTO admin_connections(user_id,connection_role,status,created_by,reason,created_at,updated_at) VALUES(?,?,?,?,?,?,?)").run("dev-revoked","DEV","REVOKED","creator-1","explicit revoke","2026-01-01","2026-01-01");
db.prepare("INSERT INTO meta(key,value) VALUES('primary_creator_user_id','creator-1')").run();
db.exec(migration);
db.exec(migration);
assert.deepEqual(db.prepare("SELECT connection_role,status FROM admin_connections WHERE user_id='creator-1'").get(),{connection_role:"CREATOR",status:"ACTIVE"});
assert.equal(db.prepare("SELECT status FROM admin_connections WHERE user_id='dev-revoked'").get().status,"REVOKED");
for(const table of ["animation_projects","animation_revisions","animation_bindings","animation_presets","animation_audit"]){
  assert.ok(db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?").get(table),table);
}
db.close();

console.log(JSON.stringify({ok:true,release:"0.991-I1-HF2",schema:44,creatorAuthorityRepair:true,animationEditor:true,migrationIdempotent:true,revokedConnectionPreserved:true},null,2));
