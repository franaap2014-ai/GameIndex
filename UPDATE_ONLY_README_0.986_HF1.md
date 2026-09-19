# Beta 0.986 HF1 — Update Only

This hotfix is for an existing GameIndex Beta 0.986 deployment.

## Fixes

- Music popover buttons/slider receive pointer events.
- Missing local volume no longer becomes 0%.
- PLAY/MUTE/volume state handling is more robust.
- YouTube player receives delayed synchronization after iframe load.
- Cache-bust changed to `0986hf1` so browsers do not keep the broken 0.986 shell/CSS.
- `/health` exposes `HF1_MUSIC_CONTROLS`.

## Database

No schema change. Do not replace or delete the production SQLite database.

## Recommended deployment

Prefer deploying the FULL package if possible. If using UPDATE_ONLY, copy its files over the current 0.986 app while preserving persistent data, then restart the Azure App Service. After deploy, open `/health` and verify `hotfix` is `HF1_MUSIC_CONTROLS`.
