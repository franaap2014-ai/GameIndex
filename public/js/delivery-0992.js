(()=>{
  if(window.__GI_0992_DELIVERY__)return;
  window.__GI_0992_DELIVERY__=true;

  const ROUTES=new Map([
    ["/","home|HOME"],["/index.html","home|HOME"],["/games.html","grid|GAMES"],
    ["/settings.html","gears|CONFIGURAÇÕES"],["/profile.html","profile|PERFIL"],["/profile-settings.html","profile|PERFIL"],
    ["/social.html","nodes|SOCIAL"],["/update-log.html","update|UPDATE LOG"],["/admin.html","code|PAINEL ADM"],
    ["/universe-builder.html","blocks|UNIVERSE BUILDER"],["/image-library.html","image|IMAGE MANAGER"],
    ["/music-manager","music|MUSIC MANAGER"],["/music-manager.html","music|MUSIC MANAGER"],
    ["/animation-editor.html","cinematic|CINEMATIC EDITOR"],["/cinematic-test-lab.html","cinematic|CINEMATIC TEST LAB"]
  ]);

  const reduced=()=>matchMedia("(prefers-reduced-motion: reduce)").matches||document.documentElement.dataset.reducedMotion==="1"||document.documentElement.dataset.animations==="off";
  const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
  let running=false;

  function visual(kind){
    if(kind==="gears")return '<div class="gi0992-gear a">⚙</div><div class="gi0992-gear b">⚙</div>';
    if(kind==="code")return '<div class="gi0992-code"><i></i><i></i><i></i><i></i><i></i></div>';
    if(kind==="update")return '<div class="gi0992-update">↑</div>';
    if(kind==="profile")return '<div class="gi0992-profile-mark"><i></i><b></b></div>';
    if(kind==="nodes")return '<div class="gi0992-nodes"><i></i><i></i><i></i><b></b><b></b></div>';
    if(kind==="blocks")return '<div class="gi0992-blocks"><i></i><i></i><i></i><i></i></div>';
    if(kind==="music")return '<div class="gi0992-bars"><i></i><i></i><i></i><i></i></div>';
    if(kind==="image")return '<div class="gi0992-image-mark"><i></i></div>';
    if(kind==="cinematic")return '<div class="gi0992-cinematic-mark"><i></i><i></i><i></i></div>';
    if(kind==="grid")return '<div class="gi0992-grid-mark"><i></i><i></i><i></i><i></i></div>';
    return '<div class="gi0992-home-mark">GI</div>';
  }

  async function transition(url,kind,title){
    if(running)return;
    running=true;
    const overlay=document.createElement("div");
    overlay.className="gi0992-sidebar-transition";
    overlay.dataset.kind=kind;
    overlay.setAttribute("role","presentation");
    overlay.innerHTML=`<div class="gi0992-transition-core" aria-hidden="true">${visual(kind)}</div><strong>${window.GV?.safe?.(title)||title}</strong>`;
    document.body.appendChild(overlay);
    document.documentElement.classList.add("gi0992-transitioning");
    requestAnimationFrame(()=>overlay.classList.add("is-active"));
    await wait(reduced()?110:620);
    location.assign(url);
  }

  document.addEventListener("click",event=>{
    if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
    const link=event.target.closest(".drawer-nav a[href]");
    if(!link||link.target==="_blank"||link.hasAttribute("download"))return;
    let url;try{url=new URL(link.href,location.href);}catch{return;}
    if(url.origin!==location.origin)return;
    const spec=ROUTES.get(url.pathname);
    if(!spec)return;
    if(url.pathname===location.pathname&&url.search===location.search&&url.hash===location.hash)return;
    const [kind,title]=spec.split("|");
    event.preventDefault();
    transition(url.href,kind,title);
  },true);

  window.GameIndexDelivery0992=Object.freeze({version:"0.992",transition});
})();
