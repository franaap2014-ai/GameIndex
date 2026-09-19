import { firstAdminSetupState } from "../auth/first-admin-setup.mjs";
import { schemaVersion, storageOrigin } from "../database/connection.mjs";
import { gameCount } from "../database/repositories/game-repository.mjs";
import { imageEngine3Summary } from "../images/image-engine3.mjs";
import { PRODUCT_CODENAME, PRODUCT_LABEL, PRODUCT_VERSION } from "../runtime/deployment-runtime.mjs";

export function registerBeta089Routes(app){
  app.get("/api/beta089/status",(req,res)=>res.json({product:"GameIndex",version:PRODUCT_LABEL,semanticVersion:PRODUCT_VERSION,codename:PRODUCT_CODENAME,schema:schemaVersion(),games:gameCount(),storageOrigin,localAi:true,externalAiRequired:false,imageRuntime:"IMAGE_ENGINE_3_NATIVE",imageEngine:imageEngine3Summary(),legacyImageRuntime:false,firstAdmin:firstAdminSetupState()}));
}
