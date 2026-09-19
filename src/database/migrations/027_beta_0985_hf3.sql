PRAGMA foreign_keys = ON;
-- GameIndex Beta 0.985 HF3 — Visual & Media Recovery
-- The HF2 Image Engine 3 cache is intentionally invalidated because its title/context
-- policy could accept physical merchandise or real-person event photos for game covers.
-- Game, user, social, knowledge, Universe, and legacy rollback tables are untouched.
DELETE FROM gi_repair_actions WHERE action_type='IMAGE_REPAIR';
DELETE FROM ie3_assets;
INSERT INTO meta(key,value) VALUES('beta_0985_hf3','1') ON CONFLICT(key) DO UPDATE SET value=excluded.value;
INSERT INTO meta(key,value) VALUES('image_engine3_policy','HF3_STRICT_DIGITAL_CONTEXT_V1') ON CONFLICT(key) DO UPDATE SET value=excluded.value;
INSERT INTO meta(key,value) VALUES('image_engine3_cache_reset','HF2_VISUALS_INVALIDATED') ON CONFLICT(key) DO UPDATE SET value=excluded.value;
INSERT INTO meta(key,value) VALUES('audio_runtime','GAMEINDEX_ORIGINAL_MUSIC_2') ON CONFLICT(key) DO UPDATE SET value=excluded.value;
INSERT INTO meta(key,value) VALUES('rebirth_theme_engine','THEME_AWARE_V3') ON CONFLICT(key) DO UPDATE SET value=excluded.value;
