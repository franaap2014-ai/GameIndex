# PACKAGE VALIDATION — GameIndex Beta 0.991 HF1

## Release identity
- Public version: `0.991`
- Internal release: `0.991-HF1`
- Package version: `0.991.1`
- Target schema: `41`
- Release code: `BETA_0_991_HF1_IDENTITY_RESTORATION`

## Source/package checks
- Baseline used: supplied Beta 0.991 FULL package
- Historical visual reference inspected: 0.99 I6/HF2 lineage; HF2 Launch Visual Rebrand is not the target appearance
- `node_modules`: excluded from deliverables
- `.env`: not present
- SQLite/database files: not present in deliverables
- obvious private-key / common API-token patterns: none found by package scan
- `.env.example`: present with placeholders only

## Code validation
- `npm test`: PASS
- `npm run check`: PASS — 326 JS/MJS files parsed successfully
- `npm run test:0991`: PASS
- `npm run test:099`: PASS
- `npm run test:099i1`: PASS
- `npm run test:099i2`: PASS
- `npm run test:099i3`: PASS
- `npm run test:099i4`: PASS
- `npm run test:099i5`: PASS
- `npm run test:099i6`: PASS
- `node tests/beta099-i6-hf1-build-reliability.mjs`: PASS
- `npm run test:0987`: PASS
- `npm run test:09875`: PASS
- `npm run test:hf1`: PASS
- `npm run test:hf1.1`: PASS
- `npm run test:hf2`: PASS
- temporary schema 40 → 41 migration: PASS
- post-migration `PRAGMA integrity_check`: `ok`

## Intentional historical incompatibility
`test:099i6hf2` asserts the Launch Visual Rebrand. HF1 intentionally restores the pre-rebrand visual identity, so that visual test is not a valid HF1 release gate.

## Production HTTP smoke status
The current HF1 production smoke test is included as `tests/http-smoke-0991-hf1.mjs` and wired to `npm run smoke`.

The dependency installation was retried during finalization. This execution environment cannot resolve `registry.npmjs.org` (`Temporary failure in name resolution`), so Express/dotenv cannot be installed here. `npm run smoke` was executed after that check and failed at server startup with `ERR_MODULE_NOT_FOUND` for `dotenv/config`, as expected when dependencies are absent. The HTTP smoke is therefore **not marked PASS**. No partial dependency tree is shipped. Run this check after `npm ci` in the actual deployment/build environment.

Required deployment validation:
```bash
npm ci
npm run check
npm test
npm run smoke
npm start
```

## Package policy
The FULL archive contains the complete deployable source tree without `node_modules`, secrets or local databases. The UPDATE_ONLY archive contains only files added/changed relative to the supplied 0.991 baseline, preserving project-relative paths.
