-- GameIndex Beta 0.89 — Início Real
-- Migração estritamente aditiva: preserva jogos, contas, conhecimento, páginas e histórico.

CREATE TABLE IF NOT EXISTS generated_assets (
  id TEXT PRIMARY KEY,
  game_id TEXT NOT NULL,
  role TEXT NOT NULL,
  relative_path TEXT NOT NULL,
  mime_type TEXT NOT NULL DEFAULT 'image/svg+xml',
  checksum TEXT NOT NULL,
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  origin TEXT NOT NULL DEFAULT 'PROCEDURAL_SAFE',
  visual_policy TEXT NOT NULL DEFAULT 'NO_PEOPLE_NO_WOMEN',
  generator_version TEXT NOT NULL DEFAULT 'BETA_089_V1',
  status TEXT NOT NULL DEFAULT 'VALIDATED',
  verified INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(game_id, role, generator_version),
  FOREIGN KEY(game_id) REFERENCES games(id) ON DELETE CASCADE
) STRICT;

CREATE TABLE IF NOT EXISTS auth_audit (
  id TEXT PRIMARY KEY,
  event TEXT NOT NULL,
  outcome TEXT NOT NULL,
  actor_hash TEXT NOT NULL DEFAULT '',
  details_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL
) STRICT;

CREATE INDEX IF NOT EXISTS idx_generated_assets_game_role ON generated_assets(game_id,role,status);
CREATE INDEX IF NOT EXISTS idx_auth_audit_created ON auth_audit(created_at DESC);

INSERT INTO update_log_entries(version,title,codename,release_date,sections_json,tags_json,public,created_at)
VALUES(
  '0.89',
  'GameIndex Beta 0.89',
  'Início Real',
  '2026-08-20',
  '{"NEW":["Configuração segura do primeiro administrador","34 artes procedurais persistentes","Status Beta 0.89"],"FIXED":["Login com confirmação de sessão","Cards sem imagem","Execução sem chave externa"],"IMPROVED":["Persistência Azure HOME","Dexter local-first","Geração de páginas"]}',
  '["NEW","FIXED","IMPROVED","AUTH","IMAGES","AZURE","LOCAL_AI"]',
  1,
  datetime('now')
)
ON CONFLICT(version) DO UPDATE SET title=excluded.title,codename=excluded.codename,release_date=excluded.release_date,sections_json=excluded.sections_json,tags_json=excluded.tags_json,public=excluded.public;

INSERT INTO meta(key,value) VALUES('beta_089_inicio_real','1') ON CONFLICT(key) DO UPDATE SET value='1';
INSERT INTO meta(key,value) VALUES('beta_089_visual_policy','NO_PEOPLE_NO_WOMEN') ON CONFLICT(key) DO UPDATE SET value='NO_PEOPLE_NO_WOMEN';
INSERT INTO meta(key,value) VALUES('beta_089_local_ai','1') ON CONFLICT(key) DO UPDATE SET value='1';
INSERT INTO meta(key,value) VALUES('first_admin_setup_completed','0') ON CONFLICT(key) DO NOTHING;
