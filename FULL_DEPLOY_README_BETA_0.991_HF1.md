# FULL DEPLOY — GameIndex Beta 0.991 HF1

## Requirements
- Node.js **22.13+**
- persistent SQLite location for production
- environment variables supplied outside Git/package files

## Install
```bash
npm ci
npm run check
npm test
npm run smoke
npm start
```

The server uses `process.env.PORT` when supplied by the host.

## Persistent storage
On a host with ephemeral application files, configure one of:
```text
GAMEINDEX_DATA_DIR=/persistent/mount/GameIndex
```
or:
```text
GAMEINDEX_DB=/persistent/mount/GameIndex/gamevault.sqlite
```

Do not store the production database only inside an ephemeral deployment checkout.

## First Creator bootstrap
Set `GAMEINDEX_SETUP_CODE` as a secret environment variable only when the secure first-owner setup is required. Do not commit its value. After the one-time setup succeeds, remove or rotate the secret according to the existing bootstrap workflow.

## Migration
On startup, the normal migration runner advances an existing schema-40 database to schema 41. A managed backup is created before the migration when storage permits. Do not replace the production database with a bundled/test database.

## Render
Use the normal Node build/install flow and a persistent disk/database location. No code path is hardcoded to Render.

## Azure / other Node hosts
The runtime remains provider-neutral. Azure-specific environment detection is retained only for locating persistent HOME storage when actually hosted there.

## Secrets
Never commit `.env`, API keys, recovery codes, setup codes, SMTP passwords, database credentials or private tokens.
