import assert from 'node:assert/strict';
import {mkdtempSync,readFileSync,existsSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const temp=mkdtempSync(path.join(tmpdir(),'gameindex-hf2-'));
const dbFile=path.join(temp,'hf2.sqlite');
function child(code,env={}){const r=spawnSync(process.execPath,['--input-type=module','-e',code],{cwd:root,encoding:'utf8',env:{...process.env,...env}});if(r.status!==0)throw new Error(`child failed\n${r.stdout}\n${r.stderr}`);return r.stdout.trim();}
try{
  // Build a real 0.986/HF1-compatible schema, ensure Roblox exists, then migrate additively to HF2.
  child(`
    const c=await import('./src/database/connection.mjs');
    const g=await import('./src/database/repositories/game-repository.mjs');
    c.migrateDatabase();
    if(c.schemaVersion()!==29)throw new Error('expected schema 29');
    if(!g.getGameBySlug('roblox'))g.upsertGame({name:'Roblox',slug:'roblox',description:'Roblox local test',developer:'Roblox Corporation',releaseDate:'2006',platforms:['PC'],genres:['Platform'],status:'PUBLISHED'});
  `,{GAMEINDEX_DB:dbFile,GAMEINDEX_TARGET_SCHEMA:'29',GAMEINDEX_DATA_DIR:temp});

  child(`
    const c=await import('./src/database/connection.mjs');c.migrateDatabase();
    if(c.schemaVersion()!==31)throw new Error('expected schema 31');
    if(c.db.prepare('PRAGMA integrity_check').get().integrity_check!=='ok')throw new Error('integrity failed');
    const expected=['blox-fruits','doors','fisch','work-at-a-pizza-place','prison-life'];
    const roblox=c.db.prepare("SELECT id FROM games WHERE lower(slug)='roblox'").get();
    if(!roblox)throw new Error('roblox missing');
    const links=c.db.prepare('SELECT g.slug,l.relation_type FROM game_parent_links l JOIN games g ON g.id=l.child_game_id WHERE l.parent_game_id=? AND l.enabled=1 ORDER BY l.display_order').all(roblox.id);
    if(JSON.stringify(links.map(x=>x.slug))!==JSON.stringify(expected))throw new Error('children mismatch '+JSON.stringify(links));
    if(links.some(x=>x.relation_type!=='ROBLOX_EXPERIENCE'))throw new Error('relation mismatch');
    const prison=c.db.prepare("SELECT name FROM games WHERE slug='prison-life'").get();if(prison?.name!=='Prison Life')throw new Error('Prison Life canonical name missing');
    const profiles=c.db.prepare("SELECT g.slug,p.experience_type,p.theme_json,p.font_json,p.menu_json FROM game_experience_profiles p JOIN games g ON g.id=p.game_id WHERE p.experience_key='main' AND (g.slug='roblox' OR g.slug IN ('blox-fruits','doors','fisch','work-at-a-pizza-place','prison-life'))").all();
    if(profiles.length!==6)throw new Error('profile count '+profiles.length);
    for(const row of profiles){if(!JSON.parse(row.theme_json).identity)throw new Error('identity missing '+row.slug);if(!JSON.parse(row.font_json).display)throw new Error('font missing '+row.slug);if(!JSON.parse(row.menu_json).length)throw new Error('menu missing '+row.slug);}
    const og=c.db.prepare("SELECT experience_key,music_slot FROM game_experience_profiles WHERE game_id=? AND experience_key='roblox-og'").get(roblox.id);if(og?.music_slot!=='roblox-og')throw new Error('OG profile missing');
    const childMusic=c.db.prepare("SELECT count(*) n FROM gi_youtube_music m JOIN games g ON g.id=m.game_id WHERE g.slug IN ('blox-fruits','doors','fisch','work-at-a-pizza-place','prison-life')").get().n;
    if(childMusic!==0)throw new Error('child music was invented');
  `,{GAMEINDEX_DB:dbFile,GAMEINDEX_TARGET_SCHEMA:'31',GAMEINDEX_DATA_DIR:temp});

  process.env.GAMEINDEX_DB=dbFile;process.env.GAMEINDEX_TARGET_SCHEMA='31';process.env.GAMEINDEX_DATA_DIR=temp;process.env.MAX_CONCURRENT_AI_TASKS='1';
  const c=await import('../src/database/connection.mjs');c.migrateDatabase();assert.equal(c.schemaVersion(),31);assert.equal(c.db.prepare('PRAGMA integrity_check').get().integrity_check,'ok');
  const exp=await import('../src/games/game-experience-service.mjs');const hub=exp.robloxExperienceHub();assert.ok(hub);assert.deepEqual(hub.children.map(x=>x.game.slug),['blox-fruits','doors','fisch','work-at-a-pizza-place','prison-life']);assert.equal(hub.variants.some(x=>x.key==='roblox-og'),true);
  const media=await import('../src/images/game-media-service.mjs');
  const robloxGame=c.db.prepare("SELECT id FROM games WHERE slug='roblox'").get();
  const png='iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
  const modernBg=media.setExperienceMedia({gameId:robloxGame.id,experienceKey:'main',slotKey:'BACKGROUND',imageDataUrl:`data:image/png;base64,${png}`,altText:'Roblox Modern background'});
  const ogLogo=media.setExperienceMedia({gameId:robloxGame.id,experienceKey:'roblox-og',slotKey:'LOGO',imageDataUrl:`data:image/png;base64,${png}`,altText:'Roblox OG logo'});
  assert.equal(modernBg.experienceKey,'main');assert.equal(modernBg.slot,'BACKGROUND');assert.equal(ogLogo.experienceKey,'roblox-og');assert.equal(ogLogo.slot,'LOGO');
  assert.equal(media.listExperienceMedia(robloxGame.id,'main').length,1);assert.equal(media.listExperienceMedia(robloxGame.id,'roblox-og').length,1);
  for(const item of hub.children){assert.equal(item.profile.experienceType,'CHILD_GAME');assert.ok(item.profile.menu.length>=6);assert.ok(item.profile.font.display);assert.ok(item.profile.theme.identity);assert.equal(exp.parentExperienceForGame(item.game.id)?.slug,'roblox');}

  const runtime=await import('../src/ai/runtime/local-ai-runtime.mjs');let running=0,maxRunning=0;
  await Promise.all([1,2].map(n=>runtime.runLocalAITask({capability:'dexter.answer',source:'hf2-test',execute:async()=>{running++;maxRunning=Math.max(maxRunning,running);await new Promise(r=>setTimeout(r,20));running--;return n;}})));
  assert.equal(maxRunning,1);const ai=runtime.localAIRuntimeStatus();assert.equal(ai.runtime,'LOCAL_SHARED_LAZY');assert.equal(ai.concurrency,1);assert.equal(ai.completed>=2,true);

  const shell=readFileSync(path.join(root,'public/js/shell-0986.js'),'utf8');
  assert.match(shell,/__GI_MUSIC_0986_HF2__/);assert.match(shell,/playerState===0&&activeVideoId/);assert.match(shell,/seekTo/);assert.match(shell,/loop=1&playlist=/);assert.match(shell,/userVolume\(\)/);assert.match(shell,/raw===null/);assert.match(shell,/CHILD_LABELS/);assert.doesNotMatch(shell,/gi-music-dock/);
  const engine=readFileSync(path.join(root,'public/js/experience-engine.js'),'utf8');for(const name of ['blox-fruits','doors','fisch','work-at-a-pizza-place','prison-life'])assert.ok(engine.includes(name),`engine missing ${name}`);assert.match(engine,/__GI_PERSONALIZATION_0987__/);assert.match(engine,/data.*experience/i);assert.match(engine,/api\/roblox\/experiences/);
  const imageManager=readFileSync(path.join(root,'public/js/image-library.js'),'utf8');assert.match(imageManager,/Experiência ·/);assert.match(imageManager,/experienceMedia/);assert.match(imageManager,/\/experience\/\$\{encodeURIComponent\(scope\.experienceKey\)\}\/media/);
  const gameHtml=readFileSync(path.join(root,'public/game.html'),'utf8');assert.match(gameHtml,/experience-engine\.css\?v=(?:0987finalpersonalization|09875fullpagepersonalization|099finalfoundation|099i1visualgrounding|099i5production|0991)/);assert.match(gameHtml,/experience-engine\.js\?v=(?:0987finalpersonalization|09875fullpagepersonalization|099finalfoundation|099i1visualgrounding|099i5production|0991)/);assert.match(gameHtml,/shell-0986\.js\?v=(?:0987finalpersonalization|09875fullpagepersonalization|099finalfoundation|099i1visualgrounding|099i5production|0991)/);
  for(const forbidden of ['Criar conteúdo','Criar páginas','Pesquisar imagem'])assert.equal(gameHtml.includes(forbidden),false);
  const server=readFileSync(path.join(root,'server.mjs'),'utf8');assert.match(server,/(?:BETA_0_987(?:5_FULL_PAGE_PERSONALIZATION|_FINAL_PERSONALIZATION)|BETA_0_99_FINAL_FOUNDATION|BETA_0_99_I1_FOUNDATION_CORRECTION_VISUAL_GROUNDING)/);assert.match(server,/\/game\/roblox\/:child/);const migration099=readFileSync(path.join(root,'src/database/migrations/034_beta_099.sql'),'utf8');for(const route of ['blox-fruits','doors','fisch','work-at-a-pizza-place','prison-life'])assert.ok(migration099.includes(route));
  const routeFile=readFileSync(path.join(root,'src/api/beta0986-routes.mjs'),'utf8');assert.match(routeFile,/\/api\/ai-runtime\/status/);assert.match(routeFile,/\/api\/roblox\/experiences/);
  const musicManager=readFileSync(path.join(root,'public/js/music-manager.js'),'utf8');assert.match(musicManager,/Music Engine/);assert.match(musicManager,/configuração manual|configurad[ao]s? manualmente/i);assert.doesNotMatch(musicManager,/Blox Fruits.*youtu\.be|DOORS.*youtu\.be|Fisch.*youtu\.be/i);
  for(const lang of ['pt-BR','en-US','es-ES']){const loc=JSON.parse(readFileSync(path.join(root,`public/locales/${lang}.json`),'utf8'));assert.ok(loc['experience.overview']);assert.ok(loc['experience.backRoblox']);}
  assert.ok(existsSync(path.join(root,'public/game-experience-manager.html')));assert.ok(existsSync(path.join(root,'src/ai/runtime/task-router.mjs')));
  console.log(JSON.stringify({ok:true,release:'0.987 HF2-regression',schema:31,children:hub.children.map(x=>x.game.name),aiRuntime:'LOCAL_SHARED_LAZY',universalLoop:true,gameExperienceEngine:true,childMusicInvented:false},null,2));
}finally{try{rmSync(temp,{recursive:true,force:true});}catch{}}
