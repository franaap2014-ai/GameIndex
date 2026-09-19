const $=id=>document.getElementById(id);
const params=new URLSearchParams(location.search);
function gameSlugFromLocation(){
  const query=params.get("slug");if(query)return query.toLowerCase();
  const child=location.pathname.match(/^\/game\/roblox\/([a-z0-9-]+)\/?$/i);if(child)return child[1].toLowerCase();
  if(/^\/game\/roblox\/?$/i.test(location.pathname))return "roblox";
  return "";
}
const slug=gameSlugFromLocation();
if(slug){document.body.dataset.gameSlug=slug;window.dispatchEvent(new CustomEvent("gameindex:context",{detail:{gameSlug:slug}}));}
let game=null;
let activeTab=params.get("tab")||null;
let activeSection=params.get("section")||null;
let following=false;

function esc(v=""){return GV.safe(v);}
function initials(name=""){
  const words=name.replace(/[^A-Za-z0-9À-ÿ ]/g," ").split(/\s+/).filter(Boolean);
  return (words.length>1?words[0][0]+words.at(-1)[0]:(words[0]||"GV").slice(0,2)).toUpperCase();
}
function typeGlyph(type=""){
  return ({weapon:"⌖",item:"◇",tool:"◇",material:"◇",character:"◎",mob:"◉",boss:"◉",location:"⌗",map:"⌗",biome:"⌗",mechanic:"⌁",mode:"⌁",rank_system:"△",vehicle:"▰"})[type]||"GV";
}

function cleanPublicText(value=""){
  let text=String(value??"").replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim();
  if(!text||/^(?:undefined|null|n\/a|tbd|todo|sem descri|descri[cç][aã]o(?: n[aã]o dispon[ií]vel)?)[.!\s-]*$/i.test(text))return "";
  if(/(?:pipeline|worker|request[_ -]?id|debug|raw json|confidence score|generation metadata)/i.test(text.slice(0,160)))return "";
  return text;
}
function cleanList(value,limit=4){return (Array.isArray(value)?value:[]).map(cleanPublicText).filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i).slice(0,limit);}
function releaseYear(value=""){const m=cleanPublicText(value).match(/(?:19|20)\d{2}/);return m?.[0]||cleanPublicText(value);}
function basicGameDescription(value){
  const raw=cleanPublicText(value?.descricao||value?.description||"");
  const bad=!raw||raw.length<24||/[{}\[\]]/.test(raw.slice(0,100));
  if(!bad){
    if(raw.length<=300)return /[.!?]$/.test(raw)?raw:raw+".";
    const first=raw.match(/^.{80,300}?[.!?](?:\s|$)/)?.[0]?.trim();if(first)return first;
    const short=raw.slice(0,297),cut=Math.max(short.lastIndexOf(". "),short.lastIndexOf("; "));
    return (cut>120?short.slice(0,cut+1):short.trimEnd()+"…").trim();
  }
  const name=cleanPublicText(value?.nome||value?.name)||"Este título";
  const genres=cleanList(value?.generos||value?.genres,2),dev=cleanPublicText(value?.desenvolvedor||value?.developer),year=releaseYear(value?.lancamento||value?.releaseDate),platforms=cleanList(value?.plataformas||value?.platforms,3);
  let text=`${name} é um jogo${genres.length?` de ${genres.join(" e ")}`:""}`;if(dev)text+=` desenvolvido por ${dev}`;if(year)text+=`, lançado em ${year}`;text+=".";if(platforms.length)text+=` Disponível em ${platforms.join(", ")}.`;return text;
}
function basicGameFacts(value){
  const facts=[],dev=cleanPublicText(value?.desenvolvedor||value?.developer),publisher=cleanPublicText(value?.publicadora||value?.publisher),year=releaseYear(value?.lancamento||value?.releaseDate),platforms=cleanList(value?.plataformas||value?.platforms,4),genres=cleanList(value?.generos||value?.genres,2);
  if(dev)facts.push(dev);if(publisher&&publisher.toLowerCase()!==dev.toLowerCase())facts.push(publisher);if(year)facts.push(year);if(platforms.length)facts.push(platforms.join(" · "));if(genres.length)facts.push(genres.join(" · "));return facts;
}
function longDescription(value){const raw=cleanPublicText(value?.descricao||value?.description||"");const intro=basicGameDescription(value);return raw.length>360&&raw!==intro?raw:"";}

function updateFollowButton(value){
  following=Boolean(value);
  const button=$("followGame");
  if(!button)return;
  button.classList.toggle("active",following);
  button.textContent=following?"✓ Seguindo":"+ Seguir";
  button.setAttribute("aria-pressed",String(following));
}
async function toggleFollow(){
  const button=$("followGame");if(!button||!game)return;
  button.disabled=true;
  try{
    if(following){await GV.api(`/api/games/${encodeURIComponent(game.slug)}/follow`,{method:"DELETE"});updateFollowButton(false);}
    else{await GV.api(`/api/games/${encodeURIComponent(game.slug)}/follow`,{method:"POST"});updateFollowButton(true);}
  }catch(error){
    if(String(error.message).toLowerCase().includes("login")){location.href=`/login.html?return=${encodeURIComponent(location.pathname+location.search)}`;return;}
    button.textContent="Tentar novamente";
  }finally{button.disabled=false;}
}

function setVisual(visual={}){
  const cover=$("gameCover"),backdrop=$("gameBackdrop"),url=cleanPublicText(visual?.cover||"");
  if(cover){cover.innerHTML=url?GV.imageMarkup(url,{alt:`Capa de ${game?.nome||"jogo"}`,fallback:initials(game?.nome||"GI"),loading:"eager"}):`<div class="cover-placeholder" id="gameInitials">${esc(initials(game?.nome||"GI"))}</div>`;}
  if(backdrop&&url){backdrop.style.backgroundImage=`linear-gradient(90deg,rgba(5,8,12,.90),rgba(5,8,12,.50),rgba(5,8,12,.85)),url("${String(url).replaceAll('"','%22')}")`;backdrop.style.backgroundSize="cover";backdrop.style.backgroundPosition="center";}
}

function setHero(){
  document.title=`${game.nome} | GameIndex`;
  $("gameName").textContent=game.nome;
  $("gameDescription").textContent=basicGameDescription(game);
  const facts=$("gameBasicFacts");if(facts){const rows=basicGameFacts(game);facts.innerHTML=rows.map(item=>`<span>${esc(item)}</span>`).join("");facts.hidden=!rows.length;}
  $("gameStatus").textContent=game.status==="PUBLISHED"?"BETA 0.99":"RASCUNHO";
  $("gameFranchiseTop").textContent=game.franquia||"";
  const relationLabel=$("relatedRelationshipLabel");if(relationLabel)relationLabel.textContent=game.slug==="roblox"?GV.t("relationship.experiences","EXPERIÊNCIAS"):GV.t("relationship.franchise","FRANQUIA");
  $("gameInitials").textContent=initials(game.nome);
  $("gameGenres").innerHTML=(game.generos||[]).map(t=>`<span>${esc(t)}</span>`).join("");
  $("askAboutGame").href=`/ai.html?game=${encodeURIComponent(game.slug)}`;
  updateFollowButton(Boolean(game.following));
  setVisual(game.visual);
  if(game.relatedGames?.length){
    $("relatedCard").classList.remove("hidden");
    $("relatedGames").innerHTML=game.relatedGames.map(item=>{const href=game.entityType==="EXPERIENCE"&&game.parentGame?.slug?`/game/${encodeURIComponent(game.parentGame.slug)}/${encodeURIComponent(item.slug)}`:`/game.html?slug=${encodeURIComponent(item.slug)}`;return`<a href="${href}"><span>${esc(initials(item.nome))}</span><strong>${esc(item.nome)}</strong></a>`;}).join("");
  }
}


async function applyGameExperience(variant="main"){
  if(!game)return;
  if(window.GameIndexExperience?.applyVariant){window.GameIndexExperience.applyVariant(variant);return;}
  const key=variant==="roblox-og"?"roblox-og":"main";
  try{const data=await GV.api(`/api/games/${encodeURIComponent(game.slug)}/experience/${encodeURIComponent(key)}`),exp=data.experience||{},backdrop=$("gameBackdrop");if(exp.background?.imageUrl&&backdrop){backdrop.style.backgroundImage=`linear-gradient(90deg,rgba(5,8,12,.82),rgba(5,8,12,.38),rgba(5,8,12,.78)),url("${String(exp.background.imageUrl).replaceAll('"','%22')}")`;backdrop.style.backgroundSize="cover";backdrop.style.backgroundPosition="center";}}catch{}
}
window.addEventListener("gameindex:music-variant",event=>{if(!window.GameIndexExperience)applyGameExperience(event.detail?.variant);});

function buildTabs(){
  $("gameTabs").innerHTML=(game.menu||[]).map(tab=>`<button class="game-tab ${tab.id===activeTab?"active":""}" data-tab="${esc(tab.id)}"><span>${esc(tab.icon)}</span>${esc(GV.t(`experience.${tab.id}`,tab.label))}</button>`).join("");
  document.querySelectorAll("[data-tab]").forEach(button=>button.addEventListener("click",()=>loadTab(button.dataset.tab)));
}

function overviewMarkup(data,knowledge=[]){
  const overview={...game,...(data.overview||{})},intro=basicGameDescription(overview),details=longDescription(overview);
  const rows=[["Desenvolvedor",cleanPublicText(overview.desenvolvedor)],["Publicadora",cleanPublicText(overview.publicadora)],["Lançamento",releaseYear(overview.lancamento)],["Plataformas",cleanList(overview.plataformas,5).join(", ")],["Gêneros",cleanList(overview.generos,4).join(", ")],["Franquia",cleanPublicText(overview.franquia)]].filter(([,value])=>value);
  return `<div class="overview-card"><p class="section-eyebrow">VISÃO GERAL</p><p class="overview-description">${esc(intro)}</p>${details?`<details class="overview-more"><summary>Mais detalhes</summary><p>${esc(details)}</p></details>`:""}<div class="overview-rows">${rows.map(([label,value])=>`<div><span>${esc(label)}</span><strong>${esc(value)}</strong></div>`).join("")}</div>${overview.siteOficial?`<a class="text-link" href="${esc(overview.siteOficial)}" target="_blank" rel="noopener noreferrer">Site oficial ↗</a>`:""}</div>${knowledge.length?`<div class="knowledge-grid overview-knowledge">${knowledge.map(entryCard).join("")}</div>`:""}`;
}

function canonLabel(value){
  return ({OFFICIAL:"Oficial",COMMUNITY:"Comunidade",THEORY:"Teoria",RUMOR:"Rumor",MIXED:"Misto",UNKNOWN:"Não confirmado",NOT_APPLICABLE:""})[value]||value||"";
}

function entryCard(entry){
  const canon=canonLabel(entry.canonStatus);
  const glyph=typeGlyph(entry.entityType);
  const typeClass=String(entry.entityType||"generic").toLowerCase().replace(/[^a-z0-9_-]/g,"");
  return `<a class="knowledge-card" href="/knowledge.html?id=${encodeURIComponent(entry.id)}" data-entity-id="${esc(entry.entityId||"")}">
    <div class="knowledge-thumb type-${esc(typeClass)}" data-visual-state="placeholder"><span>${esc(glyph==="GV"?(entry.entityName?initials(entry.entityName):"GV"):glyph)}</span></div>
    <div class="knowledge-card-content">
      <div class="knowledge-card-top">${canon?`<span>${esc(canon)}</span>`:""}</div>
      <h3>${esc(entry.title)}</h3>
      <p>${esc(entry.summary||"")}</p>
      <div class="knowledge-card-footer"><span>${esc(entry.entityType||entry.status||"")}</span><span>${esc(entry.status||"")}</span></div>
    </div>
  </a>`;
}

function hydrateEntityImages(scope=document){
  const cards=[...scope.querySelectorAll("[data-entity-id]")].filter(card=>card.dataset.entityId);
  if(!cards.length)return;
  const loadCard=card=>{
    const id=card.dataset.entityId;
    GV.api(`/api/entities/${encodeURIComponent(id)}/visual`).then(visual=>{
      if(!visual.image||!visual.meta?.displayTrusted)return;
      const thumb=card.querySelector(".knowledge-thumb");
      if(!thumb)return;
      thumb.dataset.visualState="verified";
      thumb.innerHTML=GV.imageMarkup(visual.image,{alt:"Imagem verificada",fallback:thumb.textContent?.trim()||"GV"});
    }).catch(()=>{});
  };
  if(!("IntersectionObserver" in window)){cards.forEach(loadCard);return;}
  const observer=new IntersectionObserver(entries=>{
    for(const entry of entries){
      if(!entry.isIntersecting)continue;
      observer.unobserve(entry.target);
      loadCard(entry.target);
    }
  },{rootMargin:"160px"});
  cards.forEach(card=>observer.observe(card));
}

async function loadTab(tabId){
  activeTab=tabId;
  activeSection=null;
  const url=new URL(location.href);
  url.searchParams.set("tab",tabId);
  url.searchParams.delete("section");
  history.replaceState({},"",url);
  buildTabs();
  $("tabContent").innerHTML='<div class="content-skeleton"></div>';
  try{
    const data=await GV.api(`/api/games/${encodeURIComponent(slug)}/tabs/${encodeURIComponent(tabId)}`);
    $("tabHeader").innerHTML=`<div><p class="section-eyebrow">${esc(data.tab.label)}</p><h2>${esc(data.tab.label)}</h2><p>${esc(data.tab.description||"")}</p></div>`;
    if(tabId==="overview"){
      $("sectionTabs").innerHTML="";
      let entries=[];
      try{entries=(await GV.api(`/api/games/${encodeURIComponent(slug)}/tabs/overview/summary`)).entries||[];}catch{}
      $("tabContent").innerHTML=overviewMarkup(data,entries);
      hydrateEntityImages($("tabContent"));
      return;
    }
    $("sectionTabs").innerHTML=(data.sections||[]).map(section=>`<button data-section="${esc(section.id)}">${esc(section.label)}</button>`).join("");
    document.querySelectorAll("[data-section]").forEach(button=>button.addEventListener("click",()=>loadSection(tabId,button.dataset.section)));
    const requested=params.get("section");
    const first=(data.sections||[]).some(section=>section.id===requested)?requested:data.sections?.[0]?.id;
    if(first)await loadSection(tabId,first);
    else $("tabContent").innerHTML=emptyMarkup(tabId,"");
  }catch(error){
    $("tabContent").innerHTML=`<div class="empty-state">${esc(error.message)}</div>`;
  }
}

function emptyMarkup(tab,section){
  const prompt=`${tab} ${section}`.trim();
  return `<div class="knowledge-empty"><span class="empty-orbit">◌</span><h3>Essa área ainda pode crescer.</h3><p>O banco ainda não tem conhecimento suficiente nesta seção. A Dexter IA pode pesquisar o assunto e salvar somente conhecimento que passar pela validação.</p><a class="button primary-button" href="/ai.html?game=${encodeURIComponent(game.slug)}&prompt=${encodeURIComponent(prompt)}">Pesquisar com a Dexter IA</a></div>`;
}

async function loadSection(tabId,sectionId){
  activeSection=sectionId;
  const url=new URL(location.href);
  url.searchParams.set("tab",tabId);
  url.searchParams.set("section",sectionId);
  history.replaceState({},"",url);
  document.querySelectorAll("[data-section]").forEach(button=>button.classList.toggle("active",button.dataset.section===sectionId));
  $("tabContent").innerHTML='<div class="content-skeleton"></div>';
  try{
    const data=await GV.api(`/api/games/${encodeURIComponent(slug)}/tabs/${encodeURIComponent(tabId)}/${encodeURIComponent(sectionId)}`);
    $("tabContent").innerHTML=data.entries?.length?`<div class="knowledge-grid">${data.entries.map(entryCard).join("")}</div>`:emptyMarkup(tabId,sectionId);
    hydrateEntityImages($("tabContent"));
  }catch(error){
    $("tabContent").innerHTML=`<div class="empty-state">${esc(error.message)}</div>`;
  }
}

async function loadPublishedArticles(){
  if(!game)return;
  try{
    const result=await GV.api(`/api/articles?game=${encodeURIComponent(game.slug)}&lang=${encodeURIComponent(GV.lang)}&limit=6`);
    const entries=result?.entries||[];
    const section=$("gameArticles"), list=$("gameArticleList");
    if(!section||!list||!entries.length)return;
    list.innerHTML=entries.map(article=>`<a href="/article.html?id=${encodeURIComponent(article.id)}"><span>✦</span><strong>${esc(article.title)}</strong><small>Artigo publicado</small></a>`).join("");
    section.classList.remove("hidden");
  }catch{}
}

async function start(){
  if(!slug){
    $("gameLoading").classList.add("hidden");
    $("gameError").classList.remove("hidden");
    $("gameError").textContent="Jogo não informado.";
    return;
  }
  try{
    game=await GV.api(`/api/games/${encodeURIComponent(slug)}`);
    activeTab=activeTab||game.tabInicial||"overview";
    $("gameLoading").classList.add("hidden");
    $("gameView").classList.remove("hidden");
    setHero();
    await window.GameIndexFoundation099?.mount?.({game,slug:game.slug});
    buildTabs();
    $("followGame")?.addEventListener("click",toggleFollow);
    let parentSlug=null;try{const parentData=await GV.api(`/api/games/${encodeURIComponent(game.slug)}/parent`);parentSlug=parentData.parent?.slug||null;}catch{}
    window.dispatchEvent(new CustomEvent("gameindex:context",{detail:{gameSlug:game.slug,parentSlug}}));
    window.GameIndexMusic?.mountGameControls?.($("gameExperienceControls"));
    await window.GameIndexExperience?.init?.({game,slug:game.slug});
    await applyGameExperience(window.GameIndexMusic?.getState?.().variant||"main");
    await Promise.all([loadTab(activeTab),loadPublishedArticles()]);
  }catch(error){
    $("gameLoading").classList.add("hidden");
    $("gameError").textContent=error.message;
    $("gameError").classList.remove("hidden");
  }
}

window.addEventListener("DOMContentLoaded",start);
