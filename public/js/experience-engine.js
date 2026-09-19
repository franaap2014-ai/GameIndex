(()=>{
  if(window.__GI_PERSONALIZATION_09875__)return;
  window.__GI_PERSONALIZATION_09875__=true;
  window.__GI_PERSONALIZATION_0987__=true; // compatibility marker
  window.__GI_EXPERIENCE_ENGINE_HF2__=true; // compatibility marker

  const EXPERIENCE_KEY='gi_experience_roblox';
  const DEFAULT_CHILDREN=['blox-fruits','doors','fisch','work-at-a-pizza-place','prison-life'];
  const state={slug:'',game:null,parent:null,resolved:null,experienceKey:'main',eraKey:'',children:[],initialized:false,loading:0};
  const safe=v=>window.GV?.safe?.(v)??String(v??'').replace(/[&<>"']/g,'');
  const t=(key,fallback)=>window.GV?.t?.(key,fallback)||fallback;
  const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches||document.documentElement.dataset.reducedMotion==='1';
  function slugFromLocation(){const q=new URLSearchParams(location.search).get('slug');if(q)return q.toLowerCase();const m=location.pathname.match(/^\/game\/roblox\/([a-z0-9-]+)\/?$/i);if(m)return m[1].toLowerCase();if(/^\/game\/roblox\/?$/i.test(location.pathname))return'roblox';return'';}
  function selectedRobloxExperience(){return localStorage.getItem(EXPERIENCE_KEY)==='roblox-og'?'roblox-og':'main';}
  function eraStorageKey(slug,experience){return`gi_era_${String(slug||'game')}_${String(experience||'main')}`;}
  function savedEra(slug,experience){return localStorage.getItem(eraStorageKey(slug,experience))||'';}
  function safeColor(value,fallback=''){const v=String(value||'').trim();return /^(#[0-9a-f]{3,8}|rgba?\([0-9.,%\s]+\)|hsla?\([0-9.,%\s]+\))$/i.test(v)?v:fallback;}
  function safeRadius(value,fallback=12){const n=Number(value);return Number.isFinite(n)?Math.max(0,Math.min(30,n)):fallback;}
  function safeFont(value,fallback){const v=String(value||'').trim();return v&&v.length<180&&/^[A-Za-z0-9 ,.'"-]+$/.test(v)?v:fallback;}
  function mediaUrl(media){return media?.imageUrl||media?.url||'';}
  function contextForMusic(){return{type:'game',slug:state.slug,parent:state.parent?.slug||null};}
  function buildQuery(){
    const p=new URLSearchParams({theme:localStorage.getItem('gv_theme')||'FREE_DARK'}),roblox=selectedRobloxExperience();
    if(state.slug==='roblox'){
      state.experienceKey=roblox;p.set('experience',roblox);
      const era=savedEra('roblox',roblox);if(era)p.set('era',era);
    }else{
      state.experienceKey='main';p.set('experience','main');
      if(state.parent?.slug==='roblox'){
        p.set('ecosystemExperience',roblox);
        const era=savedEra('roblox',roblox);if(era)p.set('ecosystemEra',era);
      }
    }
    return p;
  }
  function applyDatasets(root,resolved){
    const r=resolved.resolved||{},components=r.components||{},identity=String(r.identity||'').toLowerCase().replace(/[^a-z0-9-]/g,'-');
    const variant=state.slug==='roblox'?state.experienceKey:(resolved.parentExperience?.key||'main');
    const ecosystem=resolved.parent?.slug||resolved.game?.slug||state.slug;
    const values={personalization:'09875',game:resolved.game?.slug||state.slug,gameEcosystem:ecosystem,gameExperience:resolved.experience?.slug||resolved.experience?.key||state.experienceKey,experienceVariant:variant,experienceIdentity:identity,era:resolved.era?.eraKey||resolved.parentEra?.eraKey||'',componentHeader:components.header,componentCard:components.gameCard,componentNavigation:components.navigation,componentPanel:components.panel,componentButton:components.button,componentDensity:components.density};
    for(const surface of [document.documentElement,document.body,root]){
      for(const [key,value] of Object.entries(values)){if(value)surface.dataset[key]=value;else delete surface.dataset[key];}
    }
    document.documentElement.dataset.personalizationReady='1';
  }
  function applyTokens(root,resolved){
    const r=resolved.resolved||{},theme=r.theme||{},font=r.font||{},motion=r.motion||{},targets=[document.documentElement,root];
    const accent=safeColor(theme.accent,''),accent2=safeColor(theme.accent2,'');
    for(const target of targets){
      if(accent)target.style.setProperty('--gie-accent',accent);else target.style.removeProperty('--gie-accent');
      if(accent2)target.style.setProperty('--gie-accent-2',accent2);else target.style.removeProperty('--gie-accent-2');
      target.style.setProperty('--gie-radius',`${safeRadius(theme.radius,12)}px`);
      target.style.setProperty('--gie-font-display',safeFont(font.display,'Inter, Segoe UI, Arial, sans-serif'));
      target.style.setProperty('--gie-font-heading',safeFont(font.heading,'Inter, Segoe UI, Arial, sans-serif'));
      target.style.setProperty('--gie-font-body',safeFont(font.body,'Inter, Segoe UI, Arial, sans-serif'));
      const letter=String(font.letterSpacing||'').trim();target.style.setProperty('--gie-letter-spacing',/^[-+]?\d*\.?\d+(em|rem|px|%)$/.test(letter)?letter:'0');
      const weight=Number(font.weight);target.style.setProperty('--gie-display-weight',String(Number.isFinite(weight)?Math.max(400,Math.min(900,weight)):700));
      target.style.setProperty('--gie-motion',`${reduced()?0:Math.max(0,Math.min(600,Number(motion.durationMs)||220))}ms`);
    }
  }
  function applyMedia(resolved){
    const media=resolved.resolved?.media||{},backdrop=document.getElementById('gameBackdrop'),cover=document.getElementById('gameCover');
    const banner=mediaUrl(media.banner)||mediaUrl(media.hero)||mediaUrl(media.background)||state.game?.visual?.cover||'';
    if(backdrop){
      backdrop.dataset.asset='BANNER';backdrop.dataset.mediaSource=media.banner?.source||media.hero?.source||media.background?.source||'GAME_INDEX_DEFAULT';
      if(banner){backdrop.style.backgroundImage=`linear-gradient(90deg,var(--gie-hero-left,rgba(5,8,12,.90)),var(--gie-hero-mid,rgba(5,8,12,.48)),var(--gie-hero-right,rgba(5,8,12,.82))),url("${String(banner).replaceAll('"','%22')}")`;backdrop.style.backgroundSize='cover';backdrop.style.backgroundPosition='center';backdrop.classList.add('gie-banner-active');}
      else{backdrop.style.removeProperty('background-image');backdrop.classList.remove('gie-banner-active');}
    }
    const logo=mediaUrl(media.logo)||state.game?.visual?.cover||'';
    if(cover){
      cover.dataset.asset='LOGO';cover.dataset.mediaSource=media.logo?.source||'GAME_INDEX_DEFAULT';
      if(logo){cover.innerHTML=GV.imageMarkup(logo,{alt:media.logo?.altText||state.game?.nome||state.game?.name||'Game',fallback:(state.game?.nome||'GI').slice(0,2),loading:'eager'});cover.classList.add('gie-logo-frame');}
      else{cover.innerHTML=`<div class="cover-placeholder">${safe((state.game?.nome||state.game?.name||'GI').slice(0,2).toUpperCase())}</div>`;cover.classList.remove('gie-logo-frame');}
    }
  }
  function localizedMenu(profile){return(profile?.menu||[]).map(item=>({...item,label:t(`experience.${item.id}`,item.label||item.id)}));}
  function variantSwitch(){
    const parentRoblox=state.slug==='roblox'||state.parent?.slug==='roblox';if(!parentRoblox)return'';const active=selectedRobloxExperience();
    return`<div class="gie-variant-switch" role="group" aria-label="${safe(t('experience.variant','Experiência visual'))}"><button type="button" data-gie-variant="main" aria-pressed="${active==='main'}" class="${active==='main'?'active':''}">${safe(t('experience.robloxModern','Modern'))}</button><button type="button" data-gie-variant="roblox-og" aria-pressed="${active==='roblox-og'}" class="${active==='roblox-og'?'active':''}">${safe(t('experience.robloxOg','OG'))}</button></div>`;
  }
  function eraSwitch(resolved){
    const eras=resolved.available?.eras||[];if(state.slug!=='roblox'||!eras.length)return'';const active=resolved.era?.eraKey||resolved.experience?.defaultEraKey||'';
    if(eras.length===1)return`<span class="gie-era-badge">${safe(eras[0].label||eras[0].eraKey)}</span>`;
    return`<label class="gie-era-select"><span>${safe(t('personalization.era','Era'))}</span><select data-gie-era>${eras.map(x=>`<option value="${safe(x.eraKey)}" ${x.eraKey===active?'selected':''}>${safe(x.label||x.eraKey)}</option>`).join('')}</select></label>`;
  }
  function renderBar(resolved){
    const host=document.getElementById('gameExperienceBar');if(!host)return;const profile=resolved.experience;if(!profile){host.hidden=true;return;}host.hidden=false;
    const parent=state.parent,menu=localizedMenu(profile),source=resolved.inspector?.identitySource||'GAME';
    const parentLink=parent?`<a class="gie-parent-link" href="/game/roblox">← ${safe(parent.name||'Roblox')}</a>`:'';
    host.innerHTML=`<div class="gie-bar-main"><div>${parentLink}<span class="gie-label">${safe(profile.label||state.game?.nome||state.game?.name||'')}</span><small>${safe(profile.subtitle||'')} · ${safe(source.replaceAll('_',' '))}</small></div><div class="gie-switch-stack">${variantSwitch()}${eraSwitch(resolved)}</div></div>${menu.length?`<nav class="gie-menu" aria-label="${safe(t('experience.menu','Menu da experiência'))}">${menu.map(item=>`<button type="button" data-gie-tab="${safe(item.id)}">${safe(item.label)}</button>`).join('')}</nav>`:''}`;
    host.querySelectorAll('[data-gie-variant]').forEach(button=>button.addEventListener('click',()=>applyVariant(button.dataset.gieVariant)));
    host.querySelector('[data-gie-era]')?.addEventListener('change',e=>applyEra(e.target.value));
    host.querySelectorAll('[data-gie-tab]').forEach(button=>button.addEventListener('click',()=>{const id=button.dataset.gieTab,existing=document.querySelector(`[data-tab="${CSS.escape(id)}"]`);if(existing){existing.click();existing.scrollIntoView({behavior:reduced()?'auto':'smooth',block:'center'});return;}if(id==='experiences')document.getElementById('robloxExperienceHub')?.scrollIntoView({behavior:reduced()?'auto':'smooth'});}));
  }
  function childCard(entry){const game=entry?.game||{},profile=entry?.profile||{},visual=entry?.visual||{},image=mediaUrl(profile.banner)||mediaUrl(profile.card)||mediaUrl(profile.hero)||visual.cover||'';return`<a class="gie-hub-card" href="/game/roblox/${encodeURIComponent(game.slug||'')}">${image?`<img src="${safe(image)}" alt="" loading="lazy" decoding="async">`:`<div class="gie-card-fallback">${safe((game.name||'GI').slice(0,2).toUpperCase())}</div>`}<div><strong>${safe(game.name||'')}</strong><span>${safe((game.description||'').slice(0,125))}</span></div></a>`;}
  function renderHub(){
    const workspace=document.querySelector('.game-workspace');if(!workspace)return;let hub=document.getElementById('robloxExperienceHub');
    if(state.slug==='roblox'){
      if(!hub){hub=document.createElement('section');hub.id='robloxExperienceHub';hub.className='gie-hub';workspace.before(hub);}hub.hidden=false;hub.innerHTML=`<div class="gie-hub-head"><div><p>${safe(t('experience.robloxHubEyebrow','ROBLOX EXPERIENCES'))}</p><h2>${safe(t('experience.robloxHubTitle','Explore jogos dentro do Roblox'))}</h2></div></div><div class="gie-hub-grid">${(state.children||[]).map(childCard).join('')}</div>`;
    }else if(state.parent?.slug==='roblox'){
      if(hub)hub.hidden=true;let strip=document.getElementById('robloxChildSwitcher');if(!strip){strip=document.createElement('div');strip.id='robloxChildSwitcher';strip.className='gie-parent-strip';workspace.before(strip);}const items=state.children?.length?state.children:DEFAULT_CHILDREN.map(slug=>({game:{slug,name:slug.replaceAll('-',' ')}}));strip.innerHTML=`<a href="/game/roblox">← ${safe(t('experience.backRoblox','Voltar ao Roblox'))}</a><div class="gie-child-switcher"><span>${safe(t('experience.moreRoblox','Experiências Roblox'))}</span><select><option value="">${safe(t('experience.choose','Escolher experiência'))}</option>${items.map(e=>`<option value="${safe(e.game.slug)}" ${e.game.slug===state.slug?'selected':''}>${safe(e.game.name)}</option>`).join('')}</select></div>`;strip.querySelector('select')?.addEventListener('change',e=>{if(e.target.value)location.href=`/game/roblox/${encodeURIComponent(e.target.value)}`;});
    }
  }
  async function loadChildren(){try{const hub=await GV.api('/api/roblox/experiences');state.children=hub.hub?.children||[];}catch{state.children=[];}}
  async function resolve(){
    const token=++state.loading,q=buildQuery(),data=await GV.api(`/api/games/${encodeURIComponent(state.slug)}/personalization?${q}`);if(token!==state.loading)return null;state.resolved=data.state;state.parent=data.state.parent||state.parent;state.eraKey=data.state.era?.eraKey||data.state.parentEra?.eraKey||'';return data.state;
  }
  async function applyResolved(){
    const resolved=await resolve();if(!resolved)return;const root=document.getElementById('gamePage');if(!root)return;
    root.classList.add('gie-transitioning');document.documentElement.classList.add('gie-transitioning');
    applyDatasets(root,resolved);applyTokens(root,resolved);applyMedia(resolved);renderBar(resolved);renderHub();
    requestAnimationFrame(()=>{root.classList.remove('gie-transitioning');document.documentElement.classList.remove('gie-transitioning');});
    const activeVariant=state.slug==='roblox'?state.experienceKey:(state.parent?.slug==='roblox'?selectedRobloxExperience():'main');
    window.dispatchEvent(new CustomEvent('gameindex:personalization-applied',{detail:{state:resolved,music:resolved.resolved?.music||null,experienceKey:activeVariant,eraKey:state.eraKey,context:contextForMusic()}}));
  }
  async function init({game=null,slug=null}={}){state.game=game||state.game;state.slug=(slug||game?.slug||slugFromLocation()||'').toLowerCase();if(!state.slug)return;state.parent=null;try{const base=await GV.api(`/api/games/${encodeURIComponent(state.slug)}/experiences`);state.parent=base.parent||null;if(state.slug==='roblox'||state.parent?.slug==='roblox')await loadChildren();await applyResolved();state.initialized=true;}catch(error){console.warn('[GameIndex Personalization]',error?.message||error);}}
  async function applyVariant(key='main'){const wanted=key==='roblox-og'?'roblox-og':'main';localStorage.setItem(EXPERIENCE_KEY,wanted);if(state.slug==='roblox')state.experienceKey=wanted;await applyResolved();return true;}
  async function applyEra(key=''){const exp=state.slug==='roblox'?selectedRobloxExperience():'main';if(key)localStorage.setItem(eraStorageKey(state.slug==='roblox'?'roblox':state.slug,exp),key);else localStorage.removeItem(eraStorageKey(state.slug==='roblox'?'roblox':state.slug,exp));await applyResolved();return true;}
  function current(){return{...state,selectedRobloxExperience:selectedRobloxExperience()};}
  addEventListener('gameindex:music-variant',event=>{const v=event.detail?.variant;if((state.slug==='roblox'||state.parent?.slug==='roblox')&&v&&v!==selectedRobloxExperience())applyVariant(v);});
  window.GameIndexPersonalization=Object.freeze({init,applyVariant,applyEra,current,slugFromLocation});
  window.GameIndexExperience=window.GameIndexPersonalization;
})();
