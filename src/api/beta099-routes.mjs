import {registeredSources,registerResearchSource} from '../research/registered-sources.mjs';
import { currentAuth } from "../auth/auth-service.mjs";
import { requireCapability, requireSameOriginMutation } from "../access/capability-service.mjs";
import { getGameById, getGameBySlug, listGames, listChildGameEntities, parentGameFor } from "../database/repositories/game-repository.mjs";
import { IDENTITY_VISUAL_DENSITIES, resolveIdentityProfile, setIdentityProfile, setVisualPolicy } from "../identity/experience-identity-service.mjs";
import { resolveTechnicalProfile, setTechnicalProfile } from "../content/technical-profile-service.mjs";
import { listUniverseStructure, publicEntityUniverse } from "../universe/universe-structure-service.mjs";
import { UB099_SCOPES, UB099_STAGES, universeBuilderContext, startFoundationBuild, getFoundationBuild, currentFoundationBuild, resumeFoundationBuild, foundationBuildPreview, requestFoundationBuildCancel, publishFoundationBuild } from "../universe/universe-builder-099.mjs";
import { UNIVERSE_RESEARCH_SOURCE_FAMILIES } from "../research/orchestrator.mjs";
import { UNIVERSE_ELEMENT_ROLES, UNIVERSE_INTERACTION_ACTIONS, UNIVERSE_INTERACTION_EVENTS, archiveUniverseInteraction, getUniverseInteraction, interactionBindingStats, interactionLifecycleStats, interactionPresetsForEntity, listUniverseInteractions, upsertUniverseInteraction } from "../interactions/universe-interaction-service.mjs";
import { VISUAL_ASSET_APPROVAL, VISUAL_ASSET_ROLES, VISUAL_ASSET_SOURCES, archiveVisualAsset, getVisualAsset, listVisualAssets, setVisualAssetApproval, syncExistingVisualAssets, upsertVisualAsset, visualAssetStats } from "../images/visual-asset-registry.mjs";
import { calculateVisualCoverage } from "../universe/visual-grounding-validation-099i3.mjs";
import { evaluateBuilderValidationI4, finalBuilderReportI4 } from "../universe/validation-099i4.mjs";
import { evaluateBuilderValidationI5, finalBuilderReportI5 } from "../universe/validation-099i5.mjs";
import { I4_COMPOSITION_LAYOUTS, I4_IMAGE_VARIABLE_STATES, I4_PREVIEW_MODES, generatePreviewSnapshot, productionPipelineState } from "../universe/universe-production-pipeline-099i4.mjs";
import { I5_COMPOSITION_LAYOUTS, I5_IMAGE_VARIABLE_STATES, I5_PREVIEW_MODES, assignImageVariableI5, autoFixUniverseI5, generatePreviewSnapshotI5, listImageVariablesI5, markPreviewStale, productionPipelineStateI5, resolveImageVariablesI5, syncImageVariablesI5, syncPageCompositionsI5, updatePageComposition } from "../universe/universe-production-pipeline-099i5.mjs";
import { PUBLIC_VERSION, PUBLIC_VERSION_LABEL, INTERNAL_RELEASE, INTERNAL_RELEASE_CODE } from "../config/release-099i6.mjs";
import { publicUniverseEnhancementsI6, universeBuilderExperienceStateI6 } from "../universe/universe-builder-experience-099i6.mjs";
import { resolveImage3 } from "../images/image-engine3.mjs";
import { creativeDirectorReview } from "../universe/creative-director-099i3.mjs";

function gameFrom(value){ return getGameById(String(value||"")) || getGameBySlug(String(value||"")); }
function actor(req){ return currentAuth(req)?.user?.id || null; }
function noStore(res){ res.setHeader("Cache-Control","no-store"); return res; }
function publicCache(res){ res.setHeader("Cache-Control","public, max-age=30, stale-while-revalidate=90"); return res; }
function fail(res,status,code,message){ return res.status(status).json({ok:false,error:{code,message}}); }
function language(req){ const value=String(req.query.lang||req.query.language||"pt-BR"); return ["pt-BR","en-US","es-ES"].includes(value)?value:"pt-BR"; }
function assertPublishedInteractionTarget(game,payload,lang="pt-BR"){
  if(String(payload?.status||"DRAFT").toUpperCase()!=="PUBLISHED")return;
  const type=String(payload?.targetType||payload?.target_type||"NONE").toUpperCase(),target=String(payload?.targetId||payload?.target_id||"").toUpperCase();
  if(!target||!["PAGE","SECTION"].includes(type))return;
  const structure=listUniverseStructure(game.id,{status:"PUBLISHED",language:lang}),pages=structure?.pages||[];
  if(type==="PAGE"&&!pages.some(p=>String(p.canonicalKey||"").toUpperCase()===target))throw Object.assign(new Error("TARGET_PAGE_NOT_FOUND"),{code:"TARGET_PAGE_NOT_FOUND"});
  if(type==="SECTION"){const sections=pages.flatMap(p=>[...(p.sections||[]),...(p.tabs||[]).flatMap(t=>t.sections||[])]);if(!sections.some(x=>String(x.canonicalKey||"").toUpperCase()===target))throw Object.assign(new Error("TARGET_SECTION_NOT_FOUND"),{code:"TARGET_SECTION_NOT_FOUND"});}
}

export function registerBeta099Routes(app){
  app.get('/api/universe-builder-099/games/:game/research-sources',requireCapability('universe_build'),(req,res)=>{const game=gameFrom(req.params.game);if(!game)return fail(res,404,'GAME_NOT_FOUND','Jogo não encontrado.');res.json({ok:true,entries:registeredSources(game.id)});});
  app.post('/api/universe-builder-099/games/:game/research-sources',requireCapability('universe_build'),requireSameOriginMutation,async(req,res)=>{const game=gameFrom(req.params.game);if(!game)return fail(res,404,'GAME_NOT_FOUND','Jogo não encontrado.');try{res.json({ok:true,entries:await registerResearchSource(game.id,req.body?.url)});}catch{fail(res,400,'SOURCE_INVALID','Não foi possível aceitar esse endereço. Use uma página HTTPS pública da wiki do jogo.');}});

  app.get("/api/beta099/foundation",(req,res)=>publicCache(res).json({
    ok:true,
    version:PUBLIC_VERSION,
    publicLabel:PUBLIC_VERSION_LABEL,
    internalRelease:INTERNAL_RELEASE,
    release:INTERNAL_RELEASE_CODE,
    entityTypes:["GAME","EXPERIENCE"],
    researchSources:[...UNIVERSE_RESEARCH_SOURCE_FAMILIES],
    wikipedia:false,
    noApiKey:true,
    scopes:[...UB099_SCOPES],
    stages:[...UB099_STAGES],
    builderClassification:"UNIVERSE_BUILDER_EXPERIENCE_4_0_I6",
    pipeline:["RESEARCH_CONTENT_ENGINE_2_0","SEMANTIC_GAME_SOURCED_IMAGE_ENGINE_2_0","INTERACTIVE_PREVIEW_ENGINE"],
    visualGroundingEngine:"PERSONALIZED_PAGE_COMPOSITION_2_1",
    visualDensities:[...IDENTITY_VISUAL_DENSITIES],
    visualAssetContract:{roles:[...VISUAL_ASSET_ROLES],sources:[...VISUAL_ASSET_SOURCES],approval:[...VISUAL_ASSET_APPROVAL],genericGeneratedIdentityAllowed:false},
    interactionContract:{events:[...UNIVERSE_INTERACTION_EVENTS],actions:[...UNIVERSE_INTERACTION_ACTIONS],roles:[...UNIVERSE_ELEMENT_ROLES]},
    i5Contract:{imageVariableStates:[...I5_IMAGE_VARIABLE_STATES],previewModes:[...I5_PREVIEW_MODES],compositionLayouts:[...I5_COMPOSITION_LAYOUTS],simpleModeDefault:true,advancedModeLazy:true,autoFix:true,publishPosition:"TOP",reportPosition:"BOTTOM"},
    i6Contract:{visualIdentityMotifs:true,interactionDiscovery:true,interactivePreview:true,rebuild:true,authorizationInbox:true,multiPassEnhancement:true,buildStateConsistency:true},
  }));

  app.get("/api/games/:game/universe-099",(req,res)=>{
    const game=gameFrom(req.params.game); if(!game||game.status!=="PUBLISHED") return fail(res,404,"GAME_NOT_FOUND","Jogo não encontrado.");
    const lang=language(req),universe=publicEntityUniverse(game.id,{language:lang});
    if(universe?.revision?.id){
      try{universe.i5=productionPipelineStateI5(game.id,{revisionId:universe.revision.id,language:lang,structureStatus:"PUBLISHED"});}catch{universe.i5=null;}
    }
    try{universe.i6=publicUniverseEnhancementsI6(game.id,{revisionId:universe?.revision?.id||null,language:lang});}catch{universe.i6={visualIdentityMotifs:[],interactiveExperiences:[]};}
    universe.runtimeVersion=PUBLIC_VERSION;
    return publicCache(res).json({ok:true,universe});
  });
  app.get("/api/games/:game/identity-099",(req,res)=>{
    const game=gameFrom(req.params.game); if(!game||game.status!=="PUBLISHED") return fail(res,404,"GAME_NOT_FOUND","Jogo não encontrado.");
    return publicCache(res).json({ok:true,identity:resolveIdentityProfile(game.id)});
  });
  app.get("/api/games/:game/technical-099",(req,res)=>{
    const game=gameFrom(req.params.game); if(!game||game.status!=="PUBLISHED") return fail(res,404,"GAME_NOT_FOUND","Jogo não encontrado.");
    return publicCache(res).json({ok:true,technical:resolveTechnicalProfile(game.id)});
  });
  app.get("/api/games/:game/experiences-099",(req,res)=>{
    const game=gameFrom(req.params.game); if(!game||game.status!=="PUBLISHED") return fail(res,404,"GAME_NOT_FOUND","Jogo não encontrado.");
    const entries=listChildGameEntities(game.id,{includeDrafts:false,limit:100}).map((child)=>({id:child.id,slug:child.slug,name:child.nome,entityType:child.entityType,parentGameId:child.parentGameId,url:`/game/${encodeURIComponent(game.slug)}/${encodeURIComponent(child.slug)}`,identity:resolveIdentityProfile(child.id)}));
    return publicCache(res).json({ok:true,parent:{id:game.id,slug:game.slug,name:game.nome},label:"Experiences",entries});
  });

  app.get("/api/universe-builder-099/entities",requireCapability("universe_build"),(req,res)=>{
    const q=String(req.query.q||"").trim().toLowerCase();
    const entries=listGames({includeDrafts:true}).filter((game)=>game.visibility!=="HIDDEN").filter((game)=>!q||game.nome.toLowerCase().includes(q)||game.slug.includes(q)).map((game)=>{
      const parent=parentGameFor(game),entityType=String(game.entityType||"GAME").toUpperCase();
      return {id:game.id,slug:game.slug,name:game.nome,status:game.status,entityType,parent:parent?{id:parent.id,slug:parent.slug,name:parent.nome}:null,contextLabel:entityType==="EXPERIENCE"?`${game.nome} — Experience · ${parent?.nome||"Parent game"}`:game.nome};
    }).sort((a,b)=>a.entityType.localeCompare(b.entityType)||a.name.localeCompare(b.name));
    const counts={games:entries.filter(x=>x.entityType==="GAME").length,experiences:entries.filter(x=>x.entityType==="EXPERIENCE").length};
    return noStore(res).json({ok:true,selectorReady:entries.length>0,entries,counts,sourceFamilies:[...UNIVERSE_RESEARCH_SOURCE_FAMILIES],scopes:[...UB099_SCOPES]});
  });
  app.get("/api/universe-builder-099/games/:game/context",requireCapability("universe_build"),(req,res)=>{
    const game=gameFrom(req.params.game); if(!game) return fail(res,404,"GAME_NOT_FOUND","Jogo não encontrado.");
    return noStore(res).json({ok:true,context:universeBuilderContext(game)});
  });
  app.get("/api/universe-builder-099/games/:game/editor",requireCapability("universe_build"),(req,res)=>{
    const game=gameFrom(req.params.game); if(!game) return fail(res,404,"GAME_NOT_FOUND","Jogo não encontrado.");
    const revisionId=req.query.revisionId||null,structureStatus=revisionId?"DRAFT":"PUBLISHED",identity=resolveIdentityProfile(game.id),structure=listUniverseStructure(game.id,{status:structureStatus,language:language(req),revisionId}),interactionBindings=listUniverseInteractions(game.id,{status:null,revisionId,includeManual:true}).filter(x=>x.status!=="ARCHIVED"),presets=interactionPresetsForEntity(game.id),visualAssets=listVisualAssets(game.id,{limit:200}),assetStats=visualAssetStats(game.id),pipeline=productionPipelineStateI5(game.id,{revisionId,language:language(req),structureStatus}),validation=evaluateBuilderValidationI5(game.id,{revisionId,language:language(req),structureStatus,persist:true}),report=finalBuilderReportI5(game.id,{revisionId,language:language(req),structureStatus});
    return noStore(res).json({ok:true,version:INTERNAL_RELEASE,publicVersion:PUBLIC_VERSION,classification:"UNIVERSE_BUILDER_EXPERIENCE_4_0_I6",i6:universeBuilderExperienceStateI6(game.id,{revisionId,language:language(req)}),legacyClassification:"INTELLIGENT_PRODUCTION_CONSOLIDATION_I5",pipelineEngines:["RESEARCH_CONTENT_ENGINE_2_0","SEMANTIC_GAME_SOURCED_IMAGE_ENGINE_2_0","INTERACTIVE_PREVIEW_ENGINE"],visualGroundingEngine:"PERSONALIZED_PAGE_COMPOSITION_2_1",identity,structure,interactionBindings,presets,stats:interactionBindingStats(game.id),interactionLifecycle:interactionLifecycleStats(game.id),visualAssets,visualAssetStats:assetStats,pipeline,validation,report,contracts:{visualDensities:[...IDENTITY_VISUAL_DENSITIES],events:[...UNIVERSE_INTERACTION_EVENTS],actions:[...UNIVERSE_INTERACTION_ACTIONS],roles:[...UNIVERSE_ELEMENT_ROLES],visualAssetRoles:[...VISUAL_ASSET_ROLES],visualAssetSources:[...VISUAL_ASSET_SOURCES],visualAssetApproval:[...VISUAL_ASSET_APPROVAL],imageVariableStates:[...I5_IMAGE_VARIABLE_STATES],previewModes:[...I5_PREVIEW_MODES],compositionLayouts:[...I5_COMPOSITION_LAYOUTS]},performanceBudget:{defaultDensity:"RICH",adaptivePerformance:true,maxAnimatedMotifs:Number(identity?.visualPolicy?.maxAnimatedMotifs??4),firstLoadPriority:"ESSENTIALS_FIRST"}});
  });
  app.get("/api/universe-builder-099/games/:game/visual-assets",requireCapability("universe_build"),(req,res)=>{const game=gameFrom(req.params.game);if(!game)return fail(res,404,"GAME_NOT_FOUND","Jogo não encontrado.");return noStore(res).json({ok:true,entries:listVisualAssets(game.id,{limit:req.query.limit||200}),stats:visualAssetStats(game.id),coverage:calculateVisualCoverage(game.id,{language:language(req),structureStatus:"PUBLISHED",persist:true})});});
  app.post("/api/universe-builder-099/games/:game/visual-assets/sync",requireSameOriginMutation,requireCapability("universe_build"),(req,res)=>{const game=gameFrom(req.params.game);if(!game)return fail(res,404,"GAME_NOT_FOUND","Jogo não encontrado.");try{const result=syncExistingVisualAssets(game.id,{revisionId:req.body?.revisionId||null,createdBy:actor(req)});return noStore(res).json({ok:true,...result,coverage:calculateVisualCoverage(game.id,{revisionId:req.body?.revisionId||null,language:req.body?.language||language(req),structureStatus:req.body?.revisionId?"DRAFT":"PUBLISHED",persist:true})});}catch(error){return fail(res,400,String(error.code||error.message||"VISUAL_ASSET_SYNC_FAILED"),"Não foi possível sincronizar os assets visuais reais.");}});
  app.post("/api/universe-builder-099/games/:game/visual-assets",requireSameOriginMutation,requireCapability("universe_build"),(req,res)=>{const game=gameFrom(req.params.game);if(!game)return fail(res,404,"GAME_NOT_FOUND","Jogo não encontrado.");try{const asset=upsertVisualAsset({entityGameId:game.id,createdBy:actor(req),...req.body});markPreviewStale(game.id,req.body?.revisionId||null,"Visual asset registry changed.");return noStore(res).status(201).json({ok:true,asset,coverage:calculateVisualCoverage(game.id,{revisionId:req.body?.revisionId||null,language:language(req),structureStatus:req.body?.revisionId?"DRAFT":"PUBLISHED",persist:true})});}catch(error){return fail(res,400,String(error.code||error.message||"VISUAL_ASSET_INVALID"),"Asset visual inválido.");}});
  app.put("/api/universe-builder-099/games/:game/visual-assets/:asset",requireSameOriginMutation,requireCapability("universe_build"),(req,res)=>{const game=gameFrom(req.params.game);if(!game)return fail(res,404,"GAME_NOT_FOUND","Jogo não encontrado.");const current=getVisualAsset(req.params.asset);if(!current||current.entityGameId!==game.id)return fail(res,404,"VISUAL_ASSET_NOT_FOUND","Asset visual não encontrado.");try{const asset=upsertVisualAsset({id:current.id,entityGameId:game.id,createdBy:current.createdBy||actor(req),...current,...req.body});markPreviewStale(game.id,req.body?.revisionId||current.revisionId||null,"Visual asset metadata changed.");return noStore(res).json({ok:true,asset});}catch(error){return fail(res,400,String(error.code||error.message||"VISUAL_ASSET_INVALID"),"Asset visual inválido.");}});
  app.post("/api/universe-builder-099/games/:game/visual-assets/:asset/approval",requireSameOriginMutation,requireCapability("universe_build"),(req,res)=>{const game=gameFrom(req.params.game);if(!game)return fail(res,404,"GAME_NOT_FOUND","Jogo não encontrado.");const current=getVisualAsset(req.params.asset);if(!current||current.entityGameId!==game.id)return fail(res,404,"VISUAL_ASSET_NOT_FOUND","Asset visual não encontrado.");try{const status=String(req.body?.approvalStatus||req.body?.status||"").toUpperCase(),asset=status==="ARCHIVED"?archiveVisualAsset(current.id,actor(req)):setVisualAssetApproval(current.id,status,{userId:actor(req)});markPreviewStale(game.id,req.body?.revisionId||null,"Visual asset approval changed.");return noStore(res).json({ok:true,asset,coverage:calculateVisualCoverage(game.id,{language:language(req),structureStatus:"PUBLISHED",persist:true})});}catch(error){return fail(res,400,String(error.code||error.message||"VISUAL_ASSET_APPROVAL_INVALID"),"Estado de aprovação visual inválido.");}});
  app.get("/api/universe-builder-099/games/:game/validation-099i3",requireCapability("universe_build"),(req,res)=>{const game=gameFrom(req.params.game);if(!game)return fail(res,404,"GAME_NOT_FOUND","Jogo não encontrado.");return noStore(res).json({ok:true,validation:evaluateBuilderValidationI4(game.id,{revisionId:req.query.revisionId||null,language:language(req),structureStatus:req.query.revisionId?"DRAFT":"PUBLISHED",persist:true})});});
  app.get("/api/universe-builder-099/games/:game/validation-099i4",requireCapability("universe_build"),(req,res)=>{const game=gameFrom(req.params.game);if(!game)return fail(res,404,"GAME_NOT_FOUND","Jogo não encontrado.");const revisionId=req.query.revisionId||null;return noStore(res).json({ok:true,validation:evaluateBuilderValidationI4(game.id,{revisionId,language:language(req),structureStatus:revisionId?"DRAFT":"PUBLISHED",persist:true}),report:finalBuilderReportI4(game.id,{revisionId,language:language(req),structureStatus:revisionId?"DRAFT":"PUBLISHED"})});});
  app.get("/api/universe-builder-099/games/:game/pipeline-099i4",requireCapability("universe_build"),(req,res)=>{const game=gameFrom(req.params.game);if(!game)return fail(res,404,"GAME_NOT_FOUND","Jogo não encontrado.");const revisionId=req.query.revisionId||null;return noStore(res).json({ok:true,pipeline:productionPipelineState(game.id,{revisionId,language:language(req),structureStatus:revisionId?"DRAFT":"PUBLISHED"}),report:finalBuilderReportI4(game.id,{revisionId,language:language(req),structureStatus:revisionId?"DRAFT":"PUBLISHED"})});});
  app.get("/api/universe-builder-099/games/:game/validation-099i5",requireCapability("universe_build"),(req,res)=>{const game=gameFrom(req.params.game);if(!game)return fail(res,404,"GAME_NOT_FOUND","Jogo não encontrado.");const revisionId=req.query.revisionId||null;return noStore(res).json({ok:true,validation:evaluateBuilderValidationI5(game.id,{revisionId,language:language(req),structureStatus:revisionId?"DRAFT":"PUBLISHED",persist:true}),report:finalBuilderReportI5(game.id,{revisionId,language:language(req),structureStatus:revisionId?"DRAFT":"PUBLISHED"})});});
  app.get("/api/universe-builder-099/games/:game/pipeline-099i5",requireCapability("universe_build"),(req,res)=>{const game=gameFrom(req.params.game);if(!game)return fail(res,404,"GAME_NOT_FOUND","Jogo não encontrado.");const revisionId=req.query.revisionId||null;return noStore(res).json({ok:true,pipeline:productionPipelineStateI5(game.id,{revisionId,language:language(req),structureStatus:revisionId?"DRAFT":"PUBLISHED"}),report:finalBuilderReportI5(game.id,{revisionId,language:language(req),structureStatus:revisionId?"DRAFT":"PUBLISHED"})});});
  app.post("/api/universe-builder-099/games/:game/auto-fix-099i5",requireSameOriginMutation,requireCapability("universe_build"),(req,res)=>{const game=gameFrom(req.params.game);if(!game)return fail(res,404,"GAME_NOT_FOUND","Jogo não encontrado.");try{const revisionId=req.body?.revisionId||null,result=autoFixUniverseI5(game.id,{revisionId,userId:actor(req),language:req.body?.language||language(req),structureStatus:revisionId?"DRAFT":"PUBLISHED",buildId:req.body?.buildId||null}),validation=evaluateBuilderValidationI5(game.id,{revisionId,language:req.body?.language||language(req),structureStatus:revisionId?"DRAFT":"PUBLISHED",persist:true});return noStore(res).json({ok:true,result,validation,report:finalBuilderReportI5(game.id,{revisionId,language:req.body?.language||language(req),structureStatus:revisionId?"DRAFT":"PUBLISHED"})});}catch(error){return fail(res,400,String(error.code||error.message||"AUTO_FIX_FAILED"),"A correção automática preservou os dados existentes, mas não conseguiu resolver todos os problemas.");}});
  app.post("/api/universe-builder-099/games/:game/image-variables/sync",requireSameOriginMutation,requireCapability("universe_build"),(req,res)=>{const game=gameFrom(req.params.game);if(!game)return fail(res,404,"GAME_NOT_FOUND","Jogo não encontrado.");try{const revisionId=req.body?.revisionId||null,variables=syncImageVariablesI5(game.id,{revisionId,language:req.body?.language||language(req),structureStatus:revisionId?"DRAFT":"PUBLISHED"}),resolution=resolveImageVariablesI5(game.id,{revisionId,userId:actor(req)}),compositions=syncPageCompositionsI5(game.id,{revisionId,language:req.body?.language||language(req),structureStatus:revisionId?"DRAFT":"PUBLISHED"});markPreviewStale(game.id,revisionId,"Research/content image-variable contract changed.");return noStore(res).json({ok:true,variables:resolution.variables,compositions});}catch(error){return fail(res,400,String(error.code||error.message||"IMAGE_VARIABLE_SYNC_FAILED"),"Não foi possível sincronizar as variáveis de imagem.");}});
  app.post("/api/universe-builder-099/games/:game/image-variables/:variable/search",requireSameOriginMutation,requireCapability("universe_build"),async(req,res)=>{const game=gameFrom(req.params.game);if(!game)return fail(res,404,"GAME_NOT_FOUND","Jogo não encontrado.");try{await resolveImage3({game,role:"ARTWORK",language:req.body?.language||language(req),forceDiscovery:true});syncExistingVisualAssets(game.id,{revisionId:req.body?.revisionId||null,createdBy:actor(req)});const variables=listImageVariablesI5(game.id,{revisionId:req.body?.revisionId||null}),variable=variables.find(v=>v.id===req.params.variable);if(!variable)return fail(res,404,"IMAGE_VARIABLE_NOT_FOUND","Variável de imagem não encontrada.");return noStore(res).json({ok:true,variable});}catch(error){return fail(res,400,String(error.code||error.message||"IMAGE_SEARCH_FAILED"),"A busca visual não encontrou um candidato utilizável.");}});
  app.post("/api/universe-builder-099/games/:game/image-variables/:variable/assign",requireSameOriginMutation,requireCapability("universe_build"),(req,res)=>{const game=gameFrom(req.params.game);if(!game)return fail(res,404,"GAME_NOT_FOUND","Jogo não encontrado.");try{const variable=assignImageVariableI5(req.params.variable,req.body?.visualAssetId,{userId:actor(req),manualOverride:Boolean(req.body?.manualOverride)}),revisionId=variable?.revisionId||req.body?.revisionId||null;syncPageCompositionsI5(game.id,{revisionId,language:req.body?.language||language(req),structureStatus:revisionId?"DRAFT":"PUBLISHED"});return noStore(res).json({ok:true,variable,pipeline:productionPipelineStateI5(game.id,{revisionId,language:req.body?.language||language(req),structureStatus:revisionId?"DRAFT":"PUBLISHED"})});}catch(error){return fail(res,400,String(error.code||error.message||"IMAGE_ASSIGN_FAILED"),"A imagem precisa estar aprovada, pertencer à entidade e combinar com a necessidade visual da seção.");}});
  app.put("/api/universe-builder-099/games/:game/compositions/:composition",requireSameOriginMutation,requireCapability("universe_build"),(req,res)=>{const game=gameFrom(req.params.game);if(!game)return fail(res,404,"GAME_NOT_FOUND","Jogo não encontrado.");try{const composition=updatePageComposition(req.params.composition,req.body||{});if(composition.entityGameId!==game.id)return fail(res,404,"COMPOSITION_NOT_FOUND","Composição não encontrada.");return noStore(res).json({ok:true,composition});}catch(error){return fail(res,400,String(error.code||error.message||"COMPOSITION_INVALID"),"Composição inválida.");}});
  app.post("/api/universe-builder-099/games/:game/preview-099i4",requireSameOriginMutation,requireCapability("universe_build"),(req,res)=>{const game=gameFrom(req.params.game);if(!game)return fail(res,404,"GAME_NOT_FOUND","Jogo não encontrado.");try{const revisionId=req.body?.revisionId||null,snapshot=generatePreviewSnapshot(game.id,{revisionId,buildId:req.body?.buildId||null,language:req.body?.language||language(req),viewportMode:req.body?.viewportMode||"DESKTOP",structureStatus:revisionId?"DRAFT":"PUBLISHED"}),validation=evaluateBuilderValidationI4(game.id,{revisionId,language:req.body?.language||language(req),structureStatus:revisionId?"DRAFT":"PUBLISHED",persist:true});return noStore(res).json({ok:true,snapshot,validation,report:finalBuilderReportI4(game.id,{revisionId,language:req.body?.language||language(req),structureStatus:revisionId?"DRAFT":"PUBLISHED"})});}catch(error){return fail(res,400,String(error.code||error.message||"PREVIEW_FAILED"),"Não foi possível gerar o Interactive Preview.");}});
  app.post("/api/universe-builder-099/games/:game/preview-099i5",requireSameOriginMutation,requireCapability("universe_build"),(req,res)=>{const game=gameFrom(req.params.game);if(!game)return fail(res,404,"GAME_NOT_FOUND","Jogo não encontrado.");try{const revisionId=req.body?.revisionId||null,snapshot=generatePreviewSnapshotI5(game.id,{revisionId,buildId:req.body?.buildId||null,language:req.body?.language||language(req),viewportMode:req.body?.viewportMode||"DESKTOP",structureStatus:revisionId?"DRAFT":"PUBLISHED"}),validation=evaluateBuilderValidationI5(game.id,{revisionId,language:req.body?.language||language(req),structureStatus:revisionId?"DRAFT":"PUBLISHED",persist:true});return noStore(res).json({ok:true,snapshot,validation,report:finalBuilderReportI5(game.id,{revisionId,language:req.body?.language||language(req),structureStatus:revisionId?"DRAFT":"PUBLISHED"})});}catch(error){return fail(res,400,String(error.code||error.message||"PREVIEW_FAILED"),"Não foi possível atualizar a Preview.");}});

  app.put("/api/universe-builder-099/games/:game/visual-policy",requireSameOriginMutation,requireCapability("universe_build"),(req,res)=>{
    const game=gameFrom(req.params.game); if(!game) return fail(res,404,"GAME_NOT_FOUND","Jogo não encontrado.");
    try{const identity=setVisualPolicy(game.id,{visualDensity:req.body?.visualDensity,visualPolicy:req.body?.visualPolicy},actor(req));markPreviewStale(game.id,req.body?.revisionId||null,"Visual density/policy changed.");return noStore(res).json({ok:true,identity});}
    catch(error){return fail(res,400,String(error.code||error.message||"VISUAL_POLICY_INVALID"),"Política visual inválida.");}
  });
  app.post("/api/universe-builder-099/games/:game/interactions",requireSameOriginMutation,requireCapability("universe_build"),(req,res)=>{
    const game=gameFrom(req.params.game); if(!game) return fail(res,404,"GAME_NOT_FOUND","Jogo não encontrado.");
    try{assertPublishedInteractionTarget(game,req.body,language(req));const interaction=upsertUniverseInteraction({entityGameId:game.id,createdBy:actor(req),...req.body,source:req.body?.source||"MANUAL"});markPreviewStale(game.id,interaction.revisionId||null,"Interaction changed.");return noStore(res).status(201).json({ok:true,interaction});}
    catch(error){return fail(res,400,String(error.code||error.message||"INTERACTION_INVALID"),"Interação declarativa inválida.");}
  });
  app.put("/api/universe-builder-099/games/:game/interactions/:interaction",requireSameOriginMutation,requireCapability("universe_build"),(req,res)=>{
    const game=gameFrom(req.params.game); if(!game) return fail(res,404,"GAME_NOT_FOUND","Jogo não encontrado.");const current=getUniverseInteraction(req.params.interaction);if(!current||current.entityGameId!==game.id)return fail(res,404,"INTERACTION_NOT_FOUND","Interação não encontrada.");
    try{const next={...current,...req.body};assertPublishedInteractionTarget(game,next,language(req));const interaction=upsertUniverseInteraction({id:current.id,entityGameId:game.id,pageId:req.body?.pageId??current.pageId,sectionId:req.body?.sectionId??current.sectionId,revisionId:req.body?.revisionId??current.revisionId,createdBy:current.createdBy||actor(req),...current,...req.body});markPreviewStale(game.id,interaction.revisionId||null,"Interaction changed.");return noStore(res).json({ok:true,interaction});}
    catch(error){return fail(res,400,String(error.code||error.message||"INTERACTION_INVALID"),"Interação declarativa inválida.");}
  });
  app.delete("/api/universe-builder-099/games/:game/interactions/:interaction",requireSameOriginMutation,requireCapability("universe_build"),(req,res)=>{
    const game=gameFrom(req.params.game); if(!game) return fail(res,404,"GAME_NOT_FOUND","Jogo não encontrado.");const current=getUniverseInteraction(req.params.interaction);if(!current||current.entityGameId!==game.id)return fail(res,404,"INTERACTION_NOT_FOUND","Interação não encontrada.");const interaction=archiveUniverseInteraction(current.id,game.id);markPreviewStale(game.id,current.revisionId||null,"Interaction archived.");return noStore(res).json({ok:true,interaction});
  });
  app.get("/api/universe-builder-099/games/:game/interaction-presets",requireCapability("universe_build"),(req,res)=>{const game=gameFrom(req.params.game);if(!game)return fail(res,404,"GAME_NOT_FOUND","Jogo não encontrado.");return noStore(res).json({ok:true,presets:interactionPresetsForEntity(game.id)});});
  app.post("/api/universe-builder-099/games/:game/creative-director",requireSameOriginMutation,requireCapability("universe_build"),async(req,res)=>{const game=gameFrom(req.params.game);if(!game)return fail(res,404,"GAME_NOT_FOUND","Jogo não encontrado.");try{return noStore(res).json({ok:true,review:await creativeDirectorReview(game,{language:req.body?.language||language(req),allowLocalAI:req.body?.allowLocalAI!==false})});}catch(error){return fail(res,400,String(error.code||error.message||"CREATIVE_DIRECTOR_FAILED"),"Creative Director não conseguiu revisar este universo.");}});
  app.get("/api/universe-builder-099/games/:game/builds/current",requireCapability("universe_build"),(req,res)=>{const game=gameFrom(req.params.game);if(!game)return fail(res,404,"GAME_NOT_FOUND","Jogo não encontrado.");return noStore(res).json({ok:true,build:currentFoundationBuild(game.id,{userId:actor(req)})});});
  app.post("/api/universe-builder-099/games/:game/builds",requireSameOriginMutation,requireCapability("universe_build"),(req,res)=>{
    const game=gameFrom(req.params.game); if(!game) return fail(res,404,"GAME_NOT_FOUND","Jogo não encontrado.");
    try{
      const build=startFoundationBuild(game,{scope:req.body?.scope,language:req.body?.language,userId:actor(req)});
      return noStore(res).status(202).json({ok:true,build});
    }catch(error){ return fail(res,400,String(error.code||error.message||"BUILD_START_FAILED"),"Não foi possível iniciar o Universe Builder 2.0."); }
  });
  app.get("/api/universe-builder-099/builds/:build",requireCapability("universe_build"),(req,res)=>{
    const build=getFoundationBuild(req.params.build); if(!build) return fail(res,404,"BUILD_NOT_FOUND","Build não encontrado.");
    return noStore(res).json({ok:true,build});
  });
  app.get("/api/universe-builder-099/builds/:build/preview",requireCapability("universe_build"),(req,res)=>{
    const preview=foundationBuildPreview(req.params.build); if(!preview) return fail(res,404,"BUILD_NOT_FOUND","Build não encontrado.");
    return noStore(res).json({ok:true,preview});
  });
  app.post("/api/universe-builder-099/builds/:build/cancel",requireSameOriginMutation,requireCapability("universe_build"),(req,res)=>{
    const build=requestFoundationBuildCancel(req.params.build,{userId:actor(req)}); if(!build) return fail(res,404,"BUILD_NOT_FOUND","Build não encontrado.");
    return noStore(res).json({ok:true,build});
  });
  app.post("/api/universe-builder-099/builds/:build/resume",requireSameOriginMutation,requireCapability("universe_build"),(req,res)=>{try{return noStore(res).status(202).json({ok:true,build:resumeFoundationBuild(req.params.build,{userId:actor(req)})});}catch(error){return fail(res,error.code==="BUILD_FORBIDDEN"?403:400,String(error.code||error.message||"BUILD_RESUME_FAILED"),"Não foi possível retomar esta construção.");}});
  app.post("/api/universe-builder-099/builds/:build/publish",requireSameOriginMutation,requireCapability("universe_build"),(req,res)=>{
    try{return noStore(res).json({ok:true,revision:publishFoundationBuild(req.params.build,{userId:actor(req)})});}
    catch(error){return fail(res,400,String(error.code||error.message||"PUBLISH_FAILED"),"A revisão ainda não está validada para publicação.");}
  });

  app.put("/api/games/:game/identity-099",requireSameOriginMutation,requireCapability("creator_control"),(req,res)=>{
    const game=gameFrom(req.params.game); if(!game) return fail(res,404,"GAME_NOT_FOUND","Jogo não encontrado.");
    try{return noStore(res).json({ok:true,identity:setIdentityProfile(game.id,req.body||{},actor(req))});}
    catch(error){return fail(res,400,String(error.code||error.message||"INVALID_IDENTITY_PROFILE"),"Perfil visual inválido.");}
  });
  app.put("/api/games/:game/technical-099",requireSameOriginMutation,requireCapability("creator_control"),(req,res)=>{
    const game=gameFrom(req.params.game); if(!game) return fail(res,404,"GAME_NOT_FOUND","Jogo não encontrado.");
    try{return noStore(res).json({ok:true,technical:setTechnicalProfile(game.id,req.body||{})});}
    catch(error){return fail(res,400,String(error.code||error.message||"INVALID_TECHNICAL_PROFILE"),"Perfil técnico inválido.");}
  });
}
