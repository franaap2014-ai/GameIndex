# GameIndex Beta 0.991 I1 HF1 — Test Report

## Completed validation

- New persistence module syntax parsed successfully.
- Updated database connection module syntax parsed successfully.
- Updated server module syntax parsed successfully.
- Updated Admin and I1 route JavaScript syntax parsed successfully.
- Existing I1 static regression contract was updated for schema 43.
- HF1 static persistence contract was added.
- Release-contract checks passed for:
  - Render local paths never being treated as persistent production storage.
  - Neon `DATABASE_URL` detection and mandatory Render production gate.
  - remote restore before SQLite open.
  - schema 43 migration wiring.
  - SHA-256 snapshot verification.
  - incomplete snapshot rejection.
  - immediate critical-write flush scheduling.
  - SIGTERM/SIGINT final flush.
  - server waiting for persistence startup before listening.
  - secret-free `.env.example`.
- Neon project `GameIndex` was provisioned.
- Neon database `gameindex` is ready.
- Neon control tables were created and schema-inspected:
  - `gameindex_runtime_snapshots`
  - `gameindex_runtime_snapshot_chunks`

## Not claimed as runtime-tested yet

The following require the real Render environment and its private `DATABASE_URL`:

```
npm ci
npm run check
npm run test:0991hf1
npm run test:0991i1
npm run test:0991i1hf1
npm run smoke
```

Also pending until the next production deploy:

1. first live Neon snapshot upload from Render;
2. create/login owner account;
3. restart/redeploy Render;
4. restore the same snapshot;
5. login to the same owner account again.

Do not treat production persistence as fully verified until that restart test passes.
