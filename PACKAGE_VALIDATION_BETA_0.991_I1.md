# Package Validation — Beta 0.991 I1

Source branch: `beta-0.991-i1`  
Base: `main` @ `b5ec11f50651287c9da3429be9f7397532074b88`

## Git comparison
- Ahead by: 36
- Behind by: 0
- Changed files at validation time: 33
- Additions: 5514
- Deletions: 74

## Included release artifacts
- MASTER_PROMPT_BETA_0.991_I1.md
- RELEASE_NOTES_BETA_0.991_I1.md
- MIGRATION_REPORT_BETA_0.991_I1.md
- TEST_REPORT_BETA_0.991_I1.md
- PACKAGE_VALIDATION_BETA_0.991_I1.md
- UPDATE_ONLY_README_0.991_I1.md
- FULL_DEPLOY_README_BETA_0.991_I1.md
- BETA_0.991_I1_CHANGED_FILES.txt

## Safety
The branch does not intentionally add `.env`, a production SQLite database, `node_modules`, API keys or setup-code files.

## Implementation validation
- Changed browser JavaScript parser validation: PASS.
- Changed/new module parser validation: PASS after module-declaration normalization.
- I1 static release-contract checks evaluated against branch contents: PASS.
- Master prompt copied from the supplied implementation specification.

## Not claimed
A real `npm ci`, full `npm run check`, HTTP smoke and production restart test were not executed in this environment because direct GitHub/npm network checkout was unavailable. See `TEST_REPORT_BETA_0.991_I1.md`.

## Deployment gate
For the current Beta 0.991 I1 HF1 package on Render, production persistence must be the Neon `DATABASE_URL`. Do not configure a persistent SQLite path or Render disk as the production data store.
