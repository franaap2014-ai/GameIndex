PRAGMA foreign_keys = ON;
-- GameIndex Beta 0.986 HF2 finalization — experience-specific media slots.
-- Additive only: existing game_media_overrides remains untouched and is used as fallback.

CREATE TABLE IF NOT EXISTS game_experience_media_overrides (
  game_id TEXT NOT NULL,
  experience_key TEXT NOT NULL,
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
  PRIMARY KEY(game_id,experience_key,slot_key),
  FOREIGN KEY(game_id) REFERENCES games(id) ON DELETE CASCADE,
  FOREIGN KEY(updated_by) REFERENCES users(id) ON DELETE SET NULL
) STRICT;

CREATE INDEX IF NOT EXISTS idx_game_experience_media_game
ON game_experience_media_overrides(game_id,experience_key,slot_key);

INSERT INTO meta(key,value) VALUES('beta_0986_hf2_experience_media','1')
ON CONFLICT(key) DO UPDATE SET value='1';
