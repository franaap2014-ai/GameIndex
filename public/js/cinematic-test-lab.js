(()=>{
const $=id=>document.getElementById(id),esc=v=>GV.safe(v??"");
const S={catalog:null,games:[],controller:null,lastRequest:null,sequence:[],sequenceToken:0,previewToken:0};
function msg(text,type=""){const el=$("ctlMessage");el.textContent=text||"";el.className=`beta95-message ${type}`;}
function selectedRequest(){
  const type=$("ctlSourceType").value,base={identity:$("ctlIdentity").value,theme:$("ctlTheme").value,viewport:$("ctlViewport").value,reducedMotion:$("ctlReduced").checked,slowPreview:$("ctlSlow").checked,loop:$("ctlLoop").checked};
  if(type==="PROJECT")return {...base,projectId:$("ctlProject").value,label:$("ctlProject").selectedOptions[0]?.textContent||"Projeto"};
  if(type==="GAME")return {...base,gameId:$("ctlGame").value,label:`Game Entry · ${$("ctlGame").selectedOptions[0]?.textContent||"Jogo"}`};
  return {...base,existingKey:$("ctlExisting").value,label:$("ctlExisting").selectedOptions[0]?.textContent||"Cutscene"};
}
function updateRows(){const type=$("ctlSourceType").value;$("ctlExistingRow").hidden=type!=="EXISTING";$("ctlProjectRow").hidden=type!=="PROJECT";$("ctlGameRow").hidden=type!=="GAME";}
function identityAccent(identity){return ({FREE:"#f4f4f2",PRO:"#63e69a",TESTER:"#58a6ff",DEV:"#ff6674",CREATOR:"#e7bd5b"})[identity]||"#f4f4f2";}
function slowRuntime(runtime,slow){if(!slow)return runtime;const copy=JSON.parse(JSON.stringify(runtime)),factor=2;copy.durationMs=Math.min(30000,Number(copy.durationMs||0)*factor);for(const track of copy.tracks||[])for(const frame of track.keyframes||[])frame.time=Math.min(copy.durationMs,Number(frame.time||0)*factor);return copy;}
function clearController(){S.previewToken++;S.controller?.destroy?.();S.controller=null;}
function waitForPlayback(controller,runtime,token){return new Promise(resolve=>{let done=false;const finish=()=>{if(done)return;done=true;resolve();};const max=Math.min(32000,Math.max(500,Number(runtime.durationMs||1000)+500));const timer=setTimeout(finish,max);controller.onState(s=>{if(token!==S.sequenceToken){clearTimeout(timer);finish();return;}$("ctlTime").textContent=`${(s.time/1000).toFixed(2)}s / ${(s.duration/1000).toFixed(2)}s`;if(!s.playing&&s.time>=s.duration){clearTimeout(timer);finish();}});});}
async function preview(request,{awaitEnd=false,sequenceToken=S.sequenceToken}={}){
  clearController();const previewToken=S.previewToken;S.lastRequest=request;
  const d=await GV.api("/api/cinematic-test/preview",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(request)}),runtime=slowRuntime(d.runtime,request.slowPreview),stage=$("ctlStage");
  if(previewToken!==S.previewToken||sequenceToken!==S.sequenceToken)return;
  stage.dataset.viewport=request.viewport||"DESKTOP";stage.style.setProperty("--gi9915-accent",identityAccent(request.identity));stage.replaceChildren();
  stage.dataset.ctlReduced=request.reducedMotion?"1":"0";
  S.controller=window.GameIndexAnimationRuntime.create(stage,runtime);S.controller.setLoop(Boolean(request.loop&&!awaitEnd));
  S.controller.onState(s=>{$("ctlTime").textContent=`${(s.time/1000).toFixed(2)}s / ${(s.duration/1000).toFixed(2)}s`;});
  $("ctlMeta").textContent=`${request.label||d.source?.kind||"Preview"} · ${request.identity} · ${request.theme} · ${request.viewport}${request.reducedMotion?" · Reduced Motion":""}${request.slowPreview?" · Slow":""}`;
  if(request.reducedMotion){S.controller.seek(runtime.durationMs);$("ctlTime").textContent=`${(runtime.durationMs/1000).toFixed(2)}s / ${(runtime.durationMs/1000).toFixed(2)}s`;return;}
  const finished=awaitEnd?waitForPlayback(S.controller,runtime,sequenceToken):null;
  S.controller.play(0);
  if(finished)await finished;
}
function renderSequence(){$("ctlSequence").innerHTML=S.sequence.length?S.sequence.map((x,i)=>`<div class="admin-row"><span>${i+1}. ${esc(x.label)}</span><button class="ae-mini-btn" data-remove-sequence="${i}" type="button">×</button></div>`).join(""):'<small class="gi9915-muted">Nenhuma etapa.</small>';}
async function runSequence(){if(!S.sequence.length)return msg("Adicione pelo menos uma etapa.","error");const token=++S.sequenceToken;msg("Executando sequência…");for(const req of S.sequence){if(token!==S.sequenceToken)return;await preview({...req,loop:false},{awaitEnd:true,sequenceToken:token});await new Promise(r=>setTimeout(r,120));}if(token===S.sequenceToken)msg("Sequência concluída.","good");}
async function boot(){try{const [catalog,games]=await Promise.all([GV.api("/api/cinematic-test/catalog"),GV.loadGameOptions({max:500})]);S.catalog=catalog;S.games=games;$("ctlExisting").innerHTML=(catalog.existing||[]).map(x=>`<option value="${esc(x.key)}">${esc(x.name)}</option>`).join("");$("ctlProject").innerHTML=(catalog.projects||[]).map(x=>`<option value="${esc(x.id)}">${esc(x.name)} · ${esc(x.status)}</option>`).join("");$("ctlGame").innerHTML=games.map(g=>`<option value="${esc(g.id)}">${esc(g.name||g.nome)}</option>`).join("");renderSequence();}catch(e){msg(e.message,"error");}}
document.addEventListener("DOMContentLoaded",()=>{$("ctlSourceType").onchange=updateRows;$("ctlViewport").onchange=()=>{$("ctlStage").dataset.viewport=$("ctlViewport").value;};$("ctlPlay").onclick=()=>{S.sequenceToken++;preview(selectedRequest()).catch(e=>msg(e.message,"error"));};$("ctlReplay").onclick=()=>{S.sequenceToken++;preview(S.lastRequest||selectedRequest()).catch(e=>msg(e.message,"error"));};$("ctlPause").onclick=()=>S.controller?.pause();$("ctlAddSequence").onclick=()=>{S.sequence.push(selectedRequest());renderSequence();};$("ctlRunSequence").onclick=()=>runSequence().catch(e=>msg(e.message,"error"));$("ctlClearSequence").onclick=()=>{S.sequenceToken++;S.sequence=[];clearController();renderSequence();};$("ctlSequence").onclick=e=>{const b=e.target.closest("[data-remove-sequence]");if(!b)return;S.sequence.splice(Number(b.dataset.removeSequence),1);renderSequence();};updateRows();boot();});
})();