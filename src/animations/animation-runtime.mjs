import { validateAnimationDefinition } from "./animation-schema.mjs";

const COLOR_MAP=Object.freeze({
  CREATOR_GOLD:"#e7bd5b",CREATOR_RED:"#a62a39",DEV_RED:"#ff6674",DEV_BLUE:"#54a8ff",
  TESTER_BLUE:"#58a6ff",PRO_GREEN:"#63e69a",DARK_CABLE:"#111318",LIGHT_CABLE:"#f4f5f6",
  GAMEINDEX_WHITE:"#f4f4f2",GAMEINDEX_BLACK:"#050709",GAMEINDEX_PANEL:"#111821",GAMEINDEX_BORDER:"#2d3a49"
});

export function animationRuntimePayload(definition){
  const safe=validateAnimationDefinition(definition);
  return {
    ...safe,
    colors:Object.fromEntries(Object.entries(COLOR_MAP)),
    renderer:"GI_ANIMATION_RUNTIME_V1",
    executable:false
  };
}

export function resolveAnimationColor(value){
  const key=String(value||"").toUpperCase();
  return COLOR_MAP[key]||String(value||"#f4f4f2");
}
