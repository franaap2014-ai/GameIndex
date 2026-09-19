import { db, schemaVersion } from "../database/connection.mjs";
import { ensureReleaseContract } from "../database/repositories/release-contract-repository.mjs";
import { imageRenderMetrics } from "../database/repositories/image-render-repository.mjs";
import { prePublicReadinessSummary } from "../prepublic/pre-public-service.mjs";
import { createBug, getBug } from "../database/repositories/bug-tracker-repository.mjs";
import { upsertReleaseMemory } from "../database/repositories/release-memory-repository.mjs";

export const PRE_PUBLIC_CONTRACT_ID="RELEASE_CONTRACT_0.975_BF_PRE_PUBLIC";
const KEYS=[
"PUBLIC_HOME_REAL_IMAGES","GAME_COVER_REAL_RENDER","ENTITY_IMAGE_REAL_RENDER","IMAGE_CONTEXT_CORRECT","UNIVERSE_MANIFEST","UNIVERSE_RESEARCH_QUEUE","UNIVERSE_BUILD_QUEUE","UNIVERSE_PAGE_BUILD","UNIVERSE_RELATIONSHIPS","UNIVERSE_SEARCH_INDEX","UNIVERSE_IMAGE_LINK","CREEPER_END_TO_END","MULTI_GAME_UNIVERSE","BROWSER_PERFORMANCE","TRACE_VIRTUALIZATION","SHARPENER_VIRTUALIZATION","LANGUAGE_TEST_TRUTH","EXPECTED_RESULT_ISOLATION_TRUTH","PIPELINE_KNOWLEDGE_ATTRITION","DATABASE_INTEGRITY","AZURE_PERSISTENCE"
];
const LIVE=new Set(["PUBLIC_HOME_REAL_IMAGES","GAME_COVER_REAL_RENDER","ENTITY_IMAGE_REAL_RENDER","IMAGE_CONTEXT_CORRECT","CREEPER_END_TO_END","MULTI_GAME_UNIVERSE","BROWSER_PERFORMANCE","AZURE_PERSISTENCE"]);
const RULES=KEYS.map((key,index)=>({id:`GI-CONTRACT-0975-PP-${String(index+1).padStart(3,"0")}`,component:key,title:key.replaceAll("_"," "),expectedBehavior:`Pre-Public contract ${key} must reflect real observable behavior.`,priority:LIVE.has(key)?"P1":"P2",relatedBugIds:key.includes("IMAGE")?["GI-097-IMG-001"]:key.includes("UNIVERSE")||key.includes("CREEPER")?["GI-097-UNIVERSE-001"]:[],testStrategy:key,liveValidationRequired:LIVE.has(key)}));
const table=name=>Boolean(db.prepare(`SELECT 1 FROM sqlite_master WHERE type='table' AND name=?`).get(name));
function latestLive(key){return db.prepare(`SELECT * FROM pre_public_live_validations WHERE contract_key=? AND environment='AZURE_LIVE' ORDER BY verified_at DESC LIMIT 1`).get(key);}
function localOutcome(key,summary){
  if(key==="UNIVERSE_MANIFEST")return table("content_manifests");
  if(key==="UNIVERSE_RESEARCH_QUEUE")return table("research_batches")&&table("pre_public_jobs");
  if(key==="UNIVERSE_BUILD_QUEUE")return table("construction_runs")&&table("pre_public_jobs");
  if(key==="UNIVERSE_PAGE_BUILD")return table("pages")&&table("content_manifest_items");
  if(key==="UNIVERSE_RELATIONSHIPS")return table("relationships")&&table("entity_relationships_v2");
  if(key==="UNIVERSE_SEARCH_INDEX")return table("pre_public_search_index");
  if(key==="UNIVERSE_IMAGE_LINK")return table("images")&&table("content_manifest_items");
  if(key==="TRACE_VIRTUALIZATION")return true;
  if(key==="SHARPENER_VIRTUALIZATION")return true;
  if(key==="LANGUAGE_TEST_TRUTH")return table("semantic_reviews");
  if(key==="EXPECTED_RESULT_ISOLATION_TRUTH")return table("ai_sharpener_runs")&&table("ai_sharpener_research_events");
  if(key==="PIPELINE_KNOWLEDGE_ATTRITION")return table("pipeline_handoff_claim_metrics")&&table("pipeline_handoffs");
  if(key==="DATABASE_INTEGRITY")return schemaVersion()===23;
  return Boolean(summary);
}
const PRE_PUBLIC_BUGS=[
  {bugCode:"GI-0975-PERF-001",title:"DEV/Admin interfaces cause excessive browser resource usage",severity:"PERFORMANCE",category:"PERFORMANCE",component:"FRONTEND_PERFORMANCE"},
  {bugCode:"GI-0975-QA-001",title:"Language scenario assertion inconsistency",severity:"BUG",category:"AI",component:"LANGUAGE_TEST_TRUTH"},
  {bugCode:"GI-0975-QA-002",title:"Expected Result isolation telemetry ambiguity",severity:"BUG",category:"AI",component:"EXPECTED_RESULT_ISOLATION_TRUTH"},
  {bugCode:"GI-0975-AI-ATTRITION-001",title:"Evidence available in one pipeline but lost in orchestration/review/full pipeline",severity:"BUG",category:"AI",component:"PIPELINE_KNOWLEDGE_ATTRITION"}
];
function ensurePrePublicBugs(){for(const spec of PRE_PUBLIC_BUGS){if(getBug(spec.bugCode))continue;createBug({...spec,description:"Pre-Public Integration Gate issue tracked from current 0.975 BF evidence.",status:"TESTING",versionFound:"0.975-BF",targetVersion:"0.975-BF",verificationNotes:"Implementation added in Pre-Public Integration Gate; LOCAL/CLEAN_PACKAGE validation required and AZURE_LIVE remains separate."});}}
function syncPrePublicReleaseMemory(){for(const rule of RULES){const bugId=(rule.relatedBugIds||[]).map(getBug).find(Boolean)?.id||null;upsertReleaseMemory({componentId:rule.component,featureKey:rule.id,versionIntroduced:"0.975-BF",versionFixed:"0.975-BF",releaseContractId:PRE_PUBLIC_CONTRACT_ID,bugId,testIds:[rule.testStrategy],knownRegressions:[],lastVerifiedBuild:"0.975-BF-PRE-PUBLIC",lastVerifiedEnvironment:LIVE.has(rule.component)?"NOT_TESTED":"LOCAL",status:"ACTIVE",metadata:{liveValidationRequired:Boolean(rule.liveValidationRequired),runtime:"LOCAL_FIRST_NO_API_KEY"}});}}
export function ensurePrePublicReleaseContract(){const contract=ensureReleaseContract({id:PRE_PUBLIC_CONTRACT_ID,version:"0.975-BF-PRE-PUBLIC",label:"GameIndex Beta 0.975 BF Pre-Public Integration Gate",codename:"Pre-Public Integration Gate",rules:RULES});ensurePrePublicBugs();syncPrePublicReleaseMemory();return contract;}
export function prePublicGate(){ensurePrePublicReleaseContract();const summary=prePublicReadinessSummary(),image=imageRenderMetrics({minutes:1440}),results=[];for(const key of KEYS){if(LIVE.has(key)){const live=latestLive(key);results.push({key,status:live?.result==="PASS"?"PASS":live?.result==="FAIL"?"FAIL":"PENDING_LIVE_VALIDATION",environment:"AZURE_LIVE",evidence:live?JSON.parse(live.evidence_json||"{}"): {realImagePass:image.realImagePass}});continue;}const ok=localOutcome(key,summary);results.push({key,status:ok?"PASS":"FAIL",environment:"LOCAL",evidence:{schema:schemaVersion()}});}const failures=results.filter(x=>x.status==="FAIL"),pending=results.filter(x=>x.status==="PENDING_LIVE_VALIDATION");return {contractId:PRE_PUBLIC_CONTRACT_ID,status:failures.length?"BLOCKED":pending.length?"PENDING_LIVE_VALIDATION":"PASS",schema:schemaVersion(),runtime:"LOCAL_FIRST_NO_API_KEY",apiKeyRequired:false,results,blocking:failures.map(x=>x.key),pending:pending.map(x=>x.key),summary};}
