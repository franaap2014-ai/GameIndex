# Test report — GameIndex Beta 0.986 HF2

Status: **PACKAGE TESTS PASS / HTTP SMOKE NOT EXECUTED**

Validated on the exact HF2 final candidate tree:
- 263 JS/MJS/CJS files passed `node --check`.
- `scripts/check.mjs` passed its project syntax scan (262 JavaScript/MJS files).
- HF1 music-control regression: PASS.
- Beta 0.986 production-consolidation regression: PASS.
- HF2 AI Slim + Game Experiences test: PASS.
- 0.985-HF4 migration regression: PASS.
- 0.985-HF2 performance regression: PASS.
- 0.985-HF4 runtime-graph regression: PASS.
- Schema 29 -> 31 isolated migration: PASS.
- `PRAGMA integrity_check = ok`.
- Five Roblox child links verified in order: Blox Fruits, DOORS, Fisch, Work at a Pizza Place, Prison Life.
- Roblox Modern + OG 2009 profiles verified.
- Distinct theme/font/menu profiles verified.
- Child music auto-assignment count verified as zero.
- Shared AI runtime concurrency=1 verified.
- Universal loop contract verified (`ENDED -> seekTo(0) -> playVideo()` plus YouTube loop playlist parameter).
- Experience-specific image storage verified independently for Roblox Modern and Roblox OG.
- Image Manager UI verified to expose game-global and experience-specific scopes.
- pt-BR / en-US / es-ES experience locale keys verified.

Two historical tests intentionally fail because they target files removed during the 0.986 consolidation (`src/api/hotfix-performance-music-routes.mjs` and `src/images/manual-image-service.mjs`). They are obsolete HF6/HF7 contract tests, not HF2 runtime regressions.

HTTP smoke was not marked PASS. `npm ci` timed out in the isolated build environment before Express could be installed. No Azure live claim is made.
