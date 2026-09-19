import assert from 'node:assert/strict';
import {mkdtempSync, readFileSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=rel=>readFileSync(path.join(root,rel),'utf8');
function run(args,env={}){const r=spawnSync(process.execPath,args,{cwd:root,encoding:'utf8',env:{...process.env,...env}});if(r.status!==0)throw new Error(`command failed: node ${args.join(' ')}\nSTDOUT:\n${r.stdout}\nSTDERR:\n${r.stderr}`);return r.stdout;}

// First preserve the full Beta 0.99 regression suite.
run(['tests/beta099-final-foundation.mjs']);

const html=read('public/universe-builder.html'),ub=read('public/js/universe-builder.js'),routes=read('src/api/beta099-routes.mjs');
assert.match(html,/universe-builder\.js\?v=(?:099i(?:1visualgrounding|2experienceengine|3gamesourced|4pipeline)|099i5|099i6)" defer/,'Universe Builder must wait for the deferred shell runtime');
assert.match(ub,/optgroup label="GAMES"/);
assert.match(ub,/optgroup label="EXPERIENCES"/);
assert.match(ub,/Experience ·/);
assert.match(ub,/GAMEINDEX_SHELL_NOT_READY/);
assert.match(ub,/Could not load Game \/ Experience selector/);
assert.match(routes,/selectorReady/);
assert.match(routes,/counts=\{games:/);
assert.match(routes,/entityType/);

const recommendation=read('src/recommendations/recommendation-service.mjs');
assert.match(recommendation,/entityType\|\|"GAME"/);
assert.match(recommendation,/toUpperCase\(\)===\"GAME\"/);
const repo=read('src/database/repositories/game-repository.mjs');
assert.match(repo,/entity_type='GAME'/);
assert.match(repo,/gameCount\(\{entityType="GAME"\}/);

const visual=read('public/js/visual-grounding-099i1.js'),css=read('public/css/final-foundation-099.css'),runtime=read('public/js/universe-runtime-099.js'),identitySource=read('src/identity/experience-identity-service.mjs');
for(const motif of ['JOLLY_ROGER','GAME_PIZZA','GAME_PIZZA_BOX','FISCH_FISH','FISHING_HOOK','DOOR_FRAME','ROOM_NUMBER','PRISON_BAR','SECURITY_LIGHT'])assert.match(visual,new RegExp(motif));
assert.match(css,/gi099i1-decorative-layer/);
assert.match(css,/pointer-events:none/);
assert.match(css,/@media\(max-width:700px\)/);
assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
assert.match(runtime,/GameIndexVisualGrounding099I(?:1|3)/);
assert.match(identitySource,/VISUAL_GROUNDING_BY_THEME/);
assert.match(identitySource,/"blox-fruits-adventure"[\s\S]*JOLLY_ROGER/);
assert.match(identitySource,/"pizza-place-workshop"[\s\S]*GAME_PIZZA/);
assert.match(identitySource,/"fisch-aquatic"[\s\S]*FISHING_HOOK/);
assert.match(identitySource,/"doors-corridor"[\s\S]*DOOR_FRAME/);
assert.match(identitySource,/"prison-life-2016"[\s\S]*PRISON_BAR/);

// Dynamic schema/runtime check: top-level discovery excludes Experience while Search/identity still retain it.
const temp=mkdtempSync(path.join(tmpdir(),'gameindex-099i1-')),dbFile=path.join(temp,'gamevault.sqlite');
try{
  const code=`
    const c=await import('./src/database/connection.mjs');c.migrateDatabase();
    const g=await import('./src/database/repositories/game-repository.mjs');
    const r=g.upsertGame({name:'Roblox',slug:'roblox',status:'PUBLISHED',genres:['Platform']});
    const m=g.upsertGame({name:'Minecraft',slug:'minecraft',status:'PUBLISHED',genres:['Sandbox']});
    const b=g.upsertGame({name:'Blox Fruits',slug:'blox-fruits',status:'PUBLISHED',genres:['Experience'],franchise:'Roblox'});
    g.setGameEntityClassification(b.id,{entityType:'EXPERIENCE',parentGameId:r.id,relationshipType:'EXPERIENCE_OF'});
    const rec=await import('./src/recommendations/recommendation-service.mjs');
    const search=await import('./src/api/search.mjs');
    const id=await import('./src/identity/experience-identity-service.mjs');
    id.setIdentityProfile(b.id,{themeKey:'blox-fruits-adventure',motifs:['BLOX_FRUIT'],status:'APPROVED'});
    console.log(JSON.stringify({catalog:rec.discoveryGamesPage({limit:50}).entries.map(x=>x.slug),recommend:rec.recommendGames({limit:20}).entries.map(x=>x.game.slug),search:search.searchGameVault('Blox Fruits',{limit:10}).results.map(x=>({title:x.title,type:x.type})),identity:id.resolveIdentityProfile(b.id)}));
  `;
  const out=run(['--input-type=module','-e',code],{GAMEINDEX_DB:dbFile,GAMEINDEX_DATA_DIR:temp,GAMEINDEX_TARGET_SCHEMA:'34'}).trim().split('\n').filter(Boolean).at(-1);
  const result=JSON.parse(out);
  assert.deepEqual(new Set(result.catalog),new Set(['minecraft','roblox']));
  assert.equal(result.recommend.includes('blox-fruits'),false);
  assert.ok(result.search.some(x=>x.title==='Blox Fruits'&&x.type==='EXPERIENCE'));
  assert.ok(result.identity.visualGrounding?.motifs?.includes('JOLLY_ROGER'));
}finally{rmSync(temp,{recursive:true,force:true});}

const pkg=JSON.parse(read('package.json'));
assert.ok(['0.99.1','0.99.2','0.99.3','0.99.4','0.99.5','0.99.6','0.99.6-1','0.99.6-2','0.991.0'].includes(pkg.version));
assert.ok(['gameindex-beta-099-i1-foundation-correction-visual-grounding','gameindex-beta-099-i2-intelligent-procedural-experience-engine','gameindex-beta-099-i3-game-sourced-visual-composition','gameindex-beta-099-i4-three-stage-universe-production-pipeline','gameindex-beta-099-i5-production-consolidation','gameindex-beta-099-i6-universe-builder-experience','gameindex-beta-099-i6-hf1-build-reliability','gameindex-beta-099-i6-hf2-launch-visual-rebrand','gameindex-beta-0991-full-experience'].includes(pkg.name));
assert.ok(['node tests/beta099-i1-foundation-correction.mjs','node tests/beta099-i2-intelligent-procedural-experience-engine.mjs','node tests/beta099-i3-game-sourced-visual-composition.mjs','node tests/beta099-i4-three-stage-universe-production-pipeline.mjs','node tests/beta099-i5-production-consolidation.mjs','node tests/beta099-i6-universe-builder-experience.mjs','node tests/beta099-i6-hf1-build-reliability.mjs','node tests/beta099-i6-hf2-launch-rebrand.mjs','node tests/beta0991-full-experience.mjs'].includes(pkg.scripts.test));
const server=read('server.mjs');
assert.match(server,/0\.99-I[123456]/);
assert.match(server,/BETA_0_99_I1_FOUNDATION_CORRECTION_VISUAL_GROUNDING|BETA_0_99_I2_INTELLIGENT_PROCEDURAL_EXPERIENCE_ENGINE|BETA_0_99_I3_GAME_SOURCED_VISUAL_COMPOSITION|BETA_0_99_I4_THREE_STAGE_UNIVERSE_PRODUCTION_PIPELINE|BETA_0_99_I5_PRODUCTION_CONSOLIDATION|BETA_0_99_I6_UNIVERSE_BUILDER_EXPERIENCE|INTERNAL_RELEASE_CODE/);
assert.match(read('public/game.html'),/visual-grounding-099i(?:1|3|4|5)\.js/);

console.log(JSON.stringify({ok:true,release:'0.99-I1',schemaChanged:false,selectorFixed:true,gameExperienceCatalogSeparated:true,searchKeepsExperiences:true,directGameVisualGrounding:true,profiles:['Blox Fruits','DOORS','Fisch','Work at a Pizza Place','Prison Life'],browserAutomation:false,azureLive:false},null,2));
