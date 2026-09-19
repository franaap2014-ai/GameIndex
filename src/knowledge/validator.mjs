import { clamp } from "./normalize.mjs";

export function inferCanonStatus({intent,evidence=[]}) {
  if (intent==="theory") return "THEORY";
  const types=new Set(evidence.map(item=>item.sourceDocument?.sourceType));
  if (types.has("PRIMARY_OFFICIAL") || types.has("OFFICIAL_DOCUMENTATION") || types.has("OFFICIAL_PATCH_NOTES")) return "OFFICIAL";
  if ([...types].some(type=>["COMMUNITY_WIKI","COMMUNITY_DISCUSSION","VIDEO_GUIDE"].includes(type))) return intent==="lore"?"COMMUNITY":"NOT_APPLICABLE";
  return intent==="lore"?"UNKNOWN":"NOT_APPLICABLE";
}

export function validateEvidence({evidence=[],conflicts=[],intent=""}={}) {
  if (!evidence.length) return {accepted:[],confidence:0,status:"UNVERIFIED",canonStatus:intent==="theory"?"THEORY":intent==="lore"?"UNKNOWN":"NOT_APPLICABLE",conflicts};
  const accepted=evidence.filter(item=>item.relevance>=.24 && item.sourceQuality>=.46).slice(0,10);
  if(!accepted.length)return {accepted:[],confidence:0,status:"UNVERIFIED",canonStatus:intent==="theory"?"THEORY":intent==="lore"?"UNKNOWN":"NOT_APPLICABLE",conflicts};
  const avg=accepted.reduce((sum,item)=>sum + item.relevance*.5 + item.sourceQuality*.5,0)/accepted.length;
  const independent=new Set(accepted.map(item=>item.sourceDocument?.url)).size;
  const agreementBoost=Math.min(.11,Math.max(0,independent-1)*.04);
  const conflictPenalty=Math.min(.24,conflicts.length*.09);
  const confidence=clamp(avg+agreementBoost-conflictPenalty,.05,.97);
  const status=conflicts.length?"CONFLICTED":confidence>=.66?"CURRENT":"UNVERIFIED";
  return {accepted,confidence,status,canonStatus:inferCanonStatus({intent,evidence:accepted}),conflicts};
}
