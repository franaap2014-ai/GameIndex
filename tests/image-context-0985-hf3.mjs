import assert from 'node:assert/strict';import {evaluateImage3CandidateContext as e} from '../src/images/image-discovery3.mjs';
const cases=[
 [{title:'Roblox toy figure collection',game:'Roblox',subject:'Roblox',role:'COVER',entity:false},false,'PHYSICAL_OR_HUMAN_MEDIA'],
 [{title:'Women playing Fortnite at Gamescom',game:'Fortnite',subject:'Fortnite',role:'COVER',entity:false},false,'PHYSICAL_OR_HUMAN_MEDIA'],
 [{title:'Roblox headquarters building',game:'Roblox',subject:'Roblox',role:'COVER',entity:false},false,'PHYSICAL_OR_HUMAN_MEDIA'],
 [{title:'Roblox logo 2022',game:'Roblox',subject:'Roblox',role:'COVER',entity:false},true,'CONTEXT_TITLE_PASS'],
 [{title:'Fortnite video game logo',game:'Fortnite',subject:'Fortnite',role:'COVER',entity:false},true,'CONTEXT_TITLE_PASS'],
 [{title:'Creeper Minecraft render',game:'Minecraft',subject:'Creeper',role:'PORTRAIT',entity:true},true,'CONTEXT_TITLE_PASS'],
 [{title:'Minecraft landscape',game:'Minecraft',subject:'Creeper',role:'PORTRAIT',entity:true},false,'ENTITY_TITLE_MISMATCH']
];for(const [input,accepted,reason] of cases){const r=e(input);assert.equal(r.accepted,accepted,JSON.stringify(input));assert.equal(r.reasonCode,reason,JSON.stringify(input));}
console.log('HF3 image context guard OK — physical Roblox/human Fortnite rejected; canonical digital game media accepted.');
