PRAGMA foreign_keys = ON;
-- GameIndex Beta 0.986 HF2 — AI Slim + Personalized Game Experiences
-- Additive migration only. No production users/games/content are removed.

CREATE TABLE IF NOT EXISTS game_parent_links (
  child_game_id TEXT PRIMARY KEY,
  parent_game_id TEXT NOT NULL,
  relation_type TEXT NOT NULL DEFAULT 'ROBLOX_EXPERIENCE',
  display_order INTEGER NOT NULL DEFAULT 0,
  enabled INTEGER NOT NULL DEFAULT 1 CHECK(enabled IN (0,1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(child_game_id) REFERENCES games(id) ON DELETE CASCADE,
  FOREIGN KEY(parent_game_id) REFERENCES games(id) ON DELETE CASCADE
) STRICT;
CREATE INDEX IF NOT EXISTS idx_game_parent_links_parent ON game_parent_links(parent_game_id,display_order,child_game_id);

CREATE TABLE IF NOT EXISTS game_experience_profiles (
  game_id TEXT NOT NULL,
  experience_key TEXT NOT NULL,
  experience_type TEXT NOT NULL DEFAULT 'GAME_VARIANT' CHECK(experience_type IN ('GAME_VARIANT','CHILD_GAME')),
  parent_game_id TEXT,
  slug TEXT NOT NULL DEFAULT '',
  label TEXT NOT NULL DEFAULT '',
  subtitle TEXT NOT NULL DEFAULT '',
  theme_json TEXT NOT NULL DEFAULT '{}',
  font_json TEXT NOT NULL DEFAULT '{}',
  menu_json TEXT NOT NULL DEFAULT '[]',
  music_slot TEXT NOT NULL DEFAULT 'main',
  logo_slot TEXT NOT NULL DEFAULT 'COVER',
  hero_slot TEXT NOT NULL DEFAULT 'HERO',
  background_slot TEXT NOT NULL DEFAULT 'PAGE_BACKGROUND',
  card_slot TEXT NOT NULL DEFAULT 'COVER',
  enabled INTEGER NOT NULL DEFAULT 1 CHECK(enabled IN (0,1)),
  updated_by TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY(game_id,experience_key),
  FOREIGN KEY(game_id) REFERENCES games(id) ON DELETE CASCADE,
  FOREIGN KEY(parent_game_id) REFERENCES games(id) ON DELETE SET NULL,
  FOREIGN KEY(updated_by) REFERENCES users(id) ON DELETE SET NULL
) STRICT;
CREATE INDEX IF NOT EXISTS idx_experience_profiles_parent ON game_experience_profiles(parent_game_id,experience_type,enabled);
CREATE INDEX IF NOT EXISTS idx_experience_profiles_slug ON game_experience_profiles(slug,enabled);

-- Runtime state is intentionally tiny and contains no prompts or private reasoning.
CREATE TABLE IF NOT EXISTS ai_runtime_counters (
  runtime_key TEXT PRIMARY KEY,
  completed_count INTEGER NOT NULL DEFAULT 0,
  failed_count INTEGER NOT NULL DEFAULT 0,
  total_duration_ms INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL
) STRICT;

INSERT INTO update_log_entries(version,title,codename,release_date,sections_json,tags_json,public,created_at)
VALUES(
  '0.986-HF2','GameIndex Beta 0.986 HF2','AI Slim + Personalized Game Experiences','2026-09-04',
  '{"NEW":["Game Experience Engine genérico","Roblox Hub com cinco experiências iniciais","Roblox Modern + OG 2009","Menus, tipografia, imagens e música por experiência","AI Runtime local compartilhado e lazy"],"FIXED":["Loop automático universal reforçado","Persistência de volume/mute entre experiências","Cache marker HF2","Rotas diretas das experiências Roblox"],"IMPROVED":["Music Manager com contexto de experiências","Universe Builder reconhece hierarquia Roblox","Performance: AI e workers pesados sob demanda"]}',
  '["HF2","AI_SLIM","GAME_EXPERIENCE_ENGINE","ROBLOX_HUB","UNIVERSAL_LOOP","LOCAL_FIRST"]',1,datetime('now')
)
ON CONFLICT(version) DO UPDATE SET title=excluded.title,codename=excluded.codename,release_date=excluded.release_date,sections_json=excluded.sections_json,tags_json=excluded.tags_json,public=excluded.public;

INSERT INTO meta(key,value) VALUES('beta_0986_hf2','1') ON CONFLICT(key) DO UPDATE SET value='1';
INSERT INTO meta(key,value) VALUES('runtime_hotfix','HF2_AI_SLIM_GAME_EXPERIENCES') ON CONFLICT(key) DO UPDATE SET value=excluded.value;
