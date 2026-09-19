-- GameIndex Beta 0.9 — Orquestração Total
-- Migração aditiva e idempotente. Nenhum dado anterior é removido.

ALTER TABLE developer_permissions ADD COLUMN page_generation INTEGER NOT NULL DEFAULT 0;
ALTER TABLE images ADD COLUMN people_state TEXT NOT NULL DEFAULT 'UNCERTAIN';
ALTER TABLE images ADD COLUMN visual_policy TEXT NOT NULL DEFAULT 'NO_PEOPLE_NO_WOMEN';
ALTER TABLE images ADD COLUMN provenance_state TEXT NOT NULL DEFAULT 'UNVERIFIED';
ALTER TABLE images ADD COLUMN pipeline_version TEXT NOT NULL DEFAULT '0.9';

CREATE TABLE IF NOT EXISTS research_packets (
  id TEXT PRIMARY KEY,
  request_id TEXT NOT NULL,
  trace_id TEXT NOT NULL,
  user_id TEXT,
  request_type TEXT NOT NULL,
  mode TEXT NOT NULL,
  language TEXT NOT NULL,
  game_id TEXT,
  entity_id TEXT,
  intent TEXT NOT NULL DEFAULT '',
  game_confidence REAL NOT NULL DEFAULT 0,
  entity_confidence REAL NOT NULL DEFAULT 0,
  intent_confidence REAL NOT NULL DEFAULT 0,
  missing_json TEXT NOT NULL DEFAULT '[]',
  conflicts_json TEXT NOT NULL DEFAULT '[]',
  metrics_json TEXT NOT NULL DEFAULT '{}',
  packet_version TEXT NOT NULL DEFAULT '0.9',
  created_at TEXT NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY(game_id) REFERENCES games(id) ON DELETE SET NULL,
  FOREIGN KEY(entity_id) REFERENCES entities(id) ON DELETE SET NULL
) STRICT;

CREATE TABLE IF NOT EXISTS research_packet_claims (
  id TEXT PRIMARY KEY,
  packet_id TEXT NOT NULL,
  claim_id TEXT NOT NULL DEFAULT '',
  text TEXT NOT NULL,
  language TEXT NOT NULL,
  confidence REAL NOT NULL DEFAULT 0,
  canon_status TEXT NOT NULL DEFAULT 'UNKNOWN',
  source_ids_json TEXT NOT NULL DEFAULT '[]',
  evidence_ids_json TEXT NOT NULL DEFAULT '[]',
  freshness TEXT NOT NULL DEFAULT 'UNKNOWN',
  conflict INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  FOREIGN KEY(packet_id) REFERENCES research_packets(id) ON DELETE CASCADE
) STRICT;

CREATE TABLE IF NOT EXISTS research_packet_sources (
  id TEXT PRIMARY KEY,
  packet_id TEXT NOT NULL,
  source_id TEXT NOT NULL DEFAULT '',
  url TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  publisher TEXT NOT NULL DEFAULT '',
  source_type TEXT NOT NULL DEFAULT 'UNKNOWN',
  retrieved_at TEXT NOT NULL DEFAULT '',
  quality REAL NOT NULL DEFAULT 0,
  checksum TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  FOREIGN KEY(packet_id) REFERENCES research_packets(id) ON DELETE CASCADE
) STRICT;

CREATE TABLE IF NOT EXISTS research_packet_images (
  id TEXT PRIMARY KEY,
  packet_id TEXT NOT NULL,
  candidate_id TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'CANDIDATE',
  remote_url TEXT NOT NULL,
  source_url TEXT NOT NULL DEFAULT '',
  source_id TEXT NOT NULL DEFAULT '',
  confidence REAL NOT NULL DEFAULT 0,
  license TEXT NOT NULL DEFAULT '',
  people_state TEXT NOT NULL DEFAULT 'UNCERTAIN',
  decision TEXT NOT NULL DEFAULT 'CANDIDATE',
  created_at TEXT NOT NULL,
  FOREIGN KEY(packet_id) REFERENCES research_packets(id) ON DELETE CASCADE
) STRICT;

CREATE TABLE IF NOT EXISTS ai_orchestration_runs (
  id TEXT PRIMARY KEY,
  request_id TEXT NOT NULL,
  trace_id TEXT NOT NULL,
  packet_id TEXT NOT NULL,
  request_type TEXT NOT NULL,
  route TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'QUEUED',
  language TEXT NOT NULL,
  game_id TEXT,
  entity_id TEXT,
  error_code TEXT NOT NULL DEFAULT '',
  summary_json TEXT NOT NULL DEFAULT '{}',
  started_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  completed_at TEXT NOT NULL DEFAULT '',
  FOREIGN KEY(packet_id) REFERENCES research_packets(id) ON DELETE CASCADE,
  FOREIGN KEY(game_id) REFERENCES games(id) ON DELETE SET NULL,
  FOREIGN KEY(entity_id) REFERENCES entities(id) ON DELETE SET NULL
) STRICT;

CREATE TABLE IF NOT EXISTS ai_orchestration_stages (
  id TEXT PRIMARY KEY,
  run_id TEXT NOT NULL,
  sequence INTEGER NOT NULL,
  component TEXT NOT NULL,
  status TEXT NOT NULL,
  error_code TEXT NOT NULL DEFAULT '',
  claim_count INTEGER NOT NULL DEFAULT 0,
  source_count INTEGER NOT NULL DEFAULT 0,
  evidence_count INTEGER NOT NULL DEFAULT 0,
  image_count INTEGER NOT NULL DEFAULT 0,
  game_id TEXT NOT NULL DEFAULT '',
  entity_id TEXT NOT NULL DEFAULT '',
  intent TEXT NOT NULL DEFAULT '',
  language TEXT NOT NULL DEFAULT '',
  summary_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  FOREIGN KEY(run_id) REFERENCES ai_orchestration_runs(id) ON DELETE CASCADE,
  UNIQUE(run_id,sequence)
) STRICT;

CREATE TABLE IF NOT EXISTS ai_handoffs (
  id TEXT PRIMARY KEY,
  run_id TEXT NOT NULL,
  packet_id TEXT NOT NULL,
  from_component TEXT NOT NULL,
  to_component TEXT NOT NULL,
  input_json TEXT NOT NULL DEFAULT '{}',
  output_json TEXT NOT NULL DEFAULT '{}',
  checksum TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'PASS',
  error_code TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  FOREIGN KEY(run_id) REFERENCES ai_orchestration_runs(id) ON DELETE CASCADE,
  FOREIGN KEY(packet_id) REFERENCES research_packets(id) ON DELETE CASCADE
) STRICT;

CREATE TABLE IF NOT EXISTS game_build_jobs (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  game_id TEXT NOT NULL,
  language TEXT NOT NULL,
  research_mode TEXT NOT NULL DEFAULT 'DEEP',
  publish_mode TEXT NOT NULL DEFAULT 'PREVIEW_ONLY',
  include_images INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'QUEUED',
  progress INTEGER NOT NULL DEFAULT 0,
  current_stage TEXT NOT NULL DEFAULT 'QUEUED',
  trace_id TEXT NOT NULL,
  packet_id TEXT NOT NULL DEFAULT '',
  idempotency_key TEXT NOT NULL,
  cancel_requested INTEGER NOT NULL DEFAULT 0,
  total_items INTEGER NOT NULL DEFAULT 0,
  completed_items INTEGER NOT NULL DEFAULT 0,
  ready_items INTEGER NOT NULL DEFAULT 0,
  review_items INTEGER NOT NULL DEFAULT 0,
  failed_items INTEGER NOT NULL DEFAULT 0,
  error_code TEXT NOT NULL DEFAULT '',
  lease_owner TEXT NOT NULL DEFAULT '',
  lease_expires_at TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  started_at TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL,
  completed_at TEXT NOT NULL DEFAULT '',
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY(game_id) REFERENCES games(id) ON DELETE CASCADE
) STRICT;

CREATE TABLE IF NOT EXISTS game_build_items (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL,
  entity_id TEXT,
  page_type TEXT NOT NULL,
  sequence INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'QUEUED',
  generation_job_id TEXT NOT NULL DEFAULT '',
  result_page_id TEXT NOT NULL DEFAULT '',
  error_code TEXT NOT NULL DEFAULT '',
  retry_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  completed_at TEXT NOT NULL DEFAULT '',
  FOREIGN KEY(job_id) REFERENCES game_build_jobs(id) ON DELETE CASCADE,
  FOREIGN KEY(entity_id) REFERENCES entities(id) ON DELETE SET NULL,
  UNIQUE(job_id,entity_id,page_type)
) STRICT;

CREATE TABLE IF NOT EXISTS page_versions (
  id TEXT PRIMARY KEY,
  page_id TEXT NOT NULL,
  version_number INTEGER NOT NULL,
  snapshot_json TEXT NOT NULL,
  created_by TEXT NOT NULL DEFAULT 'GAMEINDEX_09',
  created_at TEXT NOT NULL,
  FOREIGN KEY(page_id) REFERENCES pages(id) ON DELETE CASCADE,
  UNIQUE(page_id,version_number)
) STRICT;

CREATE TABLE IF NOT EXISTS admin_recovery_attempts (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  actor_hash TEXT NOT NULL,
  outcome TEXT NOT NULL,
  reason TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL
) STRICT;

CREATE INDEX IF NOT EXISTS idx_research_packets_trace ON research_packets(trace_id,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_packet_claims_packet ON research_packet_claims(packet_id);
CREATE INDEX IF NOT EXISTS idx_packet_sources_packet ON research_packet_sources(packet_id);
CREATE INDEX IF NOT EXISTS idx_packet_images_packet ON research_packet_images(packet_id);
CREATE INDEX IF NOT EXISTS idx_orchestration_trace ON ai_orchestration_runs(trace_id,updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_orchestration_stages_run ON ai_orchestration_stages(run_id,sequence);
CREATE INDEX IF NOT EXISTS idx_ai_handoffs_run ON ai_handoffs(run_id,created_at);
CREATE INDEX IF NOT EXISTS idx_game_build_game_lang ON game_build_jobs(game_id,language,updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_game_build_status ON game_build_jobs(status,updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_game_build_items_job ON game_build_items(job_id,sequence);
CREATE INDEX IF NOT EXISTS idx_admin_recovery_actor ON admin_recovery_attempts(actor_hash,created_at DESC);

UPDATE developer_permissions SET page_generation=1,updated_at=datetime('now')
WHERE user_id IN (SELECT id FROM users WHERE role='ADMIN' AND account_tier='DEV');

UPDATE images SET people_state='NO_PEOPLE',provenance_state='PROCEDURAL_VERIFIED',pipeline_version='0.9'
WHERE storage_type='BLOB' AND verified=1 AND media_context<>'REAL_WORLD';

INSERT INTO update_log_entries(version,title,codename,release_date,sections_json,tags_json,public,created_at)
VALUES(
  '0.9',
  'GameIndex Beta 0.9',
  'Orquestração Total',
  '2026-08-20',
  '{"NEW":["Pesquisa antes do Boss","ResearchPacket persistente","Criar páginas por jogo","Recuperação ADMIN + DEV","Imagens pesquisadas-first"],"FIXED":["Prioridade procedural incorreta","Geração unitária sem job pai","Versão antiga do Page Builder","Estado de setup ambíguo"],"IMPROVED":["Memória local-first sem chave","Persistência Azure HOME","Idioma por página","Handoffs auditáveis"]}',
  '["NEW","FIXED","IMPROVED","AI","PAGES","IMAGES","AUTH","AZURE","NO_API_KEY"]',
  1,
  datetime('now')
)
ON CONFLICT(version) DO UPDATE SET title=excluded.title,codename=excluded.codename,release_date=excluded.release_date,sections_json=excluded.sections_json,tags_json=excluded.tags_json,public=excluded.public;

INSERT INTO meta(key,value) VALUES('beta_09_orchestration_total','1') ON CONFLICT(key) DO UPDATE SET value='1';
INSERT INTO meta(key,value) VALUES('beta_09_research_first','1') ON CONFLICT(key) DO UPDATE SET value='1';
INSERT INTO meta(key,value) VALUES('beta_09_no_api_key','1') ON CONFLICT(key) DO UPDATE SET value='1';
INSERT INTO meta(key,value) VALUES('beta_09_visual_policy','NO_PEOPLE_NO_WOMEN') ON CONFLICT(key) DO UPDATE SET value='NO_PEOPLE_NO_WOMEN';
