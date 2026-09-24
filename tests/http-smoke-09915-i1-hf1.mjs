import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import net from "node:net";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const temp=mkdtempSync(path.join(tmpdir(),"gameindex-09915-hf1-http-"));
const dbPath=path.join(temp,"smoke.sqlite");

function freePort(){
  return new Promise((resolve,reject)=>{
    const s=net.createServer();
    s.once("error",reject);
    s.listen(0,"127.0.0.1",()=>{const p=s.address().port;s.close(()=>resolve(p));});
  });
}
async function waitFor(url,child,timeoutMs=60000){
  const started=Date.now();let lastError="";
  while(Date.now()-started<timeoutMs){
    if(child.exitCode!==null)throw new Error(`Server exited before smoke test (code ${child.exitCode}).`);
    try{const r=await fetch(url,{cache:"no-store"});if(r.ok)return r;lastError=`HTTP ${r.status}`;}catch(error){lastError=String(error.message||error);}
    await new Promise(r=>setTimeout(r,250));
  }
  throw new Error(`Timed out waiting for ${url}: ${lastError}`);
}
async function request(url,expected=200){
  const r=await fetch(url,{redirect:"manual",cache:"no-store"});
  assert.equal(r.status,expected,`${url} -> ${r.status}, expected ${expected}`);
  return r;
}

let child;let logs="";
try{
  const port=await freePort(),base=`http://127.0.0.1:${port}`;
  child=spawn(process.execPath,["server.mjs"],{
    cwd:root,
    env:{
      ...process.env,
      DATABASE_URL:"",GAMEINDEX_DATABASE_URL:"",RENDER:"",RENDER_SERVICE_ID:"",RENDER_EXTERNAL_HOSTNAME:"",
      PORT:String(port),
      NODE_ENV:"production",
      PERFORMANCE_MODE:"true",
      GAMEINDEX_DB:dbPath,
      GAMEINDEX_TARGET_SCHEMA:"47",
      GAMEINDEX_BACKGROUND_WORKERS:"false",
      GAMEINDEX_IMAGE_REPAIR_WORKER:"false",
      GAMEINDEX_STARTUP_VISUAL_SCAN:"false",
      GAMEVAULT_AUTOGEN_ENABLED:"false",
      GAMEINDEX_CONSTRUCTION_ENABLED:"false",
      GAMEINDEX_FULL_BUILD_ENABLED:"false",
      OLLAMA_ENABLED:"false"
    },
    stdio:["ignore","pipe","pipe"]
  });
  child.stdout.on("data",d=>{logs+=d.toString();});
  child.stderr.on("data",d=>{logs+=d.toString();});

  const health=await waitFor(`${base}/api/health`,child);
  const h=await health.json();
  assert.equal(h.status,"healthy");
  assert.equal(h.version,"0.992");

  const release=await request(`${base}/api/release/public`);
  const publicRelease=await release.json();
  assert.equal(publicRelease.version,"0.992");
  assert.match(publicRelease.label,/Beta 0\.9915/);

  await request(`${base}/`);
  await request(`${base}/games.html`);
  await request(`${base}/login.html`);
  await request(`${base}/api/profile`,401);
  await request(`${base}/universe-builder.html`,401);
  await request(`${base}/animation-editor.html`,401);
  await request(`${base}/cinematic-test-lab.html`,401);

  const roblox=await request(`${base}/api/games/roblox`);
  const robloxBody=await roblox.json();
  const childSlugs=new Set((robloxBody.relatedGames||[]).map(x=>x.slug));
  for(const slug of ["blox-fruits","doors","fisch","work-at-a-pizza-place","prison-life"]){
    assert.ok(childSlugs.has(slug),`Roblox hub missing ${slug}`);
    await request(`${base}/game/roblox/${slug}`);
  }

  console.log(JSON.stringify({
    ok:true,
    publicVersion:"0.992",
    schema:47,
    health:true,
    release:true,
    profileProtected:true,
    creatorToolsProtected:true,
    robloxExperiences:[...childSlugs]
  },null,2));
}catch(error){
  if(logs)console.error(logs.slice(-10000));
  throw error;
}finally{
  if(child&&child.exitCode===null){
    child.kill("SIGTERM");
    await new Promise(r=>setTimeout(r,350));
    if(child.exitCode===null)child.kill("SIGKILL");
  }
  rmSync(temp,{recursive:true,force:true});
}
