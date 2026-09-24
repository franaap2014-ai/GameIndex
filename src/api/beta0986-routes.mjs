// Release lineage compatibility: BETA_0_9875_FULL_PAGE_PERSONALIZATION
import { currentAuth, authenticateCredentials, createAuthenticatedSession, verifyUserPassword, changeUserPassword } from "../auth/auth-service.mjs";
import { getUserById } from "../database/repositories/user-repository.mjs";
import { getGameById, getGameBySlug, listGames, listGamesPage } from "../database/repositories/game-repository.mjs";
import { accessSnapshot, hasCapability, requireCapability, requireSameOriginMutation } from "../access/capability-service.mjs";
import { adminConnectionForUser, listAdminConnections, setAdminConnection } from "../access/admin-connection-service.mjs";
import { homeMusicProfile, gameMusicProfile, setHomeMusic, setGameMusic, removeHomeMusic, removeGameMusic, listGameMusicProfiles, gameAltMusicProfile, setGameAltMusic, removeGameAltMusic, listGameAltMusicProfiles } from "../music/youtube-music-service.mjs";
import { gameMediaProfile, listGameMedia, listGameMediaForGames, setGameMedia, setGameMediaFromUrl, removeGameMedia, listAllExperienceMedia, listExperienceMedia, setExperienceMedia, setExperienceMediaFromUrl, removeExperienceMedia, listAllEraMedia, previewImageFromUrl } from "../images/game-media-service.mjs";
import { gamePublicVisual } from "../images/public-visual.mjs";
import { experienceProfile, listExperiences, setExperience, listChildExperiences, parentExperienceForGame, robloxExperienceHub, experienceByChildSlug } from "../games/game-experience-service.mjs";
import { localAIRuntimeStatus } from "../ai/runtime/local-ai-runtime.mjs";
import { basicGameOverview } from "../universe/basic-overview.mjs";
import { twoFactorStatus, requestLoginChallenge, requestEnableChallenge, resendChallenge, verifyChallenge, enableTwoFactor, disableTwoFactor } from "../security/two-factor-service.mjs";
import { INTERNAL_RELEASE, INTERNAL_RELEASE_CODE } from "../config/release-099i6.mjs";

function gameFrom(value){return getGameById(String(value||""))||getGameBySlug(String(value||""));}
function actor(req){return currentAuth(req)?.user?.id||null;}
function clamp(n,min,max,fallback){n=Number(n);return Number.isFinite(n)?Math.min(max,Math.max(min,Math.trunc(n))):fallback;}
function noStore(res){res.setHeader("Cache-Control","no-store");return res;}
function publicCache(res){res.setHeader("Cache-Control","public, max-age=60, stale-while-revalidate=120");return res;}
function fail(res,status,code,message){return res.status(status).json({ok:false,error:{code,message}});}

export function registerBeta0986Routes(app,{authLimiter=null}={}){
  app.get("/health",(req,res)=>noStore(res).json({status:"ok",version:INTERNAL_RELEASE,release:INTERNAL_RELEASE_CODE,performanceMode:true,ai:"idle",aiRuntime:"LOCAL_SHARED_LAZY"}));
  app.get("/api/beta0986/access",(req,res)=>{const access=accessSnapshot(req);return noStore(res).json({ok:true,version:INTERNAL_RELEASE,release:INTERNAL_RELEASE_CODE,access});});

  function gameOptions(req,res,{includeDrafts=false}={}){const page=clamp(req.query.page,1,1_000_000,1),limit=clamp(req.query.limit,1,100,100),q=String(req.query.q||"").trim(),result=listGamesPage({includeDrafts,q,limit,offset:(page-1)*limit});return noStore(res).json({ok:true,page,limit,total:result.total,entries:result.items.map(g=>({id:g.id,slug:g.slug,name:g.nome,status:g.status}))});}
  app.get("/api/game-options",(req,res)=>gameOptions(req,res,{includeDrafts:false}));
  app.get("/api/staff/game-options",requireCapability("universe_build"),(req,res)=>gameOptions(req,res,{includeDrafts:true}));

  app.get("/api/music/home",(req,res)=>publicCache(res).json({ok:true,profile:homeMusicProfile()}));
  app.put("/api/music/home",requireSameOriginMutation,requireCapability("music_management"),(req,res)=>{try{return noStore(res).json({ok:true,profile:setHomeMusic({youtubeUrl:req.body?.youtubeUrl,defaultVolume:req.body?.defaultVolume,userId:actor(req)})});}catch{return fail(res,400,"INVALID_YOUTUBE_URL","Invalid YouTube URL.");}});
  app.delete("/api/music/home",requireSameOriginMutation,requireCapability("music_management"),(req,res)=>{removeHomeMusic();return noStore(res).json({ok:true});});
  app.get("/api/games/:game/music",(req,res)=>{const game=gameFrom(req.params.game);if(!game)return fail(res,404,"GAME_NOT_FOUND","Jogo não encontrado.");return publicCache(res).json({ok:true,game:{id:game.id,slug:game.slug,name:game.nome},profile:gameMusicProfile(game.id)});});
  app.put("/api/games/:game/music",requireSameOriginMutation,requireCapability("music_management"),(req,res)=>{const game=gameFrom(req.params.game);if(!game)return fail(res,404,"GAME_NOT_FOUND","Jogo não encontrado.");try{return noStore(res).json({ok:true,profile:setGameMusic({gameId:game.id,youtubeUrl:req.body?.youtubeUrl,defaultVolume:req.body?.defaultVolume,userId:actor(req)})});}catch{return fail(res,400,"INVALID_YOUTUBE_URL","Invalid YouTube URL.");}});
  app.delete("/api/games/:game/music",requireSameOriginMutation,requireCapability("music_management"),(req,res)=>{const game=gameFrom(req.params.game);if(!game)return fail(res,404,"GAME_NOT_FOUND","Jogo não encontrado.");removeGameMusic(game.id);return noStore(res).json({ok:true});});
  app.get("/api/games/:game/music/alt/:slot",(req,res)=>{const game=gameFrom(req.params.game);if(!game)return fail(res,404,"GAME_NOT_FOUND","Jogo não encontrado.");try{return publicCache(res).json({ok:true,profile:gameAltMusicProfile(game.id,req.params.slot)});}catch{return fail(res,400,"INVALID_MUSIC_SLOT","Slot inválido.");}});
  app.put("/api/games/:game/music/alt/:slot",requireSameOriginMutation,requireCapability("music_management"),(req,res)=>{const game=gameFrom(req.params.game);if(!game)return fail(res,404,"GAME_NOT_FOUND","Jogo não encontrado.");try{return noStore(res).json({ok:true,profile:setGameAltMusic({gameId:game.id,slotKey:req.params.slot,youtubeUrl:req.body?.youtubeUrl,defaultVolume:req.body?.defaultVolume,userId:actor(req)})});}catch{return fail(res,400,"INVALID_YOUTUBE_URL","Link ou slot inválido.");}});
  app.delete("/api/games/:game/music/alt/:slot",requireSameOriginMutation,requireCapability("music_management"),(req,res)=>{const game=gameFrom(req.params.game);if(!game)return fail(res,404,"GAME_NOT_FOUND","Jogo não encontrado.");try{removeGameAltMusic(game.id,req.params.slot);return noStore(res).json({ok:true});}catch{return fail(res,400,"INVALID_MUSIC_SLOT","Slot inválido.");}});
  app.get("/api/music-manager/games",requireCapability("music_management"),(req,res)=>{const page=clamp(req.query.page,1,1_000_000,1),limit=clamp(req.query.limit,1,48,24),q=String(req.query.q||"").trim(),result=listGamesPage({includeDrafts:true,q,limit,offset:(page-1)*limit}),games=result.items,ids=games.map(g=>g.id),profiles=listGameMusicProfiles(ids),alts=listGameAltMusicProfiles(ids,"roblox-og");return noStore(res).json({ok:true,page,limit,total:result.total,games:games.map(g=>({id:g.id,slug:g.slug,name:g.nome,profile:profiles.get(String(g.id))||null,alternate:alts.get(String(g.id))||null,experiences:listExperiences(g.id).map(x=>experienceProfile(g.id,x.key)),parent:parentExperienceForGame(g.id)}))});});

  app.get("/api/games/:game/media",(req,res)=>{const game=gameFrom(req.params.game);if(!game)return fail(res,404,"GAME_NOT_FOUND","Jogo não encontrado.");return publicCache(res).json({ok:true,media:listGameMedia(game.id)});});
  app.put("/api/games/:game/media/:slot",requireSameOriginMutation,requireCapability("image_management"),async(req,res)=>{const game=gameFrom(req.params.game);if(!game)return fail(res,404,"GAME_NOT_FOUND","Jogo não encontrado.");try{const input={gameId:game.id,slotKey:req.params.slot,imageUrl:req.body?.imageUrl,imageDataUrl:req.body?.imageDataUrl,altText:req.body?.altText,width:req.body?.width,height:req.body?.height,fitMode:req.body?.fitMode,quality:req.body?.quality,userId:actor(req)},profile=req.body?.imageDataUrl?setGameMedia(input):await setGameMediaFromUrl(input);return noStore(res).json({ok:true,profile});}catch(error){const code=String(error.message||"INVALID_IMAGE");return fail(res,400,code,code==="EXTERNAL_IMAGE_REQUIRES_IMPORT"?"A imagem externa precisa ser importada pelo servidor.":"Imagem inválida, inacessível ou fora dos limites permitidos.");}});
  app.delete("/api/games/:game/media/:slot",requireSameOriginMutation,requireCapability("image_management"),(req,res)=>{const game=gameFrom(req.params.game);if(!game)return fail(res,404,"GAME_NOT_FOUND","Jogo não encontrado.");try{removeGameMedia(game.id,req.params.slot);return noStore(res).json({ok:true});}catch{return fail(res,400,"INVALID_IMAGE_SLOT","Slot inválido.");}});
  function imageManagerGamePayload(g){
    const parent=parentExperienceForGame(g.id),parentGame=parent?gameFrom(parent.id):null;
    return {
      id:g.id,slug:g.slug,name:g.nome,status:g.status,visual:gamePublicVisual(g),
      media:listGameMedia(g.id),
      experienceMedia:listAllExperienceMedia(g.id),
      eraMedia:listAllEraMedia(g.id),
      experiences:listExperiences(g.id).map(x=>experienceProfile(g.id,x.key)),
      parent,
      parentMedia:parentGame?listGameMedia(parentGame.id):[],
      parentExperienceMedia:parentGame?listAllExperienceMedia(parentGame.id):[],
      parentEraMedia:parentGame?listAllEraMedia(parentGame.id):[]
    };
  }
  app.get("/api/image-manager/tree",requireCapability("image_management"),(req,res)=>{
    const entries=listGames({includeDrafts:true}).map(g=>{
      const parent=parentExperienceForGame(g.id);
      const experiences=listExperiences(g.id).map(x=>experienceProfile(g.id,x.key)).filter(Boolean).map(profile=>({
        key:profile.key,label:profile.label||profile.key,enabled:profile.enabled!==false,defaultEraKey:profile.defaultEraKey||"",
        eras:(profile.eras||[]).filter(era=>era.enabled!==false).map(era=>({eraKey:era.eraKey,label:era.label||era.eraKey,enabled:era.enabled!==false}))
      }));
      return{id:g.id,slug:g.slug,name:g.nome,status:g.status,parent:parent?{id:parent.id,slug:parent.slug,name:parent.name,relationType:parent.relationType}:null,experiences};
    });
    return noStore(res).json({ok:true,release:INTERNAL_RELEASE_CODE,entries});
  });
  app.get("/api/image-manager/game/:game",requireCapability("image_management"),(req,res)=>{
    const game=gameFrom(req.params.game);if(!game)return fail(res,404,"GAME_NOT_FOUND","Jogo não encontrado.");
    return noStore(res).json({ok:true,game:imageManagerGamePayload(game)});
  });
  app.post("/api/image-manager/preview-url",requireSameOriginMutation,requireCapability("image_management"),async(req,res)=>{
    try{
      const preview=await previewImageFromUrl(req.body?.imageUrl);
      return noStore(res).json({ok:true,preview});
    }catch(error){
      const code=String(error.message||"INVALID_IMAGE_URL");
      return fail(res,400,code,code==="INVALID_IMAGE_URL"?"URL inválida. Use apenas http:// ou https://.":"Não foi possível carregar essa imagem pela URL.");
    }
  });
  app.get("/api/image-manager/games",requireCapability("image_management"),(req,res)=>{
    const page=clamp(req.query.page,1,1_000_000,1),limit=clamp(req.query.limit,1,48,24),q=String(req.query.q||"").trim();
    const result=listGamesPage({includeDrafts:true,q,limit,offset:(page-1)*limit}),games=result.items.map(g=>imageManagerGamePayload(gameFrom(g.id)));
    return noStore(res).json({ok:true,page,limit,total:result.total,games});
  });


  app.get("/api/games/:game/experience/:key/media",(req,res)=>{const game=gameFrom(req.params.game);if(!game)return fail(res,404,"GAME_NOT_FOUND","Jogo não encontrado.");try{return publicCache(res).json({ok:true,media:listExperienceMedia(game.id,req.params.key)});}catch{return fail(res,400,"INVALID_EXPERIENCE_KEY","Experiência inválida.");}});
  app.put("/api/games/:game/experience/:key/media/:slot",requireSameOriginMutation,requireCapability("image_management"),async(req,res)=>{const game=gameFrom(req.params.game);if(!game)return fail(res,404,"GAME_NOT_FOUND","Jogo não encontrado.");try{experienceProfile(game.id,req.params.key);const input={gameId:game.id,experienceKey:req.params.key,slotKey:req.params.slot,imageUrl:req.body?.imageUrl,imageDataUrl:req.body?.imageDataUrl,altText:req.body?.altText,fitMode:req.body?.fitMode,quality:req.body?.quality,userId:actor(req)},profile=req.body?.imageDataUrl?setExperienceMedia(input):await setExperienceMediaFromUrl(input);return noStore(res).json({ok:true,profile});}catch(error){const code=String(error.message||"INVALID_EXPERIENCE_IMAGE");return fail(res,400,code,"Imagem da experiência inválida, inacessível ou fora dos limites permitidos.");}});
  app.delete("/api/games/:game/experience/:key/media/:slot",requireSameOriginMutation,requireCapability("image_management"),(req,res)=>{const game=gameFrom(req.params.game);if(!game)return fail(res,404,"GAME_NOT_FOUND","Jogo não encontrado.");try{removeExperienceMedia(game.id,req.params.key,req.params.slot);return noStore(res).json({ok:true});}catch(error){return fail(res,400,String(error.message||"INVALID_EXPERIENCE_IMAGE"),"Slot de imagem da experiência inválido.");}});

  app.get("/api/games/:game/experiences",(req,res)=>{const game=gameFrom(req.params.game);if(!game)return fail(res,404,"GAME_NOT_FOUND","Jogo não encontrado.");return publicCache(res).json({ok:true,game:{id:game.id,slug:game.slug,name:game.nome},entries:listExperiences(game.id).map(x=>experienceProfile(game.id,x.key)),parent:parentExperienceForGame(game.id),children:listChildExperiences(game.id)});});
  app.get("/api/games/:game/parent",(req,res)=>{const game=gameFrom(req.params.game);if(!game)return fail(res,404,"GAME_NOT_FOUND","Jogo não encontrado.");return publicCache(res).json({ok:true,parent:parentExperienceForGame(game.id)});});
  app.get("/api/roblox/experiences",(req,res)=>{const hub=robloxExperienceHub();if(!hub)return fail(res,404,"ROBLOX_NOT_FOUND","Roblox não encontrado.");return publicCache(res).json({ok:true,hub});});
  app.get("/api/roblox/experiences/:child",(req,res)=>{const entry=experienceByChildSlug("roblox",req.params.child);if(!entry)return fail(res,404,"EXPERIENCE_NOT_FOUND","Experiência Roblox não encontrada.");return publicCache(res).json({ok:true,entry});});
  app.get("/api/ai-runtime/status",requireCapability("ai_diagnostics"),(req,res)=>noStore(res).json({ok:true,status:localAIRuntimeStatus()}));

  app.get("/api/games/:game/experience/:key",(req,res)=>{const game=gameFrom(req.params.game);if(!game)return fail(res,404,"GAME_NOT_FOUND","Jogo não encontrado.");try{return publicCache(res).json({ok:true,experience:experienceProfile(game.id,req.params.key)});}catch{return fail(res,400,"INVALID_EXPERIENCE_KEY","Experiência inválida.");}});
  app.put("/api/games/:game/experience/:key",requireSameOriginMutation,requireCapability("creator_control"),(req,res)=>{const game=gameFrom(req.params.game);if(!game)return fail(res,404,"GAME_NOT_FOUND","Jogo não encontrado.");try{return noStore(res).json({ok:true,experience:setExperience({gameId:game.id,experienceKey:req.params.key,label:req.body?.label,subtitle:req.body?.subtitle,experienceType:req.body?.experienceType,parentGameId:req.body?.parentGameId||null,slug:req.body?.slug,backgroundSlot:req.body?.backgroundSlot,heroSlot:req.body?.heroSlot,logoSlot:req.body?.logoSlot,cardSlot:req.body?.cardSlot,musicSlot:req.body?.musicSlot,theme:req.body?.theme,accent:req.body?.accent,font:req.body?.font,menu:req.body?.menu,components:req.body?.components,motion:req.body?.motion,defaultEraKey:req.body?.defaultEraKey,enabled:req.body?.enabled!==false,userId:actor(req)})});}catch(error){return fail(res,400,"INVALID_EXPERIENCE",error.message);}});

  app.get("/api/universe/games/:game/basic-overview",requireCapability("universe_build"),(req,res)=>{const game=gameFrom(req.params.game);if(!game)return fail(res,404,"GAME_NOT_FOUND","Jogo não encontrado.");return noStore(res).json({ok:true,overview:basicGameOverview(game),parent:parentExperienceForGame(game.id),experiences:listExperiences(game.id).map(x=>experienceProfile(game.id,x.key))});});

  app.get("/api/security",(req,res)=>{const auth=currentAuth(req);if(!auth)return fail(res,401,"AUTH_REQUIRED","Faça login para continuar.");return noStore(res).json({ok:true,twoFactor:twoFactorStatus(auth.user.id)});});
  app.post("/api/security/password",requireSameOriginMutation,(req,res)=>{const auth=currentAuth(req);if(!auth)return fail(res,401,"AUTH_REQUIRED","Faça login para continuar.");try{changeUserPassword(auth.user.id,{currentPassword:req.body?.currentPassword,newPassword:req.body?.newPassword});res.clearCookie("gv_session",{path:"/"});return noStore(res).json({ok:true,reauthenticate:true});}catch(error){return fail(res,400,"PASSWORD_CHANGE_FAILED",error.message);}});
  app.post("/api/security/2fa/request-enable",requireSameOriginMutation,async(req,res)=>{const auth=currentAuth(req);if(!auth)return fail(res,401,"AUTH_REQUIRED","Faça login para continuar.");if(!verifyUserPassword(auth.user.id,req.body?.currentPassword))return fail(res,403,"PASSWORD_REQUIRED","Senha atual incorreta.");try{return noStore(res).json({ok:true,challenge:await requestEnableChallenge(auth.user.id)});}catch(error){return fail(res,503,String(error.message),error.message==="MAIL_NOT_CONFIGURED"?"O envio de e-mail ainda não está configurado no servidor.":"Não foi possível enviar o código agora.");}});
  app.post("/api/security/2fa/confirm-enable",requireSameOriginMutation,(req,res)=>{const auth=currentAuth(req);if(!auth)return fail(res,401,"AUTH_REQUIRED","Faça login para continuar.");try{const verified=verifyChallenge({challengeId:req.body?.challengeId,code:req.body?.code,purpose:"ENABLE_2FA"});if(verified.userId!==auth.user.id)return fail(res,403,"IDENTITY_MISMATCH","Identidade inválida.");return noStore(res).json({ok:true,twoFactor:enableTwoFactor(auth.user.id)});}catch(error){return fail(res,400,String(error.message),"Código inválido ou expirado.");}});
  app.post("/api/security/2fa/disable",requireSameOriginMutation,(req,res)=>{const auth=currentAuth(req);if(!auth)return fail(res,401,"AUTH_REQUIRED","Faça login para continuar.");if(!verifyUserPassword(auth.user.id,req.body?.currentPassword))return fail(res,403,"PASSWORD_REQUIRED","Senha atual incorreta.");return noStore(res).json({ok:true,twoFactor:disableTwoFactor(auth.user.id)});});

  app.post("/api/auth/login",...(authLimiter?[authLimiter]:[]),async(req,res)=>{try{const user=authenticateCredentials(req.body||{}),status=twoFactorStatus(user.id);if(!status.enabled)return res.json({authenticated:true,...createAuthenticatedSession(req,res,user)});const challenge=await requestLoginChallenge(user.id);return noStore(res).json({authenticated:false,twoFactorRequired:true,challenge});}catch(error){const code=String(error.message||"");if(code==="MAIL_NOT_CONFIGURED")return fail(res,503,"TWO_FACTOR_MAIL_UNAVAILABLE","A proteção em duas etapas está ativa, mas o envio de e-mail não está configurado. O acesso não foi liberado.");return fail(res,401,"LOGIN_FAILED",code||"E-mail ou senha incorretos.");}});
  app.post("/api/auth/2fa/confirm",...(authLimiter?[authLimiter]:[]),(req,res)=>{try{const verified=verifyChallenge({challengeId:req.body?.challengeId,code:req.body?.code,purpose:"LOGIN"}),user=getUserById(verified.userId);if(!user)return fail(res,404,"USER_NOT_FOUND","Conta não encontrada.");return res.json({authenticated:true,...createAuthenticatedSession(req,res,user)});}catch{return fail(res,401,"TWO_FACTOR_INVALID","Código inválido, expirado ou já utilizado.");}});
  app.post("/api/auth/2fa/resend",...(authLimiter?[authLimiter]:[]),async(req,res)=>{try{return noStore(res).json({ok:true,challenge:await resendChallenge({challengeId:req.body?.challengeId,purpose:"LOGIN"})});}catch(error){const code=String(error.message||"");if(code==="TWO_FACTOR_COOLDOWN")return fail(res,429,code,"Aguarde antes de reenviar outro código.");if(code==="MAIL_NOT_CONFIGURED")return fail(res,503,code,"O envio de e-mail não está configurado.");return fail(res,400,"TWO_FACTOR_INVALID","Não foi possível reenviar o código.");}});

  app.get("/api/admin-connections",requireCapability("manage_staff_roles"),(req,res)=>noStore(res).json({ok:true,entries:listAdminConnections()}));
  app.put("/api/admin-connections/:userId",requireSameOriginMutation,requireCapability("manage_staff_roles"),(req,res)=>{const auth=currentAuth(req);if(!auth)return fail(res,401,"AUTH_REQUIRED","Faça login.");if(!verifyUserPassword(auth.user.id,req.body?.currentPassword))return fail(res,403,"REAUTH_REQUIRED","Confirme sua senha atual para alterar conexões administrativas.");try{return noStore(res).json({ok:true,connection:setAdminConnection({userId:req.params.userId,role:req.body?.role,status:req.body?.status,actorUserId:auth.user.id,reason:req.body?.reason})});}catch(error){return fail(res,400,"ADMIN_CONNECTION_FAILED",error.message);}});
}
