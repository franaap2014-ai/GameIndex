PRAGMA foreign_keys = ON;

ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'USER';

CREATE TABLE IF NOT EXISTS user_profiles (
  user_id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL DEFAULT '',
  bio TEXT NOT NULL DEFAULT '',
  avatar_url TEXT NOT NULL DEFAULT '',
  privacy_json TEXT NOT NULL DEFAULT '{}',
  updated_at TEXT NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
) STRICT;

CREATE TABLE IF NOT EXISTS user_follows (
  follower_user_id TEXT NOT NULL,
  following_user_id TEXT NOT NULL,
  followed_at TEXT NOT NULL,
  PRIMARY KEY(follower_user_id, following_user_id),
  CHECK(follower_user_id <> following_user_id),
  FOREIGN KEY(follower_user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY(following_user_id) REFERENCES users(id) ON DELETE CASCADE
) STRICT;

CREATE TABLE IF NOT EXISTS friend_requests (
  id TEXT PRIMARY KEY,
  sender_user_id TEXT NOT NULL,
  receiver_user_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  CHECK(sender_user_id <> receiver_user_id),
  FOREIGN KEY(sender_user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY(receiver_user_id) REFERENCES users(id) ON DELETE CASCADE
) STRICT;

CREATE TABLE IF NOT EXISTS friendships (
  user_a_id TEXT NOT NULL,
  user_b_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY(user_a_id, user_b_id),
  CHECK(user_a_id <> user_b_id),
  FOREIGN KEY(user_a_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY(user_b_id) REFERENCES users(id) ON DELETE CASCADE
) STRICT;

CREATE TABLE IF NOT EXISTS articles (
  id TEXT PRIMARY KEY,
  game_id TEXT NOT NULL,
  entity_id TEXT,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  article_type TEXT NOT NULL DEFAULT 'GAME',
  status TEXT NOT NULL DEFAULT 'DRAFT',
  language TEXT NOT NULL DEFAULT 'pt-BR',
  content_json TEXT NOT NULL DEFAULT '{}',
  knowledge_ids_json TEXT NOT NULL DEFAULT '[]',
  claim_ids_json TEXT NOT NULL DEFAULT '[]',
  source_ids_json TEXT NOT NULL DEFAULT '[]',
  evidence_ids_json TEXT NOT NULL DEFAULT '[]',
  game_version TEXT NOT NULL DEFAULT '',
  fact_safety_score REAL NOT NULL DEFAULT 0,
  source_safety_score REAL NOT NULL DEFAULT 0,
  context_safety_score REAL NOT NULL DEFAULT 0,
  overall_confidence REAL NOT NULL DEFAULT 0,
  created_by TEXT NOT NULL DEFAULT 'ARTICLE_AI',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  verified_at TEXT NOT NULL DEFAULT '',
  published_at TEXT NOT NULL DEFAULT '',
  UNIQUE(game_id, slug, language),
  FOREIGN KEY(game_id) REFERENCES games(id) ON DELETE CASCADE,
  FOREIGN KEY(entity_id) REFERENCES entities(id) ON DELETE SET NULL
) STRICT;

CREATE TABLE IF NOT EXISTS article_validations (
  id TEXT PRIMARY KEY,
  article_id TEXT NOT NULL,
  validation_type TEXT NOT NULL,
  result TEXT NOT NULL,
  score REAL NOT NULL DEFAULT 0,
  details_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  FOREIGN KEY(article_id) REFERENCES articles(id) ON DELETE CASCADE
) STRICT;

CREATE TABLE IF NOT EXISTS admin_actions (
  id TEXT PRIMARY KEY,
  admin_user_id TEXT NOT NULL,
  action_type TEXT NOT NULL,
  target_type TEXT NOT NULL DEFAULT '',
  target_id TEXT NOT NULL DEFAULT '',
  metadata_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  FOREIGN KEY(admin_user_id) REFERENCES users(id) ON DELETE CASCADE
) STRICT;

CREATE TABLE IF NOT EXISTS knowledge_quality (
  knowledge_id TEXT PRIMARY KEY,
  usefulness_score REAL NOT NULL DEFAULT 0,
  refinement_score REAL NOT NULL DEFAULT 0,
  source_score REAL NOT NULL DEFAULT 0,
  duplicate_score REAL NOT NULL DEFAULT 0,
  reviewed_at TEXT NOT NULL DEFAULT '',
  FOREIGN KEY(knowledge_id) REFERENCES knowledge(id) ON DELETE CASCADE
) STRICT;

ALTER TABLE knowledge_coverage ADD COLUMN current_knowledge_quality REAL NOT NULL DEFAULT 0;
ALTER TABLE knowledge_coverage ADD COLUMN last_reviewed_at TEXT NOT NULL DEFAULT '';

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON user_profiles(username);
CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON user_follows(follower_user_id, followed_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_follows_following ON user_follows(following_user_id, followed_at DESC);
CREATE INDEX IF NOT EXISTS idx_friend_requests_sender ON friend_requests(sender_user_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_friend_requests_receiver ON friend_requests(receiver_user_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_friendships_a ON friendships(user_a_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_friendships_b ON friendships(user_b_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_game ON articles(game_id, status, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_entity ON articles(entity_id, status, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_article_validations_article ON article_validations(article_id, validation_type);
CREATE INDEX IF NOT EXISTS idx_admin_actions_admin ON admin_actions(admin_user_id, created_at DESC);
