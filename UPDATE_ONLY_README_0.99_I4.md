# GameIndex Beta 0.99 I4 — UPDATE_ONLY

Use this package only on a clean/existing **Beta 0.99 I3** installation.

## Upgrade
1. Back up the application and SQLite database.
2. Overlay the UPDATE_ONLY files onto the I3 installation, preserving persistent production data/media.
3. Run `npm ci` if package metadata changed in your deployment workflow.
4. Run `npm run check`.
5. Run `npm test`.
6. Start the application normally.
7. Allow migration 037 to advance schema 36 → 37.

## Important
- Do not delete or replace the production SQLite database.
- Do not remove approved Visual Asset Registry data.
- No API key is introduced by I4.
- Old fake I1/I2 game-art renderers must not be re-enabled.

## Expected new files/systems
- migration 037
- I4 production pipeline service
- I4 validation service
- I4 real composition renderer
- I4 automated test
- revised Builder UI/runtime/routes

The package should be applied to I3 only; older installations should follow the normal version sequence or use the FULL package.
