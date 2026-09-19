PRAGMA foreign_keys = ON;

-- GameVault Beta 0.7 — Discovery, Intelligence & Automation
-- This migration extends 0.675 in place. It never recreates users or knowledge.

ALTER TABLE images ADD COLUMN title TEXT NOT NULL DEFAULT '';
ALTER TABLE images ADD COLUMN description TEXT NOT NULL DEFAULT '';
ALTER TABLE images ADD COLUMN source_domain TEXT NOT NULL DEFAULT '';
ALTER TABLE images ADD COLUMN original_url TEXT NOT NULL DEFAULT '';
ALTER TABLE images ADD COLUMN mime_type TEXT NOT NULL DEFAULT '';
ALTER TABLE images ADD COLUMN file_size INTEGER NOT NULL DEFAULT 0;
ALTER TABLE images ADD COLUMN image_hash TEXT NOT NULL DEFAULT '';
ALTER TABLE images ADD COLUMN storage_type TEXT NOT NULL DEFAULT 'REMOTE';
ALTER TABLE images ADD COLUMN binary_data BLOB;
ALTER TABLE images ADD COLUMN version_context TEXT NOT NULL DEFAULT '';
ALTER TABLE images ADD COLUMN copyright_context TEXT NOT NULL DEFAULT '';
ALTER TABLE images ADD COLUMN updated_at TEXT NOT NULL DEFAULT '';
ALTER TABLE images ADD COLUMN last_used_at TEXT NOT NULL DEFAULT '';
ALTER TABLE images ADD COLUMN usage_count INTEGER NOT NULL DEFAULT 0;

ALTER TABLE pages ADD COLUMN image_ids_json TEXT NOT NULL DEFAULT '[]';
ALTER TABLE pages ADD COLUMN generation_version TEXT NOT NULL DEFAULT '0.7';

ALTER TABLE generation_jobs ADD COLUMN source_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE generation_jobs ADD COLUMN knowledge_created INTEGER NOT NULL DEFAULT 0;
ALTER TABLE generation_jobs ADD COLUMN images_used INTEGER NOT NULL DEFAULT 0;
ALTER TABLE generation_jobs ADD COLUMN generation_version TEXT NOT NULL DEFAULT '0.7';
ALTER TABLE user_preferences ADD COLUMN recommendations_enabled INTEGER NOT NULL DEFAULT 1;

CREATE TABLE IF NOT EXISTS user_interest_signals (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  game_id TEXT,
  genre TEXT NOT NULL DEFAULT '',
  franchise TEXT NOT NULL DEFAULT '',
  signal_type TEXT NOT NULL,
  weight REAL NOT NULL DEFAULT 0,
  metadata_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL DEFAULT '',
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY(game_id) REFERENCES games(id) ON DELETE CASCADE
) STRICT;

CREATE TABLE IF NOT EXISTS recommendation_events (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  game_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  reason TEXT NOT NULL DEFAULT '',
  score REAL NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY(game_id) REFERENCES games(id) ON DELETE CASCADE
) STRICT;

CREATE TABLE IF NOT EXISTS game_discovery_metrics (
  game_id TEXT PRIMARY KEY,
  baseline_community_score REAL NOT NULL DEFAULT 0,
  trending_score REAL NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT '',
  FOREIGN KEY(game_id) REFERENCES games(id) ON DELETE CASCADE
) STRICT;

CREATE TABLE IF NOT EXISTS ai3_context_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  conversation_id TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'pt-BR',
  game_id TEXT,
  entity_id TEXT,
  intent TEXT NOT NULL DEFAULT '',
  context_json TEXT NOT NULL DEFAULT '{}',
  updated_at TEXT NOT NULL,
  UNIQUE(user_id, conversation_id),
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY(game_id) REFERENCES games(id) ON DELETE SET NULL,
  FOREIGN KEY(entity_id) REFERENCES entities(id) ON DELETE SET NULL
) STRICT;



INSERT OR IGNORE INTO game_discovery_metrics(game_id,baseline_community_score,trending_score,updated_at)
SELECT id,
  CASE slug
    WHEN 'roblox' THEN 100
    WHEN 'minecraft' THEN 98
    WHEN 'fortnite' THEN 96
    WHEN 'counter-strike-2' THEN 92
    WHEN 'grand-theft-auto-v' THEN 90
    WHEN 'grand-theft-auto-vi' THEN 88
    WHEN 'grand-theft-auto-san-andreas' THEN 76
    WHEN 'marvel-s-spider-man-2' THEN 74
    WHEN 'marvel-s-spider-man' THEN 72
    WHEN 'marvel-s-spider-man-miles-morales' THEN 70
    WHEN 'sonic-the-hedgehog' THEN 68
    WHEN 'sonic-the-hedgehog-2' THEN 66
    WHEN 'sonic-the-hedgehog-3' THEN 65
    WHEN 'sonic-3-knuckles' THEN 64
    WHEN 'grand-theft-auto-iv' THEN 62
    WHEN 'grand-theft-auto-vice-city' THEN 60
    WHEN 'grand-theft-auto-iii' THEN 56
    ELSE 50
  END,
  0,
  datetime('now')
FROM games;

CREATE INDEX IF NOT EXISTS idx_images_hash ON images(image_hash) WHERE image_hash<>'';
CREATE INDEX IF NOT EXISTS idx_images_entity_status ON images(entity_id,status,role,confidence DESC);
CREATE INDEX IF NOT EXISTS idx_images_storage ON images(storage_type,status);
CREATE INDEX IF NOT EXISTS idx_interest_user_date ON user_interest_signals(user_id,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_interest_user_game ON user_interest_signals(user_id,game_id,signal_type);
CREATE INDEX IF NOT EXISTS idx_recommendation_user_date ON recommendation_events(user_id,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_recommendation_game_date ON recommendation_events(game_id,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generation_jobs_v07 ON generation_jobs(status,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai3_context_user ON ai3_context_sessions(user_id,updated_at DESC);
