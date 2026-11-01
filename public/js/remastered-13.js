/* GAMEINDEX REMASTERED · orchestration layer.
 * Progressive enhancement: never replaces authentication, data sources or access control. */
(()=>{
"use strict";
if(window.GameIndexRemastered13)return;
const storage=window.GIStorage?.local||{getItem:()=>null,setItem:()=>{}};
const $=id=>document.getElementById(id);
const txt=(node,value)=>{if(node)node.textContent=value;};
const reduced=()=>document.documentElement.dataset.reducedMotion==="1"||
  document.documentElement.dataset.animations==="off"||
  window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
let initialized=false;
function ungroupLegacyDrawer(){
  const nav=document.querySelector("#sideDrawer .drawer-nav");if(!nav)return;
  for(const details of [...nav.querySelectorAll(":scope > details.gi-rm-menu-group")]){
    const summary=details.querySelector(":scope > summary");
    const heading=document.createElement("p");
    heading.textContent=summary?.textContent?.replace(/[+−]$/,"").trim()||"Explorar";
    const inner=details.querySelector(".gi-rm-menu-items");
    const children=inner?[...inner.children]:[];
    details.replaceWith(heading,...children);
  }
  nav.dataset.remasterGrouped="off";
  nav.querySelectorAll(":scope > a[href]").forEach(a=>{
    const url=new URL(a.href,location.origin);
    if(url.pathname===location.pathname)a.classList.add("active");
  });
  const drawerFooter=document.querySelector("#sideDrawer .drawer-footer span:last-child");
  txt(drawerFooter,"GAMEINDEX · REMASTERED");
}
function buildPortals(){
  const home=document.querySelector('body[data-page="home"] .page-wrap');
  const section=home?.querySelector("#recommended");
  if(!section||home.querySelector(".gi13-portal-row"))return;
  const portals=document.createElement("nav");
  portals.className="gi13-portal-row";
  portals.setAttribute("aria-label","Explorar experiências do GameIndex");
  portals.innerHTML=
    '<a class="gi13-portal" href="/games.html"><div><small>EXPLORE</small><strong>Biblioteca de jogos</strong><p>Encontre universos para descobrir.</p></div><span aria-hidden="true">▦</span></a>'+
    '<a class="gi13-portal" href="/ai.html"><div><small>DISCOVER</small><strong>Dexter IA</strong><p>Investigue e aprenda sobre games.</p></div><span aria-hidden="true">✧</span></a>'+
    '<a class="gi13-portal" href="/creator.html"><div><small>CREATE</small><strong>Creator Studio</strong><p>Transforme suas ideias em experiências.</p></div><span aria-hidden="true">⬡</span></a>';
  section.before(portals);
  const hero=home.querySelector(".hero-home");
  const tag=hero?.querySelector(".hero-kicker");
  if(tag)tag.classList.add("gi13-stage-tag");
  const title=hero?.querySelector("h1");
  if(title)title.innerHTML="Entre em uma nova<br>dimensão dos <span class=\"gi-rm-hero-accent\">games.</span>";
  const copy=hero?.querySelector(".hero-copy");
  txt(copy,"Explore seus jogos favoritos, descubra universos e crie novas possibilidades. O seu próximo mundo começa aqui.");
  const actions=hero?.querySelector(".hero-actions");
  if(actions)actions.innerHTML='<a class="button primary-button" href="/games.html">Explorar jogos &nbsp; ↗</a><a class="button ghost-button" href="/ai.html">Conversar com Dexter</a>';
  const titleTag=home.querySelector("#recommendationEyebrow");txt(titleTag,"GAMEINDEX / CURADORIA");
  const mode=home.querySelector("#recommendationMode");if(mode)mode.setAttribute("aria-live","polite");
}
function remasterText(){
  document.title=document.title.replace(/GameIndex Beta 0\.992/g,"GameIndex Remastered").replace(/Remaster 0\.93/g,"Remastered");
  const badge=document.querySelector("#siteHeader .brand-badge");txt(badge,"REMASTERED");
  const footer=document.querySelector(".site-footer span");if(footer&&/Remaster 0\.93/.test(footer.textContent||""))txt(footer,"GameIndex Remastered · Uma identidade. Infinitos universos.");
  if(document.body?.dataset.page==="games"){
    const h=document.querySelector(".simple-hero h1");txt(h,"Explore os universos.");
    const lead=document.querySelector(".simple-hero > p:nth-of-type(2)");txt(lead,"Uma biblioteca conectada, feita para encontrar sua próxima grande experiência.");
    const eyebrow=document.querySelector(".simple-hero .section-eyebrow");txt(eyebrow,"GAMEINDEX · LIBRARY");
  }
  if(document.body?.dataset.page==="ai"){
    const h=document.querySelector(".brain-hero h1");if(h)h.innerHTML="Conheça o universo.<br><span class=\"gi-rm-hero-accent\">Pergunte ao Dexter.</span>";
    const p=document.querySelector(".brain-hero > p");txt(p,"Estratégias, histórias e descobertas com contexto dos jogos. O Dexter consulta a base de conhecimento do GameIndex e utiliza um modelo quando disponível.");
  }
  for(const icon of document.querySelectorAll('link[rel="icon"]'))icon.href="/assets/brand/index-emblem.svg?v=remastered13";
}
function improveImages(){
  // Respect image-manager fitMode. Unframed covers use the editorial card aspect ratio.
  document.querySelectorAll('.game-card-visual img').forEach(img=>{
    if(img.dataset.giFramed==="1")return;
    if(!img.style.objectPosition)img.style.objectPosition="50% 38%";
    img.decoding="async";
    if(!img.loading)img.loading="lazy";
  });
}
function setupImageObserver(){
  const root=document.querySelector("#catalogGrid")||document.querySelector("#gamesGrid");
  if(!root)return;
  improveImages();
  const observer=new MutationObserver(()=>improveImages());
  observer.observe(root,{childList:true,subtree:false});
}
function installNavigation(){
  // Pure CSS handles unified header. Existing links and auth logic stay in place.
  const nav=document.querySelector("#sideDrawer .drawer-nav");
  if(!nav)return;
  ungroupLegacyDrawer();
  const obs=new MutationObserver(()=>{
    if(nav.querySelector(":scope > .gi-rm-menu-group"))ungroupLegacyDrawer();
  });
  obs.observe(nav,{childList:true,subtree:false});
}
function attachMobileSearch(){
  const trigger=$("menuTrigger");
  if(!trigger||$("gi13MobileSearch"))return;
  const top=document.querySelector("#siteHeader .header-nav");if(!top)return;
  const b=document.createElement("button");b.type="button";b.id="gi13MobileSearch";
  b.className="gi13-mobile-search";
  b.textContent="⌕";b.setAttribute("aria-label","Pesquisar jogos");
  b.style.cssText="border:1px solid var(--gi13-line);border-radius:12px;background:var(--gi13-surface);color:var(--gi13-ink);width:36px;height:39px;font-size:23px;display:none;flex-shrink:0";
  b.addEventListener("click",()=>{
    let dialog=document.getElementById("gi13SearchDialog");
    if(!dialog){
      dialog=document.createElement("dialog");dialog.id="gi13SearchDialog";
      dialog.setAttribute("aria-label","Pesquisa de jogos");
      dialog.innerHTML='<form method="dialog" class="gi13-search-sheet"><button type="submit" class="gi13-sheet-close" aria-label="Fechar">×</button><span>GAMEINDEX / SEARCH</span><h2>O que você procura?</h2><label for="gi13SearchQuery">Jogo, universo ou assunto</label><input id="gi13SearchQuery" type="search" maxlength="120" placeholder="Pesquise no GameIndex..." autocomplete="off" required><button class="gi13-sheet-submit" type="button" id="gi13SearchSend">Pesquisar ↗</button></form>';
      document.body.appendChild(dialog);
      const input=dialog.querySelector("input");
      const search=()=>{
        const q=input.value.trim();
        if(!q)return;
        dialog.close();
        location.href="/results.html?q="+encodeURIComponent(q);
      };
      dialog.querySelector("#gi13SearchSend").addEventListener("click",search);
      input.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();search();}});
      dialog.addEventListener("click",e=>{if(e.target===dialog)dialog.close();});
    }
    dialog.showModal?.();dialog.querySelector("input")?.focus();
  });
  top.prepend(b);
  const stylesheet=document.createElement("style");
  stylesheet.textContent="@media(max-width:700px){html[data-remaster='13'] #gi13MobileSearch{display:block!important}}";
  document.head.append(stylesheet);
}
function boot(){
  if(initialized||!$("siteHeader"))return;
  initialized=true;
  document.documentElement.dataset.remaster="13";
  document.documentElement.dataset.remasterIdentity="experience";
  // No automatic full-screen page-to-page transitions in Remastered.
  document.body.classList.add("gi13-live-interface");
  remasterText();installNavigation();buildPortals();setupImageObserver();attachMobileSearch();
  window.dispatchEvent(new CustomEvent("gi13:ready",{detail:{version:"Remastered",theme:document.documentElement.dataset.theme||"free-dark"}}));
}
window.GameIndexRemastered13=Object.freeze({version:"13-pillars",boot,improveImages});
window.addEventListener("gv:shell-ready",boot,{once:true});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
})();
