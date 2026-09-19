# GameIndex Beta 0.99 I6 — Universe Builder Experience 4.0

GameIndex Beta 0.99 I6 evolves the I5 production-consolidation baseline into a simple-first authoring environment centered on research-driven interaction ideas, real visual identity motifs, previews, authorization decisions and controlled multi-pass enhancement.

## Release identity
- Public version: **Beta 0.99**
- Internal release: **0.99-I6**
- Internal release code: `BETA_0_99_I6_UNIVERSE_BUILDER_EXPERIENCE`
- Target schema: **39**
- Architecture: `LOCAL_FIRST_NO_API_KEY`

## Main I6 systems
- **Universe Builder Experience 4.0** — simple default flow with Build, Enhance, Preview and Publish; raw IDs, hashes, registries and declarative schemas stay in Advanced Mode.
- **Build State Consistency** — separates current build/revision, last valid revision, Preview revision and published revision so counters from different states are not mixed.
- **Visual Identity Motif Engine** — discovers entity-specific symbols, items, factions, UI details, props and other motifs using generic categories; authentic visuals still require approved real assets.
- **Interactive Experience Discovery Engine** — converts accepted research into localized interaction ideas without per-game hard-coding.
- **Interactive Preview & Refinement** — generates safe declarative prototypes and supports Preview → Approve / Rebuild / Discard with iteration history.
- **Authorization Inbox** — collects only decisions that genuinely need a human, including visual-identity and interaction approvals.
- **Multi-Pass Enhancement Engine** — runs 1–5 sequential research passes, targets remaining gaps, deduplicates results and can focus on content, images, visual identity or interactions.
- **Published I6 runtime** — approved motifs and approved interaction prototypes use renderer-controlled markup without stored executable JavaScript.

## Authenticity and safety rules
- No fake game-specific art presented as authentic.
- No hard-coded Blox Fruits / Fisch / DOORS interaction implementation.
- No `eval`, `new Function`, arbitrary stored JavaScript or external discovered-site scripts.
- No required cloud AI API key.

## Local start
```powershell
npm.cmd ci
npm.cmd run check
npm.cmd test
npm.cmd start
```

## Production data
Do not replace or delete the production SQLite database. Migration `039_beta_099_i6.sql` advances schema 38 → 39 additively and preserves I5 data.

## Validation scope
The final package validation runs the dedicated I6 suite plus Beta 0.99, I1, I2, I3, I4, I5, HF1 and HF1.1 regressions. Browser automation and live Azure deployment are not claimed unless explicitly executed.
