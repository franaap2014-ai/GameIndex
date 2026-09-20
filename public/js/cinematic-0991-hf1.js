(()=>{
  if(window.__GI_CINEMATIC_0991_HF1__)return;window.__GI_CINEMATIC_0991_HF1__=true;
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  const skipPaths=/\/(?:login|setup-admin|admin-recovery)(?:\.html)?$/i;
  const reduced=()=>matchMedia?.('(prefers-reduced-motion: reduce)')?.matches||document.documentElement.dataset.reducedMotion==='1'||document.documentElement.dataset.animations==='off';
  const translatedTitle=event=>window.GV?.t?.(event.titleKey,event.fallbackTitle)||event.fallbackTitle||event.identity||'GAME INDEX';
  function overlayFor(event){const el=document.createElement('div');el.className='gi-cinematic-overlay';el.dataset.identity=event.identity||'WELCOME';el.setAttribute('role','presentation');el.innerHTML=`<div class="gi-cinematic-dark"></div><div class="gi-cinematic-stage"><div class="gi-cinematic-details">${[0,1,2,3,4,5].map(i=>`<i class="gi-cinematic-detail d${i}"></i>`).join('')}</div><h1 class="gi-cinematic-title">${GV.safe(translatedTitle(event))}</h1><small class="gi-cinematic-status">GAME INDEX · ${GV.safe(event.identity||'WELCOME')}</small></div>`;return el;}
  async function start(event){return GV.api(`/api/cinematics/${encodeURIComponent(event.eventKey)}/start`,{method:'POST',headers:{'content-type':'application/json'},body:'{}',timeout:8000});}
  async function complete(event){return GV.api(`/api/cinematics/${encodeURIComponent(event.eventKey)}/complete`,{method:'POST',headers:{'content-type':'application/json'},body:'{}',timeout:8000});}
  async function play(event){
    await start(event);const el=overlayFor(event);document.body.appendChild(el);document.documentElement.classList.add('gi-cinematic-playing');let safety;
    const cleanup=()=>{clearTimeout(safety);el.remove();document.documentElement.classList.remove('gi-cinematic-playing');};
    try{
      safety=setTimeout(cleanup,9000);
      if(reduced()){
        el.classList.add('is-closing','is-black');await sleep(140);el.classList.add('is-lit');await sleep(380);el.classList.remove('is-lit');el.classList.add('is-off');const result=await complete(event);if(result?.theme)GV.applyTheme(result.theme);await sleep(130);el.classList.add('is-opening');await sleep(150);return result;
      }
      requestAnimationFrame(()=>el.classList.add('is-closing'));await sleep(570);el.classList.add('is-black');await sleep(160);el.classList.add('is-lit');await sleep(1120);el.classList.remove('is-lit');el.classList.add('is-off');await sleep(600);const result=await complete(event);if(result?.theme){GV.applyTheme(result.theme);GV.applyBrand({...result.theme,staffRole:result.identity,plan:result.identity==='PRO'?'PRO':undefined});}await sleep(120);el.classList.add('is-opening');await sleep(590);return result;
    }finally{cleanup();}
  }
  async function run(){
    if(skipPaths.test(location.pathname)||!window.GV)return;
    let data;try{data=await GV.api('/api/cinematics/queue',{timeout:8000});}catch{return;}if(!data?.authenticated||!Array.isArray(data.queue)||!data.queue.length)return;
    for(const event of data.queue){try{await play(event);await sleep(reduced()?80:180);}catch(error){console.warn('[GameIndex Cinematic]',event.eventKey,error?.message||error);break;}}
    try{const fresh=await GV.api('/api/auth/me');GV.auth=fresh;if(fresh?.theme)GV.applyTheme(fresh.theme);}catch{}
  }
  window.GameIndexCinematics=Object.freeze({run});
  addEventListener('gv:shell-ready',()=>run(),{once:true});
})();
