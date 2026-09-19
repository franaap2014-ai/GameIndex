import { createHash, randomUUID } from "node:crypto";
import { db, json, nowIso, parseJson } from "../database/connection.mjs";
import { getGameById } from "../database/repositories/game-repository.mjs";
import { getEntityById } from "../database/repositories/entity-repository.mjs";
import { defaultRoleForEntity, discoverImage3Candidates, evaluateImage3CandidateContext } from "./image-discovery3.mjs";
import { fetchPublicBinary } from "../security/url-safety.mjs";
import { stableId } from "../knowledge/normalize.mjs";
import { runDexterTask } from "../dexter/dexter-service.mjs";

const VALID_MIME=new Set(["image/jpeg","image/png","image/webp","image/gif"]);
const MAX_BYTES=Math.max(250_000,Math.min(12_000_000,Number(process.env.IMAGE_ENGINE3_MAX_BYTES||5_000_000)));
let repairTimer=null,repairBusy=false;

function domain(value=""){try{return new URL(value).hostname.toLowerCase();}catch{return "";}}
function assetIdFor(gameId,entityId,role){return stableId("ie3",gameId,entityId||"GAME",String(role||"COVER").toUpperCase());}
function currentRevisionRow(assetId){return db.prepare(`SELECT * FROM ie3_revisions WHERE asset_id=? ORDER BY revision DESC LIMIT 1`).get(assetId);}
function mapRevision(r){return r?{id:r.id,assetId:r.asset_id,revision:Number(r.revision),legacyImageId:r.legacy_image_id,sourceUrl:r.source_url,sourcePageUrl:r.source_page_url,sourceDomain:r.source_domain,mimeType:r.mime_type,width:Number(r.width||0),height:Number(r.height||0),byteSize:Number(r.byte_size||0),checksumSha256:r.checksum_sha256,deterministicScore:Number(r.deterministic_score||0),semanticStatus:r.semantic_status,semanticConfidence:Number(r.semantic_confidence||0),validation:parseJson(r.validation_json,{}),createdAt:r.created_at,publicPath:`/media/v3/images/${encodeURIComponent(r.asset_id)}/rev/${Number(r.revision)}`}:null;}
function mapAsset(r,{withRevision=true}={}){if(!r)return null;const revision=withRevision?mapRevision(currentRevisionRow(r.id)):null;return {id:r.id,gameId:r.game_id,entityId:r.entity_id,imageRole:r.image_role,state:r.state,currentRevision:Number(r.current_revision||0),browserStatus:r.browser_status,repairCount:Number(r.repair_count||0),maxRepairs:Number(r.max_repairs||4),lastReasonCode:r.last_reason_code,lastCandidateAt:r.last_candidate_at,lastReadyAt:r.last_ready_at,createdAt:r.created_at,updatedAt:r.updated_at,revision,publicPath:revision?.publicPath||null,ready:r.state==="READY"&&r.browser_status==="REAL_IMAGE_PASS"};}
export function getImage3Asset(id){return mapAsset(db.prepare(`SELECT * FROM ie3_assets WHERE id=?`).get(id));}
export function currentImage3Asset({gameId,entityId=null,role=null}={}){const args=[gameId];let sql=`SELECT * FROM ie3_assets WHERE game_id=?`;if(entityId){sql+=` AND entity_id=?`;args.push(entityId);}else sql+=` AND entity_id IS NULL`;if(role){sql+=` AND image_role=?`;args.push(String(role).toUpperCase());}sql+=` ORDER BY CASE state WHEN 'READY' THEN 0 WHEN 'SAME_ORIGIN_PUBLIC_MEDIA' THEN 1 ELSE 2 END,current_revision DESC,updated_at DESC LIMIT 1`;return mapAsset(db.prepare(sql).get(...args));}

function ensureAsset({gameId,entityId=null,role="COVER"}){const id=assetIdFor(gameId,entityId,role),now=nowIso();db.prepare(`INSERT INTO ie3_assets(id,game_id,entity_id,image_role,state,current_revision,browser_status,repair_count,max_repairs,last_reason_code,last_candidate_at,last_ready_at,created_at,updated_at) VALUES(?,?,?,?, 'IMAGE_REQUEST',0,'NOT_TESTED',0,4,'','','',?,?) ON CONFLICT(id) DO UPDATE SET updated_at=excluded.updated_at`).run(id,gameId,entityId,String(role).toUpperCase(),now,now);return getImage3Asset(id);}
function recordAttempt(assetId,{candidateId=null,stage,status,reasonCode="",details={}}={}){db.prepare(`INSERT INTO ie3_attempts(id,asset_id,candidate_id,stage,status,reason_code,details_json,created_at) VALUES(?,?,?,?,?,?,?,?)`).run(`ie3-attempt-${randomUUID()}`,assetId,candidateId,stage,status,String(reasonCode||"").slice(0,120),json(details),nowIso());}
function upsertCandidate(asset,legacy,{score=0,state="DISCOVERED",reasonCode=""}={}){const url=String(legacy.originalUrl||legacy.url||"");if(!url)return null;const id=stableId("ie3-candidate",asset.id,url),now=nowIso();db.prepare(`INSERT INTO ie3_candidates(id,asset_id,candidate_url,source_page_url,title,source_type,state,deterministic_score,semantic_status,reason_code,attempt_count,discovered_at,updated_at) VALUES(?,?,?,?,?,?,?,?,'NOT_REQUIRED',?,0,?,?) ON CONFLICT(asset_id,candidate_url) DO UPDATE SET deterministic_score=MAX(ie3_candidates.deterministic_score,excluded.deterministic_score),updated_at=excluded.updated_at`).run(id,asset.id,url,legacy.sourceUrl||"",legacy.title||legacy.subject||"",legacy.sourceType||"IMAGE_ENGINE3_DISCOVERY",state,Number(score||0),reasonCode,now,now);return db.prepare(`SELECT * FROM ie3_candidates WHERE id=?`).get(id);}
function deterministicVerdict(asset,image){
  if(!image)return {accepted:false,score:0,reasonCode:"MISSING_CANDIDATE"};
  if(image.gameId!==asset.gameId)return {accepted:false,score:0,reasonCode:"WRONG_GAME"};
  if(asset.entityId&&image.entityId!==asset.entityId)return {accepted:false,score:0,reasonCode:image.entityId?"WRONG_ENTITY":"GAME_COVER_CANNOT_SATISFY_ENTITY"};
  if(!asset.entityId&&image.entityId)return {accepted:false,score:.1,reasonCode:"ENTITY_MEDIA_CANNOT_SATISFY_GAME"};
  const role=String(image.role||"").toUpperCase();if(role!==asset.imageRole)return {accepted:false,score:.25,reasonCode:"WRONG_ROLE"};
  const game=getGameById(asset.gameId),entity=asset.entityId?getEntityById(asset.entityId):null;
  const context=evaluateImage3CandidateContext({title:image.title||image.subject||"",sourceUrl:image.sourceUrl||image.url||"",game:game?.nome||game?.name||"",subject:entity?.name||game?.nome||game?.name||"",role:asset.imageRole,entity:Boolean(entity)});
  if(!context.accepted)return {accepted:false,score:.05,reasonCode:context.reasonCode};
  if(image.width&&image.height&&Math.min(Number(image.width),Number(image.height))<120)return {accepted:false,score:.2,reasonCode:"TINY_IMAGE"};
  const confidence=Number(image.confidence||0),ctx=(Number(image.gameConfidence||0)+Number(image.subjectConfidence||0)+Number(image.roleConfidence||0))/3;
  const score=Math.max(0,Math.min(1,.45+.25*confidence+.30*ctx));
  return {accepted:score>=.62,score,reasonCode:score>=.62?"DETERMINISTIC_ACCEPT":"LOW_CONTEXT_CONFIDENCE",requiresSemantic:score>=.50&&score<.72};
}
function sniffDimensions(bytes,mime){
  const b=Buffer.from(bytes);try{
    if(mime==="image/png"&&b.length>=24&&b.toString("ascii",1,4)==="PNG")return {width:b.readUInt32BE(16),height:b.readUInt32BE(20)};
    if(mime==="image/gif"&&b.length>=10)return {width:b.readUInt16LE(6),height:b.readUInt16LE(8)};
    if(mime==="image/webp"&&b.length>=30&&b.toString("ascii",0,4)==="RIFF"&&b.toString("ascii",8,12)==="WEBP"){
      const kind=b.toString("ascii",12,16);if(kind==="VP8X")return {width:1+b.readUIntLE(24,3),height:1+b.readUIntLE(27,3)};
    }
    if(mime==="image/jpeg"&&b.length>4){let i=2;while(i+9<b.length){if(b[i]!==0xff){i++;continue;}const marker=b[i+1],len=b.readUInt16BE(i+2);if([0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb,0xcd,0xce,0xcf].includes(marker))return {height:b.readUInt16BE(i+5),width:b.readUInt16BE(i+7)};if(len<2)break;i+=2+len;}}
  }catch{}return {width:0,height:0};
}
async function semanticEscalation(asset,image,binary,verdict){
  if(!verdict.requiresSemantic)return {accepted:verdict.accepted,confidence:verdict.score,reasonCode:verdict.reasonCode,status:"NOT_REQUIRED"};
  const game=getGameById(asset.gameId),entity=asset.entityId?getEntityById(asset.entityId):null;
  const result=await runDexterTask({taskType:"IMAGE_SEMANTIC_REVIEW",gameId:asset.gameId,entityId:asset.entityId,input:{game:game?.nome||game?.name,entity:entity?.name||null,role:asset.imageRole,candidateTitle:image.title||image.subject||"",sourceDomain:image.sourceDomain||domain(image.sourceUrl),deterministicScore:verdict.score},system:"You are Dexter Vision. Decide only whether the supplied image is contextually correct for the requested GameIndex subject. Be conservative. reasonCode must be short uppercase snake case.",prompt:`Return JSON {"accepted":boolean,"confidence":0..1,"reasonCode":"..."}. Requested game=${game?.nome||game?.name}; entity=${entity?.name||"GAME"}; role=${asset.imageRole}.`,images:[Buffer.from(binary.bytes)]});
  if(!result.ok)return {accepted:verdict.accepted&&verdict.score>=.65,confidence:verdict.score,reasonCode:result.reasonCode||"DEXTER_UNAVAILABLE",status:"UNAVAILABLE"};
  return {accepted:Boolean(result.data.accepted)&&Number(result.data.confidence)>=.62,confidence:Number(result.data.confidence||0),reasonCode:String(result.data.reasonCode||"DEXTER_VERDICT"),status:"DEXTER_VERIFIED"};
}
function persistRevision(asset,image,binary,{score,semantic}={}){
  const bytes=Buffer.from(binary.bytes),mime=String(binary.mimeType||binary.contentType||image.mimeType||"").split(";")[0].trim().toLowerCase();
  if(!VALID_MIME.has(mime))throw Object.assign(new Error("UNSUPPORTED_MIME"),{code:"UNSUPPORTED_MIME"});
  if(!bytes.length||bytes.length>MAX_BYTES)throw Object.assign(new Error("IMAGE_SIZE_INVALID"),{code:"IMAGE_SIZE_INVALID"});
  const inferred=sniffDimensions(bytes,mime),width=Number(image.width||inferred.width||0),height=Number(image.height||inferred.height||0);
  if(width&&height&&Math.min(width,height)<120)throw Object.assign(new Error("TINY_IMAGE"),{code:"TINY_IMAGE"});
  const hash=createHash("sha256").update(bytes).digest("hex"),revision=Math.max(1,Number(asset.currentRevision||0)+1),id=stableId("ie3-revision",asset.id,revision,hash),now=nowIso();
  db.prepare(`INSERT INTO ie3_revisions(id,asset_id,revision,legacy_image_id,source_url,source_page_url,source_domain,mime_type,width,height,byte_size,checksum_sha256,binary_data,deterministic_score,semantic_status,semantic_confidence,validation_json,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(id,asset.id,revision,null,image.originalUrl||image.url||"",image.sourceUrl||"",image.sourceDomain||domain(image.sourceUrl||image.url),mime,width,height,bytes.length,hash,bytes,Number(score||0),semantic?.status||"NOT_REQUIRED",Number(semantic?.confidence||0),json({engine:"3.0",entityBound:Boolean(asset.entityId),gameCoverAsEntity:false,reasonCode:semantic?.reasonCode||"DETERMINISTIC_ACCEPT"}),now);
  db.prepare(`UPDATE ie3_assets SET state='SAME_ORIGIN_PUBLIC_MEDIA',current_revision=?,browser_status='NOT_TESTED',last_reason_code='PERSISTED_PENDING_BROWSER',last_candidate_at=?,updated_at=? WHERE id=?`).run(revision,now,now,asset.id);
  return getImage3Asset(asset.id);
}
async function binaryFor(image){
  const url=String(image.originalUrl||image.url||"");if(!url)throw Object.assign(new Error("CANDIDATE_URL_MISSING"),{code:"CANDIDATE_URL_MISSING"});
  const fetched=await fetchPublicBinary(url,{timeoutMs:Number(process.env.IMAGE_ENGINE3_FETCH_TIMEOUT_MS||9000),maxBytes:MAX_BYTES});
  return {bytes:fetched.bytes,mimeType:fetched.contentType,url:fetched.url,source:"IMAGE_ENGINE3_REMOTE_DISCOVERY"};
}
async function nativeCandidates(asset,game,entity,role,language){
  const rows=await discoverImage3Candidates({game,entity,role,language,limit:Number(process.env.IMAGE_ENGINE3_DISCOVERY_LIMIT||18)});
  return rows.map((row,index)=>({...row,id:null,status:"DISCOVERED",verified:false,confidence:Number(row.confidence||0),gameConfidence:Number(row.gameConfidence||0),subjectConfidence:Number(row.subjectConfidence||0),roleConfidence:Number(row.roleConfidence||0),sourceType:row.sourceType||"IMAGE_ENGINE3_DISCOVERY",discoveryRank:index+1}));
}

export async function resolveImage3({game,entity=null,role=null,language="pt-BR",forceDiscovery=false}={}){
  if(!game?.id)throw new Error("IMAGE_ENGINE3_GAME_REQUIRED");const resolvedRole=String(role||(entity?defaultRoleForEntity(entity):"COVER")).toUpperCase();let asset=ensureAsset({gameId:game.id,entityId:entity?.id||null,role:resolvedRole});
  // HF4: a persisted revision is an asset, even before browser verification. Normal
  // navigation must reuse it instead of rediscovering the internet. Only explicit
  // repair/refresh or detected storage corruption may start discovery again.
  if(!forceDiscovery&&Number(asset.currentRevision)>0){
    const persisted=getImage3Binary(asset.id,asset.currentRevision);
    if(persisted?.bytes?.length&&persisted.checksum)return asset;
    db.prepare(`UPDATE ie3_assets SET state='DEGRADED',last_reason_code='PERSISTED_BINARY_MISSING',updated_at=? WHERE id=?`).run(nowIso(),asset.id);
    recordAttempt(asset.id,{stage:"PERSISTENCE_CHECK",status:"FAILED",reasonCode:"PERSISTED_BINARY_MISSING",details:{revision:asset.currentRevision}});
    asset=getImage3Asset(asset.id);
  }
  db.prepare(`UPDATE ie3_assets SET state='DISCOVERY',last_reason_code='DISCOVERY_STARTED',updated_at=? WHERE id=?`).run(nowIso(),asset.id);
  let candidates=await nativeCandidates(asset,game,entity,resolvedRole,language);
  if(!candidates.length){db.prepare(`UPDATE ie3_assets SET state='DEGRADED',last_reason_code='NO_CANDIDATES',updated_at=? WHERE id=?`).run(nowIso(),asset.id);scheduleImage3Repair(asset.id,"NO_CANDIDATES");return getImage3Asset(asset.id);}
  db.prepare(`UPDATE ie3_assets SET state='CANDIDATE_COLLECTION',updated_at=? WHERE id=?`).run(nowIso(),asset.id);
  for(const image of candidates){
    const verdict=deterministicVerdict(asset,image),candidate=upsertCandidate(asset,image,{score:verdict.score,state:verdict.accepted?"VALIDATING":"REJECTED",reasonCode:verdict.reasonCode});
    if(!verdict.accepted){recordAttempt(asset.id,{candidateId:candidate?.id,stage:"DETERMINISTIC_VALIDATION",status:"REJECTED",reasonCode:verdict.reasonCode});continue;}
    try{
      db.prepare(`UPDATE ie3_assets SET state='DETERMINISTIC_VALIDATION',updated_at=? WHERE id=?`).run(nowIso(),asset.id);
      const binary=await binaryFor(image);const semantic=await semanticEscalation(asset,image,binary,verdict);
      if(!semantic.accepted){db.prepare(`UPDATE ie3_candidates SET state='REJECTED',semantic_status=?,reason_code=?,attempt_count=attempt_count+1,updated_at=? WHERE id=?`).run(semantic.status,semantic.reasonCode,nowIso(),candidate.id);recordAttempt(asset.id,{candidateId:candidate.id,stage:"SEMANTIC_VALIDATION",status:"REJECTED",reasonCode:semantic.reasonCode});continue;}
      asset=persistRevision(asset,image,binary,{score:verdict.score,semantic});db.prepare(`UPDATE ie3_candidates SET state='PERSISTED',semantic_status=?,reason_code=?,attempt_count=attempt_count+1,updated_at=? WHERE id=?`).run(semantic.status,semantic.reasonCode,nowIso(),candidate.id);recordAttempt(asset.id,{candidateId:candidate.id,stage:"PERSISTENT_STORAGE",status:"PASS",reasonCode:"SAME_ORIGIN_PENDING_BROWSER",details:{revision:asset.currentRevision,bytes:asset.revision?.byteSize}});return asset;
    }catch(error){db.prepare(`UPDATE ie3_candidates SET state='FAILED',reason_code=?,attempt_count=attempt_count+1,updated_at=? WHERE id=?`).run(String(error?.code||"CANDIDATE_FAILED"),nowIso(),candidate.id);recordAttempt(asset.id,{candidateId:candidate.id,stage:"DOWNLOAD_PERSIST",status:"FAILED",reasonCode:error?.code||"CANDIDATE_FAILED",details:{message:String(error?.message||error).slice(0,300)}});}
  }
  db.prepare(`UPDATE ie3_assets SET state='DEGRADED',last_reason_code='CANDIDATES_EXHAUSTED',updated_at=? WHERE id=?`).run(nowIso(),asset.id);scheduleImage3Repair(asset.id,"CANDIDATES_EXHAUSTED");return getImage3Asset(asset.id);
}

export function getImage3Binary(assetId,revision){const r=db.prepare(`SELECT binary_data,mime_type,byte_size,checksum_sha256,width,height FROM ie3_revisions WHERE asset_id=? AND revision=?`).get(assetId,Number(revision));return r?.binary_data?{bytes:r.binary_data,mimeType:r.mime_type,byteSize:Number(r.byte_size||r.binary_data.length),checksum:r.checksum_sha256,width:Number(r.width||0),height:Number(r.height||0)}:null;}
export function registerImage3BrowserResult({assetId,revision,width=0,height=0,contextMatch=true}={}){const asset=getImage3Asset(assetId);if(!asset)return {ok:false,reasonCode:"ASSET_NOT_FOUND"};if(Number(revision)!==asset.currentRevision)return {ok:false,reasonCode:"STALE_REVISION",currentRevision:asset.currentRevision};const binary=getImage3Binary(assetId,revision);const pass=Boolean(binary&&contextMatch&&Number(width)>0&&Number(height)>0);const now=nowIso();db.prepare(`UPDATE ie3_assets SET state=?,browser_status=?,last_reason_code=?,last_ready_at=?,updated_at=? WHERE id=?`).run(pass?"READY":"DEGRADED",pass?"REAL_IMAGE_PASS":"BROWSER_VERIFY_FAILED",pass?"REAL_IMAGE_PASS":"BROWSER_VERIFY_FAILED",pass?now:"",now,assetId);recordAttempt(assetId,{stage:"BROWSER_VERIFY",status:pass?"PASS":"FAILED",reasonCode:pass?"REAL_IMAGE_PASS":"BROWSER_VERIFY_FAILED",details:{width:Number(width),height:Number(height),contextMatch:Boolean(contextMatch)}});if(!pass)scheduleImage3Repair(assetId,"BROWSER_VERIFY_FAILED");return {ok:pass,asset:getImage3Asset(assetId),manualApprovalRequired:false};}

export function scheduleImage3Repair(assetId,reason="DEGRADED"){
  const asset=getImage3Asset(assetId);if(!asset||asset.repairCount>=asset.maxRepairs)return {queued:false,reason:"MAX_REPAIRS_OR_MISSING"};const existing=db.prepare(`SELECT id FROM gi_repair_actions WHERE action_type='IMAGE_REPAIR' AND subject_id=? AND status IN ('QUEUED','RUNNING') LIMIT 1`).get(assetId);if(existing)return {queued:false,reused:true,id:existing.id};const id=`repair-${randomUUID()}`;db.prepare(`INSERT INTO gi_repair_actions(id,action_type,subject_type,subject_id,status,result_json,created_by,created_at,completed_at) VALUES(?,'IMAGE_REPAIR','IMAGE_ASSET',?,'QUEUED',?,NULL,?,'')`).run(id,assetId,json({reason}),nowIso());db.prepare(`UPDATE ie3_assets SET state='REPAIR_SCHEDULED',last_reason_code=?,updated_at=? WHERE id=?`).run(reason,nowIso(),assetId);return {queued:true,id};
}
async function processRepairRow(row){const asset=getImage3Asset(row.subject_id);if(!asset){db.prepare(`UPDATE gi_repair_actions SET status='FAILED',result_json=?,completed_at=? WHERE id=?`).run(json({reason:"ASSET_NOT_FOUND"}),nowIso(),row.id);return;}db.prepare(`UPDATE gi_repair_actions SET status='RUNNING' WHERE id=?`).run(row.id);db.prepare(`UPDATE ie3_assets SET repair_count=repair_count+1,updated_at=? WHERE id=?`).run(nowIso(),asset.id);const game=getGameById(asset.gameId),entity=asset.entityId?getEntityById(asset.entityId):null;try{const result=await resolveImage3({game,entity,role:asset.imageRole,forceDiscovery:true});db.prepare(`UPDATE gi_repair_actions SET status='COMPLETED',result_json=?,completed_at=? WHERE id=?`).run(json({state:result.state,revision:result.currentRevision,reasonCode:result.lastReasonCode}),nowIso(),row.id);}catch(error){db.prepare(`UPDATE gi_repair_actions SET status='FAILED',result_json=?,completed_at=? WHERE id=?`).run(json({reason:String(error?.code||error?.message||"REPAIR_FAILED")}),nowIso(),row.id);}}
export function startImageEngine3RepairWorker(){if(repairTimer)return {enabled:true};const tick=async()=>{if(repairBusy)return;repairBusy=true;try{const row=db.prepare(`SELECT * FROM gi_repair_actions WHERE action_type='IMAGE_REPAIR' AND status='QUEUED' ORDER BY created_at LIMIT 1`).get();if(row)await processRepairRow(row);}finally{repairBusy=false;}};repairTimer=setInterval(()=>tick().catch(()=>{}),8000);repairTimer.unref?.();tick().catch(()=>{});return {enabled:true};}

export function imageEngine3Summary(){const scalar=(sql,args=[])=>Number(db.prepare(sql).get(...args)?.count||0),bytes=Number(db.prepare(`SELECT COALESCE(SUM(byte_size),0) bytes FROM ie3_revisions`).get()?.bytes||0);return {engine:"3.0",authoritative:true,manualApprovalRequired:false,stored:scalar(`SELECT COUNT(*) count FROM ie3_assets WHERE current_revision>0`),ready:scalar(`SELECT COUNT(*) count FROM ie3_assets WHERE state='READY' AND browser_status='REAL_IMAGE_PASS'`),browserVerified:scalar(`SELECT COUNT(*) count FROM ie3_assets WHERE browser_status='REAL_IMAGE_PASS'`),degraded:scalar(`SELECT COUNT(*) count FROM ie3_assets WHERE state='DEGRADED'`),repairQueued:scalar(`SELECT COUNT(*) count FROM gi_repair_actions WHERE action_type='IMAGE_REPAIR' AND status='QUEUED'`),candidateBacklog:scalar(`SELECT COUNT(*) count FROM ie3_candidates WHERE state IN ('DISCOVERED','VALIDATING')`),bytes,apiKeyRequired:false};}
export function image3AssetDetail(id,{candidateLimit=50,attemptLimit=100}={}){const asset=getImage3Asset(id);if(!asset)return null;return {...asset,candidates:db.prepare(`SELECT id,candidate_url,source_page_url,title,source_type,state,deterministic_score,semantic_status,reason_code,attempt_count,discovered_at,updated_at FROM ie3_candidates WHERE asset_id=? ORDER BY deterministic_score DESC,updated_at DESC LIMIT ?`).all(id,Math.min(200,Number(candidateLimit)||50)),attempts:db.prepare(`SELECT id,candidate_id,stage,status,reason_code,details_json,created_at FROM ie3_attempts WHERE asset_id=? ORDER BY created_at DESC LIMIT ?`).all(id,Math.min(300,Number(attemptLimit)||100)).map(x=>({...x,details:parseJson(x.details_json,{})}))};}
