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

  function logoSvg(){
    return '<span class="gi-i1-logo-mark" aria-hidden="true"><svg viewBox="0 0 44 44" focusable="false"><path class="gi-i1-logo-frame" d="M9 8h18l8 8v20H17l-8-8V8Z"/><path class="gi-i1-logo-index" d="M15 14h12M15 21h16M15 28h10"/><circle class="gi-i1-logo-node" cx="30" cy="28" r="3"/></svg></span>';
  }

  function upgradeBrand(){
    document.querySelectorAll(".gi-brand-lockup").forEach((link,index)=>{
      link.classList.add("gi-i1-brand");
      link.href="/";
      link.setAttribute("aria-label","Game Index — Home");
      link.innerHTML=logoSvg()+'<span class="gi-i1-logo-copy"><strong>GAME INDEX</strong><small data-gi-brand-classification hidden></small></span>'+(index===0?'<span class="brand-badge gi-i1-version">BETA 0.991 I1</span>':"");
      link.addEventListener("click",event=>{
        const home=location.pathname==="/"||/\/index\.html$/i.test(location.pathname);
        if(home){event.preventDefault();scrollTo({top:0,behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});return;}
        const dirty=root.dataset.unsaved==="1"||document.body?.dataset?.unsaved==="1"||window.GameIndexUnsaved?.hasChanges?.()===true;
        const navEvent=new CustomEvent("gameindex:navigate-home-request",{cancelable:true,detail:{source:"brand"}});
        if(!dispatchEvent(navEvent)){event.preventDefault();return;}
        if(dirty&&!confirm("Há alterações não salvas. Sair e voltar para a Home?"))event.preventDefault();
      });
    });
    window.GV?.applyBrand?.({...window.GV?.auth?.theme,staffRole:window.GV?.auth?.user?.staffRole,plan:window.GV?.auth?.user?.tier});
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
    const header=document.querySelector(".site-header-inner"),nav=document.querySelector(".header-nav"),search=document.querySelector(".header-search");
    if(!header||!nav)return;
    const ctx=context();let compass=document.getElementById("giContextCompass");
    if(!compass){compass=document.createElement("div");compass.id="giContextCompass";compass.className="gi-i1-context-compass";(search||nav).before(compass);}
    compass.innerHTML='<span>'+GV.safe(ctx.area)+'</span>'+(ctx.sub?'<i>/</i><strong>'+GV.safe(ctx.sub)+'</strong>':"");
    const sound=nav.querySelector("#gameIndexSoundToggle"),profile=nav.querySelector("#topProfileLink");
    sound?.remove();profile?.remove();
    nav.innerHTML=ctx.actions.slice(0,4).map(([href,label])=>'<a class="nav-link gi-i1-context-action '+(location.pathname===href?"active":"")+'" href="'+href+'">'+label+'</a>').join("");
    if(sound)nav.appendChild(sound);if(profile)nav.appendChild(profile);
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
  function boot(){upgradeBrand();upgradeCompass();updateReportLink();}
  addEventListener("hashchange",upgradeCompass);
  addEventListener("gv:shell-ready",boot,{once:true});
  if(document.querySelector(".site-header"))boot();
  else if(document.readyState==="loading")addEventListener("DOMContentLoaded",()=>setTimeout(boot,0),{once:true});
})();
