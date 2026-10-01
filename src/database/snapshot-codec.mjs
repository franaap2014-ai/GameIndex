import {gzipSync,gunzipSync} from 'node:zlib';
// Raw base64 remains readable. A prefix makes new chunks unambiguous without changing the schema.
const PREFIX='gzip1:';
const MAX_CHUNK_BYTES=1024*1024;
export function encodeSnapshotChunk(buffer){
 if(!Buffer.isBuffer(buffer)||buffer.length<1||buffer.length>MAX_CHUNK_BYTES)throw new Error('SNAPSHOT_CHUNK_SIZE_INVALID');
 const raw=buffer.toString('base64'),compressed=PREFIX+gzipSync(buffer,{level:6}).toString('base64');
 return compressed.length<raw.length?compressed:raw;
}
export function decodeSnapshotChunk(value){
 const text=String(value||'');
 if(!text||text.length>Math.ceil(MAX_CHUNK_BYTES/3)*4+PREFIX.length)throw new Error('REMOTE_SNAPSHOT_CHUNK_SIZE_INVALID');
 const compressed=text.startsWith(PREFIX),payload=compressed?text.slice(PREFIX.length):text;
 if(payload.length%4!==0||!/^[A-Za-z0-9+/]*={0,2}$/.test(payload))throw new Error('REMOTE_SNAPSHOT_CHUNK_ENCODING_INVALID');
 const bytes=Buffer.from(payload,'base64');
 const result=compressed?gunzipSync(bytes,{maxOutputLength:MAX_CHUNK_BYTES}):bytes;
 if(!result.length||result.length>MAX_CHUNK_BYTES)throw new Error('REMOTE_SNAPSHOT_CHUNK_SIZE_INVALID');
 return result;
}
