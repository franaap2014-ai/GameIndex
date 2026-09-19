# Package validation — GameIndex Beta 0.986 HF2

Final candidate status: **PACKAGE PASS** after local/module validation. HTTP/Azure live smoke remains unverified.

## Exact candidate checks
- 382 source/report files before UPDATE ONLY manifest generation.
- 263 JS/MJS/CJS syntax checks: PASS.
- project `scripts/check.mjs`: PASS (262 JS/MJS files).
- Beta 0.986 regression: PASS.
- HF1 music-controls regression: PASS.
- HF2 AI Slim + Game Experiences: PASS.
- migration HF4 regression: PASS.
- performance HF2 regression: PASS.
- runtime graph HF4 regression: PASS.
- schema target: 31.
- SQLite integrity: ok.
- no automatic child-music assignment.
- no `node_modules` included.
- no SQLite production/test database included.
- no `.env` secret file included.
- no WAV/MP3/OGG soundtrack included.

## HF2 finalization addition
Experience-specific media is stored in `game_experience_media_overrides`. Image Manager can edit experience-specific Logo/Hero/Background/Card/Gallery separately from the game's global Cover/Hero/Page Background/Artwork. `experienceProfile()` resolves experience-specific media first and falls back to existing game-level slots.

## Not claimed
`npm ci` timed out in the isolated environment, so Express HTTP smoke was not executed. This package must not be called `AZURE LIVE PASS` until deployed and browser-tested on the actual App Service.
