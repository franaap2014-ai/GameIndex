import { db, databaseStorageState, schemaVersion, storageWritable, testDatabaseRead, testDatabaseWrite } from "../database/connection.mjs";
import { listEntities } from "../database/repositories/entity-repository.mjs";
import { listKnowledge } from "../database/repositories/knowledge-repository.mjs";
import { findActiveConstructionRun } from "../database/repositories/construction-repository.mjs";
import { evaluateKnowledgeQuality } from "../autonomy/knowledge-quality-gate.mjs";
import { normalizeLanguage } from "../i18n/language-service.mjs";

const REQUIRED_TABLES=["construction_runs","construction_items","construction_events","construction_attempts","games","users","pages","knowledge","entities"];
function check(id,ok,detail=""){return {id,ok:Boolean(ok),status:ok?"PASS":"FAIL",detail:String(detail||"").slice(0,400)};}
function failure(code,message,component,suggestedAction,statusCode=422,retryable=false){return {code,message,component,suggestedAction,statusCode,retryable};}
function tableExists(name){try{return Boolean(db.prepare(`SELECT 1 FROM sqlite_master WHERE type='table' AND name=?`).get(name));}catch{return false;}}
function qualityFor(entity){try{return evaluateKnowledgeQuality({entityId:entity.id,pageType:entity.type});}catch{return {passed:false,reasons:["QUALITY_CHECK_FAILED"],missing:["QUALITY"]};}}

export function buildConstructionPlan(game,{demoMode=false,maxEntities=null}={}){
  if(!game)return [];
  const hub={entityId:null,pageType:"GAME",quality:{passed:true,source:"GAME_MEMORY"},label:game.nome};
  if(demoMode)return [hub];
  const allKnowledge=listKnowledge({gameId:game.id,limit:2000}).entries,counts=new Map();
  for(const item of allKnowledge)if(item.entityId)counts.set(item.entityId,(counts.get(item.entityId)||0)+1);
  const configured=Number(maxEntities??process.env.GAMEINDEX_FULL_BUILD_MAX_ENTITIES??24),limit=Math.max(0,Math.min(60,Number.isFinite(configured)?configured:24));
  const entities=listEntities({gameId:game.id,limit:1000})
    .filter(entity=>(counts.get(entity.id)||0)>=2)
    .map(entity=>({entity,knowledgeCount:counts.get(entity.id)||0,quality:qualityFor(entity)}))
    // Do not enqueue a page that the content-quality gate already knows it
    // cannot build. This was the systemic source of the old "25/25 errors":
    // the planner accepted two weak records while Page Builder required
    // validated claims/sources. Research may enrich them first; until then
    // they remain outside the executable plan instead of becoming fake jobs.
    .filter(candidate=>candidate.quality.passed)
    .sort((a,b)=>Number(b.quality.passed)-Number(a.quality.passed)||b.knowledgeCount-a.knowledgeCount)
    .slice(0,limit);
  return [hub,...entities.map(({entity,knowledgeCount,quality})=>({entityId:entity.id,pageType:String(entity.type||"OTHER").toUpperCase(),label:entity.name,knowledgeCount,quality}))];
}

export function runConstructionPreflight({game,userId=null,access=null,language="pt-BR",demoMode=false,maxEntities=null,allowExistingActive=false,probes={}}={}){
  const checks=[],normalizedLanguage=normalizeLanguage(language)||"";
  if(!userId||!access?.authorized)return {ok:false,statusCode:403,checks:[check("authorization",false,"ADMIN + DEV e page_generation são obrigatórios.")],plan:[],error:failure("CONSTRUCTION_PERMISSION_DENIED","A conta não possui autorização para construir páginas.","PREFLIGHT_AUTHORIZATION","Entre como ADMIN + DEV e verifique page_generation.",403,false)};
  checks.push(check("authorization",true,`${access.role||"ADMIN"} · ${access.tier||"DEV"} · page_generation`));
  if(!game)return {ok:false,statusCode:404,checks:[...checks,check("game",false,"Jogo não encontrado.")],plan:[],error:failure("CONSTRUCTION_GAME_NOT_FOUND","O jogo solicitado não foi encontrado.","PREFLIGHT_GAME","Volte ao catálogo e abra um jogo existente.",404,false)};
  checks.push(check("game",true,game.nome||game.id));
  if(!normalizedLanguage)return {ok:false,statusCode:422,checks:[...checks,check("language",false,language)],plan:[],error:failure("CONSTRUCTION_LANGUAGE_UNSUPPORTED","O idioma escolhido não é suportado.","PREFLIGHT_LANGUAGE","Use pt-BR, en-US ou es-ES.",422,false)};
  checks.push(check("language",true,normalizedLanguage));

  const foundSchema=probes.schemaVersion??schemaVersion();checks.push(check("schema",foundSchema>=18,`Schema encontrado: ${foundSchema}.`));
  if(foundSchema<18)return {ok:false,statusCode:503,checks,plan:[],error:failure("CONSTRUCTION_SCHEMA_MISMATCH",`O Full Game Build V2 exige schema 18 ou superior; encontrado ${foundSchema}.`,"PREFLIGHT_SCHEMA","Reinicie o App Service para concluir as migrações.",503,true)};
  const missing=REQUIRED_TABLES.filter(name=>!(probes.tableExists?probes.tableExists(name):tableExists(name)));checks.push(check("tables",missing.length===0,missing.length?`Ausentes: ${missing.join(", ")}`:"Tabelas da construção disponíveis."));
  if(missing.length)return {ok:false,statusCode:503,checks,plan:[],error:failure("CONSTRUCTION_SCHEMA_MISMATCH","As tabelas do Construction System não estão disponíveis.","PREFLIGHT_SCHEMA","Reinicie o site e confira a migração 017_beta_092.sql.",503,true)};

  const read=probes.read??testDatabaseRead();checks.push(check("database_read",read.ok,read.ok?`${read.games||0} jogos acessíveis.`:read.error));
  if(!read.ok)return {ok:false,statusCode:503,checks,plan:[],error:failure("CONSTRUCTION_DATABASE_UNAVAILABLE","O banco do site não pôde ser lido.","PREFLIGHT_DATABASE","Abra o Deployment Monitor e verifique o armazenamento do Azure.",503,true)};
  const integrity=probes.integrity??(()=>{try{return db.prepare("PRAGMA integrity_check").get()?.integrity_check||"unknown";}catch(error){return String(error.message||error);}})();checks.push(check("integrity",String(integrity).toLowerCase()==="ok",integrity));
  if(String(integrity).toLowerCase()!=="ok")return {ok:false,statusCode:503,checks,plan:[],error:failure("CONSTRUCTION_DATABASE_INTEGRITY","A verificação de integridade do banco falhou.","PREFLIGHT_DATABASE","Use o último backup íntegro antes de construir.",503,false)};
  const write=probes.write??testDatabaseWrite();checks.push(check("database_write",write.ok,write.ok?"Escrita reversível aprovada.":write.error));
  if(!write.ok)return {ok:false,statusCode:507,checks,plan:[],error:failure("CONSTRUCTION_DATABASE_READ_ONLY","O banco do site está somente para leitura.","PREFLIGHT_DATABASE","Remova GAMEINDEX_READ_ONLY, confirme Azure HOME e reinicie o App Service.",507,false)};
  const storage=probes.storageWritable??storageWritable();checks.push(check("storage",storage,"Armazenamento persistente gravável."));
  if(!storage)return {ok:false,statusCode:507,checks,plan:[],error:failure("CONSTRUCTION_STORAGE_UNAVAILABLE","O armazenamento persistente do site não está gravável.","PREFLIGHT_STORAGE","Confirme que o banco usa %HOME%\\data\\GameIndex.",507,false)};
  const workerEnabled=probes.workerEnabled??String(process.env.GAMEINDEX_CONSTRUCTION_ENABLED??process.env.GAMEINDEX_FULL_BUILD_ENABLED??"true").toLowerCase()!=="false";checks.push(check("worker",workerEnabled,workerEnabled?"Construction worker ativo.":"Worker desativado por configuração."));
  if(!workerEnabled)return {ok:false,statusCode:503,checks,plan:[],error:failure("CONSTRUCTION_WORKER_DISABLED","O worker de construção está desativado.","PREFLIGHT_WORKER","Defina GAMEINDEX_CONSTRUCTION_ENABLED=true e reinicie.",503,false)};
  const storageState=probes.storageState??databaseStorageState(),persistentOriginOk=!storageState.azure||storageState.persistent||storageState.origin==="AZURE_HOME";checks.push(check("persistent_origin",persistentOriginOk,storageState.origin||"UNKNOWN"));
  if(!persistentOriginOk)return {ok:false,statusCode:507,checks,plan:[],error:failure("CONSTRUCTION_AZURE_STORAGE_NOT_PERSISTENT","O Azure não está usando o diretório persistente do site.","PREFLIGHT_STORAGE","Remova caminhos em site/wwwroot e use %HOME%\\data\\GameIndex.",507,false)};

  const active=allowExistingActive?null:findActiveConstructionRun(game.id,normalizedLanguage,userId);checks.push(check("active_run",!active,active?`Execução ativa: ${active.id}`:"Nenhuma execução conflitante."));
  if(active)return {ok:false,statusCode:409,checks,plan:[],active,error:failure("CONSTRUCTION_ACTIVE_RUN_EXISTS","Já existe uma construção ativa para este jogo e idioma.","PREFLIGHT_IDEMPOTENCY","Continue ou cancele a execução ativa antes de iniciar outra.",409,false)};
  const plan=probes.plan??buildConstructionPlan(game,{demoMode,maxEntities});checks.push(check("plan",plan.length>0,`${plan.length} item(ns) planejado(s).`));
  if(!plan.length)return {ok:false,statusCode:422,checks,plan:[],error:failure("CONSTRUCTION_PLAN_EMPTY","Nenhuma página pôde ser planejada.","PREFLIGHT_PLANNER","Adicione conhecimento validado ao jogo.",422,false)};
  return {ok:true,statusCode:200,language:normalizedLanguage,checks,plan,storage:{origin:storageState.origin,persistent:Boolean(storageState.persistent)},summary:{totalItems:plan.length,demoMode:Boolean(demoMode),pagesFirst:true,imagesSeparate:true}};
}
