# GameIndex Beta 0.99 I4 — Test Report

## Syntax
Command: `npm run check`
Result: PASS
- 303 JavaScript/MJS files syntax-checked by the project check script.

## I4 automated suite
Command: `npm test`
Result: PASS

Validated:
- release 0.99-I4
- schema 37
- THREE_STAGE_UNIVERSE_PRODUCTION_PIPELINE
- Research & Content image-variable contracts
- approved game-sourced image resolution
- no script-generated game identity in the I4 renderer
- Personalized Page Composition 2.0
- varied section composition
- Visual Gap measurement
- Desktop/Mobile preview snapshots
- preview invalidation after composition edits
- Publish at top / Final Report at bottom
- LOCAL_FIRST_NO_API_KEY
- schema 36 → 37 preservation probe

## Prior-release regressions
- `npm run test:099` — PASS
- `npm run test:099i1` — PASS
- `npm run test:099i2` — PASS
- `npm run test:099i3` — PASS
- `npm run test:hf1.1` — PASS

Historical regression assertions were extended only where required to recognize the current I4 release while preserving their original functional contracts.

## Runtime dependency check
The code-generation sandbox does not contain `node_modules`; direct import checks report:
- `express`: not installed
- `dotenv`: not installed

Therefore a complete local HTTP server smoke is not reported as passed in this environment.

## Not validated here
- full browser automation
- live Azure deployment
- end-to-end HTTP server smoke with installed production dependencies

These should be run in the normal deployment/staging environment after `npm ci`.
