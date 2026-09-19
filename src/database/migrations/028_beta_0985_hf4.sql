PRAGMA foreign_keys = ON;
-- GameIndex Beta 0.985 HF4 — Delivery Recovery
-- Additive only: no users, games, entities, knowledge, pages, Universe, Social or IE3 media are deleted.
-- HF4 makes generation/recovery state explicit and preserves every valid Image Engine 3 revision.

ALTER TABLE generation_jobs ADD COLUMN generation_engine TEXT NOT NULL DEFAULT 'GI_CORE_GENERATION';
ALTER TABLE generation_jobs ADD COLUMN state_json TEXT NOT NULL DEFAULT '{}';
ALTER TABLE generation_jobs ADD COLUMN research_state_json TEXT NOT NULL DEFAULT '{}';
ALTER TABLE generation_jobs ADD COLUMN knowledge_state_json TEXT NOT NULL DEFAULT '{}';
ALTER TABLE generation_jobs ADD COLUMN blocking_reason TEXT NOT NULL DEFAULT '';
ALTER TABLE generation_jobs ADD COLUMN last_heartbeat_at TEXT NOT NULL DEFAULT '';
ALTER TABLE generation_jobs ADD COLUMN recovered_at TEXT NOT NULL DEFAULT '';

UPDATE generation_jobs
SET generation_version='0.985-HF4',
    generation_engine='GI_CORE_GENERATION',
    estimated_seconds_remaining=0,
    state_json=CASE WHEN state_json='' THEN '{}' ELSE state_json END,
    research_state_json=CASE WHEN research_state_json='' THEN '{}' ELSE research_state_json END,
    knowledge_state_json=CASE WHEN knowledge_state_json='' THEN '{}' ELSE knowledge_state_json END
WHERE generation_version IS NULL OR generation_version<>'0.985-HF4';

CREATE INDEX IF NOT EXISTS idx_generation_jobs_hf4_recovery
ON generation_jobs(status,updated_at,created_at);

CREATE INDEX IF NOT EXISTS idx_ie3_assets_hf4_persisted
ON ie3_assets(game_id,entity_id,image_role,current_revision,updated_at DESC);

INSERT INTO meta(key,value) VALUES('beta_0985_hf4','1') ON CONFLICT(key) DO UPDATE SET value=excluded.value;
INSERT INTO meta(key,value) VALUES('beta_0985_hf4_codename','DELIVERY_RECOVERY') ON CONFLICT(key) DO UPDATE SET value=excluded.value;
INSERT INTO meta(key,value) VALUES('generation_runtime','GI_CORE_GENERATION') ON CONFLICT(key) DO UPDATE SET value=excluded.value;
INSERT INTO meta(key,value) VALUES('generation_version','0.985-HF4') ON CONFLICT(key) DO UPDATE SET value=excluded.value;
INSERT INTO meta(key,value) VALUES('image_engine3_persistence','PERSISTED_REVISION_REUSED') ON CONFLICT(key) DO UPDATE SET value=excluded.value;
INSERT INTO meta(key,value) VALUES('image_engine3_navigation_rediscovery','DISABLED') ON CONFLICT(key) DO UPDATE SET value=excluded.value;
INSERT INTO meta(key,value) VALUES('audio_runtime','GAMEINDEX_MUSIC_DIRECTOR_3') ON CONFLICT(key) DO UPDATE SET value=excluded.value;
INSERT INTO meta(key,value) VALUES('desktop_header_runtime','REGION_GRID_V4') ON CONFLICT(key) DO UPDATE SET value=excluded.value;
INSERT INTO meta(key,value) VALUES('runtime','LOCAL_FIRST_NO_API_KEY') ON CONFLICT(key) DO UPDATE SET value=excluded.value;
