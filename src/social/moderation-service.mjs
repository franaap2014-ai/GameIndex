import { createHash, randomUUID } from "node:crypto";
import { db, json, nowIso } from "../database/connection.mjs";

const RULES=[
  ["SCRIPT_OR_MARKUP",/<\/?(?:script|iframe|object|embed|style)|javascript\s*:|on\w+\s*=/i,.98,"BLOCK"],
  ["CREDENTIAL_OR_TOKEN",/\b(?:password|senha|token|api[_ -]?key|cookie)\s*[:=]\s*\S+/i,.96,"BLOCK"],
  ["PERSONAL_PHONE",/(?:\+?55\s*)?(?:\(?\d{2}\)?\s*)?9?\d{4}[-\s]?\d{4}/,.82,"HOLD_FOR_REVIEW"],
  ["PERSONAL_EMAIL",/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,.78,"WARN"],
  ["SEXUAL_CONTENT",/\b(?:porn|pornô|nudes?|sexo explícito|sexual content)\b/i,.94,"BLOCK"],
  ["THREAT",/\b(?:vou te matar|eu vou matar|kill you|te espancar|ameaça)\b/i,.94,"HOLD_FOR_REVIEW"],
  ["HARASSMENT",/\b(?:idiota|imbecil|burro|otário|lixo humano|stupid idiot)\b/i,.72,"WARN"],
  ["SELF_HARM_CONCERN",/\b(?:me matar|suic[ií]dio|self[- ]harm|não quero viver)\b/i,.96,"ESCALATE"],
  ["HATEFUL_ABUSE",/\b(?:raça inferior|exterminar .*grupo|ódio contra)\b/i,.96,"BLOCK"],
  ["IMPERSONATION",/\b(?:sou o administrador|sou o creator|senha do creator)\b/i,.7,"WARN"]
];
const RANK={ALLOW:0,WARN:1,HOLD_FOR_REVIEW:2,BLOCK:3,ESCALATE:4};
function normalize(value){return String(value||"").normalize("NFKC").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g,"").replace(/\s+/g," ").trim();}

export function scanSocialContent(content,{targetType="TEXT",targetId=randomUUID(),maxLength=4000}={}){
  const text=normalize(content),reasons=[];let decision="ALLOW",risk=0;if(!text)reasons.push("EMPTY_CONTENT");if(text.length>maxLength){decision="BLOCK";risk=1;reasons.push("CONTENT_TOO_LONG");}
  for(const [code,pattern,score,next] of RULES){if(!pattern.test(text))continue;reasons.push(code);risk=Math.max(risk,score);if(RANK[next]>RANK[decision])decision=next;}
  const repeated=/(.)\1{14,}/.test(text)||/(\b\w+\b)(?:\s+\1){7,}/i.test(text);if(repeated){reasons.push("SPAM_PATTERN");risk=Math.max(risk,.68);if(RANK.WARN>RANK[decision])decision="WARN";}
  if(!text)decision="BLOCK";const id=randomUUID(),evidenceHash=createHash("sha256").update(text).digest("hex");db.prepare(`INSERT INTO moderation_scans(id,target_type,target_id,decision,reason_codes_json,risk_score,evidence_hash,scanner_version,created_at) VALUES(?,?,?,?,?,?,?,?,?)`).run(id,String(targetType).slice(0,60),String(targetId).slice(0,160),decision,json(reasons),risk,evidenceHash,"DEXTER_SAFETY_7_LOCAL",nowIso());return {id,decision,reasonCodes:reasons,riskScore:risk,text,scannerVersion:"DEXTER_SAFETY_7_LOCAL",humanReviewRequired:["HOLD_FOR_REVIEW","ESCALATE"].includes(decision),permanentBanAllowed:false};
}

export function moderationPublicDecision(scan){return {decision:scan.decision,reasonCodes:scan.reasonCodes,riskScore:scan.riskScore,humanReviewRequired:scan.humanReviewRequired,permanentBanAllowed:false};}
