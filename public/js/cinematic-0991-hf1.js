(()=>{
  if(window.__GI_CINEMATIC_0991_I1__)return;
  window.__GI_CINEMATIC_0991_I1__=true;
  window.__GI_CINEMATIC_0991_HF1__=true;

  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  const skipPaths=/\/(?:login|setup-admin|admin-recovery)(?:\.html)?$/i;
  const reduced=()=>matchMedia?.("(prefers-reduced-motion: reduce)")?.matches||document.documentElement.dataset.reducedMotion==="1"||document.documentElement.dataset.animations==="off";
  const translatedTitle=event=>window.GV?.t?.(event.titleKey,event.fallbackTitle)||event.fallbackTitle||event.identity||"GAME INDEX";
  let running=null,lastState={status:"IDLE",event:null,error:"",startedAt:"",completedAt:""};

  function ensureStyle(){
    const loaded=[...document.styleSheets].some(sheet=>String(sheet.href||"").includes("/css/cinematic-0991-hf1.css"));
    if(loaded||document.querySelector('link[data-gi-cinematic-style]'))return;
    const link=document.createElement("link");
    link.rel="stylesheet";link.href="/css/cinematic-0991-hf1.css?v=09915i2";link.dataset.giCinematicStyle="1";
    document.head.appendChild(link);
  }

  function detailMarkup(){
    return [
      '<i class="gi-tech-rail r0"><b></b><em></em></i>',
      '<i class="gi-tech-rail r1"><b></b><em></em></i>',
      '<i class="gi-tech-rail r2"><b></b><em></em></i>',
      '<i class="gi-tech-node n0"></i>',
      '<i class="gi-tech-node n1"></i>',
      '<i class="gi-tech-bracket b0"></i>',
      '<i class="gi-tech-bracket b1"></i>',
      '<i class="gi-tech-scan"></i>'
    ].join("");
  }

  function overlayFor(event,{preview=false}={}){
    const el=document.createElement("div");
    el.className="gi-cinematic-overlay";
    el.dataset.identity=event.identity||"WELCOME";
    el.dataset.preview=preview?"1":"0";
    el.setAttribute("role","presentation");
    el.setAttribute("aria-hidden","true");
    el.innerHTML='<div class="gi-cinematic-dark"></div><div class="gi-cinematic-stage"><div class="gi-cinematic-details">'+detailMarkup()+'</div><div class="gi-cinematic-greeting"><h1 class="gi-cinematic-title">'+GV.safe(translatedTitle(event))+'</h1>'+(event.eventType==='WELCOME'&&event.username?'<p class="gi-cinematic-username">@'+GV.safe(event.username)+'</p>':'')+'</div><small class="gi-cinematic-status">GAME INDEX · '+GV.safe(event.identity||"WELCOME")+'</small></div>';
    return el;
  }

  async function start(event){return GV.api("/api/cinematics/"+encodeURIComponent(event.eventKey)+"/start",{method:"POST",headers:{"content-type":"application/json"},body:"{}",timeout:8000});}
  async function complete(event){return GV.api("/api/cinematics/"+encodeURIComponent(event.eventKey)+"/complete",{method:"POST",headers:{"content-type":"application/json"},body:"{}",timeout:8000});}

  async function choreography(event,{preview=false}={}){
    ensureStyle();
    if(!preview)await start(event);
    const el=overlayFor(event,{preview});
    document.body.appendChild(el);
    document.documentElement.classList.add("gi-cinematic-playing");
    let safety;
    const cleanup=()=>{clearTimeout(safety);el.remove();document.documentElement.classList.remove("gi-cinematic-playing");};
    lastState={status:preview?"PREVIEW":"PLAYING",event:{...event},error:"",startedAt:new Date().toISOString(),completedAt:""};
    try{
      safety=setTimeout(cleanup,10000);
      if(reduced()){
        el.classList.add("is-closing");await sleep(120);
        el.classList.add("is-black");await sleep(80);
        el.classList.add("is-lit");await sleep(420);
        el.classList.remove("is-lit");el.classList.add("is-off");await sleep(180);
        el.classList.add("is-cleared");await sleep(80);
        let result=null;
        if(!preview){result=await complete(event);if(result?.theme)GV.applyTheme(result.theme);}
        el.classList.add("is-opening");await sleep(140);
        lastState={...lastState,status:"COMPLETE",completedAt:new Date().toISOString()};
        return result;
      }

      requestAnimationFrame(()=>el.classList.add("is-closing"));
      await sleep(570);
      el.classList.add("is-black");
      await sleep(180);
      el.classList.add("is-lit");
      await sleep(1160);
      el.classList.remove("is-lit");
      el.classList.add("is-off");
      await sleep(620);
      el.classList.add("is-cleared");
      await sleep(170);

      let result=null;
      if(!preview){
        result=await complete(event);
        if(result?.theme){
          GV.applyTheme(result.theme);
          GV.applyBrand({...result.theme,staffRole:result.identity,plan:result.identity==="PRO"?"PRO":undefined});
        }
      }

      el.classList.add("is-opening");
      await sleep(590);
      lastState={...lastState,status:"COMPLETE",completedAt:new Date().toISOString()};
      return result;
    }catch(error){
      lastState={...lastState,status:"ERROR",error:String(error?.message||error),completedAt:new Date().toISOString()};
      throw error;
    }finally{cleanup();}
  }

  async function runInternal(){
    if(skipPaths.test(location.pathname)||!window.GV)return;
    ensureStyle();
    let data;
    try{data=await GV.api("/api/cinematics/queue",{timeout:8000});}
    catch(error){console.warn("[GameIndex Cinematic] queue unavailable",error?.message||error);return;}
    if(!data?.authenticated||!Array.isArray(data.queue)||!data.queue.length)return;
    for(const event of data.queue){
      try{await choreography(event);await sleep(reduced()?80:180);}
      catch(error){console.warn("[GameIndex Cinematic]",event.eventKey,error?.message||error);break;}
    }
    try{const fresh=await GV.api("/api/auth/me");GV.auth=fresh;if(fresh?.theme)GV.applyTheme(fresh.theme);}catch{}
  }

  function run(){if(running)return running;running=runInternal().finally(()=>{running=null;});return running;}
  function preview(event){if(running)throw new Error("CINEMATIC_ALREADY_RUNNING");running=choreography(event,{preview:true}).finally(()=>{running=null;});return running;}
  function debugState(){return {...lastState,reducedMotion:reduced(),running:Boolean(running)};}

  window.GameIndexCinematics=Object.freeze({run,preview,debugState});
  addEventListener("gv:shell-ready",()=>run(),{once:true});
  if(document.readyState==="loading")addEventListener("DOMContentLoaded",()=>queueMicrotask(run),{once:true});
  else queueMicrotask(run);
})();
