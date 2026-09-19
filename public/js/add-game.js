const $=id=>document.getElementById(id),esc=v=>GV.safe(v??"");
function payload(){
  return {
    name:$("newGameName").value,
    slug:$("newGameSlug").value,
    template:$("newGameTemplate").value,
    developer:$("newGameDeveloper").value,
    publisher:$("newGamePublisher").value,
    releaseDate:$("newGameRelease").value,
    platforms:$("newGamePlatforms").value,
    genres:$("newGameGenres").value,
    franchise:$("newGameFranchise").value,
    officialUrl:$("newGameSite").value,
    officialSources:$("newGameSources").value,
    description:$("newGameDescription").value,
    coverUrl:$("newGameCover").value,
    bannerUrl:$("newGameBanner").value,
    iconUrl:$("newGameIcon").value,
    visualQuery:$("newGameVisual").value,
    tabs:$("newGameTabs").value,
    researchSettings:{deepResearch:$("optDeepResearch").checked,preferOfficial:$("optPreferOfficial").checked},
    options:{generateKnowledge:$("optKnowledge").checked,generateArticles:$("optArticles").checked,generatePages:$("optPages")?.checked!==false}
  };
}
async function guard(){
  try{await GV.api("/api/admin/me");$("addGameGate").remove();$("addGameForm").hidden=false;}
  catch(e){$("addGameGate").className="empty-state";$("addGameGate").textContent=e.message;}
}
$("analyzeGame")?.addEventListener("click",async()=>{
  const out=$("analysisOutput");out.innerHTML="Analyzing…";
  try{
    const d=await GV.api("/api/admin/games/analyze",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload())});
    const tabSummary=(d.tabs||[]).length?`${d.tabs.length} custom tabs`:"template tabs";
    const warnings=d.warnings?.map(w=>`<p>⚠ ${esc(w)}</p>`).join("")||"<p>Identity payload looks ready.</p>";
    out.innerHTML=`<div class="analysis-box"><strong>${esc(d.name)}</strong><span>${esc(d.template)} · ${esc(tabSummary)}</span><small>${(d.officialSources||[]).length} source URL(s) · ${Object.values(d.images||{}).filter(Boolean).length} visual candidate(s)</small>${warnings}</div>`;
  }catch(e){out.textContent=e.message;}
});
$("addGameForm")?.addEventListener("submit",async e=>{
  e.preventDefault();const out=$("addGameOutput");out.textContent="Adding game, knowledge and draft articles…";
  try{
    const request=payload();
    const d=await GV.api("/api/admin/games",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(request)});
    let generation=null;
    if(request.options.generatePages){
      try{generation=await GV.api("/api/pages/generate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({game:d.game.id,researchMode:request.researchSettings.deepResearch?"DEEP":"STANDARD",language:GV.lang})});}catch{}
    }
    out.innerHTML=`<div class="success-box"><strong>${esc(d.game.nome)} adicionado como rascunho.</strong><p>${d.knowledgeCreated} conhecimentos iniciais · ${d.articles.length} artigos gerados · ${d.imageCandidates?.length||0} imagens aguardando revisão.${generation?` · Page Builder iniciado (${esc(generation.status)})`:""}</p><div class="button-row"><a class="button ghost-button" href="/game.html?slug=${encodeURIComponent(d.game.slug)}">Abrir jogo</a>${generation?`<a class="button primary-button" href="/generate-page.html?job=${encodeURIComponent(generation.id)}">Ver geração</a>`:`<a class="button primary-button" href="/generate-page.html?game=${encodeURIComponent(d.game.id)}">Gerar página</a>`}</div></div>`;
  }catch(e){out.textContent=e.message;}
});
window.addEventListener("DOMContentLoaded",guard);
