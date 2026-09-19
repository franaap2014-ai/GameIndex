PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
) STRICT;

CREATE TABLE IF NOT EXISTS games (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  developer TEXT NOT NULL DEFAULT '',
  publisher TEXT NOT NULL DEFAULT '',
  release_date TEXT NOT NULL DEFAULT '',
  platforms_json TEXT NOT NULL DEFAULT '[]',
  genres_json TEXT NOT NULL DEFAULT '[]',
  franchise TEXT NOT NULL DEFAULT '',
  official_url TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'PUBLISHED',
  template TEXT NOT NULL DEFAULT 'generic',
  aliases_json TEXT NOT NULL DEFAULT '[]',
  visual_query TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
) STRICT;

CREATE TABLE IF NOT EXISTS game_tabs (
  id TEXT PRIMARY KEY,
  game_id TEXT NOT NULL,
  tab_id TEXT NOT NULL,
  label TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '•',
  description TEXT NOT NULL DEFAULT '',
  position INTEGER NOT NULL DEFAULT 0,
  UNIQUE(game_id, tab_id),
  FOREIGN KEY(game_id) REFERENCES games(id) ON DELETE CASCADE
) STRICT;

CREATE TABLE IF NOT EXISTS game_sections (
  id TEXT PRIMARY KEY,
  game_id TEXT NOT NULL,
  tab_id TEXT NOT NULL,
  section_id TEXT NOT NULL,
  label TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  position INTEGER NOT NULL DEFAULT 0,
  UNIQUE(game_id, tab_id, section_id),
  FOREIGN KEY(game_id) REFERENCES games(id) ON DELETE CASCADE
) STRICT;

CREATE TABLE IF NOT EXISTS entities (
  id TEXT PRIMARY KEY,
  game_id TEXT NOT NULL,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'unknown',
  aliases_json TEXT NOT NULL DEFAULT '[]',
  summary TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(game_id, slug),
  FOREIGN KEY(game_id) REFERENCES games(id) ON DELETE CASCADE
) STRICT;

CREATE TABLE IF NOT EXISTS sources (
  id TEXT PRIMARY KEY,
  source_type TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  url TEXT NOT NULL UNIQUE,
  adapter_key TEXT NOT NULL DEFAULT '',
  quality REAL NOT NULL DEFAULT 0.5,
  retrieved_at TEXT NOT NULL,
  metadata_json TEXT NOT NULL DEFAULT '{}'
) STRICT;

CREATE TABLE IF NOT EXISTS evidence (
  id TEXT PRIMARY KEY,
  game_id TEXT NOT NULL,
  entity_id TEXT,
  claim_text TEXT NOT NULL,
  source_id TEXT NOT NULL,
  relevance REAL NOT NULL DEFAULT 0,
  source_quality REAL NOT NULL DEFAULT 0.5,
  extracted_at TEXT NOT NULL,
  metadata_json TEXT NOT NULL DEFAULT '{}',
  FOREIGN KEY(game_id) REFERENCES games(id) ON DELETE CASCADE,
  FOREIGN KEY(entity_id) REFERENCES entities(id) ON DELETE SET NULL,
  FOREIGN KEY(source_id) REFERENCES sources(id) ON DELETE CASCADE
) STRICT;

CREATE TABLE IF NOT EXISTS knowledge (
  id TEXT PRIMARY KEY,
  game_id TEXT NOT NULL,
  entity_id TEXT,
  title TEXT NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  canon_status TEXT NOT NULL DEFAULT 'UNKNOWN',
  status TEXT NOT NULL DEFAULT 'CURRENT',
  confidence REAL NOT NULL DEFAULT 0.5,
  game_version TEXT NOT NULL DEFAULT '',
  valid_from TEXT NOT NULL DEFAULT '',
  valid_until TEXT NOT NULL DEFAULT '',
  verified_at TEXT NOT NULL DEFAULT '',
  tab_id TEXT NOT NULL DEFAULT 'overview',
  section_id TEXT NOT NULL DEFAULT 'summary',
  topics_json TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(game_id) REFERENCES games(id) ON DELETE CASCADE,
  FOREIGN KEY(entity_id) REFERENCES entities(id) ON DELETE SET NULL
) STRICT;

CREATE TABLE IF NOT EXISTS claims (
  id TEXT PRIMARY KEY,
  knowledge_id TEXT NOT NULL,
  text TEXT NOT NULL,
  canon_status TEXT NOT NULL DEFAULT 'UNKNOWN',
  confidence REAL NOT NULL DEFAULT 0.5,
  game_version TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'CURRENT',
  source_ids_json TEXT NOT NULL DEFAULT '[]',
  evidence_ids_json TEXT NOT NULL DEFAULT '[]',
  verified_at TEXT NOT NULL DEFAULT '',
  FOREIGN KEY(knowledge_id) REFERENCES knowledge(id) ON DELETE CASCADE
) STRICT;

CREATE TABLE IF NOT EXISTS relationships (
  id TEXT PRIMARY KEY,
  game_id TEXT NOT NULL,
  source_entity_id TEXT NOT NULL,
  relation_type TEXT NOT NULL,
  target_entity_id TEXT NOT NULL,
  metadata_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  UNIQUE(game_id, source_entity_id, relation_type, target_entity_id),
  FOREIGN KEY(game_id) REFERENCES games(id) ON DELETE CASCADE,
  FOREIGN KEY(source_entity_id) REFERENCES entities(id) ON DELETE CASCADE,
  FOREIGN KEY(target_entity_id) REFERENCES entities(id) ON DELETE CASCADE
) STRICT;

CREATE TABLE IF NOT EXISTS images (
  id TEXT PRIMARY KEY,
  game_id TEXT NOT NULL,
  entity_id TEXT,
  role TEXT NOT NULL,
  subject TEXT NOT NULL DEFAULT '',
  url TEXT NOT NULL,
  source_url TEXT NOT NULL DEFAULT '',
  confidence REAL NOT NULL DEFAULT 0.5,
  verified INTEGER NOT NULL DEFAULT 0,
  width INTEGER,
  height INTEGER,
  aspect_ratio REAL,
  license_info TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'CANDIDATE',
  created_at TEXT NOT NULL,
  UNIQUE(game_id, entity_id, role, url),
  FOREIGN KEY(game_id) REFERENCES games(id) ON DELETE CASCADE,
  FOREIGN KEY(entity_id) REFERENCES entities(id) ON DELETE CASCADE
) STRICT;

CREATE TABLE IF NOT EXISTS research_history (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL DEFAULT '',
  query TEXT NOT NULL,
  game_id TEXT,
  entity_name TEXT NOT NULL DEFAULT '',
  result_status TEXT NOT NULL DEFAULT '',
  sources_json TEXT NOT NULL DEFAULT '[]',
  knowledge_created_json TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL,
  FOREIGN KEY(game_id) REFERENCES games(id) ON DELETE SET NULL
) STRICT;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL DEFAULT '',
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
) STRICT;

CREATE TABLE IF NOT EXISTS user_preferences (
  user_id TEXT PRIMARY KEY,
  language TEXT NOT NULL DEFAULT 'pt-BR',
  theme TEXT NOT NULL DEFAULT 'dark',
  updated_at TEXT NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
) STRICT;

CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
) STRICT;

CREATE TABLE IF NOT EXISTS subscriptions (
  user_id TEXT PRIMARY KEY,
  plan TEXT NOT NULL DEFAULT 'FREE',
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  updated_at TEXT NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
) STRICT;

CREATE INDEX IF NOT EXISTS idx_entities_game ON entities(game_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_game ON knowledge(game_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_entity ON knowledge(entity_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_tab_section ON knowledge(game_id, tab_id, section_id);
CREATE INDEX IF NOT EXISTS idx_evidence_game ON evidence(game_id);
CREATE INDEX IF NOT EXISTS idx_images_game_role ON images(game_id, role);
CREATE INDEX IF NOT EXISTS idx_research_created ON research_history(created_at);
