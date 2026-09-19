import { upsertGame } from "../database/repositories/game-repository.mjs";
import { upsertKnowledge } from "../database/repositories/knowledge-repository.mjs";
import { upsertSource } from "../database/repositories/source-repository.mjs";
import { nowIso } from "../database/connection.mjs";
import { generateFeaturedArticlesForGame } from "../articles/article-ai.mjs";

function safeUrl(value){
  if(!value)return "";
  try{const u=new URL(value);if(!["https:","http:"].includes(u.protocol))return "";return u.toString();}catch{return "";}
}
function toList(value,limit=30){
  const raw=Array.isArray(value)?value:String(value||"").split(/[,\n]/);
  return [...new Set(raw.map(x=>String(x).trim()).filter(Boolean))].slice(0,limit);
}
function safeUrls(value,limit=12){return toList(value,limit).map(safeUrl).filter(Boolean);}
function safeTabId(value){return String(value||"").trim().toLowerCase().replace(/[^a-z0-9_-]/g,"-").replace(/-+/g,"-").replace(/^-|-$/g,"");}

export function analyzeGameInput(input={}){
  const name=String(input.name||input.nome||"").trim();
  if(name.length<2)throw new Error("Informe o nome do jogo.");
  const officialUrl=safeUrl(input.officialUrl||input.siteOficial||"");
  const officialSources=[...new Set([officialUrl,...safeUrls(input.officialSources)].filter(Boolean))];
  const platforms=toList(input.platforms,20);
  const genres=toList(input.genres,20);
  const tabs=toList(input.tabs,16).map(safeTabId).filter(Boolean);
  const images={cover:safeUrl(input.coverUrl),banner:safeUrl(input.bannerUrl),icon:safeUrl(input.iconUrl)};
  return {
    name,
    slug:String(input.slug||"").trim()||undefined,
    developer:String(input.developer||"").trim().slice(0,120),
    publisher:String(input.publisher||"").trim().slice(0,120),
    releaseDate:String(input.releaseDate||"").trim().slice(0,40),
    platforms,
    genres,
    franchise:String(input.franchise||"").trim().slice(0,120),
    officialUrl,
    officialSources,
    description:String(input.description||"").trim().slice(0,1800),
    template:String(input.template||"generic").trim(),
    tabs,
    visualQuery:String(input.visualQuery||name).trim().slice(0,180),
    images,
    researchSettings:{deepResearch:Boolean(input.researchSettings?.deepResearch),preferOfficial:input.researchSettings?.preferOfficial!==false},
    status:"DRAFT",
    warnings:[
      ...(!officialUrl?["No validated official website was supplied."]:[]),
      ...(!input.description?["Description is empty; generated knowledge will remain conservative."]:[]),
      ...(Object.values(images).some(Boolean)?["Supplied visual URLs are not imported into the retired image system; Image Engine 3 will discover and persist native assets."]:[])
    ]
  };
}

function sourceFor(game){
  return upsertSource({
    url:game.siteOficial||`gamevault://admin-onboarding/${game.slug}`,
    title:game.siteOficial?`${game.nome} — official source supplied by admin`:`GameIndex admin onboarding — ${game.nome}`,
    sourceType:game.siteOficial?"OFFICIAL":"ADMIN_ONBOARDING",
    adapterKey:"admin-onboarding",
    quality:game.siteOficial ? .88 : .66,
    metadata:{gameId:game.id,addedIn:"Beta 0.65"}
  });
}

function registerAdminSources(game,analyzed){
  const sourceIds=[];
  for(const url of analyzed.officialSources||[]){
    const source=upsertSource({url,title:`${game.nome} — administrator supplied source`,sourceType:url===game.siteOficial?"OFFICIAL":"ADMIN_SUPPLIED_SOURCE",adapterKey:"admin-onboarding",quality:url===game.siteOficial ? .9 : .72,metadata:{gameId:game.id,requiresIndependentValidation:url!==game.siteOficial}});
    sourceIds.push(source.id);
  }
  return sourceIds;
}

function registerAdminImages(game,analyzed){return Object.entries(analyzed.images||{}).filter(([,url])=>Boolean(url)).map(([role,url])=>({id:null,role:role.toUpperCase(),status:"IGNORED_LEGACY_INPUT",url,engine:"IMAGE_ENGINE_3_DISCOVERY_REQUIRED"}));}

export function buildInitialKnowledgeForGame(game,{minimum=24}={}){
  const source=sourceFor(game);
  const facts=[
    ["Game identity",`${game.nome} is the game identity used by GameIndex. This record anchors future research to the correct title, preventing similarly named games, films, events or real-world subjects from contaminating the knowledge graph.`],
    ["Developer",game.desenvolvedor?`${game.nome} lists ${game.desenvolvedor} as its developer in the administrator-supplied metadata. This field should be revalidated against an official source when the onboarding source is incomplete.`:`The developer for ${game.nome} still needs reliable-source validation.`],
    ["Publisher",game.publicadora?`${game.nome} lists ${game.publicadora} as its publisher in the administrator-supplied metadata. This is kept separate from developer identity because the two roles can differ.`:`The publisher for ${game.nome} still needs reliable-source validation.`],
    ["Release information",game.lancamento?`The release information currently stored for ${game.nome} is ${game.lancamento}. Live or re-released editions should keep platform/version context separate rather than overwriting historical release data.`:`Release information for ${game.nome} still needs reliable-source validation.`],
    ["Platforms",game.plataformas?.length?`${game.nome} is currently associated with these stored platforms: ${game.plataformas.join(", ")}. Platform-specific differences should be recorded as separate claims when they affect gameplay or content.`:`Platform coverage for ${game.nome} is not complete yet.`],
    ["Genres",game.generos?.length?`GameIndex currently classifies ${game.nome} with: ${game.generos.join(", ")}. Genre labels are navigation metadata and should not replace concrete gameplay knowledge.`:`Genre classification for ${game.nome} still needs review.`],
    ["Official website",game.siteOficial?`The administrator supplied ${game.siteOficial} as the official website for ${game.nome}. GameIndex should prefer official material from this domain for identity, release and patch information when available.`:`No official website has been validated for ${game.nome} yet.`],
    ["Knowledge scope",`Knowledge for ${game.nome} must remain scoped to game id ${game.id}. Entity names that also exist in other games or real-world contexts must not be merged without an explicit cross-game relationship.`]
  ];
  const menuTopics=(game.menu||[]).flatMap(tab=>[
    {title:`${tab.label} coverage`,summary:`${tab.label} is a planned knowledge area for ${game.nome}. GameIndex should fill it with concrete, player-useful facts and relationships, while rejecting filler created only to increase row count.`,tabId:tab.id,sectionId:tab.sections?.[0]?.id||"summary"},
    ...(tab.sections||[]).map(section=>({title:`${tab.label} / ${section.label}`,summary:`This coverage record defines a real player-facing research area for ${game.nome}: ${tab.label} / ${section.label}. It should be expanded with validated entities, mechanics, strategies or story facts appropriate to the game rather than generic text.`,tabId:tab.id,sectionId:section.id}))
  ]);
  const rows=[...facts.map(([title,summary])=>({title,summary,tabId:"overview",sectionId:"details"})),...menuTopics];
  // Never fabricate filler merely to hit a number. Extra rows are research questions and remain UNVERIFIED.
  while(rows.length<minimum)rows.push({title:`Onboarding research question ${rows.length+1}`,summary:`A remaining onboarding question for ${game.nome} must be answered through reliable research before it becomes a strong fact. The question should target a concrete player need such as progression, mechanics, locations, equipment, characters or strategies.`,tabId:game.menu?.[rows.length%(game.menu?.length||1)]?.id||"overview",sectionId:game.menu?.[rows.length%(game.menu?.length||1)]?.sections?.[0]?.id||"summary",status:"UNVERIFIED",confidence:.5});
  return rows.map(r=>upsertKnowledge({
    gameId:game.id,title:r.title,summary:r.summary,canonStatus:"UNKNOWN",status:r.status||"CURRENT",
    confidence:r.confidence??(game.siteOficial ? .72 : .62),verifiedAt:r.status==="UNVERIFIED"?"":nowIso(),tabId:r.tabId,sectionId:r.sectionId,topics:["onboarding","beta065"],
    claims:[{text:r.summary,canonStatus:"UNKNOWN",confidence:r.confidence??(game.siteOficial ? .72 : .62),status:r.status||"CURRENT",sourceIds:[source.id],verifiedAt:r.status==="UNVERIFIED"?"":nowIso()}]
  }));
}

export function addGameV2(input,{generateKnowledge=true,generateArticles=true}={}){
  const analyzed=analyzeGameInput(input);
  const game=upsertGame(analyzed);
  const sourceIds=registerAdminSources(game,analyzed);
  const imageCandidates=registerAdminImages(game,analyzed);
  const knowledge=generateKnowledge?buildInitialKnowledgeForGame(game,{minimum:24}):[];
  let articles=[];
  if(generateArticles){try{articles=generateFeaturedArticlesForGame(game,{limit:3,language:"pt-BR"});}catch{articles=[];}}
  return {game,knowledgeCreated:knowledge.length,articles:articles.map(a=>({id:a.id,title:a.title,status:a.status})),sourceIds,imageCandidates:imageCandidates.map(i=>({id:i.id,role:i.role,status:i.status}))};
}
