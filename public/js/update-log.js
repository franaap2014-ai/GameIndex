const $=id=>document.getElementById(id);
const esc=v=>GV.safe(v??"");

const LABELS={
  NEW:"NEW",IMPROVED:"IMPROVED",AI:"AI",FIXED:"FIXED",SECURITY:"SECURITY",DEV:"DEV",UI:"UI",AUTOGEN:"AUTOGEN"
};
function asSections(entry){
  const raw=entry.sections;
  if(Array.isArray(raw)) return raw;
  if(raw&&typeof raw==="object") return Object.entries(raw).map(([title,items])=>({title,items:Array.isArray(items)?items:[String(items)]}));
  return [];
}
function tags(entry){
  const list=Array.isArray(entry.tags)?entry.tags:[];
  return list.map(t=>`<span class="update-tag">${esc(LABELS[String(t).toUpperCase()]||t)}</span>`).join("");
}
function versionCard(entry,current){
  const sections=asSections(entry);
  const historical=/GameVault/i.test(String(entry.title||""))||String(entry.version)!==String(current);
  return `<article class="update-card ${entry.version===current?'current':''}">
    <header class="update-card-head">
      <div><p class="section-eyebrow">${historical?'RELEASE HISTORY':'CURRENT RELEASE'}</p><h2>${esc(entry.title||`Beta ${entry.version}`)}</h2><p>${esc(entry.codename||"")}</p></div>
      <div class="update-version"><strong>${esc(entry.version)}</strong>${entry.releaseDate?`<small>${esc(new Date(entry.releaseDate).toLocaleDateString(GV.lang||'pt-BR'))}</small>`:''}</div>
    </header>
    ${tags(entry)?`<div class="update-tags">${tags(entry)}</div>`:''}
    <div class="update-sections">${sections.length?sections.map(s=>`<section><h3>${esc(s.title||'Atualização')}</h3><ul>${(s.items||[]).map(i=>`<li>${esc(i)}</li>`).join('')}</ul></section>`).join(''):'<p class="admin-muted-line">Registro histórico resumido. Não há detalhes adicionais verificados para esta versão.</p>'}</div>
  </article>`;
}
async function markSeen(version){
  if(!GV.auth?.user)return;
  try{await GV.api(`/api/update-log/${encodeURIComponent(version)}/seen`,{method:'POST'});document.querySelector('[data-update-dot]')?.setAttribute('hidden','');}catch{}
}
async function loadTechnical(){
  const tier=String(GV.auth?.effectiveTier||GV.auth?.tier||"").toUpperCase();
  if(tier!=="DEV"&&!GV.auth?.user?.isAdmin)return;
  try{
    const d=await GV.api('/api/admin/update-log/technical');
    $('updateTechnical').hidden=false;
    $('updateTechnical').innerHTML=`<p class="section-eyebrow">DEV · TECHNICAL DETAILS</p><h2>Detalhes técnicos</h2><div class="trace-summary"><article><b>Produto</b><span>${esc(d.product)}</span></article><article><b>Versão</b><span>${esc(d.version)}</span></article><article><b>AI System</b><span>${esc(d.aiSystem)}</span></article><article><b>Schema</b><span>${esc(d.schemaVersion)}</span></article><article><b>Migração</b><span>${esc(d.migrationStatus)}</span></article><article><b>Backup</b><span>${d.latestBackup?'Detectado':'Não detectado nesta execução'}</span></article></div><p class="admin-muted-line">${esc(d.build||'')}</p>`;
  }catch{}
}
async function load(){
  try{
    const d=await GV.api('/api/update-log');
    const entries=d.entries||[];
    $('updateLogList').innerHTML=entries.length?entries.map(x=>versionCard(x,d.currentVersion)).join(''):'<div class="empty-state">Nenhum registro de versão disponível.</div>';
    const current=entries.find(x=>String(x.version)===String(d.currentVersion));
    if(current){
      $('updateCurrentBanner').hidden=false;
      $('updateCurrentBanner').innerHTML=`<p class="section-eyebrow">LATEST</p><h2>GameIndex Beta ${esc(d.currentVersion)}</h2><p>${esc(current.codename||'Delivery Recovery')}</p>${d.hasUnread?'<span class="trace-pill ok">NOVO PARA VOCÊ</span>':''}`;
      await markSeen(d.currentVersion);
    }
    await loadTechnical();
  }catch(err){$('updateLogList').innerHTML=`<div class="empty-state"><strong>Não foi possível carregar o Update Log.</strong><p>${esc(err.message)}</p></div>`;}
}
let started=false;async function start(){if(started&&GV.auth===null)return;started=true;await load();}
window.addEventListener('gv:shell-ready',()=>start());
window.addEventListener('DOMContentLoaded',()=>{setTimeout(()=>{if(GV.auth!==null)start();},0);});
