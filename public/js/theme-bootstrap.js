(()=>{
  const allowed=new Set(["free-dark","free-light","pro-green","tester-blue","dev-red","dev-green","dev-blue","creator-tech"]);
  const raw=String(localStorage.getItem("gv_theme")||"free-dark").toLowerCase().replaceAll("_","-");
  const theme=allowed.has(raw)?raw:"free-dark";
  const tier=String(localStorage.getItem("gv_tier")||"FREE").toUpperCase();
  const root=document.documentElement;
  root.dataset.theme=theme;
  root.dataset.tier=tier;
  if((tier==="DEV"||tier==="CREATOR")&&theme==="free-light")root.dataset.devLight="1";else delete root.dataset.devLight;
})();
