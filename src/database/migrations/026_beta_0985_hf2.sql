PRAGMA foreign_keys = ON;

-- GameIndex Beta 0.985 HF2 — Core Simplification
-- Legacy image/AI tables are preserved for rollback/history only. Current runtime
-- no longer reads them for public visuals or semantic decisions.

DELETE FROM ie3_assets WHERE last_reason_code='MIGRATED_FROM_0.98';

INSERT INTO meta(key,value) VALUES('beta_0985_hf2','1') ON CONFLICT(key) DO UPDATE SET value='1';
INSERT INTO meta(key,value) VALUES('beta_0985_hf2_runtime','LOCAL_FIRST_NO_API_KEY') ON CONFLICT(key) DO UPDATE SET value='LOCAL_FIRST_NO_API_KEY';
INSERT INTO meta(key,value) VALUES('legacy_image_runtime','DISABLED_ROLLBACK_ONLY') ON CONFLICT(key) DO UPDATE SET value='DISABLED_ROLLBACK_ONLY';
INSERT INTO meta(key,value) VALUES('current_image_runtime','IMAGE_ENGINE_3_NATIVE') ON CONFLICT(key) DO UPDATE SET value='IMAGE_ENGINE_3_NATIVE';
INSERT INTO meta(key,value) VALUES('semantic_ai_runtime','DEXTER_OLLAMA_OPTIONAL') ON CONFLICT(key) DO UPDATE SET value='DEXTER_OLLAMA_OPTIONAL';
INSERT INTO meta(key,value) VALUES('deterministic_core_runtime','GI_CORE_8.5_SCRIPTS') ON CONFLICT(key) DO UPDATE SET value='GI_CORE_8.5_SCRIPTS';
INSERT INTO meta(key,value) VALUES('audio_runtime','GAMEINDEX_WEB_AUDIO_1') ON CONFLICT(key) DO UPDATE SET value='GAMEINDEX_WEB_AUDIO_1';
