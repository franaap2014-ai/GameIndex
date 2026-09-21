(()=>{
const $=id=>document.getElementById(id),esc=v=>GV.safe(v??"");
const S={canPublish:false,projects:[],bindings:[]};
function gameId(){return $("universeGame")?.value||"";}
function render(){
  const root=$("ub9915Cinematic"),state=$("ub9915CutsceneState"),id=gameId();if(!root||!state)return;
  root.hidden=!id;
  if(!id){state.innerHTML='<p class="beta95-muted">Selecione um jogo.</p>';return;}
  const binding=S.bindings.find(x=>x.gameId===id)||{status:"FALLBACK",revision:0,maxDurationMs:2000};
  state.innerHTML=`<div class="admin-row"><span><strong>${binding.status==="PUBLISHED"?"CUSTOM CUTSCENE":"FALLBACK"}</strong><small>${binding.status==="PUBLISHED"?`revision ${binding.revision} · máximo ${binding.maxDurationMs} ms`:"Transição curta padrão do GameIndex"}</small></span></div>`;
  $("ub9915BindCutscene").hidden=!S.canPublish;$("ub9915FallbackCutscene").hidden=!S.canPublish;
  if(binding.maxDurationMs)$("ub9915CutsceneLimit").value=String(binding.maxDurationMs);
}
async function refreshBindings(){const d=await GV.api("/api/cinematic-test/game-bindings?limit=500");S.bindings=d.entries||[];render();}
async function boot(){
  try{
    const [access,catalog]=await Promise.all([GV.api("/api/beta0986/access"),GV.api("/api/cinematic-test/catalog")]);
    const caps=new Set(access.access?.capabilities||[]);S.canPublish=caps.has("animation_publish");
    S.projects=(catalog.projects||[]).filter(x=>Number(x.publishedRevision||0)>0);
    $("ub9915CutsceneProject").innerHTML=S.projects.length?S.projects.map(p=>`<option value="${esc(p.id)}" data-revision="${Number(p.publishedRevision)}">${esc(p.name)} · r${Number(p.publishedRevision)}</option>`).join(""):'<option value="">Nenhuma cutscene publicada</option>';
    await refreshBindings();
    $("universeGame")?.addEventListener("change",render);
    $("ub9915BindCutscene")?.addEventListener("click",async()=>{const option=$("ub9915CutsceneProject")?.selectedOptions?.[0],projectId=option?.value,revision=Number(option?.dataset.revision||0);if(!projectId||!revision)return;try{await GV.api(`/api/cinematic-test/game-bindings/${encodeURIComponent(gameId())}`,{method:"PUT",headers:{"content-type":"application/json"},body:JSON.stringify({projectId,revision,maxDurationMs:Number($("ub9915CutsceneLimit").value)||2000})});await refreshBindings();}catch(e){const out=$("universeMessage");if(out){out.textContent=e.message;out.className="beta95-message error";}}});
    $("ub9915FallbackCutscene")?.addEventListener("click",async()=>{try{await GV.api(`/api/cinematic-test/game-bindings/${encodeURIComponent(gameId())}`,{method:"DELETE"});await refreshBindings();}catch(e){const out=$("universeMessage");if(out){out.textContent=e.message;out.className="beta95-message error";}}});
    if(new URLSearchParams(location.search).get("mode")?.startsWith("page-"))setTimeout(()=>$("universeBuilderV3")?.scrollIntoView({block:"start"}),120);
  }catch{}
}
let started=false;function start(){if(started||!window.GV)return;started=true;boot();}addEventListener("gv:shell-ready",start);addEventListener("DOMContentLoaded",()=>setTimeout(start,0));
})();