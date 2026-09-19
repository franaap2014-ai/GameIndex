-- GameIndex Beta 0.99 I6 — Universe Builder Experience 4.0
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS visual_identity_motifs (
  id TEXT PRIMARY KEY,
  entity_game_id TEXT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  revision_id TEXT NULL REFERENCES universe_revisions(id) ON DELETE CASCADE,
  motif_key TEXT NOT NULL,
  label_json TEXT NOT NULL DEFAULT '{}',
  category TEXT NOT NULL DEFAULT 'OBJECT',
  priority TEXT NOT NULL DEFAULT 'SUPPORTING' CHECK(priority IN ('PRIMARY','SECONDARY','SUPPORTING')),
  discovery_source TEXT NOT NULL DEFAULT 'RESEARCH',
  confidence REAL NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'DISCOVERED' CHECK(status IN ('DISCOVERED','REVIEW_REQUIRED','APPROVED','REJECTED')),
  evidence_json TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(entity_game_id,revision_id,motif_key)
);
CREATE INDEX IF NOT EXISTS idx_visual_identity_motifs_entity ON visual_identity_motifs(entity_game_id,revision_id,status,priority);

CREATE TABLE IF NOT EXISTS visual_identity_assets (
  motif_id TEXT NOT NULL REFERENCES visual_identity_motifs(id) ON DELETE CASCADE,
  visual_asset_id TEXT NOT NULL REFERENCES visual_asset_registry(id) ON DELETE CASCADE,
  match_score REAL NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'CANDIDATE' CHECK(status IN ('CANDIDATE','APPROVED','REJECTED')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY(motif_id,visual_asset_id)
);
CREATE INDEX IF NOT EXISTS idx_visual_identity_assets_match ON visual_identity_assets(motif_id,status,match_score DESC);

CREATE TABLE IF NOT EXISTS interaction_concepts (
  id TEXT PRIMARY KEY,
  entity_game_id TEXT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  revision_id TEXT NULL REFERENCES universe_revisions(id) ON DELETE CASCADE,
  concept_key TEXT NOT NULL,
  category TEXT NOT NULL,
  title_json TEXT NOT NULL DEFAULT '{}',
  description_json TEXT NOT NULL DEFAULT '{}',
  evidence_json TEXT NOT NULL DEFAULT '[]',
  confidence REAL NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'SUGGESTED' CHECK(status IN ('SUGGESTED','PREVIEW_READY','APPROVED','DISCARDED')),
  current_prototype_id TEXT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(entity_game_id,revision_id,concept_key)
);
CREATE INDEX IF NOT EXISTS idx_interaction_concepts_entity ON interaction_concepts(entity_game_id,revision_id,status,confidence DESC);

CREATE TABLE IF NOT EXISTS interaction_prototypes (
  id TEXT PRIMARY KEY,
  concept_id TEXT NOT NULL REFERENCES interaction_concepts(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  prototype_type TEXT NOT NULL,
  config_json TEXT NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'PREVIEW' CHECK(status IN ('PREVIEW','APPROVED','REJECTED')),
  feedback_code TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(concept_id,version_number)
);
CREATE INDEX IF NOT EXISTS idx_interaction_prototypes_concept ON interaction_prototypes(concept_id,version_number DESC);

CREATE TABLE IF NOT EXISTS authorization_queue (
  id TEXT PRIMARY KEY,
  entity_game_id TEXT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  revision_id TEXT NULL REFERENCES universe_revisions(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK(item_type IN ('CONTENT','IMAGE','VISUAL_IDENTITY','INTERACTION','APPEARANCE')),
  item_id TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  reason TEXT NOT NULL DEFAULT '',
  confidence REAL NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK(status IN ('PENDING','APPROVED','REJECTED','SUPERSEDED')),
  preview_ref TEXT NOT NULL DEFAULT '',
  metadata_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(entity_game_id,revision_id,item_type,item_id,status)
);
CREATE INDEX IF NOT EXISTS idx_authorization_queue_pending ON authorization_queue(entity_game_id,revision_id,status,item_type,confidence DESC);

CREATE TABLE IF NOT EXISTS enhancement_runs (
  id TEXT PRIMARY KEY,
  entity_game_id TEXT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  revision_id TEXT NULL REFERENCES universe_revisions(id) ON DELETE SET NULL,
  passes_requested INTEGER NOT NULL DEFAULT 1 CHECK(passes_requested BETWEEN 1 AND 5),
  focus TEXT NOT NULL DEFAULT 'SMART' CHECK(focus IN ('SMART','EVERYTHING','CONTENT','IMAGES','VISUAL_IDENTITY','INTERACTIONS')),
  status TEXT NOT NULL DEFAULT 'RUNNING' CHECK(status IN ('RUNNING','COMPLETE','FAILED','CANCELLED')),
  before_json TEXT NOT NULL DEFAULT '{}',
  after_json TEXT NOT NULL DEFAULT '{}',
  created_by TEXT NULL REFERENCES users(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL,
  completed_at TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_enhancement_runs_entity ON enhancement_runs(entity_game_id,created_at DESC);

CREATE TABLE IF NOT EXISTS enhancement_passes (
  id TEXT PRIMARY KEY,
  run_id TEXT NOT NULL REFERENCES enhancement_runs(id) ON DELETE CASCADE,
  pass_number INTEGER NOT NULL,
  focus TEXT NOT NULL,
  query_plan_json TEXT NOT NULL DEFAULT '[]',
  delta_json TEXT NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'COMPLETE' CHECK(status IN ('RUNNING','COMPLETE','FAILED','SKIPPED')),
  created_at TEXT NOT NULL,
  UNIQUE(run_id,pass_number)
);

CREATE TABLE IF NOT EXISTS build_revision_state (
  entity_game_id TEXT PRIMARY KEY REFERENCES games(id) ON DELETE CASCADE,
  current_build_id TEXT NULL REFERENCES universe_builds(id) ON DELETE SET NULL,
  current_revision_id TEXT NULL REFERENCES universe_revisions(id) ON DELETE SET NULL,
  last_valid_revision_id TEXT NULL REFERENCES universe_revisions(id) ON DELETE SET NULL,
  preview_revision_id TEXT NULL REFERENCES universe_revisions(id) ON DELETE SET NULL,
  published_revision_id TEXT NULL REFERENCES universe_revisions(id) ON DELETE SET NULL,
  current_status TEXT NOT NULL DEFAULT 'IDLE',
  updated_at TEXT NOT NULL
);

INSERT INTO meta(key,value) VALUES('runtime_version','0.99-I6')
ON CONFLICT(key) DO UPDATE SET value=excluded.value;
INSERT INTO meta(key,value) VALUES('public_version','0.99')
ON CONFLICT(key) DO UPDATE SET value=excluded.value;
INSERT INTO meta(key,value) VALUES('runtime_release','BETA_0_99_I6_UNIVERSE_BUILDER_EXPERIENCE')
ON CONFLICT(key) DO UPDATE SET value=excluded.value;
INSERT INTO meta(key,value) VALUES('beta_099_i6','1') ON CONFLICT(key) DO UPDATE SET value='1';
