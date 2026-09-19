const RESERVED = new Set([
  "admin","administrator","gamevault","gamevaultadmin","system","moderator","support"
]);

export function normalizeUsername(value="") {
  return String(value ?? "").normalize("NFKC").trim().toLocaleLowerCase("en-US");
}

export function canonicalUsername(value="") {
  const raw=String(value ?? "").normalize("NFKC").trim();
  if(raw.length<3 || raw.length>30) throw new Error("O nome de usuário deve ter entre 3 e 30 caracteres.");
  if(!/^[A-Za-z0-9_]+$/.test(raw)) throw new Error("Use apenas letras, números e _ no nome de usuário.");
  return raw;
}

export function isReservedUsername(value="") {
  return RESERVED.has(normalizeUsername(value));
}

export function assertAllowedUsername(value="") {
  const username=canonicalUsername(value);
  const normalizedUsername=normalizeUsername(username);
  if(isReservedUsername(normalizedUsername)) throw new Error("Esse nome de usuário é reservado pelo GameIndex.");
  return {username,normalizedUsername};
}

export function reservedUsernames(){ return [...RESERVED]; }
