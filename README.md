# GameIndex Beta 0.991 HF1 — Identity Restoration

GameIndex Beta 0.991 HF1 keeps the Beta 0.991 technical foundation while restoring the pre-launch 0.99 I6 visual language and adding the new account cinematic platform, the rebuilt power/theme cutscene, recovered Admin navigation and Universe Builder V3.

## Release identity
- Public version: **Beta 0.991**
- Internal release: **0.991-HF1**
- Package version: **0.991.1**
- Internal release code: `BETA_0_991_HF1_IDENTITY_RESTORATION`
- Target schema: **41**
- Architecture: `LOCAL_FIRST_NO_API_KEY`

## Main HF1 systems
- **I6 interface restoration** — Beta 0.991 systems remain, but the rejected launch-rebrand shell is no longer the primary interface identity.
- **Admin recovery** — Overview, Users, Content, Social, System, Bugs and Advanced navigation is restored while capability checks remain server-side.
- **Account Cinematic Engine** — server-persisted Welcome, PRO, Tester, Dev and Creator cinematic events with queueing, completion state and reduced-motion behavior.
- **Identity intros** — PRO green, Tester blue, Dev red and Creator gold; inherited lower identities are not replayed for a higher primary identity.
- **Theme power cutscene** — the cable rises from below, curves into the socket, inserts physically and only then applies/powers the new theme.
- **Universe Builder V3** — three-panel workspace, real structure tree, live preview, contextual inspector, Needs You, Quality Center, Creative Director surface, Auto-Recovery, component locks and snapshots.
- **Hosting-neutral deployment** — environment/deployment wording no longer assumes Azure and persistent SQLite can be pointed at `GAMEINDEX_DATA_DIR` or `GAMEINDEX_DB`.

## Install and run
```bash
npm ci
npm run check
npm test
npm run smoke
npm start
```

`npm run smoke` performs the current 0.991 HF1 production-start HTTP smoke test. `npm run smoke:0986` retains the historical smoke script.

## Persistent production data
Do not replace or delete the production SQLite database. Migration `041_beta_0991_hf1.sql` advances schema 40 → 41 additively and preserves existing users and Universe projects.

On hosts with ephemeral local filesystems, configure persistent storage using `GAMEINDEX_DATA_DIR` or `GAMEINDEX_DB`.

## Secrets
Never commit `.env`, setup/recovery codes, API keys, database credentials or provider tokens. `.env.example` contains names/placeholders only.
