import { randomUUID, createHash } from "node:crypto";
import { db, json, nowIso, parseJson, transaction } from "../connection.mjs";
import { applyEvidenceToRequirements, informationGain as calculateInformationGain } from "../../sharpener/research-intelligence.mjs";

let v3ColumnsCache;
function v3Ready(){
  if(v3ColumnsCache!==undefined)return v3ColumnsCache;
  try{const cols=new Set(db.prepare(`PRAGMA table_info(ai_sharpener_run_learning)`).all().map(r=>r.name));v3ColumnsCache=cols.has("query_family_state_json")&&cols.has("semantic_requirements_json");}
  catch{v3ColumnsCache=false;}
  return v3ColumnsCache;
}
function researchEventsReady(){try{return Boolean(db.prepare(`SELECT 1 FROM sqlite_master WHERE type='table' AND name='ai_sharpener_research_events'`).get());}catch{return false;}}
function row(runId){try{return db.prepare(`SELECT * FROM ai_sharpener_run_learning WHERE run_id=?`).get(runId)||null;}catch{return null;}}
function basePublic(runId=""){return {runId,evidence:[],learning:[],researchQueries:[],researchCalls:0,researchTimeMs:0,candidateGenerations:0,repeatedFallbacks:0,breakthroughCount:0,noLearningCount:0,lastAnswerHash:"",lastResearchAt:"",queryFamilyState:{},researchFailures:[],semanticRequirements:{intent:"QUESTION",coverage:0,requirements:{}},intentLock:{resolvedIntent:"QUESTION",confidence:0,locked:false,reclassificationCount:0},breakthroughAttempts:0,successfulBreakthroughs:0,emptyBreakthroughs:0,evidenceProducingCalls:0,informationGain:0,stagnationEvents:0,researchState:"ACTIVE",waitingReason:"",researchEvents:[],updatedAt:""};}
function pub(r){
  if(!r)return basePublic();
  const out={...basePublic(r.run_id),evidence:parseJson(r.evidence_json,[]),learning:parseJson(r.learning_json,[]),researchQueries:parseJson(r.research_queries_json,[]),researchCalls:Number(r.research_calls||0),researchTimeMs:Number(r.research_time_ms||0),candidateGenerations:Number(r.candidate_generations||0),repeatedFallbacks:Number(r.repeated_fallbacks||0),breakthroughCount:Number(r.breakthrough_count||0),noLearningCount:Number(r.no_learning_count||0),lastAnswerHash:r.last_answer_hash||"",lastResearchAt:r.last_research_at||"",updatedAt:r.updated_at||""};
  if(v3Ready())Object.assign(out,{queryFamilyState:parseJson(r.query_family_state_json,{}),researchFailures:parseJson(r.research_failures_json,[]),semanticRequirements:parseJson(r.semantic_requirements_json,{intent:"QUESTION",coverage:0,requirements:{}}),intentLock:parseJson(r.intent_lock_json,{resolvedIntent:"QUESTION",confidence:0,locked:false,reclassificationCount:0}),breakthroughAttempts:Number(r.breakthrough_attempts||0),successfulBreakthroughs:Number(r.successful_breakthroughs||0),emptyBreakthroughs:Number(r.empty_breakthroughs||0),evidenceProducingCalls:Number(r.evidence_producing_calls||0),informationGain:Number(r.information_gain||0),stagnationEvents:Number(r.stagnation_events||0),researchState:r.research_state||"ACTIVE",waitingReason:r.waiting_reason||""});
  if(researchEventsReady())out.researchEvents=listSharpenerResearchEvents(r.run_id,{limit:60});
  return out;
}
export function sharpenerLearning(runId){return pub(row(runId));}
export function ensureSharpenerLearning(runId,{intentLock=null,semanticRequirements=null}={}){
  const now=nowIso();
  try{db.prepare(`INSERT INTO ai_sharpener_run_learning(run_id,updated_at) VALUES(?,?) ON CONFLICT(run_id) DO NOTHING`).run(runId,now);}catch{return basePublic(runId);}
  if(v3Ready()&&(intentLock||semanticRequirements)){
    const current=sharpenerLearning(runId);
    db.prepare(`UPDATE ai_sharpener_run_learning SET intent_lock_json=?,semantic_requirements_json=?,updated_at=? WHERE run_id=?`).run(json(intentLock||current.intentLock),json(semanticRequirements||current.semanticRequirements),now,runId);
  }
  return sharpenerLearning(runId);
}
function canonicalClaim(value=""){return String(value||"").normalize("NFKC").trim().toLowerCase().replace(/\s+/g," ");}
function uniqEvidence(items=[]){
  const map=new Map();
  for(const item of items){
    const claim=String(item?.claim||item?.text||"").trim();if(!claim)continue;
    const key=createHash("sha256").update(canonicalClaim(claim)).digest("hex").slice(0,24),sourceUrl=String(item?.sourceUrl||item?.url||item?.sourceDocument?.url||""),current=map.get(key),support=new Set([...(current?.supportingSources||[]),sourceUrl].filter(Boolean));
    const next={key,claim,sourceUrl,sourceType:String(item?.sourceType||item?.sourceDocument?.sourceType||""),confidence:Number(item?.confidence||item?.relevance||item?.sourceQuality||0),query:String(item?.query||"").slice(0,500),queryFamily:String(item?.queryFamily||""),queryFingerprint:String(item?.queryFingerprint||""),requirement:String(item?.requirement||""),verificationStatus:String(item?.verificationStatus||"VERIFIED"),supportingSources:[...support],sourceCount:support.size};
    if(!current||next.confidence>=Number(current.confidence||0))map.set(key,{...current,...next});else map.set(key,{...current,supportingSources:[...support],sourceCount:support.size});
  }
  return [...map.values()].slice(0,160);
}
export function initializeSharpenerV3(runId,{intentLock,semanticRequirements}={}){return ensureSharpenerLearning(runId,{intentLock,semanticRequirements});}
export function setSharpenerResearchState(runId,{researchState="ACTIVE",waitingReason=""}={}){ensureSharpenerLearning(runId);if(!v3Ready())return sharpenerLearning(runId);db.prepare(`UPDATE ai_sharpener_run_learning SET research_state=?,waiting_reason=?,updated_at=? WHERE run_id=?`).run(String(researchState||"ACTIVE"),String(waitingReason||"").slice(0,800),nowIso(),runId);return sharpenerLearning(runId);}
export function markSharpenerStagnation(runId,{reason="RESEARCH_STAGNATION_CONFIRMED"}={}){ensureSharpenerLearning(runId);if(!v3Ready())return sharpenerLearning(runId);const current=sharpenerLearning(runId),failures=[...(current.researchFailures||[]),{code:reason,createdAt:nowIso()}].slice(-120);db.prepare(`UPDATE ai_sharpener_run_learning SET stagnation_events=stagnation_events+1,research_failures_json=?,updated_at=? WHERE run_id=?`).run(json(failures),nowIso(),runId);return sharpenerLearning(runId);}
export function exhaustQueryFamily(runId,family,{reason="RESEARCH_PATH_EXHAUSTED"}={}){ensureSharpenerLearning(runId);if(!v3Ready())return sharpenerLearning(runId);const current=sharpenerLearning(runId),state={...(current.queryFamilyState||{})},prev=state[family]||{};state[family]={...prev,exhausted:true,exhaustedAt:nowIso(),reason,attempts:Number(prev.attempts||0),zeroGain:Number(prev.zeroGain||0)};db.prepare(`UPDATE ai_sharpener_run_learning SET query_family_state_json=?,updated_at=? WHERE run_id=?`).run(json(state),nowIso(),runId);return sharpenerLearning(runId);}
export function recordSharpenerResearch(runId,{query="",family="QUESTION_GENERAL",fingerprint="",objective="",evidence=[],durationMs=0,error="",failureCode="",breakthrough=false,breakthroughStatus=""}={}){
  const current=ensureSharpenerLearning(runId),beforeEvidence=current.evidence||[],merged=uniqEvidence([...beforeEvidence,...evidence]),beforeCoverage=Number(current.semanticRequirements?.coverage||0),semantic=applyEvidenceToRequirements(current.semanticRequirements,merged),afterCoverage=Number(semantic.coverage||0),newSources=new Set(merged.flatMap(e=>e.supportingSources||[])).size-new Set(beforeEvidence.flatMap(e=>e.supportingSources||[])).size,familyWasNew=!current.queryFamilyState?.[family];
  const gain=calculateInformationGain({beforeEvidence,afterEvidence:merged,beforeCoverage,afterCoverage,newSourceCount:Math.max(0,newSources),newFamily:familyWasNew}),now=nowIso(),queries=[...(current.researchQueries||[]),String(query||"").trim()].filter(Boolean).slice(-160),familyState={...(current.queryFamilyState||{})},prev=familyState[family]||{attempts:0,zeroGain:0,totalInformationGain:0,exhausted:false};
  familyState[family]={...prev,attempts:Number(prev.attempts||0)+1,zeroGain:gain.evidenceGain>0||gain.coverageGain>0||gain.newSourceCount>0?0:Number(prev.zeroGain||0)+1,totalInformationGain:Number((Number(prev.totalInformationGain||0)+gain.score).toFixed(4)),lastFingerprint:fingerprint,lastAt:now,exhausted:Boolean(prev.exhausted)};
  const failures=[...(current.researchFailures||[])];if(failureCode)failures.push({code:failureCode,family,queryFingerprint:fingerprint,createdAt:now});
  const breakthroughAttempts=Number(current.breakthroughAttempts||0)+(breakthrough?1:0),successful=Number(current.successfulBreakthroughs||0)+(breakthrough&&gain.evidenceGain>0?1:0),empty=Number(current.emptyBreakthroughs||0)+(breakthrough&&gain.evidenceGain===0?1:0),legacyBreakthrough=Number(current.breakthroughCount||0)+(breakthrough&&gain.evidenceGain>0?1:0);
  if(v3Ready()){
    db.prepare(`UPDATE ai_sharpener_run_learning SET evidence_json=?,research_queries_json=?,research_calls=research_calls+1,research_time_ms=research_time_ms+?,last_research_at=?,query_family_state_json=?,research_failures_json=?,semantic_requirements_json=?,breakthrough_attempts=?,successful_breakthroughs=?,empty_breakthroughs=?,breakthrough_count=?,evidence_producing_calls=evidence_producing_calls+?,information_gain=information_gain+?,updated_at=? WHERE run_id=?`).run(json(merged),json(queries),Math.max(0,Number(durationMs)||0),now,json(familyState),json(failures.slice(-160)),json(semantic),breakthroughAttempts,successful,empty,legacyBreakthrough,gain.evidenceGain>0?1:0,gain.score,now,runId);
  }else{
    db.prepare(`UPDATE ai_sharpener_run_learning SET evidence_json=?,research_queries_json=?,research_calls=research_calls+1,research_time_ms=research_time_ms+?,last_research_at=?,breakthrough_count=?,updated_at=? WHERE run_id=?`).run(json(merged),json(queries),Math.max(0,Number(durationMs)||0),now,legacyBreakthrough,now,runId);
  }
  if(researchEventsReady()){
    const researchNumber=Number(current.researchCalls||0)+1;
    db.prepare(`INSERT INTO ai_sharpener_research_events(id,run_id,research_number,query_text,query_family,query_fingerprint,objective,execution_status,evidence_before,evidence_after,evidence_gain,information_gain,failure_code,breakthrough_status,duration_ms,metadata_json,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(`sharp-research-${randomUUID()}`,runId,researchNumber,String(query||"").slice(0,1800),String(family||"QUESTION_GENERAL").slice(0,120),String(fingerprint||"").slice(0,120),String(objective||"").slice(0,120),error?"FAIL":"PASS",beforeEvidence.length,merged.length,gain.evidenceGain,gain.score,String(failureCode||"").slice(0,120),String(breakthroughStatus||"").slice(0,120),Math.max(0,Number(durationMs)||0),json({error:String(error||"").slice(0,500),coverageBefore:beforeCoverage,coverageAfter:afterCoverage,newSources:Math.max(0,newSources)}),now);
  }
  return {...sharpenerLearning(runId),lastResearch:{family,fingerprint,informationGain:gain.score,evidenceGain:gain.evidenceGain,failureCode,breakthroughStatus}};
}
// Backward-compatible V2 alias.
export function mergeSharpenerResearch(runId,{query="",evidence=[],durationMs=0}={}){return recordSharpenerResearch(runId,{query,evidence,durationMs,family:"LEGACY_RESEARCH",fingerprint:"LEGACY"});}
export function recordSharpenerLearning(runId,{attemptNumber=0,failure="",learned="",nextAction="",strategyKey="",answerText="",meaningfulChange=false,breakthrough=false,learningGain=0,semanticCoverage=0,researchFamily="",whatChanged=""}={}){
  const current=ensureSharpenerLearning(runId),hash=createHash("sha256").update(String(answerText||"").trim().toLowerCase()).digest("hex"),same=Boolean(hash&&current.lastAnswerHash&&hash===current.lastAnswerHash),entry={attemptNumber:Number(attemptNumber)||0,failure:String(failure||""),learned:String(learned||""),nextAction:String(nextAction||""),strategyKey:String(strategyKey||""),meaningfulChange:Boolean(meaningfulChange),breakthrough:Boolean(breakthrough),learningGain:Number(learningGain||0),semanticCoverage:Number(semanticCoverage||0),researchFamily:String(researchFamily||""),whatChanged:String(whatChanged||""),createdAt:nowIso()},learning=[...(current.learning||[]),entry].slice(-240),repeated=same?current.repeatedFallbacks+1:0,noLearning=meaningfulChange?0:current.noLearningCount+1;
  db.prepare(`UPDATE ai_sharpener_run_learning SET learning_json=?,candidate_generations=candidate_generations+1,repeated_fallbacks=?,no_learning_count=?,last_answer_hash=?,updated_at=? WHERE run_id=?`).run(json(learning),repeated,noLearning,hash,nowIso(),runId);return sharpenerLearning(runId);
}
export function listSharpenerResearchEvents(runId,{limit=100}={}){if(!researchEventsReady())return [];return db.prepare(`SELECT * FROM ai_sharpener_research_events WHERE run_id=? ORDER BY research_number DESC LIMIT ?`).all(runId,Math.min(300,Math.max(1,Number(limit)||100))).map(r=>({id:r.id,runId:r.run_id,researchNumber:Number(r.research_number),query:r.query_text,queryFamily:r.query_family,queryFingerprint:r.query_fingerprint,objective:r.objective,executionStatus:r.execution_status,evidenceBefore:Number(r.evidence_before),evidenceAfter:Number(r.evidence_after),evidenceGain:Number(r.evidence_gain),informationGain:Number(r.information_gain),failureCode:r.failure_code,breakthroughStatus:r.breakthrough_status,durationMs:Number(r.duration_ms),metadata:parseJson(r.metadata_json,{}),createdAt:r.created_at}));}
export function saveApprovedSharpenerMemories({run,actorUserId,learningState,verifiedSuccess=false}={}){
  if(!run||!actorUserId)return [];
  const now=nowIso(),entries=[],evidence=(learningState?.evidence||[]).filter(e=>e.verificationStatus!=="REJECTED"&&e.claim&&e.sourceUrl),canFact=Boolean(verifiedSuccess&&evidence.length>0&&run.bestAnswer);
  transaction(()=>{
    const memoryItems=[];
    if(canFact)memoryItems.push(["FACT",`question:${createHash("sha256").update(run.question.toLowerCase()).digest("hex").slice(0,24)}`,{question:run.question,acceptedAnswer:run.bestAnswer,evidence:evidence.slice(0,48),semanticRequirements:learningState?.semanticRequirements||{}}]);
    memoryItems.push(["STRATEGY",`intent:${String(learningState?.intentLock?.resolvedIntent||run.bestStrategy?.intent||run.bestStrategy?.key||"GENERAL")}`,{winningStrategy:run.bestStrategy,lessons:(learningState?.learning||[]).slice(-60),researchQueries:(learningState?.researchQueries||[]).slice(-50),queryFamilyState:learningState?.queryFamilyState||{},failedFamilies:Object.entries(learningState?.queryFamilyState||{}).filter(([,v])=>v.exhausted||v.zeroGain>=2).map(([k])=>k)}]);
    for(const [type,scope,content] of memoryItems){const id=`sharp-memory-${randomUUID()}`;db.prepare(`INSERT INTO ai_sharpener_memories(id,memory_type,game_id,scope_key,content_json,source_run_id,approved_by,active,created_at,updated_at) VALUES(?,?,?,?,?,?,?,1,?,?)`).run(id,type,run.gameId,scope,json(content),run.id,actorUserId,now,now);entries.push({id,type,scopeKey:scope,content});}
  });
  return entries;
}
export function listSharpenerMemories({gameId="",memoryType="",limit=100}={}){const where=[`active=1`],args=[];if(gameId){where.push(`game_id=?`);args.push(gameId);}if(memoryType){where.push(`memory_type=?`);args.push(memoryType);}args.push(Math.min(300,Math.max(1,Number(limit)||100)));return db.prepare(`SELECT * FROM ai_sharpener_memories WHERE ${where.join(" AND ")} ORDER BY updated_at DESC LIMIT ?`).all(...args).map(r=>({id:r.id,memoryType:r.memory_type,gameId:r.game_id,scopeKey:r.scope_key,content:parseJson(r.content_json,{}),sourceRunId:r.source_run_id,approvedBy:r.approved_by,createdAt:r.created_at,updatedAt:r.updated_at}));}
