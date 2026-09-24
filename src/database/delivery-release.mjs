import {db,json,nowIso,schemaVersion} from './connection.mjs';
import {PUBLIC_VERSION,INTERNAL_RELEASE_CODE} from '../config/release-099i6.mjs';
export function registerDeliveryRelease(){
 if(schemaVersion()<47)return;
 db.prepare("INSERT INTO meta(key,value) VALUES('runtime_version',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").run(PUBLIC_VERSION);
 db.prepare("INSERT INTO meta(key,value) VALUES('runtime_release',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").run(INTERNAL_RELEASE_CODE);
 db.prepare(`INSERT INTO update_log_entries(version,title,codename,release_date,sections_json,tags_json,public,created_at) VALUES(?,?,?,'2026-09-24',?, ?,1,?) ON CONFLICT(version) DO NOTHING`).run(PUBLIC_VERSION,'GameIndex Beta '+PUBLIC_VERSION,'Delivery Build',json({RESUMO:['Navegação e apresentação consolidadas','Universe Builder orientado pelas abas de cada jogo'],MELHORADO:['Ferramentas de desenvolvimento com acesso restrito','Música com retomada e recuperação','Mobile e transições temáticas'],CORRIGIDO:['Aprimorar incorpora novos fatos às seções editáveis','Cabo usa as cores dos temas de origem e destino']}),json(['DELIVERY','MOBILE','BUILDER']),nowIso());
}
