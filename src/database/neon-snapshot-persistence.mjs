import { createHash, randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

const SNAPSHOT_KEY=String(process.env.GAMEINDEX_REMOTE_SNAPSHOT_KEY||"production").trim()||"production";
const RAW_CHUNK_BYTES=Math.max(64*1024,Math.min(1024*1024,Number(process.env.GAMEINDEX_REMOTE_SNAPSHOT_CHUNK_BYTES||512*1024)||512*1024));
const MAX_SNAPSHOT_BYTES=Math.max(4*1024*1024,Math.min(256*1024*1024,(Number(process.env.GAMEINDEX_REMOTE_SNAPSHOT_MAX_MB||64)||64)*1024*1024));
const KEEP_COMPLETE=Math.max(1,Math.min(5,Number(process.env.GAMEINDEX_REMOTE_SNAPSHOT_KEEP||2)||2));
const SYNC_DELAY_MS=Math.max(250,Math.min(15000,Number(process.env.GAMEINDEX_REMOTE_SNAPSHOT_DELAY_MS||1200)||1200));
const WATCH_INTERVAL_MS=Math.max(1000,Math.min(30000,Number(process.env.GAMEINDEX_REMOTE_SNAPSHOT_WATCH_MS||2500)||2500));

let schemaReady=false;
let activeUpload=null;
let uploadRequested=false;
let pendingUploadOptions={};
let scheduledTimer=null;
let watcherTimer=null;
let runtimeConfig=null;
let lastUploadedSha="";
let stopping=false;
let lastObservedSignature="";
let lastError="";
let lastSyncAt="";
let lastRestoreAt="";
let latestSnapshotId="";
let remoteSnapshotCount=0;

function databaseUrl(){return String(process.env.DATABASE_URL||process.env.GAMEINDEX_DATABASE_URL||"").trim();}
function parsedDatabaseUrl(){
  const value=databaseUrl();if(!value)return null;
  try{
    const url=new URL(value);
    if(!["postgres:","postgresql:"].includes(url.protocol))return null;
    if(!url.hostname.toLowerCase().endsWith(".neon.tech"))return null;
    return url;
  }catch{return null;}
}
export function neonRemotePersistenceConfigured(){return Boolean(parsedDatabaseUrl());}
export function neonRemotePersistenceHost(){return parsedDatabaseUrl()?.hostname||"";}

function safeMessage(error){return String(error?.message||error||"REMOTE_PERSISTENCE_ERROR").replace(/postgres(?:ql)?:\/\/[^\s"']+/gi,"[DATABASE_URL_REDACTED]").slice(0,600);}

async function neonHttpQuery(query,params=[]){
  const connectionString=databaseUrl(),url=parsedDatabaseUrl();
  if(!url)throw new Error("NEON_DATABASE_URL_REQUIRED");
  const endpoint=`https://${url.hostname}/sql`;
  const response=await fetch(endpoint,{
    method:"POST",
    signal:AbortSignal.timeout(15000),
    headers:{
      "content-type":"application/json",
      "Neon-Connection-String":connectionString,
      "Neon-Raw-Text-Output":"true",
      "Neon-Array-Mode":"true"
    },
    body:JSON.stringify({query,params})
  });
  if(!response.ok){
    let detail="";try{detail=JSON.stringify(await response.json());}catch{try{detail=await response.text();}catch{}}
    throw new Error(`NEON_HTTP_${response.status}: ${String(detail).slice(0,400)}`);
  }
  const raw=await response.json();
  const names=(raw.fields||[]).map(field=>field?.name||"");
  const rows=(raw.rows||[]).map(row=>{
    const out={};for(let i=0;i<names.length;i++)out[names[i]]=row?.[i];return out;
  });
  return {rows,rowCount:Number(raw.rowCount||rows.length||0),command:raw.command||""};
}

export async function ensureNeonSnapshotSchema(){
  if(schemaReady)return true;
  await neonHttpQuery(`CREATE TABLE IF NOT EXISTS gameindex_runtime_snapshots (
    snapshot_id TEXT PRIMARY KEY,
    snapshot_key TEXT NOT NULL,
    schema_version INTEGER NOT NULL DEFAULT 0,
    release TEXT NOT NULL DEFAULT '',
    sha256 TEXT NOT NULL,
    size_bytes BIGINT NOT NULL,
    chunk_count INTEGER NOT NULL,
    complete BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ NULL
  )`);
  await neonHttpQuery(`CREATE TABLE IF NOT EXISTS gameindex_runtime_snapshot_chunks (
    snapshot_id TEXT NOT NULL REFERENCES gameindex_runtime_snapshots(snapshot_id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL,
    payload_base64 TEXT NOT NULL,
    PRIMARY KEY(snapshot_id,chunk_index)
  )`);
  await neonHttpQuery(`CREATE INDEX IF NOT EXISTS idx_gameindex_runtime_snapshots_latest
    ON gameindex_runtime_snapshots(snapshot_key,complete,completed_at DESC)`);
  schemaReady=true;
  return true;
}

function hash(buffer){return createHash("sha256").update(buffer).digest("hex");}
function ensureParent(target){mkdirSync(path.dirname(target),{recursive:true});}
function toInt(value,fallback=0){const n=Number(value);return Number.isFinite(n)?n:fallback;}

export async function restoreLatestNeonSnapshot({databasePath,verifyDatabase}={}){
  const state={configured:neonRemotePersistenceConfigured(),restored:false,provider:"NEON",snapshotKey:SNAPSHOT_KEY,host:neonRemotePersistenceHost(),reason:""};
  if(!state.configured){state.reason="NOT_CONFIGURED";return state;}
  if(!databasePath||typeof verifyDatabase!=="function")throw new Error("REMOTE_RESTORE_ARGUMENTS_REQUIRED");
  try{
    await ensureNeonSnapshotSchema();
    const meta=await neonHttpQuery(`SELECT snapshot_id,schema_version,release,sha256,size_bytes,chunk_count,completed_at
      FROM gameindex_runtime_snapshots
      WHERE snapshot_key=$1 AND complete=TRUE
      ORDER BY completed_at DESC NULLS LAST,created_at DESC
      LIMIT 1`,[SNAPSHOT_KEY]);
    const row=meta.rows[0];
    if(!row){state.reason="REMOTE_EMPTY";return state;}
    const chunkCount=toInt(row.chunk_count);
    if(chunkCount<1||toInt(row.size_bytes)<1||toInt(row.size_bytes)>MAX_SNAPSHOT_BYTES||chunkCount>Math.ceil(MAX_SNAPSHOT_BYTES/(64*1024)))throw new Error("REMOTE_SNAPSHOT_METADATA_INVALID");
    const chunks=await neonHttpQuery(`SELECT chunk_index,payload_base64
      FROM gameindex_runtime_snapshot_chunks
      WHERE snapshot_id=$1
      ORDER BY chunk_index ASC`,[row.snapshot_id]);
    if(chunks.rows.length!==chunkCount)throw new Error("REMOTE_SNAPSHOT_CHUNK_COUNT_MISMATCH");
    const parts=[];
    for(let i=0;i<chunks.rows.length;i++){
      const item=chunks.rows[i];
      if(toInt(item.chunk_index,-1)!==i)throw new Error("REMOTE_SNAPSHOT_CHUNK_ORDER_INVALID");
      parts.push(Buffer.from(String(item.payload_base64||""),"base64"));
    }
    const buffer=Buffer.concat(parts);
    if(buffer.length!==toInt(row.size_bytes))throw new Error("REMOTE_SNAPSHOT_SIZE_MISMATCH");
    if(hash(buffer)!==String(row.sha256||""))throw new Error("REMOTE_SNAPSHOT_HASH_MISMATCH");
    ensureParent(databasePath);
    const temp=`${databasePath}.neon-restore-${process.pid}-${Date.now()}`;
    writeFileSync(temp,buffer,{flag:"wx"});
    const validation=verifyDatabase(temp);
    if(!validation?.ok){rmSync(temp,{force:true});throw new Error(`REMOTE_SNAPSHOT_SQLITE_INVALID:${validation?.reason||validation?.integrity||"UNKNOWN"}`);}
    try{
      for(const suffix of ["-wal","-shm"])rmSync(databasePath+suffix,{force:true});
      renameSync(temp,databasePath);
    }finally{rmSync(temp,{force:true});}
    lastUploadedSha=String(row.sha256||"");
    latestSnapshotId=String(row.snapshot_id||"");
    lastRestoreAt=new Date().toISOString();
    lastError="";
    state.restored=true;state.reason="RESTORED";state.snapshotId=latestSnapshotId;state.schemaVersion=toInt(row.schema_version);state.release=String(row.release||"");state.sizeBytes=buffer.length;state.sha256=lastUploadedSha;state.completedAt=String(row.completed_at||"");
    return state;
  }catch(error){
    lastError=safeMessage(error);state.reason=lastError;throw error;
  }
}

function currentFileSignature(databasePath){
  const files=[databasePath,`${databasePath}-wal`];
  return files.map(file=>{try{const s=statSync(file);return `${file}:${s.size}:${s.mtimeMs}`;}catch{return `${file}:0:0`;}}).join("|");
}

async function remoteLatestSha(){
  const result=await neonHttpQuery(`SELECT snapshot_id,sha256,completed_at
    FROM gameindex_runtime_snapshots
    WHERE snapshot_key=$1 AND complete=TRUE
    ORDER BY completed_at DESC NULLS LAST,created_at DESC LIMIT 1`,[SNAPSHOT_KEY]);
  const row=result.rows[0]||null;
  if(row){latestSnapshotId=String(row.snapshot_id||"");lastSyncAt=String(row.completed_at||lastSyncAt||"");}
  return row?String(row.sha256||""):"";
}

async function pruneRemoteSnapshots(){
  await neonHttpQuery(`DELETE FROM gameindex_runtime_snapshots
    WHERE snapshot_key=$1 AND snapshot_id IN (
      SELECT snapshot_id FROM gameindex_runtime_snapshots
      WHERE snapshot_key=$1 AND complete=TRUE
      ORDER BY completed_at DESC NULLS LAST,created_at DESC
      OFFSET $2
    )`,[SNAPSHOT_KEY,KEEP_COMPLETE]);
  await neonHttpQuery(`DELETE FROM gameindex_runtime_snapshots
    WHERE snapshot_key=$1 AND complete=FALSE AND created_at < NOW()-INTERVAL '1 day'`,[SNAPSHOT_KEY]);
}

async function countRemoteSnapshots(){
  try{
    const result=await neonHttpQuery(`SELECT COUNT(*) AS count FROM gameindex_runtime_snapshots WHERE snapshot_key=$1 AND complete=TRUE`,[SNAPSHOT_KEY]);
    remoteSnapshotCount=toInt(result.rows[0]?.count);
  }catch{}
}

async function performUpload({force=false,reason="runtime"}={}){
  if(!runtimeConfig||!neonRemotePersistenceConfigured())return {ok:false,skipped:true,reason:"NOT_CONFIGURED"};
  const {databasePath,getSchemaVersion,release,checkpoint,verifyDatabase}=runtimeConfig;
  if(!existsSync(databasePath))return {ok:false,skipped:true,reason:"LOCAL_DATABASE_MISSING"};
  try{
    checkpoint?.();
    const capturedSignature=currentFileSignature(databasePath);
    const validation=verifyDatabase?.(databasePath);
    if(validation&&!validation.ok)throw new Error(`LOCAL_SQLITE_INVALID:${validation.reason||validation.integrity||"UNKNOWN"}`);
    const buffer=readFileSync(databasePath);
    if(buffer.length>MAX_SNAPSHOT_BYTES)throw new Error(`REMOTE_SNAPSHOT_TOO_LARGE:${buffer.length}`);
    const sha=hash(buffer);
    if(!force&&sha&&sha===lastUploadedSha)return {ok:true,skipped:true,reason:"UNCHANGED",sha256:sha};
    await ensureNeonSnapshotSchema();
    if(!force&&!lastUploadedSha)lastUploadedSha=await remoteLatestSha();
    if(!force&&sha===lastUploadedSha)return {ok:true,skipped:true,reason:"UNCHANGED_REMOTE",sha256:sha};
    const snapshotId=`gi-${Date.now()}-${randomUUID()}`;
    const chunks=[];for(let offset=0;offset<buffer.length;offset+=RAW_CHUNK_BYTES)chunks.push(buffer.subarray(offset,Math.min(buffer.length,offset+RAW_CHUNK_BYTES)).toString("base64"));
    await neonHttpQuery(`INSERT INTO gameindex_runtime_snapshots(snapshot_id,snapshot_key,schema_version,release,sha256,size_bytes,chunk_count,complete,created_at)
      VALUES($1,$2,$3,$4,$5,$6,$7,FALSE,NOW())`,[
      snapshotId,SNAPSHOT_KEY,Number(getSchemaVersion?.()||0),String(release||""),sha,buffer.length,chunks.length
    ]);
    for(let i=0;i<chunks.length;i++){
      await neonHttpQuery(`INSERT INTO gameindex_runtime_snapshot_chunks(snapshot_id,chunk_index,payload_base64) VALUES($1,$2,$3)`,[snapshotId,i,chunks[i]]);
    }
    await neonHttpQuery(`UPDATE gameindex_runtime_snapshots SET complete=TRUE,completed_at=NOW() WHERE snapshot_id=$1`,[snapshotId]);
    lastUploadedSha=sha;latestSnapshotId=snapshotId;lastSyncAt=new Date().toISOString();lastError="";
    await pruneRemoteSnapshots();await countRemoteSnapshots();
    lastObservedSignature=capturedSignature;
    return {ok:true,snapshotId,sha256:sha,sizeBytes:buffer.length,chunks:chunks.length,reason};
  }catch(error){
    lastError=safeMessage(error);return {ok:false,error:lastError,reason};
  }
}

export function markNeonSnapshotDirty({critical=false,reason="database-write"}={}){
  if(!runtimeConfig||!neonRemotePersistenceConfigured()||stopping)return;
  if(scheduledTimer)clearTimeout(scheduledTimer);
  const delay=critical?0:SYNC_DELAY_MS;
  scheduledTimer=setTimeout(()=>{scheduledTimer=null;void flushNeonSnapshot({reason});},delay);
  scheduledTimer.unref?.();
}

export async function flushNeonSnapshot(options={}){
  uploadRequested=true;
  pendingUploadOptions={...options,force:Boolean(options.force||pendingUploadOptions.force)};
  if(activeUpload)return activeUpload;
  activeUpload=(async()=>{
    let result;
    do{
      uploadRequested=false;
      const next=pendingUploadOptions;pendingUploadOptions={};
      result=await performUpload(next);
      if(!result.ok){
        if(!stopping){
          if(scheduledTimer)clearTimeout(scheduledTimer);
          scheduledTimer=setTimeout(()=>{scheduledTimer=null;void flushNeonSnapshot({reason:"retry-after-failure"});},WATCH_INTERVAL_MS);
          scheduledTimer.unref?.();
        }
        break;
      }
    }while(uploadRequested);
    return result;
  })().finally(()=>{activeUpload=null;});
  return activeUpload;
}

export async function startNeonSnapshotRuntime(config={}){
  runtimeConfig={...config};
  if(!neonRemotePersistenceConfigured())return {enabled:false,provider:"NONE"};
  await ensureNeonSnapshotSchema();
  if(!lastUploadedSha)lastUploadedSha=await remoteLatestSha();
  await countRemoteSnapshots();
  const bootstrap=await flushNeonSnapshot({force:!lastUploadedSha,reason:"startup-bootstrap"});
  lastObservedSignature=currentFileSignature(config.databasePath);
  if(!watcherTimer){
    watcherTimer=setInterval(()=>{
      if(stopping||!runtimeConfig?.databasePath)return;
      const signature=currentFileSignature(runtimeConfig.databasePath);
      if(signature!==lastObservedSignature){lastObservedSignature=signature;markNeonSnapshotDirty({reason:"sqlite-file-change"});}
    },WATCH_INTERVAL_MS);
    watcherTimer.unref?.();
  }
  return {enabled:true,provider:"NEON_REMOTE_SQLITE_SNAPSHOT",host:neonRemotePersistenceHost(),bootstrap};
}

async function gracefulFlush(signal){
  if(stopping)return;stopping=true;
  if(scheduledTimer){clearTimeout(scheduledTimer);scheduledTimer=null;}
  const timeout=setTimeout(()=>process.exit(1),25000);timeout.unref?.();
  let exitCode=0;
  try{const result=await flushNeonSnapshot({force:true,reason:`shutdown-${signal}`});if(result?.error)exitCode=1;}catch{exitCode=1;}
  clearTimeout(timeout);process.exit(exitCode);
}
process.once("SIGTERM",()=>{void gracefulFlush("SIGTERM");});
process.once("SIGINT",()=>{void gracefulFlush("SIGINT");});

export function neonRemotePersistenceState(){
  return {
    configured:neonRemotePersistenceConfigured(),
    provider:neonRemotePersistenceConfigured()?"NEON_REMOTE_SQLITE_SNAPSHOT":"NONE",
    host:neonRemotePersistenceHost(),
    snapshotKey:SNAPSHOT_KEY,
    latestSnapshotId,
    lastSyncAt,
    lastRestoreAt,
    snapshotCount:remoteSnapshotCount,
    lastError,
    chunkBytes:RAW_CHUNK_BYTES,
    maxSnapshotBytes:MAX_SNAPSHOT_BYTES
  };
}
