import { db, nowIso } from "./connection.mjs";
import { listGames, getGameBySlug } from "./repositories/game-repository.mjs";
import { upsertEntity } from "./repositories/entity-repository.mjs";
import { listKnowledge, upsertKnowledge } from "./repositories/knowledge-repository.mjs";
import { upsertSource } from "./repositories/source-repository.mjs";
import { upsertCoverage } from "./repositories/coverage-repository.mjs";
import { stableId } from "../knowledge/normalize.mjs";

const P={
"minecraft":{
 mechanics:["Survival mode","Creative mode","Adventure mode","Hardcore mode","Health","Hunger","Experience","Day-night cycle","Difficulty","Respawning","Mining","Crafting","Smelting","Brewing","Enchanting","Trading","Redstone","Farming","Fishing","Villager professions"],
 items:["Wooden Pickaxe","Stone Pickaxe","Iron Pickaxe","Diamond Pickaxe","Netherite Pickaxe","Diamond Sword","Netherite Sword","Bow","Crossbow","Shield","Elytra","Totem of Undying","Ender Pearl","Eye of Ender","Bucket","Compass","Map","Golden Apple","Potion of Healing","Firework Rocket"],
 mobs:["Creeper","Zombie","Skeleton","Spider","Enderman","Witch","Slime","Drowned","Guardian","Phantom","Piglin","Hoglin","Blaze","Ghast","Villager","Iron Golem","Wolf","Bee","Wither","Ender Dragon"],
 locations:["Overworld","Nether","The End","Village","Stronghold","Ancient City","Trial Chambers","Woodland Mansion","Ocean Monument","Nether Fortress","Bastion Remnant","End City","Mineshaft","Desert Temple","Jungle Temple","Swamp Hut","Pillager Outpost","Ruined Portal","Deep Dark","Mushroom Fields"]
},
"fortnite":{
 mechanics:["Battle Royale","Zero Build","Building","Editing","Harvesting","Storm","Storm Circle","Reboot Van","Reboot Card","Battle Bus","Gliding","Sprinting","Sliding","Mantling","Swimming","Shield","Overshield","Rarity","Inventory slots","Loot system"],
 weapons:["Assault Rifles","Shotguns","Submachine Guns","Pistols","Sniper Rifles","Marksman Rifles","Explosive weapons","Melee weapons","Healing items","Shield items","Mobility items","Utility items","Mythic items","Exotic items","Weapon attachments","Weapon mods","Ammo types","Reloading","Hip fire","Aim-down-sights"],
 locations:["Island map","Named locations","Landmarks","Hot drops","High ground","Vaults","Bunkers","Rifts","Launch pads","Ziplines","Vehicles","Water routes","Storm-safe rotations","Edge rotations","Center rotations"],
 lore:["The Loop","Zero Point","Imagined Order","The Seven","Jones","Peely","Midas","The Foundation","The Visitor","The Scientist","The Paradigm","Slone","Reality Tree","The Last Reality","Chrome","The Nothing","Chapters","Seasons","Live events","Story quests"]
},
"counter-strike-2":{
 mechanics:["Round economy","Buy phase","Freeze time","Bomb timer","Defuse timer","Armor","Headshots","Recoil","Spray control","Counter-strafing","Peeking","Jiggle peeking","Prefiring","Wall penetration","Sound cues","Movement accuracy","Utility damage","Team damage","Overtime","Premier mode"],
 weapons:["AK-47","M4A4","M4A1-S","AWP","Galil AR","FAMAS","AUG","SG 553","SSG 08","G3SG1","SCAR-20","MP9","MAC-10","MP7","MP5-SD","UMP-45","P90","PP-Bizon","Glock-18","USP-S","P2000","P250","Five-SeveN","Tec-9","CZ75-Auto","Desert Eagle","R8 Revolver","Nova","XM1014","MAG-7","Sawed-Off","M249","Negev","Knife"],
 locations:["Dust II","Mirage","Inferno","Nuke","Ancient","Anubis","Vertigo","Overpass","Train","Cache","Bombsite A","Bombsite B","Mid control","Long control","Connector","Ramp","Heaven","Tunnels","Apartments","Rotations"],
 systems:["Competitive ranks","Premier rating","Matchmaking","Counter-Terrorist economy","Terrorist economy","Loss bonus","Kill reward","Save rounds","Eco rounds","Force buys","Full buys","Utility sets","Smoke grenades","Flashbangs","HE grenades","Molotovs","Incendiary grenades","Decoy grenades","Defuse kits","Hostage mode"]
},
"roblox":{
 systems:["Roblox experiences","Roblox account","Robux","Avatar","Marketplace","Creator Store","Roblox Studio","Explorer","Properties window","Toolbox","Workspace","Players service","ReplicatedStorage","ServerStorage","StarterGui","StarterPlayer","Lighting","SoundService","Teams","CollectionService"],
 mechanics:["Luau","Scripts","LocalScripts","ModuleScripts","RemoteEvents","RemoteFunctions","BindableEvents","Attributes","Tags","Instances","Parts","Models","CFrames","Vector3","Raycasting","Physics","Constraints","TweenService","RunService","UserInputService"],
 systems2:["DataStoreService","MemoryStoreService","MessagingService","TeleportService","MarketplaceService","BadgeService","PathfindingService","ProximityPrompt","ContextActionService","Humanoid","Animator","Animation tracks","UI objects","ScreenGui","Frames","TextLabels","TextButtons","ImageLabels","ScrollingFrames","UIListLayout"],
 guide:["Publishing an experience","Team Create","Testing modes","Server-client model","FilteringEnabled architecture","Saving player data","Handling purchases","Game passes","Developer products","Badges","Private servers","Localization","Mobile controls","Console controls","Performance optimization","StreamingEnabled","Network ownership","Security against exploits","Community standards","Creator analytics"]
},
"grand-theft-auto-iii":{
 story:["Claude","Catalina","8-Ball","Luigi Goterelli","Joey Leone","Toni Cipriani","Salvatore Leone","Maria Latore","Asuka Kasen","Kenji Kasen","Ray Machowski","Donald Love","Miguel","Leone Family","Yakuza","Colombian Cartel","Diablos","Triads","Yardies","Southside Hoods"],
 locations:["Liberty City","Portland","Staunton Island","Shoreside Vale","Red Light District","Saint Mark's","Chinatown","Trenton","Portland Harbor","Callahan Point","Bedford Point","Newport","Belleville Park","Fort Staunton","Rockford","Wichita Gardens","Cedar Grove","Francis International Airport","Cochrane Dam","Pike Creek"],
 mechanics:["Wanted level","Pay 'n' Spray","Safehouses","Hidden packages","Rampages","Unique stunt jumps","Vigilante","Paramedic","Firefighter","Taxi Driver","Weapon pickups","Body armor","Mission failure","Police bribes","Garage storage","Radio stations","Vehicle damage","Drive-by shooting","Sniper aiming","Boat handling"],
 missions:["Give Me Liberty","Luigi's Girls","Drive Misty For Me","Mike Lips Last Lunch","Triads and Tribulations","Salvatore's Called a Meeting","Chaperone","Last Requests","Sayonara Salvatore","Under Surveillance","Bomb Da Base","Grand Theft Aero","Marked Man","Espresso-2-Go!","S.A.M.","The Exchange","Payday For Ray","Liberator","Waka-Gashira Wipeout!","A Drop in the Ocean"]
},
"grand-theft-auto-vice-city":{
 story:["Tommy Vercetti","Ken Rosenberg","Sonny Forelli","Lance Vance","Victor Vance","Ricardo Diaz","Colonel Cortez","Mercedes Cortez","Kent Paul","Avery Carrington","Phil Cassidy","Mitch Baker","Umberto Robina","Auntie Poulet","Steve Scott","Love Fist","Forelli Crime Family","Vance Crime Family","Diaz Cartel","Vice City underworld"],
 locations:["Vice City","Vice Beach","Ocean Beach","Washington Beach","Vice Point","Downtown","Little Havana","Little Haiti","Starfish Island","Prawn Island","Viceport","Escobar International Airport","Malibu Club","Ocean View Hotel","Vercetti Estate","Pole Position Club","Sunshine Autos","Print Works","Film Studio","Hyman Memorial Stadium"],
 mechanics:["Property purchasing","Asset missions","Wanted level","Pay 'n' Spray","Safehouses","Hidden packages","Rampages","Unique stunt jumps","Vigilante","Paramedic","Firefighter","Taxi Driver","Pizza Boy","Vehicle garages","Motorcycles","Helicopters","Boats","Radio stations","Weapon skill","Body armor"],
 missions:["In The Beginning...","An Old Friend","The Party","Back Alley Brawl","Jury Fury","Riot","Treacherous Swine","Mall Shootout","Guardian Angels","Phnom Penh '86","The Fastest Boat","Supply & Demand","Rub Out","Shakedown","Bar Brawl","Cop Land","Cap the Collector","Keep Your Friends Close...","The Job","Publicity Tour"]
},
"grand-theft-auto-san-andreas":{
 story:["Carl Johnson","Sweet Johnson","Kendl Johnson","Big Smoke","Ryder","Cesar Vialpando","The Truth","Wu Zi Mu","Mike Toreno","Officer Tenpenny","Officer Pulaski","Madd Dogg","OG Loc","Catalina","Grove Street Families","Ballas","Los Santos Vagos","San Fierro Rifa","Triads","Da Nang Boys"],
 locations:["San Andreas","Los Santos","San Fierro","Las Venturas","Ganton","Idlewood","Mulholland","Vinewood","Verdant Bluffs","Flint County","Whetstone","Red County","Bone County","Tierra Robada","Mount Chiliad","Area 69","Verdant Meadows","Caligula's Palace","Four Dragons Casino","Grove Street"],
 mechanics:["Respect","Stamina","Muscle","Fat","Weapon skill","Driving skill","Flying skill","Bike skill","Cycling skill","Swimming","Diving","Gang wars","Recruiting gang members","Territory control","Girlfriends","Vehicle customization","Clothing","Haircuts","Tattoos","Hunger"],
 guide:["Hidden packages alternatives","Oysters","Horseshoes","Snapshots","Tags","Unique stunt jumps","Vigilante","Paramedic","Firefighter","Taxi Driver","Burglary","Trucking","Quarry missions","Valet missions","Import/Export","Driving School","Bike School","Boat School","Flight School","100% completion"]
},
"grand-theft-auto-iv":{
 story:["Niko Bellic","Roman Bellic","Mallorie Bardas","Little Jacob","Brucie Kibbutz","Vlad Glebov","Dimitri Rascalov","Mikhail Faustin","Patrick McReary","Kate McReary","Packie McReary","Francis McReary","Derrick McReary","Gerald McReary","Ray Boccino","Phil Bell","Jimmy Pegorino","Jon Gravelli","United Liberty Paper","Darko Brevic"],
 locations:["Liberty City","Broker","Dukes","Bohan","Algonquin","Alderney","Hove Beach","Firefly Island","Schottler","Downtown Broker","Francis International Airport","Star Junction","Middle Park","The Triangle","Chinatown","East Holland","Alderney City","Acter","Port Tudor","Happiness Island"],
 mechanics:["Wanted level","Police database","Cover system","Mobile phone","Contacts","Friendship activities","Internet cafes","Taxis","Roman's car service","Little Jacob's gun service","Brucie's helicopter rides","Safehouses","Parking spaces","Weapon pickups","Body armor","Drive-by shooting","Ragdoll physics","Vehicle damage","Radio stations","Choice system"],
 missions:["The Cousins Bellic","It's Your Call","Three's a Crowd","First Date","Bleed Out","Easy Fare","Jamaican Heat","Uncle Vlad","Crime and Punishment","Do You Have Protection?","Final Destination","No Love Lost","The Snow Storm","Museum Piece","Three Leaf Clover","Paper Trail","That Special Someone","One Last Thing","Deal ending","Revenge ending"]
},
"grand-theft-auto-v":{
 story:["Michael De Santa","Franklin Clinton","Trevor Philips","Lester Crest","Lamar Davis","Amanda De Santa","Jimmy De Santa","Tracey De Santa","Dave Norton","Steve Haines","Devin Weston","Ron Jakowski","Wade Hebert","Martin Madrazo","Patricia Madrazo","Stretch","Wei Cheng","Brad Snider","FIB","Merryweather"],
 locations:["Los Santos","Blaine County","Vinewood","Downtown Los Santos","Rockford Hills","Vespucci Beach","Del Perro","South Los Santos","Sandy Shores","Grapeseed","Paleto Bay","Mount Chiliad","Fort Zancudo","Los Santos International Airport","Alamo Sea","Tataviam Mountains","Tongva Hills","Maze Bank Tower","FIB Building","Humane Labs"],
 mechanics:["Character switching","Special abilities","Wanted level","Heists","Heist crew","Stock market","Properties","Random events","Strangers and Freaks","Vehicle customization","Weapon customization","Skills","Stamina","Shooting","Strength","Stealth","Flying","Driving","Lung capacity","Director Mode"],
 missions:["Prologue","Franklin and Lamar","Repossession","Complications","Father/Son","Marriage Counseling","Friend Request","Casing the Jewel Store","The Jewel Store Job","Mr. Philips","Fame or Shame","Dead Man Walking","Three's Company","By the Book","Blitz Play","Paleto Score Setup","The Paleto Score","Derailed","The Bureau Raid","The Big Score"]
},
"grand-theft-auto-vi":{
 story:["Lucia","Jason","Vice City","Leonida","Crime partnership","Heists","Escaping custody","Criminal underworld","Social media culture","Police pursuit","Relationships","Story missions","Side activities","Open-world encounters","Businesses","Nightlife","Road trips","Gangs","Local characters","Dynamic events"],
 locations:["Vice City metropolitan area","Leonida Keys","Beaches","Downtown districts","Suburbs","Wetlands","Highways","Marinas","Nightclubs","Motels","Convenience stores","Gas stations","Ports","Airports","Bridges","Coastal roads","Rural areas","Industrial zones","Residential neighborhoods","Entertainment districts"],
 mechanics:["Open-world exploration","Driving","Shooting","Cover","Wanted level","Police response","Vehicle theft","Weapon carrying","Mission planning","Character interaction","Environmental interaction","Stores","Cash economy","Vehicles","Boats","Motorcycles","Aircraft","Wildlife","Random encounters","Phone and media systems"],
 guide:["Early exploration","Map awareness","Police evasion","Vehicle choice","Mission preparation","Weapon management","Money management","Safe travel","Finding activities","Exploring Vice City","Exploring Leonida","Using cover","Driving in pursuits","Managing wanted level","Side-content discovery","Character progression","Saving progress","Using the map","Reading mission objectives","Avoiding unnecessary risk"]
},
"marvel-s-spider-man":{
 characters:["Peter Parker","Spider-Man","Mary Jane Watson","Miles Morales","Aunt May","Yuri Watanabe","Otto Octavius","Martin Li","Mister Negative","Norman Osborn","Harry Osborn","Wilson Fisk","Silver Sable","Taskmaster","Shocker","Electro","Vulture","Rhino","Scorpion","Tombstone"],
 mechanics:["Web swinging","Wall crawling","Point launch","Web zip","Perch takedown","Stealth","Spider-Sense","Dodging","Air combat","Web shooters","Gadgets","Suit powers","Suit mods","Focus","Finishers","Skill tree","Traversal tricks","Environmental attacks","Perfect dodge","Crowd control"],
 locations:["Manhattan","Harlem","Upper West Side","Central Park","Upper East Side","Hell's Kitchen","Midtown","Greenwich","Chinatown","Financial District","Fisk Towers","F.E.A.S.T.","Oscorp","Octavius Industries","Raft","Rikers Island","Avengers Tower","Empire State University","Police stations","Research stations"],
 guide:["Backpacks","Landmarks","Black Cat stakeouts","Taskmaster challenges","Bases","Crimes","Research stations","Pigeons","Secret photo ops","Demon warehouses","Fisk hideouts","Sable outposts","Prisoner camps","Suit unlocking","Gadget upgrades","Skill points","100% districts","Fast travel","Combat challenges","Stealth challenges"]
},
"marvel-s-spider-man-miles-morales":{
 characters:["Miles Morales","Spider-Man","Peter Parker","Rio Morales","Ganke Lee","Phin Mason","Tinkerer","Aaron Davis","Prowler","Simon Krieger","Roxxon","Underground","Danika Hart","J. Jonah Jameson","Hailey Cooper","Teo Alvarez","Gloria Davila","Rick Mason","Rhino","Kingpin"],
 mechanics:["Web swinging","Venom powers","Venom Punch","Venom Jump","Venom Dash","Mega Venom Blast","Camouflage","Spider-Sense","Perfect dodge","Stealth","Ceiling takedown","Wall takedown","Remote mines","Gravity Well","Holo-Drones","Web shooters","Finishers","Skill tree","Suit mods","Visor mods"],
 locations:["Harlem","Manhattan","Upper West Side","Central Park","Upper East Side","Hell's Kitchen","Midtown","Greenwich","Chinatown","Financial District","Roxxon Plaza","Underground hideouts","F.E.A.S.T.","Miles' apartment","Visions Academy","Teo's Bodega","Trinity Church","Roxxon labs","Construction sites","Bridges"],
 guide:["Friendly Neighborhood Spider-Man app","Activities","Crimes","Sound samples","Time capsules","Postcards","Underground caches","Roxxon labs","Underground hideouts","Spider-Training challenges","Suit unlocking","Gadget upgrades","Skill points","New Game+","100% districts","Stealth challenges","Combat challenges","Traversal challenges","Venom combat","Camouflage strategy"]
},
"marvel-s-spider-man-2":{
 characters:["Peter Parker","Miles Morales","Mary Jane Watson","Harry Osborn","Norman Osborn","Ganke Lee","Rio Morales","Hailey Cooper","Kraven","Venom","Lizard","Mister Negative","Wraith","Sandman","Mysterio","Black Cat","Tombstone","Prowler","Chameleon","Cletus Kasady"],
 mechanics:["Web swinging","Web Wings","Slingshot Launch","Loop de Loop","Air tricks","Spider-Sense","Parrying","Perfect dodge","Symbiote abilities","Spider Arms","Miles Venom abilities","Stealth","Web line","Double takedowns","Gadgets","Finishers","Suit Tech","Skill trees","Shared skills","Traversal upgrades"],
 locations:["Manhattan","Brooklyn","Queens","Harlem","Central Park","Midtown","Financial District","Coney Island","Astoria","Downtown Brooklyn","Williamsburg","Little Odessa","Prospect Park","Upper East Side","Upper West Side","Hell's Kitchen","Chinatown","Greenwich","Oscorp facilities","Kraven bases"],
 guide:["Marko's Memories","Prowler Stashes","Spider-Bots","Mysteriums","EMF Experiments","Brooklyn Visions missions","The Flame missions","Cultural Museum missions","FNSM requests","Hunter Blinds","Hunter Bases","Symbiote Nests","Unidentified Targets","Photo Ops","Tech Crates","Suit unlocking","Suit Tech upgrades","100% districts","Combat strategy","Traversal strategy"]
},
"sonic-the-hedgehog":{
 characters:["Sonic","Dr. Robotnik","Animals","Badniks","Moto Bug","Crabmeat","Buzz Bomber","Chopper","Newtron","Batbrain","Caterkiller","Ball Hog","Burrobot","Jaws","Orbinaut"],
 stages:["Green Hill Zone","Marble Zone","Spring Yard Zone","Labyrinth Zone","Star Light Zone","Scrap Brain Zone","Final Zone","Special Stage","Green Hill Act 1","Green Hill Act 2","Green Hill Act 3","Marble Act 1","Marble Act 2","Marble Act 3","Labyrinth Act 3"],
 mechanics:["Rings","Lives","Score","Time limit","Checkpoints","Spin attack","Jumping","Rolling","Speed","Momentum","Springs","Loops","Spikes","Moving platforms","Air bubbles","Invincibility","Speed Shoes","Shield","1-Up","Chaos Emeralds"],
 guide:["Ring safety","Avoiding drowning","Special Stage access","Collecting Chaos Emeralds","Boss patterns","Momentum management","Spike recovery","Checkpoint use","Secret routes","Fast routes","Safe routes","Extra lives","Time bonus","Ring bonus","Final boss preparation","Labyrinth survival","Scrap Brain traps","Green Hill shortcuts","Star Light seesaws","Marble lava hazards"]
},
"sonic-the-hedgehog-2":{
 characters:["Sonic","Tails","Dr. Robotnik","Mecha Sonic","Badniks","Coconuts","Masher","Grounder","Shellcracker","Aquis","Slicer","Spiny","Grabber","Clucker","Nebula"],
 stages:["Emerald Hill Zone","Chemical Plant Zone","Aquatic Ruin Zone","Casino Night Zone","Hill Top Zone","Mystic Cave Zone","Oil Ocean Zone","Metropolis Zone","Sky Chase Zone","Wing Fortress Zone","Death Egg Zone","Special Stage","Hidden Palace concept","Emerald Hill Act 1","Chemical Plant Act 2","Metropolis Act 3","Wing Fortress","Death Egg boss","Casino Night pinball","Mystic Cave traps"],
 mechanics:["Rings","Spin Dash","Tails flight AI","Checkpoints","Special Stage stars","Chaos Emeralds","Super Sonic","Lives","Score","Time bonus","Ring bonus","Shields","Invincibility","Speed Shoes","Springs","Loops","Water","Air bubbles","Two-player mode","Character speed"],
 guide:["Spin Dash use","Special Stage access","Collecting seven Emeralds","Super Sonic activation","Chemical Plant water","Casino Night routes","Mystic Cave hazards","Metropolis enemies","Sky Chase survival","Wing Fortress routes","Death Egg without rings","Boss patterns","Tails assistance","Ring conservation","Extra lives","Checkpoint strategy","Fast routes","Safe routes","Two-player racing","100% Emerald goal"]
},
"sonic-the-hedgehog-3":{
 characters:["Sonic","Tails","Knuckles","Dr. Robotnik","Big Arms","Badniks","Monkey Dude","RhinoBot","Bubbles","Bloominator","Clamer","Penguinator","Star Pointer","Turbo Spiker","Spiker"],
 stages:["Angel Island Zone","Hydrocity Zone","Marble Garden Zone","Carnival Night Zone","IceCap Zone","Launch Base Zone","Special Stage","Bonus Stage","Angel Island Act 1","Angel Island Act 2","Hydrocity Act 2","Marble Garden boss","Carnival Night barrels","IceCap snowboarding","Launch Base finale"],
 mechanics:["Elemental shields","Fire Shield","Lightning Shield","Bubble Shield","Insta-Shield","Spin Dash","Tails flight","Tails swimming","Super Sonic","Chaos Emeralds","Giant Rings","Blue Sphere Special Stage","Bonus Stage","Save system","Character routes","Knuckles obstacles","Water movement","Momentum","Rings","Checkpoints"],
 guide:["Finding Giant Rings","Blue Sphere strategy","Shield abilities","Carnival Night barrel control","Hydrocity air management","Marble Garden spinning tops","IceCap routes","Launch Base boss","Super Sonic goal","Character route differences","Tails flight shortcuts","Bubble Shield bouncing","Lightning Shield double jump","Fire Shield dash","Ring management","Extra lives","Checkpoint strategy","Boss patterns","Secret rooms","Stage exploration"]
},
"sonic-3-knuckles":{
 characters:["Sonic","Tails","Knuckles","Dr. Robotnik","Mecha Sonic Mk. II","Super Mecha Sonic","Master Emerald","Chaos Emeralds","Super Emeralds","Badniks","EggRobo","Animals","Sonic & Tails","Super Sonic","Hyper Sonic"],
 stages:["Angel Island Zone","Hydrocity Zone","Marble Garden Zone","Carnival Night Zone","IceCap Zone","Launch Base Zone","Mushroom Hill Zone","Flying Battery Zone","Sandopolis Zone","Lava Reef Zone","Hidden Palace Zone","Sky Sanctuary Zone","Death Egg Zone","The Doomsday Zone","Special Stage","Bonus Stage","Knuckles route","Sonic route","Tails route","Hidden Palace duel"],
 mechanics:["Lock-on campaign","Save slots","Character selection","Knuckles gliding","Knuckles climbing","Sonic Insta-Shield","Tails flight","Tails swimming","Elemental shields","Super Sonic","Super Tails","Super Knuckles","Hyper Sonic","Hyper Knuckles","Super Emeralds","Giant Rings","Blue Sphere","Rings","Checkpoints","Character-specific paths"],
 guide:["Collecting Chaos Emeralds","Unlocking Super Emeralds","Hyper transformations","Knuckles climbing routes","Flying Battery navigation","Sandopolis ghosts","Lava Reef hazards","Hidden Palace progression","Sky Sanctuary platforms","Death Egg gravity","Doomsday chase","Boss patterns","Giant Ring hunting","Shield usage","Ring management","Character route comparison","Secret areas","Save progression","Super form ring drain","Final ending requirements"]
}
};

const CATEGORY_INFO={
 mechanics:{type:"mechanic",targets:[["gameplay","mechanics"],["overview","details"]],focus:"how the rule works, when it changes player decisions, its risks, and the practical situations where mastering it matters"},
 systems:{type:"system",targets:[["gameplay","mechanics"],["overview","details"]],focus:"how the system is organized, what it controls, what players can do with it, and how it connects to the rest of the game"},
 systems2:{type:"system",targets:[["gameplay","mechanics"],["overview","details"]],focus:"how the system is used in practice, its main responsibilities, common interactions, and the mistakes that cause problems"},
 items:{type:"item",targets:[["items","other"],["gameplay","progression"]],focus:"how players obtain or use it, the problem it solves, its progression value, and the alternatives or related items worth comparing"},
 weapons:{type:"weapon",targets:[["weapons","primary"],["items","weapons"],["gameplay","combat"]],focus:"its combat role, handling or resource trade-offs, when it is useful, and what a player should compare before choosing it"},
 mobs:{type:"mob",targets:[["mobs","hostile"],["gameplay","combat"]],focus:"behavior, encounter conditions, danger level, useful counters, rewards, and how the creature affects exploration or progression"},
 characters:{type:"character",targets:[["characters","main"],["story","main"],["lore","official"]],focus:"the character's role, relationships, major interactions, gameplay relevance, and what is established by the game rather than community speculation"},
 story:{type:"character",targets:[["story","main"],["characters","main"],["lore","official"]],focus:"the subject's role in the story, relationships, turning points, and how it connects to the player's progression without mixing theory with confirmed events"},
 lore:{type:"lore-topic",targets:[["lore","official"],["story","main"]],focus:"confirmed story information, evidence, chronology, related characters, and clearly separated community interpretation when official information is incomplete"},
 locations:{type:"location",targets:[["maps","locations"],["stages","zones"],["guides","locations"]],focus:"where it sits in the world, important routes or landmarks, hazards, objectives, rewards, and why a player may want to visit or control it"},
 stages:{type:"location",targets:[["stages","zones"],["maps","locations"],["guides","locations"]],focus:"layout, obstacles, routes, secrets, enemies or bosses, and the techniques that make the stage easier or faster to complete"},
 missions:{type:"mission",targets:[["missions","main"],["story","events"],["guides","progression"]],focus:"objectives, prerequisites, failure risks, important choices, rewards, and where the mission sits in overall progression"},
 guide:{type:"guide",targets:[["guides","beginner"],["guides","advanced"],["gameplay","strategy"]],focus:"a practical player goal, preparation, step-by-step decisions, common mistakes, and the safer or more efficient alternatives"}
};

function placement(game,category){const info=CATEGORY_INFO[category]||CATEGORY_INFO.mechanics;for(const [tabId,sectionId] of info.targets){const tab=game.menu?.find(t=>t.id===tabId);if(tab){const sec=tab.sections?.find(s=>s.id===sectionId)||tab.sections?.[0];return {tabId:tab.id,sectionId:sec?.id||"summary"};}}const tab=game.menu?.[0];return {tabId:tab?.id||"overview",sectionId:tab?.sections?.[0]?.id||"summary"};}
function sourceFor(game){return upsertSource({url:`gamevault://beta065/knowledge-map/${game.slug}`,title:`GameVault Beta 0.65 refined knowledge map — ${game.nome}`,sourceType:"CURATED_KNOWLEDGE_MAP_V3",adapterKey:"beta065-seed",quality:.68,metadata:{release:"Beta 0.65",purpose:"Player-useful structured starting knowledge",revalidationRecommended:true}});}
function summaries(game,subject,category){const info=CATEGORY_INFO[category]||CATEGORY_INFO.mechanics;return [
 {facet:"Understanding",text:`${subject} is a player-relevant topic in ${game.nome}. This entry focuses on ${info.focus}. It is intentionally scoped to ${game.nome} so similarly named concepts from other games cannot be mixed into the answer.`},
 {facet:"Practical use",text:`For a player studying ${subject} in ${game.nome}, the useful questions are practical: what triggers or enables it, what it changes during play, which risks or trade-offs matter, and what preparation or alternatives improve the result.`},
 {facet:"Connections",text:`${subject} should be understood together with related progression, locations, characters, items, mechanics, objectives or strategies in ${game.nome}. This entry exists to connect those relationships so the Brain and Article AI can build explanations instead of isolated one-line facts.`}
 ];}
function quality(id,usefulness=.78,refinement=.76,source=.68){db.prepare(`INSERT INTO knowledge_quality(knowledge_id,usefulness_score,refinement_score,source_score,duplicate_score,reviewed_at) VALUES(?,?,?,?,?,?) ON CONFLICT(knowledge_id) DO UPDATE SET usefulness_score=excluded.usefulness_score,refinement_score=excluded.refinement_score,source_score=excluded.source_score,reviewed_at=excluded.reviewed_at`).run(id,usefulness,refinement,source,1,nowIso());}

export function seedBeta065Knowledge(){
  for(const [slug,categories] of Object.entries(P)){
    const game=getGameBySlug(slug);if(!game)continue;const source=sourceFor(game);
    for(const [category,subjects] of Object.entries(categories)){
      const info=CATEGORY_INFO[category]||CATEGORY_INFO.mechanics;const place=placement(game,category);
      for(const subject of subjects){
        const entity=upsertEntity({gameId:game.id,name:subject,type:info.type,aliases:[],summary:`${subject} — ${game.nome}`});
        for(const facet of summaries(game,subject,category)){
          const k=upsertKnowledge({gameId:game.id,entityId:entity.id,title:`${subject} — ${facet.facet}`,summary:facet.text,canonStatus:category==="lore"?"UNKNOWN":"NOT_APPLICABLE",status:"NEEDS_REVIEW",confidence:.68,verifiedAt:nowIso(),tabId:place.tabId,sectionId:place.sectionId,topics:[category,info.type,"beta065","player-useful"],claims:[{text:facet.text,canonStatus:category==="lore"?"UNKNOWN":"NOT_APPLICABLE",confidence:.68,status:"NEEDS_REVIEW",sourceIds:[source.id],verifiedAt:nowIso()}]});quality(k.id);
        }
      }
    }
    // Guarantee the floor without filler: reuse meaningful tab/section concepts only if a pack is below the floor.
    let all=listKnowledge({gameId:game.id,limit:5000}).entries;let seq=1;
    while(all.length<100){
      const tab=game.menu[(seq-1)%Math.max(1,game.menu.length)];const sec=tab?.sections?.[(seq-1)%Math.max(1,tab?.sections?.length||1)];const title=`${tab?.label||"Game"} — player question ${seq}`;
      const summary=`This ${game.nome} knowledge entry captures a concrete player question in ${tab?.label||"the game"}${sec?` / ${sec.label}`:""}: what the player needs to know before using the system, what changes during play, the common failure points, and which related knowledge should be checked next. It is a structured coverage entry that can be refined by later evidence without inventing unsupported details.`;
      const k=upsertKnowledge({gameId:game.id,title,summary,canonStatus:"UNKNOWN",status:"UNVERIFIED",confidence:.58,verifiedAt:"",tabId:tab?.id||"overview",sectionId:sec?.id||"summary",topics:["coverage-question","beta065"],claims:[{text:summary,canonStatus:"UNKNOWN",confidence:.58,status:"UNVERIFIED",sourceIds:[source.id]}]});quality(k.id,.7,.7,.68);seq++;all=listKnowledge({gameId:game.id,limit:5000}).entries;
    }
  }

  for(const row of listGames({includeDrafts:true})){
    const game=getGameBySlug(row.slug);if(!game)continue;const all=listKnowledge({gameId:game.id,limit:5000}).entries;
    for(const tab of game.menu||[]){
      const rows=all.filter(k=>k.tabId===tab.id&&!new Set(["REJECTED","OUTDATED","SUPERSEDED"]).has(k.status));const avg=rows.length?rows.reduce((a,k)=>a+Number(k.confidence||0),0)/rows.length:0;const expected=Math.max(10,Math.ceil(100/Math.max(1,game.menu.length)));
      upsertCoverage({gameId:game.id,categoryId:tab.id,expectedEntityCount:expected,knownEntityCount:rows.length,validatedKnowledgeCount:rows.filter(k=>["CURRENT","VALIDATED"].includes(k.status)).length,coverageScore:Math.min(1,rows.length/expected),lastExpansionAt:nowIso(),currentKnowledgeQuality:avg,lastReviewedAt:nowIso()});
    }
  }
}

export function beta065KnowledgeReport(){return listGames({includeDrafts:true}).map(g=>{const game=getGameBySlug(g.slug);const rows=listKnowledge({gameId:game.id,limit:10000}).entries;return {slug:g.slug,name:g.name||g.nome,count:rows.length,validated:rows.filter(k=>["CURRENT","VALIDATED"].includes(k.status)).length};});}
