import { randomUUID } from "node:crypto";
import { existsSync, readdirSync, statSync } from "node:fs";
import { backupsDir, db, databasePath, json, latestBackup, nowIso, parseJson, schemaVersion, verifyDatabase } from "../connection.mjs";
import { brainMetrics } from "./brain-metrics-repository.mjs";
import { imageEngine3Summary } from "../../images/image-engine3.mjs";
import { recommendationMetrics } from "./interest-repository.mjs";
import { reviewMetrics } from "./review-repository.mjs";
import { subscriptionMetrics } from "./subscription-repository.mjs";
import { autonomousGenerationStatus } from "../../autonomy/autonomous-generation.mjs";
import { billingStatus } from "../../subscriptions/subscription-service.mjs";
import { traceMetrics } from "./ai-trace-repository.mjs";
import { PUBLIC_VERSION } from "../../config/release-099i6.mjs";
export function logAdminAction({adminUserId,actionType,targetType="",targetId="",metadata={}}){const id=randomUUID();db.prepare(`INSERT INTO admin_actions(id,admin_user_id,action_type,target_type,target_id,metadata_json,created_at) VALUES(?,?,?,?,?,?,?)`).run(id,adminUserId,actionType,targetType,targetId,json(metadata),nowIso());return id;}
export function listAdminActions({limit=50}={}){return db.prepare(`SELECT * FROM admin_actions ORDER BY created_at DESC LIMIT ?`).all(Math.min(200,Math.max(1,Number(limit)||50))).map(r=>({id:r.id,adminUserId:r.admin_user_id,actionType:r.action_type,targetType:r.target_type,targetId:r.target_id,metadata:parseJson(r.metadata_json,{}),createdAt:r.created_at}));}
function count(table){return Number(db.prepare(`SELECT COUNT(*) count FROM ${table}`).get().count);}function scalar(sql,args=[]){return Number(db.prepare(sql).get(...args)?.count||0);}function value(sql,args=[]){return db.prepare(sql).get(...args)?.value??null;}function since(ms){return new Date(Date.now()-ms).toISOString();}
export function adminDashboard(){
  const day=since(86400000),week=since(7*86400000),month=since(30*86400000),now=nowIso(),brain=brainMetrics(),generationEnabled=String(process.env.GAMEVAULT_PAGE_GENERATION_ENABLED??"true").toLowerCase()==="true",images=imageEngine3Summary(),recommendations=recommendationMetrics(),integrity=verifyDatabase(),migration=db.prepare(`SELECT version,name,applied_at,status FROM schema_migrations ORDER BY applied_at DESC LIMIT 1`).get()||null;
  const kbStatuses={};for(const status of ["CURRENT","VALIDATED","OUTDATED","CONFLICTED","UNVERIFIED","REJECTED","SUPERSEDED","NEEDS_REVIEW"])kbStatuses[status]=scalar(`SELECT COUNT(*) count FROM knowledge WHERE status=?`,[status]);
  const articleStatuses={};for(const status of ["DRAFT","GENERATED","SAFETY_CHECKING","NEEDS_RESEARCH","NEEDS_REVIEW","APPROVED","PUBLISHED","REJECTED","OUTDATED","NEEDS_UPDATE"])articleStatuses[status]=scalar(`SELECT COUNT(*) count FROM articles WHERE status=?`,[status]);
  const jobTotal=count("generation_jobs"),completed=scalar(`SELECT COUNT(*) count FROM generation_jobs WHERE status IN ('COMPLETE','READY','NEEDS_REVIEW')`),avgGenerationMs=Number(value(`SELECT AVG((julianday(completed_at)-julianday(started_at))*86400000.0) value FROM generation_jobs WHERE completed_at<>'' AND started_at<>''`)||0);
  const intelligence={engine:"GI_CORE_8.5_SCRIPTS",legacyAI:"REMOVED"},reviews=reviewMetrics(),understanding={trace:traceMetrics(),semantic:{provider:"DEXTER_OLLAMA_OPTIONAL"}},subscriptions=subscriptionMetrics(),autonomousGeneration=autonomousGenerationStatus(),billing=billingStatus();
  return {version:`Beta ${PUBLIC_VERSION}`,codename:"Universe Builder Experience 4.0",
    users:{total:count("users"),admins:scalar(`SELECT COUNT(*) count FROM users WHERE role='ADMIN'`),newToday:scalar(`SELECT COUNT(*) count FROM users WHERE created_at>=?`,[day]),newWeek:scalar(`SELECT COUNT(*) count FROM users WHERE created_at>=?`,[week]),newMonth:scalar(`SELECT COUNT(*) count FROM users WHERE created_at>=?`,[month]),activeToday:scalar(`SELECT COUNT(DISTINCT user_id) count FROM user_activity WHERE created_at>=?`,[day]),activeSessions:scalar(`SELECT COUNT(*) count FROM sessions WHERE expires_at>?`,[now]),profiles:count("user_profiles"),follows:count("user_follows"),friendships:count("friendships"),followedGames:count("user_followed_games"),usernameConflicts:scalar(`SELECT COUNT(*) count FROM username_conflicts WHERE status='OPEN'`)},
    brain:{...brain,name:"Dexter",aiVersion:"gemma3:4b optional",aiSystem:"GI_CORE_SCRIPTS",deepResearchV2:true,imageRuntime:"IMAGE_ENGINE_3_NATIVE",semanticUnderstanding:"OPTIONAL_OLLAMA"},
    ai:{name:"Dexter",version:"gemma3:4b",system:"OLLAMA_OPTIONAL_SEMANTIC_EDGE",status:brain.status||"UNKNOWN",firstParty:true,legacyAI:"REMOVED"},
    intelligence:{...intelligence,reviews,understanding},
    autonomousGeneration,
    subscriptions:{...subscriptions,billing},
    knowledge:{total:count("knowledge"),statuses:kbStatuses,createdToday:scalar(`SELECT COUNT(*) count FROM knowledge WHERE created_at>=?`,[day]),updatedToday:scalar(`SELECT COUNT(*) count FROM knowledge WHERE updated_at>=?`,[day]),games:count("games"),averagePerGame:count("games")?Math.round(count("knowledge")/count("games")*10)/10:0},
    images,
    articles:{total:count("articles"),statuses:articleStatuses},
    pageBuilder:{status:generationEnabled?"ACTIVE":"OFFLINE",generationService:generationEnabled?"ENABLED":"DISABLED",deepResearch:generationEnabled?"AVAILABLE":"OFFLINE",pages:count("pages"),queued:scalar(`SELECT COUNT(*) count FROM generation_jobs WHERE status='QUEUED'`),running:scalar(`SELECT COUNT(*) count FROM generation_jobs WHERE status IN ('RESEARCHING','VALIDATING','BUILDING','RUNNING')`),completed,failed:scalar(`SELECT COUNT(*) count FROM generation_jobs WHERE status='FAILED'`),averageGenerationMs:Math.max(0,Math.round(avgGenerationMs)),lastGeneration:value(`SELECT completed_at value FROM generation_jobs WHERE completed_at<>'' ORDER BY completed_at DESC LIMIT 1`)||"",lastFailure:value(`SELECT updated_at value FROM generation_jobs WHERE status='FAILED' ORDER BY updated_at DESC LIMIT 1`)||"",totalJobs:jobTotal},
    recommendations,
    database:{status:integrity.ok?"HEALTHY":"ERROR",integrity,schemaVersion:schemaVersion(),sizeBytes:existsSync(databasePath)?statSync(databasePath).size:0,lastMigration:migration,latestBackup:latestBackup()||"",backupCount:(()=>{try{return readdirSync(backupsDir).filter(x=>x.endsWith(".sqlite")).length;}catch{return 0;}})(),persistent:true},
    system:{version:`Beta ${PUBLIC_VERSION}`,uptimeSeconds:Math.round(process.uptime()),researchEnabled:String(process.env.GAMEVAULT_RESEARCH_ENABLED??"true").toLowerCase()!=="false",articleAi:"GI_CORE_SCRIPT_ARTICLE",pageBuilder:generationEnabled?"ACTIVE":"OFFLINE",imageMemory:"IMAGE_ENGINE_3_NATIVE",recommendationEngine:"ACTIVE",twoLayerUi:"ACTIVE",adminSetupRequired:String(value(`SELECT value FROM meta WHERE key='admin_setup_required'`)??"0")==="1"},
    games:count("games"),validatedKnowledge:(kbStatuses.CURRENT||0)+(kbStatuses.VALIDATED||0),publishedArticles:articleStatuses.PUBLISHED||0,articlesNeedReview:(articleStatuses.NEEDS_REVIEW||0)+(articleStatuses.NEEDS_RESEARCH||0),usersTotal:count("users"),userFollows:count("user_follows"),friendships:count("friendships"),imageCandidates:images.candidateBacklog,rejectedImages:images.degraded,research:count("research_history")};
}
