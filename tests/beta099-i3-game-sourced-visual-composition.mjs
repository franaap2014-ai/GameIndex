import assert from 'node:assert/strict';
import {mkdtempSync, readFileSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=rel=>readFileSync(path.join(root,rel),'utf8');
function run(args,env={}){const r=spawnSync(process.execPath,args,{cwd:root,encoding:'utf8',env:{...process.env,...env,NODE_NO_WARNINGS:'1'}});if(r.status!==0)throw new Error(`command failed: node ${args.join(' ')}\nSTDOUT:\n${r.stdout}\nSTDERR:\n${r.stderr}`);return r.stdout;}
function lastJson(output){const lines=String(output).trim().split('\n').filter(Boolean);for(let i=lines.length-1;i>=0;i--){try{return JSON.parse(lines[i]);}catch{}}throw new Error(`No JSON result found in output:\n${output}`);}

// Current I3 suite checks preserved contracts directly because historical release tests intentionally hard-code older package/cache identifiers.
const pkg=JSON.parse(read('package.json'));
assert.ok(['0.99.3','0.99.4','0.99.5','0.99.6','0.99.6-1','0.99.6-2','0.991.0','0.991.1'].includes(pkg.version));
assert.ok(['gameindex-beta-099-i3-game-sourced-visual-composition','gameindex-beta-099-i4-three-stage-universe-production-pipeline','gameindex-beta-099-i5-production-consolidation','gameindex-beta-099-i6-universe-builder-experience','gameindex-beta-099-i6-hf1-build-reliability','gameindex-beta-099-i6-hf2-launch-visual-rebrand','gameindex-beta-0991-full-experience','gameindex-beta-0991-hf1-identity-restoration'].includes(pkg.name));
assert.ok(['node tests/beta099-i3-game-sourced-visual-composition.mjs','node tests/beta099-i4-three-stage-universe-production-pipeline.mjs','node tests/beta099-i5-production-consolidation.mjs','node tests/beta099-i6-universe-builder-experience.mjs','node tests/beta099-i6-hf1-build-reliability.mjs','node tests/beta099-i6-hf2-launch-rebrand.mjs','node tests/beta0991-full-experience.mjs','node tests/beta0991-hf1-identity-restoration.mjs'].includes(pkg.scripts.test));

const crop=read('public/js/image-crop-editor.js'),imageRoutes=read('src/api/beta0986-routes.mjs');
assert.match(crop,/setPointerCapture\(e\.pointerId\)/);
assert.match(crop,/pointercancel/);
assert.match(crop,/scaleFromCorner/);
assert.match(imageRoutes,/previewImageFromUrl/);
assert.match(imageRoutes,/requireSameOriginMutation,requireCapability\("image_management"\)/);

const migration=read('src/database/migrations/036_beta_099_i3.sql');
assert.match(migration,/CREATE TABLE IF NOT EXISTS visual_asset_registry/);
assert.match(migration,/APPROVED_OFFICIAL_ASSET/);
assert.match(migration,/SCREENSHOT_EXTRACT/);
assert.match(migration,/CREATE TABLE IF NOT EXISTS visual_grounding_validation/);
assert.match(migration,/0\.99-I3/);

const registry=read('src/images/visual-asset-registry.mjs');
assert.match(registry,/VISUAL_ASSET_ROLES/);
assert.match(registry,/DISCOVERED.*REVIEWED.*APPROVED.*REJECTED.*ARCHIVED/s);
assert.match(registry,/VISUAL_ASSET_EXECUTABLE_CONTENT_REJECTED/);
assert.match(registry,/syncExistingVisualAssets/);
assert.doesNotMatch(registry,/OPENAI_API_KEY|ANTHROPIC_API_KEY|GEMINI_API_KEY/);

const validation=read('src/universe/visual-grounding-validation-099i3.mjs');
for(const token of ['HERO_COVERAGE','SECTION_COVERAGE','ASSET_DIVERSITY','GAME_SPECIFICITY','REAL_ASSET_GROUNDING','INTERACTIVE_VISUAL_COVERAGE']){
  // Implementation names are camelCase but the conceptual dimensions must exist.
  const camel=token.toLowerCase().replace(/_([a-z])/g,(_,c)=>c.toUpperCase());
  assert.ok(validation.toLowerCase().includes(camel.toLowerCase())||validation.includes(token));
}
assert.match(validation,/APPROVED_GAME_SOURCED_ASSETS_0/);
assert.match(validation,/PRIMARY_GAME_ASSETS_0/);
assert.match(validation,/VISUAL_COVERAGE_BELOW_DENSITY_MINIMUM/);
assert.match(validation,/PUBLICATION_STATUS/);
assert.match(validation,/genericGeneratedIdentity:false/);

const visualI3=read('public/js/visual-grounding-099i3.js');
assert.match(visualI3,/APPROVED_GAME_ASSETS_ONLY/);
assert.match(visualI3,/approvalStatus==='APPROVED'/);
assert.match(visualI3,/createElement\('img'\)/);
assert.match(visualI3,/genericGeneratedIdentity:false/);
assert.doesNotMatch(visualI3,/const ICONS|JOLLY_ROGER.*<svg|FISCH_FISH.*<svg|innerHTML\s*=\s*ICONS/);

const gameHtml=read('public/game.html'),runtime=read('public/js/universe-runtime-099.js');
assert.match(gameHtml,/visual-grounding-099i3\.js/);
assert.doesNotMatch(gameHtml,/visual-grounding-099i1\.js/);
assert.doesNotMatch(gameHtml,/visual-grounding-099i2\.js/);
if(['0.99.5','0.99.6','0.99.6-1','0.99.6-2','0.991.0','0.991.1'].includes(pkg.version)){assert.match(gameHtml,/visual-grounding-099i5\.js/);assert.match(runtime,/GameIndexVisualGrounding099I5/);}else assert.match(runtime,/GameIndexVisualGrounding099I3/);
assert.match(runtime,/state\.visualAssets/);

const html=read('public/universe-builder.html'),builder=read('public/js/universe-builder.js'),routes=read('src/api/beta099-routes.mjs');
assert.match(html,/GAME-SOURCED VISUAL COMPOSITION|THREE-STAGE UNIVERSE PRODUCTION PIPELINE|GAME-SOURCED IMAGES|CONTEÚDO/i);
assert.match(html,/id="visualAssetList"/);
assert.match(html,/id="validationI3"/);
assert.match(builder,/renderVisualAssetsI3/);
assert.match(builder,/renderValidationI3/);
assert.match(builder,/No approved game-sourced visual asset|No game-sourced visual assets are registered|Nenhum asset real está registrado|Real game asset unresolved/);
assert.match(builder,/Planned.*Draft.*Validated.*Published/);
assert.match(routes,/visual-assets\/sync/);
assert.match(routes,/validation-099i3/);
assert.match(routes,/genericGeneratedIdentityAllowed:false/);
assert.match(routes,/BETA_0_99_I3_GAME_SOURCED_VISUAL_COMPOSITION|BETA_0_99_I4_THREE_STAGE_UNIVERSE_PRODUCTION_PIPELINE|BETA_0_99_I5_PRODUCTION_CONSOLIDATION|BETA_0_99_I6_UNIVERSE_BUILDER_EXPERIENCE|INTERNAL_RELEASE_CODE/);

const creative=read('src/universe/creative-director-099i3.mjs');
assert.match(creative,/LOCAL_AI_FAILED_THEN_FALLBACK/);
assert.match(creative,/LOCAL_AI_USED/);
assert.match(creative,/Semantic motifs are search metadata only/);
assert.match(creative,/Never generate.*fake game artwork/i);
assert.doesNotMatch(creative,/OPENAI_API_KEY|ANTHROPIC_API_KEY|GEMINI_API_KEY/);

const server=read('server.mjs');
assert.match(server,/version:"0\.99-I(?:3|4|5)"|INTERNAL_RELEASE/);
assert.match(server,/BETA_0_99_I3_GAME_SOURCED_VISUAL_COMPOSITION|BETA_0_99_I4_THREE_STAGE_UNIVERSE_PRODUCTION_PIPELINE|BETA_0_99_I5_PRODUCTION_CONSOLIDATION|BETA_0_99_I6_UNIVERSE_BUILDER_EXPERIENCE|INTERNAL_RELEASE_CODE/);

// Exact additive migration: create an I2/schema-35 database, preserve user data, then migrate to schema 36.
const temp=mkdtempSync(path.join(tmpdir(),'gameindex-099i3-')),dbFile=path.join(temp,'gamevault.sqlite');
try{
  const stage35=`
    const c=await import('./src/database/connection.mjs');c.migrateDatabase();
    const g=await import('./src/database/repositories/game-repository.mjs');
    const id=await import('./src/identity/experience-identity-service.mjs');
    const roblox=g.upsertGame({name:'Roblox',slug:'roblox-i3-test',status:'PUBLISHED'});
    const fisch=g.upsertGame({name:'Fisch',slug:'fisch-i3-test',status:'PUBLISHED',franchise:'Roblox'});
    g.setGameEntityClassification(fisch.id,{entityType:'EXPERIENCE',parentGameId:roblox.id,relationshipType:'EXPERIENCE_OF'});
    id.setIdentityProfile(fisch.id,{themeKey:'fisch-aquatic',motifs:['FISCH_FISH','FISHING_HOOK','WATER_WAVE'],status:'APPROVED'});
    c.db.prepare("INSERT INTO meta(key,value) VALUES('i3_preserve_probe','kept') ON CONFLICT(key) DO UPDATE SET value='kept'").run();
    console.log(JSON.stringify({schema:c.schemaVersion(),fisch:fisch.id,probe:c.db.prepare("SELECT value FROM meta WHERE key='i3_preserve_probe'").get()?.value}));
  `;
  const before=lastJson(run(['--input-type=module','-e',stage35],{GAMEINDEX_DB:dbFile,GAMEINDEX_DATA_DIR:temp,GAMEINDEX_TARGET_SCHEMA:'35'}));
  assert.equal(before.schema,35);assert.equal(before.probe,'kept');

  const stage36=`
    const c=await import('./src/database/connection.mjs');c.migrateDatabase();
    const g=await import('./src/database/repositories/game-repository.mjs');
    const id=await import('./src/identity/experience-identity-service.mjs');
    const media=await import('./src/images/game-media-service.mjs');
    const vr=await import('./src/images/visual-asset-registry.mjs');
    const vs=await import('./src/universe/visual-grounding-validation-099i3.mjs');
    const us=await import('./src/universe/universe-structure-service.mjs');
    const inter=await import('./src/interactions/universe-interaction-service.mjs');
    const cd=await import('./src/universe/creative-director-099i3.mjs');
    const fisch=g.getGameBySlug('fisch-i3-test');
    const identity=id.resolveIdentityProfile(fisch.id);
    const empty=vs.calculateVisualCoverage(fisch.id,{persist:true});
    const png='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAQAAABFaP0WAAAADUlEQVR42mNk+M/wHwAFAgIACR0F/QAAAABJRU5ErkJggg==';
    const cover=media.setGameMedia({gameId:fisch.id,slotKey:'COVER',imageDataUrl:png,altText:'Approved Fisch source test'});
    const synced=vr.syncExistingVisualAssets(fisch.id,{});
    const page=us.upsertUniversePage({entityGameId:fisch.id,canonicalKey:'OVERVIEW',title:'Overview',status:'PUBLISHED'});
    const sectionIds=[];
    for(let i=0;i<5;i++)sectionIds.push(us.upsertUniverseSection({entityGameId:fisch.id,pageId:page.id,canonicalKey:'SECTION_'+i,title:'Section '+i,status:'PUBLISHED'}).id);
    const roles=['CREATURE','ITEM','LOCATION','SECTION_ACCENT','INTERACTIVE_OBJECT'];
    for(let i=0;i<sectionIds.length;i++)vr.upsertVisualAsset({entityGameId:fisch.id,assetKey:'FISCH_REAL_'+i,sectionId:sectionIds[i],semanticMotif:i===0?'FISCH_FISH':'',semanticRole:roles[i],visualFamily:'FISCH_FAMILY_'+i,sourceType:'APPROVED_SCREENSHOT',sourceReference:'validated local test screenshot',imageUrl:cover.imageUrl,approvalStatus:'APPROVED',confidence:.95});
    let unsafe=false;try{vr.upsertVisualAsset({entityGameId:fisch.id,imageUrl:'javascript:alert(1)',semanticRole:'PRIMARY_SYMBOL',sourceType:'APPROVED_USER_ASSET'});}catch{unsafe=true;}
    const grounded=vs.calculateVisualCoverage(fisch.id,{persist:true});
    const rev=us.createUniverseRevision(fisch.id,{status:'DRAFT',canonicalLocale:'pt-BR'});
    const binding=inter.upsertUniverseInteraction({entityGameId:fisch.id,revisionId:rev.id,elementKey:'ASSET:FISCH_REAL_4',elementRole:'INTERACTIVE',eventType:'CLICK',actionType:'SHOW_INFO',targetType:'NONE',targetId:'',parameters:{message:'Verified interaction'},status:'DRAFT',source:'PRESET'});
    const lifeDraft=inter.interactionLifecycleStats(fisch.id);
    c.db.prepare("UPDATE universe_revisions SET status='VALIDATED' WHERE id=?").run(rev.id);
    const lifeValidated=inter.interactionLifecycleStats(fisch.id);
    const review=await cd.creativeDirectorReview(fisch,{allowLocalAI:false});
    console.log(JSON.stringify({schema:c.schemaVersion(),id:fisch.id,probe:c.db.prepare("SELECT value FROM meta WHERE key='i3_preserve_probe'").get()?.value,runtime:c.db.prepare("SELECT value FROM meta WHERE key='runtime_version'").get()?.value,identity:{renderStrategy:identity.visualGrounding?.renderStrategy,genericAllowed:identity.visualGrounding?.genericGeneratedIdentityAllowed,semanticMotifs:identity.visualGrounding?.semanticMotifs},empty:{score:empty.coverageScore,status:empty.status,blockers:empty.blockers.map(x=>x.code)},cover,synced:synced.counts,grounded:{score:grounded.coverageScore,class:grounded.coverageClass,status:grounded.status,metrics:grounded.metrics,blockers:grounded.blockers},unsafe,binding:{id:binding.id,status:binding.status},lifeDraft,lifeValidated,review:{mode:review.mode,localAIInvoked:review.localAIInvoked,apiKeyRequired:review.apiKeyRequired,suggestions:review.suggestions.length}}));
  `;
  const after=lastJson(run(['--input-type=module','-e',stage36],{GAMEINDEX_DB:dbFile,GAMEINDEX_DATA_DIR:temp,GAMEINDEX_TARGET_SCHEMA:'36'}));
  assert.equal(after.schema,36);
  assert.equal(after.id,before.fisch,'I2 entity ID must survive I3 migration');
  assert.equal(after.probe,'kept','I2 user data must survive I3 migration');
  assert.equal(after.runtime,'0.99-I3');
  assert.equal(after.identity.renderStrategy,'APPROVED_GAME_ASSETS_ONLY');
  assert.equal(after.identity.genericAllowed,false);
  assert.ok(after.identity.semanticMotifs.includes('FISCH_FISH'));
  assert.equal(after.empty.score,0);
  assert.equal(after.empty.status,'FAILED');
  assert.ok(after.empty.blockers.includes('APPROVED_GAME_SOURCED_ASSETS_0'));
  assert.ok(after.synced.approved>=1,'local existing game media should sync as approved real media');
  assert.ok(after.grounded.score>=65,'approved diverse real assets should satisfy at least acceptable RICH visual coverage');
  assert.notEqual(after.grounded.class,'FAILED');
  assert.equal(after.grounded.metrics.genericFallbackRatio,0);
  assert.equal(after.unsafe,true,'unsafe executable-like visual URL must be rejected');
  assert.ok(after.lifeDraft.planned>=1&&after.lifeDraft.draft>=1);
  assert.ok(after.lifeValidated.validated>=1);
  assert.equal(after.review.mode,'DETERMINISTIC_FALLBACK');
  assert.equal(after.review.localAIInvoked,false);
  assert.equal(after.review.apiKeyRequired,false);
}finally{rmSync(temp,{recursive:true,force:true});}

console.log(JSON.stringify({ok:true,release:'0.99-I3',schema:36,visualGroundingEngine:'GAME_SOURCED_VISUAL_COMPOSITION_ENGINE_2_1',genericGeneratedIdentity:false,visualCoverage:true,validation2:true,interactionStateUnified:true,localFirstNoApiKey:true,fullBrowserAutomation:false,azureLive:false},null,2));
