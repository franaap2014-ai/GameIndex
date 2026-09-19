import { createHash, randomBytes, randomUUID, randomInt, timingSafeEqual } from "node:crypto";
import { db, nowIso } from "../database/connection.mjs";
import { getUserById } from "../database/repositories/user-repository.mjs";
import { sendMail, mailTransportStatus } from "./mail-transport.mjs";

const EXPIRE_MS=10*60_000,RESEND_MS=60_000,MAX_ATTEMPTS=6;
function hash(code,salt){return createHash("sha256").update(`${salt}:${code}`).digest("hex");}
function hint(email){const [name,domain]=String(email||"").split("@");if(!domain)return"";return `${(name?.[0]||"•")}••••@${domain}`;}
export function twoFactorStatus(userId){const row=db.prepare(`SELECT email_2fa_enabled,email_2fa_verified_at,updated_at FROM account_security WHERE user_id=?`).get(String(userId||""));return{enabled:Boolean(row?.email_2fa_enabled),verifiedAt:row?.email_2fa_verified_at||"",mail:{configured:Boolean(mailTransportStatus().configured)}};}
async function createChallenge(userId,purpose){
  const user=db.prepare(`SELECT id,email FROM users WHERE id=?`).get(String(userId));if(!user)throw new Error("USER_NOT_FOUND");if(!mailTransportStatus().configured)throw new Error("MAIL_NOT_CONFIGURED");
  const latest=db.prepare(`SELECT last_sent_at FROM two_factor_challenges WHERE user_id=? AND purpose=? ORDER BY created_at DESC LIMIT 1`).get(String(userId),purpose);if(latest&&Date.now()-Date.parse(latest.last_sent_at)<RESEND_MS)throw new Error("TWO_FACTOR_COOLDOWN");
  const code=String(randomInt(100000,1000000)),salt=randomBytes(16).toString("hex"),id=randomUUID(),now=nowIso(),expires=new Date(Date.now()+EXPIRE_MS).toISOString();
  db.prepare(`INSERT INTO two_factor_challenges(id,user_id,purpose,code_hash,salt,expires_at,used_at,attempt_count,last_sent_at,created_at) VALUES(?,?,?,?,?,?, '',0,?,?)`).run(id,String(userId),purpose,hash(code,salt),salt,expires,now,now);
  try{
    await sendMail({to:user.email,subject:purpose==="LOGIN"?"Código de acesso GameIndex":"Confirmar proteção em duas etapas",text:`Seu código GameIndex é ${code}. Ele expira em 10 minutos. Se você não iniciou esta ação, ignore este e-mail.`});
  }catch(error){
    try{db.prepare(`DELETE FROM two_factor_challenges WHERE id=?`).run(id);}catch{}
    throw error;
  }
  return{id,emailHint:hint(user.email),expiresAt:expires};
}
export async function requestLoginChallenge(userId){return createChallenge(userId,"LOGIN");}
export async function requestEnableChallenge(userId){return createChallenge(userId,"ENABLE_2FA");}
export async function resendChallenge({challengeId,purpose="LOGIN"}={}){const row=db.prepare(`SELECT user_id,purpose FROM two_factor_challenges WHERE id=?`).get(String(challengeId||""));if(!row||row.purpose!==purpose)throw new Error("TWO_FACTOR_INVALID");return createChallenge(row.user_id,purpose);}
export function verifyChallenge({challengeId,code,purpose}={}){
  const row=db.prepare(`SELECT * FROM two_factor_challenges WHERE id=?`).get(String(challengeId||""));if(!row||row.purpose!==purpose)throw new Error("TWO_FACTOR_INVALID");if(row.used_at)throw new Error("TWO_FACTOR_USED");if(Date.parse(row.expires_at)<=Date.now())throw new Error("TWO_FACTOR_EXPIRED");if(Number(row.attempt_count)>=MAX_ATTEMPTS)throw new Error("TWO_FACTOR_LOCKED");
  db.prepare(`UPDATE two_factor_challenges SET attempt_count=attempt_count+1 WHERE id=?`).run(row.id);const candidate=Buffer.from(hash(String(code||""),row.salt),"hex"),expected=Buffer.from(row.code_hash,"hex");if(candidate.length!==expected.length||!timingSafeEqual(candidate,expected))throw new Error("TWO_FACTOR_INVALID");db.prepare(`UPDATE two_factor_challenges SET used_at=? WHERE id=?`).run(nowIso(),row.id);return{userId:row.user_id};
}
export function enableTwoFactor(userId){const now=nowIso();db.prepare(`INSERT INTO account_security(user_id,email_2fa_enabled,email_2fa_verified_at,updated_at) VALUES(?,1,?,?) ON CONFLICT(user_id) DO UPDATE SET email_2fa_enabled=1,email_2fa_verified_at=excluded.email_2fa_verified_at,updated_at=excluded.updated_at`).run(String(userId),now,now);return twoFactorStatus(userId);}
export function disableTwoFactor(userId){const now=nowIso();db.prepare(`INSERT INTO account_security(user_id,email_2fa_enabled,email_2fa_verified_at,updated_at) VALUES(?,0,'',?) ON CONFLICT(user_id) DO UPDATE SET email_2fa_enabled=0,email_2fa_verified_at='',updated_at=excluded.updated_at`).run(String(userId),now);return twoFactorStatus(userId);}
