import { fetchPublicText } from "../../security/url-safety.mjs";
import { stableId } from "../../knowledge/normalize.mjs";

function decodeEntities(text) {
  return text.replace(/&nbsp;/gi," ").replace(/&amp;/gi,"&").replace(/&quot;/gi,'"').replace(/&#39;/gi,"'").replace(/&lt;/gi,"<").replace(/&gt;/gi,">");
}
function visibleText(html) {
  return decodeEntities(String(html||"")
    .replace(/<script\b[\s\S]*?<\/script>/gi," ")
    .replace(/<style\b[\s\S]*?<\/style>/gi," ")
    .replace(/<svg\b[\s\S]*?<\/svg>/gi," ")
    .replace(/<!--([\s\S]*?)-->/g," ")
    .replace(/<[^>]+>/g," ")
    .replace(/\s+/g," ")
    .trim()).slice(0,60000);
}

export async function researchOfficialSite({game,query,intent,timeoutMs=8000}) {
  const officialUrl=game?.officialUrl||game?.siteOficial;
  if (!officialUrl) return [];
  const usefulIntents=new Set(["overview","release","update","story","lore","platforms","QUESTION","HOW_TO","LOCATION","COMPARE","GAME_FULL_BUILD","IMAGE_RESEARCH"]);
  if (intent && !usefulIntents.has(intent)) return [];
  try {
    const page=await fetchPublicText(officialUrl,{timeoutMs,maxBytes:1_200_000});
    const text=visibleText(page.text);
    if (text.length < 100) return [];
    return [{
      sourceId:stableId("doc","official",game.slug,page.url),
      sourceType:"PRIMARY_OFFICIAL",
      adapterKey:"official",
      title:`${game.nome} — site oficial`,
      url:page.url,
      rawText:text,
      quality:.94,
      media:[],
      metadata:{query,intent,gameSlug:game.slug},
      retrievedAt:new Date().toISOString()
    }];
  } catch { return []; }
}
