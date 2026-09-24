import { currentAuth } from "../auth/auth-service.mjs";
import { requireCapability, requireSameOriginMutation } from "../access/capability-service.mjs";
import { getGameById, getGameBySlug } from "../database/repositories/game-repository.mjs";
import { INTERNAL_RELEASE, PUBLIC_VERSION, releaseSnapshotI6 } from "../config/release-099i6.mjs";
import {
  approveInteractionConceptI6,
  approveSafeAuthorizationsI6,
  discoverInteractionConceptsI6,
  discoverVisualIdentityMotifsI6,
  discardInteractionConceptI6,
  generateInteractionPreviewI6,
  latestEnhancementI6,
  listAuthorizationQueueI6,
  listInteractionConceptsI6,
  listVisualIdentityMotifsI6,
  rebuildInteractionPreviewI6,
  resolveAuthorizationI6,
  runEnhancementI6,
  startEnhancementI6,
  syncBuildRevisionStateI6,
  universeBuilderExperienceStateI6
} from "../universe/universe-builder-experience-099i6.mjs";

function gameFrom(value){return getGameById(String(value||""))||getGameBySlug(String(value||""));}
function actor(req){return currentAuth(req)?.user?.id||null;}
function noStore(res){res.setHeader("Cache-Control","no-store");return res;}
function fail(res,status,code,message){return noStore(res).status(status).json({ok:false,error:{code,message}});}
function lang(req){const v=String(req.body?.language||req.query.language||req.query.lang||"pt-BR");return ["pt-BR","en-US","es-ES"].includes(v)?v:"pt-BR";}
function revision(req){return req.body?.revisionId||req.query.revisionId||null;}

export function registerBeta099I6Routes(app){
  app.get("/api/admin/i6/release",requireCapability("creator_control"),(req,res)=>noStore(res).json({ok:true,...releaseSnapshotI6({technical:true})}));

  app.get("/api/universe-builder-099/games/:game/i6",requireCapability("universe_build"),(req,res)=>{const game=gameFrom(req.params.game);if(!game)return fail(res,404,"GAME_NOT_FOUND","Jogo ou Experience não encontrado.");return noStore(res).json({ok:true,state:universeBuilderExperienceStateI6(game.id,{revisionId:revision(req),language:lang(req)})});});
  app.post("/api/universe-builder-099/games/:game/i6/revision-state/sync",requireSameOriginMutation,requireCapability("universe_build"),(req,res)=>{const game=gameFrom(req.params.game);if(!game)return fail(res,404,"GAME_NOT_FOUND","Jogo ou Experience não encontrado.");return noStore(res).json({ok:true,revisionState:syncBuildRevisionStateI6(game.id)});});

  app.get("/api/universe-builder-099/games/:game/i6/motifs",requireCapability("universe_build"),(req,res)=>{const game=gameFrom(req.params.game);if(!game)return fail(res,404,"GAME_NOT_FOUND","Jogo ou Experience não encontrado.");return noStore(res).json({ok:true,entries:listVisualIdentityMotifsI6(game.id,{revisionId:revision(req),language:lang(req),status:req.query.status||null})});});
  app.post("/api/universe-builder-099/games/:game/i6/motifs/discover",requireSameOriginMutation,requireCapability("universe_build"),(req,res)=>{const game=gameFrom(req.params.game);if(!game)return fail(res,404,"GAME_NOT_FOUND","Jogo ou Experience não encontrado.");try{return noStore(res).json({ok:true,...discoverVisualIdentityMotifsI6(game.id,{revisionId:revision(req),language:lang(req),limit:req.body?.limit||null})});}catch(error){return fail(res,400,String(error.code||error.message||"MOTIF_DISCOVERY_FAILED"),"Não foi possível descobrir a identidade visual desta entidade.");}});

  app.get("/api/universe-builder-099/games/:game/i6/interaction-concepts",requireCapability("universe_build"),(req,res)=>{const game=gameFrom(req.params.game);if(!game)return fail(res,404,"GAME_NOT_FOUND","Jogo ou Experience não encontrado.");return noStore(res).json({ok:true,entries:listInteractionConceptsI6(game.id,{revisionId:revision(req),language:lang(req),status:req.query.status||null})});});
  app.post("/api/universe-builder-099/games/:game/i6/interaction-concepts/discover",requireSameOriginMutation,requireCapability("universe_build"),(req,res)=>{const game=gameFrom(req.params.game);if(!game)return fail(res,404,"GAME_NOT_FOUND","Jogo ou Experience não encontrado.");try{return noStore(res).json({ok:true,...discoverInteractionConceptsI6(game.id,{revisionId:revision(req),language:lang(req),limit:req.body?.limit||10})});}catch(error){return fail(res,400,String(error.code||error.message||"INTERACTION_DISCOVERY_FAILED"),"Não foi possível descobrir novas ideias interativas.");}});
  app.post("/api/universe-builder-099/games/:game/i6/interaction-concepts/:concept/preview",requireSameOriginMutation,requireCapability("universe_build"),(req,res)=>{const game=gameFrom(req.params.game);if(!game)return fail(res,404,"GAME_NOT_FOUND","Jogo ou Experience não encontrado.");try{const result=generateInteractionPreviewI6(req.params.concept,{feedbackCode:req.body?.feedbackCode||""});if(result.concept.entityGameId!==game.id)return fail(res,404,"INTERACTION_CONCEPT_NOT_FOUND","Ideia interativa não encontrada.");return noStore(res).json({ok:true,...result});}catch(error){return fail(res,400,String(error.code||error.message||"INTERACTION_PREVIEW_FAILED"),"Não foi possível gerar a Preview interativa.");}});
  app.post("/api/universe-builder-099/games/:game/i6/interaction-concepts/:concept/rebuild",requireSameOriginMutation,requireCapability("universe_build"),(req,res)=>{const game=gameFrom(req.params.game);if(!game)return fail(res,404,"GAME_NOT_FOUND","Jogo ou Experience não encontrado.");try{const result=rebuildInteractionPreviewI6(req.params.concept,{feedbackCode:req.body?.feedbackCode||""});if(result.concept.entityGameId!==game.id)return fail(res,404,"INTERACTION_CONCEPT_NOT_FOUND","Ideia interativa não encontrada.");return noStore(res).json({ok:true,...result});}catch(error){return fail(res,400,String(error.code||error.message||"INTERACTION_REBUILD_FAILED"),"Não foi possível refazer esta Preview.");}});
  app.post("/api/universe-builder-099/games/:game/i6/interaction-concepts/:concept/approve",requireSameOriginMutation,requireCapability("universe_build"),(req,res)=>{const game=gameFrom(req.params.game);if(!game)return fail(res,404,"GAME_NOT_FOUND","Jogo ou Experience não encontrado.");try{const result=approveInteractionConceptI6(req.params.concept,{createdBy:actor(req)});if(result.concept.entityGameId!==game.id)return fail(res,404,"INTERACTION_CONCEPT_NOT_FOUND","Ideia interativa não encontrada.");return noStore(res).json({ok:true,...result});}catch(error){return fail(res,400,String(error.code||error.message||"INTERACTION_APPROVAL_FAILED"),"A interação precisa de uma Preview válida antes de ser aprovada.");}});
  app.post("/api/universe-builder-099/games/:game/i6/interaction-concepts/:concept/discard",requireSameOriginMutation,requireCapability("universe_build"),(req,res)=>{const game=gameFrom(req.params.game);if(!game)return fail(res,404,"GAME_NOT_FOUND","Jogo ou Experience não encontrado.");try{const concept=discardInteractionConceptI6(req.params.concept);if(concept.entityGameId!==game.id)return fail(res,404,"INTERACTION_CONCEPT_NOT_FOUND","Ideia interativa não encontrada.");return noStore(res).json({ok:true,concept});}catch(error){return fail(res,400,String(error.code||error.message||"INTERACTION_DISCARD_FAILED"),"Não foi possível descartar esta ideia.");}});

  app.get("/api/universe-builder-099/games/:game/i6/authorizations",requireCapability("universe_build"),(req,res)=>{const game=gameFrom(req.params.game);if(!game)return fail(res,404,"GAME_NOT_FOUND","Jogo ou Experience não encontrado.");return noStore(res).json({ok:true,entries:listAuthorizationQueueI6(game.id,{revisionId:revision(req),status:req.query.status||"PENDING"})});});
  app.post("/api/universe-builder-099/games/:game/i6/authorizations/:authorization/decision",requireSameOriginMutation,requireCapability("universe_build"),(req,res)=>{const game=gameFrom(req.params.game);if(!game)return fail(res,404,"GAME_NOT_FOUND","Jogo ou Experience não encontrado.");try{return noStore(res).json({ok:true,result:resolveAuthorizationI6(req.params.authorization,req.body?.decision,{actorUserId:actor(req)})});}catch(error){return fail(res,400,String(error.code||error.message||"AUTHORIZATION_FAILED"),"Não foi possível aplicar esta decisão.");}});
  app.post("/api/universe-builder-099/games/:game/i6/authorizations/approve-safe",requireSameOriginMutation,requireCapability("universe_build"),(req,res)=>{const game=gameFrom(req.params.game);if(!game)return fail(res,404,"GAME_NOT_FOUND","Jogo ou Experience não encontrado.");try{return noStore(res).json({ok:true,...approveSafeAuthorizationsI6(game.id,{revisionId:revision(req),actorUserId:actor(req),threshold:req.body?.threshold||88})});}catch(error){return fail(res,400,String(error.code||error.message||"AUTHORIZATION_BATCH_FAILED"),"Não foi possível aprovar as recomendações seguras.");}});

  app.post("/api/universe-builder-099/games/:game/i6/enhance",requireSameOriginMutation,requireCapability("universe_build"),async(req,res)=>{const game=gameFrom(req.params.game);if(!game)return fail(res,404,"GAME_NOT_FOUND","Jogo ou Experience não encontrado.");try{if(req.body?.asynchronous){const result=startEnhancementI6(game.id,{revisionId:revision(req),passes:req.body?.passes||1,focus:req.body?.focus||"SMART",language:lang(req),createdBy:actor(req)});return noStore(res).status(202).json({ok:true,result});}const result=await runEnhancementI6(game.id,{revisionId:revision(req),passes:req.body?.passes||1,focus:req.body?.focus||"SMART",language:lang(req),createdBy:actor(req)});return noStore(res).json({ok:true,release:INTERNAL_RELEASE,publicVersion:PUBLIC_VERSION,result,state:universeBuilderExperienceStateI6(game.id,{revisionId:revision(req),language:lang(req)})});}catch(error){return fail(res,400,String(error.code||error.message||"ENHANCEMENT_FAILED"),"O aprimoramento não pôde ser concluído.");}});
  app.get("/api/universe-builder-099/games/:game/i6/enhance/latest",requireCapability("universe_build"),(req,res)=>{const game=gameFrom(req.params.game);if(!game)return fail(res,404,"GAME_NOT_FOUND","Jogo ou Experience não encontrado.");return noStore(res).json({ok:true,result:latestEnhancementI6(game.id)});});
}
