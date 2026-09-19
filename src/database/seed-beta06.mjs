import { findGameByNameOrAlias, listGames, getGameBySlug, getGameById } from "./repositories/game-repository.mjs";
import { upsertEntity } from "./repositories/entity-repository.mjs";
import { upsertKnowledge, listKnowledge } from "./repositories/knowledge-repository.mjs";
import { upsertSource } from "./repositories/source-repository.mjs";
import { upsertCoverage } from "./repositories/coverage-repository.mjs";
import { nowIso } from "./connection.mjs";

const ENTITY_ALIASES={
  "Minecraft|Diamond Sword":["Espada de Diamante","Espada Diamante"],
  "Minecraft|Netherite Sword":["Espada de Netherite"],
  "Minecraft|Diamond Pickaxe":["Picareta de Diamante"],
  "Minecraft|Iron Pickaxe":["Picareta de Ferro"],
  "Minecraft|Ender Pearl":["Pérola do End","Perola do End"],
  "Minecraft|Eye of Ender":["Olho do End"],
  "Counter-Strike 2|Economy":["Economia"],
  "Grand Theft Auto V|Wanted Level":["Nível de Procurado","Nivel de Procurado"]
};

export const BETA06_ENTITY_PACK=[
  // Minecraft
  ["Minecraft","Crafting Table","item","items","tools","Crafting Table","A Crafting Table expands the crafting grid and is a central workstation for many recipes.",["crafting","workstation"]],
  ["Minecraft","Furnace","item","items","tools","Furnace","A Furnace smelts ores and cooks several resources using fuel.",["smelting","workstation"]],
  ["Minecraft","Diamond Sword","weapon","items","weapons","Diamond Sword","A Diamond Sword is a high-tier melee weapon crafted from diamonds and a stick and can receive weapon enchantments.",["weapon","crafting"]],
  ["Minecraft","Netherite Sword","weapon","items","weapons","Netherite Sword","A Netherite Sword is an upgraded late-game melee weapon created from a Diamond Sword through the smithing upgrade system in modern Minecraft.",["weapon","upgrade"]],
  ["Minecraft","Iron Pickaxe","tool","items","tools","Iron Pickaxe","An Iron Pickaxe is a common progression tool used to mine many important ores and blocks.",["tool","mining"]],
  ["Minecraft","Diamond Pickaxe","tool","items","tools","Diamond Pickaxe","A Diamond Pickaxe is a durable high-tier mining tool and is commonly used before upgrading to Netherite.",["tool","mining"]],
  ["Minecraft","Ender Pearl","item","items","other","Ender Pearl","Ender Pearls can teleport the player when thrown and are also used when crafting Eyes of Ender.",["item","progression"]],
  ["Minecraft","Eye of Ender","item","items","other","Eye of Ender","Eyes of Ender are used to locate strongholds and activate End Portal frames.",["item","progression"]],
  ["Minecraft","Creeper","mob","mobs","hostile","Creeper","Creepers are hostile mobs known for approaching players and exploding at close range.",["mob","hostile"]],
  ["Minecraft","Zombie","mob","mobs","hostile","Zombie","Zombies are common hostile mobs that appear in dark conditions and attack players.",["mob","hostile"]],
  ["Minecraft","Villager","mob","mobs","npcs","Villager","Villagers live in villages and can trade with players through profession-based trade offers.",["mob","trading"]],
  ["Minecraft","Ender Dragon","boss","mobs","bosses","Ender Dragon","The Ender Dragon is the major boss encountered in The End and is central to the game's conventional progression route.",["boss","the end"]],
  ["Minecraft","Nether","location","maps","regions","The Nether","The Nether is a separate dimension containing unique biomes, structures, mobs and resources.",["dimension","location"]],
  ["Minecraft","The End","location","maps","regions","The End","The End is a separate dimension associated with the Ender Dragon, Endermen and End Cities.",["dimension","location"]],
  ["Minecraft","Stronghold","location","maps","locations","Stronghold","Strongholds are underground structures that can contain End Portal rooms.",["structure","progression"]],
  ["Minecraft","Ancient City","location","maps","locations","Ancient City","Ancient Cities are large structures associated with the Deep Dark biome and the Warden's environment.",["structure","deep dark"]],
  ["Minecraft","Enchanting","mechanic","gameplay","progression","Enchanting","Enchanting improves equipment with additional effects and is a major part of long-term gear progression.",["mechanic","progression"]],
  ["Minecraft","First Night","guide","guides","beginner","First Night","A beginner route usually prioritizes basic tools, food, shelter and light before exploring more dangerous areas.",["guide","beginner"]],

  // Fortnite
  ["Fortnite","Storm","mechanic","gameplay","mechanics","Storm","The Storm is the Battle Royale zone-pressure mechanic that progressively limits the safe playable area.",["mechanic","battle royale"]],
  ["Fortnite","Battle Bus","mechanic","gameplay","mechanics","Battle Bus","The Battle Bus carries players over the Battle Royale island before they choose where to drop.",["mechanic","battle royale"]],
  ["Fortnite","Loot","mechanic","gameplay","progression","Loot System","Players collect weapons, healing items, utility and other resources during a Battle Royale match.",["loot","battle royale"]],
  ["Fortnite","Building","mechanic","gameplay","combat","Building","In build-enabled Fortnite modes, harvested materials can be used to place structures during movement and combat.",["building","combat"]],
  ["Fortnite","Zero Build","mode","gameplay","mechanics","Zero Build","Zero Build is a Fortnite Battle Royale ruleset that removes traditional player-built structures and emphasizes movement, cover and combat.",["mode","battle royale"]],
  ["Fortnite","Weapons","weapon","weapons","primary","Fortnite Weapons","Fortnite's weapon pool changes over time, so current weapon availability and balance should be treated as season- or patch-sensitive knowledge.",["weapons","versioned"]],
  ["Fortnite","Shield","item","gameplay","progression","Shield","Shield is a defensive resource used alongside health in Fortnite Battle Royale.",["shield","survival"]],
  ["Fortnite","Island","location","maps","regions","Battle Royale Island","The Battle Royale island is the main match space and changes across chapters, seasons and updates.",["map","versioned"]],
  ["Fortnite","Rotation","mechanic","gameplay","strategy","Rotation","Rotation describes movement between positions and safe zones as the match and Storm progress.",["strategy","movement"]],
  ["Fortnite","Beginner Survival","guide","guides","beginner","Battle Royale Beginner Priorities","Beginner play benefits from learning drop choices, looting, safe-zone timing, movement and basic combat before optimizing advanced strategies.",["guide","beginner"]],

  // Counter-Strike 2
  ["Counter-Strike 2","AK-47","weapon","weapons","primary","AK-47","The AK-47 is a Terrorist-side rifle known for high damage and strong first-shot lethality when accurately aimed.",["weapon","rifle"]],
  ["Counter-Strike 2","M4A1-S","weapon","weapons","primary","M4A1-S","The M4A1-S is one of the Counter-Terrorist rifle choices and is designed around controlled rifle play.",["weapon","rifle"]],
  ["Counter-Strike 2","AWP","weapon","weapons","primary","AWP","The AWP is a high-cost sniper rifle built around powerful scoped shots and strong positioning.",["weapon","sniper"]],
  ["Counter-Strike 2","Desert Eagle","weapon","weapons","secondary","Desert Eagle","The Desert Eagle is a powerful pistol that rewards accurate shots but is less forgiving when fired carelessly.",["weapon","pistol"]],
  ["Counter-Strike 2","Smoke Grenade","item","gameplay","strategy","Smoke Grenade","Smoke grenades block vision and are central to map control, executes, retakes and rotations.",["utility","strategy"]],
  ["Counter-Strike 2","Flashbang","item","gameplay","strategy","Flashbang","Flashbangs temporarily impair vision when used effectively and are a core team utility tool.",["utility","strategy"]],
  ["Counter-Strike 2","Economy","mechanic","gameplay","progression","Round Economy","Teams earn and spend money across rounds, making buy decisions a strategic part of competitive play.",["economy","competitive"]],
  ["Counter-Strike 2","Mirage","map","maps","locations","Mirage","Mirage is a competitive Counter-Strike map built around two bomb sites, connector routes and mid control.",["map","competitive"]],
  ["Counter-Strike 2","Inferno","map","maps","locations","Inferno","Inferno is a competitive Counter-Strike map with two bomb sites and important chokepoints that reward coordinated utility.",["map","competitive"]],
  ["Counter-Strike 2","Crosshair Placement","mechanic","guides","beginner","Crosshair Placement","Keeping the crosshair near likely enemy head level and common angles reduces the correction needed when a fight begins.",["guide","aim"]],

  // Roblox
  ["Roblox","Roblox Studio","tool","guides","beginner","Roblox Studio","Roblox Studio is the primary creation environment used to build and publish Roblox experiences.",["development","studio"]],
  ["Roblox","Luau","mechanic","guides","advanced","Luau","Luau is Roblox's scripting language, derived from Lua and extended for the Roblox development environment.",["development","scripting"]],
  ["Roblox","Experience","mechanic","experiences","discovery","Experiences","Roblox contains user-created experiences that may have completely different rules, progression and gameplay systems.",["platform","experience"]],
  ["Roblox","Avatar","character","items","other","Avatar System","A Roblox account can use avatar customization across the platform, while individual experiences may add their own character systems.",["avatar","platform"]],
  ["Roblox","Marketplace","mechanic","gameplay","mechanics","Marketplace Concepts","Roblox's broader ecosystem includes virtual items and creator systems, while individual experiences may have separate economies.",["platform","economy"]],
  ["Roblox","RemoteEvent","mechanic","guides","advanced","RemoteEvent","RemoteEvents are commonly used for one-way communication between Roblox client and server scripts in experiences.",["development","networking"]],
  ["Roblox","Server Authority","mechanic","guides","advanced","Server Validation","Important gameplay actions should be validated on the server instead of trusting the client blindly.",["development","security"]],
  ["Roblox","New Developer","guide","guides","beginner","First Roblox Project","A beginner developer benefits from learning Studio navigation, parts, properties, scripts, events and simple client/server concepts in small projects.",["guide","development"]],

  // GTA V
  ["Grand Theft Auto V","Michael De Santa","character","characters","main","Michael De Santa","Michael is one of GTA V's three central playable protagonists.",["character","story"]],
  ["Grand Theft Auto V","Franklin Clinton","character","characters","main","Franklin Clinton","Franklin is one of GTA V's three central playable protagonists.",["character","story"]],
  ["Grand Theft Auto V","Trevor Philips","character","characters","main","Trevor Philips","Trevor is one of GTA V's three central playable protagonists.",["character","story"]],
  ["Grand Theft Auto V","Los Santos","location","maps","locations","Los Santos","Los Santos is the main urban center of GTA V's map and is surrounded by broader areas of San Andreas.",["location","map"]],
  ["Grand Theft Auto V","Blaine County","location","maps","regions","Blaine County","Blaine County covers a large rural and desert portion of GTA V's world outside central Los Santos.",["location","map"]],
  ["Grand Theft Auto V","Heists","mechanic","missions","main","Heists","Major heists are multi-stage missions that form an important part of GTA V's campaign structure.",["missions","story"]],
  ["Grand Theft Auto V","Character Switching","mechanic","guides","advanced","Character Switching","GTA V allows switching between its three protagonists in many parts of the game, including transitions across the world.",["mechanic","characters"]],
  ["Grand Theft Auto V","Wanted Level","mechanic","guides","advanced","Wanted Level","The wanted-level system represents law-enforcement pursuit and escalates as the player's actions attract more attention.",["mechanic","combat"]],

  // Smaller expansion for the rest of the library
  ["Sonic the Hedgehog","Rings","item","items","other","Rings","Rings act as collectibles and damage protection in classic Sonic gameplay.",["item","gameplay"]],
  ["Sonic the Hedgehog 2","Tails","character","characters","allies","Tails","Miles 'Tails' Prower is Sonic's ally and appears alongside Sonic in Sonic the Hedgehog 2.",["character","story"]],
  ["Sonic the Hedgehog 3","Knuckles","character","characters","main","Knuckles","Knuckles the Echidna is introduced as a major character in Sonic the Hedgehog 3's story.",["character","story"]],
  ["Sonic 3 & Knuckles","Angel Island","location","stages","zones","Angel Island","Angel Island is a central setting connecting major parts of the Sonic 3 & Knuckles story.",["location","story"]],
  ["Marvel's Spider-Man","Web Swinging","mechanic","gameplay","mechanics","Web Swinging","Web swinging is the primary high-speed traversal system across the open-world city.",["movement","gameplay"]],
  ["Marvel's Spider-Man: Miles Morales","Venom Powers","mechanic","abilities","core","Venom Powers","Miles uses bio-electric Venom abilities as a distinctive part of his combat toolkit.",["ability","combat"]],
  ["Marvel's Spider-Man 2","Web Wings","mechanic","gameplay","mechanics","Web Wings","Web Wings add gliding to traversal and combine with web swinging for faster movement through the city.",["movement","gameplay"]],
  ["Grand Theft Auto: San Andreas","CJ","character","characters","main","Carl Johnson","Carl 'CJ' Johnson is the protagonist of Grand Theft Auto: San Andreas.",["character","story"]],
  ["Grand Theft Auto IV","Niko Bellic","character","characters","main","Niko Bellic","Niko Bellic is the protagonist of Grand Theft Auto IV.",["character","story"]],
  ["Grand Theft Auto: Vice City","Tommy Vercetti","character","characters","main","Tommy Vercetti","Tommy Vercetti is the protagonist of Grand Theft Auto: Vice City.",["character","story"]]
];

function sourceFor(game){
  return upsertSource({url:`gamevault://seed-v2/${game.slug}`,title:`GameVault Knowledge Base V2 — ${game.nome}`,sourceType:"CURATED_SEED_V2",adapterKey:"seed-v2",quality:.74,metadata:{release:"Beta 0.6",revalidationRecommended:true}});
}


export function seedBeta06KnowledgeForGame(gameInput){
  const game=typeof gameInput==="object"&&gameInput?.id?gameInput:getGameById(String(gameInput||""))||getGameBySlug(String(gameInput||""))||findGameByNameOrAlias(String(gameInput||""));
  if(!game)return {gameId:null,gameSlug:null,matchedRows:0,entitiesBefore:0,entitiesAfter:0,knowledgeAfter:0};
  const rows=BETA06_ENTITY_PACK.filter(([gameName])=>findGameByNameOrAlias(gameName)?.id===game.id);
  let seeded=0;
  const source=rows.length?sourceFor(game):null;
  const entityIds=[];
  for(const [gameName,entityName,type,tab,section,title,summary,topics] of rows){
    const aliases=ENTITY_ALIASES[`${gameName}|${entityName}`]||[];
    const entity=upsertEntity({gameId:game.id,name:entityName,type,aliases,summary});
    upsertKnowledge({gameId:game.id,entityId:entity.id,title,summary,canonStatus:"NOT_APPLICABLE",status:"CURRENT",confidence:.74,verifiedAt:nowIso(),tabId:tab,sectionId:section,topics,claims:[{text:summary,canonStatus:"NOT_APPLICABLE",confidence:.74,status:"CURRENT",sourceIds:source?[source.id]:[],verifiedAt:nowIso()}]});
    entityIds.push(entity.id);seeded++;
  }
  const entitiesAfter=entityIds.length;
  return {gameId:game.id,gameSlug:game.slug,matchedRows:rows.length,seeded,entityIds,entitiesAfter,sourceId:source?.id||null};
}

export function seedBeta06Knowledge(){
  const sourceCache=new Map();
  for(const [gameName,entityName,type,tab,section,title,summary,topics] of BETA06_ENTITY_PACK){
    const game=findGameByNameOrAlias(gameName); if(!game)continue;
    let source=sourceCache.get(game.id); if(!source){source=sourceFor(game);sourceCache.set(game.id,source);}
    const aliases=ENTITY_ALIASES[`${gameName}|${entityName}`]||[];
    const entity=upsertEntity({gameId:game.id,name:entityName,type,aliases,summary});
    upsertKnowledge({gameId:game.id,entityId:entity.id,title,summary,canonStatus:"NOT_APPLICABLE",status:"CURRENT",confidence:.74,verifiedAt:nowIso(),tabId:tab,sectionId:section,topics,claims:[{text:summary,canonStatus:"NOT_APPLICABLE",confidence:.74,status:"CURRENT",sourceIds:[source.id],verifiedAt:nowIso()}]});
  }

  // Coverage V1: measurable and repeatable, based on current tab knowledge density.
  for(const row of listGames({includeDrafts:true})){
    const game=getGameBySlug(row.slug); if(!game)continue;
    const all=listKnowledge({gameId:game.id,limit:1000}).entries;
    const priority=["minecraft","fortnite","counter-strike-2","roblox","grand-theft-auto-v"].includes(game.slug);
    for(const tab of game.menu||[]){
      const count=all.filter(k=>k.tabId===tab.id&&!["REJECTED","OUTDATED","SUPERSEDED"].includes(k.status)).length;
      const expected=priority?8:4;
      upsertCoverage({gameId:game.id,categoryId:tab.id,expectedEntityCount:expected,knownEntityCount:count,validatedKnowledgeCount:count,coverageScore:Math.min(1,count/expected),lastExpansionAt:nowIso()});
    }
  }
}
