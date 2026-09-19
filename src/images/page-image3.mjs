import { resolveImage3 } from "./image-engine3.mjs";
import { defaultRoleForEntity } from "./image-discovery3.mjs";
export async function ensurePageImages3({game,entity=null,pageType="",language="pt-BR"}={}){if(!game?.id)return [];const role=entity?defaultRoleForEntity({...entity,type:entity.type||pageType}):"COVER";const asset=await resolveImage3({game,entity,role,language});return asset?.currentRevision>0?[asset]:[];}
