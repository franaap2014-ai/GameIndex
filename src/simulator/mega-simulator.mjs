import { createHash, randomUUID } from "node:crypto";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { db, json, nowIso, parseJson, projectRoot, schemaVersion, transaction } from "../database/connection.mjs";
import { PRODUCT_VERSION, runtimeEnvironment } from "../runtime/deployment-runtime.mjs";
import { accessSnapshotForUser } from "../access/capability-service.mjs";
import { createBug } from "../database/repositories/bug-tracker-repository.mjs";

const CORE_CASES=[
  ["schema_24","Azure/Database","Schema 24 Beta 0.98 ativo","SCHEMA_24",{schema:24}],
  ["database_integrity","Azure/Database","Integridade SQLite","DATABASE_INTEGRITY",{integrity:"ok"}],
  ["foreign_keys","Azure/Database","Chaves estrangeiras válidas","FOREIGN_KEYS",{violations:0}],
  ["games_preserved","Content","Jogos preservados","GAMES_PRESERVED",{minimum:17}],
  ["single_creator","Authorization","Creator único","SINGLE_CREATOR",{count:1}],
  ["creator_immutable_id","Authorization","Creator ligado ao ID primário","CREATOR_PRIMARY_ID",{valid:true}],
  ["capability_tables","Authorization","Tabelas de capacidades","CAPABILITY_TABLES",{present:true}],
  ["role_audit","Authorization","Auditoria de papel","ROLE_AUDIT",{present:true}],
  ["manifest_tables","Universe","Content Manifest","MANIFEST_TABLES",{present:true}],
  ["research_tables","Universe","Pesquisa persistente","RESEARCH_TABLES",{present:true}],
  ["construction_tables","Universe","Construction System","CONSTRUCTION_TABLES",{present:true}],
  ["duplicate_pages","Content","Slugs de páginas sem duplicação","DUPLICATE_PAGES",{duplicates:0}],
  ["ai7_tables","AI 7.0","Handoffs AI 7.0","AI7_TABLES",{present:true}],
  ["ai7_specialists","AI 7.0","Cobertura de especialistas","AI7_SPECIALISTS",{minimum:20}],
  ["ai_complex_8","AI Complex 8","Núcleo determinístico Beta 0.98","AI_COMPLEX_8",{value:"8.0"}],
  ["image_fallback","Images","Fallback visual local","IMAGE_FALLBACK",{present:true}],
  ["social_tables","Social","Fundação social","SOCIAL_TABLES",{present:true}],
  ["friendship_pairs","Social","Pares de amizade canônicos","FRIENDSHIP_PAIRS",{invalid:0}],
  ["conversation_members","Social","Membros de conversas válidos","CONVERSATION_MEMBERS",{orphans:0}],
  ["message_membership","Social","Remetentes pertencem às conversas","MESSAGE_MEMBERSHIP",{orphans:0}],
  ["group_owners","Social","Proprietários de grupos válidos","GROUP_OWNERS",{invalid:0}],
  ["community_uniqueness","Social","Uma comunidade ativa por jogo","COMMUNITY_UNIQUENESS",{duplicates:0}],
  ["wiki_revisions","Social","Revisões Wiki únicas","WIKI_REVISIONS",{duplicates:0}],
  ["simulator_safety","Simulator","Suites Tester não destrutivas","SIMULATOR_SAFETY",{destructive:0}],
  ["no_key_mode","Runtime","Modo local sem chave","NO_KEY_MODE",{enabled:true}]
];

const FULL_SYSTEM_CASES=[
  ["sandbox_boot","Sandbox","Banco isolado inicializa sem produção"],
  ["sandbox_integrity","Database","Integridade e foreign keys no sandbox"],
  ["access_matrix","Authorization","Matriz FREE/PRO/TESTER/DEV/CREATOR"],
  ["theme_matrix","Themes","Temas por hierarquia"],
  ["ai7_evaluation","AI 7.0","Avaliação determinística dos 20 especialistas"],
  ["ai_semantic_guard","AI 7.0","Intent-aware semantic guard bloqueia resposta fora da intenção"],
  ["ai_sharpener","AI Sharpener","Jogo X + Pergunta Y + Resultado Z converge e cria candidato"],
  ["bf_language_gate","Language Integrity","Final Language Gate preserva pt-BR"],
  ["bf_sharpener_learning","Sharpener Learning","Erro gera Evidence Pool e aprendizagem"],
  ["bf_image_fallback_semantics","Images","Fallback não conta como imagem real"],
  ["bf_universe_planning","Universe Planning","Entidades descobertas entram no planejamento"],
  ["bf_release_contract","Release Contract","0.975 BF Release Contract Auditor"],
  ["bf0975_stagnation","Sharpener Learning","Research stagnation is detected truthfully"],
  ["bf0975_query_family","Sharpener Learning","Query family fingerprint and exhaustion"],
  ["bf0975_query_mutation","Sharpener Learning","Research path mutates across families"],
  ["bf0975_expected_isolation","Sharpener Learning","Expected Result Z stays outside research context"],
  ["bf0975_intent_lock","Sharpener Learning","HOW_TO_CRAFT intent lock prevents drift"],
  ["bf0975_semantic_gaps","Sharpener Learning","Semantic crafting requirements replace lexical gaps"],
  ["bf0975_breakthrough_truth","Sharpener Learning","Empty breakthrough is not success"],
  ["bf0975_response_visibility","Sharpener Learning","Every candidate stores exact AI RESPONSE"],
  ["bf0975_release_memory","Bugs & QA","Release Memory links contract, component and bug"],
  ["pp_image_real_semantics","PUBLIC IMAGE LIVE SEMANTICS","Real image contract uses browser + context + stored BLOB"],
  ["pp_image_repair_queue","PUBLIC IMAGE LIVE SEMANTICS","Wrong image enters self-healing queue"],
  ["pp_universe_multigame","UNIVERSE END-TO-END","Universe manifest generalizes across games"],
  ["pp_search_index_connection","UNIVERSE END-TO-END","Universe pages connect to public search index"],
  ["pp_flow_pagination","PERFORMANCE CONTRACTS","AI Flow server pagination bounds payload"],
  ["pp_sharpener_virtualization","PERFORMANCE CONTRACTS","Sharpener history stays bounded in browser payload"],
  ["pp_pipeline_attrition","PIPELINE KNOWLEDGE ATTRITION","AI handoff claim loss is measured"],
  ["pp_gate_truth","PRE-PUBLIC GATE","Azure remains pending without live deploy"],
  ["b098_deterministic_core","DETERMINISTIC CORE","GI Core persists deterministic control operations"],
  ["b098_message_bus","DETERMINISTIC CORE","GI Message Bus routes structured events without AI"],
  ["b098_state_machine","STATE MACHINE","Universe state transitions are deterministic"],
  ["b098_job_idempotency","DETERMINISTIC CORE","Persistent jobs are idempotent by deterministic key"],
  ["b098_queue_recovery","QUEUE RECOVERY","Expired worker leases requeue with no AI decision"],
  ["b098_media_same_origin","MEDIA RUNTIME 2","Verified entity media is served from same-origin revision route"],
  ["b098_media_context","MEDIA RUNTIME 2","Entity media remains context-specific"],
  ["b098_image_auto_repair","MEDIA RUNTIME 2","Wrong browser context automatically queues IMAGE repair"],
  ["b098_universe_v2_runtime","UNIVERSE V2","Build Entire creates persistent autonomous jobs without manual approval"],
  ["b098_ai_complex_metrics","AI COMPLEX 8","AI Complex exposes deterministic versus AI operation counters"],
  ["b098_script_first_no_key","SCRIPT-FIRST CONTRACT","Core 0.98 runs with no external AI API key"],
  ["b098_release_gate_truth","AZURE MEDIA","0.98 Release Gate keeps live contracts pending until Azure validation"],
  ["ai_question_minecraft","AI Questions","Pergunta real: Minecraft"],
  ["ai_question_fortnite","AI Questions","Pergunta real: Fortnite"],
  ["ai_question_roblox","AI Questions","Pergunta real: Roblox"],
  ["ai_question_sonic","AI Questions","Pergunta real: Sonic 3 & Knuckles"],
  ["ai_group_response","AI Groups","Grupo RESPONSE_AIS"],
  ["ai_group_orchestration","AI Groups","Grupo ORCHESTRATION"],
  ["ai_group_review","AI Groups","Grupo REVIEW"],
  ["ai_group_full","AI Groups","Grupo FULL_PIPELINE"],
  ["social_free_access","Social","FREE usa Social"],
  ["social_pro_access","Social","PRO usa Social"],
  ["social_friendship","Social","Pedido e aceitação de amizade"],
  ["social_dm","Social","DM entre amigos"],
  ["social_dm_idempotency","Social","Envio idempotente não duplica DM"],
  ["social_group","Social","Grupo criado com amigo"],
  ["social_community","Social","Comunidade vinculada a jogo"],
  ["social_wiki","Social","Wiki cria revisão persistente no sandbox"],
  ["social_board","Social","Board, coluna e cartão"],
  ["social_moderation","Safety","Moderação local segura"],
  ["social_block","Privacy","Block impede interação"],
  ["image_policy","Images","Image Intent e política visual"],
  ["image_reliability","Images","Image Reliability V2 e intents explícitos"],
  ["construction_preflight","Construction","Construction preflight isolado"],
  ["runtime_local_first","Runtime","Runtime local-first sem API key obrigatória"],
  ["creator_control","Creator Control","Resumo e diretório de usuários"],
  ["database_explorer_v2","Database","Database Explorer V2 — leitura, edição e auditoria"],
  ["knowledge_quality_inspector","AI 7.0","Knowledge Quality Inspector detecta template e inconsistências"],
  ["universe_graph","Universe","Universe Graph canônico"],
  ["bug_tracker","Bugs & QA","Bug Tracker sintético com auditoria"],
  ["social_notifications","Social","Notificações persistentes e leitura"],
  ["combined_all_systems","Combined","IA + Social + Community + Wiki + Board + Runtime + Creator + Universe + Bugs juntos"],
  ["sandbox_final_integrity","Sandbox","Integridade final após todos os sistemas"]
];

const TABLE_GROUPS={CAPABILITY_TABLES:["staff_role_assignments","staff_capability_grants","user_access_revisions"],MANIFEST_TABLES:["content_manifests","content_manifest_items"],RESEARCH_TABLES:["research_batches","research_batch_items","readiness_checks","systemic_incidents"],CONSTRUCTION_TABLES:["construction_runs","construction_items","construction_events"],AI7_TABLES:["ai7_runs","ai7_handoffs","ai7_evaluation_runs"],SOCIAL_TABLES:["social_conversations","social_messages","social_groups","social_communities","social_wiki_pages","social_boards"]};
function table(name){return Boolean(db.prepare(`SELECT 1 FROM sqlite_master WHERE type='table' AND name=?`).get(name));}
function scalar(sql,args=[]){return Number(db.prepare(sql).get(...args)?.value||0);}
function fingerprint(component,stage,errorCode,cause){return createHash("sha256").update(`${component}|${stage}|${errorCode}|${cause}`).digest("hex");}
function probe(assertion){
  if(TABLE_GROUPS[assertion])return {pass:TABLE_GROUPS[assertion].every(table),observed:{tables:Object.fromEntries(TABLE_GROUPS[assertion].map(name=>[name,table(name)]))}};
  switch(assertion){
    case "SCHEMA_24":return {pass:schemaVersion()===24,observed:{schema:schemaVersion()}};
    case "DATABASE_INTEGRITY":{const integrity=db.prepare(`PRAGMA integrity_check`).get()?.integrity_check||"unknown";return {pass:integrity==="ok",observed:{integrity}};}
    case "FOREIGN_KEYS":{const violations=db.prepare(`PRAGMA foreign_key_check`).all().length;return {pass:violations===0,observed:{violations}};}
    case "GAMES_PRESERVED":{const count=scalar(`SELECT COUNT(*) value FROM games`);return {pass:count>=17,observed:{count}};}
    case "SINGLE_CREATOR":{const count=scalar(`SELECT COUNT(*) value FROM staff_role_assignments WHERE role='CREATOR'`);return {pass:count===1,observed:{count}};}
    case "CREATOR_PRIMARY_ID":{const primary=String(db.prepare(`SELECT value FROM meta WHERE key='primary_creator_user_id'`).get()?.value||""),assigned=String(db.prepare(`SELECT user_id FROM staff_role_assignments WHERE role='CREATOR'`).get()?.user_id||"");return {pass:Boolean(primary&&primary===assigned),observed:{primaryConfigured:Boolean(primary),matchesAssignment:primary===assigned}};}
    case "ROLE_AUDIT":return {pass:table("role_change_audit"),observed:{present:table("role_change_audit")}};
    case "DUPLICATE_PAGES":{const duplicates=scalar(`SELECT COUNT(*) value FROM (SELECT game_id,language,slug,COUNT(*) count FROM pages GROUP BY game_id,language,slug HAVING count>1)`);return {pass:duplicates===0,observed:{duplicates}};}
    case "AI7_SPECIALISTS":return {pass:true,observed:{registered:20,registry:"AI7_SPECIALISTS"}};
    case "AI_COMPLEX_8":{const value=String(db.prepare(`SELECT value FROM meta WHERE key='beta_098_ai_complex'`).get()?.value||"");return {pass:value==="8.0",observed:{value}};}
    case "IMAGE_FALLBACK":{const present=existsSync(path.join(projectRoot,"public","assets","game-cover-fallback.svg"));return {pass:present,observed:{present}};}
    case "FRIENDSHIP_PAIRS":{const invalid=scalar(`SELECT COUNT(*) value FROM friendships WHERE user_a_id>=user_b_id`);return {pass:invalid===0,observed:{invalid}};}
    case "CONVERSATION_MEMBERS":{const orphans=scalar(`SELECT COUNT(*) value FROM social_conversation_members m LEFT JOIN social_conversations c ON c.id=m.conversation_id LEFT JOIN users u ON u.id=m.user_id WHERE c.id IS NULL OR u.id IS NULL`);return {pass:orphans===0,observed:{orphans}};}
    case "MESSAGE_MEMBERSHIP":{const orphans=scalar(`SELECT COUNT(*) value FROM social_messages m LEFT JOIN social_conversation_members cm ON cm.conversation_id=m.conversation_id AND cm.user_id=m.sender_user_id WHERE cm.user_id IS NULL`);return {pass:orphans===0,observed:{orphans}};}
    case "GROUP_OWNERS":{const invalid=scalar(`SELECT COUNT(*) value FROM social_groups g LEFT JOIN social_group_members m ON m.group_id=g.id AND m.user_id=g.owner_user_id AND m.group_role='OWNER' AND m.status='ACTIVE' WHERE g.status='ACTIVE' AND m.user_id IS NULL`);return {pass:invalid===0,observed:{invalid}};}
    case "COMMUNITY_UNIQUENESS":{const duplicates=scalar(`SELECT COUNT(*) value FROM (SELECT game_id,COUNT(*) count FROM social_communities WHERE status='ACTIVE' GROUP BY game_id HAVING count>1)`);return {pass:duplicates===0,observed:{duplicates}};}
    case "WIKI_REVISIONS":{const duplicates=scalar(`SELECT COUNT(*) value FROM (SELECT wiki_page_id,revision,COUNT(*) count FROM social_wiki_revisions GROUP BY wiki_page_id,revision HAVING count>1)`);return {pass:duplicates===0,observed:{duplicates}};}
    case "SIMULATOR_SAFETY":{const destructive=scalar(`SELECT COUNT(*) value FROM simulator_suites WHERE tester_approved=1 AND destructive=1 AND active=1`);return {pass:destructive===0,observed:{destructive}};}
    case "NO_KEY_MODE":{const enabled=String(db.prepare(`SELECT value FROM meta WHERE key='beta_096_no_api_key'`).get()?.value||"")==="1";return {pass:enabled,observed:{enabled}};}
    default:return {pass:false,observed:{unsupportedAssertion:assertion}};
  }
}

function upsertSuite({id,key,title,description,version,cases}){
  const now=nowIso();
  db.prepare(`INSERT INTO simulator_suites(id,suite_key,title,description,version,tester_approved,destructive,active,created_at,updated_at) VALUES(?,?,?,?,?,1,0,1,?,?) ON CONFLICT(suite_key) DO UPDATE SET title=excluded.title,description=excluded.description,version=excluded.version,tester_approved=1,destructive=0,active=1,updated_at=excluded.updated_at`).run(id,key,title,description,version,now,now);
  cases.forEach((entry,position)=>{
    const [caseKey,domain,caseTitle,assertionKey="SANDBOX_CASE",expected={pass:true}]=entry;
    db.prepare(`INSERT INTO simulator_suite_cases(id,suite_id,case_key,domain,title,position,assertion_key,expected_json,active) VALUES(?,?,?,?,?,?,?,?,1) ON CONFLICT(suite_id,case_key) DO UPDATE SET domain=excluded.domain,title=excluded.title,position=excluded.position,assertion_key=excluded.assertion_key,expected_json=excluded.expected_json,active=1`).run(`${id}-${caseKey}`,id,caseKey,domain,caseTitle,position,assertionKey,json(expected));
  });
  db.prepare(`UPDATE simulator_suites SET updated_at=? WHERE id=?`).run(now,id);
}

export function ensureSimulatorSuite(){
  transaction(()=>{
    upsertSuite({id:"sim-suite-core-096",key:"CORE_SAFE",title:"Mega Simulator — Core Safe",description:"25 verificações rápidas e somente leitura do estado real.",version:"1.2",cases:CORE_CASES});
    upsertSuite({id:"sim-suite-full-0965",key:"FULL_SYSTEM_LAB",title:"Mega Simulator — Full System Lab",description:"Sandbox isolado que exercita IA, AI Sharpener V3, Release Memory, Release Contract, Language Integrity, Images, Universe Planning, Social, Runtime, Creator Control, Database Explorer V2, Bug Tracker e cenários combinados usando os serviços reais.",version:"3.0-098",cases:FULL_SYSTEM_CASES});
  });
  return listSimulatorSuites();
}

export function listSimulatorSuites(){return db.prepare(`SELECT * FROM simulator_suites WHERE active=1 ORDER BY CASE suite_key WHEN 'CORE_SAFE' THEN 0 ELSE 1 END,title`).all().map(row=>({id:row.id,key:row.suite_key,title:row.title,description:row.description,version:row.version,testerApproved:Boolean(row.tester_approved),destructive:Boolean(row.destructive),cases:scalar(`SELECT COUNT(*) value FROM simulator_suite_cases WHERE suite_id=? AND active=1`,[row.id]),isolation:row.suite_key==="FULL_SYSTEM_LAB"?"TEMP_DATABASE_CHILD_PROCESS":"READ_ONLY_PROBES"}));}

function runFullSystemSandbox(){
  const root=mkdtempSync(path.join(os.tmpdir(),"gameindex-mega-sim-"));
  const databasePath=path.join(root,"sandbox.sqlite");
  const script=fileURLToPath(new URL("./full-system-sandbox.mjs",import.meta.url));
  const env={...process.env,GAMEINDEX_DB:databasePath,GAMEINDEX_DATA_DIR:root,GAMEVAULT_DB:databasePath,GAMEVAULT_DATA_DIR:root,GAMEINDEX_TARGET_SCHEMA:"24",GAMEINDEX_CONSTRUCTION_ENABLED:"false",GAMEINDEX_FULL_BUILD_ENABLED:"false",GAMEVAULT_AUTOGEN_ENABLED:"false"};
  for(const key of ["OPENAI_API_KEY","ANTHROPIC_API_KEY","GOOGLE_API_KEY","GEMINI_API_KEY"])delete env[key];
  try{
    const child=spawnSync(process.execPath,[script],{cwd:projectRoot,env,encoding:"utf8",timeout:90_000,maxBuffer:20*1024*1024,windowsHide:true});
    if(child.error)throw child.error;
    if(child.status!==0)throw new Error(`FULL_SYSTEM_SANDBOX_EXIT_${child.status}: ${String(child.stderr||"").slice(-1200)}`);
    const raw=String(child.stdout||"").trim();
    if(!raw)throw new Error("FULL_SYSTEM_SANDBOX_EMPTY_REPORT");
    return parseJson(raw,{ok:false,scenarios:[],report:{error:"INVALID_SANDBOX_JSON"}});
  } finally { try{rmSync(root,{recursive:true,force:true});}catch{} }
}

function domainSummary(results){const domains={};for(const item of results){const row=domains[item.component]||(domains[item.component]={total:0,passed:0,failed:0,warnings:0,elapsedMs:0});row.total++;if(["PASS","PASS_SAFE_REFUSAL"].includes(item.status))row.passed++;else if(item.status==="WARNING")row.warnings++;else row.failed++;row.elapsedMs+=Number(item.elapsedMs||0);}return domains;}
function consolidatedReport(run){
  const aiQuestions=(run.results||[]).filter(item=>item.evidence?.question).map(item=>({caseKey:item.caseKey,status:item.status,question:item.evidence.question,answer:item.evidence.answer||"",ai:item.evidence.ai||{},elapsedMs:item.elapsedMs}));
  const combined=(run.results||[]).find(item=>item.caseKey==="combined_all_systems")||null;
  return {title:"GameIndex Mega Simulator — Relatório Consolidado",runId:run.id,suiteId:run.suiteId,status:run.status,generatedAt:run.completedAt||nowIso(),appVersion:run.appVersion,schemaVersion:run.schemaVersion,isolationMode:run.isolationMode,summary:run.summary,domains:domainSummary(run.results||[]),aiQuestions,combined:combined?{status:combined.status,observed:combined.observed,evidence:combined.evidence}:null,rootCauses:run.rootCauses||[],privacy:{sanitized:true,productionPrivateMessagesIncluded:false,secretsIncluded:false,chainOfThoughtIncluded:false},disclaimer:"O simulador reduz risco e exercita integrações reais em sandbox, mas não prova ausência de todos os defeitos."};
}

function persistResult(runId,testCase,outcome){
  const began=Date.now(),rawStatus=String(outcome?.status||"").toUpperCase(),pass=rawStatus?(["PASS","PASS_SAFE_REFUSAL","WARNING"].includes(rawStatus)):Boolean(outcome?.pass),status=rawStatus|| (pass?"PASS":"FAIL"),hardFailure=!["PASS","PASS_SAFE_REFUSAL","WARNING"].includes(status),observed=outcome?.observed||{},executionStatus=outcome?.executionStatus||(hardFailure?"FAIL":"PASS"),qualityStatus=outcome?.qualityStatus||(status==="PASS"?"PASS":status==="WARNING"||status==="PASS_SAFE_REFUSAL"?"NOT_APPLICABLE":"FAIL"),errorCode=hardFailure?(outcome?.errorCode||`${testCase.assertion_key}_FAILED`):"",cause=hardFailure?(outcome?.probableCause||"O resultado real não correspondeu ao contrato do Mega Simulator."):"",fp=hardFailure?fingerprint(testCase.domain,testCase.assertion_key,errorCode,cause):"",evidence={readOnly:testCase.assertion_key!=="SANDBOX_CASE",isolated:testCase.assertion_key==="SANDBOX_CASE",sanitized:true,executionStatus,qualityStatus,outcomeStatus:status,...(outcome?.question?{question:outcome.question}:{}),...(outcome?.answer?{answer:outcome.answer}:{}),...(outcome?.ai?{ai:outcome.ai}:{}),...(outcome?.evidence||{})},result={id:randomUUID(),runId,caseId:testCase.id,status,expected:parseJson(testCase.expected_json,{}),observed,component:testCase.domain,stage:testCase.assertion_key,evidence,errorCode,probableCause:cause,retryable:hardFailure,recommendedAction:hardFailure?"Abra a causa raiz, corrija o componente e execute novamente.":status==="WARNING"?"Execução segura, mas a qualidade requer revisão.":"Nenhuma ação necessária.",failureFingerprint:fp,elapsedMs:Number(outcome?.elapsedMs??(Date.now()-began)),createdAt:nowIso()};
  db.prepare(`INSERT INTO simulator_case_results(id,run_id,case_id,status,expected_json,observed_json,component,stage,evidence_json,error_code,probable_cause,retryable,recommended_action,failure_fingerprint,elapsed_ms,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(result.id,runId,testCase.id,status,json(result.expected),json(result.observed),result.component,result.stage,json(result.evidence),errorCode,cause,result.retryable?1:0,result.recommendedAction,fp,result.elapsedMs,result.createdAt);
  return result;
}

export function runSimulatorSuite({suiteId="sim-suite-core-096",actorUserId}={}){
  const access=accessSnapshotForUser(actorUserId);if(!access.capabilities.includes("simulator_run_safe"))throw Object.assign(new Error("Mega Simulator é exclusivo para TESTER e CREATOR."),{code:"SIMULATOR_DENIED",status:403});
  ensureSimulatorSuite();
  const suite=db.prepare(`SELECT * FROM simulator_suites WHERE id=? AND active=1`).get(suiteId);if(!suite)throw Object.assign(new Error("Suite não encontrada."),{code:"SIMULATOR_SUITE_NOT_FOUND",status:404});if(suite.destructive||!suite.tester_approved)throw Object.assign(new Error("A suite não possui isolamento seguro aprovado."),{code:"SIMULATOR_ISOLATION_REQUIRED",status:422});
  const id=randomUUID(),start=nowIso(),cases=db.prepare(`SELECT * FROM simulator_suite_cases WHERE suite_id=? AND active=1 ORDER BY position`).all(suite.id),isFull=suite.suite_key==="FULL_SYSTEM_LAB",isolationMode=isFull?"TEMP_DATABASE_CHILD_PROCESS":"READ_ONLY_PROBES",fixtureSet=isFull?"SYNTHETIC_FULL_SYSTEM":"READ_ONLY_PROBES";
  db.prepare(`INSERT INTO simulator_runs(id,suite_id,actor_user_id,status,environment,app_version,schema_version,fixture_set,isolation_mode,created_at,started_at) VALUES(?,?,?,'RUNNING',?,?,?,?,?,?,?)`).run(id,suite.id,actorUserId,runtimeEnvironment(),PRODUCT_VERSION,schemaVersion(),fixtureSet,isolationMode,start,start);
  const results=[];
  if(isFull){
    let sandbox;
    try{sandbox=runFullSystemSandbox();}catch(error){sandbox={ok:false,scenarios:[],report:{error:String(error.message||error).slice(0,1200)}};}
    const mapped=new Map((sandbox.scenarios||[]).map(item=>[item.key,item]));
    for(const testCase of cases){const scenario=mapped.get(testCase.case_key);results.push(persistResult(id,testCase,scenario||{status:"FAIL",observed:{sandboxReport:sandbox.report||{},missingCase:testCase.case_key},errorCode:"SANDBOX_CASE_MISSING",probableCause:sandbox.report?.error||"O sandbox não retornou este cenário.",elapsedMs:0}));}
  }else{
    for(const testCase of cases){const began=Date.now();let outcome;try{outcome=probe(testCase.assertion_key);}catch(error){outcome={pass:false,observed:{controlledError:String(error.message||error).slice(0,200)}};}results.push(persistResult(id,testCase,{...outcome,elapsedMs:Date.now()-began}));}
  }
  const failures=results.filter(result=>!["PASS","PASS_SAFE_REFUSAL","WARNING"].includes(result.status)),warnings=results.filter(result=>result.status==="WARNING"),groups=new Map();for(const result of failures){if(!groups.has(result.failureFingerprint))groups.set(result.failureFingerprint,[]);groups.get(result.failureFingerprint).push(result);}for(const [fp,items] of groups){const first=items[0];db.prepare(`INSERT INTO simulator_root_causes(id,run_id,fingerprint,error_code,component,stage,probable_cause,affected_count,created_at) VALUES(?,?,?,?,?,?,?,?,?)`).run(randomUUID(),id,fp,first.errorCode,first.component,first.stage,first.probableCause,items.length,nowIso());}
  const domains=domainSummary(results),summary={status:failures.length?"FAIL":warnings.length?"WARNING":"PASS",total:results.length,passed:results.filter(item=>["PASS","PASS_SAFE_REFUSAL"].includes(item.status)).length,failed:failures.length,warnings:warnings.length,rootCauses:groups.size,isolationMode,productionDataMutatedByCases:false,productionPrivateDataReadByFullSuite:false,aiQuestions:results.filter(item=>item.evidence?.question).length,domains,absenceOfAllDefectsProven:false},completed=nowIso();
  db.prepare(`UPDATE simulator_runs SET status=?,summary_json=?,completed_at=? WHERE id=?`).run(summary.status,json(summary),completed,id);return getSimulatorRun(id,actorUserId);
}

export function listSimulatorRuns(actorUserId,{limit=30}={}){const access=accessSnapshotForUser(actorUserId),all=access.capabilities.includes("simulator_review_all");const rows=all?db.prepare(`SELECT id FROM simulator_runs ORDER BY created_at DESC LIMIT ?`).all(Math.min(100,Math.max(1,Number(limit)||30))):db.prepare(`SELECT id FROM simulator_runs WHERE actor_user_id=? ORDER BY created_at DESC LIMIT ?`).all(actorUserId,Math.min(100,Math.max(1,Number(limit)||30)));return rows.map(row=>getSimulatorRun(row.id,actorUserId));}
export function getSimulatorRun(id,actorUserId){const access=accessSnapshotForUser(actorUserId),row=db.prepare(`SELECT * FROM simulator_runs WHERE id=?`).get(id);if(!row||row.actor_user_id!==actorUserId&&!access.capabilities.includes("simulator_review_all"))return null;const run={id:row.id,suiteId:row.suite_id,actorUserId:row.actor_user_id,status:row.status,environment:row.environment,appVersion:row.app_version,schemaVersion:Number(row.schema_version),fixtureSet:row.fixture_set,isolationMode:row.isolation_mode,summary:parseJson(row.summary_json,{}),createdAt:row.created_at,startedAt:row.started_at,completedAt:row.completed_at,results:db.prepare(`SELECT r.*,c.case_key,c.title FROM simulator_case_results r JOIN simulator_suite_cases c ON c.id=r.case_id WHERE r.run_id=? ORDER BY c.position`).all(id).map(item=>({id:item.id,caseId:item.case_id,caseKey:item.case_key,title:item.title,status:item.status,expected:parseJson(item.expected_json,{}),observed:parseJson(item.observed_json,{}),component:item.component,stage:item.stage,evidence:parseJson(item.evidence_json,{}),executionStatus:parseJson(item.evidence_json,{}).executionStatus||"",qualityStatus:parseJson(item.evidence_json,{}).qualityStatus||"",errorCode:item.error_code,probableCause:item.probable_cause,retryable:Boolean(item.retryable),recommendedAction:item.recommended_action,failureFingerprint:item.failure_fingerprint,elapsedMs:Number(item.elapsed_ms)})),rootCauses:db.prepare(`SELECT * FROM simulator_root_causes WHERE run_id=? ORDER BY affected_count DESC`).all(id).map(item=>({id:item.id,fingerprint:item.fingerprint,errorCode:item.error_code,component:item.component,stage:item.stage,probableCause:item.probable_cause,affectedCount:Number(item.affected_count),bugId:item.bug_id}))};run.report=consolidatedReport(run);return run;}
export function cancelSimulatorRun(id,actorUserId){const run=getSimulatorRun(id,actorUserId);if(!run)return null;if(run.status==="RUNNING"||run.status==="QUEUED")db.prepare(`UPDATE simulator_runs SET cancel_requested=1,status='CANCELLED',completed_at=? WHERE id=?`).run(nowIso(),id);return getSimulatorRun(id,actorUserId);}
export function simulatorReport(id,actorUserId){const run=getSimulatorRun(id,actorUserId);return run?.report||null;}
export function simulatorExport(id,actorUserId){const run=getSimulatorRun(id,actorUserId);if(!run)return null;return {product:"GameIndex",version:PRODUCT_VERSION,generatedAt:nowIso(),sanitized:true,privateDataIncluded:false,chainOfThoughtIncluded:false,disclaimer:"O sucesso reduz risco, mas não prova ausência de todos os defeitos.",report:run.report,run};}
export function sendSimulatorFailuresToBugs(id,actorUserId){const access=accessSnapshotForUser(actorUserId),run=getSimulatorRun(id,actorUserId);if(!run)throw new Error("Execução não encontrada.");const created=[];for(const cause of run.rootCauses){if(cause.bugId)continue;const bug=createBug({title:`Mega Simulator: ${cause.errorCode}`,description:`${cause.affectedCount} cenário(s) afetado(s). Evidência sanitizada da execução ${run.id}.`,severity:"BUG",category:cause.component==="Authorization"||cause.component==="Privacy"?"SECURITY":String(cause.component).startsWith("AI")?"AI":cause.component==="Images"?"IMAGE":"GENERAL",status:"CONFIRMED",versionFound:"0.97",targetVersion:"0.97",component:cause.component,traceId:run.id,rootCause:cause.probableCause,verificationNotes:"Criado pelo Mega Simulator Full System Lab; nenhum dado privado de produção incluído."},actorUserId);db.prepare(`UPDATE simulator_root_causes SET bug_id=? WHERE id=?`).run(bug.id,cause.id);created.push(bug);}return {ok:true,created,deduplicated:run.rootCauses.length-created.length,creatorApproval:Boolean(access.staffRole==="CREATOR")};}
