import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {createHash,randomBytes} from 'node:crypto';
import {gzipSync} from 'node:zlib';
import {encodeSnapshotChunk,decodeSnapshotChunk} from '../src/database/snapshot-codec.mjs';
const dir=mkdtempSync(path.join(tmpdir(),'gi-bandwidth-')),file=path.join(dir,'runtime.sqlite'),chunkBytes=512*1024;
process.env.DATABASE_URL='postgresql://test:test@ep-fixture.neon.tech/test';
process.env.GAMEINDEX_REMOTE_SNAPSHOT_WATCH_MS='30000';
const snapshots=new Map(),originalFetch=globalThis.fetch;let sentBytes=0,failPayload=false,copyMissing=false,count=0;
const hash=b=>createHash('sha256').update(b).digest('hex');
const last=()=>[...snapshots.values()].filter(x=>x.complete).at(-1);
const test=async(name,fn)=>{await fn();count++;console.log('PASS',name);};
function seed(bytes){const id='legacy';snapshots.set(id,{snapshot_id:id,sha256:hash(bytes),size_bytes:bytes.length,chunk_count:Math.ceil(bytes.length/chunkBytes),schema_version:47,release:'LEGACY',parts:Array.from({length:Math.ceil(bytes.length/chunkBytes)},(_,i)=>bytes.subarray(i*chunkBytes,(i+1)*chunkBytes).toString('base64')),complete:true});}
globalThis.fetch=async(_url,opts)=>{
 assert.ok(opts.signal);const {query,params:p}=JSON.parse(opts.body);let rows=[],rowCount;
 if(query.startsWith('INSERT INTO gameindex_runtime_snapshots')){snapshots.set(p[0],{snapshot_id:p[0],sha256:p[4],size_bytes:p[5],chunk_count:p[6],schema_version:p[2],release:p[3],parts:[],complete:false});rowCount=1;}
 else if(query.startsWith('INSERT INTO gameindex_runtime_snapshot_chunks')){
  if(query.includes('SELECT $1')){const indices=String(p[2]).slice(1,-1).split(',').map(Number),base=snapshots.get(p[1]);rowCount=0;for(const i of indices)if(!copyMissing&&base?.parts[i]!==undefined){snapshots.get(p[0]).parts[i]=base.parts[i];rowCount++;}}
  else{if(failPayload)return new Response('Synthetic failure',{status:503});snapshots.get(p[0]).parts[p[1]]=p[2];sentBytes+=Buffer.byteLength(p[2]);rowCount=1;}
 }
 else if(query.startsWith('UPDATE gameindex_runtime_snapshots')){const s=snapshots.get(p[0]);assert.equal(s.parts.filter(x=>typeof x==='string').length,s.chunk_count);s.complete=true;rowCount=1;}
 else if(query.includes('SELECT chunk_index,payload_base64'))rows=snapshots.get(p[0]).parts.map((payload_base64,chunk_index)=>({payload_base64,chunk_index}));
 else if(query.includes('SELECT snapshot_id,schema_version')||query.includes('SELECT snapshot_id,sha256')){if(last())rows=[last()];}
 else if(query.includes('COUNT(*)'))rows=[{count:[...snapshots.values()].filter(x=>x.complete).length}];
 else if(query.startsWith('DELETE')&&query.includes('OFFSET')){const complete=[...snapshots.values()].filter(x=>x.complete);for(const s of complete.slice(0,Math.max(0,complete.length-Number(p[1]))))snapshots.delete(s.snapshot_id);}
 const keys=rows.length?Object.keys(rows[0]):[];return Response.json({fields:keys.map(name=>({name})),rows:rows.map(row=>keys.map(k=>row[k])),rowCount:rowCount??rows.length});
};
try{
 await test('codec restores legacy, compressed and incompressible chunks and rejects malformed/oversized payloads',()=>{for(const b of [Buffer.alloc(8192,65),randomBytes(8192)])assert.deepEqual(decodeSnapshotChunk(encodeSnapshotChunk(b)),b);assert.deepEqual(decodeSnapshotChunk(Buffer.from('legacy').toString('base64')),Buffer.from('legacy'));assert.throws(()=>decodeSnapshotChunk('gzip1:not-base64'));assert.throws(()=>decodeSnapshotChunk('gzip1:'+gzipSync(Buffer.alloc(2*1024*1024)).toString('base64')));});
 const buffer=Buffer.alloc(16*1024*1024);for(let i=0;i<32;i++)buffer.fill(i+1,i*chunkBytes,(i+1)*chunkBytes);seed(buffer);
 const p=await import('../src/database/neon-snapshot-persistence.mjs');const verifyDatabase=()=>({ok:true});
 await test('legacy snapshot restores byte-for-byte without upload',async()=>{const r=await p.restoreLatestNeonSnapshot({databasePath:file,verifyDatabase});assert.equal(r.restored,true);assert.deepEqual(readFileSync(file),buffer);await p.startNeonSnapshotRuntime({databasePath:file,getSchemaVersion:()=>47,release:'TEST',checkpoint(){},verifyDatabase});assert.equal(sentBytes,0);});
 let report;
 await test('one changed block in 16 MiB reuses 31 blocks remotely, independently of the old snapshot',async()=>{buffer.write('modified row',chunkBytes+25);writeFileSync(file,buffer);const r=await p.flushNeonSnapshot();assert.equal(r.transfer.reusedChunks,31);assert.equal(r.transfer.uploadedChunks,1);assert.ok(r.transfer.payloadBytes<10000);report={rawSnapshotBytes:buffer.length,legacyBase64Bytes:Math.ceil(buffer.length/3)*4,transmittedPayloadBytes:r.transfer.payloadBytes,reusedChunks:r.transfer.reusedChunks};snapshots.delete('legacy');assert.deepEqual(Buffer.concat(last().parts.map(decodeSnapshotChunk)),buffer);});
 await test('unchanged forced and normal flushes send zero additional payload',async()=>{const before=sentBytes,size=snapshots.size;assert.equal((await p.flushNeonSnapshot({force:true})).skipped,true);await p.flushNeonSnapshot();assert.equal(sentBytes,before);assert.equal(snapshots.size,size);});
 await test('new process restores mixed compressed/raw snapshot and validates the full hash',async()=>{const fresh=await import('../src/database/neon-snapshot-persistence.mjs?restore-test');const restored=path.join(dir,'restore.sqlite');await fresh.restoreLatestNeonSnapshot({databasePath:restored,verifyDatabase});assert.deepEqual(readFileSync(restored),buffer);const meta=last(),good=meta.sha256;meta.sha256='invalid';await assert.rejects(fresh.restoreLatestNeonSnapshot({databasePath:restored,verifyDatabase}),/HASH_MISMATCH/);assert.deepEqual(readFileSync(restored),buffer);meta.sha256=good;});
 await test('failed upload preserves last complete snapshot and backs off despite new critical writes',async()=>{const previous=last().snapshot_id;buffer[0]=90;writeFileSync(file,buffer);failPayload=true;const failed=await p.flushNeonSnapshot();assert.equal(failed.ok,false);assert.equal(last().snapshot_id,previous);const state=p.neonRemotePersistenceState();assert.equal(state.retryAttempts,1);assert.ok(Date.parse(state.retryNotBefore)>Date.now()+4000);p.markNeonSnapshotDirty({critical:true});assert.equal(p.neonRemotePersistenceState().retryNotBefore,state.retryNotBefore);failPayload=false;const retried=await p.flushNeonSnapshot();assert.equal(retried.ok,true);assert.equal(p.neonRemotePersistenceState().retryAttempts,0);assert.deepEqual(Buffer.concat(last().parts.map(decodeSnapshotChunk)),buffer);});
 await test('missing reuse source fails closed then recovers with full compressed transfer',async()=>{buffer[chunkBytes*2]=88;writeFileSync(file,buffer);copyMissing=true;const before=last().snapshot_id;assert.equal((await p.flushNeonSnapshot()).ok,false);assert.equal(last().snapshot_id,before);copyMissing=false;const r=await p.flushNeonSnapshot();assert.equal(r.ok,true);assert.equal(r.transfer.reusedChunks,0);assert.equal(r.transfer.uploadedChunks,32);assert.deepEqual(Buffer.concat(last().parts.map(decodeSnapshotChunk)),buffer);});
 await test('shorter and longer databases restore complete without stale chunks',async()=>{for(const bytes of [buffer.subarray(0,chunkBytes+12),Buffer.concat([buffer,Buffer.alloc(130,7)])]){writeFileSync(file,bytes);const r=await p.flushNeonSnapshot();assert.equal(r.ok,true);assert.deepEqual(Buffer.concat(last().parts.map(decodeSnapshotChunk)),bytes);}});
 await test('incompressible data still benefits from block reuse',async()=>{const bytes=randomBytes(4*1024*1024);writeFileSync(file,bytes);await p.flushNeonSnapshot();bytes[chunkBytes+12]^=255;writeFileSync(file,bytes);const r=await p.flushNeonSnapshot();assert.equal(r.transfer.reusedChunks,7);assert.equal(r.transfer.uploadedChunks,1);assert.ok(r.transfer.payloadBytes<Math.ceil(bytes.length/3)*4*.13);assert.deepEqual(Buffer.concat(last().parts.map(decodeSnapshotChunk)),bytes);});
 console.log(JSON.stringify({ok:true,passed:count,syntheticBenchmark:report,counters:p.neonRemotePersistenceState().transferTotals}));
}finally{globalThis.fetch=originalFetch;rmSync(dir,{recursive:true,force:true});}
