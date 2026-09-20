const GV={
  lang:localStorage.getItem("gv_lang")||"pt-BR",translations:{},auth:null,
  async api(url,options={}){const controller=new AbortController(),timeout=options.timeout||20000,timer=setTimeout(()=>controller.abort(),timeout);try{const response=await fetch(url,{credentials:"same-origin",...options,signal:options.signal||controller.signal});let data={};try{data=await response.json();}catch{}if(!response.ok){const error=new Error(data.error?.message||data.erro||`Erro ${response.status}`);error.status=response.status;error.data=data;throw error;}return data;}catch(error){if(error.name==="AbortError")throw new Error(this.t("error.timeout","A operação demorou demais. Tente novamente."));throw error;}finally{clearTimeout(timer);}},
  async loadGameOptions({includeDrafts=false,q="",max=1000}={}){const entries=[];let page=1;const limit=100;while(entries.length<max){const params=new URLSearchParams({page:String(page),limit:String(limit)});if(q)params.set("q",q);const endpoint=includeDrafts?"/api/staff/game-options":"/api/game-options",data=await this.api(`${endpoint}?${params}`),batch=data.entries||[];entries.push(...batch);if(entries.length>=Number(data.total||0)||batch.length<limit)break;page++;}return entries.slice(0,max);},
  safe(value=""){return String(value).replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"})[c]);},
  async setLanguage(lang,{persist=true,reload=false}={}){const supported=new Set(["pt-BR","en-US","es-ES"]);this.lang=supported.has(lang)?lang:"pt-BR";if(persist)localStorage.setItem("gv_lang",this.lang);await this.loadTranslations();if(reload)location.reload();},
  async loadTranslations(){try{this.translations=await fetch(`/locales/${this.lang}.json?v=09875fullpagepersonalization`,{cache:"no-store"}).then(r=>r.ok?r.json():{});}catch{this.translations={};}document.documentElement.lang=this.lang;document.querySelectorAll("[data-i18n]").forEach(el=>{const v=this.translations[el.dataset.i18n];if(v)el.textContent=v;});document.querySelectorAll("[data-i18n-placeholder]").forEach(el=>{const v=this.translations[el.dataset.i18nPlaceholder];if(v)el.placeholder=v;});},
  t(key,fallback=""){return this.translations[key]||fallback||String(key).replace(/[._-]+/g," ");},
  applyTheme(state={}){const tier=String(state.tier||state.plan||"FREE").toUpperCase(),id=String(state.selectedTheme||"FREE_DARK").toLowerCase().replaceAll("_","-");document.documentElement.dataset.theme=id;document.documentElement.dataset.tier=tier;if(state.devLightSpecial)document.documentElement.dataset.devLight="1";else delete document.documentElement.dataset.devLight;localStorage.setItem("gv_theme",id);localStorage.setItem("gv_tier",tier);this.applyBrand(state);},
  resolveBrand(state={}){const role=String(state.staffRole||state.tier||"NONE").toUpperCase(),plan=String(state.plan||state.accountTier||state.tier||"FREE").toUpperCase(),classification=role&&role!=="NONE"?role:plan,theme=String(state.selectedTheme||localStorage.getItem("gv_theme")||"FREE_DARK").toUpperCase().replaceAll("-","_");const catalog={FREE:{key:"free",label:"",primary:"#f4f4f2",secondary:"#8f959d"},PRO:{key:"pro",label:"PRO",primary:"#63e69a",secondary:"#2fbf72"},CREATOR:{key:"creator",label:"CREATOR",primary:"#e7bd5b",secondary:"#a62a39"},DEV:{key:"dev",label:"DEV",primary:"#ff6674",secondary:"#54a8ff"},TESTER:{key:"tester",label:"TESTER",primary:"#58a6ff",secondary:"#246fe5"}};const brand=catalog[classification]||{key:"classified",label:classification&&classification!=="FREE"?classification:"",primary:"#f4f4f2",secondary:"#8f959d"};return {...brand,classification,theme};},
  applyBrand(state={}){const brand=this.resolveBrand(state),root=document.documentElement;root.dataset.brandClass=brand.key;root.style.setProperty("--gi-classification-accent",brand.primary);root.style.setProperty("--gi-classification-accent-2",brand.secondary);document.querySelectorAll("[data-gi-brand-word]").forEach(el=>el.textContent="GAME INDEX");document.querySelectorAll("[data-gi-brand-classification]").forEach(el=>{el.textContent=brand.label;el.hidden=!brand.label;});document.querySelectorAll("[data-gi-brand-mark]").forEach(el=>el.dataset.brand=brand.key);return brand;},
  autoAvatar({seed="",name="",classification="FREE"}={}){const text=String(name||"GI").trim()||"GI",initials=(text.split(/\s+/).filter(Boolean).map(x=>x[0]||"").join("").slice(0,2)||"GI").toUpperCase();let hash=2166136261;for(const c of String(seed||text)){hash^=c.charCodeAt(0);hash=Math.imul(hash,16777619)>>>0;}const brand=this.resolveBrand({tier:classification}),angle=hash%360,shape=hash%3;const secondary=brand.key==="free"?"#606772":brand.secondary,primary=brand.key==="free"?"#f4f4f2":brand.primary;const decoration=shape===0?`<circle cx="52" cy="20" r="15" fill="${primary}" opacity=".13"/><circle cx="18" cy="56" r="18" fill="${secondary}" opacity=".14"/>`:shape===1?`<path d="M8 20 L56 8 L64 40 L16 56 Z" fill="${primary}" opacity=".11"/>`:`<path d="M4 44 C20 8 46 10 68 34" fill="none" stroke="${primary}" stroke-width="8" opacity=".12"/>`;const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 72"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1" gradientTransform="rotate(${angle} .5 .5)"><stop stop-color="#11161d"/><stop offset="1" stop-color="#050709"/></linearGradient></defs><rect width="72" height="72" rx="20" fill="url(#g)"/>${decoration}<rect x="7" y="7" width="58" height="58" rx="17" fill="none" stroke="${primary}" opacity=".42"/><text x="36" y="43" text-anchor="middle" font-family="system-ui,Segoe UI,sans-serif" font-size="24" font-weight="800" fill="${primary}">${initials.replace(/[&<>]/g,"")}</text></svg>`;return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;},
  async transitionTheme(nextState={},options={}){
    const token=(this._themeTransitionToken||0)+1;this._themeTransitionToken=token;
    const apply=()=>{this.applyTheme(nextState);this.applyBrand(nextState);};
    const reduced=matchMedia?.("(prefers-reduced-motion: reduce)")?.matches||document.documentElement.dataset.reducedMotion==="1"||document.documentElement.dataset.animations==="off";
    document.querySelectorAll(".gi-theme-power-transition").forEach(n=>n.remove());
    if(reduced){document.documentElement.classList.add("gi0991-theme-fade");await new Promise(r=>setTimeout(r,100));apply();await new Promise(r=>setTimeout(r,150));document.documentElement.classList.remove("gi0991-theme-fade");return;}
    const oldAccent=getComputedStyle(document.documentElement).getPropertyValue("--rb-accent").trim()||"#ffffff";
    const sourceTheme=String(document.documentElement.dataset.theme||localStorage.getItem("gv_theme")||"free-dark").toLowerCase();
    const targetTheme=String(nextState.selectedTheme||nextState.theme||sourceTheme).toLowerCase().replaceAll("_","-");
    const cableColor=theme=>/light/.test(theme)?"#f4f5f6":"#111318";
    const overlay=document.createElement("div");overlay.className="gi-theme-power-transition";overlay.setAttribute("role","presentation");overlay.style.setProperty("--gi-old-accent",oldAccent);overlay.style.setProperty("--gi-new-accent",oldAccent);overlay.style.setProperty("--gi-old-cable",cableColor(sourceTheme));overlay.style.setProperty("--gi-new-cable",cableColor(targetTheme));overlay.dataset.sourceTheme=sourceTheme;overlay.dataset.targetTheme=targetTheme;
    overlay.innerHTML=`<div class="gi-hf1-blackout"></div><div class="gi-hf1-power-scene"><div class="gi-hf1-socket"><i class="gi-hf1-socket-hole a"></i><i class="gi-hf1-socket-hole b"></i></div><div class="gi-hf1-cable-assembly"><div class="gi-hf1-cable"></div><div class="gi-hf1-plug"><span class="gi-hf1-pin a"></span><span class="gi-hf1-pin b"></span></div></div><div class="gi-hf1-tech">${[0,1,2,3,4].map(i=>`<i class="t${i}"></i>`).join("")}</div><div class="gi-hf1-energy"></div></div><div class="gi-hf1-boot"></div>`;
    document.body.appendChild(overlay);document.documentElement.classList.add("gi0991-theme-switching");
    let applied=false,cleaned=false;const ensureApply=()=>{if(!applied){applied=true;apply();}};const cleanup=()=>{if(cleaned)return;cleaned=true;overlay.remove();document.documentElement.classList.remove("gi0991-theme-switching");};
    const safety=setTimeout(()=>{if(this._themeTransitionToken===token)ensureApply();cleanup();},4200);
    try{
      requestAnimationFrame(()=>overlay.classList.add("gi-hf1-powerdown"));await new Promise(r=>setTimeout(r,380));if(this._themeTransitionToken!==token)return cleanup();
      overlay.classList.add("gi-hf1-rise");await new Promise(r=>setTimeout(r,720));if(this._themeTransitionToken!==token)return cleanup();
      overlay.classList.add("gi-hf1-align");await new Promise(r=>setTimeout(r,170));if(this._themeTransitionToken!==token)return cleanup();
      overlay.classList.add("gi-hf1-insert");await new Promise(r=>setTimeout(r,310));if(this._themeTransitionToken!==token)return cleanup();
      ensureApply();const newAccent=getComputedStyle(document.documentElement).getPropertyValue("--rb-accent").trim()||"#ffffff";overlay.style.setProperty("--gi-new-accent",newAccent);overlay.classList.add("gi-hf1-energized");await new Promise(r=>setTimeout(r,380));
      if(this._themeTransitionToken!==token)return cleanup();overlay.classList.add("gi-hf1-booting");await new Promise(r=>setTimeout(r,620));
    }finally{clearTimeout(safety);if(this._themeTransitionToken===token)ensureApply();cleanup();}
  },
  imageMarkup(url,{alt="",fallback="GI",className="",loading="lazy"}={}){if(!url)return `<div class="game-card-placeholder${className?` ${this.safe(className)}`:""}" data-gv-image-state="FALLBACK">${this.safe(fallback)}</div>`;const m=String(url).match(/\/media\/v3\/images\/([^/]+)\/rev\/(\d+)/),ie3=m?` data-gv-ie3-asset="${this.safe(decodeURIComponent(m[1]))}" data-gv-ie3-revision="${this.safe(m[2])}"`:"";return `<img src="${this.safe(url)}" alt="${this.safe(alt)}" loading="${this.safe(loading)}" decoding="async" data-gv-image="1" data-gv-fallback="${this.safe(fallback)}"${className?` class="${this.safe(className)}"`:""}${ie3}>`;}
};window.GV=GV;
function applyPresentationPreferences(prefs={}){const h=document.documentElement;h.dataset.density=String(prefs.interfaceDensity||"COMFORTABLE").toLowerCase();h.dataset.animations=String(prefs.animations||"ON").toLowerCase();if(prefs.reducedMotion)h.dataset.reducedMotion="1";else delete h.dataset.reducedMotion;if(prefs.highContrast)h.dataset.highContrast="1";else delete h.dataset.highContrast;h.style.setProperty("--gv-ui-scale",String(Math.max(.85,Math.min(1.3,Number(prefs.uiScale||1)))));}
function shellMarkup(){const p=location.pathname,active=href=>href==='/'?p==='/'||p.endsWith('/index.html'):p.endsWith(href),nav=(href,label)=>`<a class="nav-link ${active(href)?'active':''}" href="${href}">${label}</a>`;return `<div class="gv-global-ui" id="globalUiLayer">
<header class="site-header" id="siteHeader"><div class="site-header-inner"><div class="header-left-region"><button class="menu-trigger" id="menuTrigger" type="button" aria-label="Abrir menu lateral" aria-controls="sideDrawer" aria-expanded="false"><span></span><span></span><span></span></button><a class="brand gi-brand-lockup" href="/" aria-label="Game Index — Home"><span class="brand-mark gi-brand-mark" data-gi-brand-mark="1"><i></i><b>G</b></span><span class="gi-brand-copy"><span class="brand-name" data-gi-brand-word>GAME INDEX</span><small class="gi-brand-classification" data-gi-brand-classification hidden></small></span><span class="brand-badge">BETA 0.991 HF1</span></a></div><form class="header-search" id="globalSearchForm"><span class="search-glyph">⌕</span><input id="globalSearch" autocomplete="off" data-i18n-placeholder="search.placeholder" placeholder="O que você quer descobrir?" aria-label="Pesquisar no GameIndex"></form><nav class="header-nav">${nav('/games.html','Games')}${nav('/ai.html','Dexter')}${nav('/creator.html','Creator')}${nav('/showcase.html','Showcase')}<button class="sound-toggle" id="gameIndexSoundToggle" type="button" aria-expanded="false" aria-controls="giMusicPopover" title="Música"><span aria-hidden="true">🔇</span></button><a class="top-profile-link" id="topProfileLink" href="/login.html"><span id="topProfileAvatar" class="gi-auto-avatar">◎</span></a></nav></div></header>
<div id="giMusicPopover" class="gi-music-popover" hidden><div class="gi-music-popover-head"><strong data-i18n="music.title">MUSIC</strong><button type="button" id="giMusicClose" aria-label="Fechar">×</button></div><div id="giMusicTrack" class="gi-music-track" data-i18n="music.none">Nenhuma música configurada</div><label class="gi-volume"><span><span data-i18n="music.volume">Volume</span> <b id="giVolumeValue">30%</b></span><input id="giVolume" type="range" min="0" max="100" step="1" value="30" aria-label="Volume da música"></label><div class="gi-music-actions"><button type="button" id="giMusicPlay">PLAY</button><button type="button" id="giMusicMute">MUTE</button></div><div id="giMusicVariants" class="gi-music-variants" hidden></div><div id="giMusicPlayerSurface" class="gi-music-player-surface" hidden></div><small id="giMusicStatus"></small></div>
<div class="drawer-overlay" id="drawerOverlay" aria-hidden="true"></div><aside class="side-drawer" id="sideDrawer" role="dialog" aria-modal="true" aria-hidden="true" tabindex="-1"><div class="drawer-panel"><div class="drawer-head"><a class="brand compact gi-brand-lockup" href="/" aria-label="Game Index — Home"><span class="brand-mark gi-brand-mark" data-gi-brand-mark="1"><i></i><b>G</b></span><span class="gi-brand-copy"><strong data-gi-brand-word>GAME INDEX</strong><small class="gi-brand-classification" data-gi-brand-classification hidden></small></span></a><button class="drawer-close" id="drawerClose" type="button">×</button></div><div class="drawer-profile" id="drawerProfile"><div class="avatar gi-auto-avatar"><img alt="Visitante" src="${GV.autoAvatar({seed:'guest',name:'Visitante',classification:'FREE'})}"></div><div><strong>Visitante</strong><span>Beta 0.99</span></div></div><nav class="drawer-nav">
<p>Explorar</p><a href="/"><span>⌂</span><span>Home</span></a><a href="/games.html"><span>▦</span><span>Games</span></a><a href="/ai.html"><span>◈</span><span>Dexter IA</span></a><a href="/creator.html"><span>✦</span><span>Creator</span></a><a href="/showcase.html"><span>▣</span><span>Showcase</span></a><a href="/social.html"><span>◫</span><span>Social</span></a>
<p>Conta</p><a id="accountMenuLink" href="/login.html"><span>◎</span><span id="accountMenuLabel">Login</span></a><a id="profileSettingsLink" href="/profile-settings.html" hidden><span>◌</span><span>Configurar perfil</span></a><a href="/subscriptions.html"><span>◇</span><span>GameIndex PRO</span></a>
<p>GameIndex</p><a href="/update-log.html"><span>↻</span><span>Update Log</span><b id="updateLogDot" class="update-dot" hidden></b></a><a href="/report-bug.html"><span>⚑</span><span>Reportar um bug</span></a><a href="/credits.html"><span>✦</span><span>Créditos</span></a><a class="drawer-settings-link" href="/settings.html"><span>⚙</span><span data-i18n="menu.settings">Configurações</span></a>
<div id="adminPanelMenu" class="admin-panel-menu" hidden><button type="button" id="adminPanelToggle" aria-expanded="false"><span>◆</span><strong data-i18n="menu.adminPanel">ADMIN PANEL</strong><span class="chevron">⌄</span></button><div id="adminPanelLinks" class="admin-panel-links" hidden><a data-cap="creator_control" href="/admin.html" data-i18n="admin.panel">Painel ADM</a><a data-cap="universe_build" href="/universe-builder.html" data-i18n="admin.universe">Universe Builder</a><a data-cap="image_management" href="/image-library.html" data-i18n="admin.images">Image Manager</a><a data-cap="music_management" href="/music-manager" data-i18n="admin.music">Music Manager</a><a data-cap="creator_control" href="/game-experience-manager.html">Personalization Manager</a><a data-cap="creator_studio_edit" href="/creator-studio.html">Creator Studio</a><a data-cap="manage_staff_roles" href="/admin.html#adminConnections">Admin Connections</a><a data-cap="ai_diagnostics" href="/ai-control">AI Control Center</a><a data-cap="ai_diagnostics" href="/ai-flow">AI Flow Inspector</a><a data-cap="database_explorer" href="/database-explorer.html">Database Explorer</a><a data-cap="deployment_monitor" href="/deployment-monitor.html">Deployment Monitor</a><a data-cap="bug_triage" href="/bug-tracker.html">Bug Tracker</a></div></div></nav><div class="drawer-footer"><span class="live-dot"></span><span>Beta 0.99</span></div></div></aside></div>`;}
function mountGlobalUi(){const host=document.getElementById("siteShell");if(!host)return null;host.innerHTML=shellMarkup();const layer=host.firstElementChild;if(layer){document.body.insertBefore(layer,document.body.firstChild);host.remove();}return layer;}
function focusables(root){return [...root.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')].filter(el=>!el.hidden&&getComputedStyle(el).visibility!=="hidden");}
function installImageFailureRecovery(){document.addEventListener("error",event=>{const image=event.target;if(!(image instanceof HTMLImageElement)||image.dataset.gvImage!=="1"||image.dataset.gvRecovered==="1")return;image.dataset.gvRecovered="1";const fallback=document.createElement("div");fallback.className="game-card-placeholder gv-image-fallback";fallback.textContent=image.dataset.gvFallback||"GI";fallback.setAttribute("role","img");fallback.setAttribute("aria-label",image.alt||"Imagem indisponível");image.replaceWith(fallback);},true);}
async function initShell(){mountGlobalUi();GV.applyBrand({tier:localStorage.getItem("gv_tier")||"FREE",selectedTheme:localStorage.getItem("gv_theme")||"FREE_DARK"});installImageFailureRecovery();await GV.loadTranslations();const header=document.getElementById("siteHeader"),syncHeader=()=>header?.classList.toggle("scrolled",scrollY>24);syncHeader();addEventListener("scroll",syncHeader,{passive:true});const trigger=document.getElementById("menuTrigger"),drawer=document.getElementById("sideDrawer"),overlay=document.getElementById("drawerOverlay"),close=document.getElementById("drawerClose");let previousFocus=null;const isOpen=()=>drawer?.classList.contains("open");function closeDrawer(){drawer?.classList.remove("open");overlay?.classList.remove("show");drawer?.setAttribute("aria-hidden","true");trigger?.setAttribute("aria-expanded","false");document.body.classList.remove("drawer-open");previousFocus?.focus?.();}trigger?.addEventListener("click",()=>{if(isOpen())return closeDrawer();previousFocus=document.activeElement;drawer?.classList.add("open");overlay?.classList.add("show");drawer?.setAttribute("aria-hidden","false");trigger?.setAttribute("aria-expanded","true");document.body.classList.add("drawer-open");});close?.addEventListener("click",closeDrawer);overlay?.addEventListener("click",closeDrawer);drawer?.querySelectorAll("a[href]").forEach(a=>a.addEventListener("click",closeDrawer));document.addEventListener("keydown",e=>{if(e.key==="Escape"){if(isOpen())closeDrawer();document.getElementById("giMusicPopover")?.setAttribute("hidden","");}if(!isOpen()||e.key!=="Tab")return;const f=focusables(drawer);if(!f.length)return;const first=f[0],last=f.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}});document.getElementById("globalSearchForm")?.addEventListener("submit",e=>{e.preventDefault();const q=document.getElementById("globalSearch")?.value.trim();if(q)location.href=`/results.html?q=${encodeURIComponent(q)}`;});
  try{const auth=await GV.api("/api/auth/me");GV.auth=auth;if(auth.authenticated&&auth.preferences?.language&&auth.preferences.language!==GV.lang)await GV.setLanguage(auth.preferences.language,{persist:true});if(auth.theme)GV.applyTheme(auth.theme);if(auth.preferences)applyPresentationPreferences(auth.preferences);const profile=document.getElementById("drawerProfile"),accountLink=document.getElementById("accountMenuLink"),accountLabel=document.getElementById("accountMenuLabel"),settings=document.getElementById("profileSettingsLink"),top=document.getElementById("topProfileLink"),topAvatar=document.getElementById("topProfileAvatar");if(auth.authenticated){const name=auth.user.displayName||auth.user.username||auth.user.email||"GI",classification=auth.user.staffRole&&auth.user.staffRole!=="NONE"?auth.user.staffRole:(auth.user.tier||"FREE"),avatarUrl=auth.user.avatarDisplayUrl||auth.user.avatarUrl||GV.autoAvatar({seed:auth.user.id||auth.user.email,name,classification});GV.applyBrand({...auth.theme,staffRole:auth.user.staffRole,plan:auth.user.tier});if(profile)profile.innerHTML=`<div class="avatar gi-auto-avatar"><img src="${GV.safe(avatarUrl)}" alt="${GV.safe(name)}"></div><div><strong>${GV.safe(name)}</strong><span>${auth.user.username?`@${GV.safe(auth.user.username)} · `:""}${GV.safe(classification==="FREE"?"GameIndex":classification)}</span></div>`;accountLink.href="/profile.html";accountLabel.textContent="Perfil";settings.hidden=false;top.href="/profile.html";topAvatar.innerHTML=`<img src="${GV.safe(avatarUrl)}" alt="${GV.safe(name)}">`;}}catch{}
  try{const data=await GV.api("/api/beta0986/access"),access=data.access||{},caps=new Set(access.capabilities||[]),panel=document.getElementById("adminPanelMenu"),panelButton=document.getElementById("adminPanelToggle"),links=document.getElementById("adminPanelLinks"),canPanel=["creator_control","universe_build","image_management","music_management","creator_studio_edit","manage_staff_roles","ai_diagnostics","database_explorer","deployment_monitor","bug_triage"].some(cap=>caps.has(cap));if(panel)panel.hidden=!canPanel;if(canPanel){links?.querySelectorAll("[data-cap]").forEach(a=>a.hidden=!caps.has(a.dataset.cap));const stored=localStorage.getItem("gi_admin_panel_open")==="1";links.hidden=!stored;panelButton.setAttribute("aria-expanded",String(stored));panelButton.addEventListener("click",()=>{const open=links.hidden;links.hidden=!open;panelButton.setAttribute("aria-expanded",String(open));localStorage.setItem("gi_admin_panel_open",open?"1":"0");});document.documentElement.dataset.roleTheme=String(access.roleTheme||"FREE").toLowerCase();}}catch{}
  try{const updates=await GV.api("/api/update-log"),dot=document.getElementById("updateLogDot");if(dot)dot.hidden=!updates.hasUnread;}catch{}
  window.dispatchEvent(new CustomEvent("gv:shell-ready",{detail:{auth:GV.auth,language:GV.lang}}));}
initShell();

(function imageEngineVerification(){const reported=new Set();function report(img,ok){const asset=img?.dataset?.gvIe3Asset,revision=Number(img?.dataset?.gvIe3Revision||0);if(!asset||!revision)return;const key=`${asset}:${revision}:${ok}`;if(reported.has(key))return;reported.add(key);fetch('/api/image-engine3/browser-result',{method:'POST',credentials:'same-origin',headers:{'content-type':'application/json'},body:JSON.stringify({assetId:asset,revision,width:ok?img.naturalWidth:0,height:ok?img.naturalHeight:0,contextMatch:ok})}).catch(()=>{});}addEventListener('load',e=>{if(e.target instanceof HTMLImageElement)report(e.target,true);},true);addEventListener('error',e=>{if(e.target instanceof HTMLImageElement)report(e.target,false);},true);})();

(function gameIndexMusic0987(){
  if(window.__GI_MUSIC_0987__)return;
  window.__GI_MUSIC_0987__=true;
  // Compatibility marker retained for old diagnostics; 0.9875 owns the polished runtime.
  // HF2 regression contract markers: playerState===0&&activeVideoId ; loop=1&playlist=VIDEO_ID.
  window.__GI_MUSIC_0986_HF2__=true;
  const mutedKey='gi_audio_muted',enabledKey='gi_audio_enabled',volumeKey='gi_audio_volume',zeroMuteKey='gi_audio_zero_muted',robloxExperienceKey='gi_experience_roblox';
  const CHILD_LABELS=Object.freeze({'blox-fruits':'Blox Fruits','doors':'DOORS','fisch':'Fisch','work-at-a-pizza-place':'Work at a Pizza Place','prison-life':'Prison Life'});
  let player=null,playerPromise=null,apiPromise=null,playerHost=null,currentContext=null,currentProfile=null,alternateProfile=null,resolvedProfile=null,activeVariant='main',loadingToken=0,playerState=-1,activeVideoId='',popoverOpen=false,musicState='IDLE',lastError='',loopCount=0,lastEndedAt=0,playerInstances=0;
  const button=()=>document.getElementById('gameIndexSoundToggle'),popover=()=>document.getElementById('giMusicPopover'),surface=()=>document.getElementById('giMusicPlayerSurface');
  const isMuted=()=>localStorage.getItem(mutedKey)==='1',isEnabled=()=>sessionStorage.getItem(enabledKey)==='1';
  function userVolume(){const raw=localStorage.getItem(volumeKey);if(raw===null||raw==='')return null;const n=Number(raw);return Number.isFinite(n)?Math.max(0,Math.min(100,Math.round(n))):null;}
  function directProfile(){return activeVariant==='roblox-og'?alternateProfile:currentProfile;}
  function current(){return resolvedProfile||directProfile();}
  function effectiveVolume(){const saved=userVolume();if(saved!==null)return saved;const configured=Number(current()?.defaultVolume);return Number.isFinite(configured)?Math.max(0,Math.min(100,Math.round(configured))):30;}
  function contextFromLocation(){
    const querySlug=new URLSearchParams(location.search).get('slug');
    if(/\/game(?:\.html)?$/.test(location.pathname)&&querySlug)return{type:'game',slug:querySlug.toLowerCase()};
    const child=location.pathname.match(/^\/game\/roblox\/([a-z0-9-]+)\/?$/i)?.[1];
    if(child)return{type:'game',slug:child.toLowerCase(),parent:'roblox'};
    if(/^\/game\/roblox\/?$/i.test(location.pathname))return{type:'game',slug:'roblox'};
    if(location.pathname==='/'||/\/index(?:\.html)?$/.test(location.pathname))return{type:'home'};
    return null;
  }
  function contextKey(c){return c?.type==='game'?`game:${c.slug}`:c?.type==='home'?'home':'';}
  function selectedRobloxVariant(){const raw=localStorage.getItem(robloxExperienceKey);return raw==='roblox-og'?'roblox-og':'main';}
  function trackLabel(){
    if(current()?.label)return String(current().label);
    if(currentContext?.type==='game'&&String(currentContext.slug).toLowerCase()==='roblox')return activeVariant==='roblox-og'?'OG Roblox Theme / 2009':'It’s Raining Tacos';
    const slug=String(currentContext?.slug||'').toLowerCase();
    if(CHILD_LABELS[slug])return current()?.youtubeVideoId?`Música · ${CHILD_LABELS[slug]}`:`${CHILD_LABELS[slug]} · sem música configurada`;
    return current()?.youtubeVideoId?'Música desta página':'Nenhuma música configurada';
  }
  function emit(){window.dispatchEvent(new CustomEvent('gameindex:music-state',{detail:{variant:activeVariant,track:trackLabel(),volume:effectiveVolume(),muted:isMuted(),playing:playerState===1,musicState,error:lastError,context:currentContext,loopCount,playerInstances,videoId:activeVideoId}}));}
  function render(){
    const b=button(),p=popover(),has=Boolean(current()?.youtubeVideoId),muted=isMuted(),playing=playerState===1;
    if(b){b.dataset.playing=playing?'1':'0';b.setAttribute('aria-pressed',String(playing));b.setAttribute('aria-expanded',String(popoverOpen));const icon=b.querySelector('span');if(icon)icon.textContent=muted?'🔇':playing?'🔊':has?'▶':'🔈';}
    const t=document.getElementById('giMusicTrack'),v=document.getElementById('giVolume'),vv=document.getElementById('giVolumeValue'),mute=document.getElementById('giMusicMute'),play=document.getElementById('giMusicPlay'),variants=document.getElementById('giMusicVariants'),status=document.getElementById('giMusicStatus');
    if(t)t.textContent=trackLabel();
    if(v){v.value=String(effectiveVolume());if(vv)vv.textContent=`${effectiveVolume()}%`;}
    if(mute)mute.textContent=muted?'UNMUTE':'MUTE';
    if(play)play.textContent=playing?'PAUSE':'PLAY';
    if(variants){const roblox=currentContext?.type==='game'&&String(currentContext.slug).toLowerCase()==='roblox';variants.hidden=!roblox;variants.innerHTML=roblox?`<button type="button" data-music-variant="main" class="${activeVariant==='main'?'active':''}" aria-pressed="${activeVariant==='main'}">It’s Raining Tacos · Modern</button><button type="button" data-music-variant="roblox-og" class="${activeVariant==='roblox-og'?'active':''}" aria-pressed="${activeVariant==='roblox-og'}">OG Theme · OG</button>`:'';}
    if(status){if(lastError==='UNAVAILABLE')status.textContent='Música indisponível';else if(musicState==='BLOCKED_BY_AUTOPLAY')status.textContent='Clique em PLAY para iniciar a música.';else if(has)status.textContent=`Loop ativo · ${loopCount} reinício${loopCount===1?'':'s'}`;else status.textContent='';}
    if(p)p.hidden=!popoverOpen;
    emit();
  }
  function loadIframeApi(){
    if(window.YT?.Player)return Promise.resolve(window.YT);
    if(apiPromise)return apiPromise;
    apiPromise=new Promise((resolve,reject)=>{
      const previous=window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady=()=>{try{previous?.();}catch{};window.YT?.Player?resolve(window.YT):reject(new Error('YOUTUBE_IFRAME_API_UNAVAILABLE'));};
      const existing=document.querySelector('script[data-gi-youtube-iframe-api="1"]');
      if(existing)return;
      const script=document.createElement('script');script.src='https://www.youtube.com/iframe_api';script.async=true;script.dataset.giYoutubeIframeApi='1';script.onerror=()=>reject(new Error('YOUTUBE_IFRAME_API_LOAD_FAILED'));document.head.appendChild(script);
    });
    return apiPromise;
  }
  function playerNode(){
    const host=surface();if(!host)return null;
    host.hidden=false;
    if(playerHost&&playerHost.isConnected)return playerHost;
    playerHost=document.createElement('div');playerHost.id='giYouTubeMusicPlayer';host.replaceChildren(playerHost);return playerHost;
  }
  function syncPlayer({play=true}={}){
    if(!player)return;
    try{player.setVolume(effectiveVolume());player.setLoop?.(true);isMuted()?player.mute():player.unMute();if(play&&isEnabled())player.playVideo();}catch{}
  }
  function loadActiveTrack({play=true}={}){
    if(!player||!activeVideoId)return false;
    try{
      // Keep the same iframe, but replace its one-item playlist so YouTube's native
      // loop fallback follows the currently selected Game Index music context.
      if(play&&isEnabled()&&typeof player.loadPlaylist==='function')player.loadPlaylist([activeVideoId],0,0);
      else if(typeof player.cuePlaylist==='function')player.cuePlaylist([activeVideoId],0,0);
      else player.loadVideoById(activeVideoId);
      player.setLoop?.(true);syncPlayer({play});return true;
    }catch{try{player.loadVideoById(activeVideoId);syncPlayer({play});return true;}catch{return false;}}
  }
  function restartLoop(){
    if(!player||!activeVideoId||!isEnabled())return;
    const now=Date.now();if(now-lastEndedAt<120)return;lastEndedAt=now;loopCount++;
    musicState='LOOP_RESTART';
    try{player.seekTo(0,true);player.setVolume(effectiveVolume());isMuted()?player.mute():player.unMute();setTimeout(()=>{try{player.playVideo();}catch{}},45);}catch{}
    render();
  }
  function onPlayerState(event){
    playerState=Number(event?.data ?? -1);
    if(playerState===1)musicState='PLAYING';
    else if(playerState===2)musicState='PAUSED';
    else if(playerState===3)musicState='BUFFERING';
    else if(playerState===0){musicState='ENDED';restartLoop();}
    else if(playerState===-1||playerState===5)musicState='READY';
    render();
  }
  function onPlayerError(){musicState='UNAVAILABLE';lastError='UNAVAILABLE';playerState=-1;render();}
  async function ensurePlayer(id,{play=true}={}){
    if(!/^[A-Za-z0-9_-]{11}$/.test(String(id||'')))return false;
    lastError='';activeVideoId=String(id);musicState='READY';
    if(player){
      if(loadActiveTrack({play})){setTimeout(()=>syncPlayer({play}),160);render();return true;}
    }
    if(playerPromise){await playerPromise;if(player&&loadActiveTrack({play}))return true;}
    const node=playerNode();if(!node)return false;
    playerPromise=(async()=>{
      const YT=await loadIframeApi();
      const initialId=activeVideoId;
      player=new YT.Player(node,{width:'240',height:'135',videoId:initialId,playerVars:{autoplay:play&&isEnabled()?1:0,playsinline:1,controls:1,loop:1,playlist:initialId,rel:0,origin:location.origin},events:{onReady:()=>{playerInstances=1;try{player.setLoop?.(true);}catch{}syncPlayer({play});setTimeout(()=>syncPlayer({play}),250);render();},onStateChange:onPlayerState,onError:onPlayerError}});
      return player;
    })().catch(error=>{lastError='UNAVAILABLE';musicState='UNAVAILABLE';console.warn('[GameIndex Music]',error?.message||error);return null;}).finally(()=>{playerPromise=null;});
    await playerPromise;render();return Boolean(player);
  }
  function stopPlayback(){try{player?.stopVideo();}catch{};activeVideoId='';playerState=-1;musicState='IDLE';lastError='';loopCount=0;render();}
  async function loadContext(){
    const token=++loadingToken,ctx=currentContext;if(!ctx){currentProfile=alternateProfile=resolvedProfile=null;stopPlayback();return;}
    try{
      const mainUrl=ctx.type==='home'?'/api/music/home':`/api/games/${encodeURIComponent(ctx.slug)}/music`;
      const requests=[fetch(mainUrl,{credentials:'same-origin'})];
      if(ctx.type==='game'&&String(ctx.slug).toLowerCase()==='roblox')requests.push(fetch(`/api/games/${encodeURIComponent(ctx.slug)}/music/alt/roblox-og`,{credentials:'same-origin'}));
      const responses=await Promise.all(requests),main=responses[0].ok?await responses[0].json():null,alt=responses[1]?.ok?await responses[1].json():null;if(token!==loadingToken)return;
      currentProfile=main?.profile||null;alternateProfile=alt?.profile||null;resolvedProfile=null;activeVariant=ctx.type==='game'&&ctx.slug==='roblox'?selectedRobloxVariant():'main';musicState=directProfile()?.youtubeVideoId?'READY':'IDLE';lastError='';loopCount=0;
      if(isEnabled()&&directProfile()?.youtubeVideoId)await ensurePlayer(directProfile().youtubeVideoId,{play:true});else if(!directProfile()?.youtubeVideoId)stopPlayback();render();
    }catch{currentProfile=alternateProfile=resolvedProfile=null;stopPlayback();}
  }
  function setContext(next){if(contextKey(next)===contextKey(currentContext))return;currentContext=next;activeVariant=next?.slug==='roblox'?selectedRobloxVariant():'main';resolvedProfile=null;loadContext();}
  function switchVariant(variant){
    const next=variant==='roblox-og'?'roblox-og':'main';activeVariant=next;if(currentContext?.slug==='roblox')localStorage.setItem(robloxExperienceKey,next);sessionStorage.setItem(enabledKey,'1');lastError='';resolvedProfile=null;loopCount=0;
    const profile=directProfile();if(profile?.youtubeVideoId)ensurePlayer(profile.youtubeVideoId,{play:true});else stopPlayback();render();window.dispatchEvent(new CustomEvent('gameindex:music-variant',{detail:{variant:activeVariant,hasTrack:Boolean(profile?.youtubeVideoId)}}));return true;
  }
  function applyResolvedProfile(profile,{variant=activeVariant,context=currentContext}={}){
    if(context)currentContext=context;activeVariant=variant==='roblox-og'?'roblox-og':'main';resolvedProfile=profile?.youtubeVideoId?profile:null;lastError='';loopCount=0;
    if(resolvedProfile?.youtubeVideoId&&isEnabled())ensurePlayer(resolvedProfile.youtubeVideoId,{play:true});else if(!resolvedProfile?.youtubeVideoId&&!directProfile()?.youtubeVideoId)stopPlayback();render();return true;
  }
  function setVolume(value){const raw=Number(value),v=Math.max(0,Math.min(100,Math.round(Number.isFinite(raw)?raw:30)));localStorage.setItem(volumeKey,String(v));try{player?.setVolume(v);}catch{}if(v===0){localStorage.setItem(mutedKey,'1');localStorage.setItem(zeroMuteKey,'1');try{player?.mute();}catch{}}else if(localStorage.getItem(zeroMuteKey)==='1'){localStorage.removeItem(zeroMuteKey);localStorage.setItem(mutedKey,'0');sessionStorage.setItem(enabledKey,'1');try{player?.unMute();player?.playVideo();}catch{}}render();return v;}
  function toggleMute(){const next=!isMuted();localStorage.removeItem(zeroMuteKey);localStorage.setItem(mutedKey,next?'1':'0');if(next){try{player?.mute();}catch{}}else{sessionStorage.setItem(enabledKey,'1');if(current()?.youtubeVideoId&&!player)ensurePlayer(current().youtubeVideoId,{play:true});try{player?.unMute();player?.setVolume(effectiveVolume());player?.playVideo();}catch{}}render();}
  function togglePlay(){sessionStorage.setItem(enabledKey,'1');localStorage.setItem(mutedKey,'0');localStorage.removeItem(zeroMuteKey);lastError='';const profile=current();if(!profile?.youtubeVideoId){musicState='IDLE';render();return false;}if(!player){ensurePlayer(profile.youtubeVideoId,{play:true});return true;}if(playerState===1){try{player.pauseVideo();}catch{}playerState=2;musicState='PAUSED';}else{try{player.unMute();player.setVolume(effectiveVolume());player.playVideo();}catch{}musicState='READY';}render();return true;}
  function preview(videoId,defaultVolume=30){resolvedProfile={youtubeVideoId:String(videoId),defaultVolume:Number.isFinite(Number(defaultVolume))?Number(defaultVolume):30,preview:true,label:'Preview'};activeVariant='main';sessionStorage.setItem(enabledKey,'1');localStorage.setItem(mutedKey,'0');localStorage.removeItem(zeroMuteKey);popoverOpen=true;ensurePlayer(resolvedProfile.youtubeVideoId,{play:true});render();return true;}
  function mountGameControls(host){if(!host)return;host.innerHTML=`<div class="game-music-control"><button type="button" data-game-music="open">♫ Música</button><div class="game-music-current" data-game-music-label>${GV.safe(trackLabel())}</div></div>`;host.addEventListener('click',e=>{if(e.target.closest('[data-game-music="open"]')){popoverOpen=true;render();}});const sync=()=>{const label=host.querySelector('[data-game-music-label]');if(label)label.textContent=trackLabel();};addEventListener('gameindex:music-state',sync);sync();}
  function bind(){
    setContext(contextFromLocation());
    button()?.addEventListener('click',()=>{popoverOpen=!popoverOpen;render();});
    document.getElementById('giMusicClose')?.addEventListener('click',()=>{popoverOpen=false;render();});
    document.getElementById('giMusicMute')?.addEventListener('click',toggleMute);
    document.getElementById('giMusicPlay')?.addEventListener('click',togglePlay);
    document.getElementById('giVolume')?.addEventListener('input',e=>setVolume(e.target.value));
    document.getElementById('giMusicVariants')?.addEventListener('click',e=>{const v=e.target.closest('[data-music-variant]')?.dataset.musicVariant;if(v){window.GameIndexExperience?.applyVariant?.(v);switchVariant(v);}});
    document.addEventListener('visibilitychange',()=>{if(!player)return;if(document.hidden){try{player.pauseVideo();}catch{}}else if(isEnabled()){syncPlayer({play:true});}});
    addEventListener('gameindex:context',e=>{if(e.detail?.gameSlug)setContext({type:'game',slug:e.detail.gameSlug,parent:e.detail.parentSlug||null});});
    addEventListener('gameindex:personalization-applied',e=>{const d=e.detail||{};if(d.music!==undefined)applyResolvedProfile(d.music,{variant:d.experienceKey||activeVariant,context:d.context||currentContext});});
    render();
  }
  let bound=false;const bindOnce=()=>{if(bound)return;bound=true;bind();};
  window.GameIndexMusic=Object.freeze({setContext,switchVariant,applyResolvedProfile,setVolume,toggleMute,togglePlay,preview,mountGameControls,contextFromLocation,isMuted,isEnabled,getVolume:effectiveVolume,getState:()=>({musicState,variant:activeVariant,context:currentContext,volume:effectiveVolume(),muted:isMuted(),videoId:activeVideoId,error:lastError,loopCount,playerInstances})});
  if(document.getElementById('gameIndexSoundToggle'))bindOnce();else addEventListener('gv:shell-ready',bindOnce,{once:true});
})();
