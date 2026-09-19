import { fetchPublicText } from "../../security/url-safety.mjs";
import { decodeHtml, stripHtml } from "./html-utils.mjs";

function unwrapDuckDuckGo(value=""){
  try{
    const u=new URL(decodeHtml(value),"https://duckduckgo.com");
    const target=u.searchParams.get("uddg");
    return target?decodeURIComponent(target):u.toString();
  }catch{return "";}
}
function parseResults(html=""){
  const out=[];const re=/<a[^>]+class=["'][^"']*result__a[^"']*["'][^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let m;while((m=re.exec(String(html)))&&out.length<30){const url=unwrapDuckDuckGo(m[1]);const title=stripHtml(m[2],220);if(/^https?:\/\//i.test(url)&&title)out.push({url,title});}
  return out;
}
export async function discoverPublicUrls(query,{timeoutMs=8000,limit=8}={}){
  const q=String(query||"").trim();if(!q)return [];
  const url=`https://html.duckduckgo.com/html/?q=${encodeURIComponent(q)}`;
  try{
    const page=await fetchPublicText(url,{timeoutMs,maxBytes:900_000,headers:{accept:"text/html"}});
    const seen=new Set();return parseResults(page.text).filter(x=>{if(seen.has(x.url))return false;seen.add(x.url);return true;}).slice(0,Math.max(1,Math.min(20,Number(limit)||8)));
  }catch{return [];}
}
