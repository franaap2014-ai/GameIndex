import assert from 'node:assert/strict';
import {mkdtempSync,rmSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {get} from 'node:http';
import {gunzipSync,brotliDecompressSync} from 'node:zlib';
const root=path.resolve(import.meta.dirname,'..'),dir=mkdtempSync(path.join(tmpdir(),'gi-bandwidth-http-'));
Object.assign(process.env,{GAMEINDEX_DB:path.join(dir,'test.sqlite'),GAMEINDEX_DATA_DIR:dir,DATABASE_URL:'',GAMEINDEX_DATABASE_URL:'',GAMEINDEX_BACKGROUND_WORKERS:'false',GAMEINDEX_STARTUP_VISUAL_SCAN:'false',GAMEINDEX_IMAGE_REPAIR_WORKER:'false',GAMEINDEX_CONSTRUCTION_ENABLED:'false',GAMEINDEX_FULL_BUILD_ENABLED:'false',GAMEVAULT_AUTOGEN_ENABLED:'false',OLLAMA_ENABLED:'false',GAMEINDEX_TARGET_SCHEMA:'47',NODE_ENV:'test',PORT:'0'});
for(const k of ['RENDER','RENDER_SERVICE_ID','RENDER_EXTERNAL_HOSTNAME','WEBSITE_SITE_NAME','WEBSITE_INSTANCE_ID','WEBSITE_HOSTNAME'])delete process.env[k];
// Own server in this process allows raw HTTP size measurements without fetch's automatic decompression.
const express=(await import('express')).default;
const {initializeDatabase}=await import('../src/database/seed.mjs');initializeDatabase();
const {db}=await import('../src/database/connection.mjs');
const {installPerformanceMiddleware}=await import('../src/api/performance-runtime.mjs');
const app=express();installPerformanceMiddleware(app);
app.get('/sse',(req,res)=>{res.type('text/event-stream');res.end('data: '+ 'hello'.repeat(500)+'\n\n');});
app.get('/protected',(req,res)=>res.status(403).send('Forbidden'));
app.get('/no-transform',(req,res)=>res.set('Cache-Control','no-transform').type('text').send('hello'.repeat(500)));
app.get('/json',(req,res)=>res.json({message:'hello'.repeat(600)}));
app.use(express.static(path.join(root,'public')));
const server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));const port=server.address().port;
const req=(url,headers={})=>new Promise((resolve,reject)=>{get({hostname:'127.0.0.1',port,path:url,headers},res=>{const chunks=[];res.on('data',b=>chunks.push(b));res.on('end',()=>resolve({status:res.statusCode,headers:res.headers,body:Buffer.concat(chunks)}));}).on('error',reject);});
try{
 const file='/js/universe-builder.js',raw=readFileSync(path.join(root,'public',file));
 const gzip=await req(file,{'accept-encoding':'gzip'});assert.equal(gzip.status,200);assert.equal(gzip.headers['content-encoding'],'gzip');assert.deepEqual(gunzipSync(gzip.body),raw);assert.ok(gzip.body.length<raw.length*.5);assert.match(gzip.headers.vary,/Accept-Encoding/);
 const br=await req(file,{'accept-encoding':'br'});assert.equal(br.headers['content-encoding'],'br');assert.deepEqual(brotliDecompressSync(br.body),raw);
 const identity=await req(file,{'accept-encoding':'identity'});assert.deepEqual(identity.body,raw);assert.equal(identity.headers['content-encoding'],undefined);
 const cached=await req(file,{'accept-encoding':'gzip','if-none-match':gzip.headers.etag});assert.equal(cached.status,304);assert.equal(cached.body.length,0);
 const range=await req(file,{'accept-encoding':'gzip',range:'bytes=0-99'});assert.equal(range.status,206);assert.equal(range.headers['content-encoding'],undefined);assert.deepEqual(range.body,raw.subarray(0,100));
 for(const url of ['/sse','/no-transform'])assert.equal((await req(url,{'accept-encoding':'gzip'})).headers['content-encoding'],undefined);
 assert.equal((await req('/protected',{'accept-encoding':'gzip'})).status,403);
 const json=await req('/json',{'accept-encoding':'gzip'});assert.equal(JSON.parse(gunzipSync(json.body)).message.length,3000);
 console.log(JSON.stringify({ok:true,tests:['static gzip','static brotli','identity unchanged','ETag 304','range bytes preserved','SSE unbuffered','no-transform respected','protected route intact','JSON compression'],bytes:{original:raw.length,gzip:gzip.body.length,brotli:br.body.length}}));
}finally{await new Promise(r=>server.close(r));db.close();rmSync(dir,{recursive:true,force:true});}
