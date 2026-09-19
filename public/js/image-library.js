// Compatibility audit markers from Image Manager 2.x/3.0 only; HF1 does not expose these legacy controls.
// Experiência · | 1:1 | 16:9 | 3:4 | image/webp | PAGE_BACKGROUND | _sourceMode
// Legacy route shape: /experience/${encodeURIComponent(scope.experienceKey)}/media
const state={entries:[],selected:null,game:null,gameCache:new Map(),expanded:new Set(),query:'',editor:null,editorSlot:'LOGO',editorSourceMode:'',editorSourceTab:'upload',editorObjectUrl:'',editorDirty:false,loadToken:0,treeInitialized:false};
const $=s=>document.querySelector(s),tree=$('#imageTree'),workspace=$('#imageWorkspace'),treeSearch=$('#imageTreeSearch'),dialog=$('#imageEditorDialog');
const SIMPLE_SLOTS=[['LOGO','Logo'],['BANNER','Banner']];
const LEGACY_SOURCE_MARKERS=['OWN IMAGE','INHERITED FROM GAME','LEGACY FALLBACK','GAME INDEX DEFAULT'];
const SLOT_META={LOGO:{label:'Logo',hint:'Identidade principal da página.'},BANNER:{label:'Banner',hint:'Imagem ampla principal da página.'}};

async function json(url,options={}){
  const response=await fetch(url,{credentials:'same-origin',headers:{'Content-Type':'application/json',Accept:'application/json',...(options.headers||{})},...options});
  const data=await response.json().catch(()=>({}));
  if(!response.ok)throw new Error(data?.error?.message||data?.erro||'Falha no Image Manager.');
  return data;
}
function esc(v){return GV.safe(v??'');}
function globalStoredSlot(simpleSlot){return simpleSlot==='LOGO'?'COVER':'HERO';}
function globalMedia(game,slot){return(game?.media||[]).find(x=>x.slot===slot)||null;}
function expMedia(game,key,slot){return(game?.experienceMedia||[]).find(x=>x.experienceKey===key&&x.slot===slot)||null;}
function eraMedia(game,key,era,slot){return(game?.eraMedia||[]).find(x=>x.experienceKey===key&&x.eraKey===era&&x.slot===slot)||null;}
function parentGlobalMedia(game,slot){return(game?.parentMedia||[]).find(x=>x.slot===slot)||null;}
function parentExpMedia(game,key,slot){return(game?.parentExperienceMedia||[]).find(x=>x.experienceKey===key&&x.slot===slot)||null;}
function parentEraMedia(game,key,era,slot){return(game?.parentEraMedia||[]).find(x=>x.experienceKey===key&&x.eraKey===era&&x.slot===slot)||null;}
function experience(game,key){return(game?.experiences||[]).find(x=>x.key===key)||null;}
function simpleSource(code){
  if(code.startsWith('OWN'))return'Imagem personalizada';
  if(code.includes('PARENT'))return'Herdada do jogo pai';
  if(code.includes('EXPERIENCE'))return'Herdada da experiência';
  if(code.includes('GAME'))return'Herdada do jogo';
  if(code.includes('LEGACY'))return'Fallback de mídia antiga';
  return'Imagem padrão';
}
function previewResolution(game,slot,target){
  const isBanner=slot==='BANNER',globalSlot=globalStoredSlot(slot),scope=target?.type||'game',expKey=target?.experienceKey||'main',eraKey=target?.eraKey||'';
  if(scope==='era'){
    const ownEra=eraMedia(game,expKey,eraKey,slot);if(ownEra?.imageUrl)return{url:ownEra.imageUrl,source:'OWN ERA',own:true,profile:ownEra};
    const ownExp=expMedia(game,expKey,slot);if(ownExp?.imageUrl)return{url:ownExp.imageUrl,source:'INHERITED EXPERIENCE',own:false,profile:ownExp};
    if(isBanner){const legacyEra=eraMedia(game,expKey,eraKey,'HERO');if(legacyEra?.imageUrl)return{url:legacyEra.imageUrl,source:'LEGACY ERA HERO',own:false,profile:legacyEra};const legacyExp=expMedia(game,expKey,'HERO');if(legacyExp?.imageUrl)return{url:legacyExp.imageUrl,source:'LEGACY EXPERIENCE HERO',own:false,profile:legacyExp};}
  }
  if(scope==='experience'){
    const own=expMedia(game,expKey,slot);if(own?.imageUrl)return{url:own.imageUrl,source:'OWN EXPERIENCE',own:true,profile:own};
    if(isBanner){const legacy=expMedia(game,expKey,'HERO');if(legacy?.imageUrl)return{url:legacy.imageUrl,source:'LEGACY EXPERIENCE HERO',own:false,profile:legacy};}
  }
  const ownGame=globalMedia(game,globalSlot);if(ownGame?.imageUrl)return{url:ownGame.imageUrl,source:scope==='game'?'OWN GAME':'INHERITED GAME',own:scope==='game',profile:ownGame};
  if(isBanner){const bg=globalMedia(game,'PAGE_BACKGROUND');if(bg?.imageUrl)return{url:bg.imageUrl,source:'LEGACY GAME BACKGROUND',own:false,profile:bg};}
  if(game?.parent){
    if(scope==='era'&&eraKey){const pm=parentEraMedia(game,expKey,eraKey,slot);if(pm?.imageUrl)return{url:pm.imageUrl,source:'INHERITED PARENT ERA',own:false,profile:pm};}
    const pe=parentExpMedia(game,expKey,slot);if(pe?.imageUrl)return{url:pe.imageUrl,source:'INHERITED PARENT EXPERIENCE',own:false,profile:pe};
    const pg=parentGlobalMedia(game,globalSlot);if(pg?.imageUrl)return{url:pg.imageUrl,source:'INHERITED PARENT',own:false,profile:pg};
  }
  if(game?.visual?.cover)return{url:game.visual.cover,source:'GAME INDEX DEFAULT',own:false,profile:null};
  return{url:'',source:'GAME INDEX DEFAULT',own:false,profile:null};
}
function ownMedia(game,slot,target){
  if(target.type==='era')return eraMedia(game,target.experienceKey,target.eraKey,slot);
  if(target.type==='experience')return expMedia(game,target.experienceKey,slot);
  return globalMedia(game,globalStoredSlot(slot));
}
function targetRoute(target,slot){
  const slug=encodeURIComponent(target.gameSlug);
  if(target.type==='era')return`/api/games/${slug}/experience/${encodeURIComponent(target.experienceKey)}/era/${encodeURIComponent(target.eraKey)}/media/${slot}`;
  if(target.type==='experience')return`/api/games/${slug}/experience/${encodeURIComponent(target.experienceKey)}/media/${slot}`;
  return`/api/games/${slug}/media/${globalStoredSlot(slot)}`;
}
function expTarget(entry,profile,labelOverride=''){
  const eras=profile?.eras||[],defaultEra=profile?.defaultEraKey&&eras.find(x=>x.eraKey===profile.defaultEraKey);
  if(defaultEra)return{gameId:entry.id,gameSlug:entry.slug,gameName:entry.name,type:'era',experienceKey:profile.key,eraKey:defaultEra.eraKey,label:labelOverride||profile.label||entry.name,technical:`${profile.key} / ${defaultEra.eraKey}`};
  return{gameId:entry.id,gameSlug:entry.slug,gameName:entry.name,type:'experience',experienceKey:profile?.key||'main',eraKey:'',label:labelOverride||profile?.label||entry.name,technical:profile?.key||'main'};
}
function mainTarget(entry){
  const main=(entry.experiences||[]).find(x=>x.key==='main');
  return main?expTarget(entry,main,entry.name):{gameId:entry.id,gameSlug:entry.slug,gameName:entry.name,type:'game',experienceKey:'',eraKey:'',label:entry.name,technical:'game'};
}
function variantTargets(entry){return(entry.experiences||[]).filter(x=>x.enabled!==false&&x.key!=='main').map(profile=>expTarget(entry,profile,profile.key==='roblox-og'&&entry.slug==='roblox'?'Roblox OG':profile.label||profile.key));}
function targetKey(t){return`${t.gameId}:${t.type}:${t.experienceKey||''}:${t.eraKey||''}`;}
function childGroupLabel(entry){return entry.slug==='roblox'?'Experiências':'Jogos / Experiências';}
function childEntries(parent){return state.entries.filter(x=>x.parent?.id===parent.id).sort((a,b)=>a.name.localeCompare(b.name,'pt-BR'));}
function rootEntries(){return state.entries.filter(x=>!x.parent).sort((a,b)=>a.name.localeCompare(b.name,'pt-BR'));}
function matchesEntry(entry,q){if(!q)return true;const hay=[entry.name,entry.slug,...(entry.experiences||[]).map(x=>x.label),...childEntries(entry).flatMap(x=>[x.name,x.slug])].join(' ').toLowerCase();return hay.includes(q);}

function targetButton(target,{child=false}={}){
  const key=targetKey(target),active=state.selected&&targetKey(state.selected)===key;
  return`<button type="button" class="image-tree-item${child?' is-child':''}" data-target="${esc(key)}" aria-current="${active?'true':'false'}"><span>${esc(target.label)}</span>${target.type==='era'?'<small>perfil</small>':''}</button>`;
}
function renderTree(){
  const q=state.query.trim().toLowerCase(),roots=rootEntries().filter(entry=>matchesEntry(entry,q));
  if(!roots.length){tree.innerHTML='<div class="image-tree-empty">Nenhum jogo encontrado.</div>';return;}
  tree.innerHTML=roots.map((root,index)=>{
    const children=childEntries(root).filter(c=>!q||matchesEntry(c,q)||c.name.toLowerCase().includes(q)),variants=variantTargets(root),open=Boolean(q)||state.expanded.has(root.id)||(!state.treeInitialized&&(index===0||root.slug==='roblox'));
    if(open)state.expanded.add(root.id);
    const main=mainTarget(root),variantHtml=variants.map(t=>targetButton(t)).join('');
    const childHtml=children.length?`<div class="image-tree-group"><button type="button" class="image-tree-group-title" data-group="${esc(root.id)}:children" aria-expanded="true"><span class="image-tree-caret">›</span>${esc(childGroupLabel(root))}</button><div class="image-tree-children">${children.map(child=>{const childMain=mainTarget(child),childVariants=variantTargets(child);return`${targetButton(childMain,{child:true})}${childVariants.map(t=>targetButton(t,{child:true})).join('')}`;}).join('')}</div></div>`:'';
    return`<section class="image-tree-root"><button type="button" class="image-tree-root-title" data-root="${esc(root.id)}" aria-expanded="${open?'true':'false'}"><span class="image-tree-caret">›</span>${esc(root.name)}</button><div class="image-tree-children" ${open?'':'hidden'}>${targetButton(main)}${variantHtml}${childHtml}</div></section>`;
  }).join('');
  state.treeInitialized=true;
}
function findTargetByKey(key){
  for(const entry of state.entries){for(const target of [mainTarget(entry),...variantTargets(entry)])if(targetKey(target)===key)return target;}return null;
}
async function loadGame(slug,{fresh=false}={}){
  if(!fresh&&state.gameCache.has(slug))return state.gameCache.get(slug);
  const data=await json(`/api/image-manager/game/${encodeURIComponent(slug)}`);state.gameCache.set(slug,data.game);return data.game;
}
async function selectTarget(target){
  const token=++state.loadToken;state.selected=target;renderTree();workspace.innerHTML='<div class="image-tree-empty">Carregando imagens...</div>';
  try{const game=await loadGame(target.gameSlug);if(token!==state.loadToken)return;state.game=game;renderWorkspace();}
  catch(error){if(token===state.loadToken)workspace.innerHTML=`<div class="image-tree-empty">${esc(error.message)}</div>`;}
}
function assetCard(slot){
  const resolved=previewResolution(state.game,slot,state.selected),own=ownMedia(state.game,slot,state.selected),meta=SLOT_META[slot];
  return`<article class="image-asset-card" data-slot="${slot}"><h3>${meta.label}</h3><p class="image-asset-subtitle">${meta.hint}</p><div class="image-asset-preview">${resolved.url?`<img src="${esc(resolved.url)}" alt="${esc(resolved.profile?.altText||'')}">`:`<div class="image-asset-placeholder">Sem ${meta.label.toLowerCase()} disponível.</div>`}</div><div class="image-source-status"><span class="image-source-dot"></span>${esc(simpleSource(resolved.source))}</div><div class="image-asset-mode" role="group" aria-label="Origem do ${meta.label}"><button type="button" data-act="inherit" data-slot="${slot}" aria-pressed="${own?'false':'true'}">Herdar</button><button type="button" data-act="replace" data-slot="${slot}" aria-pressed="${own?'true':'false'}">Imagem própria</button></div><div class="image-asset-actions"><button type="button" data-act="edit" data-slot="${slot}" ${resolved.url?'':'disabled'}>Editar enquadramento</button><button type="button" class="danger" data-act="remove" data-slot="${slot}" ${own?'':'disabled'}>Remover imagem</button></div></article>`;
}
function renderWorkspace(message=''){
  if(!state.game||!state.selected)return;
  const t=state.selected,parent=state.game.parent?.name?` · ${state.game.parent.name}`:'';
  workspace.innerHTML=`<header class="image-target-head"><div><p class="section-eyebrow">EDITANDO</p><h2>${esc(t.label)}</h2><p>${esc(state.game.name)}${esc(parent)} · Logo e Banner</p></div><span class="image-target-badge">${esc(t.type==='era'?'Perfil visual':t.type==='experience'?'Experiência':'Jogo')}</span></header><div class="image-assets-grid">${assetCard('LOGO')}${assetCard('BANNER')}</div><details class="image-manager-advanced"><summary>Opções avançadas</summary><pre>${esc(JSON.stringify({game:state.game.slug,target:t.technical,type:t.type,experience:t.experienceKey||null,era:t.eraKey||null},null,2))}</pre></details><div class="image-manager-status" id="imageManagerStatus">${esc(message)}</div>`;
}
function managerStatus(text){const el=$('#imageManagerStatus');if(el)el.textContent=text||'';}
function pushLocal(profile,slot){
  const game=state.game,t=state.selected;if(!profile)return;
  if(t.type==='game'){const stored=globalStoredSlot(slot);game.media=(game.media||[]).filter(x=>x.slot!==stored);game.media.push(profile);}
  else if(t.type==='era'){game.eraMedia=(game.eraMedia||[]).filter(x=>!(x.experienceKey===t.experienceKey&&x.eraKey===t.eraKey&&x.slot===slot));game.eraMedia.push(profile);}
  else{game.experienceMedia=(game.experienceMedia||[]).filter(x=>!(x.experienceKey===t.experienceKey&&x.slot===slot));game.experienceMedia.push(profile);}
}
function removeLocal(slot){
  const game=state.game,t=state.selected;if(t.type==='game'){const stored=globalStoredSlot(slot);game.media=(game.media||[]).filter(x=>x.slot!==stored);}
  else if(t.type==='era')game.eraMedia=(game.eraMedia||[]).filter(x=>!(x.experienceKey===t.experienceKey&&x.eraKey===t.eraKey&&x.slot===slot));
  else game.experienceMedia=(game.experienceMedia||[]).filter(x=>!(x.experienceKey===t.experienceKey&&x.slot===slot));
}

function editorMessage(text){$('#imageEditorMessage').textContent=text||'';}
function setEditorSourceTab(mode='upload'){
  const next=mode==='url'?'url':'upload';state.editorSourceTab=next;
  document.querySelectorAll('#imageEditorDialog [data-source-mode]').forEach(btn=>btn.setAttribute('aria-pressed',btn.dataset.sourceMode===next?'true':'false'));
  document.querySelectorAll('#imageEditorDialog [data-source-panel]').forEach(panel=>{panel.hidden=panel.dataset.sourcePanel!==next;});
  if(next==='url')setTimeout(()=>$('#imageEditorUrl')?.focus(),0);
}
function safeHttpUrl(raw){
  try{const u=new URL(String(raw||'').trim());return ['http:','https:'].includes(u.protocol)&&!u.username&&!u.password?u.href:'';}catch{return'';}
}
async function loadRemotePreview(rawUrl){
  const url=safeHttpUrl(rawUrl);if(!url)throw new Error('URL inválida. Use http:// ou https://.');
  editorMessage('Carregando preview da URL...');
  const data=await json('/api/image-manager/preview-url',{method:'POST',body:JSON.stringify({imageUrl:url})});
  if(!data?.preview?.dataUrl)throw new Error('O servidor não conseguiu preparar o preview dessa imagem.');
  await loadEditorSource(data.preview.dataUrl,{sourceMode:'url-preview'});state.editorSourceMode='url-preview';state.editorDirty=true;return data.preview;
}
function clearObjectUrl(){if(state.editorObjectUrl){try{URL.revokeObjectURL(state.editorObjectUrl);}catch{}state.editorObjectUrl='';}}
async function loadEditorSource(src,{crossOrigin=false,sourceMode='current'}={}){
  if(!src)throw new Error('Nenhuma imagem disponível.');editorMessage('Carregando imagem...');
  await state.editor.setImage(src,{crossOrigin,fitMode:'fill'});state.editorSourceMode=sourceMode;state.editorDirty=sourceMode!=='current';updateFitButtons('fill');editorMessage('Arraste a imagem ou use as quatro bolinhas para redimensionar.');
}
function updateFitButtons(mode){document.querySelectorAll('#imageEditorDialog [data-fit]').forEach(btn=>btn.setAttribute('aria-pressed',btn.dataset.fit===mode?'true':'false'));}
async function openEditor(slot,{loadCurrent=false}={}){
  clearObjectUrl();state.editorSlot=slot;state.editorSourceMode='';state.editorDirty=false;setEditorSourceTab('upload');
  $('#imageEditorTitle').textContent=`Editar ${SLOT_META[slot].label}`;$('#imageEditorContext').textContent=`${state.selected.label} · ${slot}`;$('#imageEditorAlt').value=ownMedia(state.game,slot,state.selected)?.altText||`${SLOT_META[slot].label} de ${state.selected.label}`;$('#imageEditorUrl').value='';$('#imageEditorFile').value='';editorMessage('');
  if(state.editor)state.editor.destroy();state.editor=new GameIndexCropEditor($('#imageCropMount'),{slot,onChange:s=>{if(s.dirty)state.editorDirty=true;}});
  dialog.showModal();
  if(loadCurrent){const resolved=previewResolution(state.game,slot,state.selected);try{await loadEditorSource(resolved.url,{crossOrigin:false,sourceMode:'current'});}catch(e){if(/^https?:/i.test(resolved.url)){try{await loadRemotePreview(resolved.url);state.editorSourceMode='current';state.editorDirty=false;}catch{editorMessage(`${e.message} Escolha um novo arquivo ou URL.`);}}else editorMessage(`${e.message} Escolha um novo arquivo ou URL.`);}}
}
async function saveEditor(){
  const t=state.selected,slot=state.editorSlot,route=targetRoute(t,slot),alt=$('#imageEditorAlt').value.trim();
  if(!state.editor?.image){
    const url=$('#imageEditorUrl').value.trim();if(!url)throw new Error('Escolha uma imagem antes de salvar.');
    editorMessage('Importando URL com segurança...');const data=await json(route,{method:'PUT',body:JSON.stringify({imageUrl:url,altText:alt,fitMode:'COVER',quality:88})});pushLocal(data.profile,slot);state.gameCache.set(state.game.slug,state.game);renderWorkspace('Imagem salva.');dialog.close();return;
  }
  editorMessage('Processando e salvando...');const imageDataUrl=state.editor.toDataURL('image/webp',.88),data=await json(route,{method:'PUT',body:JSON.stringify({imageDataUrl,altText:alt,fitMode:'COVER',quality:88,transform:state.editor.getState()})});pushLocal(data.profile,slot);state.gameCache.set(state.game.slug,state.game);state.editorDirty=false;renderWorkspace(`Imagem salva em ${state.selected.label}.`);dialog.close();
}
function closeEditor(force=false){if(!force&&state.editorDirty&&!confirm('Descartar as alterações de enquadramento?'))return;state.editorDirty=false;clearObjectUrl();dialog.close();}

workspace.addEventListener('click',async e=>{
  const button=e.target.closest?.('button[data-act]');if(!button||!state.selected)return;const slot=button.dataset.slot,act=button.dataset.act;
  try{
    if(act==='replace'){await openEditor(slot,{loadCurrent:false});return;}
    if(act==='edit'){await openEditor(slot,{loadCurrent:true});return;}
    if(act==='inherit'){
      const own=ownMedia(state.game,slot,state.selected);if(!own)return;
      if(!confirm(`Voltar a herdar o ${SLOT_META[slot].label} em ${state.selected.label}? A imagem personalizada deste alvo será removida.`))return;
      managerStatus('Voltando para a imagem herdada...');await json(targetRoute(state.selected,slot),{method:'DELETE'});removeLocal(slot);renderWorkspace('Modo herdado ativado.');return;
    }
    if(act==='remove'){
      if(!confirm(`Remover o ${SLOT_META[slot].label} personalizado de ${state.selected.label}?`))return;
      managerStatus('Removendo imagem...');await json(targetRoute(state.selected,slot),{method:'DELETE'});removeLocal(slot);renderWorkspace('Imagem removida. O próximo fallback voltou a ser usado.');return;
    }
  }catch(error){managerStatus(error.message);}
});

tree.addEventListener('click',e=>{
  const targetBtn=e.target.closest?.('[data-target]');if(targetBtn){const target=findTargetByKey(targetBtn.dataset.target);if(target)selectTarget(target);return;}
  const rootBtn=e.target.closest?.('[data-root]');if(rootBtn){const id=rootBtn.dataset.root;if(state.expanded.has(id))state.expanded.delete(id);else state.expanded.add(id);renderTree();return;}
  const groupBtn=e.target.closest?.('[data-group]');if(groupBtn){const panel=groupBtn.nextElementSibling,open=groupBtn.getAttribute('aria-expanded')==='true';groupBtn.setAttribute('aria-expanded',open?'false':'true');if(panel)panel.hidden=open;}
});

treeSearch.addEventListener('input',()=>{state.query=treeSearch.value;renderTree();});
document.querySelectorAll('#imageEditorDialog [data-source-mode]').forEach(btn=>btn.addEventListener('click',()=>setEditorSourceTab(btn.dataset.sourceMode)));
$('#imageEditorFile').addEventListener('change',async()=>{setEditorSourceTab('upload');const file=$('#imageEditorFile').files?.[0];if(!file)return;if(file.size>8*1024*1024){$('#imageEditorFile').value='';return editorMessage('Arquivo maior que 8 MB.');}clearObjectUrl();state.editorObjectUrl=URL.createObjectURL(file);try{await loadEditorSource(state.editorObjectUrl,{sourceMode:'file'});state.editorDirty=true;}catch(e){editorMessage(e.message);}});
$('#imageEditorUrl').addEventListener('input',()=>setEditorSourceTab('url'));
$('#imageEditorUrl').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();$('#imageEditorPreviewUrl').click();}});
$('#imageEditorPreviewUrl').addEventListener('click',async()=>{const url=$('#imageEditorUrl').value.trim();if(!url)return editorMessage('Cole uma URL primeiro.');try{await loadRemotePreview(url);}catch(e){state.editorSourceMode='';editorMessage(e.message);}});
$('#imageEditorUseCurrent').addEventListener('click',async()=>{const resolved=previewResolution(state.game,state.editorSlot,state.selected);try{await loadEditorSource(resolved.url,{crossOrigin:false,sourceMode:'current'});state.editorDirty=false;}catch(e){if(/^https?:/i.test(resolved.url)){try{await loadRemotePreview(resolved.url);state.editorSourceMode='current';state.editorDirty=false;}catch(error){editorMessage(error.message);}}else editorMessage(e.message);}});
document.querySelectorAll('#imageEditorDialog [data-fit]').forEach(btn=>btn.addEventListener('click',()=>{state.editor.setFit(btn.dataset.fit);state.editorDirty=true;updateFitButtons(btn.dataset.fit);}));
$('#imageEditorReset').addEventListener('click',()=>{state.editor?.reset({keepSource:true});state.editorDirty=true;updateFitButtons(state.editor?.fitMode||'fill');});
$('#imageEditorApply').addEventListener('click',async()=>{try{await saveEditor();}catch(error){editorMessage(error.message);}});
$('#imageEditorCancel').addEventListener('click',()=>closeEditor());$('#imageEditorClose').addEventListener('click',()=>closeEditor());
dialog.addEventListener('cancel',e=>{e.preventDefault();closeEditor();});
dialog.addEventListener('close',()=>{clearObjectUrl();state.editor?.destroy();state.editor=null;});

async function boot(){
  try{const data=await json('/api/image-manager/tree');state.entries=data.entries||[];renderTree();const roblox=state.entries.find(x=>x.slug==='roblox'),first=roblox||rootEntries()[0];if(first)selectTarget(mainTarget(first));else workspace.innerHTML='<div class="image-tree-empty">Nenhum jogo disponível.</div>';}
  catch(error){tree.innerHTML=`<div class="image-tree-empty">${esc(error.message)}</div>`;workspace.innerHTML='<div class="image-tree-empty">Não foi possível carregar o Image Manager.</div>';}
}
boot();
