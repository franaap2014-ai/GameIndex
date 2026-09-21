import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import net from "node:net";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const temp=mkdtempSync(path.join(tmpdir(),"gameindex-0991-hf1-http-"));
const dbPath=path.join(temp,"smoke.sqlite");

function freePort(){
  return new Promise((resolve,reject)=>{
    const s=net.createServer();
    s.once("error",reject);
    s.listen(0,"127.0.0.1",()=>{const p=s.address().port;s.close(()=>resolve(p));});
  });
}
async function waitFor(url,child,timeoutMs=45000){
  const started=Date.now();let lastError="";
  while(Date.now()-started<timeoutMs){
    if(child.exitCode!==null)throw new Error(`Server exited before smoke test (code ${child.exitCode}).`);
    try{const r=await fetch(url,{cache:"no-store"});if(r.ok)return r;lastError=`HTTP ${r.status}`;}catch(error){lastError=String(error.message||error);}
    await new Promise(r=>setTimeout(r,250));
  }
  throw new Error(`Timed out waiting for ${url}: ${lastError}`);
}
async function request(url,expected=200){const r=await fetch(url,{redirect:"manual",cache:"no-store"});assert.equal(r.status,expected,`${url} -> ${r.status}, expected ${expected}`);return r;}

let child;let logs="";
try{
  const port=await freePort(),base=`http://127.0.0.1:${port}`;
  child=spawn(process.execPath,["server.mjs"],{
    cwd:root,
    env:{...process.env,PORT:String(port),NODE_ENV:"production",PERFORMANCE_MODE:"true",GAMEINDEX_DB:dbPath,GAMEINDEX_TARGET_SCHEMA:"44",GAMEINDEX_BACKGROUND_WORKERS:"false",GAMEINDEX_IMAGE_REPAIR_WORKER:"false",GAMEINDEX_STARTUP_VISUAL_SCAN:"false",GAMEVAULT_AUTOGEN_ENABLED:"false",GAMEINDEX_CONSTRUCTION_ENABLED:"false",GAMEINDEX_FULL_BUILD_ENABLED:"false",OLLAMA_ENABLED:"false"},
    stdio:["ignore","pipe","pipe"]
  });
  child.stdout.on("data",d=>{logs+=d.toString();});child.stderr.on("data",d=>{logs+=d.toString();});
  const health=await waitFor(`${base}/health`,child);const h=await health.json();
  assert.equal(h.status,"ok");assert.ok(h.version);
  const apiHealth=await request(`${base}/api/health`);const api=await apiHealth.json();assert.equal(api.version,"0.991");assert.equal(api.release,"BETA_0_991_I1_HF2_CREATOR_ANIMATION_EDITOR");
  const home=await request(`${base}/`);const homeText=await home.text();assert.match(homeText,/Beta 0\.991 HF1/i);assert.match(homeText,/gameindex-0991-hf1\.css/);assert.match(homeText,/cinematic-0991-hf1\.js/);
  await request(`${base}/games.html`);await request(`${base}/login.html`);await request(`${base}/universe-builder.html`,401);await request(`${base}/animation-editor.html`,401);
  const games=await request(`${base}/api/games?page=1&limit=24`);const list=await games.json();assert.ok(Array.isArray(list));assert.ok(list.length<=24);
  console.log(JSON.stringify({ok:true,release:"0.991-I1-HF2",schema:44,health:true,apiHealth:true,home:true,games:true,protectedUniverseBuilder:true,protectedAnimationEditor:true,productionStart:true},null,2));
}catch(error){if(logs)console.error(logs.slice(-7000));throw error;}finally{if(child&&child.exitCode===null){child.kill("SIGTERM");await new Promise(r=>setTimeout(r,350));if(child.exitCode===null)child.kill("SIGKILL");}rmSync(temp,{recursive:true,force:true});}
