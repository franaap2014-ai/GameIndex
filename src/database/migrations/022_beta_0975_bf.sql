ALTER TABLE ai_sharpener_run_learning ADD COLUMN query_family_state_json TEXT NOT NULL DEFAULT '{}';
ALTER TABLE ai_sharpener_run_learning ADD COLUMN research_failures_json TEXT NOT NULL DEFAULT '[]';
ALTER TABLE ai_sharpener_run_learning ADD COLUMN semantic_requirements_json TEXT NOT NULL DEFAULT '{}';
ALTER TABLE ai_sharpener_run_learning ADD COLUMN intent_lock_json TEXT NOT NULL DEFAULT '{}';
ALTER TABLE ai_sharpener_run_learning ADD COLUMN breakthrough_attempts INTEGER NOT NULL DEFAULT 0;
ALTER TABLE ai_sharpener_run_learning ADD COLUMN successful_breakthroughs INTEGER NOT NULL DEFAULT 0;
ALTER TABLE ai_sharpener_run_learning ADD COLUMN empty_breakthroughs INTEGER NOT NULL DEFAULT 0;
ALTER TABLE ai_sharpener_run_learning ADD COLUMN evidence_producing_calls INTEGER NOT NULL DEFAULT 0;
ALTER TABLE ai_sharpener_run_learning ADD COLUMN information_gain REAL NOT NULL DEFAULT 0;
ALTER TABLE ai_sharpener_run_learning ADD COLUMN stagnation_events INTEGER NOT NULL DEFAULT 0;
ALTER TABLE ai_sharpener_run_learning ADD COLUMN research_state TEXT NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE ai_sharpener_run_learning ADD COLUMN waiting_reason TEXT NOT NULL DEFAULT '';

ALTER TABLE image_render_events ADD COLUMN expected_context TEXT NOT NULL DEFAULT '';
ALTER TABLE image_render_events ADD COLUMN context_status TEXT NOT NULL DEFAULT 'UNKNOWN';
ALTER TABLE image_render_events ADD COLUMN browser_verified INTEGER NOT NULL DEFAULT 0 CHECK(browser_verified IN (0,1));

CREATE TABLE IF NOT EXISTS ai_sharpener_research_events (
  id TEXT PRIMARY KEY,
  run_id TEXT NOT NULL,
  research_number INTEGER NOT NULL,
  query_text TEXT NOT NULL,
  query_family TEXT NOT NULL,
  query_fingerprint TEXT NOT NULL,
  objective TEXT NOT NULL DEFAULT '',
  execution_status TEXT NOT NULL DEFAULT 'PASS',
  evidence_before INTEGER NOT NULL DEFAULT 0,
  evidence_after INTEGER NOT NULL DEFAULT 0,
  evidence_gain INTEGER NOT NULL DEFAULT 0,
  information_gain REAL NOT NULL DEFAULT 0,
  failure_code TEXT NOT NULL DEFAULT '',
  breakthrough_status TEXT NOT NULL DEFAULT '',
  duration_ms INTEGER NOT NULL DEFAULT 0,
  metadata_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  FOREIGN KEY(run_id) REFERENCES ai_sharpener_runs(id) ON DELETE CASCADE
) STRICT;
CREATE INDEX IF NOT EXISTS idx_sharpener_research_events_run ON ai_sharpener_research_events(run_id,research_number);
CREATE INDEX IF NOT EXISTS idx_sharpener_research_events_family ON ai_sharpener_research_events(run_id,query_family,information_gain);

CREATE TABLE IF NOT EXISTS release_memory (
  id TEXT PRIMARY KEY,
  component_id TEXT NOT NULL,
  feature_key TEXT NOT NULL,
  version_introduced TEXT NOT NULL DEFAULT '',
  version_fixed TEXT NOT NULL DEFAULT '',
  release_contract_id TEXT NOT NULL DEFAULT '',
  bug_id TEXT,
  test_ids_json TEXT NOT NULL DEFAULT '[]',
  known_regressions_json TEXT NOT NULL DEFAULT '[]',
  last_verified_build TEXT NOT NULL DEFAULT '',
  last_verified_environment TEXT NOT NULL DEFAULT 'NOT_TESTED',
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  metadata_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(component_id,feature_key),
  FOREIGN KEY(bug_id) REFERENCES bugs(id) ON DELETE SET NULL
) STRICT;
CREATE INDEX IF NOT EXISTS idx_release_memory_component ON release_memory(component_id,status,updated_at DESC);

CREATE TABLE IF NOT EXISTS release_contract_verifications (
  id TEXT PRIMARY KEY,
  contract_id TEXT NOT NULL,
  rule_id TEXT NOT NULL,
  build_label TEXT NOT NULL,
  environment TEXT NOT NULL,
  result TEXT NOT NULL,
  evidence_json TEXT NOT NULL DEFAULT '{}',
  verified_at TEXT NOT NULL,
  verified_by TEXT,
  FOREIGN KEY(contract_id) REFERENCES release_contracts(id) ON DELETE CASCADE,
  FOREIGN KEY(rule_id) REFERENCES release_contract_rules(id) ON DELETE CASCADE,
  FOREIGN KEY(verified_by) REFERENCES users(id) ON DELETE SET NULL
) STRICT;
CREATE INDEX IF NOT EXISTS idx_release_contract_verifications_rule ON release_contract_verifications(rule_id,verified_at DESC);

INSERT INTO meta(key,value) VALUES('beta_0975_bf','1') ON CONFLICT(key) DO UPDATE SET value='1';
INSERT INTO meta(key,value) VALUES('beta_0975_release_contract','RELEASE_CONTRACT_0.975_BF') ON CONFLICT(key) DO UPDATE SET value='RELEASE_CONTRACT_0.975_BF';
INSERT INTO meta(key,value) VALUES('ai_sharpener_version','V3') ON CONFLICT(key) DO UPDATE SET value='V3';
