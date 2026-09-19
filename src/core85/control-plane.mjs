import { db, databaseStorageState, nowIso } from "../database/connection.mjs";
import { recoverExpiredJobs, queueSummary } from "../core98/job-engine.mjs";
import { core98WorkerStatus } from "../core98/worker-runtime.mjs";
import { imageEngine3Summary, scheduleImage3Repair } from "../images/image-engine3.mjs";
import { dexterStatus } from "../dexter/dexter-service.mjs";
import { stableId } from "../knowledge/normalize.mjs";

function n(sql,...args){return Number(db.prepare(sql).get(...args)?.count||0);}
function healthState({failed=0,degraded=0,offline=false}={}){if(failed>0||offline)return "FAILED";if(degraded>0)return "DEGRADED";return "HEALTHY";}

export function performanceSnapshot(){
  const mem=process.memoryUsage();
  return {
    process:{uptimeSec:Math.round(process.uptime()),rssBytes:mem.rss,heapUsedBytes:mem.heapUsed,heapTotalBytes:mem.heapTotal,externalBytes:mem.external,arrayBuffersBytes:mem.arrayBuffers||0},
    database:{jobs:n(`SELECT COUNT(*) count FROM gi_jobs`),pages:n(`SELECT COUNT(*) count FROM pages`),entities:n(`SELECT COUNT(*) count FROM entities`),imagesV3:n(`SELECT COUNT(*) count FROM ie3_assets`)},
    timestamp:nowIso()
  };
}

export async function core85Health({probeDexter=false}={}){
  const dbState=databaseStorageState({probeWrite:false}),workers=core98WorkerStatus(),images=imageEngine3Summary(),dexter=await dexterStatus({probe:probeDexter}),queues=queueSummary();
  const failedJobs=n(`SELECT COUNT(*) count FROM gi_jobs WHERE state='FAILED'`),stalled=n(`SELECT COUNT(*) count FROM gi_stall_events WHERE status='OPEN'`),researchFailed=n(`SELECT COUNT(*) count FROM gi_jobs WHERE job_type='RESEARCH' AND state='FAILED'`),searchMissing=n(`SELECT COUNT(*) count FROM pages p WHERE p.status='PUBLISHED' AND NOT EXISTS(SELECT 1 FROM pre_public_search_index s WHERE s.subject_type='PAGE' AND s.subject_id=p.id AND s.publish_state='PUBLISHED')`);
  const workerOffline=workers.enabled&&workers.workers?.length>0&&workers.workers.every(w=>w.status!=="RUNNING"&&Date.now()-Date.parse(w.last_heartbeat_at||0)>30000);
  return {
    version:"0.987",core:"GI_CORE_8.5",runtime:"LOCAL_FIRST_NO_API_KEY",apiKeyRequired:false,timestamp:nowIso(),
    systems:{
      universe:{state:healthState({failed:failedJobs,degraded:stalled}),failedJobs,stalls:stalled,queues},
      images:{state:healthState({degraded:images.degraded+images.repairQueued}),...images},
      dexter:{state:dexter.reachable===false?"OFFLINE":dexter.circuit?.open?"DEGRADED":"HEALTHY",...dexter},
      research:{state:healthState({failed:researchFailed}),failed:researchFailed},
      search:{state:healthState({degraded:searchMissing}),missingPublishedPages:searchMissing},
      workers:{state:healthState({degraded:stalled,offline:workerOffline}),...workers},
      database:{state:dbState.status==="ready"?"HEALTHY":dbState.status==="read_only"?"DEGRADED":"FAILED",...dbState},
      social:{state:"HEALTHY",reportsOpen:n(`SELECT COUNT(*) count FROM social_reports WHERE status IN ('OPEN','PENDING')`)},
    },
    performance:performanceSnapshot()
  };
}

export function repairStalledJobs(){
  const recovered=recoverExpiredJobs();
  const now=nowIso();
  const staleCutoff=new Date(Date.now()-15*60*1000).toISOString();
  const r=db.prepare(`UPDATE gi_jobs SET state='RETRY_SCHEDULED',lease_owner='',lease_expires_at='',available_at=?,last_error_code='CORE85_STALL_RECOVERY',updated_at=? WHERE state='RUNNING' AND updated_at<?`).run(now,now,staleCutoff);
  db.prepare(`UPDATE gi_stall_events SET status='RESOLVED',last_seen_at=? WHERE status='OPEN' AND (subject_id='' OR subject_id IS NULL OR NOT EXISTS(SELECT 1 FROM gi_jobs j WHERE j.id=gi_stall_events.subject_id AND j.state='RUNNING'))`).run(now);
  return {recoveredExpired:recovered,recoveredStale:Number(r.changes||0),timestamp:now};
}

export function retryDegradedImages({limit=100}={}){
  const rows=db.prepare(`SELECT id FROM ie3_assets WHERE state IN ('DEGRADED','REPAIR_SCHEDULED') ORDER BY updated_at LIMIT ?`).all(Math.min(500,Math.max(1,Number(limit)||100)));
  let queued=0,reused=0;for(const row of rows){const result=scheduleImage3Repair(row.id,"CORE85_MANUAL_RETRY");if(result.queued)queued++;else if(result.reused)reused++;}
  return {scanned:rows.length,queued,reused};
}

export function reindexMissingPages({limit=250}={}){
  const rows=db.prepare(`SELECT p.*,g.name game_name,e.name entity_name FROM pages p JOIN games g ON g.id=p.game_id LEFT JOIN entities e ON e.id=p.entity_id WHERE p.status='PUBLISHED' AND NOT EXISTS(SELECT 1 FROM pre_public_search_index s WHERE s.subject_type='PAGE' AND s.subject_id=p.id AND s.language=p.language AND s.publish_state='PUBLISHED') ORDER BY p.updated_at DESC LIMIT ?`).all(Math.min(1000,Math.max(1,Number(limit)||250)));
  const now=nowIso(),stmt=db.prepare(`INSERT INTO pre_public_search_index(id,game_id,subject_type,subject_id,title,subtitle,summary,keywords,href,language,publish_state,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?, 'PUBLISHED',?) ON CONFLICT(subject_type,subject_id,language) DO UPDATE SET title=excluded.title,subtitle=excluded.subtitle,summary=excluded.summary,keywords=excluded.keywords,href=excluded.href,publish_state='PUBLISHED',updated_at=excluded.updated_at`);
  for(const p of rows)stmt.run(stableId("search985",p.id,p.language),p.game_id,"PAGE",p.id,p.title,p.subtitle||p.game_name,p.summary||"",`${p.title} ${p.entity_name||""} ${p.game_name}`,`/generated-page.html?id=${encodeURIComponent(p.id)}`,p.language,now);
  return {reindexed:rows.length,timestamp:now};
}
