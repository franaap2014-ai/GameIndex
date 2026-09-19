-- GameIndex Beta 0.92 — Construction System
-- Migração aditiva e idempotente. Preserva integralmente a Beta 0.91.

CREATE TABLE IF NOT EXISTS construction_runs (
  id TEXT PRIMARY KEY,
  request_id TEXT NOT NULL,
  user_id TEXT,
  game_id TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'pt-BR',
  research_mode TEXT NOT NULL DEFAULT 'DEEP',
  publish_mode TEXT NOT NULL DEFAULT 'PREVIEW_ONLY',
  include_images INTEGER NOT NULL DEFAULT 0 CHECK(include_images IN (0,1)),
  demo_mode INTEGER NOT NULL DEFAULT 0 CHECK(demo_mode IN (0,1)),
  status TEXT NOT NULL DEFAULT 'PREFLIGHT',
  current_stage TEXT NOT NULL DEFAULT 'PREFLIGHT',
  progress INTEGER NOT NULL DEFAULT 0,
  total_items INTEGER NOT NULL DEFAULT 0,
  completed_items INTEGER NOT NULL DEFAULT 0,
  failed_items INTEGER NOT NULL DEFAULT 0,
  blocked_items INTEGER NOT NULL DEFAULT 0,
  retry_scheduled_items INTEGER NOT NULL DEFAULT 0,
  plan_json TEXT NOT NULL DEFAULT '[]',
  packet_id TEXT NOT NULL DEFAULT '',
  trace_id TEXT NOT NULL DEFAULT '',
  idempotency_key TEXT NOT NULL,
  error_code TEXT NOT NULL DEFAULT '',
  error_message TEXT NOT NULL DEFAULT '',
  error_component TEXT NOT NULL DEFAULT '',
  error_retryable INTEGER NOT NULL DEFAULT 0 CHECK(error_retryable IN (0,1)),
  suggested_action TEXT NOT NULL DEFAULT '',
  pause_requested INTEGER NOT NULL DEFAULT 0 CHECK(pause_requested IN (0,1)),
  cancel_requested INTEGER NOT NULL DEFAULT 0 CHECK(cancel_requested IN (0,1)),
  lease_owner TEXT NOT NULL DEFAULT '',
  lease_expires_at TEXT NOT NULL DEFAULT '',
  pipeline_version TEXT NOT NULL DEFAULT '0.92',
  created_at TEXT NOT NULL,
  started_at TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL,
  completed_at TEXT NOT NULL DEFAULT '',
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY(game_id) REFERENCES games(id) ON DELETE CASCADE
) STRICT;

CREATE TABLE IF NOT EXISTS construction_items (
  id TEXT PRIMARY KEY,
  run_id TEXT NOT NULL,
  entity_id TEXT,
  page_type TEXT NOT NULL DEFAULT 'GAME',
  sequence INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'PLANNED',
  current_stage TEXT NOT NULL DEFAULT 'PLANNING',
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  generation_job_id TEXT NOT NULL DEFAULT '',
  result_page_id TEXT,
  result_image_ids_json TEXT NOT NULL DEFAULT '[]',
  image_status TEXT NOT NULL DEFAULT 'PENDING',
  image_error_code TEXT NOT NULL DEFAULT '',
  error_code TEXT NOT NULL DEFAULT '',
  error_message TEXT NOT NULL DEFAULT '',
  error_component TEXT NOT NULL DEFAULT '',
  error_retryable INTEGER NOT NULL DEFAULT 0 CHECK(error_retryable IN (0,1)),
  error_fingerprint TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  started_at TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL,
  completed_at TEXT NOT NULL DEFAULT '',
  FOREIGN KEY(run_id) REFERENCES construction_runs(id) ON DELETE CASCADE,
  FOREIGN KEY(entity_id) REFERENCES entities(id) ON DELETE SET NULL,
  FOREIGN KEY(result_page_id) REFERENCES pages(id) ON DELETE SET NULL,
  UNIQUE(run_id,sequence)
) STRICT;

CREATE TABLE IF NOT EXISTS construction_events (
  id TEXT PRIMARY KEY,
  run_id TEXT NOT NULL,
  item_id TEXT,
  sequence INTEGER NOT NULL,
  request_id TEXT NOT NULL,
  component TEXT NOT NULL,
  stage TEXT NOT NULL,
  status TEXT NOT NULL,
  attempt INTEGER NOT NULL DEFAULT 0,
  duration_ms INTEGER NOT NULL DEFAULT 0,
  error_code TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL DEFAULT '',
  details_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  FOREIGN KEY(run_id) REFERENCES construction_runs(id) ON DELETE CASCADE,
  FOREIGN KEY(item_id) REFERENCES construction_items(id) ON DELETE CASCADE,
  UNIQUE(run_id,sequence)
) STRICT;

CREATE TABLE IF NOT EXISTS construction_attempts (
  id TEXT PRIMARY KEY,
  run_id TEXT NOT NULL,
  item_id TEXT NOT NULL,
  stage TEXT NOT NULL,
  attempt INTEGER NOT NULL,
  status TEXT NOT NULL,
  error_code TEXT NOT NULL DEFAULT '',
  error_message TEXT NOT NULL DEFAULT '',
  retryable INTEGER NOT NULL DEFAULT 0 CHECK(retryable IN (0,1)),
  started_at TEXT NOT NULL,
  completed_at TEXT NOT NULL DEFAULT '',
  duration_ms INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY(run_id) REFERENCES construction_runs(id) ON DELETE CASCADE,
  FOREIGN KEY(item_id) REFERENCES construction_items(id) ON DELETE CASCADE,
  UNIQUE(item_id,stage,attempt)
) STRICT;

CREATE INDEX IF NOT EXISTS idx_construction_runs_game ON construction_runs(game_id,language,updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_construction_runs_status ON construction_runs(status,updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_construction_runs_user ON construction_runs(user_id,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_construction_items_run ON construction_items(run_id,sequence);
CREATE INDEX IF NOT EXISTS idx_construction_items_status ON construction_items(run_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_construction_events_run ON construction_events(run_id,sequence);
CREATE INDEX IF NOT EXISTS idx_construction_attempts_item ON construction_attempts(item_id,stage,attempt);

INSERT INTO update_log_entries(version,title,codename,release_date,sections_json,tags_json,public,created_at)
VALUES(
  '0.92',
  'GameIndex Beta 0.92',
  'Construction System',
  '2026-08-20',
  '{"NEW":["Construction System persistente","Preflight antes de criar itens","Pausa, retomada, cancelamento e reparo seletivo","Modo de demonstração rápida","Timeline e diagnóstico por item"],"FIXED":["Erro 500 sem envelope","25 falhas repetidas por causa sistêmica","Falha de imagem invalidando página pronta","Jobs abandonados após reinício","Polling duplicado"],"IMPROVED":["Pesquisa → Boss → Construction","Schema 17 backup-first","Execução item por item","Compatibilidade Azure Windows","Modo local-first sem chave"]}',
  '["NEW","FIXED","CONSTRUCTION","PAGES","IMAGES","AZURE","NO_API_KEY"]',
  1,
  datetime('now')
)
ON CONFLICT(version) DO UPDATE SET title=excluded.title,codename=excluded.codename,release_date=excluded.release_date,sections_json=excluded.sections_json,tags_json=excluded.tags_json,public=excluded.public;

INSERT INTO meta(key,value) VALUES('beta_092_construction_system','1') ON CONFLICT(key) DO UPDATE SET value='1';
INSERT INTO meta(key,value) VALUES('beta_092_preserves_beta_091','1') ON CONFLICT(key) DO UPDATE SET value='1';
INSERT INTO meta(key,value) VALUES('beta_092_no_api_key','1') ON CONFLICT(key) DO UPDATE SET value='1';
INSERT INTO meta(key,value) VALUES('beta_092_architecture','RESEARCH_TO_BOSS_TO_CONSTRUCTION') ON CONFLICT(key) DO UPDATE SET value='RESEARCH_TO_BOSS_TO_CONSTRUCTION';
INSERT INTO meta(key,value) VALUES('beta_092_visual_policy','NO_PEOPLE_NO_WOMEN') ON CONFLICT(key) DO UPDATE SET value='NO_PEOPLE_NO_WOMEN';
