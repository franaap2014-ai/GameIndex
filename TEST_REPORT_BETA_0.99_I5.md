# Test Report — Beta 0.99 I5

## Final source-tree results
- `npm run check` — PASS — 312 JavaScript/MJS files.
- `npm test` / `test:099i5` — PASS.
- `npm run test:099` — PASS.
- `npm run test:099i1` — PASS.
- `npm run test:099i2` — PASS.
- `npm run test:099i3` — PASS.
- `npm run test:099i4` — PASS.
- `npm run test:hf1` — PASS.
- `npm run test:hf1.1` — PASS.

## I5 dedicated coverage
The I5 suite verifies:
- public/internal version split;
- schema 37 → 38 preservation;
- Research Quality boilerplate rejection;
- useful fact acceptance;
- Hero rejection of weak wiki/section-accent candidates;
- semantic image resolution with distinct compatible assets;
- diversity validation;
- page composition and Preview composition hash;
- Preview STALE after composition mutation and READY after regeneration;
- RICH I5 validation domains;
- interaction deduplication;
- Regression Center execution;
- bug re-verification without workflow-status mutation;
- public `Beta 0.99` consistency;
- no return of script-generated fake game artwork.

## Environment limitations
- Browser automation: NOT executed / not claimed.
- Live Azure deployment: NOT executed / not claimed.
- HTTP server smoke: NOT executed / not claimed because dependencies were not installed in the generation container (`node_modules` absent).
