(()=>{
  'use strict';
  const $=id=>document.getElementById(id),esc=(v='')=>window.GV?.safe?GV.safe(v):String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let state=null,activePage='';
  function locale(){return window.GV?.lang||document.documentElement.lang||'pt-BR';}
  function localized(value,fallback=''){if(value&&typeof value==='object'&&!Array.isArray(value))return value[locale()]||value['pt-BR']||value['en-US']||Object.values(value).find(Boolean)||fallback;return String(value??fallback);}
  function applyIdentity(identity,entity){
    if(!identity)return;
    const root=document.documentElement,tokens=identity.tokens||{};
    const map={pageBg:'--gi-page-bg',panelBg:'--gi-panel-bg',panelAlt:'--gi-panel-alt',text:'--gi-text',muted:'--gi-muted',border:'--gi-border',accent:'--gi-accent',accentStrong:'--gi-accent-strong',interactiveBg:'--gi-interactive-bg',headerBg:'--gi-header-bg'};
    for(const [key,css] of Object.entries(map))if(tokens[key])root.style.setProperty(css,tokens[key]);
    const density=String(identity.visualGrounding?.density||identity.visualDensity||'RICH').toUpperCase();
    root.dataset.giIdentity=identity.themeKey||'gameindex-default';
    root.dataset.giEntityType=entity?.entityType||'GAME';
    root.dataset.giMotifs=(identity.motifs||[]).join(' ');
    root.dataset.giVisualDensityAuthored=density;
    document.body.dataset.giIdentity=identity.themeKey||'gameindex-default';
  }
  function fieldRows(profile){return (profile?.fields||[]).filter(f=>f&&f.visibility!=='PRIVATE'&&String(f.value??'').trim()).sort((a,b)=>(a.order||0)-(b.order||0));}
  function technicalMarkup(profile){const rows=fieldRows(profile);return rows.length?`<div class="gi099-technical-grid">${rows.map(f=>`<div><span>${esc(localized(f.label,f.canonicalKey))}</span><strong>${esc(Array.isArray(f.value)?f.value.join(' · '):String(f.value??''))}</strong>${f.lastVerifiedAt?`<small>Verified ${esc(f.lastVerifiedAt.slice(0,10))}</small>`:''}</div>`).join('')}</div>`:'<p class="gi099-empty">No verified technical fields yet.</p>';}
  function mediaForSection(section){return (state?.media||[]).filter(m=>m.sectionId===section.id||(!m.sectionId&&m.pageId===section.pageId)).slice(0,12);}
  function sectionMarkup(section){
    const content=section.content||{},type=section.sectionType||'TEXT';
    if(type==='TECHNICAL_DATA')return technicalMarkup({fields:content.fields?.length?content.fields:state.technical?.fields||[]});
    if(type==='INTERACTIVE')return `<div class="gi099-interactive" data-component-id="${esc(content.componentId||'')}" data-gi-element-key="COMPONENT:${esc(content.componentId||section.canonicalKey||section.id)}"></div>`;
    if(['MEDIA','GALLERY'].includes(type)){
      const media=mediaForSection(section);
      return `<div class="gi099-media-grid">${media.map(m=>`<figure data-gi-element-key="MEDIA:${esc(m.id)}"><img src="${esc(m.sourceUrl)}" alt="${esc(m.altText||'')}" loading="lazy" decoding="async"><figcaption>${esc(localized(m.caption,''))}</figcaption></figure>`).join('')}</div>`;
    }
    const claims=Array.isArray(content.canonicalClaims)?content.canonicalClaims:(Array.isArray(content.translations?.[locale()])?content.translations[locale()]:[]);
    if(claims.length)return `<div class="gi099-claims">${claims.map(x=>`<p>${esc(x)}</p>`).join('')}</div>`;
    const text=localized(content.translations,content.canonical||content.text||'');
    return text?`<p>${esc(text)}</p>`:'<p class="gi099-empty">This section has no published verified content yet.</p>';
  }
  function renderSection(section){
    const key=section.canonicalKey||section.id||'section';
    return `<section id="gi099-section-${esc(key)}" class="gi099-section" data-section-key="${esc(key)}" data-section-id="${esc(section.id||key)}" data-page-id="${esc(section.pageId||'')}" data-section-type="${esc(section.sectionType)}" data-gi-element-key="SECTION:${esc(key)}"><header><p class="section-eyebrow">${esc(String(section.sectionType||'TEXT').replaceAll('_',' '))}</p><h3>${esc(section.titleText||localized(section.title,key))}</h3></header><div class="gi099-section-body">${sectionMarkup(section)}</div></section>`;
  }
  function hydrateInteractions(scope){scope.querySelectorAll('[data-component-id]').forEach(node=>{const component=(state.interactions||[]).find(x=>x.id===node.dataset.componentId);if(component)window.GameIndexInteractive099?.render(node,component);else node.innerHTML='<div class="gi099-static-fallback">Interactive data is not published yet.</div>';});}
  function refreshI3(out){
    if(window.GameIndexVisualGrounding099I5?.refresh)window.GameIndexVisualGrounding099I5.refresh();else if(window.GameIndexVisualGrounding099I4?.refresh)window.GameIndexVisualGrounding099I4.refresh();else window.GameIndexVisualGrounding099I3?.refresh?.();
    window.GameIndexInteractionEngine099I2?.mount?.({root:document.getElementById('gamePage')||out||document,state});
  }

  function i6MotifMarkup(){const motifs=state?.i6?.visualIdentityMotifs||[];if(!motifs.length)return '';return `<div class="gi099i6-runtime-motifs" aria-label="Identidade visual">${motifs.slice(0,12).map(m=>{const a=m.assets?.[0];return a?.imageUrl?`<figure class="gi099i6-runtime-motif" title="${esc(m.labelText||m.motifKey)}"><img src="${esc(a.imageUrl)}" alt="${esc(m.labelText||'')}" loading="lazy" decoding="async"><figcaption>${esc(m.labelText||m.motifKey)}</figcaption></figure>`:''}).join('')}</div>`;}
  function i6ExperienceMarkup(page){const rows=state?.i6?.interactiveExperiences||[],pages=state?.structure?.pages||[],hasGameplay=pages.some(p=>/GAMEPLAY/i.test(p.canonicalKey||'')),eligible=/GAMEPLAY/i.test(page?.canonicalKey||'')||(!hasGameplay&&page===pages[0]);if(!eligible||!rows.length)return '';return `<section class="gi099-section gi099i6-runtime-interactions"><header><p class="section-eyebrow">INTERACTIVE</p><h3>${esc(locale()==='pt-BR'?'Experiências interativas':locale()==='es-ES'?'Experiencias interactivas':'Interactive experiences')}</h3></header><div class="gi099i6-runtime-interaction-grid">${rows.map(row=>`<article class="gi099i6-runtime-interaction" data-i6-runtime-concept="${esc(row.id)}"><h4>${esc(localized(row.title,row.titleText||row.conceptKey))}</h4><p>${esc(localized(row.description,''))}</p><div class="gi099i6-runtime-options">${(row.prototype?.config?.items||row.prototype?.config?.steps||[]).slice(0,6).map((x,i)=>`<button type="button" data-i6-runtime-option="${i}">${esc(x)}</button>`).join('')}</div><button type="button" class="b95-button" data-i6-runtime-run>${esc(row.prototype?.config?.buttonLabel||'Test')}</button><div class="gi099i6-runtime-result" aria-live="polite"></div></article>`).join('')}</div></section>`;}
  function bindI6Runtime(scope){scope.querySelectorAll('[data-i6-runtime-concept]').forEach(card=>{const row=(state?.i6?.interactiveExperiences||[]).find(x=>x.id===card.dataset.i6RuntimeConcept),cfg=row?.prototype?.config||{},selected=[];card.addEventListener('click',e=>{const option=e.target.closest('[data-i6-runtime-option]'),run=e.target.closest('[data-i6-runtime-run]'),result=card.querySelector('.gi099i6-runtime-result');if(option){const text=option.textContent.trim();const at=selected.indexOf(text);if(at>=0)selected.splice(at,1);else selected.push(text);option.classList.toggle('active');}if(run&&result){const items=Array.isArray(cfg.items)?cfg.items:[];if(cfg.kind==='RANDOMIZE'&&items.length)result.textContent=items[Math.floor(Math.random()*items.length)];else if(cfg.kind==='REVEAL')result.textContent=items[0]||localized(row.description,'');else if(cfg.kind==='TIMING')result.textContent=locale()==='pt-BR'?'Ação registrada.':'Action registered.';else result.textContent=selected.join(' · ')||items[0]||localized(row.description,'');}});});}

  function renderPage(key){
    const started=performance.now(),pages=state?.structure?.pages||[],page=pages.find(p=>p.canonicalKey===key)||pages[0];
    if(!page)return;
    activePage=page.canonicalKey;
    document.querySelectorAll('#gi099PageNav [data-page-key]').forEach(b=>{const on=b.dataset.pageKey===activePage;b.classList.toggle('active',on);b.setAttribute('aria-selected',String(on));});
    const out=$('gi099PageContent');if(!out)return;
    const direct=page.sections||[],tabs=page.tabs||[];
    out.innerHTML=`<div class="gi099-page-heading" data-gi-element-key="PAGE:${esc(page.canonicalKey)}"><h2>${esc(page.titleText||localized(page.title,page.canonicalKey))}</h2>${page.summaryText?`<p>${esc(page.summaryText)}</p>`:''}${i6MotifMarkup()}</div>${direct.map(renderSection).join('')}${tabs.map(tab=>`<section class="gi099-tab-group" data-tab-key="${esc(tab.canonicalKey||tab.id||'tab')}"><h3>${esc(tab.titleText||localized(tab.title,tab.canonicalKey))}</h3>${(tab.sections||[]).map(renderSection).join('')}</section>`).join('')}${i6ExperienceMarkup(page)}`;
    hydrateInteractions(out);
    bindI6Runtime(out);
    refreshI3(out);
    const duration=Math.round((performance.now()-started)*10)/10;
    window.dispatchEvent(new CustomEvent('gameindex:universe-render-metric',{detail:{page:activePage,durationMs:duration,sections:direct.length+tabs.reduce((n,t)=>n+(t.sections||[]).length,0)}}));
  }
  function renderFallbackTechnical(){
    const container=$('foundationUniverse099');if(!container||state.entity?.entityType!=='EXPERIENCE')return;
    container.classList.remove('hidden');const parent=state.entity.parent,crumb=$('gi099Breadcrumb');
    crumb.innerHTML=parent?`<a href="/game/${esc(parent.slug)}">${esc(parent.name)}</a><span>›</span><strong>${esc(state.entity.name)}</strong>`:`<strong>${esc(state.entity.name)}</strong>`;
    $('gi099EntityBadge').textContent='EXPERIENCE';$('gi099SourceBadge').textContent='Universe Builder · Beta 0.992';
    const nav=$('gi099PageNav');nav.innerHTML='<button class="active" type="button" role="tab" aria-selected="true" data-page-key="technical" data-gi-element-key="PAGE_NAV:technical">Technical Information</button>';
    const out=$('gi099PageContent');out.innerHTML=`<div class="gi099-page-heading" data-gi-element-key="PAGE:technical"><h2>${esc(locale()==='pt-BR'?'Informações Técnicas':locale()==='es-ES'?'Información Técnica':'Technical Information')}</h2><p>${esc(parent?`Experience on ${parent.name}`:'Structured technical profile')}</p></div><section class="gi099-section" data-section-key="technical-information" data-gi-element-key="SECTION:technical-information"><div class="gi099-section-body">${technicalMarkup(state.technical)}</div></section>`;
    refreshI3(out);
  }
  function renderUniverse(){
    const container=$('foundationUniverse099');if(!container)return;
    const pages=state?.structure?.pages||[];if(!pages.length){renderFallbackTechnical();return;}
    container.classList.remove('hidden');const parent=state.entity?.parent,crumb=$('gi099Breadcrumb');
    crumb.innerHTML=parent?`<a href="/game/${esc(parent.slug)}">${esc(parent.name)}</a><span>›</span><strong>${esc(state.entity.name)}</strong>`:`<strong>${esc(state.entity?.name||'')}</strong>`;
    $('gi099EntityBadge').textContent=state.entity?.entityType||'GAME';
    $('gi099SourceBadge').textContent=`Beta 0.992 · Revision ${state.revision?.revisionNumber||'—'}`;
    const nav=$('gi099PageNav');
    nav.innerHTML=pages.map((p,i)=>`<button type="button" role="tab" aria-selected="${i===0?'true':'false'}" class="${i===0?'active':''}" data-page-key="${esc(p.canonicalKey)}" data-gi-element-key="PAGE_NAV:${esc(p.canonicalKey)}">${esc(p.titleText||localized(p.title,p.canonicalKey))}</button>`).join('')+`<a class="gi099-community-link" href="/social.html?entityGameId=${encodeURIComponent(state.entity?.id||'')}">Comunidade</a>`;
    nav.querySelectorAll('[data-page-key]').forEach(button=>button.addEventListener('click',()=>renderPage(button.dataset.pageKey)));
    nav.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight'].includes(e.key))return;const buttons=[...nav.querySelectorAll('[data-page-key]')],index=Math.max(0,buttons.findIndex(b=>b.dataset.pageKey===activePage)),next=e.key==='ArrowRight'?(index+1)%buttons.length:(index-1+buttons.length)%buttons.length;e.preventDefault();buttons[next]?.focus();buttons[next]?.click();});
    renderPage(pages[0].canonicalKey);
  }
  async function mount({game,slug}={}){
    if(!slug&&!game?.slug)return;
    try{
      const response=await fetch(`/api/games/${encodeURIComponent(slug||game.slug)}/universe-099?lang=${encodeURIComponent(locale())}`,{credentials:'same-origin',headers:{Accept:'application/json'}});
      if(!response.ok)return;
      const data=await response.json();state=data.universe;if(!state)return;
      applyIdentity(state.identity,state.entity);
      if(window.GameIndexVisualGrounding099I5?.apply)window.GameIndexVisualGrounding099I5.apply(state);else if(window.GameIndexVisualGrounding099I4?.apply)window.GameIndexVisualGrounding099I4.apply(state);else if(window.GameIndexVisualGrounding099I3?.apply)window.GameIndexVisualGrounding099I3.apply(state.identity,state.entity,state.visualAssets||[],state.interactionBindings||[],state.visualValidation||null);else { window.GameIndexVisualGrounding099I2?.clear?.(); window.GameIndexVisualGrounding099I1?.clear?.(); }
      renderUniverse();
      window.dispatchEvent(new CustomEvent('gameindex:foundation099-ready',{detail:{entity:state.entity,revision:state.revision,release:'0.99',interactionBindings:(state.interactionBindings||[]).length}}));
    }catch{}
  }
  window.GameIndexFoundation099={mount,getState:()=>state,applyIdentity,renderPage};
})();
