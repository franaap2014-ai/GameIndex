import assert from 'node:assert/strict';
import {mkdtempSync, readFileSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=rel=>readFileSync(path.join(root,rel),'utf8');
function run(args,env={}){const r=spawnSync(process.execPath,args,{cwd:root,encoding:'utf8',env:{...process.env,...env,NODE_NO_WARNINGS:'1'}});if(r.status!==0)throw new Error(`command failed: node ${args.join(' ')}\nSTDOUT:\n${r.stdout}\nSTDERR:\n${r.stderr}`);return r.stdout;}
function lastJson(output){for(const line of String(output).trim().split('\n').reverse()){try{return JSON.parse(line);}catch{}}throw new Error(`No JSON found:\n${output}`);}

const pkg=JSON.parse(read('package.json'));
assert.ok(['gameindex-beta-099-i5-production-consolidation','gameindex-beta-099-i6-universe-builder-experience','gameindex-beta-099-i6-hf1-build-reliability','gameindex-beta-099-i6-hf2-launch-visual-rebrand','gameindex-beta-0991-full-experience'].includes(pkg.name));
assert.ok(['0.99.5','0.99.6','0.99.6-1','0.99.6-2','0.991.0'].includes(pkg.version));
assert.ok(['node tests/beta099-i5-production-consolidation.mjs','node tests/beta099-i6-universe-builder-experience.mjs','node tests/beta099-i6-hf1-build-reliability.mjs','node tests/beta099-i6-hf2-launch-rebrand.mjs','node tests/beta0991-full-experience.mjs'].includes(pkg.scripts.test));
assert.equal(pkg.engines.node,'>=22.13');

const release=read('src/config/release-099i5.mjs');
assert.match(release,/PUBLIC_VERSION="0\.99"/);
assert.match(release,/INTERNAL_RELEASE="0\.99-I5"/);
assert.match(release,/TARGET_SCHEMA=38/);
assert.match(release,/LOCAL_FIRST_NO_API_KEY/);

const migration=read('src/database/migrations/038_beta_099_i5.sql');
for(const table of ['research_fact_quality','asset_semantic_scores','asset_usage_metrics','bug_relevance_state','regression_runs','regression_run_results','bug_regression_links','admin_audit_events','social_posts','social_context_links'])assert.match(migration,new RegExp(`CREATE TABLE IF NOT EXISTS ${table}`));
assert.match(migration,/ADD COLUMN composition_version/);
assert.match(migration,/NEEDS_REVERIFICATION/);
assert.match(migration,/0\.99-I5/);
assert.match(migration,/public_version','0\.99/);

const research=read('src/research/research-quality-099i5.mjs');
for(const token of ['LEGAL_NOTICE','COPYRIGHT','BOILERPLATE','COOKIE_NOTICE','GAME_MECHANIC','ITEM_FACT','scoreResearchClaim','filterAcceptedEvidence'])assert.match(research,new RegExp(token));
assert.match(research,/unofficial|fan\[- \]made/i);

const pipeline=read('src/universe/universe-production-pipeline-099i5.mjs');
for(const token of ['scoreAssetForVariableI5','SEMANTIC_MATCH','auditAssetDiversityI5','EXCESSIVE','autoHealVisualGapsI5','autoFixUniverseI5','compositionVersion','generatePreviewSnapshotI5','productionPipelineStateI5'])assert.match(pipeline,new RegExp(token,'i'));
assert.match(pipeline,/context==="HERO"/);
assert.match(pipeline,/APPROVED/);
assert.doesNotMatch(pipeline,/JOLLY_ROGER.*<svg|FISCH_FISH.*<svg|createElement\(['"]svg/);

const validation=read('src/universe/validation-099i5.mjs');
for(const token of ['HERO_RESOLVED_REQUIRED','REQUIRED_IMAGES_RESOLVED_REQUIRED','ASSET_DIVERSITY_REQUIRED','EXCESSIVE_ASSET_REUSE','SEMANTIC_IMAGE_MATCH_REQUIRED','VISUAL_COVERAGE_BELOW_I5_TARGET','VISUAL_GAP_AUTO_HEAL_REQUIRED','PREVIEW_CURRENT_REQUIRED'])assert.match(validation,new RegExp(token));
assert.match(validation,/density==="RICH"\?80/);

const builderHtml=read('public/universe-builder.html'),builderJs=read('public/js/universe-builder.js');
for(const token of ['CONTEÚDO','IMAGENS','APARÊNCIA','INTERAÇÕES','PREVIEW','PUBLICAR','Modo avançado','Corrigir automaticamente'])assert.match(builderHtml,new RegExp(token,'i'));
assert.ok(builderHtml.indexOf('id="foundationPublish"')<builderHtml.indexOf('id="i4ReportStage"'),'Publish must remain above final report');
assert.match(builderJs,/autoFixI5|autoFix/);
assert.match(builderJs,/simpleContentStatus/);
assert.match(builderJs,/advancedBuilder/);

const adminHtml=read('public/admin.html'),adminJs=read('public/js/admin.js');
for(const token of ['Visão geral','Usuários','Conteúdo','Social','Sistema','Bugs','Avançado','Buscar usuário \/ alterar cargo','Search Admin|Pesquisar usuário'])assert.match(adminHtml,new RegExp(token,'i'));
assert.match(adminHtml,/Internal release 0\.99-I(?:5|6)/);
assert.match(adminJs,/staff-role/);
assert.match(adminJs,/expectedRole/);
assert.match(adminJs,/expectedRevision/);
assert.match(adminJs,/adminGlobalSearch/);

const socialHtml=read('public/social.html'),socialJs=read('public/js/social.js');
for(const token of ['Feed','Comunidades','Pessoas','Notificações','Perfil'])assert.match(socialHtml,new RegExp(token));
assert.match(socialJs,/entityGameId|socialPostContext/);
assert.match(socialJs,/nextOffset|Carregar mais/);

const bugHtml=read('public/bug-tracker.html'),bugJs=read('public/js/bug-tracker.js'),bugService=read('src/bugs/regression-center-099i5.mjs');
for(const token of ['Precisa|reverifica','Regression|Regress','NEEDS_REVERIFICATION','SUPERSEDED'])assert.match(bugHtml+bugJs+bugService,new RegExp(token,'i'));
assert.match(bugService,/workflowStatusPreserved:true/);
assert.doesNotMatch(bugService,/status\s*=\s*['"]VERIFIED['"]/);

const gameHtml=read('public/game.html'),runtime=read('public/js/universe-runtime-099.js'),visual=read('public/js/visual-grounding-099i5.js');
assert.match(gameHtml,/visual-grounding-099i5\.js/);
assert.doesNotMatch(gameHtml,/visual-grounding-099i1\.js|visual-grounding-099i2\.js/);
assert.match(runtime,/GameIndexVisualGrounding099I5/);
assert.match(visual,/APPROVED|approvalStatus/);
assert.doesNotMatch(visual,/JOLLY_ROGER.*<svg|FISCH_FISH.*<svg|createElement\(['"]svg/);

const routes=read('src/api/beta099-routes.mjs'),i5Routes=read('src/api/beta099-i5-routes.mjs'),server=read('server.mjs');
assert.match(routes,/INTELLIGENT_PRODUCTION_CONSOLIDATION_I5/);
assert.match(routes,/auto-fix-099i5|autoFixUniverseI5/);
assert.match(routes,/publicVersion:PUBLIC_VERSION/);
assert.match(i5Routes,/\/api\/release/);
assert.match(i5Routes,/\/api\/admin\/i5\/search/);
assert.match(i5Routes,/\/api\/social\/i5\/feed/);
assert.match(i5Routes,/\/api\/admin\/i5\/regressions/);
assert.match(server,/registerBeta099I5Routes/);
assert.match(server,/GAMEINDEX BETA 0\.99 I5|BETA_0_99_I6_UNIVERSE_BUILDER_EXPERIENCE|release-099i6/);

// Public-facing HTML must not advertise obsolete active beta versions. Historical CSS comments/docs are intentionally outside this check.
for(const rel of ['public/index.html','public/game.html','public/social.html','public/profile.html','public/settings.html','public/login.html']){
  const s=read(rel);assert.doesNotMatch(s,/Beta 0\.(?:975|986|987|9875)\b/i,`${rel} exposes an obsolete public version`);assert.match(s,/Beta 0\.99/i,`${rel} should expose Beta 0.99`);
}

// Pure quality checks: source boilerplate is rejected, useful topic content survives, and an approved wiki accent cannot become Hero.
const pure=lastJson(run(['--input-type=module','-e',`
  const r=await import('./src/research/research-quality-099i5.mjs');
  const p=await import('./src/universe/universe-production-pipeline-099i5.mjs');
  const bad=r.scoreResearchClaim('Blox Fruits Wiki is an unofficial, fan-made wiki and is not affiliated with Roblox Corporation. All trademarks and copyrights belong to their owners. © 2026',{topic:'OVERVIEW',gameName:'Blox Fruits',sourceQuality:.9,relevance:.9});
  const good=r.scoreResearchClaim('Blox Fruits gameplay revolves around combat abilities, quests, boss fights and character progression across islands.',{topic:'GAMEPLAY',gameName:'Blox Fruits',sourceQuality:.9,relevance:.95});
  const variable={id:'v',entityGameId:'g',variableKey:'IMAGE:HERO',label:'Blox Fruits Hero',semanticIntent:'recognizable official hero key art environment'};
  const badHero={id:'a',entityGameId:'g',approvalStatus:'APPROVED',semanticRole:'SECTION_ACCENT',visualFamily:'WIKI',sourceType:'VALIDATED_REFERENCE_ASSET',sourceReference:'Blox Fruits wiki branding icon',imageUrl:'https://example.com/wiki/branding/icon.svg',confidence:.9};
  const goodHero={id:'b',entityGameId:'g',approvalStatus:'APPROVED',semanticRole:'HERO',visualFamily:'BLOX_WORLD',sourceType:'APPROVED_OFFICIAL_ASSET',sourceReference:'Blox Fruits official game hero key art world islands',imageUrl:'https://example.com/blox-hero.png',confidence:.99};
  console.log(JSON.stringify({bad,good,badHero:p.scoreAssetForVariableI5(variable,badHero),goodHero:p.scoreAssetForVariableI5(variable,goodHero)}));
`],{GAMEINDEX_TARGET_SCHEMA:'1',GAMEINDEX_DATA_DIR:mkdtempSync(path.join(tmpdir(),'gameindex-i5-pure-'))}));
assert.equal(pure.bad.accepted,false);assert.ok(['BOILERPLATE','COPYRIGHT','LEGAL_NOTICE'].includes(pure.bad.contentClass));assert.equal(pure.good.accepted,true);assert.equal(pure.badHero.eligible,false);assert.equal(pure.goodHero.eligible,true);assert.ok(pure.goodHero.totalScore>pure.badHero.totalScore);

// Exact additive migration from I4/schema 37 to I5/schema 38, with I5 pipeline, diversity, preview consistency, interaction dedupe, and regression history.
const temp=mkdtempSync(path.join(tmpdir(),'gameindex-099i5-')),dbFile=path.join(temp,'gamevault.sqlite');
try{
  const stage37=`
    const c=await import('./src/database/connection.mjs');c.migrateDatabase();
    const g=await import('./src/database/repositories/game-repository.mjs');
    const id=await import('./src/identity/experience-identity-service.mjs');
    const game=g.upsertGame({name:'Blox Fruits I5 Test',slug:'blox-fruits-i5-test',status:'PUBLISHED'});
    id.setIdentityProfile(game.id,{themeKey:'blox-fruits-adventure',visualDensity:'RICH',status:'APPROVED'});
    c.db.prepare("INSERT INTO meta(key,value) VALUES('i5_preserve_probe','kept') ON CONFLICT(key) DO UPDATE SET value='kept'").run();
    console.log(JSON.stringify({schema:c.schemaVersion(),id:game.id,bugs:c.db.prepare('SELECT COUNT(*) count FROM bugs').get()?.count,probe:c.db.prepare("SELECT value FROM meta WHERE key='i5_preserve_probe'").get()?.value}));
  `;
  const before=lastJson(run(['--input-type=module','-e',stage37],{GAMEINDEX_DB:dbFile,GAMEINDEX_DATA_DIR:temp,GAMEINDEX_TARGET_SCHEMA:'37'}));
  assert.equal(before.schema,37);assert.equal(before.probe,'kept');assert.ok(before.bugs>=6);

  const stage38=`
    const c=await import('./src/database/connection.mjs');c.migrateDatabase();
    const g=await import('./src/database/repositories/game-repository.mjs');
    const us=await import('./src/universe/universe-structure-service.mjs');
    const vr=await import('./src/images/visual-asset-registry.mjs');
    const p=await import('./src/universe/universe-production-pipeline-099i5.mjs');
    const v=await import('./src/universe/validation-099i5.mjs');
    const q=await import('./src/research/research-quality-099i5.mjs');
    const inter=await import('./src/interactions/universe-interaction-service.mjs');
    const bugs=await import('./src/bugs/regression-center-099i5.mjs');
    const game=g.getGameBySlug('blox-fruits-i5-test');
    const rev=us.createUniverseRevision(game.id,{status:'DRAFT',canonicalLocale:'pt-BR'});
    const page=us.upsertUniversePage({entityGameId:game.id,revisionId:rev.id,canonicalKey:'OVERVIEW',title:'Blox Fruits',status:'DRAFT'});
    const defs=[['OVERVIEW','Resumo do jogo','GALLERY','overview world game'],['GAMEPLAY','Mecânicas','ENVIRONMENT_ELEMENT','gameplay combat ability mechanics'],['TECHNICAL_INFORMATION','Interface','UI_REFERENCE','ui interface inventory hud'],['UPDATES','Atualizações','GALLERY','update patch event change'],['COLLECTIONS','Coleções','ITEM','collection fruit item inventory']];
    const sections=[];
    for(const [key,title,role,terms] of defs){const s=us.upsertUniverseSection({entityGameId:game.id,revisionId:rev.id,pageId:page.id,canonicalKey:key,title,status:'DRAFT',content:{canonical:'Blox Fruits verified '+terms+' content for '+title}});sections.push({s,key,role,terms});}
    vr.upsertVisualAsset({entityGameId:game.id,assetKey:'BLOX_HERO_OFFICIAL',semanticRole:'HERO',visualFamily:'BLOX_HERO',sourceType:'APPROVED_OFFICIAL_ASSET',sourceReference:'Blox Fruits official hero key art game world islands',imageUrl:'https://example.com/blox-hero.png',approvalStatus:'APPROVED',confidence:.99});
    for(const [i,row] of sections.entries())vr.upsertVisualAsset({entityGameId:game.id,assetKey:'BLOX_'+row.key+'_'+i,pageId:page.id,sectionId:row.s.id,semanticRole:row.role,visualFamily:'BLOX_'+row.key,sourceType:'APPROVED_SCREENSHOT',sourceReference:'Blox Fruits '+row.terms+' screenshot '+i,imageUrl:'https://example.com/blox-'+i+'.png',approvalStatus:'APPROVED',confidence:.97});
    // A real but weak wiki accent must remain in the registry without stealing primary variables.
    vr.upsertVisualAsset({entityGameId:game.id,assetKey:'WIKI_ICON',semanticRole:'SECTION_ACCENT',visualFamily:'WIKI',sourceType:'VALIDATED_REFERENCE_ASSET',sourceReference:'Blox Fruits wiki branding icon',imageUrl:'https://example.com/wiki/branding/icon.svg',approvalStatus:'APPROVED',confidence:.9});
    const vars=p.syncImageVariablesI5(game.id,{revisionId:rev.id,structureStatus:'DRAFT'});
    const resolution=p.resolveImageVariablesI5(game.id,{revisionId:rev.id});
    const comps=p.syncPageCompositionsI5(game.id,{revisionId:rev.id,structureStatus:'DRAFT'});
    q.persistResearchQuality({entityGameId:game.id,revisionId:rev.id,topic:'GAMEPLAY',claim:'Blox Fruits gameplay uses combat abilities, quests, boss fights and progression across islands.',sourceTitle:'Verified gameplay reference',sourceQuality:.95,relevance:.95,gameName:game.nome});
    q.persistResearchQuality({entityGameId:game.id,revisionId:rev.id,topic:'OVERVIEW',claim:'This wiki is an unofficial fan-made wiki and is not affiliated with Roblox. All trademarks and copyrights belong to their owners. © 2026',sourceTitle:'Wiki footer',sourceQuality:.95,relevance:.95,gameName:game.nome});
    const i1=inter.upsertUniverseInteraction({entityGameId:game.id,revisionId:rev.id,elementKey:'ASSET:BLOX_GAMEPLAY',elementRole:'NAVIGATION',eventType:'CLICK',actionType:'SCROLL_TO',targetType:'PAGE',targetId:'OVERVIEW',parameters:{label:'Open gameplay'},status:'DRAFT',source:'PRESET'});
    const i2=inter.upsertUniverseInteraction({entityGameId:game.id,revisionId:rev.id,elementKey:'ASSET:BLOX_GAMEPLAY',elementRole:'NAVIGATION',eventType:'CLICK',actionType:'SCROLL_TO',targetType:'PAGE',targetId:'OVERVIEW',parameters:{label:'Open gameplay again'},status:'DRAFT',source:'PRESET'});
    const preview1=p.generatePreviewSnapshotI5(game.id,{revisionId:rev.id,viewportMode:'DESKTOP',structureStatus:'DRAFT'});
    p.updatePageComposition(comps[0].id,{layoutVariant:'CENTERED_FEATURE'});
    const stale=p.latestPreviewSnapshotI5(game.id,{revisionId:rev.id,structureStatus:'DRAFT'});
    const preview2=p.generatePreviewSnapshotI5(game.id,{revisionId:rev.id,viewportMode:'MOBILE',structureStatus:'DRAFT'});
    const validation=v.evaluateBuilderValidationI5(game.id,{revisionId:rev.id,structureStatus:'DRAFT',persist:true});
    const state=p.productionPipelineStateI5(game.id,{revisionId:rev.id,structureStatus:'DRAFT'});
    const regression=bugs.runRegressionSuiteI5({environment:'LOCAL_TEST',testIds:['universe-autonomous-generation','image-runtime-load','personalized-page-quality']});
    const workflowBefore=c.db.prepare("SELECT status FROM bugs WHERE bug_code='GI-0004'").get()?.status;
    const reverified=bugs.markBugReverifiedI5('GI-0004',{rationale:'I5 deterministic image runtime regression passed.'});
    const workflowAfter=c.db.prepare("SELECT status FROM bugs WHERE bug_code='GI-0004'").get()?.status;
    console.log(JSON.stringify({schema:c.schemaVersion(),probe:c.db.prepare("SELECT value FROM meta WHERE key='i5_preserve_probe'").get()?.value,runtime:c.db.prepare("SELECT value FROM meta WHERE key='runtime_version'").get()?.value,publicVersion:c.db.prepare("SELECT value FROM meta WHERE key='public_version'").get()?.value,vars:{total:vars.length,resolved:resolution.variables.filter(x=>x.binding?.asset&&x.currentMatch?.eligible).length,requiredMissing:resolution.unresolvedRequired.length,unique:resolution.diversity.uniqueAssets,diversityPass:resolution.diversity.pass},comps:comps.length,preview1:{status:preview1.status,compositionVersion:preview1.versions.compositionVersion},stale:stale.status,preview2:{status:preview2.status,mode:preview2.viewportMode},validation:{images:validation.domains.IMAGES_STATUS,preview:validation.domains.PREVIEW_STATUS,hero:validation.images.heroResolved,diversity:validation.images.diversity.pass,visual:validation.visual.coverageScore},research:validation.research.quality,interactions:{same:i1.id===i2.id,count:inter.listUniverseInteractions(game.id,{status:null,revisionId:rev.id,includeManual:false}).length},state:{version:state.version,architecture:state.architecture,unresolved:state.images.unresolvedRequired},regression:{status:regression.status,passed:regression.passed,failed:regression.failed},bug:{relevance:reverified.relevance.state,workflowBefore,workflowAfter,preserved:reverified.workflowStatusPreserved}}));
  `;
  const after=lastJson(run(['--input-type=module','-e',stage38],{GAMEINDEX_DB:dbFile,GAMEINDEX_DATA_DIR:temp,GAMEINDEX_TARGET_SCHEMA:'38'}));
  assert.equal(after.schema,38);assert.equal(after.probe,'kept');assert.equal(after.runtime,'0.99-I5');assert.equal(after.publicVersion,'0.99');
  assert.ok(after.vars.total>=6);assert.equal(after.vars.requiredMissing,0);assert.equal(after.vars.resolved,after.vars.total);assert.ok(after.vars.unique>=5);assert.equal(after.vars.diversityPass,true);
  assert.equal(after.comps,5);assert.equal(after.preview1.status,'READY');assert.ok(after.preview1.compositionVersion);assert.equal(after.stale,'STALE');assert.equal(after.preview2.status,'READY');assert.equal(after.preview2.mode,'MOBILE');
  assert.equal(after.validation.images,'READY');assert.equal(after.validation.preview,'READY');assert.equal(after.validation.hero,true);assert.equal(after.validation.diversity,true);assert.ok(after.validation.visual>=70);
  assert.ok(after.research.usefulFacts>=1);assert.ok(after.research.boilerplateRejected>=1);
  assert.equal(after.interactions.same,true);assert.equal(after.interactions.count,1);
  assert.equal(after.state.version,'0.99-I5');assert.deepEqual(after.state.architecture,['RESEARCH_CONTENT_ENGINE_2_0','SEMANTIC_GAME_SOURCED_IMAGE_ENGINE_2_0','INTERACTIVE_PREVIEW_ENGINE']);assert.equal(after.state.unresolved,0);
  assert.equal(after.regression.status,'COMPLETE');assert.equal(after.regression.failed,0);assert.equal(after.regression.passed,3);
  assert.equal(after.bug.relevance,'LEGACY');assert.equal(after.bug.workflowBefore,after.bug.workflowAfter);assert.equal(after.bug.preserved,true);
}finally{rmSync(temp,{recursive:true,force:true});}

console.log(JSON.stringify({ok:true,release:'0.99-I5',publicVersion:'0.99',schema:38,researchQuality2:true,semanticImageResolver2:true,assetDiversity:true,visualGapAutoHealing:true,autoFix:true,universeBuilderUx3:true,adminControlCenter2:true,social2:true,bugTracker2:true,regressionCenter:true,versionConsistency:true,localFirstNoApiKey:true,azureLive:false,browserAutomation:false},null,2));
