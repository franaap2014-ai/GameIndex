PRAGMA foreign_keys = ON;

-- GameVault Beta 0.8 — The Intelligence Update
-- Extends Beta 0.705 in place. No existing user/content row is recreated.

ALTER TABLE users ADD COLUMN account_tier TEXT NOT NULL DEFAULT 'FREE';

ALTER TABLE subscriptions ADD COLUMN subscription_id TEXT NOT NULL DEFAULT '';
ALTER TABLE subscriptions ADD COLUMN provider TEXT NOT NULL DEFAULT '';
ALTER TABLE subscriptions ADD COLUMN provider_customer_id TEXT NOT NULL DEFAULT '';
ALTER TABLE subscriptions ADD COLUMN provider_subscription_id TEXT NOT NULL DEFAULT '';
ALTER TABLE subscriptions ADD COLUMN price_cents INTEGER NOT NULL DEFAULT 0;
ALTER TABLE subscriptions ADD COLUMN currency TEXT NOT NULL DEFAULT 'BRL';
ALTER TABLE subscriptions ADD COLUMN billing_interval TEXT NOT NULL DEFAULT '';
ALTER TABLE subscriptions ADD COLUMN started_at TEXT NOT NULL DEFAULT '';
ALTER TABLE subscriptions ADD COLUMN current_period_start TEXT NOT NULL DEFAULT '';
ALTER TABLE subscriptions ADD COLUMN current_period_end TEXT NOT NULL DEFAULT '';
ALTER TABLE subscriptions ADD COLUMN cancel_at_period_end INTEGER NOT NULL DEFAULT 0;
ALTER TABLE subscriptions ADD COLUMN cancelled_at TEXT NOT NULL DEFAULT '';
ALTER TABLE subscriptions ADD COLUMN created_at TEXT NOT NULL DEFAULT '';
ALTER TABLE subscriptions ADD COLUMN last_event_id TEXT NOT NULL DEFAULT '';

CREATE TABLE IF NOT EXISTS billing_events (
  event_id TEXT PRIMARY KEY,
  provider TEXT NOT NULL,
  event_type TEXT NOT NULL,
  user_id TEXT,
  subscription_id TEXT NOT NULL DEFAULT '',
  payload_hash TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'RECEIVED',
  created_at TEXT NOT NULL,
  processed_at TEXT NOT NULL DEFAULT '',
  error_code TEXT NOT NULL DEFAULT '',
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL
) STRICT;

CREATE TABLE IF NOT EXISTS ai4_context_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  conversation_id TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'pt-BR',
  selected_game_mode TEXT NOT NULL DEFAULT 'AUTOMATIC',
  game_id TEXT,
  entity_id TEXT,
  intent TEXT NOT NULL DEFAULT '',
  context_json TEXT NOT NULL DEFAULT '{}',
  updated_at TEXT NOT NULL,
  UNIQUE(user_id, conversation_id),
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY(game_id) REFERENCES games(id) ON DELETE SET NULL,
  FOREIGN KEY(entity_id) REFERENCES entities(id) ON DELETE SET NULL
) STRICT;

CREATE TABLE IF NOT EXISTS ai_pipeline_events (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  conversation_id TEXT NOT NULL DEFAULT '',
  game_id TEXT,
  entity_id TEXT,
  component TEXT NOT NULL,
  event_type TEXT NOT NULL,
  success INTEGER NOT NULL DEFAULT 1,
  duration_ms INTEGER NOT NULL DEFAULT 0,
  metadata_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY(game_id) REFERENCES games(id) ON DELETE SET NULL,
  FOREIGN KEY(entity_id) REFERENCES entities(id) ON DELETE SET NULL
) STRICT;

CREATE TABLE IF NOT EXISTS ai_review_records (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  game_id TEXT,
  entity_id TEXT,
  review_type TEXT NOT NULL DEFAULT 'RESEARCH',
  status TEXT NOT NULL,
  confidence REAL NOT NULL DEFAULT 0,
  claim_count INTEGER NOT NULL DEFAULT 0,
  approved_claim_count INTEGER NOT NULL DEFAULT 0,
  rejected_claim_count INTEGER NOT NULL DEFAULT 0,
  source_count INTEGER NOT NULL DEFAULT 0,
  conflict_count INTEGER NOT NULL DEFAULT 0,
  details_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY(game_id) REFERENCES games(id) ON DELETE SET NULL,
  FOREIGN KEY(entity_id) REFERENCES entities(id) ON DELETE SET NULL
) STRICT;

CREATE TABLE IF NOT EXISTS autonomous_generation_queue (
  id TEXT PRIMARY KEY,
  game_id TEXT NOT NULL,
  entity_id TEXT,
  page_type TEXT NOT NULL DEFAULT 'OTHER',
  language TEXT NOT NULL DEFAULT 'pt-BR',
  priority TEXT NOT NULL DEFAULT 'NORMAL',
  status TEXT NOT NULL DEFAULT 'QUEUED',
  reason TEXT NOT NULL DEFAULT '',
  knowledge_count INTEGER NOT NULL DEFAULT 0,
  confidence REAL NOT NULL DEFAULT 0,
  generation_job_id TEXT,
  result_page_id TEXT,
  attempts INTEGER NOT NULL DEFAULT 0,
  next_attempt_at TEXT NOT NULL DEFAULT '',
  error_code TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  completed_at TEXT NOT NULL DEFAULT '',
  UNIQUE(game_id, entity_id, page_type, language),
  FOREIGN KEY(game_id) REFERENCES games(id) ON DELETE CASCADE,
  FOREIGN KEY(entity_id) REFERENCES entities(id) ON DELETE CASCADE,
  FOREIGN KEY(generation_job_id) REFERENCES generation_jobs(id) ON DELETE SET NULL,
  FOREIGN KEY(result_page_id) REFERENCES pages(id) ON DELETE SET NULL
) STRICT;

-- Migrate old theme names into the Beta 0.8 token system.
UPDATE user_preferences SET theme='FREE_DARK' WHERE lower(theme) IN ('dark','free_dark','free-dark','');
UPDATE user_preferences SET theme='FREE_LIGHT' WHERE lower(theme) IN ('light','free_light','free-light');

-- Keep the old FREE subscription rows but normalize their extended metadata.
UPDATE subscriptions
SET subscription_id=CASE WHEN subscription_id='' THEN 'sub-' || user_id ELSE subscription_id END,
    created_at=CASE WHEN created_at='' THEN updated_at ELSE created_at END,
    currency=CASE WHEN currency='' THEN 'BRL' ELSE currency END;

-- Franchesco01 is upgraded in-place to DEV only when there is exactly one normalized match.
UPDATE users
SET account_tier='DEV', updated_at=datetime('now')
WHERE id=(SELECT user_id FROM user_profiles WHERE normalized_username='franchesco01' LIMIT 1)
  AND (SELECT COUNT(*) FROM user_profiles WHERE normalized_username='franchesco01')=1;

CREATE INDEX IF NOT EXISTS idx_users_account_tier ON users(account_tier);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status,plan);
CREATE INDEX IF NOT EXISTS idx_subscriptions_provider_id ON subscriptions(provider,provider_subscription_id) WHERE provider_subscription_id<>'';
CREATE INDEX IF NOT EXISTS idx_billing_events_user_date ON billing_events(user_id,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai4_context_user_date ON ai4_context_sessions(user_id,updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_pipeline_component_date ON ai_pipeline_events(component,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_pipeline_user_date ON ai_pipeline_events(user_id,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_review_status_date ON ai_review_records(status,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_autogen_status_priority ON autonomous_generation_queue(status,priority,created_at);
CREATE INDEX IF NOT EXISTS idx_autogen_game_status ON autonomous_generation_queue(game_id,status);

INSERT INTO meta(key,value) VALUES('beta_08_ai4','1') ON CONFLICT(key) DO UPDATE SET value='1';
INSERT INTO meta(key,value) VALUES('beta_08_boss_ai','1') ON CONFLICT(key) DO UPDATE SET value='1';
INSERT INTO meta(key,value) VALUES('beta_08_autonomous_generation','1') ON CONFLICT(key) DO UPDATE SET value='1';
INSERT INTO meta(key,value) VALUES('beta_08_theme_engine','1') ON CONFLICT(key) DO UPDATE SET value='1';
