import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=p=>readFileSync(path.join(root,p),"utf8");

const connection=read("src/database/connection.mjs");
const migration=read("src/database/migrations/042_beta_0991_i1.sql");
const service=read("src/identity/cinematic-service.mjs");
const cinematic=read("public/js/cinematic-0991-hf1.js");
const cinematicCss=read("public/css/cinematic-0991-hf1.css");
const shell=read("public/js/shell-0986.js");
const i1=read("public/js/gameindex-0991-i1.js");
const i1Css=read("public/css/gameindex-0991-i1.css");
const admin=read("public/admin.html");
const adminJs=read("public/js/admin.js");
const report=read("src/database/repositories/public-bug-report-repository.mjs");
const diagnostics=read("src/database/repositories/bug-diagnostic-repository.mjs");
const server=read("server.mjs");
const release=read("src/config/release-099i6.mjs");

assert.match(connection,/productionStorageSafety/);
assert.match(connection,/GAMEINDEX_PERSISTENT_STORAGE_REQUIRED/);
assert.match(connection,/042_beta_0991_i1\.sql/);
assert.match(connection,/GAMEINDEX_TARGET_SCHEMA\|\|43/);
assert.match(migration,/CREATE TABLE IF NOT EXISTS bug_diagnostics/);
assert.match(migration,/CREATE TABLE IF NOT EXISTS cinematic_admin_actions/);
assert.match(service,/welcome_0991_i1/);

const off=cinematic.indexOf('el.classList.add("is-off")');
const cleared=cinematic.indexOf('el.classList.add("is-cleared")');
const opening=cinematic.indexOf('el.classList.add("is-opening")');
assert.ok(off>=0&&cleared>off&&opening>cleared,"Welcome must power off and clear before iris opening.");
assert.match(cinematic,/preview\(event\)/);
assert.match(cinematic,/debugState/);
assert.match(cinematicCss,/gi-tech-rail/);
assert.match(cinematicCss,/is-cleared/);
assert.doesNotMatch(cinematicCss,/gi-cinematic-detail\.d0/);

assert.match(shell,/--gi-old-cable/);
assert.match(shell,/--gi-new-cable/);
assert.match(shell,/cableColor\(sourceTheme\)/);
assert.match(shell,/cableColor\(targetTheme\)/);
assert.match(shell,/gameindex-0991-i1\.js/);

assert.match(i1,/Game Index — Home/);
assert.match(i1,/giContextCompass/);
assert.match(i1,/GameIndexDiagnostics/);
assert.match(i1Css,/gi-i1-logo-mark/);
assert.match(i1Css,/gi-i1-context-compass/);

assert.match(admin,/data-admin-section="cinematics"/);
assert.match(admin,/adminStorageHealth/);
assert.match(adminJs,/loadCinematics/);
assert.match(adminJs,/previewThemeCinematic/);
assert.match(adminJs,/Reset eligibility|resetCinematic/i);

assert.match(report,/recordBugDiagnostics/);
assert.match(diagnostics,/developerReportForBug/);
assert.match(diagnostics,/\[REDACTED\]/);
assert.match(server,/registerBeta0991I1Routes/);
assert.match(release,/TARGET_SCHEMA=43/);
assert.match(release,/0\.991-I1/);

console.log("Beta 0.991 I1 static release contract: PASS");
