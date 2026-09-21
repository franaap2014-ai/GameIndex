# GameIndex Beta 0.991 I1 HF2 — Deployment Notes

## Release contract

- Public version: `0.991`
- Internal release: `0.991-I1-HF2`
- Release code: `BETA_0_991_I1_HF2_CREATOR_ANIMATION_EDITOR`
- SQLite target schema: `44`
- Production durable provider: `NEON_REMOTE_SQLITE_SNAPSHOT`

## Production topology

```
GitHub → Render Free → temporary SQLite runtime ↔ Neon PostgreSQL
```

Neon stores versioned, verified SQLite snapshots. Render-local SQLite is never considered durable production storage.

## Required Render secret

```
DATABASE_URL
```

The URL must stay in Render Environment only. Never place a real database URL in the repository, documentation, client JavaScript or logs.

## Creator repair

Schema 44 repairs missing Admin Connections for active CREATOR/DEV staff assignments.

Existing explicit INACTIVE/REVOKED connections are preserved and are not silently reactivated.

Secure first-owner setup and secure owner recovery now synchronize the staff role with the Admin Connection.

## Animation data

Animation Editor projects, revisions, bindings, presets and audit records live in the SQLite schema and therefore travel with the same durable Neon snapshot lifecycle as account data.

Publishing and other critical Animation Editor lifecycle operations force a durable persistence flush request.

## Rollback safety

Migration 044 is additive. It does not delete existing users, sessions, profiles, subscriptions, social data, Universe Builder data, cinematic history, bugs, games, knowledge, images or music.

Do not delete Neon snapshots when rolling application code back.
