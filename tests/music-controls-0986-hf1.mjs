import fs from "node:fs";
import assert from "node:assert/strict";
const shell=fs.readFileSync(new URL("../public/js/shell-0986.js",import.meta.url),"utf8");
const css=fs.readFileSync(new URL("../public/css/gameindex-0986.css",import.meta.url),"utf8");
const svc=fs.readFileSync(new URL("../src/music/youtube-music-service.mjs",import.meta.url),"utf8");
const route=fs.readFileSync(new URL("../src/api/beta0986-routes.mjs",import.meta.url),"utf8");
assert.match(css,/\.gi-music-popover,\.gi-music-popover \*\{pointer-events:auto!important\}/);
assert.match(shell,/raw===null\|\|raw===''/);
assert.match(shell,/Nenhuma música configurada/);
assert.match(shell,/setTimeout\(\(\)=>syncPlayer\(\{play\}\),250\)/);
assert.match(shell,/restartLoop\(\)/);
assert.match(svc,/Number\.isFinite\(n\)\?n:30/);
assert.match(route,/(?:BETA_0_987(?:5_FULL_PAGE_PERSONALIZATION|_FINAL_PERSONALIZATION)|BETA_0_99_FINAL_FOUNDATION|BETA_0_99_I1_FOUNDATION_CORRECTION_VISUAL_GROUNDING)/);
for(const name of ["index.html","game.html","games.html"]){const html=fs.readFileSync(new URL(`../public/${name}`,import.meta.url),"utf8");assert.match(html,/shell-0986\.js\?v=(?:0987finalpersonalization|09875fullpagepersonalization|099finalfoundation|099i1visualgrounding)/);assert.match(html,/gameindex-0986\.css\?v=(?:0987finalpersonalization|09875fullpagepersonalization|099finalfoundation|099i1visualgrounding)/);}
assert.doesNotMatch(css,/gi-music-dock/);
console.log("0.986 HF1 music controls regression preserved in 0.9875: PASS");
