# Deploy — GameIndex Beta 0.9915 I1 HF1

## Public identity

The deployed public product remains **Beta 0.9915**. I1/HF1 identifiers are internal only.

## Database

Target schema: **46**.

Migration:

```
src/database/migrations/046_beta_09915_i1_hf1_full_recovery.sql
```

The normal startup migration path creates a verified database backup before applying a schema step.

Do not manually reset or replace the production database.

## Pre-deploy

1. Confirm durable persistence/backup state.
2. Run `npm run check`.
3. Run `npm run test:09915hf1`.
4. Run `npm run test:09915`.
5. Run `npm run smoke`.
6. Verify a test copy migrates from schema 45 to 46.
7. Verify profile, Roblox hub/children, header, forms, Cinematic Test Lab and Admin capabilities.

## Rollback

Application code can be rolled back to the previous release commit if needed. Do not delete or downgrade production user data. Migration 046 is additive; rollback should leave its compatible tables/rows in place unless a separately reviewed data migration explicitly requires otherwise.
