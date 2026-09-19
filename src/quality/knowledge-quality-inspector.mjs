import { db } from "../database/connection.mjs";
import { normalizeText } from "../knowledge/normalize.mjs";

const TEMPLATE_PATTERNS=[
  /\bis a player-relevant topic in\b/i,
  /\bfor a player studying\b/i,
  /\bshould be understood together with related\b/i,
  /\bthis entry focuses on\b/i,
  /\bit is intentionally scoped to\b/i
];
const DIRTY_SCRAPE=[/skip to main content/i,/expand navigation menu/i,/cookie settings/i,/accept all cookies/i,/pre-order now/i,/homepage/i,/sign in to continue/i];
const BAD_STATUS=new Set(["NEEDS_REVIEW","UNVERIFIED","REJECTED","OUTDATED","SUPERSEDED"]);
const TYPE_TAB_HINTS={
  MOB:new Set(["mobs","characters","overview","guides"]),BOSS:new Set(["mobs","bosses","characters","guides"]),NPC:new Set(["mobs","characters","npcs","guides"]),
  CHARACTER:new Set(["characters","overview","lore","guides"]),LOCATION:new Set(["maps","locations","guides","overview"]),STRUCTURE:new Set(["maps","locations","guides"]),
  ITEM:new Set(["items","guides","overview"]),TOOL:new Set(["items","guides"]),WEAPON:new Set(["items","weapons","guides"]),MECHANIC:new Set(["gameplay","mechanics","guides","overview"])
};
function templateScore(text=""){const matches=TEMPLATE_PATTERNS.filter(re=>re.test(text)).length;return Math.min(1,matches/2);}
function dirtyScore(text=""){return DIRTY_SCRAPE.filter(re=>re.test(text)).length;}
function infoClass(text=""){
  const t=String(text||"").trim(),tpl=templateScore(t);if(!t)return "PLACEHOLDER";if(tpl>=.5)return "TEMPLATE_HEAVY";
  const hasNumber=/\b(?:19|20)\d{2}\b|\b\d+(?:\.\d+)?\b/.test(t),hasRelation=/\b(desenvolv|publicad|lan[cç]ad|created|developed|published|released|localiz|found|drop|requer|requires|craft|fabric)\b/i.test(t);
  if(hasNumber||hasRelation)return "FACTUAL";if(t.length>=90)return "SEMI_FACTUAL";return "LOW_INFORMATION";
}
function rowIssue(row,duplicateCount=1){
  const issues=[],summary=String(row.summary||""),entityName=String(row.entity_name||""),type=String(row.entity_type||"").toUpperCase(),tab=String(row.tab_id||"").toLowerCase();
  const informationClass=infoClass(summary),tpl=templateScore(summary),dirty=dirtyScore(summary);
  if(tpl>=.5)issues.push("TEMPLATE_CONTENT");
  if(informationClass==="LOW_INFORMATION"||informationClass==="PLACEHOLDER")issues.push("LOW_FACTUAL_DENSITY");
  if(dirty)issues.push("DIRTY_SCRAPE");
  if(BAD_STATUS.has(String(row.status||"").toUpperCase())&&String(row.verified_at||"").trim())issues.push("VERIFICATION_STATUS_CONFLICT");
  if(entityName&&summary&&normalizeText(summary).includes(normalizeText(entityName))===false&&summary.length<260)issues.push("ENTITY_SUMMARY_WEAK_MATCH");
  const tabs=TYPE_TAB_HINTS[type];if(tabs&&tab&&!tabs.has(tab))issues.push("CATEGORY_TYPE_MISMATCH");
  if(duplicateCount>1)issues.push("DUPLICATE_SUMMARY");
  if(Number(row.confidence||0)<.5)issues.push("LOW_CONFIDENCE");
  return {knowledgeId:row.id,gameId:row.game_id,game:row.game_name||"",entityId:row.entity_id||"",entity:entityName,entityType:type,title:row.title,tabId:row.tab_id,sectionId:row.section_id,status:row.status,confidence:Number(row.confidence||0),informationClass,templateScore:tpl,dirtyScrapeHits:dirty,duplicateCount,issues};
}
export function inspectKnowledgeQuality({gameId="",limit=5000}={}){
  const n=Math.min(10000,Math.max(1,Number(limit)||5000));
  const rows=gameId?db.prepare(`SELECT k.*,g.name game_name,e.name entity_name,e.type entity_type FROM knowledge k JOIN games g ON g.id=k.game_id LEFT JOIN entities e ON e.id=k.entity_id WHERE k.game_id=? ORDER BY k.updated_at DESC LIMIT ?`).all(gameId,n):db.prepare(`SELECT k.*,g.name game_name,e.name entity_name,e.type entity_type FROM knowledge k JOIN games g ON g.id=k.game_id LEFT JOIN entities e ON e.id=k.entity_id ORDER BY k.updated_at DESC LIMIT ?`).all(n);
  const duplicateMap=new Map();for(const row of rows){const key=normalizeText(row.summary||"");if(key)duplicateMap.set(key,(duplicateMap.get(key)||0)+1);}
  const entries=rows.map(row=>rowIssue(row,duplicateMap.get(normalizeText(row.summary||""))||1));
  const issueCounts={};const classCounts={};for(const item of entries){classCounts[item.informationClass]=(classCounts[item.informationClass]||0)+1;for(const issue of item.issues)issueCounts[issue]=(issueCounts[issue]||0)+1;}
  const templateHeavy=classCounts.TEMPLATE_HEAVY||0,factual=classCounts.FACTUAL||0,usable=entries.filter(x=>!x.issues.includes("DIRTY_SCRAPE")&&!x.issues.includes("VERIFICATION_STATUS_CONFLICT")&&new Set(["FACTUAL","SEMI_FACTUAL"]).has(x.informationClass)).length;
  return {scope:{gameId:gameId||null,rows:entries.length,limit:n},health:{status:entries.length===0?"EMPTY":usable/entries.length>=.7?"HEALTHY":usable/entries.length>=.4?"DEGRADED":"POOR",usable,usableRatio:entries.length?usable/entries.length:0,factual,templateHeavy,templateDensity:entries.length?templateHeavy/entries.length:0},issueCounts,classCounts,entries:entries.filter(x=>x.issues.length).slice(0,500)};
}
