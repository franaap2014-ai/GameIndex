# Full Deploy — GameIndex Beta 0.991 I1

## Required production storage
GameIndex 0.991 I1 will not silently use an ephemeral production SQLite path.

Configure one of:
- `GAMEINDEX_DATA_DIR=/persistent/mount/GameIndex`
- `GAMEINDEX_DB=/persistent/mount/GameIndex/gamevault.sqlite`

The directory must actually survive redeploys/restarts on the chosen hosting provider. Merely setting an environment variable to a temporary path is not persistence.

Do not enable `GAMEINDEX_ALLOW_EPHEMERAL_PRODUCTION=true` for a real deployment containing accounts.

## Deployment
1. Back up the current schema-41 database.
2. Make persistent storage available to the service.
3. Point `GAMEINDEX_DATA_DIR` or `GAMEINDEX_DB` at it.
4. Ensure the existing database is present at that location before the I1 application starts when migrating an existing installation.
5. Run `npm ci`.
6. Run `npm run check`, `npm run test:0991hf1` and `npm run test:0991i1`.
7. Start the application.
8. Confirm schema 42 and Admin → System → Account Storage = Persistent / Safe.
9. Create a temporary test account, restart the service, and confirm the same account can still sign in.
10. Only then consider the deployment verified.

## Rollback
Do not delete or replace the database when rolling application code back. Schema 42 is additive; preserve a pre-migration backup.
