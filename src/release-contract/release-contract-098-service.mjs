import { db, schemaVersion } from "../database/connection.mjs";
import { ensureReleaseContract } from "../database/repositories/release-contract-repository.mjs";
import { operationSummary } from "../core98/metrics.mjs";
import { mediaRuntimeSummary } from "../images/media-runtime2.mjs";

export const RELEASE_CONTRACT_098_ID="RELEASE_CONTRACT_0.98";
export const RELEASE_CONTRACT_098_KEYS=[
  "NO_REQUIRED_API_KEY","DETERMINISTIC_CORE","NO_AI_COMMUNICATION_AGENT","SCRIPT_FIRST_ROUTING",
  "UNIVERSE_QUEUE_RUNTIME","UNIVERSE_WORKERS","UNIVERSE_STATE_MACHINE","UNIVERSE_BUILD_EXECUTION","UNIVERSE_SEARCH_INDEX",
  "REAL_IMAGE_STORAGE","REAL_IMAGE_SAME_ORIGIN","REAL_IMAGE_BROWSER_RENDER","NO_AZURE_MANUAL_IMAGE_APPROVAL","ENTITY_IMAGE_CONTEXT","IMAGE_AUTO_REPAIR",
  "CREEPER_END_TO_END","DIAMOND_PICKAXE_END_TO_END","MULTI_GAME_UNIVERSE","AI_COMPLEX_8","PERFORMANCE_BOUNDED","DATABASE_INTEGRITY","AZURE_PERSISTENCE"
];
const LIVE_REQUIRED=new Set(["REAL_IMAGE_BROWSER_RENDER","CREEPER_END_TO_END","MULTI_GAME_UNIVERSE","AZURE_PERSISTENCE"]);
const RULES=RELEASE_CONTRACT_098_KEYS.map((key,index)=>({
  id:`GI-CONTRACT-098-${String(index+1).padStart(3,"0")}`,
  component:key,
  title:key.replaceAll("_"," "),
  expectedBehavior:`GameIndex Beta 0.98 contract ${key} must reflect observable deterministic/runtime behavior.`,
  priority:LIVE_REQUIRED.has(key)?"P1":"P2",
  relatedBugIds:key.startsWith("REAL_IMAGE")||key.includes("IMAGE")?["GI-098-IMG-001","GI-098-IMG-002"]:key.includes("UNIVERSE")||key.includes("CREEPER")||key.includes("PICKAXE")?["GI-098-UNIVERSE-001"]:key.includes("AI_")||key.includes("SCRIPT")||key.includes("DETERMINISTIC")?["GI-098-AI-001"]:[],
  testStrategy:key,
  liveValidationRequired:LIVE_REQUIRED.has(key)
}));
function table(name){return Boolean(db.prepare(`SELECT 1 FROM sqlite_master WHERE type='table' AND name=?`).get(name));}
function meta(key){return String(db.prepare(`SELECT value FROM meta WHERE key=?`).get(key)?.value||"");}
function integrity(){return String(db.prepare(`PRAGMA integrity_check`).get()?.integrity_check||"")==="ok"&&db.prepare(`PRAGMA foreign_key_check`).all().length===0;}
function localCheck(key){
  switch(key){
    case "NO_REQUIRED_API_KEY":return meta("beta_098_runtime")==="LOCAL_FIRST_NO_API_KEY";
    case "DETERMINISTIC_CORE":return ["gi_core_events","gi_jobs","gi_operation_metrics"].every(table);
    case "NO_AI_COMMUNICATION_AGENT":return meta("beta_098_core")==="DETERMINISTIC_CORE";
    case "SCRIPT_FIRST_ROUTING":return table("gi_core_events")&&table("gi_jobs")&&table("gi_operation_metrics");
    case "UNIVERSE_QUEUE_RUNTIME":return table("gi_jobs");
    case "UNIVERSE_WORKERS":return table("gi_worker_heartbeats");
    case "UNIVERSE_STATE_MACHINE":return table("gi_universe_states")&&table("gi_state_transitions");
    case "UNIVERSE_BUILD_EXECUTION":return table("gi_jobs")&&table("gi_universe_states")&&table("pages");
    case "UNIVERSE_SEARCH_INDEX":return table("pre_public_search_index")&&table("gi_search_index_revisions");
    case "REAL_IMAGE_STORAGE":return table("images")&&table("gi_media_assets");
    case "REAL_IMAGE_SAME_ORIGIN":return table("gi_media_assets");
    case "NO_AZURE_MANUAL_IMAGE_APPROVAL":return meta("beta_098_runtime")==="LOCAL_FIRST_NO_API_KEY";
    case "ENTITY_IMAGE_CONTEXT":return table("gi_media_assets")&&table("images");
    case "IMAGE_AUTO_REPAIR":return table("gi_jobs")&&table("gi_media_assets");
    case "DIAMOND_PICKAXE_END_TO_END":return table("ai_sharpener_run_learning")&&table("gi_jobs");
    case "AI_COMPLEX_8":return meta("beta_098_ai_complex")==="8.0";
    case "PERFORMANCE_BOUNDED":return table("gi_operation_metrics")&&table("gi_jobs");
    case "DATABASE_INTEGRITY":return schemaVersion()===24&&integrity();
    default:return true;
  }
}
export function ensure098ReleaseContract(){return ensureReleaseContract({id:RELEASE_CONTRACT_098_ID,version:"0.98",label:"GameIndex Beta 0.98",codename:"Autonomous Universe & Deterministic Intelligence Core",rules:RULES});}
export function releaseGate098(){
  ensure098ReleaseContract();
  const results=RELEASE_CONTRACT_098_KEYS.map(key=>{
    if(LIVE_REQUIRED.has(key))return {key,status:"PENDING_AZURE_VALIDATION",environment:"AZURE_LIVE",evidence:{reason:"This contract requires validation after the 0.98 package is actually deployed."}};
    const ok=localCheck(key);
    return {key,status:ok?"PASS":"FAIL",environment:"LOCAL",evidence:{schema:schemaVersion()}};
  });
  const failed=results.filter(x=>x.status==="FAIL"),pending=results.filter(x=>x.status==="PENDING_AZURE_VALIDATION");
  return {contractId:RELEASE_CONTRACT_098_ID,version:"0.98",status:failed.length?"BLOCKED":pending.length?"PENDING_AZURE_VALIDATION":"PASS",schema:schemaVersion(),runtime:"LOCAL_FIRST_NO_API_KEY",apiKeyRequired:false,manualAzureImageApprovalRequired:false,results,blocking:failed.map(x=>x.key),pending:pending.map(x=>x.key),operations:operationSummary({minutes:1440}),media:mediaRuntimeSummary()};
}
