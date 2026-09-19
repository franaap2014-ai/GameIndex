# GameIndex Beta 0.99 I1 — FULL Deploy

Deployable full project package for `0.99-I1`.

## Baseline and schema

- Baseline: Beta 0.99 Final Foundation
- Package version: `0.99.1`
- Release: `BETA_0_99_I1_FOUNDATION_CORRECTION_VISUAL_GROUNDING`
- SQLite schema: **34**, unchanged from Beta 0.99

## Persistent data safety

Do not delete or replace Azure persistent data. In particular, never delete:

`C:\home\data\GameIndex\data\gamevault.sqlite`

This release does not require a schema migration and does not require a database reset.

## Main changes

- Universe Builder entity selector boot/order and data-state correction.
- Data-layer GAME/EXPERIENCE catalog separation for public discovery.
- Experience-preserving Search behavior.
- Direct game-grounded identity motif renderer for the five Roblox test Experiences.
- Cache marker `099i1visualgrounding` on affected pages/assets.

## Runtime constraints

Preserved: local-first, self-hosted-compatible, Azure App Service-compatible, no mandatory API keys, Ollama/Gemma-compatible research architecture.

## Package exclusions

The FULL package intentionally excludes `node_modules`, production SQLite files, backups, `.env`, logs, downloaded audio and temporary research/media caches.

## Validation

See `GameIndex_Beta_0.99_I1_FINAL_VALIDATION.txt` for commands and actual results.

Azure live deployment was not tested. Browser automation was not performed.
