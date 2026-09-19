import { createHash } from "node:crypto";
import { fetchPublicText } from "../../security/url-safety.mjs";
import { stableId } from "../../knowledge/normalize.mjs";
import { discoverPublicUrls } from "./public-search.mjs";
import { htmlTitle, stripHtml } from "./html-utils.mjs";

function trelloPublic(url){try{const u=new URL(url);return /(^|\.)trello\.com$/i.test(u.hostname)&&/^\/(?:b|c)\//i.test(u.pathname);}catch{return false;}}
export async function researchTrello({query,timeoutMs=8000,limit=3}={}){
  const found=await discoverPublicUrls(`${query} site:trello.com/b OR site:trello.com/c`,{timeoutMs,limit:Math.max(6,limit*3)}),docs=[];
  for(const hit of found.filter(x=>trelloPublic(x.url))){if(docs.length>=limit)break;try{const page=await fetchPublicText(hit.url,{timeoutMs,maxBytes:1_100_000});const rawText=stripHtml(page.text);if(rawText.length<80)continue;const title=htmlTitle(page.text)||hit.title;docs.push({sourceId:stableId("doc","trello",page.url),sourceType:"TRELLO",adapterKey:"trello",title,url:page.url,rawText,quality:.88,media:[],metadata:{sourceFamily:"TRELLO",contentFingerprint:createHash("sha256").update(rawText.slice(0,20000)).digest("hex")},retrievedAt:new Date().toISOString()});}catch{}}
  return docs;
}
