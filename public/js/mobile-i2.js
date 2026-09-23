(()=>{
  if(window.__GI_MOBILE_I2__)return;window.__GI_MOBILE_I2__=true;
  const mq=matchMedia('(max-width:760px)'),root=document.documentElement;
  function boot(){
    const layer=document.getElementById('globalUiLayer'),nav=document.querySelector('.header-nav'),search=document.getElementById('globalSearchForm');
    if(!layer||!nav||!search||document.getElementById('giI2BottomNav'))return;
    const toggle=document.createElement('button');toggle.type='button';toggle.className='gi-i2-search-toggle';toggle.textContent='⌕';toggle.setAttribute('aria-label','Abrir pesquisa');toggle.setAttribute('aria-controls','globalSearchForm');toggle.setAttribute('aria-expanded','false');nav.prepend(toggle);
    const setSearch=open=>{root.dataset.mobileSearch=open?'open':'closed';toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Fechar pesquisa':'Abrir pesquisa');if(open)document.getElementById('globalSearch')?.focus();};
    toggle.addEventListener('click',()=>setSearch(root.dataset.mobileSearch!=='open'));
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&root.dataset.mobileSearch==='open'){setSearch(false);toggle.focus();}});
    const bottom=document.createElement('nav');bottom.id='giI2BottomNav';bottom.className='gi-i2-bottom-nav';bottom.setAttribute('aria-label','Navegação principal no celular');
    const items=[['/','⌂','Início'],['/games.html','▦','Jogos'],['/ai.html','◇','Dexter'],['/social.html','◎','Social']];
    for(const [href,icon,label] of items){const a=document.createElement('a');a.href=href;const mark=document.createElement('span');mark.textContent=icon;mark.setAttribute('aria-hidden','true');a.append(mark,document.createTextNode(label));if(location.pathname===href||(href==='/'&&location.pathname==='/index.html'))a.setAttribute('aria-current','page');bottom.append(a);}
    const menu=document.createElement('button');menu.type='button';menu.innerHTML='<span aria-hidden="true">☰</span>Menu';menu.setAttribute('aria-controls','sideDrawer');menu.addEventListener('click',()=>document.getElementById('menuTrigger')?.click());bottom.append(menu);document.body.append(bottom);
    const foldSelectors=['.gi-ub3-bottom-card','#ub9915Cinematic'];
    for(const el of document.querySelectorAll(foldSelectors.join(','))){const wrapper=document.createElement('details');wrapper.className='gi-i2-disclosure';const title=document.createElement('summary');title.textContent=el.querySelector('h2,h3')?.textContent||'Mais opções';el.before(wrapper);wrapper.append(title,el);wrapper.open=!mq.matches;wrapper.hidden=el.hidden;new MutationObserver(()=>{wrapper.hidden=el.hidden;}).observe(el,{attributes:true,attributeFilter:['hidden']});}
    function syncLayout(){if(!mq.matches)setSearch(false);document.querySelectorAll('.gi-i2-disclosure').forEach(d=>d.open=!mq.matches);}
    mq.addEventListener('change',syncLayout);
    const viewport=window.visualViewport;
    const syncKeyboard=()=>{const editing=/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName||'');root.dataset.i2Keyboard=mq.matches&&editing?'open':'closed';};
    viewport?.addEventListener('resize',syncKeyboard);document.addEventListener('focusin',syncKeyboard);document.addEventListener('focusout',syncKeyboard);
    // Tables keep their columns inside a local scroller; the page itself stays readable.
    function wrapTables(){for(const table of document.querySelectorAll('main table')){if(table.parentElement?.classList.contains('gi-i2-table-scroll'))continue;const wrapper=document.createElement('div');wrapper.className='gi-i2-table-scroll';wrapper.tabIndex=0;wrapper.setAttribute('role','region');wrapper.setAttribute('aria-label','Tabela: deslize para ver todas as colunas');table.before(wrapper);wrapper.append(table);}}
    wrapTables();let pending=false;new MutationObserver(()=>{if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;wrapTables();});}).observe(document.querySelector('main')||document.body,{childList:true,subtree:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  addEventListener('gv:shell-ready',boot,{once:true});
})();
