import { nowIso } from "../database/connection.mjs";
import { evaluateBuilderValidation } from "./visual-grounding-validation-099i3.mjs";
import { latestPreviewSnapshot, productionPipelineState, setBuilderStage } from "./universe-production-pipeline-099i4.mjs";

function issue(code,message,severity="BLOCKER",details={}){return {code,message,severity,details};}
function uniq(rows=[]){const seen=new Set();return rows.filter(x=>{const k=`${x.code}|${x.message}`;if(seen.has(k))return false;seen.add(k);return true;});}

export function evaluateBuilderValidationI4(entityGameId,{revisionId=null,language="pt-BR",structureStatus=null,persist=true}={}){
  const base=evaluateBuilderValidation(entityGameId,{revisionId,language,structureStatus,persist});
  const pipeline=productionPipelineState(entityGameId,{revisionId,language,structureStatus});
  const density=String(base.visual?.requestedDensity||"RICH").toUpperCase();
  const variables=pipeline?.images?.variables||[],required=variables.filter(v=>v.required),unresolvedRequired=required.filter(v=>v.status!=="RESOLVED"),resolved=variables.filter(v=>v.status==="RESOLVED"),gap=pipeline?.composition?.visualGap||{score:0,maxConsecutiveUngrounded:0,totalSections:0,groundedSections:0};
  const preview=latestPreviewSnapshot(entityGameId,{revisionId});
  const baseCoverage=Number(base.visual?.coverageScore||0);
  const bindingCoverage=required.length?resolved.filter(v=>v.required).length/required.length:(variables.length?resolved.length/variables.length:0);
  const sectionCoverage=gap.totalSections?Number(gap.groundedSections||0)/Number(gap.totalSections||1):0;
  // I4 coverage reflects the page that can actually render: approved real assets bound to content + grounded section composition.
  const visualScore=Math.max(0,Math.min(100,Math.round(baseCoverage*.30+bindingCoverage*100*.35+sectionCoverage*100*.35)));
  const richMinimum=density==="IMMERSIVE"?88:density==="RICH"?80:density==="BALANCED"?65:45;
  const blockers=[...(base.blockers||[])].filter(x=>x.code!=="VISUAL_COVERAGE_BELOW_DENSITY_MINIMUM");
  const warnings=[...(base.warnings||[])];
  if(!variables.length)blockers.push(issue("IMAGE_VARIABLES_MISSING","Research & Content produced no image variables for this revision."));
  if(unresolvedRequired.length)blockers.push(issue("REQUIRED_IMAGE_VARIABLES_UNRESOLVED",`${unresolvedRequired.length} required image variable(s) are unresolved.`,"BLOCKER",{variableIds:unresolvedRequired.map(v=>v.id)}));
  if(visualScore<richMinimum)blockers.push(issue("VISUAL_COVERAGE_BELOW_I4_TARGET",`Visual coverage ${Math.round(visualScore)}% is below the ${density} I4 target ${richMinimum}%.`));
  if(["RICH","IMMERSIVE"].includes(density)&&gap.totalSections&&gap.score<70)blockers.push(issue("VISUAL_GAP_TOO_HIGH",`Personalized composition still contains excessive visual dead zones (Visual Gap quality ${gap.score}%).`,"BLOCKER",{maxConsecutiveUngrounded:gap.maxConsecutiveUngrounded}));
  if(!pipeline?.composition?.count)blockers.push(issue("PAGE_COMPOSITION_MISSING","Personalized Page Composition 2.0 has not produced section composition records."));
  if(!preview)blockers.push(issue("PREVIEW_REQUIRED","Generate the Interactive Preview before publication."));
  else if(preview.status!=="READY"&&preview.status!=="PUBLISHED")blockers.push(issue("PREVIEW_STALE","The Interactive Preview is stale or failed and must be regenerated.","BLOCKER",{status:preview.status}));
  if(resolved.length&&new Set(resolved.map(v=>v.binding?.visualAssetId).filter(Boolean)).size<Math.min(3,resolved.length)&&resolved.length>=4)warnings.push(issue("LOW_RESOLVED_ASSET_DIVERSITY","Too many image variables resolve to the same small asset set.","WARNING"));
  const domains={
    STRUCTURE_STATUS:base.domains?.STRUCTURE_STATUS||"NOT_STARTED",
    RESEARCH_STATUS:base.domains?.RESEARCH_STATUS||"NOT_STARTED",
    CONTENT_STATUS:base.domains?.CONTENT_STATUS||"NOT_STARTED",
    IMAGES_STATUS:!Number(base.content?.pages)?"NOT_STARTED":!variables.length?"FAILED":unresolvedRequired.length?"PARTIAL":"READY",
    MEDIA_STATUS:base.domains?.MEDIA_STATUS||"NOT_STARTED",
    VISUAL_GROUNDING_STATUS:visualScore>=richMinimum&&!unresolvedRequired.length?"VALIDATED":base.visual?.status||"INCOMPLETE",
    INTERACTION_STATUS:base.domains?.INTERACTION_STATUS||"NOT_STARTED",
    PREVIEW_STATUS:!Number(base.content?.pages)?"NOT_STARTED":!preview?"NOT_STARTED":preview.status,
    PERFORMANCE_STATUS:base.domains?.PERFORMANCE_STATUS||"READY",
    PUBLICATION_STATUS:"READY"
  };
  if(blockers.length)domains.PUBLICATION_STATUS="BLOCKED";
  const stages={
    RESEARCH_CONTENT:{status:["VALIDATED","READY"].includes(domains.CONTENT_STATUS)?"READY":domains.CONTENT_STATUS,metrics:{sources:base.research?.sourcesDiscovered||0,facts:base.research?.factsValidated||0,pages:base.content?.pages||0,sections:base.content?.sections||0,imageVariables:variables.length}},
    IMAGES:{status:domains.IMAGES_STATUS,metrics:{total:variables.length,resolved:resolved.length,required:required.length,unresolvedRequired:unresolvedRequired.length}},
    COMPOSITION:{status:pipeline?.composition?.count?(gap.score>=70?"READY":"PARTIAL"):"INCOMPLETE",metrics:{records:pipeline?.composition?.count||0,visualGapScore:gap.score,maxConsecutiveUngrounded:gap.maxConsecutiveUngrounded}},
    PREVIEW:{status:domains.PREVIEW_STATUS,metrics:{snapshotId:preview?.id||null,visualGapScore:preview?.visualGapScore||0}},
    PUBLICATION:{status:domains.PUBLICATION_STATUS,metrics:{blockers:blockers.length,warnings:warnings.length}}
  };
  if(persist)for(const [stageKey,value] of Object.entries(stages))setBuilderStage(entityGameId,revisionId,stageKey,{...value,message:stageKey==="PUBLICATION"?(blockers.length?"Publication is blocked until I4 critical issues are resolved.":"I4 production pipeline is ready for explicit publication."):""});
  return {version:"0.99-I4",entityGameId,revisionId:revisionId||null,domains,research:base.research,content:base.content,images:{total:variables.length,required:required.length,resolved:resolved.length,unresolvedRequired:unresolvedRequired.length,variables},media:base.media,visual:{...base.visual,baseCoverageScore:baseCoverage,coverageScore:visualScore,bindingCoverage:Math.round(bindingCoverage*100),sectionCoverage:Math.round(sectionCoverage*100),i4Target:richMinimum,visualGap:gap},interactions:base.interactions,preview,composition:pipeline?.composition||{},stages,blockers:uniq(blockers),warnings:uniq(warnings),publicationAllowed:blockers.length===0,validatedAt:nowIso()};
}

export function assertPublicationAllowedI4(entityGameId,options={}){const validation=evaluateBuilderValidationI4(entityGameId,options);if(!validation.publicationAllowed)throw Object.assign(new Error("PUBLICATION_BLOCKED_I4"),{code:"PUBLICATION_BLOCKED_I4",validation});return validation;}

export function finalBuilderReportI4(entityGameId,options={}){const v=evaluateBuilderValidationI4(entityGameId,options),p=productionPipelineState(entityGameId,options);return {version:"0.99-I4",entity:p?.entity||null,summary:{research:v.domains.RESEARCH_STATUS,content:v.domains.CONTENT_STATUS,images:v.domains.IMAGES_STATUS,visual:v.domains.VISUAL_GROUNDING_STATUS,interactions:v.domains.INTERACTION_STATUS,preview:v.domains.PREVIEW_STATUS,performance:v.domains.PERFORMANCE_STATUS,publication:v.domains.PUBLICATION_STATUS},metrics:{facts:v.research?.factsValidated||0,pages:v.content?.pages||0,sections:v.content?.sections||0,imageVariables:v.images.total,imageVariablesResolved:v.images.resolved,visualCoverage:Number(v.visual?.coverageScore||0),visualGapQuality:Number(v.visual?.visualGap?.score||0),interactions:v.interactions?.totalPersisted||0},blockers:v.blockers,warnings:v.warnings,technical:{stages:p?.stages||[],previewId:v.preview?.id||null,revisionId:v.revisionId},generatedAt:nowIso()};}
