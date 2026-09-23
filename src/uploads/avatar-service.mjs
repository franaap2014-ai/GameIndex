import { existsSync, unlinkSync, writeFileSync, readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { avatarsDir, db, nowIso } from "../database/connection.mjs";

const MAX=2*1024*1024;
const MAX_DIMENSION=4096;
const MIN_DIMENSION=32;
const TYPES={
  "image/png":{ext:"png",magic:b=>b.length>24&&b[0]===0x89&&b[1]===0x50&&b[2]===0x4e&&b[3]===0x47,dimensions:pngDimensions},
  "image/jpeg":{ext:"jpg",magic:b=>b.length>3&&b[0]===0xff&&b[1]===0xd8&&b[2]===0xff,dimensions:jpegDimensions},
  "image/webp":{ext:"webp",magic:b=>b.length>30&&b.toString("ascii",0,4)==="RIFF"&&b.toString("ascii",8,12)==="WEBP",dimensions:webpDimensions}
};

function pngDimensions(buffer){return {width:buffer.readUInt32BE(16),height:buffer.readUInt32BE(20)};}
function jpegDimensions(buffer){
  let offset=2;
  while(offset+9<buffer.length){
    if(buffer[offset]!==0xff){offset++;continue;}
    const marker=buffer[offset+1];offset+=2;
    if(marker===0xd8||marker===0xd9)continue;
    if(offset+2>buffer.length)break;
    const length=buffer.readUInt16BE(offset);if(length<2||offset+length>buffer.length)break;
    if(new Set([0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb,0xcd,0xce,0xcf]).has(marker))return {height:buffer.readUInt16BE(offset+3),width:buffer.readUInt16BE(offset+5)};
    offset+=length;
  }
  return {width:0,height:0};
}
function webpDimensions(buffer){
  const kind=buffer.toString("ascii",12,16);
  if(kind==="VP8X"&&buffer.length>=30){return {width:1+buffer.readUIntLE(24,3),height:1+buffer.readUIntLE(27,3)};}
  if(kind==="VP8 "&&buffer.length>=30){return {width:buffer.readUInt16LE(26)&0x3fff,height:buffer.readUInt16LE(28)&0x3fff};}
  if(kind==="VP8L"&&buffer.length>=25&&buffer[20]===0x2f){const b0=buffer[21],b1=buffer[22],b2=buffer[23],b3=buffer[24];return {width:1+(b0|((b1&0x3f)<<8)),height:1+((b1>>6)|(b2<<2)|((b3&0x0f)<<10))};}
  return {width:0,height:0};
}
function validateDimensions(dim){
  const width=Number(dim?.width||0),height=Number(dim?.height||0);
  if(!width||!height)throw new Error("Não foi possível validar as dimensões da foto de perfil.");
  if(width<MIN_DIMENSION||height<MIN_DIMENSION)throw new Error(`A foto de perfil precisa ter pelo menos ${MIN_DIMENSION}×${MIN_DIMENSION}px.`);
  if(width>MAX_DIMENSION||height>MAX_DIMENSION)throw new Error(`A foto de perfil pode ter no máximo ${MAX_DIMENSION}×${MAX_DIMENSION}px.`);
  return {width,height};
}
function avatarFilenameFromUrl(url=""){
  const raw=String(url||"").split("?")[0];
  const prefix="/user-content/avatars/";
  if(!raw.startsWith(prefix))return "";
  const name=path.basename(raw.slice(prefix.length));
  return /^[a-f0-9-]+\.(?:png|jpg|webp)$/i.test(name)?name:"";
}
export function deleteAvatarByUrl(url=""){
  const name=avatarFilenameFromUrl(url);if(!name)return false;
  const file=path.join(avatarsDir,name);
  try{db.prepare(`DELETE FROM uploaded_avatar_assets WHERE filename=?`).run(name);if(existsSync(file))unlinkSync(file);return true;}catch{return false;}
}
export function saveAvatarDataUrl(dataUrl){
  const match=String(dataUrl||"").match(/^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/=]+)$/);
  if(!match)throw new Error("Use uma imagem PNG, JPEG ou WebP válida.");
  const type=match[1],meta=TYPES[type];
  const buffer=Buffer.from(match[2],"base64");
  if(!meta||!meta.magic(buffer))throw new Error("O conteúdo do arquivo não corresponde ao tipo de imagem informado.");
  if(buffer.length>MAX)throw new Error("A foto de perfil deve ter no máximo 2 MB.");
  if(buffer.length<32)throw new Error("Arquivo de imagem inválido.");
  const dimensions=validateDimensions(meta.dimensions(buffer));
  const name=`${randomUUID()}.${meta.ext}`;
  writeFileSync(path.join(avatarsDir,name),buffer,{mode:0o644,flag:"wx"});
  try{db.prepare(`INSERT INTO uploaded_avatar_assets(filename,mime_type,payload,created_at) VALUES(?,?,?,?)`).run(name,type,buffer,nowIso());}catch(error){unlinkSync(path.join(avatarsDir,name));throw error;}
  return {url:`/user-content/avatars/${name}`,mimeType:type,sizeBytes:buffer.length,...dimensions};
}

export function readDurableAvatar(filename){
  if(!/^[a-f0-9-]+\.(?:png|jpg|webp)$/i.test(String(filename)))return null;
  const row=db.prepare(`SELECT mime_type,payload FROM uploaded_avatar_assets WHERE filename=?`).get(filename);
  return row?{mimeType:row.mime_type,bytes:Buffer.from(row.payload)}:null;
}
export function preserveExistingAvatars(){
  if(!db.prepare(`SELECT 1 FROM sqlite_master WHERE name='uploaded_avatar_assets'`).get())return {saved:0};
  let saved=0;
  const insert=db.prepare(`INSERT OR IGNORE INTO uploaded_avatar_assets(filename,mime_type,payload,created_at) VALUES(?,?,?,?)`);
  for(const row of db.prepare(`SELECT DISTINCT avatar_url FROM user_profiles WHERE avatar_url LIKE '/user-content/avatars/%'`).all()){
    const name=avatarFilenameFromUrl(row.avatar_url);if(!name)continue;
    if(db.prepare(`SELECT 1 FROM uploaded_avatar_assets WHERE filename=?`).get(name))continue;
    const file=path.join(avatarsDir,name);if(!existsSync(file))continue;
    const bytes=readFileSync(file),type=name.endsWith('.png')?'image/png':name.endsWith('.webp')?'image/webp':'image/jpeg';
    if(bytes.length<32||bytes.length>MAX||!TYPES[type].magic(bytes))continue;
    insert.run(name,type,bytes,nowIso());saved++;
  }
  return {saved};
}
