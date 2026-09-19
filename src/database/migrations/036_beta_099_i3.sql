-- GameIndex Beta 0.99 I3 — Game-Sourced Visual Composition + Validation 2.0
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS visual_asset_registry (
  id TEXT PRIMARY KEY,
  entity_game_id TEXT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  asset_key TEXT NOT NULL,
  page_id TEXT NULL,
  section_id TEXT NULL,
  semantic_motif TEXT NOT NULL DEFAULT '',
  semantic_role TEXT NOT NULL DEFAULT 'SECTION_ACCENT' CHECK (semantic_role IN (
    'HERO','BACKGROUND','PRIMARY_SYMBOL','SECONDARY_SYMBOL','CHARACTER','LOCATION','ITEM','CREATURE',
    'CARD_ACCENT','SECTION_ACCENT','DIVIDER','NAVIGATION_ACCENT','INTERACTIVE_OBJECT','ENVIRONMENT_ELEMENT',
    'GALLERY','LOGO','UI_REFERENCE'
  )),
  visual_family TEXT NOT NULL DEFAULT '',
  source_type TEXT NOT NULL CHECK (source_type IN (
    'LOCAL_APPROVED_ASSET','EXISTING_GAMEINDEX_MEDIA','APPROVED_SCREENSHOT','SCREENSHOT_EXTRACT',
    'APPROVED_OFFICIAL_ASSET','VALIDATED_REFERENCE_ASSET','APPROVED_USER_ASSET'
  )),
  source_reference TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL,
  image_asset_id TEXT NULL,
  image_revision INTEGER NOT NULL DEFAULT 0,
  approval_status TEXT NOT NULL DEFAULT 'DISCOVERED' CHECK (approval_status IN ('DISCOVERED','REVIEWED','APPROVED','REJECTED','ARCHIVED')),
  confidence REAL NOT NULL DEFAULT 0 CHECK (confidence >= 0 AND confidence <= 1),
  width INTEGER NOT NULL DEFAULT 0 CHECK (width >= 0),
  height INTEGER NOT NULL DEFAULT 0 CHECK (height >= 0),
  byte_size INTEGER NOT NULL DEFAULT 0 CHECK (byte_size >= 0),
  variants_json TEXT NOT NULL DEFAULT '{}',
  provenance_json TEXT NOT NULL DEFAULT '{}',
  inherited_from_game_id TEXT NULL REFERENCES games(id) ON DELETE SET NULL,
  created_by TEXT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(entity_game_id, asset_key)
);
CREATE INDEX IF NOT EXISTS idx_visual_assets_entity_status ON visual_asset_registry(entity_game_id,approval_status,semantic_role);
CREATE INDEX IF NOT EXISTS idx_visual_assets_entity_section ON visual_asset_registry(entity_game_id,section_id,approval_status);
CREATE INDEX IF NOT EXISTS idx_visual_assets_image_asset ON visual_asset_registry(image_asset_id,image_revision);

CREATE TABLE IF NOT EXISTS visual_grounding_validation (
  entity_game_id TEXT PRIMARY KEY REFERENCES games(id) ON DELETE CASCADE,
  revision_id TEXT NULL,
  requested_density TEXT NOT NULL DEFAULT 'RICH' CHECK (requested_density IN ('SPARSE','BALANCED','RICH','IMMERSIVE')),
  coverage_score REAL NOT NULL DEFAULT 0 CHECK (coverage_score >= 0 AND coverage_score <= 100),
  coverage_class TEXT NOT NULL DEFAULT 'FAILED' CHECK (coverage_class IN ('FAILED','INCOMPLETE','ACCEPTABLE','GROUNDED','HIGHLY_GROUNDED')),
  status TEXT NOT NULL DEFAULT 'FAILED' CHECK (status IN ('NOT_STARTED','PLANNED','PARTIAL','INCOMPLETE','READY','VALIDATED','FAILED','BLOCKED','PUBLISHED')),
  metrics_json TEXT NOT NULL DEFAULT '{}',
  blockers_json TEXT NOT NULL DEFAULT '[]',
  warnings_json TEXT NOT NULL DEFAULT '[]',
  updated_at TEXT NOT NULL
);

INSERT INTO update_log_entries(version,title,codename,release_date,sections_json,tags_json,public,created_at)
VALUES(
  '0.99-I3','GameIndex Beta 0.99 I3','Game-Sourced Visual Composition','2026-09-06',
  '{"NEW":["Visual Asset Registry","Game-Sourced Visual Composition Engine 2.1","Visual Coverage Score","Validation 2.0"],"IMPROVED":["Universe Builder state unification","RICH visual continuity","real-asset preview and publication gates"],"PRESERVED":["LOCAL_FIRST_NO_API_KEY","Interactive Universe Engine","Image Manager","global music runtime"]}',
  '["I3","GAME_SOURCED_VISUALS","VISUAL_COVERAGE","VALIDATION_2","UNIVERSE_BUILDER"]',
  1,datetime('now')
)
ON CONFLICT(version) DO UPDATE SET title=excluded.title,codename=excluded.codename,release_date=excluded.release_date,sections_json=excluded.sections_json,tags_json=excluded.tags_json,public=excluded.public;

INSERT INTO meta(key,value) VALUES('runtime_version','0.99-I3')
ON CONFLICT(key) DO UPDATE SET value=excluded.value;
INSERT INTO meta(key,value) VALUES('runtime_release','BETA_0_99_I3_GAME_SOURCED_VISUAL_COMPOSITION')
ON CONFLICT(key) DO UPDATE SET value=excluded.value;

INSERT INTO meta(key,value) VALUES('beta_099_i3','1') ON CONFLICT(key) DO UPDATE SET value='1';
