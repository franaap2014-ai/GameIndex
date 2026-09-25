(()=>{const memory={local:new Map(),session:new Map()};window.GIStorage={};for(const kind of ['local','session'])window.GIStorage[kind]={getItem(key){try{return window[kind+'Storage'].getItem(key)??memory[kind].get(key)??null;}catch{return memory[kind].get(key)??null;}},setItem(key,value){memory[kind].set(key,String(value));try{window[kind+'Storage'].setItem(key,String(value));}catch{}},removeItem(key){memory[kind].delete(key);try{window[kind+'Storage'].removeItem(key);}catch{}}};})();
(()=>{
  const allowed=new Set(["free-dark","free-light","pro-green","tester-blue","dev-red","dev-green","dev-blue","creator-tech"]);
  const raw=String(window.GIStorage.local.getItem("gv_theme")||"free-dark").toLowerCase().replaceAll("_","-");
  const theme=allowed.has(raw)?raw:"free-dark";
  const tier=String(window.GIStorage.local.getItem("gv_tier")||"FREE").toUpperCase();
  const root=document.documentElement;
  root.dataset.theme=theme;
  root.dataset.tier=tier;
  if((tier==="DEV"||tier==="CREATOR")&&theme==="free-light")root.dataset.devLight="1";else delete root.dataset.devLight;
})();
