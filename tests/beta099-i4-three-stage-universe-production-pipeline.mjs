import assert from 'node:assert/strict';
import {mkdtempSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=rel=>readFileSync(path.join(root,rel),'utf8');
function run(args,env={}){const r=spawnSync(process.execPath,args,{cwd:root,encoding:'utf8',env:{...process.env,...env,NODE_NO_WARNINGS:'1'}});if(r.status!==0)throw new Error(`command failed: node ${args.join(' ')}\nSTDOUT:\n${r.stdout}\nSTDERR:\n${r.stderr}`);return r.stdout;}
function lastJson(output){for(const line of String(output).trim().split('\n').reverse()){try{return JSON.parse(line);}catch{}}throw new Error(`No JSON found:\n${output}`);}

const pkg=JSON.parse(read('package.json'));
assert.ok(['gameindex-beta-099-i4-three-stage-universe-production-pipeline','gameindex-beta-099-i5-production-consolidation','gameindex-beta-099-i6-universe-builder-experience','gameindex-beta-099-i6-hf1-build-reliability','gameindex-beta-099-i6-hf2-launch-visual-rebrand','gameindex-beta-0991-full-experience'].includes(pkg.name));
assert.ok(['0.99.4','0.99.5','0.99.6','0.99.6-1','0.99.6-2','0.991.0'].includes(pkg.version));
assert.ok(['node tests/beta099-i4-three-stage-universe-production-pipeline.mjs','node tests/beta099-i5-production-consolidation.mjs','node tests/beta099-i6-universe-builder-experience.mjs','node tests/beta099-i6-hf1-build-reliability.mjs','node tests/beta099-i6-hf2-launch-rebrand.mjs','node tests/beta0991-full-experience.mjs'].includes(pkg.scripts.test));

const migration=read('src/database/migrations/037_beta_099_i4.sql');
for(const table of ['universe_image_variables','universe_image_variable_bindings','universe_page_compositions','universe_preview_snapshots','universe_builder_stage_status'])assert.match(migration,new RegExp(`CREATE TABLE IF NOT EXISTS ${table}`));
assert.match(migration,/0\.99-I4/);assert.match(migration,/BETA_0_99_I4_THREE_STAGE_UNIVERSE_PRODUCTION_PIPELINE/);

const pipeline=read('src/universe/universe-production-pipeline-099i4.mjs');
for(const token of ['syncImageVariables','resolveImageVariables','assignImageVariable','syncPageCompositions','calculateVisualGapMetrics','generatePreviewSnapshot','productionPipelineState'])assert.match(pipeline,new RegExp(token));
assert.match(pipeline,/IMAGE:SECTION/);assert.match(pipeline,/IMAGE:HERO/);assert.match(pipeline,/visualAnchorRequired/);assert.match(pipeline,/manualOverride/);
assert.doesNotMatch(pipeline,/JOLLY_ROGER.*<svg|FISCH_FISH.*<svg|const ICONS/);

const validation=read('src/universe/validation-099i4.mjs');
for(const token of ['REQUIRED_IMAGE_VARIABLES_UNRESOLVED','VISUAL_COVERAGE_BELOW_I4_TARGET','VISUAL_GAP_TOO_HIGH','PREVIEW_REQUIRED','PREVIEW_STALE','IMAGES_STATUS','PREVIEW_STATUS'])assert.match(validation,new RegExp(token));
assert.match(validation,/density==="RICH"\?80/);

const html=read('public/universe-builder.html'),builder=read('public/js/universe-builder.js');
assert.match(html,/RESEARCH & CONTENT · AVANÇADO|CONTEÚDO/);assert.match(html,/GAME-SOURCED IMAGES · AVANÇADO|IMAGENS/);assert.match(html,/INTERACTIVE PREVIEW|PREVIEW/);assert.match(html,/id="foundationPublish"/);assert.match(html,/RELATÓRIO FINAL|FINAL REPORT/);assert.match(html,/id="advancedBuilder"/);assert.ok(html.indexOf('id="foundationPublish"')<html.indexOf('id="i4ReportStage"'),'Publish must be above final report');
for(const id of ['i4ResearchContent','i4ImageVariables','i4PreviewViewport','experiencePreview','i4FinalReport'])assert.match(html,new RegExp(`id="${id}"`));
for(const fn of ['renderResearchContentI4','renderImageVariablesI4','renderInteractivePreviewI4','renderFinalReportI4','regeneratePreviewI4','syncImageVariablesI4'])assert.match(builder,new RegExp(fn));
assert.match(builder,/Approve & assign/);assert.match(builder,/Real game asset unresolved/);assert.match(builder,/data-i4-composition-select/);

const gameHtml=read('public/game.html'),runtime=read('public/js/universe-runtime-099.js'),visualI4=read('public/js/visual-grounding-099i4.js'),routes=read('src/api/beta099-routes.mjs');
if(['0.99.5','0.99.6','0.99.6-1','0.99.6-2','0.991.0'].includes(pkg.version)){assert.match(gameHtml,/visual-grounding-099i5\.js/);assert.match(runtime,/GameIndexVisualGrounding099I5/);}else{assert.match(gameHtml,/visual-grounding-099i4\.js/);assert.match(runtime,/GameIndexVisualGrounding099I4/);}assert.doesNotMatch(gameHtml,/visual-grounding-099i1\.js|visual-grounding-099i2\.js/);assert.match(runtime,/data-section-id/);assert.match(visualI4,/RESOLVED_IMAGE_VARIABLES_AND_APPROVED_GAME_ASSETS_ONLY/);assert.match(visualI4,/primaryVariableId/);assert.match(visualI4,/approvalStatus==='APPROVED'/);assert.doesNotMatch(visualI4,/JOLLY_ROGER.*<svg|FISCH_FISH.*<svg|createElement\(['"]svg/);
assert.match(routes,/pipeline-099i4|pipeline-099i5/);assert.match(routes,/preview-099i4|preview-099i5/);assert.match(routes,/image-variables\/sync/);assert.match(routes,/productionPipelineState/);assert.match(routes,/publishPosition:"TOP"/);assert.match(routes,/reportPosition:"BOTTOM"/);

const server=read('server.mjs');assert.match(server,/BETA_0_99_I5_PRODUCTION_CONSOLIDATION|INTERNAL_RELEASE_CODE|GAMEINDEX BETA 0\.99 I5/);

// Exact additive migration from I3/schema 36, plus functional I4 pipeline exercise.
const temp=mkdtempSync(path.join(tmpdir(),'gameindex-099i4-')),dbFile=path.join(temp,'gamevault.sqlite');
try{
  const stage36=`
    const c=await import('./src/database/connection.mjs');c.migrateDatabase();
    const g=await import('./src/database/repositories/game-repository.mjs');
    const id=await import('./src/identity/experience-identity-service.mjs');
    const game=g.upsertGame({name:'I4 Pipeline Test',slug:'i4-pipeline-test',status:'PUBLISHED'});
    id.setIdentityProfile(game.id,{themeKey:'i4-test',visualDensity:'RICH',status:'APPROVED'});
    c.db.prepare("INSERT INTO meta(key,value) VALUES('i4_preserve_probe','kept') ON CONFLICT(key) DO UPDATE SET value='kept'").run();
    console.log(JSON.stringify({schema:c.schemaVersion(),id:game.id,probe:c.db.prepare("SELECT value FROM meta WHERE key='i4_preserve_probe'").get()?.value}));
  `;
  const before=lastJson(run(['--input-type=module','-e',stage36],{GAMEINDEX_DB:dbFile,GAMEINDEX_DATA_DIR:temp,GAMEINDEX_TARGET_SCHEMA:'36'}));
  assert.equal(before.schema,36);assert.equal(before.probe,'kept');

  const stage37=`
    const c=await import('./src/database/connection.mjs');c.migrateDatabase();
    const g=await import('./src/database/repositories/game-repository.mjs');
    const us=await import('./src/universe/universe-structure-service.mjs');
    const vr=await import('./src/images/visual-asset-registry.mjs');
    const pipe=await import('./src/universe/universe-production-pipeline-099i4.mjs');
    const val=await import('./src/universe/validation-099i4.mjs');
    const game=g.getGameBySlug('i4-pipeline-test');
    const rev=us.createUniverseRevision(game.id,{status:'DRAFT',canonicalLocale:'pt-BR'});
    const page=us.upsertUniversePage({entityGameId:game.id,revisionId:rev.id,canonicalKey:'OVERVIEW',title:'Overview',status:'DRAFT'});
    const sections=[];
    for(const [i,key] of ['GAMEPLAY','CHARACTERS','LOCATIONS','ITEMS'].entries())sections.push(us.upsertUniverseSection({entityGameId:game.id,revisionId:rev.id,pageId:page.id,canonicalKey:key,title:key,status:'DRAFT',content:{canonical:'Verified test content '+key}}));
    vr.upsertVisualAsset({entityGameId:game.id,assetKey:'I4_HERO',semanticRole:'HERO',visualFamily:'I4_HERO',sourceType:'APPROVED_SCREENSHOT',sourceReference:'test source',imageUrl:'https://example.com/i4-hero.png',approvalStatus:'APPROVED',confidence:.99});
    const roles=['ENVIRONMENT_ELEMENT','CHARACTER','LOCATION','ITEM'];
    for(let i=0;i<sections.length;i++)vr.upsertVisualAsset({entityGameId:game.id,assetKey:'I4_SECTION_'+i,sectionId:sections[i].id,semanticRole:roles[i],visualFamily:'I4_FAMILY_'+i,sourceType:'APPROVED_SCREENSHOT',sourceReference:'test source '+i,imageUrl:'https://example.com/i4-'+i+'.png',approvalStatus:'APPROVED',confidence:.99});
    const vars=pipe.syncImageVariables(game.id,{revisionId:rev.id,structureStatus:'DRAFT'});
    const resolution=pipe.resolveImageVariables(game.id,{revisionId:rev.id});
    const comps=pipe.syncPageCompositions(game.id,{revisionId:rev.id,structureStatus:'DRAFT'});
    const gap=pipe.calculateVisualGapMetrics(game.id,{revisionId:rev.id});
    const preview1=pipe.generatePreviewSnapshot(game.id,{revisionId:rev.id,viewportMode:'DESKTOP',structureStatus:'DRAFT'});
    pipe.updatePageComposition(comps[0].id,{layoutVariant:'CENTERED_FEATURE'});
    const stale=pipe.latestPreviewSnapshot(game.id,{revisionId:rev.id});
    const preview2=pipe.generatePreviewSnapshot(game.id,{revisionId:rev.id,viewportMode:'MOBILE',structureStatus:'DRAFT'});
    const validation=val.evaluateBuilderValidationI4(game.id,{revisionId:rev.id,structureStatus:'DRAFT',persist:true});
    const state=pipe.productionPipelineState(game.id,{revisionId:rev.id,structureStatus:'DRAFT'});
    console.log(JSON.stringify({schema:c.schemaVersion(),probe:c.db.prepare("SELECT value FROM meta WHERE key='i4_preserve_probe'").get()?.value,runtime:c.db.prepare("SELECT value FROM meta WHERE key='runtime_version'").get()?.value,vars:{total:vars.length,resolved:resolution.variables.filter(v=>v.status==='RESOLVED').length,requiredMissing:resolution.unresolvedRequired.length},comps:comps.length,gap,preview1:{status:preview1.status,mode:preview1.viewportMode},stale:stale.status,preview2:{status:preview2.status,mode:preview2.viewportMode},domains:validation.domains,state:{architecture:state.architecture,images:state.images,composition:state.composition.count,preview:state.preview?.status}}));
  `;
  const after=lastJson(run(['--input-type=module','-e',stage37],{GAMEINDEX_DB:dbFile,GAMEINDEX_DATA_DIR:temp,GAMEINDEX_TARGET_SCHEMA:'37'}));
  assert.equal(after.schema,37);assert.equal(after.probe,'kept');assert.equal(after.runtime,'0.99-I4');
  assert.ok(after.vars.total>=5,'hero + section image variables must be created');assert.equal(after.vars.requiredMissing,0);assert.equal(after.vars.resolved,after.vars.total);
  assert.equal(after.comps,4);assert.equal(after.gap.groundedSections,4);assert.ok(after.gap.score>=90);
  assert.equal(after.preview1.status,'READY');assert.equal(after.preview1.mode,'DESKTOP');assert.equal(after.stale,'STALE');assert.equal(after.preview2.status,'READY');assert.equal(after.preview2.mode,'MOBILE');
  assert.deepEqual(after.state.architecture,['RESEARCH_CONTENT_ENGINE','GAME_SOURCED_IMAGE_ENGINE','INTERACTIVE_PREVIEW_ENGINE']);assert.equal(after.state.images.unresolvedRequired,0);assert.equal(after.state.composition,4);assert.equal(after.state.preview,'READY');
  assert.equal(after.domains.IMAGES_STATUS,'READY');assert.equal(after.domains.PREVIEW_STATUS,'READY');
}finally{rmSync(temp,{recursive:true,force:true});}

console.log(JSON.stringify({ok:true,release:'0.99-I4',schema:37,threeStagePipeline:true,imageVariables:true,gameSourcedImages:true,interactivePreview:true,personalizedPageComposition2:true,publishTop:true,reportBottom:true,visualGap:true,localFirstNoApiKey:true,fullBrowserAutomation:false,azureLive:false},null,2));
