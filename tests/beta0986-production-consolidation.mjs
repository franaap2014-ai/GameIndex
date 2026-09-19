import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { scryptSync, randomBytes, randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const temp=mkdtempSync(path.join(tmpdir(),"gameindex-0986-test-"));
const legacyDb=path.join(temp,"legacy.sqlite");
const functionalDb=path.join(temp,"functional.sqlite");
const kxngCreatorDb=path.join(temp,"kxng-creator.sqlite");
function child(code,env={}){const result=spawnSync(process.execPath,["--input-type=module","-e",code],{cwd:root,encoding:"utf8",env:{...process.env,...env}});if(result.status!==0)throw new Error(`Child test failed:\n${result.stdout}\n${result.stderr}`);return result.stdout.trim();}
function passwordHash(password,salt){return scryptSync(password,salt,64).toString("hex");}

try{
  // Representative 0.985 schema -> 0.986 additive migration. Preserve a user marker.
  child(`
    const c=await import('./src/database/connection.mjs');
    const u=await import('./src/database/repositories/user-repository.mjs');
    const p=await import('./src/database/repositories/profile-repository.mjs');
    c.migrateDatabase();
    if(c.schemaVersion()!==28) throw new Error('expected schema 28');
    const id='0986-preserve-user';
    const salt='abc123salt';
    u.createUser({id,email:'preserve0986@example.invalid',displayName:'Preserve User',passwordHash:'x'.repeat(128),passwordSalt:salt});
    p.ensureProfile(id,{preferredUsername:'Preserve0986'});
    const k='3bd5057c-d2ec-4320-93dd-ac099e0a0f11';
    u.createUser({id:k,email:'kxng0986@example.invalid',displayName:'Kxng',passwordHash:'y'.repeat(128),passwordSalt:salt});
    p.ensureProfile(k,{preferredUsername:'Kxng01'});
    console.log('schema28-users-created');
  `,{GAMEINDEX_DB:legacyDb,GAMEINDEX_TARGET_SCHEMA:"28"});
  const migrated=child(`
    const c=await import('./src/database/connection.mjs');
    c.migrateDatabase();
    if(c.schemaVersion()!==29) throw new Error('expected schema 29');
    const user=c.db.prepare('SELECT id FROM users WHERE id=?').get('0986-preserve-user');
    if(!user) throw new Error('user lost during migration');
    const k='3bd5057c-d2ec-4320-93dd-ac099e0a0f11';
    const krole=c.db.prepare('SELECT role,suspended FROM staff_role_assignments WHERE user_id=?').get(k);
    const kconn=c.db.prepare('SELECT connection_role,status FROM admin_connections WHERE user_id=?').get(k);
    if(krole?.role!=='DEV'||Number(krole?.suspended)!==0||kconn?.connection_role!=='DEV'||kconn?.status!=='ACTIVE') throw new Error('Kxng permanent identity was not migrated as DEV');
    const integrity=c.db.prepare('PRAGMA integrity_check').get().integrity_check;
    if(integrity!=='ok') throw new Error('integrity '+integrity);
    console.log('migration-preserved-user');
  `,{GAMEINDEX_DB:legacyDb,GAMEINDEX_TARGET_SCHEMA:"29"});
  assert.match(migrated,/migration-preserved-user/);

  // If the known Kxng identity is already the verified Creator, 0.986 must not downgrade it to DEV.
  child(`
    const c=await import('./src/database/connection.mjs');
    const u=await import('./src/database/repositories/user-repository.mjs');
    const p=await import('./src/database/repositories/profile-repository.mjs');
    c.migrateDatabase();
    const k='3bd5057c-d2ec-4320-93dd-ac099e0a0f11',salt='creator-salt';
    u.createUser({id:k,email:'kxng-creator@example.invalid',displayName:'Kxng Creator',passwordHash:'z'.repeat(128),passwordSalt:salt});
    p.ensureProfile(k,{preferredUsername:'Kxng01'});
    const now=new Date().toISOString();
    c.db.prepare("INSERT INTO staff_role_assignments(user_id,role,suspended,assigned_by,reason,created_at,updated_at) VALUES(?,'CREATOR',0,?,'pre-0986 creator',?,?)").run(k,k,now,now);
    c.db.prepare("INSERT INTO meta(key,value) VALUES('primary_creator_user_id',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").run(k);
  `,{GAMEINDEX_DB:kxngCreatorDb,GAMEINDEX_TARGET_SCHEMA:"28"});
  child(`
    const c=await import('./src/database/connection.mjs');c.migrateDatabase();
    const k='3bd5057c-d2ec-4320-93dd-ac099e0a0f11';
    const role=c.db.prepare('SELECT role FROM staff_role_assignments WHERE user_id=?').get(k)?.role;
    const conn=c.db.prepare('SELECT connection_role FROM admin_connections WHERE user_id=?').get(k)?.connection_role;
    if(role!=='CREATOR'||conn!=='CREATOR') throw new Error('existing Kxng Creator was downgraded');
  `,{GAMEINDEX_DB:kxngCreatorDb,GAMEINDEX_TARGET_SCHEMA:"29"});

  process.env.GAMEINDEX_DB=functionalDb;
  process.env.GAMEINDEX_TARGET_SCHEMA="29";
  const connection=await import("../src/database/connection.mjs");
  connection.migrateDatabase();
  assert.equal(connection.schemaVersion(),29);
  assert.equal(connection.db.prepare("PRAGMA integrity_check").get().integrity_check,"ok");

  const games=await import("../src/database/repositories/game-repository.mjs");
  if(games.gameCount()===0)games.upsertGame({name:"Roblox",slug:"roblox",description:"Plataforma de experiências e jogos criados pela comunidade.",developer:"Roblox Corporation",releaseDate:"2006",platforms:["PC"],genres:["Platform"],status:"PUBLISHED"});
  const page=games.listGamesPage({includeDrafts:true,limit:24,offset:0});
  assert.ok(page.items.length>0,"test game must exist");
  assert.ok(page.items.length<=24,"pagination must cap first page");
  const game=page.items[0];

  const music=await import("../src/music/youtube-music-service.mjs");
  const main=music.setGameMusic({gameId:game.id,youtubeUrl:"https://youtu.be/abcdefghijk",defaultVolume:37});
  assert.equal(main.youtubeVideoId,"abcdefghijk");
  assert.equal(main.defaultVolume,37);
  assert.equal(main.loop,true);
  const alt=music.setGameAltMusic({gameId:game.id,slotKey:"roblox-og",youtubeUrl:"https://www.youtube.com/watch?v=ZYXWVUTSRQP",defaultVolume:29});
  assert.equal(alt.defaultVolume,29);
  assert.equal(alt.loop,true);

  const media=await import("../src/images/game-media-service.mjs");
  const png="iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";
  const background=media.setGameMedia({gameId:game.id,slotKey:"PAGE_BACKGROUND",imageDataUrl:`data:image/png;base64,${png}`,altText:`Fundo de ${game.nome}`,width:1280,height:720,fitMode:"COVER",quality:86});
  assert.equal(background.storageType,"LOCAL");
  assert.equal(background.width,1);
  assert.equal(background.height,1);
  assert.match(background.imageUrl,/^\/user-content\/game-media\//);
  assert.ok(existsSync(path.join(media.gameMediaDir,path.basename(background.imageUrl))));

  const experiences=await import("../src/games/game-experience-service.mjs");
  const exp=experiences.setExperience({gameId:game.id,experienceKey:"main",label:"Principal",backgroundSlot:"PAGE_BACKGROUND",musicSlot:"main",accent:{"--game-accent":"#ffffff"},enabled:true});
  assert.equal(exp.key,"main");
  assert.equal(exp.background?.imageUrl,background.imageUrl);
  assert.equal(exp.music?.youtubeVideoId,"abcdefghijk");

  const overview=await import("../src/universe/basic-overview.mjs");
  const basic=overview.basicGameOverview(game);
  assert.equal(basic.aiUsed,false);
  assert.ok(String(basic.summary||"").length>0);
  for(const key of ["characters","locations","factions","relationships"])assert.ok(Array.isArray(basic[key]),`${key} must be array`);

  const users=await import("../src/database/repositories/user-repository.mjs");
  const profiles=await import("../src/database/repositories/profile-repository.mjs");
  const auth=await import("../src/auth/auth-service.mjs");
  const admin=await import("../src/access/admin-connection-service.mjs");
  const access=await import("../src/access/capability-service.mjs");
  const creatorId=randomUUID(),salt=randomBytes(16).toString("hex"),oldPassword="GameIndexOld986!",newPassword="GameIndexNew986!";
  users.createUser({id:creatorId,email:"creator0986@example.invalid",displayName:"Creator 0986",passwordHash:passwordHash(oldPassword,salt),passwordSalt:salt});
  profiles.ensureProfile(creatorId,{preferredUsername:"Creator0986"});
  admin.setAdminConnection({userId:creatorId,role:"CREATOR",status:"ACTIVE",actorUserId:creatorId,reason:"0.986 isolated test"});
  const snapshot=access.accessSnapshotForUser(creatorId);
  assert.equal(snapshot.adminConnection?.active,true);
  assert.ok(snapshot.capabilities.includes("music_management"));
  assert.ok(snapshot.capabilities.includes("image_management"));
  assert.ok(auth.verifyUserPassword(creatorId,oldPassword));
  auth.changeUserPassword(creatorId,{currentPassword:oldPassword,newPassword});
  assert.equal(auth.verifyUserPassword(creatorId,oldPassword),false);
  assert.equal(auth.verifyUserPassword(creatorId,newPassword),true);
  assert.throws(()=>admin.setAdminConnection({userId:creatorId,role:"DEV",status:"ACTIVE",actorUserId:creatorId,reason:"must not demote last creator"}),/LAST_CREATOR_REQUIRED/);

  const security=await import("../src/security/two-factor-service.mjs");
  const twoFactor=security.twoFactorStatus(creatorId);
  assert.deepEqual(Object.keys(twoFactor.mail),["configured"]);
  assert.equal(twoFactor.enabled,false);

  // Static release contracts: public game page is clean and music is top-popover only.
  const gameHtml=readFileSync(path.join(root,"public/game.html"),"utf8");
  for(const forbidden of ["Criar conteúdo","Criar páginas","Pesquisar imagem"])assert.equal(gameHtml.includes(forbidden),false,`public game page still contains ${forbidden}`);
  const shell=readFileSync(path.join(root,"public/js/shell-0986.js"),"utf8");
  assert.match(shell,/0\.987/);
  assert.match(shell,/loop=1&playlist=/);
  assert.match(shell,/giVolume/);
  assert.equal(/Tocando agora|Reproduzindo agora|Now Playing/i.test(shell),false);
  const css=readFileSync(path.join(root,"public/css/gameindex-0986.css"),"utf8");
  assert.match(css,/max-width:480px/);
  assert.match(css,/text-align:center/);
  const manager=readFileSync(path.join(root,"public/js/image-library.js"),"utf8");
  for(const contract of ["1:1","16:9","3:4","image/webp","PAGE_BACKGROUND","_sourceMode"])assert.ok(manager.includes(contract),`Image Manager missing ${contract}`);
  const mediaService=readFileSync(path.join(root,"src/images/game-media-service.mjs"),"utf8");
  assert.match(mediaService,/fetchPublicBinary/);
  assert.match(mediaService,/setGameMediaFromUrl/);
  const release=connection.db.prepare("SELECT version,codename FROM update_log_entries WHERE version='0.986'").get();
  assert.equal(release?.codename,"Production Consolidation");

  const forbiddenRuntime=["public/js/shell.js","public/js/shell-hf7.js","public/js/shell-hf7-r3.js","public/js/hotfix-0985-perf-runtime.js","src/api/hotfix-performance-music-routes.mjs"];
  for(const rel of forbiddenRuntime)assert.equal(existsSync(path.join(root,rel)),false,`obsolete hotfix runtime still packaged: ${rel}`);

  console.log(JSON.stringify({ok:true,release:"0.986",schema:connection.schemaVersion(),games:games.gameCount(),migration:"0.985->0.986 preserved",musicLoop:true,imageManager2:true,universeBuilder3:true,adminConnections:true,passwordChange:true,twoFactorOptional:true},null,2));
} finally {
  try{rmSync(temp,{recursive:true,force:true});}catch{}
}
