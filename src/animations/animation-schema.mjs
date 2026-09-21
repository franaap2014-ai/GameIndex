const TYPES=new Set(["CINEMATIC","UI_ANIMATION","DECORATION_ANIMATION"]);
const COMPONENTS=new Set([
  "GI_LOGO","GI_G_MARK","TITLE","SUBTITLE","CLASSIFICATION","SYSTEM_LABEL","DIAGNOSTIC_LABEL",
  "RAIL","NODE","BRACKET","FRAME","CIRCUIT_LINE","GRID","CABLE","SOCKET","TECH_CORNER","SEPARATOR",
  "SCAN","GLOW","FLICKER","ENERGY_PULSE","BLACKOUT","BOOT","IRIS","LIGHT_SWEEP","DIGITAL_REVEAL","GLITCH","PARTICLES"
]);
const EASINGS=new Set(["linear","ease","ease-in","ease-out","ease-in-out","GI_BOOT","GI_POWER","GI_IRIS","GI_SCAN","GI_SOFT","GI_TECH"]);
const BACKGROUNDS=new Set(["GAMEINDEX_DARK","GAMEINDEX_LIGHT","BLACKOUT","GRID","TECHNICAL_FIELD","TRANSPARENT"]);
const COLOR_TOKENS=new Set([
  "CREATOR_GOLD","CREATOR_RED","DEV_RED","DEV_BLUE","TESTER_BLUE","PRO_GREEN",
  "DARK_CABLE","LIGHT_CABLE","GAMEINDEX_WHITE","GAMEINDEX_BLACK","GAMEINDEX_PANEL","GAMEINDEX_BORDER"
]);
const LIMITS=Object.freeze({
  x:[-200,200],y:[-200,200],rotation:[-720,720],scale:[0.05,5],scaleX:[0.05,5],scaleY:[0.05,5],
  opacity:[0,1],blur:[0,80],glow:[0,2],brightness:[0,3],width:[0,300],height:[0,300],
  borderOpacity:[0,1],lineProgress:[0,1],scanPosition:[0,1],energy:[0,1],maskProgress:[0,1],clipProgress:[0,1],
  thickness:[0.5,24]
});
const NUMERIC_PROPERTIES=new Set(Object.keys(LIMITS));
const TRACK_KEYS=new Set(["id","component","name","text","color","layer","properties","keyframes"]);
const KEYFRAME_KEYS=new Set(["time","easing",...NUMERIC_PROPERTIES]);

function error(code,message=code){const e=new Error(message);e.code=code;return e;}
function plainObject(v){return Boolean(v&&typeof v==="object"&&!Array.isArray(v));}
function text(v,max=120){const s=String(v??"").normalize("NFKC").trim();if(/[<>]/.test(s))throw error("ANIMATION_SCHEMA_INVALID","Texto contém caracteres não permitidos.");return s.slice(0,max);}
function integer(v,min,max,fallback){const n=Number(v);if(!Number.isFinite(n))return fallback;return Math.max(min,Math.min(max,Math.round(n)));}
function number(v,key,fallback=0){const n=Number(v);if(!Number.isFinite(n))return fallback;const [min,max]=LIMITS[key];return Math.max(min,Math.min(max,n));}
function safeColor(v,fallback="GAMEINDEX_WHITE"){
  const value=String(v||fallback).trim().toUpperCase();
  if(COLOR_TOKENS.has(value))return value;
  const raw=String(v||"").trim();
  if(/^#[0-9a-f]{3}(?:[0-9a-f]{3})?$/i.test(raw))return raw.toLowerCase();
  throw error("ANIMATION_SCHEMA_INVALID","Cor inválida.");
}
function safeId(v,prefix="track"){
  const value=String(v||"").trim().toLowerCase().replace(/[^a-z0-9_-]+/g,"-").replace(/^-+|-+$/g,"").slice(0,64);
  return value||`${prefix}-${Math.random().toString(36).slice(2,10)}`;
}
function rejectExecutable(value){
  const serialized=JSON.stringify(value??null);
  if(/<script|javascript:|onerror\s*=|onload\s*=|expression\s*\(/i.test(serialized))throw error("ANIMATION_SCHEMA_INVALID","Conteúdo executável não é permitido.");
}
function normalizeProperties(input={}){
  if(!plainObject(input))return {};
  const out={};
  for(const [key,value] of Object.entries(input)){
    if(!NUMERIC_PROPERTIES.has(key))throw error("ANIMATION_PROPERTY_NOT_ALLOWED",`Propriedade não permitida: ${key}`);
    out[key]=number(value,key);
  }
  return out;
}
function normalizeKeyframe(input,durationMs,index){
  if(!plainObject(input))throw error("ANIMATION_SCHEMA_INVALID",`Keyframe ${index+1} inválido.`);
  for(const key of Object.keys(input))if(!KEYFRAME_KEYS.has(key))throw error("ANIMATION_PROPERTY_NOT_ALLOWED",`Propriedade de keyframe não permitida: ${key}`);
  const out={time:integer(input.time,0,durationMs,0),easing:EASINGS.has(String(input.easing||""))?String(input.easing):"GI_SOFT"};
  for(const key of NUMERIC_PROPERTIES)if(input[key]!==undefined)out[key]=number(input[key],key);
  return out;
}
function normalizeTrack(input,durationMs,index){
  if(!plainObject(input))throw error("ANIMATION_SCHEMA_INVALID",`Track ${index+1} inválida.`);
  for(const key of Object.keys(input))if(!TRACK_KEYS.has(key))throw error("ANIMATION_SCHEMA_INVALID",`Campo de track não permitido: ${key}`);
  const component=String(input.component||"").toUpperCase();
  if(!COMPONENTS.has(component))throw error("ANIMATION_COMPONENT_UNKNOWN",`Componente desconhecido: ${component||"(vazio)"}`);
  const keyframes=Array.isArray(input.keyframes)?input.keyframes:[];
  if(keyframes.length>128)throw error("ANIMATION_SCHEMA_INVALID","Uma track pode ter no máximo 128 keyframes.");
  const normalizedKeyframes=keyframes.map((frame,i)=>normalizeKeyframe(frame,durationMs,i)).sort((a,b)=>a.time-b.time);
  return {
    id:safeId(input.id,`track-${index+1}`),
    component,
    name:text(input.name||component,80),
    text:input.text===undefined?"":text(input.text,180),
    color:safeColor(input.color||"GAMEINDEX_WHITE"),
    layer:integer(input.layer,-100,100,index),
    properties:normalizeProperties(input.properties),
    keyframes:normalizedKeyframes.length?normalizedKeyframes:[{time:0,easing:"GI_SOFT",opacity:1},{time:durationMs,easing:"GI_SOFT",opacity:1}]
  };
}

export function validateAnimationDefinition(input={},defaults={}){
  if(!plainObject(input))throw error("ANIMATION_SCHEMA_INVALID","Definição de animação inválida.");
  rejectExecutable(input);
  const type=String(input.type||defaults.type||"CINEMATIC").toUpperCase();
  if(!TYPES.has(type))throw error("ANIMATION_SCHEMA_INVALID","Tipo de animação inválido.");
  const durationMs=integer(input.durationMs,250,30000,integer(defaults.durationMs,250,30000,4200));
  const tracks=Array.isArray(input.tracks)?input.tracks:[];
  if(tracks.length>64)throw error("ANIMATION_SCHEMA_INVALID","Uma animação pode ter no máximo 64 tracks.");
  const backgroundInput=plainObject(input.background)?input.background:{};
  const mode=String(backgroundInput.mode||"GAMEINDEX_DARK").toUpperCase();
  if(!BACKGROUNDS.has(mode))throw error("ANIMATION_SCHEMA_INVALID","Fundo inválido.");
  const result={
    schema:"GI_ANIMATION_V1",
    name:text(input.name||defaults.name||"Nova animação",100),
    type,
    durationMs,
    background:{mode,color:backgroundInput.color?safeColor(backgroundInput.color):null},
    tracks:tracks.map((track,index)=>normalizeTrack(track,durationMs,index))
  };
  const ids=new Set();
  for(const track of result.tracks){if(ids.has(track.id))throw error("ANIMATION_SCHEMA_INVALID",`Track duplicada: ${track.id}`);ids.add(track.id);}
  return result;
}

export function animationSchemaCatalog(){
  return {
    schema:"GI_ANIMATION_V1",
    types:[...TYPES],
    components:[...COMPONENTS],
    easings:[...EASINGS],
    backgrounds:[...BACKGROUNDS],
    colorTokens:[...COLOR_TOKENS],
    numericProperties:[...NUMERIC_PROPERTIES],
    limits:LIMITS
  };
}

export const ANIMATION_TYPES=Object.freeze([...TYPES]);
export const ANIMATION_COMPONENTS=Object.freeze([...COMPONENTS]);
export const ANIMATION_EASINGS=Object.freeze([...EASINGS]);
export const ANIMATION_COLOR_TOKENS=Object.freeze([...COLOR_TOKENS]);
