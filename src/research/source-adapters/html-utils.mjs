export function decodeHtml(value=""){
  return String(value||"")
    .replace(/&amp;/gi,"&").replace(/&quot;/gi,'"').replace(/&#39;|&#x27;/gi,"'")
    .replace(/&lt;/gi,"<").replace(/&gt;/gi,">").replace(/&nbsp;/gi," ")
    .replace(/&#(\d+);/g,(_,n)=>{try{return String.fromCodePoint(Number(n));}catch{return " ";}});
}
export function stripHtml(html="",max=60000){
  return decodeHtml(String(html||"")
    .replace(/<script\b[\s\S]*?<\/script>/gi," ")
    .replace(/<style\b[\s\S]*?<\/style>/gi," ")
    .replace(/<svg\b[\s\S]*?<\/svg>/gi," ")
    .replace(/<!--([\s\S]*?)-->/g," ")
    .replace(/<[^>]+>/g," ")
    .replace(/\s+/g," ").trim()).slice(0,max);
}
export function metaContent(html,name){
  const escaped=String(name||"").replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
  const patterns=[
    new RegExp(`<meta[^>]+(?:property|name)=["']${escaped}["'][^>]+content=["']([^"']+)["'][^>]*>`,`i`),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${escaped}["'][^>]*>`,`i`)
  ];
  for(const re of patterns){const m=String(html||"").match(re);if(m?.[1])return decodeHtml(m[1]).trim();}
  return "";
}
export function htmlTitle(html=""){
  return metaContent(html,"og:title")||decodeHtml(String(html).match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]||"").replace(/\s+/g," ").trim();
}
export function htmlDescription(html=""){
  return metaContent(html,"description")||metaContent(html,"og:description");
}
export function pageMedia(html=""){
  const urls=[metaContent(html,"og:image"),metaContent(html,"twitter:image")].filter(Boolean);
  return [...new Set(urls)].map((url,index)=>({url,role:index===0?"CANDIDATE":"THUMBNAIL",subject:""}));
}
