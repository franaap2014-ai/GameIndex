CREATE TABLE IF NOT EXISTS ai_sharpener_runs (
  id TEXT PRIMARY KEY,
  actor_user_id TEXT NOT NULL,
  game_id TEXT NOT NULL,
  game_slug TEXT NOT NULL,
  question TEXT NOT NULL,
  expected_answer TEXT NOT NULL,
  max_attempts INTEGER NOT NULL DEFAULT 10000 CHECK(max_attempts BETWEEN 1 AND 10000),
  target_score REAL NOT NULL DEFAULT 0.96 CHECK(target_score BETWEEN 0.50 AND 1.0),
  plateau_window INTEGER NOT NULL DEFAULT 500 CHECK(plateau_window BETWEEN 25 AND 5000),
  status TEXT NOT NULL DEFAULT 'QUEUED',
  attempts_completed INTEGER NOT NULL DEFAULT 0,
  best_attempt_number INTEGER NOT NULL DEFAULT 0,
  best_score REAL NOT NULL DEFAULT 0,
  best_answer TEXT NOT NULL DEFAULT '',
  best_trace_id TEXT NOT NULL DEFAULT '',
  best_strategy_json TEXT NOT NULL DEFAULT '{}',
  cancel_requested INTEGER NOT NULL DEFAULT 0 CHECK(cancel_requested IN (0,1)),
  pause_requested INTEGER NOT NULL DEFAULT 0 CHECK(pause_requested IN (0,1)),
  error_code TEXT NOT NULL DEFAULT '',
  error_message TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  started_at TEXT NOT NULL DEFAULT '',
  completed_at TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL,
  FOREIGN KEY(actor_user_id) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY(game_id) REFERENCES games(id) ON DELETE RESTRICT
) STRICT;
CREATE INDEX IF NOT EXISTS idx_ai_sharpener_runs_actor ON ai_sharpener_runs(actor_user_id,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_sharpener_runs_status ON ai_sharpener_runs(status,updated_at);

CREATE TABLE IF NOT EXISTS ai_sharpener_attempts (
  id TEXT PRIMARY KEY,
  run_id TEXT NOT NULL,
  attempt_number INTEGER NOT NULL,
  strategy_key TEXT NOT NULL,
  prompt_variant TEXT NOT NULL DEFAULT '',
  answer_text TEXT NOT NULL DEFAULT '',
  score REAL NOT NULL DEFAULT 0,
  trace_id TEXT NOT NULL DEFAULT '',
  duration_ms INTEGER NOT NULL DEFAULT 0,
  metrics_json TEXT NOT NULL DEFAULT '{}',
  missing_terms_json TEXT NOT NULL DEFAULT '[]',
  improved INTEGER NOT NULL DEFAULT 0 CHECK(improved IN (0,1)),
  created_at TEXT NOT NULL,
  FOREIGN KEY(run_id) REFERENCES ai_sharpener_runs(id) ON DELETE CASCADE,
  UNIQUE(run_id,attempt_number)
) STRICT;
CREATE INDEX IF NOT EXISTS idx_ai_sharpener_attempts_run ON ai_sharpener_attempts(run_id,attempt_number DESC);
CREATE INDEX IF NOT EXISTS idx_ai_sharpener_attempts_score ON ai_sharpener_attempts(run_id,score DESC);

CREATE TABLE IF NOT EXISTS ai_sharpener_candidates (
  id TEXT PRIMARY KEY,
  run_id TEXT NOT NULL UNIQUE,
  attempt_id TEXT,
  status TEXT NOT NULL DEFAULT 'PROPOSED',
  score REAL NOT NULL DEFAULT 0,
  answer_text TEXT NOT NULL DEFAULT '',
  strategy_json TEXT NOT NULL DEFAULT '{}',
  metrics_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  reviewed_at TEXT NOT NULL DEFAULT '',
  reviewed_by TEXT,
  FOREIGN KEY(run_id) REFERENCES ai_sharpener_runs(id) ON DELETE CASCADE,
  FOREIGN KEY(attempt_id) REFERENCES ai_sharpener_attempts(id) ON DELETE SET NULL,
  FOREIGN KEY(reviewed_by) REFERENCES users(id) ON DELETE SET NULL
) STRICT;

CREATE TABLE IF NOT EXISTS ai_sharpener_golden_cases (
  id TEXT PRIMARY KEY,
  game_id TEXT NOT NULL,
  game_slug TEXT NOT NULL,
  question TEXT NOT NULL,
  question_hash TEXT NOT NULL,
  expected_answer TEXT NOT NULL,
  accepted_answer TEXT NOT NULL,
  minimum_score REAL NOT NULL DEFAULT 0.90,
  strategy_json TEXT NOT NULL DEFAULT '{}',
  source_run_id TEXT,
  created_by TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0,1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(game_id) REFERENCES games(id) ON DELETE RESTRICT,
  FOREIGN KEY(source_run_id) REFERENCES ai_sharpener_runs(id) ON DELETE SET NULL,
  FOREIGN KEY(created_by) REFERENCES users(id) ON DELETE RESTRICT,
  UNIQUE(game_id,question_hash)
) STRICT;
CREATE INDEX IF NOT EXISTS idx_ai_sharpener_golden_game ON ai_sharpener_golden_cases(game_id,active,updated_at DESC);

INSERT INTO update_log_entries(version,title,codename,release_date,sections_json,tags_json,public,created_at)
VALUES(
  '0.97','GameIndex Beta 0.97 — Pillar 1','AI Sharpener — Creator AI Evolution Lab','2026-08-21',
  '{"NEW":["AI Sharpener 1.0 Creator-only","Até 10.000 tentativas por run","Golden Cases","Target comparator","Persistent Sharpener worker"],"IMPROVED":["AI evaluation loop","Regression-ready training data"],"SAFETY":["Target usado como avaliador, não como resposta automática","Read-only AI attempts","Approval required"]}',
  '["AI_SHARPENER","CREATOR","AI7","GOLDEN_CASES","PILLAR_1"]',0,datetime('now')
)
ON CONFLICT(version) DO UPDATE SET title=excluded.title,codename=excluded.codename,release_date=excluded.release_date,sections_json=excluded.sections_json,tags_json=excluded.tags_json,public=excluded.public;

INSERT INTO meta(key,value) VALUES('beta_097_pillar_1','AI_SHARPENER') ON CONFLICT(key) DO UPDATE SET value='AI_SHARPENER';
INSERT INTO meta(key,value) VALUES('beta_097_ai_sharpener','1') ON CONFLICT(key) DO UPDATE SET value='1';
INSERT INTO meta(key,value) VALUES('beta_097_ai_sharpener_max_attempts','10000') ON CONFLICT(key) DO UPDATE SET value='10000';
