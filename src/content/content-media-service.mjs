import { createHash } from "node:crypto";
import { db, json, nowIso, parseJson } from "../database/connection.mjs";
import { assertPublicUrl } from "../security/url-safety.mjs";

function tableExists(){try{return Boolean(db.prepare(`SELECT 1 FROM sqlite_master WHERE type='table' AND name='content_media'`).get());}catch{return false;}}
function clean(value,max=300){return String(value??"").replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim().slice(0,max);}
function map(row){return row?{id:row.id,entityGameId:row.entity_game_id,pageId:row.page_id||null,sectionId:row.section_id||null,topicId:row.topic_id||null,mediaType:row.media_type,sourceUrl:row.source_url,cachedPath:row.cached_path||"",attribution:parseJson(row.attribution_json,{}),altText:row.alt_text||"",caption:parseJson(row.caption_json,{}),locale:row.locale||"",status:row.status,sourceId:row.source_id||null,revisionId:row.revision_id||null,width:Number(row.width||0),height:Number(row.height||0),byteSize:Number(row.byte_size||0),createdAt:row.created_at,updatedAt:row.updated_at}:null;}

export async function upsertContentMedia({entityGameId,pageId=null,sectionId=null,topicId=null,mediaType="IMAGE",sourceUrl,cachedPath="",attribution={},altText="",caption={},locale="",status="CANDIDATE",sourceId=null,revisionId=null,width=0,height=0,byteSize=0}={}){
  if(!tableExists())throw new Error("CONTENT_MEDIA_SCHEMA_REQUIRED");
  if(!entityGameId||!sourceUrl)throw new Error("CONTENT_MEDIA_REQUIRED_FIELDS");
  const url=await assertPublicUrl(sourceUrl),state=["CANDIDATE","APPROVED","ARCHIVED","FAILED"].includes(String(status).toUpperCase())?String(status).toUpperCase():"CANDIDATE";
  const revisionKey=revisionId||"live",id=`content-media-${createHash("sha256").update(`${entityGameId}|${url.toString()}|${revisionKey}`).digest("hex").slice(0,28)}`,now=nowIso();
  db.prepare(`INSERT INTO content_media(id,entity_game_id,page_id,section_id,topic_id,media_type,source_url,cached_path,attribution_json,alt_text,caption_json,locale,status,source_id,revision_id,width,height,byte_size,created_at,updated_at)
    VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    ON CONFLICT(id) DO UPDATE SET
      page_id=COALESCE(excluded.page_id,content_media.page_id),section_id=COALESCE(excluded.section_id,content_media.section_id),topic_id=COALESCE(excluded.topic_id,content_media.topic_id),media_type=excluded.media_type,cached_path=excluded.cached_path,attribution_json=excluded.attribution_json,alt_text=excluded.alt_text,caption_json=excluded.caption_json,locale=excluded.locale,status=excluded.status,source_id=COALESCE(excluded.source_id,content_media.source_id),revision_id=excluded.revision_id,width=MAX(content_media.width,excluded.width),height=MAX(content_media.height,excluded.height),byte_size=MAX(content_media.byte_size,excluded.byte_size),updated_at=excluded.updated_at`)
    .run(id,String(entityGameId),pageId||null,sectionId||null,topicId||null,clean(mediaType,30).toUpperCase(),url.toString(),clean(cachedPath,500),json(attribution&&typeof attribution==="object"?attribution:{}),clean(altText,240),json(caption&&typeof caption==="object"?caption:{}),clean(locale,20),state,sourceId||null,revisionId||null,Math.max(0,Number(width)||0),Math.max(0,Number(height)||0),Math.max(0,Number(byteSize)||0),now,now);
  return getContentMedia(id);
}
export function getContentMedia(id){if(!tableExists())return null;return map(db.prepare(`SELECT * FROM content_media WHERE id=?`).get(String(id||"")));}
export function listContentMedia(entityGameId,{status="APPROVED",limit=80,revisionId=null}={}){if(!tableExists())return [];const where=["entity_game_id=?"],args=[String(entityGameId||"")];if(status){where.push("status=?");args.push(String(status).toUpperCase());}if(revisionId){where.push("revision_id=?");args.push(String(revisionId));}return db.prepare(`SELECT * FROM content_media WHERE ${where.join(" AND ")} ORDER BY updated_at DESC LIMIT ?`).all(...args,Math.min(200,Math.max(1,Number(limit)||80))).map(map);}
