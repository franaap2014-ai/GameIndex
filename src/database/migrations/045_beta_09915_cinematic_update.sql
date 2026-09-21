PRAGMA foreign_keys = ON;
-- GameIndex Beta 0.9915 — Cinematic Update
-- Additive migration only. Existing users, profiles, social data, games, universes, cinematics and bugs are preserved.

CREATE TABLE IF NOT EXISTS profile_avatar_catalog (
  id TEXT PRIMARY KEY,
  avatar_key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  class TEXT NOT NULL CHECK(class IN ('FREE','PRO','TESTER','DEV','CREATOR')),
  asset_url TEXT NOT NULL DEFAULT '',
  accent_color TEXT NOT NULL DEFAULT '',
  style_tags_json TEXT NOT NULL DEFAULT '[]',
  dominant_class_color INTEGER NOT NULL DEFAULT 0 CHECK(dominant_class_color IN (0,1)),
  enabled INTEGER NOT NULL DEFAULT 1 CHECK(enabled IN (0,1)),
  built_in INTEGER NOT NULL DEFAULT 1 CHECK(built_in IN (0,1)),
  placeholder INTEGER NOT NULL DEFAULT 1 CHECK(placeholder IN (0,1)),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
) STRICT;
CREATE INDEX IF NOT EXISTS idx_profile_avatar_class ON profile_avatar_catalog(class,enabled,sort_order);

CREATE TABLE IF NOT EXISTS user_profile_avatar_selections (
  user_id TEXT PRIMARY KEY,
  avatar_id TEXT NOT NULL,
  selected_at TEXT NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY(avatar_id) REFERENCES profile_avatar_catalog(id) ON DELETE RESTRICT
) STRICT;

CREATE TABLE IF NOT EXISTS user_favorite_games (
  user_id TEXT NOT NULL,
  game_id TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  PRIMARY KEY(user_id,game_id),
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY(game_id) REFERENCES games(id) ON DELETE CASCADE
) STRICT;
CREATE INDEX IF NOT EXISTS idx_user_favorite_games_user ON user_favorite_games(user_id,sort_order,created_at DESC);

CREATE TABLE IF NOT EXISTS social_community_profiles (
  community_id TEXT PRIMARY KEY,
  profile_image_url TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'GAMES',
  visual_accent TEXT NOT NULL DEFAULT '',
  updated_by TEXT,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(community_id) REFERENCES social_communities(id) ON DELETE CASCADE,
  FOREIGN KEY(updated_by) REFERENCES users(id) ON DELETE SET NULL
) STRICT;

CREATE TABLE IF NOT EXISTS game_cutscene_bindings (
  game_id TEXT PRIMARY KEY,
  animation_project_id TEXT,
  active_revision INTEGER NOT NULL DEFAULT 0,
  binding_status TEXT NOT NULL DEFAULT 'FALLBACK' CHECK(binding_status IN ('FALLBACK','DRAFT','PUBLISHED','UNPUBLISHED')),
  entry_mode TEXT NOT NULL DEFAULT 'GAME_ENTRY',
  max_duration_ms INTEGER NOT NULL DEFAULT 2000 CHECK(max_duration_ms BETWEEN 250 AND 2500),
  updated_by TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(game_id) REFERENCES games(id) ON DELETE CASCADE,
  FOREIGN KEY(animation_project_id) REFERENCES animation_projects(id) ON DELETE SET NULL,
  FOREIGN KEY(updated_by) REFERENCES users(id) ON DELETE SET NULL
) STRICT;
CREATE INDEX IF NOT EXISTS idx_game_cutscene_status ON game_cutscene_bindings(binding_status,updated_at DESC);

CREATE TABLE IF NOT EXISTS cinematic_test_runs (
  id TEXT PRIMARY KEY,
  actor_user_id TEXT,
  animation_project_id TEXT,
  game_id TEXT,
  scenario TEXT NOT NULL DEFAULT 'CUSTOM',
  viewport TEXT NOT NULL DEFAULT 'DESKTOP',
  identity TEXT NOT NULL DEFAULT 'FREE',
  theme TEXT NOT NULL DEFAULT 'FREE_DARK',
  reduced_motion INTEGER NOT NULL DEFAULT 0 CHECK(reduced_motion IN (0,1)),
  duration_ms INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  FOREIGN KEY(actor_user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY(animation_project_id) REFERENCES animation_projects(id) ON DELETE SET NULL,
  FOREIGN KEY(game_id) REFERENCES games(id) ON DELETE SET NULL
) STRICT;
CREATE INDEX IF NOT EXISTS idx_cinematic_test_actor ON cinematic_test_runs(actor_user_id,created_at DESC);

INSERT INTO profile_avatar_catalog(
  id,avatar_key,name,class,asset_url,accent_color,style_tags_json,dominant_class_color,enabled,built_in,placeholder,sort_order,created_at,updated_at
) VALUES
('avatar_free_01','free_01','FREE 01','FREE','/assets/profile-avatars/free.svg','#f4f4f2','["PLACEHOLDER","GAMEINDEX","FREE","CLASS_COLOR"]',1,1,1,1,datetime('now'),datetime('now')),
('avatar_free_02','free_02','FREE 02','FREE','/assets/profile-avatars/free.svg','#f4f4f2','["PLACEHOLDER","GAMEINDEX","FREE","CLASS_COLOR"]',1,1,1,2,datetime('now'),datetime('now')),
('avatar_free_03','free_03','FREE 03','FREE','/assets/profile-avatars/free.svg','#f4f4f2','["PLACEHOLDER","GAMEINDEX","FREE","CLASS_COLOR"]',1,1,1,3,datetime('now'),datetime('now')),
('avatar_free_04','free_04','FREE 04','FREE','/assets/profile-avatars/free.svg','#f4f4f2','["PLACEHOLDER","GAMEINDEX","FREE","CLASS_COLOR"]',1,1,1,4,datetime('now'),datetime('now')),
('avatar_free_05','free_05','FREE 05','FREE','/assets/profile-avatars/free.svg','#f4f4f2','["PLACEHOLDER","GAMEINDEX","FREE","NEUTRAL"]',0,1,1,5,datetime('now'),datetime('now')),
('avatar_free_06','free_06','FREE 06','FREE','/assets/profile-avatars/free.svg','#f4f4f2','["PLACEHOLDER","GAMEINDEX","FREE","NEUTRAL"]',0,1,1,6,datetime('now'),datetime('now')),
('avatar_free_07','free_07','FREE 07','FREE','/assets/profile-avatars/free.svg','#f4f4f2','["PLACEHOLDER","GAMEINDEX","FREE","NEUTRAL"]',0,1,1,7,datetime('now'),datetime('now')),
('avatar_free_08','free_08','FREE 08','FREE','/assets/profile-avatars/free.svg','#f4f4f2','["PLACEHOLDER","GAMEINDEX","FREE","NEUTRAL"]',0,1,1,8,datetime('now'),datetime('now')),
('avatar_free_09','free_09','FREE 09','FREE','/assets/profile-avatars/free.svg','#f4f4f2','["PLACEHOLDER","GAMEINDEX","FREE","NEUTRAL"]',0,1,1,9,datetime('now'),datetime('now')),
('avatar_free_10','free_10','FREE 10','FREE','/assets/profile-avatars/free.svg','#f4f4f2','["PLACEHOLDER","GAMEINDEX","FREE","NEUTRAL"]',0,1,1,10,datetime('now'),datetime('now')),
('avatar_pro_01','pro_01','PRO 01','PRO','/assets/profile-avatars/pro.svg','#63e69a','["PLACEHOLDER","GAMEINDEX","PRO","CLASS_COLOR"]',1,1,1,1,datetime('now'),datetime('now')),
('avatar_pro_02','pro_02','PRO 02','PRO','/assets/profile-avatars/pro.svg','#63e69a','["PLACEHOLDER","GAMEINDEX","PRO","CLASS_COLOR"]',1,1,1,2,datetime('now'),datetime('now')),
('avatar_pro_03','pro_03','PRO 03','PRO','/assets/profile-avatars/pro.svg','#63e69a','["PLACEHOLDER","GAMEINDEX","PRO","CLASS_COLOR"]',1,1,1,3,datetime('now'),datetime('now')),
('avatar_pro_04','pro_04','PRO 04','PRO','/assets/profile-avatars/pro.svg','#63e69a','["PLACEHOLDER","GAMEINDEX","PRO","CLASS_COLOR"]',1,1,1,4,datetime('now'),datetime('now')),
('avatar_pro_05','pro_05','PRO 05','PRO','/assets/profile-avatars/pro.svg','#63e69a','["PLACEHOLDER","GAMEINDEX","PRO","NEUTRAL"]',0,1,1,5,datetime('now'),datetime('now')),
('avatar_pro_06','pro_06','PRO 06','PRO','/assets/profile-avatars/pro.svg','#63e69a','["PLACEHOLDER","GAMEINDEX","PRO","NEUTRAL"]',0,1,1,6,datetime('now'),datetime('now')),
('avatar_pro_07','pro_07','PRO 07','PRO','/assets/profile-avatars/pro.svg','#63e69a','["PLACEHOLDER","GAMEINDEX","PRO","NEUTRAL"]',0,1,1,7,datetime('now'),datetime('now')),
('avatar_pro_08','pro_08','PRO 08','PRO','/assets/profile-avatars/pro.svg','#63e69a','["PLACEHOLDER","GAMEINDEX","PRO","NEUTRAL"]',0,1,1,8,datetime('now'),datetime('now')),
('avatar_pro_09','pro_09','PRO 09','PRO','/assets/profile-avatars/pro.svg','#63e69a','["PLACEHOLDER","GAMEINDEX","PRO","NEUTRAL"]',0,1,1,9,datetime('now'),datetime('now')),
('avatar_pro_10','pro_10','PRO 10','PRO','/assets/profile-avatars/pro.svg','#63e69a','["PLACEHOLDER","GAMEINDEX","PRO","NEUTRAL"]',0,1,1,10,datetime('now'),datetime('now')),
('avatar_tester_01','tester_01','TESTER 01','TESTER','/assets/profile-avatars/tester.svg','#58a6ff','["PLACEHOLDER","GAMEINDEX","TESTER","CLASS_COLOR"]',1,1,1,1,datetime('now'),datetime('now')),
('avatar_tester_02','tester_02','TESTER 02','TESTER','/assets/profile-avatars/tester.svg','#58a6ff','["PLACEHOLDER","GAMEINDEX","TESTER","CLASS_COLOR"]',1,1,1,2,datetime('now'),datetime('now')),
('avatar_tester_03','tester_03','TESTER 03','TESTER','/assets/profile-avatars/tester.svg','#58a6ff','["PLACEHOLDER","GAMEINDEX","TESTER","CLASS_COLOR"]',1,1,1,3,datetime('now'),datetime('now')),
('avatar_tester_04','tester_04','TESTER 04','TESTER','/assets/profile-avatars/tester.svg','#58a6ff','["PLACEHOLDER","GAMEINDEX","TESTER","CLASS_COLOR"]',1,1,1,4,datetime('now'),datetime('now')),
('avatar_tester_05','tester_05','TESTER 05','TESTER','/assets/profile-avatars/tester.svg','#58a6ff','["PLACEHOLDER","GAMEINDEX","TESTER","NEUTRAL"]',0,1,1,5,datetime('now'),datetime('now')),
('avatar_tester_06','tester_06','TESTER 06','TESTER','/assets/profile-avatars/tester.svg','#58a6ff','["PLACEHOLDER","GAMEINDEX","TESTER","NEUTRAL"]',0,1,1,6,datetime('now'),datetime('now')),
('avatar_tester_07','tester_07','TESTER 07','TESTER','/assets/profile-avatars/tester.svg','#58a6ff','["PLACEHOLDER","GAMEINDEX","TESTER","NEUTRAL"]',0,1,1,7,datetime('now'),datetime('now')),
('avatar_tester_08','tester_08','TESTER 08','TESTER','/assets/profile-avatars/tester.svg','#58a6ff','["PLACEHOLDER","GAMEINDEX","TESTER","NEUTRAL"]',0,1,1,8,datetime('now'),datetime('now')),
('avatar_tester_09','tester_09','TESTER 09','TESTER','/assets/profile-avatars/tester.svg','#58a6ff','["PLACEHOLDER","GAMEINDEX","TESTER","NEUTRAL"]',0,1,1,9,datetime('now'),datetime('now')),
('avatar_tester_10','tester_10','TESTER 10','TESTER','/assets/profile-avatars/tester.svg','#58a6ff','["PLACEHOLDER","GAMEINDEX","TESTER","NEUTRAL"]',0,1,1,10,datetime('now'),datetime('now')),
('avatar_dev_01','dev_01','DEV 01','DEV','/assets/profile-avatars/dev.svg','#ff6674','["PLACEHOLDER","GAMEINDEX","DEV","CLASS_COLOR"]',1,1,1,1,datetime('now'),datetime('now')),
('avatar_dev_02','dev_02','DEV 02','DEV','/assets/profile-avatars/dev.svg','#ff6674','["PLACEHOLDER","GAMEINDEX","DEV","CLASS_COLOR"]',1,1,1,2,datetime('now'),datetime('now')),
('avatar_dev_03','dev_03','DEV 03','DEV','/assets/profile-avatars/dev.svg','#ff6674','["PLACEHOLDER","GAMEINDEX","DEV","CLASS_COLOR"]',1,1,1,3,datetime('now'),datetime('now')),
('avatar_dev_04','dev_04','DEV 04','DEV','/assets/profile-avatars/dev.svg','#ff6674','["PLACEHOLDER","GAMEINDEX","DEV","CLASS_COLOR"]',1,1,1,4,datetime('now'),datetime('now')),
('avatar_dev_05','dev_05','DEV 05','DEV','/assets/profile-avatars/dev.svg','#ff6674','["PLACEHOLDER","GAMEINDEX","DEV","NEUTRAL"]',0,1,1,5,datetime('now'),datetime('now')),
('avatar_dev_06','dev_06','DEV 06','DEV','/assets/profile-avatars/dev.svg','#ff6674','["PLACEHOLDER","GAMEINDEX","DEV","NEUTRAL"]',0,1,1,6,datetime('now'),datetime('now')),
('avatar_dev_07','dev_07','DEV 07','DEV','/assets/profile-avatars/dev.svg','#ff6674','["PLACEHOLDER","GAMEINDEX","DEV","NEUTRAL"]',0,1,1,7,datetime('now'),datetime('now')),
('avatar_dev_08','dev_08','DEV 08','DEV','/assets/profile-avatars/dev.svg','#ff6674','["PLACEHOLDER","GAMEINDEX","DEV","NEUTRAL"]',0,1,1,8,datetime('now'),datetime('now')),
('avatar_dev_09','dev_09','DEV 09','DEV','/assets/profile-avatars/dev.svg','#ff6674','["PLACEHOLDER","GAMEINDEX","DEV","NEUTRAL"]',0,1,1,9,datetime('now'),datetime('now')),
('avatar_dev_10','dev_10','DEV 10','DEV','/assets/profile-avatars/dev.svg','#ff6674','["PLACEHOLDER","GAMEINDEX","DEV","NEUTRAL"]',0,1,1,10,datetime('now'),datetime('now')),
('avatar_creator_01','creator_01','CREATOR 01','CREATOR','/assets/profile-avatars/creator.svg','#e7bd5b','["PLACEHOLDER","GAMEINDEX","CREATOR","CLASS_COLOR"]',1,1,1,1,datetime('now'),datetime('now')),
('avatar_creator_02','creator_02','CREATOR 02','CREATOR','/assets/profile-avatars/creator.svg','#e7bd5b','["PLACEHOLDER","GAMEINDEX","CREATOR","CLASS_COLOR"]',1,1,1,2,datetime('now'),datetime('now')),
('avatar_creator_03','creator_03','CREATOR 03','CREATOR','/assets/profile-avatars/creator.svg','#e7bd5b','["PLACEHOLDER","GAMEINDEX","CREATOR","CLASS_COLOR"]',1,1,1,3,datetime('now'),datetime('now')),
('avatar_creator_04','creator_04','CREATOR 04','CREATOR','/assets/profile-avatars/creator.svg','#e7bd5b','["PLACEHOLDER","GAMEINDEX","CREATOR","CLASS_COLOR"]',1,1,1,4,datetime('now'),datetime('now')),
('avatar_creator_05','creator_05','CREATOR 05','CREATOR','/assets/profile-avatars/creator.svg','#e7bd5b','["PLACEHOLDER","GAMEINDEX","CREATOR","NEUTRAL"]',0,1,1,5,datetime('now'),datetime('now')),
('avatar_creator_06','creator_06','CREATOR 06','CREATOR','/assets/profile-avatars/creator.svg','#e7bd5b','["PLACEHOLDER","GAMEINDEX","CREATOR","NEUTRAL"]',0,1,1,6,datetime('now'),datetime('now')),
('avatar_creator_07','creator_07','CREATOR 07','CREATOR','/assets/profile-avatars/creator.svg','#e7bd5b','["PLACEHOLDER","GAMEINDEX","CREATOR","NEUTRAL"]',0,1,1,7,datetime('now'),datetime('now')),
('avatar_creator_08','creator_08','CREATOR 08','CREATOR','/assets/profile-avatars/creator.svg','#e7bd5b','["PLACEHOLDER","GAMEINDEX","CREATOR","NEUTRAL"]',0,1,1,8,datetime('now'),datetime('now')),
('avatar_creator_09','creator_09','CREATOR 09','CREATOR','/assets/profile-avatars/creator.svg','#e7bd5b','["PLACEHOLDER","GAMEINDEX","CREATOR","NEUTRAL"]',0,1,1,9,datetime('now'),datetime('now')),
('avatar_creator_10','creator_10','CREATOR 10','CREATOR','/assets/profile-avatars/creator.svg','#e7bd5b','["PLACEHOLDER","GAMEINDEX","CREATOR","NEUTRAL"]',0,1,1,10,datetime('now'),datetime('now'))
ON CONFLICT(avatar_key) DO UPDATE SET
  name=excluded.name,
  class=excluded.class,
  asset_url=excluded.asset_url,
  accent_color=excluded.accent_color,
  style_tags_json=excluded.style_tags_json,
  dominant_class_color=excluded.dominant_class_color,
  enabled=excluded.enabled,
  built_in=excluded.built_in,
  placeholder=excluded.placeholder,
  sort_order=excluded.sort_order,
  updated_at=excluded.updated_at;

INSERT INTO update_log_entries(version,title,codename,release_date,sections_json,tags_json,public,created_at)
VALUES(
  '0.9915','GameIndex Beta 0.9915','Cinematic Update','2026-09-21',
  '{"RESUMO":["Novo sistema de cinematics e transições","Perfis redesenhados","Social renovado","Comunidades mais fáceis de criar","Jogos favoritos","Nova biblioteca de fotos de perfil","Navegação visual mais limpa","Cutscenes curtas para páginas de jogos"],"NOVO":["Cinematic Test Lab","Jogos Favoritos","Biblioteca de avatares por classe","Vínculos de cutscene de entrada por jogo"],"MELHORADO":["Cinematic Editor mais simples","Perfis e amigos","Mensagens","Showcase para novos usuários","Update Log","Relato de problemas"],"VISUAL":["Novo header integrado","Identidade por classe","Microtransições por jogo","Preview cinematográfico 16:9"],"SOCIAL":["Novo visual do Social","Fluxo de comunidades","Conversas diretas mais fáceis"],"CORRIGIDO":["Detalhes internos não aparecem na experiência pública","Versão pública mostra apenas Beta 0.9915"],"PERFORMANCE":["Cutscenes curtas com fallback","Assets cinematográficos carregados somente quando necessários"]}',
  '["CINEMATIC_UPDATE","PROFILE","SOCIAL","FAVORITES","CUTSCENES","PUBLIC_CLEANUP"]',
  1,datetime('now')
)
ON CONFLICT(version) DO UPDATE SET
  title=excluded.title,
  codename=excluded.codename,
  release_date=excluded.release_date,
  sections_json=excluded.sections_json,
  tags_json=excluded.tags_json,
  public=excluded.public;

INSERT INTO meta(key,value) VALUES('runtime_version','0.9915')
ON CONFLICT(key) DO UPDATE SET value=excluded.value;
INSERT INTO meta(key,value) VALUES('runtime_release','BETA_0_9915_CINEMATIC_UPDATE')
ON CONFLICT(key) DO UPDATE SET value=excluded.value;
INSERT INTO meta(key,value) VALUES('beta_09915','1')
ON CONFLICT(key) DO UPDATE SET value='1';
