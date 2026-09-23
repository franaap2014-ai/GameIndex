import { currentAuth } from "../auth/auth-service.mjs";
import { accessSnapshotForUser, requireCapability, requireSameOriginMutation } from "../access/capability-service.mjs";
import { publicReleaseSnapshot, internalReleaseSnapshot } from "../config/release-099i6.mjs";
import { favoriteGame, favoriteGameCount, isGameFavorite, listFavoriteGames, reorderFavoriteGames, unfavoriteGame } from "../database/repositories/favorite-game-repository.mjs";
import { getGameById, getGameBySlug } from "../database/repositories/game-repository.mjs";
import { avatarCatalogForCreator, chooseProfileAvatar, editAvatarCatalog, profileAvatarLibraryForUser } from "../users/profile-avatar-service.mjs";
import { animationExistingCatalog, animationProjectDetails, listAnimationEditorProjects } from "../animations/animation-editor-service.mjs";
import { animationRuntimePayload } from "../animations/animation-runtime.mjs";
import { bindGameEntryCutscene, gameEntryCutscene, listGameCutsceneBindings, setGameCutsceneFallback } from "../animations/game-cutscene-service.mjs";

function actor(req){return currentAuth(req)?.user?.id||null;}
function login(req,res,next){const id=actor(req);if(!id)return res.status(401).json({ok:false,error:{code:"AUTH_REQUIRED",message:"Faça login para continuar."}});req.gameIndexUserId=id;next();}
function noStore(res){res.setHeader("Cache-Control","no-store");return res;}
function fail(res,error,status=400){
  const code=String(error?.code||error?.message||"REQUEST_FAILED").slice(0,120);
  const s=Number(error?.status)||(/NOT_FOUND/.test(code)?404:/DENIED|NOT_ELIGIBLE/.test(code)?403:/CONFLICT|TOO_LONG|NOT_PUBLISHED/.test(code)?409:status);
  return noStore(res).status(s).json({ok:false,error:{code,message:String(error?.message||"Não foi possível concluir a operação.").slice(0,300)}});
}
function route(handler){return (req,res)=>Promise.resolve().then(()=>handler(req,res)).catch(error=>fail(res,error));}
function resolveGame(value){return getGameById(String(value||""))||getGameBySlug(String(value||""))||null;}
const VIEWPORTS=new Set(["DESKTOP","NOTEBOOK","TABLET","MOBILE"]);
const IDENTITIES=new Set(["FREE","PRO","TESTER","DEV","CREATOR"]);
function safeScenario(body={}){
  const viewport=VIEWPORTS.has(String(body.viewport||"").toUpperCase())?String(body.viewport).toUpperCase():"DESKTOP";
  const identity=IDENTITIES.has(String(body.identity||"").toUpperCase())?String(body.identity).toUpperCase():"FREE";
  const theme=String(body.theme||"FREE_DARK").toUpperCase().replace(/[^A-Z0-9_-]/g,"_").slice(0,60);
  return {viewport,identity,theme,reducedMotion:Boolean(body.reducedMotion),slowPreview:Boolean(body.slowPreview),loop:Boolean(body.loop)};
}

export function registerBeta09915Routes(app){
  app.get("/api/release/public",(req,res)=>noStore(res).json(publicReleaseSnapshot()));
  app.get("/api/admin/release/internal",requireCapability("creator_control"),(req,res)=>noStore(res).json({ok:true,...internalReleaseSnapshot()}));

  app.get("/api/profile/avatars/library",login,route((req,res)=>noStore(res).json({ok:true,...profileAvatarLibraryForUser(req.gameIndexUserId)})));
  app.post("/api/profile/avatars/select",requireSameOriginMutation,login,route((req,res)=>noStore(res).json({ok:true,...chooseProfileAvatar(req.gameIndexUserId,req.body?.avatarKey||req.body?.avatarId)})));
  app.get("/api/admin/profile-avatars",requireCapability("profile_avatar_management"),route((req,res)=>noStore(res).json({ok:true,...avatarCatalogForCreator()})));
  app.patch("/api/admin/profile-avatars/:id",requireSameOriginMutation,requireCapability("profile_avatar_management"),route((req,res)=>noStore(res).json({ok:true,avatar:editAvatarCatalog(req.params.id,req.body||{})})));

  app.get("/api/profile/favorites",login,route((req,res)=>noStore(res).json({ok:true,count:favoriteGameCount(req.gameIndexUserId),entries:listFavoriteGames(req.gameIndexUserId,{limit:req.query.limit||100,offset:req.query.offset||0})})));
  app.get("/api/profile/favorites/:game/status",login,route((req,res)=>{const game=resolveGame(req.params.game);if(!game)return res.status(404).json({ok:false,error:{code:"GAME_NOT_FOUND",message:"Jogo não encontrado."}});return noStore(res).json({ok:true,gameId:game.id,favorite:isGameFavorite(req.gameIndexUserId,game.id)});}));
  app.post("/api/profile/favorites/:game",requireSameOriginMutation,login,route((req,res)=>{const game=resolveGame(req.params.game);if(!game)return res.status(404).json({ok:false,error:{code:"GAME_NOT_FOUND",message:"Jogo não encontrado."}});favoriteGame(req.gameIndexUserId,game.id);return noStore(res).status(201).json({ok:true,gameId:game.id,favorite:true,count:favoriteGameCount(req.gameIndexUserId)});}));
  app.delete("/api/profile/favorites/:game",requireSameOriginMutation,login,route((req,res)=>{const game=resolveGame(req.params.game);if(!game)return res.status(404).json({ok:false,error:{code:"GAME_NOT_FOUND",message:"Jogo não encontrado."}});unfavoriteGame(req.gameIndexUserId,game.id);return noStore(res).json({ok:true,gameId:game.id,favorite:false,count:favoriteGameCount(req.gameIndexUserId)});}));
  app.put("/api/profile/favorites",requireSameOriginMutation,login,route((req,res)=>noStore(res).json({ok:true,entries:reorderFavoriteGames(req.gameIndexUserId,req.body?.gameIds||[])})));

  app.get("/api/games/:game/entry-cutscene",route((req,res)=>{const game=resolveGame(req.params.game);if(!game||game.status!=="PUBLISHED")return noStore(res).status(404).json({ok:false,error:{code:"GAME_NOT_FOUND",message:"Jogo não encontrado."}});return noStore(res).json({ok:true,...gameEntryCutscene(game.id)});}));

  app.get("/api/cinematic-test/catalog",requireCapability("cinematic_test"),route((req,res)=>{
    const access=accessSnapshotForUser(actor(req));
    const projects=listAnimationEditorProjects({limit:250}).map(p=>({id:p.id,key:p.key,name:p.name,type:p.type,status:p.status,currentRevision:p.currentRevision,publishedRevision:p.publishedRevision,durationMs:p.durationMs}));
    const existing=animationExistingCatalog().map(({definition,...x})=>x);
    return noStore(res).json({ok:true,sandbox:true,access:{staffRole:access.staffRole,capabilities:access.capabilities},projects,existing,gameBindings:listGameCutsceneBindings({limit:500}),scenarios:["NEW_USER","FREE","PRO","TESTER","DEV","CREATOR","MOBILE","REDUCED_MOTION"],viewports:[...VIEWPORTS],identities:[...IDENTITIES]});
  }));
  app.post("/api/cinematic-test/preview",requireSameOriginMutation,requireCapability("cinematic_test"),route((req,res)=>{
    const scenario=safeScenario(req.body||{});let runtime=null,source={kind:"NONE"};
    if(req.body?.gameId){
      const cutscene=gameEntryCutscene(req.body.gameId);runtime=cutscene.runtime;source={kind:"GAME_ENTRY",mode:cutscene.mode,game:cutscene.game,projectId:cutscene.projectId||null,revision:cutscene.revision||0};
    }else if(req.body?.projectId){
      const details=animationProjectDetails(req.body.projectId);if(!details?.current)throw Object.assign(new Error("Projeto de animação não encontrado."),{code:"ANIMATION_PROJECT_NOT_FOUND",status:404});
      runtime=animationRuntimePayload(details.current.definition);source={kind:"PROJECT",projectId:details.project.id,revision:details.current.revision,status:details.current.status};
    }else if(req.body?.existingKey){
      const existing=animationExistingCatalog().find(x=>x.key===String(req.body.existingKey));if(!existing)throw Object.assign(new Error("Cinematic não encontrada."),{code:"CINEMATIC_NOT_FOUND",status:404});
      runtime=animationRuntimePayload(existing.definition);source={kind:"LEGACY_REFERENCE",key:existing.key,fidelity:existing.fidelity};
    }else if(req.body?.definition){
      runtime=animationRuntimePayload(req.body.definition);source={kind:"UNSAVED_DEFINITION"};
    }else throw Object.assign(new Error("Escolha uma cinematic para testar."),{code:"CINEMATIC_SELECTION_REQUIRED"});
    return noStore(res).json({ok:true,sandbox:true,mutatesHistory:false,mutatesTheme:false,mutatesBindings:false,scenario,source,runtime});
  }));
  app.get("/api/cinematic-test/game-bindings",requireCapability("cinematic_test"),route((req,res)=>noStore(res).json({ok:true,entries:listGameCutsceneBindings({limit:req.query.limit||500})})));
  app.put("/api/cinematic-test/game-bindings/:game",requireSameOriginMutation,requireCapability("animation_publish"),route((req,res)=>noStore(res).json({ok:true,binding:bindGameEntryCutscene({gameId:req.params.game,projectId:req.body?.projectId,revision:req.body?.revision,maxDurationMs:req.body?.maxDurationMs||2000,actorUserId:actor(req)})})));
  app.delete("/api/cinematic-test/game-bindings/:game",requireSameOriginMutation,requireCapability("animation_publish"),route((req,res)=>noStore(res).json({ok:true,binding:setGameCutsceneFallback({gameId:req.params.game,actorUserId:actor(req)})})));
}
