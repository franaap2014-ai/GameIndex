import fs from "node:fs";import path from "node:path";import assert from "node:assert/strict";
const root=process.cwd(),read=p=>fs.readFileSync(path.join(root,p),"utf8");
const server=read("server.mjs"),routes=read("src/api/hotfix-performance-music-routes.mjs"),runtime=read("public/js/hotfix-0985-perf-runtime.js"),shell=read("public/js/shell.js"),game=read("public/js/game.js"),music=read("src/music/youtube-music-service.mjs"),pkg=JSON.parse(read("package.json"));
assert.match(routes,/const page=clamp\(req\.query\.page/);assert.doesNotMatch(routes,/const hasPaging=/);assert.match(routes,/\/api\/game-options/);assert.match(routes,/\/api\/staff\/game-options/);assert.match(routes,/hasCapability\(access,cap\)/);assert.match(routes,/limit=clamp\(req\.query\.limit,1,50,24\)/);
assert.doesNotMatch(runtime,/window\.fetch=function/);assert.match(runtime,/tuneImage/);
assert.match(shell,/gi_audio_enabled/);assert.match(shell,/sessionStorage\.getItem\(enabledKey\)/);assert.match(shell,/youtube-nocookie\.com/);assert.match(shell,/ONE|single-instance|single/i);assert.match(shell,/onPlayerMessage/);assert.match(shell,/loadGameOptions/);
assert.match(game,/cleanPublicText/);assert.match(game,/basicGameDescription/);assert.match(game,/Mais detalhes/);assert.match(game,/overview-description/);
assert.match(music,/CACHE_MAX_ENTRIES = 256/);assert.equal(pkg.version,"0.985.6");
for(const f of ["public/ai-control.html","public/ai-flow.html","public/js/ai-control.js","public/js/ai-flow.js"])assert.ok(fs.existsSync(path.join(root,f)),`${f} missing`);
assert.match(server,/ai-control\.html/);assert.match(server,/ai-flow\.html/);assert.doesNotMatch(server,/AI Control legado removido/);assert.doesNotMatch(server,/AI Flow legado removido/);
assert.doesNotMatch(read("public/js/ai-control.js"),/setInterval/);assert.doesNotMatch(read("public/js/ai-flow.js"),/setInterval/);assert.match(read("public/ai-flow.html"),/raciocínio privado não são exibidos/);


const appJs=read("public/js/app.js"),gamesJs=read("public/js/games.js"),gamesHtml=read("public/games.html"),discovery=read("src/recommendations/recommendation-service.mjs"),beta07=read("src/api/beta07-routes.mjs"),beta0985=read("src/api/beta0985-routes.mjs");
assert.doesNotMatch(appJs,/visual\/resolve/);assert.match(gamesJs,/limit:24/);assert.match(gamesJs,/AbortController/);assert.match(gamesJs,/250/);assert.doesNotMatch(gamesJs,/limit=200/);assert.doesNotMatch(gamesJs,/hydrateMissingCovers/);assert.match(gamesHtml,/catalogPrev/);assert.match(gamesHtml,/catalogNext/);
assert.match(discovery,/discoveryGamesPage/);assert.match(discovery,/discoveryFacets/);assert.match(beta07,/req\.query\.page/);assert.match(beta07,/\/api\/discovery\/facets/);
assert.match(beta0985,/semanticVersion:"0\.985\.6"/);assert.match(beta0985,/legacyAudioRuntime:false/);assert.doesNotMatch(beta0985,/audioBinary|audioSummary|gameAudioProfile|importAudioAsset|setGameAudioProfile/);
for(const legacy of ["public/audio","public/music"]){assert.ok(!fs.existsSync(path.join(root,legacy)),`${legacy} must stay absent`);}
console.log("HF6 final stabilization contract: PASS");
