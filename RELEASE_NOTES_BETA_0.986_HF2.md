# GameIndex Beta 0.986 HF2 — Release Notes

**AI Slim + Personalized Game Experiences**

HF2 preserves the 0.986 HF1 music-control fixes and adds a shared lazy local-AI runtime, universal loop hardening, a configuration-driven Game Experience Engine, Roblox Modern/OG variants and the first five Roblox child experiences.

## Roblox v1
- Blox Fruits
- DOORS
- Fisch
- Work at a Pizza Place
- Prison Life

Each child scope has its own theme/font/menu profile, media scope, Universe scope and manually configurable music. Child music is deliberately left unassigned until configured by the Creator.

## Personalized media
Image Manager now supports two levels:
- global game media: Cover, Hero, Page Background and Artwork;
- experience-specific media: Logo, Hero, Background, Card, Gallery and Artwork.

This allows Roblox Modern and Roblox OG 2009 to use independent logos, backgrounds and hero/card imagery instead of sharing the same game-level slot. Existing game media remains the fallback.

## Performance / AI Slim
Normal browsing, experience switching, music controls, Image Manager and basic Universe views do not initialize Gemma. AI-required work is routed through the shared local runtime with concurrency 1 by default.

## Music
One global YouTube player remains authoritative. Loop is reinforced with player-state restart and the embed loop playlist parameter. Volume/mute persist across experience changes. No child song is invented or searched automatically.

## Cache
Critical 0.986/HF2 assets use the final cache marker `?v=0986hf2final`.
