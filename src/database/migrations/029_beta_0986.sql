PRAGMA foreign_keys = ON;
-- GameIndex Beta 0.986 — Production Consolidation
-- Additive migration only. No production users, games, universe data, social data, images or music are deleted.

CREATE TABLE IF NOT EXISTS admin_connections (
  user_id TEXT PRIMARY KEY,
  connection_role TEXT NOT NULL CHECK(connection_role IN ('CREATOR','DEV')),
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE','INACTIVE','REVOKED')),
  created_by TEXT,
  reason TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY(created_by) REFERENCES users(id) ON DELETE SET NULL
) STRICT;
CREATE INDEX IF NOT EXISTS idx_admin_connections_status ON admin_connections(status,connection_role,updated_at DESC);

-- Preserve every existing Creator/DEV assignment as an active identity connection.
INSERT OR IGNORE INTO admin_connections(user_id,connection_role,status,created_by,reason,created_at,updated_at)
SELECT user_id, CASE WHEN role='CREATOR' THEN 'CREATOR' ELSE 'DEV' END, 'ACTIVE', assigned_by,
       '0.986 migration from verified staff role', created_at, updated_at
FROM staff_role_assignments
WHERE role IN ('CREATOR','DEV') AND suspended=0;

-- Known Kxng01 identity: only applies when that exact permanent user ID exists.
INSERT OR IGNORE INTO admin_connections(user_id,connection_role,status,created_by,reason,created_at,updated_at)
SELECT u.id,'DEV','ACTIVE',
       COALESCE((SELECT u2.id FROM users u2 WHERE u2.id=(SELECT value FROM meta WHERE key='primary_creator_user_id')),u.id),
       '0.986 verified Kxng01 permanent identity',datetime('now'),datetime('now')
FROM users u WHERE u.id='3bd5057c-d2ec-4320-93dd-ac099e0a0f11';

-- The same permanent identity receives the established DEV role/capability model.
INSERT INTO staff_role_assignments(user_id,role,suspended,assigned_by,reason,created_at,updated_at)
SELECT u.id,'DEV',0,
       COALESCE((SELECT u2.id FROM users u2 WHERE u2.id=(SELECT value FROM meta WHERE key='primary_creator_user_id')),u.id),
       '0.986 verified Kxng01 permanent identity',datetime('now'),datetime('now')
FROM users u WHERE u.id='3bd5057c-d2ec-4320-93dd-ac099e0a0f11'
ON CONFLICT(user_id) DO UPDATE SET role=CASE WHEN staff_role_assignments.role='CREATOR' THEN 'CREATOR' ELSE 'DEV' END,suspended=0,reason=excluded.reason,updated_at=excluded.updated_at;

-- The verified primary Creator/Franchesco01 remains connected by permanent ID.
INSERT OR IGNORE INTO admin_connections(user_id,connection_role,status,created_by,reason,created_at,updated_at)
SELECT u.id,'CREATOR','ACTIVE',u.id,'0.986 verified primary Creator identity',datetime('now'),datetime('now')
FROM users u
WHERE u.id=(SELECT value FROM meta WHERE key='primary_creator_user_id');

CREATE TABLE IF NOT EXISTS account_security (
  user_id TEXT PRIMARY KEY,
  email_2fa_enabled INTEGER NOT NULL DEFAULT 0 CHECK(email_2fa_enabled IN (0,1)),
  email_2fa_verified_at TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
) STRICT;

CREATE TABLE IF NOT EXISTS two_factor_challenges (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  purpose TEXT NOT NULL CHECK(purpose IN ('LOGIN','ENABLE_2FA')),
  code_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  used_at TEXT NOT NULL DEFAULT '',
  attempt_count INTEGER NOT NULL DEFAULT 0,
  last_sent_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
) STRICT;
CREATE INDEX IF NOT EXISTS idx_2fa_user_purpose ON two_factor_challenges(user_id,purpose,created_at DESC);

CREATE TABLE IF NOT EXISTS gi_manual_game_images (
  game_id TEXT PRIMARY KEY,
  image_url TEXT NOT NULL,
  alt_text TEXT NOT NULL DEFAULT '',
  updated_by TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS gi_youtube_music (
  context_key TEXT PRIMARY KEY,
  context_type TEXT NOT NULL CHECK(context_type IN ('HOME','GAME')),
  game_id TEXT,
  youtube_video_id TEXT NOT NULL,
  youtube_url TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1,
  updated_by TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS gi_youtube_music_alt (
  game_id TEXT NOT NULL,
  slot_key TEXT NOT NULL,
  youtube_video_id TEXT NOT NULL,
  youtube_url TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1,
  updated_by TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY(game_id,slot_key)
);

CREATE TABLE IF NOT EXISTS game_media_overrides (
  game_id TEXT NOT NULL,
  slot_key TEXT NOT NULL CHECK(slot_key IN ('COVER','HERO','PAGE_BACKGROUND','ARTWORK')),
  storage_type TEXT NOT NULL DEFAULT 'URL' CHECK(storage_type IN ('URL','LOCAL')),
  image_url TEXT NOT NULL,
  alt_text TEXT NOT NULL DEFAULT '',
  mime_type TEXT NOT NULL DEFAULT '',
  width INTEGER NOT NULL DEFAULT 0,
  height INTEGER NOT NULL DEFAULT 0,
  byte_size INTEGER NOT NULL DEFAULT 0,
  fit_mode TEXT NOT NULL DEFAULT 'COVER' CHECK(fit_mode IN ('COVER','CONTAIN','CENTER')),
  quality INTEGER NOT NULL DEFAULT 86 CHECK(quality BETWEEN 20 AND 100),
  updated_by TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY(game_id,slot_key),
  FOREIGN KEY(game_id) REFERENCES games(id) ON DELETE CASCADE,
  FOREIGN KEY(updated_by) REFERENCES users(id) ON DELETE SET NULL
) STRICT;
CREATE INDEX IF NOT EXISTS idx_game_media_overrides_game ON game_media_overrides(game_id,slot_key);

-- Keep previous HF7 manual cover configuration.
INSERT OR IGNORE INTO game_media_overrides(game_id,slot_key,storage_type,image_url,alt_text,updated_by,created_at,updated_at)
SELECT game_id,'COVER','URL',image_url,alt_text,updated_by,created_at,updated_at FROM gi_manual_game_images;

CREATE TABLE IF NOT EXISTS game_experiences (
  game_id TEXT NOT NULL,
  experience_key TEXT NOT NULL,
  label TEXT NOT NULL DEFAULT '',
  background_slot TEXT NOT NULL DEFAULT 'PAGE_BACKGROUND',
  hero_slot TEXT NOT NULL DEFAULT 'HERO',
  music_slot TEXT NOT NULL DEFAULT 'main',
  accent_json TEXT NOT NULL DEFAULT '{}',
  enabled INTEGER NOT NULL DEFAULT 1 CHECK(enabled IN (0,1)),
  updated_by TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY(game_id,experience_key),
  FOREIGN KEY(game_id) REFERENCES games(id) ON DELETE CASCADE,
  FOREIGN KEY(updated_by) REFERENCES users(id) ON DELETE SET NULL
) STRICT;

-- Roblox is the first Personalized Game Experience pilot. Configuration stays data-driven.
INSERT OR IGNORE INTO game_experiences(game_id,experience_key,label,background_slot,hero_slot,music_slot,accent_json,enabled,created_at,updated_at)
SELECT id,'main','Roblox','PAGE_BACKGROUND','HERO','main','{"--experience-accent":"#6ea8ff"}',1,datetime('now'),datetime('now')
FROM games WHERE lower(slug)='roblox';
INSERT OR IGNORE INTO game_experiences(game_id,experience_key,label,background_slot,hero_slot,music_slot,accent_json,enabled,created_at,updated_at)
SELECT id,'roblox-og','Roblox OG 2009','ARTWORK','HERO','roblox-og','{"--experience-accent":"#b8b8b8"}',1,datetime('now'),datetime('now')
FROM games WHERE lower(slug)='roblox';

ALTER TABLE gi_youtube_music ADD COLUMN default_volume INTEGER NOT NULL DEFAULT 30 CHECK(default_volume BETWEEN 0 AND 100);
ALTER TABLE gi_youtube_music_alt ADD COLUMN default_volume INTEGER NOT NULL DEFAULT 30 CHECK(default_volume BETWEEN 0 AND 100);

INSERT INTO update_log_entries(version,title,codename,release_date,sections_json,tags_json,public,created_at)
VALUES(
  '0.986','GameIndex Beta 0.986','Production Consolidation','2026-09-03',
  '{"NEW":["Image Manager 2.0 com resize/crop e mídia same-origin","Music Manager 2.0 com volume e loop","Personalized Game Experience Beta com Roblox","Identity + Admin Connections","Troca de senha e 2FA opcional por e-mail"],"FIXED":["Header e busca responsivos","Hero centralizado na viewport","Player flutuante/Now Playing removido","Ações de desenvolvimento removidas da página pública dos jogos"],"IMPROVED":["Universe Builder 3.0 com resumo, contexto, personagens, locais, facções e relações","Traduções pt-BR/en-US/es-ES","Cache versionado e runtime canônico pós-HF1–HF7","Performance local-first e Azure App Service"]}',
  '["PRODUCTION_CONSOLIDATION","UNIVERSE_3","IMAGE_MANAGER_2","MUSIC_MANAGER_2","ROBLOX_PILOT","IDENTITY","SECURITY","LOCAL_FIRST","AZURE"]',1,datetime('now')
)
ON CONFLICT(version) DO UPDATE SET title=excluded.title,codename=excluded.codename,release_date=excluded.release_date,sections_json=excluded.sections_json,tags_json=excluded.tags_json,public=excluded.public;

INSERT INTO meta(key,value) VALUES('beta_0986','1') ON CONFLICT(key) DO UPDATE SET value='1';
INSERT INTO meta(key,value) VALUES('runtime_version','0.986') ON CONFLICT(key) DO UPDATE SET value='0.986';
INSERT INTO meta(key,value) VALUES('production_consolidation','CANONICAL_RUNTIME') ON CONFLICT(key) DO UPDATE SET value='CANONICAL_RUNTIME';
