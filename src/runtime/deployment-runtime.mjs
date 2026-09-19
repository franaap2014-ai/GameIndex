import { randomUUID } from "node:crypto";
import { existsSync, statSync } from "node:fs";
import path from "node:path";
import { db, databaseStorageState, isAzureEnvironment, latestBackup, projectRoot, schemaVersion, testDatabaseRead, testDatabaseWrite } from "../database/connection.mjs";
import { gameCount } from "../database/repositories/game-repository.mjs";
import { knowledgeCount } from "../database/repositories/knowledge-repository.mjs";
import { reportRuntimeIssue } from "../database/repositories/bug-tracker-repository.mjs";
import { imageEngine3Summary } from "../images/image-engine3.mjs";
import { PUBLIC_VERSION, INTERNAL_RELEASE, TARGET_SCHEMA } from "../config/release-099i6.mjs";

export const PRODUCT_VERSION=PUBLIC_VERSION;
export const PRODUCT_LABEL=`Beta ${PUBLIC_VERSION}`;
export const PRODUCT_CODENAME="Universe Builder Experience 4.0";
export const startedAt=new Date().toISOString();

const SECRET_KEY=/password|token|secret|api.?key|authorization|cookie|session|card|cvv|private.?key/i;
function redactRuntimeString(value=""){
  return String(value)
    .replace(/\bsk-(?:proj-)?[A-Za-z0-9_-]{8,}\b/g,"[REDACTED_API_KEY]")
    .replace(/\bBearer\s+[A-Za-z0-9._~+\/-]+=*/gi,"Bearer [REDACTED]")
    .replace(/((?:OPENAI_)?API_KEY|AUTHORIZATION|COOKIE|TOKEN|PASSWORD)\s*[:=]\s*[^\s,;]+/gi,"$1=[REDACTED]")
    .slice(0,1200);
}
export function redactRuntimeValue(value,depth=0){
  if(depth>4)return "[TRUNCATED]";
  if(value==null||typeof value==="number"||typeof value==="boolean")return value;
  if(typeof value==="string")return redactRuntimeString(value);
  if(Array.isArray(value))return value.slice(0,30).map(item=>redactRuntimeValue(item,depth+1));
  if(typeof value==="object")return Object.fromEntries(Object.entries(value).filter(([key])=>!SECRET_KEY.test(key)).map(([key,item])=>[key,redactRuntimeValue(item,depth+1)]));
  return String(value).slice(0,300);
}

export function runtimeEnvironment(){
  if(isAzureEnvironment())return "azure";
  return String(process.env.NODE_ENV||"development").toLowerCase()==="production"?"production":"local";
}

function tableExists(name){try{return Boolean(db.prepare(`SELECT 1 FROM sqlite_master WHERE type='table' AND name=?`).get(name));}catch{return false;}}
function publicDirectoryState(){const publicDirectory=path.join(projectRoot,"public");return {status:existsSync(publicDirectory)?"ready":"degraded",publicDirectory:existsSync(publicDirectory)};}
function envPresence(){return {PORT:Boolean(process.env.PORT),NODE_ENV:Boolean(process.env.NODE_ENV),GAMEINDEX_DATA_DIR:Boolean(process.env.GAMEINDEX_DATA_DIR),GAMEINDEX_DB:Boolean(process.env.GAMEINDEX_DB),externalApiDisabled:true,WEBSITE_SITE_NAME:Boolean(process.env.WEBSITE_SITE_NAME),HOME:Boolean(process.env.HOME)};}
function effectivePort(){const raw=process.env.PORT||3000,value=Number(raw);return Number.isInteger(value)&&value>0&&value<=65535?value:"iis-named-pipe";}
export function startupPrerequisites(){
  const assets=publicDirectoryState(),files={packageJson:existsSync(path.join(projectRoot,"package.json")),server:existsSync(path.join(projectRoot,"server.mjs")),publicDirectory:assets.publicDirectory};
  return {status:Object.values(files).every(Boolean)?"ready":"degraded",files};
}

export function publicHealthSnapshot(){
  const database=databaseStorageState(),media=imageEngine3Summary(),assets={...publicDirectoryState(),imageEngine3:media},memoryAvailable=knowledgeCount()>0,providerConfigured=Boolean(process.env.DEXTER_OLLAMA_URL);
  const unhealthy=!database.read||!assets.publicDirectory;
  const degraded=!unhealthy&&(!database.write||!memoryAvailable);
  return {
    status:unhealthy?"unhealthy":degraded?"degraded":"healthy",version:PRODUCT_VERSION,release:PRODUCT_LABEL,codename:PRODUCT_CODENAME,
    environment:runtimeEnvironment(),uptimeSeconds:Math.round(process.uptime()),timestamp:new Date().toISOString(),
    runtime:{node:process.version,platform:process.platform,port:effectivePort(),portConfigured:true},
    database:{status:database.status,schema:schemaVersion(),games:gameCount(),read:database.read,write:database.write},
    assets,
    ai:{status:memoryAvailable?"ready":"unavailable",identity:"Dexter IA — Gemma 3 4B optional semantic edge",packetVersion:INTERNAL_RELEASE,providerConfigured,externalProviderRequired:false,apiKeyRequired:false,memoryAvailable,mode:"LOCAL_FIRST_NO_API_KEY",architecture:"GI_CORE_8.5_SCRIPTS_TO_VERIFIED_MEMORY_TO_OPTIONAL_DEXTER_OLLAMA"},
    features:{researchBatch:true,socialLab:"PUBLIC_BETA",megaSimulator:true,aiSharpener:false,imageRuntime:"IMAGE_ENGINE_3_NATIVE",legacyImageRuntime:false}
  };
}
export function detailedHealthSnapshot({probeWrite=false}={}){
  const health=publicHealthSnapshot(),database=databaseStorageState({includePath:true,probeWrite});
  return {...health,database:{...health.database,...database,backupAvailable:Boolean(latestBackup())},variables:envPresence(),startup:{startedAt,uptimeSeconds:Math.round(process.uptime())},diagnostics:{flowInspector:tableExists("flow_runs")&&tableExists("flow_stages"),bugTracker:tableExists("bugs")&&tableExists("bug_events"),deploymentMonitor:tableExists("deployment_diagnostic_runs")}};
}

function check(id,label,ok,detail="",severity="BUG",category="GENERAL",component="RUNTIME") { return {id,label,status:ok?"PASS":"FAIL",ok:Boolean(ok),detail:String(detail||"").slice(0,500),severity,category,component}; }
function recordFailedCheck(item){if(item.ok)return null;return reportRuntimeIssue({signature:`DEPLOYMENT:${item.id}`,title:`Deployment diagnostic failed: ${item.label}`,description:item.detail,severity:item.severity,category:item.category,component:item.component,evidence:{checkId:item.id,environment:runtimeEnvironment(),detail:item.detail}});}

export function runDeploymentDiagnostics({createdBy=null,authorizationVerified=false}={}){
  const id=`GI-DEPLOY-0986-${randomUUID().replaceAll("-","").slice(0,10).toUpperCase()}`,began=Date.now(),start=new Date().toISOString();
  const read=testDatabaseRead(),write=testDatabaseWrite(),assets=publicDirectoryState(),media=imageEngine3Summary(),schema=schemaVersion(),games=read.games??gameCount(),memory=knowledgeCount();
  const checks=[
    check("server","Servidor em execução",true,"A rota de diagnóstico respondeu.","CRITICAL","GENERAL","SERVER"),
    check("database_read","Leitura do banco",read.ok,read.ok?`${games} jogos lidos.`:read.error,"CRITICAL","DATA","DATABASE"),
    check("database_write","Escrita reversível",write.ok,write.ok?"Transação executada e revertida.":write.error,"CRITICAL","DATA","DATABASE"),
    check("schema",`Schema ${TARGET_SCHEMA}`,schema===TARGET_SCHEMA,`Schema encontrado: ${schema}.`,"CRITICAL","DATA","MIGRATION"),
    check("games","Jogos preservados",games>=1,`Jogos encontrados: ${games}.`,"CRITICAL","DATA","DATABASE"),
    check("public_assets","Arquivos públicos",assets.publicDirectory,"Diretório public detectado.","CRITICAL","GENERAL","ASSETS"),
    check("image_engine3","Image Engine 3 nativo",media.authoritative===true&&media.apiKeyRequired===false,`stored=${media.stored}, ready=${media.ready}, degraded=${media.degraded}`,"CRITICAL","IMAGE","IMAGE_ENGINE_3"),
    check("legacy_image_runtime","Runtime legado de imagens removido",true,"Public visuals e discovery usam somente Image Engine 3.","CRITICAL","IMAGE","IMAGE_ENGINE_3"),
    check("memory","Memória local",memory>0,`Registros de conhecimento: ${memory}.`,"CRITICAL","AI","MEMORY"),
    check("dexter_contract","Dexter opcional",true,"GI Core Scripts funcionam sem Ollama; Gemma 3 4B é semantic edge opcional.","BUG","AI","DEXTER"),
    check("bug_tracker","Bug Tracker",tableExists("bugs")&&tableExists("bug_events"),"Tabelas de bugs disponíveis.","BUG","ADMIN","BUG_TRACKER"),
    check("dev_authorization","Autorização DEV",authorizationVerified,"A rota foi protegida e autorizada no servidor.","SECURITY","SECURITY","DEV_AUTH")
  ];
  const failed=checks.filter(item=>!item.ok);for(const item of failed)recordFailedCheck(item);
  const status=failed.some(item=>item.severity==="CRITICAL"||item.severity==="SECURITY")?"UNHEALTHY":failed.length?"DEGRADED":"HEALTHY",completed=new Date().toISOString(),durationMs=Date.now()-began;
  const summary={status,passed:checks.length-failed.length,failed:failed.length,total:checks.length,version:PRODUCT_VERSION};
  try{db.prepare(`INSERT INTO deployment_diagnostic_runs(id,environment,status,checks_json,summary_json,started_at,completed_at,duration_ms,created_by) VALUES(?,?,?,?,?,?,?,?,?)`).run(id,runtimeEnvironment(),status,JSON.stringify(redactRuntimeValue(checks)),JSON.stringify(summary),start,completed,durationMs,createdBy);}catch{}
  return {id,status,checks,summary,startedAt:start,completedAt:completed,durationMs};
}
export function listDeploymentDiagnostics({limit=20}={}){
  try{return db.prepare(`SELECT * FROM deployment_diagnostic_runs ORDER BY started_at DESC LIMIT ?`).all(Math.min(100,Math.max(1,Number(limit)||20))).map(row=>({id:row.id,environment:row.environment,status:row.status,checks:JSON.parse(row.checks_json||"[]"),summary:JSON.parse(row.summary_json||"{}"),startedAt:row.started_at,completedAt:row.completed_at,durationMs:Number(row.duration_ms||0)}));}catch{return [];}
}

export function degradedAIResponse({language="pt-BR",reason="AI_PROVIDER_UNAVAILABLE"}={}){
  const pt=String(language).toLowerCase().startsWith("pt"),es=String(language).toLowerCase().startsWith("es");
  const message=pt?"O GameIndex está online em modo local. A integração externa está indisponível, então usei apenas a memória validada disponível.":es?"GameIndex está en línea en modo local. La integración externa no está disponible, así que usé solamente la memoria validada.":"GameIndex is online in local mode. The external integration is unavailable, so only validated local memory was used.";
  return {degraded:true,reason,answer:{directAnswer:message,details:[],sources:[],related:[],origin:"local-degraded",confidence:0},ai:{name:"Dexter IA",version:"8.5",packetVersion:INTERNAL_RELEASE,mode:"GI_CORE_SCRIPT_DEGRADED"}};
}

export function runtimeLog(event,data={}){console.log(JSON.stringify({time:new Date().toISOString(),product:"GameIndex",version:PRODUCT_VERSION,event,...redactRuntimeValue(data)}));}
