import { createHash } from "node:crypto";
import { fetchPublicText } from "../../security/url-safety.mjs";
import { stableId } from "../../knowledge/normalize.mjs";
import { discoverPublicUrls } from "./public-search.mjs";
import { htmlDescription, htmlTitle, metaContent, stripHtml } from "./html-utils.mjs";

function videoId(url){try{const u=new URL(url);if(u.hostname.includes("youtu.be"))return u.pathname.split("/").filter(Boolean)[0]||"";if(u.hostname.includes("youtube.com"))return u.searchParams.get("v")||"";}catch{}return "";}
export async function researchYouTube({query,timeoutMs=9000,limit=4}={}){
  const found=await discoverPublicUrls(`${query} site:youtube.com/watch`,{timeoutMs,limit:Math.max(8,limit*3)}),docs=[];
  for(const hit of found){if(docs.length>=limit)break;const id=videoId(hit.url);if(!id)continue;const url=`https://www.youtube.com/watch?v=${encodeURIComponent(id)}`;try{const page=await fetchPublicText(url,{timeoutMs,maxBytes:1_600_000,headers:{accept:"text/html"}});const title=(htmlTitle(page.text)||hit.title).replace(/\s*-\s*YouTube\s*$/i,"").trim();const description=htmlDescription(page.text);const author=metaContent(page.text,"author")||metaContent(page.text,"og:site_name")||"YouTube";const visible=stripHtml(page.text,12000);const rawText=[title,description,visible.slice(0,8000)].filter(Boolean).join(". ").replace(/\s+/g," ").slice(0,12000);if(rawText.length<60)continue;docs.push({sourceId:stableId("doc","youtube",id),sourceType:"YOUTUBE",adapterKey:"youtube-public",title,url:page.url,rawText,quality:.68,media:[{url:`https://i.ytimg.com/vi/${id}/hqdefault.jpg`,role:"THUMBNAIL",subject:title}],metadata:{sourceFamily:"YOUTUBE",videoId:id,channel:author,transcriptAvailable:false,publicMetadataOnly:true,contentFingerprint:createHash("sha256").update(rawText).digest("hex")},retrievedAt:new Date().toISOString()});}catch{}}
  return docs;
}
