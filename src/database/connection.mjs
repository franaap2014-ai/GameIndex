import { DatabaseSync } from "node:sqlite";
import { mkdirSync, readFileSync, copyFileSync, existsSync, statSync, readdirSync, writeFileSync, unlinkSync, renameSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createManagedDatabaseBackup } from "./backup-manager.mjs";
import { flushNeonSnapshot, markNeonSnapshotDirty, neonRemotePersistenceConfigured, neonRemotePersistenceState, restoreLatestNeonSnapshot, startNeonSnapshotRuntime } from "./neon-snapshot-persistence.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
export const projectRoot = path.resolve(here, "../..");

export function isAzureEnvironment() {
  return Boolean(process.env.WEBSITE_SITE_NAME||process.env.WEBSITE_INSTANCE_ID||process.env.WEBSITE_HOSTNAME||process.env.WEBSITE_HOME_STAMPNAME);
}

export function isRenderEnvironment() {
  return Boolean(process.env.RENDER||process.env.RENDER_SERVICE_ID||process.env.RENDER_EXTERNAL_HOSTNAME);
}

function explicitDatabasePath(){return process.env.GAMEINDEX_DB||process.env.GAMEVAULT_DB||"";}
function explicitDataRoot(){return process.env.GAMEINDEX_DATA_DIR||process.env.GAMEVAULT_DATA_DIR||"";}

function resolvePersistentRoot() {
  if (explicitDataRoot()) return path.resolve(explicitDataRoot());
  if (explicitDatabasePath()) return path.dirname(path.resolve(explicitDatabasePath()));
  // Azure App Service persists files below HOME. LOCALAPPDATA points at temporary
  // worker storage on Windows App Service and must not be used for the real DB.
  if (isAzureEnvironment()&&process.env.HOME) return path.join(path.resolve(process.env.HOME),"data","GameIndex");
  if (process.platform === "win32" && process.env.LOCALAPPDATA) return path.join(process.env.LOCALAPPDATA, "GameVault");
  // Preserve the legacy local directory so existing installations keep their data.
  return path.join(os.homedir(), ".gamevault");
}

export const persistentRoot = resolvePersistentRoot();
export const persistentDataDir = explicitDatabasePath() ? path.dirname(path.resolve(explicitDatabasePath())) : path.join(persistentRoot, "data");
export const avatarsDir = path.join(persistentRoot, "avatars");
export const backupsDir = path.join(persistentRoot, "backups");
export const databasePath = explicitDatabasePath() ? path.resolve(explicitDatabasePath()) : path.join(persistentDataDir, "gamevault.sqlite");
export const storageOrigin = neonRemotePersistenceConfigured()?"NEON_REMOTE_SQLITE_SNAPSHOT":explicitDatabasePath()?"EXPLICIT_DATABASE":explicitDataRoot()?"EXPLICIT_DATA_DIR":isAzureEnvironment()?"AZURE_HOME":process.platform==="win32"?"WINDOWS_LOCALAPPDATA":"LOCAL_HOME";

export function productionStorageSafety(){
  const production=String(process.env.NODE_ENV||"").toLowerCase()==="production"||isAzureEnvironment()||isRenderEnvironment();
  const remote=neonRemotePersistenceConfigured();
  const render=isRenderEnvironment();
  const explicitLocal=storageOrigin.startsWith("EXPLICIT");
  // Render local storage is always treated as ephemeral in the Free deployment path.
  // A GAMEINDEX_DB/GAMEINDEX_DATA_DIR value must never satisfy production persistence on Render.
  const localPersistent=!render&&(storageOrigin==="AZURE_HOME"||explicitLocal);
  const persistent=render?remote:(remote||localPersistent);
  const reason=!production||persistent?(remote?"NEON_REMOTE_PERSISTENCE":"PERSISTENT_OR_LOCAL_DEV"):"EPHEMERAL_PRODUCTION_STORAGE";
  return {production,persistent,remote,render,safe:!production||persistent,origin:storageOrigin,provider:remote?"NEON_REMOTE_SQLITE_SNAPSHOT":"LOCAL_SQLITE",reason};
}

const startupStorageSafety=productionStorageSafety();
if(startupStorageSafety.production&&!startupStorageSafety.safe){
  const emergencyOverride=String(process.env.GAMEINDEX_ALLOW_EPHEMERAL_PRODUCTION||"").toLowerCase()==="true";
  // Render production must always use Neon. Local SQLite is only a temporary runtime cache there,
  // and neither GAMEINDEX_DB/GAMEINDEX_DATA_DIR nor the emergency override can make it durable.
  if(startupStorageSafety.render||!emergencyOverride){
    throw new Error("GAMEINDEX_PERSISTENT_STORAGE_REQUIRED: Render production requires DATABASE_URL for the GameIndex Neon PostgreSQL database. Local SQLite paths are temporary and are never accepted as persistent storage.");
  }
}

for (const dir of [persistentRoot, persistentDataDir, avatarsDir, backupsDir]) mkdirSync(dir, { recursive:true });

const legacyBundledDb = path.join(projectRoot, "data", "gamevault-beta.sqlite");

function safeCopyIfMissing(source, target) {
  if (!existsSync(source) || statSync(source).size < 1024 || !verifyDatabase(source).ok) return false;
  if (existsSync(target)) {
    if (verifyDatabase(target).ok) return false;
    const stamp=new Date().toISOString().replace(/[:.]/g,"-");
    const preserved=path.join(backupsDir,`invalid-database-preserved-${stamp}.sqlite`);
    copyFileSync(target,preserved);
    unlinkSync(target);
  }
  mkdirSync(path.dirname(target), { recursive:true });
  const temporary=`${target}.initial-${process.pid}-${Date.now()}`;
  try{
    copyFileSync(source,temporary);
    if(!verifyDatabase(temporary).ok)throw new Error("INITIAL_DATABASE_COPY_INVALID");
    renameSync(temporary,target);
  }catch(error){rmSync(temporary,{force:true});throw error;}
  return true;
}

let remoteRestoreState={configured:neonRemotePersistenceConfigured(),restored:false,provider:neonRemotePersistenceConfigured()?"NEON":"NONE",reason:"NOT_CONFIGURED"};
if(neonRemotePersistenceConfigured()){
  try{remoteRestoreState=await restoreLatestNeonSnapshot({databasePath,verifyDatabase});}
  catch(error){
    if(startupStorageSafety.production)throw new Error(`GAMEINDEX_NEON_RESTORE_FAILED: ${String(error?.message||error).slice(0,500)}`);
    console.warn("[GameIndex persistence] Neon restore failed in non-production; local SQLite fallback remains available.");
  }
}

// First local run gets the curated Beta 0.65 database only when no persistent DB exists.
// In Render + Neon mode a complete remote SQLite snapshot wins; if Neon is empty,
// the curated database is used once and immediately bootstrapped back to Neon.
if (!explicitDatabasePath()) safeCopyIfMissing(legacyBundledDb, databasePath);

let openedReadOnly=false;
function openDatabase(){
  if(String(process.env.GAMEINDEX_READ_ONLY||"").toLowerCase()==="true"||process.env.GAMEINDEX_READ_ONLY==="1"){
    openedReadOnly=true;
    return new DatabaseSync(databasePath,{readOnly:true,timeout:5000});
  }
  try{return new DatabaseSync(databasePath,{timeout:5000});}
  catch(error){
    if(!existsSync(databasePath))throw error;
    openedReadOnly=true;
    return new DatabaseSync(databasePath,{readOnly:true,timeout:5000});
  }
}
const rawDb = openDatabase();
function mutatingSql(sql=""){return /\b(?:INSERT|UPDATE|DELETE|REPLACE|CREATE|ALTER|DROP|VACUUM|REINDEX)\b/i.test(String(sql||""));}
function criticalSql(sql=""){return /\b(?:users|sessions|subscriptions|staff_role_assignments|user_profiles|user_preferences|user_favorite_games|profile_avatar_catalog|user_profile_avatar_selections|cinematic_events|cinematic_admin_actions|cinematic_test_runs|game_cutscene_bindings|bugs|bug_diagnostics|universes|universe_|creator_|social_|admin_|animation_)\b/i.test(String(sql||""));}
function wrapStatement(statement,sql){
  if(!mutatingSql(sql))return statement;
  return new Proxy(statement,{get(target,prop){
    if(prop==="run")return (...args)=>{const result=target.run(...args);markNeonSnapshotDirty({critical:criticalSql(sql),reason:"sqlite-write"});return result;};
    const value=target[prop];return typeof value==="function"?value.bind(target):value;
  }});
}
export const db = new Proxy(rawDb,{get(target,prop){
  if(prop==="prepare")return sql=>wrapStatement(target.prepare(sql),sql);
  if(prop==="exec")return sql=>{const result=target.exec(sql);if(mutatingSql(sql))markNeonSnapshotDirty({critical:criticalSql(sql),reason:"sqlite-exec"});return result;};
  const value=target[prop];return typeof value==="function"?value.bind(target):value;
}});
try{db.exec("PRAGMA foreign_keys = ON;");}catch{}
try{db.exec("PRAGMA journal_mode = WAL;");}catch{openedReadOnly=true;}
try{db.exec("PRAGMA synchronous = FULL;");}catch{}

function readMigration(name) { return readFileSync(path.join(here, "migrations", name), "utf8"); }
function tableExists(name) { return Boolean(db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`).get(name)); }
function schemaVersionNumber() {
  try { return Number(db.prepare(`SELECT value FROM meta WHERE key='schema_version'`).get()?.value || 0); }
  catch { return 0; }
}

export function schemaVersion() { return schemaVersionNumber(); }

export function verifyDatabase(targetPath=databasePath) {
  if (!existsSync(targetPath) || statSync(targetPath).size < 1024) return {ok:false,reason:"MISSING_OR_EMPTY"};
  let test;
  try {
    test=new DatabaseSync(targetPath,{readOnly:true});
    const integrity=test.prepare("PRAGMA integrity_check").get();
    const hasUsers=Boolean(test.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name='users'`).get());
    const hasGames=Boolean(test.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name='games'`).get());
    test.close();
    return {ok:String(integrity?.integrity_check||"").toLowerCase()==="ok"&&hasUsers&&hasGames,integrity:integrity?.integrity_check||"unknown",hasUsers,hasGames};
  } catch(error){ try{test?.close();}catch{} return {ok:false,reason:error.message}; }
}

export function testDatabaseRead(){
  try{const games=Number(db.prepare(`SELECT COUNT(*) count FROM games`).get()?.count||0);return {ok:true,games};}
  catch(error){return {ok:false,error:String(error.message||error).slice(0,300)};}
}

export function testDatabaseWrite(){
  if(openedReadOnly)return {ok:false,readOnly:true,error:"DATABASE_OPENED_READ_ONLY"};
  const key=`runtime_write_probe_${process.pid}_${Date.now()}`;
  try{
    db.exec("BEGIN IMMEDIATE");
    db.prepare(`INSERT INTO meta(key,value) VALUES(?,?)`).run(key,nowIso());
    db.exec("ROLLBACK");
    return {ok:true,rolledBack:true};
  }catch(error){try{db.exec("ROLLBACK");}catch{}openedReadOnly=true;return {ok:false,readOnly:true,error:String(error.message||error).slice(0,300)};}
}

export function storageWritable(){
  const probe=path.join(persistentRoot,`.gameindex-write-${process.pid}-${Date.now()}`);
  try{writeFileSync(probe,"ok",{flag:"wx"});unlinkSync(probe);return true;}catch{return false;}
}

export function databaseStorageState({includePath=false,probeWrite=false}={}){
  const read=testDatabaseRead(),write=probeWrite?testDatabaseWrite():{ok:!openedReadOnly&&!read.error,notProbed:true};
  let stats=null;try{stats=statSync(databasePath);}catch{}
  const remote=neonRemotePersistenceState(),safety=productionStorageSafety(),persistent=safety.persistent;
  return {status:!read.ok?"unavailable":write.ok?"ready":"read_only",origin:storageOrigin,azure:isAzureEnvironment(),render:isRenderEnvironment(),persistent,provider:remote.configured?"NEON_REMOTE_SQLITE_SNAPSHOT":"LOCAL_SQLITE",read:read.ok,write:write.ok,readOnly:!write.ok,games:read.games||0,sizeBytes:stats?.size||0,modifiedAt:stats?.mtime?.toISOString?.()||"",latestBackup:latestBackup(),remote:{...remote,restore:remoteRestoreState},...(includePath?{databasePath,persistentRoot,backupsDir}:{})};
}

export function createDatabaseBackup({fromVersion="unknown",toVersion="0.96",label="migration"}={}) {
  const result=createManagedDatabaseBackup({
    databasePath,
    backupsDir,
    fromVersion,
    toVersion,
    label,
    checkpoint:()=>{try{db.exec("PRAGMA wal_checkpoint(FULL);");}catch{}},
    verify:target=>verifyDatabase(target)
  });
  if(result){
    const removed=[...(result.preRotation?.removed||[]),...(result.emergencyRemoved||[]),...(result.postRotation?.removed||[])];
    if(removed.length)console.info(`[GameIndex DB] backup retention removed ${removed.length} old artifact(s): ${removed.join(', ')}`);
    console.info(`[GameIndex DB] migration backup ready: ${result.filename} (${result.sourceSizeBytes} bytes, retention=${result.retention})`);
  }
  return result;
}

function setSchemaVersion(version) {
  db.prepare(`INSERT INTO meta(key,value) VALUES('schema_version',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value`).run(String(version));
}

function recordMigration(version,name,status="APPLIED") {
  if (!tableExists("schema_migrations")) return;
  const id=`schema-${version}-${name}`;
  db.prepare(`INSERT INTO schema_migrations(migration_id,version,name,applied_at,status) VALUES(?,?,?,?,?) ON CONFLICT(migration_id) DO UPDATE SET status=excluded.status,applied_at=excluded.applied_at`).run(id,String(version),name,new Date().toISOString(),status);
}


function normalizeLegacyUsername(value="") {
  return String(value??"").normalize("NFKC").trim().toLocaleLowerCase("en-US");
}

function finalizeBeta0675IdentityMigration(){
  const rows=db.prepare(`SELECT p.user_id,p.username,u.created_at FROM user_profiles p JOIN users u ON u.id=p.user_id ORDER BY u.created_at,p.user_id`).all();
  const groups=new Map();
  for(const row of rows){
    const normalized=normalizeLegacyUsername(row.username);
    if(!groups.has(normalized))groups.set(normalized,[]);
    groups.get(normalized).push(row);
  }
  db.prepare(`DELETE FROM username_conflicts`).run();
  const update=db.prepare(`UPDATE user_profiles SET normalized_username=? WHERE user_id=?`);
  const conflict=db.prepare(`INSERT INTO username_conflicts(id,normalized_username,user_id,original_username,status,created_at,resolved_at) VALUES(?,?,?,?,?,?,?)`);
  const now=new Date().toISOString();
  for(const [normalized,members] of groups){
    if(members.length===1){update.run(normalized,members[0].user_id);continue;}
    members.forEach((member,index)=>{
      update.run(index===0?normalized:`__conflict__${member.user_id}`,member.user_id);
      conflict.run(`username-conflict-${member.user_id}`,normalized,member.user_id,member.username,"OPEN",now,"");
    });
  }
  db.exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_normalized_username_unique ON user_profiles(normalized_username)`);
  const adminMatches=rows.filter(row=>normalizeLegacyUsername(row.username)==="franchesco01");
  if(adminMatches.length===1){
    db.prepare(`UPDATE users SET role='ADMIN',updated_at=? WHERE id=?`).run(now,adminMatches[0].user_id);
    db.prepare(`INSERT INTO meta(key,value) VALUES('admin_setup_required','0') ON CONFLICT(key) DO UPDATE SET value='0'`).run();
    db.prepare(`INSERT INTO meta(key,value) VALUES('primary_admin_user_id',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value`).run(adminMatches[0].user_id);
  }else{
    db.prepare(`INSERT INTO meta(key,value) VALUES('admin_setup_required','1') ON CONFLICT(key) DO UPDATE SET value='1'`).run();
  }
}

function finalizeBeta095AuthorizationMigration(){
  const now=nowIso();
  const primaryAdminId=String(db.prepare(`SELECT value FROM meta WHERE key='primary_admin_user_id'`).get()?.value||"");
  const primary=primaryAdminId?db.prepare(`SELECT id FROM users WHERE id=?`).get(primaryAdminId):null;
  if(!primary){
    db.prepare(`INSERT INTO meta(key,value) VALUES('creator_setup_required','1') ON CONFLICT(key) DO UPDATE SET value='1'`).run();
    return;
  }
  const existingCreator=db.prepare(`SELECT user_id FROM staff_role_assignments WHERE role='CREATOR'`).get();
  if(existingCreator&&existingCreator.user_id!==primary.id)throw new Error("CREATOR_ID_CONFLICT");
  db.prepare(`INSERT INTO staff_role_assignments(user_id,role,suspended,assigned_by,reason,created_at,updated_at) VALUES(?, 'CREATOR',0,?,'Schema 18: verified primary owner ID',?,?) ON CONFLICT(user_id) DO UPDATE SET role='CREATOR',suspended=0,updated_at=excluded.updated_at`).run(primary.id,primary.id,now,now);
  db.prepare(`INSERT INTO staff_role_assignments(user_id,role,suspended,assigned_by,reason,created_at,updated_at)
    SELECT u.id,'DEV',0,?, 'Schema 18: legacy ADMIN/DEV compatibility',?,?
    FROM users u WHERE u.id<>? AND u.role='ADMIN' AND u.account_tier='DEV'
    ON CONFLICT(user_id) DO NOTHING`).run(primary.id,now,now,primary.id);
  db.prepare(`INSERT INTO meta(key,value) VALUES('primary_creator_user_id',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value`).run(primary.id);
  db.prepare(`INSERT INTO meta(key,value) VALUES('creator_setup_required','0') ON CONFLICT(key) DO UPDATE SET value='0'`).run();
}


function finalizeBeta0986HF2ExperienceMigration(){
  const now=nowIso();
  const roblox=db.prepare(`SELECT id,slug,name FROM games WHERE lower(slug)='roblox' OR lower(name)='roblox' ORDER BY CASE WHEN lower(slug)='roblox' THEN 0 ELSE 1 END LIMIT 1`).get();
  if(!roblox){
    db.prepare(`INSERT INTO meta(key,value) VALUES('roblox_experience_setup','PARENT_MISSING') ON CONFLICT(key) DO UPDATE SET value=excluded.value`).run();
    return;
  }
  const childSpecs=[
    {slug:'blox-fruits',name:'Blox Fruits',order:10,theme:{identity:'blox-fruits',surface:'ocean-adventure',accent:'#4aa3ff',accent2:'#ffb23e',radius:18},fonts:{display:'Impact, Haettenschweiler, Arial Narrow Bold, sans-serif',heading:'Trebuchet MS, Arial, sans-serif',body:'Inter, Segoe UI, Arial, sans-serif',letterSpacing:'0.015em'},menu:[['overview','Visão geral'],['characters','Personagens'],['islands','Ilhas'],['factions','Facções'],['universe','Universo'],['media','Mídia'],['music','Música']]},
    {slug:'doors',name:'DOORS',order:20,theme:{identity:'doors',surface:'dark-architectural',accent:'#cfa96a',accent2:'#6e5c46',radius:8},fonts:{display:'Georgia, Times New Roman, serif',heading:'Georgia, Times New Roman, serif',body:'Segoe UI, Arial, sans-serif',letterSpacing:'0.045em'},menu:[['overview','Visão geral'],['entities','Entidades'],['areas','Andares / Áreas'],['universe','Universo'],['media','Mídia'],['music','Música']]},
    {slug:'fisch',name:'Fisch',order:30,theme:{identity:'fisch',surface:'aquatic-calm',accent:'#62d9ff',accent2:'#79f0d4',radius:22},fonts:{display:'Trebuchet MS, Segoe UI, sans-serif',heading:'Trebuchet MS, Segoe UI, sans-serif',body:'Segoe UI, Arial, sans-serif',letterSpacing:'0.01em'},menu:[['overview','Visão geral'],['locations','Locais'],['collections','Peixes / Coleções'],['characters','Personagens'],['universe','Universo'],['media','Mídia'],['music','Música']]},
    {slug:'work-at-a-pizza-place',name:'Work at a Pizza Place',order:40,theme:{identity:'pizza-place',surface:'warm-classic',accent:'#ffb34d',accent2:'#ef6d5b',radius:16},fonts:{display:'Trebuchet MS, Verdana, sans-serif',heading:'Trebuchet MS, Verdana, sans-serif',body:'Verdana, Segoe UI, sans-serif',letterSpacing:'0'},menu:[['overview','Visão geral'],['jobs','Trabalhos'],['locations','Locais'],['characters','Personagens'],['universe','Universo'],['media','Mídia'],['music','Música']]},
    {slug:'prison-life',name:'Prison Life',order:50,theme:{identity:'prison-life',surface:'urban-tactical',accent:'#f08a45',accent2:'#9da4ad',radius:6},fonts:{display:'Arial Narrow, Impact, Arial, sans-serif',heading:'Arial Narrow, Arial, sans-serif',body:'Segoe UI, Arial, sans-serif',letterSpacing:'0.055em'},menu:[['overview','Visão geral'],['teams','Times'],['locations','Locais'],['gameplay','Gameplay'],['characters','Personagens'],['universe','Universo'],['media','Mídia'],['music','Música']]}
  ];
  const insertGame=db.prepare(`INSERT INTO games(id,slug,name,description,developer,publisher,release_date,platforms_json,genres_json,franchise,official_url,status,template,aliases_json,visual_query,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  const link=db.prepare(`INSERT INTO game_parent_links(child_game_id,parent_game_id,relation_type,display_order,enabled,created_at,updated_at) VALUES(?,?, 'ROBLOX_EXPERIENCE',?,1,?,?) ON CONFLICT(child_game_id) DO UPDATE SET parent_game_id=excluded.parent_game_id,relation_type=excluded.relation_type,display_order=excluded.display_order,enabled=1,updated_at=excluded.updated_at`);
  const profile=db.prepare(`INSERT INTO game_experience_profiles(game_id,experience_key,experience_type,parent_game_id,slug,label,subtitle,theme_json,font_json,menu_json,music_slot,logo_slot,hero_slot,background_slot,card_slot,enabled,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(game_id,experience_key) DO UPDATE SET experience_type=excluded.experience_type,parent_game_id=excluded.parent_game_id,slug=excluded.slug,label=excluded.label,subtitle=excluded.subtitle,theme_json=excluded.theme_json,font_json=excluded.font_json,menu_json=excluded.menu_json,music_slot=excluded.music_slot,logo_slot=excluded.logo_slot,hero_slot=excluded.hero_slot,background_slot=excluded.background_slot,card_slot=excluded.card_slot,enabled=excluded.enabled,updated_at=excluded.updated_at`);
  const compatExp=db.prepare(`INSERT INTO game_experiences(game_id,experience_key,label,background_slot,hero_slot,music_slot,accent_json,enabled,created_at,updated_at) VALUES(?,?,?,?,?,?,?,1,?,?) ON CONFLICT(game_id,experience_key) DO UPDATE SET label=excluded.label,background_slot=excluded.background_slot,hero_slot=excluded.hero_slot,music_slot=excluded.music_slot,accent_json=excluded.accent_json,enabled=1,updated_at=excluded.updated_at`);
  const tabInsert=db.prepare(`INSERT OR IGNORE INTO game_tabs(id,game_id,tab_id,label,icon,description,position) VALUES(?,?,?,?,?,?,?)`);
  const sectionInsert=db.prepare(`INSERT OR IGNORE INTO game_sections(id,game_id,tab_id,section_id,label,description,position) VALUES(?,?,?,?,?,?,?)`);

  const modernTheme={identity:'roblox-modern',surface:'roblox-dark',accent:'#9aa0a6',accent2:'#ffffff',radius:10,blendUserTheme:true};
  const modernFonts={display:'Inter, Segoe UI, Arial, sans-serif',heading:'Inter, Segoe UI, Arial, sans-serif',body:'Inter, Segoe UI, Arial, sans-serif',weight:700,letterSpacing:'-0.015em'};
  const modernMenu=[['overview','Visão geral'],['universe','Universo'],['experiences','Experiências'],['characters','Personagens'],['media','Mídia']];
  const ogTheme={identity:'roblox-og-2009',surface:'classic-web',accent:'#b8b8b8',accent2:'#2f78c4',radius:3,blendUserTheme:true};
  const ogFonts={display:'Arial Black, Arial, Helvetica, sans-serif',heading:'Arial, Helvetica, sans-serif',body:'Arial, Helvetica, sans-serif',weight:700,letterSpacing:'0'};
  const ogMenu=[['overview','Visão geral'],['experiences','Experiências'],['universe','Universo'],['characters','Personagens'],['media','Mídia']];
  profile.run(roblox.id,'main','GAME_VARIANT',null,'roblox-modern','Roblox Modern','Experiência atual do Roblox no GameIndex.',JSON.stringify(modernTheme),JSON.stringify(modernFonts),JSON.stringify(modernMenu.map(([id,label],i)=>({id,label,order:(i+1)*10}))), 'main','COVER','HERO','PAGE_BACKGROUND','COVER',1,now,now);
  profile.run(roblox.id,'roblox-og','GAME_VARIANT',null,'roblox-og-2009','Roblox OG 2009','Variante clássica inspirada no Roblox de 2009.',JSON.stringify(ogTheme),JSON.stringify(ogFonts),JSON.stringify(ogMenu.map(([id,label],i)=>({id,label,order:(i+1)*10}))), 'roblox-og','ARTWORK','HERO','ARTWORK','ARTWORK',1,now,now);
  compatExp.run(roblox.id,'main','Roblox Modern','PAGE_BACKGROUND','HERO','main',JSON.stringify({'--experience-accent':'#9aa0a6'}),now,now);
  compatExp.run(roblox.id,'roblox-og','Roblox OG 2009','ARTWORK','HERO','roblox-og',JSON.stringify({'--experience-accent':'#b8b8b8'}),now,now);

  for(const spec of childSpecs){
    let child=db.prepare(`SELECT id,slug,name FROM games WHERE lower(slug)=lower(?) OR lower(name)=lower(?) ORDER BY CASE WHEN lower(slug)=lower(?) THEN 0 ELSE 1 END LIMIT 1`).get(spec.slug,spec.name,spec.slug);
    if(!child){
      const id=`gi_hf2_${spec.slug.replace(/[^a-z0-9]+/g,'_')}`;
      insertGame.run(id,spec.slug,spec.name,'Experiência do Roblox catalogada no GameIndex. O conteúdo detalhado usa apenas dados locais verificados.','','','',JSON.stringify(['Roblox']),JSON.stringify([]),'Roblox','', 'PUBLISHED','generic',JSON.stringify([]),spec.name,now,now);
      child={id,slug:spec.slug,name:spec.name};
    }
    link.run(child.id,roblox.id,spec.order,now,now);
    const menu=spec.menu.map(([id,label],i)=>({id,label,order:(i+1)*10}));
    profile.run(child.id,'main','CHILD_GAME',roblox.id,spec.slug,spec.name,`Experiência Roblox · ${spec.name}`,JSON.stringify(spec.theme),JSON.stringify(spec.fonts),JSON.stringify(menu),'main','COVER','HERO','PAGE_BACKGROUND','COVER',1,now,now);
    compatExp.run(child.id,'main',spec.name,'PAGE_BACKGROUND','HERO','main',JSON.stringify({'--experience-accent':spec.theme.accent}),now,now);
    for(const [i,[tabId,label]] of spec.menu.entries()){
      const tabIdPk=`hf2_tab_${spec.slug}_${tabId}`.replace(/[^a-zA-Z0-9_-]/g,'_');
      tabInsert.run(tabIdPk,child.id,tabId,label,'•','',i);
      const secId=`hf2_sec_${spec.slug}_${tabId}_summary`.replace(/[^a-zA-Z0-9_-]/g,'_');
      sectionInsert.run(secId,child.id,tabId,'summary',label,'',0);
    }
  }
  db.prepare(`INSERT INTO meta(key,value) VALUES('roblox_experience_setup','READY') ON CONFLICT(key) DO UPDATE SET value=excluded.value`).run();
}

function finalizeBeta0987PersonalizationMigration(){
  const now=nowIso();
  const roblox=db.prepare(`SELECT id FROM games WHERE lower(slug)='roblox' OR lower(name)='roblox' ORDER BY CASE WHEN lower(slug)='roblox' THEN 0 ELSE 1 END LIMIT 1`).get();
  if(!roblox){
    db.prepare(`INSERT INTO meta(key,value) VALUES('beta_0987_roblox_personalization','PARENT_MISSING') ON CONFLICT(key) DO UPDATE SET value=excluded.value`).run();
    return;
  }
  const updateProfile=db.prepare(`UPDATE game_experience_profiles SET theme_json=?,font_json=?,component_json=?,motion_json=?,default_era_key=?,label=?,subtitle=?,logo_slot=?,hero_slot=?,background_slot=?,card_slot=?,music_slot=?,updated_at=? WHERE game_id=? AND experience_key=?`);
  const modernTheme={identity:'roblox-modern',surface:'gi-roblox-modern',accent:'#a7adb5',accent2:'#ffffff',radius:12,blendUserTheme:true};
  const modernFonts={display:'Inter, Segoe UI, Arial, sans-serif',heading:'Inter, Segoe UI, Arial, sans-serif',body:'Inter, Segoe UI, Arial, sans-serif',weight:750,letterSpacing:'-0.012em'};
  const modernComponents={header:'ecosystem-modern',gameCard:'modern',navigation:'ecosystem-modern',panel:'modern-soft',button:'modern-flat',density:'comfortable'};
  const modernMotion={durationMs:220,reducedMotionSafe:true};
  const classicTheme={identity:'roblox-og-classic',surface:'classic-web',accent:'#2f78c4',accent2:'#d52b2b',radius:4,blendUserTheme:true,classicWeb:true};
  const classicFonts={display:'Arial Black, Arial, Helvetica, sans-serif',heading:'Arial, Helvetica, sans-serif',body:'Arial, Helvetica, sans-serif',weight:700,letterSpacing:'0'};
  const classicComponents={header:'ecosystem-classic',gameCard:'classic-grid',navigation:'ecosystem-classic',panel:'classic-web',button:'classic-rectangular',density:'compact'};
  const classicMotion={durationMs:210,reducedMotionSafe:true};
  updateProfile.run(JSON.stringify(modernTheme),JSON.stringify(modernFonts),JSON.stringify(modernComponents),JSON.stringify(modernMotion),'modern','Roblox Modern','Game Index × Roblox moderno.','COVER','HERO','PAGE_BACKGROUND','COVER','main',now,roblox.id,'main');
  updateProfile.run(JSON.stringify(classicTheme),JSON.stringify(classicFonts),JSON.stringify(classicComponents),JSON.stringify(classicMotion),'classic-web','Roblox OG','Game Index × linguagem visual clássica do Roblox da metade dos anos 2010.','COVER','HERO','ARTWORK','COVER','roblox-og',now,roblox.id,'roblox-og');

  const era=db.prepare(`INSERT INTO game_era_profiles(game_id,experience_key,era_key,label,subtitle,theme_json,font_json,component_json,motion_json,music_slot,enabled,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,1,?,?) ON CONFLICT(game_id,experience_key,era_key) DO UPDATE SET label=excluded.label,subtitle=excluded.subtitle,theme_json=excluded.theme_json,font_json=excluded.font_json,component_json=excluded.component_json,motion_json=excluded.motion_json,music_slot=excluded.music_slot,enabled=1,updated_at=excluded.updated_at`);
  era.run(roblox.id,'main','modern','Modern','Interface contemporânea do ecossistema Roblox reinterpretada pelo Game Index.',JSON.stringify({}),JSON.stringify({}),JSON.stringify(modernComponents),JSON.stringify(modernMotion),'main',now,now);
  era.run(roblox.id,'roblox-og','classic-web','Classic Web','Identidade web clássica inspirada na metade dos anos 2010, sem copiar a estrutura histórica do site Roblox.',JSON.stringify({classicBlue:'#2f78c4',classicRed:'#d52b2b'}),JSON.stringify({}),JSON.stringify(classicComponents),JSON.stringify(classicMotion),'roblox-og',now,now);

  // Child games keep their own identity while being able to inherit the selected Roblox ecosystem component language.
  db.prepare(`UPDATE game_experience_profiles SET motion_json=CASE WHEN motion_json='{}' THEN '{"durationMs":220,"reducedMotionSafe":true}' ELSE motion_json END,updated_at=? WHERE parent_game_id=? AND experience_type='CHILD_GAME'`).run(now,roblox.id);
  db.prepare(`INSERT INTO meta(key,value) VALUES('beta_0987_roblox_personalization','READY') ON CONFLICT(key) DO UPDATE SET value=excluded.value`).run();
}

export function migrateDatabase() {
  // 001 is idempotent and creates meta on a new database.
  db.exec(readMigration("001_init.sql"));
  let version=schemaVersionNumber();
  if (version < 1) { setSchemaVersion(1); version=1; }

  const steps=[
    {version:2,file:"002_beta_06.sql",name:"beta-0.6",toVersion:"0.6"},
    {version:3,file:"003_beta_065.sql",name:"beta-0.65",toVersion:"0.65"},
    {version:4,file:"004_beta_067.sql",name:"beta-0.67",toVersion:"0.67"},
    {version:5,file:"005_beta_0675.sql",name:"beta-0.675",toVersion:"0.675"},
    {version:6,file:"006_beta_07.sql",name:"beta-0.7",toVersion:"0.7"},
    {version:7,file:"007_beta_0705.sql",name:"beta-0.705",toVersion:"0.705"},
    {version:8,file:"008_beta_08.sql",name:"beta-0.8",toVersion:"0.8"},
    {version:9,file:"009_beta_085.sql",name:"beta-0.85",toVersion:"0.85"},
    {version:10,file:"010_beta_086.sql",name:"beta-0.86",toVersion:"0.86"},
    {version:11,file:"011_beta_087.sql",name:"beta-0.87",toVersion:"0.87"},
    {version:12,file:"012_beta_088.sql",name:"beta-0.88",toVersion:"0.88"},
    {version:13,file:"013_beta_0885.sql",name:"beta-0.885",toVersion:"0.885"},
    {version:14,file:"014_beta_089.sql",name:"beta-0.89",toVersion:"0.89"},
    {version:15,file:"015_beta_09.sql",name:"beta-0.9",toVersion:"0.9"},
    {version:16,file:"016_beta_091.sql",name:"beta-0.91",toVersion:"0.91"},
    {version:17,file:"017_beta_092.sql",name:"beta-0.92",toVersion:"0.92"},
    {version:18,file:"018_beta_095.sql",name:"beta-0.95",toVersion:"0.95"},
    {version:19,file:"019_beta_096.sql",name:"beta-0.96",toVersion:"0.96"},
    {version:20,file:"020_beta_097.sql",name:"beta-0.97",toVersion:"0.97"},
    {version:21,file:"021_beta_097_bf.sql",name:"beta-0.97-bf",toVersion:"0.97-BF"},
    {version:22,file:"022_beta_0975_bf.sql",name:"beta-0.975-bf",toVersion:"0.975-BF"},
    {version:23,file:"023_beta_0975_bf_pre_public.sql",name:"beta-0.975-bf-pre-public",toVersion:"0.975-BF-PRE-PUBLIC"},
    {version:24,file:"024_beta_098.sql",name:"beta-0.98",toVersion:"0.98"},
    {version:25,file:"025_beta_0985.sql",name:"beta-0.985",toVersion:"0.985"},
    {version:26,file:"026_beta_0985_hf2.sql",name:"beta-0.985-hf2",toVersion:"0.985-HF2"},
    {version:27,file:"027_beta_0985_hf3.sql",name:"beta-0.985-hf3",toVersion:"0.985-HF3"},
    {version:28,file:"028_beta_0985_hf4.sql",name:"beta-0.985-hf4",toVersion:"0.985-HF4"},
    {version:29,file:"029_beta_0986.sql",name:"beta-0.986",toVersion:"0.986"},
    {version:30,file:"030_beta_0986_hf2.sql",name:"beta-0.986-hf2",toVersion:"0.986-HF2"},
    {version:31,file:"031_beta_0986_hf2_experience_media.sql",name:"beta-0.986-hf2-experience-media",toVersion:"0.986-HF2"},
    {version:32,file:"032_beta_0987.sql",name:"beta-0.987-final-personalization",toVersion:"0.987"},
    {version:33,file:"033_beta_09875.sql",name:"beta-0.9875-full-page-personalization",toVersion:"0.9875"},
    {version:34,file:"034_beta_099.sql",name:"beta-0.99-final-foundation",toVersion:"0.99"},
    {version:35,file:"035_beta_099_i2.sql",name:"beta-0.99-i2-intelligent-procedural-experience-engine",toVersion:"0.99-I2"},
    {version:36,file:"036_beta_099_i3.sql",name:"beta-0.99-i3-game-sourced-visual-composition",toVersion:"0.99-I3"},
    {version:37,file:"037_beta_099_i4.sql",name:"beta-0.99-i4-three-stage-universe-production-pipeline",toVersion:"0.99-I4"},
    {version:38,file:"038_beta_099_i5.sql",name:"beta-0.99-i5-production-consolidation",toVersion:"0.99-I5"},
    {version:39,file:"039_beta_099_i6.sql",name:"beta-0.99-i6-universe-builder-experience",toVersion:"0.99-I6"},
    {version:40,file:"040_beta_099_i6_hf1.sql",name:"beta-0.99-i6-hf1-build-reliability",toVersion:"0.99-I6-HF1"},
    {version:41,file:"041_beta_0991_hf1.sql",name:"beta-0.991-hf1-identity-restoration",toVersion:"0.991-HF1"},
    {version:42,file:"042_beta_0991_i1.sql",name:"beta-0.991-i1-reliability-navigation-diagnostics",toVersion:"0.991-I1"},
    {version:43,file:"043_beta_0991_i1_hf1.sql",name:"beta-0.991-i1-hf1-neon-persistence",toVersion:"0.991-I1-HF1"},
    {version:44,file:"044_beta_0991_i1_hf2.sql",name:"beta-0.991-i1-hf2-creator-animation-editor",toVersion:"0.991-I1-HF2"},
    {version:45,file:"045_beta_09915_cinematic_update.sql",name:"beta-0.9915-cinematic-update",toVersion:"0.9915"},
    {version:46,file:"046_beta_09915_i1_hf1_full_recovery.sql",name:"beta-0.9915-i1-hf1-full-recovery",toVersion:"0.9915-I1-HF1"},
    {version:47,file:"047_beta_09915_i1_hf2_audit.sql",name:"beta-0.9915-i1-hf2-audit",toVersion:"0.9915-I1-HF2"}
  ];

  const targetSchema=Math.min(47,Math.max(1,Number(process.env.GAMEINDEX_TARGET_SCHEMA||47)||47));

  for (const step of steps) {
    if(step.version>targetSchema)break;
    if (version >= step.version) continue;
    const from=version===1?"0.5":version===2?"0.6":version===3?"0.65":version===4?"0.67":version===5?"0.675":version===6?"0.7":version===7?"0.705":version===8?"0.8":version===9?"0.85":version===10?"0.86":version===11?"0.87":version===12?"0.88":version===13?"0.885":version===14?"0.89":version===15?"0.9":version===16?"0.91":version===17?"0.92":version===18?"0.95":version===19?"0.96":version===20?"0.97":version===21?"0.97-BF":version===22?"0.975-BF":version===23?"0.975-BF-PRE-PUBLIC":version===24?"0.98":version===25?"0.985":version===26?"0.985-HF2":version===27?"0.985-HF3":version===28?"0.985-HF4":version===29?"0.986":version===30?"0.986-HF2":version===31?"0.986-HF2":version===32?"0.987":version===33?"0.9875":version===34?"0.99-I1":version===35?"0.99-I2":version===36?"0.99-I3":version===37?"0.99-I4":version===38?"0.99-I5":version===39?"0.99-I6":version===40?"0.99-I6-HF1":version===41?"0.991-HF1":version===42?"0.991-I1":version===43?"0.991-I1-HF1":version===44?"0.991-I1-HF2":version===45?"0.9915":version===46?"0.9915-I1-HF1":"unknown";
    createDatabaseBackup({fromVersion:from,toVersion:step.toVersion,label:step.name});
    try {
      db.exec("BEGIN IMMEDIATE");
      db.exec(readMigration(step.file));
      if(step.version===5) finalizeBeta0675IdentityMigration();
      if(step.version===18) finalizeBeta095AuthorizationMigration();
      if(step.version===30) finalizeBeta0986HF2ExperienceMigration();
      if(step.version===32) finalizeBeta0987PersonalizationMigration();
      setSchemaVersion(step.version);
      recordMigration(step.version,step.name,"APPLIED");
      db.exec("COMMIT");
      version=step.version;
    } catch(error) {
      try { db.exec("ROLLBACK"); } catch {}
      throw new Error(`GameIndex migration ${step.name} failed without deleting the original database: ${error.message}`);
    }
  }
  return version;
}

export function latestBackup() {
  try {
    return readdirSync(backupsDir).filter(x=>x.endsWith(".sqlite")).sort().at(-1)||null;
  } catch { return null; }
}

export async function startDurablePersistence({release="BETA_0_9915_I2_MOBILE"}={}){
  if(!neonRemotePersistenceConfigured())return {enabled:false,provider:"NONE",safety:productionStorageSafety()};
  return startNeonSnapshotRuntime({
    databasePath,
    getSchemaVersion:()=>schemaVersion(),
    release,
    checkpoint:()=>{const result=rawDb.prepare("PRAGMA wal_checkpoint(FULL)").get();if(Number(result?.busy))throw new Error("SQLITE_CHECKPOINT_BUSY");},
    verifyDatabase
  });
}
export async function flushDurablePersistence(options={}){return flushNeonSnapshot(options);}
export function durablePersistenceState(){return neonRemotePersistenceState();}

export function nowIso(){return new Date().toISOString();}
export function parseJson(value,fallback=null){try{return JSON.parse(value);}catch{return fallback;}}
export function json(value){return JSON.stringify(value??null);}
export function transaction(fn){db.exec("BEGIN IMMEDIATE");try{const result=fn();db.exec("COMMIT");markNeonSnapshotDirty({critical:true,reason:"sqlite-transaction-commit"});return result;}catch(error){try{db.exec("ROLLBACK");}catch{}throw error;}}
