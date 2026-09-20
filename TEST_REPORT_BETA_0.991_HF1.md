# TEST REPORT — GameIndex Beta 0.991 HF1

## Current HF1 validation
Executed in the packaging environment:

| Command | Result |
| --- | --- |
| `npm test` / `npm run test:0991hf1` | PASS |
| `npm run check` | PASS — syntax checked 326 JS/MJS files |
| `npm run test:0991` | PASS |
| `npm run test:099` | PASS |
| `npm run test:099i1` | PASS |
| `npm run test:099i2` | PASS |
| `npm run test:099i3` | PASS |
| `npm run test:099i4` | PASS |
| `npm run test:099i5` | PASS |
| `npm run test:099i6` | PASS |
| `node tests/beta099-i6-hf1-build-reliability.mjs` | PASS |
| `npm run test:0987` | PASS |
| `npm run test:09875` | PASS |
| `npm run test:hf1` | PASS |
| `npm run test:hf1.1` | PASS |
| `npm run test:hf2` | PASS |
| schema 40 → 41 migration + integrity check | PASS |

The HF1 suite validates release/schema identity, restoration assets, Admin navigation, server-persisted cinematic architecture, the inward circular iris, identity colors, bottom-origin cable insertion ordering, provider-neutral setup wording, V3 routes/workspace and shell integration across 40+ pages.

## Historical rebrand test
`test:099i6hf2` is intentionally not a release gate for HF1 because that test asserts the Launch Visual Rebrand which this hotfix deliberately removes as the primary visual target. Historical code/data remains in the repository where required for continuity.

## Production HTTP smoke
A new current smoke suite exists at `tests/http-smoke-0991-hf1.mjs` and is wired to `npm run smoke`. It validates production server startup, health metadata, schema 41, Home assets, Games, protected Builder access and the public games API.

Final packaging validation re-ran the full relevant regression chain successfully. A clean dependency install was also retried. The execution environment cannot resolve `registry.npmjs.org` (DNS failure: `Temporary failure in name resolution`), so `npm ci` cannot obtain Express/dotenv here. `npm run smoke` was then executed and correctly failed at server startup because `dotenv/config` is unavailable without installed dependencies. This HTTP smoke is therefore **NOT reported as PASS**. The failure is dependency-environment related rather than an application assertion failure. The final packages intentionally exclude `node_modules`; deployment must run `npm ci` normally before `npm run smoke` / `npm start`.

## Required deployment-side final check
After dependencies are installed in the target environment:
```bash
npm ci
npm run check
npm test
npm run smoke
npm start
```

Do not mark a live deployment healthy if `npm run smoke` fails there.
