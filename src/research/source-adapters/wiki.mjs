import { knownWikiSources } from "./known-wikis.mjs";
import { createHash } from "node:crypto";
import { fetchPublicText } from "../../security/url-safety.mjs";
import { stableId } from "../../knowledge/normalize.mjs";
import { discoverPublicUrls } from "./public-search.mjs";
import { htmlTitle, pageMedia, stripHtml } from "./html-utils.mjs";

function wikiLike(url){try{const h=new URL(url).hostname.toLowerCase();if(h.includes("wikipedia.org")||h.includes("wikidata.org")||h.includes("fandom.com"))return false;return h.includes("wiki")||/\/wiki\//i.test(new URL(url).pathname);}catch{return false;}}
export async function researchGameWiki({game=null,query,timeoutMs=8000,limit=4,diagnostics=[]}={}){
  const discovered=await discoverPublicUrls(`${query} game wiki -wikipedia -fandom`,{timeoutMs,limit:Math.max(8,limit*3),diagnostics}),found=[...new Map([...knownWikiSources(game,"WIKI"),...discovered].map(x=>[x.url,x])).values()],docs=[];
  for(const hit of found.filter(x=>wikiLike(x.url))){if(docs.length>=limit)break;try{const page=await fetchPublicText(hit.url,{timeoutMs,maxBytes:2_500_000});const rawText=stripHtml(page.text);if(rawText.length<120)continue;const title=htmlTitle(page.text)||hit.title;docs.push({sourceId:stableId("doc","game-wiki",page.url),sourceType:"WIKI",adapterKey:"game-wiki",title,url:page.url,rawText,quality:.86,media:pageMedia(page.text).map(x=>({...x,subject:title})),metadata:{sourceFamily:"WIKI",notWikipedia:true,contentFingerprint:createHash("sha256").update(rawText.slice(0,20000)).digest("hex")},retrievedAt:new Date().toISOString()});}catch(error){diagnostics.push({stage:"FETCH",family:"WIKI",url:hit.url,code:"SOURCE_UNAVAILABLE",message:String(error.message).slice(0,160)});}}
  return docs;
}
