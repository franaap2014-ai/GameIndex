# Migration Report — Beta 0.99 I5

## Schema
- From: 37
- To: 38
- Migration: `src/database/migrations/038_beta_099_i5.sql`
- Strategy: additive; no destructive reset.

## New persisted structures
- `research_fact_quality`
- `asset_semantic_scores`
- `asset_usage_metrics`
- `bug_relevance_state`
- `regression_runs`
- `regression_run_results`
- `bug_regression_links`
- `admin_audit_events`
- `social_posts`
- `social_context_links`

## Existing-table extension
`universe_preview_snapshots` receives `composition_version` with a safe default.

## Release metadata
Migration records:
- `runtime_version = 0.99-I5`
- `public_version = 0.99`
- `runtime_release = BETA_0_99_I5_PRODUCTION_CONSOLIDATION`
- `beta_099_i5 = 1`

## Preservation
The dedicated I5 migration test creates a schema-37 database, inserts a preservation probe, migrates the same database to schema 38 and verifies that prior data remains intact.
