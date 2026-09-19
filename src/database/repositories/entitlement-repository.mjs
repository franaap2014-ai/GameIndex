import { db, nowIso } from "../connection.mjs";

export const TIERS=Object.freeze(["FREE","PRO","DEV"]);
const RANK=Object.freeze({FREE:0,PRO:1,DEV:2});

function rawTier(userId){return String(db.prepare(`SELECT account_tier tier FROM users WHERE id=?`).get(userId)?.tier||"FREE").toUpperCase();}
function activePro(userId){
  try{const manual=db.prepare(`SELECT 1 active FROM manual_plan_grants WHERE user_id=? AND plan='PRO' AND active=1 AND (expires_at='' OR expires_at>?) ORDER BY created_at DESC LIMIT 1`).get(userId,nowIso());if(manual)return true;}catch{}
  const row=db.prepare(`SELECT plan,status,current_period_end,cancel_at_period_end FROM subscriptions WHERE user_id=?`).get(userId);
  if(!row)return false;
  if(String(row.plan).toUpperCase()!=="PRO")return false;
  const status=String(row.status).toUpperCase();
  const end=String(row.current_period_end||"");
  const periodValid=!end||new Date(end).getTime()>Date.now();
  if(status==="ACTIVE")return periodValid;
  // Cancellation must not erase the already-paid entitlement before its period ends.
  if(status==="CANCELLED"&&Number(row.cancel_at_period_end||0)===1)return periodValid;
  return false;
}

export function getEffectiveTier(userId){
  const stored=rawTier(userId);
  if(stored==="DEV")return "DEV";
  return activePro(userId)?"PRO":"FREE";
}
export function tierAtLeast(userId,required="FREE"){return (RANK[getEffectiveTier(userId)]??0)>=(RANK[String(required).toUpperCase()]??0);}
export function setInternalTier(userId,tier="FREE"){
  const normalized=String(tier||"FREE").toUpperCase();if(!TIERS.includes(normalized))throw new Error("Tier inválido.");
  db.prepare(`UPDATE users SET account_tier=?,updated_at=? WHERE id=?`).run(normalized,nowIso(),userId);
  return getEffectiveTier(userId);
}
export function entitlementSnapshot(userId){
  const tier=getEffectiveTier(userId);
  return {tier,free:true,pro:tier==="PRO"||tier==="DEV",dev:tier==="DEV"};
}
export function tierMetrics(){
  const rows=db.prepare(`SELECT id FROM users`).all();const out={FREE:0,PRO:0,DEV:0};for(const row of rows)out[getEffectiveTier(row.id)]++;
  return out;
}
