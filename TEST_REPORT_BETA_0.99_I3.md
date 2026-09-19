# GameIndex Beta 0.99 I3 — Test Report

## Automated I3 suite
Command: `npm test`
Result: PASS

Validated:
- release 0.99-I3
- schema 36
- GAME_SOURCED_VISUAL_COMPOSITION_ENGINE_2_1
- genericGeneratedIdentity = false
- Visual Coverage
- Validation 2.0
- interaction state unification
- LOCAL_FIRST_NO_API_KEY
- schema 35 -> 36 preservation probe
- unsafe visual URL rejection
- deterministic Creative Director fallback

## Syntax
Command: `npm run check`
Result: PASS
- 299 JavaScript/MJS files syntax-checked by project check script.

## Prior-release regressions
- `npm run test:099` — PASS
- `npm run test:099i1` — PASS
- `npm run test:099i2` — PASS
- `npm run test:hf1.1` — PASS

Legacy regression metadata was updated to recognize I3 while explicitly preserving the I3 rule that old generated Visual Grounding renderers are not loaded by the current game page.

## Not validated in this environment
- full browser automation
- live Azure deployment
- complete local HTTP server smoke

A local HTTP smoke was attempted. `npm ci` in the execution container timed out and left an incomplete dependency installation (`dotenv/config` missing), so server startup is not reported as passed.
