(()=>{
  if(window.GameIndexAnimationRuntime)return;
  const COLORS=Object.freeze({
    CREATOR_GOLD:"#e7bd5b",CREATOR_RED:"#a62a39",DEV_RED:"#ff6674",DEV_BLUE:"#54a8ff",
    TESTER_BLUE:"#58a6ff",PRO_GREEN:"#63e69a",DARK_CABLE:"#111318",LIGHT_CABLE:"#f4f5f6",
    GAMEINDEX_WHITE:"#f4f4f2",GAMEINDEX_BLACK:"#050709",GAMEINDEX_PANEL:"#111821",GAMEINDEX_BORDER:"#2d3a49"
  });
  const COMPONENTS=new Set(["GI_LOGO","GI_G_MARK","TITLE","SUBTITLE","CLASSIFICATION","SYSTEM_LABEL","DIAGNOSTIC_LABEL","RAIL","NODE","BRACKET","FRAME","CIRCUIT_LINE","GRID","CABLE","SOCKET","TECH_CORNER","SEPARATOR","SCAN","GLOW","FLICKER","ENERGY_PULSE","BLACKOUT","BOOT","IRIS","LIGHT_SWEEP","DIGITAL_REVEAL","GLITCH","PARTICLES"]);
  const NUMERIC=["x","y","rotation","scale","scaleX","scaleY","opacity","blur","glow","brightness","width","height","borderOpacity","lineProgress","scanPosition","energy","maskProgress","clipProgress","thickness"];
  const resolveColor=value=>COLORS[String(value||"").toUpperCase()]||(/^#[0-9a-f]{3}(?:[0-9a-f]{3})?$/i.test(String(value||""))?String(value):"#f4f4f2");
  const reduced=()=>matchMedia?.("(prefers-reduced-motion: reduce)")?.matches||document.documentElement.dataset.reducedMotion==="1";

  function elementFor(track){
    const el=document.createElement("div");
    el.className=`gi-anim-element gi-anim-${String(track.component||"").toLowerCase().replaceAll("_","-")}`;
    el.dataset.trackId=track.id;
    el.dataset.component=track.component;
    el.style.zIndex=String(Number(track.layer||0)+120);
    el.style.setProperty("--gi-anim-color",resolveColor(track.color));
    if(["TITLE","SUBTITLE","CLASSIFICATION","SYSTEM_LABEL","DIAGNOSTIC_LABEL"].includes(track.component))el.textContent=track.text||track.name||track.component;
    else if(track.component==="GI_LOGO"){
      const mark=document.createElement("span");mark.className="gi-anim-logo-mark";mark.textContent="G";
      const word=document.createElement("strong");word.textContent="GAME INDEX";el.append(mark,word);
    }else if(track.component==="GI_G_MARK")el.textContent="G";
    return el;
  }
  function interpolate(a,b,t){
    if(!Number.isFinite(a))return Number.isFinite(b)?b:undefined;
    if(!Number.isFinite(b))return a;
    return a+(b-a)*Math.max(0,Math.min(1,t));
  }
  function frameState(track,time){
    const base={x:0,y:0,rotation:0,scale:1,scaleX:1,scaleY:1,opacity:1,blur:0,glow:0,brightness:1,width:100,height:100,borderOpacity:1,lineProgress:0,scanPosition:0,energy:0,maskProgress:0,clipProgress:0,thickness:2,...(track.properties||{})};
    const frames=[...(track.keyframes||[])].sort((a,b)=>a.time-b.time);
    if(!frames.length)return base;
    let left=frames[0],right=frames.at(-1);
    for(let i=0;i<frames.length;i++){
      if(frames[i].time<=time)left=frames[i];
      if(frames[i].time>=time){right=frames[i];break;}
    }
    const span=Math.max(1,Number(right.time)-Number(left.time)),ratio=left===right?0:(time-Number(left.time))/span;
    const state={...base};
    for(const key of NUMERIC){
      const lv=left[key]!==undefined?Number(left[key]):Number(base[key]);
      const rv=right[key]!==undefined?Number(right[key]):lv;
      state[key]=interpolate(lv,rv,ratio);
    }
    return state;
  }
  function applyState(el,state){
    el.style.opacity=String(state.opacity);
    el.style.transform=`translate(calc(-50% + ${state.x}%), calc(-50% + ${state.y}%)) rotate(${state.rotation}deg) scale(${state.scale*state.scaleX},${state.scale*state.scaleY})`;
    el.style.filter=`blur(${state.blur}px) brightness(${state.brightness}) drop-shadow(0 0 ${Math.max(0,state.glow*24)}px var(--gi-anim-color))`;
    el.style.setProperty("--gi-anim-width",`${state.width}%`);
    el.style.setProperty("--gi-anim-height",`${state.height}%`);
    el.style.setProperty("--gi-anim-border-opacity",String(state.borderOpacity));
    el.style.setProperty("--gi-anim-line-progress",String(state.lineProgress));
    el.style.setProperty("--gi-anim-scan-position",String(state.scanPosition));
    el.style.setProperty("--gi-anim-energy",String(state.energy));
    el.style.setProperty("--gi-anim-mask-progress",String(state.maskProgress));
    el.style.setProperty("--gi-anim-clip-progress",String(state.clipProgress));
    el.style.setProperty("--gi-anim-thickness",`${state.thickness}px`);
  }
  function create(host,definition={}){
    if(!host)throw new Error("ANIMATION_PREVIEW_HOST_REQUIRED");
    const duration=Math.max(250,Math.min(30000,Number(definition.durationMs||4200)));
    host.replaceChildren();
    host.classList.add("gi-animation-runtime-stage");
    host.dataset.background=String(definition.background?.mode||"GAMEINDEX_DARK").toLowerCase();
    if(definition.background?.color)host.style.setProperty("--gi-animation-bg",resolveColor(definition.background.color));
    const entries=[];
    for(const track of definition.tracks||[]){
      if(!COMPONENTS.has(track.component))continue;
      const el=elementFor(track);host.appendChild(el);entries.push({track,el});
    }
    let current=0,playing=false,loop=false,raf=0,startStamp=0,startTime=0;
    const listeners=new Set();
    const emit=()=>listeners.forEach(fn=>{try{fn({time:current,duration,playing,loop});}catch{}});
    function seek(time){
      current=Math.max(0,Math.min(duration,Number(time)||0));
      for(const entry of entries)applyState(entry.el,frameState(entry.track,current));
      emit();return current;
    }
    function tick(ts){
      if(!playing)return;
      if(!startStamp)startStamp=ts;
      current=startTime+(ts-startStamp);
      if(current>=duration){
        if(loop){current=0;startTime=0;startStamp=ts;}else{current=duration;playing=false;}
      }
      seek(current);
      if(playing)raf=requestAnimationFrame(tick);
    }
    function play(from=current){
      cancelAnimationFrame(raf);current=Math.max(0,Math.min(duration,Number(from)||0));if(current>=duration)current=0;
      if(reduced()){seek(duration);playing=false;return;}
      playing=true;startTime=current;startStamp=0;raf=requestAnimationFrame(tick);emit();
    }
    function pause(){playing=false;cancelAnimationFrame(raf);raf=0;emit();}
    function restart(){pause();seek(0);play(0);}
    function destroy(){pause();listeners.clear();host.replaceChildren();host.classList.remove("gi-animation-runtime-stage");}
    seek(0);
    return {
      seek,play,pause,restart,destroy,
      setLoop(value){loop=Boolean(value);emit();},
      onState(fn){if(typeof fn==="function")listeners.add(fn);return()=>listeners.delete(fn);},
      getState(){return {time:current,duration,playing,loop};}
    };
  }
  window.GameIndexAnimationRuntime=Object.freeze({create,resolveColor});
})();