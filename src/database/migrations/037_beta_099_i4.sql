-- GameIndex Beta 0.99 I4 — Three-stage Universe Production Pipeline
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS universe_image_variables (
  id TEXT PRIMARY KEY,
  entity_game_id TEXT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  revision_id TEXT NULL REFERENCES universe_revisions(id) ON DELETE CASCADE,
  page_id TEXT NULL REFERENCES universe_pages(id) ON DELETE CASCADE,
  section_id TEXT NULL REFERENCES universe_sections(id) ON DELETE CASCADE,
  variable_key TEXT NOT NULL,
  label TEXT NOT NULL DEFAULT '',
  semantic_intent TEXT NOT NULL DEFAULT '',
  preferred_roles_json TEXT NOT NULL DEFAULT '[]',
  required INTEGER NOT NULL DEFAULT 0 CHECK(required IN (0,1)),
  status TEXT NOT NULL DEFAULT 'UNRESOLVED' CHECK(status IN ('UNRESOLVED','DISCOVERED','REVIEWED','APPROVED','RESOLVED','FAILED','OPTIONAL_MISSING')),
  candidate_count INTEGER NOT NULL DEFAULT 0 CHECK(candidate_count >= 0),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(entity_game_id,revision_id,variable_key,page_id,section_id)
);
CREATE INDEX IF NOT EXISTS idx_uiv_entity_revision ON universe_image_variables(entity_game_id,revision_id,status);
CREATE INDEX IF NOT EXISTS idx_uiv_section ON universe_image_variables(section_id,status);

CREATE TABLE IF NOT EXISTS universe_image_variable_bindings (
  id TEXT PRIMARY KEY,
  variable_id TEXT NOT NULL UNIQUE REFERENCES universe_image_variables(id) ON DELETE CASCADE,
  visual_asset_id TEXT NOT NULL REFERENCES visual_asset_registry(id) ON DELETE CASCADE,
  binding_status TEXT NOT NULL DEFAULT 'RESOLVED' CHECK(binding_status IN ('RESOLVED','STALE','REJECTED')),
  score REAL NOT NULL DEFAULT 0 CHECK(score >= 0 AND score <= 100),
  assigned_by TEXT NULL,
  assigned_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_uivb_asset ON universe_image_variable_bindings(visual_asset_id,binding_status);

CREATE TABLE IF NOT EXISTS universe_page_compositions (
  id TEXT PRIMARY KEY,
  entity_game_id TEXT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  revision_id TEXT NULL REFERENCES universe_revisions(id) ON DELETE CASCADE,
  page_id TEXT NOT NULL REFERENCES universe_pages(id) ON DELETE CASCADE,
  section_id TEXT NULL REFERENCES universe_sections(id) ON DELETE CASCADE,
  composition_key TEXT NOT NULL,
  layout_variant TEXT NOT NULL DEFAULT 'TEXT_LEFT_VISUAL_RIGHT',
  primary_variable_id TEXT NULL REFERENCES universe_image_variables(id) ON DELETE SET NULL,
  secondary_variable_id TEXT NULL REFERENCES universe_image_variables(id) ON DELETE SET NULL,
  background_variable_id TEXT NULL REFERENCES universe_image_variables(id) ON DELETE SET NULL,
  density TEXT NOT NULL DEFAULT 'RICH' CHECK(density IN ('SPARSE','BALANCED','RICH','IMMERSIVE')),
  editable INTEGER NOT NULL DEFAULT 1 CHECK(editable IN (0,1)),
  config_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(entity_game_id,revision_id,composition_key)
);
CREATE INDEX IF NOT EXISTS idx_upc_entity_revision ON universe_page_compositions(entity_game_id,revision_id,page_id);

CREATE TABLE IF NOT EXISTS universe_preview_snapshots (
  id TEXT PRIMARY KEY,
  entity_game_id TEXT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  revision_id TEXT NULL REFERENCES universe_revisions(id) ON DELETE CASCADE,
  build_id TEXT NULL REFERENCES universe_builds(id) ON DELETE SET NULL,
  viewport_mode TEXT NOT NULL DEFAULT 'DESKTOP' CHECK(viewport_mode IN ('DESKTOP','TABLET','MOBILE')),
  status TEXT NOT NULL DEFAULT 'READY' CHECK(status IN ('READY','STALE','FAILED','PUBLISHED')),
  content_version TEXT NOT NULL DEFAULT '',
  image_version TEXT NOT NULL DEFAULT '',
  interaction_version TEXT NOT NULL DEFAULT '',
  visual_gap_score REAL NOT NULL DEFAULT 0 CHECK(visual_gap_score >= 0 AND visual_gap_score <= 100),
  snapshot_json TEXT NOT NULL DEFAULT '{}',
  error_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_ups_entity_revision ON universe_preview_snapshots(entity_game_id,revision_id,status,updated_at);

CREATE TABLE IF NOT EXISTS universe_builder_stage_status (
  entity_game_id TEXT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  revision_id TEXT NULL REFERENCES universe_revisions(id) ON DELETE CASCADE,
  stage_key TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'NOT_STARTED' CHECK(status IN ('NOT_STARTED','RUNNING','PARTIAL','INCOMPLETE','READY','VALIDATED','FAILED','BLOCKED','PUBLISHED','STALE')),
  metrics_json TEXT NOT NULL DEFAULT '{}',
  message TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL,
  PRIMARY KEY(entity_game_id,revision_id,stage_key)
);

INSERT INTO meta(key,value) VALUES('runtime_version','0.99-I4')
ON CONFLICT(key) DO UPDATE SET value=excluded.value;
INSERT INTO meta(key,value) VALUES('runtime_release','BETA_0_99_I4_THREE_STAGE_UNIVERSE_PRODUCTION_PIPELINE')
ON CONFLICT(key) DO UPDATE SET value=excluded.value;
INSERT INTO meta(key,value) VALUES('beta_099_i4','1') ON CONFLICT(key) DO UPDATE SET value='1';
