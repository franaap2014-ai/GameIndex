import { currentAuth } from "../auth/auth-service.mjs";
import { clearSelectedProfileAvatar } from "../database/repositories/profile-avatar-repository.mjs";
import { requireAdmin, adminSession } from "../admin/admin-auth.mjs";
import { analyzeGameInput, addGameV2, buildInitialKnowledgeForGame } from "../admin/game-onboarding.mjs";
import { adminDashboard, listAdminActions, logAdminAction } from "../database/repositories/admin-repository.mjs";
import { listUsers } from "../database/repositories/user-repository.mjs";
import { buildProfile, buildPublicProfile, canViewPublicProfile } from "../users/profile-service.mjs";
import { updateProfile, ensureProfile, getProfileByUsername, listProfiles } from "../database/repositories/profile-repository.mjs";
import { acceptFriendRequest, cancelFriendRequest, declineFriendRequest, followUser, isUserFollowing, listFollowers, listFollowing, listFriends, listFriendRequests, removeFriend, requestFriend, unfollowUser } from "../database/repositories/social-repository.mjs";
import { deleteAvatarByUrl, saveAvatarDataUrl } from "../uploads/avatar-service.mjs";
import { generateArticle } from "../articles/article-ai.mjs";
import { getArticleById, listArticles, listArticleValidations, setArticleStatus } from "../database/repositories/article-repository.mjs";
import { getGameById, getGameBySlug, listGames, setGameStatus } from "../database/repositories/game-repository.mjs";
import { getEntityById } from "../database/repositories/entity-repository.mjs";
import { listKnowledge, markKnowledgeStatus } from "../database/repositories/knowledge-repository.mjs";
import { db } from "../database/connection.mjs";
import { getImage3Asset, imageEngine3Summary } from "../images/image-engine3.mjs";
import { beta065KnowledgeReport } from "../database/seed-beta065.mjs";
import { listCoverage } from "../database/repositories/coverage-repository.mjs";

function auth(req,res){const s=currentAuth(req);if(!s){res.status(401).json({erro:"Faça login para continuar."});return null;}ensureProfile(s.user.id);return s;}
function targetByUsername(username){const p=getProfileByUsername(username);if(!p)throw new Error("Perfil não encontrado.");return p;}
function targetById(userId){const p=ensureProfile(String(userId||""));if(!p)throw new Error("Perfil não encontrado.");return p;}
function asError(res,error,status=400){return res.status(status).json({erro:error?.message||"Falha na operação."});}

export function registerBeta065Routes(app,{brainLimiter}={}){
  app.get("/api/beta065/status",(req,res)=>res.json({version:"Beta 0.65",focus:["Article AI","Triple Safety","Knowledge Mega Update","Social Profile","Admin","Mobile"],admin:Boolean(adminSession(req))}));

  app.patch("/api/profile",(req,res)=>{const s=auth(req,res);if(!s)return;try{res.json({profile:updateProfile(s.user.id,req.body||{})});}catch(e){asError(res,e);}});
  app.post("/api/profile/avatar",(req,res)=>{const s=auth(req,res);if(!s)return;let saved=null;try{const current=ensureProfile(s.user.id);saved=saveAvatarDataUrl(req.body?.dataUrl);const profile=updateProfile(s.user.id,{avatarUrl:saved.url});clearSelectedProfileAvatar(s.user.id);if(current?.avatarUrl&&current.avatarUrl!==saved.url&&!String(current.avatarUrl).startsWith("/assets/profile-avatars/"))deleteAvatarByUrl(current.avatarUrl);res.json({profile,avatarUrl:profile.avatarDisplayUrl||saved.url,asset:{mimeType:saved.mimeType,sizeBytes:saved.sizeBytes,width:saved.width,height:saved.height,revision:profile.avatarRevision}});}catch(e){if(saved?.url)deleteAvatarByUrl(saved.url);asError(res,e);}});
  app.get("/api/profile/social",(req,res)=>{const s=auth(req,res);if(!s)return;res.json({followers:listFollowers(s.user.id),following:listFollowing(s.user.id),friends:listFriends(s.user.id),incomingRequests:listFriendRequests(s.user.id,{incoming:true}),outgoingRequests:listFriendRequests(s.user.id,{incoming:false})});});
  app.get("/api/users",(req,res)=>{const viewer=currentAuth(req);const viewerId=viewer?.user?.id||null;const profiles=listProfiles({q:req.query.q||"",limit:req.query.limit||30,offset:req.query.offset||0}).filter(profile=>canViewPublicProfile(profile.userId,viewerId)).map(profile=>({...profile,profileUrl:`/user.html?id=${encodeURIComponent(profile.userId)}`}));res.json({profiles});});
  app.get("/api/users/id/:userId",(req,res)=>{const viewer=currentAuth(req);const p=buildPublicProfile({userId:req.params.userId,viewerId:viewer?.user?.id||null});if(!p)return res.status(404).json({erro:"Perfil não encontrado."});res.json(p);});
  app.get("/api/users/:username",(req,res)=>{const viewer=currentAuth(req);const p=buildPublicProfile({username:req.params.username,viewerId:viewer?.user?.id||null});if(!p)return res.status(404).json({erro:"Perfil não encontrado."});res.json(p);});
  app.post("/api/users/id/:userId/follow",(req,res)=>{const s=auth(req,res);if(!s)return;try{const t=targetById(req.params.userId);followUser(s.user.id,t.userId);res.json({following:true});}catch(e){asError(res,e);}});
  app.delete("/api/users/id/:userId/follow",(req,res)=>{const s=auth(req,res);if(!s)return;try{const t=targetById(req.params.userId);unfollowUser(s.user.id,t.userId);res.json({following:false});}catch(e){asError(res,e);}});
  app.post("/api/users/id/:userId/friend-request",(req,res)=>{const s=auth(req,res);if(!s)return;try{const t=targetById(req.params.userId);res.json(requestFriend(s.user.id,t.userId));}catch(e){asError(res,e);}});
  app.delete("/api/friends/id/:userId",(req,res)=>{const s=auth(req,res);if(!s)return;try{const t=targetById(req.params.userId);res.json(removeFriend(s.user.id,t.userId));}catch(e){asError(res,e);}});
  app.post("/api/users/:username/follow",(req,res)=>{const s=auth(req,res);if(!s)return;try{const t=targetByUsername(req.params.username);followUser(s.user.id,t.userId);res.json({following:true});}catch(e){asError(res,e);}});
  app.delete("/api/users/:username/follow",(req,res)=>{const s=auth(req,res);if(!s)return;try{const t=targetByUsername(req.params.username);unfollowUser(s.user.id,t.userId);res.json({following:false});}catch(e){asError(res,e);}});
  app.post("/api/users/:username/friend-request",(req,res)=>{const s=auth(req,res);if(!s)return;try{const t=targetByUsername(req.params.username);res.json(requestFriend(s.user.id,t.userId));}catch(e){asError(res,e);}});
  app.post("/api/friends/requests/:id/accept",(req,res)=>{const s=auth(req,res);if(!s)return;try{res.json(acceptFriendRequest(req.params.id,s.user.id));}catch(e){asError(res,e);}});
  app.post("/api/friends/requests/:id/decline",(req,res)=>{const s=auth(req,res);if(!s)return;try{res.json(declineFriendRequest(req.params.id,s.user.id));}catch(e){asError(res,e);}});
  app.delete("/api/friends/requests/:id",(req,res)=>{const s=auth(req,res);if(!s)return;try{res.json(cancelFriendRequest(req.params.id,s.user.id));}catch(e){asError(res,e);}});
  app.delete("/api/friends/:username",(req,res)=>{const s=auth(req,res);if(!s)return;try{const t=targetByUsername(req.params.username);res.json(removeFriend(s.user.id,t.userId));}catch(e){asError(res,e);}});

  app.get("/api/articles",(req,res)=>{
    const game=req.query.game?getGameBySlug(String(req.query.game)):null;
    const admin=adminSession(req);
    if(req.query.game&&!game)return res.json({entries:[],total:0,limit:Math.min(200,Math.max(1,Number(req.query.limit)||30)),offset:Math.max(0,Number(req.query.offset)||0)});
    if(game&&game.status!=="PUBLISHED"&&!admin)return res.json({entries:[],total:0,limit:Math.min(200,Math.max(1,Number(req.query.limit)||30)),offset:Math.max(0,Number(req.query.offset)||0)});
    const status=admin&&req.query.status?String(req.query.status):"PUBLISHED";
    const result=listArticles({gameId:game?.id||null,status,language:req.query.lang||null,limit:req.query.limit||30,offset:req.query.offset||0});
    if(admin)return res.json(result);
    const entries=result.entries.filter(article=>getGameById(article.gameId)?.status==="PUBLISHED");
    res.json({...result,entries,total:entries.length});
  });
  app.get("/api/articles/:id",(req,res)=>{
    const a=getArticleById(req.params.id);if(!a)return res.status(404).json({erro:"Artigo não encontrado."});
    const admin=adminSession(req);const game=getGameById(a.gameId);
    if((a.status!=="PUBLISHED"||game?.status!=="PUBLISHED")&&!admin)return res.status(404).json({erro:"Artigo não encontrado."});
    const entity=a.entityId?getEntityById(a.entityId):null;
    res.json({...a,game,entity,validations:admin?listArticleValidations(a.id):undefined});
  });

  app.get("/api/admin/me",requireAdmin,(req,res)=>res.json({admin:true,user:req.gameVaultAdmin.user}));
  app.get("/api/admin/dashboard",requireAdmin,(req,res)=>res.json(adminDashboard()));
  app.get("/api/admin/games",requireAdmin,(req,res)=>res.json({entries:listGames({includeDrafts:true})}));
  app.get("/api/admin/actions",requireAdmin,(req,res)=>res.json({entries:listAdminActions({limit:req.query.limit||50})}));
  app.get("/api/admin/users",requireAdmin,(req,res)=>res.json({entries:listUsers({q:req.query.q||"",limit:req.query.limit||50,offset:req.query.offset||0})}));
  app.post("/api/admin/games/analyze",requireAdmin,(req,res)=>{try{res.json(analyzeGameInput(req.body||{}));}catch(e){asError(res,e);}});
  app.post("/api/admin/games",requireAdmin,(req,res)=>{try{const result=addGameV2(req.body||{},req.body?.options||{});logAdminAction({adminUserId:req.gameVaultAdmin.user.id,actionType:"ADD_GAME",targetType:"GAME",targetId:result.game.id,metadata:{slug:result.game.slug,knowledgeCreated:result.knowledgeCreated}});res.status(201).json(result);}catch(e){asError(res,e);}});
  app.post("/api/admin/games/:id/status",requireAdmin,(req,res)=>{try{const status=String(req.body?.status||"");const game=setGameStatus(req.params.id,status);if(!game)return res.status(404).json({erro:"Jogo não encontrado."});logAdminAction({adminUserId:req.gameVaultAdmin.user.id,actionType:"GAME_STATUS",targetType:"GAME",targetId:game.id,metadata:{status}});res.json({game});}catch(e){asError(res,e);}});
  app.post("/api/admin/games/:slug/build-knowledge",requireAdmin,(req,res)=>{try{const game=getGameBySlug(req.params.slug);if(!game)return res.status(404).json({erro:"Jogo não encontrado."});const rows=buildInitialKnowledgeForGame(game,{minimum:Math.min(100,Math.max(12,Number(req.body?.minimum||24)))});logAdminAction({adminUserId:req.gameVaultAdmin.user.id,actionType:"BUILD_GAME_KNOWLEDGE",targetType:"GAME",targetId:game.id,metadata:{created:rows.length}});res.json({created:rows.length});}catch(e){asError(res,e);}});
  app.post("/api/admin/articles/generate",requireAdmin,brainLimiter||((req,res,next)=>next()),(req,res)=>{try{const article=generateArticle({game:req.body?.game,entity:req.body?.entity||null,language:req.body?.language||"pt-BR",title:req.body?.title||null,articleType:req.body?.articleType||null,createdBy:`ADMIN:${req.gameVaultAdmin.user.id}`});logAdminAction({adminUserId:req.gameVaultAdmin.user.id,actionType:"GENERATE_ARTICLE",targetType:"ARTICLE",targetId:article.id,metadata:{status:article.status}});res.status(201).json(article);}catch(e){asError(res,e);}});
  app.get("/api/admin/articles",requireAdmin,(req,res)=>res.json(listArticles({status:req.query.status||null,gameId:req.query.gameId||null,limit:req.query.limit||50,offset:req.query.offset||0})));
  app.post("/api/admin/articles/:id/status",requireAdmin,(req,res)=>{try{const requested=String(req.body?.status||"");const current=getArticleById(req.params.id);if(!current)return res.status(404).json({erro:"Artigo não encontrado."});if(new Set(["APPROVED","PUBLISHED"]).has(requested)){const checks=listArticleValidations(current.id);const required=new Set(["FACT_SAFETY","SOURCE_SAFETY","CONTEXT_SAFETY"]);const types=new Set(checks.map(c=>c.type));const safe=checks.length>=3&&required.size===types.size&&[...required].every(type=>types.has(type))&&checks.every(c=>c.result==="PASS");if(!safe)return res.status(409).json({erro:"O artigo ainda não passou pelos três níveis do Triple Safety. Revalide ou pesquise antes de aprovar/publicar."});if(requested==="PUBLISHED"){const game=getGameById(current.gameId);if(!game||game.status!=="PUBLISHED")return res.status(409).json({erro:"Publique o jogo antes de publicar seus artigos."});}}const article=setArticleStatus(req.params.id,requested);logAdminAction({adminUserId:req.gameVaultAdmin.user.id,actionType:"ARTICLE_STATUS",targetType:"ARTICLE",targetId:article.id,metadata:{status:article.status}});res.json({article});}catch(e){asError(res,e);}});
  app.get("/api/admin/knowledge/report",requireAdmin,(req,res)=>res.json({games:beta065KnowledgeReport()}));
  app.get("/api/admin/knowledge/:gameId",requireAdmin,(req,res)=>res.json(listKnowledge({gameId:req.params.gameId,limit:req.query.limit||200,offset:req.query.offset||0})));
  app.post("/api/admin/knowledge/:id/status",requireAdmin,(req,res)=>{const status=String(req.body?.status||"");if(!new Set(["CURRENT","VALIDATED","OUTDATED","CONFLICTED","UNVERIFIED","REJECTED","SUPERSEDED"]).has(status))return res.status(400).json({erro:"Status inválido."});markKnowledgeStatus(req.params.id,status);logAdminAction({adminUserId:req.gameVaultAdmin.user.id,actionType:"KNOWLEDGE_STATUS",targetType:"KNOWLEDGE",targetId:req.params.id,metadata:{status}});res.json({ok:true,status});});
  app.get("/api/admin/images/:gameId",requireAdmin,(req,res)=>{const ids=db.prepare(`SELECT id FROM ie3_assets WHERE game_id=? ORDER BY updated_at DESC LIMIT 200`).all(req.params.gameId);res.json({engine:"IMAGE_ENGINE_3",metrics:imageEngine3Summary(),entries:ids.map(x=>getImage3Asset(x.id)).filter(Boolean)});});
  app.post("/api/admin/images/:id/status",requireAdmin,(req,res)=>res.status(410).json({ok:false,error:{code:"LEGACY_IMAGE_APPROVAL_REMOVED",message:"A aprovação manual de imagens foi removida. Image Engine 3 valida e repara automaticamente."}}));
  app.get("/api/admin/coverage",requireAdmin,(req,res)=>res.json({games:listGames({includeDrafts:true}).map(g=>({game:g,coverage:listCoverage(g.id)}))}));
}
