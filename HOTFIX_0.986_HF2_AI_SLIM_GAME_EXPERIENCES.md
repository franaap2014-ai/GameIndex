# GameIndex Beta 0.986 HF2 — AI Slim + Personalized Game Experiences

## Base
Built on Beta 0.986 HF1 Music Controls. HF1 clickability, null-volume, single-player and top music-popover fixes are preserved.

## What changed
- Shared lazy local AI runtime with capability routing and default concurrency 1.
- Heavy background workers remain deferred in performance mode unless explicitly enabled.
- Universal YouTube loop uses the same player instance, ENDED -> seekTo(0) -> playVideo plus embed loop/playlist fallback.
- Generic Game Experience Engine layers GameIndex + current user theme + game identity + experience variant.
- Roblox Modern and Roblox OG 2009 visual/music variants.
- Roblox Hub with Blox Fruits, DOORS, Fisch, Work at a Pizza Place and Prison Life.
- Five child experiences have distinct menu profiles, font profiles, visual profiles and independent configurable music contexts.
- Image Manager and Music Manager show Roblox parent context; no child soundtrack is auto-selected.
- Game Experience Manager added for Creator-level visual/font/menu configuration.
- Universe Builder automatically sees the five child games through the normal game catalog and receives parent context.
- Cache marker upgraded to `0986hf2`.
- Schema upgraded additively from 29 to 30.

## Important behavior
The five new Roblox child pages intentionally ship without invented songs. Their tracks must be configured manually in Music Manager. A missing track means silence, not a random fallback.

## Friendly routes
- `/game/roblox`
- `/game/roblox/blox-fruits`
- `/game/roblox/doors`
- `/game/roblox/fisch`
- `/game/roblox/work-at-a-pizza-place`
- `/game/roblox/prison-life`

## Health marker
`/health` should report `hotfix: HF2_AI_SLIM_GAME_EXPERIENCES` after a successful deployment.
