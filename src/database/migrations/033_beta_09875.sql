PRAGMA foreign_keys = ON;
-- GameIndex Beta 0.9875 — Full Page Personalization Polish.
-- No destructive schema changes. LOGO/BANNER use the existing media tables;
-- game-level aliases remain COVER/HERO for production compatibility.

INSERT INTO update_log_entries(version,title,codename,release_date,sections_json,tags_json,public,created_at)
VALUES(
  '0.9875','GameIndex Beta 0.9875','Full Page Personalization Polish','2026-09-05',
  '{"NEW":["Image Manager 3.0 simplificado em LOGO + BANNER","BANNER canônico por experiência e era"],"FIXED":["Roblox: seção inferior usa Experiências em vez de Franquia","Troca Modern ↔ OG atualiza LOGO e BANNER sem refresh"],"IMPROVED":["Personalização Roblox Modern aplicada à página inteira","Personalização Roblox OG aplicada à página inteira","Fallback de mídia legado preservado","Polimento responsivo e prevenção de FOUC"]}',
  '["FULL_PAGE_PERSONALIZATION","IMAGE_MANAGER_3","LOGO_BANNER","ROBLOX_MODERN","ROBLOX_OG","POLISH"]',1,datetime('now')
)
ON CONFLICT(version) DO UPDATE SET title=excluded.title,codename=excluded.codename,release_date=excluded.release_date,sections_json=excluded.sections_json,tags_json=excluded.tags_json,public=excluded.public;

INSERT INTO meta(key,value) VALUES('beta_09875','1') ON CONFLICT(key) DO UPDATE SET value='1';
INSERT INTO meta(key,value) VALUES('runtime_release','BETA_0_9875_FULL_PAGE_PERSONALIZATION') ON CONFLICT(key) DO UPDATE SET value=excluded.value;
