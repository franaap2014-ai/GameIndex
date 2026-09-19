import { requireDev } from "../admin/dev-auth.mjs";
import { currentAuth } from "../auth/auth-service.mjs";
import { listAITraces, getAITrace, traceMetrics, listSimulations } from "../database/repositories/ai-trace-repository.mjs";
import { semanticMetrics } from "../ai45/semantic-review-repository.mjs";
import { runAISimulation } from "../ai45/simulator.mjs";
import { autonomousGenerationStatus, runAutonomousGenerationCycle } from "../autonomy/autonomous-generation.mjs";
import { autogenMetrics, listAutogenQueue } from "../database/repositories/autogen-repository.mjs";
import { ai4Metrics } from "../database/repositories/ai4-metrics-repository.mjs";
import { listGenerationDiagnostics } from "../database/repositories/generation-diagnostics-repository.mjs";

export function registerBeta085Routes(app){
  app.get("/api/beta085/status",(req,res)=>res.json({version:"Beta 0.85",codename:"Understanding & Control",gameVaultAI:"4.5",entityIntelligence:"V2",intentResolver:"V2",relationshipGraph:"V2",consultAI:"V2",refinementAI:"V2",semanticReview:"V2",aiControlCenter:"DEV_ONLY",autonomousGeneration:autonomousGenerationStatus()}));
  app.get("/api/admin/ai85/metrics",requireDev,(req,res)=>res.json({trace:traceMetrics(),semantic:semanticMetrics(),legacyAI4:ai4Metrics(),autonomousGeneration:{status:autonomousGenerationStatus(),metrics:autogenMetrics()}}));
  app.get("/api/admin/ai85/traces",requireDev,(req,res)=>res.json({entries:listAITraces({limit:req.query.limit||60,status:req.query.status||null,component:req.query.component||null,gameId:req.query.gameId||null})}));
  app.get("/api/admin/ai85/traces/:id",requireDev,(req,res)=>{const trace=getAITrace(req.params.id);if(!trace)return res.status(404).json({erro:"Trace não encontrado."});res.json(trace);});
  app.get("/api/admin/ai85/simulations",requireDev,(req,res)=>res.json({entries:listSimulations({limit:req.query.limit||40})}));
  app.post("/api/admin/ai85/simulate",requireDev,async(req,res)=>{const input=String(req.body?.input||"").trim();if(!input)return res.status(400).json({erro:"Informe uma entrada para a simulação."});const user=currentAuth(req)?.user;const result=await runAISimulation({userId:user?.id||null,input,group:req.body?.group,selectedGame:req.body?.selectedGame||"AUTOMATIC",language:req.body?.language||"pt-BR",forceResearch:req.body?.forceResearch});res.json(result);});
  app.get("/api/admin/ai85/construction",requireDev,(req,res)=>res.json({status:autonomousGenerationStatus(),metrics:autogenMetrics(),entries:listAutogenQueue({status:req.query.status||null,limit:req.query.limit||100}),diagnostics:listGenerationDiagnostics({jobId:req.query.jobId||null,limit:req.query.diagLimit||60})}));
  app.post("/api/admin/ai85/construction/run",requireDev,async(req,res)=>res.json(await runAutonomousGenerationCycle({language:req.body?.language||"pt-BR"})));
}
