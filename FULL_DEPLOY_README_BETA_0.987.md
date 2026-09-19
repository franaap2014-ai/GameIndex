# FULL Deploy — GameIndex Beta 0.987

Use `GameIndex_Beta_0.987_FINAL_PERSONALIZATION_FULL.zip` as the full application package.

## Azure App Service Windows
- Keep the existing persistent `%HOME%\data\GameIndex` storage.
- Do not delete or overwrite `%HOME%\data\GameIndex\data\gamevault.sqlite`.
- Deploy the ZIP with files at application root (`server.mjs`, `package.json`, `public/`, `src/`, `web.config`, `iis-start.cjs`).
- Keep Node 22.13+; the production IISNode diagnostic previously confirmed Node 22.23.2 works.
- Optional setting: `GAMEINDEX_DB_BACKUP_RETENTION=5` (5 is already the default).

On first 0.987 startup, schema 31 upgrades additively to schema 32. A managed migration backup is created before the migration. Old eligible migration backups are rotated safely.

After deployment verify:
1. `/health` returns `version: 0.987` and `release: BETA_0_987_FINAL_PERSONALIZATION`.
2. Home and `/games.html` load normally.
3. `/game/roblox` loads without redirecting away from the friendly route.
4. Roblox Modern ↔ OG changes component language, media context and music context without duplicate players.
5. Music reaches ENDED and restarts repeatedly.
6. Creator/Admin managers remain protected.
7. Production user/game/media/music data remain present.

This package does not include `node_modules`, SQLite databases, backup databases, secrets, logs, or downloaded audio.
