-- GameIndex Beta 0.87 — Stability & Integration
-- Additive migration: canonical entity truth, pipeline observability,
-- safer generation diagnostics and Database Explorer support.

CREATE TABLE IF NOT EXISTS entity_canonical_state (
  entity_id TEXT PRIMARY KEY,
  game_id TEXT NOT NULL,
  canonical_type TEXT NOT NULL DEFAULT 'OTHER',
  confidence REAL NOT NULL DEFAULT 0,
  validation_status TEXT NOT NULL DEFAULT 'CANDIDATE',
  source TEXT NOT NULL DEFAULT 'MIGRATION',
  reason TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL,
  FOREIGN KEY(entity_id) REFERENCES entities(id) ON DELETE CASCADE,
  FOREIGN KEY(game_id) REFERENCES games(id) ON DELETE CASCADE
) STRICT;

CREATE TABLE IF NOT EXISTS entity_consistency_events (
  id TEXT PRIMARY KEY,
  entity_id TEXT NOT NULL,
  game_id TEXT NOT NULL,
  canonical_type TEXT NOT NULL,
  subsystem TEXT NOT NULL,
  observed_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'CONFLICT',
  details_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  FOREIGN KEY(entity_id) REFERENCES entities(id) ON DELETE CASCADE,
  FOREIGN KEY(game_id) REFERENCES games(id) ON DELETE CASCADE
) STRICT;

ALTER TABLE generation_jobs ADD COLUMN failure_stage TEXT NOT NULL DEFAULT '';
ALTER TABLE generation_jobs ADD COLUMN failure_summary TEXT NOT NULL DEFAULT '';
ALTER TABLE generation_jobs ADD COLUMN retry_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE generation_jobs ADD COLUMN trace_id TEXT NOT NULL DEFAULT '';
ALTER TABLE generation_jobs ADD COLUMN next_eligible_retry TEXT NOT NULL DEFAULT '';

CREATE INDEX IF NOT EXISTS idx_entity_canonical_type ON entity_canonical_state(game_id,canonical_type,validation_status);
CREATE INDEX IF NOT EXISTS idx_entity_consistency_entity ON entity_consistency_events(entity_id,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generation_jobs_failure_stage ON generation_jobs(status,failure_stage,updated_at DESC);

-- Explicitly repair entity-type conflicts observed during real Beta 0.86 testing.
UPDATE entities
SET type='transformation', updated_at=datetime('now')
WHERE lower(name) IN ('hyper sonic','super sonic','super tails','super knuckles','hyper knuckles')
  AND lower(type) IN ('mechanic','character','unknown','other');

UPDATE entities
SET type='currency', updated_at=datetime('now')
WHERE lower(name)='robux' AND lower(type)<>'currency';

-- Preserve articles but remove known wrong public classification.
UPDATE articles
SET article_type='TRANSFORMATION', status=CASE WHEN status='PUBLISHED' THEN 'NEEDS_REVIEW' ELSE status END, updated_at=datetime('now')
WHERE entity_id IN (SELECT id FROM entities WHERE lower(name) IN ('hyper sonic','super sonic','super tails','super knuckles','hyper knuckles'));

UPDATE articles
SET article_type='CURRENCY', status=CASE WHEN status='PUBLISHED' THEN 'NEEDS_REVIEW' ELSE status END, updated_at=datetime('now')
WHERE entity_id IN (SELECT id FROM entities WHERE lower(name)='robux');

-- Finish the public rebrand for current article titles without touching historical release notes.
UPDATE articles SET title=replace(title,'GameVault','GameIndex'), updated_at=datetime('now') WHERE title LIKE '%GameVault%';

-- Preserve generic Beta 0.65 seed text for audit/history but remove it from trusted-current status.
UPDATE knowledge SET status='NEEDS_REVIEW', updated_at=datetime('now')
WHERE status IN ('CURRENT','VALIDATED') AND (
  lower(summary) LIKE '%is a player-relevant topic in%'
  OR lower(summary) LIKE '%the useful questions are%'
  OR lower(summary) LIKE '%should be understood together with%'
  OR lower(summary) LIKE '%this entry exists to%'
  OR lower(summary) LIKE '%for a player studying%'
);

-- Normalize live Autogen states from Beta 0.86 without deleting any candidates/jobs.
UPDATE autonomous_generation_queue SET status='WAITING_FOR_RESEARCH',updated_at=datetime('now') WHERE status='NEEDS_RESEARCH';
UPDATE autogen_knowledge_states SET state='WAITING_FOR_RESEARCH',updated_at=datetime('now') WHERE state='NEEDS_RESEARCH';

-- Annotate late legacy failures so the Admin can explain them instead of showing a wall of FAILED.
UPDATE generation_jobs SET
  failure_stage=CASE WHEN failure_stage='' THEN 'LEGACY_BETA_086_LATE_BUILD' ELSE failure_stage END,
  failure_summary=CASE WHEN failure_summary='' THEN COALESCE(NULLIF(error_code,''),'Legacy Beta 0.86 generation failure') ELSE failure_summary END
WHERE status='FAILED' AND progress>=80;

-- Seed the canonical source of truth from existing records after the targeted fixes.
INSERT INTO entity_canonical_state(entity_id,game_id,canonical_type,confidence,validation_status,source,reason,updated_at)
SELECT id,game_id,
  CASE lower(type)
    WHEN 'character' THEN 'CHARACTER'
    WHEN 'transformation' THEN 'TRANSFORMATION'
    WHEN 'form' THEN 'TRANSFORMATION'
    WHEN 'ability' THEN 'ABILITY'
    WHEN 'power' THEN 'POWER'
    WHEN 'weapon' THEN 'WEAPON'
    WHEN 'item' THEN 'ITEM'
    WHEN 'tool' THEN 'TOOL'
    WHEN 'armor' THEN 'ARMOR'
    WHEN 'material' THEN 'MATERIAL'
    WHEN 'resource' THEN 'RESOURCE'
    WHEN 'mob' THEN 'MOB'
    WHEN 'boss' THEN 'BOSS'
    WHEN 'npc' THEN 'NPC'
    WHEN 'location' THEN 'LOCATION'
    WHEN 'map' THEN 'MAP'
    WHEN 'biome' THEN 'BIOME'
    WHEN 'structure' THEN 'STRUCTURE'
    WHEN 'vehicle' THEN 'VEHICLE'
    WHEN 'faction' THEN 'FACTION'
    WHEN 'quest' THEN 'QUEST'
    WHEN 'mission' THEN 'MISSION'
    WHEN 'mechanic' THEN 'MECHANIC'
    WHEN 'mode' THEN 'MODE'
    WHEN 'season' THEN 'SEASON'
    WHEN 'chapter' THEN 'CHAPTER'
    WHEN 'lore-topic' THEN 'LORE_EVENT'
    WHEN 'lore_event' THEN 'LORE_EVENT'
    WHEN 'status_effect' THEN 'STATUS_EFFECT'
    WHEN 'guide' THEN 'GUIDE_TOPIC'
    WHEN 'guide_topic' THEN 'GUIDE_TOPIC'
    WHEN 'currency' THEN 'CURRENCY'
    WHEN 'system' THEN 'SYSTEM'
    WHEN 'technology' THEN 'TECHNOLOGY'
    ELSE 'OTHER'
  END,
  CASE WHEN lower(type) IN ('unknown','other','concept') THEN 0.45 ELSE 0.76 END,
  CASE WHEN lower(type) IN ('unknown','other','concept') THEN 'CANDIDATE' ELSE 'VALIDATED' END,
  'BETA_087_MIGRATION',
  'Canonicalized from preserved entity record',
  datetime('now')
FROM entities
WHERE 1=1
ON CONFLICT(entity_id) DO UPDATE SET
  game_id=excluded.game_id,
  canonical_type=CASE
    WHEN entity_canonical_state.validation_status='MANUAL_VALIDATED' THEN entity_canonical_state.canonical_type
    ELSE excluded.canonical_type
  END,
  confidence=CASE
    WHEN entity_canonical_state.validation_status='MANUAL_VALIDATED' THEN entity_canonical_state.confidence
    ELSE MAX(entity_canonical_state.confidence,excluded.confidence)
  END,
  updated_at=excluded.updated_at;

INSERT INTO update_log_entries(version,title,codename,release_date,sections_json,tags_json,public,created_at)
VALUES(
  '0.87',
  'GameIndex Beta 0.87',
  'Stability & Integration',
  '2026-08-18',
  '{"FIXED":["Dexter AI pipeline integration and metric semantics","Semantic Review result classification","Autonomous generation state handling and early knowledge gating","Entity type consistency across Dexter, Autogen and Articles","Construction AI monitoring","Image resolution and persistence fallback","Legacy GameVault AI reporting"],"NEW":["Database Explorer V1","Entity Consistency diagnostics","Pipeline Information Loss diagnostics","Improved administrative audit tooling"],"IMPROVED":["AI Control Center","Trace Inspector","Autogen failure diagnostics","Image Memory diagnostics","Article review","Admin observability"]}',
  '["FIXED","NEW","IMPROVED","AI","AUTOGEN","DEV"]',
  1,
  datetime('now')
)
ON CONFLICT(version) DO UPDATE SET title=excluded.title,codename=excluded.codename,release_date=excluded.release_date,sections_json=excluded.sections_json,tags_json=excluded.tags_json,public=excluded.public;

INSERT INTO meta(key,value) VALUES('beta_087_stability_integration','1') ON CONFLICT(key) DO UPDATE SET value='1';
INSERT INTO meta(key,value) VALUES('beta_087_database_explorer','1') ON CONFLICT(key) DO UPDATE SET value='1';
INSERT INTO meta(key,value) VALUES('beta_087_canonical_entities','1') ON CONFLICT(key) DO UPDATE SET value='1';
INSERT INTO meta(key,value) VALUES('beta_087_autogen_state_v3','1') ON CONFLICT(key) DO UPDATE SET value='1';
