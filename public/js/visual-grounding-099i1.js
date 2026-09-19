(()=>{
  'use strict';
  const ICONS={
    JOLLY_ROGER:`<svg viewBox="0 0 120 120" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round"><path d="M26 95L94 25M26 25l68 70"/><circle cx="60" cy="50" r="25" fill="currentColor" stroke="none"/><circle cx="51" cy="46" r="5" fill="var(--gi-page-bg)" stroke="none"/><circle cx="69" cy="46" r="5" fill="var(--gi-page-bg)" stroke="none"/><path d="M50 65h20" stroke="var(--gi-page-bg)"/><path d="M55 58l5-5 5 5" stroke="var(--gi-page-bg)"/></g></svg>`,
    BLOX_FRUIT:`<svg viewBox="0 0 120 120" aria-hidden="true"><path fill="currentColor" d="M61 27c19-11 39 5 37 26-2 27-18 47-38 47S25 79 23 55c-2-22 18-39 38-28Z"/><path d="M58 28c3-14 17-20 29-17-7 6-11 12-13 21" fill="none" stroke="currentColor" stroke-width="8" stroke-linecap="round"/><path d="M38 49c8-8 14-8 22 0 8-8 14-8 22 0M34 67c8-8 14-8 22 0 8-8 14-8 22 0" fill="none" stroke="var(--gi-page-bg)" stroke-width="5" stroke-linecap="round"/></svg>`,
    FRUIT_SYMBOL:`<svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="65" r="34" fill="currentColor"/><path d="M59 33c4-14 16-22 31-20-5 12-15 20-31 20Z" fill="currentColor"/><path d="M48 61c9-9 16-9 25 0M45 77c10-9 19-9 29 0" fill="none" stroke="var(--gi-page-bg)" stroke-width="5" stroke-linecap="round"/></svg>`,
    NAVAL_COMPASS:`<svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="42" fill="none" stroke="currentColor" stroke-width="6"/><path d="M60 24l12 30 24 6-30 12-6 24-12-30-24-6 30-12Z" fill="currentColor"/><circle cx="60" cy="60" r="7" fill="var(--gi-page-bg)"/></svg>`,
    PIRATE_MAP:`<svg viewBox="0 0 120 120" aria-hidden="true"><path d="M20 30l26-10 28 10 26-10v70L74 100 46 90l-26 10Z" fill="none" stroke="currentColor" stroke-width="6"/><path d="M46 20v70M74 30v70M31 73c17-7 27-22 40-16 11 5 12 17 18 23M84 43l14 14m0-14L84 57" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"/></svg>`,
    KATANA_SILHOUETTE:`<svg viewBox="0 0 120 120" aria-hidden="true"><path d="M22 94c32-10 58-36 78-72-8 38-31 68-67 86Z" fill="currentColor"/><path d="M24 82l15 15M18 100l15-15" stroke="currentColor" stroke-width="7" stroke-linecap="round"/></svg>`,
    GAME_PIZZA:`<svg viewBox="0 0 120 120" aria-hidden="true"><path d="M17 28h86L62 104Z" fill="currentColor"/><path d="M18 28c17-16 67-16 84 0" fill="none" stroke="currentColor" stroke-width="15" stroke-linecap="round"/><circle cx="52" cy="55" r="8" fill="var(--gi-page-bg)"/><circle cx="72" cy="70" r="7" fill="var(--gi-page-bg)"/><circle cx="45" cy="77" r="6" fill="var(--gi-page-bg)"/></svg>`,
    GAME_PIZZA_BOX:`<svg viewBox="0 0 120 120" aria-hidden="true"><path d="M20 36h80v58H20Z" fill="none" stroke="currentColor" stroke-width="7"/><path d="M20 36l15-15h50l15 15M35 21l25 15 25-15" fill="none" stroke="currentColor" stroke-width="6"/><circle cx="60" cy="65" r="20" fill="none" stroke="currentColor" stroke-width="5"/><path d="M60 45v40M40 65h40" stroke="currentColor" stroke-width="4"/></svg>`,
    RESTAURANT_COUNTER:`<svg viewBox="0 0 120 120" aria-hidden="true"><path d="M18 50h84v48H18Z" fill="none" stroke="currentColor" stroke-width="7"/><path d="M12 50h96M32 50V28h56v22M42 28v-9h36v9" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round"/><circle cx="40" cy="73" r="5" fill="currentColor"/><circle cx="60" cy="73" r="5" fill="currentColor"/><circle cx="80" cy="73" r="5" fill="currentColor"/></svg>`,
    FISCH_FISH:`<svg viewBox="0 0 120 120" aria-hidden="true"><path d="M18 60c18-25 49-32 72-14l18-14-4 28 4 28-18-14c-23 18-54 11-72-14Z" fill="currentColor"/><circle cx="72" cy="54" r="4" fill="var(--gi-page-bg)"/><path d="M44 56c8 8 8 14 0 22" fill="none" stroke="var(--gi-page-bg)" stroke-width="5" stroke-linecap="round"/></svg>`,
    FISHING_HOOK:`<svg viewBox="0 0 120 120" aria-hidden="true"><path d="M68 10v57c0 18-10 31-25 31-13 0-23-9-23-22 0-10 6-18 16-21" fill="none" stroke="currentColor" stroke-width="8" stroke-linecap="round"/><path d="M54 18h28M68 10v8" stroke="currentColor" stroke-width="7" stroke-linecap="round"/></svg>`,
    WATER_WAVE:`<svg viewBox="0 0 120 120" aria-hidden="true"><path d="M8 48c14-14 26-14 40 0s26 14 40 0 22-14 28-6M8 72c14-14 26-14 40 0s26 14 40 0 22-14 28-6" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round"/></svg>`,
    FISHING_LINE:`<svg viewBox="0 0 120 120" aria-hidden="true"><path d="M14 25c28-16 64-6 74 23 9 27-9 47-37 47" fill="none" stroke="currentColor" stroke-width="5"/><circle cx="51" cy="95" r="7" fill="currentColor"/></svg>`,
    BOAT_DETAIL:`<svg viewBox="0 0 120 120" aria-hidden="true"><path d="M19 72h82l-15 24H34Z" fill="currentColor"/><path d="M58 20v52M58 25l32 30H58Z" fill="none" stroke="currentColor" stroke-width="7" stroke-linejoin="round"/></svg>`,
    DOOR_FRAME:`<svg viewBox="0 0 120 120" aria-hidden="true"><path d="M28 105V15h64v90" fill="none" stroke="currentColor" stroke-width="8"/><path d="M42 105V31h37v74" fill="none" stroke="currentColor" stroke-width="6"/><circle cx="69" cy="69" r="4" fill="currentColor"/></svg>`,
    ROOM_NUMBER:`<svg viewBox="0 0 120 120" aria-hidden="true"><rect x="18" y="30" width="84" height="60" rx="8" fill="none" stroke="currentColor" stroke-width="7"/><text x="60" y="72" text-anchor="middle" font-size="35" font-family="monospace" font-weight="800" fill="currentColor">001</text></svg>`,
    HOTEL_CORRIDOR:`<svg viewBox="0 0 120 120" aria-hidden="true"><path d="M10 105l28-82h44l28 82M38 23v82M82 23v82M10 105h100" fill="none" stroke="currentColor" stroke-width="6"/><path d="M49 47h22v38H49Z" fill="none" stroke="currentColor" stroke-width="5"/></svg>`,
    ELEVATOR_DETAIL:`<svg viewBox="0 0 120 120" aria-hidden="true"><rect x="25" y="18" width="70" height="84" rx="5" fill="none" stroke="currentColor" stroke-width="7"/><path d="M60 18v84M45 42l15-14 15 14M45 79l15 14 15-14" fill="none" stroke="currentColor" stroke-width="5"/></svg>`,
    PRISON_BAR:`<svg viewBox="0 0 120 120" aria-hidden="true"><path d="M22 14v92M48 14v92M74 14v92M100 14v92M12 32h98M12 88h98" fill="none" stroke="currentColor" stroke-width="8"/></svg>`,
    PRISON_SIGN:`<svg viewBox="0 0 120 120" aria-hidden="true"><rect x="13" y="34" width="94" height="52" rx="5" fill="none" stroke="currentColor" stroke-width="7"/><text x="60" y="67" text-anchor="middle" font-size="22" font-family="monospace" font-weight="800" fill="currentColor">CELL</text></svg>`,
    SECURITY_LIGHT:`<svg viewBox="0 0 120 120" aria-hidden="true"><path d="M39 75V51c0-14 9-25 21-25s21 11 21 25v24" fill="currentColor"/><path d="M28 91h64M18 48H7M113 48h-11M26 23L17 14M94 23l9-9" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round"/></svg>`,
    CLASSIC_ROBLOX_BLOCK_DETAIL:`<svg viewBox="0 0 120 120" aria-hidden="true"><path d="M24 28h72v64H24Z" fill="none" stroke="currentColor" stroke-width="7"/><circle cx="42" cy="47" r="6" fill="currentColor"/><circle cx="60" cy="47" r="6" fill="currentColor"/><circle cx="78" cy="47" r="6" fill="currentColor"/><path d="M38 70h44" stroke="currentColor" stroke-width="7" stroke-linecap="round"/></svg>`
  };
  const LIMIT={LOW:5,MEDIUM:8,HIGH:11};
  const placements=['hero','edge-right','section','between','edge-left','card','hero','section','between','edge-right','section'];
  function clear(){document.querySelectorAll('.gi099i1-decorative-layer').forEach(x=>x.remove());}
  function apply(identity,entity){
    clear();
    if(!identity?.visualGrounding||entity?.entityType!=='EXPERIENCE')return;
    const page=document.querySelector('.game-page');if(!page)return;
    const grounding=identity.visualGrounding,motifs=(grounding.motifs||[]).filter(x=>ICONS[x]);if(!motifs.length)return;
    const layer=document.createElement('div');layer.className=`gi099i1-decorative-layer density-${String(grounding.density||'MEDIUM').toLowerCase()}`;layer.setAttribute('aria-hidden','true');layer.dataset.visualLanguage=grounding.visualLanguage||'';
    const count=Math.min(LIMIT[grounding.density]||8,Math.max(motifs.length,motifs.length*2));
    for(let i=0;i<count;i++){
      const type=motifs[i%motifs.length],node=document.createElement('span');node.className=`gi099i1-motif gi099i1-${placements[i%placements.length]} motif-${type.toLowerCase().replaceAll('_','-')}`;node.dataset.motif=type;node.innerHTML=ICONS[type];layer.appendChild(node);
    }
    page.prepend(layer);
    document.documentElement.dataset.giVisualGrounding=grounding.visualLanguage||'grounded';
  }
  window.GameIndexVisualGrounding099I1={apply,clear,icons:Object.freeze(Object.keys(ICONS))};
})();
