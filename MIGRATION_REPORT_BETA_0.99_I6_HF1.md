# Migration Report — Beta 0.99 I6 HF1

## Schema

- From: `39`
- To: `40`
- Type: additive

## New migration

`src/database/migrations/040_beta_099_i6_hf1.sql`

## New persistence

- `universe_build_job_state`
- `universe_build_job_stages`

The migration preserves existing GameIndex data and overlays HF1 job/recovery state on the existing Universe Builder model rather than replacing historical build/revision data.

Existing queued/running legacy build rows are normalized into recoverable HF1 state so a server restart does not leave the UI pretending that an abandoned in-memory execution is still actively running.

## Validation

The HF1 test performs a real schema 39 → 40 migration against SQLite and verifies preservation of a probe record plus creation of the new job state structures.
