# GameIndex Beta 0.99 I3 — Full Package Deployment

This FULL package is a complete Beta 0.99 I3 tree evolved from the provided Beta 0.99 I2 foundation.

## Requirements
- Node.js >= 22.13
- npm
- Existing production environment supported by I2 (Node/Express, SQLite, Azure App Service)
- No OpenAI API key or paid AI API is required

## Upgrade procedure
1. Back up the current application and production SQLite database.
2. Deploy the contents of this FULL package while preserving production persistent data/media according to the existing deployment layout.
3. Run `npm ci` using the existing deployment pipeline.
4. Run `npm run check`.
5. Run `npm test`.
6. Start with `npm start` or the existing Azure App Service startup command.
7. The normal migration system advances schema 35 to schema 36 when required.

## Database rule
Do not replace the production SQLite database with a development/test database. Migration `036_beta_099_i3.sql` is additive and preserves I2 records.

## Visual identity rule
I3 intentionally does not load the old I1/I2 script-generated game-art renderer on the current game page. Real game-sourced assets must be discovered/registered and approved before they become strong production visual grounding.

If an asset is missing, the correct state is incomplete/failed visual grounding, not fabricated game artwork.

## Local AI
Ollama/Gemma remains optional. AI is not contacted during normal server startup. The Creative Director and image semantic review are demand-driven. The site and Builder remain usable without an API key.

## Regression priorities after deployment
Verify:
- Home/catalog and GAME vs EXPERIENCE separation
- Universe Builder entity selector and existing revisions
- schema-36 migration on a backed-up database
- Visual Asset Registry add/sync/approval flow
- RICH visual density with actual approved assets
- Visual Coverage and Validation 2.0 publication gate
- interaction PLANNED/DRAFT/VALIDATED/PUBLISHED counts
- HF1.1 Image Manager crop, URL preview and resize handles
- global music/mute/volume
- Social Beta and Creator Appearance
- local-AI-off behavior
- mobile visual composition

## Validation note
The generated package passed syntax and automated I3/0.99/I1/I2/HF1.1 regressions. Browser automation and live Azure deployment still require validation in the target environment.
