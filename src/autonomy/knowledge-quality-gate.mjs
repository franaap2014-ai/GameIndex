import { db } from "../database/connection.mjs";
import { fillerAudit } from "../core85/deterministic-intelligence.mjs";
import { normalizeEntityType, getCanonicalState } from "../entities/canonical-entity-service.mjs";
import { normalizeText } from "../knowledge/normalize.mjs";

const BAD=new Set(["REJECTED","OUTDATED","SUPERSEDED","NEEDS_REVIEW","UNVERIFIED"]);
const MIN_SCORE={
  GUIDE_TOPIC:.72,GUIDE:.72,TRANSFORMATION:.68,CHARACTER:.61,LOCATION:.62,STRUCTURE:.62,
  ITEM:.60,TOOL:.63,WEAPON:.62,MOB:.62,BOSS:.64,MECHANIC:.65,SYSTEM:.65,CURRENCY:.60,
  RESOURCE:.58,MATERIAL:.58,ABILITY:.62,POWER:.62,VEHICLE:.60,OTHER:.64
};
const PROCEDURAL=/\b(como|how|passo|step|precisa|requires?|requirement|obter|conseguir|unlock|ativar|activate|craft|fazer|encontrar|find|where|drop|derrotar|defeat|usar|use)\b/i;
const TRANSFORMATION=/\b(transform|transforma|forma|form|super|hyper|emerald|esmeralda|unlock|desbloq|ativar|activate|requisit|require)\b/i;
const LOCATION=/\b(onde|where|local|location|zona|zone|cidade|city|biome|bioma|found|encontr|access|acesso)\b/i;
const CHARACTER=/\b(personagem|character|papel|role|ability|habilidade|lore|hist[oó]ria|appears?|aparece)\b/i;

function parse(value,fallback=[]){try{return JSON.parse(value)||fallback;}catch{return fallback;}}
function rowsFor(entityId){
  return db.prepare(`SELECT k.id,k.summary,k.confidence,k.status,k.verified_at,k.topics_json,c.id claim_id,c.text claim_text,c.confidence claim_confidence,c.source_ids_json
    FROM knowledge k LEFT JOIN claims c ON c.knowledge_id=k.id
    WHERE k.entity_id=? AND k.status NOT IN ('REJECTED','OUTDATED','SUPERSEDED','NEEDS_REVIEW','UNVERIFIED')`).all(entityId);
}
function typeCoverage(type,text){const t=normalizeEntityType(type);if(t==="TRANSFORMATION")return TRANSFORMATION.test(text);if(t==="GUIDE_TOPIC")return PROCEDURAL.test(text);if(t==="LOCATION"||t==="STRUCTURE")return LOCATION.test(text);if(t==="CHARACTER"||t==="NPC"||t==="BOSS")return CHARACTER.test(text);return true;}
export function evaluateKnowledgeQuality({entityId,pageType="OTHER"}={}){
  if(!entityId)return {passed:false,score:0,threshold:.7,reasons:["ENTITY_REQUIRED"],missing:["entity"]};
  const entity=db.prepare(`SELECT * FROM entities WHERE id=?`).get(entityId);if(!entity)return {passed:false,score:0,threshold:.7,reasons:["ENTITY_NOT_FOUND"],missing:["entity"]};
  const canonical=getCanonicalState(entityId);const type=normalizeEntityType(canonical?.canonicalType||pageType||entity.type);
  const rows=rowsFor(entityId);const knowledgeIds=new Set(),claimIds=new Set(),sourceIds=new Set(),texts=[];let confidenceTotal=0,confidenceCount=0,verified=0,fillerCount=0;
  for(const row of rows){
    knowledgeIds.add(row.id);if(Number(row.confidence)>0){confidenceTotal+=Number(row.confidence);confidenceCount++;}if(row.verified_at)verified++;
    if(row.summary){texts.push(row.summary);if(fillerAudit([row.summary]).detected)fillerCount++;}
    if(row.claim_id&&row.claim_text&&!BAD.has(row.status)){claimIds.add(row.claim_id);texts.push(row.claim_text);for(const id of parse(row.source_ids_json,[]))if(id)sourceIds.add(id);if(fillerAudit([row.claim_text]).detected)fillerCount++;}
  }
  const usefulTexts=texts.filter(t=>t&&!fillerAudit([t]).detected);const avgConfidence=confidenceCount?confidenceTotal/confidenceCount:0;const coverageText=usefulTexts.join(" ");
  const typeSpecific=typeCoverage(type,coverageText);const entityName=normalizeText(entity.name);const entityMentions=usefulTexts.filter(t=>normalizeText(t).includes(entityName)).length;
  const specificity=Math.min(1,(entityMentions+Math.min(claimIds.size,8))/(Math.max(4,usefulTexts.length||1)));
  const sourceScore=Math.min(1,sourceIds.size/3);const claimScore=Math.min(1,claimIds.size/6);const knowledgeScore=Math.min(1,knowledgeIds.size/6);const verifiedScore=Math.min(1,verified/Math.max(1,knowledgeIds.size));
  let score=knowledgeScore*.20+claimScore*.22+avgConfidence*.25+sourceScore*.16+specificity*.10+verifiedScore*.07;
  if(!typeSpecific)score-=.12;if(fillerCount)score-=Math.min(.15,fillerCount*.025);score=Math.max(0,Math.min(1,score));
  const threshold=MIN_SCORE[type]??MIN_SCORE[String(pageType||"OTHER").toUpperCase()]??.64;
  const missing=[];if(knowledgeIds.size<2)missing.push("KNOWLEDGE");if(claimIds.size<2)missing.push("CLAIMS");if(sourceIds.size<1)missing.push("SOURCES");if(avgConfidence<.55)missing.push("CONFIDENCE");if(!typeSpecific)missing.push("TYPE_SPECIFIC_CONTENT");
  const reasons=[];if(score<threshold)reasons.push("INSUFFICIENT_KNOWLEDGE");if(fillerCount)reasons.push("GENERIC_FILLER_PRESENT");if(!typeSpecific)reasons.push("TYPE_REQUIREMENTS_NOT_MET");
  return {passed:score>=threshold&&missing.length<=1,score:Number(score.toFixed(3)),threshold,type,knowledgeCount:knowledgeIds.size,claimCount:claimIds.size,sourceCount:sourceIds.size,confidence:Number(avgConfidence.toFixed(3)),fillerCount,typeSpecific,missing,reasons};
}
