(()=>{
  if(window.__GI_0991_HF1_UI__)return;window.__GI_0991_HF1_UI__=true;
  const q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>[...r.querySelectorAll(s)];
  function syncBrand(){qa('[data-gi-brand-word]').forEach(n=>n.textContent='GAME INDEX');qa('.brand-badge').forEach(n=>n.textContent='BETA 0.992');}
  function restoreClassicHome(){if(document.body?.dataset.page!=='home')return;const hero=q('.hero-home');hero?.classList.remove('gi0991-lobby');qa('.gi0991-lobby-brand,.gi0991-launch-grid').forEach(n=>n.remove());}
  function run(){syncBrand();restoreClassicHome();document.documentElement.dataset.giRelease='0991-hf1';document.documentElement.dataset.giInterface='i6-restored';}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
})();
