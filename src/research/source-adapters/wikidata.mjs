import { fetchJson } from "../../security/url-safety.mjs";
import { stableId } from "../../knowledge/normalize.mjs";

export async function researchWikidata({query,language="pt",limit=5,timeoutMs=8000}) {
  const lang=language.startsWith("pt")?"pt":language.startsWith("es")?"es":"en";
  const params=new URLSearchParams({action:"wbsearchentities",search:query,language:lang,uselang:lang,format:"json",limit:String(limit),origin:"*"});
  try {
    const data=await fetchJson(`https://www.wikidata.org/w/api.php?${params}`,{timeoutMs});
    return (data.search||[]).filter(item=>item.label).map(item=>({
      sourceId:stableId("doc","wikidata",item.id),
      sourceType:"STRUCTURED_DATABASE",
      adapterKey:"wikidata",
      title:item.label,
      url:item.concepturi || `https://www.wikidata.org/wiki/${item.id}`,
      rawText:[item.label,item.description].filter(Boolean).join(" — "),
      quality:.8,
      media:[],
      metadata:{language:lang,entityId:item.id,aliases:item.aliases||[]},
      retrievedAt:new Date().toISOString()
    }));
  } catch { return []; }
}
