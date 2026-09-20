# Full Deploy — GameIndex Beta 0.991 I1

> **Superseded for Render by Beta 0.991 I1 HF1.**
> In the HF1 deployment, do **not** configure a persistent SQLite path on Render.
> Render production persistence is provided only by the external Neon database through `DATABASE_URL`.
> See `FULL_DEPLOY_README_BETA_0.991_I1_HF1.md`.

## I1 historical storage rule

The original I1 introduced a safety guard so production would not silently depend on disposable SQLite storage. HF1 replaces the Render-specific solution with Neon persistence.

For the current Render Free deployment:

- do not use `GAMEINDEX_DATA_DIR` as production persistence;
- do not use `GAMEINDEX_DB` as production persistence;
- do not configure or depend on a Render Persistent Disk;
- configure the Neon `DATABASE_URL` instead.

SQLite may still exist inside the running Render instance as a temporary runtime cache, but it is not the durable database.

## Current deployment

1. Configure the private Neon `DATABASE_URL` in Render Environment.
2. Apply the complete **Beta 0.991 I1 HF1 UPDATE_ONLY** package.
3. Run/install the application normally.
4. Confirm schema 43.
5. Confirm Admin → System → Account Storage = **Persistent / Safe**.
6. Confirm provider = `NEON_REMOTE_SQLITE_SNAPSHOT`.
7. Create or recover the owner account.
8. Restart/redeploy the Render service.
9. Confirm the same account can still sign in.

## Rollback

Do not delete Neon snapshots when rolling application code back. Schema 42/43 migrations are additive and the durable snapshot history should be preserved.
