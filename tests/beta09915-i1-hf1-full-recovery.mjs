import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

function read(path){return readFileSync(new URL(`../${path}`,import.meta.url),"utf8");}
function includes(path,text){assert.ok(read(path).includes(text),`${path} missing: ${text}`);}

const release=read("src/config/release-099i6.mjs");
assert.match(release,/PUBLIC_VERSION="0\.992"/);
assert.match(release,/INTERNAL_RELEASE="0\.992 DELIVERY"/);
assert.match(release,/INTERNAL_RELEASE_CODE="BETA_0_992_I1_STABILITY_UX_DEXTER_INTELLIGENCE"/);
assert.match(release,/TARGET_SCHEMA=47/);

includes("src/database/repositories/favorite-game-repository.mjs","function favoriteTableReady()");
includes("src/database/repositories/favorite-game-repository.mjs","if(!favoriteTableReady())return 0");
includes("src/database/repositories/profile-avatar-repository.mjs","function avatarTablesReady()");

const server=read("server.mjs");
assert.ok(server.includes("listChildGameEntities(game.id"),"parent hubs must resolve child experiences");

const css=read("public/css/gameindex-09915.css");
assert.ok(css.includes("grid-template-columns:auto minmax(180px,1fr) auto!important"),"medium header must remain single-row");
assert.ok(!css.includes(".header-search{grid-column:1/3;grid-row:2}.header-nav"),"old forced two-row medium header regression remains");
assert.ok(css.includes("--gi9915-control-bg"),"semantic readable control tokens missing");

const lab=read("public/cinematic-test-lab.html");
for(const marker of ["1 · CINEMATIC","2 · CONTEXTO","3 · PREVIEW","Teste avançado em sequência"]) assert.ok(lab.includes(marker),`Cinematic Test Lab missing ${marker}`);

const migration=read("src/database/migrations/046_beta_09915_i1_hf1_full_recovery.sql");
for(const slug of ["blox-fruits","doors","fisch","work-at-a-pizza-place","prison-life"]) assert.ok(migration.includes(slug),`missing Roblox experience ${slug}`);
assert.ok(migration.includes("INSERT OR IGNORE INTO games"),"recovery migration must remain additive");

const connection=read("src/database/connection.mjs");
assert.ok(connection.includes('version:46,file:"046_beta_09915_i1_hf1_full_recovery.sql"'));
assert.ok(connection.includes('version===45?"0.9915"'));

const shell=read("public/js/shell-0986.js");
for(const group of ["OVERVIEW","CONTENT & GAMES","CINEMATICS","SYSTEM & DIAGNOSTICS"]) assert.ok(shell.includes(group),`Admin group missing: ${group}`);
assert.ok(shell.includes("/css/gameindex-09915.css?v=09915hf3"));

console.log("Beta 0.9915 I2 recovery source regression checks passed.");
