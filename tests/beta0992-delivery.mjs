import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=p=>readFileSync(path.join(root,p),"utf8");

const release=read("src/config/release-099i6.mjs");
const pkg=JSON.parse(read("package.json"));
const access=read("src/access/capability-service.mjs");
const shell=read("public/js/shell-0986.js");
const delivery=read("public/js/delivery-0992.js");
const deliveryCss=read("public/css/gameindex-0992.css");
const adminHtml=read("public/admin.html");
const adminJs=read("public/js/admin.js");
const templates=read("src/games/templates.mjs");
const builder=read("src/universe/universe-builder-099.mjs");
const routes=read("src/api/beta0991-i1-routes.mjs");
const server=read("server.mjs");
const originalTrack=read("src/music/original-home-track.mjs");

assert.match(release,/PUBLIC_VERSION="0\.992"/);
assert.match(release,/INTERNAL_RELEASE="0\.992 Delivery"/);
assert.match(release,/BETA_0_992_DELIVERY/);
assert.match(release,/TARGET_SCHEMA=47/);
assert.equal(pkg.version,"0.992.0");
assert.equal(pkg.scripts.test,"node tests/beta0992-delivery.mjs");

assert.match(access,/DEV:new Set\(\[[^\n]*"animation_edit"/);
assert.doesNotMatch(access,/DEV:new Set\([^\n]*"animation_publish"/);
assert.match(access,/export function requireAnyCapability/);
assert.match(server,/requireAnyCapability\(\["creator_control","universe_build","image_management","music_management","animation_edit","cinematic_test"\]\)/);

assert.match(shell,/BETA 0\.992/);
assert.match(shell,/--gi-old-cable",oldAccent/);
assert.match(shell,/--gi-new-cable",newAccent/);
assert.ok(shell.indexOf('classList.add("gi-hf1-energized")')<shell.indexOf('ensureApply();overlay.classList.add("gi-hf1-booting")'));
assert.match(shell,/pausedKey='gi_audio_paused'/);
assert.match(shell,/sessionStorage\.getItem\(enabledKey\)!=='0'/);
assert.match(shell,/resumeAfterGesture/);
assert.match(deliveryCss,/\.gi-music-player-surface\{position:absolute!important;width:1px!important/);

for(const route of ["settings.html","admin.html","update-log.html","profile.html","social.html","universe-builder.html","music-manager","image-library.html"])assert.ok(delivery.includes(route),route);
assert.match(delivery,/prefers-reduced-motion/);
assert.match(delivery,/\.drawer-nav a\[href\]/);

assert.match(adminHtml,/data-tool-cap="universe_build"/);
assert.match(adminHtml,/data-tool-cap="animation_edit"/);
assert.match(adminHtml,/data-tool-cap="cinematic_test"/);
assert.match(adminHtml,/data-tool-cap="image_management"/);
assert.match(adminHtml,/data-tool-cap="music_management"/);
assert.match(adminJs,/adminMode='DEV'/);
assert.match(adminJs,/toolCaps=\['universe_build','image_management','music_management','animation_edit','cinematic_test'\]/);
assert.match(routes,/app\.get\("\/api\/admin\/i1\/cinematics",requireCapability\("cinematic_test"\)/);

assert.match(templates,/fps: \["overview","gameplay","weapons","maps","skins","ranks","guides"\]/);
assert.match(builder,/function menuTabsForResearch\(game\)/);
assert.match(builder,/Array\.isArray\(game\?\.menu\)/);
assert.match(builder,/return selected\.map\(\(tab,index\)=>/);
assert.match(builder,/function topicPlan\(topic,game=null\)/);
assert.match(originalTrack,/Enter the Index/);
assert.match(originalTrack,/enter-the-index\.mp3/);

const temp=mkdtempSync(path.join(tmpdir(),"gi-0992-"));
Object.assign(process.env,{GAMEINDEX_DB:path.join(temp,"test.sqlite"),GAMEINDEX_DATA_DIR:temp,DATABASE_URL:"",GAMEINDEX_DATABASE_URL:"",GAMEINDEX_TARGET_SCHEMA:"47",NODE_ENV:"test"});
for(const k of ["RENDER","RENDER_SERVICE_ID","RENDER_EXTERNAL_HOSTNAME","WEBSITE_SITE_NAME","WEBSITE_INSTANCE_ID","WEBSITE_HOSTNAME"])delete process.env[k];

try{
  const {initializeDatabase}=await import("../src/database/seed.mjs");
  initializeDatabase();
  const {findGameByNameOrAlias}=await import("../src/database/repositories/game-repository.mjs");
  const cs2=findGameByNameOrAlias("Counter-Strike 2");
  assert.ok(cs2,"Counter-Strike 2 seed is required for the 0.992 regression");
  const tabs=(cs2.menu||[]).map(x=>x.id);
  for(const id of ["overview","gameplay","weapons","maps","skins","ranks","guides"])assert.ok(tabs.includes(id),`CS2 missing tab ${id}: ${tabs.join(",")}`);
}finally{
  try{const {db}=await import("../src/database/connection.mjs");db.close();}catch{}
  rmSync(temp,{recursive:true,force:true});
}

console.log(JSON.stringify({ok:true,release:"0.992",schema:47,sidebarTransitions:true,devTools:true,autoplayRecovery:true,tabDrivenBuilder:true,cs2Skins:true},null,2));
