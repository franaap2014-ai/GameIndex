PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS schema_migrations (
  migration_id TEXT PRIMARY KEY,
  version TEXT NOT NULL,
  name TEXT NOT NULL,
  applied_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'APPLIED'
) STRICT;

CREATE TABLE IF NOT EXISTS pages (
  id TEXT PRIMARY KEY,
  game_id TEXT NOT NULL,
  entity_id TEXT,
  page_type TEXT NOT NULL DEFAULT 'OTHER',
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL DEFAULT '',
  summary TEXT NOT NULL DEFAULT '',
  content_json TEXT NOT NULL DEFAULT '{}',
  knowledge_ids_json TEXT NOT NULL DEFAULT '[]',
  article_ids_json TEXT NOT NULL DEFAULT '[]',
  source_ids_json TEXT NOT NULL DEFAULT '[]',
  image_requests_json TEXT NOT NULL DEFAULT '[]',
  version_context_json TEXT NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'NEEDS_REVIEW',
  confidence REAL NOT NULL DEFAULT 0,
  fact_safety_score REAL NOT NULL DEFAULT 0,
  source_safety_score REAL NOT NULL DEFAULT 0,
  context_safety_score REAL NOT NULL DEFAULT 0,
  language TEXT NOT NULL DEFAULT 'pt-BR',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  verified_at TEXT NOT NULL DEFAULT '',
  published_at TEXT NOT NULL DEFAULT '',
  UNIQUE(game_id, entity_id, page_type, language),
  FOREIGN KEY(game_id) REFERENCES games(id) ON DELETE CASCADE,
  FOREIGN KEY(entity_id) REFERENCES entities(id) ON DELETE CASCADE
) STRICT;

CREATE TABLE IF NOT EXISTS page_validations (
  id TEXT PRIMARY KEY,
  page_id TEXT NOT NULL,
  validation_type TEXT NOT NULL,
  result TEXT NOT NULL,
  score REAL NOT NULL DEFAULT 0,
  details_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  FOREIGN KEY(page_id) REFERENCES pages(id) ON DELETE CASCADE
) STRICT;

CREATE TABLE IF NOT EXISTS generation_jobs (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  game_id TEXT NOT NULL,
  entity_id TEXT,
  job_type TEXT NOT NULL DEFAULT 'PAGE',
  research_mode TEXT NOT NULL DEFAULT 'STANDARD',
  language TEXT NOT NULL DEFAULT 'pt-BR',
  status TEXT NOT NULL DEFAULT 'QUEUED',
  progress INTEGER NOT NULL DEFAULT 0,
  current_stage TEXT NOT NULL DEFAULT 'QUEUED',
  estimated_seconds_remaining INTEGER NOT NULL DEFAULT 0,
  stage_history_json TEXT NOT NULL DEFAULT '[]',
  result_page_id TEXT,
  error_code TEXT NOT NULL DEFAULT '',
  error_message TEXT NOT NULL DEFAULT '',
  cancel_requested INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  started_at TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL,
  completed_at TEXT NOT NULL DEFAULT '',
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY(game_id) REFERENCES games(id) ON DELETE CASCADE,
  FOREIGN KEY(entity_id) REFERENCES entities(id) ON DELETE CASCADE,
  FOREIGN KEY(result_page_id) REFERENCES pages(id) ON DELETE SET NULL
) STRICT;

CREATE TABLE IF NOT EXISTS update_backups (
  id TEXT PRIMARY KEY,
  from_version TEXT NOT NULL,
  to_version TEXT NOT NULL,
  backup_path TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  verified_at TEXT NOT NULL DEFAULT ''
) STRICT;

CREATE INDEX IF NOT EXISTS idx_pages_game_status ON pages(game_id, status, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_pages_entity ON pages(entity_id, language, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(game_id, slug, language);
CREATE INDEX IF NOT EXISTS idx_page_validations_page ON page_validations(page_id, validation_type);
CREATE INDEX IF NOT EXISTS idx_generation_jobs_user ON generation_jobs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generation_jobs_status ON generation_jobs(status, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_generation_jobs_entity ON generation_jobs(game_id, entity_id, created_at DESC);
