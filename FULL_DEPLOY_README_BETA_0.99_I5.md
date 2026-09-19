# FULL Deploy — GameIndex Beta 0.99 I5

This package contains the complete GameIndex Beta 0.99 I5 application tree.

## Deployment
Use the normal Azure App Service deployment process for the full application. Preserve the production SQLite database/data directory. On startup, the application migration layer advances schema 37 to 38 additively when required.

## Required runtime
- Node.js >= 22.13
- dependencies from `package-lock.json`
- no required AI API key

## Recommended staging sequence
```powershell
npm.cmd ci
npm.cmd run check
npm.cmd test
npm.cmd start
```
Then test Admin, Social, Universe Builder, public Game/Experience pages and migration against a staging copy of production data before production promotion.

## Version display
Public UI: `Beta 0.99`.
Technical diagnostics: internal release `0.99-I5` where appropriate.
