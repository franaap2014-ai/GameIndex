# Migration Report — Beta 0.991 I1

## Database
Previous target schema: **41**  
New target schema: **42**

Migration: `src/database/migrations/042_beta_0991_i1.sql`

### Additive objects
- `bug_diagnostics`
- `cinematic_admin_actions`
- supporting indexes
- release metadata for 0.991 I1

No user, password, profile, staff role, subscription, Social record, cinematic history or Universe Builder project is truncated/reset by migration 42.

## Account persistence
The database path architecture remains SQLite-compatible for local development. **For Render, this I1 rule is superseded by Beta 0.991 I1 HF1:** Render-local `GAMEINDEX_DATA_DIR` / `GAMEINDEX_DB` paths are never accepted as durable production storage. Render production must use the external Neon `DATABASE_URL`; SQLite inside Render is only a temporary runtime cache.

## Welcome cinematic
The Welcome event is versioned to `welcome_0991_i1`, allowing the corrected I1 presentation to be eligible independently from the previous HF1 visual event without deleting older history.
