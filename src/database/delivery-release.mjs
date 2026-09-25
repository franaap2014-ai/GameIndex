import {installIdentityCatalog} from '../users/avatar-catalog-0992-i1.mjs';
import {db,json,nowIso,schemaVersion} from './connection.mjs';
import {PUBLIC_VERSION,INTERNAL_RELEASE_CODE} from '../config/release-099i6.mjs';
export function registerDeliveryRelease(){
 if(schemaVersion()<47)return;
 installIdentityCatalog();
 db.prepare("INSERT INTO meta(key,value) VALUES('runtime_version',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").run(PUBLIC_VERSION);
 db.prepare("INSERT INTO meta(key,value) VALUES('runtime_release',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").run(INTERNAL_RELEASE_CODE);
 db.prepare(`INSERT INTO update_log_entries(version,title,codename,release_date,sections_json,tags_json,public,created_at) VALUES(?,?,?,'2026-09-24',?, ?,1,?) ON CONFLICT(version) DO NOTHING`).run(PUBLIC_VERSION,'GameIndex Beta '+PUBLIC_VERSION,'Delivery Build',json({RESUMO:['Navegação e apresentação consolidadas','Universe Builder orientado pelas abas de cada jogo'],MELHORADO:['Ferramentas de desenvolvimento com acesso restrito','Música com retomada e recuperação','Mobile e transições temáticas'],CORRIGIDO:['Aprimorar incorpora novos fatos às seções editáveis','Cabo usa as cores dos temas de origem e destino']}),json(['DELIVERY','MOBILE','BUILDER']),nowIso());
 if(!db.prepare("SELECT value FROM meta WHERE key='release_notes_0992_i1'").get()){
  const entry=db.prepare('SELECT sections_json FROM update_log_entries WHERE version=?').get(PUBLIC_VERSION);
  let sections={};try{sections=JSON.parse(entry?.sections_json||'{}');}catch{}
  sections.MELHORADO=[...(sections.MELHORADO||[]),'Dexter com contexto de conversa e fontes verificadas','Cabeçalho e capas adaptados ao celular','Cinco novos avatares por categoria'];
  sections.CORRIGIDO=[...(sections.CORRIGIDO||[]),'Entrada e criação de conta com retorno claro','Recuperação de pesquisa por wiki no Universe Builder','Proteção de conteúdo manual e ajustes de imagens'];
  db.prepare("UPDATE update_log_entries SET sections_json=?,codename='Estabilidade e Dexter',release_date='2026-09-25' WHERE version=?").run(json(sections),PUBLIC_VERSION);
  db.prepare("INSERT INTO meta(key,value) VALUES('release_notes_0992_i1','1')").run();
 }

}
