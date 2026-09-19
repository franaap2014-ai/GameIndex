# GameIndex Beta 0.99 I4 — Package Validation

## Package types
- FULL: complete deployable Beta 0.99 I4 tree
- UPDATE_ONLY: delta intended for Beta 0.99 I3 → Beta 0.99 I4

## Final package validation
The final package pair was built and validated after the I4 documentation set was sealed.

### FULL final extraction
After extraction:
- `node scripts/check.mjs` — PASS
- `npm test` — PASS
- syntax count: 303 JavaScript/MJS files
- release: 0.99-I4
- schema target: 37

### UPDATE_ONLY final clean-apply test
Procedure:
1. extract the clean Beta 0.99 I3 FULL baseline;
2. overlay the generated I4 UPDATE_ONLY package;
3. run `node scripts/check.mjs`;
4. run `npm test`.

Result:
- syntax — PASS
- I4 suite — PASS
- schema/pipeline expectations — PASS
- final overlaid I3→I4 tree equivalence versus the FULL source tree — PASS (0 mismatched files, 0 extra files)

## Source-tree regressions before packaging
Passed:
- 0.99 Final Foundation
- 0.99 I1
- 0.99 I2
- 0.99 I3
- HF1.1 Image Manager

## Exclusions
FULL packaging excludes runtime/development artifacts such as:
- `node_modules`
- SQLite test/runtime databases
- SQLite journals/backups
- Python caches / generic cache directories

## Environment limitations
Not claimed:
- full browser automation
- live Azure deployment
- full HTTP server smoke with Express/dotenv installed

The generation sandbox does not contain the production npm dependencies, so those environment-level validations must run in staging/target deployment after `npm ci`.
