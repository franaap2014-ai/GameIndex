-- Additive: retain uploaded avatars inside the SQLite snapshot persisted to Neon.
CREATE TABLE IF NOT EXISTS uploaded_avatar_assets (
  filename TEXT PRIMARY KEY,
  mime_type TEXT NOT NULL CHECK(mime_type IN ('image/png','image/jpeg','image/webp')),
  payload BLOB NOT NULL CHECK(length(payload) BETWEEN 32 AND 2097152),
  created_at TEXT NOT NULL
) STRICT;

CREATE TABLE IF NOT EXISTS uploaded_game_media_assets (
  filename TEXT PRIMARY KEY,
  mime_type TEXT NOT NULL CHECK(mime_type IN ('image/png','image/jpeg','image/webp')),
  payload BLOB NOT NULL CHECK(length(payload) BETWEEN 24 AND 8388608),
  created_at TEXT NOT NULL
) STRICT;
INSERT INTO meta(key,value) VALUES('runtime_version','0.9915-I1-HF2') ON CONFLICT(key) DO UPDATE SET value=excluded.value;
INSERT INTO meta(key,value) VALUES('runtime_release','BETA_0_9915_I1_HF2_AUDIT') ON CONFLICT(key) DO UPDATE SET value=excluded.value;
