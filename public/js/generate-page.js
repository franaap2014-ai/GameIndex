const $=id=>document.getElementById(id),esc=v=>GV.safe(v??"");
let activeJob=null,pollTimer=null;
const pageParams=new URLSearchParams(location.search);
const terminal=new Set(["READY","NEEDS_REVIEW","BLOCKED_KNOWLEDGE_INSUFFICIENT","FAILED","CANCELLED"]);
const stageLabels={
  QUEUED:"Na fila persistente",
  IDENTIFY_TARGET:"Identificando o alvo",
  CHECK_EXISTING_KNOWLEDGE:"Verificando conhecimento existente",
  RESEARCH_REQUIRED:"Pesquisa necessária",
  RESEARCH:"Pesquisando fontes",
  VERIFY_EVIDENCE:"Verificando evidências",
  BUILD_CONTENT:"Construindo conteúdo",
  CONTENT_VALIDATION:"Validando conteúdo",
  IMAGE_RESOLVE:"Resolvendo mídia persistente",
  RELATIONSHIP_BUILD:"Construindo relações",
  INDEX:"Indexando página",
  FINAL_VERIFY:"Verificação final",
  READY:"Página pronta",
  BLOCKED_KNOWLEDGE_INSUFFICIENT:"Bloqueada: conhecimento insuficiente",
  FAILED:"Falha",
  CANCELLED:"Cancelado"
};
function cleanStage(stage=""){const key=String(stage).split(":")[0];return stageLabels[key]||stage;}
function persistenceText(job){if(job?.recoveredAt)return "Job recuperado após reinício · estado salvo no banco";return "Job persistente · você pode sair e voltar depois";}
async function loadEntities(gameSlug){const select=$("pageEntity");select.innerHTML='<option value="">Página geral do jogo</option>';if(!gameSlug)return;try{const search=await GV.api(`/api/search?q=${encodeURIComponent(gameSlug)}&game=${encodeURIComponent(gameSlug)}&limit=50`);const rows=(search.results||[]).filter(x=>x.type==="ENTITY");select.innerHTML+=[...new Map(rows.map(x=>[x.id,x])).values()].map(x=>`<option value="${esc(x.id)}">${esc(x.title)} · ${esc(x.subtype||"entity")}</option>`).join("");}catch{}}
async function guard(){try{await GV.api("/api/admin/me");$("pageBuilderGate").remove();$("pageBuilderPanel").hidden=false;const games=await GV.api("/api/admin/games");$("pageGame").innerHTML='<option value="">Selecione...</option>'+games.entries.map(g=>`<option value="${esc(g.slug)}">${esc(g.nome)}</option>`).join("");$("pageLanguage").value=GV.lang||"pt-BR";const requestedGame=pageParams.get("game");if(requestedGame){const game=games.entries.find(g=>g.id===requestedGame||g.slug===requestedGame);if(game){$("pageGame").value=game.slug;await loadEntities(game.slug);const requestedEntity=pageParams.get("entity");if(requestedEntity)$("pageEntity").value=requestedEntity;}}const requestedJob=pageParams.get("job");if(requestedJob){try{const job=await GV.api(`/api/generation/${encodeURIComponent(requestedJob)}`);renderJob(job);if(!terminal.has(job.status))poll();}catch{}}}catch(e){$("pageBuilderGate").className="empty-state";$("pageBuilderGate").textContent=e.message;}}
function renderJob(job){activeJob=job;const progress=Math.max(0,Math.min(100,Number(job.progress||0)));$("generationPanel").hidden=false;$("generationPercent").textContent=`${progress}%`;$("generationBar").style.width=`${progress}%`;$("generationStage").textContent=cleanStage(job.currentStage||job.status);$("generationEta").textContent=persistenceText(job);$("generationTitle").textContent=job.status==="FAILED"?"A geração encontrou um problema":job.status==="CANCELLED"?"Geração cancelada":job.status==="BLOCKED_KNOWLEDGE_INSUFFICIENT"?"Geração bloqueada com segurança":terminal.has(job.status)?"Geração concluída":"GameIndex está construindo a página";const done=terminal.has(job.status);$("cancelGeneration").hidden=done;if(job.status==="FAILED")$("generationResult").innerHTML=`<div class="empty-state"><strong>O GameIndex não conseguiu terminar esta página.</strong><p>${esc(job.errorMessage||"Tente novamente.")}</p></div>`;if(job.status==="BLOCKED_KNOWLEDGE_INSUFFICIENT")$("generationResult").innerHTML=`<div class="empty-state"><strong>Conteúdo não publicado.</strong><p>Faltam evidências verificadas: ${esc(job.blockingReason||"conhecimento insuficiente")}. Use Deep Research ou adicione fontes confiáveis.</p></div>`;if(done&&job.resultPageId)$("generationResult").innerHTML=`<div class="success-box"><strong>Página criada.</strong><p>Status: ${esc(job.status)}</p><a class="button primary-button" href="/generated-page.html?id=${encodeURIComponent(job.resultPageId)}">Abrir preview</a></div>`;return done;}
async function poll(){if(!activeJob)return;try{const job=await GV.api(`/api/generation/${encodeURIComponent(activeJob.id)}`);const done=renderJob(job);if(!done)pollTimer=setTimeout(poll,1100);}catch(e){$("generationResult").innerHTML=`<div class="empty-state">${esc(e.message)}</div>`;}}
$("pageGame")?.addEventListener("change",e=>loadEntities(e.target.value));
$("pageBuilderForm")?.addEventListener("submit",async e=>{e.preventDefault();clearTimeout(pollTimer);$("generationResult").innerHTML="";try{const job=await GV.api("/api/pages/generate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({game:$("pageGame").value,entityId:$("pageEntity").value||null,researchMode:$("pageResearchMode").value,language:$("pageLanguage").value})});renderJob(job);poll();}catch(err){$("generationPanel").hidden=false;$("generationResult").innerHTML=`<div class="empty-state">${esc(err.message)}</div>`;}});
$("cancelGeneration")?.addEventListener("click",async()=>{if(!activeJob)return;try{renderJob(await GV.api(`/api/generation/${encodeURIComponent(activeJob.id)}/cancel`,{method:"POST"}));}catch(e){alert(e.message);}});
window.addEventListener("DOMContentLoaded",guard);
