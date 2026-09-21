import { requireDev } from "../admin/dev-auth.mjs";
import { currentAuth, updatePreferences, authPayload } from "../auth/auth-service.mjs";
import { listAITraces, getAITrace, traceMetrics, listSimulations } from "../database/repositories/ai-trace-repository.mjs";
import { publicDexterConsult } from "../dexter/public-consult.mjs";
import { imageEngine3Summary } from "../images/image-engine3.mjs";
import { autonomousGenerationStatus, runAutonomousGenerationCycle } from "../autonomy/autonomous-generation.mjs";
import { autogenMetrics, listAutogenQueue } from "../database/repositories/autogen-repository.mjs";
import { autogenStateMetrics } from "../database/repositories/autogen-state-repository.mjs";
import { listGenerationDiagnostics, constructionComponentMetrics, generationFailureClusters } from "../database/repositories/generation-diagnostics-repository.mjs";
import { researchRecoveryMetrics } from "../database/repositories/research-attempt-repository.mjs";
import { attributionMetrics } from "../database/repositories/failure-attribution-repository.mjs";
import { listUpdateLog, getUpdateLog } from "../database/repositories/update-log-repository.mjs";
import { getPreference } from "../database/repositories/user-repository.mjs";
import { schemaVersion, latestBackup, db } from "../database/connection.mjs";
import { listKnowledgeGaps } from "../quality/knowledge-gap.mjs";
import { PUBLIC_VERSION, INTERNAL_RELEASE, TARGET_SCHEMA } from "../config/release-099i6.mjs";

const CURRENT_VERSION=PUBLIC_VERSION;
function health(){
  const r=researchRecoveryMetrics();
  const unrecovered=Math.max(0,r.recoveryAttempts-r.recovered);
  const status=r.attempts===0?"IDLE":unrecovered>=3&&unrecovered>r.recovered?"DEGRADED":"ONLINE";
  return {research:{status,...r},autogen:{status:autonomousGenerationStatus().workerActive?"ONLINE":"IDLE",...autonomousGenerationStatus()}};
}
function user(req){return currentAuth(req)?.user||null;}
export function registerBeta086Routes(app){
  app.get("/api/beta086/status",(req,res)=>res.json({product:"GameIndex",version:"Beta 0.986",codename:"Production Consolidation",dexter:"Ollama gemma3:4b optional",intelligence:"GI_CORE_8.5_SCRIPTS",imageRuntime:"IMAGE_ENGINE_3_NATIVE",settings:"2.0",autogen:"GI_CORE_SCRIPT_AUTOGEN",updateLog:true,legacyAI5:"REMOVED",health:health()}));

  app.get("/api/update-log",(req,res)=>{const u=user(req),prefs=u?getPreference(u.id):null;res.json({currentVersion:CURRENT_VERSION,lastSeenVersion:prefs?.lastSeenVersion||null,hasUnread:Boolean(u&&prefs?.productUpdates&&prefs.lastSeenVersion!==CURRENT_VERSION),entries:listUpdateLog({includePrivate:false,limit:req.query.limit||40})});});
  app.get("/api/settings/export",(req,res)=>{const u=user(req);if(!u)return res.status(401).json({erro:"Faça login para exportar seus dados."});const payload=authPayload(req);res.json({exportedAt:new Date().toISOString(),product:"GameIndex",user:payload.user,preferences:payload.preferences,subscription:payload.subscription});});
  app.post("/api/settings/clear-search-history",(req,res)=>{const u=user(req);if(!u)return res.status(401).json({erro:"Faça login."});const info=db.prepare(`DELETE FROM user_activity WHERE user_id=? AND event_type='SEARCH'`).run(u.id);res.json({ok:true,removed:Number(info.changes||0)});});
  app.post("/api/settings/clear-dexter-history",(req,res)=>{const u=user(req);if(!u)return res.status(401).json({erro:"Faça login."});const traces=db.prepare(`DELETE FROM ai_traces WHERE user_id=?`).run(u.id);const activity=db.prepare(`DELETE FROM user_activity WHERE user_id=? AND event_type='BRAIN_QUERY'`).run(u.id);res.json({ok:true,removedTraces:Number(traces.changes||0),removedActivity:Number(activity.changes||0)});});
  app.get("/api/update-log/:version",(req,res)=>{const entry=getUpdateLog(req.params.version);if(!entry||!entry.public)return res.status(404).json({erro:"Versão não encontrada."});res.json(entry);});
  app.post("/api/update-log/:version/seen",(req,res)=>{const u=user(req);if(!u)return res.status(401).json({erro:"Faça login para salvar o estado da atualização."});if(!getUpdateLog(req.params.version))return res.status(404).json({erro:"Versão não encontrada."});try{const preferences=updatePreferences(req,{lastSeenVersion:req.params.version});res.json({ok:true,lastSeenVersion:preferences.lastSeenVersion});}catch(error){res.status(400).json({erro:error.message});}});

  app.get("/api/admin/ai5/metrics",requireDev,(req,res)=>res.json({deprecated:true,replacedBy:"GI_CORE_8.5 + DEXTER_OLLAMA_OPTIONAL",trace:traceMetrics(),research:researchRecoveryMetrics(),rootCauses:attributionMetrics(),health:health(),images:imageEngine3Summary(),constructionComponents:constructionComponentMetrics(),generationFailures:generationFailureClusters(),autonomousGeneration:{status:autonomousGenerationStatus(),metrics:{...autogenMetrics(),states:autogenStateMetrics()}}}));
  app.get("/api/admin/ai5/traces",requireDev,(req,res)=>res.json({entries:listAITraces({limit:req.query.limit||80,status:req.query.status||null,component:req.query.component||null,gameId:req.query.gameId||null})}));
  app.get("/api/admin/ai5/traces/:id",requireDev,(req,res)=>{const trace=getAITrace(req.params.id);if(!trace)return res.status(404).json({erro:"Trace não encontrado."});res.json(trace);});
  app.get("/api/admin/ai5/simulations",requireDev,(req,res)=>res.json({entries:listSimulations({limit:req.query.limit||40})}));
  app.post("/api/admin/ai5/simulate",requireDev,async(req,res)=>{const input=String(req.body?.input||"").trim();if(!input)return res.status(400).json({erro:"Informe uma entrada para a simulação."});res.json({deprecatedEndpoint:true,replacedBy:"DEXTER",...(await publicDexterConsult({question:input,selectedGame:req.body?.selectedGame||"AUTOMATIC",language:req.body?.language||"pt-BR",forceResearch:Boolean(req.body?.forceResearch)}))});});
  app.get("/api/admin/ai5/construction",requireDev,(req,res)=>res.json({status:autonomousGenerationStatus(),metrics:{...autogenMetrics(),states:autogenStateMetrics()},components:constructionComponentMetrics(),failureClusters:generationFailureClusters(),entries:listAutogenQueue({status:req.query.status||null,limit:req.query.limit||100}),knowledgeGaps:listKnowledgeGaps({limit:req.query.gapLimit||60}),diagnostics:listGenerationDiagnostics({jobId:req.query.jobId||null,limit:req.query.diagLimit||60})}));
  app.post("/api/admin/ai5/construction/run",requireDev,async(req,res)=>res.json(await runAutonomousGenerationCycle({language:req.body?.language||"pt-BR"})));
  app.get("/api/admin/update-log/technical",requireDev,(req,res)=>res.json({product:"GameIndex",version:CURRENT_VERSION,internalRelease:INTERNAL_RELEASE,aiSystem:"GI Core 8.5 + Dexter",schemaVersion:schemaVersion(),targetSchema:TARGET_SCHEMA,migrationStatus:schemaVersion()>=TARGET_SCHEMA?"PASS":"PENDING",latestBackup:Boolean(latestBackup()),build:`GameIndex Beta ${CURRENT_VERSION}`}));
}
