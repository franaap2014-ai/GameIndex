CREATE TABLE IF NOT EXISTS release_contracts (
  id TEXT PRIMARY KEY,
  version TEXT NOT NULL,
  label TEXT NOT NULL,
  codename TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(version)
) STRICT;

CREATE TABLE IF NOT EXISTS release_contract_rules (
  id TEXT PRIMARY KEY,
  contract_id TEXT NOT NULL,
  component TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  expected_behavior TEXT NOT NULL,
  failure_conditions TEXT NOT NULL DEFAULT '',
  priority TEXT NOT NULL DEFAULT 'P2',
  related_bug_ids_json TEXT NOT NULL DEFAULT '[]',
  test_strategy TEXT NOT NULL DEFAULT '',
  live_validation_required INTEGER NOT NULL DEFAULT 0 CHECK(live_validation_required IN (0,1)),
  enabled INTEGER NOT NULL DEFAULT 1 CHECK(enabled IN (0,1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(contract_id) REFERENCES release_contracts(id) ON DELETE CASCADE
) STRICT;
CREATE INDEX IF NOT EXISTS idx_release_contract_rules_contract ON release_contract_rules(contract_id,enabled,component);

CREATE TABLE IF NOT EXISTS release_contract_audits (
  id TEXT PRIMARY KEY,
  contract_id TEXT NOT NULL,
  environment TEXT NOT NULL,
  status TEXT NOT NULL,
  passed INTEGER NOT NULL DEFAULT 0,
  warnings INTEGER NOT NULL DEFAULT 0,
  failed INTEGER NOT NULL DEFAULT 0,
  regressions INTEGER NOT NULL DEFAULT 0,
  new_bugs INTEGER NOT NULL DEFAULT 0,
  reopened_bugs INTEGER NOT NULL DEFAULT 0,
  started_at TEXT NOT NULL,
  completed_at TEXT NOT NULL DEFAULT '',
  created_by TEXT,
  FOREIGN KEY(contract_id) REFERENCES release_contracts(id) ON DELETE CASCADE,
  FOREIGN KEY(created_by) REFERENCES users(id) ON DELETE SET NULL
) STRICT;
CREATE INDEX IF NOT EXISTS idx_release_contract_audits_contract ON release_contract_audits(contract_id,started_at DESC);

CREATE TABLE IF NOT EXISTS release_contract_results (
  id TEXT PRIMARY KEY,
  audit_id TEXT NOT NULL,
  rule_id TEXT NOT NULL,
  execution_status TEXT NOT NULL DEFAULT 'PASS',
  quality_status TEXT NOT NULL DEFAULT 'NOT_APPLICABLE',
  live_status TEXT NOT NULL DEFAULT 'NOT_TESTED',
  outcome TEXT NOT NULL,
  failure_code TEXT NOT NULL DEFAULT '',
  expected_text TEXT NOT NULL DEFAULT '',
  actual_text TEXT NOT NULL DEFAULT '',
  evidence_json TEXT NOT NULL DEFAULT '{}',
  bug_id TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY(audit_id) REFERENCES release_contract_audits(id) ON DELETE CASCADE,
  FOREIGN KEY(rule_id) REFERENCES release_contract_rules(id) ON DELETE CASCADE,
  FOREIGN KEY(bug_id) REFERENCES bugs(id) ON DELETE SET NULL
) STRICT;
CREATE INDEX IF NOT EXISTS idx_release_contract_results_audit ON release_contract_results(audit_id,outcome,rule_id);

CREATE TABLE IF NOT EXISTS bug_contract_state (
  bug_id TEXT PRIMARY KEY,
  fingerprint TEXT NOT NULL UNIQUE,
  priority TEXT NOT NULL DEFAULT 'P2',
  regression_count INTEGER NOT NULL DEFAULT 0,
  occurrence_count INTEGER NOT NULL DEFAULT 1,
  contract_rule_id TEXT,
  environment TEXT NOT NULL DEFAULT 'UNKNOWN',
  detected_by TEXT NOT NULL DEFAULT 'MANUAL',
  last_trace_id TEXT NOT NULL DEFAULT '',
  expected_text TEXT NOT NULL DEFAULT '',
  actual_text TEXT NOT NULL DEFAULT '',
  live_validation TEXT NOT NULL DEFAULT 'NOT_TESTED',
  first_seen_at TEXT NOT NULL,
  last_seen_at TEXT NOT NULL,
  FOREIGN KEY(bug_id) REFERENCES bugs(id) ON DELETE CASCADE,
  FOREIGN KEY(contract_rule_id) REFERENCES release_contract_rules(id) ON DELETE SET NULL
) STRICT;

CREATE TABLE IF NOT EXISTS image_render_events (
  id TEXT PRIMARY KEY,
  page_path TEXT NOT NULL DEFAULT '',
  game_slug TEXT NOT NULL DEFAULT '',
  entity_id TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL DEFAULT '',
  render_state TEXT NOT NULL,
  width INTEGER NOT NULL DEFAULT 0,
  height INTEGER NOT NULL DEFAULT 0,
  is_fallback INTEGER NOT NULL DEFAULT 0 CHECK(is_fallback IN (0,1)),
  user_agent TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL
) STRICT;
CREATE INDEX IF NOT EXISTS idx_image_render_events_recent ON image_render_events(created_at DESC,render_state,is_fallback);

CREATE TABLE IF NOT EXISTS ai_sharpener_run_learning (
  run_id TEXT PRIMARY KEY,
  evidence_json TEXT NOT NULL DEFAULT '[]',
  learning_json TEXT NOT NULL DEFAULT '[]',
  research_queries_json TEXT NOT NULL DEFAULT '[]',
  research_calls INTEGER NOT NULL DEFAULT 0,
  research_time_ms INTEGER NOT NULL DEFAULT 0,
  candidate_generations INTEGER NOT NULL DEFAULT 0,
  repeated_fallbacks INTEGER NOT NULL DEFAULT 0,
  breakthrough_count INTEGER NOT NULL DEFAULT 0,
  no_learning_count INTEGER NOT NULL DEFAULT 0,
  last_answer_hash TEXT NOT NULL DEFAULT '',
  last_research_at TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL,
  FOREIGN KEY(run_id) REFERENCES ai_sharpener_runs(id) ON DELETE CASCADE
) STRICT;

CREATE TABLE IF NOT EXISTS ai_sharpener_memories (
  id TEXT PRIMARY KEY,
  memory_type TEXT NOT NULL CHECK(memory_type IN ('FACT','STRATEGY')),
  game_id TEXT NOT NULL,
  scope_key TEXT NOT NULL,
  content_json TEXT NOT NULL,
  source_run_id TEXT,
  approved_by TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0,1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(game_id) REFERENCES games(id) ON DELETE CASCADE,
  FOREIGN KEY(source_run_id) REFERENCES ai_sharpener_runs(id) ON DELETE SET NULL,
  FOREIGN KEY(approved_by) REFERENCES users(id) ON DELETE RESTRICT
) STRICT;
CREATE INDEX IF NOT EXISTS idx_ai_sharpener_memories_scope ON ai_sharpener_memories(game_id,memory_type,scope_key,active);

INSERT INTO meta(key,value) VALUES('beta_097_bf','1') ON CONFLICT(key) DO UPDATE SET value='1';
INSERT INTO meta(key,value) VALUES('beta_097_release_contract','RELEASE_CONTRACT_0.97_BF') ON CONFLICT(key) DO UPDATE SET value='RELEASE_CONTRACT_0.97_BF';
