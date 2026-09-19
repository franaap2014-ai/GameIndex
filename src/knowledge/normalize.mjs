import { createHash, randomUUID } from "node:crypto";

export function normalizeText(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export function slugify(value = "") {
  return normalizeText(value).replace(/\s+/g, "-") || randomUUID();
}

const STOPWORDS = new Set([
  "a","o","as","os","um","uma","uns","umas","de","da","do","das","dos","e","em","no","na","nos","nas","para","por","com","sem","que","qual","quais","como","onde","quando","quem","porque","pq","pra","pro","mais","muito","muita","the","a","an","of","in","on","to","for","and","or","with","without","what","which","how","where","when","who","why","is","are","was","were","this","that","game","jogo","jogos","games","me","eu","ele","ela","eles","elas","isso","isto","esse","essa","este","esta"
]);

export function tokenize(value = "") {
  return normalizeText(value).split(" ").filter(token => token.length > 1 && !STOPWORDS.has(token));
}

export function tokenSet(value = "") {
  return new Set(tokenize(value));
}

export function overlapScore(a, b) {
  const aa = tokenSet(a), bb = tokenSet(b);
  if (!aa.size || !bb.size) return 0;
  let intersection = 0;
  for (const token of aa) if (bb.has(token)) intersection++;
  return intersection / Math.max(aa.size, bb.size);
}

export function jaccardScore(a, b) {
  const aa = tokenSet(a), bb = tokenSet(b);
  if (!aa.size || !bb.size) return 0;
  let intersection = 0;
  for (const token of aa) if (bb.has(token)) intersection++;
  return intersection / (aa.size + bb.size - intersection);
}

export function stableId(prefix, ...parts) {
  const raw = parts.map(part => normalizeText(typeof part === "string" ? part : JSON.stringify(part))).join("|");
  return `${prefix}_${createHash("sha1").update(raw).digest("hex").slice(0, 20)}`;
}

export function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, Number(value) || 0));
}

export function uniqueStrings(values = []) {
  const seen = new Set();
  const result = [];
  for (const value of values) {
    const text = String(value || "").trim();
    const key = normalizeText(text);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    result.push(text);
  }
  return result;
}
