# GAMEINDEX — BETA 0.99 I3

## GAME-SOURCED VISUAL COMPOSITION

## UNIVERSE BUILDER STATE UNIFICATION

## VALIDATION 2.0

## VISUAL COVERAGE

## RESEARCH-TO-ASSET PIPELINE

## PERFORMANCE AND FINAL 0.99 POLISH

---

# 1. VERSION

Target version:

```text
GameIndex Beta 0.99 I3

```

This is an **Intermediate update** of the main version `0.99`.

GameIndex version hierarchy is:

```text
V → I → HF

```

Where:

```text
V  = Main Version
I  = Intermediate
HF = Hot Fix

```

An Intermediate may contain:

- improvements
- additions
- bug fixes
- architectural refinements
- UX improvements
- polishing

A Hot Fix must contain bug fixes only.

When the main Version changes:

```text
I resets
HF resets

```

When the Intermediate changes:

```text
HF resets

```

Therefore this update is:

```text
0.99 I3

```

and NOT:

```text
0.993
0.995
0.99 I2 HF1

```

because this update contains substantial improvements and new systems, not only bug fixes.

---

# 2. BASELINE

Upgrade the existing:

```text
GameIndex Beta 0.99 I2

```

into:

```text
GameIndex Beta 0.99 I3

```

This is NOT a rewrite.

Do not restart the project.

Do not replace working I2 systems without analyzing them first.

Preserve all working systems from:

- Beta 0.99
- Beta 0.99 I1
- Beta 0.99 I2
- previous Hot Fixes that remain applicable

I3 must evolve the current codebase.

---

# 3. PRIMARY I3 PROBLEM

Beta 0.99 I2 successfully expanded Universe Builder into an:

```text
INTELLIGENT PROCEDURAL EXPERIENCE ENGINE

```

However, its visual grounding implementation still has a fundamental weakness.

The engine currently understands semantic concepts such as:

```text
FISCH_FISH
FISHING_HOOK
WATER_WAVE
JOLLY_ROGER
DOOR
PRISON_BAR
PIZZA

```

but may then create or render generic visual representations of these concepts.

This is incorrect.

A generic fish is NOT Fisch.

A generic pirate skull is NOT Blox Fruits.

A generic wooden door is NOT DOORS.

Generic prison bars are NOT Prison Life.

The Universe Builder must not invent visual identity.

---

# 4. CENTRAL I3 RULE

The core I3 rule is:

> **The Universe Builder may compose, distribute, position, animate and interact with a game's visual identity, but it must not invent that identity.**

Game-specific visual elements must originate from:

- real game imagery
- approved game assets
- approved screenshots
- approved extracted visual material
- existing approved GameIndex media
- validated visual references

The engine itself is a:

```text
COMPOSITOR

```

not a replacement artist for the game.

---

# 5. VISUAL GROUNDING ENGINE 2.1

Rename/evolve the subsystem conceptually into:

# VISUAL GROUNDING ENGINE 2.1

## GAME-SOURCED VISUAL COMPOSITION ENGINE

Its responsibilities:

- discover game-specific visual material
- classify assets
- validate assets
- prepare visual vocabulary
- distribute assets
- maintain visual continuity
- avoid excessive repetition
- enforce visual density
- preserve performance
- expose coverage metrics

It must NOT generate fake game identity from generic scripted illustrations.

---

# 6. FORBIDDEN VISUAL IDENTITY BEHAVIOR

The following behavior must no longer be accepted as primary game grounding:

```text
semantic concept
→ script-generated icon
→ use icon as game identity

```

Examples of forbidden behavior:

- generating a fake Blox Fruits Jolly Roger
- drawing a generic fish and calling it Fisch
- generating a generic hook as Fisch branding
- drawing a generic hotel door as DOORS identity
- creating random prison bars for Prison Life
- creating a random block and calling it Minecraft identity
- generating a generic spider-web symbol and treating it as Spider-Man game identity

These may only appear as neutral secondary UI decoration if they are clearly not pretending to be authentic game material.

They must NOT define the primary identity.

---

# 7. REAL GAME-SOURCED VISUALS

Game-specific visual material should be sourced from actual available game-related imagery.

Possible approved origins include:

```text
LOCAL_APPROVED_ASSET
EXISTING_GAMEINDEX_MEDIA
APPROVED_SCREENSHOT
SCREENSHOT_EXTRACT
APPROVED_OFFICIAL_ASSET
VALIDATED_REFERENCE_ASSET
APPROVED_USER_ASSET

```

The implementation must respect the project's existing media architecture.

Do not create unnecessary duplicate asset storage systems if an existing media/image system can be extended.

---

# 8. SEMANTIC MOTIF VS VISUAL ASSET

Separate these concepts permanently.

## SEMANTIC MOTIF

Describes what the system is looking for.

Example:

```text
JOLLY_ROGER
FISH
DOOR_NUMBER
HOTEL_CORRIDOR
PIZZA_BOX
PRISON_SIGN

```

A semantic motif is metadata.

It is NOT an image.

It is NOT automatically renderable.

---

## VISUAL ASSET

A real approved visual file/reference connected to the entity.

Example:

```text
assetId: blox_jolly_roger_01
entity: blox-fruits
role: PRIMARY_SYMBOL
source: APPROVED_GAME_ASSET

```

Rendering must use the Visual Asset.

Never treat the semantic motif itself as visual content.

---

# 9. VISUAL ASSET REGISTRY

Introduce or evolve an existing storage layer into a:

# VISUAL ASSET REGISTRY

Each Game or Experience should be able to maintain approved visual assets.

Recommended conceptual record:

```json
{
  "assetId": "fisch_fish_03",
  "entityId": "fisch",
  "entityType": "EXPERIENCE",
  "sourceType": "SCREENSHOT_EXTRACT",
  "semanticRole": "SECONDARY_SYMBOL",
  "visualFamily": "FISCH_CREATURES",
  "sourceReference": "...",
  "approved": true,
  "confidence": 0.96,
  "width": 640,
  "height": 640,
  "optimizedVariants": {
    "thumb": "...",
    "card": "...",
    "full": "..."
  }
}

```

Adapt this to the existing project patterns.

Do not force this exact JSON if the project already has a better schema.

---

# 10. ASSET ROLES

Support meaningful roles such as:

```text
HERO
BACKGROUND
PRIMARY_SYMBOL
SECONDARY_SYMBOL
CHARACTER
LOCATION
ITEM
CREATURE
CARD_ACCENT
SECTION_ACCENT
DIVIDER
NAVIGATION_ACCENT
INTERACTIVE_OBJECT
ENVIRONMENT_ELEMENT
GALLERY
LOGO
UI_REFERENCE

```

One asset may support multiple valid contexts when appropriate.

---

# 11. GAME-SOURCED VISUAL PIPELINE

The new visual pipeline should conceptually become:

```text
GAME / EXPERIENCE
        ↓
ENTITY RESEARCH
        ↓
VISUAL RESEARCH
        ↓
ASSET DISCOVERY
        ↓
ASSET VALIDATION
        ↓
IMAGE MANAGER / OPTIMIZATION
        ↓
VISUAL ASSET REGISTRY
        ↓
VISUAL VOCABULARY
        ↓
COMPOSITION
        ↓
VISUAL COVERAGE VALIDATION
        ↓
PUBLICATION

```

Do not skip directly from:

```text
entity name
→ generic visual motif
→ rendered decoration

```

---

# 12. VISUAL RESEARCH

Add Visual Research as an explicit research stage.

The current Builder research focuses heavily on textual/entity knowledge.

I3 must treat visual identity as its own research problem.

Visual Research should identify:

- logos
- recognizable characters
- recognizable items
- creatures
- environments
- landmarks
- user-interface references
- symbols
- location imagery
- recurring visual patterns
- colors as a secondary property
- characteristic compositions

The system must determine:

```text
WHAT ACTUALLY MAKES THIS GAME VISUALLY RECOGNIZABLE?

```

before composition.

---

# 13. VISUAL RESEARCH MUST NOT BE COLOR-FIRST

Do NOT define an entity as:

```text
Fisch = blue
DOORS = brown
Blox Fruits = blue + pirate

```

Color is secondary.

Visual identity must primarily come from actual game-grounded elements.

---

# 14. VISUAL GROUNDING FAILURE STATE

If sufficient real visual assets cannot be obtained or validated:

do NOT invent them.

Instead mark:

```text
VISUAL_GROUNDING_INCOMPLETE

```

or:

```text
VISUAL_GROUNDING_FAILED

```

depending on severity.

The structural build may continue.

The content build may continue.

But the system must not falsely claim full visual completion.

---

# 15. NO FAKE COMPLETION

The following situation must no longer be possible:

```text
Images: 0
Visual Density: RICH
Visual Grounding: VALIDATED

```

This is contradictory.

If there are no real grounded visual assets, a visually rich universe cannot be considered complete.

---

# 16. VISUAL VALIDATION 2.0

Introduce:

# GAME\_SOURCED\_VISUAL\_VALIDATION

It should verify at minimum:

- approved real assets exist
- primary identity uses approved game-sourced assets
- major sections have visual grounding
- generated generic motifs are not masquerading as primary identity
- asset diversity is sufficient
- excessive duplication does not exist
- image references are valid
- visual assets belong to the correct entity
- inherited parent assets are clearly distinguished from Experience-specific assets
- assets are optimized sufficiently for runtime use

---

# 17. VISUAL VALIDATION BLOCKERS

Visual grounding should fail when:

```text
PRIMARY_GAME_ASSETS = 0

```

or:

```text
APPROVED_GAME_SOURCED_ASSETS = 0

```

or:

```text
GENERIC_GENERATED_IDENTITY = TRUE

```

or when required visual references are broken.

---

# 18. GAME VS EXPERIENCE VISUAL ISOLATION

An Experience must have its own identity.

Example:

```text
Roblox = parent Game
Fisch = Experience

```

Fisch may inherit certain Roblox ecosystem context where appropriate.

But Fisch's visual identity must NOT simply become generic Roblox branding.

Likewise:

```text
Blox Fruits
DOORS
Fisch
Prison Life
Work at a Pizza Place

```

must remain visually distinct.

---

# 19. BLOX FRUITS EXPECTATION

Blox Fruits visual grounding must use actual approved Blox Fruits-related visual material.

Do NOT generate a fake Jolly Roger.

Do NOT use a random pirate skull.

Do NOT use random generic fruits as primary identity.

The engine should discover and use actual game-grounded:

- symbols
- fruits
- environments
- characters
- items
- pirate/marine imagery
- recognizable game elements

when available and approved.

---

# 20. FISCH EXPECTATION

Fisch visual grounding must use actual approved Fisch-related visual material.

Do NOT draw generic fish.

Do NOT generate fish anatomy through CSS/SVG/script.

Do NOT create random hooks and treat them as Fisch assets.

Use game-grounded:

- creatures
- fishing elements
- locations
- boats
- items
- environmental imagery
- interface-related visual language

when available.

---

# 21. DOORS EXPECTATION

DOORS must not become:

```text
generic brown doors
+ dark background

```

Use actual recognizable visual grounding where available:

- real door/room visual language
- recognizable locations
- entities
- objects
- environment imagery
- interface references

---

# 22. WORK AT A PIZZA PLACE EXPECTATION

Do not define the Experience using generic pizza clipart.

Use actual game-grounded visual elements associated with the Experience.

Generic pizza shapes may exist as minor neutral decoration only when they do not pretend to be authentic game assets.

---

# 23. PRISON LIFE EXPECTATION

Do not use generic prison iconography as the primary identity.

Use actual Prison Life visual references and assets where available.

Preserve its recognizable Roblox-era aesthetic where supported by real material.

---

# 24. VISUAL DENSITY 2.0

I2 introduced:

```text
SPARSE
BALANCED
RICH
IMMERSIVE

```

Preserve this model.

But I3 must make it real.

A density setting must influence actual composition.

It cannot be a cosmetic configuration label only.

---

# 25. RICH IS THE DEFAULT

Default target remains:

```text
RICH

```

RICH means:

- identity visible throughout the page
- recurring visual reinforcement
- multiple grounded asset families
- thematic section transitions
- contextual card accents
- environmental details
- meaningful visual recurrence

It does NOT mean:

- dozens of random PNGs
- repeating the same asset everywhere
- clutter
- excessive animation

---

# 26. FIX RAREFIED VISUALS

The current I2 result still feels too sparse.

I3 must specifically solve:

```text
RAREFIED VISUAL IDENTITY

```

Thematic presence must continue below the Hero.

Major areas of the page should not become generic GameIndex UI for several screen lengths.

---

# 27. MAJOR SECTION VISUAL REINFORCEMENT

For RICH universes, major sections should normally receive appropriate visual reinforcement.

Possible reinforcement includes:

- contextual asset
- grounded divider
- game-specific background fragment
- character/item visual
- real environment crop
- section accent
- interactive game object
- card-level visual identity
- navigation accent

Do not enforce crude fixed counts.

Use composition rules.

---

# 28. VISUAL DISTRIBUTION ENGINE

Enhance the visual distribution logic.

It should consider:

- section purpose
- section size
- nearby visuals
- repetition
- asset role
- visual family
- available screen width
- visual density
- performance
- readability
- asset importance
- interaction context

Avoid random placement.

---

# 29. ASSET DIVERSITY

Visual continuity does not mean repeating one asset.

The engine should seek diversity across:

- primary symbol
- secondary symbols
- characters
- environments
- items
- objects
- backgrounds
- interactive pieces

when real approved material is available.

---

# 30. REPETITION LIMITS

Prevent situations such as:

```text
same image repeated 15 times
same fish everywhere
same logo between every section
same Jolly Roger on every card

```

Use repetition intentionally.

---

# 31. VISUAL COVERAGE SCORE

Introduce:

# VISUAL COVERAGE SCORE

This score must represent actual visual grounding quality.

Suggested dimensions:

```text
HERO_COVERAGE
SECTION_COVERAGE
ASSET_DIVERSITY
GAME_SPECIFICITY
REAL_ASSET_GROUNDING
GENERIC_FALLBACK_RATIO
INTERACTIVE_VISUAL_COVERAGE

```

---

# 32. VISUAL COVERAGE EXAMPLE

Example:

```text
Hero coverage:            100%
Major section coverage:    84%
Asset diversity:           78%
Game specificity:          94%
Real asset grounding:      91%
Generic fallback ratio:     3%

VISUAL COVERAGE:           88%

```

---

# 33. COVERAGE CLASSIFICATION

Suggested classification:

```text
0–39   FAILED
40–64  INCOMPLETE
65–79  ACCEPTABLE
80–94  GROUNDED
95–100 HIGHLY_GROUNDED

```

Adapt thresholds if real project testing shows better values.

The important requirement is meaningful validation, not exact numbers.

---

# 34. DENSITY AND COVERAGE ARE DIFFERENT

Do not confuse:

```text
VISUAL DENSITY

```

with:

```text
VISUAL COVERAGE

```

Density describes intended richness.

Coverage measures whether that richness was actually achieved.

Example:

```text
Requested Density: RICH
Visual Coverage: 37%
Result: FAILED

```

This is valid and should be visible.

---

# 35. RICH VALIDATION

If a Universe requests:

```text
RICH

```

but there are insufficient real visual assets:

do not pretend it succeeded.

Possible outcome:

```text
Requested Density: RICH
Effective Status: PARTIAL
Visual Grounding: INCOMPLETE

```

Optionally the runtime may temporarily reduce expensive visual behavior.

It must not fabricate missing identity.

---

# 36. IMMERSIVE VALIDATION

IMMERSIVE requires an even stronger asset and performance foundation.

Do not allow IMMERSIVE to simply increase generic decorations.

It should only be considered visually complete when:

- enough real assets exist
- section coverage is high
- asset diversity is adequate
- performance budget remains acceptable

---

# 37. IMAGE MANAGER INTEGRATION

Preserve all existing Image Manager fixes.

Game-sourced assets should pass through the existing image pipeline where appropriate.

Pipeline:

```text
REAL ASSET
↓
IMAGE MANAGER
↓
CROP / PROCESS / OPTIMIZE
↓
APPROVED VARIANT
↓
VISUAL ASSET REGISTRY
↓
UNIVERSE BUILDER

```

Do not bypass the Image Manager with uncontrolled giant source images.

---

# 38. IMAGE MANAGER MUST NOT REDRAW THE GAME

The Image Manager may:

- crop
- resize
- optimize
- generate thumbnails
- prepare transparency when technically appropriate
- create display variants

It must not invent a replacement for a missing game asset.

---

# 39. OPTIMIZED VARIANTS

Assets may have multiple display variants:

```text
THUMB
CARD
SECTION
HERO
FULL

```

Use appropriate variants based on rendered size.

Do not load HERO/FULL assets into tiny cards.

---

# 40. PERFORMANCE REMAINS NON-NEGOTIABLE

I3 must not reintroduce the severe performance issues previously seen in GameIndex.

Game-sourced visual richness must remain optimized.

---

# 41. LAZY ASSET LOADING

Use lazy loading for:

- offscreen section assets
- galleries
- large environments
- non-essential character images
- secondary interactive imagery

Do not lazy-load critical above-the-fold identity if doing so causes poor initial experience.

Balance appropriately.

---

# 42. PRELOAD LIMITS

Do not preload every visual asset.

Preload only what meaningfully improves the initial screen.

---

# 43. ANIMATION LIMITS

Real game assets may be animated through:

- movement
- reveal
- fade
- scale
- parallax-like controlled effects
- interaction states

But animations must not:

- distort recognizable game assets unnecessarily
- cause excessive CPU/GPU usage
- animate every object continuously
- continue unnecessarily offscreen

---

# 44. SCRIPT-GENERATED SHAPES

Script-generated shapes are still allowed for:

- neutral UI
- generic borders
- layouts
- containers
- abstract particles
- GameIndex-native separators
- loading states
- non-game-specific effects

They must remain visually neutral.

They must not masquerade as real objects from the game.

---

# 45. INTERACTIVE UNIVERSE ENGINE PRESERVATION

Preserve the I2 Interactive Universe Engine.

Continue supporting declarative:

```text
ELEMENT
→ EVENT
→ ACTION
→ TARGET

```

No arbitrary user JavaScript.

---

# 46. INTERACTION STATE BUG

I2 reporting exposed inconsistent interaction counts.

Example:

```text
Revision: 3 interactions

```

while the editor may show:

```text
0 published
0 draft

```

I3 must fix this architecture.

---

# 47. INTERACTION STATE UNIFICATION

Create one authoritative interaction state model.

Do not maintain misleading parallel states.

The UI should clearly distinguish:

```text
PLANNED
DRAFT
VALIDATED
PUBLISHED
ARCHIVED

```

---

# 48. INTERACTION SOURCE OF TRUTH

There must be a clearly defined source of truth.

Possible model:

```text
Revision planning
→ draft interaction records
→ validation
→ publish

```

Do not allow revision metadata to claim three interactions while the actual editor has zero.

---

# 49. REPORT INTERACTION STATES ACCURATELY

Example:

```text
Planned:   3
Draft:     3
Validated: 3
Published: 0

```

or:

```text
Planned:   3
Draft:     0
Published: 0

Status: INTERACTIONS_NOT_PERSISTED

```

Never hide the distinction.

---

# 50. PRESETS

Interaction presets remain useful.

However:

Applying a preset must create a real draft interaction record or clearly remain only a recommendation.

Do not count recommendations as stored interactions.

---

# 51. BUILDER STATE UNIFICATION

I3 must unify the major Universe Builder states.

Current systems may contain:

- legacy manifests
- revision drafts
- published revision
- interactive records
- visual policies
- blueprint
- legacy content
- new structured content

These must coexist clearly.

Avoid duplicate contradictory status displays.

---

# 52. DO NOT DELETE LEGACY CONTENT

Preserve existing user-created and legacy content.

I3 is not permission to delete historical systems.

Instead:

- distinguish them
- migrate safely where practical
- show their relationship clearly
- avoid silent replacement

---

# 53. BUILD STATE MODEL

The Builder should clearly represent:

```text
RESEARCH
STRUCTURE
CONTENT
MEDIA
VISUAL
INTERACTIONS
PERFORMANCE
PUBLICATION

```

Each category gets its own status.

---

# 54. VALIDATION 2.0

Replace overly broad validation status with a multidimensional model.

Do not simply show:

```text
Revision 1
VALIDATED

```

when important subsystems are incomplete.

---

# 55. REQUIRED VALIDATION DOMAINS

At minimum:

```text
STRUCTURE_STATUS
RESEARCH_STATUS
CONTENT_STATUS
MEDIA_STATUS
VISUAL_GROUNDING_STATUS
INTERACTION_STATUS
PERFORMANCE_STATUS
PUBLICATION_STATUS

```

---

# 56. STATUS VALUES

Recommended controlled status vocabulary:

```text
NOT_STARTED
PLANNED
PARTIAL
INCOMPLETE
READY
VALIDATED
FAILED
BLOCKED
PUBLISHED

```

Use only appropriate states per subsystem.

---

# 57. EXAMPLE VALIDATION

A current incomplete Fisch build might correctly report:

```text
STRUCTURE          VALIDATED
RESEARCH           PARTIAL
CONTENT            INCOMPLETE
MEDIA              INCOMPLETE
VISUAL_GROUNDING   FAILED
INTERACTIONS       PARTIAL
PERFORMANCE        READY
PUBLICATION        BLOCKED

```

This is more truthful than simply:

```text
VALIDATED

```

---

# 58. PUBLICATION GATE

Publication must consider all critical validation domains.

Do not publish automatically merely because structure validation passes.

---

# 59. BLOCKING VS NON-BLOCKING ISSUES

Separate:

```text
BLOCKER
WARNING
INFO

```

Example blockers:

- broken entity relation
- invalid required interaction target
- missing primary visual grounding for RICH
- unsafe interaction configuration
- corrupted revision
- missing critical page structure

Possible warnings:

- low asset diversity
- optional gallery missing
- limited character coverage
- low number of secondary assets

---

# 60. NO FALSE VISUAL SUCCESS

If Visual Grounding fails:

Publication may be blocked for a fully grounded build.

If the system supports partial publishing, it must explicitly label it:

```text
PARTIAL_VISUAL_BUILD

```

Do not silently present it as complete.

---

# 61. RESEARCH QUALITY ISSUE

A build may currently report:

```text
2 sources discovered
2 accepted
0 facts

```

This needs clearer semantics.

Accepted source discovery does not mean accepted factual evidence.

---

# 62. RESEARCH STATUS DISTINCTION

Distinguish:

```text
SOURCES_DISCOVERED
SOURCES_REVIEWED
SOURCES_ACCEPTED
FACTS_EXTRACTED
FACTS_VALIDATED
TOPICS_SUPPORTED

```

Do not collapse these into one ambiguous research status.

---

# 63. ZERO FACTS HANDLING

If:

```text
FACTS_VALIDATED = 0

```

the content system must not imply strong research completeness.

Fallback local content may remain.

But status should show:

```text
RESEARCH_INCOMPLETE

```

---

# 64. LOCAL-FIRST ARCHITECTURE

Preserve:

```text
LOCAL_FIRST_NO_API_KEY

```

No cloud AI API is required.

No paid API key may become mandatory.

---

# 65. AI CREATIVE DIRECTOR

Preserve the optional Creative Director concept.

AI may help with:

- asset classification suggestions
- visual composition recommendations
- visual family suggestions
- placement recommendations
- asset diversity recommendations
- interaction ideas
- section distribution

AI may NOT invent fake game assets and inject them as authentic identity.

---

# 66. AI VISUAL ROLE

AI may say:

```text
"Use a recognizable Fisch creature near the Gameplay section."

```

It must NOT respond by generating a fake creature internally and treating it as Fisch.

The system should instead look for an approved grounded asset.

---

# 67. AI FALLBACK LABELING

Correct ambiguous reporting such as:

```text
Creative Director
DETERMINISTIC_FALLBACK

local AI invoked: YES

```

The UI must report exactly what happened.

Possible states:

```text
LOCAL_AI_USED
DETERMINISTIC_FALLBACK
LOCAL_AI_FAILED_THEN_FALLBACK
LOCAL_AI_NOT_AVAILABLE

```

Do not show contradictory status combinations.

---

# 68. DETERMINISTIC FALLBACK

If local AI is unavailable:

Use deterministic rules.

Do NOT block the Builder.

Do NOT contact paid APIs.

---

# 69. ZERO AI STARTUP

Preserve the rule:

```text
NO AI DURING BASIC SERVER STARTUP

```

AI initializes only when explicitly needed.

---

# 70. GAME / EXPERIENCE MODEL

Preserve I1/I2 classification behavior.

Example:

```text
Roblox = GAME
Blox Fruits = EXPERIENCE
DOORS = EXPERIENCE
Fisch = EXPERIENCE
Prison Life = EXPERIENCE
Work at a Pizza Place = EXPERIENCE

```

Experiences must not incorrectly appear as top-level Games.

---

# 71. BUILDER ENTITY ISOLATION

Each Game/Experience gets an isolated editable build context.

An edit to Fisch must not modify Blox Fruits.

An Experience must not accidentally write visual assets into the Roblox root entity unless intentionally shared.

---

# 72. PARENT ASSET INHERITANCE

Allow controlled inheritance if appropriate.

Example:

```text
Fisch
→ may inherit certain Roblox ecosystem metadata

```

But primary visual grounding should prioritize:

```text
Fisch-specific assets

```

over generic Roblox assets.

---

# 73. PREVIEW 2.0

Improve the Live Preview Model.

It should display:

- entity
- requested density
- visual coverage
- grounded asset count
- primary assets
- secondary assets
- generic fallback count
- major sections grounded
- planned/draft/published interactions
- validation status

---

# 74. PREVIEW MUST USE REAL ASSETS

Preview must not display fake generated motif illustrations as if they were final visual grounding.

If asset is missing:

show an explicit missing/placeholder state.

Example:

```text
JOLLY_ROGER
Asset required
No approved game-sourced visual currently available

```

That is better than displaying an incorrect Jolly Roger.

---

# 75. LIVE PREVIEW EXAMPLE

Desired conceptual output:

```text
FISCH

Visual Density: RICH
Visual Coverage: 87% · GROUNDED

Grounded Assets: 14
Primary: 3
Secondary: 6
Accents: 5

Game specificity: HIGH
Generic identity fallbacks: 0

Major sections grounded:
5 / 5

Interactions:
Planned: 3
Draft: 3
Published: 0

```

---

# 76. VISUAL ASSET INSPECTOR

Add an inspector or equivalent Builder UI if appropriate.

It should allow developers/admins to understand:

- which asset is being used
- where it came from
- what entity owns it
- what role it has
- whether it is approved
- what sections use it
- whether optimized variants exist

Do not expose irrelevant implementation noise to normal users.

---

# 77. ASSET APPROVAL

Game-sourced visual assets should have clear approval state.

Suggested:

```text
DISCOVERED
REVIEWED
APPROVED
REJECTED
ARCHIVED

```

Only approved assets should be used for strong game identity in production universes.

---

# 78. BROKEN ASSETS

If an approved asset becomes unavailable:

- use another approved asset when appropriate
- otherwise use neutral fallback
- mark visual grounding degraded
- do not silently generate a fake replacement

---

# 79. NEUTRAL FALLBACK

Neutral fallback may use:

- GameIndex-native shapes
- neutral card backgrounds
- simple gradients
- standard UI framing
- loading placeholders

Neutral fallback must not pretend to depict something from the game.

---

# 80. USER UPLOADED ASSETS

If existing architecture allows users/admins to provide visual assets:

validate:

- file type
- size
- dimensions
- safe path
- metadata
- entity ownership

Then process through Image Manager.

---

# 81. COPYRIGHT / SOURCE METADATA

Where the existing project supports provenance metadata, preserve it.

Do not strip useful source/attribution information during processing.

Do not build an unnecessarily complex rights-management platform as part of I3.

---

# 82. PERFORMANCE-AWARE VISUAL REGISTRY

Store optimized display references.

Do not force the browser to receive original giant images whenever a smaller variant exists.

---

# 83. VISUAL BUDGET

Each universe should respect practical budgets for:

- initial image bytes
- number of immediately loaded assets
- simultaneous animated assets
- background complexity
- active observers
- sound assets

---

# 84. RICH WITHOUT HEAVINESS

The design goal remains:

```text
MORE IDENTITY
WITHOUT MORE WEIGHT

```

RICH should be achieved primarily through:

- smarter composition
- better asset choice
- recurring identity
- optimized variants

not through loading dozens of full-resolution images.

---

# 85. RESPONSIVE VISUAL COMPOSITION

Desktop composition cannot simply be scaled down.

On mobile:

- reduce non-essential simultaneous accents
- preserve important identity
- reposition assets
- avoid covering content
- keep touch targets accessible

Do not remove all visual grounding on mobile.

---

# 86. INTERACTION + REAL ASSETS

Interactive objects should preferably attach to real game-grounded elements when appropriate.

Example:

```text
real Fisch creature asset
→ CLICK
→ SHOW_INFO

```

or:

```text
actual Blox Fruits-related asset
→ CLICK
→ OPEN_MEDIA

```

This creates interaction grounded in the actual universe.

---

# 87. HOTSPOTS

Preserve responsive hotspot architecture.

Hotspots connected to images must remain valid across screen sizes.

Avoid brittle desktop pixel coordinates.

---

# 88. SOUND SYSTEM

Preserve existing sound interaction architecture.

Global MUTE must continue controlling:

- music
- contextual sounds

Do not regress the single global music player.

---

# 89. MUSIC

Preserve:

- one authoritative global player
- persistent mute
- persistent volume
- track switching
- lazy loading
- cleanup
- fallback

I3 does not need a music rewrite.

---

# 90. SOCIAL SYSTEM

Do not turn I3 into a Social rewrite.

Only fix Social regressions discovered during testing.

---

# 91. APPEARANCE ENGINE

Preserve separation:

```text
USER APPEARANCE
≠
GAME VISUAL IDENTITY

```

Example:

```text
USER APPEARANCE: Creator
GAME IDENTITY: Fisch

```

Both coexist.

---

# 92. CREATOR APPEARANCE

Preserve its intended:

- restrained red
- restrained gold
- subtle technological accents

Do not allow game assets to destroy the user appearance system.

---

# 93. LEGACY CONTENT

The current Builder may show:

```text
Legacy Content Manifest
Legacy source-first recovery
Legacy Build Entire

```

Do not simply delete these systems.

Review how they relate to the modern revision system.

---

# 94. LEGACY UX CLARITY

Clarify whether an area is:

```text
CURRENT ENGINE
LEGACY COMPATIBILITY
MIGRATION TOOL
DEPRECATED BUT SUPPORTED

```

Avoid making users believe they need to operate two different Builders for the same task.

---

# 95. BLUEPRINT SYSTEM

Preserve the Blueprint.

Ensure the Blueprint contributes to current structured planning and does not silently conflict with:

- modern revisions
- pages
- tabs
- sections
- research topics

---

# 96. REAL COVERAGE

The existing "Real coverage" area should be improved.

Do not mix unrelated readiness concepts into one number.

Separate where useful:

```text
CONTENT COVERAGE
VISUAL COVERAGE
MEDIA COVERAGE
INTERACTION COVERAGE

```

---

# 97. READYNESS SCORE

If a general readiness score remains, it should be derived from meaningful subsystem statuses.

A build with:

```text
0 images
0 facts
failed visual grounding

```

must not receive a misleading high readiness score.

---

# 98. REPORT UX

Improve the Universe Builder report.

The current report can be difficult to understand because multiple stages appear as long status blocks.

Group status by system.

Example:

```text
BUILD
RESEARCH
CONTENT
VISUAL
INTERACTIONS
MEDIA
PUBLICATION

```

---

# 99. STAGE LOGS

Detailed stage logs may remain available for developer inspection.

Do not force every technical stage into the primary user-facing summary.

---

# 100. PRIMARY BUILDER SUMMARY

At the top, show the information needed to answer:

```text
What was built?
What is ready?
What is incomplete?
What is blocking publication?

```

---

# 101. ERROR LANGUAGE

Errors should be actionable.

Bad:

```text
Element key is required.

```

when no context is given.

Better:

```text
Interaction not saved:
Select or enter an Element Key first.

```

Apply this principle throughout Builder UX.

---

# 102. BUILDER FORM UX

Improve form clarity.

Avoid compressed sequences such as:

```text
Element keyRoleINTERACTIVE...

```

Ensure proper spacing, labels and grouping.

---

# 103. RESPONSIVE BUILDER

The Universe Builder editor itself must work on:

- desktop
- laptop
- tablet
- mobile

Critical controls must remain usable.

---

# 104. ACCESSIBILITY

Continue using semantic controls.

Interactive Builder UI should support:

- keyboard focus
- clear labels
- visible states
- proper button behavior

---

# 105. PERSISTENCE

All I3 additions must persist correctly across:

- refresh
- server restart
- re-open
- later editing
- revision publishing

---

# 106. DATABASE MIGRATIONS

If schema changes are required:

- migrate additively
- preserve schema 35 data
- preserve existing universes
- preserve interaction records
- preserve visual policies
- preserve published revisions
- use safe defaults

Do not destroy data to simplify implementation.

---

# 107. SCHEMA EVOLUTION

I2 used schema 35.

If I3 requires a new schema, increment safely.

Example:

```text
35 → 36

```

Do not modify old migration history destructively.

---

# 108. ROUTE COMPATIBILITY

Preserve existing routes and deep links.

Do not break Azure-deployed URLs unnecessarily.

---

# 109. SQLITE

Remain on SQLite.

Do not migrate to another database for I3.

---

# 110. NODE / EXPRESS

Preserve existing modern Node.js / Express architecture.

Do not perform a framework rewrite.

---

# 111. AZURE APP SERVICE

Preserve Azure App Service compatibility.

Do not require:

- GPU
- Docker-only deployment
- Redis
- external database
- paid AI service
- mandatory cloud vision service

---

# 112. LOCAL\_FIRST\_NO\_API\_KEY

This remains absolute.

The entire non-AI GameIndex experience must operate without any external API key.

---

# 113. NO FRAMEWORK REWRITE

Do not convert the project to another frontend/backend framework just to implement I3.

Build within the existing architecture.

---

# 114. NO DEPENDENCY EXPLOSION

Prefer lightweight solutions.

Do not introduce huge libraries for:

- simple layout
- simple asset mapping
- basic state
- small animations

---

# 115. SECURITY

Visual source handling and interaction architecture must remain safe.

Validate:

- URLs
- file references
- asset IDs
- paths
- MIME/file types
- interaction targets
- entity ownership
- metadata

No:

```text
eval
new Function
arbitrary script injection
user supplied executable JS

```

---

# 116. VISUAL SOURCE TRUST

Do not automatically trust every discovered image as approved.

Asset discovery and asset approval are separate.

---

# 117. FAILURE IS BETTER THAN FAKE IDENTITY

If real visual grounding cannot be completed:

report failure honestly.

Do not fabricate authenticity.

Central rule:

```text
MISSING REAL ASSET
IS BETTER THAN
WRONG FAKE ASSET

```

---

# 118. FALLBACK HIERARCHY

When a visual is unavailable:

```text
1. Approved entity-specific asset
2. Approved related entity asset when semantically valid
3. Existing GameIndex-approved media
4. Neutral GameIndex UI fallback
5. Explicit missing asset state

```

Never:

```text
6. Invent fake game object

```

---

# 119. VISUAL COMPOSITION QUALITY

Game-sourced assets must still be composed well.

Real assets alone do not guarantee good design.

The engine should control:

- scale
- placement
- crop
- contrast
- spacing
- hierarchy
- overlap
- repetition

---

# 120. DO NOT DESTROY READABILITY

Even with higher density:

content remains primary.

Hierarchy:

```text
CONTENT
↓
INTERACTION
↓
GAME IDENTITY
↓
DECORATION

```

---

# 121. BUILD PHASES

Implement I3 in controlled phases.

---

# I3-A

## VISUAL ASSET FOUNDATION

Implement or evolve:

- Visual Asset Registry
- asset roles
- source metadata
- approval state
- entity ownership
- image variants
- migration

---

# I3-B

## GAME-SOURCED VISUAL PIPELINE

Implement:

- Visual Research
- Asset Discovery
- Asset Validation
- Image Manager integration
- visual vocabulary
- no generated game identity rule

---

# I3-C

## VISUAL DENSITY + COVERAGE

Implement:

- real RICH behavior
- recurring section identity
- Visual Coverage Score
- diversity checks
- repetition control
- coverage classification

---

# I3-D

## BUILDER STATE + VALIDATION 2.0

Implement:

- interaction state unification
- subsystem statuses
- publication gates
- accurate reports
- readiness corrections
- AI status correctness

---

# I3-E

## POLISH + PERFORMANCE + REGRESSION

Implement:

- UX cleanup
- responsive Builder
- visual performance
- lazy loading
- regression testing
- Azure verification
- package validation

---

# 122. PRIORITY

## P0

- ban fake game-specific visuals
- Game-Sourced Visual Grounding
- Visual Asset Registry
- real asset pipeline
- fix rarefied visual identity
- state unification
- Validation 2.0

## P1

- Visual Coverage Score
- asset diversity
- Builder Preview 2.0
- research status clarity
- publication gates
- Image Manager integration

## P2

- UI polish
- reports
- mobile refinements
- performance refinements
- legacy UX cleanup

---

# 123. I3 TEST TARGET — FISCH

Fisch should be used as one major validation target because the I2 report exposed the current weaknesses.

Current unacceptable behavior includes concepts such as:

```text
FISCH_FISH
FISHING_HOOK
WATER_WAVE
FISHING_LINE
BOAT_DETAIL

```

being used as if semantic names alone represent finished visual grounding.

After I3:

these may remain semantic categories internally.

But rendering must resolve them to approved real game-sourced assets.

---

# 124. FISCH ACCEPTANCE CRITERIA

Do not consider Fisch visually grounded if:

- no real Fisch assets exist
- generic fish are rendered by script
- generic hooks act as primary identity
- only Hero is visually grounded
- long generic sections remain
- visual coverage is low
- generic fallback dominates

---

# 125. BLOX FRUITS ACCEPTANCE CRITERIA

Do not consider Blox Fruits visually grounded if:

- Jolly Roger is generated/invented
- fruits are generic random icons
- pirate identity is generic clipart
- game-specific material is missing
- visual elements remain rare

---

# 126. DOORS ACCEPTANCE CRITERIA

Do not consider DOORS visually grounded if:

- identity is generic hotel imagery
- doors are random CSS/SVG drawings
- authentic recognizable game imagery is absent
- only background color changes

---

# 127. INTERACTION ACCEPTANCE

If revision reports:

```text
3 interactions

```

the Builder must clearly show where those three exist.

No contradictory zero-count view.

---

# 128. VALIDATION ACCEPTANCE

Do not show a single broad `VALIDATED` badge when:

```text
VISUAL = FAILED
MEDIA = INCOMPLETE
CONTENT = INCOMPLETE

```

Display subsystem status.

---

# 129. PERFORMANCE ACCEPTANCE

I3 must not materially regress:

- first render
- navigation
- scroll
- memory
- image requests
- startup
- server boot

compared to I2.

---

# 130. REGRESSION CHECKLIST

Before completion, verify:

- Home loads
- global catalog loads
- Games remain Games
- Experiences remain Experiences
- Roblox children remain Experiences
- Universe Builder opens
- entity selector works
- existing universes load
- schema migration preserves data
- visual policy persists
- interactions persist
- planned/draft/published states are correct
- Image Manager works
- image crop works
- URL preview works if existing feature supports it
- real visual assets can be registered
- asset ownership works
- asset approval works
- approved assets render
- missing assets do not create fake replacements
- Visual Coverage calculates
- RICH visually differs from SPARSE/BALANCED
- section grounding remains visible down the page
- preview reflects actual assets
- subsystem validation statuses work
- publication gates work
- local AI remains optional
- AI fallback status is accurate
- server startup makes no AI request
- global music player remains single
- mute persists
- volume persists
- contextual sound respects mute
- Social loads
- Appearance loads
- Creator theme remains intact
- mobile works
- Azure startup works

---

# 131. I3 MUST NOT BE MARKED COMPLETE IF

Do not consider Beta 0.99 I3 complete if:

- Game identity is still generated by scripts
- generic fake visuals remain primary grounding
- Blox Fruits still uses an incorrect invented Jolly Roger
- Fisch still uses generic generated fish
- visuals remain rare throughout long pages
- RICH is still only a label
- no Visual Coverage exists
- real assets cannot be audited
- interaction counts remain contradictory
- a single VALIDATED status hides failed subsystems
- a build with zero assets can claim complete visual grounding
- AI becomes required
- site becomes significantly heavier
- I2 working functionality regresses

---

# 132. IMPLEMENTATION PHILOSOPHY

Continue using:

```text
PRESERVE
→ INSPECT
→ FIX ROOT CAUSE
→ EXTEND
→ OPTIMIZE
→ VERIFY

```

Do not use:

```text
DELETE
→ REBUILD EVERYTHING

```

---

# 133. REQUIRED IMPLEMENTATION PROCESS

Before changing code:

1. Inspect the complete Beta 0.99 I2 implementation.
2. Identify the current Visual Grounding 2.0 files.
3. Identify how semantic motifs are rendered.
4. Identify all generic generated game-specific artwork.
5. Identify current image/media storage.
6. Identify Image Manager architecture.
7. Identify interaction revision state and entity interaction state.
8. Identify validation status architecture.
9. Identify current database schema.
10. Identify preview/report architecture.

Then modify existing systems.

Do not create parallel replacements unless necessary.

---

# 134. REQUIRED DELIVERY REPORT

When implementation is complete, provide:

## VERSION

```text
GameIndex Beta 0.99 I3

```

## FILES

- changed
- created
- removed only if truly obsolete

## DATABASE

- previous schema
- new schema
- migrations
- compatibility

## VISUAL SYSTEM

- Game-Sourced Visual Grounding
- Visual Asset Registry
- Visual Research
- Visual Coverage
- density changes
- removed fake visual behaviors

## BUILDER

- state unification
- interaction status
- preview improvements
- UX changes

## VALIDATION

- subsystem statuses
- publication gates
- blockers/warnings

## PERFORMANCE

- image optimizations
- lazy loading
- runtime changes

## AI

- Creative Director changes
- local fallback behavior
- status reporting

## TESTS

- syntax
- unit/integration tests
- migration
- I2 regression
- I1 regression where applicable
- image system regression
- music regression
- Azure compatibility checks

## LIMITATIONS

List remaining limitations honestly.

---

# 135. PACKAGE OUTPUT

Prepare when implementation is requested:

```text
FULL
UPDATE_ONLY

```

Both packages must be versioned as:

```text
GameIndex Beta 0.99 I3

```

Do not label them HF.

---

# 136. UPDATE\_ONLY

UPDATE\_ONLY should contain only files required to migrate an existing:

```text
Beta 0.99 I2

```

installation to:

```text
Beta 0.99 I3

```

Include migration instructions where necessary.

---

# 137. FULL

FULL must contain the complete deployable project after I3 changes.

Do not accidentally include:

- node\_modules
- unnecessary caches
- temporary test databases
- secrets
- API keys
- debug dumps

---

# 138. FINAL I3 TARGET

After I3, opening a universe should no longer feel like:

```text
GameIndex page
+
generic scripted symbols describing the game

```

It should feel like:

```text
GameIndex
+
actual recognizable material from that game
+
real visual continuity
+
high but controlled density
+
contextual interaction
+
optimized performance

```

---

# 139. FINAL VISUAL PRINCIPLE

The Universe Builder is:

```text
A COMPOSITOR

```

not:

```text
A FAKE GAME-ASSET GENERATOR

```

It may determine:

- where an asset appears
- how often it recurs
- how it is cropped
- how it interacts
- when it loads
- how it transitions
- how it adapts responsively

It may NOT decide:

```text
"Fisch needs a fish, therefore I will invent one."

```

Instead:

```text
"Fisch needs a recognizable creature visual.
Find an approved Fisch-grounded asset.
If unavailable, report incomplete grounding."

```

---

# 140. CORE I3 RULES

```text
REAL GAME ASSETS
NOT FAKE SCRIPT ART

```

```text
MORE VISUAL PRESENCE
NOT RANDOM CLUTTER

```

```text
TRUE VALIDATION
NOT FALSE COMPLETION

```

```text
ONE STATE MODEL
NOT CONTRADICTORY COUNTERS

```

```text
MORE GAME IDENTITY
WITHOUT MORE SITE WEIGHT

```

---

# 141. FINAL RULE

GameIndex Beta 0.99 I3 must correct the biggest remaining weakness of Universe Builder 2.0:

**It currently knows what a game is about, but it does not always visually represent what the game actually looks like.**

I3 must close that gap.

The finished Universe Builder must:

- understand the entity
- research its visual identity
- obtain real grounded assets
- validate them
- optimize them
- classify them
- distribute them intelligently
- keep them recurring throughout the page
- attach safe interactions
- measure actual visual coverage
- refuse fake completion
- preserve performance
- preserve local-first architecture
- remain editable

The Builder may construct the experience.

The game itself must provide the visual identity.