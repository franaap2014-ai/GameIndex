export function avatarDisplayUrl(avatarUrl="",updatedAt=""){
  const raw=String(avatarUrl||"").trim();
  if(!raw)return "";
  const revision=String(updatedAt||"").trim();
  if(!revision)return raw;
  const joiner=raw.includes("?")?"&":"?";
  return `${raw}${joiner}v=${encodeURIComponent(revision)}`;
}

export function avatarInitials(value=""){
  const clean=String(value||"GI").trim();
  const parts=clean.split(/\s+/).filter(Boolean);
  return (parts.map(part=>part[0]||"").join("").slice(0,2)||"GI").toUpperCase();
}
