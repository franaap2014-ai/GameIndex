import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import net from "node:net";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const temp=mkdtempSync(path.join(tmpdir(),"gameindex-0987-http-"));
const dbPath=path.join(temp,"smoke.sqlite");

function freePort(){
  return new Promise((resolve,reject)=>{
    const s=net.createServer();
    s.once("error",reject);
    s.listen(0,"127.0.0.1",()=>{const p=s.address().port;s.close(()=>resolve(p));});
  });
}
async function waitFor(url,child,timeoutMs=30000){
  const started=Date.now();
  let lastError="";
  while(Date.now()-started<timeoutMs){
    if(child.exitCode!==null)throw new Error(`Server exited before smoke test (code ${child.exitCode}).`);
    try{const r=await fetch(url,{cache:"no-store"});if(r.ok)return r;lastError=`HTTP ${r.status}`;}catch(error){lastError=String(error.message||error);}
    await new Promise(r=>setTimeout(r,250));
  }
  throw new Error(`Timed out waiting for ${url}: ${lastError}`);
}
async function request(url,expected=200){const r=await fetch(url,{redirect:"manual",cache:"no-store"});assert.equal(r.status,expected,`${url} -> ${r.status}, expected ${expected}`);return r;}

let child;
try{
  const port=await freePort();
  const base=`http://127.0.0.1:${port}`;
  let logs="";
  child=spawn(process.execPath,["server.mjs"],{
    cwd:root,
    env:{...process.env,PORT:String(port),NODE_ENV:"production",PERFORMANCE_MODE:"true",GAMEINDEX_DB:dbPath,GAMEINDEX_TARGET_SCHEMA:"32",GAMEINDEX_BACKGROUND_WORKERS:"false",GAMEINDEX_IMAGE_REPAIR_WORKER:"false",GAMEVAULT_AUTOGEN_ENABLED:"false",GAMEINDEX_CONSTRUCTION_ENABLED:"false",GAMEINDEX_FULL_BUILD_ENABLED:"false",OLLAMA_ENABLED:"false"},
    stdio:["ignore","pipe","pipe"]
  });
  child.stdout.on("data",d=>{logs+=d.toString();});
  child.stderr.on("data",d=>{logs+=d.toString();});

  const health=await waitFor(`${base}/health`,child);
  const h=await health.json();
  assert.equal(h.status,"ok");
  assert.equal(h.version,"0.991");assert.equal(h.release,"BETA_0_991_FULL_EXPERIENCE");
  assert.equal(h.ai,"idle");

  const apiHealth=await request(`${base}/api/health`);
  const api=await apiHealth.json();
  assert.equal(String(api.version||""),"0.991");assert.equal(api.release,"BETA_0_991_FULL_EXPERIENCE");

  const home=await request(`${base}/`);assert.match(await home.text(),/BETA 0\.991/i);
  await request(`${base}/games.html`);
  await request(`${base}/login.html`);
  const games=await request(`${base}/api/games?page=1&limit=24`);
  const list=await games.json();
  assert.ok(Array.isArray(list));
  assert.ok(list.length<=24);

  const protectedImage=await request(`${base}/image-library.html`,401);
  assert.match(protectedImage.headers.get("content-type")||"",/json/i);

  console.log(JSON.stringify({ok:true,release:"0.991",health:true,apiHealth:true,home:true,games:true,pagination24:true,protectedRoutes:true},null,2));
} catch(error){
  if(child&&child.exitCode!==null)console.error(`Server exit code: ${child.exitCode}`);
  throw error;
} finally {
  if(child&&child.exitCode===null){child.kill("SIGTERM");await new Promise(r=>setTimeout(r,250));if(child.exitCode===null)child.kill("SIGKILL");}
  rmSync(temp,{recursive:true,force:true});
}
