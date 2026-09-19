# GameIndex Beta 0.986 HF2 — FULL deploy

Deploy `GameIndex_Beta_0.986_HF2_AI_SLIM_GAME_EXPERIENCES_FULL.zip` as the complete application source.

The ZIP root directly contains `server.mjs`, `package.json`, `public/`, `src/`, `iis-start.cjs` and `.deployment`. Do not add another parent directory.

## Preserve production data
Do not replace or delete the persistent SQLite database or the GameIndex user-content folder. HF2 migrates schema 29 -> 30 -> 31 additively. Schema 31 adds independent media slots for individual experience variants while preserving all game-global image overrides.

## Recommended production environment
- `NODE_ENV=production`
- `PERFORMANCE_MODE=true`
- `AI_MODE=LOCAL_FIRST`
- `OLLAMA_ENABLED=true`
- `OLLAMA_MODEL=gemma3:4b`
- `MAX_CONCURRENT_AI_TASKS=1`

Heavy background workers remain deferred in Performance Mode unless explicitly enabled.

## Post-deploy checks
- `/health` reports version `0.986` and hotfix `HF2_AI_SLIM_GAME_EXPERIENCES`.
- Critical assets use cache marker `0986hf2final`.
- MUSIC controls remain clickable; volume and mute persist.
- Configured music loops automatically with one global player.
- Roblox Modern and OG 2009 switch visual + music profiles.
- Five Roblox child routes load directly and after refresh.
- Image Manager can manage both global game media and experience-specific LOGO/HERO/BACKGROUND/CARD/GALLERY assets.
- Music Manager, Universe Builder and Game Experience Manager remain server-protected.
- Ollama/Gemma stays idle during normal public browsing.

No `AZURE LIVE PASS` is implied by this package. It requires testing the actually deployed Azure instance.
