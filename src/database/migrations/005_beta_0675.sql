PRAGMA foreign_keys = ON;

ALTER TABLE user_profiles ADD COLUMN normalized_username TEXT NOT NULL DEFAULT '';

CREATE TABLE IF NOT EXISTS username_conflicts (
  id TEXT PRIMARY KEY,
  normalized_username TEXT NOT NULL,
  user_id TEXT NOT NULL,
  original_username TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'OPEN',
  created_at TEXT NOT NULL,
  resolved_at TEXT NOT NULL DEFAULT '',
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
) STRICT;

CREATE TABLE IF NOT EXISTS brain_requests (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  language TEXT NOT NULL DEFAULT 'pt-BR',
  status TEXT NOT NULL,
  duration_ms INTEGER NOT NULL DEFAULT 0,
  used_memory INTEGER NOT NULL DEFAULT 0,
  used_research INTEGER NOT NULL DEFAULT 0,
  error_code TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL
) STRICT;

CREATE INDEX IF NOT EXISTS idx_brain_requests_created ON brain_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_brain_requests_language ON brain_requests(language,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_brain_requests_status ON brain_requests(status,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activity_created ON user_activity(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_created ON users(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_normalized_lookup ON user_profiles(normalized_username);
