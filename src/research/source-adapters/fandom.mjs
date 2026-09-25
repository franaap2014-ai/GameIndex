import { knownWikiSources } from "./known-wikis.mjs";
import { createHash } from "node:crypto";
import { fetchPublicText } from "../../security/url-safety.mjs";
import { stableId } from "../../knowledge/normalize.mjs";
import { discoverPublicUrls } from "./public-search.mjs";
import { htmlTitle, pageMedia, articleText } from "./html-utils.mjs";

export async function researchFandom({game=null,query,timeoutMs=8000,limit=4,diagnostics=[]}={}){
  const discovered=await discoverPublicUrls(`${query} site:fandom.com/wiki`,{timeoutMs,limit:Math.max(8,limit*3),diagnostics}),found=[...new Map([...knownWikiSources(game,"FANDOM"),...discovered].map(x=>[x.url,x])).values()],docs=[];
  for(const hit of found){if(docs.length>=limit)break;let u;try{u=new URL(hit.url);}catch{continue;}if(u.hostname!=="fandom.com"&&!u.hostname.toLowerCase().endsWith(".fandom.com"))continue;try{const page=await fetchPublicText(u.toString(),{timeoutMs,maxBytes:2_500_000});const rawText=articleText(page.text);if(rawText.length<120)continue;const title=htmlTitle(page.text)||hit.title;docs.push({sourceId:stableId("doc","fandom",page.url),sourceType:"FANDOM",adapterKey:"fandom",title,url:page.url,rawText,quality:.78,media:pageMedia(page.text).map(x=>({...x,subject:title})),metadata:{sourceFamily:"FANDOM",contentFingerprint:createHash("sha256").update(rawText.slice(0,20000)).digest("hex")},retrievedAt:new Date().toISOString()});}catch(error){diagnostics.push({stage:"FETCH",family:"FANDOM",url:hit.url,code:"SOURCE_UNAVAILABLE",message:String(error.message).slice(0,160)});}}
  return docs;
}
