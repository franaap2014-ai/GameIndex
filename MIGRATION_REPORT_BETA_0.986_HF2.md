# Migration report — Beta 0.986 HF2

Final HF2 target schema: **31**.

Migration path from a correct Beta 0.986 HF1 installation:
- schema 29 -> 30: AI Slim / Roblox experience hierarchy and profiles;
- schema 30 -> 31: experience-specific media overrides.

`030_beta_0986_hf2.sql` creates `game_parent_links`, `game_experience_profiles` and `ai_runtime_counters` additively. The post-migration finalizer locates the existing Roblox record, reuses matching child-game records when present, creates only missing child records, then adds `ROBLOX_EXPERIENCE` links and visual/menu/font profiles. The canonical public title is `Prison Life`.

`031_beta_0986_hf2_experience_media.sql` creates `game_experience_media_overrides` without altering or deleting `game_media_overrides`. Existing global game images remain valid fallbacks. Experience-specific media can independently store LOGO, HERO, BACKGROUND, CARD, GALLERY or ARTWORK per `game_id + experience_key`.

Validated in an isolated database:
- schema 31 reached;
- existing schema-29 data preserved;
- five child links created/reused in configured order;
- Roblox Modern + OG profiles present;
- no child music row invented;
- independent Roblox Modern background and Roblox OG logo media persisted;
- `PRAGMA integrity_check = ok`.

Production deployment must preserve the existing persistent SQLite database and GameIndex user-content directory. The built-in migration path creates a verified backup before each schema step and rolls back the active transaction on migration failure.
