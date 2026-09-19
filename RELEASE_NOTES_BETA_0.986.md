# GameIndex Beta 0.986 — Release Notes

## Production Consolidation

0.986 is a consolidation release, not HF8. Stable 0.985 functionality is moved back into canonical runtime files and obsolete HF browser overlays are excluded from the package.

### Public game experience
- Removes `Criar conteúdo`, `Criar páginas` and `Pesquisar imagem` from public game-page actions.
- Keeps public pages focused on game identity, information, universe, media and relationships.
- Adds a top game music/experience area instead of development controls.
- Keeps the Home hero viewport-centred and constrains the desktop header search.

### Universe Builder 3.0
- Basic overview is local-first and does not require Ollama.
- Presents summary, contextualization, known characters, important locations, factions and relationship samples when stored data supports them.
- Advanced builds remain explicit/demand-driven.

### Image Manager 2.0
- Slots: Cover, Hero/Banner, Game Page Background and Artwork.
- Supports local image upload and external URL.
- Client editor supports Original, 1:1, 16:9 and 3:4, manual dimensions, Crop/Fit/Center, focus position and WebP quality.
- Local processed images are stored under persistent GameIndex data and served same-origin.
- Manual media overrides take priority over Image Engine 3 without deleting the automatic asset.

### Music Manager 2.0
- Manual YouTube configuration only; no YouTube Data API, automatic search or audio extraction.
- One lazy global player.
- Loop is mandatory for configured tracks.
- User volume 0–100 persists; user preference overrides track default volume.
- Mute and session activation persist appropriately.
- Removes the bottom `Now Playing`/YouTube panel and the fixed bottom-right player.

### Roblox pilot
- Primary label: `It's Raining Tacos`.
- Alternate label: `OG Roblox Theme / OG 2009`.
- Both use the same player and loop.
- Main and OG experience variants can use different configured page imagery/accents.

### Identity and account security
- Adds persistent `admin_connections` based on permanent user IDs, not usernames alone.
- Known Kxng01 permanent ID migrates to active DEV access when that exact account exists.
- Existing primary Creator/Franchesco01 identity is preserved through the existing verified primary Creator ID.
- Adds password change with current-password verification and session invalidation.
- Adds optional email 2FA using environment-configured SMTP; core GameIndex remains usable without mail configuration.
- `Esqueci minha senha` remains intentionally out of scope.

### Localization and deployment
- Extends pt-BR, en-US and es-ES locale resources for the new administrative/security/music surfaces.
- Critical CSS/JS use 0.986-versioned URLs so a deploy cannot appear to update only the version badge while retaining stale UI assets.

## HF1 — Music Controls Interaction

- Fixed visible music controls not receiving clicks due to the global UI pointer-events layer.
- Fixed missing saved volume being interpreted as 0%.
- Improved PLAY/MUTE/volume synchronization with the single YouTube player.
- Added deterministic cache-bust `0986hf1` and health marker `HF1_MUSIC_CONTROLS`.
- No database schema change.

## HF2 — AI Slim + Personalized Game Experiences

- Consolidates AI-required Dexter work behind one shared lazy local runtime with default concurrency 1.
- Defers unnecessary heavy background workers in performance mode unless explicitly enabled.
- Reinforces automatic loop for every configured music track while preserving one global player, volume and mute.
- Adds the generic Game Experience Engine that layers GameIndex + user theme + game/variant identity.
- Adds Roblox Modern and Roblox OG 2009 experience variants.
- Adds Roblox Hub and five initial child experiences: Blox Fruits, DOORS, Fisch, Work at a Pizza Place and Prison Life.
- Adds distinct child menu/font/visual profiles, friendly routes, Image/Music/Universe integration and Game Experience Manager.
- Does not invent child songs; each child music profile is configured manually in Music Manager.
- Adds cache marker `0986hf2`, health marker `HF2_AI_SLIM_GAME_EXPERIENCES`, and additive schema 30.
