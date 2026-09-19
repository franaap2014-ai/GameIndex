# GameIndex Beta 0.99 I4 — Migration Report

## Migration
- From schema: 36 (Beta 0.99 I3)
- To schema: 37 (Beta 0.99 I4)
- Migration file: `src/database/migrations/037_beta_099_i4.sql`
- Strategy: additive, non-destructive

## New persistence
Schema 37 adds storage for the I4 production pipeline:
- `universe_image_variables`
- `universe_image_variable_bindings`
- `universe_page_compositions`
- `universe_preview_snapshots`
- `universe_builder_stage_status`

## Preserved systems
Migration 037 does not replace or delete I3 structures. Existing:
- games / GAME-EXPERIENCE classification
- universe revisions/pages/tabs/sections
- Visual Asset Registry
- interaction bindings
- visual policy
- legacy content
- media/image records
remain in place.

## Migration validation
The I4 automated suite creates a schema-36 database with a preservation probe, migrates the same database to schema 37 and verifies:
- schema reaches 37
- existing probe data survives
- new I4 tables exist
- image variables can be created/resolved
- page compositions can be persisted
- preview snapshots can be generated and invalidated safely

Result: PASS.

## Deployment rule
Back up the production SQLite database before deployment. Do not replace the production database with a test/development database. Allow the existing migration runner to advance 36 → 37.
