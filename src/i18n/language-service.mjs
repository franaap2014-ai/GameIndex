const SUPPORTED=new Set(["pt-BR","en-US","es-ES"]);
export function normalizeLanguage(value=""){
  const v=String(value||"").toLowerCase();
  if(v.startsWith("pt"))return "pt-BR";
  if(v.startsWith("es"))return "es-ES";
  if(v.startsWith("en"))return "en-US";
  return "";
}
export function detectQuestionLanguage(text=""){
  const q=` ${String(text).toLowerCase()} `;
  const pt=[" o que "," como "," onde "," qual "," quem "," não "," jogo "," consigo "," faço "," história "," melhor "," porque "," por que "];
  const es=[" qué "," cómo "," dónde "," cuál "," quién "," juego "," consigo "," historia "," mejor "," por qué "];
  const en=[" what "," how "," where "," which "," who "," game "," can i "," best "," story "," why "];
  const score=list=>list.reduce((n,x)=>n+(q.includes(x)?1:0),0);
  const scores={"pt-BR":score(pt),"es-ES":score(es),"en-US":score(en)};
  if(/[ãõç]/i.test(q)||/\bvocê\b|\bvocês\b|\bmelhor\b/i.test(q))scores["pt-BR"]+=2;
  if(/[¿¡ñ]/i.test(q)||/\bcómo\b|\bqué\b|\bdónde\b|\bcuál\b|\bdiamantes\b/i.test(q))scores["es-ES"]+=3;
  return Object.entries(scores).sort((a,b)=>b[1]-a[1])[0][1]>0?Object.entries(scores).sort((a,b)=>b[1]-a[1])[0][0]:"pt-BR";
}
export function resolveOutputLanguage({selectedLanguage="",question=""}={}){return normalizeLanguage(selectedLanguage)||detectQuestionLanguage(question);}

const SYSTEM={
  "pt-BR":{
    insufficient:"O GameIndex ainda não possui informações confiáveis suficientes para responder isso com segurança.",
    researchDisabled:"A pesquisa externa está desativada nesta instalação.",
    researchFailed:"O GameIndex não conseguiu concluir esta pesquisa agora. Tente novamente em alguns instantes.",
    gameMissing:"Não consegui identificar qual jogo está relacionado à pergunta.",
    notEnoughEvidence:"A pesquisa não encontrou evidências suficientes para formar conhecimento confiável.",
    details:"Detalhes",sources:"Fontes",related:"Relacionado",information:"Informação",base:"Informação base",
    factual:"Informação factual",official:"Oficial",community:"Comunidade",theory:"Teoria",rumor:"Rumor",mixed:"Misto",unknown:"Não confirmado",
    release:(g,d)=>`O lançamento original registrado para ${g} é ${d}.`,platforms:(g,p)=>`${g} está registrado no GameIndex para: ${p}.`
  },
  "en-US":{
    insufficient:"GameIndex does not yet have enough reliable information to answer that safely.",
    researchDisabled:"External research is disabled in this installation.",
    researchFailed:"GameIndex could not complete this research right now. Please try again shortly.",
    gameMissing:"I could not identify which game this question is about.",
    notEnoughEvidence:"The research did not find enough evidence to form reliable knowledge.",
    details:"Details",sources:"Sources",related:"Related",information:"Information",base:"Base information",
    factual:"Factual information",official:"Official",community:"Community",theory:"Theory",rumor:"Rumor",mixed:"Mixed",unknown:"Unconfirmed",
    release:(g,d)=>`The original release recorded for ${g} is ${d}.`,platforms:(g,p)=>`${g} is recorded in GameIndex for: ${p}.`
  },
  "es-ES":{
    insufficient:"GameIndex todavía no tiene información fiable suficiente para responder con seguridad.",
    researchDisabled:"La investigación externa está desactivada en esta instalación.",
    researchFailed:"GameIndex no pudo completar esta investigación ahora. Inténtalo de nuevo en unos instantes.",
    gameMissing:"No pude identificar a qué juego se refiere la pregunta.",
    notEnoughEvidence:"La investigación no encontró evidencia suficiente para formar conocimiento fiable.",
    details:"Detalles",sources:"Fuentes",related:"Relacionado",information:"Información",base:"Información base",
    factual:"Información factual",official:"Oficial",community:"Comunidad",theory:"Teoría",rumor:"Rumor",mixed:"Mixto",unknown:"No confirmado",
    release:(g,d)=>`El lanzamiento original registrado para ${g} es ${d}.`,platforms:(g,p)=>`${g} está registrado en GameIndex para: ${p}.`
  }
};
export function strings(language="pt-BR"){return SYSTEM[normalizeLanguage(language)||"pt-BR"];}

// GameIndex stores many curated seed summaries in Portuguese. This conservative
// lightweight translator only handles frequent structural phrases. It never invents facts.
const EN_REPL=[
  [/\bO GameIndex classifica o jogo principalmente como\b/gi,"GameIndex mainly classifies the game as"],
  [/\bé desenvolvido por\b/gi,"is developed by"],[/\bé uma?\b/gi,"is a"],[/\bé um\b/gi,"is a"],
  [/\bpermite\b/gi,"allows"],[/\bjogador(?:es)?\b/gi,"player"],[/\bjogo\b/gi,"game"],[/\bmodo\b/gi,"mode"],
  [/\bdano\b/gi,"damage"],[/\bvida\b/gi,"health"],[/\bitem\b/gi,"item"],[/\barma\b/gi,"weapon"],[/\bmapa\b/gi,"map"],
  [/\bnão\b/gi,"not"],[/\boficial\b/gi,"official"],[/\bcomunidade\b/gi,"community"],[/\bteoria\b/gi,"theory"]
];
const ES_REPL=[
  [/\bO GameIndex classifica o jogo principalmente como\b/gi,"GameIndex clasifica el juego principalmente como"],
  [/\bé desenvolvido por\b/gi,"es desarrollado por"],[/\bé uma?\b/gi,"es una"],[/\bé um\b/gi,"es un"],
  [/\bpermite\b/gi,"permite"],[/\bjogador(?:es)?\b/gi,"jugador"],[/\bjogo\b/gi,"juego"],[/\bmodo\b/gi,"modo"],
  [/\bdano\b/gi,"daño"],[/\bvida\b/gi,"vida"],[/\bitem\b/gi,"objeto"],[/\barma\b/gi,"arma"],[/\bmapa\b/gi,"mapa"],
  [/\bnão\b/gi,"no"],[/\bcomunidade\b/gi,"comunidad"],[/\bteoria\b/gi,"teoría"]
];
export function translateStoredText(text,language="pt-BR"){
  const lang=normalizeLanguage(language)||"pt-BR"; if(lang==="pt-BR")return String(text||"");
  let out=String(text||""); for(const [re,value] of (lang==="en-US"?EN_REPL:ES_REPL))out=out.replace(re,value); return out;
}
export function isSupportedLanguage(value){return SUPPORTED.has(normalizeLanguage(value));}
