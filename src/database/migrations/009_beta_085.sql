PRAGMA foreign_keys = ON;

-- GameVault Beta 0.85 — Understanding & Control
-- Adds semantic understanding and DEV diagnostic traces without recreating prior data.

CREATE TABLE IF NOT EXISTS ai_traces (
  trace_id TEXT PRIMARY KEY,
  request_type TEXT NOT NULL DEFAULT 'CONSULT',
  user_id TEXT,
  conversation_id TEXT NOT NULL DEFAULT '',
  game_id TEXT,
  entity_id TEXT,
  entity_type TEXT NOT NULL DEFAULT 'UNKNOWN',
  intent TEXT NOT NULL DEFAULT 'OTHER',
  language TEXT NOT NULL DEFAULT 'pt-BR',
  status TEXT NOT NULL DEFAULT 'RUNNING',
  confidence REAL NOT NULL DEFAULT 0,
  failure_stage TEXT NOT NULL DEFAULT '',
  summary_json TEXT NOT NULL DEFAULT '{}',
  started_at TEXT NOT NULL,
  completed_at TEXT NOT NULL DEFAULT '',
  duration_ms INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY(game_id) REFERENCES games(id) ON DELETE SET NULL,
  FOREIGN KEY(entity_id) REFERENCES entities(id) ON DELETE SET NULL
) STRICT;

CREATE TABLE IF NOT EXISTS ai_trace_stages (
  stage_id TEXT PRIMARY KEY,
  trace_id TEXT NOT NULL,
  stage_order INTEGER NOT NULL,
  component TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'COMPLETE',
  input_summary TEXT NOT NULL DEFAULT '',
  output_summary TEXT NOT NULL DEFAULT '',
  confidence REAL NOT NULL DEFAULT 0,
  warning_code TEXT NOT NULL DEFAULT '',
  error_code TEXT NOT NULL DEFAULT '',
  details_json TEXT NOT NULL DEFAULT '{}',
  started_at TEXT NOT NULL,
  completed_at TEXT NOT NULL DEFAULT '',
  duration_ms INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY(trace_id) REFERENCES ai_traces(trace_id) ON DELETE CASCADE
) STRICT;

CREATE TABLE IF NOT EXISTS ai_simulations (
  simulation_id TEXT PRIMARY KEY,
  user_id TEXT,
  group_name TEXT NOT NULL,
  mode TEXT NOT NULL DEFAULT 'FULL_PIPELINE',
  input_text TEXT NOT NULL,
  trace_id TEXT,
  status TEXT NOT NULL DEFAULT 'RUNNING',
  output_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  completed_at TEXT NOT NULL DEFAULT '',
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY(trace_id) REFERENCES ai_traces(trace_id) ON DELETE SET NULL
) STRICT;

CREATE TABLE IF NOT EXISTS ai_failure_events (
  failure_id TEXT PRIMARY KEY,
  trace_id TEXT NOT NULL,
  component TEXT NOT NULL,
  error_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'MEDIUM',
  diagnostic_summary TEXT NOT NULL DEFAULT '',
  confidence REAL NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  FOREIGN KEY(trace_id) REFERENCES ai_traces(trace_id) ON DELETE CASCADE
) STRICT;

CREATE TABLE IF NOT EXISTS entity_relationships_v2 (
  relationship_id TEXT PRIMARY KEY,
  game_id TEXT NOT NULL,
  source_entity_id TEXT NOT NULL,
  relation_type TEXT NOT NULL,
  target_entity_id TEXT,
  target_label TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'CANDIDATE',
  confidence REAL NOT NULL DEFAULT 0,
  evidence_json TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(game_id,source_entity_id,relation_type,target_entity_id,target_label),
  FOREIGN KEY(game_id) REFERENCES games(id) ON DELETE CASCADE,
  FOREIGN KEY(source_entity_id) REFERENCES entities(id) ON DELETE CASCADE,
  FOREIGN KEY(target_entity_id) REFERENCES entities(id) ON DELETE CASCADE
) STRICT;

CREATE TABLE IF NOT EXISTS intent_classifications (
  id TEXT PRIMARY KEY,
  trace_id TEXT,
  user_id TEXT,
  game_id TEXT,
  entity_id TEXT,
  intent TEXT NOT NULL,
  confidence REAL NOT NULL DEFAULT 0,
  query_text TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  FOREIGN KEY(trace_id) REFERENCES ai_traces(trace_id) ON DELETE SET NULL,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY(game_id) REFERENCES games(id) ON DELETE SET NULL,
  FOREIGN KEY(entity_id) REFERENCES entities(id) ON DELETE SET NULL
) STRICT;

CREATE TABLE IF NOT EXISTS semantic_reviews (
  id TEXT PRIMARY KEY,
  trace_id TEXT,
  game_id TEXT,
  entity_id TEXT,
  status TEXT NOT NULL,
  relevance TEXT NOT NULL DEFAULT 'FAIL',
  confidence REAL NOT NULL DEFAULT 0,
  relationship_integrity INTEGER NOT NULL DEFAULT 1,
  filler_detected INTEGER NOT NULL DEFAULT 0,
  language_consistent INTEGER NOT NULL DEFAULT 1,
  details_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  FOREIGN KEY(trace_id) REFERENCES ai_traces(trace_id) ON DELETE SET NULL,
  FOREIGN KEY(game_id) REFERENCES games(id) ON DELETE SET NULL,
  FOREIGN KEY(entity_id) REFERENCES entities(id) ON DELETE SET NULL
) STRICT;

CREATE TABLE IF NOT EXISTS generation_diagnostics (
  id TEXT PRIMARY KEY,
  generation_job_id TEXT,
  trace_id TEXT,
  game_id TEXT,
  entity_id TEXT,
  stage TEXT NOT NULL,
  status TEXT NOT NULL,
  progress INTEGER NOT NULL DEFAULT 0,
  error_code TEXT NOT NULL DEFAULT '',
  details_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  FOREIGN KEY(generation_job_id) REFERENCES generation_jobs(id) ON DELETE CASCADE,
  FOREIGN KEY(trace_id) REFERENCES ai_traces(trace_id) ON DELETE SET NULL,
  FOREIGN KEY(game_id) REFERENCES games(id) ON DELETE SET NULL,
  FOREIGN KEY(entity_id) REFERENCES entities(id) ON DELETE SET NULL
) STRICT;

CREATE INDEX IF NOT EXISTS idx_ai_traces_date ON ai_traces(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_traces_status ON ai_traces(status,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_traces_component_entity ON ai_traces(game_id,entity_id,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_trace_stages_trace_order ON ai_trace_stages(trace_id,stage_order);
CREATE INDEX IF NOT EXISTS idx_ai_trace_stages_component ON ai_trace_stages(component,started_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_failures_component ON ai_failure_events(component,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_simulations_date ON ai_simulations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rel_v2_source ON entity_relationships_v2(source_entity_id,relation_type);
CREATE INDEX IF NOT EXISTS idx_rel_v2_target ON entity_relationships_v2(target_entity_id,relation_type);
CREATE INDEX IF NOT EXISTS idx_intent_classification_date ON intent_classifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_semantic_review_date ON semantic_reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generation_diag_job ON generation_diagnostics(generation_job_id,created_at DESC);

INSERT INTO meta(key,value) VALUES('beta_085_understanding','1') ON CONFLICT(key) DO UPDATE SET value='1';
INSERT INTO meta(key,value) VALUES('beta_085_ai_control_center','1') ON CONFLICT(key) DO UPDATE SET value='1';
INSERT INTO meta(key,value) VALUES('beta_085_autogen_repair','1') ON CONFLICT(key) DO UPDATE SET value='1';

-- Existing generated pages from 0.8 are preserved, never deleted. If they contain
-- one of the known template-leak phrases discovered during real 0.8 testing,
-- remove them from READY/PUBLISHED state until the 0.85 semantic pipeline rebuilds/reviews them.
UPDATE pages
SET status='NEEDS_REVIEW', updated_at=datetime('now'), published_at=''
WHERE status IN ('READY','PUBLISHED')
  AND (
    lower(content_json) LIKE '%is a player-relevant topic in%'
    OR lower(content_json) LIKE '%this entry focuses on%'
    OR lower(content_json) LIKE '%the useful questions are%'
    OR lower(content_json) LIKE '%should be understood together with%'
    OR lower(content_json) LIKE '%this entry exists to%'
    OR lower(content_json) LIKE '%for a player studying%'
  );
