import { fetchPublicText } from "../../security/url-safety.mjs";
import { decodeHtml, stripHtml } from "./html-utils.mjs";

function unwrapDuckDuckGo(value=""){
  try{
    const u=new URL(decodeHtml(value),"https://duckduckgo.com");
    // URLSearchParams has already decoded the redirect target once.
    return u.searchParams.get("uddg")||u.toString();
  }catch{return "";}
}
export function parseSearchResults(html=""){
  const out=[];
  for(const match of String(html).matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)){
    const attrs={};for(const a of match[1].matchAll(/([\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g))attrs[a[1].toLowerCase()]=a[2]??a[3];
    if(!String(attrs.class||"").split(/\s+/).includes("result__a"))continue;
    const url=unwrapDuckDuckGo(attrs.href||""),title=stripHtml(match[2],220);
    if(/^https?:\/\//i.test(url)&&title)out.push({url,title});
    if(out.length>=30)break;
  }
  return out;
}
export async function discoverPublicUrls(query,{timeoutMs=8000,limit=8,diagnostics=[]}={}){
  const q=String(query||"").trim();if(!q)return [];
  try{
    const page=await fetchPublicText(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(q)}`,{timeoutMs,maxBytes:900_000,headers:{accept:"text/html"}});
    const seen=new Set(),results=parseSearchResults(page.text).filter(x=>{if(seen.has(x.url))return false;seen.add(x.url);return true;}).slice(0,Math.max(1,Math.min(20,Number(limit)||8)));
    if(!results.length)diagnostics.push({stage:"DISCOVERY",code:/anomaly|captcha|verify.{0,30}human/i.test(page.text)?"SEARCH_CHALLENGE":"SEARCH_EMPTY"});
    return results;
  }catch(error){diagnostics.push({stage:"DISCOVERY",code:"SEARCH_UNAVAILABLE",message:String(error.message).slice(0,160)});return [];}
}
