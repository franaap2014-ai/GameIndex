# GameIndex Beta 0.99 I3 — Package Validation

## Package target
- Release: 0.99-I3
- Database schema: 36
- Node target: >=22.13
- Architecture: LOCAL_FIRST_NO_API_KEY

## Code validation
- `npm run check`: PASS — 299 JavaScript/MJS files.
- `npm test`: PASS — I3 game-sourced visual composition contract.
- `npm run test:099`: PASS.
- `npm run test:099i1`: PASS.
- `npm run test:099i2`: PASS.
- `npm run test:hf1.1`: PASS.

## Package hygiene
FULL and UPDATE_ONLY packaging excludes:
- `node_modules`
- `.git`
- `.env`
- Python caches
- temporary SQLite/database files
- logs/debug dumps

## Important limitation
Full browser automation and live Azure deployment were not executed. A local HTTP smoke was attempted but cannot be claimed because dependency installation in the execution container timed out before a complete Express/dotenv install.
