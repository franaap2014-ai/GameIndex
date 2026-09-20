-- GameIndex Beta 0.991 I1 — persistence safety, cinematic administration and structured bug diagnostics
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS bug_diagnostics (
  id TEXT PRIMARY KEY,
  bug_id TEXT NOT NULL REFERENCES bugs(id) ON DELETE CASCADE,
  category TEXT NOT NULL DEFAULT 'GENERAL',
  diagnostic_key TEXT NOT NULL,
  diagnostic_value TEXT NOT NULL DEFAULT '',
  source TEXT NOT NULL DEFAULT 'SYSTEM',
  created_at TEXT NOT NULL
) STRICT;
CREATE INDEX IF NOT EXISTS idx_bug_diagnostics_bug ON bug_diagnostics(bug_id,category,created_at DESC);

CREATE TABLE IF NOT EXISTS cinematic_admin_actions (
  id TEXT PRIMARY KEY,
  actor_user_id TEXT NULL REFERENCES users(id) ON DELETE SET NULL,
  target_user_id TEXT NULL REFERENCES users(id) ON DELETE SET NULL,
  event_key TEXT NOT NULL,
  action_type TEXT NOT NULL CHECK(action_type IN ('RESET_ELIGIBILITY','REAL_REPLAY')),
  metadata_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL
) STRICT;
CREATE INDEX IF NOT EXISTS idx_cinematic_admin_actions_actor ON cinematic_admin_actions(actor_user_id,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cinematic_admin_actions_target ON cinematic_admin_actions(target_user_id,created_at DESC);

INSERT INTO meta(key,value) VALUES('runtime_version','0.991-I1')
ON CONFLICT(key) DO UPDATE SET value=excluded.value;
INSERT INTO meta(key,value) VALUES('public_version','0.991')
ON CONFLICT(key) DO UPDATE SET value=excluded.value;
INSERT INTO meta(key,value) VALUES('runtime_release','BETA_0_991_I1_RELIABILITY_NAVIGATION_DIAGNOSTICS')
ON CONFLICT(key) DO UPDATE SET value=excluded.value;
INSERT INTO meta(key,value) VALUES('beta_0991_i1','1') ON CONFLICT(key) DO UPDATE SET value='1';
