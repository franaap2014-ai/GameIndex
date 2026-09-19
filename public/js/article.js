const $=id=>document.getElementById(id),esc=v=>GV.safe(v??"");
const id=new URLSearchParams(location.search).get("id");
function score(v){return `${Math.round(Number(v||0)*100)}%`;}
function resultClass(v){return String(v||"").toLowerCase().replace(/[^a-z_-]/g,"");}
async function load(){
  const box=$("articleView");
  try{
    const [a,auth]=await Promise.all([
      GV.api(`/api/articles/${encodeURIComponent(id||"")}`),
      GV.api("/api/auth/me").catch(()=>({authenticated:false}))
    ]);
    document.title=`${a.title} | GameIndex`;
    const c=a.content||{},validations=Array.isArray(a.validations)?a.validations:[];
    const staff=Boolean(auth?.authenticated&&["ADMIN","CREATOR","DEV"].includes(String(auth?.user?.role||auth?.access?.staffRole||"").toUpperCase()));
    const safety=staff&&validations.length?`<section class="article-safety-panel"><p class="section-eyebrow">VALIDAÇÃO · VISÃO ADMIN</p><div class="article-safety-grid">${validations.map(v=>`<article class="safety-check ${esc(resultClass(v.result))}"><strong>${esc(v.type.replace(/_/g," "))}</strong><span>${esc(v.result)}</span><b>${score(v.score)}</b></article>`).join("")}</div></section>`:"";
    const adminMeta=staff?`<span>${esc(a.status)}</span><span>Safety ${score(a.overallConfidence)}</span><span>Fact ${score(a.factSafetyScore)}</span><span>Source ${score(a.sourceSafetyScore)}</span><span>Context ${score(a.contextSafetyScore)}</span>`:"";
    box.innerHTML=`<article class="gv-article"><header class="article-header"><p class="section-eyebrow">GAMEINDEX · ${esc(a.articleType)}</p><h1>${esc(a.title)}</h1><p class="article-summary">${esc(c.summary||"")}</p><div class="article-meta"><span>${esc(a.game?.nome||a.game?.name||"")}</span>${adminMeta}</div></header>${safety}<div class="article-layout"><nav class="article-toc"><strong>Neste artigo</strong>${(c.sections||[]).map((s,i)=>`<a href="#section-${i}">${esc(s.heading)}</a>`).join("")}</nav><div class="article-content">${(c.sections||[]).map((s,i)=>`<section id="section-${i}" class="article-section"><h2>${esc(s.heading)}</h2>${(s.paragraphs||[]).map(p=>`<p>${esc(p)}</p>`).join("")||'<p class="muted">Esta seção ainda precisa de conhecimento mais forte.</p>'}</section>`).join("")}${staff?`<section class="article-section"><h2>Proveniência técnica</h2><p>Este artigo foi montado a partir de ${a.knowledgeIds?.length||0} registros estruturados do GameIndex. Texto gerado não entra automaticamente no banco como fato.</p></section>`:""}</div></div></article>`;
  }catch(e){box.innerHTML=`<div class="empty-state">${esc(e.message)}</div>`;}
}
window.addEventListener("DOMContentLoaded",load);
