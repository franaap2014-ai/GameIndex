import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=p=>readFileSync(path.join(root,p),"utf8");

const release=read("src/config/release-099i6.mjs");
const connection=read("src/database/connection.mjs");
const migration=read("src/database/migrations/045_beta_09915_cinematic_update.sql");
const capabilities=read("src/access/capability-service.mjs");
const routes=read("src/api/beta09915-routes.mjs");
const server=read("server.mjs");
const game=read("public/js/game.js");
const social=read("public/js/social.js");
const editor=read("public/js/animation-editor.js");
const testLab=read("public/js/cinematic-test-lab.js");
const updateLog=read("public/js/update-log.js");
const pkg=JSON.parse(read("package.json"));

assert.match(release,/PUBLIC_VERSION="0\.992"/);
assert.match(release,/INTERNAL_RELEASE="0\.992 Delivery"/);
assert.match(release,/BETA_0_992_DELIVERY/);
assert.match(release,/TARGET_SCHEMA=47/);
assert.match(connection,/045_beta_09915_cinematic_update\.sql/);
assert.match(connection,/GAMEINDEX_TARGET_SCHEMA\|\|47/);
assert.match(connection,/Render production requires DATABASE_URL/);

assert.match(capabilities,/"cinematic_test"/);
assert.match(capabilities,/"profile_avatar_management"/);
assert.match(capabilities,/CREATOR:new Set\(CAPABILITIES\)/);
assert.doesNotMatch(capabilities,/DEV:new Set\([^\n]*animation_publish/);
assert.doesNotMatch(capabilities,/DEV:new Set\([^\n]*database_explorer/);

for(const table of ["profile_avatar_catalog","user_profile_avatar_selections","user_favorite_games","social_community_profiles","game_cutscene_bindings","cinematic_test_runs"]){
  assert.match(migration,new RegExp("CREATE TABLE IF NOT EXISTS "+table));
}
assert.match(migration,/GameIndex Beta 0\.9915/);
assert.match(routes,/\/api\/profile\/favorites/);
assert.match(routes,/\/api\/profile\/avatars\/library/);
assert.match(routes,/\/api\/cinematic-test\/preview/);
assert.match(routes,/\/api\/games\/:game\/entry-cutscene/);
assert.match(server,/registerBeta09915Routes/);
assert.match(server,/cinematic-test-lab\.html/);
assert.match(server,/DELIVERY BUILD ONLINE/);
assert.match(game,/playGameEntryCutscene/);
assert.match(game,/toggleFavorite/);
assert.match(social,/data-message-friend/);
assert.match(social,/createCommunity/);
assert.match(editor,/fullscreenPreview/);
assert.match(editor,/showWelcome/);
assert.match(testLab,/runSequence/);
assert.match(routes,/mutatesHistory:false/);
assert.match(updateLog,/PUBLIC_ORDER/);
assert.equal(pkg.version,"0.992.0");
assert.equal(pkg.scripts.test,"node tests/beta0992-delivery.mjs");
assert.equal(pkg.scripts["test:09915"],"node tests/beta09915-cinematic-update.mjs");

const db=new DatabaseSync(":memory:");
db.exec(`
  PRAGMA foreign_keys=ON;
  CREATE TABLE users(id TEXT PRIMARY KEY);
  CREATE TABLE games(id TEXT PRIMARY KEY,status TEXT NOT NULL DEFAULT 'PUBLISHED');
  CREATE TABLE social_communities(id TEXT PRIMARY KEY);
  CREATE TABLE animation_projects(id TEXT PRIMARY KEY);
  CREATE TABLE update_log_entries(
    version TEXT PRIMARY KEY,title TEXT NOT NULL,codename TEXT NOT NULL DEFAULT '',
    release_date TEXT NOT NULL DEFAULT '',sections_json TEXT NOT NULL DEFAULT '{}',
    tags_json TEXT NOT NULL DEFAULT '[]',public INTEGER NOT NULL DEFAULT 1,created_at TEXT NOT NULL
  ) STRICT;
  CREATE TABLE meta(key TEXT PRIMARY KEY,value TEXT NOT NULL);
`);
db.prepare("INSERT INTO users(id) VALUES(?)").run("u1");
db.prepare("INSERT INTO games(id,status) VALUES(?,?)").run("g1","PUBLISHED");
db.prepare("INSERT INTO social_communities(id) VALUES(?)").run("c1");
db.prepare("INSERT INTO animation_projects(id) VALUES(?)").run("a1");
db.exec(migration);
db.exec(migration);

assert.equal(Number(db.prepare("SELECT COUNT(*) count FROM profile_avatar_catalog").get().count),50);
for(const cls of ["FREE","PRO","TESTER","DEV","CREATOR"]){
  assert.equal(Number(db.prepare("SELECT COUNT(*) count FROM profile_avatar_catalog WHERE class=?").get(cls).count),10,cls);
}
assert.equal(db.prepare("SELECT codename FROM update_log_entries WHERE version='0.9915'").get().codename,"Cinematic Update");
assert.equal(db.prepare("SELECT value FROM meta WHERE key='runtime_version'").get().value,"0.9915");
for(const table of ["user_favorite_games","game_cutscene_bindings","cinematic_test_runs"]){
  assert.ok(db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?").get(table),table);
}
db.close();

console.log(JSON.stringify({ok:true,release:"0.992",legacyMigration:"0.9915",schema:47,avatars:50,favorites:true,cinematicTestLab:true,gameEntryCutscenes:true,migrationIdempotent:true},null,2));
