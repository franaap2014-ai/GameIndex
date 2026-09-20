# RELEASE NOTES — GameIndex Beta 0.991 HF1

## Release
- Public version: **0.991**
- Internal release: **0.991-HF1**
- Package: **0.991.1**
- Schema: **41**

## Original interface restored
The Beta 0.991 technical runtime is preserved while the site shell is returned to the pre-launch I6 visual language. The rejected launch-rebrand presentation is no longer the primary site identity. The HF1 restoration layer also keeps current Beta 0.991 routes, authentication, Social, profiles, Creator/Tester/Dev systems, game experiences and current APIs.

## Admin Panel recovered
The Admin Control Center again exposes the expected navigation areas: Overview, Users, Content, Social, System, Bugs and Advanced. Advanced links include Database Explorer, AI Control, AI Flow, Release Contract, Tester Lab, Creator Control and Deployment Monitor. Existing capability middleware remains authoritative; this hotfix does not make restricted tools public.

## New account cinematic platform
A reusable account cinematic runtime now supports persistent account events, queueing and completion state. New and existing accounts receive the `welcome_0991_hf1` Welcome cinematic once. The current primary identity can then receive exactly one matching intro:
- PRO — green
- TESTER — blue
- DEV — red
- CREATOR — gold

A DEV is presented as DEV and does not replay PRO + Tester intros. Cinematic state is stored server-side in `user_cinematic_events`, not only in browser storage.

The circular transition now behaves as a real iris: the visible world contracts toward the center, the black stage takes over, the title powers on/off, identity details rise/descend, and the screen opens again. Reduced-motion users receive a shorter fade-based sequence.

## Theme power cutscene rebuilt
The Appearance transition no longer sends a disconnected plug from the left. The cable originates below the viewport, rises, bends into a continuous horizontal end, keeps the plug attached, aligns the two pins with the socket, inserts, and only after physical insertion applies the new theme and power pulse. Desktop and mobile use the same bottom-origin choreography.

## Universe Builder V3
The Builder gains a real workspace rather than only a sequential card flow:
- Universe Tree bound to actual generated pages/tabs/sections
- Live Preview with Desktop / Tablet / Mobile modes
- Contextual Inspector
- manual section editing
- server-persisted component locks protecting manual edits
- snapshot/checkpoint history and restore
- Needs You issue center with Blocking / Recommended / Optional priority
- Quality Center and publish-readiness surface based on actual state
- Creative Director recommendations surfaced as actionable production guidance
- Auto-Recovery orchestration over existing image/composition, identity, interaction and safe-authorization systems
- before/after metrics for major recovery runs
- mobile Structure / Preview / Inspector modes

The existing research, production-pipeline, Visual Grounding, validation, image and interaction engines are preserved and reused.

## Deployment/runtime
User-facing setup wording is provider-neutral. Persistent storage can be configured with `GAMEINDEX_DATA_DIR` or `GAMEINDEX_DB`; Render/Azure/local Node remain compatible deployment targets. `process.env.PORT` remains supported.

## Database
Migration 041 is additive. It creates:
- `user_cinematic_events`
- `universe_builder_component_locks`
- `universe_builder_snapshots`
- `universe_builder_issues`
- a locked-section protection trigger

No user reset, password reset, subscription reset or Universe reset is performed.
