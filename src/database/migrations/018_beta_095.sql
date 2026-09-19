-- GameIndex Beta 0.95 — Universe Builder & Creator Studio
-- Additive, idempotent schema 18 migration. No production row is deleted.

CREATE TABLE IF NOT EXISTS staff_role_assignments (
  user_id TEXT PRIMARY KEY,
  role TEXT NOT NULL DEFAULT 'NONE' CHECK(role IN ('CREATOR','DEV','TESTER','NONE')),
  suspended INTEGER NOT NULL DEFAULT 0 CHECK(suspended IN (0,1)),
  assigned_by TEXT,
  reason TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY(assigned_by) REFERENCES users(id) ON DELETE SET NULL
) STRICT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_staff_one_creator
ON staff_role_assignments(role) WHERE role='CREATOR';
CREATE INDEX IF NOT EXISTS idx_staff_role ON staff_role_assignments(role,suspended,updated_at DESC);

CREATE TABLE IF NOT EXISTS staff_capability_grants (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  capability TEXT NOT NULL,
  effect TEXT NOT NULL DEFAULT 'ALLOW' CHECK(effect IN ('ALLOW','DENY')),
  granted_by TEXT,
  reason TEXT NOT NULL DEFAULT '',
  expires_at TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY(granted_by) REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE(user_id,capability)
) STRICT;
CREATE INDEX IF NOT EXISTS idx_capability_user ON staff_capability_grants(user_id,effect,expires_at);

CREATE TABLE IF NOT EXISTS role_change_audit (
  id TEXT PRIMARY KEY,
  request_id TEXT NOT NULL,
  actor_user_id TEXT NOT NULL,
  target_user_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  previous_staff_role TEXT NOT NULL DEFAULT 'NONE',
  next_staff_role TEXT NOT NULL DEFAULT 'NONE',
  previous_plan TEXT NOT NULL DEFAULT 'FREE',
  next_plan TEXT NOT NULL DEFAULT 'FREE',
  changed_capabilities_json TEXT NOT NULL DEFAULT '[]',
  reason TEXT NOT NULL,
  context_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  FOREIGN KEY(actor_user_id) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY(target_user_id) REFERENCES users(id) ON DELETE RESTRICT
) STRICT;
CREATE INDEX IF NOT EXISTS idx_role_audit_target ON role_change_audit(target_user_id,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_role_audit_actor ON role_change_audit(actor_user_id,created_at DESC);

CREATE TABLE IF NOT EXISTS manual_plan_grants (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'PRO' CHECK(plan IN ('PRO','FREE')),
  active INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0,1)),
  granted_by TEXT NOT NULL,
  reason TEXT NOT NULL,
  expires_at TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY(granted_by) REFERENCES users(id) ON DELETE RESTRICT
) STRICT;
CREATE INDEX IF NOT EXISTS idx_manual_plan_user ON manual_plan_grants(user_id,active,expires_at);

CREATE TABLE IF NOT EXISTS tester_invitations (
  id TEXT PRIMARY KEY,
  email_hint TEXT NOT NULL DEFAULT '',
  target_user_id TEXT,
  token_hash TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK(status IN ('PENDING','ACCEPTED','REVOKED','EXPIRED')),
  created_by TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(target_user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY(created_by) REFERENCES users(id) ON DELETE RESTRICT
) STRICT;

CREATE TABLE IF NOT EXISTS test_campaigns (
  id TEXT PRIMARY KEY,
  game_id TEXT,
  construction_run_id TEXT,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  checklist_json TEXT NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK(status IN ('DRAFT','ACTIVE','PAUSED','COMPLETED','ARCHIVED')),
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(game_id) REFERENCES games(id) ON DELETE SET NULL,
  FOREIGN KEY(construction_run_id) REFERENCES construction_runs(id) ON DELETE SET NULL,
  FOREIGN KEY(created_by) REFERENCES users(id) ON DELETE RESTRICT
) STRICT;

CREATE TABLE IF NOT EXISTS test_campaign_assignments (
  campaign_id TEXT NOT NULL,
  tester_user_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ASSIGNED' CHECK(status IN ('ASSIGNED','IN_PROGRESS','SUBMITTED','COMPLETED','REMOVED')),
  checklist_results_json TEXT NOT NULL DEFAULT '{}',
  assigned_by TEXT NOT NULL,
  assigned_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY(campaign_id,tester_user_id),
  FOREIGN KEY(campaign_id) REFERENCES test_campaigns(id) ON DELETE CASCADE,
  FOREIGN KEY(tester_user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY(assigned_by) REFERENCES users(id) ON DELETE RESTRICT
) STRICT;

CREATE TABLE IF NOT EXISTS test_feedback (
  id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL,
  tester_user_id TEXT NOT NULL,
  page_id TEXT,
  page_version_id TEXT,
  construction_run_id TEXT,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'OPEN' CHECK(status IN ('OPEN','ACKNOWLEDGED','CHANGES_REQUESTED','RESOLVED','CLOSED')),
  developer_response TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(campaign_id) REFERENCES test_campaigns(id) ON DELETE CASCADE,
  FOREIGN KEY(tester_user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY(page_id) REFERENCES pages(id) ON DELETE SET NULL,
  FOREIGN KEY(page_version_id) REFERENCES page_versions(id) ON DELETE SET NULL,
  FOREIGN KEY(construction_run_id) REFERENCES construction_runs(id) ON DELETE SET NULL
) STRICT;
CREATE INDEX IF NOT EXISTS idx_test_feedback_campaign ON test_feedback(campaign_id,status,updated_at DESC);

CREATE TABLE IF NOT EXISTS public_bug_reports (
  id TEXT PRIMARY KEY,
  public_code TEXT NOT NULL UNIQUE,
  receipt_hash TEXT NOT NULL UNIQUE,
  reporter_user_id TEXT,
  bug_id TEXT NOT NULL,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  steps TEXT NOT NULL DEFAULT '',
  expected_result TEXT NOT NULL DEFAULT '',
  actual_result TEXT NOT NULL DEFAULT '',
  page_url TEXT NOT NULL DEFAULT '',
  game_id TEXT,
  page_id TEXT,
  page_version_id TEXT,
  entity_id TEXT,
  client_metadata_json TEXT NOT NULL DEFAULT '{}',
  fingerprint TEXT NOT NULL,
  duplicate_of_id TEXT,
  status TEXT NOT NULL DEFAULT 'REPORTED',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(reporter_user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY(bug_id) REFERENCES bugs(id) ON DELETE RESTRICT,
  FOREIGN KEY(game_id) REFERENCES games(id) ON DELETE SET NULL,
  FOREIGN KEY(page_id) REFERENCES pages(id) ON DELETE SET NULL,
  FOREIGN KEY(page_version_id) REFERENCES page_versions(id) ON DELETE SET NULL,
  FOREIGN KEY(entity_id) REFERENCES entities(id) ON DELETE SET NULL,
  FOREIGN KEY(duplicate_of_id) REFERENCES public_bug_reports(id) ON DELETE SET NULL
) STRICT;
CREATE INDEX IF NOT EXISTS idx_public_report_fingerprint ON public_bug_reports(fingerprint,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_public_report_reporter ON public_bug_reports(reporter_user_id,created_at DESC);

CREATE TABLE IF NOT EXISTS content_review_tasks (
  id TEXT PRIMARY KEY,
  report_id TEXT NOT NULL,
  page_id TEXT,
  page_version_id TEXT,
  status TEXT NOT NULL DEFAULT 'OPEN',
  assigned_to TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(report_id) REFERENCES public_bug_reports(id) ON DELETE CASCADE,
  FOREIGN KEY(page_id) REFERENCES pages(id) ON DELETE SET NULL,
  FOREIGN KEY(page_version_id) REFERENCES page_versions(id) ON DELETE SET NULL,
  FOREIGN KEY(assigned_to) REFERENCES users(id) ON DELETE SET NULL
) STRICT;

CREATE TABLE IF NOT EXISTS game_blueprints (
  id TEXT PRIMARY KEY,
  game_id TEXT NOT NULL UNIQUE,
  language TEXT NOT NULL DEFAULT 'pt-BR',
  version INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK(status IN ('DRAFT','VALIDATED','ACTIVE','ARCHIVED')),
  created_by TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(game_id) REFERENCES games(id) ON DELETE CASCADE,
  FOREIGN KEY(created_by) REFERENCES users(id) ON DELETE SET NULL
) STRICT;

CREATE TABLE IF NOT EXISTS game_blueprint_categories (
  id TEXT PRIMARY KEY,
  blueprint_id TEXT NOT NULL,
  category_key TEXT NOT NULL,
  label TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1 CHECK(enabled IN (0,1)),
  position INTEGER NOT NULL DEFAULT 0,
  recipe_key TEXT NOT NULL DEFAULT 'ENTITY',
  configuration_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(blueprint_id) REFERENCES game_blueprints(id) ON DELETE CASCADE,
  UNIQUE(blueprint_id,category_key)
) STRICT;

CREATE TABLE IF NOT EXISTS page_recipes (
  id TEXT PRIMARY KEY,
  recipe_key TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  page_type TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  enabled INTEGER NOT NULL DEFAULT 1 CHECK(enabled IN (0,1)),
  version INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
) STRICT;

CREATE TABLE IF NOT EXISTS page_recipe_sections (
  id TEXT PRIMARY KEY,
  recipe_id TEXT NOT NULL,
  section_key TEXT NOT NULL,
  label TEXT NOT NULL,
  block_type TEXT NOT NULL DEFAULT 'PARAGRAPH',
  required INTEGER NOT NULL DEFAULT 1 CHECK(required IN (0,1)),
  position INTEGER NOT NULL DEFAULT 0,
  validation_json TEXT NOT NULL DEFAULT '{}',
  FOREIGN KEY(recipe_id) REFERENCES page_recipes(id) ON DELETE CASCADE,
  UNIQUE(recipe_id,section_key)
) STRICT;

CREATE TABLE IF NOT EXISTS content_manifests (
  id TEXT PRIMARY KEY,
  game_id TEXT NOT NULL,
  blueprint_id TEXT NOT NULL,
  language TEXT NOT NULL,
  version INTEGER NOT NULL,
  mode TEXT NOT NULL DEFAULT 'FULL' CHECK(mode IN ('FULL','EXPANSION')),
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK(status IN ('DRAFT','VERIFIED','APPROVED','BUILDING','COMPLETED','ARCHIVED')),
  summary_json TEXT NOT NULL DEFAULT '{}',
  approved_by TEXT,
  created_by TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  approved_at TEXT NOT NULL DEFAULT '',
  FOREIGN KEY(game_id) REFERENCES games(id) ON DELETE CASCADE,
  FOREIGN KEY(blueprint_id) REFERENCES game_blueprints(id) ON DELETE CASCADE,
  FOREIGN KEY(approved_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY(created_by) REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE(game_id,language,version,mode)
) STRICT;

CREATE TABLE IF NOT EXISTS content_manifest_items (
  id TEXT PRIMARY KEY,
  manifest_id TEXT NOT NULL,
  game_id TEXT NOT NULL,
  entity_id TEXT,
  category_key TEXT NOT NULL,
  page_type TEXT NOT NULL,
  recipe_key TEXT NOT NULL,
  wave TEXT NOT NULL,
  title TEXT NOT NULL,
  slug_candidate TEXT NOT NULL,
  language TEXT NOT NULL,
  required_sections_json TEXT NOT NULL DEFAULT '[]',
  image_roles_json TEXT NOT NULL DEFAULT '[]',
  knowledge_coverage REAL NOT NULL DEFAULT 0,
  source_coverage REAL NOT NULL DEFAULT 0,
  quality_readiness REAL NOT NULL DEFAULT 0,
  status TEXT NOT NULL,
  reason TEXT NOT NULL DEFAULT '',
  suggested_action TEXT NOT NULL DEFAULT '',
  result_page_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(manifest_id) REFERENCES content_manifests(id) ON DELETE CASCADE,
  FOREIGN KEY(game_id) REFERENCES games(id) ON DELETE CASCADE,
  FOREIGN KEY(entity_id) REFERENCES entities(id) ON DELETE SET NULL,
  FOREIGN KEY(result_page_id) REFERENCES pages(id) ON DELETE SET NULL,
  UNIQUE(manifest_id,slug_candidate,page_type,language)
) STRICT;
CREATE INDEX IF NOT EXISTS idx_manifest_items_status ON content_manifest_items(manifest_id,status,wave);
CREATE INDEX IF NOT EXISTS idx_manifest_items_game ON content_manifest_items(game_id,category_key,status);

CREATE TABLE IF NOT EXISTS content_manifest_dependencies (
  manifest_item_id TEXT NOT NULL,
  depends_on_item_id TEXT NOT NULL,
  dependency_type TEXT NOT NULL DEFAULT 'PAGE',
  required INTEGER NOT NULL DEFAULT 1 CHECK(required IN (0,1)),
  PRIMARY KEY(manifest_item_id,depends_on_item_id),
  FOREIGN KEY(manifest_item_id) REFERENCES content_manifest_items(id) ON DELETE CASCADE,
  FOREIGN KEY(depends_on_item_id) REFERENCES content_manifest_items(id) ON DELETE CASCADE,
  CHECK(manifest_item_id<>depends_on_item_id)
) STRICT;

CREATE TABLE IF NOT EXISTS universe_build_runs (
  id TEXT PRIMARY KEY,
  manifest_id TEXT NOT NULL,
  construction_run_id TEXT NOT NULL UNIQUE,
  mode TEXT NOT NULL DEFAULT 'FULL' CHECK(mode IN ('FULL','EXPANSION','IMAGE_ONLY','DEMO')),
  pipeline_version TEXT NOT NULL DEFAULT '0.95',
  created_by TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(manifest_id) REFERENCES content_manifests(id) ON DELETE RESTRICT,
  FOREIGN KEY(construction_run_id) REFERENCES construction_runs(id) ON DELETE CASCADE,
  FOREIGN KEY(created_by) REFERENCES users(id) ON DELETE SET NULL
) STRICT;

CREATE TABLE IF NOT EXISTS universe_build_waves (
  id TEXT PRIMARY KEY,
  universe_run_id TEXT NOT NULL,
  wave TEXT NOT NULL,
  position INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'QUEUED',
  total_items INTEGER NOT NULL DEFAULT 0,
  completed_items INTEGER NOT NULL DEFAULT 0,
  failed_items INTEGER NOT NULL DEFAULT 0,
  started_at TEXT NOT NULL DEFAULT '',
  completed_at TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL,
  FOREIGN KEY(universe_run_id) REFERENCES universe_build_runs(id) ON DELETE CASCADE,
  UNIQUE(universe_run_id,wave)
) STRICT;

CREATE TABLE IF NOT EXISTS universe_build_item_links (
  universe_run_id TEXT NOT NULL,
  construction_item_id TEXT NOT NULL UNIQUE,
  manifest_item_id TEXT NOT NULL,
  wave TEXT NOT NULL,
  PRIMARY KEY(universe_run_id,manifest_item_id),
  FOREIGN KEY(universe_run_id) REFERENCES universe_build_runs(id) ON DELETE CASCADE,
  FOREIGN KEY(construction_item_id) REFERENCES construction_items(id) ON DELETE CASCADE,
  FOREIGN KEY(manifest_item_id) REFERENCES content_manifest_items(id) ON DELETE RESTRICT
) STRICT;
CREATE INDEX IF NOT EXISTS idx_universe_links_wave ON universe_build_item_links(universe_run_id,wave);

CREATE TABLE IF NOT EXISTS creator_drafts (
  id TEXT PRIMARY KEY,
  game_id TEXT NOT NULL,
  page_id TEXT,
  manifest_item_id TEXT,
  recipe_key TEXT NOT NULL,
  owner_user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL DEFAULT '',
  slug TEXT NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  category_key TEXT NOT NULL DEFAULT 'overview',
  language TEXT NOT NULL DEFAULT 'pt-BR',
  status TEXT NOT NULL DEFAULT 'DRAFT',
  revision INTEGER NOT NULL DEFAULT 1,
  validation_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  last_saved_at TEXT NOT NULL,
  FOREIGN KEY(game_id) REFERENCES games(id) ON DELETE CASCADE,
  FOREIGN KEY(page_id) REFERENCES pages(id) ON DELETE SET NULL,
  FOREIGN KEY(manifest_item_id) REFERENCES content_manifest_items(id) ON DELETE SET NULL,
  FOREIGN KEY(owner_user_id) REFERENCES users(id) ON DELETE RESTRICT
) STRICT;
CREATE INDEX IF NOT EXISTS idx_creator_drafts_game ON creator_drafts(game_id,status,updated_at DESC);

CREATE TABLE IF NOT EXISTS creator_draft_blocks (
  id TEXT PRIMARY KEY,
  draft_id TEXT NOT NULL,
  block_type TEXT NOT NULL,
  section_key TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL DEFAULT '',
  content_json TEXT NOT NULL DEFAULT '{}',
  required INTEGER NOT NULL DEFAULT 0 CHECK(required IN (0,1)),
  position INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(draft_id) REFERENCES creator_drafts(id) ON DELETE CASCADE,
  UNIQUE(draft_id,position)
) STRICT;

CREATE TABLE IF NOT EXISTS content_collections (
  id TEXT PRIMARY KEY,
  game_id TEXT NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  language TEXT NOT NULL DEFAULT 'pt-BR',
  status TEXT NOT NULL DEFAULT 'DRAFT',
  branding_image_id TEXT,
  created_by TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(game_id) REFERENCES games(id) ON DELETE CASCADE,
  FOREIGN KEY(branding_image_id) REFERENCES images(id) ON DELETE SET NULL,
  FOREIGN KEY(created_by) REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE(game_id,slug,language)
) STRICT;

CREATE TABLE IF NOT EXISTS content_collection_items (
  collection_id TEXT NOT NULL,
  page_id TEXT NOT NULL,
  position INTEGER NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  PRIMARY KEY(collection_id,page_id),
  FOREIGN KEY(collection_id) REFERENCES content_collections(id) ON DELETE CASCADE,
  FOREIGN KEY(page_id) REFERENCES pages(id) ON DELETE CASCADE,
  UNIQUE(collection_id,position)
) STRICT;

CREATE TABLE IF NOT EXISTS image_asset_versions (
  id TEXT PRIMARY KEY,
  image_id TEXT NOT NULL,
  version INTEGER NOT NULL,
  crop_json TEXT NOT NULL DEFAULT '{}',
  focal_json TEXT NOT NULL DEFAULT '{"x":0.5,"y":0.5}',
  notes TEXT NOT NULL DEFAULT '',
  created_by TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY(image_id) REFERENCES images(id) ON DELETE CASCADE,
  FOREIGN KEY(created_by) REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE(image_id,version)
) STRICT;

CREATE TABLE IF NOT EXISTS ai6_evaluation_runs (
  id TEXT PRIMARY KEY,
  baseline_version TEXT NOT NULL DEFAULT '5.0',
  candidate_version TEXT NOT NULL DEFAULT '6.0',
  status TEXT NOT NULL DEFAULT 'RUNNING',
  metrics_json TEXT NOT NULL DEFAULT '{}',
  created_by TEXT,
  created_at TEXT NOT NULL,
  completed_at TEXT NOT NULL DEFAULT '',
  FOREIGN KEY(created_by) REFERENCES users(id) ON DELETE SET NULL
) STRICT;

CREATE TABLE IF NOT EXISTS ai6_evaluation_results (
  id TEXT PRIMARY KEY,
  run_id TEXT NOT NULL,
  fixture_key TEXT NOT NULL,
  metric_key TEXT NOT NULL,
  baseline_score REAL NOT NULL DEFAULT 0,
  candidate_score REAL NOT NULL DEFAULT 0,
  passed INTEGER NOT NULL DEFAULT 0 CHECK(passed IN (0,1)),
  details_json TEXT NOT NULL DEFAULT '{}',
  FOREIGN KEY(run_id) REFERENCES ai6_evaluation_runs(id) ON DELETE CASCADE,
  UNIQUE(run_id,fixture_key,metric_key)
) STRICT;

CREATE TABLE IF NOT EXISTS ai6_handoffs (
  id TEXT PRIMARY KEY,
  trace_id TEXT NOT NULL,
  sequence INTEGER NOT NULL,
  specialist TEXT NOT NULL,
  status TEXT NOT NULL,
  input_summary_json TEXT NOT NULL DEFAULT '{}',
  output_summary_json TEXT NOT NULL DEFAULT '{}',
  evidence_ids_json TEXT NOT NULL DEFAULT '[]',
  loss_detected INTEGER NOT NULL DEFAULT 0 CHECK(loss_detected IN (0,1)),
  duration_ms INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  UNIQUE(trace_id,sequence)
) STRICT;
CREATE INDEX IF NOT EXISTS idx_ai6_handoffs_trace ON ai6_handoffs(trace_id,sequence);

INSERT INTO update_log_entries(version,title,codename,release_date,sections_json,tags_json,public,created_at)
VALUES(
  '0.95','GameIndex Beta 0.95','Universe Builder & Creator Studio','2026-08-20',
  '{"NEW":["Universe Builder e Content Manifest","Creator Control Center","Creator Studio e Tester Lab","Relatório público de bugs","Showcase de apresentação"],"FIXED":["Separação segura entre staff e plano","Creator resolvido por ID imutável","Páginas e imagens reparáveis separadamente"],"IMPROVED":["Full Game Build V2 em ondas","AI System 6.0 estruturado e mensurável","Schema 18 backup-first","Compatibilidade Azure Windows sem chave"]}',
  '["NEW","UNIVERSE","CREATOR_STUDIO","SECURITY","AI6","AZURE","NO_API_KEY"]',1,datetime('now')
)
ON CONFLICT(version) DO UPDATE SET title=excluded.title,codename=excluded.codename,release_date=excluded.release_date,sections_json=excluded.sections_json,tags_json=excluded.tags_json,public=excluded.public;

INSERT INTO meta(key,value) VALUES('beta_095_universe_builder','1') ON CONFLICT(key) DO UPDATE SET value='1';
INSERT INTO meta(key,value) VALUES('beta_095_creator_studio','1') ON CONFLICT(key) DO UPDATE SET value='1';
INSERT INTO meta(key,value) VALUES('beta_095_ai_system','6.0') ON CONFLICT(key) DO UPDATE SET value='6.0';
INSERT INTO meta(key,value) VALUES('beta_095_no_api_key','1') ON CONFLICT(key) DO UPDATE SET value='1';
INSERT INTO meta(key,value) VALUES('beta_095_visual_policy','NO_PEOPLE_NO_WOMEN') ON CONFLICT(key) DO UPDATE SET value='NO_PEOPLE_NO_WOMEN';
