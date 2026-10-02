import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';

const temp=mkdtempSync(path.join(tmpdir(),'gi-0992-i2-'));
Object.assign(process.env,{GAMEINDEX_DB:path.join(temp,'test.sqlite'),GAMEINDEX_DATA_DIR:temp,DATABASE_URL:'',GAMEINDEX_DATABASE_URL:'',GAMEINDEX_TARGET_SCHEMA:'47',NODE_ENV:'test',GAMEINDEX_BACKGROUND_WORKERS:'false',GAMEVAULT_AUTOGEN_ENABLED:'false',OLLAMA_ENABLED:'false'});
for(const key of ['RENDER','RENDER_SERVICE_ID','RENDER_EXTERNAL_HOSTNAME','WEBSITE_SITE_NAME','WEBSITE_INSTANCE_ID','WEBSITE_HOSTNAME'])delete process.env[key];
const {initializeDatabase}=await import('../src/database/seed.mjs');
const {db}=await import('../src/database/connection.mjs');
const {registerDeliveryRelease}=await import('../src/database/delivery-release.mjs');
const {INTERNAL_RELEASE_CODE,PUBLIC_VERSION}=await import('../src/config/release-099i6.mjs');
const meta=key=>db.prepare('SELECT value FROM meta WHERE key=?').get(key)?.value;
const entry=()=>db.prepare('SELECT * FROM update_log_entries WHERE version=?').get(PUBLIC_VERSION);
const changes=()=>db.prepare('SELECT total_changes() AS n').get().n;
let passed=0;
function test(name,fn){fn();passed++;console.log('PASS',name);}

try{
 initializeDatabase();
 test('fresh installation registers I1 and I2 on schema 47',()=>{
  assert.equal(meta('runtime_version'),'0.992');
  assert.equal(meta('runtime_release'),INTERNAL_RELEASE_CODE);
  // I2 compatibility invariants also apply when upgraded to I3.
  assert.match(INTERNAL_RELEASE_CODE,/^BETA_0_992_(?:I2_BANDWIDTH|I3_PRODUCT_QUALITY)$/);
  assert.equal(meta('release_notes_0992_i1'),'1');assert.equal(meta('release_notes_0992_i2'),'1');
  assert.match(entry().sections_json,/Dexter/);assert.match(entry().sections_json,/compactados/);
 });
 test('repeated registration makes zero SQLite changes',()=>{
  const before=changes(),notes=entry();registerDeliveryRelease();registerDeliveryRelease();
  assert.equal(changes(),before);assert.deepEqual(entry(),notes);
 });
 test('I1 upgrade preserves custom notes and publishes I2 once',()=>{
  db.prepare("DELETE FROM meta WHERE key='release_notes_0992_i2'").run();
  db.prepare("UPDATE meta SET value='BETA_0_992_I1_STABILITY_UX_DEXTER' WHERE key='runtime_release'").run();
  db.prepare('UPDATE update_log_entries SET sections_json=? WHERE version=?').run(JSON.stringify({RESUMO:['Texto manual preservado'],MELHORADO:['Dexter com contexto de conversa e fontes verificadas'],CUSTOM:{keep:true}}),PUBLIC_VERSION);
  registerDeliveryRelease();const notes=JSON.parse(entry().sections_json);
  assert.deepEqual(notes.RESUMO,['Texto manual preservado']);assert.deepEqual(notes.CUSTOM,{keep:true});
  assert.equal(notes.MELHORADO.filter(n=>n.includes('Dexter')).length,1);
  assert.equal(notes.MELHORADO.filter(n=>n.includes('compactados')).length,1);
  const before=changes();registerDeliveryRelease();assert.equal(changes(),before);
 });
 test('failed notes write rolls back release and marker, then retries cleanly',()=>{
  db.prepare("DELETE FROM meta WHERE key='release_notes_0992_i2'").run();
  db.prepare("UPDATE meta SET value='PREVIOUS_RELEASE' WHERE key='runtime_release'").run();
  const before=entry();
  db.exec("CREATE TEMP TRIGGER reject_i2 BEFORE UPDATE ON update_log_entries BEGIN SELECT RAISE(ABORT,'TEST_NOTES_FAILURE'); END;");
  assert.throws(registerDeliveryRelease,/TEST_NOTES_FAILURE/);
  assert.equal(meta('runtime_release'),'PREVIOUS_RELEASE');assert.equal(meta('release_notes_0992_i2'),undefined);assert.deepEqual(entry(),before);
  db.exec('DROP TRIGGER reject_i2');registerDeliveryRelease();
  assert.equal(meta('runtime_release'),INTERNAL_RELEASE_CODE);assert.equal(meta('release_notes_0992_i2'),'1');
  assert.equal(JSON.parse(entry().sections_json).MELHORADO.filter(n=>n.includes('compactados')).length,1);
 });
 test('legacy malformed notes are preserved without blocking startup',()=>{
  db.prepare("DELETE FROM meta WHERE key='release_notes_0992_i2'").run();
  db.prepare('UPDATE update_log_entries SET sections_json=? WHERE version=?').run('Legacy manual text',PUBLIC_VERSION);
  registerDeliveryRelease();
  assert.deepEqual(JSON.parse(entry().sections_json).NOTAS_ANTERIORES,['Legacy manual text']);
  assert.equal(meta('release_notes_0992_i2'),'1');
 });
 console.log(JSON.stringify({ok:true,release:'0.992 I2',passed}));
}finally{db.close();rmSync(temp,{recursive:true,force:true});}
