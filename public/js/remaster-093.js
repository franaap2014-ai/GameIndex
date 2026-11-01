/* GameIndex Remaster 0.93 — progressive enhancement; does not grant capabilities. */
(()=>{
  'use strict';
  const SCREENS={
    home:['Início','Home','Inicio'],
    games:['Biblioteca','Library','Biblioteca'],
    ai:['Dexter','Dexter','Dexter'],
    social:['Comunidade','Community','Comunidad'],
    settings:['Configurações','Settings','Configuración'],
    creator:['Creator Studio','Creator Studio','Creator Studio']
  };
  const labels={search:['Pesquisar uma página ou função…','Search a page or feature…','Buscar una página o función…'],tip:['Ctrl + K para navegar','Ctrl + K to navigate','Ctrl + K para navegar'],empty:['Nenhuma página encontrada','No matching pages','No se encontraron páginas']};
  const lang=()=>Math.max(0,['pt-BR','en-US','es-ES'].indexOf(window.GV?.lang||'pt-BR'));
  const reduced=()=>document.documentElement.dataset.reducedMotion==='1'||document.documentElement.dataset.animations==='off'||matchMedia('(prefers-reduced-motion: reduce)').matches;
  const t=(arr)=>arr[lang()]||arr[0];
  const byId=id=>document.getElementById(id);
  let ready=false,transitioning=false;
  function groupDrawer(){
    const nav=document.querySelector('#sideDrawer .drawer-nav');
    if(!nav||nav.dataset.remasterGrouped)return;
    nav.dataset.remasterGrouped='1';
    const nodes=[...nav.children];let group=null,items=null;
    for(const node of nodes){
      if(node.matches('p')){
        group=document.createElement('details');group.className='gi-rm-menu-group';
        const title=document.createElement('summary');title.textContent=node.textContent.trim();
        const section=node.textContent.trim().toLowerCase();
        if(section==='explorar'||section==='explore'||section==='conta'||section==='account')group.open=true;
        items=document.createElement('div');items.className='gi-rm-menu-items';
        group.append(title,items);node.replaceWith(group);
      }else if(group&&items){items.append(node);}
    }
    const active=nav.querySelector('a[href].active')||[...nav.querySelectorAll('a[href]')].find(a=>a.pathname===location.pathname);
    active?.closest('details')?.setAttribute('open','');
  }
  function entries(){
    const caps=new Set(window.GV?.access?.capabilities||[]);
    const anchors=[...document.querySelectorAll('#sideDrawer a[href]')];
    const allowed=anchors.filter(a=>{
      if(a.closest('[hidden]')||a.hidden)return false;
      const cap=a.dataset.cap;
      if(cap&&!caps.has(cap))return false;
      const href=a.getAttribute('href');
      return href&&href.startsWith('/')&&!href.startsWith('//');
    });
    const unique=new Map();
    for(const a of allowed){const key=a.getAttribute('href'),name=a.textContent.trim().replace(/\s+/g,' ');if(!unique.has(key)&&name)unique.set(key,{href:key,name});}
    return [...unique.values()];
  }
  function palette(){
    const el=document.createElement('div');el.id='giRmPalette';el.className='gi-rm-palette';el.hidden=true;
    el.innerHTML='<section class="gi-rm-palette-panel" role="dialog" aria-modal="true" aria-labelledby="giRmDialogTitle"><div class="gi-rm-palette-head"><strong id="giRmDialogTitle">GameIndex · Navegação</strong><span>ESC</span></div><input id="giRmCommandInput" type="search" autocomplete="off"><div class="gi-rm-palette-results" id="giRmResults"></div></section>';
    document.body.append(el);
    const input=byId('giRmCommandInput'),results=byId('giRmResults');
    function update(){
      const term=input.value.toLocaleLowerCase();
      const list=entries().filter(x=>x.name.toLocaleLowerCase().includes(term)).slice(0,12);
      results.replaceChildren();
      if(!list.length){const p=document.createElement('p');p.textContent=t(labels.empty);results.append(p);}
      for(const x of list){const a=document.createElement('a');a.href=x.href;a.textContent=x.name;results.append(a);}
    }
    function close(){el.hidden=true;document.body.classList.remove('gi-rm-palette-open');byId('giRmOpen')?.focus();}
    function open(){el.hidden=false;input.value='';input.placeholder=t(labels.search);update();document.body.classList.add('gi-rm-palette-open');input.focus();}
    input.addEventListener('input',update);input.addEventListener('keydown',e=>{if(e.key==='Enter'){const first=results.querySelector('a');if(first){e.preventDefault();first.click();}}if(e.key==='Escape'){e.preventDefault();close();}});
    el.addEventListener('mousedown',e=>{if(e.target===el)close();});
    document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();if(el.hidden)open();else close();}else if(e.key==='Escape'&&!el.hidden){e.preventDefault();close();}});
    const nav=document.querySelector('#siteHeader .header-nav');
    if(nav){const b=document.createElement('button');b.type='button';b.id='giRmOpen';b.className='gi-rm-command-trigger';b.textContent='⌘ K';b.setAttribute('aria-label',t(labels.tip));b.addEventListener('click',open);nav.prepend(b);}
    window.addEventListener('gv:language-changed',()=>{input.placeholder=t(labels.search);byId('giRmOpen')?.setAttribute('aria-label',t(labels.tip));if(!el.hidden)update();});
  }
  function title(){
    const page=document.body?.dataset.page||'home';return t(SCREENS[page]||[page.replace(/[-_]/g,' '),page,page]);
  }
  function opening(){
    if(reduced())return;
    const el=document.createElement('div');el.className='gi-rm-reveal';el.dataset.scene=String(document.body?.dataset.page||'home').toLowerCase();el.setAttribute('aria-hidden','true');
    const content=document.createElement('span');content.className='gi-rm-reveal-inner';content.textContent=title();const sceneIcon=document.createElement('span');sceneIcon.className='gi-rm-scene-symbol';const symbols={settings:'⚙',admin:'⌘','update-log':'↑',ai:'✧',games:'▦',creator:'✦',social:'◎'};sceneIcon.textContent=symbols[el.dataset.scene]||'◇';sceneIcon.setAttribute('aria-hidden','true');el.append(sceneIcon,content);document.body.append(el);
    setTimeout(()=>el.remove(),900);
  }
  function routes(){
    document.addEventListener('click',e=>{
      if(e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||reduced()||transitioning)return;
      const a=e.target.closest?.('a[href]');if(!a||a.hasAttribute('download')||a.target&&a.target!=='_self')return;
      let u;try{u=new URL(a.href,location.href);}catch{return;}
      if(u.origin!==location.origin||u.pathname===location.pathname&&(u.search===location.search||u.hash)||!(/\/$|\.html?$/.test(u.pathname)))return;
      e.preventDefault();transitioning=true;
      const fade=document.createElement('div');fade.className='gi-rm-nav-out';fade.setAttribute('aria-hidden','true');document.body.append(fade);
      setTimeout(()=>location.assign(u.href),190);
      setTimeout(()=>{transitioning=false;fade.remove();},1200);
    });
    addEventListener('pageshow',e=>{if(e.persisted)transitioning=false;});
  }
  function brand(){
    const badge=document.querySelector('#siteHeader .brand-badge');if(badge){badge.textContent='REMASTER 0.93';badge.title='GameIndex Remaster 0.93';}
    for(const icon of document.querySelectorAll('link[rel="icon"]'))icon.href='/assets/brand/index-emblem.svg?v=remaster093';
    const home=document.querySelector('body[data-page="home"] .hero-kicker');if(home){home.textContent='GAMEINDEX · REMASTER 0.93';}
    document.querySelectorAll('.site-footer span').forEach(el=>{if(/GameIndex Beta 0\.992/.test(el.textContent||''))el.textContent=el.textContent.replace(/GameIndex Beta 0\.992/,'GameIndex Remaster 0.93');});
  }
  function boot(){
    if(ready||!byId('siteHeader'))return;ready=true;document.documentElement.dataset.remaster='13';
    palette(); // Remastered: no automatic page blocking or legacy accordion wrapping.
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  window.addEventListener('gv:shell-ready',()=>{boot();});
})();