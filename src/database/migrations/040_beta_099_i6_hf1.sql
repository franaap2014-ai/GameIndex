-- GameIndex Beta 0.99 I6 HF1 — build reliability & state consistency
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS universe_build_job_state (
  build_id TEXT PRIMARY KEY REFERENCES universe_builds(id) ON DELETE CASCADE,
  owner_user_id TEXT NULL REFERENCES users(id) ON DELETE SET NULL,
  state TEXT NOT NULL DEFAULT 'QUEUED' CHECK(state IN ('QUEUED','RUNNING','INTERRUPTED','FAILED','COMPLETED','CANCELLED','PARTIAL')),
  resumable INTEGER NOT NULL DEFAULT 1 CHECK(resumable IN (0,1)),
  last_safe_stage TEXT NOT NULL DEFAULT 'RESEARCH',
  last_checkpoint_json TEXT NOT NULL DEFAULT '{}',
  heartbeat_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
) STRICT;
CREATE INDEX IF NOT EXISTS idx_universe_build_job_state_owner ON universe_build_job_state(owner_user_id,state,updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_universe_build_job_state_state ON universe_build_job_state(state,updated_at DESC);

CREATE TABLE IF NOT EXISTS universe_build_job_stages (
  build_id TEXT NOT NULL REFERENCES universe_builds(id) ON DELETE CASCADE,
  stage TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'WAITING' CHECK(status IN ('WAITING','RUNNING','PARTIAL','READY','FAILED','SKIPPED','CANCELLED','INTERRUPTED')),
  checkpoint_json TEXT NOT NULL DEFAULT '{}',
  started_at TEXT NOT NULL DEFAULT '',
  completed_at TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL,
  PRIMARY KEY(build_id,stage)
) STRICT;
CREATE INDEX IF NOT EXISTS idx_universe_build_job_stages_build ON universe_build_job_stages(build_id,updated_at DESC);

INSERT INTO universe_build_job_state(build_id,owner_user_id,state,resumable,last_safe_stage,last_checkpoint_json,heartbeat_at,created_at,updated_at)
SELECT id,requested_by,
  CASE status WHEN 'RUNNING' THEN 'INTERRUPTED' WHEN 'QUEUED' THEN 'INTERRUPTED' WHEN 'COMPLETED' THEN 'COMPLETED' WHEN 'FAILED' THEN 'FAILED' WHEN 'CANCELLED' THEN 'CANCELLED' ELSE 'PARTIAL' END,
  CASE WHEN status IN ('COMPLETED','CANCELLED') THEN 0 ELSE 1 END,
  current_stage,'{}',updated_at,created_at,updated_at
FROM universe_builds
WHERE NOT EXISTS(SELECT 1 FROM universe_build_job_state s WHERE s.build_id=universe_builds.id);

UPDATE universe_builds SET status='PARTIAL', error_code=CASE WHEN error_code='' THEN 'BUILD_INTERRUPTED' ELSE error_code END, error_message=CASE WHEN error_message='' THEN 'Build interrupted before HF1 recovery state was installed.' ELSE error_message END
WHERE status IN ('RUNNING','QUEUED');

INSERT INTO meta(key,value) VALUES('runtime_version','0.99-I6-HF1')
ON CONFLICT(key) DO UPDATE SET value=excluded.value;
INSERT INTO meta(key,value) VALUES('runtime_release','BETA_0_99_I6_HF1_BUILD_RELIABILITY')
ON CONFLICT(key) DO UPDATE SET value=excluded.value;
INSERT INTO meta(key,value) VALUES('beta_099_i6_hf1','1') ON CONFLICT(key) DO UPDATE SET value='1';
