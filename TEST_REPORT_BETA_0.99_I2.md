# GameIndex Beta 0.99 I2 — Test Report

Date: 2026-09-05

## Passed
- `npm run check`: PASS — syntax validated for 294 JavaScript/MJS files.
- `npm test`: PASS — Beta 0.99 I2 architecture/migration/regression suite.
- I2 result: schema 35, builder classification INTELLIGENT_PROCEDURAL_EXPERIENCE_ENGINE, Interactive Universe Engine enabled, Visual Grounding 2.0 enabled, default visual density RICH, Creative Director optional local-AI with deterministic fallback, LOCAL_FIRST_NO_API_KEY confirmed, I1 regression confirmed.
- `npm run test:hf1.1`: PASS — HF1.1 Image Manager readable controls, server URL preview, four-corner live resize, pointer capture and proportional scaling retained.
- `npm run test:099`: PASS — Final Foundation schema-34 architecture remains valid as a prior-release regression target.
- Migration test: PASS — a schema-34 temporary database was migrated to schema 35 while preserving entity IDs and probe data.
- Security validation: PASS — unsupported interaction events, external NAVIGATE targets and executable/javascript-like parameters are rejected by the I2 tests.
- Creative Director no-AI path: PASS — deterministic mode works with local AI disabled and without an API key.

## Not claimed
- Browser automation was not run.
- Azure live deployment was not run.
- HTTP server smoke was not completed in this sandbox because dependencies were not installed; an attempted `npm ci` exceeded the tool transport window. No partial `node_modules` directory is included in either release package.

These unexecuted checks are deployment/environment validation items, not passing claims.
