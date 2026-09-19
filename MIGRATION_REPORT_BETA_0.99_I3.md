# GameIndex Beta 0.99 I3 — Migration Report

## Database
- Previous target schema: 35 (Beta 0.99 I2)
- New target schema: 36 (Beta 0.99 I3)
- Migration: `src/database/migrations/036_beta_099_i3.sql`
- Strategy: additive

## Added persistence
- `visual_asset_registry`
- `visual_grounding_validation`
- I3 runtime/meta update records

## Preserved
- existing Games and Experiences
- entity IDs and parent relations
- universe revisions/pages/tabs/sections
- visual density/policy from I2
- universe interaction bindings
- Image Manager and media records
- published revisions and legacy content

## Migration validation
The I3 automated test creates a schema-35 database with a preservation probe, migrates the same database to schema 36 and verifies the probe survives.

A migration implementation issue found during development was corrected: schema 36 no longer assumes the optional historical `release_catalog` table exists.
