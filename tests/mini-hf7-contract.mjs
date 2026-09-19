import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const tmp=mkdtempSync(path.join(os.tmpdir(),"gi-hf7-"));
process.env.GAMEINDEX_DB=path.join(tmp,"db.sqlite");
process.env.GAMEINDEX_DATA_DIR=tmp;
process.env.GAMEINDEX_TARGET_SCHEMA="28";

const load=(relative)=>import(pathToFileURL(path.join(root,relative)).href);
const connection=await load("src/database/connection.mjs");
connection.migrateDatabase();
const games=await load("src/database/repositories/game-repository.mjs");
const entities=await load("src/database/repositories/entity-repository.mjs");
const knowledge=await load("src/database/repositories/knowledge-repository.mjs");
const music=await load("src/music/youtube-music-service.mjs");
const images=await load("src/images/manual-image-service.mjs");
const overview=await load("src/universe/basic-overview.mjs");

const game=games.upsertGame({name:"Roblox",slug:"roblox",status:"PUBLISHED",genres:["Sandbox"],platforms:["PC"]});
entities.upsertEntity({gameId:game.id,name:"Builderman",type:"CHARACTER",summary:"Personagem registrado no universo Roblox."});
knowledge.upsertKnowledge({gameId:game.id,title:"Contexto do universo",summary:"Roblox é uma plataforma de experiências criadas pela comunidade.",status:"CURRENT",confidence:.8});

const alt=music.setGameAltMusic({gameId:game.id,slotKey:"roblox-og",youtubeUrl:"https://youtu.be/dQw4w9WgXcQ",userId:"test"});
assert.equal(alt.youtubeVideoId,"dQw4w9WgXcQ");

const image=images.setManualGameImage({gameId:game.id,imageUrl:"https://example.com/roblox.webp",altText:"Roblox",userId:"test"});
assert.equal(image.imageUrl,"https://example.com/roblox.webp");

const basic=overview.basicGameOverview(game);
assert.match(basic.context,/plataforma de experiências/i);
assert.equal(basic.characters[0].name,"Builderman");
assert.equal(basic.aiUsed,false);

assert.throws(()=>images.setManualGameImage({gameId:game.id,imageUrl:"javascript:alert(1)"}),/INVALID_IMAGE_URL/);

try{connection.db.close();}catch{}
rmSync(tmp,{recursive:true,force:true});
console.log("HF7 contract PASS — Roblox alternate music, manual image and local summary/context/characters.");
