import { isGenericFiller } from "../../core85/deterministic-intelligence.mjs";

export function cleanKnowledge(entry){
  return {
    id:entry.id,
    title:entry.title,
    summary:entry.summary||"",
    entityName:entry.entityName||"",
    entityType:entry.semanticEntityType||entry.entityType||"",
    canonStatus:entry.canonStatus||"UNKNOWN",
    status:entry.status||"CURRENT",
    confidence:entry.confidence||0,
    claims:(entry.claims||[]).map(c=>c.text).filter(Boolean).filter(text=>!isGenericFiller(text))
  };
}

export function paragraph(entry){
  const summary=!isGenericFiller(entry?.summary||"")?String(entry?.summary||"").trim():"";
  const first=(entry?.claims||[]).map(c=>c.text).filter(Boolean).find(text=>!isGenericFiller(text));
  return first&&first!==summary?`${summary}${summary?" ":""}${first}`:summary||first||"";
}

export function languageCode(plan={}){
  const raw=String(plan.language||"pt-BR").toLowerCase();
  if(raw.startsWith("en"))return "en";
  if(raw.startsWith("es"))return "es";
  return "pt";
}

export function localize(plan,values={}){
  const lang=languageCode(plan);
  return values[lang]??values.pt??values.en??Object.values(values)[0]??"";
}

export function safeClaims(entry={}){
  const out=[];
  const add=text=>{const clean=String(text||"").trim();if(clean&&!isGenericFiller(clean)&&!out.some(x=>x.toLowerCase()===clean.toLowerCase()))out.push(clean);};
  add(entry.summary);
  for(const claim of entry.claims||[])add(typeof claim==="string"?claim:claim?.text);
  return out;
}

export function bulletBody(values=[]){
  const clean=[...new Set(values.map(v=>String(v||"").trim()).filter(Boolean))];
  if(clean.length<=1)return clean[0]||"";
  return clean.map(v=>`• ${v}`).join("\n");
}
