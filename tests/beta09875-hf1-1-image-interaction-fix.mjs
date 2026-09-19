import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath,pathToFileURL} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=rel=>readFileSync(path.join(root,rel),'utf8');

// Preserve the complete HF1 regression suite first.
const regression=spawnSync(process.execPath,['tests/beta09875-hf1-image-manager-ui.mjs'],{cwd:root,encoding:'utf8',env:{...process.env}});
assert.equal(regression.status,0,`HF1 regression failed\n${regression.stdout}\n${regression.stderr}`);

await import(pathToFileURL(path.join(root,'public/js/image-crop-editor.js')).href+`?hf11=${Date.now()}`);
const math=globalThis.GICropMath;assert.ok(math);
assert.equal(math.scaleFromCorner({startScale:1,baseWidth:100,baseHeight:100,anchorX:0,anchorY:0,pointerX:150,pointerY:150,corner:'se'}),1.5);
assert.equal(math.scaleFromCorner({startScale:1,baseWidth:100,baseHeight:100,anchorX:100,anchorY:100,pointerX:-50,pointerY:-50,corner:'nw'}),1.5);
assert.equal(math.scaleFromCorner({startScale:1,baseWidth:100,baseHeight:100,anchorX:0,anchorY:0,pointerX:50,pointerY:50,corner:'se'}),0.5);
assert.deepEqual(math.cornerSigns('ne'),{x:1,y:-1});

const crop=read('public/js/image-crop-editor.js');
for(const corner of ['nw','ne','sw','se'])assert.match(crop,new RegExp(`data-corner=\\"${corner}\\"`));
assert.match(crop,/setPointerCapture\(e\.pointerId\)/);
assert.match(crop,/releasePointerCapture\(e\.pointerId\)/);
assert.match(crop,/pointercancel/);
assert.match(crop,/interaction=\{kind:'resize'/);
assert.match(crop,/interaction=\{kind:'move'/);
assert.match(crop,/e\.stopPropagation\(\)/);
assert.match(crop,/scaleFromCorner/);
assert.match(crop,/requestAnimationFrame/);
assert.match(crop,/scale\(\$\{this\.scale\}\)/);
assert.match(crop,/this\.minScale\(\)/);

const html=read('public/image-library.html');
assert.match(html,/BETA 0\.9875 HF1\.1|Beta 0\.99/i);
assert.match(html,/data-source-mode="upload"/);
assert.match(html,/data-source-mode="url"/);
assert.match(html,/URL da imagem/);
assert.match(html,/Carregar preview/);
assert.match(html,/09875hf11imageinteractionfix|099finalfoundation|099i1visualgrounding|099i3gamesourced|099i4pipeline|099i5production/);
assert.doesNotMatch(html,/type="range"/);

const imageJs=read('public/js/image-library.js');
assert.match(imageJs,/safeHttpUrl/);
assert.match(imageJs,/\/api\/image-manager\/preview-url/);
assert.match(imageJs,/setEditorSourceTab\('url'\)/);
assert.match(imageJs,/Carregando preview da URL/);
assert.match(imageJs,/imageDataUrl/);
assert.match(imageJs,/targetRoute\(t,slot\)/);

const css=read('public/css/image-manager-hf1.css');
assert.match(css,/\.image-manager-page button:disabled/);
assert.match(css,/color:#c3ccd5!important/);
assert.match(css,/\.gi-crop-handle\{[^}]*pointer-events:auto!important/s);
assert.match(css,/\.gi-crop-handle\{[^}]*touch-action:none!important/s);
assert.match(css,/\.gi-crop-handle-nw,.gi-crop-handle-se\{cursor:nwse-resize!important\}/);
assert.match(css,/\.gi-crop-handle-ne,.gi-crop-handle-sw\{cursor:nesw-resize!important\}/);

const expCss=read('public/css/experience-engine.css');
assert.match(expCss,/--gi-og-text:var\(--gie-og-text,#20262d\)/);
assert.match(expCss,/--gi-og-disabled-text:#5d6771/);
assert.match(expCss,/button:disabled\{background:var\(--gi-og-disabled-bg\)!important;color:var\(--gi-og-disabled-text\)!important/);

const routes=read('src/api/beta0986-routes.mjs');
assert.match(routes,/previewImageFromUrl/);
assert.match(routes,/app\.post\("\/api\/image-manager\/preview-url"/);
assert.match(routes,/requireSameOriginMutation,requireCapability\("image_management"\)/);
assert.match(routes,/BETA_0_9875_HF1_1_IMAGE_INTERACTION_FIX|BETA_0_99_FINAL_FOUNDATION|BETA_0_99_I1_FOUNDATION_CORRECTION_VISUAL_GROUNDING|BETA_0_99_I2_INTELLIGENT_PROCEDURAL_EXPERIENCE_ENGINE|BETA_0_99_I3_GAME_SOURCED_VISUAL_COMPOSITION|BETA_0_99_I4_THREE_STAGE_UNIVERSE_PRODUCTION_PIPELINE|BETA_0_99_I5_PRODUCTION_CONSOLIDATION|BETA_0_99_I6_UNIVERSE_BUILDER_EXPERIENCE|INTERNAL_RELEASE_CODE/);

const service=read('src/images/game-media-service.mjs');
assert.match(service,/export async function previewImageFromUrl/);
assert.match(service,/fetchPublicBinary\(safeUrl/);
assert.match(service,/validateBinary\(remote\.bytes,remote\.contentType\)/);
assert.match(service,/data:\$\{safe\.mime\};base64/);

const server=read('server.mjs');
assert.match(server,/version:"(?:0\.9875-HF1\.1|0\.99|0\.99-I1|0\.99-I2|0\.99-I3|0\.99-I4|0\.99-I5|0\.99-I6(?:-HF[12])?)"/);
assert.match(server,/release:"(?:BETA_0_9875_HF1_1_IMAGE_INTERACTION_FIX|BETA_0_99_FINAL_FOUNDATION|BETA_0_99_I1_FOUNDATION_CORRECTION_VISUAL_GROUNDING|BETA_0_99_I2_INTELLIGENT_PROCEDURAL_EXPERIENCE_ENGINE|BETA_0_99_I3_GAME_SOURCED_VISUAL_COMPOSITION|BETA_0_99_I4_THREE_STAGE_UNIVERSE_PRODUCTION_PIPELINE|BETA_0_99_I5_PRODUCTION_CONSOLIDATION|BETA_0_99_I6_UNIVERSE_BUILDER_EXPERIENCE|BETA_0_99_I6_HF1_BUILD_RELIABILITY)"/);
assert.match(server,/LOCAL_FIRST_NO_API_KEY/);

const pkg=JSON.parse(read('package.json'));
assert.ok(['0.9875.2','0.99.0','0.99.1','0.99.2','0.99.3','0.99.4','0.99.5','0.99.6','0.99.6-1','0.99.6-2','0.991.0'].includes(pkg.version));
assert.ok(['node tests/beta09875-hf1-1-image-interaction-fix.mjs','node tests/beta099-final-foundation.mjs','node tests/beta099-i1-foundation-correction.mjs','node tests/beta099-i2-intelligent-procedural-experience-engine.mjs','node tests/beta099-i3-game-sourced-visual-composition.mjs','node tests/beta099-i4-three-stage-universe-production-pipeline.mjs','node tests/beta099-i5-production-consolidation.mjs','node tests/beta099-i6-universe-builder-experience.mjs','node tests/beta099-i6-hf1-build-reliability.mjs','node tests/beta099-i6-hf2-launch-rebrand.mjs','node tests/beta0991-full-experience.mjs'].includes(pkg.scripts.test));
assert.equal(pkg.dependencies.express,'^5.1.0');
assert.equal(pkg.dependencies.dotenv,'^17.2.2');

console.log(JSON.stringify({
  ok:true,
  release:'0.9875-HF1.1',
  fixes:['READABLE_IMAGE_MANAGER_CONTROLS','SERVER_URL_PREVIEW','FOUR_CORNER_LIVE_RESIZE'],
  resizeHandles:['nw','ne','sw','se'],
  pointerCapture:true,
  proportionalScale:true,
  urlPreview:'SAFE_SERVER_FETCH_TO_DATA_URL',
  schemaChanged:false,
  browserAutomation:false,
  azureLive:false
},null,2));
