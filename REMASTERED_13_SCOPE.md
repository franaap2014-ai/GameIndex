# GameIndex Remastered — 13 Pillars

> A separate, reviewable rebuild on top of the GameIndex Beta 0.992 I3 persistence and permission system.

## What this branch changes
1. **Menus:** redesigned destination tiles in the existing drawer; identity and admin gates preserved.
2. **Fewer cutscenes:** the 0.93 automatic page-reveal and link-blocking effects were disabled.
3. **One top bar:** a single unified responsive header, with the old mobile search toggle hidden.
4. **Original music:** `Constellation Gateway` is an original browser-synthesized 86 BPM eight-bar composition, played from the MUSIC popover when the user clicks Play. No external song, ads or remote music service required. Browser autoplay policies are respected.
5. **Own identity:** bespoke GameIndex portal vector, typographic structure, compositional gradients, theme-aware logo.
6. **Game images:** unified 16:10 catalog framing, correct fallback, Image Manager `data-gi-framed` fit instructions take priority.
7. **Cutscene quality:** special welcome and theme systems remain enabled; full artistic rework of individual cinematic templates awaits visual acceptance.
8. **Dexter:** existing verified research and game-context endpoints remain; added an internal source-grounded recommendation path when cloud LLM is not configured. **A generative LLM is not online unless a provider is explicitly configured.**
9. **Game pages:** enhanced immersive cover and backdrop presentation; original interactive tabs preserved.
10. **Personalization:** respects the old role themes and the light theme, honors reduced motion; accounts/preferences remain on the original system.
11. **Performance:** limited animations, lazy image decoding and styling without new large UI dependencies.
12. **Lobby:** reconstructed HTML and new portals, editorial discovery grid, stats and new branded journey section.
13. **Quality:** automatic CI with syntax checks and Remastered, I3, 0.93 test suites, plus historical recovery regression.

## Main files
- `public/index.html`, `public/games.html`, `public/ai.html` — rebuilt pages, preserving script API IDs.
- `public/css/remastered-13.css` — visual design system.
- `public/js/remastered-13.js` — browser integration.
- `public/js/remastered-soundtrack.js` — custom original music synthesis.
- `public/assets/brand/remastered-gateway.svg` — bespoke brand artwork.
- `src/dexter/public-consult.mjs` — catalogue-based recommendations without a generative model.
- `tests/remastered-13.mjs` — regression contracts.

## Infrastructure safety
- Existing Render service: `GameIndex` in workspace `My Workspace`, plan `free`.
- Production auto-deploy follows **main**, not this preview branch.
- Existing Neon snapshot persistence stays untouched; no schema migration or data deletion.
- No new paid resources or changes to user permissions.
- Do **not** merge this draft PR without final visual review and acceptance.

## Dexter online-model readiness
The optional cloud adapter from the previous remaster supports server-side `DEXTER_PROVIDER=openai`, `DEXTER_API_KEY`, `DEXTER_MODEL`, `DEXTER_API_BASE_URL`. These settings require a valid model and external API account. Do not store keys in GitHub, JS, docs or public variables. Current production runs without a configured external model. The fallback can answer catalog, product navigation and verified-research queries, but is not a full conversational LLM.

## What is not yet proven or complete
- Cross-browser real-device visual QA and click-through tests for every administrative and creator workflow.
- Fully original, final artistic variants of special cutscenes.
- Final sound design approval and download-ready mastered audio file (site currently synthesizes it).
- A configured and live-tested real generative Dexter provider.
- Full localization coverage and all deeper settings/social/admin redesigns.

This branch is a **functional preview**, not a claim that every one of the thirteen pillars has reached 100% final acceptance.
