# GameIndex Beta 0.986 — Package Validation

The production FULL is generated from the canonical 0.986 tree, not from an HF overlay.

Validated before packaging:

- schema target 29;
- syntax check PASS;
- 0.986 functional/migration test PASS;
- selected historical regressions PASS where their version contract remains applicable;
- no `node_modules` in the package;
- no test/production SQLite database in the package;
- no WAV/MP3/OGG audio assets;
- no `.env` credentials;
- no OpenAI or YouTube API key requirement;
- critical browser assets are versioned for 0.986;
- server root remains Azure App Service compatible.

A clean archive extraction is re-tested with `node scripts/check.mjs` and `node tests/beta0986-production-consolidation.mjs` before the SHA-256 is emitted.

Network-dependent `npm ci` / Express HTTP smoke is marked BLOCKED in `TEST_REPORT_BETA_0.986.md` because the build environment returned DNS `EAI_AGAIN` for npm registry requests. The provided `npm run smoke` script is the post-install/local-Azure gate.

## Final extraction result

The generated FULL archive was extracted into a fresh directory and the 0.986 syntax + functional/migration suite passed again. The archive root is deployment-ready (no extra parent folder inside the ZIP).
