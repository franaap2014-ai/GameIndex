# GameIndex Beta 0.99 I2 — UPDATE_ONLY Package

Use this package only on the matching Beta 0.99 I1 foundation. It contains the files changed or added for I2 plus release documentation.

## Apply
1. Back up the current application and production SQLite database.
2. Overlay the UPDATE_ONLY package onto the I1 codebase, preserving paths.
3. Run the existing npm dependency installation step (`npm ci` recommended).
4. Run `npm run check` and `npm test`.
5. Start normally. The migration system advances schema 34 -> 35.

## Important
- Do not delete or replace the production SQLite database.
- Do not remove the existing I1 `public/js/visual-grounding-099i1.js`; I2 intentionally uses it as a motif source/fallback.
- No OpenAI API key or cloud AI configuration is needed.
