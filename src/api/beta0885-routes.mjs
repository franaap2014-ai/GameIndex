import { requireDevArea } from "../admin/dev-access.mjs";
import { currentAuth } from "../auth/auth-service.mjs";
import { detailedHealthSnapshot, listDeploymentDiagnostics, PRODUCT_CODENAME, PRODUCT_LABEL, PRODUCT_VERSION, runDeploymentDiagnostics } from "../runtime/deployment-runtime.mjs";
import { schemaVersion } from "../database/connection.mjs";

function user(req){return currentAuth(req)?.user||null;}

export function registerBeta0885Routes(app){
  app.get("/api/beta0885/status",(req,res)=>res.json({product:"GameIndex",version:PRODUCT_LABEL,semanticVersion:PRODUCT_VERSION,codename:PRODUCT_CODENAME,azureReady:true,externalAiRequired:false,degradedMode:false,schema:schemaVersion(),legacyEndpoint:true}));
  app.get("/api/admin/deployment-monitor",requireDevArea("DEPLOYMENT_MONITOR"),(req,res)=>res.json({health:detailedHealthSnapshot(),diagnostics:listDeploymentDiagnostics({limit:req.query.limit||20})}));
  app.get("/api/admin/health/details",requireDevArea("DEPLOYMENT_MONITOR"),(req,res)=>res.json(detailedHealthSnapshot({probeWrite:String(req.query.probeWrite||"")==="1"})));
  app.post("/api/admin/deployment-monitor/diagnose",requireDevArea("DEPLOYMENT_MONITOR"),(req,res)=>{const actor=user(req),result=runDeploymentDiagnostics({createdBy:actor?.id||null,authorizationVerified:Boolean(req.gameIndexDevAccess?.authorized)});res.status(result.status==="UNHEALTHY"?503:200).json(result);});
}
