# Release Notes — GameIndex Beta 0.99 I5

## Intelligent content and visual quality
- Added Research Quality Engine 2.0 with content classification and boilerplate rejection.
- Added semantic scoring between image variables and approved assets.
- Added Hero compatibility rules, variable-specific candidate pools, reuse penalties and asset-diversity auditing.
- Added Visual Gap Auto-Healing and Small Detail planning using approved real assets only.
- Added I5 RICH quality gates: Hero, required image resolution, semantic match, diversity, visual gap and current Preview.
- Added Auto Fix pipeline for missing/weak image bindings and composition issues.

## Universe Builder UX 3.0
- Simple Mode is the default production interface.
- Main workflow is Content → Images → Appearance → Interactions → Preview → Publish.
- Added plain-language status and blocker translation.
- Technical IDs, registry controls, validation internals and Legacy Compatibility move under Advanced Mode.
- Fixed interaction preset duplication by reusing an existing active binding with the same element/event/action/target identity.
- Empty Element Key errors are no longer surfaced during normal load/build flow.

## Admin Control Center 2.0
- Reduced primary navigation to Overview, Users, Content, Social, System, Bugs and Advanced.
- Added quick actions and global Admin search.
- User role management is directly available from the user administrative profile while preserving existing server-side capability checks and audit behavior.
- Deep technical tools remain available under Advanced.

## Social 2.0
- Reorganized Social around Feed, Communities, People, Notifications and Profile.
- Added persistent Social post context for GAME / EXPERIENCE and topic association.
- Added moderation summary and moderation actions for Admin.
- Preserved existing messages/groups as secondary tools instead of deleting existing Social data.

## Bug Tracker 2.0 / Regression Center
- Added independent bug relevance states: CURRENT, LEGACY, NEEDS_REVERIFICATION and SUPERSEDED.
- Historical workflow status is not changed automatically by re-verification.
- Added regression run persistence, bug-test links and deterministic regression mappings for important historical bugs.
- GI-0001 through GI-0006 are preserved and mapped for current-version re-verification.

## Version consistency
- Public version is centralized as `0.99` / `Beta 0.99`.
- Internal release is centralized as `0.99-I5`.
- Current public HTML no longer exposes old active Beta 0.987 / 0.9875 labels.
- Compatibility APIs that previously reported I4 now use the centralized I5 internal release metadata.

## Database
- Schema target: 38.
- Additive migration: `038_beta_099_i5.sql`.

## Compatibility
Preserved: GAME / EXPERIENCE, I4 three-stage pipeline, Image Manager HF1.1, music/mute/volume, Appearance/Creator, existing Social records, Bug Tracker history, AI Control Center, optional local Ollama/Gemma and Azure App Service layout.
