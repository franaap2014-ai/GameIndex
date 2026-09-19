import { fetchJson } from "../../security/url-safety.mjs";
import { normalizeText, stableId } from "../../knowledge/normalize.mjs";

function buildUrl(language,query,limit) {
  const params=new URLSearchParams({action:"query",format:"json",formatversion:"2",generator:"search",gsrsearch:query,gsrlimit:String(limit),prop:"extracts|pageimages|info",exintro:"1",explaintext:"1",inprop:"url",piprop:"thumbnail|original|name",pithumbsize:"1200"});
  return `https://${language}.wikipedia.org/w/api.php?${params}`;
}

export async function researchWikipedia({query,language="pt",limit=4,timeoutMs=8000}) {
  const languages = language.startsWith("pt") ? ["pt","en"] : language.startsWith("es") ? ["es","en"] : ["en","pt"];
  const docs=[];
  for (const lang of languages) {
    try {
      const data=await fetchJson(buildUrl(lang,query,limit),{timeoutMs});
      for (const page of data?.query?.pages || []) {
        if (!page.extract || page.extract.length < 60) continue;
        docs.push({
          sourceId:stableId("doc","wikipedia",lang,page.pageid),
          sourceType:"WIKI",
          adapterKey:"wikipedia",
          title:page.title,
          url:page.fullurl || `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(page.title.replaceAll(" ","_"))}`,
          rawText:page.extract,
          quality:.74,
          media:[page.original?.source,page.thumbnail?.source].filter(Boolean).map((url,index)=>({url,role:index===0?"CANDIDATE":"THUMBNAIL",subject:page.title})),
          metadata:{language:lang,pageId:page.pageid,pageImage:page.pageimage||"",exactTitle:normalizeText(page.title)===normalizeText(query)},
          retrievedAt:new Date().toISOString()
        });
      }
    } catch {}
    if (docs.length >= limit) break;
  }
  const seen=new Set();
  return docs.filter(doc=>{const key=doc.url;if(seen.has(key))return false;seen.add(key);return true;}).slice(0,limit);
}
