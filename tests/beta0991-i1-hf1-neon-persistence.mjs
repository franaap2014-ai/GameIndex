import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=p=>readFileSync(path.join(root,p),"utf8");

const persistence=read("src/database/neon-snapshot-persistence.mjs");
const connection=read("src/database/connection.mjs");
const migration=read("src/database/migrations/043_beta_0991_i1_hf1.sql");
const release=read("src/config/release-099i6.mjs");
const env=read(".env.example");
const server=read("server.mjs");
const admin=read("public/js/admin.js");
const pkg=JSON.parse(read("package.json"));

assert.match(persistence,/Neon-Connection-String/);
assert.match(persistence,/gameindex_runtime_snapshots/);
assert.match(persistence,/gameindex_runtime_snapshot_chunks/);
assert.match(persistence,/sha256/);
assert.match(persistence,/REMOTE_SNAPSHOT_HASH_MISMATCH/);
assert.match(persistence,/complete=TRUE/);
assert.match(persistence,/restoreLatestNeonSnapshot/);
assert.match(persistence,/flushNeonSnapshot/);
assert.match(persistence,/SIGTERM/);
assert.match(persistence,/DATABASE_URL_REDACTED/);

assert.match(connection,/NEON_REMOTE_SQLITE_SNAPSHOT/);
assert.match(connection,/neonRemotePersistenceConfigured/);
assert.match(connection,/restoreLatestNeonSnapshot/);
assert.match(connection,/startDurablePersistence/);
assert.doesNotMatch(connection,/GAMEINDEX_RENDER_PERSISTENT_DISK/);
assert.match(connection,/const persistent=render\?remote:/);
assert.match(connection,/Local SQLite paths are temporary and are never accepted as persistent storage/);
assert.match(connection,/GAMEINDEX_PERSISTENT_STORAGE_REQUIRED/);
assert.match(connection,/043_beta_0991_i1_hf1\.sql/);
assert.match(connection,/GAMEINDEX_TARGET_SCHEMA\|\|44/);

assert.match(migration,/0\.991-I1-HF1/);
assert.match(migration,/BETA_0_991_I1_HF1_NEON_PERSISTENCE/);
assert.match(migration,/persistence_provider/);

assert.match(release,/INTERNAL_RELEASE="0\.991-I1-HF2"/);
assert.match(release,/TARGET_SCHEMA=44/);
assert.match(release,/BETA_0_991_I1_HF2_CREATOR_ANIMATION_EDITOR/);

assert.match(env,/DATABASE_URL=/);
assert.match(env,/GAMEINDEX_REMOTE_SNAPSHOT_KEY=production/);
assert.match(env,/GAMEINDEX_TARGET_SCHEMA=44/);
assert.match(server,/await startDurablePersistence/);
assert.match(server,/CREATOR \+ ANIMATION EDITOR ONLINE|NEON PERSISTENCE ONLINE/);
assert.match(admin,/NEON_REMOTE_SQLITE_SNAPSHOT|Neon/);

assert.equal(pkg.version,"0.991.4");
assert.equal(pkg.scripts["test:0991i1hf1"],"node tests/beta0991-i1-hf1-neon-persistence.mjs");

console.log("Beta 0.991 I1 HF1 Neon persistence contract: PASS");
