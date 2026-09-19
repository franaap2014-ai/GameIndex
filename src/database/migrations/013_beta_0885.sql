-- GameIndex Beta 0.885 — Deployment & Runtime Recovery
-- Additive migration. No game, knowledge, image, user or existing bug is deleted.

ALTER TABLE developer_permissions ADD COLUMN deployment_monitor INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS deployment_diagnostic_runs (
  id TEXT PRIMARY KEY,
  environment TEXT NOT NULL DEFAULT 'local',
  status TEXT NOT NULL DEFAULT 'RUNNING',
  checks_json TEXT NOT NULL DEFAULT '[]',
  summary_json TEXT NOT NULL DEFAULT '{}',
  started_at TEXT NOT NULL,
  completed_at TEXT NOT NULL DEFAULT '',
  duration_ms REAL NOT NULL DEFAULT 0,
  created_by TEXT,
  FOREIGN KEY(created_by) REFERENCES users(id) ON DELETE SET NULL
) STRICT;

CREATE TABLE IF NOT EXISTS runtime_issue_signatures (
  signature TEXT PRIMARY KEY,
  bug_id TEXT NOT NULL,
  occurrence_count INTEGER NOT NULL DEFAULT 1,
  first_seen_at TEXT NOT NULL,
  last_seen_at TEXT NOT NULL,
  evidence_json TEXT NOT NULL DEFAULT '{}',
  FOREIGN KEY(bug_id) REFERENCES bugs(id) ON DELETE CASCADE
) STRICT;

CREATE INDEX IF NOT EXISTS idx_deployment_diagnostics_started ON deployment_diagnostic_runs(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_runtime_issues_last_seen ON runtime_issue_signatures(last_seen_at DESC);

UPDATE developer_permissions
SET deployment_monitor=1,updated_at=datetime('now')
WHERE user_id IN (SELECT id FROM users WHERE role='ADMIN' AND account_tier='DEV');

INSERT INTO update_log_entries(version,title,codename,release_date,sections_json,tags_json,public,created_at)
VALUES(
  '0.885',
  'GameIndex Beta 0.885',
  'Deployment & Runtime Recovery',
  '2026-08-19',
  '{"NEW":["Deployment Monitor","Detailed health diagnostics","Azure HOME persistence","Reversible database write probe"],"FIXED":["Azure Windows data directory","Startup without external AI","Database Explorer runtime visibility","Game-cover fallback"],"IMPROVED":["AI degraded mode","Bug deduplication","AI Flow filtering","Image Intent validation"]}',
  '["NEW","FIXED","IMPROVED","AZURE","RUNTIME","DEV","DATA"]',
  1,
  datetime('now')
)
ON CONFLICT(version) DO UPDATE SET title=excluded.title,codename=excluded.codename,release_date=excluded.release_date,sections_json=excluded.sections_json,tags_json=excluded.tags_json,public=excluded.public;

INSERT INTO meta(key,value) VALUES('beta_0885_deployment_runtime_recovery','1') ON CONFLICT(key) DO UPDATE SET value='1';
INSERT INTO meta(key,value) VALUES('beta_0885_deployment_monitor','1') ON CONFLICT(key) DO UPDATE SET value='1';
INSERT INTO meta(key,value) VALUES('beta_0885_azure_home_persistence','1') ON CONFLICT(key) DO UPDATE SET value='1';
INSERT INTO meta(key,value) VALUES('beta_0885_degraded_ai_mode','1') ON CONFLICT(key) DO UPDATE SET value='1';
