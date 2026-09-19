PRAGMA foreign_keys = ON;

-- GameIndex Beta 0.98 — Autonomous Universe & Deterministic Intelligence Core
-- Additive migration. Existing 0.975 BF / Pre-Public data is preserved.

CREATE TABLE IF NOT EXISTS gi_core_events (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  game_id TEXT,
  entity_id TEXT,
  subject_type TEXT NOT NULL DEFAULT '',
  subject_id TEXT NOT NULL DEFAULT '',
  payload_json TEXT NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'PUBLISHED',
  created_at TEXT NOT NULL,
  FOREIGN KEY(game_id) REFERENCES games(id) ON DELETE CASCADE,
  FOREIGN KEY(entity_id) REFERENCES entities(id) ON DELETE SET NULL
) STRICT;
CREATE INDEX IF NOT EXISTS idx_gi_core_events_type ON gi_core_events(event_type,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gi_core_events_game ON gi_core_events(game_id,created_at DESC);

CREATE TABLE IF NOT EXISTS gi_jobs (
  id TEXT PRIMARY KEY,
  job_key TEXT NOT NULL UNIQUE,
  game_id TEXT NOT NULL,
  entity_id TEXT,
  manifest_id TEXT,
  manifest_item_id TEXT,
  job_type TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'QUEUED',
  priority INTEGER NOT NULL DEFAULT 50,
  revision INTEGER NOT NULL DEFAULT 1,
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 4,
  available_at TEXT NOT NULL,
  lease_owner TEXT NOT NULL DEFAULT '',
  lease_expires_at TEXT NOT NULL DEFAULT '',
  last_error_code TEXT NOT NULL DEFAULT '',
  last_error_message TEXT NOT NULL DEFAULT '',
  input_json TEXT NOT NULL DEFAULT '{}',
  output_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  completed_at TEXT NOT NULL DEFAULT '',
  FOREIGN KEY(game_id) REFERENCES games(id) ON DELETE CASCADE,
  FOREIGN KEY(entity_id) REFERENCES entities(id) ON DELETE SET NULL,
  FOREIGN KEY(manifest_id) REFERENCES content_manifests(id) ON DELETE CASCADE,
  FOREIGN KEY(manifest_item_id) REFERENCES content_manifest_items(id) ON DELETE CASCADE
) STRICT;
CREATE INDEX IF NOT EXISTS idx_gi_jobs_queue ON gi_jobs(state,available_at,priority,created_at);
CREATE INDEX IF NOT EXISTS idx_gi_jobs_game ON gi_jobs(game_id,job_type,state,updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_gi_jobs_entity ON gi_jobs(entity_id,state,updated_at DESC);

CREATE TABLE IF NOT EXISTS gi_universe_states (
  id TEXT PRIMARY KEY,
  game_id TEXT NOT NULL,
  entity_id TEXT,
  manifest_item_id TEXT,
  current_state TEXT NOT NULL DEFAULT 'DISCOVERED',
  knowledge_status TEXT NOT NULL DEFAULT 'UNKNOWN',
  image_status TEXT NOT NULL DEFAULT 'PENDING',
  page_status TEXT NOT NULL DEFAULT 'PENDING',
  relationship_status TEXT NOT NULL DEFAULT 'PENDING',
  index_status TEXT NOT NULL DEFAULT 'PENDING',
  publish_status TEXT NOT NULL DEFAULT 'DRAFT',
  blocking_reasons_json TEXT NOT NULL DEFAULT '[]',
  retry_count INTEGER NOT NULL DEFAULT 0,
  revision INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE(game_id,entity_id),
  FOREIGN KEY(game_id) REFERENCES games(id) ON DELETE CASCADE,
  FOREIGN KEY(entity_id) REFERENCES entities(id) ON DELETE CASCADE,
  FOREIGN KEY(manifest_item_id) REFERENCES content_manifest_items(id) ON DELETE SET NULL
) STRICT;
CREATE INDEX IF NOT EXISTS idx_gi_universe_states_game ON gi_universe_states(game_id,current_state,updated_at DESC);

CREATE TABLE IF NOT EXISTS gi_state_transitions (
  id TEXT PRIMARY KEY,
  universe_state_id TEXT NOT NULL,
  from_state TEXT NOT NULL,
  to_state TEXT NOT NULL,
  reason TEXT NOT NULL DEFAULT '',
  source TEXT NOT NULL DEFAULT 'CORE',
  details_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  FOREIGN KEY(universe_state_id) REFERENCES gi_universe_states(id) ON DELETE CASCADE
) STRICT;
CREATE INDEX IF NOT EXISTS idx_gi_state_transitions_state ON gi_state_transitions(universe_state_id,created_at DESC);

CREATE TABLE IF NOT EXISTS gi_worker_heartbeats (
  worker_id TEXT PRIMARY KEY,
  worker_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'IDLE',
  active_job_id TEXT NOT NULL DEFAULT '',
  processed_count INTEGER NOT NULL DEFAULT 0,
  failed_count INTEGER NOT NULL DEFAULT 0,
  last_heartbeat_at TEXT NOT NULL,
  started_at TEXT NOT NULL,
  metadata_json TEXT NOT NULL DEFAULT '{}'
) STRICT;

CREATE TABLE IF NOT EXISTS gi_operation_metrics (
  id TEXT PRIMARY KEY,
  operation_type TEXT NOT NULL,
  operation_name TEXT NOT NULL,
  game_id TEXT,
  entity_id TEXT,
  duration_ms REAL NOT NULL DEFAULT 0,
  success INTEGER NOT NULL DEFAULT 1 CHECK(success IN (0,1)),
  ai_invoked INTEGER NOT NULL DEFAULT 0 CHECK(ai_invoked IN (0,1)),
  ai_avoided INTEGER NOT NULL DEFAULT 0 CHECK(ai_avoided IN (0,1)),
  fallback_used INTEGER NOT NULL DEFAULT 0 CHECK(fallback_used IN (0,1)),
  details_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  FOREIGN KEY(game_id) REFERENCES games(id) ON DELETE SET NULL,
  FOREIGN KEY(entity_id) REFERENCES entities(id) ON DELETE SET NULL
) STRICT;
CREATE INDEX IF NOT EXISTS idx_gi_operation_metrics_recent ON gi_operation_metrics(created_at DESC,operation_type);

CREATE TABLE IF NOT EXISTS gi_stall_events (
  id TEXT PRIMARY KEY,
  game_id TEXT NOT NULL,
  entity_id TEXT,
  stall_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'OPEN',
  fingerprint TEXT NOT NULL,
  details_json TEXT NOT NULL DEFAULT '{}',
  first_seen_at TEXT NOT NULL,
  last_seen_at TEXT NOT NULL,
  resolved_at TEXT NOT NULL DEFAULT '',
  UNIQUE(fingerprint),
  FOREIGN KEY(game_id) REFERENCES games(id) ON DELETE CASCADE,
  FOREIGN KEY(entity_id) REFERENCES entities(id) ON DELETE SET NULL
) STRICT;
CREATE INDEX IF NOT EXISTS idx_gi_stall_events_open ON gi_stall_events(status,last_seen_at DESC);

CREATE TABLE IF NOT EXISTS gi_media_assets (
  id TEXT PRIMARY KEY,
  image_id TEXT NOT NULL UNIQUE,
  game_id TEXT NOT NULL,
  entity_id TEXT,
  image_role TEXT NOT NULL,
  revision INTEGER NOT NULL DEFAULT 1,
  public_path TEXT NOT NULL,
  source_url TEXT NOT NULL DEFAULT '',
  mime_type TEXT NOT NULL DEFAULT '',
  width INTEGER,
  height INTEGER,
  byte_size INTEGER NOT NULL DEFAULT 0,
  source_confidence REAL NOT NULL DEFAULT 0,
  context_confidence REAL NOT NULL DEFAULT 0,
  validation_status TEXT NOT NULL DEFAULT 'VALIDATED',
  browser_status TEXT NOT NULL DEFAULT 'NOT_TESTED',
  is_fallback INTEGER NOT NULL DEFAULT 0 CHECK(is_fallback IN (0,1)),
  failure_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  last_validated_at TEXT NOT NULL DEFAULT '',
  FOREIGN KEY(image_id) REFERENCES images(id) ON DELETE CASCADE,
  FOREIGN KEY(game_id) REFERENCES games(id) ON DELETE CASCADE,
  FOREIGN KEY(entity_id) REFERENCES entities(id) ON DELETE SET NULL
) STRICT;
CREATE INDEX IF NOT EXISTS idx_gi_media_assets_game ON gi_media_assets(game_id,entity_id,image_role,validation_status);

CREATE TABLE IF NOT EXISTS gi_search_index_revisions (
  id TEXT PRIMARY KEY,
  page_id TEXT NOT NULL,
  game_id TEXT NOT NULL,
  entity_id TEXT,
  revision INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'INDEXED',
  indexed_at TEXT NOT NULL,
  UNIQUE(page_id,revision),
  FOREIGN KEY(page_id) REFERENCES pages(id) ON DELETE CASCADE,
  FOREIGN KEY(game_id) REFERENCES games(id) ON DELETE CASCADE,
  FOREIGN KEY(entity_id) REFERENCES entities(id) ON DELETE SET NULL
) STRICT;

INSERT INTO meta(key,value) VALUES('beta_098','1') ON CONFLICT(key) DO UPDATE SET value='1';
INSERT INTO meta(key,value) VALUES('beta_098_runtime','LOCAL_FIRST_NO_API_KEY') ON CONFLICT(key) DO UPDATE SET value='LOCAL_FIRST_NO_API_KEY';
INSERT INTO meta(key,value) VALUES('beta_098_ai_complex','8.0') ON CONFLICT(key) DO UPDATE SET value='8.0';
INSERT INTO meta(key,value) VALUES('beta_098_core','DETERMINISTIC_CORE') ON CONFLICT(key) DO UPDATE SET value='DETERMINISTIC_CORE';
