PRAGMA foreign_keys = ON;

-- GameVault Beta 0.705 — UI & Image Recovery
-- Minimal compatibility migration. No user/content rows are recreated.

UPDATE images
SET storage_type='REMOTE'
WHERE COALESCE(storage_type,'')='';

UPDATE images
SET updated_at=COALESCE(NULLIF(updated_at,''),created_at)
WHERE COALESCE(updated_at,'')='';

CREATE INDEX IF NOT EXISTS idx_images_legacy_verified
ON images(game_id,entity_id,role,verified_at,status,confidence DESC)
WHERE url<>'' AND verified_at<>'';

CREATE INDEX IF NOT EXISTS idx_images_url_status
ON images(url,status)
WHERE url<>'';

INSERT INTO meta(key,value) VALUES('image_legacy_fallback_enabled','1')
ON CONFLICT(key) DO UPDATE SET value='1';
