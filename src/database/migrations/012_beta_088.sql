-- GameIndex Beta 0.88 — Diagnostics & Recovery
-- Additive migration: Bug Tracker, AI Flow Inspector, image intent diagnostics,
-- stronger DEV authorization and visible UX/version metadata.

CREATE TABLE IF NOT EXISTS developer_permissions (
  user_id TEXT PRIMARY KEY,
  database_explorer INTEGER NOT NULL DEFAULT 0,
  ai_flow_inspector INTEGER NOT NULL DEFAULT 0,
  bug_tracker INTEGER NOT NULL DEFAULT 0,
  image_diagnostics INTEGER NOT NULL DEFAULT 0,
  granted_by TEXT NOT NULL DEFAULT 'MIGRATION',
  updated_at TEXT NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
) STRICT;

CREATE TABLE IF NOT EXISTS authorization_diagnostics (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  area TEXT NOT NULL,
  authenticated INTEGER NOT NULL DEFAULT 0,
  role TEXT NOT NULL DEFAULT '',
  tier TEXT NOT NULL DEFAULT '',
  permission INTEGER NOT NULL DEFAULT 0,
  result TEXT NOT NULL,
  reason TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL
) STRICT;

CREATE TABLE IF NOT EXISTS flow_runs (
  flow_id TEXT PRIMARY KEY,
  trace_id TEXT NOT NULL DEFAULT '',
  request_type TEXT NOT NULL DEFAULT 'CONSULT',
  user_id TEXT,
  question TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'RUNNING',
  root_cause TEXT NOT NULL DEFAULT '',
  summary_json TEXT NOT NULL DEFAULT '{}',
  started_at TEXT NOT NULL,
  completed_at TEXT NOT NULL DEFAULT '',
  duration_ms REAL NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL
) STRICT;

CREATE TABLE IF NOT EXISTS flow_stages (
  flow_stage_id TEXT PRIMARY KEY,
  flow_id TEXT NOT NULL,
  stage_order INTEGER NOT NULL,
  group_name TEXT NOT NULL DEFAULT 'OTHER',
  component TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'COMPLETE',
  received_json TEXT NOT NULL DEFAULT '{}',
  did_json TEXT NOT NULL DEFAULT '{}',
  produced_json TEXT NOT NULL DEFAULT '{}',
  sent_json TEXT NOT NULL DEFAULT '{}',
  duration_ms REAL NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  FOREIGN KEY(flow_id) REFERENCES flow_runs(flow_id) ON DELETE CASCADE
) STRICT;

CREATE TABLE IF NOT EXISTS pipeline_handoffs (
  id TEXT PRIMARY KEY,
  flow_id TEXT NOT NULL,
  from_component TEXT NOT NULL,
  to_component TEXT NOT NULL,
  output_json TEXT NOT NULL DEFAULT '{}',
  input_json TEXT NOT NULL DEFAULT '{}',
  continuity_status TEXT NOT NULL DEFAULT 'PASS',
  loss_codes_json TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL,
  FOREIGN KEY(flow_id) REFERENCES flow_runs(flow_id) ON DELETE CASCADE
) STRICT;

CREATE TABLE IF NOT EXISTS bugs (
  id TEXT PRIMARY KEY,
  bug_code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  severity TEXT NOT NULL DEFAULT 'BUG',
  category TEXT NOT NULL DEFAULT 'GENERAL',
  status TEXT NOT NULL DEFAULT 'REPORTED',
  version_found TEXT NOT NULL DEFAULT '',
  target_version TEXT NOT NULL DEFAULT '',
  component TEXT NOT NULL DEFAULT '',
  created_by TEXT,
  trace_id TEXT NOT NULL DEFAULT '',
  generation_job_id TEXT NOT NULL DEFAULT '',
  entity_id TEXT NOT NULL DEFAULT '',
  game_id TEXT NOT NULL DEFAULT '',
  image_id TEXT NOT NULL DEFAULT '',
  database_record_ref TEXT NOT NULL DEFAULT '',
  root_cause TEXT NOT NULL DEFAULT '',
  fix_summary TEXT NOT NULL DEFAULT '',
  verification_notes TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(created_by) REFERENCES users(id) ON DELETE SET NULL
) STRICT;

CREATE TABLE IF NOT EXISTS bug_events (
  id TEXT PRIMARY KEY,
  bug_id TEXT NOT NULL,
  actor_user_id TEXT,
  event_type TEXT NOT NULL,
  before_json TEXT NOT NULL DEFAULT '{}',
  after_json TEXT NOT NULL DEFAULT '{}',
  note TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  FOREIGN KEY(bug_id) REFERENCES bugs(id) ON DELETE CASCADE,
  FOREIGN KEY(actor_user_id) REFERENCES users(id) ON DELETE SET NULL
) STRICT;

CREATE TABLE IF NOT EXISTS image_search_runs (
  run_id TEXT PRIMARY KEY,
  game_id TEXT NOT NULL,
  entity_id TEXT,
  image_intent TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'RUNNING',
  queries_json TEXT NOT NULL DEFAULT '[]',
  candidate_count INTEGER NOT NULL DEFAULT 0,
  accepted_image_id TEXT NOT NULL DEFAULT '',
  resolution TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  completed_at TEXT NOT NULL DEFAULT '',
  FOREIGN KEY(game_id) REFERENCES games(id) ON DELETE CASCADE,
  FOREIGN KEY(entity_id) REFERENCES entities(id) ON DELETE CASCADE
) STRICT;

CREATE TABLE IF NOT EXISTS image_search_candidates (
  id TEXT PRIMARY KEY,
  run_id TEXT NOT NULL,
  candidate_url TEXT NOT NULL DEFAULT '',
  source_url TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL DEFAULT '',
  decision TEXT NOT NULL DEFAULT 'REJECTED',
  reason TEXT NOT NULL DEFAULT '',
  confidence REAL NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  FOREIGN KEY(run_id) REFERENCES image_search_runs(run_id) ON DELETE CASCADE
) STRICT;

CREATE INDEX IF NOT EXISTS idx_flow_runs_created ON flow_runs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_flow_stages_flow ON flow_stages(flow_id,stage_order);
CREATE INDEX IF NOT EXISTS idx_handoffs_flow ON pipeline_handoffs(flow_id,created_at);
CREATE INDEX IF NOT EXISTS idx_bugs_status ON bugs(status,severity,updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_bug_events_bug ON bug_events(bug_id,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_image_search_game ON image_search_runs(game_id,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_auth_diag_user ON authorization_diagnostics(user_id,created_at DESC);

-- The primary administrator is also the project DEV. Repair older installations
-- where the account role survived but the DEV entitlement/permission did not.
UPDATE users
SET account_tier='DEV',updated_at=datetime('now')
WHERE id=(SELECT value FROM meta WHERE key='primary_admin_user_id' LIMIT 1)
  AND role='ADMIN';

UPDATE users
SET account_tier='DEV',updated_at=datetime('now')
WHERE id=(SELECT user_id FROM user_profiles WHERE normalized_username='franchesco01' LIMIT 1)
  AND role='ADMIN';

INSERT INTO developer_permissions(user_id,database_explorer,ai_flow_inspector,bug_tracker,image_diagnostics,granted_by,updated_at)
SELECT id,1,1,1,1,'BETA_088_PRIMARY_ADMIN',datetime('now')
FROM users
WHERE role='ADMIN' AND account_tier='DEV'
ON CONFLICT(user_id) DO UPDATE SET
  database_explorer=1,
  ai_flow_inspector=1,
  bug_tracker=1,
  image_diagnostics=1,
  granted_by='BETA_088_PRIMARY_ADMIN',
  updated_at=datetime('now');

-- Keep generic seed text for history, but never let it be trusted current knowledge.
UPDATE knowledge SET status='NEEDS_REVIEW',updated_at=datetime('now')
WHERE status IN ('CURRENT','VALIDATED') AND (
  lower(summary) LIKE '%is a player-relevant topic in%'
  OR lower(summary) LIKE '%the useful questions are%'
  OR lower(summary) LIKE '%should be understood together with%'
  OR lower(summary) LIKE '%this entry exists to%'
  OR lower(summary) LIKE '%for a player studying%'
);

-- Seed the first real Bug Tracker issues. They remain open until verified.
INSERT INTO bugs(id,bug_code,title,description,severity,category,status,version_found,target_version,component,created_at,updated_at)
VALUES
('bug-gi-0001','GI-0001','Autonomous page generation','Autogen does not reliably produce useful pages and historically reached late failure states.','CRITICAL','AUTOGEN','CONFIRMED','0.87','0.88','AUTOGEN',datetime('now'),datetime('now')),
('bug-gi-0002','GI-0002','Database Explorer denies authorized DEV/Admin','Authorized project DEV/Admin can be denied by entitlement/permission mismatch.','CRITICAL','ADMIN','CONFIRMED','0.87','0.88','DATABASE_EXPLORER',datetime('now'),datetime('now')),
('bug-gi-0003','GI-0003','Dexter incorrect or insufficient answers','Dexter does not reliably deliver useful verified answers end to end.','CRITICAL','AI','CONFIRMED','0.87','0.88','DEXTER_AI_5_0',datetime('now'),datetime('now')),
('bug-gi-0004','GI-0004','Game images fail to load','Game cards can fall back to initials despite related images being available.','BUG','IMAGE','CONFIRMED','0.87','0.88','IMAGE_MEMORY',datetime('now'),datetime('now')),
('bug-gi-0005','GI-0005','Current pages need improvement','Game/entity pages feel generic and incomplete.','UX','UX','CONFIRMED','0.87','0.88','PAGES',datetime('now'),datetime('now')),
('bug-gi-0006','GI-0006','Visible GameIndex experience','Normal users should visibly notice the update outside Admin tooling.','IMPROVEMENT','UX','CONFIRMED','0.87','0.88','SITE',datetime('now'),datetime('now'))
ON CONFLICT(bug_code) DO NOTHING;

INSERT INTO update_log_entries(version,title,codename,release_date,sections_json,tags_json,public,created_at)
VALUES(
  '0.88',
  'GameIndex Beta 0.88',
  'Diagnostics & Recovery',
  '2026-08-19',
  '{"NEW":["AI Flow Inspector","Bug Tracker","Image Intent diagnostics","Cross-component handoff inspection"],"FIXED":["Database Explorer DEV authorization migration","Image search ambiguity for game covers"],"IMPROVED":["Dexter observability","Autogen diagnostics","Game pages","Games library","Search","AI Control Center","Image Memory"]}',
  '["NEW","FIXED","IMPROVED","AI","AUTOGEN","DEV","UI"]',
  1,
  datetime('now')
)
ON CONFLICT(version) DO UPDATE SET title=excluded.title,codename=excluded.codename,release_date=excluded.release_date,sections_json=excluded.sections_json,tags_json=excluded.tags_json,public=excluded.public;

INSERT INTO meta(key,value) VALUES('beta_088_diagnostics_recovery','1') ON CONFLICT(key) DO UPDATE SET value='1';
INSERT INTO meta(key,value) VALUES('beta_088_ai_flow_inspector','1') ON CONFLICT(key) DO UPDATE SET value='1';
INSERT INTO meta(key,value) VALUES('beta_088_bug_tracker','1') ON CONFLICT(key) DO UPDATE SET value='1';
INSERT INTO meta(key,value) VALUES('beta_088_image_intent','1') ON CONFLICT(key) DO UPDATE SET value='1';
