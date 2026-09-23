import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
const dir=mkdtempSync(path.join(tmpdir(),'gi-hf2-persist-')),file=path.join(dir,'runtime.sqlite');
process.env.DATABASE_URL='postgresql://test:test@ep-audit.neon.tech/test';
process.env.GAMEINDEX_REMOTE_SNAPSHOT_WATCH_MS='30000';
const snapshots=new Map();let pauseNext=false,releasePaused,paused;
const oldFetch=globalThis.fetch;
globalThis.fetch=async(_url,opts)=>{
 assert.ok(opts.signal,'every Neon request has a timeout');
 const {query,params:p}=JSON.parse(opts.body);let rows=[];
 if(query.startsWith('INSERT INTO gameindex_runtime_snapshots'))snapshots.set(p[0],{snapshot_id:p[0],sha256:p[4],parts:[],complete:false});
 else if(query.startsWith('INSERT INTO gameindex_runtime_snapshot_chunks')){if(pauseNext){pauseNext=false;paused?.();await new Promise(r=>releasePaused=r);}snapshots.get(p[0]).parts[p[1]]=p[2];}
 else if(query.startsWith('UPDATE gameindex_runtime_snapshots'))snapshots.get(p[0]).complete=true;
 else if(query.includes('COUNT(*)'))rows=[{count:[...snapshots.values()].filter(x=>x.complete).length}];
 else if(query.includes('SELECT snapshot_id,sha256')){const last=[...snapshots.values()].filter(x=>x.complete).at(-1);if(last)rows=[last];}
 const names=rows.length?Object.keys(rows[0]):[];
 return Response.json({fields:names.map(name=>({name})),rows:rows.map(row=>names.map(name=>row[name])),rowCount:rows.length});
};
try{
 const persistence=await import('../src/database/neon-snapshot-persistence.mjs');
 writeFileSync(file,Buffer.alloc(4096,1));
 await persistence.startNeonSnapshotRuntime({databasePath:file,getSchemaVersion:()=>47,release:'TEST',checkpoint(){},verifyDatabase(){return {ok:true};}});
 writeFileSync(file,Buffer.alloc(4096,2));
 const blocked=new Promise(r=>paused=r);pauseNext=true;
 const first=persistence.flushNeonSnapshot({force:true,reason:'first-write'});await blocked;
 writeFileSync(file,Buffer.alloc(4096,3));
 const second=persistence.flushNeonSnapshot({force:true,reason:'write-during-upload'});releasePaused();await Promise.all([first,second]);
 const last=[...snapshots.values()].filter(x=>x.complete).at(-1);
 assert.deepEqual(Buffer.concat(last.parts.map(p=>Buffer.from(p,'base64'))),readFileSync(file));
 assert.equal(snapshots.size,3);
 console.log(JSON.stringify({ok:true,tests:['concurrent flush preserves latest write','caller waits for queued upload','Neon HTTP timeout present'],snapshots:snapshots.size}));
}finally{globalThis.fetch=oldFetch;rmSync(dir,{recursive:true,force:true});}
