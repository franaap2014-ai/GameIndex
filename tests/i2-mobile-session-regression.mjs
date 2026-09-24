import assert from 'node:assert/strict';
import {mkdtempSync,rmSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import dns from 'node:dns/promises';
const temp=mkdtempSync(path.join(tmpdir(),'gi-i2-'));
Object.assign(process.env,{GAMEINDEX_DB:path.join(temp,'test.sqlite'),GAMEINDEX_DATA_DIR:temp,DATABASE_URL:'',GAMEINDEX_DATABASE_URL:'',GAMEINDEX_TARGET_SCHEMA:'47',NODE_ENV:'test'});
for(const k of ['RENDER','RENDER_SERVICE_ID','RENDER_EXTERNAL_HOSTNAME','WEBSITE_SITE_NAME','WEBSITE_INSTANCE_ID','WEBSITE_HOSTNAME'])delete process.env[k];
const {initializeDatabase}=await import('../src/database/seed.mjs');initializeDatabase();
const {db}=await import('../src/database/connection.mjs');
const {createUser}=await import('../src/database/repositories/user-repository.mjs');
const {ensureProfile}=await import('../src/database/repositories/profile-repository.mjs');
const cine=await import('../src/identity/cinematic-service.mjs');
const builder=await import('../src/universe/universe-builder-099.mjs');
const {getGameBySlug}=await import('../src/database/repositories/game-repository.mjs');
let passed=0;async function test(name,fn){await fn();console.log('PASS',name);passed++;}
const oldFetch=globalThis.fetch,oldLookup=dns.lookup;
try{
 const user='i2-test-user';createUser({id:user,email:'i2@example.test',displayName:'Player',passwordHash:'test',passwordSalt:'test'});ensureProfile(user,{preferredUsername:'mobile_player'});
 let event;
 await test('welcome includes profile username and is not repeated in the same session',()=>{event=cine.cinematicQueueForUser(user,{sessionKey:'device-a'}).queue.find(e=>e.eventType==='WELCOME');assert.equal(event.username,'mobile_player');cine.startAccountCinematic(user,event.eventKey,{sessionKey:'device-a'});cine.completeAccountCinematic(user,event.eventKey,{sessionKey:'device-a'});assert.equal(cine.cinematicQueueForUser(user,{sessionKey:'device-a'}).queue.filter(e=>e.eventType==='WELCOME').length,0);});
 await test('new login gets a new welcome; cannot complete another session event',()=>{const next=cine.cinematicQueueForUser(user,{sessionKey:'device-b'}).queue.find(e=>e.eventType==='WELCOME');assert.ok(next);assert.notEqual(next.eventKey,event.eventKey);assert.throws(()=>cine.completeAccountCinematic(user,next.eventKey,{sessionKey:'device-a'}),/UNKNOWN/);});
 const source=readFileSync(new URL('../public/js/shell-0986.js',import.meta.url),'utf8');
 const music=source.slice(source.indexOf('(function gameIndexMusic0987()'));
 const memory=()=>{const m=new Map();return {getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k)};};
 const listeners={},storage=memory();let settings,plays=0,pauses=0;const nodes=new Map();
 const node=()=>({hidden:false,isConnected:true,replaceChildren(){},addEventListener(){},setAttribute(){},dataset:{},querySelector(){return null;}});
 for(const id of ['gameIndexSoundToggle','giMusicPlayerSurface'])nodes.set(id,node());
 const context=vm.createContext({window:{dispatchEvent(){},YT:{Player:function(el,opts){settings=opts;this.getCurrentTime=()=>42.25;this.pauseVideo=()=>pauses++;this.playVideo=()=>plays++;this.unMute=()=>{};this.mute=()=>{};this.setVolume=()=>{};this.setLoop=()=>{};}}},document:{getElementById:id=>nodes.get(id)||null,createElement:node,addEventListener:(name,fn)=>listeners[name]=fn,hidden:false},location:{pathname:'/settings.html',search:'',origin:'https://example.test'},localStorage:memory(),sessionStorage:storage,AbortController,clearTimeout,URLSearchParams,CustomEvent:function(){},addEventListener:(name,fn)=>listeners[name]=fn,setInterval(){},setTimeout(){},console,fetch:async()=>({ok:true,json:async()=>({profile:{youtubeVideoId:'abcdefghijk'}})})});
 storage.setItem('gi_audio_enabled','1');storage.setItem('gi_audio_resume',JSON.stringify({videoId:'abcdefghijk',time:37.5,at:Date.now()}));vm.runInContext(music,context);await new Promise(r=>setImmediate(r));
 await test('menu routes use home music while Roblox child keeps its own context',()=>{for(const route of ['/settings.html','/profile.html','/social.html']){context.location.pathname=route;assert.equal(context.window.GameIndexMusic.contextFromLocation().type,'home');}context.location.pathname='/game/roblox/blox-fruits';assert.equal(context.window.GameIndexMusic.contextFromLocation().slug,'blox-fruits');});
 await test('player resumes saved position and saves current position on navigation',()=>{assert.equal(settings.playerVars.start,37);listeners.pagehide();assert.equal(JSON.parse(storage.getItem('gi_audio_resume')).time,42.25);});
 await test('manual pause remains paused after visibility changes',()=>{const pausedBefore=pauses;settings.events.onStateChange({data:1});context.window.GameIndexMusic.togglePlay();assert.equal(storage.getItem('gi_audio_enabled'),'0');assert.equal(pauses,pausedBefore+1);const before=plays;listeners.visibilitychange();assert.equal(plays,before);});
 await test('autoplay blocking produces an explicit recoverable state',()=>{settings.events.onAutoplayBlocked();assert.equal(context.window.GameIndexMusic.getState().musicState,'BLOCKED_BY_AUTOPLAY');});
 await test('Construir requeues persisted incomplete research without duplicating job',async()=>{
  const game=getGameBySlug('blox-fruits'),build=builder.createFoundationBuild(game.id,{userId:user});
  db.prepare("UPDATE universe_builds SET status='PARTIAL',error_code='RESEARCH_INCOMPLETE' WHERE id=?").run(build.id);db.prepare("UPDATE universe_build_job_state SET state='PARTIAL' WHERE build_id=?").run(build.id);
  globalThis.fetch=async()=>new Response('<html>No results</html>',{headers:{'content-type':'text/html'}});dns.lookup=async()=>[{address:'93.184.216.34',family:4}];
  const resumed=builder.startFoundationBuild(game.id,{userId:user});assert.equal(resumed.id,build.id);assert.equal(resumed.status,'QUEUED');assert.equal(resumed.errorCode,'');assert.equal(builder.startFoundationBuild(game.id,{userId:user}).id,build.id);
  const deadline=Date.now()+15000;while(['QUEUED','RUNNING'].includes(builder.getFoundationBuild(build.id).status)&&Date.now()<deadline)await new Promise(r=>setTimeout(r,10));
  assert.equal(builder.getFoundationBuild(build.id).status,'PARTIAL');assert.equal(db.prepare('SELECT COUNT(*) n FROM universe_builds WHERE entity_game_id=?').get(game.id).n,1);assert.ok(db.prepare("SELECT 1 FROM universe_build_events WHERE build_id=? AND event_type='BUILD_RESUME_REQUESTED'").get(build.id));
 });
 console.log(JSON.stringify({ok:true,passed}));
}finally{globalThis.fetch=oldFetch;dns.lookup=oldLookup;db.close();rmSync(temp,{recursive:true,force:true});}
