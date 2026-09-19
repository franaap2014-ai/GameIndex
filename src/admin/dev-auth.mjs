import { adminSession } from "./admin-auth.mjs";
import { getEffectiveTier } from "../database/repositories/entitlement-repository.mjs";
import { db } from "../database/connection.mjs";

function primaryAdminId(){try{return db.prepare(`SELECT value FROM meta WHERE key='primary_admin_user_id'`).get()?.value||"";}catch{return "";}}
export function devSession(req){
  const session=adminSession(req);if(!session)return null;
  const tier=getEffectiveTier(session.user.id),primary=session.user.id===primaryAdminId();
  return tier==="DEV"||primary?{...session,effectiveTier:tier,primaryAdmin:primary}:null;
}
export function requireDev(req,res,next){const session=devSession(req);if(!session)return res.status(403).json({erro:"Acesso restrito ao DEV autorizado do GameIndex."});req.gameVaultDev=session;req.gameIndexDev=session;next();}
