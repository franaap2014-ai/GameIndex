import { createHash, randomUUID } from "node:crypto";
import { db, nowIso } from "../connection.mjs";
import { setInternalTier, tierMetrics } from "./entitlement-repository.mjs";

function map(row){return row?{
  userId:row.user_id,subscriptionId:row.subscription_id||`sub-${row.user_id}`,plan:row.plan||"FREE",status:row.status||"NONE",provider:row.provider||"",providerCustomerId:row.provider_customer_id||"",providerSubscriptionId:row.provider_subscription_id||"",priceCents:Number(row.price_cents||0),currency:row.currency||"BRL",billingInterval:row.billing_interval||"",startedAt:row.started_at||"",currentPeriodStart:row.current_period_start||"",currentPeriodEnd:row.current_period_end||"",cancelAtPeriodEnd:Boolean(row.cancel_at_period_end),cancelledAt:row.cancelled_at||"",createdAt:row.created_at||"",updatedAt:row.updated_at||"",lastEventId:row.last_event_id||""
}:null;}

export function getSubscriptionRecord(userId){return map(db.prepare(`SELECT * FROM subscriptions WHERE user_id=?`).get(userId));}
export function ensureSubscription(userId){
  const current=getSubscriptionRecord(userId);if(current)return current;const now=nowIso();
  db.prepare(`INSERT INTO subscriptions(user_id,plan,status,updated_at,subscription_id,currency,created_at) VALUES(?,?,?,?,?,?,?)`).run(userId,"FREE","ACTIVE",now,`sub-${userId}`,"BRL",now);
  return getSubscriptionRecord(userId);
}
export function setSubscriptionState(userId,input={}){
  const current=ensureSubscription(userId),now=nowIso();
  const next={...current,...input,userId,updatedAt:now};
  db.prepare(`UPDATE subscriptions SET subscription_id=?,plan=?,status=?,provider=?,provider_customer_id=?,provider_subscription_id=?,price_cents=?,currency=?,billing_interval=?,started_at=?,current_period_start=?,current_period_end=?,cancel_at_period_end=?,cancelled_at=?,created_at=?,last_event_id=?,updated_at=? WHERE user_id=?`).run(
    next.subscriptionId||current.subscriptionId||`sub-${userId}`,String(next.plan||"FREE").toUpperCase(),String(next.status||"NONE").toUpperCase(),next.provider||"",next.providerCustomerId||"",next.providerSubscriptionId||"",Number(next.priceCents||0),next.currency||"BRL",next.billingInterval||"",next.startedAt||"",next.currentPeriodStart||"",next.currentPeriodEnd||"",next.cancelAtPeriodEnd?1:0,next.cancelledAt||"",next.createdAt||now,next.lastEventId||"",now,userId);
  const stored=getSubscriptionRecord(userId);
  // DEV is internal and never downgraded by billing. PRO is derived from ACTIVE subscription.
  const rawTier=String(db.prepare(`SELECT account_tier tier FROM users WHERE id=?`).get(userId)?.tier||"FREE").toUpperCase();
  if(rawTier!=="DEV")setInternalTier(userId,stored.plan==="PRO"&&stored.status==="ACTIVE"?"PRO":"FREE");
  return stored;
}
export function recordBillingEvent({eventId=randomUUID(),provider,eventType,userId=null,subscriptionId="",payload={},status="RECEIVED",errorCode=""}={}){
  const id=String(eventId);const exists=db.prepare(`SELECT * FROM billing_events WHERE event_id=?`).get(id);if(exists)return {duplicate:true,event:exists};
  const hash=createHash("sha256").update(JSON.stringify(payload??{})).digest("hex");const now=nowIso();
  db.prepare(`INSERT INTO billing_events(event_id,provider,event_type,user_id,subscription_id,payload_hash,status,created_at,processed_at,error_code) VALUES(?,?,?,?,?,?,?,?,?,?)`).run(id,String(provider||"UNKNOWN"),String(eventType||"UNKNOWN"),userId,subscriptionId,hash,status,now,status==="PROCESSED"?now:"",errorCode);
  return {duplicate:false,eventId:id};
}
export function markBillingEvent(eventId,{status="PROCESSED",errorCode=""}={}){db.prepare(`UPDATE billing_events SET status=?,processed_at=?,error_code=? WHERE event_id=?`).run(status,nowIso(),errorCode,eventId);return db.prepare(`SELECT * FROM billing_events WHERE event_id=?`).get(eventId);}
export function subscriptionMetrics(){
  const tiers=tierMetrics();const count=(sql,args=[])=>Number(db.prepare(sql).get(...args)?.count||0);
  return {tiers,active:count(`SELECT COUNT(*) count FROM subscriptions WHERE plan='PRO' AND status='ACTIVE'`),pending:count(`SELECT COUNT(*) count FROM subscriptions WHERE plan='PRO' AND status='PENDING'`),cancelled:count(`SELECT COUNT(*) count FROM subscriptions WHERE plan='PRO' AND status='CANCELLED'`),expired:count(`SELECT COUNT(*) count FROM subscriptions WHERE plan='PRO' AND status='EXPIRED'`),pastDue:count(`SELECT COUNT(*) count FROM subscriptions WHERE plan='PRO' AND status='PAST_DUE'`),events:count(`SELECT COUNT(*) count FROM billing_events`)};
}
