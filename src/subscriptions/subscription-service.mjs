import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { entitlementSnapshot, getEffectiveTier } from "../database/repositories/entitlement-repository.mjs";
import { getSubscriptionRecord, recordBillingEvent, setSubscriptionState, markBillingEvent } from "../database/repositories/subscription-repository.mjs";

export const PRO_PRICE_CENTS=1000;
export function configuredInterval(){return String(process.env.GAMEVAULT_PRO_BILLING_INTERVAL||"").trim().toUpperCase();}
export function billingProvider(){return String(process.env.GAMEVAULT_BILLING_PROVIDER||"UNCONFIGURED").trim().toUpperCase();}
export function billingStatus(){const provider=billingProvider(),interval=configuredInterval();return {provider,interval,priceCents:PRO_PRICE_CENTS,currency:"BRL",liveConfigured:!new Set(["","UNCONFIGURED","TEST","TEST_SANDBOX"]).has(provider)&&Boolean(interval),sandboxConfigured:new Set(["TEST","TEST_SANDBOX"]).has(provider)&&Boolean(interval)};}

export const PLANS=[
  {id:"FREE",name:"GameIndex Free",active:true,price:null,priceCents:0,currency:"BRL",features:["Dexter IA padrão","Páginas dos jogos","Pesquisa e conhecimento base","Home personalizada","Temas Escuro e Claro"]},
  {id:"PRO",name:"GameIndex PRO",active:true,price:10,priceCents:PRO_PRICE_CENTS,currency:"BRL",billingInterval:configuredInterval()||null,features:["Tudo do Free","Recursos PRO habilitados pelo backend","Tema Pro Green","Experiência premium do GameIndex"]}
];

function secret(){return String(process.env.GAMEVAULT_BILLING_TEST_SECRET||"");}
function sign(value){const key=secret();if(!key)throw new Error("Sandbox de cobrança sem GAMEVAULT_BILLING_TEST_SECRET.");return createHmac("sha256",key).update(value).digest("base64url");}
function safeEqual(a,b){const aa=Buffer.from(String(a)),bb=Buffer.from(String(b));return aa.length===bb.length&&timingSafeEqual(aa,bb);}
export function createSandboxCheckout(userId){
  const status=billingStatus();if(!status.sandboxConfigured)throw new Error("Sandbox de cobrança exige provedor TEST_SANDBOX e intervalo configurado.");const interval=configuredInterval();const payload=Buffer.from(JSON.stringify({v:1,userId,plan:"PRO",priceCents:PRO_PRICE_CENTS,currency:"BRL",interval,nonce:randomUUID(),exp:Date.now()+15*60_000})).toString("base64url");const signature=sign(payload);setSubscriptionState(userId,{plan:"PRO",status:"PENDING",provider:"TEST_SANDBOX",priceCents:PRO_PRICE_CENTS,currency:"BRL",billingInterval:interval});return {provider:"TEST_SANDBOX",token:`${payload}.${signature}`,expiresInSeconds:900,priceCents:PRO_PRICE_CENTS,currency:"BRL",billingInterval:interval};
}
export function completeSandboxCheckout(userId,token){
  const status=billingStatus();if(!status.sandboxConfigured)throw new Error("Sandbox de cobrança desativado.");const [payload,signature]=String(token||"").split(".");if(!payload||!signature||!safeEqual(sign(payload),signature))throw new Error("Checkout sandbox inválido.");let data;try{data=JSON.parse(Buffer.from(payload,"base64url").toString("utf8"));}catch{throw new Error("Checkout sandbox inválido.");}if(data.userId!==userId||data.plan!=="PRO"||Number(data.exp)<Date.now())throw new Error("Checkout sandbox expirado ou pertence a outra conta.");const eventId=`test-${data.nonce}`;const event=recordBillingEvent({eventId,provider:"TEST_SANDBOX",eventType:"SUBSCRIPTION_ACTIVE",userId,payload:{plan:data.plan,priceCents:data.priceCents,interval:data.interval}});if(event.duplicate)return {duplicate:true,subscription:getSubscriptionRecord(userId)};const now=new Date();const end=new Date(now);if(data.interval==="YEARLY")end.setFullYear(end.getFullYear()+1);else end.setMonth(end.getMonth()+1);const sub=setSubscriptionState(userId,{subscriptionId:`sub-${userId}`,plan:"PRO",status:"ACTIVE",provider:"TEST_SANDBOX",providerSubscriptionId:`test-sub-${data.nonce}`,priceCents:PRO_PRICE_CENTS,currency:"BRL",billingInterval:data.interval,startedAt:now.toISOString(),currentPeriodStart:now.toISOString(),currentPeriodEnd:end.toISOString(),lastEventId:eventId});markBillingEvent(eventId,{status:"PROCESSED"});return {duplicate:false,subscription:sub};
}
export function cancelSandboxSubscription(userId){const current=getSubscriptionRecord(userId);if(!current||current.plan!=="PRO")throw new Error("Assinatura PRO não encontrada.");return setSubscriptionState(userId,{...current,status:"CANCELLED",cancelAtPeriodEnd:true,cancelledAt:new Date().toISOString()});}
export function subscriptionPublicState(userId){const subscription=getSubscriptionRecord(userId)||{plan:"FREE",status:"ACTIVE",priceCents:0,currency:"BRL",billingInterval:""};return {subscription,tier:getEffectiveTier(userId),entitlements:entitlementSnapshot(userId),billing:billingStatus()};}
