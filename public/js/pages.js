const $=id=>document.getElementById(id);
function esc(v=""){return GV.safe(v);}
function initials(name=""){return String(name||"GV").split(/\s+/).filter(Boolean).map(x=>x[0]).join("").slice(0,2).toUpperCase();}

async function initLanguages(){
  const msg=$("languageMessage");
  if(!msg)return;
  document.querySelectorAll("[data-lang]").forEach(button=>{
    button.classList.toggle("active",button.dataset.lang===GV.lang);
    button.addEventListener("click",async()=>{
      const lang=button.dataset.lang;
      localStorage.setItem("gv_lang",lang);
      try{
        const auth=await GV.api("/api/auth/me");
        if(auth.authenticated)await GV.api("/api/preferences",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({language:lang})});
      }catch{}
      msg.textContent="Idioma salvo. Recarregando a interface...";
      setTimeout(()=>location.reload(),250);
    });
  });
}

async function initSubscriptions(){
  const grid=$("plansGrid");
  if(!grid)return;
  try{
    const data=await GV.api("/api/subscriptions/plans");
    grid.innerHTML=data.plans.map(plan=>`<article class="plan-card ${plan.id===data.current?.plan?"current":""}"><div class="plan-top"><span>${esc(plan.id)}</span>${plan.id===data.current?.plan?"<b>SEU PLANO</b>":plan.comingSoon?"<b>EM BREVE</b>":""}</div><h2>${esc(plan.name)}</h2><p>${plan.id==="FREE"?"Conhecimento principal e páginas de jogos continuam úteis para todos.":"Projetado para pesquisas mais profundas e custosas quando o GameIndex estiver público."}</p><ul>${plan.features.map(feature=>`<li>✓ ${esc(feature)}</li>`).join("")}</ul><button class="button ghost-button full-button" disabled>${plan.id==="FREE"?"Ativo":"Ainda não disponível"}</button></article>`).join("");
  }catch(error){grid.innerHTML=`<div class="empty-state">${esc(error.message)}</div>`;}
}

function statusName(value){
  return ({OFFICIAL:"Oficial",COMMUNITY:"Comunidade",THEORY:"Teoria",RUMOR:"Rumor",MIXED:"Misto",UNKNOWN:"Não confirmado",NOT_APPLICABLE:"Informação factual"})[value]||value||"";
}

function knowledgeMini(k){
  return `<a class="detail-knowledge-card" href="/knowledge.html?id=${encodeURIComponent(k.id)}"><div><span>${esc(statusName(k.canonStatus))}</span></div><h3>${esc(k.title)}</h3><p>${esc(k.summary||"")}</p></a>`;
}

async function initEntity(){
  const view=$("entityView");
  if(!view)return;
  const id=new URLSearchParams(location.search).get("id");
  if(!id){view.innerHTML='<div class="empty-state">Entidade não informada.</div>';return;}
  try{
    const data=await GV.api(`/api/entities/${encodeURIComponent(id)}`);
    document.title=`${data.entity.name} | GameIndex`;document.body.dataset.gameSlug=data.game.slug;window.dispatchEvent(new CustomEvent("gameindex:context",{detail:{gameSlug:data.game.slug}}));
    view.innerHTML=`
      <section class="entity-hero">
        <div>
          <div class="entity-image-frame" id="entityImage"><div class="cover-placeholder">${esc(initials(data.entity.name))}</div></div>
          <button class="tiny-button entity-image-resolve" id="resolveEntityImage" type="button">Buscar imagem confiável</button>
        </div>
        <div>
          <p class="section-eyebrow">${esc(data.entity.type)} · <a href="/game.html?slug=${encodeURIComponent(data.game.slug)}">${esc(data.game.name)}</a></p>
          <h1>${esc(data.entity.name)}</h1>
          <p>${esc(data.entity.summary||"O GameIndex ainda está aprofundando este assunto.")}</p>
          <div class="button-row"><a class="button primary-button" href="/ai.html?game=${encodeURIComponent(data.game.slug)}&prompt=${encodeURIComponent(data.entity.name)}">Perguntar à Dexter IA</a><a class="button ghost-button" id="generateEntityPage" href="/generate-page.html?game=${encodeURIComponent(data.game.id)}&entity=${encodeURIComponent(data.entity.id)}" hidden>Gerar página com IA</a></div>
        </div>
      </section>
      <section class="detail-section"><div class="section-title-row"><div><p class="section-eyebrow">CONHECIMENTO</p><h2>O que o GameIndex sabe</h2></div></div><div class="detail-knowledge-grid">${data.knowledge.length?data.knowledge.map(knowledgeMini).join(""):'<div class="empty-state">Ainda não há conhecimento suficiente.</div>'}</div></section>`;

    const renderVisual=visual=>{
      if(visual?.image&&(visual.meta?.displayable||visual.meta?.displayTrusted||visual.meta?.verified||visual.ready))$("entityImage").innerHTML=GV.imageMarkup(visual.image,{alt:data.entity.name,fallback:initials(data.entity.name),loading:"eager"});
    };
    renderVisual(data.visual);
    if(!data.visual?.image){
      try{renderVisual(await GV.api(`/api/entities/${encodeURIComponent(id)}/visual`));}catch{}
      try{const visual=await GV.api(`/api/entities/${encodeURIComponent(id)}/visual/resolve`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({language:GV.lang}),timeout:65000});renderVisual(visual);}catch{}
    }


    try{const auth=await GV.api("/api/auth/me");if(auth.authenticated&&auth.user?.role==="ADMIN"){const link=$("generateEntityPage");if(link)link.hidden=false;}}catch{}

    $("resolveEntityImage")?.addEventListener("click",async()=>{
      const button=$("resolveEntityImage");
      button.disabled=true;
      button.textContent="Verificando…";
      try{
        const visual=await GV.api(`/api/entities/${encodeURIComponent(id)}/visual/resolve`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({language:GV.lang})});
        if(visual.image&&(visual.meta?.displayTrusted||visual.meta?.verified||visual.ready)){renderVisual(visual);button.textContent="Imagem verificada";}
        else button.textContent="Nenhuma imagem confiável";
      }catch{button.textContent="Tentar novamente";}
      finally{button.disabled=false;}
    });
  }catch(error){view.innerHTML=`<div class="empty-state">${esc(error.message)}</div>`;}
}

async function initKnowledge(){
  const view=$("knowledgeView");
  if(!view)return;
  const id=new URLSearchParams(location.search).get("id");
  if(!id){view.innerHTML='<div class="empty-state">Conhecimento não informado.</div>';return;}
  try{
    const k=await GV.api(`/api/knowledge/${encodeURIComponent(id)}`);
    document.title=`${k.title} | GameIndex`;
    view.innerHTML=`<section class="knowledge-detail-head"><p class="section-eyebrow">${esc(k.game?.name||"GAMEINDEX")} · ${esc(k.tabId)} / ${esc(k.sectionId)}</p><h1>${esc(k.title)}</h1><p>${esc(k.summary||"")}</p><div class="knowledge-actions"><button class="button follow-button" id="knowledgeSave" type="button">Salvar</button>${k.game?.slug?`<a class="button ghost-button" href="/creator.html?game=${encodeURIComponent(k.game.slug)}&topic=${encodeURIComponent(k.title)}">Criar com isso</a>`:""}</div><div class="answer-facts"><span class="status-pill">${esc(statusName(k.canonStatus))}</span>${k.gameVersion?`<span>Versão: ${esc(k.gameVersion)}</span>`:""}</div></section>${k.claims?.length?`<section class="detail-section"><p class="section-eyebrow">CLAIMS VALIDADOS</p><div class="claim-list">${k.claims.map(claim=>`<article><p>${esc(claim.text)}</p><span>${esc(statusName(claim.canonStatus))}</span></article>`).join("")}</div></section>`:""}${k.sources?.length?`<section class="detail-section"><p class="section-eyebrow">FONTES</p><div class="source-list">${k.sources.map(source=>/^https?:/.test(source.url)?`<a class="source-chip" target="_blank" rel="noopener noreferrer" href="${esc(source.url)}">${esc(source.title)} ↗</a>`:`<span class="source-chip">${esc(source.title)}</span>`).join("")}</div></section>`:""}${k.relationships?.length?`<section class="detail-section"><p class="section-eyebrow">RELACIONAMENTOS</p><div class="related-list">${k.relationships.map(rel=>`<span class="related-chip">${esc(rel.type)} · ${esc(rel.target.name)}</span>`).join("")}</div></section>`:""}`;
    let saved=false;
    const saveButton=$("knowledgeSave");
    const syncSave=()=>{if(saveButton){saveButton.textContent=saved?"✓ Salvo":"Salvar";saveButton.classList.toggle("active",saved);}};
    try{const state=await GV.api(`/api/knowledge/${encodeURIComponent(id)}/save`);saved=Boolean(state.saved);syncSave();}catch{}
    saveButton?.addEventListener("click",async()=>{saveButton.disabled=true;try{if(saved){await GV.api(`/api/knowledge/${encodeURIComponent(id)}/save`,{method:"DELETE"});saved=false;}else{await GV.api(`/api/knowledge/${encodeURIComponent(id)}/save`,{method:"POST"});saved=true;}syncSave();}catch(error){if(String(error.message).toLowerCase().includes("login")){location.href=`/login.html?return=${encodeURIComponent(location.pathname+location.search)}`;}else saveButton.textContent="Tentar novamente";}finally{saveButton.disabled=false;}});
  }catch(error){view.innerHTML=`<div class="empty-state">${esc(error.message)}</div>`;}
}

async function initAddGame(){
  const form=$("addGameForm");
  if(!form)return;
  let templates=[];
  try{templates=await GV.api("/api/templates");$("newGameTemplate").innerHTML=templates.map(t=>`<option value="${esc(t.id)}">${esc(t.id)}</option>`).join("");}catch{}
  function preview(){const t=templates.find(x=>x.id===$("newGameTemplate").value);$("menuPreview").innerHTML=(t?.tabs||[]).map(tab=>`<span>${esc(tab.icon)} ${esc(tab.label)}</span>`).join("");}
  $("newGameTemplate").addEventListener("change",preview);preview();
  form.addEventListener("submit",async event=>{
    event.preventDefault();
    const out=$("addGameOutput");out.innerHTML="<p>Gerando rascunho...</p>";
    try{
      const data=await GV.api("/api/games",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({nome:$("newGameName").value.trim(),template:$("newGameTemplate").value,desenvolvedor:$("newGameDeveloper").value.trim(),franquia:$("newGameFranchise").value.trim(),siteOficial:$("newGameSite").value.trim(),descricao:$("newGameDescription").value.trim(),status:"DRAFT"})});
      out.innerHTML=`<div class="success-box"><strong>${esc(data.jogo.nome)}</strong><span>${data.jogo.menu.length} abas criadas</span><a class="button primary-button" href="${esc(data.pagina)}">Abrir página</a></div>`;
    }catch(error){out.innerHTML=`<p class="form-message">${esc(error.message)}</p>`;}
  });
}

window.addEventListener("DOMContentLoaded",()=>{initLanguages();initSubscriptions();initEntity();initKnowledge();initAddGame();});
