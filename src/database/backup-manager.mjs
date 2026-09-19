import { copyFileSync, existsSync, readdirSync, renameSync, rmSync, statSync, statfsSync } from "node:fs";
import path from "node:path";

const BACKUP_PATTERN=/^gamevault-[A-Za-z0-9._-]+-before-[A-Za-z0-9._-]+-[A-Za-z0-9._-]+-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z\.sqlite$/;
const PARTIAL_PATTERN=/^gamevault-.*\.sqlite\.partial-[A-Za-z0-9_-]+$/;
const DEFAULT_RETENTION=5;
const MIN_MARGIN_BYTES=16*1024*1024;

function clampRetention(value,{allowZero=false}={}){
  const n=Number(value);
  if(!Number.isFinite(n))return DEFAULT_RETENTION;
  return Math.max(allowZero?0:1,Math.min(20,Math.trunc(n)));
}

export function configuredBackupRetention(env=process.env){
  return clampRetention(env.GAMEINDEX_DB_BACKUP_RETENTION ?? DEFAULT_RETENTION);
}

export function migrationBackupName(name=""){
  return BACKUP_PATTERN.test(String(name||""));
}

export function listMigrationBackups(backupsDir){
  let names=[];
  try{names=readdirSync(backupsDir);}catch{return [];}
  const rows=[];
  for(const name of names){
    if(!migrationBackupName(name))continue;
    const filePath=path.join(backupsDir,name);
    try{
      const st=statSync(filePath);
      if(!st.isFile())continue;
      rows.push({name,path:filePath,sizeBytes:st.size,mtimeMs:st.mtimeMs,modifiedAt:st.mtime.toISOString()});
    }catch{}
  }
  rows.sort((a,b)=>a.mtimeMs-b.mtimeMs||a.name.localeCompare(b.name));
  return rows;
}

function removeBackupFamily(filePath){
  const removed=[];
  for(const candidate of [filePath,`${filePath}-shm`,`${filePath}-wal`]){
    try{if(existsSync(candidate)){rmSync(candidate,{force:true});removed.push(path.basename(candidate));}}catch{}
  }
  return removed;
}

export function cleanupPartialBackups(backupsDir){
  let names=[];
  try{names=readdirSync(backupsDir);}catch{return {removed:[]};}
  const removed=[];
  for(const name of names){
    if(!PARTIAL_PATTERN.test(name))continue;
    const target=path.join(backupsDir,name);
    try{rmSync(target,{force:true});removed.push(name);}catch{}
    for(const suffix of ["-shm","-wal"]){try{rmSync(`${target}${suffix}`,{force:true});}catch{}}
  }
  return {removed};
}

export function rotateDatabaseBackups({backupsDir,retain=configuredBackupRetention(),allowZero=false}={}){
  const keep=clampRetention(retain,{allowZero});
  const backups=listMigrationBackups(backupsDir);
  const removeCount=Math.max(0,backups.length-keep);
  const removed=[];
  for(const item of backups.slice(0,removeCount))removed.push(...removeBackupFamily(item.path));
  return {retention:keep,before:backups.length,after:Math.max(0,backups.length-removeCount),removed};
}

export function freeStorageBytes(targetDir){
  try{
    const fs=statfsSync(targetDir);
    const blockSize=Number(fs.bsize||fs.frsize||0);
    const availableBlocks=Number(fs.bavail??fs.bfree??0);
    const value=blockSize*availableBlocks;
    return Number.isFinite(value)&&value>=0?value:null;
  }catch{return null;}
}

export function backupSpaceRequirement(sourceSize){
  const size=Math.max(0,Number(sourceSize)||0);
  const margin=Math.max(MIN_MARGIN_BYTES,Math.ceil(size*.25));
  return {sourceSizeBytes:size,marginBytes:margin,requiredBytes:size+margin};
}

function safeStamp(){return new Date().toISOString().replace(/[:.]/g,"-");}
function safeSegment(value,fallback){
  const v=String(value||fallback||"").trim().replace(/[^A-Za-z0-9._-]+/g,"-").replace(/^-+|-+$/g,"").slice(0,90);
  return v||String(fallback||"unknown");
}

export function createManagedDatabaseBackup({
  databasePath,
  backupsDir,
  fromVersion="unknown",
  toVersion="unknown",
  label="migration",
  retention=configuredBackupRetention(),
  checkpoint=()=>{},
  verify=()=>({ok:true})
}={}){
  if(!databasePath||!backupsDir)throw new Error("GAMEINDEX_BACKUP_PATH_REQUIRED");
  if(!existsSync(databasePath))return null;

  cleanupPartialBackups(backupsDir);
  const keep=clampRetention(retention);
  // Make room for the new backup before copying it. Keep at most N-1 old backups.
  const preRotation=rotateDatabaseBackups({backupsDir,retain:Math.max(0,keep-1),allowZero:true});
  try{checkpoint();}catch{}

  const sourceSize=statSync(databasePath).size;
  const space=backupSpaceRequirement(sourceSize);
  let availableBefore=freeStorageBytes(backupsDir);
  // Emergency rotation: if retention alone did not make enough room, remove only
  // additional *known migration backups*, oldest first, until the copy has margin.
  // gamevault.sqlite can never match migrationBackupName(), so it is never targeted.
  const emergencyRemoved=[];
  while(availableBefore!==null&&availableBefore<space.requiredBytes){
    const oldest=listMigrationBackups(backupsDir)[0];
    if(!oldest)break;
    emergencyRemoved.push(...removeBackupFamily(oldest.path));
    const next=freeStorageBytes(backupsDir);
    if(next===null||next<=availableBefore){availableBefore=next;break;}
    availableBefore=next;
  }
  if(availableBefore!==null&&availableBefore<space.requiredBytes){
    const error=new Error(`GAMEINDEX_BACKUP_STORAGE_INSUFFICIENT required=${space.requiredBytes} available=${availableBefore} source=${sourceSize} backups=${backupsDir}`);
    error.code="GAMEINDEX_BACKUP_STORAGE_INSUFFICIENT";
    error.requiredBytes=space.requiredBytes;
    error.availableBytes=availableBefore;
    error.backupsDir=backupsDir;
    error.emergencyRemoved=emergencyRemoved;
    throw error;
  }

  const filename=`gamevault-${safeSegment(fromVersion,"unknown")}-before-${safeSegment(toVersion,"unknown")}-${safeSegment(label,"migration")}-${safeStamp()}.sqlite`;
  const target=path.join(backupsDir,filename);
  const partial=`${target}.partial-${process.pid}-${Date.now()}`;

  try{
    copyFileSync(databasePath,partial);
    const copiedSize=statSync(partial).size;
    if(copiedSize!==sourceSize)throw Object.assign(new Error(`GAMEINDEX_BACKUP_SIZE_MISMATCH source=${sourceSize} copied=${copiedSize}`),{code:"GAMEINDEX_BACKUP_SIZE_MISMATCH"});
    const verification=verify(partial);
    if(!verification?.ok)throw Object.assign(new Error(`GAMEINDEX_BACKUP_VALIDATION_FAILED ${verification?.reason||verification?.integrity||"unknown"}`),{code:"GAMEINDEX_BACKUP_VALIDATION_FAILED"});
    renameSync(partial,target);
    // A read-only validation may still leave sidecars on some SQLite builds; partial sidecars are never useful.
    for(const suffix of ["-shm","-wal"]){try{rmSync(`${partial}${suffix}`,{force:true});}catch{}}
    const postRotation=rotateDatabaseBackups({backupsDir,retain:keep});
    return {
      path:target,filename,verification,sourceSizeBytes:sourceSize,
      availableBeforeBytes:availableBefore,requiredBytes:space.requiredBytes,
      retention:keep,preRotation,emergencyRemoved,postRotation
    };
  }catch(error){
    try{rmSync(partial,{force:true});}catch{}
    for(const suffix of ["-shm","-wal"]){try{rmSync(`${partial}${suffix}`,{force:true});}catch{}}
    if(error?.code==="ENOSPC"){
      const available=freeStorageBytes(backupsDir);
      const wrapped=new Error(`GAMEINDEX_BACKUP_STORAGE_INSUFFICIENT required=${space.requiredBytes} available=${available??"unknown"} source=${sourceSize} backups=${backupsDir}`);
      wrapped.code="GAMEINDEX_BACKUP_STORAGE_INSUFFICIENT";
      wrapped.cause=error;
      wrapped.requiredBytes=space.requiredBytes;
      wrapped.availableBytes=available;
      wrapped.backupsDir=backupsDir;
      throw wrapped;
    }
    throw error;
  }
}
