import assert from 'node:assert/strict';
import {existsSync,mkdtempSync,readFileSync,rmSync,writeFileSync,utimesSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const temp=mkdtempSync(path.join(tmpdir(),'gameindex-0987-'));
const dbFile=path.join(temp,'gamevault.sqlite');
function child(code,env={}){const r=spawnSync(process.execPath,['--input-type=module','-e',code],{cwd:root,encoding:'utf8',env:{...process.env,...env}});if(r.status!==0)throw new Error(`child failed\n${r.stdout}\n${r.stderr}`);return r.stdout.trim();}
try{
  // Build the exact previous HF2 schema, then upgrade it to 0.987 without a reset.
  child(`
    const c=await import('./src/database/connection.mjs');
    const g=await import('./src/database/repositories/game-repository.mjs');
    c.migrateDatabase();
    if(c.schemaVersion()!==29)throw new Error('expected schema 29');
    if(!g.getGameBySlug('roblox'))g.upsertGame({name:'Roblox',slug:'roblox',description:'Roblox test',developer:'Roblox Corporation',releaseDate:'2006',platforms:['PC'],genres:['Platform'],status:'PUBLISHED'});
  `,{GAMEINDEX_DB:dbFile,GAMEINDEX_TARGET_SCHEMA:'29',GAMEINDEX_DATA_DIR:temp,GAMEINDEX_DB_BACKUP_RETENTION:'5'});
  child(`
    const c=await import('./src/database/connection.mjs');c.migrateDatabase();
    if(c.schemaVersion()!==31)throw new Error('expected schema 31');
  `,{GAMEINDEX_DB:dbFile,GAMEINDEX_TARGET_SCHEMA:'31',GAMEINDEX_DATA_DIR:temp,GAMEINDEX_DB_BACKUP_RETENTION:'5'});
  child(`
    const c=await import('./src/database/connection.mjs');c.migrateDatabase();
    if(c.schemaVersion()!==32)throw new Error('expected schema 32');
    if(c.db.prepare('PRAGMA integrity_check').get().integrity_check!=='ok')throw new Error('integrity failed');
    const r=c.db.prepare("SELECT id FROM games WHERE slug='roblox'").get();if(!r)throw new Error('roblox missing');
    const modern=c.db.prepare("SELECT component_json,default_era_key FROM game_experience_profiles WHERE game_id=? AND experience_key='main'").get(r.id);
    const og=c.db.prepare("SELECT label,theme_json,component_json,default_era_key,music_slot FROM game_experience_profiles WHERE game_id=? AND experience_key='roblox-og'").get(r.id);
    if(JSON.parse(modern.component_json).header!=='ecosystem-modern'||modern.default_era_key!=='modern')throw new Error('modern profile not polished');
    if(JSON.parse(og.theme_json).identity!=='roblox-og-classic'||JSON.parse(og.component_json).panel!=='classic-web'||og.default_era_key!=='classic-web'||og.music_slot!=='roblox-og')throw new Error('OG profile not polished');
    const eras=c.db.prepare('SELECT experience_key,era_key FROM game_era_profiles WHERE game_id=? ORDER BY experience_key,era_key').all(r.id);
    if(eras.length<2)throw new Error('era profiles missing');
    const links=c.db.prepare('SELECT g.slug FROM game_parent_links l JOIN games g ON g.id=l.child_game_id WHERE l.parent_game_id=? AND l.enabled=1 ORDER BY l.display_order').all(r.id);
    const expected=['blox-fruits','doors','fisch','work-at-a-pizza-place','prison-life'];if(JSON.stringify(links.map(x=>x.slug))!==JSON.stringify(expected))throw new Error('child links changed');
    const childMusic=c.db.prepare("SELECT count(*) n FROM gi_youtube_music m JOIN games g ON g.id=m.game_id WHERE g.slug IN ('blox-fruits','doors','fisch','work-at-a-pizza-place','prison-life')").get().n;if(childMusic!==0)throw new Error('child music invented');
  `,{GAMEINDEX_DB:dbFile,GAMEINDEX_TARGET_SCHEMA:'32',GAMEINDEX_DATA_DIR:temp,GAMEINDEX_DB_BACKUP_RETENTION:'5'});

  process.env.GAMEINDEX_DB=dbFile;process.env.GAMEINDEX_DATA_DIR=temp;process.env.GAMEINDEX_TARGET_SCHEMA='32';process.env.GAMEINDEX_DB_BACKUP_RETENTION='5';
  const c=await import('../src/database/connection.mjs');c.migrateDatabase();assert.equal(c.schemaVersion(),32);assert.equal(c.db.prepare('PRAGMA integrity_check').get().integrity_check,'ok');
  const games=await import('../src/database/repositories/game-repository.mjs');const roblox=games.getGameBySlug('roblox');assert.ok(roblox);
  const exp=await import('../src/games/game-experience-service.mjs');const hub=exp.robloxExperienceHub();assert.deepEqual(hub.children.map(x=>x.game.slug),['blox-fruits','doors','fisch','work-at-a-pizza-place','prison-life']);
  const modern=exp.experienceProfile(roblox.id,'main'),og=exp.experienceProfile(roblox.id,'roblox-og');assert.equal(modern.defaultEraKey,'modern');assert.equal(og.defaultEraKey,'classic-web');assert.equal(og.theme.identity,'roblox-og-classic');assert.equal(og.components.gameCard,'classic-grid');

  const music=await import('../src/music/youtube-music-service.mjs');music.setGameMusic({gameId:roblox.id,youtubeUrl:'https://youtu.be/abcdefghijk',defaultVolume:31});music.setGameAltMusic({gameId:roblox.id,slotKey:'roblox-og',youtubeUrl:'https://youtu.be/ZYXWVUTSRQP',defaultVolume:27});
  const personalization=await import('../src/personalization/personalization-service.mjs');
  const ogState=personalization.resolvePersonalization({game:roblox,experienceKey:'roblox-og',eraKey:'classic-web',userTheme:'CREATOR_TECH'});assert.match(ogState.version,/^0\.987/);assert.equal(ogState.resolved.identity,'roblox-og-classic');assert.equal(ogState.resolved.components.header,'ecosystem-classic');assert.equal(ogState.resolved.components.panel,'classic-web');assert.equal(ogState.userTheme.id,'CREATOR_TECH');assert.equal(ogState.resolved.music.youtubeVideoId,'ZYXWVUTSRQP');assert.ok(ogState.inspector.layers.includes('ERA_PROFILE'));
  const childGame=games.getGameBySlug('doors');assert.ok(childGame);const childState=personalization.resolvePersonalization({game:childGame,experienceKey:'main',ecosystemExperienceKey:'roblox-og',ecosystemEraKey:'classic-web',userTheme:'FREE_DARK'});assert.equal(childState.parent.slug,'roblox');assert.equal(childState.resolved.components.header,'ecosystem-classic');assert.equal(childState.resolved.music.youtubeVideoId,'ZYXWVUTSRQP');assert.match(childState.resolved.music.source,/PARENT/);

  const media=await import('../src/images/game-media-service.mjs');const png='iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';const eraMedia=media.setEraMedia({gameId:roblox.id,experienceKey:'roblox-og',eraKey:'classic-web',slotKey:'LOGO',imageDataUrl:`data:image/png;base64,${png}`,altText:'Classic web logo'});assert.equal(eraMedia.eraKey,'classic-web');const ogWithMedia=personalization.resolvePersonalization({game:roblox,experienceKey:'roblox-og',eraKey:'classic-web'});assert.equal(ogWithMedia.resolved.media.logo.source,'ERA');

  // Backup retention: only strict migration backups are rotated; the production-name file is never a cleanup target.
  const backupTemp=mkdtempSync(path.join(temp,'backup-manager-')),backupsDir=path.join(backupTemp,'backups');
  const {mkdirSync}=await import('node:fs');mkdirSync(backupsDir,{recursive:true});
  const backup=await import('../src/database/backup-manager.mjs');
  writeFileSync(path.join(backupsDir,'gamevault.sqlite'),'PRODUCTION-NAME-SENTINEL');
  for(let i=0;i<8;i++){const stamp=`2026-09-${String(i+1).padStart(2,'0')}T00-00-00-000Z`,name=`gamevault-0.${900+i}-before-0.${901+i}-beta-${i}-${stamp}.sqlite`,p=path.join(backupsDir,name);writeFileSync(p,`backup-${i}`);utimesSync(p,new Date(2026,8,i+1),new Date(2026,8,i+1));}
  const rotated=backup.rotateDatabaseBackups({backupsDir,retain:5});assert.equal(rotated.after,5);assert.equal(backup.listMigrationBackups(backupsDir).length,5);assert.equal(readFileSync(path.join(backupsDir,'gamevault.sqlite'),'utf8'),'PRODUCTION-NAME-SENTINEL');
  writeFileSync(path.join(backupsDir,'gamevault-test.sqlite.partial-123-456'),'partial');assert.equal(backup.cleanupPartialBackups(backupsDir).removed.length,1);
  const source=path.join(backupTemp,'source.bin');writeFileSync(source,Buffer.alloc(2048,7));const made=backup.createManagedDatabaseBackup({databasePath:source,backupsDir,fromVersion:'0.986-HF2',toVersion:'0.987',label:'beta-0.987-test',retention:5,verify:p=>({ok:existsSync(p)&&readFileSync(p).length===2048})});assert.ok(existsSync(made.path));assert.equal(backup.listMigrationBackups(backupsDir).length,5);assert.equal(readFileSync(path.join(backupsDir,'gamevault.sqlite'),'utf8'),'PRODUCTION-NAME-SENTINEL');assert.ok(backup.backupSpaceRequirement(100).requiredBytes>100);

  const shell=readFileSync(path.join(root,'public/js/shell-0986.js'),'utf8');assert.match(shell,/__GI_MUSIC_0987__/);assert.match(shell,/new YT\.Player/);assert.match(shell,/onStateChange:onPlayerState/);assert.match(shell,/playerState===0/);assert.match(shell,/seekTo\(0,true\)/);assert.match(shell,/playVideo\(\)/);assert.match(shell,/loop:1/);assert.match(shell,/playlist:initialId/);assert.match(shell,/playerInstances=1/);assert.match(shell,/raw===null/);assert.doesNotMatch(shell,/gi-music-dock|Tocando agora pelo YouTube/i);
  const engine=readFileSync(path.join(root,'public/js/experience-engine.js'),'utf8');assert.match(engine,/__GI_PERSONALIZATION_0987__/);assert.match(engine,/\/personalization\?/);assert.match(engine,/gi_experience_roblox/);assert.match(engine,/gameindex:personalization-applied/);assert.match(engine,/ecosystemExperience/);
  const css=readFileSync(path.join(root,'public/css/experience-engine.css'),'utf8');for(const token of ['roblox-og-classic','ecosystem-classic','classic-web','prefers-reduced-motion'])assert.ok(css.includes(token),`CSS missing ${token}`);
  const gameHtml=readFileSync(path.join(root,'public/game.html'),'utf8');assert.match(gameHtml,/0987finalpersonalization|09875fullpagepersonalization|099finalfoundation|099i1visualgrounding|099i5production|0991|099i5production|0991/);for(const forbidden of ['Criar conteúdo','Criar páginas','Pesquisar imagem'])assert.equal(gameHtml.includes(forbidden),false);
  const route=readFileSync(path.join(root,'src/api/beta0987-routes.mjs'),'utf8');assert.match(route,/personalization\/inspect/);assert.match(route,/\/era\/:era\/media/);
  const server=readFileSync(path.join(root,'server.mjs'),'utf8');assert.match(server,/registerBeta0987Routes/);assert.match(server,/BETA (?:0\.987|0\.99)/);
  for(const lang of ['pt-BR','en-US','es-ES']){const loc=JSON.parse(readFileSync(path.join(root,`public/locales/${lang}.json`),'utf8'));assert.ok(loc['personalization.era']);assert.ok(loc['experience.robloxOg']);}

  console.log(JSON.stringify({ok:true,release:'0.987',schema:32,personalizationEngine:'2.0',eraProfiles:true,robloxModern:true,robloxOg:'GAME_INDEX_X_CLASSIC_ROBLOX',singleMusicPlayer:true,loopHandler:'ENDED_SEEK_PLAY',backupRetention:5,productionDbProtection:true,childMusicInvented:false},null,2));
}finally{try{rmSync(temp,{recursive:true,force:true});}catch{}}
