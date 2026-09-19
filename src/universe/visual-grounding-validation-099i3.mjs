import { db, json, nowIso } from "../database/connection.mjs";
import { getGameById } from "../database/repositories/game-repository.mjs";
import { resolveIdentityProfile } from "../identity/experience-identity-service.mjs";
import { listUniverseStructure } from "./universe-structure-service.mjs";
import { listVisualAssets, visualAssetStats } from "../images/visual-asset-registry.mjs";
import { interactionLifecycleStats, validateInteractionTargets } from "../interactions/universe-interaction-service.mjs";
import { listContentMedia } from "../content/content-media-service.mjs";

const DENSITY_MIN={SPARSE:0,BALANCED:40,RICH:65,IMMERSIVE:80};
function tableExists(name){try{return Boolean(db.prepare(`SELECT 1 FROM sqlite_master WHERE type='table' AND name=?`).get(String(name||"")));}catch{return false;}}
function clamp(v,min=0,max=100){return Math.max(min,Math.min(max,Number(v)||0));}
function classify(score){return score>=95?"HIGHLY_GROUNDED":score>=80?"GROUNDED":score>=65?"ACCEPTABLE":score>=40?"INCOMPLETE":"FAILED";}
function sectionsOf(structure){return (structure?.pages||[]).flatMap(page=>[...(page.sections||[]),...(page.tabs||[]).flatMap(tab=>tab.sections||[])]);}
function revisionRow(revisionId){if(!revisionId||!tableExists("universe_revisions"))return null;try{return db.prepare(`SELECT id,build_id,status,revision_number FROM universe_revisions WHERE id=?`).get(String(revisionId));}catch{return null;}}
function scalar(sql,args=[]){try{return Number(db.prepare(sql).get(...args)?.count||0);}catch{return 0;}}

export function calculateVisualCoverage(entityGameId,{revisionId=null,structureStatus=null,language="pt-BR",persist=true}={}){
  const game=getGameById(String(entityGameId||""));if(!game)throw Object.assign(new Error("GAME_NOT_FOUND"),{code:"GAME_NOT_FOUND"});
  const identity=resolveIdentityProfile(game.id),requestedDensity=String(identity?.visualDensity||identity?.visualGrounding?.density||"RICH").toUpperCase();
  const effectiveStatus=structureStatus||((revisionId&&revisionRow(revisionId)?.status!=="PUBLISHED")?"DRAFT":"PUBLISHED");
  const structure=listUniverseStructure(game.id,{status:effectiveStatus,language,revisionId}),sections=sectionsOf(structure),assets=listVisualAssets(game.id,{limit:500}),approved=assets.filter(x=>x.approvalStatus==="APPROVED"),active=assets.filter(x=>!["ARCHIVED","REJECTED"].includes(x.approvalStatus));
  const primary=approved.filter(x=>["HERO","BACKGROUND","PRIMARY_SYMBOL","LOGO"].includes(x.semanticRole));
  const distributable=approved.filter(x=>!["HERO","LOGO"].includes(x.semanticRole));
  const explicitSections=new Set(approved.map(x=>x.sectionId).filter(Boolean));
  const groundedSections=Math.min(sections.length,explicitSections.size+Math.max(0,distributable.filter(x=>!x.sectionId).length));
  const heroCoverage=primary.length?100:0;
  const sectionCoverage=sections.length?clamp((groundedSections/sections.length)*100):approved.length?70:0;
  const families=new Set(approved.map(x=>x.visualFamily).filter(Boolean));
  const roles=new Set(approved.map(x=>x.semanticRole).filter(Boolean));
  const assetDiversity=approved.length?clamp((families.size*18)+(roles.size*9)):0;
  const exact=approved.filter(x=>!x.inheritedFromGameId||x.inheritedFromGameId===game.id).length;
  const gameSpecificity=approved.length?clamp((exact/approved.length)*100):0;
  const realAssetGrounding=approved.length?clamp((approved.length/Math.max(approved.length,active.length))*100):0;
  const legacyGenericIdentity=0; // I3 runtime never renders semantic motifs as artwork.
  const genericFallbackRatio=0;
  const lifecycle=interactionLifecycleStats(game.id),interactiveAssets=approved.filter(x=>x.semanticRole==="INTERACTIVE_OBJECT"||x.semanticMotif),publishedBindings=scalar(`SELECT COUNT(*) count FROM universe_interaction_bindings WHERE entity_game_id=? AND status='PUBLISHED' AND (element_key LIKE 'ASSET:%' OR element_key LIKE 'MOTIF:%')`,[game.id]);
  const interactiveVisualCoverage=interactiveAssets.length?clamp((Math.min(interactiveAssets.length,publishedBindings)/interactiveAssets.length)*100):(publishedBindings?70:0);
  let score=approved.length?clamp(heroCoverage*.18+sectionCoverage*.30+assetDiversity*.17+gameSpecificity*.16+realAssetGrounding*.15+interactiveVisualCoverage*.04):0;
  if(!primary.length&&["RICH","IMMERSIVE"].includes(requestedDensity))score=Math.min(score,39);
  const coverageClass=classify(score),blockers=[],warnings=[];
  if(!approved.length)blockers.push({code:"APPROVED_GAME_SOURCED_ASSETS_0",message:"No approved game-sourced visual assets are available."});
  if(!primary.length&&["RICH","IMMERSIVE"].includes(requestedDensity))blockers.push({code:"PRIMARY_GAME_ASSETS_0",message:`${requestedDensity} requires at least one approved primary game asset.`});
  const minimum=DENSITY_MIN[requestedDensity]??65;if(score<minimum)blockers.push({code:"VISUAL_COVERAGE_BELOW_DENSITY_MINIMUM",message:`Visual coverage ${Math.round(score)}% is below the ${requestedDensity} minimum ${minimum}%.`});
  if(families.size<2&&approved.length>1)warnings.push({code:"LOW_ASSET_FAMILY_DIVERSITY",message:"Approved visuals come from fewer than two visual families."});
  if(sections.length&&sectionCoverage<65)warnings.push({code:"LOW_MAJOR_SECTION_VISUAL_COVERAGE",message:"Major sections remain visually under-grounded."});
  if(approved.length>28)warnings.push({code:"HIGH_APPROVED_ASSET_COUNT",message:"Approved asset count is high; runtime must remain lazy."});
  const status=blockers.length?(approved.length?"INCOMPLETE":"FAILED"):(score>=80?"VALIDATED":"READY");
  const metrics={heroCoverage:Math.round(heroCoverage),sectionCoverage:Math.round(sectionCoverage),assetDiversity:Math.round(assetDiversity),gameSpecificity:Math.round(gameSpecificity),realAssetGrounding:Math.round(realAssetGrounding),genericFallbackRatio,interactiveVisualCoverage:Math.round(interactiveVisualCoverage),approvedAssets:approved.length,primaryAssets:primary.length,secondaryAssets:approved.filter(x=>["SECONDARY_SYMBOL","CHARACTER","LOCATION","ITEM","CREATURE","ENVIRONMENT_ELEMENT"].includes(x.semanticRole)).length,accentAssets:approved.filter(x=>["CARD_ACCENT","SECTION_ACCENT","DIVIDER","NAVIGATION_ACCENT","INTERACTIVE_OBJECT","UI_REFERENCE"].includes(x.semanticRole)).length,assetFamilies:families.size,majorSections:sections.length,majorSectionsGrounded:groundedSections,legacyGenericIdentity,interactionLifecycle:lifecycle};
  const result={entityGameId:game.id,revisionId:revisionId||null,requestedDensity,coverageScore:Math.round(score*10)/10,coverageClass,status,metrics,blockers,warnings,gameSourcedOnly:true,genericGeneratedIdentity:false,validatedAt:nowIso()};
  if(persist&&tableExists("visual_grounding_validation"))db.prepare(`INSERT INTO visual_grounding_validation(entity_game_id,revision_id,requested_density,coverage_score,coverage_class,status,metrics_json,blockers_json,warnings_json,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?) ON CONFLICT(entity_game_id) DO UPDATE SET revision_id=excluded.revision_id,requested_density=excluded.requested_density,coverage_score=excluded.coverage_score,coverage_class=excluded.coverage_class,status=excluded.status,metrics_json=excluded.metrics_json,blockers_json=excluded.blockers_json,warnings_json=excluded.warnings_json,updated_at=excluded.updated_at`).run(game.id,revisionId||null,requestedDensity,result.coverageScore,coverageClass,status,json(metrics),json(blockers),json(warnings),result.validatedAt);
  return result;
}

export function evaluateBuilderValidation(entityGameId,{revisionId=null,language="pt-BR",structureStatus=null,persist=true}={}){
  const game=getGameById(String(entityGameId||""));if(!game)throw Object.assign(new Error("GAME_NOT_FOUND"),{code:"GAME_NOT_FOUND"});
  const rev=revisionRow(revisionId),effectiveStructureStatus=structureStatus||((rev&&rev.status!=="PUBLISHED")?"DRAFT":"PUBLISHED"),structure=listUniverseStructure(game.id,{status:effectiveStructureStatus,language,revisionId}),pages=structure.pages||[],sections=sectionsOf(structure),pageKeys=pages.map(x=>x.canonicalKey),sectionKeys=sections.map(x=>x.canonicalKey);
  const acceptedSources=revisionId?scalar(`SELECT COUNT(*) count FROM universe_research_sources urs JOIN universe_revisions ur ON ur.build_id=urs.build_id WHERE ur.id=? AND urs.accepted=1`,[revisionId]):scalar(`SELECT COUNT(*) count FROM universe_research_sources WHERE entity_game_id=? AND accepted=1`,[game.id]);
  const discoveredSources=revisionId?scalar(`SELECT COUNT(*) count FROM universe_research_sources urs JOIN universe_revisions ur ON ur.build_id=urs.build_id WHERE ur.id=?`,[revisionId]):scalar(`SELECT COUNT(*) count FROM universe_research_sources WHERE entity_game_id=?`,[game.id]);
  const facts=revisionId?scalar(`SELECT COUNT(*) count FROM universe_facts WHERE entity_game_id=? AND revision_id=?`,[game.id,revisionId]):scalar(`SELECT COUNT(*) count FROM universe_facts WHERE entity_game_id=?`,[game.id]);
  const approvedMedia=listContentMedia(game.id,{status:"APPROVED",limit:200,revisionId}).length,visual=calculateVisualCoverage(game.id,{revisionId,structureStatus:effectiveStructureStatus,language,persist}),interactionLifecycle=interactionLifecycleStats(game.id),interactionValidation=validateInteractionTargets(game.id,{revisionId,pageKeys,sectionKeys,includeManual:true}),assetStats=visualAssetStats(game.id);
  const domains={
    STRUCTURE_STATUS:pages.length?"VALIDATED":"FAILED",
    RESEARCH_STATUS:facts>0&&acceptedSources>0?"VALIDATED":acceptedSources>0||discoveredSources>0?"PARTIAL":"INCOMPLETE",
    CONTENT_STATUS:sections.length&&facts>0?"READY":sections.length?"INCOMPLETE":"FAILED",
    MEDIA_STATUS:approvedMedia>0||assetStats.approved>0?"READY":assetStats.discovered||assetStats.reviewed?"PARTIAL":"INCOMPLETE",
    VISUAL_GROUNDING_STATUS:visual.status,
    INTERACTION_STATUS:!interactionValidation.valid?"FAILED":interactionLifecycle.totalPersisted?interactionLifecycle.validated||interactionLifecycle.published?"READY":"PARTIAL":"NOT_STARTED",
    PERFORMANCE_STATUS:assetStats.approved>28||assetStats.bytes>24*1024*1024?"PARTIAL":"READY",
    PUBLICATION_STATUS:"READY"
  };
  const blockers=[...visual.blockers];
  if(!pages.length)blockers.push({code:"STRUCTURE_MISSING",message:"No structured pages exist for the target revision."});
  if(!interactionValidation.valid)blockers.push(...interactionValidation.errors.map(x=>({code:x.code,message:`Interaction target ${x.targetId||x.id} is invalid.`})));
  if(game.entityType==="EXPERIENCE"&&!game.parentGameId)blockers.push({code:"EXPERIENCE_PARENT_MISSING",message:"Experience has no valid parent Game."});
  if(blockers.length)domains.PUBLICATION_STATUS="BLOCKED";
  const warnings=[...visual.warnings];if(!facts)warnings.push({code:"FACTS_VALIDATED_0",message:"No validated facts are available for this revision."});if(!approvedMedia&&!assetStats.approved)warnings.push({code:"MEDIA_APPROVED_0",message:"No approved media is available."});
  return {entityGameId:game.id,revisionId:revisionId||null,domains,research:{sourcesDiscovered:discoveredSources,sourcesAccepted:acceptedSources,factsValidated:facts,topicsSupported:scalar(`SELECT COUNT(*) count FROM universe_topics WHERE entity_game_id=?${revisionId?" AND revision_id=?":""}`,[game.id,...(revisionId?[revisionId]:[])])},content:{pages:pages.length,sections:sections.length},media:{approvedContentMedia:approvedMedia,visualAssets:assetStats},visual,interactions:{...interactionLifecycle,targetValidation:interactionValidation},blockers,warnings,publicationAllowed:blockers.length===0,validatedAt:nowIso()};
}

export function assertPublicationAllowedI3(entityGameId,options={}){const validation=evaluateBuilderValidation(entityGameId,options);if(!validation.publicationAllowed){const error=Object.assign(new Error("PUBLICATION_BLOCKED_I3"),{code:"PUBLICATION_BLOCKED_I3",validation});throw error;}return validation;}
