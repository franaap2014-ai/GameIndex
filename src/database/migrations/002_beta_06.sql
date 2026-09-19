PRAGMA foreign_keys = ON;

ALTER TABLE users ADD COLUMN last_login_at TEXT NOT NULL DEFAULT '';

ALTER TABLE images ADD COLUMN media_context TEXT NOT NULL DEFAULT 'UNKNOWN';
ALTER TABLE images ADD COLUMN source_type TEXT NOT NULL DEFAULT 'UNKNOWN';
ALTER TABLE images ADD COLUMN game_confidence REAL NOT NULL DEFAULT 0;
ALTER TABLE images ADD COLUMN subject_confidence REAL NOT NULL DEFAULT 0;
ALTER TABLE images ADD COLUMN role_confidence REAL NOT NULL DEFAULT 0;
ALTER TABLE images ADD COLUMN source_confidence REAL NOT NULL DEFAULT 0;
ALTER TABLE images ADD COLUMN verified_at TEXT NOT NULL DEFAULT '';

CREATE TABLE IF NOT EXISTS user_followed_games (
  user_id TEXT NOT NULL,
  game_id TEXT NOT NULL,
  followed_at TEXT NOT NULL,
  PRIMARY KEY(user_id, game_id),
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY(game_id) REFERENCES games(id) ON DELETE CASCADE
) STRICT;

CREATE TABLE IF NOT EXISTS user_saved_knowledge (
  user_id TEXT NOT NULL,
  knowledge_id TEXT NOT NULL,
  saved_at TEXT NOT NULL,
  PRIMARY KEY(user_id, knowledge_id),
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY(knowledge_id) REFERENCES knowledge(id) ON DELETE CASCADE
) STRICT;

CREATE TABLE IF NOT EXISTS user_activity (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  game_id TEXT,
  entity_id TEXT,
  metadata_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY(game_id) REFERENCES games(id) ON DELETE SET NULL,
  FOREIGN KEY(entity_id) REFERENCES entities(id) ON DELETE SET NULL
) STRICT;

CREATE TABLE IF NOT EXISTS creator_outputs (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  game_id TEXT NOT NULL,
  content_type TEXT NOT NULL,
  topic TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL,
  content_json TEXT NOT NULL DEFAULT '{}',
  knowledge_ids_json TEXT NOT NULL DEFAULT '[]',
  source_ids_json TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY(game_id) REFERENCES games(id) ON DELETE CASCADE
) STRICT;

CREATE TABLE IF NOT EXISTS knowledge_coverage (
  game_id TEXT NOT NULL,
  category_id TEXT NOT NULL,
  expected_entity_count INTEGER NOT NULL DEFAULT 0,
  known_entity_count INTEGER NOT NULL DEFAULT 0,
  validated_knowledge_count INTEGER NOT NULL DEFAULT 0,
  coverage_score REAL NOT NULL DEFAULT 0,
  last_expansion_at TEXT NOT NULL DEFAULT '',
  PRIMARY KEY(game_id, category_id),
  FOREIGN KEY(game_id) REFERENCES games(id) ON DELETE CASCADE
) STRICT;

CREATE INDEX IF NOT EXISTS idx_follow_user ON user_followed_games(user_id, followed_at DESC);
CREATE INDEX IF NOT EXISTS idx_follow_game ON user_followed_games(game_id);
CREATE INDEX IF NOT EXISTS idx_saved_knowledge_user ON user_saved_knowledge(user_id, saved_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_user_date ON user_activity(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_game ON user_activity(game_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_creator_user_date ON creator_outputs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_creator_game ON creator_outputs(game_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_coverage_game ON knowledge_coverage(game_id, coverage_score);
CREATE INDEX IF NOT EXISTS idx_entities_game_name ON entities(game_id, name);
CREATE INDEX IF NOT EXISTS idx_claims_knowledge ON claims(knowledge_id);
