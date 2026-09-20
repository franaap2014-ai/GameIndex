-- GameIndex Beta 0.991 I1 HF1 — Render Free + Neon durable persistence
PRAGMA foreign_keys = ON;

INSERT INTO meta(key,value) VALUES('runtime_version','0.991-I1-HF1')
ON CONFLICT(key) DO UPDATE SET value=excluded.value;
INSERT INTO meta(key,value) VALUES('public_version','0.991')
ON CONFLICT(key) DO UPDATE SET value=excluded.value;
INSERT INTO meta(key,value) VALUES('runtime_release','BETA_0_991_I1_HF1_NEON_PERSISTENCE')
ON CONFLICT(key) DO UPDATE SET value=excluded.value;
INSERT INTO meta(key,value) VALUES('persistence_provider','NEON_REMOTE_SQLITE_SNAPSHOT')
ON CONFLICT(key) DO UPDATE SET value=excluded.value;
INSERT INTO meta(key,value) VALUES('beta_0991_i1_hf1','1')
ON CONFLICT(key) DO UPDATE SET value='1';
