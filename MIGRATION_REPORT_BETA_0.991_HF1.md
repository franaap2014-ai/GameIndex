# MIGRATION REPORT — GameIndex Beta 0.991 HF1

## Database transition
- From schema: **40** (`0.99-I6-HF1`)
- To schema: **41** (`0.991-HF1`)
- Migration: `src/database/migrations/041_beta_0991_hf1.sql`
- Strategy: additive, transactional, existing data preserved

## Added persistent structures
### `user_cinematic_events`
Stores account-level cinematic eligibility/start/completion. Primary key `(user_id,event_key)` makes event creation idempotent and allows future event keys without adding a new user column every release.

### `universe_builder_component_locks`
Stores manual-edit protection for Builder pages/tabs/sections/images/interactions/layout components. Section locks are enforced at the SQLite boundary by `trg_universe_sections_protect_locked_update`; explicit manual-edit/restore flows use the temporary `builder_lock_override` meta key inside the same transaction.

### `universe_builder_snapshots`
Stores meaningful Builder checkpoints for manual edits, auto-fix/enhancement work, publish preparation and restores.

### `universe_builder_issues`
Stores unresolved Builder decisions with `BLOCKING`, `RECOMMENDED` or `OPTIONAL` priority and stable target metadata.

## Existing users
No existing user is modified or deleted solely to make cinematics work. Eligibility is derived from the absence of the event key. Therefore an account that existed before HF1 receives `welcome_0991_hf1` once after migration, then its current primary identity cinematic if applicable.

## Existing identities
Identity resolution uses the current capability/subscription architecture. Cinematic display identity is singular: FREE, PRO, TESTER, DEV or CREATOR. DEV does not queue inherited PRO/Tester intros.

## Existing universes
No Universe content table is dropped. V3 reads the existing generated structure and adds locks/issues/snapshots alongside it. Legacy projects therefore remain loadable.

## Validation performed
A temporary database was created through schema 40 and then migrated to schema 41 with the HF1 code. Result:
- schema after first pass: `40`
- schema after HF1 pass: `41`
- `beta_0991_hf1` meta flag: `1`
- `user_cinematic_events` present: yes
- `PRAGMA integrity_check`: `ok`

No destructive reset was used.
