# UPDATE ONLY — GameIndex Beta 0.991 → 0.991 HF1

This package contains only files added or changed by Beta 0.991 HF1 relative to the supplied Beta 0.991 FULL baseline.

## Upgrade
1. Back up the current deployment and production database.
2. Stop the running service.
3. Overlay the UPDATE_ONLY package at the project root, preserving paths.
4. Run `npm ci` if `package.json` or `package-lock.json` changed.
5. Keep secrets in environment variables; do not copy a `.env` from the package.
6. Start the application normally. Migration 041 advances schema 40 → 41.
7. Run:
```bash
npm run check
npm test
npm run smoke
```
8. Verify login, Welcome/identity cinematics, Appearance theme transition, Admin navigation and Universe Builder V3.

## Important
- Do not delete or replace the existing production SQLite database.
- Do not replay inherited identity intros manually. The account event system determines eligibility.
- `node_modules` is intentionally not included.
- The rejected I6 HF2 Launch Rebrand test is not a release gate because HF1 intentionally restores the pre-rebrand interface identity.
