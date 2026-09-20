# Game Index Beta 0.991 HF1 — Cinematic Visibility Hotfix

Fixes a release packaging/runtime bug where `cinematic-0991-hf1.css` existed but was not loaded by the HF1 pages. The cinematic JavaScript could therefore complete and persist the account event without rendering the intended fullscreen visual.

Changes:
- HF1 stylesheet imports the cinematic stylesheet.
- Cinematic runtime has a stylesheet safety loader.
- Cinematic initialization is race-safe if `gv:shell-ready` fires early.
- Welcome and identity event keys were advanced to visual v2 so users affected by the invisible first playback receive the corrected cinematic exactly once.
- Regression tests now verify the stylesheet linkage and race-safe bootstrap.

This hotfix does not change the Render persistence model. A Render service using ephemeral local SQLite can still lose accounts on redeploy/restart/spin-down unless persistent storage is configured.
