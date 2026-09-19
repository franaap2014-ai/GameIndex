import { db } from "../database/connection.mjs";

const INTENT_GAPS={
  WHERE_TO_FIND:["location_or_region","spawn_or_appearance_conditions","encounter_context"],
  HOW_TO_GET:["obtainment_method","requirements","location_or_source"],
  HOW_TO_OBTAIN:["obtainment_method","requirements","location_or_source"],
  HOW_TO_CRAFT:["recipe","ingredients_or_materials","crafting_station_or_conditions"],
  HOW_TO_UNLOCK_TRANSFORMATION:["unlock_method","requirements","quest_level_or_trigger"],
  HOW_TO_TRANSFORM:["activation_method","requirements","trigger_or_form_conditions"],
  WHAT_IT_DROPS:["loot_table","drop_conditions","drop_chance_or_reward_context"],
  WHAT_DROPS:["loot_table","drop_conditions","drop_chance_or_reward_context"],
  HOW_TO_DEFEAT:["strategy","weakness_or_counter","fight_requirements"],
  HOW_TO_USE:["usage_method","activation_or_controls","limitations"],
  REQUIREMENTS:["requirements","level_cost_or_prerequisites"],
  WHO_DEVELOPED:["developer_or_studio","source_attribution"],
  WHEN_RELEASED:["release_date_or_period","release_context"]
};
const TYPE_GAPS={
  MOB:["behavior","spawn_or_appearance_conditions"],BOSS:["encounter_location","fight_requirements"],NPC:["location_or_role"],
  ITEM:["obtainment_method","usage"],WEAPON:["obtainment_method","usage_or_stats"],TOOL:["obtainment_method","usage"],
  LOCATION:["location_context","access_method"],MAP:["location_context"],STRUCTURE:["location_context","access_method"],
  CHARACTER:["identity","role_or_context"],TRANSFORMATION:["unlock_method","requirements"],MECHANIC:["rules_or_trigger","player_effect"]
};
function unique(values){return [...new Set(values.filter(Boolean))];}
export function describeKnowledgeGap({game=null,entity=null,intent="",entityType="",quality=null,recovery=null,pageType=""}={}){
  const normalizedIntent=String(intent||"").toUpperCase(),type=String(entityType||entity?.type||pageType||"OTHER").toUpperCase(),missing=unique([...(INTENT_GAPS[normalizedIntent]||[]),...(TYPE_GAPS[type]||[]),...((quality?.missing||[]).map(x=>String(x).toLowerCase().replace(/\s+/g,"_")))]);
  const reason=String(recovery?.failureReason||quality?.errorCode||(!quality?.passed?"INSUFFICIENT_KNOWLEDGE":"KNOWLEDGE_GAP")||"KNOWLEDGE_GAP");
  const attempts=Array.isArray(recovery?.attempts)?recovery.attempts.length:0,bestAttempt=(recovery?.attempts||[]).slice().sort((a,b)=>(Number(b.acceptedCount||0)+Number(b.evidenceCount||0))-(Number(a.acceptedCount||0)+Number(a.evidenceCount||0)))[0]||null;
  let priority="P3";if(["WHO_DEVELOPED","WHEN_RELEASED","HOW_TO_GET","HOW_TO_OBTAIN","WHERE_TO_FIND","HOW_TO_CRAFT"].includes(normalizedIntent))priority="P2";if(reason==="ENTITY_TYPE_CONFLICT"||reason==="EVIDENCE_AVAILABLE_BUT_UNUSED")priority="P1";
  return {gameId:game?.id||null,gameName:game?.nome||game?.name||"",entityId:entity?.id||null,entityName:entity?.name||"",entityType:type,intent:normalizedIntent||"OTHER",pageType:String(pageType||type||"OTHER").toUpperCase(),reason,missing,priority,researchAttempts:attempts,bestAttempt:bestAttempt?{attemptNumber:bestAttempt.attemptNumber,status:bestAttempt.status,sourceCount:Number(bestAttempt.sourceCount||0),evidenceCount:Number(bestAttempt.evidenceCount||0),acceptedCount:Number(bestAttempt.acceptedCount||0),details:bestAttempt.details||{}}:null,nextAction:missing.length?`Research: ${missing.join(", ")}`:"Review available evidence and entity classification."};
}

export function listKnowledgeGaps({limit=100}={}){
  const n=Math.min(300,Math.max(1,Number(limit)||100));
  let rows=[];
  try{rows=db.prepare(`SELECT q.id,q.game_id,q.entity_id,q.page_type,q.priority,q.status,q.reason,q.knowledge_count,q.confidence,q.attempts,q.next_attempt_at,q.error_code,q.updated_at,g.name game_name,e.name entity_name,e.type entity_type,s.reason state_reason,s.last_failure,s.retry_count
    FROM autonomous_generation_queue q JOIN games g ON g.id=q.game_id LEFT JOIN entities e ON e.id=q.entity_id LEFT JOIN autogen_knowledge_states s ON s.candidate_id=q.id
    WHERE q.status IN ('WAITING_FOR_RESEARCH','RESEARCHING','WAITING_FOR_KNOWLEDGE','NEEDS_DEV_REVIEW')
    ORDER BY CASE q.priority WHEN 'CRITICAL' THEN 0 WHEN 'HIGH' THEN 1 WHEN 'NORMAL' THEN 2 ELSE 3 END,q.updated_at DESC LIMIT ?`).all(n);}catch{return [];}
  return rows.map(row=>{
    const raw=`${row.reason||""},${row.state_reason||""}`.split(",").map(x=>x.trim()).filter(Boolean),missing=unique(raw.filter(x=>!/research completed|canonical|knowledge|quality gate|entity type conflict/i.test(x)).map(x=>x.toLowerCase().replace(/\s+/g,"_")));
    const error=String(row.error_code||row.last_failure||"INSUFFICIENT_KNOWLEDGE");
    return {candidateId:row.id,gameId:row.game_id,gameName:row.game_name,entityId:row.entity_id,entityName:row.entity_name||"",entityType:row.entity_type||row.page_type,pageType:row.page_type,queueStatus:row.status,priority:error==="ENTITY_TYPE_CONFLICT"?"P1":row.priority==="HIGH"?"P2":"P3",reason:error,missing,knowledgeCount:Number(row.knowledge_count||0),confidence:Number(row.confidence||0),researchAttempts:Number(row.attempts||0),nextAttemptAt:row.next_attempt_at||"",nextAction:error==="ENTITY_TYPE_CONFLICT"?"DEV review canonical entity type":"Research missing factual coverage",updatedAt:row.updated_at};
  });
}
