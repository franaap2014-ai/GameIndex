PRAGMA foreign_keys = ON;
-- GameIndex Beta 0.99 I2 — Intelligent Procedural Experience Engine
-- Additive migration. Existing Beta 0.99 / I1 data, IDs and published revisions are preserved.

ALTER TABLE entity_identity_profiles
  ADD COLUMN visual_density TEXT NOT NULL DEFAULT 'RICH'
  CHECK(visual_density IN ('SPARSE','BALANCED','RICH','IMMERSIVE'));

ALTER TABLE entity_identity_profiles
  ADD COLUMN visual_policy_json TEXT NOT NULL DEFAULT '{}';

-- I2 deliberately moves the reviewed Roblox Experience profiles away from the
-- sparse I1 presentation. Performance adaptation happens at runtime; stored
-- authoring intent remains RICH unless a creator explicitly changes it.
UPDATE entity_identity_profiles
SET visual_density='RICH',
    visual_policy_json=CASE
      WHEN COALESCE(visual_policy_json,'') IN ('','{}') THEN '{"continuity":true,"sectionReinforcement":true,"adaptivePerformance":true,"maxAnimatedMotifs":4}'
      ELSE visual_policy_json
    END,
    updated_at=datetime('now')
WHERE lower(theme_key) IN (
  'blox-fruits-adventure','doors-corridor','fisch-aquatic',
  'pizza-place-workshop','prison-life-2016'
);

CREATE TABLE IF NOT EXISTS universe_interaction_bindings (
  id TEXT PRIMARY KEY,
  entity_game_id TEXT NOT NULL,
  page_id TEXT,
  section_id TEXT,
  element_key TEXT NOT NULL,
  element_role TEXT NOT NULL DEFAULT 'INTERACTIVE'
    CHECK(element_role IN ('DECORATIVE','INTERACTIVE','NAVIGATION','CONTENT')),
  event_type TEXT NOT NULL
    CHECK(event_type IN ('CLICK','HOVER','FOCUS','ENTER_SECTION','LEAVE_SECTION')),
  action_type TEXT NOT NULL
    CHECK(action_type IN (
      'OPEN','REVEAL','HIDE','NAVIGATE','PLAY_ANIMATION','PLAY_SOUND',
      'CHANGE_STATE','SHOW_INFO','OPEN_CHARACTER','OPEN_LOCATION',
      'OPEN_MEDIA','OPEN_GALLERY','SCROLL_TO'
    )),
  target_type TEXT NOT NULL DEFAULT 'NONE',
  target_id TEXT NOT NULL DEFAULT '',
  parameters_json TEXT NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'DRAFT'
    CHECK(status IN ('DRAFT','PUBLISHED','ARCHIVED','INVALID')),
  source TEXT NOT NULL DEFAULT 'MANUAL'
    CHECK(source IN ('MANUAL','BUILDER','PRESET','AI_SUGGESTION')),
  revision_id TEXT,
  created_by TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(entity_game_id) REFERENCES games(id) ON DELETE CASCADE,
  FOREIGN KEY(page_id) REFERENCES universe_pages(id) ON DELETE SET NULL,
  FOREIGN KEY(section_id) REFERENCES universe_sections(id) ON DELETE SET NULL,
  FOREIGN KEY(revision_id) REFERENCES universe_revisions(id) ON DELETE SET NULL,
  FOREIGN KEY(created_by) REFERENCES users(id) ON DELETE SET NULL
) STRICT;

CREATE INDEX IF NOT EXISTS idx_universe_interaction_bindings_entity
  ON universe_interaction_bindings(entity_game_id,status,event_type,action_type);
CREATE INDEX IF NOT EXISTS idx_universe_interaction_bindings_revision
  ON universe_interaction_bindings(revision_id,status);
CREATE INDEX IF NOT EXISTS idx_universe_interaction_bindings_element
  ON universe_interaction_bindings(entity_game_id,element_key,status);

INSERT INTO update_log_entries(version,title,codename,release_date,sections_json,tags_json,public,created_at)
VALUES(
  '0.99-I2','GameIndex Beta 0.99 I2','Intelligent Procedural Experience Engine','2026-09-05',
  '{"NEW":["Universe Builder 2.0 classified as Intelligent Procedural Experience Engine","Declarative Interactive Universe Engine","Visual Density Controller: SPARSE / BALANCED / RICH / IMMERSIVE","Persistent interaction bindings","Creative Director contract with deterministic fallback"],"IMPROVED":["Visual Grounding 2.0 continuity across sections","RICH visual density as the reviewed default for key Roblox Experiences","Builder preview/editing contracts","Performance-aware visual runtime"],"PRESERVED":["LOCAL_FIRST_NO_API_KEY","Game / Experience separation","HF1.1 Image Manager behavior","single global music runtime","Social Beta and Appearance foundation"]}',
  '["I2","UNIVERSE_BUILDER_2","INTERACTIVE_UNIVERSES","VISUAL_GROUNDING_2","LOCAL_FIRST","FINAL_FOUNDATION"]',
  1,datetime('now')
)
ON CONFLICT(version) DO UPDATE SET
  title=excluded.title,codename=excluded.codename,release_date=excluded.release_date,
  sections_json=excluded.sections_json,tags_json=excluded.tags_json,public=excluded.public;

INSERT INTO meta(key,value) VALUES('beta_099_i2','1')
  ON CONFLICT(key) DO UPDATE SET value='1';
INSERT INTO meta(key,value) VALUES('runtime_version','0.99-I2')
  ON CONFLICT(key) DO UPDATE SET value=excluded.value;
INSERT INTO meta(key,value) VALUES('runtime_release','BETA_0_99_I2_INTELLIGENT_PROCEDURAL_EXPERIENCE_ENGINE')
  ON CONFLICT(key) DO UPDATE SET value=excluded.value;
