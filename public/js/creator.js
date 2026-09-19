const $=id=>document.getElementById(id);
const TYPES=[
  ["GUIDE","Guia","↗"],["ARTICLE","Artigo","▤"],["LIST","Lista","≡"],["COMPARISON","Comparação","⇄"],["LORE_SUMMARY","Resumo de Lore","◈"],["TIPS","Dicas","✦"],["VIDEO_SCRIPT","Roteiro de Vídeo","▶"]
];
let selectedType="GUIDE";
function esc(v=""){return GV.safe(v);}
function setType(type){selectedType=type;document.querySelectorAll("[data-creator-type]").forEach(b=>b.classList.toggle("active",b.dataset.creatorType===type));}
function renderContent(data){
  const c=data.content||{};
  const sections=(c.sections||[]).map(s=>`<section class="generated-section"><h3>${esc(s.heading)}</h3><p>${esc(s.body||"").replaceAll("\n","<br>")}</p></section>`).join("");
  const items=(c.items||[]).map(item=>`<article class="generated-list-item"><span>${esc(item.rank||"•")}</span><div><h3>${esc(item.title)}</h3><p>${esc(item.description||item.summary||"")}</p></div></article>`).join("");
  $("creatorOutput").innerHTML=`<div class="creator-result-head"><div><p class="section-eyebrow">${esc(data.contentType)}</p><h2>${esc(c.title||data.topic)}</h2></div><div class="creator-result-actions"><button class="tiny-button" id="copyCreator">Copiar</button></div></div>${c.hook?`<div class="generated-hook"><strong>HOOK</strong><p>${esc(c.hook)}</p></div>`:""}${c.introduction?`<p class="generated-intro">${esc(c.introduction)}</p>`:""}${c.intro?`<p class="generated-intro">${esc(c.intro)}</p>`:""}${sections}${items}${c.note?`<div class="generated-note">${esc(c.note)}</div>`:""}${c.conclusion?`<div class="generated-conclusion"><strong>Conclusão</strong><p>${esc(c.conclusion)}</p></div>`:""}<div class="creator-proof"><span>${data.factCheck?.sourceCount>0?"✓ Revisão interna com fontes":"⚠ Sem fontes externas vinculadas"}</span><span>${data.factCheck?.knowledgeCount||0} conhecimentos usados</span><span>${data.factCheck?.sourceCount||0} fontes vinculadas</span>${data.factCheck?.genericFillerBlocked?"<span>✓ Anti-filler V2</span>":""}${data.saved?"<span>✓ Salvo no perfil</span>":""}</div>`;
  $("copyCreator")?.addEventListener("click",async()=>{const text=$("creatorOutput").innerText;await navigator.clipboard.writeText(text);$("copyCreator").textContent="Copiado";setTimeout(()=>$("copyCreator").textContent="Copiar",1200);});
}
async function init(){
  $("creatorFormats").innerHTML=TYPES.map(([id,label,icon])=>`<button type="button" data-creator-type="${id}" class="creator-format ${id===selectedType?"active":""}"><span>${icon}</span><strong>${esc(label)}</strong></button>`).join("");
  document.querySelectorAll("[data-creator-type]").forEach(b=>b.addEventListener("click",()=>setType(b.dataset.creatorType)));
  try{const games=await GV.loadGameOptions();$("creatorGame").innerHTML=games.map(g=>`<option value="${esc(g.slug)}">${esc(g.nome)}</option>`).join("");}catch(error){$("creatorMessage").textContent=error.message;}
  const params=new URLSearchParams(location.search);if(params.get("game"))$("creatorGame").value=params.get("game");if(params.get("topic"))$("creatorTopic").value=params.get("topic");
  $("creatorForm").addEventListener("submit",async e=>{
    e.preventDefault();const button=$("creatorSubmit");button.disabled=true;button.textContent="Criando…";$("creatorMessage").textContent="Lendo o conhecimento do GameIndex…";$("creatorOutput").innerHTML='<div class="content-skeleton"></div>';
    try{
      const result=await GV.api("/api/creator/generate",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({game:$("creatorGame").value,topic:$("creatorTopic").value.trim(),contentType:selectedType,depth:$("creatorDepth").value,language:GV.lang||"pt-BR",save:$("creatorSave").checked})});
      renderContent(result);$("creatorMessage").textContent="Conteúdo criado a partir da memória estruturada do GameIndex.";
    }catch(error){$("creatorOutput").innerHTML=`<div class="empty-state">${esc(error.message)}</div>`;$("creatorMessage").textContent=error.message;}
    finally{button.disabled=false;button.textContent="Criar conteúdo";}
  });
}
window.addEventListener("DOMContentLoaded",init);
