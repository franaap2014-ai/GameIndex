PRAGMA foreign_keys = ON;
-- GameIndex Beta 0.99 — FINAL FOUNDATION
-- Additive migration only. Existing users/games/media/music/content are preserved.

ALTER TABLE games ADD COLUMN entity_type TEXT NOT NULL DEFAULT 'GAME' CHECK(entity_type IN ('GAME','EXPERIENCE'));
ALTER TABLE games ADD COLUMN parent_game_id TEXT;
ALTER TABLE games ADD COLUMN root_game_id TEXT;
ALTER TABLE games ADD COLUMN relationship_type TEXT NOT NULL DEFAULT '';
ALTER TABLE games ADD COLUMN visibility TEXT NOT NULL DEFAULT 'PUBLIC' CHECK(visibility IN ('PUBLIC','UNLISTED','PRIVATE'));

UPDATE games SET root_game_id=id WHERE COALESCE(root_game_id,'')='';

-- Safe semantic migration: preserve the existing Roblox child rows/IDs/slugs.
UPDATE games
SET entity_type='EXPERIENCE',
    parent_game_id=(SELECT id FROM games WHERE lower(slug)='roblox' LIMIT 1),
    root_game_id=(SELECT id FROM games WHERE lower(slug)='roblox' LIMIT 1),
    relationship_type='EXPERIENCE_OF'
WHERE lower(slug) IN ('blox-fruits','doors','fisch','work-at-a-pizza-place','prison-life')
  AND EXISTS(SELECT 1 FROM games WHERE lower(slug)='roblox');

UPDATE games
SET entity_type='GAME', parent_game_id=NULL, root_game_id=id,
    relationship_type=CASE WHEN relationship_type='EXPERIENCE_OF' THEN '' ELSE relationship_type END
WHERE lower(slug)='roblox';

UPDATE game_parent_links
SET relation_type='EXPERIENCE_OF',updated_at=datetime('now')
WHERE child_game_id IN (
  SELECT id FROM games WHERE lower(slug) IN ('blox-fruits','doors','fisch','work-at-a-pizza-place','prison-life')
) AND parent_game_id=(SELECT id FROM games WHERE lower(slug)='roblox' LIMIT 1);

CREATE INDEX IF NOT EXISTS idx_games_entity_catalog ON games(entity_type,status,visibility,name);
CREATE INDEX IF NOT EXISTS idx_games_parent_entity ON games(parent_game_id,entity_type,status,name);
CREATE INDEX IF NOT EXISTS idx_games_root_entity ON games(root_game_id,entity_type,status,name);

CREATE TABLE IF NOT EXISTS universe_builds (
  id TEXT PRIMARY KEY,
  entity_game_id TEXT NOT NULL,
  entity_type TEXT NOT NULL CHECK(entity_type IN ('GAME','EXPERIENCE')),
  parent_game_id TEXT,
  build_scope TEXT NOT NULL DEFAULT 'FULL_ENTITY_BUILD',
  language TEXT NOT NULL DEFAULT 'pt-BR',
  status TEXT NOT NULL DEFAULT 'QUEUED' CHECK(status IN ('QUEUED','RUNNING','PARTIAL','COMPLETED','FAILED','CANCELLED')),
  current_stage TEXT NOT NULL DEFAULT 'RESEARCH',
  requested_by TEXT,
  source_summary_json TEXT NOT NULL DEFAULT '{}',
  metrics_json TEXT NOT NULL DEFAULT '{}',
  error_code TEXT NOT NULL DEFAULT '',
  error_message TEXT NOT NULL DEFAULT '',
  cancel_requested INTEGER NOT NULL DEFAULT 0 CHECK(cancel_requested IN (0,1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  completed_at TEXT NOT NULL DEFAULT '',
  FOREIGN KEY(entity_game_id) REFERENCES games(id) ON DELETE CASCADE,
  FOREIGN KEY(parent_game_id) REFERENCES games(id) ON DELETE SET NULL,
  FOREIGN KEY(requested_by) REFERENCES users(id) ON DELETE SET NULL
) STRICT;
CREATE INDEX IF NOT EXISTS idx_universe_builds_entity ON universe_builds(entity_game_id,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_universe_builds_status ON universe_builds(status,updated_at DESC);

CREATE TABLE IF NOT EXISTS universe_build_events (
  id TEXT PRIMARY KEY,
  build_id TEXT NOT NULL,
  stage TEXT NOT NULL,
  event_type TEXT NOT NULL,
  message TEXT NOT NULL DEFAULT '',
  details_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  FOREIGN KEY(build_id) REFERENCES universe_builds(id) ON DELETE CASCADE
) STRICT;
CREATE INDEX IF NOT EXISTS idx_universe_build_events_build ON universe_build_events(build_id,created_at);

CREATE TABLE IF NOT EXISTS universe_revisions (
  id TEXT PRIMARY KEY,
  entity_game_id TEXT NOT NULL,
  build_id TEXT,
  revision_number INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK(status IN ('DRAFT','VALIDATED','PUBLISHED','SUPERSEDED','ROLLED_BACK','FAILED')),
  canonical_locale TEXT NOT NULL DEFAULT 'pt-BR',
  canonical_content_json TEXT NOT NULL DEFAULT '{}',
  translations_json TEXT NOT NULL DEFAULT '{}',
  structure_snapshot_json TEXT NOT NULL DEFAULT '{}',
  source_ids_json TEXT NOT NULL DEFAULT '[]',
  created_by TEXT,
  generated_by TEXT NOT NULL DEFAULT 'UNIVERSE_BUILDER',
  moderation_status TEXT NOT NULL DEFAULT 'DRAFT',
  supersedes_revision_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  published_at TEXT NOT NULL DEFAULT '',
  UNIQUE(entity_game_id,revision_number),
  FOREIGN KEY(entity_game_id) REFERENCES games(id) ON DELETE CASCADE,
  FOREIGN KEY(build_id) REFERENCES universe_builds(id) ON DELETE SET NULL,
  FOREIGN KEY(created_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY(supersedes_revision_id) REFERENCES universe_revisions(id) ON DELETE SET NULL
) STRICT;
CREATE INDEX IF NOT EXISTS idx_universe_revisions_entity ON universe_revisions(entity_game_id,status,revision_number DESC);

CREATE TABLE IF NOT EXISTS universe_pages (
  id TEXT PRIMARY KEY,
  entity_game_id TEXT NOT NULL,
  canonical_key TEXT NOT NULL,
  slug TEXT NOT NULL,
  title_json TEXT NOT NULL DEFAULT '{}',
  summary_json TEXT NOT NULL DEFAULT '{}',
  layout_variant TEXT NOT NULL DEFAULT 'STANDARD',
  identity_variant TEXT NOT NULL DEFAULT '',
  ownership TEXT NOT NULL DEFAULT 'UNIVERSE_BUILDER' CHECK(ownership IN ('SYSTEM','MANUAL','UNIVERSE_BUILDER','MIGRATED')),
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK(status IN ('DRAFT','PUBLISHED','ARCHIVED')),
  display_order INTEGER NOT NULL DEFAULT 0,
  revision_id TEXT,
  created_by TEXT,
  updated_by TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(entity_game_id) REFERENCES games(id) ON DELETE CASCADE,
  FOREIGN KEY(revision_id) REFERENCES universe_revisions(id) ON DELETE SET NULL,
  FOREIGN KEY(created_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY(updated_by) REFERENCES users(id) ON DELETE SET NULL
) STRICT;
CREATE INDEX IF NOT EXISTS idx_universe_pages_entity ON universe_pages(entity_game_id,status,display_order);
CREATE UNIQUE INDEX IF NOT EXISTS ux_universe_pages_revision_key ON universe_pages(entity_game_id,canonical_key,revision_id) WHERE revision_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS ux_universe_pages_revision_slug ON universe_pages(entity_game_id,slug,revision_id) WHERE revision_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS ux_universe_pages_published_key ON universe_pages(entity_game_id,canonical_key) WHERE status='PUBLISHED';
CREATE UNIQUE INDEX IF NOT EXISTS ux_universe_pages_published_slug ON universe_pages(entity_game_id,slug) WHERE status='PUBLISHED';

CREATE TABLE IF NOT EXISTS universe_tabs (
  id TEXT PRIMARY KEY,
  entity_game_id TEXT NOT NULL,
  page_id TEXT NOT NULL,
  canonical_key TEXT NOT NULL,
  slug TEXT NOT NULL,
  title_json TEXT NOT NULL DEFAULT '{}',
  layout_variant TEXT NOT NULL DEFAULT 'STANDARD',
  identity_variant TEXT NOT NULL DEFAULT '',
  ownership TEXT NOT NULL DEFAULT 'UNIVERSE_BUILDER' CHECK(ownership IN ('SYSTEM','MANUAL','UNIVERSE_BUILDER','MIGRATED')),
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK(status IN ('DRAFT','PUBLISHED','ARCHIVED')),
  display_order INTEGER NOT NULL DEFAULT 0,
  revision_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(entity_game_id) REFERENCES games(id) ON DELETE CASCADE,
  FOREIGN KEY(page_id) REFERENCES universe_pages(id) ON DELETE CASCADE,
  FOREIGN KEY(revision_id) REFERENCES universe_revisions(id) ON DELETE SET NULL
) STRICT;
CREATE INDEX IF NOT EXISTS idx_universe_tabs_page ON universe_tabs(page_id,status,display_order);
CREATE UNIQUE INDEX IF NOT EXISTS ux_universe_tabs_revision_key ON universe_tabs(page_id,canonical_key,revision_id) WHERE revision_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS ux_universe_tabs_revision_slug ON universe_tabs(page_id,slug,revision_id) WHERE revision_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS universe_sections (
  id TEXT PRIMARY KEY,
  entity_game_id TEXT NOT NULL,
  page_id TEXT NOT NULL,
  tab_id TEXT,
  parent_section_id TEXT,
  canonical_key TEXT NOT NULL,
  title_json TEXT NOT NULL DEFAULT '{}',
  section_type TEXT NOT NULL DEFAULT 'TEXT',
  content_json TEXT NOT NULL DEFAULT '{}',
  layout_variant TEXT NOT NULL DEFAULT 'STANDARD',
  identity_variant TEXT NOT NULL DEFAULT '',
  ownership TEXT NOT NULL DEFAULT 'UNIVERSE_BUILDER' CHECK(ownership IN ('SYSTEM','MANUAL','UNIVERSE_BUILDER','MIGRATED')),
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK(status IN ('DRAFT','PUBLISHED','ARCHIVED')),
  display_order INTEGER NOT NULL DEFAULT 0,
  revision_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(entity_game_id) REFERENCES games(id) ON DELETE CASCADE,
  FOREIGN KEY(page_id) REFERENCES universe_pages(id) ON DELETE CASCADE,
  FOREIGN KEY(tab_id) REFERENCES universe_tabs(id) ON DELETE CASCADE,
  FOREIGN KEY(parent_section_id) REFERENCES universe_sections(id) ON DELETE CASCADE,
  FOREIGN KEY(revision_id) REFERENCES universe_revisions(id) ON DELETE SET NULL
) STRICT;
CREATE INDEX IF NOT EXISTS idx_universe_sections_page ON universe_sections(page_id,tab_id,status,display_order);
CREATE UNIQUE INDEX IF NOT EXISTS ux_universe_sections_revision_key ON universe_sections(page_id,COALESCE(tab_id,''),canonical_key,revision_id) WHERE revision_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS universe_topics (
  id TEXT PRIMARY KEY,
  entity_game_id TEXT NOT NULL,
  canonical_key TEXT NOT NULL,
  topic_type TEXT NOT NULL DEFAULT 'GENERAL',
  title TEXT NOT NULL,
  priority REAL NOT NULL DEFAULT 0.5,
  fact_ids_json TEXT NOT NULL DEFAULT '[]',
  target_page_key TEXT NOT NULL DEFAULT 'overview',
  target_tab_key TEXT NOT NULL DEFAULT 'overview',
  target_section_key TEXT NOT NULL DEFAULT 'summary',
  layout_hint TEXT NOT NULL DEFAULT '',
  media_ids_json TEXT NOT NULL DEFAULT '[]',
  interaction_ids_json TEXT NOT NULL DEFAULT '[]',
  revision_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(entity_game_id) REFERENCES games(id) ON DELETE CASCADE,
  FOREIGN KEY(revision_id) REFERENCES universe_revisions(id) ON DELETE SET NULL
) STRICT;
CREATE INDEX IF NOT EXISTS idx_universe_topics_entity ON universe_topics(entity_game_id,priority DESC,canonical_key);
CREATE UNIQUE INDEX IF NOT EXISTS ux_universe_topics_revision_key ON universe_topics(entity_game_id,canonical_key,revision_id) WHERE revision_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS universe_facts (
  id TEXT PRIMARY KEY,
  entity_game_id TEXT NOT NULL,
  topic_key TEXT NOT NULL DEFAULT 'overview',
  fact_key TEXT NOT NULL,
  value_json TEXT NOT NULL DEFAULT 'null',
  normalized_value TEXT NOT NULL DEFAULT '',
  confidence REAL NOT NULL DEFAULT 0.5,
  conflict_status TEXT NOT NULL DEFAULT 'NONE',
  evidence_ids_json TEXT NOT NULL DEFAULT '[]',
  source_language TEXT NOT NULL DEFAULT '',
  retrieved_at TEXT NOT NULL,
  last_verified_at TEXT NOT NULL,
  target_section_key TEXT NOT NULL DEFAULT 'summary',
  revision_id TEXT,
  FOREIGN KEY(entity_game_id) REFERENCES games(id) ON DELETE CASCADE,
  FOREIGN KEY(revision_id) REFERENCES universe_revisions(id) ON DELETE SET NULL
) STRICT;
CREATE INDEX IF NOT EXISTS idx_universe_facts_entity ON universe_facts(entity_game_id,topic_key,last_verified_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS ux_universe_facts_revision_value ON universe_facts(entity_game_id,topic_key,fact_key,normalized_value,revision_id) WHERE revision_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS universe_research_sources (
  id TEXT PRIMARY KEY,
  build_id TEXT NOT NULL,
  entity_game_id TEXT NOT NULL,
  source_id TEXT,
  source_type TEXT NOT NULL CHECK(source_type IN ('WIKI','FANDOM','TRELLO','YOUTUBE')),
  source_url TEXT NOT NULL,
  source_title TEXT NOT NULL DEFAULT '',
  source_name TEXT NOT NULL DEFAULT '',
  retrieved_at TEXT NOT NULL,
  content_fingerprint TEXT NOT NULL DEFAULT '',
  relevant_topic TEXT NOT NULL DEFAULT '',
  reliability_class TEXT NOT NULL DEFAULT '',
  accepted INTEGER NOT NULL DEFAULT 1 CHECK(accepted IN (0,1)),
  rejection_reason TEXT NOT NULL DEFAULT '',
  UNIQUE(build_id,source_url),
  FOREIGN KEY(build_id) REFERENCES universe_builds(id) ON DELETE CASCADE,
  FOREIGN KEY(entity_game_id) REFERENCES games(id) ON DELETE CASCADE,
  FOREIGN KEY(source_id) REFERENCES sources(id) ON DELETE SET NULL
) STRICT;
CREATE INDEX IF NOT EXISTS idx_universe_research_sources_build ON universe_research_sources(build_id,accepted,source_type);

CREATE TABLE IF NOT EXISTS content_media (
  id TEXT PRIMARY KEY,
  entity_game_id TEXT NOT NULL,
  page_id TEXT,
  section_id TEXT,
  topic_id TEXT,
  media_type TEXT NOT NULL DEFAULT 'IMAGE',
  source_url TEXT NOT NULL,
  cached_path TEXT NOT NULL DEFAULT '',
  attribution_json TEXT NOT NULL DEFAULT '{}',
  alt_text TEXT NOT NULL DEFAULT '',
  caption_json TEXT NOT NULL DEFAULT '{}',
  locale TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'CANDIDATE' CHECK(status IN ('CANDIDATE','APPROVED','ARCHIVED','FAILED')),
  source_id TEXT,
  revision_id TEXT,
  width INTEGER NOT NULL DEFAULT 0,
  height INTEGER NOT NULL DEFAULT 0,
  byte_size INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(entity_game_id) REFERENCES games(id) ON DELETE CASCADE,
  FOREIGN KEY(page_id) REFERENCES universe_pages(id) ON DELETE SET NULL,
  FOREIGN KEY(section_id) REFERENCES universe_sections(id) ON DELETE SET NULL,
  FOREIGN KEY(topic_id) REFERENCES universe_topics(id) ON DELETE SET NULL,
  FOREIGN KEY(source_id) REFERENCES sources(id) ON DELETE SET NULL,
  FOREIGN KEY(revision_id) REFERENCES universe_revisions(id) ON DELETE SET NULL
) STRICT;
CREATE UNIQUE INDEX IF NOT EXISTS ux_content_media_revision_source ON content_media(entity_game_id,source_url,revision_id) WHERE revision_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS ux_content_media_live_source ON content_media(entity_game_id,source_url) WHERE revision_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_content_media_entity ON content_media(entity_game_id,status,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_media_revision ON content_media(revision_id,status);

CREATE TABLE IF NOT EXISTS interactive_components (
  id TEXT PRIMARY KEY,
  entity_game_id TEXT NOT NULL,
  page_id TEXT,
  section_id TEXT,
  component_type TEXT NOT NULL CHECK(component_type IN ('WHEEL','CALCULATOR','COMPARATOR','FILTER','PROGRESSION_TREE','CHECKLIST','TIMELINE','GALLERY','TABLE','SEARCHABLE_COLLECTION','MAP','STAT_EXPLORER','CUSTOM_SAFE_COMPONENT')),
  config_json TEXT NOT NULL DEFAULT '{}',
  data_json TEXT NOT NULL DEFAULT '{}',
  data_revision INTEGER NOT NULL DEFAULT 1,
  identity_variant TEXT NOT NULL DEFAULT '',
  locale_config_json TEXT NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK(status IN ('DRAFT','PUBLISHED','ARCHIVED','INVALID')),
  source_ids_json TEXT NOT NULL DEFAULT '[]',
  last_verified_at TEXT NOT NULL DEFAULT '',
  revision_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(entity_game_id) REFERENCES games(id) ON DELETE CASCADE,
  FOREIGN KEY(page_id) REFERENCES universe_pages(id) ON DELETE SET NULL,
  FOREIGN KEY(section_id) REFERENCES universe_sections(id) ON DELETE SET NULL,
  FOREIGN KEY(revision_id) REFERENCES universe_revisions(id) ON DELETE SET NULL
) STRICT;
CREATE INDEX IF NOT EXISTS idx_interactive_components_entity ON interactive_components(entity_game_id,status,component_type);

CREATE TABLE IF NOT EXISTS entity_identity_profiles (
  entity_game_id TEXT PRIMARY KEY,
  theme_key TEXT NOT NULL DEFAULT 'gameindex-default',
  tokens_json TEXT NOT NULL DEFAULT '{}',
  typography_json TEXT NOT NULL DEFAULT '{}',
  motifs_json TEXT NOT NULL DEFAULT '[]',
  decorations_json TEXT NOT NULL DEFAULT '[]',
  layout_variant TEXT NOT NULL DEFAULT 'STANDARD',
  interaction_style TEXT NOT NULL DEFAULT 'DEFAULT',
  technical_style TEXT NOT NULL DEFAULT 'DEFAULT',
  music_profile_json TEXT NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'APPROVED' CHECK(status IN ('DRAFT','APPROVED','ARCHIVED')),
  updated_by TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(entity_game_id) REFERENCES games(id) ON DELETE CASCADE,
  FOREIGN KEY(updated_by) REFERENCES users(id) ON DELETE SET NULL
) STRICT;

CREATE TABLE IF NOT EXISTS entity_technical_profiles (
  entity_game_id TEXT PRIMARY KEY,
  fields_json TEXT NOT NULL DEFAULT '[]',
  groups_json TEXT NOT NULL DEFAULT '[]',
  presentation_variant TEXT NOT NULL DEFAULT 'DEFAULT',
  identity_variant TEXT NOT NULL DEFAULT '',
  revision_id TEXT,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(entity_game_id) REFERENCES games(id) ON DELETE CASCADE,
  FOREIGN KEY(revision_id) REFERENCES universe_revisions(id) ON DELETE SET NULL
) STRICT;

-- Approved reviewed identity profiles for the five 0.99 Roblox Experience test cases.
INSERT OR IGNORE INTO entity_identity_profiles(entity_game_id,theme_key,tokens_json,typography_json,motifs_json,decorations_json,layout_variant,interaction_style,technical_style,music_profile_json,status,created_at,updated_at)
SELECT id,'blox-fruits-adventure','{"pageBg":"#101827","panelBg":"#172238","panelAlt":"#1d2c48","text":"#f7fbff","muted":"#b8c9dc","border":"#345172","accent":"#f4b740","accentStrong":"#ffcb5c","interactiveBg":"#132944","headerBg":"#0e1726"}','{}','["BLOX_FRUIT","MARITIME_ELEMENT"]','[]','ADVENTURE','BLOX_FRUITS','ADVENTURE_TECH','{"sourceType":"PARENT_INHERITANCE","parent":"Roblox"}','APPROVED',datetime('now'),datetime('now')
FROM games WHERE lower(slug)='blox-fruits';

INSERT OR IGNORE INTO entity_identity_profiles(entity_game_id,theme_key,tokens_json,typography_json,motifs_json,decorations_json,layout_variant,interaction_style,technical_style,music_profile_json,status,created_at,updated_at)
SELECT id,'doors-corridor','{"pageBg":"#0d0b0b","panelBg":"#171313","panelAlt":"#211a18","text":"#f5eee7","muted":"#c4b4a6","border":"#5a4236","accent":"#b98b64","accentStrong":"#d9ad85","interactiveBg":"#1d1614","headerBg":"#090808"}','{}','["DOORS_DOOR","ROOM_NUMBER","CORRIDOR","ELEVATOR"]','[]','ATMOSPHERIC','DOORS','DARK_TECH','{"sourceType":"PARENT_INHERITANCE","parent":"Roblox"}','APPROVED',datetime('now'),datetime('now')
FROM games WHERE lower(slug)='doors';

INSERT OR IGNORE INTO entity_identity_profiles(entity_game_id,theme_key,tokens_json,typography_json,motifs_json,decorations_json,layout_variant,interaction_style,technical_style,music_profile_json,status,created_at,updated_at)
SELECT id,'fisch-aquatic','{"pageBg":"#071c28","panelBg":"#0d2b3a","panelAlt":"#12394a","text":"#f2fbff","muted":"#b3d5df","border":"#256a7f","accent":"#67d4d8","accentStrong":"#91eef0","interactiveBg":"#0e3445","headerBg":"#061720"}','{}','["FISCH_FISH","WATER_DETAIL","FISHING_ELEMENT"]','[]','AQUATIC','FISCH','AQUATIC_TECH','{"sourceType":"PARENT_INHERITANCE","parent":"Roblox"}','APPROVED',datetime('now'),datetime('now')
FROM games WHERE lower(slug)='fisch';

INSERT OR IGNORE INTO entity_identity_profiles(entity_game_id,theme_key,tokens_json,typography_json,motifs_json,decorations_json,layout_variant,interaction_style,technical_style,music_profile_json,status,created_at,updated_at)
SELECT id,'pizza-place-workshop','{"pageBg":"#241812","panelBg":"#34231a","panelAlt":"#442d20","text":"#fff7ec","muted":"#e2c8ad","border":"#8c5835","accent":"#f3a64a","accentStrong":"#ffc16b","interactiveBg":"#3a251a","headerBg":"#1d120d"}','{}','["PIZZA","PIZZA_BOX","RESTAURANT_ELEMENT"]','[]','WORKPLACE','PIZZA_PLACE','RESTAURANT_TECH','{"sourceType":"PARENT_INHERITANCE","parent":"Roblox"}','APPROVED',datetime('now'),datetime('now')
FROM games WHERE lower(slug)='work-at-a-pizza-place';

INSERT OR IGNORE INTO entity_identity_profiles(entity_game_id,theme_key,tokens_json,typography_json,motifs_json,decorations_json,layout_variant,interaction_style,technical_style,music_profile_json,status,created_at,updated_at)
SELECT id,'prison-life-2016','{"pageBg":"#15191b","panelBg":"#22282b","panelAlt":"#2b3336","text":"#f0f4f5","muted":"#bec9cc","border":"#59666a","accent":"#6f9e72","accentStrong":"#8aba8d","interactiveBg":"#283033","headerBg":"#101416"}','{}','["PRISON_CLASSIC","ROBLOX_2016"]','[]','CLASSIC_ROBLOX','PRISON_LIFE','CLASSIC_TECH','{"sourceType":"ERA_INHERITANCE","parent":"Roblox","era":"2016"}','APPROVED',datetime('now'),datetime('now')
FROM games WHERE lower(slug)='prison-life';

-- Seed a generic technical profile from already stored game metadata; Universe Builder can enrich it later.
INSERT OR IGNORE INTO entity_technical_profiles(entity_game_id,fields_json,groups_json,presentation_variant,identity_variant,updated_at)
SELECT id,
  json_array(
    json_object('canonicalKey','PLATFORM','label','Platform','value','Roblox','valueType','TEXT','visibility','PUBLIC','order',10),
    json_object('canonicalKey','ENTITY_TYPE','label','Type','value','Experience','valueType','TEXT','visibility','PUBLIC','order',20),
    json_object('canonicalKey','DEVELOPER','label','Developer','value',developer,'valueType','TEXT','visibility','PUBLIC','order',30),
    json_object('canonicalKey','RELEASE_DATE','label','Release date','value',release_date,'valueType','DATE','visibility','PUBLIC','order',40)
  ),
  '[{"key":"CORE","label":"Core Information","order":10}]',
  'EXPERIENCE_TECH','',datetime('now')
FROM games WHERE entity_type='EXPERIENCE';

INSERT INTO update_log_entries(version,title,codename,release_date,sections_json,tags_json,public,created_at)
VALUES(
  '0.99','GameIndex Beta 0.99','Final Foundation','2026-09-05',
  '{"NEW":["Universe Builder 2.0 research/evidence/structure foundation","GAME vs EXPERIENCE entity architecture","Dynamic pages/tabs/sections","Content Media separate from Image Manager","Safe Interactive Component Registry","Experience Identity System","Personalized Technical Profiles","Revision and future moderation contracts"],"FIXED":["Roblox Experiences no longer appear as top-level Games","Roblox child relationship label normalized to Experiences","Universe research no longer treats Wikipedia as the requested game Wiki source"],"IMPROVED":["Roblox experience personalization testbed","Future Social/AI/Submission/Moderation/Search integration contracts","Demand-driven local-first research architecture"]}',
  '["FINAL_FOUNDATION","UNIVERSE_BUILDER_2","EXPERIENCES","IDENTITY","INTERACTIVE_UNIVERSES","CONTENT_MEDIA","FUTURE_1_0"]',1,datetime('now')
)
ON CONFLICT(version) DO UPDATE SET title=excluded.title,codename=excluded.codename,release_date=excluded.release_date,sections_json=excluded.sections_json,tags_json=excluded.tags_json,public=excluded.public;

INSERT INTO meta(key,value) VALUES('beta_099','1') ON CONFLICT(key) DO UPDATE SET value='1';
INSERT INTO meta(key,value) VALUES('runtime_version','0.99') ON CONFLICT(key) DO UPDATE SET value='0.99';
INSERT INTO meta(key,value) VALUES('runtime_release','BETA_0_99_FINAL_FOUNDATION') ON CONFLICT(key) DO UPDATE SET value=excluded.value;
