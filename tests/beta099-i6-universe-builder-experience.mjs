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
assert.ok(['gameindex-beta-099-i6-universe-builder-experience','gameindex-beta-099-i6-hf1-build-reliability','gameindex-beta-099-i6-hf2-launch-visual-rebrand','gameindex-beta-0991-full-experience'].includes(pkg.name));
assert.ok(['0.99.6','0.99.6-1','0.99.6-2','0.991.0'].includes(pkg.version));
assert.ok(['node tests/beta099-i6-universe-builder-experience.mjs','node tests/beta099-i6-hf1-build-reliability.mjs','node tests/beta099-i6-hf2-launch-rebrand.mjs','node tests/beta0991-full-experience.mjs'].includes(pkg.scripts.test));
assert.equal(pkg.engines.node,'>=22.13');

const release=read('src/config/release-099i6.mjs');
assert.match(release,/PUBLIC_VERSION="(?:0\.99|0\.991)"/);assert.match(release,/INTERNAL_RELEASE="(?:0\.99-I6(?:-HF[12])?|0\.991)"/);assert.match(release,/TARGET_SCHEMA=(?:39|40)/);assert.match(release,/LOCAL_FIRST_NO_API_KEY/);
const migration=read('src/database/migrations/039_beta_099_i6.sql');
for(const table of ['visual_identity_motifs','visual_identity_assets','interaction_concepts','interaction_prototypes','authorization_queue','enhancement_runs','enhancement_passes','build_revision_state'])assert.match(migration,new RegExp(`CREATE TABLE IF NOT EXISTS ${table}`));
assert.match(migration,/0\.99-I6(?:-HF[12])?/);assert.match(migration,/public_version','0\.99/);

const service=read('src/universe/universe-builder-experience-099i6.mjs');
for(const token of ['discoverVisualIdentityMotifsI6','discoverInteractionConceptsI6','generateInteractionPreviewI6','rebuildInteractionPreviewI6','approveInteractionConceptI6','listAuthorizationQueueI6','runEnhancementI6','syncBuildRevisionStateI6','publicUniverseEnhancementsI6'])assert.match(service,new RegExp(token));
for(const token of ['SYMBOL','ITEM','WEAPON','FACTION','ABILITY','ROLL','SHOP','FISH','OPEN','ASSEMBLE','EXPLORE'])assert.match(service,new RegExp(`"${token}"`));
assert.doesNotMatch(service,/if\s*\([^)]*(?:Blox Fruits|Fisch|DOORS|Pizza Place)/i);
assert.doesNotMatch(service,/eval\s*\(|new Function|<script/i);

const routes=read('src/api/beta099-i6-routes.mjs'),server=read('server.mjs'),beta099=read('src/api/beta099-routes.mjs');
for(const token of ['/i6/motifs/discover','/i6/interaction-concepts/discover','/preview','/rebuild','/approve','/discard','/i6/authorizations','/i6/enhance'])assert.match(routes,new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
assert.match(server,/registerBeta099I6Routes/);assert.match(server,/release-099i6/);assert.match(beta099,/publicUniverseEnhancementsI6/);

const html=read('public/universe-builder.html'),builder=read('public/js/universe-builder.js'),runtime=read('public/js/universe-runtime-099.js');
for(const token of ['Aprimorar','IDENTIDADE VISUAL','PENDENTES DE AUTORIZAÇÃO','Gerar sugestões','INTERAÇÕES DESCOBERTAS','PREVIEW INTERATIVA','Aprovar','Refazer','Descartar'])assert.match(html,new RegExp(token,'i'));
for(const token of ['discoverIdentityI6','discoverInteractionsI6','openInteractionPreviewI6','rebuildInteractionI6','approveInteractionI6','approveSafeI6','startEnhanceI6','renderI6State'])assert.match(builder,new RegExp(token));
assert.match(builder,/Aguardando conteúdo/);assert.match(runtime,/i6MotifMarkup/);assert.match(runtime,/i6ExperienceMarkup/);assert.doesNotMatch(runtime,/eval\s*\(|new Function/);
assert.ok(html.indexOf('id="foundationPublish"')<html.indexOf('id="i4ReportStage"'));

const temp=mkdtempSync(path.join(tmpdir(),'gameindex-099i6-')),dbFile=path.join(temp,'gamevault.sqlite');
try{
  const stage38=`
    const c=await import('./src/database/connection.mjs');c.migrateDatabase();
    const g=await import('./src/database/repositories/game-repository.mjs');
    const us=await import('./src/universe/universe-structure-service.mjs');
    const q=await import('./src/research/research-quality-099i5.mjs');
    const vr=await import('./src/images/visual-asset-registry.mjs');
    const game=g.upsertGame({name:'Universal Interaction Test',slug:'universal-interaction-test',status:'PUBLISHED'});
    const rev=us.createUniverseRevision(game.id,{status:'DRAFT',canonicalLocale:'pt-BR'});
    const facts=[
      'Universal Interaction Test gameplay mechanic lets players roll Fruit through a random chance system during progression and receive different rarity results.',
      'Universal Interaction Test gameplay shop system lets players buy Fruit from a dealer vendor and compare item rarity.',
      'Universal Interaction Test gameplay exploration lets crews use symbols and flags while players travel between islands using boats.',
      'Universal Interaction Test combat gameplay uses swords, abilities and skills as important equipment across islands.',
      'Universal Interaction Test collection system uses an inventory interface that displays Fruit, weapons and collectible equipment.'
    ];
    for(const [i,claim] of facts.entries())q.persistResearchQuality({entityGameId:game.id,revisionId:rev.id,topic:i<2?'GAMEPLAY':'COLLECTIONS',claim,sourceTitle:'Verified guide '+i,sourceQuality:.96,relevance:.96,gameName:game.nome});
    for(const [k,role,motif] of [['FRUIT','ITEM','FRUIT'],['SWORD','WEAPON','SWORD'],['BOAT','VEHICLE','BOAT'],['CREW','SECONDARY_SYMBOL','CREW_SYMBOL']])vr.upsertVisualAsset({entityGameId:game.id,assetKey:'I6_'+k,semanticRole:role==='WEAPON'?'ITEM':role==='VEHICLE'?'ENVIRONMENT_ELEMENT':role,semanticMotif:motif,visualFamily:'I6_TEST',sourceType:'APPROVED_OFFICIAL_ASSET',sourceReference:'official '+motif+' visual',imageUrl:'https://example.com/'+k.toLowerCase()+'.png',approvalStatus:'APPROVED',confidence:.99});
    c.db.prepare("INSERT INTO meta(key,value) VALUES('i6_preserve_probe','kept') ON CONFLICT(key) DO UPDATE SET value='kept'").run();
    console.log(JSON.stringify({schema:c.schemaVersion(),gameId:game.id,revisionId:rev.id,probe:c.db.prepare("SELECT value FROM meta WHERE key='i6_preserve_probe'").get()?.value}));
  `;
  const before=lastJson(run(['--input-type=module','-e',stage38],{GAMEINDEX_DB:dbFile,GAMEINDEX_DATA_DIR:temp,GAMEINDEX_TARGET_SCHEMA:'38'}));
  assert.equal(before.schema,38);assert.equal(before.probe,'kept');

  const stage39=`
    const c=await import('./src/database/connection.mjs');c.migrateDatabase();
    const g=await import('./src/database/repositories/game-repository.mjs');
    const i6=await import('./src/universe/universe-builder-experience-099i6.mjs');
    const game=g.getGameBySlug('universal-interaction-test');
    const rev=c.db.prepare("SELECT id FROM universe_revisions WHERE entity_game_id=? ORDER BY revision_number DESC LIMIT 1").get(game.id);
    const motifs=i6.discoverVisualIdentityMotifsI6(game.id,{revisionId:rev.id,language:'pt-BR'});
    const interactions=i6.discoverInteractionConceptsI6(game.id,{revisionId:rev.id,language:'pt-BR'});
    const roll=interactions.concepts.find(x=>x.category==='ROLL')||interactions.concepts[0];
    const p1=i6.generateInteractionPreviewI6(roll.id);
    const p2=i6.rebuildInteractionPreviewI6(roll.id,{feedbackCode:'TOO_SIMPLE'});
    const approved=i6.approveInteractionConceptI6(roll.id);
    const auth=i6.listAuthorizationQueueI6(game.id,{revisionId:rev.id});
    const state=i6.universeBuilderExperienceStateI6(game.id,{revisionId:rev.id,language:'pt-BR'});
    const pub=i6.publicUniverseEnhancementsI6(game.id,{revisionId:rev.id,language:'pt-BR'});
    console.log(JSON.stringify({schema:c.schemaVersion(),probe:c.db.prepare("SELECT value FROM meta WHERE key='i6_preserve_probe'").get()?.value,runtime:c.db.prepare("SELECT value FROM meta WHERE key='runtime_version'").get()?.value,publicVersion:c.db.prepare("SELECT value FROM meta WHERE key='public_version'").get()?.value,motifs:{total:motifs.motifs.length,approved:motifs.motifs.filter(x=>x.status==='APPROVED').length},concepts:interactions.concepts.map(x=>({id:x.id,category:x.category,title:x.titleText,status:x.status})),preview:{v1:p1.prototype.versionNumber,v2:p2.prototype.versionNumber,sameConcept:p1.concept.id===p2.concept.id,kind:p2.prototype.config.kind},approved:{status:approved.concept.status,binding:approved.binding?.id||null},pending:auth.length,state:{version:state.version,currentStatus:state.revisionState?.currentStatus,motifs:state.current.motifs.total,interactions:state.current.interactions.total},publicRuntime:{motifs:pub.visualIdentityMotifs.length,interactions:pub.interactiveExperiences.length}}));
  `;
  const after=lastJson(run(['--input-type=module','-e',stage39],{GAMEINDEX_DB:dbFile,GAMEINDEX_DATA_DIR:temp,GAMEINDEX_TARGET_SCHEMA:'39'}));
  assert.equal(after.schema,39);assert.equal(after.probe,'kept');assert.ok(['0.99-I6','0.99-I6-HF1','0.99-I6-HF2','0.991'].includes(after.runtime));assert.equal(after.publicVersion,'0.99');
  assert.ok(after.motifs.total>=3);assert.ok(after.motifs.approved>=1);assert.ok(after.concepts.length>=2);assert.ok(after.concepts.some(x=>x.category==='ROLL'));assert.ok(after.concepts.every(x=>x.title));
  assert.equal(after.preview.v1,1);assert.equal(after.preview.v2,2);assert.equal(after.preview.sameConcept,true);assert.ok(after.preview.kind);assert.equal(after.approved.status,'APPROVED');assert.ok(after.approved.binding);assert.ok(['0.99-I6','0.99-I6-HF1','0.99-I6-HF2','0.991'].includes(after.state.version));assert.ok(after.state.motifs>=3);assert.ok(after.state.interactions>=2);assert.ok(after.publicRuntime.motifs>=1);assert.ok(after.publicRuntime.interactions>=1);
}finally{rmSync(temp,{recursive:true,force:true});}

console.log(JSON.stringify({ok:true,release:'0.99-I6',publicVersion:'0.99',schema:39,universeBuilderExperience4:true,visualIdentityMotifEngine:true,interactionDiscovery:true,interactivePreview:true,rebuildLoop:true,authorizationInbox:true,multiPassEnhancement:true,buildStateConsistency:true,localFirstNoApiKey:true,azureLive:false,browserAutomation:false},null,2));
