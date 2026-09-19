import { createHash, randomUUID } from "node:crypto";
import { mkdirSync, writeFileSync, unlinkSync, existsSync } from "node:fs";
import path from "node:path";
import { db, nowIso, persistentRoot } from "../database/connection.mjs";
import { fetchPublicBinary } from "../security/url-safety.mjs";

export const gameMediaDir=path.join(persistentRoot,"game-media");
mkdirSync(gameMediaDir,{recursive:true});

const SLOTS=new Set(["COVER","HERO","PAGE_BACKGROUND","ARTWORK"]);
const EXPERIENCE_SLOTS=new Set(["LOGO","BANNER","HERO","BACKGROUND","CARD","GALLERY","ARTWORK"]);
const FITS=new Set(["COVER","CONTAIN","CENTER"]);
const MAX_BYTES=8*1024*1024;
const MAX_DIMENSION=12000;

function slot(value){const v=String(value||"COVER").toUpperCase();if(!SLOTS.has(v))throw new Error("INVALID_IMAGE_SLOT");return v;}
function fit(value){const v=String(value||"COVER").toUpperCase();if(!FITS.has(v))throw new Error("INVALID_FIT_MODE");return v;}
function experienceSlot(value){const v=String(value||"BACKGROUND").toUpperCase();if(!EXPERIENCE_SLOTS.has(v))throw new Error("INVALID_EXPERIENCE_IMAGE_SLOT");return v;}
function experienceKey(value){const v=String(value||"main").trim().toLowerCase();if(!/^[a-z0-9-]{1,40}$/.test(v))throw new Error("INVALID_EXPERIENCE_KEY");return v;}
function eraKey(value){const v=String(value||"").trim().toLowerCase();if(!/^[a-z0-9-]{1,40}$/.test(v))throw new Error("INVALID_ERA_KEY");return v;}
function tableExists(name){return Boolean(db.prepare(`SELECT 1 FROM sqlite_master WHERE type='table' AND name=?`).get(name));}
function cleanUrl(value){const raw=String(value||"").trim();if(!raw||raw.length>2048)throw new Error("INVALID_IMAGE_URL");if(raw.startsWith("/user-content/game-media/"))return raw;let u;try{u=new URL(raw);}catch{throw new Error("INVALID_IMAGE_URL");}if(!["http:","https:"].includes(u.protocol)||u.username||u.password)throw new Error("INVALID_IMAGE_URL");return u.href;}

function signature(bytes,mime=""){
  const b=bytes instanceof Uint8Array?bytes:new Uint8Array(bytes||[]),m=String(mime||"").toLowerCase();
  const png=b.length>=24&&b[0]===0x89&&b[1]===0x50&&b[2]===0x4e&&b[3]===0x47&&b[4]===0x0d&&b[5]===0x0a&&b[6]===0x1a&&b[7]===0x0a;
  const jpg=b.length>=4&&b[0]===0xff&&b[1]===0xd8&&b[2]===0xff;
  const webp=b.length>=30&&Buffer.from(b.subarray(0,4)).toString("ascii")==="RIFF"&&Buffer.from(b.subarray(8,12)).toString("ascii")==="WEBP";
  if(m.includes("png"))return png?"image/png":"";
  if(m.includes("jpeg")||m.includes("jpg"))return jpg?"image/jpeg":"";
  if(m.includes("webp"))return webp?"image/webp":"";
  return png?"image/png":jpg?"image/jpeg":webp?"image/webp":"";
}
function u24le(b,o){return Number(b[o]||0)|(Number(b[o+1]||0)<<8)|(Number(b[o+2]||0)<<16);}
function dimensions(bytes,mime){
  const b=bytes instanceof Uint8Array?bytes:new Uint8Array(bytes||[]);
  if(mime==="image/png"&&b.length>=24){return{width:Buffer.from(b.subarray(16,20)).readUInt32BE(0),height:Buffer.from(b.subarray(20,24)).readUInt32BE(0)};}
  if(mime==="image/jpeg"){
    let i=2;
    while(i+9<b.length){
      if(b[i]!==0xff){i++;continue;}
      while(i<b.length&&b[i]===0xff)i++;
      const marker=b[i++];
      if(marker===0xd8||marker===0xd9||marker===0x01||(marker>=0xd0&&marker<=0xd7))continue;
      if(i+1>=b.length)break;
      const len=(b[i]<<8)|b[i+1];
      if(len<2||i+len>b.length)break;
      const sof=(marker>=0xc0&&marker<=0xc3)||(marker>=0xc5&&marker<=0xc7)||(marker>=0xc9&&marker<=0xcb)||(marker>=0xcd&&marker<=0xcf);
      if(sof&&i+7<b.length)return{height:(b[i+3]<<8)|b[i+4],width:(b[i+5]<<8)|b[i+6]};
      i+=len;
    }
  }
  if(mime==="image/webp"&&b.length>=30){
    const type=Buffer.from(b.subarray(12,16)).toString("ascii");
    if(type==="VP8X")return{width:1+u24le(b,24),height:1+u24le(b,27)};
    if(type==="VP8L"&&b[20]===0x2f)return{width:1+b[21]+((b[22]&0x3f)<<8),height:1+((b[22]>>6)&0x03)+(b[23]<<2)+((b[24]&0x0f)<<10)};
    for(let i=20;i+9<b.length&&i<96;i++)if(b[i]===0x9d&&b[i+1]===0x01&&b[i+2]===0x2a)return{width:(b[i+3]|(b[i+4]<<8))&0x3fff,height:(b[i+5]|(b[i+6]<<8))&0x3fff};
  }
  return{width:0,height:0};
}
function validateBinary(bytes,mimeHint=""){
  const buf=bytes instanceof Uint8Array?bytes:new Uint8Array(bytes||[]);
  if(!buf.length)throw new Error("INVALID_IMAGE_DATA");
  if(buf.length>MAX_BYTES)throw new Error("IMAGE_TOO_LARGE");
  const mime=signature(buf,mimeHint);if(!mime)throw new Error("UNSUPPORTED_IMAGE_FORMAT");
  const dim=dimensions(buf,mime);if(!dim.width||!dim.height)throw new Error("IMAGE_DIMENSIONS_UNREADABLE");
  if(dim.width>MAX_DIMENSION||dim.height>MAX_DIMENSION)throw new Error("IMAGE_DIMENSIONS_TOO_LARGE");
  return{mime,bytes:buf,width:dim.width,height:dim.height};
}
export async function previewImageFromUrl(imageUrl=""){
  const safeUrl=cleanUrl(imageUrl);
  if(safeUrl.startsWith("/user-content/game-media/"))throw new Error("LOCAL_PREVIEW_USE_DIRECT_URL");
  const remote=await fetchPublicBinary(safeUrl,{maxBytes:MAX_BYTES,timeoutMs:10000,maxRedirects:3,accept:"image/webp,image/png,image/jpeg;q=0.9,*/*;q=0.1"});
  const safe=validateBinary(remote.bytes,remote.contentType);
  return{dataUrl:`data:${safe.mime};base64,${Buffer.from(safe.bytes).toString("base64")}`,mimeType:safe.mime,width:safe.width,height:safe.height,byteSize:safe.bytes.length};
}

function parseDataUrl(value){const m=String(value||"").match(/^data:(image\/(?:webp|png|jpeg));base64,([A-Za-z0-9+/=\r\n]+)$/i);if(!m)return null;return validateBinary(Buffer.from(m[2].replace(/\s+/g,""),"base64"),m[1].toLowerCase());}
function extensionFor(mime){return mime==="image/png"?"png":mime==="image/jpeg"?"jpg":"webp";}
function writeLocal(gameId,slotKey,binary){const ext=extensionFor(binary.mime),hash=createHash("sha256").update(binary.bytes).digest("hex").slice(0,16),name=`${String(gameId).replace(/[^a-zA-Z0-9_-]/g,"_")}-${slotKey.toLowerCase()}-${hash}-${randomUUID().slice(0,8)}.${ext}`;writeFileSync(path.join(gameMediaDir,name),binary.bytes,{flag:"wx"});return `/user-content/game-media/${name}`;}
function deleteLocal(profile){if(profile?.storageType!=="LOCAL"||!profile.imageUrl)return;try{const p=path.join(gameMediaDir,path.basename(profile.imageUrl));if(existsSync(p))unlinkSync(p);}catch{}}
function map(row){return row?{gameId:row.game_id,slot:row.slot_key,storageType:row.storage_type,imageUrl:row.image_url,altText:row.alt_text||"",mimeType:row.mime_type||"",width:Number(row.width||0),height:Number(row.height||0),byteSize:Number(row.byte_size||0),fitMode:row.fit_mode||"COVER",quality:Number(row.quality||86),updatedAt:row.updated_at}:null;}
function mapExperience(row){const base=map(row);return base?{...base,experienceKey:row.experience_key}:null;}
function mapEra(row){const base=map(row);return base?{...base,experienceKey:row.experience_key,eraKey:row.era_key}:null;}

export function gameMediaProfile(gameId,slotKey="COVER"){return map(db.prepare(`SELECT * FROM game_media_overrides WHERE game_id=? AND slot_key=?`).get(String(gameId||""),slot(slotKey)));}
export function listGameMedia(gameId){return db.prepare(`SELECT * FROM game_media_overrides WHERE game_id=? ORDER BY slot_key`).all(String(gameId||"")).map(map);}
export function listGameMediaForGames(gameIds=[]){const ids=[...new Set(gameIds.map(String).filter(Boolean))];if(!ids.length)return new Map();const qs=ids.map(()=>"?").join(",");const rows=db.prepare(`SELECT * FROM game_media_overrides WHERE game_id IN (${qs}) ORDER BY game_id,slot_key`).all(...ids);const out=new Map(ids.map(id=>[id,[]]));for(const row of rows)out.get(String(row.game_id))?.push(map(row));return out;}

export function experienceMediaProfile(gameId,experienceKeyValue="main",slotKey="BACKGROUND"){
  const k=experienceKey(experienceKeyValue),s=experienceSlot(slotKey);
  return mapExperience(db.prepare(`SELECT * FROM game_experience_media_overrides WHERE game_id=? AND experience_key=? AND slot_key=?`).get(String(gameId||""),k,s));
}
export function listExperienceMedia(gameId,experienceKeyValue="main"){
  const k=experienceKey(experienceKeyValue);
  return db.prepare(`SELECT * FROM game_experience_media_overrides WHERE game_id=? AND experience_key=? ORDER BY slot_key`).all(String(gameId||""),k).map(mapExperience);
}
export function listAllExperienceMedia(gameId){
  return db.prepare(`SELECT * FROM game_experience_media_overrides WHERE game_id=? ORDER BY experience_key,slot_key`).all(String(gameId||"")).map(mapExperience);
}

function persistExperience({gameId,experienceKey:experienceKeyValue="main",slotKey="BACKGROUND",binary=null,imageUrl="",altText="",fitMode="COVER",quality=86,userId=null}={}){
  if(!gameId)throw new Error("GAME_REQUIRED");
  const k=experienceKey(experienceKeyValue),s=experienceSlot(slotKey),f=fit(fitMode),q=Math.max(20,Math.min(100,Math.round(Number(quality)||86))),previous=experienceMediaProfile(gameId,k,s),now=nowIso();
  let storageType="URL",url="",mime="",size=0,width=0,height=0;
  if(binary){
    const safe=validateBinary(binary.bytes,binary.mime);storageType="LOCAL";mime=safe.mime;size=safe.bytes.length;width=safe.width;height=safe.height;url=writeLocal(gameId,`${k}-${s}`,safe);
  }else{
    url=cleanUrl(imageUrl);
    if(url.startsWith("/user-content/game-media/")){storageType="LOCAL";const localPath=path.join(gameMediaDir,path.basename(url));if(!existsSync(localPath))throw new Error("LOCAL_IMAGE_NOT_FOUND");}
  }
  try{
    db.prepare(`INSERT INTO game_experience_media_overrides(game_id,experience_key,slot_key,storage_type,image_url,alt_text,mime_type,width,height,byte_size,fit_mode,quality,updated_by,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(game_id,experience_key,slot_key) DO UPDATE SET storage_type=excluded.storage_type,image_url=excluded.image_url,alt_text=excluded.alt_text,mime_type=excluded.mime_type,width=excluded.width,height=excluded.height,byte_size=excluded.byte_size,fit_mode=excluded.fit_mode,quality=excluded.quality,updated_by=excluded.updated_by,updated_at=excluded.updated_at`).run(String(gameId),k,s,storageType,url,String(altText||"").trim().slice(0,180),mime,width,height,size,f,q,userId,now,now);
  }catch(error){if(storageType==="LOCAL"&&url!==previous?.imageUrl)deleteLocal({storageType:"LOCAL",imageUrl:url});throw error;}
  if(previous?.storageType==="LOCAL"&&previous.imageUrl!==url)deleteLocal(previous);
  return experienceMediaProfile(gameId,k,s);
}

export function setExperienceMedia({gameId,experienceKey:experienceKeyValue="main",slotKey="BACKGROUND",imageUrl="",imageDataUrl="",altText="",fitMode="COVER",quality=86,userId=null}={}){
  const parsed=parseDataUrl(imageDataUrl);
  if(parsed)return persistExperience({gameId,experienceKey:experienceKeyValue,slotKey,binary:parsed,altText,fitMode,quality,userId});
  const url=cleanUrl(imageUrl);if(!url.startsWith("/user-content/game-media/"))throw new Error("EXTERNAL_IMAGE_REQUIRES_IMPORT");
  return persistExperience({gameId,experienceKey:experienceKeyValue,slotKey,imageUrl:url,altText,fitMode,quality,userId});
}
export async function setExperienceMediaFromUrl({gameId,experienceKey:experienceKeyValue="main",slotKey="BACKGROUND",imageUrl="",altText="",fitMode="COVER",quality=86,userId=null}={}){
  if(!gameId)throw new Error("GAME_REQUIRED");const safeUrl=cleanUrl(imageUrl);
  if(safeUrl.startsWith("/user-content/game-media/"))return persistExperience({gameId,experienceKey:experienceKeyValue,slotKey,imageUrl:safeUrl,altText,fitMode,quality,userId});
  const remote=await fetchPublicBinary(safeUrl,{maxBytes:MAX_BYTES,timeoutMs:10000,maxRedirects:3,accept:"image/webp,image/png,image/jpeg;q=0.9,*/*;q=0.1"});
  const binary=validateBinary(remote.bytes,remote.contentType);
  return persistExperience({gameId,experienceKey:experienceKeyValue,slotKey,binary,altText,fitMode,quality,userId});
}
export function removeExperienceMedia(gameId,experienceKeyValue="main",slotKey="BACKGROUND"){
  const k=experienceKey(experienceKeyValue),s=experienceSlot(slotKey),previous=experienceMediaProfile(gameId,k,s);
  db.prepare(`DELETE FROM game_experience_media_overrides WHERE game_id=? AND experience_key=? AND slot_key=?`).run(String(gameId||""),k,s);deleteLocal(previous);return true;
}


export function eraMediaProfile(gameId,experienceKeyValue="main",eraKeyValue="",slotKey="BACKGROUND"){
  if(!tableExists("game_era_media_overrides"))return null;
  const exp=experienceKey(experienceKeyValue),era=eraKey(eraKeyValue),s=experienceSlot(slotKey);
  return mapEra(db.prepare(`SELECT * FROM game_era_media_overrides WHERE game_id=? AND experience_key=? AND era_key=? AND slot_key=?`).get(String(gameId||""),exp,era,s));
}
export function listEraMedia(gameId,experienceKeyValue="main",eraKeyValue=""){
  if(!tableExists("game_era_media_overrides"))return [];
  const exp=experienceKey(experienceKeyValue),era=eraKey(eraKeyValue);
  return db.prepare(`SELECT * FROM game_era_media_overrides WHERE game_id=? AND experience_key=? AND era_key=? ORDER BY slot_key`).all(String(gameId||""),exp,era).map(mapEra);
}
export function listAllEraMedia(gameId){
  if(!tableExists("game_era_media_overrides"))return [];
  return db.prepare(`SELECT * FROM game_era_media_overrides WHERE game_id=? ORDER BY experience_key,era_key,slot_key`).all(String(gameId||"")).map(mapEra);
}
function persistEra({gameId,experienceKey:experienceKeyValue="main",eraKey:eraKeyValue="",slotKey="BACKGROUND",binary=null,imageUrl="",altText="",fitMode="COVER",quality=86,userId=null}={}){
  if(!gameId)throw new Error("GAME_REQUIRED");
  if(!tableExists("game_era_media_overrides"))throw new Error("ERA_MEDIA_UNAVAILABLE");
  const exp=experienceKey(experienceKeyValue),era=eraKey(eraKeyValue),s=experienceSlot(slotKey),f=fit(fitMode),q=Math.max(20,Math.min(100,Math.round(Number(quality)||86))),previous=eraMediaProfile(gameId,exp,era,s),now=nowIso();
  let storageType="URL",url="",mime="",size=0,width=0,height=0;
  if(binary){const safe=validateBinary(binary.bytes,binary.mime);storageType="LOCAL";mime=safe.mime;size=safe.bytes.length;width=safe.width;height=safe.height;url=writeLocal(gameId,`${exp}-${era}-${s}`,safe);}
  else{url=cleanUrl(imageUrl);if(url.startsWith("/user-content/game-media/")){storageType="LOCAL";const localPath=path.join(gameMediaDir,path.basename(url));if(!existsSync(localPath))throw new Error("LOCAL_IMAGE_NOT_FOUND");}}
  try{
    db.prepare(`INSERT INTO game_era_media_overrides(game_id,experience_key,era_key,slot_key,storage_type,image_url,alt_text,mime_type,width,height,byte_size,fit_mode,quality,updated_by,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(game_id,experience_key,era_key,slot_key) DO UPDATE SET storage_type=excluded.storage_type,image_url=excluded.image_url,alt_text=excluded.alt_text,mime_type=excluded.mime_type,width=excluded.width,height=excluded.height,byte_size=excluded.byte_size,fit_mode=excluded.fit_mode,quality=excluded.quality,updated_by=excluded.updated_by,updated_at=excluded.updated_at`).run(String(gameId),exp,era,s,storageType,url,String(altText||"").trim().slice(0,180),mime,width,height,size,f,q,userId,now,now);
  }catch(error){if(storageType==="LOCAL"&&url!==previous?.imageUrl)deleteLocal({storageType:"LOCAL",imageUrl:url});throw error;}
  if(previous?.storageType==="LOCAL"&&previous.imageUrl!==url)deleteLocal(previous);
  return eraMediaProfile(gameId,exp,era,s);
}
export function setEraMedia({gameId,experienceKey:experienceKeyValue="main",eraKey:eraKeyValue="",slotKey="BACKGROUND",imageUrl="",imageDataUrl="",altText="",fitMode="COVER",quality=86,userId=null}={}){
  const parsed=parseDataUrl(imageDataUrl);if(parsed)return persistEra({gameId,experienceKey:experienceKeyValue,eraKey:eraKeyValue,slotKey,binary:parsed,altText,fitMode,quality,userId});
  const url=cleanUrl(imageUrl);if(!url.startsWith("/user-content/game-media/"))throw new Error("EXTERNAL_IMAGE_REQUIRES_IMPORT");
  return persistEra({gameId,experienceKey:experienceKeyValue,eraKey:eraKeyValue,slotKey,imageUrl:url,altText,fitMode,quality,userId});
}
export async function setEraMediaFromUrl({gameId,experienceKey:experienceKeyValue="main",eraKey:eraKeyValue="",slotKey="BACKGROUND",imageUrl="",altText="",fitMode="COVER",quality=86,userId=null}={}){
  if(!gameId)throw new Error("GAME_REQUIRED");const safeUrl=cleanUrl(imageUrl);
  if(safeUrl.startsWith("/user-content/game-media/"))return persistEra({gameId,experienceKey:experienceKeyValue,eraKey:eraKeyValue,slotKey,imageUrl:safeUrl,altText,fitMode,quality,userId});
  const remote=await fetchPublicBinary(safeUrl,{maxBytes:MAX_BYTES,timeoutMs:10000,maxRedirects:3,accept:"image/webp,image/png,image/jpeg;q=0.9,*/*;q=0.1"});
  return persistEra({gameId,experienceKey:experienceKeyValue,eraKey:eraKeyValue,slotKey,binary:validateBinary(remote.bytes,remote.contentType),altText,fitMode,quality,userId});
}
export function removeEraMedia(gameId,experienceKeyValue="main",eraKeyValue="",slotKey="BACKGROUND"){
  if(!tableExists("game_era_media_overrides"))return true;
  const exp=experienceKey(experienceKeyValue),era=eraKey(eraKeyValue),s=experienceSlot(slotKey),previous=eraMediaProfile(gameId,exp,era,s);
  db.prepare(`DELETE FROM game_era_media_overrides WHERE game_id=? AND experience_key=? AND era_key=? AND slot_key=?`).run(String(gameId||""),exp,era,s);deleteLocal(previous);return true;
}

function persist({gameId,slotKey,binary=null,imageUrl="",altText="",fitMode="COVER",quality=86,userId=null}={}){
  if(!gameId)throw new Error("GAME_REQUIRED");const s=slot(slotKey),f=fit(fitMode),q=Math.max(20,Math.min(100,Math.round(Number(quality)||86))),previous=gameMediaProfile(gameId,s),now=nowIso();
  let storageType="URL",url="",mime="",size=0,width=0,height=0;
  if(binary){const safe=validateBinary(binary.bytes,binary.mime);storageType="LOCAL";mime=safe.mime;size=safe.bytes.length;width=safe.width;height=safe.height;url=writeLocal(gameId,s,safe);}else{url=cleanUrl(imageUrl);if(url.startsWith("/user-content/game-media/")){storageType="LOCAL";const localPath=path.join(gameMediaDir,path.basename(url));if(!existsSync(localPath))throw new Error("LOCAL_IMAGE_NOT_FOUND");}}
  try{
    db.prepare(`INSERT INTO game_media_overrides(game_id,slot_key,storage_type,image_url,alt_text,mime_type,width,height,byte_size,fit_mode,quality,updated_by,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(game_id,slot_key) DO UPDATE SET storage_type=excluded.storage_type,image_url=excluded.image_url,alt_text=excluded.alt_text,mime_type=excluded.mime_type,width=excluded.width,height=excluded.height,byte_size=excluded.byte_size,fit_mode=excluded.fit_mode,quality=excluded.quality,updated_by=excluded.updated_by,updated_at=excluded.updated_at`).run(String(gameId),s,storageType,url,String(altText||"").trim().slice(0,180),mime,width,height,size,f,q,userId,now,now);
  }catch(error){if(storageType==="LOCAL"&&url!==previous?.imageUrl)deleteLocal({storageType:"LOCAL",imageUrl:url});throw error;}
  if(previous?.storageType==="LOCAL"&&previous.imageUrl!==url)deleteLocal(previous);
  return gameMediaProfile(gameId,s);
}

export function setGameMedia({gameId,slotKey="COVER",imageUrl="",imageDataUrl="",altText="",width=0,height=0,fitMode="COVER",quality=86,userId=null}={}){
  const parsed=parseDataUrl(imageDataUrl);if(parsed)return persist({gameId,slotKey,binary:parsed,altText,fitMode,quality,userId});
  // Same-origin media can be referenced directly. External URLs are imported by setGameMediaFromUrl.
  const url=cleanUrl(imageUrl);if(!url.startsWith("/user-content/game-media/"))throw new Error("EXTERNAL_IMAGE_REQUIRES_IMPORT");
  return persist({gameId,slotKey,imageUrl:url,altText,fitMode,quality,userId});
}

export async function setGameMediaFromUrl({gameId,slotKey="COVER",imageUrl="",altText="",fitMode="COVER",quality=86,userId=null}={}){
  if(!gameId)throw new Error("GAME_REQUIRED");const safeUrl=cleanUrl(imageUrl);
  if(safeUrl.startsWith("/user-content/game-media/"))return persist({gameId,slotKey,imageUrl:safeUrl,altText,fitMode,quality,userId});
  const remote=await fetchPublicBinary(safeUrl,{maxBytes:MAX_BYTES,timeoutMs:10000,maxRedirects:3,accept:"image/webp,image/png,image/jpeg;q=0.9,*/*;q=0.1"});
  const binary=validateBinary(remote.bytes,remote.contentType);
  return persist({gameId,slotKey,binary,altText,fitMode,quality,userId});
}

export function removeGameMedia(gameId,slotKey="COVER"){const s=slot(slotKey),previous=gameMediaProfile(gameId,s);db.prepare(`DELETE FROM game_media_overrides WHERE game_id=? AND slot_key=?`).run(String(gameId||""),s);deleteLocal(previous);return true;}
