-- GameIndex Beta 0.86 — Rebrand & AI 5.0
-- Additive migration. Keeps legacy GameVault internal identifiers for compatibility.

ALTER TABLE user_preferences ADD COLUMN response_length TEXT NOT NULL DEFAULT 'BALANCED';
ALTER TABLE user_preferences ADD COLUMN show_sources INTEGER NOT NULL DEFAULT 1;
ALTER TABLE user_preferences ADD COLUMN show_related_suggestions INTEGER NOT NULL DEFAULT 1;
ALTER TABLE user_preferences ADD COLUMN external_research INTEGER NOT NULL DEFAULT 1;
ALTER TABLE user_preferences ADD COLUMN save_dexter_history INTEGER NOT NULL DEFAULT 1;
ALTER TABLE user_preferences ADD COLUMN answer_language TEXT NOT NULL DEFAULT 'AUTO';
ALTER TABLE user_preferences ADD COLUMN interface_density TEXT NOT NULL DEFAULT 'COMFORTABLE';
ALTER TABLE user_preferences ADD COLUMN animations TEXT NOT NULL DEFAULT 'ON';
ALTER TABLE user_preferences ADD COLUMN reduced_motion INTEGER NOT NULL DEFAULT 0;
ALTER TABLE user_preferences ADD COLUMN high_contrast INTEGER NOT NULL DEFAULT 0;
ALTER TABLE user_preferences ADD COLUMN ui_scale REAL NOT NULL DEFAULT 1.0;
ALTER TABLE user_preferences ADD COLUMN product_updates INTEGER NOT NULL DEFAULT 1;
ALTER TABLE user_preferences ADD COLUMN social_notifications INTEGER NOT NULL DEFAULT 1;
ALTER TABLE user_preferences ADD COLUMN dexter_notifications INTEGER NOT NULL DEFAULT 1;
ALTER TABLE user_preferences ADD COLUMN profile_visibility TEXT NOT NULL DEFAULT 'PUBLIC';
ALTER TABLE user_preferences ADD COLUMN activity_visibility TEXT NOT NULL DEFAULT 'FRIENDS';
ALTER TABLE user_preferences ADD COLUMN last_seen_version TEXT NOT NULL DEFAULT '0.85';
ALTER TABLE user_preferences ADD COLUMN experimental_json TEXT NOT NULL DEFAULT '{}';

CREATE TABLE IF NOT EXISTS update_log_entries (
  version TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  codename TEXT NOT NULL DEFAULT '',
  release_date TEXT NOT NULL DEFAULT '',
  sections_json TEXT NOT NULL DEFAULT '{}',
  tags_json TEXT NOT NULL DEFAULT '[]',
  public INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL
) STRICT;

CREATE TABLE IF NOT EXISTS research_attempts (
  id TEXT PRIMARY KEY,
  trace_id TEXT,
  attempt_number INTEGER NOT NULL,
  query_text TEXT NOT NULL,
  status TEXT NOT NULL,
  source_count INTEGER NOT NULL DEFAULT 0,
  evidence_count INTEGER NOT NULL DEFAULT 0,
  accepted_count INTEGER NOT NULL DEFAULT 0,
  recovery INTEGER NOT NULL DEFAULT 0,
  duration_ms INTEGER NOT NULL DEFAULT 0,
  details_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  FOREIGN KEY(trace_id) REFERENCES ai_traces(trace_id) ON DELETE CASCADE
) STRICT;

CREATE TABLE IF NOT EXISTS ai_failure_attribution (
  id TEXT PRIMARY KEY,
  trace_id TEXT NOT NULL,
  root_component TEXT NOT NULL DEFAULT '',
  root_code TEXT NOT NULL DEFAULT '',
  root_confidence REAL NOT NULL DEFAULT 0,
  consequences_json TEXT NOT NULL DEFAULT '[]',
  protections_json TEXT NOT NULL DEFAULT '[]',
  outcome TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  FOREIGN KEY(trace_id) REFERENCES ai_traces(trace_id) ON DELETE CASCADE
) STRICT;

CREATE TABLE IF NOT EXISTS autogen_knowledge_states (
  candidate_id TEXT PRIMARY KEY,
  knowledge_score REAL NOT NULL DEFAULT 0,
  state TEXT NOT NULL DEFAULT 'CANDIDATE',
  reason TEXT NOT NULL DEFAULT '',
  retry_count INTEGER NOT NULL DEFAULT 0,
  last_failure TEXT NOT NULL DEFAULT '',
  next_eligible_retry TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL,
  FOREIGN KEY(candidate_id) REFERENCES autonomous_generation_queue(id) ON DELETE CASCADE
) STRICT;

CREATE INDEX IF NOT EXISTS idx_research_attempts_trace ON research_attempts(trace_id,attempt_number);
CREATE INDEX IF NOT EXISTS idx_research_attempts_status ON research_attempts(status,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_failure_attribution_trace ON ai_failure_attribution(trace_id);
CREATE INDEX IF NOT EXISTS idx_autogen_knowledge_state ON autogen_knowledge_states(state,updated_at DESC);

INSERT INTO update_log_entries(version,title,codename,release_date,sections_json,tags_json,public,created_at)
VALUES(
  '0.86',
  'GameIndex Beta 0.86',
  'Rebrand & AI 5.0',
  '2026-08-18',
  '{"NEW":["GameVault is now GameIndex","Introducing Dexter IA","Settings 2.0","Update Log","Autogen 2.0"],"AI 5.0":["Research Recovery 5.0","Intent specialization","Failure Attribution V2","Trace Inspector 2.0","AI health diagnostics"],"AUTOGEN":["Knowledge Quality Gate before page building","WAITING_FOR_RESEARCH","WAITING_FOR_KNOWLEDGE","Smarter build scheduling"],"IMPROVED":["AI Control Center","Simulator","Settings persistence","Research diagnostics"],"FIXED":["Research no longer stops at the first empty result when recovery is applicable","Failure attribution separates root cause, consequence and protection","Page Builder no longer starts before the knowledge quality gate"]}',
  '["NEW","AI","AUTOGEN","IMPROVED","FIXED"]',
  1,
  datetime('now')
)
ON CONFLICT(version) DO UPDATE SET title=excluded.title,codename=excluded.codename,release_date=excluded.release_date,sections_json=excluded.sections_json,tags_json=excluded.tags_json,public=excluded.public;

INSERT INTO update_log_entries(version,title,codename,release_date,sections_json,tags_json,public,created_at)
VALUES('0.85','GameVault Beta 0.85','Understanding & Control','2026-08-18','{"IMPROVED":["Semantic understanding","AI Control Center","Trace Inspector","Autonomous generation diagnostics"]}','["AI","IMPROVED"]',1,datetime('now'))
ON CONFLICT(version) DO NOTHING;

INSERT INTO update_log_entries(version,title,codename,release_date,sections_json,tags_json,public,created_at)
VALUES('0.8','GameVault Beta 0.8','The Intelligence Update','','{"IMPROVED":["GameVault AI 4.0","Research, Consult, Refinement and Review architecture","Subscriptions and themes"]}','["AI","IMPROVED"]',1,datetime('now'))
ON CONFLICT(version) DO NOTHING;

INSERT INTO update_log_entries(version,title,codename,release_date,sections_json,tags_json,public,created_at)
VALUES('0.705','GameVault Beta 0.705','UI & Image Recovery','','{"FIXED":["Navigation recovery","Image resolver and legacy image fallback"]}','["FIXED","UI"]',1,datetime('now'))
ON CONFLICT(version) DO NOTHING;

INSERT INTO meta(key,value) VALUES('beta_086_gameindex_rebrand','1') ON CONFLICT(key) DO UPDATE SET value='1';
INSERT INTO meta(key,value) VALUES('beta_086_ai_system','5.0') ON CONFLICT(key) DO UPDATE SET value='5.0';
INSERT INTO meta(key,value) VALUES('beta_086_dexter','1') ON CONFLICT(key) DO UPDATE SET value='1';
INSERT INTO meta(key,value) VALUES('beta_086_settings_v2','1') ON CONFLICT(key) DO UPDATE SET value='1';
INSERT INTO meta(key,value) VALUES('beta_086_autogen_v2','1') ON CONFLICT(key) DO UPDATE SET value='1';
