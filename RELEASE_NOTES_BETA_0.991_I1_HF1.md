# GameIndex Beta 0.991 I1 HF1

Public version remains **0.991**. Internal release: **0.991-I1-HF1**.

## Purpose

HF1 fixes the production blocker found after the first Beta 0.991 I1 deployment on Render Free. The original I1 correctly refused to run when it detected an unsafe ephemeral SQLite database, but Render Free does not provide a persistent disk. HF1 adds a free durable path using the existing Neon PostgreSQL project.

## Persistence architecture

Production keeps the existing SQLite runtime and repositories, avoiding a risky rewrite of the complete GameIndex data layer.

- GitHub stores application code.
- Render Free runs Node.js and the local SQLite runtime cache.
- Neon PostgreSQL stores complete, versioned SQLite snapshots outside the Render filesystem.
- Startup restores the latest verified Neon snapshot before SQLite opens.
- Runtime writes mark the database dirty and schedule a remote snapshot.
- Critical account, role, session, subscription, cinematic, bug, admin and universe writes request an immediate flush.
- SIGTERM/SIGINT attempt a final durable flush before process exit.
- Snapshots are SHA-256 verified before restore.
- Only completed snapshots are eligible for restore.
- Two completed snapshots are retained by default.

This preserves the full existing I1 database model while making Render Free deploys and restarts durable.

## Deployment requirement

Render production must define:

```
DATABASE_URL=<Neon PostgreSQL connection string>
```

Keep this value only in Render Environment. Never commit it to GitHub.

On Render, `GAMEINDEX_DB` and `GAMEINDEX_DATA_DIR` are never accepted as production persistence. The only supported production persistence path for this HF1 on Render Free is Neon through `DATABASE_URL`. SQLite remains only as a temporary runtime cache inside the Render instance.

## Schema

- SQLite target schema: **43**
- New migration: `043_beta_0991_i1_hf1.sql`
- Neon control tables:
  - `gameindex_runtime_snapshots`
  - `gameindex_runtime_snapshot_chunks`

## I1 scope retained

HF1 includes the complete Beta 0.991 I1 feature set: account persistence safety, Admin Cinematics Center, Welcome cinematic rework, theme cable color correction, adaptive logo, contextual navigation compass and structured bug diagnostics.
