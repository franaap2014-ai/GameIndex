PRAGMA foreign_keys = ON;

-- GameIndex Beta 0.975 BF — Pre-Public Integration Gate
-- Additive only. No historical data is deleted.

ALTER TABLE images ADD COLUMN image_revision INTEGER NOT NULL DEFAULT 1;
ALTER TABLE images ADD COLUMN last_browser_pass TEXT NOT NULL DEFAULT '';
ALTER TABLE images ADD COLUMN last_context_pass TEXT NOT NULL DEFAULT '';
ALTER TABLE images ADD COLUMN failure_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE images ADD COLUMN public_render_state TEXT NOT NULL DEFAULT 'NOT_TESTED';

ALTER TABLE image_render_events ADD COLUMN image_id TEXT NOT NULL DEFAULT '';
ALTER TABLE image_render_events ADD COLUMN image_revision INTEGER NOT NULL DEFAULT 0;
ALTER TABLE image_render_events ADD COLUMN real_image_pass INTEGER NOT NULL DEFAULT 0 CHECK(real_image_pass IN (0,1));

CREATE TABLE IF NOT EXISTS pre_public_runs (
  id TEXT PRIMARY KEY,
  game_id TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'pt-BR',
  manifest_id TEXT,
  research_batch_id TEXT,
  universe_run_id TEXT,
  status TEXT NOT NULL DEFAULT 'PLANNING',
  current_stage TEXT NOT NULL DEFAULT 'DISCOVERY',
  blocking_reasons_json TEXT NOT NULL DEFAULT '[]',
  requested_by TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  completed_at TEXT NOT NULL DEFAULT '',
  FOREIGN KEY(game_id) REFERENCES games(id) ON DELETE CASCADE,
  FOREIGN KEY(manifest_id) REFERENCES content_manifests(id) ON DELETE SET NULL,
  FOREIGN KEY(research_batch_id) REFERENCES research_batches(id) ON DELETE SET NULL,
  FOREIGN KEY(universe_run_id) REFERENCES universe_build_runs(id) ON DELETE SET NULL,
  FOREIGN KEY(requested_by) REFERENCES users(id) ON DELETE SET NULL
) STRICT;
CREATE INDEX IF NOT EXISTS idx_pre_public_runs_game ON pre_public_runs(game_id,status,updated_at DESC);

CREATE TABLE IF NOT EXISTS pre_public_jobs (
  id TEXT PRIMARY KEY,
  run_id TEXT,
  manifest_id TEXT,
  manifest_item_id TEXT,
  game_id TEXT NOT NULL,
  entity_id TEXT,
  job_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'QUEUED',
  priority INTEGER NOT NULL DEFAULT 5,
  readiness REAL NOT NULL DEFAULT 0,
  blocking_reasons_json TEXT NOT NULL DEFAULT '[]',
  attempt_count INTEGER NOT NULL DEFAULT 0,
  available_at TEXT NOT NULL DEFAULT '',
  lease_owner TEXT NOT NULL DEFAULT '',
  lease_expires_at TEXT NOT NULL DEFAULT '',
  last_attempt_at TEXT NOT NULL DEFAULT '',
  result_ref TEXT NOT NULL DEFAULT '',
  error_code TEXT NOT NULL DEFAULT '',
  error_message TEXT NOT NULL DEFAULT '',
  metadata_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(run_id) REFERENCES pre_public_runs(id) ON DELETE CASCADE,
  FOREIGN KEY(manifest_id) REFERENCES content_manifests(id) ON DELETE CASCADE,
  FOREIGN KEY(manifest_item_id) REFERENCES content_manifest_items(id) ON DELETE CASCADE,
  FOREIGN KEY(game_id) REFERENCES games(id) ON DELETE CASCADE,
  FOREIGN KEY(entity_id) REFERENCES entities(id) ON DELETE SET NULL,
  UNIQUE(manifest_item_id,job_type)
) STRICT;
CREATE INDEX IF NOT EXISTS idx_pre_public_jobs_queue ON pre_public_jobs(status,available_at,priority,created_at);
CREATE INDEX IF NOT EXISTS idx_pre_public_jobs_game ON pre_public_jobs(game_id,job_type,status);

CREATE TABLE IF NOT EXISTS pre_public_search_index (
  id TEXT PRIMARY KEY,
  game_id TEXT NOT NULL,
  subject_type TEXT NOT NULL,
  subject_id TEXT NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL DEFAULT '',
  summary TEXT NOT NULL DEFAULT '',
  keywords TEXT NOT NULL DEFAULT '',
  href TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'pt-BR',
  publish_state TEXT NOT NULL DEFAULT 'PUBLISHED',
  updated_at TEXT NOT NULL,
  UNIQUE(subject_type,subject_id,language),
  FOREIGN KEY(game_id) REFERENCES games(id) ON DELETE CASCADE
) STRICT;
CREATE INDEX IF NOT EXISTS idx_pre_public_search_game ON pre_public_search_index(game_id,language,publish_state);
CREATE INDEX IF NOT EXISTS idx_pre_public_search_title ON pre_public_search_index(title);

CREATE TABLE IF NOT EXISTS pre_public_performance_events (
  id TEXT PRIMARY KEY,
  page_path TEXT NOT NULL DEFAULT '',
  dom_nodes INTEGER NOT NULL DEFAULT 0,
  api_response_bytes INTEGER NOT NULL DEFAULT 0,
  api_duration_ms REAL NOT NULL DEFAULT 0,
  render_duration_ms REAL NOT NULL DEFAULT 0,
  visible_items INTEGER NOT NULL DEFAULT 0,
  cached_items INTEGER NOT NULL DEFAULT 0,
  active_requests INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
) STRICT;
CREATE INDEX IF NOT EXISTS idx_pre_public_performance_recent ON pre_public_performance_events(created_at DESC,page_path);

CREATE TABLE IF NOT EXISTS image_repair_queue (
  id TEXT PRIMARY KEY,
  image_id TEXT NOT NULL,
  game_id TEXT NOT NULL,
  entity_id TEXT,
  role TEXT NOT NULL DEFAULT 'COVER',
  status TEXT NOT NULL DEFAULT 'QUEUED',
  reason TEXT NOT NULL DEFAULT '',
  attempt_count INTEGER NOT NULL DEFAULT 0,
  available_at TEXT NOT NULL,
  last_attempt_at TEXT NOT NULL DEFAULT '',
  error_message TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(image_id),
  FOREIGN KEY(image_id) REFERENCES images(id) ON DELETE CASCADE,
  FOREIGN KEY(game_id) REFERENCES games(id) ON DELETE CASCADE,
  FOREIGN KEY(entity_id) REFERENCES entities(id) ON DELETE SET NULL
) STRICT;
CREATE INDEX IF NOT EXISTS idx_image_repair_queue_work ON image_repair_queue(status,available_at,updated_at);

CREATE TABLE IF NOT EXISTS pipeline_handoff_claim_metrics (
  id TEXT PRIMARY KEY,
  flow_id TEXT NOT NULL DEFAULT '',
  from_component TEXT NOT NULL,
  to_component TEXT NOT NULL,
  claims_before INTEGER NOT NULL DEFAULT 0,
  claims_after INTEGER NOT NULL DEFAULT 0,
  valid_rejections INTEGER NOT NULL DEFAULT 0,
  unexpected_loss INTEGER NOT NULL DEFAULT 0,
  loss_rate REAL NOT NULL DEFAULT 0,
  rejected_reasons_json TEXT NOT NULL DEFAULT '[]',
  source_refs_json TEXT NOT NULL DEFAULT '[]',
  confidence REAL NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
) STRICT;
CREATE INDEX IF NOT EXISTS idx_pipeline_handoff_claim_metrics_flow ON pipeline_handoff_claim_metrics(flow_id,created_at);

CREATE TABLE IF NOT EXISTS pre_public_live_validations (
  id TEXT PRIMARY KEY,
  contract_key TEXT NOT NULL,
  environment TEXT NOT NULL,
  result TEXT NOT NULL,
  evidence_json TEXT NOT NULL DEFAULT '{}',
  verified_at TEXT NOT NULL,
  verified_by TEXT,
  FOREIGN KEY(verified_by) REFERENCES users(id) ON DELETE SET NULL
) STRICT;
CREATE INDEX IF NOT EXISTS idx_pre_public_live_validation ON pre_public_live_validations(contract_key,environment,verified_at DESC);

INSERT INTO meta(key,value) VALUES('beta_0975_bf_pre_public','1') ON CONFLICT(key) DO UPDATE SET value='1';
INSERT INTO meta(key,value) VALUES('beta_0975_bf_pre_public_contract','RELEASE_CONTRACT_0.975_BF_PRE_PUBLIC') ON CONFLICT(key) DO UPDATE SET value='RELEASE_CONTRACT_0.975_BF_PRE_PUBLIC';
