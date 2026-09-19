(()=>{
  'use strict';
  let state={identity:null,entity:null,bindings:[]},observer=null;
  const DENSITY_ORDER=['SPARSE','BALANCED','RICH','IMMERSIVE'];
  const LIMIT={SPARSE:4,BALANCED:8,RICH:16,IMMERSIVE:24};
  const cleanDensity=value=>DENSITY_ORDER.includes(String(value||'').toUpperCase())?String(value).toUpperCase():'RICH';
  function constrained(){const saveData=Boolean(navigator.connection?.saveData),cores=Number(navigator.hardwareConcurrency||8),reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;return {saveData,lowCpu:cores>0&&cores<=2,reduced};}
  function effectiveDensity(authored){const wanted=cleanDensity(authored),c=constrained();if(c.saveData||c.lowCpu){if(wanted==='IMMERSIVE')return'BALANCED';if(wanted==='RICH')return'BALANCED';}if(c.reduced&&wanted==='IMMERSIVE')return'RICH';return wanted;}
  function clearI2(){observer?.disconnect();observer=null;document.querySelectorAll('.gi099i2-grounding,.gi099i2-section-accent').forEach(x=>x.remove());}
  function motifBinding(type){const key=`MOTIF:${String(type||'').toUpperCase()}`;return state.bindings.find(x=>x.status==='PUBLISHED'&&x.elementKey===key&&x.elementRole!=='DECORATIVE')||null;}
  function sourceMotifs(){return [...document.querySelectorAll('.gi099i1-decorative-layer .gi099i1-motif')];}
  function makeMotif(source,index,context='section'){
    const type=String(source?.dataset?.motif||'').toUpperCase();if(!type)return null;const binding=motifBinding(type),node=document.createElement(binding?'button':'span');
    node.className=`gi099i2-section-accent gi099i2-${context} motif-${type.toLowerCase().replaceAll('_','-')}`;node.innerHTML=source.innerHTML;node.dataset.motif=type;node.dataset.giElementKey=`MOTIF:${type}`;node.style.setProperty('--gi-i2-index',String(index));
    if(binding){node.type='button';node.setAttribute('aria-label',binding.parameters?.label||type.replaceAll('_',' ').toLowerCase());node.dataset.giInteractive='true';}
    else node.setAttribute('aria-hidden','true');
    return node;
  }
  function decorateAnchor(anchor,source,index,context){if(!anchor||anchor.querySelector(':scope > .gi099i2-grounding'))return;const wrap=document.createElement('div');wrap.className=`gi099i2-grounding gi099i2-grounding-${context}`;wrap.setAttribute('aria-hidden','true');const motif=makeMotif(source,index,context);if(!motif)return;wrap.appendChild(motif);if(motif.dataset.giInteractive==='true')wrap.removeAttribute('aria-hidden');anchor.prepend(wrap);}
  function refresh(){
    document.querySelectorAll('.gi099i2-grounding').forEach(x=>x.remove());
    const sources=sourceMotifs();if(!sources.length)return;const authored=state.identity?.visualGrounding?.density||state.identity?.visualDensity||'RICH',density=effectiveDensity(authored),limit=LIMIT[density]||16,policy=state.identity?.visualPolicy||state.identity?.visualGrounding?.policy||{};
    document.documentElement.dataset.giVisualDensityAuthored=cleanDensity(authored);document.documentElement.dataset.giVisualDensity=density;document.documentElement.dataset.giVisualContinuity=policy.continuity===false?'off':'on';
    const priority=[document.querySelector('.game-hero'),document.querySelector('.gi099-universe'),document.querySelector('.game-workspace'),document.querySelector('.related-panel:not(.hidden)')].filter(Boolean);
    const sections=policy.continuity===false||policy.sectionReinforcement===false?[]:[...document.querySelectorAll('.gi099-section')];const anchors=[...priority,...sections].slice(0,limit);
    anchors.forEach((anchor,index)=>decorateAnchor(anchor,sources[index%sources.length],index,index<priority.length?'major':'section'));
    if('IntersectionObserver'in window){observer?.disconnect();observer=new IntersectionObserver(entries=>{for(const entry of entries)entry.target.toggleAttribute('data-gi-visible',entry.isIntersecting);},{rootMargin:'120px 0px',threshold:.01});document.querySelectorAll('.gi099i2-grounding').forEach(x=>observer.observe(x));}
    window.dispatchEvent(new CustomEvent('gameindex:visual-grounding-i2-ready',{detail:{authoredDensity:cleanDensity(authored),effectiveDensity:density,anchors:anchors.length,motifs:sources.length}}));
  }
  function apply(identity,entity,bindings=[]){clearI2();state={identity,entity,bindings:Array.isArray(bindings)?bindings:[]};window.GameIndexVisualGrounding099I1?.apply?.(identity,entity);if(!identity?.visualGrounding||entity?.entityType!=='EXPERIENCE')return;requestAnimationFrame(refresh);}
  function clear(){clearI2();window.GameIndexVisualGrounding099I1?.clear?.();delete document.documentElement.dataset.giVisualDensity;delete document.documentElement.dataset.giVisualDensityAuthored;delete document.documentElement.dataset.giVisualContinuity;}
  window.GameIndexVisualGrounding099I2=Object.freeze({apply,refresh,clear,effectiveDensity,getState:()=>({...state})});
})();
