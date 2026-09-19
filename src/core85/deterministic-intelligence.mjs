import { normalizeText } from "../knowledge/normalize.mjs";

const TYPE_RULES=[
  ["BOSS",/\b(boss|chefe|raid boss|world boss)\b/i],
  ["LOCATION",/\b(location|local|zone|zona|island|ilha|biome|bioma|city|cidade|temple|templo|dungeon|masmorra|level|fase)\b/i],
  ["WEAPON",/\b(weapon|arma|sword|espada|gun|rifle|bow|arco|blade|lâmina|katana|staff|cajado)\b/i],
  ["TOOL",/\b(tool|ferramenta|pickaxe|picareta|axe|machado|shovel|pá|hoe|enxada)\b/i],
  ["ITEM",/\b(item|objeto|artifact|artefato|key|chave|ring|anel|armor|armadura|helmet|capacete)\b/i],
  ["CURRENCY",/\b(currency|moeda|coin|coins|gold|ouro|robux|gem|gems|crystal|cristal)\b/i],
  ["MOB",/\b(mob|enemy|inimigo|creature|criatura|monster|monstro|animal)\b/i],
  ["CHARACTER",/\b(character|personagem|hero|herói|villain|vilão|npc|protagonist|protagonista)\b/i],
  ["ABILITY",/\b(ability|habilidade|skill|poder|power|spell|magia|move|golpe)\b/i],
  ["TRANSFORMATION",/\b(transformation|transformação|form|forma|super|hyper|evolution|evolução)\b/i],
  ["MECHANIC",/\b(mechanic|mecânica|system|sistema|crafting|combate|combat|movement|movimento)\b/i],
  ["RESOURCE",/\b(resource|recurso|ore|minério|material|wood|madeira|stone|pedra)\b/i]
];

const INTENT_RULES=[
  ["HOW_TO_CRAFT",/\b(craft|crafting|recipe|receita|fabricar|fazer|construir)\b/i],
  ["HOW_TO_GET",/\b(obter|conseguir|pegar|get|obtain|acquire|drop)\b/i],
  ["WHERE_TO_FIND",/\b(onde|where|local|location|find|encontrar|spawn)\b/i],
  ["HOW_TO_UNLOCK",/\b(unlock|desbloquear|liberar|requirement|requisito)\b/i],
  ["HOW_TO_DEFEAT",/\b(defeat|derrotar|vencer|beat|boss fight|luta)\b/i],
  ["HOW_TO_USE",/\b(use|usar|serve|funciona|equip|equipar)\b/i],
  ["LORE",/\b(lore|história|historia|story|canon|cânone|teoria|theory)\b/i],
  ["COMPARISON",/\b(compare|comparar|comparison|versus|\bvs\b|melhor|better)\b/i]
];

const GENERIC_PATTERNS=[
  /^.{0,20}$/,
  /\b(este conteúdo|this content|informação adicional|additional information|saiba mais|learn more)\b/i,
  /\b(é importante lembrar|it is important to remember|de modo geral|in general)\b/i,
  /\b(pode variar|may vary)\b/i
];

export function isGenericFiller(text=""){
  const value=String(text||"").trim();
  if(!value)return true;
  return GENERIC_PATTERNS.some(re=>re.test(value));
}

export function fillerAudit(values=[]){
  const rows=(Array.isArray(values)?values:[values]).map(value=>String(value||"")).filter(Boolean);
  const flagged=rows.filter(isGenericFiller);
  return {detected:flagged.length>0,total:rows.length,flaggedCount:flagged.length,samples:flagged.slice(0,5)};
}

export function classifyEntityType({entity=null,subject="",question=""}={}){
  const explicit=String(entity?.type||"").trim().toUpperCase();
  if(explicit && !["ENTITY","UNKNOWN","OTHER"].includes(explicit))return {type:explicit,confidence:.96,reason:"EXPLICIT_ENTITY_TYPE"};
  const hay=`${entity?.name||""} ${entity?.summary||""} ${subject||""} ${question||""}`;
  for(const [type,re] of TYPE_RULES)if(re.test(hay))return {type,confidence:.78,reason:`RULE_${type}`};
  return {type:explicit||"OTHER",confidence:.42,reason:"DEFAULT_OTHER"};
}

export function resolveIntent(question="",fallback="OVERVIEW"){
  const value=String(question||"");
  for(const [intent,re] of INTENT_RULES)if(re.test(value))return {intent,confidence:.84,reason:`RULE_${intent}`};
  return {intent:String(fallback||"OVERVIEW").toUpperCase(),confidence:.55,reason:"DEFAULT_INTENT"};
}

export function intentKeywords(intent="OVERVIEW"){
  const map={
    HOW_TO_CRAFT:["craft","recipe","receita","material","fabricar"],
    HOW_TO_GET:["obter","conseguir","drop","get","obtain"],
    WHERE_TO_FIND:["onde","where","location","spawn","encontrar"],
    HOW_TO_UNLOCK:["unlock","desbloquear","requisito","requirement"],
    HOW_TO_DEFEAT:["derrotar","defeat","vencer","strategy","estratégia"],
    HOW_TO_USE:["usar","use","equip","funciona"],
    LORE:["lore","história","story","canon","cânone"],
    COMPARISON:["compare","versus","vs","melhor","better"],
    OVERVIEW:[]
  };
  return map[String(intent||"OVERVIEW").toUpperCase()]||[];
}

export function typeCompatibility(type="OTHER",intent="OVERVIEW"){
  const t=String(type||"OTHER").toUpperCase(),i=String(intent||"OVERVIEW").toUpperCase();
  if(i==="HOW_TO_CRAFT" && !["ITEM","TOOL","WEAPON","RESOURCE","MATERIAL","OTHER"].includes(t))return .45;
  if(i==="HOW_TO_DEFEAT" && !["BOSS","MOB","CHARACTER","OTHER"].includes(t))return .5;
  if(i==="WHERE_TO_FIND" && ["MECHANIC","SYSTEM"].includes(t))return .55;
  return .9;
}

export function topicalScore(text="",query=""){
  const hay=normalizeText(text),q=normalizeText(query);if(!q||!hay)return 0;
  if(hay.includes(q))return 1;
  const qt=new Set(q.split(" ").filter(x=>x.length>2)),ht=new Set(hay.split(" ").filter(x=>x.length>2));
  if(!qt.size)return 0;let hit=0;for(const x of qt)if(ht.has(x))hit++;
  return hit/qt.size;
}
