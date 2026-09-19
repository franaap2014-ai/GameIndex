-- GameIndex Beta 0.99 I5 — Intelligent Content & Visual Quality + Production Consolidation
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS research_fact_quality (
  id TEXT PRIMARY KEY,
  entity_game_id TEXT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  build_id TEXT NULL REFERENCES universe_builds(id) ON DELETE CASCADE,
  revision_id TEXT NULL REFERENCES universe_revisions(id) ON DELETE CASCADE,
  topic_key TEXT NOT NULL DEFAULT '',
  claim_hash TEXT NOT NULL,
  claim_text TEXT NOT NULL,
  content_class TEXT NOT NULL DEFAULT 'GAME_FACT',
  relevance_score REAL NOT NULL DEFAULT 0,
  source_confidence REAL NOT NULL DEFAULT 0,
  topic_match_score REAL NOT NULL DEFAULT 0,
  entity_match_score REAL NOT NULL DEFAULT 0,
  usefulness_score REAL NOT NULL DEFAULT 0,
  accepted INTEGER NOT NULL DEFAULT 0 CHECK(accepted IN (0,1)),
  rejection_reason TEXT NOT NULL DEFAULT '',
  source_id TEXT NULL REFERENCES sources(id) ON DELETE SET NULL,
  evidence_id TEXT NULL REFERENCES evidence(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(entity_game_id,build_id,topic_key,claim_hash)
);
CREATE INDEX IF NOT EXISTS idx_rfq_build_topic ON research_fact_quality(build_id,topic_key,accepted);
CREATE INDEX IF NOT EXISTS idx_rfq_entity_class ON research_fact_quality(entity_game_id,content_class,accepted);

CREATE TABLE IF NOT EXISTS asset_semantic_scores (
  id TEXT PRIMARY KEY,
  variable_id TEXT NOT NULL REFERENCES universe_image_variables(id) ON DELETE CASCADE,
  visual_asset_id TEXT NOT NULL REFERENCES visual_asset_registry(id) ON DELETE CASCADE,
  entity_match REAL NOT NULL DEFAULT 0,
  role_match REAL NOT NULL DEFAULT 0,
  semantic_match REAL NOT NULL DEFAULT 0,
  source_confidence REAL NOT NULL DEFAULT 0,
  diversity_score REAL NOT NULL DEFAULT 0,
  reuse_penalty REAL NOT NULL DEFAULT 0,
  total_score REAL NOT NULL DEFAULT 0,
  eligible INTEGER NOT NULL DEFAULT 0 CHECK(eligible IN (0,1)),
  reasons_json TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(variable_id,visual_asset_id)
);
CREATE INDEX IF NOT EXISTS idx_ass_variable_score ON asset_semantic_scores(variable_id,eligible,total_score DESC);

CREATE TABLE IF NOT EXISTS asset_usage_metrics (
  entity_game_id TEXT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  revision_id TEXT NULL REFERENCES universe_revisions(id) ON DELETE CASCADE,
  visual_asset_id TEXT NOT NULL REFERENCES visual_asset_registry(id) ON DELETE CASCADE,
  total_usage_count INTEGER NOT NULL DEFAULT 0,
  primary_usage_count INTEGER NOT NULL DEFAULT 0,
  accent_usage_count INTEGER NOT NULL DEFAULT 0,
  page_usage_count INTEGER NOT NULL DEFAULT 0,
  cross_section_usage_count INTEGER NOT NULL DEFAULT 0,
  excessive_reuse INTEGER NOT NULL DEFAULT 0 CHECK(excessive_reuse IN (0,1)),
  updated_at TEXT NOT NULL,
  PRIMARY KEY(entity_game_id,revision_id,visual_asset_id)
);

CREATE TABLE IF NOT EXISTS bug_relevance_state (
  bug_id TEXT PRIMARY KEY REFERENCES bugs(id) ON DELETE CASCADE,
  relevance_state TEXT NOT NULL DEFAULT 'NEEDS_REVERIFICATION' CHECK(relevance_state IN ('CURRENT','LEGACY','NEEDS_REVERIFICATION','SUPERSEDED')),
  rationale TEXT NOT NULL DEFAULT '',
  last_reverified_at TEXT NOT NULL DEFAULT '',
  last_reverified_release TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS regression_runs (
  id TEXT PRIMARY KEY,
  release TEXT NOT NULL,
  environment TEXT NOT NULL DEFAULT 'LOCAL',
  status TEXT NOT NULL DEFAULT 'RUNNING' CHECK(status IN ('RUNNING','COMPLETE','FAILED')),
  passed INTEGER NOT NULL DEFAULT 0,
  failed INTEGER NOT NULL DEFAULT 0,
  skipped INTEGER NOT NULL DEFAULT 0,
  started_at TEXT NOT NULL,
  completed_at TEXT NOT NULL DEFAULT '',
  created_by TEXT NULL REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS regression_run_results (
  id TEXT PRIMARY KEY,
  run_id TEXT NOT NULL REFERENCES regression_runs(id) ON DELETE CASCADE,
  test_id TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('PASS','FAIL','SKIP','NOT_RUN')),
  summary TEXT NOT NULL DEFAULT '',
  details_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  UNIQUE(run_id,test_id)
);
CREATE INDEX IF NOT EXISTS idx_regression_results_category ON regression_run_results(run_id,category,status);

CREATE TABLE IF NOT EXISTS bug_regression_links (
  bug_id TEXT NOT NULL REFERENCES bugs(id) ON DELETE CASCADE,
  test_id TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'GENERAL',
  required_for_verification INTEGER NOT NULL DEFAULT 1 CHECK(required_for_verification IN (0,1)),
  last_run_id TEXT NULL REFERENCES regression_runs(id) ON DELETE SET NULL,
  last_result TEXT NOT NULL DEFAULT 'NOT_RUN',
  last_run_at TEXT NOT NULL DEFAULT '',
  PRIMARY KEY(bug_id,test_id)
);

CREATE TABLE IF NOT EXISTS admin_audit_events (
  id TEXT PRIMARY KEY,
  actor_user_id TEXT NULL REFERENCES users(id) ON DELETE SET NULL,
  target_user_id TEXT NULL REFERENCES users(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL,
  target_type TEXT NOT NULL DEFAULT '',
  target_id TEXT NOT NULL DEFAULT '',
  reason TEXT NOT NULL DEFAULT '',
  metadata_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_admin_audit_recent ON admin_audit_events(created_at DESC);

CREATE TABLE IF NOT EXISTS social_posts (
  id TEXT PRIMARY KEY,
  author_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  entity_game_id TEXT NULL REFERENCES games(id) ON DELETE SET NULL,
  topic TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL,
  moderation_status TEXT NOT NULL DEFAULT 'VISIBLE' CHECK(moderation_status IN ('VISIBLE','FLAGGED','HIDDEN','REMOVED')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_social_posts_feed ON social_posts(moderation_status,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_social_posts_entity ON social_posts(entity_game_id,moderation_status,created_at DESC);

CREATE TABLE IF NOT EXISTS social_context_links (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
  context_type TEXT NOT NULL CHECK(context_type IN ('GAME','EXPERIENCE','TOPIC')),
  context_id TEXT NOT NULL,
  label TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_social_context_lookup ON social_context_links(context_type,context_id);

-- I5 preview/publish consistency adds an explicit composition hash.
ALTER TABLE universe_preview_snapshots ADD COLUMN composition_version TEXT NOT NULL DEFAULT '';

-- Preserve every old bug, but require old unresolved bugs to be reverified on current Beta 0.99.
INSERT OR IGNORE INTO bug_relevance_state(bug_id,relevance_state,rationale,last_reverified_at,last_reverified_release,updated_at)
SELECT id,
  CASE WHEN status IN ('VERIFIED','WONT_FIX','DUPLICATE') THEN 'LEGACY' ELSE 'NEEDS_REVERIFICATION' END,
  'Imported into Beta 0.99 I5 legacy bug verification sweep.',
  '', '', datetime('now')
FROM bugs;

INSERT OR IGNORE INTO bug_regression_links(bug_id,test_id,category,required_for_verification,last_result)
SELECT id,
  CASE bug_code
    WHEN 'GI-0001' THEN 'universe-autonomous-generation'
    WHEN 'GI-0002' THEN 'admin-database-explorer-access'
    WHEN 'GI-0003' THEN 'dexter-answer-quality'
    WHEN 'GI-0004' THEN 'image-runtime-load'
    WHEN 'GI-0005' THEN 'personalized-page-quality'
    WHEN 'GI-0006' THEN 'visible-experience-runtime'
    ELSE 'legacy-bug-reverification'
  END,
  CASE category WHEN 'AI' THEN 'AI' WHEN 'IMAGE' THEN 'IMAGES' WHEN 'ADMIN' THEN 'ADMIN' WHEN 'PERFORMANCE' THEN 'PERFORMANCE' ELSE 'UNIVERSE' END,
  1,'NOT_RUN'
FROM bugs WHERE bug_code IN ('GI-0001','GI-0002','GI-0003','GI-0004','GI-0005','GI-0006');

INSERT INTO meta(key,value) VALUES('runtime_version','0.99-I5')
ON CONFLICT(key) DO UPDATE SET value=excluded.value;
INSERT INTO meta(key,value) VALUES('public_version','0.99')
ON CONFLICT(key) DO UPDATE SET value=excluded.value;
INSERT INTO meta(key,value) VALUES('runtime_release','BETA_0_99_I5_PRODUCTION_CONSOLIDATION')
ON CONFLICT(key) DO UPDATE SET value=excluded.value;
INSERT INTO meta(key,value) VALUES('beta_099_i5','1') ON CONFLICT(key) DO UPDATE SET value='1';

-- Link the historical 0.97 / 0.975 testing backlog to current regression categories without changing bug workflow status.
INSERT OR IGNORE INTO bug_regression_links(bug_id,test_id,category,required_for_verification,last_result)
SELECT id,
  CASE bug_code
    WHEN 'GI-0975-AI-ATTRITION-001' THEN 'ai-evidence-retention'
    WHEN 'GI-0975-QA-002' THEN 'ai-evidence-retention'
    WHEN 'GI-0975-QA-001' THEN 'ai-language-consistency'
    WHEN 'GI-097-SHARPENER-001' THEN 'dexter-answer-quality'
    WHEN 'GI-097-IMG-001' THEN 'image-live-render'
    WHEN 'GI-097-AI-001' THEN 'ai-language-consistency'
    WHEN 'GI-097-UX-001' THEN 'visible-experience-runtime'
    WHEN 'GI-0975-PERF-001' THEN 'admin-performance'
    WHEN 'GI-097-UNIVERSE-001' THEN 'universe-planning-coverage'
    ELSE 'legacy-bug-reverification'
  END,
  CASE
    WHEN category='AI' THEN 'AI'
    WHEN category='IMAGE' THEN 'IMAGES'
    WHEN category='PERFORMANCE' THEN 'PERFORMANCE'
    WHEN category='ADMIN' THEN 'ADMIN'
    ELSE 'UNIVERSE'
  END,
  1,'NOT_RUN'
FROM bugs
WHERE bug_code IN (
  'GI-0975-AI-ATTRITION-001','GI-0975-QA-002','GI-0975-QA-001','GI-097-SHARPENER-001',
  'GI-097-IMG-001','GI-097-AI-001','GI-097-UX-001','GI-0975-PERF-001','GI-097-UNIVERSE-001'
);
