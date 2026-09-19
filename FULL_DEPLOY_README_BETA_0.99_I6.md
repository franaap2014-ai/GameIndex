# FULL Deploy — GameIndex Beta 0.99 I6

This package contains the complete GameIndex Beta 0.99 I6 application tree.

## Deployment
Use the normal Azure App Service deployment process for the full application. Preserve the production SQLite data directory/database. On startup, the migration layer advances schema 38 to 39 additively when required.

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
Then test Universe Builder, interaction previews, authorization decisions, Enhancement, public Game/Experience runtime and migration using a staging copy of production data before production promotion.

## Version display
- Public UI: `Beta 0.99`
- Technical diagnostics: internal release `0.99-I6`
