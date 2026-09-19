import assert from 'node:assert/strict';
import {mkdtempSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath,pathToFileURL} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const temp=mkdtempSync(path.join(tmpdir(),'gameindex-09875-hf1-'));
const dbFile=path.join(temp,'gamevault.sqlite');
function child(code,env={}){
  const r=spawnSync(process.execPath,['--input-type=module','-e',code],{cwd:root,encoding:'utf8',env:{...process.env,...env}});
  if(r.status!==0)throw new Error(`child failed\n${r.stdout}\n${r.stderr}`);
  return r.stdout.trim();
}

try{
  child(`const s=await import('./src/database/seed.mjs');const out=s.initializeDatabase();if(out.schema!==29)throw new Error('schema29');`,{GAMEINDEX_DB:dbFile,GAMEINDEX_TARGET_SCHEMA:'29',GAMEINDEX_DATA_DIR:temp,GAMEINDEX_DB_BACKUP_RETENTION:'5'});
  child(`const c=await import('./src/database/connection.mjs');c.migrateDatabase();if(c.schemaVersion()!==33)throw new Error('schema33');`,{GAMEINDEX_DB:dbFile,GAMEINDEX_TARGET_SCHEMA:'33',GAMEINDEX_DATA_DIR:temp,GAMEINDEX_DB_BACKUP_RETENTION:'5'});
  process.env.GAMEINDEX_DB=dbFile;process.env.GAMEINDEX_DATA_DIR=temp;process.env.GAMEINDEX_TARGET_SCHEMA='33';process.env.GAMEINDEX_DB_BACKUP_RETENTION='5';
  const c=await import('../src/database/connection.mjs');
  assert.equal(c.schemaVersion(),33);
  assert.equal(c.db.prepare('PRAGMA integrity_check').get().integrity_check,'ok');

  const games=await import('../src/database/repositories/game-repository.mjs');
  const exp=await import('../src/games/game-experience-service.mjs');
  const media=await import('../src/images/game-media-service.mjs');
  const roblox=games.getGameBySlug('roblox');assert.ok(roblox);
  const hub=exp.robloxExperienceHub();
  assert.deepEqual(hub.children.map(x=>x.game.slug),['blox-fruits','doors','fisch','work-at-a-pizza-place','prison-life']);
  assert.ok(exp.experienceProfile(roblox.id,'main'));
  assert.equal(exp.experienceProfile(roblox.id,'roblox-og').defaultEraKey,'classic-web');

  const png='iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
  const dataUrl=`data:image/png;base64,${png}`;
  const modern=media.setEraMedia({gameId:roblox.id,experienceKey:'main',eraKey:'modern',slotKey:'BANNER',imageDataUrl:dataUrl,altText:'Modern banner HF1'});
  const og=media.setEraMedia({gameId:roblox.id,experienceKey:'roblox-og',eraKey:'classic-web',slotKey:'BANNER',imageDataUrl:dataUrl,altText:'OG banner HF1'});
  assert.equal(modern.eraKey,'modern');assert.equal(og.eraKey,'classic-web');assert.notEqual(modern.imageUrl,og.imageUrl);
  const blox=games.getGameBySlug('blox-fruits');assert.ok(blox);
  const bloxLogo=media.setExperienceMedia({gameId:blox.id,experienceKey:'main',slotKey:'LOGO',imageDataUrl:dataUrl,altText:'Blox logo'});
  assert.equal(bloxLogo.gameId,blox.id);assert.equal(media.eraMediaProfile(roblox.id,'roblox-og','classic-web','BANNER').imageUrl,og.imageUrl,'child save must not mutate Roblox OG');

  // Native crop math can be validated without browser automation.
  await import(pathToFileURL(path.join(root,'public/js/image-crop-editor.js')).href+`?t=${Date.now()}`);
  const math=globalThis.GICropMath;assert.ok(math);
  assert.deepEqual(math.coverBaseSize(1600,900,800,300,'fill'),{width:800,height:450,ratio:.5});
  const fit=math.coverBaseSize(1600,900,800,300,'fit');assert.equal(Math.round(fit.width),533);assert.equal(fit.height,300);
  assert.equal(math.scaleFromDistance(1,100,150),1.5);
  assert.deepEqual(math.normalizedTranslation(80,-30,800,300),{x:.1,y:-.1});

  const cropJs=readFileSync(path.join(root,'public/js/image-crop-editor.js'),'utf8');
  for(const handle of ['nw','ne','sw','se'])assert.match(cropJs,new RegExp(`data-(?:handle|corner)=\\"${handle}\\"`));
  assert.match(cropJs,/pointerdown/);assert.match(cropJs,/pointermove/);assert.match(cropJs,/setPointerCapture/);assert.match(cropJs,/toDataURL/);assert.match(cropJs,/aspect-ratio|aspectRatio/);assert.match(cropJs,/scaleFromDistance/);
  assert.doesNotMatch(cropJs,/focus-x|focus-y/);

  const imageJs=readFileSync(path.join(root,'public/js/image-library.js'),'utf8');
  assert.match(imageJs,/\/api\/image-manager\/tree/);
  assert.match(imageJs,/\/api\/image-manager\/game\//);
  assert.match(imageJs,/Roblox OG/);assert.match(imageJs,/Experiências|Experiences/);
  assert.match(imageJs,/LOGO/);assert.match(imageJs,/BANNER/);assert.match(imageJs,/GameIndexCropEditor/);
  assert.doesNotMatch(imageJs,/class=\"focus-x\"|class=\"focus-y\"|Posição X|Posição Y/);
  assert.match(imageJs,/confirm\('Descartar as alterações de enquadramento\?'/);

  const html=readFileSync(path.join(root,'public/image-library.html'),'utf8');
  assert.match(html,/image-manager-hf1\.css\?v=(?:09875hf11imageinteractionfix|099finalfoundation|099i1visualgrounding|099i5production)/);
  assert.match(html,/image-crop-editor\.js\?v=(?:09875hf11imageinteractionfix|099finalfoundation|099i1visualgrounding|099i5production)/);
  assert.match(html,/Logo/);assert.match(html,/Banner/);assert.match(html,/quatro bolinhas/i);
  assert.doesNotMatch(html,/type=\"range\"/);

  const css=readFileSync(path.join(root,'public/css/image-manager-hf1.css'),'utf8');
  for(const cls of ['.image-manager-shell','.image-tree','.gi-crop-stage','.gi-crop-handle-nw','.gi-crop-handle-ne','.gi-crop-handle-sw','.gi-crop-handle-se'])assert.ok(css.includes(cls),`missing ${cls}`);
  assert.match(css,/touch-action:none/);assert.match(css,/grid-template-columns:minmax\(250px,320px\)/);

  const expCss=readFileSync(path.join(root,'public/css/experience-engine.css'),'utf8');
  assert.match(expCss,/--gie-og-panel:#f7f8f9/);assert.match(expCss,/--gie-og-text:#20262d/);
  assert.match(expCss,/\.overview-card[\s\S]*color:var\(--gie-og-text\)!important/);
  assert.match(expCss,/\.header-search input\{background:transparent!important;color:#fff!important/);

  const routes=readFileSync(path.join(root,'src/api/beta0986-routes.mjs'),'utf8');
  assert.match(routes,/listGames, listGamesPage/);
  assert.match(routes,/app\.get\("\/api\/image-manager\/tree"/);
  assert.match(routes,/app\.get\("\/api\/image-manager\/game\/:game"/);
  assert.match(routes,/BETA_0_9875_HF1_1_IMAGE_INTERACTION_FIX|BETA_0_99_FINAL_FOUNDATION|BETA_0_99_I1_FOUNDATION_CORRECTION_VISUAL_GROUNDING|BETA_0_99_I2_INTELLIGENT_PROCEDURAL_EXPERIENCE_ENGINE|BETA_0_99_I3_GAME_SOURCED_VISUAL_COMPOSITION|BETA_0_99_I4_THREE_STAGE_UNIVERSE_PRODUCTION_PIPELINE|BETA_0_99_I5_PRODUCTION_CONSOLIDATION|BETA_0_99_I6_UNIVERSE_BUILDER_EXPERIENCE|INTERNAL_RELEASE_CODE/);

  for(const [lang,group] of [['pt-BR','Experiências'],['en-US','Experiences'],['es-ES','Experiencias']]){
    const loc=JSON.parse(readFileSync(path.join(root,`public/locales/${lang}.json`),'utf8'));
    assert.equal(loc['relationship.experiences'],group.toUpperCase());
    assert.ok(loc['image.manager.replace']);assert.ok(loc['image.editor.apply']);assert.ok(loc['image.editor.help']);
  }

  const server=readFileSync(path.join(root,'server.mjs'),'utf8');assert.match(server,/version:"(?:0\.9875-HF1\.1|0\.99|0\.99-I1|0\.99-I2|0\.99-I3|0\.99-I4|0\.99-I5|0\.99-I6(?:-HF[12])?)"/);assert.match(server,/BETA_0_9875_HF1_1_IMAGE_INTERACTION_FIX|BETA_0_99_FINAL_FOUNDATION|BETA_0_99_I1_FOUNDATION_CORRECTION_VISUAL_GROUNDING|BETA_0_99_I2_INTELLIGENT_PROCEDURAL_EXPERIENCE_ENGINE|BETA_0_99_I3_GAME_SOURCED_VISUAL_COMPOSITION|BETA_0_99_I4_THREE_STAGE_UNIVERSE_PRODUCTION_PIPELINE|BETA_0_99_I5_PRODUCTION_CONSOLIDATION|BETA_0_99_I6_UNIVERSE_BUILDER_EXPERIENCE|INTERNAL_RELEASE_CODE/);assert.match(server,/image-crop-editor/);assert.match(server,/image-manager-hf1/);
  const shell=readFileSync(path.join(root,'public/js/shell-0986.js'),'utf8');assert.match(shell,/seekTo\(0,true\)/);assert.match(shell,/playVideo\(\)/);assert.match(shell,/playerInstances=1/);
  const backup=readFileSync(path.join(root,'src/database/backup-manager.mjs'),'utf8');assert.match(backup,/GAMEINDEX_DB_BACKUP_RETENTION/);assert.match(backup,/gamevault\.sqlite/);
  const pkg=JSON.parse(readFileSync(path.join(root,'package.json'),'utf8'));assert.ok(['0.9875.2','0.99.0','0.99.1','0.99.2','0.99.3','0.99.4','0.99.5','0.99.6','0.99.6-1','0.99.6-2','0.991.0'].includes(pkg.version));assert.equal(pkg.scripts['test:hf1'],'node tests/beta09875-hf1-image-manager-ui.mjs');

  console.log(JSON.stringify({ok:true,release:'0.9875-HF1',schema:33,imageManager:'TREE_LOGO_BANNER',visualCrop:'FOUR_CORNER_POINTER_EDITOR',robloxOgIndependent:true,robloxChildren:5,contrast:'OG_SEMANTIC_TOKENS',browserAutomation:false,musicRegressionPreserved:true,backupRetentionPreserved:true,productionDbReset:false},null,2));
}finally{try{rmSync(temp,{recursive:true,force:true});}catch{}}
