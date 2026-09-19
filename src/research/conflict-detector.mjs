import { jaccardScore, normalizeText } from "../knowledge/normalize.mjs";

function numbers(text) { return [...String(text).matchAll(/\b\d+(?:[.,]\d+)?%?\b/g)].map(m=>m[0].replace(",",".")); }
function skeleton(text) { return normalizeText(String(text).replace(/\b\d+(?:[.,]\d+)?%?\b/g," ")); }

export function detectConflicts(evidence=[]) {
  const conflicts=[];
  for (let i=0;i<evidence.length;i++) for (let j=i+1;j<evidence.length;j++) {
    const a=evidence[i],b=evidence[j];
    if (a.sourceDocument?.url===b.sourceDocument?.url) continue;
    const an=numbers(a.claim),bn=numbers(b.claim);
    if (!an.length || !bn.length || an.join("|")===bn.join("|")) continue;
    const similarity=jaccardScore(skeleton(a.claim),skeleton(b.claim));
    if (similarity>=.46) conflicts.push({type:"NUMERIC_DISAGREEMENT",a:a.id,b:b.id,similarity,valuesA:an,valuesB:bn});
  }
  return conflicts.slice(0,8);
}
