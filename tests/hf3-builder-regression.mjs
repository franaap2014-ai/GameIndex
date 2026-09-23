import assert from 'node:assert/strict';
import {mkdtempSync,rmSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import dns from 'node:dns/promises';
import vm from 'node:vm';
const temp=mkdtempSync(path.join(tmpdir(),'gi-hf3-'));
Object.assign(process.env,{GAMEINDEX_DB:path.join(temp,'test.sqlite'),GAMEINDEX_DATA_DIR:temp,DATABASE_URL:'',GAMEINDEX_DATABASE_URL:'',GAMEINDEX_TARGET_SCHEMA:'47',NODE_ENV:'test'});
for(const k of ['RENDER','RENDER_SERVICE_ID','RENDER_EXTERNAL_HOSTNAME','WEBSITE_SITE_NAME','WEBSITE_INSTANCE_ID','WEBSITE_HOSTNAME'])delete process.env[k];
const {initializeDatabase}=await import('../src/database/seed.mjs');initializeDatabase();
const {db}=await import('../src/database/connection.mjs');
const {parseSearchResults}=await import('../src/research/source-adapters/public-search.mjs');
const {researchGameVault}=await import('../src/research/orchestrator.mjs');
const {getGameBySlug}=await import('../src/database/repositories/game-repository.mjs');
const {createFoundationBuild,runFoundationBuild}=await import('../src/universe/universe-builder-099.mjs');
const {generatePreviewSnapshot,latestPreviewSnapshot}=await import('../src/universe/universe-production-pipeline-099i4.mjs');
const {generatePreviewSnapshotI5,latestPreviewSnapshotI5}=await import('../src/universe/universe-production-pipeline-099i5.mjs');
const {evaluateBuilderValidationI5}=await import('../src/universe/validation-099i5.mjs');
const {evaluateBuilderValidationI4}=await import('../src/universe/validation-099i4.mjs');
const game=getGameBySlug('blox-fruits');
let passed=0;async function test(name,fn){await fn();console.log('PASS',name);passed++;}
const oldFetch=globalThis.fetch,oldLookup=dns.lookup;
try{
 await test('search parses both attribute orders and preserves percent-encoded targets',()=>{
  const target='https://example.test/wiki/100%25';
  const html=`<a href="//duckduckgo.com/l/?uddg=${encodeURIComponent(target)}" class="result__a">Blox Fruits</a><a class='result__a extra' href='https://example.test/wiki/Blox'>Wiki</a>`;
  assert.deepEqual(parseSearchResults(html).map(x=>x.url),[target,'https://example.test/wiki/Blox']);
 });
 dns.lookup=async()=>[{address:'93.184.216.34',family:4}];
 // Synthetic text only: verifies pipeline plumbing without treating fixture as game facts.
 const fixture='<title>Blox Fruits gameplay mechanics systems guide</title><article><p>Blox Fruits gameplay mechanics systems guide explains how combat abilities and player progression unlock new locations and quests.</p><p>Blox Fruits items collection rarity probability chances are described with inventory categories and rewards for character progression.</p><p>Blox Fruits developer release date platforms experience universe id place id technical information is listed in the game overview.</p><p>Blox Fruits updates changes current mechanics include combat abilities and player progression through the game locations.</p></article>';
 globalThis.fetch=async url=>new Response(String(url).includes('bloxfruitswiki.org')?fixture:'<html>No results</html>',{headers:{'content-type':'text/html'}});
 await test('known wiki sources provide evidence when search has zero links',async()=>{
  const r=await researchGameVault({game,query:'Blox Fruits gameplay mechanics systems guide',intent:'gameplay'});
  assert.ok(r.sources.length);assert.ok(r.validation.accepted.length);assert.ok(r.diagnostics.some(x=>x.code==='SEARCH_EMPTY'));
 });
 await test('empty preview is refused and historical empty snapshots are not READY',()=>{
  assert.throws(()=>generatePreviewSnapshot(game.id),e=>e.code==='PREVIEW_CONTENT_REQUIRED');assert.throws(()=>generatePreviewSnapshotI5(game.id),e=>e.code==='PREVIEW_CONTENT_REQUIRED');
  db.prepare("INSERT INTO universe_preview_snapshots(id,entity_game_id,viewport_mode,status,content_version,image_version,interaction_version,visual_gap_score,snapshot_json,error_json,created_at,updated_at) VALUES(? ,?,'DESKTOP','READY','','','',0,?,'{}',datetime('now'),datetime('now'))").run('old-empty',game.id,JSON.stringify({structure:{pages:[]}}));
  assert.equal(latestPreviewSnapshot(game.id).status,'FAILED');assert.equal(latestPreviewSnapshotI5(game.id).status,'FAILED');assert.notEqual(evaluateBuilderValidationI5(game.id,{persist:false}).domains.PREVIEW_STATUS,'READY');
  const v=evaluateBuilderValidationI4(game.id,{persist:false});assert.equal(v.domains.PREVIEW_STATUS,'NOT_STARTED');assert.equal(v.publicationAllowed,false);
 });
 await test('Blox Fruits build generates structured pages from fetched validated evidence',async()=>{
  const b=createFoundationBuild(game.id);const result=await runFoundationBuild(b.id);
  assert.ok(['COMPLETED','PARTIAL'].includes(result.status),JSON.stringify(result));assert.ok(result.metrics.pagesCreated>0,JSON.stringify(result));assert.ok(result.metrics.factsExtracted>0);assert.notEqual(result.errorCode,'RESEARCH_INCOMPLETE');
 });
 await test('unavailable sources remain blocked with useful diagnostics',async()=>{
  globalThis.fetch=async()=>{throw new Error('test network unavailable');};
  const r=await researchGameVault({game,query:'Blox Fruits gameplay'});assert.equal(r.sources.length,0);assert.ok(r.diagnostics.some(x=>x.code==='SEARCH_UNAVAILABLE'));assert.ok(r.diagnostics.some(x=>x.code==='SOURCE_UNAVAILABLE'));
 });
 await test('Aprimorar resumes incomplete build; valid build opens dialog',async()=>{
  const source=readFileSync(new URL('../public/js/universe-builder.js',import.meta.url),'utf8');
  const action=source.slice(source.indexOf('async function dispatchUniverseAction('),source.indexOf('function bindUniverseBuilder('));
  let resumed=0,opened=0;const U={game:game.id,foundationBuildId:'failed',i6:{current:{valid:false}}};
  const ctx=vm.createContext({U,notify(){},resumeFoundationI6:async()=>resumed++,startFoundation099:async()=>assert.fail('must resume'),$:()=>({showModal(){opened++;}}),buttonBusy(){}});
  vm.runInContext(action,ctx);await ctx.dispatchUniverseAction({dataset:{ubAction:'enhance'},disabled:false});assert.equal(resumed,1);U.i6.current.valid=true;await ctx.dispatchUniverseAction({dataset:{ubAction:'enhance'},disabled:false});assert.equal(opened,1);
 });
 await test('legacy runtime preserves shell logo/navigation and binds home once',()=>{
  const listeners={},bound=[];
  const brand={dataset:{},addEventListener(type,fn){bound.push(type);},set innerHTML(value){assert.fail('legacy runtime replaced logo');}};
  const document={documentElement:{dataset:{}},body:{dataset:{}},querySelectorAll(selector){return selector==='.gi-brand-lockup'?[brand]:[];},querySelector(){return {};},getElementById(){return null;}};
  const context=vm.createContext({window:{},document,location:{pathname:'/',href:'https://example.test/',origin:'https://example.test'},sessionStorage:{getItem(){return null;},setItem(){}},addEventListener(type,fn){listeners[type]=fn;},URL});
  vm.runInContext(readFileSync(new URL('../public/js/gameindex-0991-i1.js',import.meta.url),'utf8'),context);
  listeners['gv:shell-ready']();assert.deepEqual(bound,['click']);
 });
 console.log(JSON.stringify({ok:true,passed}));
}finally{globalThis.fetch=oldFetch;dns.lookup=oldLookup;db.close();rmSync(temp,{recursive:true,force:true});}
