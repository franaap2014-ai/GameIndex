# GameIndex Beta 0.987 — Final Personalization Polish

## Release focus
Beta 0.987 consolidates the existing GameIndex theme, game experience, media and music layers into one final personalization path. It is an additive upgrade from Beta 0.986 HF2 and does not reset the production database.

## Main changes
- Personalization Engine 2.0: GameIndex Base → User Theme → Game Identity → Experience → Era → Media → Music.
- Generic Era Profiles with additive schema 32.
- Component variants for header, navigation, cards, panels, buttons and density.
- Roblox Modern and Roblox OG as the showcase ecosystem.
- Roblox OG uses a classic mid-2010s web language mixed with GameIndex structure; it does not reproduce the historical Roblox site layout.
- Roblox child games keep their own identity while inheriting compatible ecosystem components.
- Image Manager 2.1 supports game, experience and era media, including LOGO/HERO/BACKGROUND/CARD/GALLERY/ARTWORK where applicable.
- Music Manager 2.1 keeps manual YouTube configuration and shows experience/era context.
- Music Engine 0.987 uses one lazy global YouTube IFrame player. On ENDED it performs seekTo(0) + playVideo(), while the same player maintains a one-item playlist and native loop fallback.
- Persistent mute and volume behavior is preserved; missing volume storage does not become zero.
- SQLite migration backups are now bounded (default 5), pre-rotated before copy, validated, written through a partial file + atomic rename, and emergency-rotated only among strict migration-backup filenames when storage is low.
- `gamevault.sqlite` is never a backup-retention target.
- `/health` and `/api/health` remain lightweight and do not start AI or YouTube.
- Cache marker: `0987finalpersonalization`.

## Database
- Previous production schema: 31 (0.986 HF2)
- Target schema: 32
- Migration: `032_beta_0987.sql`
- Production rows are preserved.
- New tables: `game_era_profiles`, `game_era_media_overrides`.
- `game_experience_profiles` gains component, motion and default-era fields.

## Storage recovery hardening
The production ENOSPC incident was caused by unbounded migration-backup accumulation. 0.987 adds `GAMEINDEX_DB_BACKUP_RETENTION` (default `5`). The active database `%HOME%\data\GameIndex\data\gamevault.sqlite` is never removed by retention.

## Known validation boundary
Local/static/migration tests are included. A live Azure PASS is not claimed by this package; live validation must be performed after controlled deployment.
