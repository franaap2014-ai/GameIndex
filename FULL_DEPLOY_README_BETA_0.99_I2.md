# GameIndex Beta 0.99 I2 — Full Package Deployment

This package is a full Beta 0.99 I2 tree built from the provided Beta 0.99 I1 foundation.

## Requirements
- Node.js >= 22.13
- npm
- Existing production environment supported by I1 (Node/Express, SQLite, Azure App Service)
- No OpenAI API key or paid AI API is required.

## Upgrade procedure
1. Back up the currently deployed application and production SQLite database.
2. Deploy the contents of this FULL package over the application codebase while preserving the production database and persistent media directories according to the existing deployment layout.
3. Run `npm ci` (or the deployment system's existing dependency installation step).
4. Run `npm run check`.
5. Run `npm test`.
6. Start with `npm start` or the existing Azure App Service startup command.
7. On startup, the normal migration system advances the database from schema 34 to 35 when required.

## Database rule
Do not replace the production SQLite database with a development/test database. Migration 035 is additive and is intended to upgrade existing I1 data in place using the existing migration/backup system.

## Local AI
Ollama/Gemma remains optional. Universe Builder and public GameIndex operation do not require local AI. The I2 Creative Director only attempts local AI after an explicit Creative Director action.

## Regression priorities after deployment
Verify Home/catalog, Roblox GAME vs Experience classification, Universe Builder selection/editor, existing universes, interaction save/reload/publish, RICH visual grounding, HF1.1 Image Manager crop/URL/resize, global music/mute/volume, Social Beta, Creator Appearance and local-AI-off behavior.
