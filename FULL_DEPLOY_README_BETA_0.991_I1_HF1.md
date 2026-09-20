# GameIndex Beta 0.991 I1 HF1 — Full Deployment Notes

## Production topology

```
GitHub
  ↓ code
Render Free
  ↓ DATABASE_URL
Neon PostgreSQL Free
  ↕ durable versioned SQLite snapshots
Render local SQLite runtime
```

Render Free's local filesystem is treated as temporary. Neon is the durable authority for the SQLite database snapshots.

## Required secret

Set `DATABASE_URL` in Render Environment using the connection string for the Neon project **GameIndex**, database **gameindex**.

Never expose or commit the connection string.

## Release contract

- Public version: `0.991`
- Internal release: `0.991-I1-HF1`
- Release code: `BETA_0_991_I1_HF1_NEON_PERSISTENCE`
- SQLite schema: `43`
- Production persistence provider: `NEON_REMOTE_SQLITE_SNAPSHOT`

## Safety

HF1 refuses Render production startup without a valid Neon `DATABASE_URL`. Render-local `GAMEINDEX_DB` / `GAMEINDEX_DATA_DIR` paths are never considered persistent, and the emergency ephemeral override cannot bypass this rule on Render. SQLite is only a temporary runtime cache; Neon is the durable authority.

The Neon snapshot payload is chunked, versioned and SHA-256 checked. Incomplete snapshots are ignored during restore.
