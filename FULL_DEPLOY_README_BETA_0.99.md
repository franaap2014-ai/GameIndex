# FULL DEPLOY — GameIndex Beta 0.99 Final Foundation

## Package
`GameIndex_Beta_0.99_FINAL_FOUNDATION_FULL.zip`

## Baseline
Beta 0.9875 HF1.1.

## Runtime
- Node.js >= 22.13
- Express 5.1
- built-in `node:sqlite`
- Azure App Service Windows compatible architecture
- local-first Ollama/Gemma path remains optional/lazy
- no required OpenAI API key
- no required YouTube Data API key
- no required paid search/translation API

## Database migration
Target schema: 34.

Migration 034 is additive. It adds entity classification/relationships plus Universe Builder Final Foundation tables for builds, events, revisions, pages, tabs, sections, topics, facts, evidence, content media, interactive components, identity profiles and technical profiles.

The five existing Roblox child records are classified in place as EXPERIENCE and linked to Roblox. The migration does not intentionally delete/recreate those records.

### Production DB safety
Never delete or replace the Azure production database:
`C:\home\data\GameIndex\data\gamevault.sqlite`

Do not deploy a development SQLite file over production. The release package contains no production SQLite database. Existing migration backup retention remains bounded; do not use broad wildcard backup deletion.

## Full deployment outline
1. Back up/verify the current App Service persistent data using the established safe deployment process.
2. Deploy the FULL package application files without replacing `%HOME%\data\GameIndex`.
3. Install production dependencies with the normal App Service/npm process.
4. Start with `npm start` / `node server.mjs` according to the existing App Service configuration.
5. Let the application perform its additive schema migration against the persistent database.
6. Verify `/api/health`, Games, Search, Roblox, Experience routes, Creator Universe Builder and Image Manager.

## Package exclusions
The FULL package intentionally excludes:
- `node_modules`
- SQLite databases/WAL/SHM files
- production data
- backups
- `.env`/secrets
- logs
- temporary/downloaded media/audio
- caches/development junk

## Major behavior
- Global Games catalog returns GAME entities; Roblox children are EXPERIENCE.
- Experiences remain searchable/directly routable.
- Universe Builder research is authorized/demand-driven; public page views do not start research/AI.
- Content Media is separate from Image Manager LOGO+BANNER.
- Dynamic public universe content is persisted/revisioned before rendering.
- Interactive components use a safe registry/config model, not arbitrary generated JS.

## Validation
See `GameIndex_Beta_0.99_FINAL_VALIDATION.txt` accompanying the release for exact executed commands and outcomes.

Browser automation was not performed.
Azure live deployment was not performed.
Do not treat packaging validation as Azure live PASS.
