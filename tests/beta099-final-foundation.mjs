import assert from 'node:assert/strict';
import {mkdtempSync, readFileSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const temp=mkdtempSync(path.join(tmpdir(),'gameindex-099-'));
const dbFile=path.join(temp,'gamevault.sqlite');
const read=rel=>readFileSync(path.join(root,rel),'utf8');
function child(code,env={}){
  const r=spawnSync(process.execPath,['--input-type=module','-e',code],{cwd:root,encoding:'utf8',env:{...process.env,...env}});
  if(r.status!==0)throw new Error(`child failed\nSTDOUT:\n${r.stdout}\nSTDERR:\n${r.stderr}`);
  return r.stdout.trim().split('\n').filter(Boolean).at(-1)||'';
}

try{
  // Build an exact 0.9875/HF1.1-compatible schema 33 test database first.
  const seedJson=child(`
    const c=await import('./src/database/connection.mjs');
    const g=await import('./src/database/repositories/game-repository.mjs');
    c.migrateDatabase();
    if(c.schemaVersion()!==33)throw new Error('expected schema 33');
    const now=new Date().toISOString();
    const roblox=g.upsertGame({name:'Roblox',slug:'roblox',description:'Roblox ecosystem',developer:'Roblox Corporation',releaseDate:'2006',platforms:['PC','Mobile'],genres:['Platform'],status:'PUBLISHED'});
    const minecraft=g.upsertGame({name:'Minecraft',slug:'minecraft',description:'Sandbox',developer:'Mojang',releaseDate:'2011',platforms:['PC'],genres:['Sandbox'],status:'PUBLISHED'});
    const specs=[
      ['Blox Fruits','blox-fruits','Gamer Robot Inc.','2019'],
      ['DOORS','doors','LSPLASH','2022'],
      ['Fisch','fisch','WoozyNate','2024'],
      ['Work at a Pizza Place','work-at-a-pizza-place','Dued1','2008'],
      ['Prison Life','prison-life','Aesthetical','2014']
    ];
    const ids={roblox:roblox.id,minecraft:minecraft.id};
    let order=10;
    for(const [name,slug,developer,releaseDate] of specs){
      const game=g.upsertGame({name,slug,description:name+' test content',developer,releaseDate,platforms:['Roblox'],genres:['Experience'],franchise:'Roblox',status:'PUBLISHED'});
      ids[slug]=game.id;
      c.db.prepare("INSERT INTO game_parent_links(child_game_id,parent_game_id,relation_type,display_order,enabled,created_at,updated_at) VALUES(?,?, 'ROBLOX_EXPERIENCE',?,1,?,?) ON CONFLICT(child_game_id) DO UPDATE SET parent_game_id=excluded.parent_game_id,display_order=excluded.display_order,enabled=1,updated_at=excluded.updated_at").run(game.id,roblox.id,order,now,now);
      order+=10;
    }
    console.log(JSON.stringify(ids));
  `,{GAMEINDEX_DB:dbFile,GAMEINDEX_TARGET_SCHEMA:'33',GAMEINDEX_DATA_DIR:temp,GAMEINDEX_DB_BACKUP_RETENTION:'5'});
  const oldIds=JSON.parse(seedJson);

  process.env.GAMEINDEX_DB=dbFile;
  process.env.GAMEINDEX_DATA_DIR=temp;
  process.env.GAMEINDEX_TARGET_SCHEMA='34';
  process.env.GAMEINDEX_DB_BACKUP_RETENTION='5';

  const c=await import('../src/database/connection.mjs');
  c.migrateDatabase();
  assert.equal(c.schemaVersion(),34);
  assert.equal(c.db.prepare('PRAGMA integrity_check').get().integrity_check,'ok');
  assert.equal(c.db.prepare("SELECT value FROM meta WHERE key='runtime_version'").get()?.value,'0.99');
  assert.equal(c.db.prepare("SELECT value FROM meta WHERE key='runtime_release'").get()?.value,'BETA_0_99_FINAL_FOUNDATION');
  assert.equal(c.db.prepare("SELECT value FROM meta WHERE key='beta_099'").get()?.value,'1');
  assert.ok(c.db.prepare("SELECT version FROM update_log_entries WHERE version='0.99'").get());

  const games=await import('../src/database/repositories/game-repository.mjs');
  const expectedExperiences=['blox-fruits','doors','fisch','work-at-a-pizza-place','prison-life'];
  const roblox=games.getGameBySlug('roblox');
  assert.ok(roblox);
  assert.equal(roblox.id,oldIds.roblox);
  assert.equal(roblox.entityType,'GAME');
  assert.equal(roblox.parentGameId,null);
  for(const slug of expectedExperiences){
    const game=games.getGameBySlug(slug);
    assert.ok(game,slug);
    assert.equal(game.id,oldIds[slug],`${slug} id must survive migration`);
    assert.equal(game.entityType,'EXPERIENCE');
    assert.equal(game.parentGameId,roblox.id);
    assert.equal(game.rootGameId,roblox.id);
    assert.equal(game.relationshipType,'EXPERIENCE_OF');
  }
  const children=games.listChildGameEntities(roblox.id,{includeDrafts:false,limit:20});
  assert.deepEqual(children.map(x=>x.slug),['blox-fruits','doors','fisch','prison-life','work-at-a-pizza-place']);

  // Global catalog is GAME-only at the query/data layer, not client-side hiding.
  const catalog=games.listGamesPage({includeDrafts:false,limit:100,offset:0});
  assert.ok(catalog.items.some(x=>x.slug==='roblox'));
  assert.ok(catalog.items.some(x=>x.slug==='minecraft'));
  for(const slug of expectedExperiences)assert.equal(catalog.items.some(x=>x.slug===slug),false,`${slug} must not be a top-level Games catalog item`);
  assert.ok(read('src/database/repositories/game-repository.mjs').includes('entity_type=?'));

  // Search still indexes Experiences and provides parent-aware friendly routing.
  const {searchGameVault}=await import('../src/api/search.mjs');
  const found=searchGameVault('Blox Fruits',{limit:20,language:'en-US'}).results.find(x=>x.title==='Blox Fruits');
  assert.ok(found,'Experience must remain searchable');
  assert.equal(found.type,'EXPERIENCE');
  assert.equal(found.url,'/game/roblox/blox-fruits');
  assert.match(found.subtitle,/Roblox Experience/i);

  const experiences=await import('../src/games/game-experience-service.mjs');
  const hub=experiences.robloxExperienceHub();
  assert.ok(hub);
  assert.equal(hub.children.length,5);
  assert.ok(hub.children.every(x=>x.game.entityType==='EXPERIENCE'));
  assert.equal(experiences.experienceByChildSlug('roblox','fisch')?.game?.entityType,'EXPERIENCE');

  // Identity profiles are data-driven and distinct; Prison Life uses explicit 2016 era inheritance.
  const identity=await import('../src/identity/experience-identity-service.mjs');
  const profiles=expectedExperiences.map(slug=>identity.resolveIdentityProfile(games.getGameBySlug(slug).id));
  assert.equal(new Set(profiles.map(x=>x.themeKey)).size,5);
  assert.ok(identity.resolveIdentityProfile(games.getGameBySlug('fisch').id).motifs.includes('FISCH_FISH'));
  assert.ok(identity.resolveIdentityProfile(games.getGameBySlug('doors').id).motifs.includes('DOORS_DOOR'));
  assert.ok(identity.resolveIdentityProfile(games.getGameBySlug('blox-fruits').id).motifs.includes('BLOX_FRUIT'));
  assert.ok(identity.resolveIdentityProfile(games.getGameBySlug('work-at-a-pizza-place').id).motifs.includes('PIZZA'));
  const prisonProfile=identity.resolveIdentityProfile(games.getGameBySlug('prison-life').id);
  assert.equal(prisonProfile.musicProfile.sourceType,'ERA_INHERITANCE');
  assert.equal(prisonProfile.musicProfile.era,'2016');
  assert.throws(()=>identity.validateIdentityProfile({decorations:['<script>alert(1)</script>']}),/IDENTITY_EXECUTABLE_CONTENT_REJECTED/);

  // Personalized technical profile foundation exists for each migrated Experience.
  const technical=await import('../src/content/technical-profile-service.mjs');
  for(const slug of expectedExperiences){
    const profile=technical.resolveTechnicalProfile(games.getGameBySlug(slug).id);
    assert.ok(profile?.fields?.some(x=>x.canonicalKey==='PLATFORM'));
    assert.ok(profile?.fields?.some(x=>x.canonicalKey==='ENTITY_TYPE'));
    assert.equal(profile.fields.find(x=>x.canonicalKey==='ENTITY_TYPE').value,'Experience');
  }

  // Universe Builder context isolation and approved source families.
  const builder=await import('../src/universe/universe-builder-099.mjs');
  const research=await import('../src/research/orchestrator.mjs');
  assert.deepEqual([...research.UNIVERSE_RESEARCH_SOURCE_FAMILIES],['WIKI','FANDOM','TRELLO','YOUTUBE']);
  const fisch=games.getGameBySlug('fisch');
  const fischContext=builder.universeBuilderContext(fisch);
  assert.equal(fischContext.entityType,'EXPERIENCE');
  assert.equal(fischContext.parent.slug,'roblox');
  assert.equal(fischContext.researchProfile.wikipedia,false);
  assert.equal(fischContext.researchProfile.noApiKey,true);
  assert.equal(fischContext.permissions.createPages,true);
  assert.equal(fischContext.permissions.createTabs,true);
  assert.equal(fischContext.permissions.createSections,true);
  assert.equal(fischContext.permissions.createInteractions,true);

  // Structure/revision engine: dynamic pages/tabs/sections, stable canonical duplicate handling and explicit publication.
  const structure=await import('../src/universe/universe-structure-service.mjs');
  const rev1=structure.createUniverseRevision(fisch.id,{status:'VALIDATED',canonicalLocale:'pt-BR',canonicalContent:{entity:{id:fisch.id}},translations:{'pt-BR':{},'en-US':{},'es-ES':{}},generatedBy:'BETA099_TEST'});
  structure.ensureBaseEntityStructure(fisch.id,{revisionId:rev1.id,status:'DRAFT'});
  const page1=structure.upsertUniversePage({entityGameId:fisch.id,canonicalKey:'FISH_COLLECTION',title:{'pt-BR':'Peixes','en-US':'Fish','es-ES':'Peces'},summary:'Structured collection',revisionId:rev1.id,status:'DRAFT',displayOrder:30});
  const page2=structure.upsertUniversePage({entityGameId:fisch.id,canonicalKey:'fish collection',title:'Duplicate semantic key',revisionId:rev1.id,status:'DRAFT'});
  assert.equal(page1.id,page2.id,'canonical-key duplicate must update, not duplicate');
  const tab=structure.upsertUniverseTab({entityGameId:fisch.id,pageId:page1.id,canonicalKey:'COLLECTION',title:'Collection',revisionId:rev1.id,status:'DRAFT'});
  const section=structure.upsertUniverseSection({entityGameId:fisch.id,pageId:page1.id,tabId:tab.id,canonicalKey:'RARITIES',title:'Rarities',sectionType:'LIST',content:{canonical:['Example structured entry']},revisionId:rev1.id,status:'DRAFT'});
  assert.ok(section.id);
  assert.throws(()=>structure.upsertUniverseSection({entityGameId:fisch.id,pageId:page1.id,canonicalKey:'UNSAFE',title:'Unsafe',sectionType:'TEXT',content:{html:'<script>alert(1)</script>'},revisionId:rev1.id}),/UNSAFE_SECTION_CONTENT/);
  const published1=structure.publishUniverseRevision(fisch.id,rev1.id);
  assert.equal(published1.status,'PUBLISHED');
  const public1=structure.publicEntityUniverse(fisch.id,{language:'en-US'});
  assert.ok(public1.structure.pages.some(x=>x.canonicalKey==='FISH_COLLECTION'));
  assert.equal(public1.entity.parent.slug,'roblox');

  // A failed draft must not destroy the previous published revision.
  const rev2=structure.createUniverseRevision(fisch.id,{status:'DRAFT',canonicalLocale:'pt-BR',generatedBy:'BETA099_TEST',supersedesRevisionId:rev1.id});
  structure.ensureBaseEntityStructure(fisch.id,{revisionId:rev2.id,status:'DRAFT'});
  c.db.prepare("UPDATE universe_revisions SET status='FAILED',updated_at=? WHERE id=?").run(new Date().toISOString(),rev2.id);
  assert.equal(structure.latestUniverseRevision(fisch.id,{status:'PUBLISHED'}).id,rev1.id);
  assert.equal(structure.publicEntityUniverse(fisch.id).revision.id,rev1.id);

  // Generic safe interaction registry + weighted probability math; no Blox Fruits-only runtime.
  const interactions=await import('../src/interactions/interactive-component-service.mjs');
  const normalized=interactions.normalizeWheelItems([{id:'a',label:'A',weight:1},{id:'b',label:'B',weight:3}]);
  assert.equal(normalized.length,2);
  assert.equal(normalized[0].probability,0.25);
  assert.equal(normalized[1].probability,0.75);
  assert.equal(interactions.selectWeighted(normalized,0.1).id,'a');
  assert.equal(interactions.selectWeighted(normalized,0.9).id,'b');
  assert.throws(()=>interactions.normalizeWheelItems([{label:'Bad',weight:-1}]),/WHEEL_WEIGHT_INVALID/);
  assert.throws(()=>interactions.validateInteractiveConfig('WHEEL',{title:'x'},{items:[{label:'A',weight:1,metadata:{html:'javascript:alert(1)'}},{label:'B',weight:1}]}),/INTERACTIVE_EXECUTABLE_CONFIG_REJECTED/);
  const blox=games.getGameBySlug('blox-fruits');
  const bRev=structure.createUniverseRevision(blox.id,{status:'VALIDATED',generatedBy:'BETA099_TEST'});
  const bStruct=structure.ensureBaseEntityStructure(blox.id,{revisionId:bRev.id,status:'DRAFT'});
  const bPage=bStruct.pages[0];
  const bTab=bPage.tabs[0];
  const bSection=bTab.sections[0];
  const wheel=interactions.upsertInteractiveComponent({entityGameId:blox.id,pageId:bPage.id,sectionId:bSection.id,componentType:'WHEEL',config:{title:'Fruit Roll Simulator',disclaimer:'Game Index simulation'},data:{items:[{id:'fruit-a',label:'Fruit A',weight:2},{id:'fruit-b',label:'Fruit B',weight:1}]},identityVariant:identity.resolveIdentityProfile(blox.id).themeKey,status:'DRAFT',sourceIds:['evidence-test'],lastVerifiedAt:new Date().toISOString(),revisionId:bRev.id});
  assert.equal(wheel.componentType,'WHEEL');
  assert.equal(wheel.data.items.length,2);
  assert.equal(wheel.identityVariant,'blox-fruits-adventure');

  // Content media is structurally separate from Image Manager identity media.
  for(const table of ['universe_builds','universe_build_events','universe_revisions','universe_pages','universe_tabs','universe_sections','universe_topics','universe_facts','universe_research_sources','content_media','interactive_components','entity_identity_profiles','entity_technical_profiles']){
    assert.ok(c.db.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name=?").get(table),`missing ${table}`);
  }
  const imageJs=read('public/js/image-library.js');
  assert.match(imageJs,/SIMPLE_SLOTS=\[\['LOGO','Logo'\],\['BANNER','Banner'\]\]/);
  assert.match(imageJs,/Experiências|Experiences/);
  assert.doesNotMatch(imageJs,/content_media/i);

  // Research adapters are real public retrieval adapters and Wiki explicitly excludes Wikipedia/Fandom.
  const wiki=read('src/research/source-adapters/wiki.mjs');
  const fandom=read('src/research/source-adapters/fandom.mjs');
  const trello=read('src/research/source-adapters/trello.mjs');
  const youtube=read('src/research/source-adapters/youtube.mjs');
  const publicSearch=read('src/research/source-adapters/public-search.mjs');
  assert.match(wiki,/wikipedia\.org/);
  assert.match(wiki,/return false/);
  assert.match(wiki,/researchGameWiki/);
  assert.match(fandom,/site:fandom\.com\/wiki/);
  assert.match(trello,/trello\.com/);
  assert.match(youtube,/site:youtube\.com\/watch/);
  assert.match(youtube,/transcriptAvailable:false/);
  assert.match(publicSearch,/duckduckgo/i);
  assert.match(read('src/security/url-safety.mjs'),/assertPublicUrl/);
  assert.match(read('src/security/url-safety.mjs'),/fetchPublicText\(value/);

  // Role/capability foundation for future Tester+ submission.
  const access=await import('../src/access/capability-service.mjs');
  assert.deepEqual(access.USER_RANK_POWER,{FREE:1,PRO:2,TESTER:3,DEV:4,CREATOR:5});
  assert.equal(access.USER_RANK_LORE.CREATOR,'KING');
  assert.equal(access.USER_RANK_LORE.PRO,'BOURGEOISIE');
  assert.ok(access.CAPABILITIES.includes('game_submission'));
  assert.ok(access.CAPABILITIES.includes('universe_build'));

  // UI/runtime contracts, safe route protections and no public-view research call.
  const gameHtml=read('public/game.html');
  assert.match(gameHtml,/099finalfoundation|099i1visualgrounding|099i2experienceengine|099i3gamesourced|099i4pipeline|099i5production/);
  assert.match(gameHtml,/interactive-runtime-099\.js/);
  assert.match(gameHtml,/universe-runtime-099\.js/);
  assert.match(gameHtml,/final-foundation-099\.css/);
  const runtime=read('public/js/universe-runtime-099.js');
  assert.match(runtime,/\/api\/games\/\$\{encodeURIComponent\(slug\|\|game\.slug\)\}\/universe-099/);
  assert.doesNotMatch(runtime,/researchGameVault|Ollama|gemma/i);
  const interactiveRuntime=read('public/js/interactive-runtime-099.js');
  assert.match(interactiveRuntime,/WHEEL/);
  assert.match(interactiveRuntime,/prefers-reduced-motion/);
  assert.match(interactiveRuntime,/localStorage/);
  const routes=read('src/api/beta099-routes.mjs');
  assert.match(routes,/registerBeta099Routes/);
  assert.match(routes,/requireSameOriginMutation,requireCapability\("universe_build"\)/);
  assert.match(routes,/requireCapability\("creator_control"\)/);
  assert.match(routes,/label:"Experiences"/);
  const server=read('server.mjs');
  assert.match(server,/version:"(?:0\.99|0\.99-I1|0\.99-I2|0\.99-I3|0\.99-I4|0\.99-I5|0\.99-I6(?:-HF[12])?)"/);
  assert.match(server,/BETA_0_99_FINAL_FOUNDATION|BETA_0_99_I1_FOUNDATION_CORRECTION_VISUAL_GROUNDING|BETA_0_99_I2_INTELLIGENT_PROCEDURAL_EXPERIENCE_ENGINE|BETA_0_99_I3_GAME_SOURCED_VISUAL_COMPOSITION|BETA_0_99_I4_THREE_STAGE_UNIVERSE_PRODUCTION_PIPELINE|BETA_0_99_I5_PRODUCTION_CONSOLIDATION|BETA_0_99_I6_UNIVERSE_BUILDER_EXPERIENCE|BETA_0_99_I6_HF1_BUILD_RELIABILITY|INTERNAL_RELEASE_CODE/);
  assert.match(server,/child\.entityType!=="EXPERIENCE"/);
  assert.match(server,/registerBeta099Routes\(app\)/);

  // Music runtime is still single-player; no competing 0.99 audio runtime.
  const shell=read('public/js/shell-0986.js');
  assert.match(shell,/new YT\.Player/);
  assert.match(shell,/playerInstances=1/);
  assert.match(shell,/seekTo\(0,true\)/);
  assert.match(shell,/playVideo\(\)/);
  assert.match(shell,/loop:1/);
  assert.doesNotMatch(read('public/js/interactive-runtime-099.js'),/new YT\.Player/);

  // Package/release metadata.
  const pkg=JSON.parse(read('package.json'));
  assert.ok(['gameindex-beta-099-final-foundation','gameindex-beta-099-i1-foundation-correction-visual-grounding','gameindex-beta-099-i2-intelligent-procedural-experience-engine','gameindex-beta-099-i3-game-sourced-visual-composition','gameindex-beta-099-i4-three-stage-universe-production-pipeline','gameindex-beta-099-i5-production-consolidation','gameindex-beta-099-i6-universe-builder-experience','gameindex-beta-099-i6-hf1-build-reliability','gameindex-beta-099-i6-hf2-launch-visual-rebrand','gameindex-beta-0991-full-experience'].includes(pkg.name));
  assert.ok(['0.99.0','0.99.1','0.99.2','0.99.3','0.99.4','0.99.5','0.99.6','0.99.6-1','0.99.6-2','0.991.0'].includes(pkg.version));
  assert.ok(['node tests/beta099-final-foundation.mjs','node tests/beta099-i1-foundation-correction.mjs','node tests/beta099-i2-intelligent-procedural-experience-engine.mjs','node tests/beta099-i3-game-sourced-visual-composition.mjs','node tests/beta099-i4-three-stage-universe-production-pipeline.mjs','node tests/beta099-i5-production-consolidation.mjs','node tests/beta099-i6-universe-builder-experience.mjs','node tests/beta099-i6-hf1-build-reliability.mjs','node tests/beta099-i6-hf2-launch-rebrand.mjs','node tests/beta0991-full-experience.mjs'].includes(pkg.scripts.test));
  assert.equal(pkg.dependencies.express,'^5.1.0');
  assert.equal(pkg.dependencies.dotenv,'^17.2.2');
  assert.match(read('package-lock.json'),/(?:gameindex-beta-099-(?:final-foundation|i1-foundation-correction-visual-grounding|i2-intelligent-procedural-experience-engine|i3-game-sourced-visual-composition|i4-three-stage-universe-production-pipeline|i5-production-consolidation|i6-universe-builder-experience|i6-hf1-build-reliability|i6-hf2-launch-visual-rebrand)|gameindex-beta-0991-full-experience)/);

  console.log(JSON.stringify({
    ok:true,
    release:'0.99',
    schema:34,
    entityArchitecture:'GAME_EXPERIENCE',
    robloxExperiences:expectedExperiences,
    universeBuilder:'2.0_FINAL_FOUNDATION',
    researchSources:[...research.UNIVERSE_RESEARCH_SOURCE_FAMILIES],
    dynamicStructure:true,
    revisionPublication:true,
    identityProfiles:profiles.map(x=>x.themeKey),
    technicalProfiles:true,
    interactiveRegistry:true,
    wheelWeightedProbability:true,
    contentMediaSeparate:true,
    testerPlusSubmissionFoundation:true,
    publicViewAiResearch:false,
    productionDbReset:false,
    browserAutomation:false,
    azureLive:false
  },null,2));
}finally{
  try{rmSync(temp,{recursive:true,force:true});}catch{}
}
