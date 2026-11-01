import assert from 'node:assert/strict';
import fs from 'node:fs';
import {dexterModelConfig,dexterModelHealth} from '../src/dexter/model-provider-093.mjs';

const root=new URL('../',import.meta.url);
const read=path=>fs.readFileSync(new URL(path,root),'utf8');
const prior=Object.fromEntries(['DEXTER_PROVIDER','DEXTER_API_KEY','OPENAI_API_KEY','DEXTER_API_BASE_URL','DEXTER_MODEL'].map(k=>[k,process.env[k]]));
let count=0;
function ok(what,fn){fn();count++;console.log('PASS',what);}
try{
 process.env.DEXTER_PROVIDER='ollama';
 ok('Ollama remains the default provider',()=>assert.equal(dexterModelConfig().provider,'ollama'));
 process.env.DEXTER_PROVIDER='openai';delete process.env.DEXTER_API_KEY;delete process.env.OPENAI_API_KEY;delete process.env.DEXTER_API_BASE_URL;
 ok('remote provider requires a server-side key',()=>assert.equal(dexterModelConfig().enabled,false));
 const missing=await dexterModelHealth();
 ok('unconfigured provider is not marked reachable',()=>{assert.equal(missing.reachable,false);assert.equal(missing.errorCode,'DEXTER_PROVIDER_NOT_CONFIGURED');});
 process.env.DEXTER_API_BASE_URL='http://localhost:4444/v1';
 ok('non-HTTPS remote endpoint rejected',()=>assert.equal(dexterModelConfig().valid,false));
 const insecure=await dexterModelHealth();
 ok('invalid remote URL is rejected without network access',()=>assert.equal(insecure.errorCode,'DEXTER_INVALID_PROVIDER_URL'));
 ok('theme-aware GI mark contains no role text',()=>{const logo=read('public/assets/brand/index-emblem.svg');assert.match(logo,/viewBox="0 0 64 64"/);assert.match(logo,/currentColor/);assert.doesNotMatch(logo,/>\s*(?:BASE|PRO|DEV|TESTER|CREATOR)\s*</);});
 ok('global shell loads remaster layer',()=>{const shell=read('public/js/shell-0986.js');assert.match(shell,/remaster-093\.css/);assert.match(shell,/remaster-093\.js/);});
 ok('command palette filters links based on capabilities',()=>{const src=read('public/js/remaster-093.js');assert.match(src,/closest\('\[hidden\]'\)/);assert.match(src,/!caps\.has\(cap\)/);});
 ok('reduced-motion bypasses navigation cutscenes',()=>{const src=read('public/js/remaster-093.js');assert.match(src,/prefers-reduced-motion/);assert.match(src,/reduced\(\)\|\|transitioning/);});
 ok('existing auth and shell remain intact',()=>{const shell=read('public/js/shell-0986.js');assert.match(shell,/api\/auth\/me/);assert.match(shell,/api\/beta0986\/access/);});
 ok('Dexter uses configured model provider',()=>{const service=read('src/dexter/dexter-service.mjs');const consult=read('src/dexter/public-consult.mjs');assert.match(service,/dexterModelStructured/);assert.match(consult,/dexterModelHealth/);});
 console.log('GameIndex Remaster 0.93:',count,'checks passed.');
}finally{for(const [k,v] of Object.entries(prior)){if(v===undefined)delete process.env[k];else process.env[k]=v;}}
