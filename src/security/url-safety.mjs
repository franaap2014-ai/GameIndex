import dns from "node:dns/promises";
import net from "node:net";

function ipv4Private(address) {
  const p = address.split(".").map(Number);
  if (p.length !== 4) return false;
  return p[0]===10 || p[0]===127 || (p[0]===169&&p[1]===254) || (p[0]===172&&p[1]>=16&&p[1]<=31) || (p[0]===192&&p[1]===168) || p[0]===0 || p[0]>=224;
}
function ipv6Private(address) {
  const a = address.toLowerCase();
  return a==="::1" || a==="::" || a.startsWith("fe80:") || a.startsWith("fc") || a.startsWith("fd") || a.startsWith("::ffff:127.") || a.startsWith("::ffff:10.") || a.startsWith("::ffff:192.168.");
}
function isPrivateIp(address) { return net.isIP(address)===4 ? ipv4Private(address) : net.isIP(address)===6 ? ipv6Private(address) : true; }

export async function assertPublicUrl(value) {
  const url = new URL(value);
  if (!["http:","https:"].includes(url.protocol)) throw new Error("Protocolo de URL não permitido.");
  const host = url.hostname.toLowerCase();
  if (["localhost","localhost.localdomain"].includes(host) || host.endsWith(".local")) throw new Error("Host local bloqueado.");
  if (net.isIP(host) && isPrivateIp(host)) throw new Error("IP privado bloqueado.");
  const addresses = await dns.lookup(host,{all:true,verbatim:true});
  if (!addresses.length || addresses.some(item=>isPrivateIp(item.address))) throw new Error("Destino privado ou inválido bloqueado.");
  return url;
}

async function readLimited(response,maxBytes) {
  const length = Number(response.headers.get("content-length") || 0);
  if (length && length > maxBytes) throw new Error("Resposta externa excede o limite permitido.");
  const reader = response.body?.getReader();
  if (!reader) return "";
  const chunks=[]; let total=0;
  while (true) {
    const {done,value}=await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) { try { await reader.cancel(); } catch {} throw new Error("Resposta externa excede o limite permitido."); }
    chunks.push(value);
  }
  const all = new Uint8Array(total); let offset=0;
  for (const chunk of chunks) { all.set(chunk,offset); offset+=chunk.byteLength; }
  return new TextDecoder().decode(all);
}

export async function fetchPublicText(value,{timeoutMs=8000,maxBytes=1_500_000,maxRedirects=3,headers={}}={}) {
  let current = await assertPublicUrl(value);
  for (let i=0;i<=maxRedirects;i++) {
    const response = await fetch(current,{redirect:"manual",signal:AbortSignal.timeout(timeoutMs),headers:{"user-agent":"GameIndex-Beta/0.99 (+local research; no API key)",accept:"text/html,text/plain;q=0.9,*/*;q=0.5",...headers}});
    if ([301,302,303,307,308].includes(response.status)) {
      const location=response.headers.get("location");
      if (!location) throw new Error("Redirecionamento inválido.");
      current=await assertPublicUrl(new URL(location,current).toString());
      continue;
    }
    if (!response.ok) throw new Error(`Fonte respondeu HTTP ${response.status}.`);
    return {url:current.toString(),contentType:response.headers.get("content-type")||"",text:await readLimited(response,maxBytes)};
  }
  throw new Error("Muitos redirecionamentos externos.");
}

export async function fetchJson(value,{timeoutMs=8000,maxBytes=1_500_000,maxRedirects=3,headers={}}={}) {
  const response=await fetchPublicText(value,{timeoutMs,maxBytes,maxRedirects,headers:{accept:"application/json",...headers}});
  try { return JSON.parse(response.text); }
  catch { throw new Error("Fonte retornou JSON inválido."); }
}

function validImageSignature(bytes,mimeType=""){
  const b=bytes instanceof Uint8Array?bytes:new Uint8Array(bytes||[]);const mime=String(mimeType||"").toLowerCase();
  const png=b.length>8&&b[0]===0x89&&b[1]===0x50&&b[2]===0x4e&&b[3]===0x47;
  const jpg=b.length>3&&b[0]===0xff&&b[1]===0xd8&&b[2]===0xff;
  const gif=b.length>6&&String.fromCharCode(...b.slice(0,3))==="GIF";
  const webp=b.length>12&&String.fromCharCode(...b.slice(0,4))==="RIFF"&&String.fromCharCode(...b.slice(8,12))==="WEBP";
  if(mime.includes("png"))return png;if(mime.includes("jpeg")||mime.includes("jpg"))return jpg;if(mime.includes("gif"))return gif;if(mime.includes("webp"))return webp;return png||jpg||gif||webp;
}

export async function fetchPublicBinary(value,{timeoutMs=9000,maxBytes=4_000_000,maxRedirects=3,accept="image/avif,image/webp,image/png,image/jpeg,image/gif;q=0.8,*/*;q=0.2"}={}){
  let current=await assertPublicUrl(value);
  for(let i=0;i<=maxRedirects;i++){
    const response=await fetch(current,{redirect:"manual",signal:AbortSignal.timeout(timeoutMs),headers:{"user-agent":"GameIndex-Beta/0.99 (+local image memory)",accept}});
    if([301,302,303,307,308].includes(response.status)){const location=response.headers.get("location");if(!location)throw new Error("Redirecionamento inválido.");current=await assertPublicUrl(new URL(location,current).toString());continue;}
    if(!response.ok)throw new Error(`Imagem respondeu HTTP ${response.status}.`);
    const contentType=String(response.headers.get("content-type")||"").split(";")[0].trim().toLowerCase();if(!contentType.startsWith("image/"))throw new Error("O recurso retornado não é uma imagem.");
    const length=Number(response.headers.get("content-length")||0);if(length&&length>maxBytes)throw new Error("Imagem excede o limite permitido.");
    const ab=await response.arrayBuffer();if(ab.byteLength>maxBytes)throw new Error("Imagem excede o limite permitido.");const bytes=new Uint8Array(ab);if(!validImageSignature(bytes,contentType))throw new Error("Assinatura binária de imagem inválida.");
    return {url:current.toString(),contentType,bytes};
  }
  throw new Error("Muitos redirecionamentos externos.");
}
