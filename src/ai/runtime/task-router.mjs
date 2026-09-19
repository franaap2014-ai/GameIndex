import { isKnownAICapability } from "./ai-capabilities.mjs";
import { runLocalAITask } from "./local-ai-runtime.mjs";

export async function routeAITask({capability,source="feature",execute,signal=null}={}){
  if(!isKnownAICapability(capability))throw new Error("UNKNOWN_AI_CAPABILITY");
  return runLocalAITask({capability,source,execute,signal});
}
