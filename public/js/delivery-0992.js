(()=>{
  if(window.__GI_DELIVERY_0992__)return;window.__GI_DELIVERY_0992__=true;
  let overlay=null,timer=null,originLink=null;
  const symbols={settings:['CONFIGURAÇÕES','<g class="gi992-gears"><text x="30" y="58">⚙</text><text x="64" y="77">⚙</text></g>'],admin:['PAINEL ADM','<g class="gi992-code"><path d="M18 28h28m-28 14h58M30 56h46M18 70h34"/></g>'],'update-log':['UPDATE LOG','<path class="gi992-arrow" d="M50 78V23m-20 20 20-20 20 20M22 80h56"/>'],profile:['PERFIL','<circle cx="50" cy="33" r="15"/><path d="M20 80c0-36 60-36 60 0"/>'],social:['SOCIAL','<path d="m25 25 50 15-25 40-25-55m0 0 25 55"/><circle cx="25" cy="25" r="8"/><circle cx="75" cy="40" r="8"/><circle cx="50" cy="80" r="8"/>'],'universe-builder':['UNIVERSE BUILDER','<g class="gi992-blocks"><rect x="13" y="15" width="30" height="30" rx="4"/><rect x="56" y="15" width="30" height="30" rx="4"/><rect x="35" y="58" width="30" height="30" rx="4"/></g>']};
  function clear(){clearTimeout(timer);timer=null;overlay?.remove();overlay=null;document.documentElement.classList.remove('gi992-navigating');}
  document.addEventListener('click',event=>{
    const a=event.target.closest?.('#sideDrawer a[href]');
    if(!a||event.defaultPrevented||event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey||a.download||a.target&&a.target!=='_self')return;
    const url=new URL(a.href,location.href);if(url.origin!==location.origin||url.pathname===location.pathname&&url.search===location.search)return;
    if(matchMedia('(prefers-reduced-motion: reduce)').matches||document.documentElement.dataset.animations==='off'||document.documentElement.dataset.reducedMotion==='1')return;
    event.preventDefault();if(overlay)return;originLink=a;
    const key=url.pathname.replace(/^\//,'').replace(/\.html$/,'');const [title,shape]=symbols[key]||[a.textContent.trim(),'<path d="M25 20h50v60H25zM36 34h28M36 50h28M36 66h16"/>'];
    overlay=document.createElement('div');overlay.className='gi992-nav-transition';overlay.setAttribute('role','status');overlay.setAttribute('aria-live','polite');
    overlay.innerHTML='<svg viewBox="0 0 100 100" aria-hidden="true">'+shape+'</svg>';const label=document.createElement('strong');label.textContent=title;overlay.append(label);document.body.append(overlay);document.documentElement.classList.add('gi992-navigating');
    timer=setTimeout(()=>{clear();location.assign(url.href);},matchMedia('(max-width:760px)').matches?500:700);
  },true);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&overlay){clear();originLink?.focus();}});
  addEventListener('pageshow',clear);addEventListener('pagehide',clear);
})();
