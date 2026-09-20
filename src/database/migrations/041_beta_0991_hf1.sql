-- GameIndex Beta 0.991 HF1 — identity restoration, account cinematics and Builder V3 state
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS user_cinematic_events (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_key TEXT NOT NULL,
  event_type TEXT NOT NULL DEFAULT 'SYSTEM' CHECK(event_type IN ('WELCOME','IDENTITY','SYSTEM')),
  identity TEXT NOT NULL DEFAULT '',
  version TEXT NOT NULL DEFAULT '1',
  status TEXT NOT NULL DEFAULT 'ELIGIBLE' CHECK(status IN ('ELIGIBLE','STARTED','COMPLETED','SKIPPED')),
  eligible_at TEXT NOT NULL,
  started_at TEXT NOT NULL DEFAULT '',
  completed_at TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL,
  metadata_json TEXT NOT NULL DEFAULT '{}',
  PRIMARY KEY(user_id,event_key)
) STRICT;
CREATE INDEX IF NOT EXISTS idx_user_cinematic_events_status ON user_cinematic_events(user_id,status,updated_at DESC);

CREATE TABLE IF NOT EXISTS universe_builder_component_locks (
  entity_game_id TEXT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  revision_id TEXT NULL REFERENCES universe_revisions(id) ON DELETE CASCADE,
  component_type TEXT NOT NULL CHECK(component_type IN ('PAGE','TAB','SECTION','IMAGE','INTERACTION','LAYOUT')),
  component_id TEXT NOT NULL,
  locked INTEGER NOT NULL DEFAULT 1 CHECK(locked IN (0,1)),
  reason TEXT NOT NULL DEFAULT 'USER_EDIT',
  updated_by TEXT NULL REFERENCES users(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY(entity_game_id,revision_id,component_type,component_id)
) STRICT;
CREATE INDEX IF NOT EXISTS idx_universe_builder_locks_entity ON universe_builder_component_locks(entity_game_id,revision_id,locked,updated_at DESC);


-- Locked manual sections are protected at the database boundary. Explicit user
-- actions can temporarily set meta.builder_lock_override to the section id.
CREATE TRIGGER IF NOT EXISTS trg_universe_sections_protect_locked_update
BEFORE UPDATE OF title_json,content_json,layout_variant,identity_variant ON universe_sections
WHEN EXISTS (
  SELECT 1
  FROM universe_builder_component_locks l
  WHERE l.entity_game_id=OLD.entity_game_id
    AND l.component_type='SECTION'
    AND l.component_id=OLD.id
    AND l.locked=1
    AND (l.revision_id IS OLD.revision_id OR l.revision_id=OLD.revision_id)
)
AND COALESCE((SELECT value FROM meta WHERE key='builder_lock_override'),'')<>OLD.id
BEGIN
  SELECT RAISE(IGNORE);
END;

CREATE TABLE IF NOT EXISTS universe_builder_snapshots (
  id TEXT PRIMARY KEY,
  entity_game_id TEXT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  revision_id TEXT NULL REFERENCES universe_revisions(id) ON DELETE SET NULL,
  snapshot_type TEXT NOT NULL DEFAULT 'CHECKPOINT' CHECK(snapshot_type IN ('CHECKPOINT','MANUAL_EDIT','AUTO_FIX','ENHANCEMENT','PUBLISH_PREP','RESTORE')),
  label TEXT NOT NULL DEFAULT '',
  state_json TEXT NOT NULL DEFAULT '{}',
  created_by TEXT NULL REFERENCES users(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL
) STRICT;
CREATE INDEX IF NOT EXISTS idx_universe_builder_snapshots_entity ON universe_builder_snapshots(entity_game_id,created_at DESC);

CREATE TABLE IF NOT EXISTS universe_builder_issues (
  id TEXT PRIMARY KEY,
  entity_game_id TEXT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  revision_id TEXT NULL REFERENCES universe_revisions(id) ON DELETE CASCADE,
  issue_key TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'GENERAL',
  priority TEXT NOT NULL DEFAULT 'RECOMMENDED' CHECK(priority IN ('BLOCKING','RECOMMENDED','OPTIONAL')),
  title TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'OPEN' CHECK(status IN ('OPEN','RESOLVED','DISMISSED','SUPERSEDED')),
  target_type TEXT NOT NULL DEFAULT '',
  target_id TEXT NOT NULL DEFAULT '',
  metadata_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(entity_game_id,revision_id,issue_key,status)
) STRICT;
CREATE INDEX IF NOT EXISTS idx_universe_builder_issues_open ON universe_builder_issues(entity_game_id,revision_id,status,priority,updated_at DESC);

INSERT INTO meta(key,value) VALUES('runtime_version','0.991-HF1')
ON CONFLICT(key) DO UPDATE SET value=excluded.value;
INSERT INTO meta(key,value) VALUES('public_version','0.991')
ON CONFLICT(key) DO UPDATE SET value=excluded.value;
INSERT INTO meta(key,value) VALUES('runtime_release','BETA_0_991_HF1_IDENTITY_RESTORATION')
ON CONFLICT(key) DO UPDATE SET value=excluded.value;
INSERT INTO meta(key,value) VALUES('beta_0991_hf1','1') ON CONFLICT(key) DO UPDATE SET value='1';
