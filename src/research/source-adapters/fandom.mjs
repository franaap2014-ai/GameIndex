import { createHash } from "node:crypto";
import { fetchPublicText } from "../../security/url-safety.mjs";
import { stableId } from "../../knowledge/normalize.mjs";
import { discoverPublicUrls } from "./public-search.mjs";
import { htmlTitle, pageMedia, stripHtml } from "./html-utils.mjs";

export async function researchFandom({query,timeoutMs=8000,limit=4}={}){
  const found=await discoverPublicUrls(`${query} site:fandom.com/wiki`,{timeoutMs,limit:Math.max(8,limit*3)}),docs=[];
  for(const hit of found){if(docs.length>=limit)break;let u;try{u=new URL(hit.url);}catch{continue;}if(!u.hostname.toLowerCase().endsWith("fandom.com"))continue;try{const page=await fetchPublicText(u.toString(),{timeoutMs,maxBytes:1_300_000});const rawText=stripHtml(page.text);if(rawText.length<120)continue;const title=htmlTitle(page.text)||hit.title;docs.push({sourceId:stableId("doc","fandom",page.url),sourceType:"FANDOM",adapterKey:"fandom",title,url:page.url,rawText,quality:.78,media:pageMedia(page.text).map(x=>({...x,subject:title})),metadata:{sourceFamily:"FANDOM",contentFingerprint:createHash("sha256").update(rawText.slice(0,20000)).digest("hex")},retrievedAt:new Date().toISOString()});}catch{}}
  return docs;
}
