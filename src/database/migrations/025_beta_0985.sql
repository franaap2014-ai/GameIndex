PRAGMA foreign_keys = ON;

-- GameIndex Beta 0.985 — REBIRTH
-- Additive migration from schema 24/HF1. Existing user, social, game,
-- research, page, Universe, and legacy image data is preserved.

CREATE TABLE IF NOT EXISTS ie3_assets (
  id TEXT PRIMARY KEY,
  game_id TEXT NOT NULL,
  entity_id TEXT,
  image_role TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'IMAGE_REQUEST',
  current_revision INTEGER NOT NULL DEFAULT 0,
  browser_status TEXT NOT NULL DEFAULT 'NOT_TESTED',
  repair_count INTEGER NOT NULL DEFAULT 0,
  max_repairs INTEGER NOT NULL DEFAULT 4,
  last_reason_code TEXT NOT NULL DEFAULT '',
  last_candidate_at TEXT NOT NULL DEFAULT '',
  last_ready_at TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(game_id,entity_id,image_role),
  FOREIGN KEY(game_id) REFERENCES games(id) ON DELETE CASCADE,
  FOREIGN KEY(entity_id) REFERENCES entities(id) ON DELETE CASCADE
) STRICT;
CREATE INDEX IF NOT EXISTS idx_ie3_assets_lookup ON ie3_assets(game_id,entity_id,image_role,state,updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_ie3_assets_state ON ie3_assets(state,updated_at DESC);

CREATE TABLE IF NOT EXISTS ie3_revisions (
  id TEXT PRIMARY KEY,
  asset_id TEXT NOT NULL,
  revision INTEGER NOT NULL,
  legacy_image_id TEXT,
  source_url TEXT NOT NULL DEFAULT '',
  source_page_url TEXT NOT NULL DEFAULT '',
  source_domain TEXT NOT NULL DEFAULT '',
  mime_type TEXT NOT NULL,
  width INTEGER NOT NULL DEFAULT 0,
  height INTEGER NOT NULL DEFAULT 0,
  byte_size INTEGER NOT NULL DEFAULT 0,
  checksum_sha256 TEXT NOT NULL,
  binary_data BLOB NOT NULL,
  deterministic_score REAL NOT NULL DEFAULT 0,
  semantic_status TEXT NOT NULL DEFAULT 'NOT_REQUIRED',
  semantic_confidence REAL NOT NULL DEFAULT 0,
  validation_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  UNIQUE(asset_id,revision),
  FOREIGN KEY(asset_id) REFERENCES ie3_assets(id) ON DELETE CASCADE,
  FOREIGN KEY(legacy_image_id) REFERENCES images(id) ON DELETE SET NULL
) STRICT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_ie3_revision_hash_asset ON ie3_revisions(asset_id,checksum_sha256);
CREATE INDEX IF NOT EXISTS idx_ie3_revision_hash ON ie3_revisions(checksum_sha256);

CREATE TABLE IF NOT EXISTS ie3_candidates (
  id TEXT PRIMARY KEY,
  asset_id TEXT NOT NULL,
  candidate_url TEXT NOT NULL,
  source_page_url TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL DEFAULT '',
  source_type TEXT NOT NULL DEFAULT 'UNKNOWN',
  state TEXT NOT NULL DEFAULT 'DISCOVERED',
  deterministic_score REAL NOT NULL DEFAULT 0,
  semantic_status TEXT NOT NULL DEFAULT 'NOT_REQUIRED',
  reason_code TEXT NOT NULL DEFAULT '',
  attempt_count INTEGER NOT NULL DEFAULT 0,
  discovered_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(asset_id,candidate_url),
  FOREIGN KEY(asset_id) REFERENCES ie3_assets(id) ON DELETE CASCADE
) STRICT;
CREATE INDEX IF NOT EXISTS idx_ie3_candidates_asset ON ie3_candidates(asset_id,state,deterministic_score DESC,updated_at DESC);

CREATE TABLE IF NOT EXISTS ie3_attempts (
  id TEXT PRIMARY KEY,
  asset_id TEXT NOT NULL,
  candidate_id TEXT,
  stage TEXT NOT NULL,
  status TEXT NOT NULL,
  reason_code TEXT NOT NULL DEFAULT '',
  details_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  FOREIGN KEY(asset_id) REFERENCES ie3_assets(id) ON DELETE CASCADE,
  FOREIGN KEY(candidate_id) REFERENCES ie3_candidates(id) ON DELETE SET NULL
) STRICT;
CREATE INDEX IF NOT EXISTS idx_ie3_attempts_asset ON ie3_attempts(asset_id,created_at DESC);

CREATE TABLE IF NOT EXISTS dexter_tasks (
  id TEXT PRIMARY KEY,
  task_type TEXT NOT NULL,
  schema_version TEXT NOT NULL DEFAULT '1',
  game_id TEXT,
  entity_id TEXT,
  provider TEXT NOT NULL DEFAULT 'ollama',
  model TEXT NOT NULL DEFAULT 'gemma3:4b',
  status TEXT NOT NULL DEFAULT 'QUEUED',
  timeout_class TEXT NOT NULL DEFAULT 'STANDARD',
  input_digest TEXT NOT NULL DEFAULT '',
  result_json TEXT NOT NULL DEFAULT '{}',
  reason_code TEXT NOT NULL DEFAULT '',
  duration_ms REAL NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  started_at TEXT NOT NULL DEFAULT '',
  completed_at TEXT NOT NULL DEFAULT '',
  FOREIGN KEY(game_id) REFERENCES games(id) ON DELETE SET NULL,
  FOREIGN KEY(entity_id) REFERENCES entities(id) ON DELETE SET NULL
) STRICT;
CREATE INDEX IF NOT EXISTS idx_dexter_tasks_status ON dexter_tasks(status,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_dexter_tasks_context ON dexter_tasks(game_id,entity_id,created_at DESC);

CREATE TABLE IF NOT EXISTS gi_audio_assets (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  byte_size INTEGER NOT NULL DEFAULT 0,
  checksum_sha256 TEXT NOT NULL UNIQUE,
  binary_data BLOB NOT NULL,
  license_type TEXT NOT NULL DEFAULT 'USER_PROVIDED',
  license_note TEXT NOT NULL DEFAULT '',
  created_by TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(created_by) REFERENCES users(id) ON DELETE SET NULL
) STRICT;

CREATE TABLE IF NOT EXISTS game_audio_profiles (
  game_id TEXT PRIMARY KEY,
  track_asset_id TEXT,
  enabled INTEGER NOT NULL DEFAULT 0 CHECK(enabled IN (0,1)),
  default_volume REAL NOT NULL DEFAULT 0.10 CHECK(default_volume>=0 AND default_volume<=1),
  loop INTEGER NOT NULL DEFAULT 1 CHECK(loop IN (0,1)),
  fade_ms INTEGER NOT NULL DEFAULT 650,
  updated_by TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(game_id) REFERENCES games(id) ON DELETE CASCADE,
  FOREIGN KEY(track_asset_id) REFERENCES gi_audio_assets(id) ON DELETE SET NULL,
  FOREIGN KEY(updated_by) REFERENCES users(id) ON DELETE SET NULL
) STRICT;

CREATE TABLE IF NOT EXISTS gi_repair_actions (
  id TEXT PRIMARY KEY,
  action_type TEXT NOT NULL,
  subject_type TEXT NOT NULL,
  subject_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'QUEUED',
  result_json TEXT NOT NULL DEFAULT '{}',
  created_by TEXT,
  created_at TEXT NOT NULL,
  completed_at TEXT NOT NULL DEFAULT '',
  FOREIGN KEY(created_by) REFERENCES users(id) ON DELETE SET NULL
) STRICT;
CREATE INDEX IF NOT EXISTS idx_gi_repair_actions_recent ON gi_repair_actions(created_at DESC,action_type,status);

-- Safe one-way compatibility import: only old validated BLOBs are copied into
-- Image Engine 3. Remote-only/placeholder records are intentionally not promoted.
INSERT OR IGNORE INTO ie3_assets(
  id,game_id,entity_id,image_role,state,current_revision,browser_status,repair_count,max_repairs,
  last_reason_code,last_candidate_at,last_ready_at,created_at,updated_at
)
SELECT
  'ie3-' || m.id,m.game_id,m.entity_id,m.image_role,
  CASE WHEN m.browser_status='REAL_IMAGE_PASS' THEN 'READY' ELSE 'SAME_ORIGIN_PUBLIC_MEDIA' END,
  MAX(1,m.revision),m.browser_status,0,4,'MIGRATED_FROM_0.98',m.updated_at,
  CASE WHEN m.browser_status='REAL_IMAGE_PASS' THEN m.updated_at ELSE '' END,m.created_at,m.updated_at
FROM gi_media_assets m
JOIN images i ON i.id=m.image_id
WHERE m.validation_status='VALIDATED' AND m.is_fallback=0
  AND i.verified=1 AND i.storage_type='BLOB' AND i.binary_data IS NOT NULL;

INSERT OR IGNORE INTO ie3_revisions(
  id,asset_id,revision,legacy_image_id,source_url,source_page_url,source_domain,mime_type,width,height,
  byte_size,checksum_sha256,binary_data,deterministic_score,semantic_status,semantic_confidence,
  validation_json,created_at
)
SELECT
  'ie3-rev-' || m.id || '-' || MAX(1,m.revision),
  'ie3-' || m.id,MAX(1,m.revision),i.id,COALESCE(i.original_url,i.url,''),COALESCE(i.source_url,''),
  COALESCE(i.source_domain,''),COALESCE(i.mime_type,'application/octet-stream'),COALESCE(i.width,0),
  COALESCE(i.height,0),COALESCE(i.file_size,0),COALESCE(i.image_hash,''),i.binary_data,
  COALESCE(i.confidence,0),'MIGRATED',0,
  json_object('source','0.98_HF1','legacyStatus',i.status,'legacyBrowser',m.browser_status),
  COALESCE(i.created_at,m.created_at)
FROM gi_media_assets m
JOIN images i ON i.id=m.image_id
WHERE m.validation_status='VALIDATED' AND m.is_fallback=0
  AND i.verified=1 AND i.storage_type='BLOB' AND i.binary_data IS NOT NULL
  AND COALESCE(i.image_hash,'')<>'';

INSERT INTO meta(key,value) VALUES('beta_0985','1') ON CONFLICT(key) DO UPDATE SET value='1';
INSERT INTO meta(key,value) VALUES('beta_0985_runtime','LOCAL_FIRST_NO_API_KEY') ON CONFLICT(key) DO UPDATE SET value='LOCAL_FIRST_NO_API_KEY';
INSERT INTO meta(key,value) VALUES('beta_0985_core','GI_CORE_8.5') ON CONFLICT(key) DO UPDATE SET value='GI_CORE_8.5';
INSERT INTO meta(key,value) VALUES('beta_0985_image_engine','IMAGE_ENGINE_3') ON CONFLICT(key) DO UPDATE SET value='IMAGE_ENGINE_3';
INSERT INTO meta(key,value) VALUES('beta_0985_dexter_model','gemma3:4b') ON CONFLICT(key) DO UPDATE SET value='gemma3:4b';
