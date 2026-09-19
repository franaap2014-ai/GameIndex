# Game Index Beta 0.9875 HF1 — FULL deployment

Package: `GameIndex_Beta_0.9875_HF1_IMAGE_MANAGER_UI_FULL.zip`

This is a full application package intended to replace the application code in the Azure App Service deployment root while preserving `%HOME%\\data\\GameIndex` persistent production data.

## Important

- Do **not** delete or replace `%HOME%\\data\\GameIndex\\data\\gamevault.sqlite`.
- Do **not** delete the persistent `game-media`, `images`, or avatar data directories.
- The package intentionally excludes `node_modules`, SQLite databases, backups, `.env`, runtime logs, secrets, temporary media and downloaded audio.
- Schema remains 33, so HF1 does not require a new database schema migration beyond the existing Beta 0.9875 state.
- Existing automatic migration backup retention remains enabled.

## Release marker

`BETA_0_9875_HF1_IMAGE_MANAGER_UI`

## Main changes

- hierarchical Image Manager
- explicit Roblox / Roblox OG image targeting
- LOGO + BANNER-only simple workflow
- visual crop editor with four corner handles and dragging
- Roblox OG contrast/readability fix
- responsive Image Manager polish

## Deployment verification

After deployment, verify the normal site and `/health`, then open the authorized Image Manager and confirm Roblox, Roblox OG, and Roblox Games are listed separately. No Azure Live PASS is included in the build report because the real service was not deployed from this environment.
