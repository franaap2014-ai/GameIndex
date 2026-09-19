# GameIndex Beta 0.9875 — Full Page Personalization Polish

Beta 0.9875 is a focused polish release built on Beta 0.987. It does not replace the existing personalization architecture; it extends it to the complete game-page shell.

## Main changes

- Roblox Modern and Roblox OG personalization now reaches the root page, header, drawer, music popover, game shell, navigation, panels, cards, buttons and responsive states.
- The approved Roblox visual direction from 0.987 is preserved. OG remains a GameIndex × classic-Roblox-inspired interpretation, not a replica of the historical Roblox website.
- Image Manager 3.0 exposes only two primary personalization assets: `LOGO` and `BANNER`.
- Modern and OG can own independent LOGO and BANNER media and switch them at runtime with the active experience.
- `BANNER` is canonical for experience/era media. At game level it maps to the existing `HERO` storage slot to avoid a destructive production schema rebuild.
- Existing HERO, BACKGROUND, CARD, GALLERY, ARTWORK, COVER and PAGE_BACKGROUND records are preserved as legacy/fallback media.
- Roblox related-child UI now uses context-aware terminology: Experiências / Experiences / Experiencias instead of Franquia / Franchise for the Roblox ecosystem.
- Full-page experience state is propagated to the document root to prevent isolated/partially themed regions.
- Early Roblox personalization bootstrap reduces flashes of default styling before the saved Modern/OG choice is restored.
- Existing Music Engine 0.987 behavior is preserved: one global YouTube player, mute/volume persistence and redundant loop handling.
- Existing database backup retention and ENOSPC protections are preserved.

## Database

Schema target: `33`.

Migration `033_beta_09875.sql` is additive and metadata-only. It does not delete or rewrite existing media, users, games, music, identities or relationships.

## Compatibility

- Node.js >= 22.13
- Express 5.1
- built-in `node:sqlite`
- Windows Azure App Service
- local-first / no API key required

## Deployment note

Use the FULL archive for a controlled Azure deployment. The archive does not include `node_modules`, a production SQLite database, backup databases, `.env`, downloaded audio or runtime logs.

Azure Live PASS is not claimed until this build is actually deployed and tested on the live App Service.
