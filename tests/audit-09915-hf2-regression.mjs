import assert from 'node:assert/strict';
import {mkdtempSync,rmSync,unlinkSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import dns from 'node:dns/promises';
const temp=mkdtempSync(path.join(tmpdir(),'gi-hf2-audit-'));
process.env.GAMEINDEX_DB=path.join(temp,'audit.sqlite');process.env.GAMEINDEX_DATA_DIR=temp;
process.env.DATABASE_URL='';process.env.GAMEINDEX_DATABASE_URL='';process.env.GAMEINDEX_TARGET_SCHEMA='46';process.env.NODE_ENV='test';
for(const k of ['RENDER','RENDER_SERVICE_ID','RENDER_EXTERNAL_HOSTNAME','WEBSITE_SITE_NAME','WEBSITE_INSTANCE_ID','WEBSITE_HOSTNAME'])delete process.env[k];
const {initializeDatabase}=await import('../src/database/seed.mjs');initializeDatabase();
const {db,schemaVersion,avatarsDir,migrateDatabase}=await import('../src/database/connection.mjs');
const passed=[];async function test(name,fn){await fn();passed.push(name);console.log('PASS',name);}
try{
 await test('schema 46 to 47 preserves existing rows and integrity',()=>{const count=db.prepare('SELECT COUNT(*) n FROM games').get().n;assert.equal(schemaVersion(),46);process.env.GAMEINDEX_TARGET_SCHEMA='47';migrateDatabase();assert.equal(db.prepare('SELECT COUNT(*) n FROM games').get().n,count);assert.equal(schemaVersion(),47);assert.equal(db.prepare('PRAGMA integrity_check').get().integrity_check,'ok');});
 const auth=await import('../src/auth/auth-service.mjs');
 await test('malformed cookie does not crash authentication',()=>assert.equal(auth.currentAuth({headers:{cookie:'other=%E0%A4%A; gv_session=%'} }),null));
 const {rateLimit}=await import('../src/security/rate-limit.mjs');
 await test('spoofed XFF cannot reset rate limiter',()=>{const limit=rateLimit({name:'audit',max:1});let status=200,next=0;const res={setHeader(){},status(n){status=n;return this;},json(){}};for(let n=0;n<2;n++)limit({ip:'198.51.100.1',headers:{'x-forwarded-for':String(n)}},res,()=>next++);assert.equal(next,1);assert.equal(status,429);});
 const {requireSameOriginMutation}=await import('../src/access/capability-service.mjs');
 await test('same-origin empty DELETE accepted; cross-origin denied',()=>{let next=0,status=200;const res={status(n){status=n;return this;},json(){}};requireSameOriginMutation({method:'DELETE',headers:{host:'example.test',origin:'https://example.test'}},res,()=>next++);assert.equal(next,1);requireSameOriginMutation({method:'DELETE',headers:{host:'example.test',origin:'https://evil.test'}},res,()=>next++);assert.equal(next,1);assert.equal(status,403);});
 const {assertPublicUrl,fetchPublicBinary}=await import('../src/security/url-safety.mjs');
 await test('mapped/private network targets rejected',async()=>{for(const u of ['http://127.0.0.1','http://100.64.0.1','http://[::ffff:ac10:1]','http://[::ffff:a9fe:a9fe]','http://[fe90::1]'])await assert.rejects(assertPublicUrl(u));});
 await test('binary stream cancelled at byte limit',async()=>{const oldFetch=globalThis.fetch,lookup=dns.lookup;let cancelled=false;dns.lookup=async()=>[{address:'93.184.216.34',family:4}];globalThis.fetch=async()=>new Response(new ReadableStream({pull(c){c.enqueue(new Uint8Array(1024));},cancel(){cancelled=true;}}),{headers:{'content-type':'image/png'}});try{await assert.rejects(fetchPublicBinary('https://example.test/image',{maxBytes:1500}),/limite/);assert.equal(cancelled,true);}finally{globalThis.fetch=oldFetch;dns.lookup=lookup;}});
 const {createUser}=await import('../src/database/repositories/user-repository.mjs');const {ensureProfile}=await import('../src/database/repositories/profile-repository.mjs');
 const users=['audit-user-a','audit-user-b','audit-user-c'];for(const id of users){createUser({id,email:id+'@example.test',displayName:id,passwordHash:'test',passwordSalt:'test'});ensureProfile(id);}
 const social=await import('../src/database/repositories/social-repository.mjs');const lab=await import('../src/social/social-lab-service.mjs');
 await test('legacy friendships and follows respect blocking',()=>{social.followUser(users[0],users[1]);lab.blockUser(users[1],users[0]);assert.equal(social.isUserFollowing(users[0],users[1]),false);assert.throws(()=>social.requestFriend(users[0],users[1]),/interagir/);assert.throws(()=>social.followUser(users[0],users[1]),/interagir/);});
 const game=db.prepare("SELECT id FROM games WHERE status='PUBLISHED' LIMIT 1").get();
 await test('request-only community cannot be auto-joined; owner retained',()=>{const c=lab.createCommunity(users[0],{gameId:game.id,name:'Audit community',membershipMode:'REQUEST'});assert.throws(()=>lab.getCommunity(users[2],c.id,{autoJoin:true}),/aprovação/);assert.equal(lab.joinCommunity(users[0],c.id).status,'ACTIVE');assert.equal(lab.getCommunity(users[0],c.id).communityRole,'OWNER');});
 const favorite=await import('../src/database/repositories/favorite-game-repository.mjs');
 await test('favorite pagination handles fractions and invalid list input',()=>{favorite.favoriteGame(users[0],game.id);assert.equal(favorite.listFavoriteGames(users[0],{limit:1.8,offset:.2}).length,1);assert.throws(()=>favorite.reorderFavoriteGames(users[0],'invalid'),/lista/);});
 const {profileAvatarLibraryForUser}=await import('../src/users/profile-avatar-service.mjs');
 await test('placeholder catalog does not show ten identical options',()=>{const library=profileAvatarLibraryForUser(users[0]);assert.equal(library.entries.length,1);assert.equal(library.entries[0].class,'FREE');assert.equal(db.prepare('SELECT COUNT(*) n FROM profile_avatar_catalog').get().n,50);});
 const avatars=await import('../src/uploads/avatar-service.mjs');
 await test('lossless WebP dimensions and durable avatar bytes',()=>{const bytes=readFileSync(new URL('./fixtures/avatar-64x32.webp',import.meta.url));const a=avatars.saveAvatarDataUrl('data:image/webp;base64,'+bytes.toString('base64'));assert.equal(a.width,64);assert.equal(a.height,32);const filename=a.url.split('/').at(-1);unlinkSync(path.join(avatarsDir,filename));assert.deepEqual(avatars.readDurableAvatar(filename).bytes,bytes);assert.equal(avatars.deleteAvatarByUrl(a.url),true);assert.equal(avatars.readDurableAvatar(filename),null);});
 console.log(JSON.stringify({ok:true,passed:passed.length,tests:passed}));
}finally{db.close();rmSync(temp,{recursive:true,force:true});}
