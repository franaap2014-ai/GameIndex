import { currentAuth } from "../auth/auth-service.mjs";
import { getGameById, getGameBySlug } from "../database/repositories/game-repository.mjs";
import { requireCapability, requireSameOriginMutation } from "../access/capability-service.mjs";
import { resolvePersonalization } from "../personalization/personalization-service.mjs";
import { eraProfile, listEraProfiles, setEraProfile } from "../personalization/era-service.mjs";
import { listEraMedia, setEraMedia, setEraMediaFromUrl, removeEraMedia } from "../images/game-media-service.mjs";

function gameFrom(value){return getGameById(String(value||""))||getGameBySlug(String(value||""));}
function actor(req){return currentAuth(req)?.user?.id||null;}
function noStore(res){res.setHeader("Cache-Control","no-store");return res;}
function publicCache(res){res.setHeader("Cache-Control","public, max-age=30, stale-while-revalidate=60");return res;}
function fail(res,status,code,message){return res.status(status).json({ok:false,error:{code,message}});}

function personalizationInput(req,game){return {
  game,
  experienceKey:req.query.experience||"main",
  eraKey:req.query.era||"",
  ecosystemExperienceKey:req.query.ecosystemExperience||"main",
  ecosystemEraKey:req.query.ecosystemEra||"",
  userTheme:req.query.theme||"FREE_DARK"
};}

export function registerBeta0987Routes(app){
  app.get("/api/games/:game/personalization",(req,res)=>{
    const game=gameFrom(req.params.game);if(!game)return fail(res,404,"GAME_NOT_FOUND","Jogo não encontrado.");
    try{return publicCache(res).json({ok:true,state:resolvePersonalization(personalizationInput(req,game))});}
    catch(error){return fail(res,400,String(error.message||"PERSONALIZATION_FAILED"),"Não foi possível resolver a personalização.");}
  });

  app.get("/api/games/:game/personalization/inspect",requireCapability("creator_control"),(req,res)=>{
    const game=gameFrom(req.params.game);if(!game)return fail(res,404,"GAME_NOT_FOUND","Jogo não encontrado.");
    try{return noStore(res).json({ok:true,state:resolvePersonalization(personalizationInput(req,game))});}
    catch(error){return fail(res,400,String(error.message||"PERSONALIZATION_FAILED"),error.message);}
  });

  app.get("/api/games/:game/experience/:experience/eras",(req,res)=>{
    const game=gameFrom(req.params.game);if(!game)return fail(res,404,"GAME_NOT_FOUND","Jogo não encontrado.");
    try{return publicCache(res).json({ok:true,eras:listEraProfiles(game.id,req.params.experience)});}
    catch(error){return fail(res,400,String(error.message||"INVALID_ERA"),"Era inválida.");}
  });
  app.get("/api/games/:game/experience/:experience/era/:era",(req,res)=>{
    const game=gameFrom(req.params.game);if(!game)return fail(res,404,"GAME_NOT_FOUND","Jogo não encontrado.");
    try{return publicCache(res).json({ok:true,era:eraProfile(game.id,req.params.experience,req.params.era)});}
    catch(error){return fail(res,400,String(error.message||"INVALID_ERA"),"Era inválida.");}
  });
  app.put("/api/games/:game/experience/:experience/era/:era",requireSameOriginMutation,requireCapability("creator_control"),(req,res)=>{
    const game=gameFrom(req.params.game);if(!game)return fail(res,404,"GAME_NOT_FOUND","Jogo não encontrado.");
    try{return noStore(res).json({ok:true,era:setEraProfile({gameId:game.id,experienceKey:req.params.experience,eraKey:req.params.era,label:req.body?.label,subtitle:req.body?.subtitle,theme:req.body?.theme,font:req.body?.font,components:req.body?.components,motion:req.body?.motion,musicSlot:req.body?.musicSlot,enabled:req.body?.enabled!==false,userId:actor(req)})});}
    catch(error){return fail(res,400,String(error.message||"INVALID_ERA"),error.message);}
  });

  app.get("/api/games/:game/experience/:experience/era/:era/media",(req,res)=>{
    const game=gameFrom(req.params.game);if(!game)return fail(res,404,"GAME_NOT_FOUND","Jogo não encontrado.");
    try{return publicCache(res).json({ok:true,media:listEraMedia(game.id,req.params.experience,req.params.era)});}
    catch(error){return fail(res,400,String(error.message||"INVALID_ERA_MEDIA"),"Mídia da era inválida.");}
  });
  app.put("/api/games/:game/experience/:experience/era/:era/media/:slot",requireSameOriginMutation,requireCapability("image_management"),async(req,res)=>{
    const game=gameFrom(req.params.game);if(!game)return fail(res,404,"GAME_NOT_FOUND","Jogo não encontrado.");
    try{
      if(!eraProfile(game.id,req.params.experience,req.params.era))return fail(res,404,"ERA_NOT_FOUND","Era não encontrada.");
      const input={gameId:game.id,experienceKey:req.params.experience,eraKey:req.params.era,slotKey:req.params.slot,imageUrl:req.body?.imageUrl,imageDataUrl:req.body?.imageDataUrl,altText:req.body?.altText,fitMode:req.body?.fitMode,quality:req.body?.quality,userId:actor(req)};
      const profile=req.body?.imageDataUrl?setEraMedia(input):await setEraMediaFromUrl(input);
      return noStore(res).json({ok:true,profile});
    }catch(error){return fail(res,400,String(error.message||"INVALID_ERA_MEDIA"),"Imagem da era inválida, inacessível ou fora dos limites permitidos.");}
  });
  app.delete("/api/games/:game/experience/:experience/era/:era/media/:slot",requireSameOriginMutation,requireCapability("image_management"),(req,res)=>{
    const game=gameFrom(req.params.game);if(!game)return fail(res,404,"GAME_NOT_FOUND","Jogo não encontrado.");
    try{removeEraMedia(game.id,req.params.experience,req.params.era,req.params.slot);return noStore(res).json({ok:true});}
    catch(error){return fail(res,400,String(error.message||"INVALID_ERA_MEDIA"),"Slot de mídia da era inválido.");}
  });
}
