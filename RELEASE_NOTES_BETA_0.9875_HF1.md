# Game Index Beta 0.9875 HF1 — Image Manager + Visual Crop + UI Simplification

## Scope

Focused polish release on top of Beta 0.9875. No platform rewrite and no schema bump.

## Image Manager

- Rebuilt the normal Image Manager around a clear game/experience tree.
- Normal workflow now exposes only **LOGO** and **BANNER**.
- Roblox is separated into **Roblox**, **Roblox OG**, and a **Roblox Games** group containing Blox Fruits, DOORS, Fisch, Work at a Pizza Place, and Prison Life.
- The tree is generated from existing game/parent/experience relationships instead of duplicating game records.
- Added search, expandable groups, active-target highlighting, responsive layout, and collapsed advanced diagnostics.
- Roblox OG LOGO/BANNER targets are independent from the normal/current Roblox targets.
- Existing legacy media remains preserved and available for fallback.

## Visual crop editor

- Replaced slider-first positioning with a direct visual editor.
- Drag the image to reposition it.
- Resize proportionally with four corner handles.
- Added Fill, Fit, Center, Reset, Apply, and Cancel controls.
- Uses Pointer Events for mouse/touch interaction and supports wheel zoom on desktop.
- Uses normalized transform state and renders the committed result to WebP through the existing media save path.
- No Canva account/API or new frontend framework is required.

## Roblox OG readability

- Added semantic OG light/dark surface tokens.
- Corrected white-on-white/light-surface text inheritance across game panels, cards, metadata, tabs, forms, buttons, related experiences, navigation-adjacent surfaces, and footer-compatible areas.
- Preserved the approved Game Index × classic Roblox direction.

## Runtime / safety

- Release marker: `BETA_0_9875_HF1_IMAGE_MANAGER_UI`.
- Database schema remains **33**.
- Production SQLite reset is not performed.
- Existing backup-retention / ENOSPC protection remains intact.
- Existing Music Engine architecture, one-player invariant, loop, mute and volume persistence remain unchanged.
- No new runtime dependencies were added.

## Known validation limits

- Browser automation for pointer dragging/touch interaction was not available in the isolated build environment. Crop mathematics, state contracts, static UI wiring, and regression behavior were tested instead.
- HTTP smoke was not run because `express` and `dotenv` are not installed in the isolated packaging environment and `node_modules` is intentionally excluded from release archives.
- No Azure Live PASS is claimed; deployment to the real App Service was not performed here.
