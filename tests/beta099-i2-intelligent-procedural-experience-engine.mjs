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

// Preserve I1 + Final Foundation regressions first.
run(['tests/beta099-i1-foundation-correction.mjs']);

const pkg=JSON.parse(read('package.json'));
assert.ok(['0.99.2','0.99.3','0.99.4','0.99.5','0.99.6','0.99.6-1','0.99.6-2','0.991.0','0.991.1'].includes(pkg.version));
assert.ok(['gameindex-beta-099-i2-intelligent-procedural-experience-engine','gameindex-beta-099-i3-game-sourced-visual-composition','gameindex-beta-099-i4-three-stage-universe-production-pipeline','gameindex-beta-099-i5-production-consolidation','gameindex-beta-099-i6-universe-builder-experience','gameindex-beta-099-i6-hf1-build-reliability','gameindex-beta-099-i6-hf2-launch-visual-rebrand','gameindex-beta-0991-full-experience','gameindex-beta-0991-hf1-identity-restoration'].includes(pkg.name));
assert.ok(['node tests/beta099-i2-intelligent-procedural-experience-engine.mjs','node tests/beta099-i3-game-sourced-visual-composition.mjs','node tests/beta099-i4-three-stage-universe-production-pipeline.mjs','node tests/beta099-i5-production-consolidation.mjs','node tests/beta099-i6-universe-builder-experience.mjs','node tests/beta099-i6-hf1-build-reliability.mjs','node tests/beta099-i6-hf2-launch-rebrand.mjs','node tests/beta0991-full-experience.mjs','node tests/beta0991-hf1-identity-restoration.mjs'].includes(pkg.scripts.test));

const migration=read('src/database/migrations/035_beta_099_i2.sql');
assert.match(migration,/ADD COLUMN visual_density/);
assert.match(migration,/SPARSE.*BALANCED.*RICH.*IMMERSIVE/s);
assert.match(migration,/CREATE TABLE IF NOT EXISTS universe_interaction_bindings/);
assert.match(migration,/CLICK.*HOVER.*FOCUS.*ENTER_SECTION.*LEAVE_SECTION/s);
assert.match(migration,/PLAY_ANIMATION.*PLAY_SOUND.*OPEN_CHARACTER.*SCROLL_TO/s);

const interaction=read('src/interactions/universe-interaction-service.mjs');
assert.match(interaction,/INTERACTION_EXECUTABLE_CONFIG_REJECTED/);
assert.match(interaction,/INTERACTION_NAVIGATION_MUST_BE_SAME_ORIGIN_PATH/);
assert.match(interaction,/PRESET_BY_THEME/);
assert.doesNotMatch(interaction,/\beval\s*\(/);
assert.doesNotMatch(interaction,/new Function\s*\(/);

const creative=read('src/universe/creative-director-099i2.mjs');
assert.match(creative,/DETERMINISTIC_FALLBACK/);
assert.match(creative,/apiKeyRequired:false/);
assert.match(creative,/allowLocalAI/);
assert.doesNotMatch(creative,/OPENAI_API_KEY|ANTHROPIC_API_KEY|GEMINI_API_KEY/);

const html=read('public/universe-builder.html'),builder=read('public/js/universe-builder.js');
assert.match(html,/INTELLIGENT PROCEDURAL EXPERIENCE ENGINE|GAME-SOURCED VISUAL COMPOSITION|THREE-STAGE UNIVERSE PRODUCTION PIPELINE|Universe Builder|CONTEÚDO/);
assert.match(html,/id="visualDensity"/);
assert.match(html,/RICH/);
assert.match(html,/id="interactionElement"/);
assert.match(html,/id="interactionEvent"/);
assert.match(html,/id="interactionAction"/);
assert.match(html,/id="interactionTarget"/);
assert.match(html,/id="creativeDirector"/);
assert.match(builder,/loadExperienceEditor/);
assert.match(builder,/saveVisualPolicyI2/);
assert.match(builder,/addInteractionI2/);
assert.match(builder,/applyInteractionPresetI2/);
assert.match(builder,/creativeDirectorI2/);

const visualI2=read('public/js/visual-grounding-099i2.js'),runtime=read('public/js/universe-interaction-engine-099i2.js'),universeRuntime=read('public/js/universe-runtime-099.js'),gameHtml=read('public/game.html'),css=read('public/css/final-foundation-099.css');
assert.match(visualI2,/SPARSE.*BALANCED.*RICH.*IMMERSIVE/s);
assert.match(visualI2,/LIMIT=\{SPARSE:4,BALANCED:8,RICH:16,IMMERSIVE:24\}/);
assert.match(visualI2,/adaptive|saveData|hardwareConcurrency/);
assert.match(visualI2,/gi099i2-grounding/);
assert.match(runtime,/EVENT_MAP=\{CLICK:'click',HOVER:'pointerenter',FOCUS:'focus'\}/);
for(const action of ['SCROLL_TO','NAVIGATE','SHOW_INFO','OPEN_CHARACTER','OPEN_LOCATION','OPEN_MEDIA','PLAY_ANIMATION','PLAY_SOUND','CHANGE_STATE','REVEAL','HIDE'])assert.match(runtime,new RegExp(action));
assert.match(runtime,/GameIndexMusic\?\.isMuted/);
assert.match(runtime,/AbortController/);
assert.match(universeRuntime,/GameIndexInteractionEngine099I2/);
assert.match(universeRuntime,/data-gi-element-key/);
if(['0.99.5','0.99.6','0.99.6-1','0.99.6-2','0.991.0','0.991.1'].includes(pkg.version)){
  assert.match(universeRuntime,/GameIndexVisualGrounding099I5/);
  assert.match(gameHtml,/visual-grounding-099i5\.js/);
  assert.match(gameHtml,/visual-grounding-099i3\.js/); // safe real-asset-only fallback
  assert.doesNotMatch(gameHtml,/visual-grounding-099i1\.js/);
  assert.doesNotMatch(gameHtml,/visual-grounding-099i2\.js/);
  assert.match(gameHtml,/universe-interaction-engine-099i2\.js/);
}else if(pkg.version==='0.99.4'){
  assert.match(universeRuntime,/GameIndexVisualGrounding099I4/);
  assert.match(gameHtml,/visual-grounding-099i4\.js/);
  assert.match(gameHtml,/visual-grounding-099i3\.js/); // safe real-asset-only fallback
  assert.doesNotMatch(gameHtml,/visual-grounding-099i1\.js/);
  assert.doesNotMatch(gameHtml,/visual-grounding-099i2\.js/);
  assert.match(gameHtml,/universe-interaction-engine-099i2\.js/);
}else if(pkg.version==='0.99.3'){
  assert.match(universeRuntime,/GameIndexVisualGrounding099I3/);
  assert.match(gameHtml,/visual-grounding-099i3\.js/);
  assert.doesNotMatch(gameHtml,/visual-grounding-099i1\.js/);
  assert.doesNotMatch(gameHtml,/visual-grounding-099i2\.js/);
  assert.match(gameHtml,/universe-interaction-engine-099i2\.js/);
}else{
  assert.match(universeRuntime,/GameIndexVisualGrounding099I2/);
  assert.match(gameHtml,/visual-grounding-099i1\.js\?v=099i2experienceengine/);
  assert.match(gameHtml,/visual-grounding-099i2\.js\?v=099i2experienceengine/);
  assert.match(gameHtml,/universe-interaction-engine-099i2\.js\?v=099i2experienceengine/);
}
assert.match(css,/gi099i2-section-accent/);
assert.match(css,/prefers-reduced-motion:reduce/);

const routes=read('src/api/beta099-routes.mjs'),server=read('server.mjs');
assert.match(routes,/builderClassification:"(?:INTELLIGENT_PROCEDURAL_EXPERIENCE_ENGINE|THREE_STAGE_UNIVERSE_PRODUCTION_PIPELINE|INTELLIGENT_PRODUCTION_CONSOLIDATION_I5|UNIVERSE_BUILDER_EXPERIENCE_4_0_I6)"/);
assert.match(routes,/visual-policy/);
assert.match(routes,/interaction-presets/);
assert.match(routes,/creative-director/);
assert.match(routes,/noApiKey:true/);
assert.match(server,/version:"0\.99-I[23456]"|INTERNAL_RELEASE/);
assert.match(server,/BETA_0_99_I2_INTELLIGENT_PROCEDURAL_EXPERIENCE_ENGINE|BETA_0_99_I3_GAME_SOURCED_VISUAL_COMPOSITION|BETA_0_99_I4_THREE_STAGE_UNIVERSE_PRODUCTION_PIPELINE|BETA_0_99_I5_PRODUCTION_CONSOLIDATION|BETA_0_99_I6_UNIVERSE_BUILDER_EXPERIENCE|INTERNAL_RELEASE_CODE/);

// Build an exact schema-34/I1 database with user content, then migrate the same file to I2.
const temp=mkdtempSync(path.join(tmpdir(),'gameindex-099i2-')),dbFile=path.join(temp,'gamevault.sqlite');
try{
  const stage34=`
    const c=await import('./src/database/connection.mjs');c.migrateDatabase();
    const g=await import('./src/database/repositories/game-repository.mjs');
    const id=await import('./src/identity/experience-identity-service.mjs');
    const roblox=g.upsertGame({name:'Roblox',slug:'roblox-i2-test',status:'PUBLISHED'});
    const blox=g.upsertGame({name:'Blox Fruits',slug:'blox-fruits-i2-test',status:'PUBLISHED',franchise:'Roblox'});
    g.setGameEntityClassification(blox.id,{entityType:'EXPERIENCE',parentGameId:roblox.id,relationshipType:'EXPERIENCE_OF'});
    id.setIdentityProfile(blox.id,{themeKey:'blox-fruits-adventure',motifs:['BLOX_FRUIT'],status:'APPROVED'});
    c.db.prepare(\"INSERT INTO meta(key,value) VALUES('i2_preserve_probe','kept') ON CONFLICT(key) DO UPDATE SET value='kept'\").run();
    console.log(JSON.stringify({schema:c.schemaVersion(),roblox:roblox.id,blox:blox.id,probe:c.db.prepare(\"SELECT value FROM meta WHERE key='i2_preserve_probe'\").get()?.value}));
  `;
  const before=lastJson(run(['--input-type=module','-e',stage34],{GAMEINDEX_DB:dbFile,GAMEINDEX_DATA_DIR:temp,GAMEINDEX_TARGET_SCHEMA:'34'}));
  assert.equal(before.schema,34);assert.equal(before.probe,'kept');

  const stage35=`
    const c=await import('./src/database/connection.mjs');c.migrateDatabase();
    const g=await import('./src/database/repositories/game-repository.mjs');
    const id=await import('./src/identity/experience-identity-service.mjs');
    const ui=await import('./src/interactions/universe-interaction-service.mjs');
    const ub=await import('./src/universe/universe-builder-099.mjs');
    const cd=await import('./src/universe/creative-director-099i2.mjs');
    const us=await import('./src/universe/universe-structure-service.mjs');
    const blox=g.getGameBySlug('blox-fruits-i2-test');
    const identity=id.resolveIdentityProfile(blox.id);
    const richBefore=identity.visualDensity;
    id.setVisualPolicy(blox.id,{visualDensity:'BALANCED',visualPolicy:{continuity:true,adaptivePerformance:true,maxAnimatedMotifs:3}});
    const updated=id.resolveIdentityProfile(blox.id);
    const presetCount=ui.interactionPresetsForEntity(blox.id).length;
    const binding=ui.upsertUniverseInteraction({entityGameId:blox.id,elementKey:'MOTIF:JOLLY_ROGER',elementRole:'NAVIGATION',eventType:'CLICK',actionType:'SCROLL_TO',targetType:'PAGE',targetId:'OVERVIEW',parameters:{label:'Open overview'},status:'PUBLISHED',source:'MANUAL'});
    let badEvent=false,badNavigate=false,badScript=false;
    try{ui.validateUniverseInteraction({elementKey:'X',eventType:'DBLCLICK',actionType:'OPEN',targetType:'NONE'});}catch{badEvent=true;}
    try{ui.validateUniverseInteraction({elementKey:'X',eventType:'CLICK',actionType:'NAVIGATE',targetType:'PAGE',targetId:'https://example.com'});}catch{badNavigate=true;}
    try{ui.validateUniverseInteraction({elementKey:'X',eventType:'CLICK',actionType:'SHOW_INFO',targetType:'NONE',parameters:{message:'javascript:alert(1)'}});}catch{badScript=true;}
    const context=ub.universeBuilderContext(blox);
    const review=await cd.creativeDirectorReview(blox,{allowLocalAI:false});
    const publicUniverse=us.publicEntityUniverse(blox.id);
    const cols=c.db.prepare('PRAGMA table_info(entity_identity_profiles)').all().map(x=>x.name);
    const table=Boolean(c.db.prepare(\"SELECT name FROM sqlite_master WHERE type='table' AND name='universe_interaction_bindings'\").get());
    console.log(JSON.stringify({schema:c.schemaVersion(),id:blox.id,parent:blox.parentGameId,probe:c.db.prepare(\"SELECT value FROM meta WHERE key='i2_preserve_probe'\").get()?.value,richBefore,density:updated.visualDensity,continuity:updated.visualPolicy.continuity,maxAnimatedMotifs:updated.visualPolicy.maxAnimatedMotifs,presetCount,binding,badEvent,badNavigate,badScript,context:{classification:context.builderClassification,layers:context.engineLayers,noApiKey:context.researchProfile.noApiKey},review:{mode:review.mode,apiKeyRequired:review.apiKeyRequired,localAIInvoked:review.localAIInvoked,count:review.suggestions.length},publicBindings:publicUniverse.interactionBindings.map(x=>x.id),cols,table}));
  `;
  const after=lastJson(run(['--input-type=module','-e',stage35],{GAMEINDEX_DB:dbFile,GAMEINDEX_DATA_DIR:temp,GAMEINDEX_TARGET_SCHEMA:'35'}));
  assert.equal(after.schema,35);
  assert.equal(after.id,before.blox,'I1 entity ID must survive the additive I2 migration');
  assert.equal(after.probe,'kept','I1 data must survive the additive I2 migration');
  assert.equal(after.richBefore,'RICH');
  assert.equal(after.density,'BALANCED');
  assert.equal(after.continuity,true);
  assert.equal(after.maxAnimatedMotifs,3);
  assert.ok(after.presetCount>=2);
  assert.equal(after.binding.status,'PUBLISHED');
  assert.equal(after.badEvent,true);
  assert.equal(after.badNavigate,true);
  assert.equal(after.badScript,true);
  assert.ok(['INTELLIGENT_PROCEDURAL_EXPERIENCE_ENGINE','THREE_STAGE_UNIVERSE_PRODUCTION_PIPELINE','INTELLIGENT_PRODUCTION_CONSOLIDATION_I5','UNIVERSE_BUILDER_EXPERIENCE_4_0_I6'].includes(after.context.classification));
  assert.ok(after.context.layers.includes('INTERACTIVE_UNIVERSE_ENGINE'));
  assert.equal(after.context.noApiKey,true);
  assert.equal(after.review.mode,'DETERMINISTIC');
  assert.equal(after.review.apiKeyRequired,false);
  assert.equal(after.review.localAIInvoked,false);
  assert.ok(after.review.count>=2);
  assert.ok(after.publicBindings.includes(after.binding.id));
  assert.ok(after.cols.includes('visual_density')&&after.cols.includes('visual_policy_json'));
  assert.equal(after.table,true);
}finally{rmSync(temp,{recursive:true,force:true});}

console.log(JSON.stringify({ok:true,release:'0.99-I2',schema:35,builderClassification:'INTELLIGENT_PROCEDURAL_EXPERIENCE_ENGINE',interactiveUniverseEngine:true,visualGrounding2:true,defaultVisualDensity:'RICH',creativeDirector:'OPTIONAL_LOCAL_AI_WITH_DETERMINISTIC_FALLBACK',localFirstNoApiKey:true,i1Regression:true,browserAutomation:false,azureLive:false},null,2));
