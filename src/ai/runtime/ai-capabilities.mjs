export const AI_CAPABILITIES=Object.freeze({
  DEXTER_ANSWER:"dexter.answer",
  RESEARCH_GAME:"research.game",
  UNIVERSE_ENRICH:"universe.enrich",
  UNIVERSE_REVIEW:"universe.review",
  CONTENT_REVIEW:"content.review",
  ENTITY_ENRICH:"entity.enrich",
  IMAGE_SEMANTIC_REVIEW:"image.semantic-review",
  QUERY_REFINEMENT:"query.refinement"
});

const TASK_TO_CAPABILITY=Object.freeze({
  PUBLIC_ANSWER:AI_CAPABILITIES.DEXTER_ANSWER,
  IMAGE_SEMANTIC_REVIEW:AI_CAPABILITIES.IMAGE_SEMANTIC_REVIEW,
  RESEARCH_SYNTHESIS:AI_CAPABILITIES.RESEARCH_GAME,
  CONTENT_SYNTHESIS:AI_CAPABILITIES.CONTENT_REVIEW,
  SEMANTIC_REVIEW:AI_CAPABILITIES.UNIVERSE_REVIEW,
  QUERY_REFINEMENT:AI_CAPABILITIES.QUERY_REFINEMENT
});

export function capabilityForTaskType(taskType="SEMANTIC_REVIEW"){
  return TASK_TO_CAPABILITY[String(taskType||"").toUpperCase()]||AI_CAPABILITIES.UNIVERSE_REVIEW;
}

export function isKnownAICapability(value){return Object.values(AI_CAPABILITIES).includes(String(value||""));}
