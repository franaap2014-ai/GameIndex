# GameIndex Beta 0.986 — Migration Report

## Schema

- Previous production target: schema 28 (0.985 HF4 database schema used by the later hotfix runtime).
- New target: schema 29.
- Migration file: `src/database/migrations/029_beta_0986.sql`.

## Additive objects

- `admin_connections`
- `account_security`
- `two_factor_challenges`
- `game_media_overrides`
- `game_experiences`
- `default_volume` columns on current YouTube music tables

Compatibility tables for the existing HF7 manual image/music state are created only if missing, then existing manual cover data is copied into the new media override model.

## Identity migration

- Existing active CREATOR/DEV staff assignments become active Admin Connections.
- Permanent Kxng01 user ID `3bd5057c-d2ec-4320-93dd-ac099e0a0f11`, when present, receives the existing DEV role model plus an active DEV connection.
- Existing verified `primary_creator_user_id` remains CREATOR and becomes an active Creator connection; no duplicate Franchesco01 account is created.

## Preservation validation

An isolated representative schema-28 database was created, a user record was added, then it was migrated to schema 29. The user remained present, the Kxng permanent-ID migration was validated, and `PRAGMA integrity_check` returned `ok`.

No destructive production-data operation is introduced by migration 029.
