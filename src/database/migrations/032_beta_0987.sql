PRAGMA foreign_keys = ON;
-- GameIndex Beta 0.987 — Final Personalization Polish.
-- Additive migration. Existing games, users, themes, media and music remain intact.

ALTER TABLE game_experience_profiles ADD COLUMN component_json TEXT NOT NULL DEFAULT '{}';
ALTER TABLE game_experience_profiles ADD COLUMN motion_json TEXT NOT NULL DEFAULT '{}';
ALTER TABLE game_experience_profiles ADD COLUMN default_era_key TEXT NOT NULL DEFAULT '';

CREATE TABLE IF NOT EXISTS game_era_profiles (
  game_id TEXT NOT NULL,
  experience_key TEXT NOT NULL,
  era_key TEXT NOT NULL,
  label TEXT NOT NULL DEFAULT '',
  subtitle TEXT NOT NULL DEFAULT '',
  theme_json TEXT NOT NULL DEFAULT '{}',
  font_json TEXT NOT NULL DEFAULT '{}',
  component_json TEXT NOT NULL DEFAULT '{}',
  motion_json TEXT NOT NULL DEFAULT '{}',
  music_slot TEXT NOT NULL DEFAULT '',
  enabled INTEGER NOT NULL DEFAULT 1 CHECK(enabled IN (0,1)),
  updated_by TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY(game_id,experience_key,era_key),
  FOREIGN KEY(game_id) REFERENCES games(id) ON DELETE CASCADE,
  FOREIGN KEY(game_id,experience_key) REFERENCES game_experience_profiles(game_id,experience_key) ON DELETE CASCADE,
  FOREIGN KEY(updated_by) REFERENCES users(id) ON DELETE SET NULL
) STRICT;
CREATE INDEX IF NOT EXISTS idx_game_era_profiles_lookup
ON game_era_profiles(game_id,experience_key,enabled,era_key);

CREATE TABLE IF NOT EXISTS game_era_media_overrides (
  game_id TEXT NOT NULL,
  experience_key TEXT NOT NULL,
  era_key TEXT NOT NULL,
  slot_key TEXT NOT NULL,
  storage_type TEXT NOT NULL DEFAULT 'LOCAL' CHECK(storage_type IN ('LOCAL','URL')),
  image_url TEXT NOT NULL,
  alt_text TEXT NOT NULL DEFAULT '',
  mime_type TEXT NOT NULL DEFAULT '',
  width INTEGER NOT NULL DEFAULT 0,
  height INTEGER NOT NULL DEFAULT 0,
  byte_size INTEGER NOT NULL DEFAULT 0,
  fit_mode TEXT NOT NULL DEFAULT 'COVER' CHECK(fit_mode IN ('COVER','CONTAIN','CENTER')),
  quality INTEGER NOT NULL DEFAULT 86,
  updated_by TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY(game_id,experience_key,era_key,slot_key),
  FOREIGN KEY(game_id) REFERENCES games(id) ON DELETE CASCADE,
  FOREIGN KEY(game_id,experience_key,era_key) REFERENCES game_era_profiles(game_id,experience_key,era_key) ON DELETE CASCADE,
  FOREIGN KEY(updated_by) REFERENCES users(id) ON DELETE SET NULL
) STRICT;
CREATE INDEX IF NOT EXISTS idx_game_era_media_lookup
ON game_era_media_overrides(game_id,experience_key,era_key,slot_key);

INSERT INTO update_log_entries(version,title,codename,release_date,sections_json,tags_json,public,created_at)
VALUES(
  '0.987','GameIndex Beta 0.987','Final Personalization Polish','2026-09-05',
  '{"NEW":["Personalization Engine 2.0","Era Profiles genéricos","Component Variants","Personalization Inspector"],"FIXED":["Loop de música baseado no YouTube IFrame Player API","Retenção automática de backups SQLite","Preflight de espaço e backup atômico"],"IMPROVED":["Roblox Modern × GameIndex","Roblox OG × GameIndex inspirado na linguagem web clássica","Fallbacks de mídia e música","Polimento responsivo e acessível"]}',
  '["PERSONALIZATION_2","ERA_PROFILES","ROBLOX_OG","MUSIC_LOOP","BACKUP_RETENTION","LOCAL_FIRST"]',1,datetime('now')
)
ON CONFLICT(version) DO UPDATE SET title=excluded.title,codename=excluded.codename,release_date=excluded.release_date,sections_json=excluded.sections_json,tags_json=excluded.tags_json,public=excluded.public;

INSERT INTO meta(key,value) VALUES('beta_0987','1') ON CONFLICT(key) DO UPDATE SET value='1';
INSERT INTO meta(key,value) VALUES('runtime_release','BETA_0_987_FINAL_PERSONALIZATION') ON CONFLICT(key) DO UPDATE SET value=excluded.value;
