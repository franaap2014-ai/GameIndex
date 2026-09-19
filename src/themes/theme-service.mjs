import { db } from "../database/connection.mjs";
import { getEffectiveTier } from "../database/repositories/entitlement-repository.mjs";

export const THEMES=Object.freeze({
  FREE_DARK:{id:"FREE_DARK",name:"Escuro",identity:"FREE",mode:"dark",accent:"neutral"},
  FREE_LIGHT:{id:"FREE_LIGHT",name:"Claro",identity:"FREE",mode:"light",accent:"neutral",devLightSpecial:true},
  PRO_GREEN:{id:"PRO_GREEN",name:"Pro Green",identity:"PRO",mode:"dark",accent:"green"},
  TESTER_BLUE:{id:"TESTER_BLUE",name:"Tester Blue",identity:"TESTER",mode:"dark",accent:"tester-blue"},
  DEV_RED:{id:"DEV_RED",name:"Dev Red",identity:"DEV",mode:"dark",accent:"red"},
  DEV_GREEN:{id:"DEV_GREEN",name:"Dev Green",identity:"DEV",mode:"dark",accent:"green-dev"},
  DEV_BLUE:{id:"DEV_BLUE",name:"Dev Blue",identity:"DEV",mode:"dark",accent:"blue"},
  CREATOR_TECH:{id:"CREATOR_TECH",name:"Creator",identity:"CREATOR",mode:"dark",accent:"creator-gold"}
});
const ORDER=["FREE_DARK","FREE_LIGHT","PRO_GREEN","TESTER_BLUE","DEV_RED","DEV_GREEN","DEV_BLUE","CREATOR_TECH"];
function staffRole(userId){try{return String(db.prepare(`SELECT role FROM staff_role_assignments WHERE user_id=?`).get(userId)?.role||"NONE").toUpperCase();}catch{return "NONE";}}
function availableIds(userId){const role=staffRole(userId),plan=getEffectiveTier(userId),ids=new Set(["FREE_DARK","FREE_LIGHT"]);if(plan==="PRO"||plan==="DEV"||role==="CREATOR")ids.add("PRO_GREEN");if(role==="TESTER"||role==="CREATOR")ids.add("TESTER_BLUE");if(role==="DEV"||plan==="DEV"||role==="CREATOR"){ids.add("DEV_RED");ids.add("DEV_GREEN");ids.add("DEV_BLUE");}if(role==="CREATOR")ids.add("CREATOR_TECH");return ids;}
export function normalizeTheme(value="FREE_DARK"){const v=String(value||"").trim().toUpperCase().replaceAll("-","_");if(v==="DARK")return "FREE_DARK";if(v==="LIGHT")return "FREE_LIGHT";return THEMES[v]?v:"FREE_DARK";}
export function themesForTier(tier="FREE"){const t=String(tier).toUpperCase();return ORDER.filter(id=>THEMES[id].identity==="FREE"||(t==="PRO"&&THEMES[id].identity==="PRO")||(t==="DEV"&&["PRO","DEV"].includes(THEMES[id].identity))).map(id=>THEMES[id]);}
export function themesForUser(userId){const allowed=availableIds(userId);return ORDER.filter(id=>allowed.has(id)).map(id=>THEMES[id]);}
export function canUseTheme(userId,theme){return availableIds(userId).has(normalizeTheme(theme));}
export function themePublicState(userId,selectedTheme){const role=staffRole(userId),plan=getEffectiveTier(userId),identity=role!=="NONE"?role:plan,theme=normalizeTheme(selectedTheme),allowed=canUseTheme(userId,theme)?theme:(role==="CREATOR"?"CREATOR_TECH":role==="TESTER"?"TESTER_BLUE":role==="DEV"||plan==="DEV"?"DEV_RED":plan==="PRO"?"PRO_GREEN":"FREE_DARK");return {tier:identity,plan,staffRole:role,selectedTheme:allowed,availableThemes:themesForUser(userId),devLightSpecial:(role==="DEV"||plan==="DEV")&&allowed==="FREE_LIGHT"};}
