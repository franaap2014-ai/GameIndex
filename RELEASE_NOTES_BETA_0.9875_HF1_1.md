# GameIndex Beta 0.9875 HF1.1 — Image Manager Interaction Fix

## Scope
Small corrective hotfix over Beta 0.9875 HF1. No schema migration and no redesign of the personalization/music systems.

## Fixed
- Image Manager buttons, inputs, placeholders and disabled controls now own explicit readable foreground/background colors.
- Roblox OG light surfaces received a stronger semantic contrast pass without changing the approved classic direction.
- Logo and Banner editor now expose a clear Upload / URL source selector.
- URL previews are fetched through the existing server-side safe URL pipeline and returned as a temporary data URL for visual framing before save.
- Invalid/non-http(s) image URLs are rejected.
- Four crop handles are now real pointer interactions (NW/NE/SW/SE), with pointer capture, live proportional scale, explicit drag-vs-resize state and visible resize cursors.
- Resize handles use larger hit areas and remain pointer-active above the crop surface.
- Image dragging remains independent from handle resizing.
- Asset cards now clearly expose Herdar / Imagem própria.
- Cache/release markers updated to Beta 0.9875 HF1.1.

## Data safety
- Schema remains 33.
- No destructive migration.
- Production SQLite is never bundled.
- Existing media and inheritance remain preserved.
- Existing backup retention / ENOSPC protections are unchanged.

## Validation limitation
No interactive browser automation or Azure live deployment was available in the build environment. Pointer behavior is covered by deterministic crop math/state/source checks and the implementation was syntax/regression tested, but no browser PASS or Azure Live PASS is claimed.
