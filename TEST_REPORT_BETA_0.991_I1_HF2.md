# GameIndex Beta 0.991 I1 HF2 — Test Report

## Validation actually executed during implementation

The modified JavaScript/ESM release files were parsed for syntax after the HF2 changes. The checked files include the authorization services, database connection, Animation Editor backend, API routes, server, sidebar, Admin UI and Animation Editor browser runtime/editor.

The final syntax pass reported **PASS** for the checked HF2 modules.

Additional implementation inspection verified:

- Creator remains `new Set(CAPABILITIES)`;
- `animation_edit` and `animation_publish` are registered;
- first-owner setup creates a CREATOR ACTIVE Admin Connection;
- owner recovery activates the new Creator before demoting the previous Creator;
- migration 044 uses additive `INSERT OR IGNORE` repair semantics;
- Render production still requires Neon `DATABASE_URL`;
- Animation Editor HTML and publishing APIs are server capability protected;
- publishing triggers an immediate durable persistence flush;
- the Admin Panel remains capability-driven and collapsible.

## Neon verification actually executed

The connected Neon project **GameIndex** was inspected read-only.

At verification time:

- database: `gameindex`
- PostgreSQL: 17
- durable snapshot control tables existed;
- two complete production snapshot metadata rows existed;
- the latest snapshot reported schema **43** and release `BETA_0_991_I1_HF1_NEON_PERSISTENCE`;
- the latest SQLite snapshot size was approximately 11.7 MB.

This is the expected source state before the first HF2 boot migrates it to schema 44.

## Regression test code added/updated

HF2 adds:

```
tests/beta0991-i1-hf2-creator-animation-editor.mjs
```

The test covers Creator connection repair, explicit revoked-connection preservation, migration idempotency, Animation Editor schema, declarative validation, route protection contract, sidebar integration, component-specific inspector, easing runtime and release metadata.

Older I1/HF1 regression contracts were adjusted only where the current release/schema legitimately advanced to HF2/schema 44.

## Not executed in the connector environment

The following commands were prepared but were **not successfully executed as a real repository runtime test** in this implementation session:

```
npm ci
npm run check
npm run test:0991hf1
npm run test:0991i1
npm run test:0991i1hf1
npm run test:0991i1hf2
npm run smoke
```

No GitHub Actions runner was available for the feature branch, so these are not claimed as passed.

## Production acceptance still pending

Only a real Render deployment can prove the final end-to-end persistence path:

Creator login → Admin Panel → Animation draft save → Render restart/redeploy → same Creator powers and same draft still present.

Do not classify HF2 production persistence as fully accepted until that restart test succeeds.
