import {installIdentityCatalog} from '../users/avatar-catalog-0992-i1.mjs';
import {db,json,nowIso,schemaVersion,transaction} from './connection.mjs';
import {PUBLIC_VERSION,INTERNAL_RELEASE_CODE} from '../config/release-099i6.mjs';

function appendNotes(sections,key,notes){
 const previous=Array.isArray(sections[key])?sections[key]:sections[key]==null?[]:[sections[key]];
 sections[key]=[...new Set([...previous,...notes])];
}

export function registerDeliveryRelease(){
 if(schemaVersion()<47)return;
 installIdentityCatalog();
 const value=key=>db.prepare('SELECT value FROM meta WHERE key=?').get(key)?.value;
 const entry=db.prepare('SELECT sections_json FROM update_log_entries WHERE version=?').get(PUBLIC_VERSION);
 const needsI1=!value('release_notes_0992_i1')||!entry;
 const needsI2=!value('release_notes_0992_i2')||!entry;
 // Repeated startup must not rewrite identical metadata or schedule another snapshot.
 if(!needsI1&&!needsI2&&value('runtime_version')===PUBLIC_VERSION&&value('runtime_release')===INTERNAL_RELEASE_CODE)return;

 // Notes and their installation markers commit together; a failed startup can retry safely.
 transaction(()=>{
  const setMeta=db.prepare('INSERT INTO meta(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value WHERE meta.value IS NOT excluded.value');
  setMeta.run('runtime_version',PUBLIC_VERSION);
  setMeta.run('runtime_release',INTERNAL_RELEASE_CODE);
  db.prepare(`INSERT INTO update_log_entries(version,title,codename,release_date,sections_json,tags_json,public,created_at) VALUES(?,?,?,'2026-09-24',?,?,1,?) ON CONFLICT(version) DO NOTHING`).run(PUBLIC_VERSION,'GameIndex Beta '+PUBLIC_VERSION,'Delivery Build',json({RESUMO:['Navegação e apresentação consolidadas','Universe Builder orientado pelas abas de cada jogo'],MELHORADO:['Ferramentas de desenvolvimento com acesso restrito','Música com retomada e recuperação','Mobile e transições temáticas'],CORRIGIDO:['Aprimorar incorpora novos fatos às seções editáveis','Cabo usa as cores dos temas de origem e destino']}),json(['DELIVERY','MOBILE','BUILDER']),nowIso());
  if(needsI1||needsI2){
   const current=db.prepare('SELECT sections_json FROM update_log_entries WHERE version=?').get(PUBLIC_VERSION);
   let sections;
   try{sections=JSON.parse(current.sections_json);}catch{}
   // Legacy/manual notes must not prevent startup or be silently discarded.
   if(!sections||typeof sections!=='object'||Array.isArray(sections))sections={NOTAS_ANTERIORES:[current.sections_json]};
   if(needsI1){
    appendNotes(sections,'MELHORADO',['Dexter com contexto de conversa e fontes verificadas','Cabeçalho e capas adaptados ao celular','Cinco novos avatares por categoria']);
    appendNotes(sections,'CORRIGIDO',['Entrada e criação de conta com retorno claro','Recuperação de pesquisa por wiki no Universe Builder','Proteção de conteúdo manual e ajustes de imagens']);
    setMeta.run('release_notes_0992_i1','1');
   }
   if(needsI2){
    appendNotes(sections,'MELHORADO',['Respostas e backups compactados para reduzir o tráfego','Backups reutilizam blocos sem alterações e mantêm restauração completa']);
    appendNotes(sections,'CORRIGIDO',['Sincronização com espera progressiva após falhas','Inicialização sem regravar metadados e notas de versão idênticos']);
    setMeta.run('release_notes_0992_i2','1');
   }
   db.prepare("UPDATE update_log_entries SET sections_json=?,codename='I2 · Estabilidade e tráfego',release_date='2026-10-01' WHERE version=?").run(json(sections),PUBLIC_VERSION);
  }
 });
}
