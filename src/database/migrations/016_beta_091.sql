-- GameIndex Beta 0.91 — Acesso & Image Studio
-- Migração aditiva e idempotente. Preserva integralmente a Beta 0.9.

CREATE TABLE IF NOT EXISTS manual_image_uploads (
  id TEXT PRIMARY KEY,
  image_id TEXT NOT NULL,
  game_id TEXT NOT NULL,
  user_id TEXT,
  role TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  source_url TEXT NOT NULL DEFAULT '',
  license_info TEXT NOT NULL DEFAULT '',
  original_filename TEXT NOT NULL DEFAULT '',
  mime_type TEXT NOT NULL,
  file_size INTEGER NOT NULL DEFAULT 0,
  confirmation_no_people INTEGER NOT NULL DEFAULT 0 CHECK(confirmation_no_people IN (0,1)),
  visual_policy TEXT NOT NULL DEFAULT 'NO_PEOPLE_NO_WOMEN',
  status TEXT NOT NULL DEFAULT 'SAVED',
  created_at TEXT NOT NULL,
  FOREIGN KEY(image_id) REFERENCES images(id) ON DELETE CASCADE,
  FOREIGN KEY(game_id) REFERENCES games(id) ON DELETE CASCADE,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL
) STRICT;

CREATE INDEX IF NOT EXISTS idx_manual_image_uploads_game ON manual_image_uploads(game_id,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_manual_image_uploads_user ON manual_image_uploads(user_id,created_at DESC);

UPDATE images SET pipeline_version='0.91'
WHERE provenance_state='MANUAL_ADMIN_CONFIRMED';

INSERT INTO update_log_entries(version,title,codename,release_date,sections_json,tags_json,public,created_at)
VALUES(
  '0.91',
  'GameIndex Beta 0.91',
  'Acesso & Image Studio',
  '2026-08-20',
  '{"NEW":["Image Studio dentro da página do jogo","Histórico persistente de uploads","Diagnóstico visível da conta Franchesco01","Rotas /api/beta091"],"FIXED":["Botões DEV escondidos após 403","Imagem manual nova sem prioridade garantida","Deduplicação cruzada entre jogos","Erro de API sem status no navegador"],"IMPROVED":["Recuperação segura ADMIN + DEV","Upload PNG/JPEG/WebP salvo como BLOB","Compatibilidade total com rotas Beta 0.9","Persistência Azure HOME"]}',
  '["NEW","FIXED","AUTH","PAGES","IMAGES","AZURE","NO_API_KEY"]',
  1,
  datetime('now')
)
ON CONFLICT(version) DO UPDATE SET title=excluded.title,codename=excluded.codename,release_date=excluded.release_date,sections_json=excluded.sections_json,tags_json=excluded.tags_json,public=excluded.public;

INSERT INTO meta(key,value) VALUES('beta_091_access_image_studio','1') ON CONFLICT(key) DO UPDATE SET value='1';
INSERT INTO meta(key,value) VALUES('beta_091_preserves_beta_09','1') ON CONFLICT(key) DO UPDATE SET value='1';
INSERT INTO meta(key,value) VALUES('beta_091_no_api_key','1') ON CONFLICT(key) DO UPDATE SET value='1';
INSERT INTO meta(key,value) VALUES('beta_091_visual_policy','NO_PEOPLE_NO_WOMEN') ON CONFLICT(key) DO UPDATE SET value='NO_PEOPLE_NO_WOMEN';
