# GameIndex Beta 0.986 HF1 — Music Controls Test Report

## Result

PACKAGE TEST: PASS for the targeted hotfix.

## Root causes reproduced by source inspection

1. `.gv-global-ui` uses `pointer-events:none` so it does not block the page. The music popover was a child of that layer but did not restore pointer events, leaving the visible buttons and range input non-interactive.
2. The music runtime used `Number(localStorage.getItem("gi_audio_volume"))`. With no stored key, `getItem()` returns `null` and `Number(null)` is `0`, so the configured/default volume was silently overridden to 0%.

## Fixes verified

- Music popover and descendants explicitly use `pointer-events:auto!important`.
- Missing volume preference now returns `null`, allowing the configured track default (or 30%) to be used.
- Volume 0 remains a valid explicit user/admin value.
- PLAY now reports when a page has no configured track instead of appearing dead.
- Initial YouTube volume/mute/play synchronization is retried after iframe load.
- Music binding is guarded against duplicate/race binding.
- Critical shell/CSS references use cache key `0986hf1` in all 41 HTML entrypoints.
- `/health` identifies `hotfix: "HF1_MUSIC_CONTROLS"`.
- No floating/bottom Now Playing dock was restored.

## Automated checks

- JavaScript/MJS syntax: 255 files checked, 0 failures.
- `tests/music-controls-0986-hf1.mjs`: PASS.
- `tests/beta0986-production-consolidation.mjs`: PASS.
- Schema remains 29; no hotfix migration is required.
- 0.985 -> 0.986 preservation test remains PASS through the production-consolidation suite.

## Environment limitation

A real YouTube playback test cannot be guaranteed inside the isolated build environment because browser/network policy can block local/YouTube navigation. The hotfix therefore reports PACKAGE PASS, not AZURE LIVE PASS. Verify on the deployed Azure site after publishing.
