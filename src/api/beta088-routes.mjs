import { currentAuth } from "../auth/auth-service.mjs";
import { requireAdmin } from "../admin/admin-auth.mjs";
import { requireDevArea, devAccessSnapshot, recordAuthorizationDiagnostic } from "../admin/dev-access.mjs";
import { schemaVersion } from "../database/connection.mjs";
import { pageFlowRuns, getFlowRun, flowMetrics } from "../database/repositories/flow-repository.mjs";
import { listBugs, getBug, bugHistory, createBug, updateBug, bugMetrics } from "../database/repositories/bug-tracker-repository.mjs";
import { db } from "../database/connection.mjs";
import { image3AssetDetail, imageEngine3Summary } from "../images/image-engine3.mjs";
import { logAdminAction } from "../database/repositories/admin-repository.mjs";
import { bugContractState } from "../database/repositories/release-contract-repository.mjs";

function user(req){return currentAuth(req)?.user||null;}
export function registerBeta088Routes(app){
  app.get("/api/beta088/status",(req,res)=>res.json({product:"GameIndex",version:"Beta 0.88",codename:"Diagnostics & Recovery",ai:"Dexter IA",aiSystem:"5.0",flowInspector:"V1",bugTracker:"V1",imageIntent:"V1",schema:schemaVersion()}));

  app.get("/api/admin/dev-access",requireAdmin,(req,res)=>{const area=String(req.query.area||"DATABASE_EXPLORER").toUpperCase();res.json(recordAuthorizationDiagnostic(devAccessSnapshot(req,area),area));});

  app.get("/api/admin/flows",requireDevArea("AI_FLOW_INSPECTOR"),(req,res)=>{const page=pageFlowRuns({page:req.query.page||1,limit:req.query.limit||25,status:req.query.status||null,component:req.query.component||null,requestId:req.query.requestId||null,since:req.query.since||null});res.json({metrics:flowMetrics(),entries:page.entries,pagination:{total:page.total,page:page.page,limit:page.limit,pages:page.pages,hasMore:page.hasMore}});});
  app.get("/api/admin/flows/:id",requireDevArea("AI_FLOW_INSPECTOR"),(req,res)=>{const flow=getFlowRun(req.params.id);if(!flow)return res.status(404).json({erro:"Flow não encontrado."});res.json(flow);});

  app.get("/api/admin/bugs",requireDevArea("BUG_TRACKER"),(req,res)=>{const entries=listBugs({limit:req.query.limit||150,status:req.query.status||null,severity:req.query.severity||null,q:req.query.q||""}).map(b=>({...b,contractState:bugContractState(b.id)}));res.json({metrics:bugMetrics(),entries});});
  app.get("/api/admin/bugs/:id",requireDevArea("BUG_TRACKER"),(req,res)=>{const data=bugHistory(req.params.id);if(!data)return res.status(404).json({erro:"Bug não encontrado."});res.json({...data,contractState:bugContractState(data.bug.id)});});
  app.post("/api/admin/bugs",requireDevArea("BUG_TRACKER"),(req,res)=>{try{const u=user(req);const bug=createBug(req.body||{},u?.id||null);logAdminAction({adminUserId:u.id,actionType:"CREATE_BUG",targetType:"BUG",targetId:bug.bugCode,metadata:{severity:bug.severity,category:bug.category}});res.status(201).json({ok:true,bug});}catch(error){res.status(400).json({erro:error.message});}});
  app.patch("/api/admin/bugs/:id",requireDevArea("BUG_TRACKER"),(req,res)=>{try{const u=user(req),before=getBug(req.params.id),bug=updateBug(req.params.id,req.body||{},u?.id||null);logAdminAction({adminUserId:u.id,actionType:"UPDATE_BUG",targetType:"BUG",targetId:bug.bugCode,metadata:{beforeStatus:before?.status,afterStatus:bug.status}});res.json({ok:true,bug});}catch(error){res.status(400).json({erro:error.message});}});

  app.get("/api/admin/image-flows",requireDevArea("IMAGE_DIAGNOSTICS"),(req,res)=>{const args=[];let where="1=1";if(req.query.gameId){where="game_id=?";args.push(req.query.gameId);}const ids=db.prepare(`SELECT id FROM ie3_assets WHERE ${where} ORDER BY updated_at DESC LIMIT ?`).all(...args,Math.min(100,Number(req.query.limit)||80));res.json({engine:"IMAGE_ENGINE_3",summary:imageEngine3Summary(),entries:ids.map(x=>image3AssetDetail(x.id,{candidateLimit:8,attemptLimit:15})).filter(Boolean)});});
  app.get("/api/admin/image-flows/:id",requireDevArea("IMAGE_DIAGNOSTICS"),(req,res)=>{const asset=image3AssetDetail(req.params.id,{candidateLimit:50,attemptLimit:100});if(!asset)return res.status(404).json({erro:"Ativo Image Engine 3 não encontrado."});res.json({engine:"IMAGE_ENGINE_3",asset});});
}
