-- GameIndex Beta 0.96 — Foundation & Collaborative Intelligence
-- Additive and idempotent schema 19 migration. No production row is deleted.

CREATE TABLE IF NOT EXISTS user_access_revisions (
  user_id TEXT PRIMARY KEY,
  revision INTEGER NOT NULL DEFAULT 1,
  last_active_at TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
) STRICT;

INSERT INTO user_access_revisions(user_id,revision,last_active_at,updated_at)
SELECT id,1,COALESCE(last_login_at,''),datetime('now') FROM users WHERE 1
ON CONFLICT(user_id) DO NOTHING;

CREATE TABLE IF NOT EXISTS research_batches (
  id TEXT PRIMARY KEY,
  manifest_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'QUEUED',
  mode TEXT NOT NULL DEFAULT 'MISSING',
  language TEXT NOT NULL DEFAULT 'pt-BR',
  requested_by TEXT,
  total_items INTEGER NOT NULL DEFAULT 0,
  processed_items INTEGER NOT NULL DEFAULT 0,
  ready_items INTEGER NOT NULL DEFAULT 0,
  review_items INTEGER NOT NULL DEFAULT 0,
  failed_items INTEGER NOT NULL DEFAULT 0,
  lease_owner TEXT NOT NULL DEFAULT '',
  lease_expires_at TEXT NOT NULL DEFAULT '',
  cancel_requested INTEGER NOT NULL DEFAULT 0 CHECK(cancel_requested IN (0,1)),
  pause_requested INTEGER NOT NULL DEFAULT 0 CHECK(pause_requested IN (0,1)),
  summary_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  started_at TEXT NOT NULL DEFAULT '',
  completed_at TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL,
  FOREIGN KEY(manifest_id) REFERENCES content_manifests(id) ON DELETE CASCADE,
  FOREIGN KEY(requested_by) REFERENCES users(id) ON DELETE SET NULL
) STRICT;
CREATE INDEX IF NOT EXISTS idx_research_batches_manifest ON research_batches(manifest_id,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_research_batches_status ON research_batches(status,lease_expires_at);

CREATE TABLE IF NOT EXISTS research_batch_items (
  id TEXT PRIMARY KEY,
  batch_id TEXT NOT NULL,
  manifest_item_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'RESEARCH_QUEUED',
  attempt_count INTEGER NOT NULL DEFAULT 0,
  source_ids_json TEXT NOT NULL DEFAULT '[]',
  claim_ids_json TEXT NOT NULL DEFAULT '[]',
  contradiction_ids_json TEXT NOT NULL DEFAULT '[]',
  readiness_json TEXT NOT NULL DEFAULT '{}',
  error_code TEXT NOT NULL DEFAULT '',
  error_message TEXT NOT NULL DEFAULT '',
  failure_fingerprint TEXT NOT NULL DEFAULT '',
  started_at TEXT NOT NULL DEFAULT '',
  completed_at TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL,
  FOREIGN KEY(batch_id) REFERENCES research_batches(id) ON DELETE CASCADE,
  FOREIGN KEY(manifest_item_id) REFERENCES content_manifest_items(id) ON DELETE CASCADE,
  UNIQUE(batch_id,manifest_item_id)
) STRICT;
CREATE INDEX IF NOT EXISTS idx_research_items_status ON research_batch_items(batch_id,status,updated_at);
CREATE INDEX IF NOT EXISTS idx_research_items_fingerprint ON research_batch_items(failure_fingerprint,status);

CREATE TABLE IF NOT EXISTS research_item_events (
  id TEXT PRIMARY KEY,
  batch_item_id TEXT NOT NULL,
  previous_status TEXT NOT NULL DEFAULT '',
  next_status TEXT NOT NULL,
  event_code TEXT NOT NULL,
  details_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  FOREIGN KEY(batch_item_id) REFERENCES research_batch_items(id) ON DELETE CASCADE
) STRICT;
CREATE INDEX IF NOT EXISTS idx_research_events_item ON research_item_events(batch_item_id,created_at);

CREATE TABLE IF NOT EXISTS readiness_checks (
  id TEXT PRIMARY KEY,
  manifest_item_id TEXT NOT NULL,
  batch_id TEXT,
  check_key TEXT NOT NULL,
  passed INTEGER NOT NULL DEFAULT 0 CHECK(passed IN (0,1)),
  severity TEXT NOT NULL DEFAULT 'BLOCKING',
  reason_code TEXT NOT NULL DEFAULT '',
  details_json TEXT NOT NULL DEFAULT '{}',
  checked_at TEXT NOT NULL,
  FOREIGN KEY(manifest_item_id) REFERENCES content_manifest_items(id) ON DELETE CASCADE,
  FOREIGN KEY(batch_id) REFERENCES research_batches(id) ON DELETE SET NULL,
  UNIQUE(manifest_item_id,batch_id,check_key)
) STRICT;

CREATE TABLE IF NOT EXISTS research_contradictions (
  id TEXT PRIMARY KEY,
  manifest_item_id TEXT NOT NULL,
  claim_key TEXT NOT NULL,
  values_json TEXT NOT NULL DEFAULT '[]',
  source_ids_json TEXT NOT NULL DEFAULT '[]',
  impact TEXT NOT NULL DEFAULT 'MEDIUM',
  status TEXT NOT NULL DEFAULT 'OPEN',
  resolution TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(manifest_item_id) REFERENCES content_manifest_items(id) ON DELETE CASCADE
) STRICT;

CREATE TABLE IF NOT EXISTS systemic_incidents (
  id TEXT PRIMARY KEY,
  fingerprint TEXT NOT NULL UNIQUE,
  component TEXT NOT NULL,
  stage TEXT NOT NULL,
  error_code TEXT NOT NULL,
  normalized_message TEXT NOT NULL DEFAULT '',
  dependency TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'OPEN',
  affected_count INTEGER NOT NULL DEFAULT 0,
  retryable INTEGER NOT NULL DEFAULT 0 CHECK(retryable IN (0,1)),
  suggested_action TEXT NOT NULL DEFAULT '',
  first_seen_at TEXT NOT NULL,
  last_seen_at TEXT NOT NULL,
  resolved_at TEXT NOT NULL DEFAULT ''
) STRICT;

CREATE TABLE IF NOT EXISTS systemic_incident_items (
  incident_id TEXT NOT NULL,
  batch_item_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY(incident_id,batch_item_id),
  FOREIGN KEY(incident_id) REFERENCES systemic_incidents(id) ON DELETE CASCADE,
  FOREIGN KEY(batch_item_id) REFERENCES research_batch_items(id) ON DELETE CASCADE
) STRICT;

CREATE TABLE IF NOT EXISTS ai7_runs (
  id TEXT PRIMARY KEY,
  request_id TEXT NOT NULL,
  trace_id TEXT NOT NULL,
  request_type TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'pt-BR',
  game_id TEXT,
  status TEXT NOT NULL DEFAULT 'RUNNING',
  architecture TEXT NOT NULL DEFAULT 'COLLABORATIVE_INTELLIGENCE_AND_SAFETY',
  input_summary_json TEXT NOT NULL DEFAULT '{}',
  output_summary_json TEXT NOT NULL DEFAULT '{}',
  final_review_json TEXT NOT NULL DEFAULT '{}',
  created_by TEXT,
  created_at TEXT NOT NULL,
  completed_at TEXT NOT NULL DEFAULT '',
  FOREIGN KEY(game_id) REFERENCES games(id) ON DELETE SET NULL,
  FOREIGN KEY(created_by) REFERENCES users(id) ON DELETE SET NULL
) STRICT;
CREATE INDEX IF NOT EXISTS idx_ai7_runs_trace ON ai7_runs(trace_id,created_at DESC);

CREATE TABLE IF NOT EXISTS ai7_handoffs (
  id TEXT PRIMARY KEY,
  run_id TEXT NOT NULL,
  parent_handoff_id TEXT,
  sequence INTEGER NOT NULL,
  source_specialist TEXT NOT NULL,
  target_specialist TEXT NOT NULL,
  task_type TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'pt-BR',
  context_json TEXT NOT NULL DEFAULT '{}',
  input_summary_json TEXT NOT NULL DEFAULT '{}',
  claim_ids_json TEXT NOT NULL DEFAULT '[]',
  source_ids_json TEXT NOT NULL DEFAULT '[]',
  constraints_json TEXT NOT NULL DEFAULT '[]',
  expected_output_schema TEXT NOT NULL DEFAULT '',
  confidence_band TEXT NOT NULL DEFAULT 'UNKNOWN',
  contradiction_flags_json TEXT NOT NULL DEFAULT '[]',
  safety_labels_json TEXT NOT NULL DEFAULT '[]',
  privacy_labels_json TEXT NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'COMPLETE',
  retry_count INTEGER NOT NULL DEFAULT 0,
  error_code TEXT NOT NULL DEFAULT '',
  output_summary_json TEXT NOT NULL DEFAULT '{}',
  started_at TEXT NOT NULL,
  completed_at TEXT NOT NULL DEFAULT '',
  FOREIGN KEY(run_id) REFERENCES ai7_runs(id) ON DELETE CASCADE,
  FOREIGN KEY(parent_handoff_id) REFERENCES ai7_handoffs(id) ON DELETE SET NULL,
  UNIQUE(run_id,sequence)
) STRICT;
CREATE INDEX IF NOT EXISTS idx_ai7_handoffs_run ON ai7_handoffs(run_id,sequence);

CREATE TABLE IF NOT EXISTS ai7_evaluation_runs (
  id TEXT PRIMARY KEY,
  suite_key TEXT NOT NULL,
  baseline_version TEXT NOT NULL DEFAULT '6.0',
  candidate_version TEXT NOT NULL DEFAULT '7.0',
  status TEXT NOT NULL DEFAULT 'RUNNING',
  metrics_json TEXT NOT NULL DEFAULT '{}',
  created_by TEXT,
  created_at TEXT NOT NULL,
  completed_at TEXT NOT NULL DEFAULT '',
  FOREIGN KEY(created_by) REFERENCES users(id) ON DELETE SET NULL
) STRICT;

CREATE TABLE IF NOT EXISTS ai7_evaluation_results (
  id TEXT PRIMARY KEY,
  run_id TEXT NOT NULL,
  fixture_key TEXT NOT NULL,
  domain TEXT NOT NULL,
  baseline_score REAL NOT NULL DEFAULT 0,
  candidate_score REAL NOT NULL DEFAULT 0,
  passed INTEGER NOT NULL DEFAULT 0 CHECK(passed IN (0,1)),
  details_json TEXT NOT NULL DEFAULT '{}',
  FOREIGN KEY(run_id) REFERENCES ai7_evaluation_runs(id) ON DELETE CASCADE,
  UNIQUE(run_id,fixture_key)
) STRICT;

CREATE TABLE IF NOT EXISTS social_blocks (
  blocker_user_id TEXT NOT NULL,
  blocked_user_id TEXT NOT NULL,
  reason_code TEXT NOT NULL DEFAULT 'USER_CHOICE',
  created_at TEXT NOT NULL,
  PRIMARY KEY(blocker_user_id,blocked_user_id),
  CHECK(blocker_user_id<>blocked_user_id),
  FOREIGN KEY(blocker_user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY(blocked_user_id) REFERENCES users(id) ON DELETE CASCADE
) STRICT;

CREATE TABLE IF NOT EXISTS social_mutes (
  user_id TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  expires_at TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  PRIMARY KEY(user_id,target_type,target_id),
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
) STRICT;

CREATE TABLE IF NOT EXISTS social_conversations (
  id TEXT PRIMARY KEY,
  conversation_type TEXT NOT NULL DEFAULT 'DIRECT',
  direct_pair_key TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL DEFAULT '',
  group_id TEXT,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(created_by) REFERENCES users(id) ON DELETE RESTRICT
) STRICT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_social_direct_pair ON social_conversations(direct_pair_key) WHERE direct_pair_key<>'' AND status='ACTIVE';

CREATE TABLE IF NOT EXISTS social_conversation_members (
  conversation_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  member_role TEXT NOT NULL DEFAULT 'MEMBER',
  joined_at TEXT NOT NULL,
  left_at TEXT NOT NULL DEFAULT '',
  last_read_message_id TEXT NOT NULL DEFAULT '',
  last_read_at TEXT NOT NULL DEFAULT '',
  PRIMARY KEY(conversation_id,user_id),
  FOREIGN KEY(conversation_id) REFERENCES social_conversations(id) ON DELETE CASCADE,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
) STRICT;

CREATE TABLE IF NOT EXISTS social_messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  sender_user_id TEXT NOT NULL,
  idempotency_key TEXT NOT NULL,
  content TEXT NOT NULL,
  moderation_status TEXT NOT NULL DEFAULT 'ALLOW',
  moderation_reason_code TEXT NOT NULL DEFAULT '',
  edited_at TEXT NOT NULL DEFAULT '',
  deleted_at TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  FOREIGN KEY(conversation_id) REFERENCES social_conversations(id) ON DELETE CASCADE,
  FOREIGN KEY(sender_user_id) REFERENCES users(id) ON DELETE RESTRICT,
  UNIQUE(sender_user_id,idempotency_key)
) STRICT;
CREATE INDEX IF NOT EXISTS idx_social_messages_conversation ON social_messages(conversation_id,created_at,id);

CREATE TABLE IF NOT EXISTS social_message_events (
  id TEXT PRIMARY KEY,
  message_id TEXT NOT NULL,
  actor_user_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  previous_content_hash TEXT NOT NULL DEFAULT '',
  details_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  FOREIGN KEY(message_id) REFERENCES social_messages(id) ON DELETE CASCADE,
  FOREIGN KEY(actor_user_id) REFERENCES users(id) ON DELETE RESTRICT
) STRICT;

CREATE TABLE IF NOT EXISTS social_groups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  icon_key TEXT NOT NULL DEFAULT 'GI_GROUP_BLUE',
  owner_user_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  conversation_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(owner_user_id) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY(conversation_id) REFERENCES social_conversations(id) ON DELETE SET NULL
) STRICT;

CREATE TABLE IF NOT EXISTS social_group_members (
  group_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  group_role TEXT NOT NULL DEFAULT 'MEMBER',
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  invited_by TEXT,
  joined_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY(group_id,user_id),
  FOREIGN KEY(group_id) REFERENCES social_groups(id) ON DELETE CASCADE,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY(invited_by) REFERENCES users(id) ON DELETE SET NULL
) STRICT;

CREATE TABLE IF NOT EXISTS social_group_invitations (
  id TEXT PRIMARY KEY,
  group_id TEXT NOT NULL,
  target_user_id TEXT NOT NULL,
  invited_by TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(group_id) REFERENCES social_groups(id) ON DELETE CASCADE,
  FOREIGN KEY(target_user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY(invited_by) REFERENCES users(id) ON DELETE RESTRICT,
  UNIQUE(group_id,target_user_id,status)
) STRICT;

CREATE TABLE IF NOT EXISTS social_communities (
  id TEXT PRIMARY KEY,
  game_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  rules_text TEXT NOT NULL DEFAULT '',
  icon_key TEXT NOT NULL DEFAULT 'GI_COMMUNITY_BLUE',
  owner_user_id TEXT NOT NULL,
  membership_mode TEXT NOT NULL DEFAULT 'REQUEST',
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(game_id) REFERENCES games(id) ON DELETE CASCADE,
  FOREIGN KEY(owner_user_id) REFERENCES users(id) ON DELETE RESTRICT
) STRICT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_social_community_game ON social_communities(game_id) WHERE status='ACTIVE';

CREATE TABLE IF NOT EXISTS social_community_members (
  community_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  community_role TEXT NOT NULL DEFAULT 'MEMBER',
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  joined_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY(community_id,user_id),
  FOREIGN KEY(community_id) REFERENCES social_communities(id) ON DELETE CASCADE,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
) STRICT;

CREATE TABLE IF NOT EXISTS social_community_channels (
  id TEXT PRIMARY KEY,
  community_id TEXT NOT NULL,
  channel_key TEXT NOT NULL,
  label TEXT NOT NULL,
  channel_type TEXT NOT NULL DEFAULT 'CHAT',
  position INTEGER NOT NULL DEFAULT 0,
  posting_role TEXT NOT NULL DEFAULT 'MEMBER',
  archived INTEGER NOT NULL DEFAULT 0 CHECK(archived IN (0,1)),
  created_at TEXT NOT NULL,
  FOREIGN KEY(community_id) REFERENCES social_communities(id) ON DELETE CASCADE,
  UNIQUE(community_id,channel_key)
) STRICT;

CREATE TABLE IF NOT EXISTS social_wiki_pages (
  id TEXT PRIMARY KEY,
  community_id TEXT NOT NULL,
  game_id TEXT NOT NULL,
  canonical_page_id TEXT,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'DRAFT',
  revision INTEGER NOT NULL DEFAULT 1,
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(community_id) REFERENCES social_communities(id) ON DELETE CASCADE,
  FOREIGN KEY(game_id) REFERENCES games(id) ON DELETE CASCADE,
  FOREIGN KEY(canonical_page_id) REFERENCES pages(id) ON DELETE SET NULL,
  FOREIGN KEY(created_by) REFERENCES users(id) ON DELETE RESTRICT,
  UNIQUE(community_id,slug)
) STRICT;

CREATE TABLE IF NOT EXISTS social_wiki_revisions (
  id TEXT PRIMARY KEY,
  wiki_page_id TEXT NOT NULL,
  revision INTEGER NOT NULL,
  content_json TEXT NOT NULL DEFAULT '{}',
  source_urls_json TEXT NOT NULL DEFAULT '[]',
  change_summary TEXT NOT NULL DEFAULT '',
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY(wiki_page_id) REFERENCES social_wiki_pages(id) ON DELETE CASCADE,
  FOREIGN KEY(created_by) REFERENCES users(id) ON DELETE RESTRICT,
  UNIQUE(wiki_page_id,revision)
) STRICT;

CREATE TABLE IF NOT EXISTS social_boards (
  id TEXT PRIMARY KEY,
  owner_type TEXT NOT NULL,
  owner_id TEXT NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(created_by) REFERENCES users(id) ON DELETE RESTRICT
) STRICT;

CREATE TABLE IF NOT EXISTS social_board_columns (
  id TEXT PRIMARY KEY,
  board_id TEXT NOT NULL,
  title TEXT NOT NULL,
  position INTEGER NOT NULL,
  archived INTEGER NOT NULL DEFAULT 0 CHECK(archived IN (0,1)),
  FOREIGN KEY(board_id) REFERENCES social_boards(id) ON DELETE CASCADE,
  UNIQUE(board_id,position)
) STRICT;

CREATE TABLE IF NOT EXISTS social_board_cards (
  id TEXT PRIMARY KEY,
  column_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  assigned_user_id TEXT,
  due_at TEXT NOT NULL DEFAULT '',
  labels_json TEXT NOT NULL DEFAULT '[]',
  position INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(column_id) REFERENCES social_board_columns(id) ON DELETE CASCADE,
  FOREIGN KEY(assigned_user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY(created_by) REFERENCES users(id) ON DELETE RESTRICT
) STRICT;

CREATE TABLE IF NOT EXISTS social_card_checklist_items (
  id TEXT PRIMARY KEY,
  card_id TEXT NOT NULL,
  label TEXT NOT NULL,
  completed INTEGER NOT NULL DEFAULT 0 CHECK(completed IN (0,1)),
  position INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(card_id) REFERENCES social_board_cards(id) ON DELETE CASCADE,
  UNIQUE(card_id,position)
) STRICT;

CREATE TABLE IF NOT EXISTS social_card_comments (
  id TEXT PRIMARY KEY,
  card_id TEXT NOT NULL,
  author_user_id TEXT NOT NULL,
  content TEXT NOT NULL,
  moderation_status TEXT NOT NULL DEFAULT 'ALLOW',
  created_at TEXT NOT NULL,
  deleted_at TEXT NOT NULL DEFAULT '',
  FOREIGN KEY(card_id) REFERENCES social_board_cards(id) ON DELETE CASCADE,
  FOREIGN KEY(author_user_id) REFERENCES users(id) ON DELETE RESTRICT
) STRICT;

CREATE TABLE IF NOT EXISTS social_activity (
  id TEXT PRIMARY KEY,
  scope_type TEXT NOT NULL,
  scope_id TEXT NOT NULL,
  actor_user_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  summary_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  FOREIGN KEY(actor_user_id) REFERENCES users(id) ON DELETE RESTRICT
) STRICT;

CREATE TABLE IF NOT EXISTS social_notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  target_url TEXT NOT NULL DEFAULT '',
  read_at TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
) STRICT;
CREATE INDEX IF NOT EXISTS idx_social_notifications_user ON social_notifications(user_id,read_at,created_at DESC);

CREATE TABLE IF NOT EXISTS social_reports (
  id TEXT PRIMARY KEY,
  reporter_user_id TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  fingerprint TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'OPEN',
  duplicate_of_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(reporter_user_id) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY(duplicate_of_id) REFERENCES social_reports(id) ON DELETE SET NULL
) STRICT;
CREATE INDEX IF NOT EXISTS idx_social_reports_fingerprint ON social_reports(fingerprint,created_at DESC);

CREATE TABLE IF NOT EXISTS moderation_scans (
  id TEXT PRIMARY KEY,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  decision TEXT NOT NULL,
  reason_codes_json TEXT NOT NULL DEFAULT '[]',
  risk_score REAL NOT NULL DEFAULT 0,
  evidence_hash TEXT NOT NULL DEFAULT '',
  scanner_version TEXT NOT NULL DEFAULT 'DEXTER_SAFETY_7_LOCAL',
  created_at TEXT NOT NULL
) STRICT;

CREATE TABLE IF NOT EXISTS moderation_cases (
  id TEXT PRIMARY KEY,
  report_id TEXT,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'OPEN',
  severity TEXT NOT NULL DEFAULT 'MEDIUM',
  minimal_context_json TEXT NOT NULL DEFAULT '{}',
  assigned_to TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(report_id) REFERENCES social_reports(id) ON DELETE SET NULL,
  FOREIGN KEY(assigned_to) REFERENCES users(id) ON DELETE SET NULL
) STRICT;

CREATE TABLE IF NOT EXISTS moderation_decisions (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL,
  actor_user_id TEXT NOT NULL,
  action TEXT NOT NULL,
  reason TEXT NOT NULL,
  permanent INTEGER NOT NULL DEFAULT 0 CHECK(permanent IN (0,1)),
  created_at TEXT NOT NULL,
  FOREIGN KEY(case_id) REFERENCES moderation_cases(id) ON DELETE CASCADE,
  FOREIGN KEY(actor_user_id) REFERENCES users(id) ON DELETE RESTRICT
) STRICT;

CREATE TABLE IF NOT EXISTS moderation_appeals (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL,
  appellant_user_id TEXT NOT NULL,
  statement TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'OPEN',
  reviewed_by TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(case_id) REFERENCES moderation_cases(id) ON DELETE CASCADE,
  FOREIGN KEY(appellant_user_id) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY(reviewed_by) REFERENCES users(id) ON DELETE SET NULL
) STRICT;

CREATE TABLE IF NOT EXISTS simulator_suites (
  id TEXT PRIMARY KEY,
  suite_key TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  version TEXT NOT NULL DEFAULT '1.0',
  tester_approved INTEGER NOT NULL DEFAULT 1 CHECK(tester_approved IN (0,1)),
  destructive INTEGER NOT NULL DEFAULT 0 CHECK(destructive IN (0,1)),
  active INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0,1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
) STRICT;

CREATE TABLE IF NOT EXISTS simulator_suite_cases (
  id TEXT PRIMARY KEY,
  suite_id TEXT NOT NULL,
  case_key TEXT NOT NULL,
  domain TEXT NOT NULL,
  title TEXT NOT NULL,
  position INTEGER NOT NULL,
  assertion_key TEXT NOT NULL,
  expected_json TEXT NOT NULL DEFAULT '{}',
  active INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0,1)),
  FOREIGN KEY(suite_id) REFERENCES simulator_suites(id) ON DELETE CASCADE,
  UNIQUE(suite_id,case_key)
) STRICT;

CREATE TABLE IF NOT EXISTS simulator_runs (
  id TEXT PRIMARY KEY,
  suite_id TEXT NOT NULL,
  actor_user_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'QUEUED',
  environment TEXT NOT NULL,
  app_version TEXT NOT NULL,
  schema_version INTEGER NOT NULL,
  fixture_set TEXT NOT NULL DEFAULT 'READ_ONLY_PROBES',
  isolation_mode TEXT NOT NULL DEFAULT 'READ_ONLY_PROBES',
  summary_json TEXT NOT NULL DEFAULT '{}',
  cancel_requested INTEGER NOT NULL DEFAULT 0 CHECK(cancel_requested IN (0,1)),
  created_at TEXT NOT NULL,
  started_at TEXT NOT NULL DEFAULT '',
  completed_at TEXT NOT NULL DEFAULT '',
  FOREIGN KEY(suite_id) REFERENCES simulator_suites(id) ON DELETE RESTRICT,
  FOREIGN KEY(actor_user_id) REFERENCES users(id) ON DELETE RESTRICT
) STRICT;
CREATE INDEX IF NOT EXISTS idx_simulator_runs_actor ON simulator_runs(actor_user_id,created_at DESC);

CREATE TABLE IF NOT EXISTS simulator_case_results (
  id TEXT PRIMARY KEY,
  run_id TEXT NOT NULL,
  case_id TEXT NOT NULL,
  status TEXT NOT NULL,
  expected_json TEXT NOT NULL DEFAULT '{}',
  observed_json TEXT NOT NULL DEFAULT '{}',
  component TEXT NOT NULL,
  stage TEXT NOT NULL,
  evidence_json TEXT NOT NULL DEFAULT '{}',
  error_code TEXT NOT NULL DEFAULT '',
  probable_cause TEXT NOT NULL DEFAULT '',
  retryable INTEGER NOT NULL DEFAULT 0 CHECK(retryable IN (0,1)),
  recommended_action TEXT NOT NULL DEFAULT '',
  failure_fingerprint TEXT NOT NULL DEFAULT '',
  elapsed_ms INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  FOREIGN KEY(run_id) REFERENCES simulator_runs(id) ON DELETE CASCADE,
  FOREIGN KEY(case_id) REFERENCES simulator_suite_cases(id) ON DELETE RESTRICT,
  UNIQUE(run_id,case_id)
) STRICT;

CREATE TABLE IF NOT EXISTS simulator_root_causes (
  id TEXT PRIMARY KEY,
  run_id TEXT NOT NULL,
  fingerprint TEXT NOT NULL,
  error_code TEXT NOT NULL,
  component TEXT NOT NULL,
  stage TEXT NOT NULL,
  probable_cause TEXT NOT NULL,
  affected_count INTEGER NOT NULL DEFAULT 0,
  bug_id TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY(run_id) REFERENCES simulator_runs(id) ON DELETE CASCADE,
  FOREIGN KEY(bug_id) REFERENCES bugs(id) ON DELETE SET NULL,
  UNIQUE(run_id,fingerprint)
) STRICT;

INSERT INTO simulator_suites(id,suite_key,title,description,version,tester_approved,destructive,active,created_at,updated_at)
VALUES('sim-suite-core-096','CORE_SAFE','Mega Simulator — Core Safe','25 read-only and isolated checks for Beta 0.96','1.0',1,0,1,datetime('now'),datetime('now'))
ON CONFLICT(suite_key) DO UPDATE SET title=excluded.title,description=excluded.description,version=excluded.version,tester_approved=1,destructive=0,active=1,updated_at=excluded.updated_at;

INSERT INTO update_log_entries(version,title,codename,release_date,sections_json,tags_json,public,created_at)
VALUES(
  '0.96','GameIndex Beta 0.96','Foundation & Collaborative Intelligence','2026-08-20',
  '{"NEW":["Creator Control Center V2","Social Lab Alpha exclusivo para TESTER","Mega Simulator V1","Dexter IA 7.0"],"FIXED":["Pesquisa persistente do Content Manifest","Agrupamento de causas sistêmicas","Lista inicial de usuários e alteração sem prompt nativo"],"IMPROVED":["Admin Panel V3","Temas de função","Schema 19 aditivo","Privacidade e moderação local-first"]}',
  '["NEW","SOCIAL_LAB","SIMULATOR","AI7","CREATOR_CONTROL","SECURITY","AZURE","NO_API_KEY"]',1,datetime('now')
)
ON CONFLICT(version) DO UPDATE SET title=excluded.title,codename=excluded.codename,release_date=excluded.release_date,sections_json=excluded.sections_json,tags_json=excluded.tags_json,public=excluded.public;

INSERT INTO meta(key,value) VALUES('beta_096_foundation','1') ON CONFLICT(key) DO UPDATE SET value='1';
INSERT INTO meta(key,value) VALUES('beta_096_ai_system','7.0') ON CONFLICT(key) DO UPDATE SET value='7.0';
INSERT INTO meta(key,value) VALUES('beta_096_social_lab','TESTER_EXPERIMENTAL') ON CONFLICT(key) DO UPDATE SET value='TESTER_EXPERIMENTAL';
INSERT INTO meta(key,value) VALUES('beta_096_simulator','1') ON CONFLICT(key) DO UPDATE SET value='1';
INSERT INTO meta(key,value) VALUES('beta_096_no_api_key','1') ON CONFLICT(key) DO UPDATE SET value='1';
INSERT INTO meta(key,value) VALUES('beta_096_visual_policy','NO_PEOPLE_NO_WOMEN') ON CONFLICT(key) DO UPDATE SET value='NO_PEOPLE_NO_WOMEN';
