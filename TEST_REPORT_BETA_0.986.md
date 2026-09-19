# GameIndex Beta 0.986 — Test Report

Date: 2026-09-03
Release: 0.986 Production Consolidation

## PASS — current 0.986 contracts

- `node scripts/check.mjs`: PASS — 255 JavaScript/MJS files parsed successfully.
- `node tests/beta0986-production-consolidation.mjs`: PASS.
- Representative schema 28 → schema 29 migration: PASS.
- Existing user preservation across migration: PASS.
- `PRAGMA integrity_check`: `ok` after migration and in the functional test database.
- Kxng01 exact permanent identity migration: PASS.
- Existing Kxng01 CREATOR role is not downgraded by the 0.986 migration: PASS.
- Admin Connections: active connection/capability integration PASS; last active CREATOR protection PASS.
- Public game page contract: no `Criar conteúdo`, `Criar páginas` or `Pesquisar imagem` buttons: PASS.
- Music Manager 2.0: YouTube ID normalization, per-track default volume and mandatory loop contract: PASS.
- Roblox alternate music slot: PASS.
- Image Manager 2.0: same-origin local storage, binary signature validation, dimension validation, required editor controls and PAGE_BACKGROUND slot: PASS.
- External-image path uses the SSRF-aware `fetchPublicBinary` import path instead of persistent hotlinking: PASS by static/module contract.
- Personalized Game Experience model: PASS.
- Universe Builder 3.0 basic overview: summary/context + character/location/faction/relationship arrays, no AI requirement: PASS.
- Password change: current-password verification, secure rehash and old-password rejection: PASS.
- Optional email 2FA remains disabled when not configured and does not become a core startup dependency: PASS.
- Translation resources: pt-BR, en-US and es-ES have the same 72 locale keys: PASS.
- All 41 top-level public HTML entry pages load the canonical 0.986 shell and 0.986 CSS references: PASS by static contract.
- Obsolete public HF runtime files (`shell.js`, HF7 shells, hotfix performance loader and HF7 consolidated route) are absent: PASS.
- Package hygiene scan: no packaged SQLite DB, WAV/MP3/OGG, plaintext OpenAI key or SMTP password: PASS.

## Selected historical regression checks

- `tests/runtime-graph-0985-hf4.mjs`: PASS — 154 server-reachable modules; legacy AI/image runtimes unreachable.
- `tests/image-engine3-native-0985-hf2.mjs`: PASS — Image Engine 3 native persistence/browser contract retained.
- `tests/migration-0985-hf4.mjs`: PASS — schema 28 additive migration history remains valid.
- `tests/generation-persistence-0985-hf4.mjs`: historical assertion is obsolete because it requires the literal generation version `0.985-HF4`; the 0.986 runtime correctly reports `0.986`. This is not used as a 0.986 release gate.

## Environment blocker — dependency install / live HTTP smoke

A clean `npm ci` was attempted twice. This execution environment could not resolve `registry.npmjs.org` and npm reported `EAI_AGAIN` while fetching Express transitive packages. Because Express/dotenv could not be installed here, `tests/http-smoke-0986.mjs` could not be executed in this container.

The HTTP smoke test is included in the package and is ready to run after dependencies are available:

```powershell
npm.cmd ci
npm.cmd test
npm.cmd run smoke
```

This report therefore does **not** claim an Azure Live Pass. Live Azure validation must happen only after deployment.

## Clean archive extraction validation

The candidate FULL was copied into a clean packaging directory, packaged without runtime data/dependencies, extracted into a second clean directory, then validated again:

- extracted `server.mjs`, `package.json`, `public/` and `src/` at archive root: PASS;
- extracted `node scripts/check.mjs`: PASS — 255 JS/MJS files;
- extracted `node tests/beta0986-production-consolidation.mjs`: PASS;
- archive hygiene (no node_modules/database/audio/.env secret file): PASS.

Result: **PACKAGE PASS for dependency-free/static/module/migration validation**. Network-dependent dependency installation and live Express HTTP smoke remain the documented environment blocker above.
