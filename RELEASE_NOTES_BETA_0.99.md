# GameIndex Beta 0.99 — Final Foundation

## Baseline
Official predecessor: Game Index Beta 0.9875 HF1.1 — Image Manager Interaction Fix.

Beta 0.99 is an additive architectural release, not a rewrite.

## 1. GAME vs EXPERIENCE
Roblox remains a top-level `GAME`. The existing records for Blox Fruits, DOORS, Fisch, Work at a Pizza Place and Prison Life are classified in place as `EXPERIENCE` and linked to Roblox. Their stable IDs/slugs/routes are preserved where the baseline contains them.

The global Games catalog now queries top-level `GAME` entities rather than mixing Roblox Experiences with Games. Search still indexes Experiences and returns parent-aware routes such as `/game/roblox/blox-fruits`.

## 2. Universe Builder 2.0 — Final Foundation
A new entity-scoped Universe Builder pipeline establishes:

`RESEARCH -> EVIDENCE_COLLECTION -> NORMALIZATION -> FACT_EXTRACTION -> CONFLICT_RESOLUTION -> TOPIC_CLASSIFICATION -> STRUCTURE_PLANNING -> PAGE_DISTRIBUTION -> INTERACTION_PLANNING -> MEDIA_PLANNING -> CONTENT_BUILD -> TRANSLATION -> VALIDATION -> PERSISTENCE`

Each GAME/EXPERIENCE uses one reusable engine with its own build context. The builder can create/update pages, tabs and sections, retain evidence/provenance, produce revisions, validate drafts and publish explicitly.

Approved Beta 0.99 source families are:
- dedicated game/experience Wiki — not Wikipedia
- Fandom
- public/relevant Trello
- YouTube public metadata/evidence

Research is demand-driven and does not run on `/health`, Home startup or ordinary public game-page views. The architecture requires no paid search API and no YouTube Data API key.

## 3. Content Media
Page/topic/section images now have a dedicated Content Media domain. They are intentionally separate from Image Manager assets.

Image Manager remains focused on:
- LOGO
- BANNER

Remote media/source handling keeps URL and SSRF protections, bounded payload behavior and provenance metadata.

## 4. Interactive Universes
Beta 0.99 adds a safe reusable Interactive Component Registry rather than allowing generated arbitrary JavaScript. The foundation supports WHEEL, CALCULATOR, COMPARATOR, FILTER, PROGRESSION_TREE, CHECKLIST, TIMELINE, GALLERY, TABLE, SEARCHABLE_COLLECTION, MAP and STAT_EXPLORER contracts.

The generic WHEEL implementation validates and normalizes weighted probability data independently from animation. Blox Fruits is the primary architecture test case. The release does not ship invented fruit odds: factual datasets must come from verified/researched structured evidence.

## 5. Experience Identity System
Five Roblox Experience profiles validate a generic identity engine:
- Blox Fruits — adventure/fruit/maritime direction
- DOORS — corridor/door/elevator direction
- Fisch — aquatic/fishing direction
- Work at a Pizza Place — pizza/workplace direction
- Prison Life — classic Roblox/prison/2016 direction

The public runtime consumes structured profiles and semantic tokens. Parent and Game Index default fallbacks prevent broken unstyled pages.

This is a testbed. Global personalization across every Game Index game is intentionally not declared final in Beta 0.99; the system is expected to continue being refined through approximately Beta 0.995.

## 6. Personalized Technical Profiles
Each official Roblox Experience can resolve an independent Technical Profile with structured fields/groups and an Experience-specific presentation identity. Missing optional fields are not rendered as fake empty data.

## 7. Prison Life music semantics
Prison Life resolves its approved music relationship as Roblox 2016-era inheritance (`ERA_INHERITANCE`). This is historical/era ambience, not a claim that Prison Life has a unique official soundtrack. The existing single global YouTube music runtime remains unchanged.

## 8. Role/capability foundation
Beta 0.99 establishes the future-facing hierarchy/capability contract:

`CREATOR > DEV > TESTER > PRO > FREE`

The future Game Submission capability is representable as TESTER+. PRO subscription status alone does not grant Tester authority. Full Tester/Game Submission UI remains scheduled for Beta 0.993.

## 9. Foundation for 0.991 -> 1.0
Stable entity IDs, revisions, structured knowledge and capability contracts prepare later releases for Social, AI, Tester/Game Submission, Creator/Moderation, Search/Discover, global personalization, performance/mobile and integration. Those future systems are not falsely marked as implemented in Beta 0.99.

## 10. HF1.1 preservation
The release preserves Image Manager Upload/URL source mode, safe server URL preview, four functional NW/NE/SW/SE crop handles, Pointer Events/pointer capture, proportional resize, mobile touch behavior, readable controls, Roblox OG contrast fixes and LOGO+BANNER simplification.

## Database
- Target schema: 34
- New additive migration: `src/database/migrations/034_beta_099.sql`
- No production DB reset
- Existing Roblox child records are updated/classified rather than deleted/recreated
- Existing bounded backup-retention system remains enabled

## Validation status
Automated syntax, Beta 0.99 architecture, migration and prior-release regression suites pass in the generated worktree. The final package is additionally re-extracted and validated before release packaging is declared complete.

Browser automation: not performed in this environment.
Azure live deployment: not performed in this environment.
External live-source research end-to-end: architecture is implemented, but deterministic release tests do not depend on live third-party availability.
