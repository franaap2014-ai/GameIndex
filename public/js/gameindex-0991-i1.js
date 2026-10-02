(()=>{
  if(window.__GI_0991_I1__)return;
  window.__GI_0991_I1__=true;
  const root=document.documentElement;
  const routeHistory=(()=>{let rows=[];try{rows=JSON.parse(sessionStorage.getItem("gi_i1_route_history")||"[]");}catch{}const current=location.pathname;if(rows.at(-1)!==current)rows.push(current);rows=rows.filter(Boolean).slice(-6);try{sessionStorage.setItem("gi_i1_route_history",JSON.stringify(rows));}catch{}return rows;})();
  const errors=[],failedRequests=[];
  const safePath=value=>{try{const u=new URL(String(value||location.href),location.origin);return u.origin===location.origin?u.pathname:"";}catch{return "";}};
  const scrub=v=>String(v??"").replace(/(?:bearer\s+[a-z0-9._~-]+|sk-(?:proj-)?[a-z0-9_-]{8,}|password\s*[:=]\s*\S+|senha\s*[:=]\s*\S+|token\s*[:=]\s*\S+)/ig,"[REDACTED]").slice(0,500);
  addEventListener("error",e=>{errors.push({type:"error",message:scrub(e.message),source:safePath(e.filename),line:Number(e.lineno||0),at:new Date().toISOString()});if(errors.length>8)errors.shift();});
  addEventListener("unhandledrejection",e=>{errors.push({type:"unhandledrejection",message:scrub(e.reason?.message||e.reason||"Unknown rejection"),at:new Date().toISOString()});if(errors.length>8)errors.shift();});

  const nativeFetch=window.fetch?.bind(window);
  if(nativeFetch)window.fetch=async(...args)=>{
    let url="",method="GET";
    try{url=typeof args[0]==="string"?args[0]:args[0]?.url||"";method=String(args[1]?.method||args[0]?.method||"GET").toUpperCase();}catch{}
    try{
      const response=await nativeFetch(...args);
      try{
        const u=new URL(url,location.href);
        if(u.origin===location.origin&&u.pathname.startsWith("/api/")&&!response.ok){
          failedRequests.push({method,path:u.pathname,status:response.status,at:new Date().toISOString()});
          if(failedRequests.length>10)failedRequests.shift();
        }
      }catch{}
      return response;
    }catch(error){
      try{
        const u=new URL(url,location.href);
        if(u.origin===location.origin&&u.pathname.startsWith("/api/")){
          failedRequests.push({method,path:u.pathname,status:"NETWORK_ERROR",at:new Date().toISOString()});
          if(failedRequests.length>10)failedRequests.shift();
        }
      }catch{}
      throw error;
    }
  };

  function upgradeBrand(){
    document.querySelectorAll(".gi-brand-lockup").forEach(link=>{
      if(link.dataset.giHomeBound)return;
      link.dataset.giHomeBound="1";
      link.addEventListener("click",event=>{
        const home=location.pathname==="/"||/\/index\.html$/i.test(location.pathname);
        if(home){event.preventDefault();scrollTo({top:0,behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});return;}
        const dirty=root.dataset.unsaved==="1"||document.body?.dataset?.unsaved==="1"||window.GameIndexUnsaved?.hasChanges?.()===true;
        if(!dispatchEvent(new CustomEvent("gameindex:navigate-home-request",{cancelable:true,detail:{source:"brand"}}))){event.preventDefault();return;}
        if(dirty&&!confirm("Há alterações não salvas. Sair e voltar para a Home?"))event.preventDefault();
      });
    });
  }

  function context(){
    const p=location.pathname.toLowerCase(),page=document.body?.dataset?.page||"";
    if(p==="/"||p.endsWith("/index.html"))return{area:"Home",sub:"",actions:[["/games.html","Games"],["/ai.html","Dexter"],["/creator.html","Creator"]]};
    if(p.includes("profile-settings"))return{area:"Settings",sub:"Profile",actions:[["/settings.html","Appearance"],["/profile-settings.html","Profile"],["/subscriptions.html","PRO"]]};
    if(p.includes("settings"))return{area:"Settings",sub:"Appearance",actions:[["/settings.html","Appearance"],["/profile-settings.html","Profile"],["/subscriptions.html","PRO"]]};
    if(p.includes("social"))return{area:"Social",sub:"",actions:[["/social.html","Feed"],["/profile.html","Profile"],["/profile-settings.html","Edit profile"]]};
    if(p.includes("profile"))return{area:"Social",sub:"Profile",actions:[["/social.html","Social"],["/profile-settings.html","Edit profile"],["/settings.html","Settings"]]};
    if(p.includes("bug-tracker"))return{area:"Admin",sub:"Bugs",actions:[["/admin.html#bugs","Admin"],["/deployment-monitor.html","Deployment"]]};
    if(p.includes("universe-builder"))return{area:"Universe Builder",sub:"Workspace",actions:[["/admin.html#content","Admin"],["/games.html","Games"]]};
    if(p.includes("admin"))return{area:"Admin",sub:(location.hash||"#overview").slice(1),actions:[["/admin.html","Overview"],["/bug-tracker.html","Bugs"],["/universe-builder.html","Builder"]]};
    if(p.includes("creator"))return{area:"Creator",sub:"",actions:[["/creator.html","Creator"],["/games.html","Games"],["/showcase.html","Showcase"]]};
    if(p.includes("games")||p.includes("/game"))return{area:"Games",sub:page||"",actions:[["/games.html","Games"],["/ai.html","Dexter"],["/social.html","Social"]]};
    return{area:"Game Index",sub:page||"",actions:[["/games.html","Games"],["/social.html","Social"]]};
  }

  function upgradeCompass(){
    const main=document.querySelector('main');if(!main)return;
    let bar=document.getElementById('giContextCompass');
    if(!bar){bar=document.createElement('nav');bar.id='giContextCompass';bar.className='gi-context-compass';bar.setAttribute('aria-label','Ações desta página');main.before(bar);}
    const ctx=context(),caps=new Set(window.GV?.access?.capabilities||[]),p=location.pathname;
    let actions=ctx.actions.map(([href,label])=>({href,label}));
    if(p.includes('universe-builder'))actions=[{id:'foundationPreview',label:'Prévia',cap:'universe_build'},{id:'saveBlueprint',label:'Salvar',cap:'universe_build'},{id:'enhanceI6',label:'Aprimorar',cap:'universe_build'}];
    else if(p.includes('cinematic-test-lab'))actions=[{id:'ctlPlay',label:'Reproduzir',cap:'cinematic_test'},{id:'ctlPause',label:'Pausar',cap:'cinematic_test'},{id:'ctlReplay',label:'Reiniciar',cap:'cinematic_test'}];
    else if(document.body.dataset.page==='game')actions=[{id:'gameTabs',label:'Visão geral',scroll:true},{id:'followGame',label:'Seguir'},{id:'askAboutGame',label:'Dexter'}];
    const guards={'/admin.html':'admin_panel','/deployment-monitor.html':'deployment_monitor','/bug-tracker.html':'bug_triage','/universe-builder.html':'universe_build'};
    const filtered=actions.filter(x=>{const cap=x.cap||guards[x.href?.split('#')[0]];return(!cap||caps.has(cap))&&(!x.id||document.getElementById(x.id));});
    const signature=JSON.stringify([ctx.area,filtered.map(x=>({...x,disabled:x.id?document.getElementById(x.id)?.disabled:false})),window.GV?.lang]);
    if(bar.dataset.signature===signature)return;bar.dataset.signature=signature;bar.replaceChildren();
    const title=document.createElement('span');title.textContent=ctx.area;bar.append(title);
    const links=document.createElement('div');links.className='gi-context-actions';bar.append(links);
    for(const action of filtered){const el=document.createElement(action.href?'a':'button');el.textContent=action.label;if(action.href)el.href=action.href;else{el.type='button';el.disabled=Boolean(document.getElementById(action.id)?.disabled);el.addEventListener('click',()=>{const target=document.getElementById(action.id);if(!target||target.disabled)return;if(action.scroll){target.scrollIntoView({block:'center',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});target.querySelector('button')?.focus();}else target.click();});}links.append(el);}
    window.GII18n?.apply(bar);
  }

  function updateReportLink(){document.querySelectorAll('a[href^="/report-bug.html"]').forEach(a=>{if(location.pathname!=="/report-bug.html")a.href="/report-bug.html?from="+encodeURIComponent(location.pathname);});}

  function snapshot(){
    const ctx=context();
    return {
      viewport:innerWidth+"x"+innerHeight,
      browserFamily:navigator.userAgent.includes("Edg/")?"Edge":navigator.userAgent.includes("Chrome/")?"Chromium":navigator.userAgent.includes("Firefox/")?"Firefox":navigator.userAgent.includes("Safari/")?"Safari":"Browser",
      platform:String(navigator.userAgentData?.platform||navigator.platform||"").slice(0,80),
      locale:document.documentElement.lang||navigator.language||"",
      theme:root.dataset.theme||localStorage.getItem("gv_theme")||"",
      primaryIdentity:root.dataset.brandClass||"",
      area:ctx.area,subsection:ctx.sub,
      reducedMotion:matchMedia("(prefers-reduced-motion: reduce)").matches||root.dataset.reducedMotion==="1",
      routeHistory:[...routeHistory],
      recentErrors:[...errors],
      failedRequests:[...failedRequests],
      cinematic:window.GameIndexCinematics?.debugState?.()||null
    };
  }

  window.GameIndexDiagnostics=Object.freeze({snapshot});
  let watching=false;
  function watchContext(){const main=document.querySelector('main');if(watching||!main)return;watching=true;let queued=false;new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;upgradeCompass();});}).observe(main,{childList:true,subtree:true,attributes:true,attributeFilter:['disabled']});}
  function boot(){upgradeBrand();upgradeCompass();updateReportLink();watchContext();}
  addEventListener("hashchange",upgradeCompass);
  addEventListener("gv:language-changed",upgradeCompass);
  addEventListener("gameindex:context",upgradeCompass);
  addEventListener("DOMContentLoaded",()=>{let queued=false;const main=document.querySelector("main");if(main)new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;upgradeCompass();});}).observe(main,{childList:true,subtree:true,attributes:true,attributeFilter:["disabled"]});upgradeCompass();},{once:true});
  addEventListener("gv:shell-ready",boot,{once:true});
  if(document.querySelector(".site-header"))boot();
  else if(document.readyState==="loading")addEventListener("DOMContentLoaded",()=>setTimeout(boot,0),{once:true});
})();
