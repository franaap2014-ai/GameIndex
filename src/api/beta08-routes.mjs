import { authPayload, currentAuth, updatePreferences } from "../auth/auth-service.mjs";
import { requireAdmin, adminSession } from "../admin/admin-auth.mjs";
import { listGames } from "../database/repositories/game-repository.mjs";
import { themesForTier, themePublicState } from "../themes/theme-service.mjs";
import { getEffectiveTier } from "../database/repositories/entitlement-repository.mjs";
import { PLANS, billingStatus, createSandboxCheckout, completeSandboxCheckout, cancelSandboxSubscription, subscriptionPublicState } from "../subscriptions/subscription-service.mjs";
import { ai4Metrics, listAI4Events } from "../database/repositories/ai4-metrics-repository.mjs";
import { reviewMetrics, listReviews } from "../database/repositories/review-repository.mjs";
import { subscriptionMetrics } from "../database/repositories/subscription-repository.mjs";
import { autogenMetrics, listAutogenQueue } from "../database/repositories/autogen-repository.mjs";
import { autonomousGenerationStatus, runAutonomousGenerationCycle } from "../autonomy/autonomous-generation.mjs";

function user(req){return currentAuth(req)?.user||null;}
function mustUser(req,res){const u=user(req);if(!u){res.status(401).json({erro:"Faça login para continuar."});return null;}return u;}
export function registerBeta08Routes(app){
  app.get("/api/beta08/status",(req,res)=>res.json({version:"Beta 0.8",codename:"The Intelligence Update",gameVaultAI:"4.0",bossAI:"ACTIVE",researchAI:"V4",consultAI:"V1",refinementAI:"V1",review:"ACTIVE",autonomousGeneration:autonomousGenerationStatus(),billing:billingStatus(),themes:"V2",admin:Boolean(adminSession(req)),externalAiRequired:false}));
  app.get("/api/ai4/games",(req,res)=>res.json({entries:listGames({includeDrafts:false}).filter(g=>String(g.entityType||"GAME").toUpperCase()==="GAME").map(g=>({id:g.id,slug:g.slug,name:g.nome}))}));
  app.get("/api/settings",(req,res)=>{const u=user(req);if(!u)return res.json({authenticated:false,preferences:{language:"pt-BR",theme:"FREE_DARK"},tier:"FREE",availableThemes:themesForTier("FREE"),themeState:{tier:"FREE",selectedTheme:"FREE_DARK",availableThemes:themesForTier("FREE"),devLightSpecial:false}});const payload=authPayload(req);res.json({authenticated:true,preferences:payload.preferences,tier:getEffectiveTier(u.id),availableThemes:payload.theme.availableThemes,themeState:payload.theme});});
  app.post("/api/settings",(req,res)=>{const u=mustUser(req,res);if(!u)return;try{const preferences=updatePreferences(req,req.body||{});res.json({ok:true,preferences,themeState:themePublicState(u.id,preferences.theme)});}catch(error){res.status(403).json({erro:error.message});}});
  app.get("/api/themes",(req,res)=>{const u=user(req),tier=u?getEffectiveTier(u.id):"FREE";res.json({tier,themes:themesForTier(tier)});});

  app.get("/api/subscriptions/plans-v08",(req,res)=>res.json({plans:PLANS,billing:billingStatus(),current:user(req)?subscriptionPublicState(user(req).id):{tier:"FREE",entitlements:{tier:"FREE",free:true,pro:false,dev:false}}}));
  app.get("/api/subscriptions/me",(req,res)=>{const u=mustUser(req,res);if(!u)return;res.json(subscriptionPublicState(u.id));});
  app.post("/api/subscriptions/checkout",(req,res)=>{const u=mustUser(req,res);if(!u)return;if(getEffectiveTier(u.id)==="DEV")return res.status(403).json({erro:"DEV é uma permissão interna e não é um plano comprável."});const plan=String(req.body?.plan||"PRO").toUpperCase();if(plan!=="PRO")return res.status(400).json({erro:"Somente o plano PRO pode ser contratado."});const status=billingStatus();if(!status.sandboxConfigured)return res.status(503).json({erro:"A cobrança real ainda não está configurada. Configure um provedor e intervalo de cobrança no servidor.",billing:status});try{res.json({checkout:createSandboxCheckout(u.id),sandbox:true});}catch(error){res.status(400).json({erro:error.message});}});
  app.post("/api/subscriptions/sandbox/complete",(req,res)=>{const u=mustUser(req,res);if(!u)return;try{res.json({ok:true,...completeSandboxCheckout(u.id,req.body?.token)});}catch(error){res.status(400).json({erro:error.message});}});
  app.post("/api/subscriptions/sandbox/cancel",(req,res)=>{const u=mustUser(req,res);if(!u)return;try{res.json({ok:true,subscription:cancelSandboxSubscription(u.id)});}catch(error){res.status(400).json({erro:error.message});}});

  app.get("/api/admin/ai4/metrics",requireAdmin,(req,res)=>res.json({ai4:ai4Metrics(),reviews:reviewMetrics(),autonomousGeneration:autonomousGenerationStatus(),subscriptions:subscriptionMetrics(),billing:billingStatus()}));
  app.get("/api/admin/ai4/events",requireAdmin,(req,res)=>res.json({entries:listAI4Events({limit:req.query.limit||50})}));
  app.get("/api/admin/ai4/reviews",requireAdmin,(req,res)=>res.json({entries:listReviews({limit:req.query.limit||50}),metrics:reviewMetrics()}));
  app.get("/api/admin/autonomous-generation",requireAdmin,(req,res)=>res.json({status:autonomousGenerationStatus(),metrics:autogenMetrics(),entries:listAutogenQueue({status:req.query.status||null,limit:req.query.limit||100})}));
  app.post("/api/admin/autonomous-generation/run",requireAdmin,async(req,res)=>res.json(await runAutonomousGenerationCycle({language:req.body?.language||"pt-BR"})));
}
