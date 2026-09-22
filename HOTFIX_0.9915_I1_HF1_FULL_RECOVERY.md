# GameIndex Beta 0.9915 I1 HF1 — Full Recovery Hotfix

Public product remains **GameIndex Beta 0.9915 — Cinematic Update**.

## Implemented recovery

- Profile favorites no longer make the whole profile fail when the 0.9915 schema is temporarily unavailable.
- Profile avatar reads degrade safely when the avatar catalog schema is unavailable; writes fail explicitly instead of producing unrelated profile errors.
- Schema 46 adds an additive recovery migration and preserves existing user/game/social data.
- Roblox parent hubs now prefer real child EXPERIENCE entities.
- The recovery migration creates the five planned Roblox starter experiences only when missing and repairs their parent relationship.
- Medium-width header no longer forces the search field onto a second row.
- Scoped form-control recovery restores readable input, textarea, select, option, placeholder and focus states.
- Cinematic Test Lab now exposes a basic three-step sandbox flow; sequence testing remains available as an advanced section.
- Admin navigation is regrouped into Overview, Content & Games, Cinematics, and System & Diagnostics while preserving capability checks.
- Internal release metadata is 0.9915 I1 HF1 while public UI remains Beta 0.9915.

## Data safety

Migration 046 is additive. Existing Roblox experience rows win over starter seed content through INSERT OR IGNORE, then only classification/status/parent relationship fields required for the hub are repaired.

No destructive reset, DROP or truncate operation was added.

## Scope intentionally preserved

Authentication, Social, messages, communities, Universe Builder, Image Manager, Music Manager, Creator tools, capability enforcement, Animation Editor architecture and existing 0.9915 cinematic runtime are not replaced by this hotfix.
