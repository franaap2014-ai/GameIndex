PRAGMA foreign_keys = ON;
-- GameIndex Beta 0.991 I1 HF2 — Creator Authority + Animation Editor
-- Additive only. No user, universe, cinematic, bug, image, music, or social data is deleted.

-- Repair the historical "visual Creator without authority" state.
-- INSERT OR IGNORE is deliberate: existing ACTIVE/INACTIVE/REVOKED connection rows are preserved.
INSERT OR IGNORE INTO admin_connections(user_id,connection_role,status,created_by,reason,created_at,updated_at)
SELECT s.user_id,
       CASE WHEN s.role='CREATOR' THEN 'CREATOR' ELSE 'DEV' END,
       'ACTIVE',
       CASE WHEN EXISTS(SELECT 1 FROM users a WHERE a.id=s.assigned_by) THEN s.assigned_by ELSE s.user_id END,
       '0.991 I1 HF2 repair: active staff assignment missing Admin Connection',
       COALESCE(NULLIF(s.created_at,''),datetime('now')),
       datetime('now')
FROM staff_role_assignments s
JOIN users u ON u.id=s.user_id
WHERE s.role IN ('CREATOR','DEV') AND COALESCE(s.suspended,0)=0;

-- Explicit primary Creator repair, still only when the connection row is missing.
INSERT OR IGNORE INTO admin_connections(user_id,connection_role,status,created_by,reason,created_at,updated_at)
SELECT s.user_id,'CREATOR','ACTIVE',s.user_id,
       '0.991 I1 HF2 repair: primary Creator authority synchronization',
       COALESCE(NULLIF(s.created_at,''),datetime('now')),datetime('now')
FROM staff_role_assignments s
WHERE s.user_id=(SELECT value FROM meta WHERE key='primary_creator_user_id')
  AND s.role='CREATOR' AND COALESCE(s.suspended,0)=0;

CREATE TABLE IF NOT EXISTS animation_projects (
  id TEXT PRIMARY KEY,
  project_key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  animation_type TEXT NOT NULL CHECK(animation_type IN ('CINEMATIC','UI_ANIMATION','DECORATION_ANIMATION')),
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK(status IN ('DRAFT','PREVIEW','PUBLISHED','ARCHIVED')),
  duration_ms INTEGER NOT NULL DEFAULT 4200 CHECK(duration_ms BETWEEN 250 AND 30000),
  current_revision INTEGER NOT NULL DEFAULT 1 CHECK(current_revision >= 1),
  published_revision INTEGER NOT NULL DEFAULT 0 CHECK(published_revision >= 0),
  created_by TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(created_by) REFERENCES users(id) ON DELETE SET NULL
) STRICT;
CREATE INDEX IF NOT EXISTS idx_animation_projects_status ON animation_projects(status,updated_at DESC);

CREATE TABLE IF NOT EXISTS animation_revisions (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  revision INTEGER NOT NULL CHECK(revision >= 1),
  definition_json TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK(status IN ('DRAFT','PREVIEW','PUBLISHED','ARCHIVED')),
  created_by TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  published_at TEXT NOT NULL DEFAULT '',
  UNIQUE(project_id,revision),
  FOREIGN KEY(project_id) REFERENCES animation_projects(id) ON DELETE CASCADE,
  FOREIGN KEY(created_by) REFERENCES users(id) ON DELETE SET NULL
) STRICT;
CREATE INDEX IF NOT EXISTS idx_animation_revisions_project ON animation_revisions(project_id,revision DESC);

CREATE TABLE IF NOT EXISTS animation_bindings (
  id TEXT PRIMARY KEY,
  animation_project_id TEXT NOT NULL,
  context_type TEXT NOT NULL CHECK(context_type IN ('WELCOME','IDENTITY_CREATOR','IDENTITY_DEV','IDENTITY_TESTER','IDENTITY_PRO','THEME_CHANGE','GAME_REVEAL','ADMIN_PANEL_OPEN','CUSTOM')),
  context_key TEXT NOT NULL DEFAULT '',
  active_revision INTEGER NOT NULL CHECK(active_revision >= 1),
  enabled INTEGER NOT NULL DEFAULT 1 CHECK(enabled IN (0,1)),
  updated_by TEXT,
  updated_at TEXT NOT NULL,
  UNIQUE(context_type,context_key),
  FOREIGN KEY(animation_project_id) REFERENCES animation_projects(id) ON DELETE CASCADE,
  FOREIGN KEY(updated_by) REFERENCES users(id) ON DELETE SET NULL
) STRICT;

CREATE TABLE IF NOT EXISTS animation_presets (
  id TEXT PRIMARY KEY,
  preset_key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  definition_json TEXT NOT NULL,
  built_in INTEGER NOT NULL DEFAULT 1 CHECK(built_in IN (0,1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
) STRICT;

CREATE TABLE IF NOT EXISTS animation_audit (
  id TEXT PRIMARY KEY,
  actor_user_id TEXT,
  project_id TEXT,
  revision_id TEXT,
  action TEXT NOT NULL,
  metadata_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  FOREIGN KEY(actor_user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY(project_id) REFERENCES animation_projects(id) ON DELETE SET NULL,
  FOREIGN KEY(revision_id) REFERENCES animation_revisions(id) ON DELETE SET NULL
) STRICT;
CREATE INDEX IF NOT EXISTS idx_animation_audit_project ON animation_audit(project_id,created_at DESC);

INSERT INTO meta(key,value) VALUES('runtime_version','0.991-I1-HF2')
ON CONFLICT(key) DO UPDATE SET value=excluded.value;
INSERT INTO meta(key,value) VALUES('runtime_release','BETA_0_991_I1_HF2_CREATOR_ANIMATION_EDITOR')
ON CONFLICT(key) DO UPDATE SET value=excluded.value;
INSERT INTO meta(key,value) VALUES('beta_0991_i1_hf2','1')
ON CONFLICT(key) DO UPDATE SET value='1';
