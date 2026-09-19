import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
const root=new URL('..',import.meta.url).pathname;
const read=rel=>readFileSync(path.join(root,rel),'utf8');
const server=read('server.mjs'),shell=read('public/js/shell.js'),entity=read('public/js/pages.js'),home=read('public/js/app.js'),games=read('public/js/games.js'),generated=read('public/js/generated-page.js'),library=read('public/js/image-library.js'),runtime=read('src/runtime/deployment-runtime.mjs');
for(const pattern of [/startSharpenerWorker/,/startGameBuildWorker/,/image-service/,/media-runtime2/,/procedural-visuals/,/orchestrateRequest/])assert.doesNotMatch(server,pattern);
assert.match(server,/publicDexterConsult/);assert.match(server,/startImageEngine3RepairWorker/);assert.match(server,/\/api\/games\/:slug\/visual\/resolve/);
assert.doesNotMatch(shell,/shellMarkup095|\/api\/beta097\/image-render-events|\/api\/assets\/generated/);assert.equal((shell.match(/function shellMarkup\(/g)||[]).length,1);assert.match(shell,/gameIndexSoundToggle/);
assert.match(entity,/displayTrusted/);assert.match(entity,/visual\/resolve/);assert.match(home,/visual\/resolve/);assert.match(games,/visual\/resolve/);assert.doesNotMatch(generated,/\/api\/images\//);assert.match(generated,/\/api\/entities\//);assert.match(library,/Array\.isArray\(data\.assets\)/);
assert.match(runtime,/PRODUCT_VERSION="0\.985\.2"/);assert.match(runtime,/Schema 26/);assert.match(runtime,/aiSharpener:false/);assert.doesNotMatch(runtime,/generatedVisualMetrics|PROCEDURAL_VISUALS/);
const htmls=readdirSync(path.join(root,'public')).filter(f=>f.endsWith('.html'));for(const file of htmls){const h=read(`public/${file}`);assert.match(h,/\/css\/rebirth-0985\.css/,`${file}: HF2 CSS missing`);assert.match(h,/\/js\/audio-hf2\.js/,`${file}: HF2 audio runtime missing`);}
console.log(`HF2 core simplification contract OK — ${htmls.length} public pages, single shell, native IE3 public surfaces, legacy UI calls removed.`);
