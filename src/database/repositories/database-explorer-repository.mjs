import { createHash, randomUUID } from "node:crypto";
import { db, databasePath, schemaVersion, verifyDatabase, latestBackup, nowIso, databaseStorageState, testDatabaseRead, testDatabaseWrite } from "../connection.mjs";
import { existsSync, statSync } from "node:fs";
import { entityConsistencyReport, setManualCanonicalType, ENTITY_TYPES } from "../../entities/canonical-entity-service.mjs";

const LABELS={
  users:"Users",user_profiles:"Profiles",games:"Games",entities:"Entities",entity_canonical_state:"Canonical Entities",knowledge:"Knowledge",claims:"Claims",sources:"Sources",evidence:"Evidence",relationships:"Relationships",entity_relationships_v2:"Relationships V2",images:"Images",pages:"Pages",articles:"Articles",generation_jobs:"Generation Jobs",autonomous_generation_queue:"Autogen Queue",autogen_knowledge_states:"Autogen Knowledge States",ai_traces:"AI Traces",ai_trace_stages:"AI Trace Stages",flow_runs:"AI Flows",flow_stages:"Flow Stages",bugs:"Bugs",bug_events:"Bug Events",deployment_diagnostic_runs:"Deployment Diagnostics",runtime_issue_signatures:"Runtime Issues",semantic_reviews:"Semantic Reviews",research_attempts:"Research Attempts",user_preferences:"Settings",subscriptions:"Subscriptions",update_log_entries:"Update Log",admin_actions:"Audit Log",entity_consistency_events:"Entity Consistency",social_messages:"Social Messages (metadata)",social_conversations:"Social Conversations",social_groups:"Social Groups",social_communities:"Social Communities",social_wiki_pages:"Social Wiki",social_boards:"Social Boards",staff_role_assignments:"Staff Roles",staff_capability_grants:"Staff Capabilities",meta:"Runtime Metadata",schema_migrations:"Schema Migrations"
};

// Never surface tables whose normal purpose is authentication/session recovery.
const HIDDEN_TABLES=new Set(["sessions","admin_recovery_attempts"]);
const SECRET_COLUMN=/password|password_hash|password_salt|salt|token|secret|private_key|api_key|cookie|session_key|recovery_code|binary_data|card_number|cvv/i;
const PRIVATE_MESSAGE_COLUMNS=new Set(["content"]);
const READ_ONLY_TABLES=new Set([
  "admin_actions","auth_audit","role_change_audit","authorization_diagnostics","schema_migrations",
  "bug_events","construction_events","research_item_events","social_message_events","ai_pipeline_events",
  "ai_failure_events","entity_consistency_events"
]);
const MANAGED_COLUMNS=new Map([
  ["users",new Set(["password_hash","password_salt","role","account_tier"])],
  ["staff_role_assignments",new Set(["role","suspended","assigned_by"])],
  ["staff_capability_grants",new Set(["capability","effect","user_id"])],
  ["manual_plan_grants",new Set(["user_id","plan","active"])],
  ["entities",new Set(["type"])],
  ["meta",new Set(["key"])],
]);
const PROTECTED_META_KEYS=new Set(["schema_version","primary_admin_user_id","primary_creator_user_id","creator_setup_required","admin_setup_required"]);

function quoteId(value){return `"${String(value).replaceAll('"','""')}"`;}
function tableExists(table){return Boolean(db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`).get(table));}
function allTableNames(){return db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name`).all().map(r=>r.name).filter(name=>!HIDDEN_TABLES.has(name));}
function humanize(value){return String(value).split("_").map(x=>x?x[0].toUpperCase()+x.slice(1):x).join(" ");}
function safeTable(table){const value=String(table||"");if(HIDDEN_TABLES.has(value)||!tableExists(value))throw new Error("Tabela não permitida no Database Explorer.");return value;}
function rawColumns(table){return db.prepare(`PRAGMA table_info(${quoteId(safeTable(table))})`).all();}
function primaryKey(table){const cols=rawColumns(table);return cols.find(c=>c.pk)?.name||cols[0]?.name||"rowid";}
function isPrivateColumn(table,name){return table==="social_messages"&&PRIVATE_MESSAGE_COLUMNS.has(name);}
function isSecretColumn(name){return SECRET_COLUMN.test(String(name||""));}
function isManagedColumn(table,name){return MANAGED_COLUMNS.get(table)?.has(name)||false;}
function editability(table,column,record=null){
  if(READ_ONLY_TABLES.has(table))return {editable:false,reason:"Tabela de auditoria/histórico é somente leitura."};
  if(column.pk)return {editable:false,reason:"Chave primária é imutável."};
  if(isSecretColumn(column.name))return {editable:false,reason:"Campo protegido de autenticação/segredo."};
  if(isPrivateColumn(table,column.name))return {editable:false,reason:"Conteúdo de mensagem privada não é exposto pelo Database Explorer."};
  if(column.name==="created_at")return {editable:false,reason:"Data de criação é imutável."};
  if(column.name==="updated_at")return {editable:false,reason:"Atualizado automaticamente pelo servidor."};
  if(isManagedColumn(table,column.name))return {editable:false,reason:table==="entities"?"Gerenciado pelo fluxo de entidade canônica.":"Gerenciado por uma ferramenta administrativa dedicada."};
  if(table==="meta"&&record&&PROTECTED_META_KEYS.has(String(record.key||"")))return {editable:false,reason:"Metadado crítico protegido."};
  return {editable:true,reason:""};
}
function columns(table,record=null){return rawColumns(table).map(c=>{
  const hidden=isSecretColumn(c.name)||isPrivateColumn(table,c.name),edit=editability(table,{...c,pk:Boolean(c.pk)},record);
  return {name:c.name,type:c.type||"TEXT",pk:Boolean(c.pk),notNull:Boolean(c.notnull),defaultValue:c.dflt_value??null,hidden,editable:edit.editable,readOnlyReason:edit.reason};
});}
function visibleColumns(table,record=null){return columns(table,record).filter(c=>!c.hidden);}
function sanitize(row,{table="",truncate=true}={}){
  if(!row)return null;const out={};
  for(const [k,v] of Object.entries(row)){
    if(isSecretColumn(k)||isPrivateColumn(table,k))continue;
    if(Buffer.isBuffer(v)){out[k]=`[BINARY ${v.length} bytes]`;}
    else if(truncate&&typeof v==="string"&&v.length>1200)out[k]=`${v.slice(0,1200)}…`;
    else if(!truncate&&typeof v==="string"&&v.length>100000)out[k]=`${v.slice(0,100000)}…`;
    else out[k]=v;
  }
  return out;
}
function searchColumns(table){return visibleColumns(table).filter(c=>/TEXT|CHAR|CLOB/i.test(c.type)||["id","name","slug","status","type","trace_id","game_id","entity_id","title","username","email"].includes(c.name));}
function tableLabel(table){return LABELS[table]||humanize(table);}
function tableCategory(table){
  if(/^social_/.test(table)||["friend_requests","friendships","user_follows","user_blocks","user_mutes"].includes(table))return "SOCIAL";
  if(/^ai|flow_|semantic_|brain_|intent_/.test(table))return "AI";
  if(/^research_|sources|claims|evidence|knowledge/.test(table))return "RESEARCH";
  if(/^construction_|generation_|autonomous_|autogen_/.test(table))return "CONSTRUCTION";
  if(/^user|^staff_|subscriptions|manual_plan|developer_permissions/.test(table))return "USERS_ACCESS";
  if(/^image|generated_assets|manual_image/.test(table))return "IMAGES";
  if(/^bug|test_|simulator_/.test(table))return "QA";
  if(/^page|article|creator_|content_/.test(table))return "CONTENT";
  if(/^deployment|runtime_|meta|schema_/.test(table))return "RUNTIME";
  return "CORE";
}
function recordFingerprint(record){return createHash("sha256").update(JSON.stringify(record||{})).digest("hex").slice(0,24);}
function primaryCreatorId(){try{return String(db.prepare(`SELECT value FROM meta WHERE key='primary_creator_user_id'`).get()?.value||db.prepare(`SELECT value FROM meta WHERE key='primary_admin_user_id'`).get()?.value||"");}catch{return "";}}
function normalizeValue(column,value){
  if(value===null)return null;
  if(typeof value==="undefined")throw new Error(`Valor ausente para ${column.name}.`);
  if(/INT/i.test(column.type)){const n=Number(value);if(!Number.isInteger(n))throw new Error(`${column.name} exige número inteiro.`);return n;}
  if(/REAL|FLOA|DOUB|NUMERIC|DECIMAL/i.test(column.type)){const n=Number(value);if(!Number.isFinite(n))throw new Error(`${column.name} exige número válido.`);return n;}
  if(/BLOB/i.test(column.type))throw new Error(`${column.name} é binário e não pode ser editado por este painel.`);
  const text=String(value);
  if(column.name.endsWith("_json")&&text.trim()){try{JSON.parse(text);}catch{throw new Error(`${column.name} precisa conter JSON válido.`);}}
  return text;
}
function enforceSpecialRules(table,before,changes){
  const creator=primaryCreatorId();
  if(table==="users"&&before?.id===creator){
    if(Object.hasOwn(changes,"email")&&String(changes.email||"").trim().length<3)throw new Error("O Creator primário precisa manter um e-mail válido.");
  }
  if(table==="staff_role_assignments"&&before?.user_id===creator)throw new Error("O papel do Creator primário deve ser alterado apenas pelo fluxo seguro de Creator Control/Recovery.");
  if(table==="meta"&&PROTECTED_META_KEYS.has(String(before?.key||"")))throw new Error("Este metadado crítico é protegido contra edição manual.");
}

export function databaseExplorerOverview(){
  const integrity=verifyDatabase(),storage=databaseStorageState({includePath:true});
  const tables=allTableNames().map(name=>({name,label:tableLabel(name),category:tableCategory(name),count:Number(db.prepare(`SELECT COUNT(*) count FROM ${quoteId(name)}`).get()?.count||0),readOnly:READ_ONLY_TABLES.has(name)}));
  return {version:"Database Explorer V2",status:!integrity.ok?"ERROR":storage.write?"HEALTHY":"READ_ONLY",integrity:integrity.integrity||integrity.reason||"unknown",schemaVersion:schemaVersion(),sizeBytes:existsSync(databasePath)?statSync(databasePath).size:0,latestBackup:latestBackup(),storage,tables,policy:{secrets:"HIDDEN",privateMessages:"CONTENT_HIDDEN",devMode:"READ_ONLY",creatorMode:"CONTROLLED_EDIT",arbitrarySql:false,deleteRows:false,insertRows:false}};
}
export function databaseReadProbe(){return {...testDatabaseRead(),testedAt:nowIso()};}
export function databaseWriteProbe(){return {...testDatabaseWrite(),testedAt:nowIso(),rolledBack:true};}
export function browseDatabaseTable({table,q="",limit=50,offset=0}={}){
  table=safeTable(table);const cols=visibleColumns(table),names=cols.map(c=>c.name),n=Math.min(100,Math.max(1,Number(limit)||50)),o=Math.max(0,Number(offset)||0),query=String(q||"").trim();let where="",args=[];
  if(query){const sc=searchColumns(table).slice(0,16);if(sc.length){where=` WHERE ${sc.map(c=>`CAST(${quoteId(c.name)} AS TEXT) LIKE ?`).join(" OR ")}`;args=sc.map(()=>`%${query}%`);}}
  const key=primaryKey(table),select=names.length?names.map(quoteId).join(","):"rowid",order=names.includes("updated_at")?`${quoteId("updated_at")} DESC`:names.includes("created_at")?`${quoteId("created_at")} DESC`:`${quoteId(key)} ASC`;
  const rows=db.prepare(`SELECT ${select} FROM ${quoteId(table)}${where} ORDER BY ${order} LIMIT ? OFFSET ?`).all(...args,n,o).map(row=>sanitize(row,{table,truncate:true}));
  const total=Number(db.prepare(`SELECT COUNT(*) count FROM ${quoteId(table)}${where}`).get(...args)?.count||0);
  return {table,label:tableLabel(table),category:tableCategory(table),columns:cols,primaryKey:key,entries:rows,total,limit:n,offset:o,q:query,readOnly:READ_ONLY_TABLES.has(table)};
}
export function getDatabaseRecord({table,id}={}){
  table=safeTable(table);const key=primaryKey(table),selectCols=rawColumns(table).filter(c=>!isSecretColumn(c.name)&&!isPrivateColumn(table,c.name));const select=selectCols.map(c=>quoteId(c.name)).join(",");
  const raw=db.prepare(`SELECT ${select} FROM ${quoteId(table)} WHERE CAST(${quoteId(key)} AS TEXT)=? LIMIT 1`).get(String(id));
  if(!raw)return null;const record=sanitize(raw,{table,truncate:false}),cols=columns(table,record);
  return {table,label:tableLabel(table),category:tableCategory(table),primaryKey:key,record,columns:cols,recordFingerprint:recordFingerprint(record),readOnly:READ_ONLY_TABLES.has(table),protectedFields:rawColumns(table).filter(c=>isSecretColumn(c.name)||isPrivateColumn(table,c.name)).map(c=>({name:c.name,reason:isPrivateColumn(table,c.name)?"PRIVATE_MESSAGE_CONTENT":"SECRET"}))};
}
export function updateDatabaseRecord({table,id,changes={},reason="",expectedFingerprint="",actorUserId=""}={}){
  table=safeTable(table);if(READ_ONLY_TABLES.has(table))throw new Error("Esta tabela é somente leitura.");
  const current=getDatabaseRecord({table,id});if(!current)throw new Error("Registro não encontrado.");
  if(String(reason||"").trim().length<5)throw new Error("Informe um motivo com pelo menos 5 caracteres.");
  if(expectedFingerprint&&expectedFingerprint!==current.recordFingerprint)throw Object.assign(new Error("O registro mudou desde que foi aberto. Recarregue antes de salvar."),{code:"STALE_RECORD"});
  const allowed=new Map(current.columns.filter(c=>c.editable).map(c=>[c.name,c]));const normalized={};
  for(const [name,value] of Object.entries(changes||{})){
    const column=allowed.get(name);if(!column)throw new Error(`Campo ${name} não pode ser editado por este painel.`);
    normalized[name]=normalizeValue(column,value);
  }
  if(!Object.keys(normalized).length)throw new Error("Nenhuma alteração válida foi enviada.");
  enforceSpecialRules(table,current.record,normalized);
  const key=current.primaryKey,updatedAtColumn=current.columns.find(c=>c.name==="updated_at");if(updatedAtColumn)normalized.updated_at=nowIso();
  const assignments=Object.keys(normalized).map(name=>`${quoteId(name)}=?`).join(", "),values=Object.values(normalized);
  const before=current.record;
  try{
    db.exec("BEGIN IMMEDIATE");
    const result=db.prepare(`UPDATE ${quoteId(table)} SET ${assignments} WHERE CAST(${quoteId(key)} AS TEXT)=?`).run(...values,String(id));
    if(Number(result.changes||0)!==1)throw new Error("A alteração não atingiu exatamente um registro.");
    const fk=db.prepare("PRAGMA foreign_key_check").all();if(fk.length)throw new Error(`A alteração criaria ${fk.length} violação(ões) de chave estrangeira.`);
    const afterRaw=getDatabaseRecord({table,id})?.record||{};
    const diffForAudit={};for(const name of Object.keys(normalized)){if(name==="updated_at")continue;diffForAudit[name]={before:before[name]??null,after:afterRaw[name]??null};}
    if(!tableExists("admin_actions"))throw new Error("Audit Log indisponível; alteração cancelada.");
    db.prepare(`INSERT INTO admin_actions(id,admin_user_id,action_type,target_type,target_id,metadata_json,created_at) VALUES(?,?,?,?,?,?,?)`).run(randomUUID(),String(actorUserId||""),"DATABASE_RECORD_UPDATE",table,String(id),JSON.stringify({reason:String(reason).trim().slice(0,500),diff:diffForAudit,source:"DATABASE_EXPLORER_V2"}),nowIso());
    db.exec("COMMIT");
  }catch(error){try{db.exec("ROLLBACK");}catch{}throw error;}
  const after=getDatabaseRecord({table,id});
  const diff={};for(const name of Object.keys(normalized)){if(name==="updated_at")continue;diff[name]={before:before[name]??null,after:after.record[name]??null};}
  return {ok:true,table,id:String(id),reason:String(reason).trim().slice(0,500),before,after:after.record,diff,recordFingerprint:after.recordFingerprint};
}
export function listDatabaseRecordHistory({table,id,limit=30}={}){
  table=safeTable(table);if(!tableExists("admin_actions"))return [];
  return db.prepare(`SELECT id,admin_user_id,action_type,target_type,target_id,metadata_json,created_at FROM admin_actions WHERE action_type='DATABASE_RECORD_UPDATE' AND target_type=? AND target_id=? ORDER BY created_at DESC LIMIT ?`).all(table,String(id),Math.min(100,Math.max(1,Number(limit)||30))).map(row=>{let metadata={};try{metadata=JSON.parse(row.metadata_json||"{}");}catch{}return {id:row.id,adminUserId:row.admin_user_id,actionType:row.action_type,targetType:row.target_type,targetId:row.target_id,metadata,createdAt:row.created_at};});
}
export function databaseIntegrityDiagnostics(){const orphanKnowledge=Number(db.prepare(`SELECT COUNT(*) count FROM knowledge k LEFT JOIN games g ON g.id=k.game_id WHERE g.id IS NULL`).get()?.count||0);const orphanEntities=Number(db.prepare(`SELECT COUNT(*) count FROM entities e LEFT JOIN games g ON g.id=e.game_id WHERE g.id IS NULL`).get()?.count||0);const duplicateEntities=db.prepare(`SELECT game_id,lower(name) name,COUNT(*) count FROM entities GROUP BY game_id,lower(name) HAVING COUNT(*)>1 LIMIT 50`).all();let brokenRelationships=0;try{brokenRelationships=Number(db.prepare(`SELECT COUNT(*) count FROM relationships r LEFT JOIN entities s ON s.id=r.source_entity_id LEFT JOIN entities t ON t.id=r.target_entity_id WHERE s.id IS NULL OR t.id IS NULL`).get()?.count||0);}catch{}return {integrity:verifyDatabase(),orphanKnowledge,orphanEntities,brokenRelationships,duplicateEntities,entityConflicts:entityConsistencyReport({limit:100,onlyConflicts:true})};}
export function editEntityCanonicalType({entityId,type,reason="Database Explorer correction"}={}){if(!ENTITY_TYPES.has(String(type||"").toUpperCase()))throw new Error("Tipo de entidade inválido.");const before=getDatabaseRecord({table:"entities",id:entityId})?.record;if(!before)throw new Error("Entidade não encontrada.");const canonical=setManualCanonicalType({entityId,type,reason});const after=getDatabaseRecord({table:"entities",id:entityId})?.record;return {before,after,canonical};}
export function markEntityForReview(entityId){const before=getDatabaseRecord({table:"entities",id:entityId})?.record;if(!before)throw new Error("Entidade não encontrada.");db.prepare(`UPDATE entity_canonical_state SET validation_status='NEEDS_REVIEW',reason='Marked for review in Database Explorer',updated_at=? WHERE entity_id=?`).run(nowIso(),entityId);return {before,after:getDatabaseRecord({table:"entities",id:entityId})?.record};}
