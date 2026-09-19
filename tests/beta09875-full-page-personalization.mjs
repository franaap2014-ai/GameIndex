import assert from 'node:assert/strict';
import {mkdtempSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const temp=mkdtempSync(path.join(tmpdir(),'gameindex-09875-'));
const dbFile=path.join(temp,'gamevault.sqlite');
function child(code,env={}){
  const r=spawnSync(process.execPath,['--input-type=module','-e',code],{cwd:root,encoding:'utf8',env:{...process.env,...env}});
  if(r.status!==0)throw new Error(`child failed\n${r.stdout}\n${r.stderr}`);
  return r.stdout.trim();
}

try{
  // Build the exact 0.987 schema first. This proves 0.9875 upgrades additively from production baseline.
  child(`
    const c=await import('./src/database/connection.mjs');
    const g=await import('./src/database/repositories/game-repository.mjs');
    c.migrateDatabase();
    if(c.schemaVersion()!==29)throw new Error('expected schema 29');
    if(!g.getGameBySlug('roblox'))g.upsertGame({name:'Roblox',slug:'roblox',description:'Roblox test',developer:'Roblox Corporation',releaseDate:'2006',platforms:['PC'],genres:['Platform'],status:'PUBLISHED'});
  `,{GAMEINDEX_DB:dbFile,GAMEINDEX_TARGET_SCHEMA:'29',GAMEINDEX_DATA_DIR:temp,GAMEINDEX_DB_BACKUP_RETENTION:'5'});
  child(`
    const c=await import('./src/database/connection.mjs');c.migrateDatabase();
    if(c.schemaVersion()!==32)throw new Error('expected schema 32');
    if(c.db.prepare('PRAGMA integrity_check').get().integrity_check!=='ok')throw new Error('integrity failed at schema 32');
  `,{GAMEINDEX_DB:dbFile,GAMEINDEX_TARGET_SCHEMA:'32',GAMEINDEX_DATA_DIR:temp,GAMEINDEX_DB_BACKUP_RETENTION:'5'});

  process.env.GAMEINDEX_DB=dbFile;
  process.env.GAMEINDEX_DATA_DIR=temp;
  process.env.GAMEINDEX_TARGET_SCHEMA='33';
  process.env.GAMEINDEX_DB_BACKUP_RETENTION='5';

  const c=await import('../src/database/connection.mjs');
  c.migrateDatabase();
  assert.equal(c.schemaVersion(),33);
  assert.equal(c.db.prepare('PRAGMA integrity_check').get().integrity_check,'ok');
  assert.equal(c.db.prepare("SELECT value FROM meta WHERE key='runtime_release'").get()?.value,'BETA_0_9875_FULL_PAGE_PERSONALIZATION');
  assert.equal(c.db.prepare("SELECT value FROM meta WHERE key='beta_09875'").get()?.value,'1');
  assert.ok(c.db.prepare("SELECT version FROM update_log_entries WHERE version='0.9875'").get());

  const games=await import('../src/database/repositories/game-repository.mjs');
  const roblox=games.getGameBySlug('roblox');
  assert.ok(roblox,'Roblox must survive the 0.987 -> 0.9875 migration');

  const exp=await import('../src/games/game-experience-service.mjs');
  const hub=exp.robloxExperienceHub();
  assert.deepEqual(hub.children.map(x=>x.game.slug),['blox-fruits','doors','fisch','work-at-a-pizza-place','prison-life']);
  const modern=exp.experienceProfile(roblox.id,'main');
  const og=exp.experienceProfile(roblox.id,'roblox-og');
  assert.equal(modern.defaultEraKey,'modern');
  assert.equal(og.defaultEraKey,'classic-web');
  assert.equal(og.theme.identity,'roblox-og-classic');
  const childMusic=c.db.prepare("SELECT count(*) n FROM gi_youtube_music m JOIN games g ON g.id=m.game_id WHERE g.slug IN ('blox-fruits','doors','fisch','work-at-a-pizza-place','prison-life')").get().n;
  assert.equal(childMusic,0,'0.9875 must not invent child music');

  const media=await import('../src/images/game-media-service.mjs');
  const personalization=await import('../src/personalization/personalization-service.mjs');
  const png='iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
  const dataUrl=`data:image/png;base64,${png}`;

  // Modern and OG can own independent LOGO + BANNER assets.
  const modernLogo=media.setExperienceMedia({gameId:roblox.id,experienceKey:'main',slotKey:'LOGO',imageDataUrl:dataUrl,altText:'Modern logo'});
  const modernBanner=media.setExperienceMedia({gameId:roblox.id,experienceKey:'main',slotKey:'BANNER',imageDataUrl:dataUrl,altText:'Modern banner'});
  const ogLogo=media.setEraMedia({gameId:roblox.id,experienceKey:'roblox-og',eraKey:'classic-web',slotKey:'LOGO',imageDataUrl:dataUrl,altText:'OG logo'});
  const ogBanner=media.setEraMedia({gameId:roblox.id,experienceKey:'roblox-og',eraKey:'classic-web',slotKey:'BANNER',imageDataUrl:dataUrl,altText:'OG banner'});
  assert.equal(modernLogo.slot,'LOGO');
  assert.equal(modernBanner.slot,'BANNER');
  assert.equal(ogLogo.slot,'LOGO');
  assert.equal(ogBanner.slot,'BANNER');

  let modernState=personalization.resolvePersonalization({game:roblox,experienceKey:'main',eraKey:'modern',userTheme:'FREE_DARK'});
  let ogState=personalization.resolvePersonalization({game:roblox,experienceKey:'roblox-og',eraKey:'classic-web',userTheme:'CREATOR_TECH'});
  assert.equal(modernState.version,'0.9875');
  assert.equal(ogState.version,'0.9875');
  assert.equal(modernState.resolved.media.logo.source,'EXPERIENCE');
  assert.equal(modernState.resolved.media.banner.source,'EXPERIENCE');
  assert.equal(ogState.resolved.media.logo.source,'ERA');
  assert.equal(ogState.resolved.media.banner.source,'ERA');
  assert.notEqual(modernState.resolved.media.banner.imageUrl,ogState.resolved.media.banner.imageUrl,'Modern and OG banners must be independent');
  assert.equal(ogState.userTheme.id,'CREATOR_TECH','user theme must remain in composition');

  // Canonical BANNER fallback chain: ERA -> EXPERIENCE -> GAME alias -> legacy HERO.
  media.removeEraMedia(roblox.id,'roblox-og','classic-web','BANNER');
  const ogExpBanner=media.setExperienceMedia({gameId:roblox.id,experienceKey:'roblox-og',slotKey:'BANNER',imageDataUrl:dataUrl,altText:'OG experience banner'});
  assert.equal(ogExpBanner.slot,'BANNER');
  ogState=personalization.resolvePersonalization({game:roblox,experienceKey:'roblox-og',eraKey:'classic-web'});
  assert.equal(ogState.resolved.media.banner.source,'EXPERIENCE');

  media.removeExperienceMedia(roblox.id,'roblox-og','BANNER');
  const legacyEraHero=media.setEraMedia({gameId:roblox.id,experienceKey:'roblox-og',eraKey:'classic-web',slotKey:'HERO',imageDataUrl:dataUrl,altText:'Legacy OG hero'});
  assert.equal(legacyEraHero.slot,'HERO');
  ogState=personalization.resolvePersonalization({game:roblox,experienceKey:'roblox-og',eraKey:'classic-web'});
  assert.equal(ogState.resolved.media.banner.source,'ERA_LEGACY_HERO');
  assert.ok(media.eraMediaProfile(roblox.id,'roblox-og','classic-web','HERO'),'legacy HERO must remain stored');

  media.removeEraMedia(roblox.id,'roblox-og','classic-web','HERO');
  const gameBannerAlias=media.setGameMedia({gameId:roblox.id,slotKey:'HERO',imageDataUrl:dataUrl,altText:'Game banner alias'});
  assert.equal(gameBannerAlias.slot,'HERO');
  ogState=personalization.resolvePersonalization({game:roblox,experienceKey:'roblox-og',eraKey:'classic-web'});
  assert.equal(ogState.resolved.media.banner.source,'GAME');

  // Public/frontend contracts.
  const engine=readFileSync(path.join(root,'public/js/experience-engine.js'),'utf8');
  assert.match(engine,/__GI_PERSONALIZATION_09875__/);
  assert.match(engine,/__GI_PERSONALIZATION_0987__/); // backward compatibility marker
  assert.match(engine,/document\.documentElement/);
  assert.match(engine,/gameEcosystem/);
  assert.match(engine,/media\.banner/);
  assert.match(engine,/gie-logo-frame/);
  assert.match(engine,/personalizationReady/);

  const css=readFileSync(path.join(root,'public/css/experience-engine.css'),'utf8');
  for(const token of [
    'html[data-personalization="09875"]',
    'html[data-game-ecosystem="roblox"][data-experience-variant="main"]',
    'html[data-game-ecosystem="roblox"][data-experience-variant="roblox-og"]',
    '.site-header','.drawer-panel','.gi-music-popover','.game-workspace','.related-panel','.gie-hub','prefers-reduced-motion'
  ]) assert.ok(css.includes(token),`full-page CSS missing ${token}`);

  const imageManager=readFileSync(path.join(root,'public/js/image-library.js'),'utf8');
  assert.match(imageManager,/SIMPLE_SLOTS=\[\['LOGO','Logo'\],\['BANNER','Banner'\]\]/);
  assert.match(imageManager,/simpleSlot==='LOGO'\?'COVER':'HERO'/);
  assert.match(imageManager,/OWN IMAGE/);
  assert.match(imageManager,/INHERITED FROM GAME/);
  assert.match(imageManager,/LEGACY FALLBACK/);
  assert.match(imageManager,/GAME INDEX DEFAULT/);
  const slotDecl=imageManager.match(/const SIMPLE_SLOTS=([^;]+);/)?.[1]||'';
  for(const legacy of ['HERO','BACKGROUND','CARD','GALLERY','ARTWORK']) assert.equal(slotDecl.includes(`'${legacy}'`),false,`${legacy} must not be a primary simple slot`);

  const imageHtml=readFileSync(path.join(root,'public/image-library.html'),'utf8');
  assert.match(imageHtml,/Image Manager 3\.0/);
  assert.match(imageHtml,/LOGO[^\n]*BANNER|LOGO \+ BANNER/i);

  const gameHtml=readFileSync(path.join(root,'public/game.html'),'utf8');
  assert.match(gameHtml,/09875fullpagepersonalization|099finalfoundation|099i1visualgrounding|099i5production|0991/);
  assert.match(gameHtml,/id="relatedRelationshipLabel"/);
  assert.match(gameHtml,/personalizationBoot="(?:09875|099)"/);
  for(const forbidden of ['Criar conteúdo','Criar páginas','Pesquisar imagem']) assert.equal(gameHtml.includes(forbidden),false);

  const gameJs=readFileSync(path.join(root,'public/js/game.js'),'utf8');
  assert.match(gameJs,/relationship\.experiences/);
  assert.match(gameJs,/relationship\.franchise/);
  assert.match(gameJs,/game\.slug==="roblox"/);

  for(const [lang,expected] of [['pt-BR','EXPERIÊNCIAS'],['en-US','EXPERIENCES'],['es-ES','EXPERIENCIAS']]){
    const loc=JSON.parse(readFileSync(path.join(root,`public/locales/${lang}.json`),'utf8'));
    assert.equal(loc['relationship.experiences'],expected);
    assert.ok(loc['relationship.franchise']);
    assert.equal(loc['image.primary.logo'],'Logo');
    assert.ok(loc['image.primary.banner']);
  }

  // Music must retain the 0.987 single-player + redundant loop contract.
  const shell=readFileSync(path.join(root,'public/js/shell-0986.js'),'utf8');
  assert.match(shell,/__GI_MUSIC_0987__/);
  assert.match(shell,/new YT\.Player/);
  assert.match(shell,/playerState===0/);
  assert.match(shell,/seekTo\(0,true\)/);
  assert.match(shell,/playVideo\(\)/);
  assert.match(shell,/loop:1/);
  assert.match(shell,/playlist:initialId/);
  assert.match(shell,/playerInstances=1/);
  assert.match(shell,/raw===null/);
  assert.doesNotMatch(shell,/gi-music-dock|Tocando agora pelo YouTube/i);

  // Release/runtime/storage safety markers.
  const server=readFileSync(path.join(root,'server.mjs'),'utf8');
  assert.match(server,/version:"(?:0\.9875|0\.99|0\.99-I1)"/);
  assert.match(server,/BETA_0_9875_FULL_PAGE_PERSONALIZATION|BETA_0_99_FINAL_FOUNDATION|BETA_0_99_I1_FOUNDATION_CORRECTION_VISUAL_GROUNDING/);
  const backup=readFileSync(path.join(root,'src/database/backup-manager.mjs'),'utf8');
  assert.match(backup,/GAMEINDEX_DB_BACKUP_RETENTION/);
  assert.match(backup,/partial/i);
  assert.match(backup,/gamevault\.sqlite/);

  console.log(JSON.stringify({
    ok:true,
    release:'0.9875',
    schema:33,
    fullPagePersonalization:true,
    robloxModern:true,
    robloxOg:true,
    imageManager:'3.0_LOGO_BANNER',
    canonicalExperienceBanner:true,
    legacyMediaPreserved:true,
    terminology:'ROBLOX_EXPERIENCES',
    singleMusicPlayer:true,
    loopContract:'ENDED_SEEK_PLAY_PLUS_NATIVE_LOOP',
    backupRetentionPreserved:true,
    productionDbReset:false
  },null,2));
}finally{
  try{rmSync(temp,{recursive:true,force:true});}catch{}
}
