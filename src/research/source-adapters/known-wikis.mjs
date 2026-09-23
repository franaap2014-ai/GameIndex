// Direct community source entry points, checked 2026-09-23. No facts are seeded.
// Documents still pass the normal fetch, ranking and evidence validation.
const sources={
  'blox-fruits':{
    WIKI:['https://bloxfruitswiki.org/wiki/blox-fruits-wiki/','https://bloxfruitswiki.org/wiki/fruit-spawn-locations/'],
    FANDOM:['https://blox-fruits.fandom.com/wiki/Blox_Fruits_Wiki','https://blox-fruits.fandom.com/wiki/Fruit_Spawn_Locations']
  }
};
export function knownWikiSources(game,family){return (sources[String(game?.slug||'').toLowerCase()]?.[family]||[]).map(url=>({url,title:game.nome||game.name||''}));}
