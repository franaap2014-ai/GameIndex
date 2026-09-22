PRAGMA foreign_keys = ON;
-- GameIndex Beta 0.9915 I1 HF1 — Full Recovery Hotfix
-- Additive recovery only. Preserve existing games and only create missing Roblox starter experiences.

INSERT OR IGNORE INTO games(
  id,slug,name,description,developer,publisher,release_date,platforms_json,genres_json,franchise,
  official_url,status,template,aliases_json,visual_query,created_at,updated_at,
  entity_type,parent_game_id,root_game_id,relationship_type,visibility
)
SELECT
  'game-roblox-blox-fruits','blox-fruits','Blox Fruits',
  'Experiência de aventura e progressão dentro do Roblox, com exploração, combate e evolução de personagem.',
  'Gamer Robot Inc','Gamer Robot Inc','',
  '["PC","Consoles","Mobile"]','["Aventura","RPG","Ação"]','Roblox',
  '','PUBLISHED','generic','["Blox Fruits Roblox"]','Blox Fruits Roblox',datetime('now'),datetime('now'),
  'EXPERIENCE',p.id,p.id,'EXPERIENCE_OF','PUBLIC'
FROM games p WHERE lower(p.slug)='roblox' LIMIT 1;

INSERT OR IGNORE INTO games(
  id,slug,name,description,developer,publisher,release_date,platforms_json,genres_json,franchise,
  official_url,status,template,aliases_json,visual_query,created_at,updated_at,
  entity_type,parent_game_id,root_game_id,relationship_type,visibility
)
SELECT
  'game-roblox-doors','doors','DOORS',
  'Experiência de suspense e exploração dentro do Roblox, estruturada em salas, encontros e progressão por tentativa.',
  'LSPLASH','LSPLASH','',
  '["PC","Consoles","Mobile"]','["Horror","Aventura"]','Roblox',
  '','PUBLISHED','generic','["DOORS Roblox"]','DOORS Roblox',datetime('now'),datetime('now'),
  'EXPERIENCE',p.id,p.id,'EXPERIENCE_OF','PUBLIC'
FROM games p WHERE lower(p.slug)='roblox' LIMIT 1;

INSERT OR IGNORE INTO games(
  id,slug,name,description,developer,publisher,release_date,platforms_json,genres_json,franchise,
  official_url,status,template,aliases_json,visual_query,created_at,updated_at,
  entity_type,parent_game_id,root_game_id,relationship_type,visibility
)
SELECT
  'game-roblox-fisch','fisch','Fisch',
  'Experiência de pesca e exploração dentro do Roblox, com progressão, descoberta de áreas e coleção de peixes.',
  'Fisching','Fisching','',
  '["PC","Consoles","Mobile"]','["Aventura","Simulação"]','Roblox',
  '','PUBLISHED','generic','["Fisch Roblox"]','Fisch Roblox',datetime('now'),datetime('now'),
  'EXPERIENCE',p.id,p.id,'EXPERIENCE_OF','PUBLIC'
FROM games p WHERE lower(p.slug)='roblox' LIMIT 1;

INSERT OR IGNORE INTO games(
  id,slug,name,description,developer,publisher,release_date,platforms_json,genres_json,franchise,
  official_url,status,template,aliases_json,visual_query,created_at,updated_at,
  entity_type,parent_game_id,root_game_id,relationship_type,visibility
)
SELECT
  'game-roblox-pizza-place','work-at-a-pizza-place','Work at a Pizza Place',
  'Experiência clássica do Roblox centrada em trabalhos cooperativos, administração de uma pizzaria e interação social.',
  'Dued1','Dued1','',
  '["PC","Consoles","Mobile"]','["Simulação","Social"]','Roblox',
  '','PUBLISHED','generic','["Work at a Pizza Place Roblox"]','Work at a Pizza Place Roblox',datetime('now'),datetime('now'),
  'EXPERIENCE',p.id,p.id,'EXPERIENCE_OF','PUBLIC'
FROM games p WHERE lower(p.slug)='roblox' LIMIT 1;

INSERT OR IGNORE INTO games(
  id,slug,name,description,developer,publisher,release_date,platforms_json,genres_json,franchise,
  official_url,status,template,aliases_json,visual_query,created_at,updated_at,
  entity_type,parent_game_id,root_game_id,relationship_type,visibility
)
SELECT
  'game-roblox-prison-life','prison-life','Prison Life',
  'Experiência clássica de ação e fuga dentro do Roblox, com papéis de prisioneiro, guarda e criminoso.',
  'Aesthetical','Aesthetical','',
  '["PC","Consoles","Mobile"]','["Ação","Roleplay"]','Roblox',
  '','PUBLISHED','generic','["Prison Life Roblox"]','Prison Life Roblox',datetime('now'),datetime('now'),
  'EXPERIENCE',p.id,p.id,'EXPERIENCE_OF','PUBLIC'
FROM games p WHERE lower(p.slug)='roblox' LIMIT 1;

-- Existing rows win for content, but their relationship to Roblox is repaired.
UPDATE games
SET entity_type='EXPERIENCE',
    parent_game_id=(SELECT id FROM games WHERE lower(slug)='roblox' LIMIT 1),
    root_game_id=(SELECT id FROM games WHERE lower(slug)='roblox' LIMIT 1),
    relationship_type='EXPERIENCE_OF',
    visibility='PUBLIC',
    status='PUBLISHED',
    updated_at=datetime('now')
WHERE lower(slug) IN ('blox-fruits','doors','fisch','work-at-a-pizza-place','prison-life')
  AND EXISTS(SELECT 1 FROM games WHERE lower(slug)='roblox');

-- Minimal navigation for newly-created experience rows. Existing richer tabs are preserved.
INSERT OR IGNORE INTO game_tabs(id,game_id,tab_id,label,icon,description,position)
SELECT 'tab-blox-fruits-overview',id,'overview','Visão geral','◈','Visão geral da experiência.',0 FROM games WHERE slug='blox-fruits';
INSERT OR IGNORE INTO game_tabs(id,game_id,tab_id,label,icon,description,position)
SELECT 'tab-doors-overview',id,'overview','Visão geral','◈','Visão geral da experiência.',0 FROM games WHERE slug='doors';
INSERT OR IGNORE INTO game_tabs(id,game_id,tab_id,label,icon,description,position)
SELECT 'tab-fisch-overview',id,'overview','Visão geral','◈','Visão geral da experiência.',0 FROM games WHERE slug='fisch';
INSERT OR IGNORE INTO game_tabs(id,game_id,tab_id,label,icon,description,position)
SELECT 'tab-pizza-overview',id,'overview','Visão geral','◈','Visão geral da experiência.',0 FROM games WHERE slug='work-at-a-pizza-place';
INSERT OR IGNORE INTO game_tabs(id,game_id,tab_id,label,icon,description,position)
SELECT 'tab-prison-life-overview',id,'overview','Visão geral','◈','Visão geral da experiência.',0 FROM games WHERE slug='prison-life';

INSERT INTO meta(key,value) VALUES('runtime_version','0.9915-I1-HF1')
ON CONFLICT(key) DO UPDATE SET value=excluded.value;
INSERT INTO meta(key,value) VALUES('public_version','0.9915')
ON CONFLICT(key) DO UPDATE SET value=excluded.value;
INSERT INTO meta(key,value) VALUES('runtime_release','BETA_0_9915_I1_HF1_FULL_RECOVERY')
ON CONFLICT(key) DO UPDATE SET value=excluded.value;
INSERT INTO meta(key,value) VALUES('beta_09915_i1_hf1','1')
ON CONFLICT(key) DO UPDATE SET value='1';
