(()=>{
  const $=id=>document.getElementById(id),clone=v=>JSON.parse(JSON.stringify(v));
  const COMPONENT_LIBRARY=[
    ["GI_LOGO","Logo","◆"],["GI_G_MARK","G Mark","G"],["TITLE","Title","T"],["SUBTITLE","Subtitle","t"],["CLASSIFICATION","Classification","C"],
    ["RAIL","Rail","━"],["NODE","Node","•"],["BRACKET","Bracket","⌜"],["FRAME","Frame","□"],["CIRCUIT_LINE","Circuit","⌁"],["GRID","Grid","▦"],
    ["CABLE","Cable","⌇"],["SOCKET","Socket","◉"],["SCAN","Scan","—"],["GLOW","Glow","✦"],["ENERGY_PULSE","Energy","◈"],["BLACKOUT","Blackout","■"],
    ["BOOT","Boot","⌁"],["IRIS","Iris","◉"],["LIGHT_SWEEP","Light Sweep","╱"],["DIGITAL_REVEAL","Digital Reveal","▤"],["GLITCH","Glitch","≋"],["PARTICLES","Particles","·"]
  ];
  const COLORS=["CREATOR_GOLD","CREATOR_RED","DEV_RED","DEV_BLUE","TESTER_BLUE","PRO_GREEN","DARK_CABLE","LIGHT_CABLE","GAMEINDEX_WHITE","GAMEINDEX_BLACK","GAMEINDEX_PANEL","GAMEINDEX_BORDER"];
  const state={catalog:null,projects:[],details:null,definition:null,selectedTrackId:null,selectedFrameIndex:null,leftTab:"layers",undo:[],redo:[],dirty:false,saving:false,controller:null,playhead:0,zoom:1,autosave:null,canPublish:false};
  function esc(v=""){return GV.safe(String(v??""));}
  function setSaveState(text,kind=""){const el=$("aeSaveState");if(el){el.textContent=text;el.dataset.state=kind;}}
  function currentProject(){return state.details?.project||null;}
  function currentTrack(){return state.definition?.tracks?.find(t=>t.id===state.selectedTrackId)||null;}
  function currentFrame(){const t=currentTrack();return t&&Number.isInteger(state.selectedFrameIndex)?t.keyframes?.[state.selectedFrameIndex]||null:null;}
  function snapshot(){return state.definition?JSON.stringify(state.definition):"";}
  function pushHistory(){if(!state.definition)return;const s=snapshot();if(state.undo.at(-1)!==s)state.undo.push(s);if(state.undo.length>80)state.undo.shift();state.redo=[];}
  function markDirty(){state.dirty=true;setSaveState("Alterações não salvas","dirty");clearTimeout(state.autosave);state.autosave=setTimeout(()=>saveProject({silent:true}).catch(()=>{}),1800);}
  function mutate(fn,{history=true}={}){if(history)pushHistory();fn();markDirty();renderAll();}
  function restore(serialized){if(!serialized)return;state.definition=JSON.parse(serialized);state.selectedTrackId=state.definition.tracks?.some(t=>t.id===state.selectedTrackId)?state.selectedTrackId:(state.definition.tracks?.[0]?.id||null);state.selectedFrameIndex=null;state.dirty=true;renderAll();}
  function undo(){if(!state.undo.length||!state.definition)return;state.redo.push(snapshot());restore(state.undo.pop());}
  function redo(){if(!state.redo.length||!state.definition)return;state.undo.push(snapshot());restore(state.redo.pop());}
  function defaultTrack(component){
    const id=(component.toLowerCase()+"-"+Math.random().toString(36).slice(2,7));
    const textDefaults={TITLE:"TITLE",SUBTITLE:"Subtitle",CLASSIFICATION:"CREATOR",SYSTEM_LABEL:"SYSTEM",DIAGNOSTIC_LABEL:"DIAGNOSTIC"};
    return {id,component,name:component.replaceAll("_"," "),text:textDefaults[component]||"",color:component==="CLASSIFICATION"?"CREATOR_GOLD":"GAMEINDEX_WHITE",layer:(state.definition?.tracks?.length||0)+1,properties:{},keyframes:[{time:0,easing:"GI_SOFT",opacity:0},{time:Math.min(600,state.definition?.durationMs||4200),easing:"GI_SOFT",opacity:1},{time:Math.max(700,(state.definition?.durationMs||4200)-500),easing:"GI_SOFT",opacity:1},{time:state.definition?.durationMs||4200,easing:"GI_SOFT",opacity:0}]};
  }
  async function api(url,options={}){return GV.api(url,{timeout:20000,...options});}

  async function boot(){
    try{
      const access=await api("/api/beta0986/access"),caps=new Set(access.access?.capabilities||[]);
      state.canPublish=caps.has("animation_publish");
      $("aePublish").hidden=!state.canPublish;
      [state.catalog,{entries:state.projects}]=await Promise.all([api("/api/animation-editor/catalog"),api("/api/animation-editor/projects?limit=200")]);
      renderLeft();
      if(state.projects.length)await openProject(state.projects[0].id);
      else openNewModal();
      setSaveState("Pronto","ready");
    }catch(error){setSaveState(error.message,"error");$("aeLeftScroll").innerHTML=`<div class="empty-state"><strong>Animation Editor indisponível.</strong><p>${esc(error.message)}</p></div>`;}
  }

  async function refreshProjects(){const d=await api("/api/animation-editor/projects?limit=200");state.projects=d.entries||[];renderLeft();}
  async function openProject(id){
    const d=await api("/api/animation-editor/projects/"+encodeURIComponent(id));
    state.details=d;state.definition=clone(d.current?.definition||{name:d.project.name,type:d.project.type,durationMs:d.project.durationMs,background:{mode:"GAMEINDEX_DARK"},tracks:[]});
    state.selectedTrackId=state.definition.tracks?.[0]?.id||null;state.selectedFrameIndex=null;state.undo=[];state.redo=[];state.dirty=false;state.playhead=0;
    setSaveState("Salvo","saved");renderAll();
  }
  async function saveProject({silent=false}={}){
    const p=currentProject();if(!p||!state.definition||state.saving||!state.dirty)return;
    state.saving=true;setSaveState("Salvando...","saving");
    try{
      const d=await api("/api/animation-editor/projects/"+encodeURIComponent(p.id),{method:"PUT",headers:{"content-type":"application/json"},body:JSON.stringify({definition:state.definition})});
      state.details=d;state.definition=clone(d.current?.definition||state.definition);state.dirty=false;setSaveState("Salvo","saved");await refreshProjects();if(!silent)renderAll();
    }catch(error){setSaveState("Erro ao salvar","error");if(!silent)alert(error.message);throw error;}finally{state.saving=false;}
  }
  async function validatePreviewAndPlay(){
    const p=currentProject();if(!p||!state.definition)return;
    try{
      const d=await api("/api/animation-editor/projects/"+encodeURIComponent(p.id)+"/preview",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({definition:state.definition})});
      renderRuntime(d.runtime||state.definition,state.playhead,true);
      $("aeProjectMeta").textContent=`${p.type} · PREVIEW · r${p.currentRevision}`;
    }catch(error){setSaveState(error.message,"error");}
  }
  async function publish(){
    if(!state.canPublish)return;
    const p=currentProject();if(!p)return;
    if(state.dirty)await saveProject();
    if(!confirm("Publicar a revisão atual? A revisão publicada ficará preservada no histórico."))return;
    try{
      setSaveState("Publicando...","saving");
      const d=await api("/api/animation-editor/projects/"+encodeURIComponent(p.id)+"/publish",{method:"POST",headers:{"content-type":"application/json"},body:"{}"});
      state.details=d;state.definition=clone(d.current?.definition||state.definition);state.dirty=false;setSaveState("Publicado · persistência solicitada","saved");await refreshProjects();renderAll();
    }catch(error){setSaveState(error.message,"error");}
  }
  async function duplicate(){
    const p=currentProject();if(!p)return;
    try{const d=await api("/api/animation-editor/projects/"+encodeURIComponent(p.id)+"/duplicate",{method:"POST",headers:{"content-type":"application/json"},body:"{}"});await refreshProjects();await openProject(d.project.id);}catch(error){setSaveState(error.message,"error");}
  }
  async function rollback(revision){
    const p=currentProject();if(!p||!state.canPublish)return;
    if(!confirm(`Tornar a revisão ${revision} a revisão publicada ativa deste projeto?`))return;
    try{const d=await api("/api/animation-editor/projects/"+encodeURIComponent(p.id)+"/rollback",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({revision})});state.details=d;setSaveState(`Rollback para r${revision} concluído`,"saved");await refreshProjects();renderAll();}catch(error){setSaveState(error.message,"error");}
  }

  function renderAll(){renderHeader();renderLeft();renderInspector();renderTimeline();renderRuntime(state.definition,state.playhead,false);}
  function renderHeader(){
    const p=currentProject();$("aeProjectTitle").textContent=p?.name||state.definition?.name||"Nenhum projeto";
    $("aeProjectMeta").textContent=p?`${p.type} · ${p.status} · r${p.currentRevision}`:"—";
    $("aeDurationInput").value=String(state.definition?.durationMs||4200);$("aeDurationLabel").textContent=((state.definition?.durationMs||0)/1000).toFixed(2);
    $("aeTimelineStatus").textContent=`${state.definition?.tracks?.length||0} tracks`;
    $("aeUndo").disabled=!state.undo.length;$("aeRedo").disabled=!state.redo.length;$("aeDuplicate").disabled=!p;$("aeSave").disabled=!p||!state.dirty;$("aePublish").disabled=!p;
  }
  function renderLeft(){
    const host=$("aeLeftScroll");if(!host)return;
    document.querySelectorAll("[data-left-tab]").forEach(b=>b.classList.toggle("active",b.dataset.leftTab===state.leftTab));
    if(state.leftTab==="projects"){
      host.innerHTML=(state.projects||[]).map(p=>`<button class="ae-project-card ${currentProject()?.id===p.id?"active":""}" data-project="${esc(p.id)}"><div><strong>${esc(p.name)}</strong><small>${esc(p.type)} · r${p.currentRevision}</small></div><span class="ae-status ${p.status.toLowerCase()}">${esc(p.status)}</span></button>`).join("")||'<div class="empty-state">Nenhum projeto.</div>';
      host.querySelectorAll("[data-project]").forEach(b=>b.onclick=()=>openProject(b.dataset.project).catch(e=>setSaveState(e.message,"error")));return;
    }
    if(state.leftTab==="library"){
      host.innerHTML='<div class="ae-section-label">Component Library</div><div class="ae-library-grid">'+COMPONENT_LIBRARY.map(([key,label,icon])=>`<button class="ae-library-item" data-add-component="${key}"><span>${icon}</span>${esc(label)}</button>`).join("")+'</div><div class="ae-section-label">Bases e presets</div><button class="ae-library-item" id="aeOpenBases"><span>＋</span>Abrir biblioteca</button>';
      host.querySelectorAll("[data-add-component]").forEach(b=>b.onclick=()=>addComponent(b.dataset.addComponent));$("aeOpenBases").onclick=openNewModal;return;
    }
    host.innerHTML=(state.definition?.tracks||[]).map(t=>`<button class="ae-layer ${state.selectedTrackId===t.id?"active":""}" data-track="${esc(t.id)}"><div><strong>${esc(t.name||t.component)}</strong><small>${esc(t.component)} · layer ${t.layer}</small></div><span style="color:${window.GameIndexAnimationRuntime?.resolveColor?.(t.color)||"#fff"}">◆</span></button>`).join("")||'<div class="empty-state">Adicione componentes pela aba Library.</div>';
    host.querySelectorAll("[data-track]").forEach(b=>b.onclick=()=>{state.selectedTrackId=b.dataset.track;state.selectedFrameIndex=null;renderAll();});
  }
  function addComponent(component){
    if(!state.definition)return;
    mutate(()=>{const t=defaultTrack(component);state.definition.tracks.push(t);state.selectedTrackId=t.id;state.selectedFrameIndex=0;});
  }
  function deleteTrack(){
    const t=currentTrack();if(!t||!confirm(`Excluir a layer "${t.name}"?`))return;
    mutate(()=>{state.definition.tracks=state.definition.tracks.filter(x=>x.id!==t.id);state.selectedTrackId=state.definition.tracks[0]?.id||null;state.selectedFrameIndex=null;});
  }

  function field(label,html){return `<div class="ae-field"><span>${label}</span>${html}</div>`;}
  function numInput(key,label,value,min,max,step=.01){return field(label,`<input data-track-number="${key}" type="number" value="${Number(value??0)}" min="${min}" max="${max}" step="${step}">`);}
  function renderInspector(){
    const host=$("aeInspector"),t=currentTrack(),f=currentFrame(),p=currentProject();if(!host)return;
    if(!t){
      const revisions=state.details?.revisions||[];
      host.innerHTML=`<h3>Project</h3>${field("Name",`<input id="aeProjectName" value="${esc(state.definition?.name||p?.name||"")}">`)}${field("Type",`<select id="aeProjectType"><option>CINEMATIC</option><option>UI_ANIMATION</option><option>DECORATION_ANIMATION</option></select>`)}<h3>Published history</h3><div class="admin-list">${revisions.map(r=>`<div class="admin-row"><div><strong>r${r.revision}</strong><small>${esc(r.status)} · ${esc(r.publishedAt||r.updatedAt||"")}</small></div>${r.status==="PUBLISHED"&&state.canPublish?`<button class="ae-mini-btn" data-rollback="${r.revision}">↶</button>`:""}</div>`).join("")||"<small>Nenhuma revisão.</small>"}</div>`;
      if($("aeProjectType"))$("aeProjectType").value=state.definition?.type||"CINEMATIC";
      $("aeProjectName")?.addEventListener("change",e=>mutate(()=>state.definition.name=e.target.value));
      $("aeProjectType")?.addEventListener("change",e=>mutate(()=>state.definition.type=e.target.value));
      host.querySelectorAll("[data-rollback]").forEach(b=>b.onclick=()=>rollback(Number(b.dataset.rollback)));$("aeInspectorType").textContent="PROJECT";return;
    }
    $("aeInspectorType").textContent=f?"KEYFRAME":t.component;
    const stateValues={x:0,y:0,rotation:0,scale:1,opacity:1,blur:0,glow:0,brightness:1,lineProgress:0,scanPosition:0,energy:0,clipProgress:0,...(t.properties||{}),...(f||{})};
    host.innerHTML=`
      <h3>Layer</h3>
      ${field("Name",`<input id="aeTrackName" value="${esc(t.name||t.component)}">`)}
      ${["TITLE","SUBTITLE","CLASSIFICATION","SYSTEM_LABEL","DIAGNOSTIC_LABEL"].includes(t.component)?field("Text",`<input id="aeTrackText" maxlength="180" value="${esc(t.text||"")}">`):""}
      ${field("Color",`<select id="aeTrackColor">${COLORS.map(c=>`<option value="${c}" ${t.color===c?"selected":""}>${c.replaceAll("_"," ")}</option>`).join("")}</select>`)}
      ${field("Layer order",`<input id="aeTrackLayer" type="number" min="-100" max="100" value="${Number(t.layer||0)}">`)}
      <h3>${f?"Selected keyframe":"Base transform"}</h3>
      ${f?field("Time (ms)",`<input id="aeFrameTime" type="number" min="0" max="${state.definition.durationMs}" step="50" value="${f.time}">`):""}
      ${f?field("Easing",`<select id="aeFrameEasing">${(state.catalog?.schema?.easings||["GI_SOFT"]).map(e=>`<option value="${e}" ${f.easing===e?"selected":""}>${e}</option>`).join("")}</select>`):""}
      <div class="ae-field-row">${numInput("x","X %",stateValues.x,-200,200,1)}${numInput("y","Y %",stateValues.y,-200,200,1)}</div>
      <div class="ae-field-row">${numInput("scale","Scale",stateValues.scale,.05,5,.05)}${numInput("rotation","Rotation",stateValues.rotation,-720,720,1)}</div>
      <div class="ae-field-row">${numInput("opacity","Opacity",stateValues.opacity,0,1,.05)}${numInput("glow","Glow",stateValues.glow,0,2,.05)}</div>
      <div class="ae-field-row">${numInput("blur","Blur",stateValues.blur,0,80,1)}${numInput("brightness","Brightness",stateValues.brightness,0,3,.05)}</div>
      <div class="ae-field-row">${numInput("lineProgress","Line progress",stateValues.lineProgress,0,1,.05)}${numInput("energy","Energy",stateValues.energy,0,1,.05)}</div>
      <button id="aeDeleteTrack" class="button ghost-button ae-danger" type="button">Excluir layer</button>`;
    $("aeTrackName").onchange=e=>mutate(()=>t.name=e.target.value);
    if($("aeTrackText"))$("aeTrackText").onchange=e=>mutate(()=>t.text=e.target.value);
    $("aeTrackColor").onchange=e=>mutate(()=>t.color=e.target.value);$("aeTrackLayer").onchange=e=>mutate(()=>t.layer=Number(e.target.value));
    if($("aeFrameTime"))$("aeFrameTime").onchange=e=>mutate(()=>{f.time=Math.max(0,Math.min(state.definition.durationMs,Number(e.target.value)||0));t.keyframes.sort((a,b)=>a.time-b.time);state.selectedFrameIndex=t.keyframes.indexOf(f);});
    if($("aeFrameEasing"))$("aeFrameEasing").onchange=e=>mutate(()=>f.easing=e.target.value);
    host.querySelectorAll("[data-track-number]").forEach(input=>input.onchange=e=>{const key=e.target.dataset.trackNumber,value=Number(e.target.value);mutate(()=>{if(f)f[key]=value;else{t.properties=t.properties||{};t.properties[key]=value;}});});
    $("aeDeleteTrack").onclick=deleteTrack;
  }

  function timelineGeometry(){const duration=state.definition?.durationMs||4200,content=Math.max(760,duration*.18*state.zoom);return {duration,content};}
  function renderTimeline(){
    const host=$("aeTimeline");if(!host)return;if(!state.definition){host.innerHTML="";return;}
    const {duration,content}=timelineGeometry(),seconds=Math.ceil(duration/1000);
    let ruler=`<div class="ae-time-ruler" style="width:${content}px">`;for(let i=0;i<=seconds;i++)ruler+=`<span class="ae-ruler-label" style="left:${(i*1000/duration)*100}%">${i}s</span>`;ruler+="</div>";
    const rows=(state.definition.tracks||[]).map(t=>`<div class="ae-track-row"><div class="ae-track-label">${esc(t.name||t.component)}</div><div class="ae-track-canvas" data-track-canvas="${esc(t.id)}" style="width:${content}px">${(t.keyframes||[]).map((f,i)=>`<button class="ae-keyframe ${state.selectedTrackId===t.id&&state.selectedFrameIndex===i?"selected":""}" data-kf-track="${esc(t.id)}" data-kf-index="${i}" title="${f.time}ms" style="left:${(f.time/duration)*100}%"></button>`).join("")}</div></div>`).join("");
    const left=150+(state.playhead/duration)*content;host.style.width=`${150+content}px`;host.innerHTML=ruler+rows+`<div class="ae-playhead" style="left:${left}px"></div>`;
    host.querySelectorAll("[data-track-canvas]").forEach(canvas=>canvas.addEventListener("click",e=>{if(e.target.closest(".ae-keyframe"))return;const rect=canvas.getBoundingClientRect();state.playhead=Math.round(Math.max(0,Math.min(1,(e.clientX-rect.left)/rect.width))*duration/50)*50;seekPreview();renderTimeline();}));
    host.querySelectorAll(".ae-keyframe").forEach(marker=>bindKeyframeDrag(marker));
  }
  function bindKeyframeDrag(marker){
    marker.onpointerdown=e=>{
      e.preventDefault();const id=marker.dataset.kfTrack,index=Number(marker.dataset.kfIndex),t=state.definition.tracks.find(x=>x.id===id),frame=t?.keyframes?.[index];if(!frame)return;
      state.selectedTrackId=id;state.selectedFrameIndex=index;pushHistory();marker.setPointerCapture(e.pointerId);const canvas=marker.parentElement,rect=canvas.getBoundingClientRect(),duration=state.definition.durationMs;
      const move=ev=>{const ratio=Math.max(0,Math.min(1,(ev.clientX-rect.left)/rect.width));frame.time=Math.round(ratio*duration/50)*50;state.playhead=frame.time;state.dirty=true;renderInspector();seekPreview();marker.style.left=`${frame.time/duration*100}%`;};
      const up=()=>{marker.removeEventListener("pointermove",move);marker.removeEventListener("pointerup",up);t.keyframes.sort((a,b)=>a.time-b.time);state.selectedFrameIndex=t.keyframes.indexOf(frame);markDirty();renderAll();};
      marker.addEventListener("pointermove",move);marker.addEventListener("pointerup",up);
    };
  }
  function addKeyframe(){
    const t=currentTrack();if(!t)return;
    mutate(()=>{const nearest=t.keyframes?.reduce((a,b)=>Math.abs(b.time-state.playhead)<Math.abs(a.time-state.playhead)?b:a,t.keyframes[0]||{opacity:1})||{opacity:1};const next={...clone(nearest),time:Math.round(state.playhead/50)*50};delete next.id;t.keyframes.push(next);t.keyframes.sort((a,b)=>a.time-b.time);state.selectedFrameIndex=t.keyframes.indexOf(next);});
  }
  function deleteKeyframe(){
    const t=currentTrack();if(!t||state.selectedFrameIndex===null||t.keyframes.length<=1)return;
    mutate(()=>{t.keyframes.splice(state.selectedFrameIndex,1);state.selectedFrameIndex=null;});
  }
  function seekPreview(){if(state.controller)state.controller.seek(state.playhead);$("aeCurrentTime").textContent=(state.playhead/1000).toFixed(2);}

  function renderRuntime(definition,time=0,play=false){
    const host=$("aePreviewShell");if(!host||!definition)return;
    const old=state.controller?.getState?.();state.controller?.destroy?.();state.controller=window.GameIndexAnimationRuntime?.create(host,definition)||null;
    if(!state.controller)return;
    state.controller.setLoop(Boolean($("aeLoop")?.checked));state.controller.onState(s=>{state.playhead=s.time;$("aeCurrentTime").textContent=(s.time/1000).toFixed(2);if(s.playing)requestAnimationFrame(()=>renderPlayheadOnly());});
    state.controller.seek(Math.min(time,definition.durationMs));if(play)state.controller.play(time);else if(old?.playing)state.controller.play(Math.min(time,definition.durationMs));
  }
  function renderPlayheadOnly(){const ph=$("aeTimeline")?.querySelector(".ae-playhead");if(!ph||!state.definition)return;const {duration,content}=timelineGeometry();ph.style.left=`${150+(state.playhead/duration)*content}px`;if(state.controller?.getState().playing)requestAnimationFrame(renderPlayheadOnly);}

  function openModal(title,html){$("aeModalTitle").textContent=title;$("aeModalBody").innerHTML=html;$("aeModal").hidden=false;}
  function closeModal(){$("aeModal").hidden=true;}
  function openNewModal(){
    const presets=state.catalog?.presets||[],existing=state.catalog?.existing||[];
    openModal("Criar / usar como base",`
      <div class="ae-field"><span>Nova animação</span><input id="aeNewName" value="Nova animação"></div>
      <div class="ae-field"><span>Tipo</span><select id="aeNewType"><option>CINEMATIC</option><option>UI_ANIMATION</option><option>DECORATION_ANIMATION</option></select></div>
      <button id="aeCreateBlank" class="button primary-button">Criar em branco</button>
      <div class="ae-section-label">Presets recomendados</div><div class="ae-modal-list">${presets.map(p=>`<button class="ae-preset-item" data-preset="${esc(p.key)}"><div><strong>${esc(p.name)}</strong><small>${esc(p.category)}</small></div><span>Duplicar</span></button>`).join("")}</div>
      <div class="ae-section-label">Animações existentes como base</div><div class="ae-modal-list">${existing.map(x=>`<button class="ae-existing-item" data-existing="${esc(x.key)}"><div><strong>${esc(x.name)}</strong><small>Referência legada · ${esc(x.fidelity||"")}</small></div><span>Duplicar</span></button>`).join("")}</div>`);
    $("aeCreateBlank").onclick=async()=>{try{const d=await api("/api/animation-editor/projects",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({name:$("aeNewName").value,type:$("aeNewType").value,durationMs:4200})});closeModal();await refreshProjects();await openProject(d.project.id);}catch(e){setSaveState(e.message,"error");}};
    $("aeModalBody").querySelectorAll("[data-preset]").forEach(b=>b.onclick=async()=>{try{const d=await api("/api/animation-editor/from-preset/"+encodeURIComponent(b.dataset.preset),{method:"POST",headers:{"content-type":"application/json"},body:"{}"});closeModal();await refreshProjects();await openProject(d.project.id);}catch(e){setSaveState(e.message,"error");}});
    $("aeModalBody").querySelectorAll("[data-existing]").forEach(b=>b.onclick=async()=>{try{const d=await api("/api/animation-editor/import/"+encodeURIComponent(b.dataset.existing),{method:"POST",headers:{"content-type":"application/json"},body:"{}"});closeModal();await refreshProjects();await openProject(d.project.id);}catch(e){setSaveState(e.message,"error");}});
  }

  function bind(){
    document.querySelectorAll("[data-left-tab]").forEach(b=>b.onclick=()=>{state.leftTab=b.dataset.leftTab;renderLeft();});
    $("aeNewProject").onclick=openNewModal;$("aeModalClose").onclick=closeModal;$("aeModal").addEventListener("click",e=>{if(e.target===$("aeModal"))closeModal();});
    $("aeSave").onclick=()=>saveProject().catch(()=>{});$("aePublish").onclick=()=>publish();$("aeDuplicate").onclick=duplicate;$("aeUndo").onclick=undo;$("aeRedo").onclick=redo;
    $("aePlay").onclick=validatePreviewAndPlay;$("aePause").onclick=()=>state.controller?.pause();$("aeRestart").onclick=()=>{state.playhead=0;state.controller?.restart();renderTimeline();};$("aeLoop").onchange=e=>state.controller?.setLoop(e.target.checked);
    $("aeDurationInput").onchange=e=>{const value=Math.max(250,Math.min(30000,Number(e.target.value)||4200));mutate(()=>{state.definition.durationMs=value;for(const t of state.definition.tracks||[])for(const f of t.keyframes||[])f.time=Math.min(f.time,value);});};
    $("aeTimelineZoom").onchange=e=>{state.zoom=Number(e.target.value)||1;renderTimeline();};$("aeAddKeyframe").onclick=addKeyframe;$("aeDeleteKeyframe").onclick=deleteKeyframe;
    document.querySelectorAll("[data-mobile-panel]").forEach(b=>b.onclick=()=>{let target=b.dataset.mobilePanel;if(target==="library"){target="left";state.leftTab="library";renderLeft();}document.querySelectorAll("[data-mobile-panel]").forEach(x=>x.classList.toggle("active",x===b));document.querySelectorAll("[data-mobile-id]").forEach(x=>x.classList.toggle("mobile-active",x.dataset.mobileId===target));});
    addEventListener("keydown",e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="s"){e.preventDefault();saveProject().catch(()=>{});}if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="z"){e.preventDefault();e.shiftKey?redo():undo();}});
    addEventListener("beforeunload",e=>{if(state.dirty){e.preventDefault();e.returnValue="";}});
  }
  document.addEventListener("DOMContentLoaded",()=>{bind();boot();});
})();