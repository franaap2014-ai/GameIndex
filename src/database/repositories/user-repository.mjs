import { db, nowIso } from "../connection.mjs";

function mapUser(row) {
  return row ? {
    id:row.id,
    email:row.email,
    displayName:row.display_name,
    username:row.username||"",
    role:row.role || "USER",
    accountTier:row.account_tier || "FREE",
    createdAt:row.created_at,
    updatedAt:row.updated_at,
    lastLoginAt:row.last_login_at || ""
  } : null;
}

export function createUser({id,email,displayName,passwordHash,passwordSalt}) {
  const now = nowIso();
  db.prepare(`INSERT INTO users(id,email,display_name,password_hash,password_salt,created_at,updated_at,last_login_at) VALUES(?,?,?,?,?,?,?,?)`).run(id,email.toLowerCase(),displayName||"",passwordHash,passwordSalt,now,now,now);
  db.prepare(`INSERT INTO user_preferences(user_id,language,theme,updated_at) VALUES(?,?,?,?)`).run(id,"pt-BR","FREE_DARK",now);
  db.prepare(`INSERT INTO subscriptions(user_id,plan,status,updated_at) VALUES(?,?,?,?)`).run(id,"FREE","ACTIVE",now);
  return getUserById(id);
}
export function removeNewUser(id){db.prepare(`DELETE FROM users WHERE id=?`).run(id);}
export function getUserByEmail(email) { const row=db.prepare(`SELECT * FROM users WHERE email=?`).get(String(email||"").toLowerCase()); return row ? {...mapUser(row),passwordHash:row.password_hash,passwordSalt:row.password_salt}:null; }
export function getUserCredentialsById(id) { const row=db.prepare(`SELECT * FROM users WHERE id=?`).get(id); return row ? {...mapUser(row),passwordHash:row.password_hash,passwordSalt:row.password_salt}:null; }
export function getUserById(id) { return mapUser(db.prepare(`SELECT u.*,p.username FROM users u LEFT JOIN user_profiles p ON p.user_id=u.id WHERE u.id=?`).get(id)); }
export function touchLastLogin(id){const now=nowIso();db.prepare(`UPDATE users SET last_login_at=?,updated_at=? WHERE id=?`).run(now,now,id);return getUserById(id);}

export function updatePasswordCredentials(userId,{passwordHash,passwordSalt}){
  const now=nowIso();
  db.prepare(`UPDATE users SET password_hash=?,password_salt=?,updated_at=? WHERE id=?`).run(String(passwordHash),String(passwordSalt),now,String(userId));
  return getUserById(String(userId));
}

export function setUserRole(id,role="USER"){const allowed=new Set(["USER","ADMIN"]);if(!allowed.has(role))throw new Error("Função de conta inválida.");db.prepare(`UPDATE users SET role=?,updated_at=? WHERE id=?`).run(role,nowIso(),id);return getUserById(id);}
export function listUsers({limit=50,offset=0,q=""}={}){
  const n=Math.min(200,Math.max(1,Number(limit)||50)),o=Math.max(0,Number(offset)||0),term=`%${String(q||"").toLowerCase()}%`;
  const rows=db.prepare(`SELECT u.*,p.username FROM users u LEFT JOIN user_profiles p ON p.user_id=u.id WHERE ?='' OR lower(u.email) LIKE ? OR lower(u.display_name) LIKE ? OR lower(COALESCE(p.username,'')) LIKE ? ORDER BY u.created_at DESC LIMIT ? OFFSET ?`).all(q?term:"",term,term,term,n,o);
  return rows.map(mapUser);
}

export function setPreference(userId,input={}) {
  const current=db.prepare(`SELECT * FROM user_preferences WHERE user_id=?`).get(userId)||{};
  const next={
    language:input.language??current.language??"pt-BR",
    theme:input.theme??current.theme??"FREE_DARK",
    recommendationsEnabled:input.recommendationsEnabled??(current.recommendations_enabled===undefined?true:Boolean(current.recommendations_enabled)),
    responseLength:input.responseLength??current.response_length??"BALANCED",
    showSources:input.showSources??(current.show_sources===undefined?true:Boolean(current.show_sources)),
    showRelatedSuggestions:input.showRelatedSuggestions??(current.show_related_suggestions===undefined?true:Boolean(current.show_related_suggestions)),
    externalResearch:input.externalResearch??(current.external_research===undefined?true:Boolean(current.external_research)),
    saveDexterHistory:input.saveDexterHistory??(current.save_dexter_history===undefined?true:Boolean(current.save_dexter_history)),
    answerLanguage:input.answerLanguage??current.answer_language??"AUTO",
    interfaceDensity:input.interfaceDensity??current.interface_density??"COMFORTABLE",
    animations:input.animations??current.animations??"ON",
    reducedMotion:input.reducedMotion??(current.reduced_motion===undefined?false:Boolean(current.reduced_motion)),
    highContrast:input.highContrast??(current.high_contrast===undefined?false:Boolean(current.high_contrast)),
    uiScale:Number(input.uiScale??current.ui_scale??1),
    productUpdates:input.productUpdates??(current.product_updates===undefined?true:Boolean(current.product_updates)),
    socialNotifications:input.socialNotifications??(current.social_notifications===undefined?true:Boolean(current.social_notifications)),
    dexterNotifications:input.dexterNotifications??(current.dexter_notifications===undefined?true:Boolean(current.dexter_notifications)),
    profileVisibility:input.profileVisibility??current.profile_visibility??"PUBLIC",
    activityVisibility:input.activityVisibility??current.activity_visibility??"FRIENDS",
    lastSeenVersion:input.lastSeenVersion??current.last_seen_version??"0.85",
    experimental:input.experimental??parseJsonSafe(current.experimental_json,{})
  };
  db.prepare(`INSERT INTO user_preferences(user_id,language,theme,recommendations_enabled,response_length,show_sources,show_related_suggestions,external_research,save_dexter_history,answer_language,interface_density,animations,reduced_motion,high_contrast,ui_scale,product_updates,social_notifications,dexter_notifications,profile_visibility,activity_visibility,last_seen_version,experimental_json,updated_at)
  VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  ON CONFLICT(user_id) DO UPDATE SET language=excluded.language,theme=excluded.theme,recommendations_enabled=excluded.recommendations_enabled,response_length=excluded.response_length,show_sources=excluded.show_sources,show_related_suggestions=excluded.show_related_suggestions,external_research=excluded.external_research,save_dexter_history=excluded.save_dexter_history,answer_language=excluded.answer_language,interface_density=excluded.interface_density,animations=excluded.animations,reduced_motion=excluded.reduced_motion,high_contrast=excluded.high_contrast,ui_scale=excluded.ui_scale,product_updates=excluded.product_updates,social_notifications=excluded.social_notifications,dexter_notifications=excluded.dexter_notifications,profile_visibility=excluded.profile_visibility,activity_visibility=excluded.activity_visibility,last_seen_version=excluded.last_seen_version,experimental_json=excluded.experimental_json,updated_at=excluded.updated_at`)
  .run(userId,next.language,next.theme,next.recommendationsEnabled?1:0,next.responseLength,next.showSources?1:0,next.showRelatedSuggestions?1:0,next.externalResearch?1:0,next.saveDexterHistory?1:0,next.answerLanguage,next.interfaceDensity,next.animations,next.reducedMotion?1:0,next.highContrast?1:0,next.uiScale,next.productUpdates?1:0,next.socialNotifications?1:0,next.dexterNotifications?1:0,next.profileVisibility,next.activityVisibility,next.lastSeenVersion,JSON.stringify(next.experimental||{}),nowIso());
  return getPreference(userId);
}
function parseJsonSafe(value,fallback={}){try{return JSON.parse(value||"{}")}catch{return fallback}}
export function getPreference(userId) {
  const row=db.prepare(`SELECT * FROM user_preferences WHERE user_id=?`).get(userId);
  if(!row)return {language:"pt-BR",theme:"FREE_DARK",recommendationsEnabled:true,responseLength:"BALANCED",showSources:true,showRelatedSuggestions:true,externalResearch:true,saveDexterHistory:true,answerLanguage:"AUTO",interfaceDensity:"COMFORTABLE",animations:"ON",reducedMotion:false,highContrast:false,uiScale:1,productUpdates:true,socialNotifications:true,dexterNotifications:true,profileVisibility:"PUBLIC",activityVisibility:"FRIENDS",lastSeenVersion:"0.85",experimental:{}};
  return {language:row.language,theme:row.theme,recommendationsEnabled:row.recommendations_enabled===undefined?true:Boolean(row.recommendations_enabled),responseLength:row.response_length??"BALANCED",showSources:row.show_sources===undefined?true:Boolean(row.show_sources),showRelatedSuggestions:row.show_related_suggestions===undefined?true:Boolean(row.show_related_suggestions),externalResearch:row.external_research===undefined?true:Boolean(row.external_research),saveDexterHistory:row.save_dexter_history===undefined?true:Boolean(row.save_dexter_history),answerLanguage:row.answer_language??"AUTO",interfaceDensity:row.interface_density??"COMFORTABLE",animations:row.animations??"ON",reducedMotion:Boolean(row.reduced_motion||0),highContrast:Boolean(row.high_contrast||0),uiScale:Number(row.ui_scale||1),productUpdates:row.product_updates===undefined?true:Boolean(row.product_updates),socialNotifications:row.social_notifications===undefined?true:Boolean(row.social_notifications),dexterNotifications:row.dexter_notifications===undefined?true:Boolean(row.dexter_notifications),profileVisibility:row.profile_visibility??"PUBLIC",activityVisibility:row.activity_visibility??"FRIENDS",lastSeenVersion:row.last_seen_version??"0.85",experimental:parseJsonSafe(row.experimental_json,{}),updatedAt:row.updated_at};
}

export function createSession({tokenHash,userId,expiresAt}) { db.prepare(`INSERT INTO sessions(token_hash,user_id,expires_at,created_at) VALUES(?,?,?,?)`).run(tokenHash,userId,expiresAt,nowIso()); }
export function getSession(tokenHash) {
  db.prepare(`DELETE FROM sessions WHERE expires_at<=?`).run(nowIso());
  const row=db.prepare(`SELECT s.*,u.email,u.display_name,u.role,u.account_tier,u.created_at user_created_at,u.updated_at user_updated_at,u.last_login_at user_last_login_at,p.username FROM sessions s JOIN users u ON u.id=s.user_id LEFT JOIN user_profiles p ON p.user_id=u.id WHERE s.token_hash=? AND s.expires_at>?`).get(tokenHash,nowIso());
  return row ? {tokenHash:row.token_hash,user:{id:row.user_id,email:row.email,displayName:row.display_name,username:row.username||"",role:row.role||"USER",accountTier:row.account_tier||"FREE",createdAt:row.user_created_at,updatedAt:row.user_updated_at,lastLoginAt:row.user_last_login_at||""},expiresAt:row.expires_at}:null;
}
export function deleteSession(tokenHash) { db.prepare(`DELETE FROM sessions WHERE token_hash=?`).run(tokenHash); }
export function deleteSessionsForUser(userId) { db.prepare(`DELETE FROM sessions WHERE user_id=?`).run(userId); }
export function getSubscription(userId) { const row=db.prepare(`SELECT * FROM subscriptions WHERE user_id=?`).get(userId); return row ? {subscriptionId:row.subscription_id||`sub-${userId}`,plan:row.plan,status:row.status,provider:row.provider||"",providerCustomerId:row.provider_customer_id||"",providerSubscriptionId:row.provider_subscription_id||"",priceCents:Number(row.price_cents||0),currency:row.currency||"BRL",billingInterval:row.billing_interval||"",startedAt:row.started_at||"",currentPeriodStart:row.current_period_start||"",currentPeriodEnd:row.current_period_end||"",cancelAtPeriodEnd:Boolean(row.cancel_at_period_end),cancelledAt:row.cancelled_at||"",updatedAt:row.updated_at}:{subscriptionId:`sub-${userId}`,plan:"FREE",status:"ACTIVE",priceCents:0,currency:"BRL",billingInterval:""}; }
