# GameIndex Beta 0.9875 — FULL deployment

Recommended artifact:

`GameIndex_Beta_0.9875_FULL_PAGE_PERSONALIZATION_FULL.zip`

The ZIP is intended to be deployed with its files at the application root. Expected root files include `server.mjs`, `package.json`, `package-lock.json`, `web.config`, `iis-start.cjs`, `.deployment`, `public/` and `src/`.

## Production-data safety

The package contains no SQLite database. Existing production data under `%HOME%\data\GameIndex` must remain in place.

Do not delete:

`%HOME%\data\GameIndex\data\gamevault.sqlite`

At startup, the normal additive migration path upgrades schema 32 (Beta 0.987) to schema 33 (Beta 0.9875). Existing automatic migration-backup retention remains active.

## What changes visually

- Roblox Modern: existing 0.987 style extended across the complete page shell.
- Roblox OG: existing classic-inspired 0.987 style extended across the complete page shell.
- Image Manager 3.0: primary public configuration is LOGO + BANNER.
- Roblox child section: context label is Experiências instead of Franquia.

## Music

No new music is assigned automatically. The existing one-player loop engine remains unchanged except for release/cache integration.

## Validation scope

Local static, migration and regression tests are documented in `GameIndex_Beta_0.9875_FINAL_VALIDATION.txt`.

A live Azure deployment was not executed in the build environment, so Azure Live PASS is not claimed.
