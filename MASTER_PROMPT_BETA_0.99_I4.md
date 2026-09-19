# GAMEINDEX — BETA 0.99 I4

## THREE-STAGE UNIVERSE PRODUCTION PIPELINE

## RESEARCH & CONTENT ENGINE

## GAME-SOURCED IMAGE ENGINE

## INTERACTIVE PREVIEW ENGINE

## PERSONALIZED PAGE COMPOSITION 2.0

## BUILDER UX RECONSTRUCTION

## REPORTING, VALIDATION AND PUBLICATION FLOW

---

# 1. VERSION

Target:

```text
GameIndex Beta 0.99 I4

```

This is an **Intermediate update**.

GameIndex version hierarchy remains:

```text
V → I → HF

```

Definitions:

```text
V  = Main Version
I  = Intermediate update
HF = Hot Fix

```

Intermediate updates may contain:

- improvements
- additions
- bug fixes
- architectural refinements
- UX changes
- polishing

Hot Fixes contain bug fixes only.

I4 introduces new systems and substantial Universe Builder improvements.

Therefore:

```text
0.99 I4

```

is the correct version.

---

# 2. BASELINE

Upgrade:

```text
GameIndex Beta 0.99 I3

```

into:

```text
GameIndex Beta 0.99 I4

```

Do NOT rewrite GameIndex from scratch.

Do NOT remove working I3 systems unnecessarily.

Preserve:

- GAME / EXPERIENCE architecture
- LOCAL\_FIRST\_NO\_API\_KEY
- Node.js / Express
- SQLite
- Azure App Service compatibility
- Image Manager
- global music player
- mute / volume persistence
- Interactive Universe Engine
- Appearance Engine
- Creator Appearance
- Social Beta
- AI Control Center
- existing universes
- legacy content
- existing migrations
- Game-Sourced Visual Grounding rules

---

# 3. WHY I4 EXISTS

I3 corrected an important problem:

```text
GAME IDENTITY MUST NOT BE INVENTED BY SCRIPT

```

However, Universe Builder still needs a much clearer production workflow.

Currently too many responsibilities are mixed together:

- research
- text generation
- visual research
- image discovery
- image approval
- page construction
- interactions
- validation
- preview
- publication
- reporting

This makes the Builder difficult to understand and makes failures difficult to locate.

I4 must reorganize Universe Builder around a clear production pipeline.

---

# 4. NEW CORE ARCHITECTURE

Universe Builder must now be organized around THREE primary production systems:

```text
1. RESEARCH & CONTENT ENGINE
        ↓
2. GAME-SOURCED IMAGE ENGINE
        ↓
3. INTERACTIVE PREVIEW ENGINE

```

Then:

```text
VALIDATION
↓
PUBLICATION

```

The systems are connected but must remain logically separated.

---

# 5. NEW BUILDER PHILOSOPHY

The Builder should behave like a production pipeline.

Not:

```text
Click Build
↓
everything happens invisibly
↓
large technical report

```

Instead:

```text
RESEARCH
↓
CONTENT + IMAGE VARIABLES
↓
IMAGES
↓
VARIABLE RESOLUTION
↓
PAGE COMPOSITION
↓
INTERACTIONS
↓
LIVE PREVIEW
↓
VALIDATION
↓
PUBLISH

```

Every stage should expose understandable status.

---

# 6. SYSTEM 1

# RESEARCH & CONTENT ENGINE

This system is responsible for:

- entity research
- source discovery
- source review
- factual extraction
- factual validation
- topic classification
- page planning
- section planning
- textual content generation
- contextual image requirements

It must NOT directly select or render final game images.

---

# 7. CONTENT ENGINE OUTPUT

The Research & Content Engine should produce:

```text
STRUCTURED TEXT
+
IMAGE VARIABLES
+
INTERACTION OPPORTUNITIES

```

Example:

```text
Gameplay

Blox Fruits is centered around exploration,
combat, progression and collecting fruits.

{{IMAGE:GAMEPLAY_PRIMARY}}

Fruit abilities substantially influence
combat strategy and character progression.

{{IMAGE:FRUIT_EXAMPLE}}

Players explore multiple areas while
progressing through the game.

{{IMAGE:WORLD_LOCATION}}

```

The text system specifies WHAT visual is required.

The Image Engine decides WHICH approved real game asset fulfills it.

---

# 8. IMAGE VARIABLES

Introduce formal:

# IMAGE VARIABLES

These are contextual placeholders created by the Research & Content Engine.

Examples:

```text
{{IMAGE:HERO}}
{{IMAGE:GAMEPLAY_PRIMARY}}
{{IMAGE:CHARACTER_MAIN}}
{{IMAGE:LOCATION_MAIN}}
{{IMAGE:ITEM_EXAMPLE}}
{{IMAGE:CREATURE_EXAMPLE}}
{{IMAGE:UI_REFERENCE}}
{{IMAGE:SECTION_ACCENT}}
{{IMAGE:BACKGROUND}}

```

More specific variables may be used:

```text
{{IMAGE:CHARACTER:SPIDER_MAN}}
{{IMAGE:ITEM:BLOX_FRUIT}}
{{IMAGE:LOCATION:HOTEL}}
{{IMAGE:CREATURE:FISCH_SPECIES}}

```

Variables are metadata placeholders.

They are NOT images.

---

# 9. IMAGE VARIABLE RECORD

Conceptually:

```json
{
  "variable": "IMAGE:GAMEPLAY_PRIMARY",
  "entityId": "blox-fruits",
  "page": "gameplay",
  "section": "core-gameplay",
  "required": true,
  "semanticIntent": "recognizable gameplay scene",
  "preferredRoles": [
    "SECTION",
    "GAMEPLAY",
    "ENVIRONMENT"
  ]
}

```

Adapt to existing project architecture.

Do not force this exact JSON if a cleaner schema already exists.

---

# 10. CONTENT ENGINE MUST NOT INVENT VISUALS

Research & Content Engine may say:

```text
This section needs a recognizable Blox Fruits gameplay image.

```

It must NOT say:

```text
Generate a pirate skull icon.

```

It must NOT create:

- SVG game objects
- fake game logos
- fake creatures
- fake characters
- generic substitutes pretending to be real assets

---

# 11. RESEARCH QUALITY

Separate research states:

```text
SOURCES_DISCOVERED
SOURCES_REVIEWED
SOURCES_ACCEPTED
FACTS_EXTRACTED
FACTS_VALIDATED
TOPICS_SUPPORTED

```

Do not report:

```text
9 sources accepted

```

when what actually happened is only:

```text
9 sources discovered

```

---

# 12. CONTENT CONFIDENCE

Sections should know whether they are:

```text
VERIFIED
PARTIAL
LOCAL_BASELINE
UNSUPPORTED

```

Unsupported claims must not be presented as verified.

---

# 13. TEXT BEFORE IMAGES

The Builder should normally determine:

```text
what the page says

```

before determining:

```text
which exact images are placed

```

This allows the Image Engine to search intentionally instead of randomly.

---

# 14. SYSTEM 2

# GAME-SOURCED IMAGE ENGINE

This system receives image variables from System 1.

Its responsibility is to resolve:

```text
IMAGE VARIABLE
↓
REAL GAME-SOURCED VISUAL

```

---

# 15. IMAGE ENGINE RESPONSIBILITIES

The Image Engine should:

- inspect image variables
- search existing GameIndex media
- inspect approved local assets
- discover real game-related imagery
- classify candidate assets
- validate entity ownership
- identify duplicates
- rank candidates
- optimize selected assets
- register them
- connect assets to variables

---

# 16. ABSOLUTE IMAGE RULE

The Image Engine must preserve the I3 rule:

```text
REAL GAME ASSETS
NOT FAKE SCRIPT ART

```

Never use:

```text
semantic motif
→ generated SVG
→ final asset

```

for game-specific identity.

---

# 17. IMAGE RESOLUTION PIPELINE

Required conceptual pipeline:

```text
IMAGE VARIABLE
↓
ASSET SEARCH
↓
CANDIDATES
↓
VALIDATION
↓
REVIEW / APPROVAL
↓
IMAGE MANAGER
↓
OPTIMIZED VARIANT
↓
VISUAL ASSET REGISTRY
↓
VARIABLE RESOLUTION

```

---

# 18. IMAGE VARIABLES MUST HAVE STATES

Possible states:

```text
UNRESOLVED
DISCOVERED
REVIEWED
APPROVED
RESOLVED
FAILED
OPTIONAL_MISSING

```

---

# 19. VARIABLE RESOLUTION EXAMPLE

Before:

```text
{{IMAGE:GAMEPLAY_PRIMARY}}

```

After:

```text
{{IMAGE:GAMEPLAY_PRIMARY}}
→ asset_blox_gameplay_014

```

Runtime uses:

```text
asset_blox_gameplay_014

```

not the variable string.

---

# 20. NO FAKE FALLBACK

If a required variable cannot be resolved:

```text
IMAGE:CREATURE:FISCH_SPECIES

```

the system must display:

```text
UNRESOLVED

```

or:

```text
VISUAL_GROUNDING_INCOMPLETE

```

Do not draw a random fish.

---

# 21. IMAGE ASSET PRIORITY

Resolution priority:

```text
1. APPROVED ENTITY-SPECIFIC ASSET
2. APPROVED EXISTING GAMEINDEX MEDIA
3. APPROVED RELATED ASSET WHEN SEMANTICALLY VALID
4. REVIEWABLE DISCOVERED CANDIDATE
5. NEUTRAL GAMEINDEX FALLBACK
6. EXPLICIT MISSING STATE

```

Never:

```text
7. Invent game-specific artwork

```

---

# 22. ASSET REGISTRY

Preserve and improve I3 Visual Asset Registry.

Each asset should track:

- entity
- entity type
- role
- visual family
- source
- source reference
- approval
- dimensions
- optimized variants
- usage count
- section usage
- image variables fulfilled
- provenance
- availability
- duplicate fingerprint if available

---

# 23. IMAGE MANAGER

Continue using Image Manager for:

- crop
- resize
- optimization
- output variants
- thumbnail preparation
- hero variants
- section variants

Do not bypass the Image Manager.

---

# 24. IMAGE ENGINE UI

System 2 should have its own clear Builder area.

Example:

```text
IMAGES

12 variables
8 resolved
2 waiting review
2 missing

[ IMAGE:GAMEPLAY_PRIMARY ]
Resolved
asset_blox_gameplay_014

[ IMAGE:FRUIT_EXAMPLE ]
3 candidates
Review

[ IMAGE:WORLD_LOCATION ]
Missing
Search again

```

---

# 25. BULK IMAGE REVIEW

Allow practical review.

Admin/developer should be able to:

- inspect candidate
- approve
- reject
- replace
- re-search
- assign to another variable

without navigating through multiple unrelated screens.

---

# 26. SYSTEM 3

# INTERACTIVE PREVIEW ENGINE

This system receives:

```text
STRUCTURED CONTENT
+
RESOLVED IMAGE VARIABLES
+
PAGE COMPOSITION
+
INTERACTIONS
+
VISUAL POLICY

```

and creates the actual interactive preview.

---

# 27. PREVIEW MUST RUN THE REAL EXPERIENCE MODEL

The preview must not be a simple static summary card.

It should execute the same core rendering model expected in the published universe.

Preview:

- pages
- tabs
- sections
- real images
- visual density
- backgrounds
- visual accents
- navigation
- hotspots
- reveal actions
- galleries
- character interactions
- sound interactions
- page transitions

---

# 28. PREVIEW IS THE FINAL CHECK

The user should be able to determine:

```text
Does this universe actually look right?

```

before publication.

The preview should therefore prioritize visual fidelity over technical summaries.

---

# 29. INTERACTIVE PREVIEW MODES

Recommended:

```text
DESKTOP
TABLET
MOBILE

```

These may be preview widths, not separate implementations.

---

# 30. INTERACTION ENGINE

Preserve declarative:

```text
ELEMENT
→ EVENT
→ ACTION
→ TARGET

```

Supported states remain controlled.

No arbitrary JavaScript.

---

# 31. INTERACTION STATES

Use one authoritative model:

```text
PLANNED
DRAFT
VALIDATED
PUBLISHED
ARCHIVED

```

---

# 32. INTERACTION VALIDATION

Before preview/publication validate:

- element exists
- target exists
- page exists
- section exists
- asset exists when required
- action supported
- event supported
- mobile alternative exists when hover is essential

---

# 33. PRESET BEHAVIOR

Preset suggestion is NOT a saved interaction.

Explicitly distinguish:

```text
SUGGESTED PRESET

```

from:

```text
DRAFT INTERACTION

```

Applying a preset must create a real draft.

---

# 34. NEW UNIVERSE BUILDER UI

I4 should significantly reorganize the Builder interface.

The main screen should follow production order.

---

# 35. TOP BAR

At the very top:

```text
Universe Builder 2.0
Entity
Version
Current status

```

And prominently:

# PUBLISH

The Publish control belongs at the top.

---

# 36. PUBLISH BUTTON

Publish must be clearly visible in the upper Builder area.

Example:

```text
[ Build / Refresh ] [ Preview ] [ Publish ]

```

Publish must not be buried below the report.

---

# 37. PUBLICATION GATE

If publishing is blocked:

button may show:

```text
Publish
BLOCKED

```

Clicking or inspecting it should explain:

```text
3 blockers

```

Example:

```text
Missing 2 required image variables
Visual coverage below requirement
1 invalid interaction target

```

---

# 38. TOP SUMMARY

Near Publish show:

```text
Research      READY
Content       READY
Images        PARTIAL
Preview       READY
Validation    BLOCKED

```

This gives immediate understanding.

---

# 39. MAIN BUILDER SECTIONS

Recommended order:

```text
1. RESEARCH & CONTENT
2. IMAGES
3. INTERACTIVE PREVIEW
4. REPORT

```

---

# 40. SECTION 1 UI

# RESEARCH & CONTENT

Show:

- sources
- verified facts
- topics
- planned pages
- generated pages
- sections
- image variables

Example:

```text
Research
22 verified facts
5 topics

Pages
5 planned
5 generated

Image Variables
12 requested

```

---

# 41. CONTENT INSPECTOR

Allow user/admin to open a page and inspect:

```text
page
tab
section
text
image variables
interaction opportunities

```

---

# 42. SECTION 2 UI

# IMAGES

Show:

- total variables
- resolved
- discovered
- waiting review
- approved
- missing
- rejected

Include candidate review directly.

---

# 43. SECTION 3 UI

# INTERACTIVE PREVIEW

This should be visually large.

Do not compress it into a tiny diagnostic card.

The preview is one of the most important I4 components.

---

# 44. PREVIEW CONTROLS

Provide useful controls such as:

```text
Desktop
Tablet
Mobile

Restart Preview
Reload Data
Interaction Inspector

```

Do not add useless controls.

---

# 45. SECTION 4

# REPORT

The report belongs at the bottom.

This is explicitly required.

The report should summarize everything after the user has seen the content and preview.

---

# 46. REPORT ORDER

Suggested:

```text
FINAL REPORT

Build
Research
Content
Images
Visual
Interactions
Performance
Publication
Warnings
Blockers
Technical details

```

---

# 47. REPORT MUST BE READABLE

Do not dump a long sequence of:

```text
STAGE
STAGE
STAGE
STAGE

```

into the main report.

Detailed stage logs can exist under:

```text
Technical details

```

or:

```text
Developer trace

```

---

# 48. PRIMARY REPORT QUESTIONS

The report should answer:

```text
What was built?
What succeeded?
What is incomplete?
What is blocked?
Why is publication blocked?

```

---

# 49. PERSONALIZED PAGES 2.0

I3 still did not sufficiently solve personalized page composition.

The pages remain too visually sparse.

I4 must make this a P0 requirement.

---

# 50. PERSONALIZATION IS MORE THAN HERO

A personalized game page must not be:

```text
custom hero
↓
generic sections
↓
generic sections
↓
generic sections
↓
small themed object

```

The entire page needs continued game identity.

---

# 51. PAGE COMPOSITION ENGINE 2.0

Introduce/evolve:

# PERSONALIZED PAGE COMPOSITION ENGINE 2.0

Its job is to transform:

```text
structured content
+
image variables
+
resolved assets
+
entity identity

```

into a visually continuous page.

---

# 52. SECTION-LEVEL COMPOSITION

Every major section must receive a composition plan.

Example:

```text
SECTION: Gameplay

Primary visual:
IMAGE:GAMEPLAY_PRIMARY

Secondary accent:
IMAGE:ITEM_EXAMPLE

Layout:
TEXT_LEFT_VISUAL_RIGHT

Background treatment:
ENTITY_ENVIRONMENT_SOFT

Divider:
APPROVED_SECTION_ACCENT

```

---

# 53. NO HUGE VISUAL DEAD ZONES

For `RICH`, do not allow multiple major sections or several screen heights with no game-specific visual reinforcement.

This must be measurable.

---

# 54. VISUAL GAP METRIC

Introduce:

# VISUAL GAP

Measure approximate distance between meaningful game-grounded visual anchors.

For `RICH`, large visual dead zones should trigger warnings or composition changes.

Conceptually:

```text
MAX_VISUAL_GAP

```

should prevent long stretches of generic UI.

Do not use a crude universal pixel constant.

Measure relative to sections / viewport-sized content.

---

# 55. RICH TARGET

RICH should normally aim for meaningful visual reinforcement approximately every major content region.

A user scrolling should continuously perceive:

```text
I am still inside this game's universe.

```

---

# 56. VISUAL ANCHORS

Possible visual anchors:

- character asset
- item asset
- environment image
- contextual background
- game UI reference
- location image
- creature
- section illustration
- interactive object
- grounded divider

---

# 57. SMALL VISUAL DETAILS

I4 should support many more small game-grounded details.

Examples:

- small approved item images near titles
- real UI fragments used carefully
- item thumbnails
- character portraits
- environment fragments
- game-specific decorative crops
- small object assets around relevant cards
- contextual section edges

Again:

these must come from real approved game assets.

---

# 58. SMALL DETAILS MUST NOT BE GENERATED

Do not solve small details using:

- fake SVG fish
- fake Jolly Roger
- fake fruit
- fake door
- fake pizza
- fake prison bars

Use real assets or neutral GameIndex decoration.

---

# 59. VISUAL DENSITY LEVELS

Preserve:

```text
SPARSE
BALANCED
RICH
IMMERSIVE

```

But refine composition contracts.

---

# 60. SPARSE

Minimal game visuals.

Suitable for low-power conditions or simple pages.

---

# 61. BALANCED

Regular contextual visuals.

No extreme density.

---

# 62. RICH

Default.

Requirements should generally include:

- strong Hero
- grounded visuals across all major page regions
- repeated identity
- multiple asset families
- section accents
- contextual media
- visually customized cards
- environmental composition
- limited interactive objects

---

# 63. IMMERSIVE

High visual presence.

Still:

- readable
- performant
- controlled
- responsive

Do not simply multiply assets.

---

# 64. PAGE TYPE PERSONALIZATION

Different pages should not all have identical compositions.

Example:

```text
Overview
Gameplay
Characters
Locations
Items
Updates
Guides
Collections

```

should receive composition appropriate to their subject.

---

# 65. OVERVIEW PAGE

May emphasize:

- Hero
- broad environment
- key characters
- major identity
- summary cards

---

# 66. GAMEPLAY PAGE

May emphasize:

- real gameplay imagery
- items
- abilities
- systems
- interaction examples

---

# 67. CHARACTER PAGE

May emphasize:

- portraits
- character cards
- relationships
- galleries
- profile interactions

---

# 68. LOCATION PAGE

May emphasize:

- environment imagery
- maps where supported
- locations
- spatial navigation
- contextual hotspots

---

# 69. ITEM / COLLECTION PAGE

May emphasize:

- item imagery
- grids
- filters
- inspect interactions
- collection visuals

---

# 70. PAGE VISUAL VOCABULARY

Each page should derive its visuals from:

```text
PAGE CONTENT
+
ENTITY ASSET REGISTRY
+
IMAGE VARIABLES

```

not generic theme templates alone.

---

# 71. VISUAL COVERAGE 2.0

Preserve Visual Coverage from I3.

Improve it.

Dimensions:

```text
HERO_COVERAGE
MAJOR_SECTION_COVERAGE
PAGE_COVERAGE
ASSET_DIVERSITY
GAME_SPECIFICITY
REAL_ASSET_GROUNDING
GENERIC_FALLBACK_RATIO
INTERACTIVE_VISUAL_COVERAGE
VISUAL_GAP_QUALITY

```

---

# 72. COVERAGE MUST REFLECT REAL PAGE

Do not calculate coverage from metadata only.

If the runtime page renders few visuals:

coverage must reflect that.

---

# 73. RICH ACCEPTANCE TARGET

Recommended baseline:

```text
Visual Coverage >= 80%

```

for a fully grounded RICH publication.

Below this:

```text
65–79
PARTIAL / ACCEPTABLE

```

Below:

```text
65
INCOMPLETE / FAILED

```

Exact thresholds may be adjusted after real testing.

---

# 74. VISUAL COVERAGE DOES NOT MEAN SCREEN OCCUPANCY

Do not cover 80% of the screen with images.

Coverage measures:

```text
how consistently game-specific visual identity appears

```

not raw pixel area.

---

# 75. ASSET DIVERSITY

Avoid:

```text
same logo
same logo
same logo
same logo

```

Use multiple approved asset families.

---

# 76. ASSET REUSE LIMITS

Track asset usage counts.

Warn when one asset is being reused excessively.

---

# 77. AUTOMATIC COMPOSITION

Builder may automatically compose page sections using approved assets.

But resulting layout must remain editable.

---

# 78. MANUAL OVERRIDE

Allow admin/developer to:

- replace image
- move image role
- change composition preset
- change density
- disable decoration
- change interaction

without rebuilding everything.

---

# 79. BUILD MODES

Preserve useful build scopes.

But make them fit the new pipeline.

Examples:

```text
FULL_ENTITY_BUILD
RESEARCH_REFRESH
CONTENT_REFRESH
IMAGE_REFRESH
INTERACTION_REFRESH
STRUCTURE_REVIEW
TRANSLATION_REFRESH
IDENTITY_RESEARCH

```

Rename confusing old labels where necessary.

---

# 80. FULL BUILD

A FULL build should execute:

```text
Research
↓
Content
↓
Image Variables
↓
Image Discovery
↓
Composition
↓
Interaction Planning
↓
Preview Preparation
↓
Validation

```

Publication remains explicit.

---

# 81. IMAGE REFRESH

Must not unnecessarily regenerate text.

It should:

- re-search missing variables
- refresh candidate images
- re-run image validation
- re-compose affected visual regions

---

# 82. CONTENT REFRESH

May update text/image variables without unnecessarily deleting approved assets.

---

# 83. INTERACTION REFRESH

May re-plan interactions without re-running all research.

---

# 84. PUBLICATION IS ALWAYS EXPLICIT

Never auto-publish after Build.

Flow:

```text
BUILD
↓
PREVIEW
↓
VALIDATION
↓
USER PRESSES PUBLISH

```

---

# 85. PUBLISH BUTTON ALWAYS VISIBLE NEAR TOP

This is a direct I4 UX requirement.

Do not put the primary Publish control at the bottom.

---

# 86. PUBLICATION STATUS

Display:

```text
READY TO PUBLISH

```

or:

```text
PUBLICATION BLOCKED

```

prominently.

---

# 87. VALIDATION DOMAINS

Preserve/expand:

```text
STRUCTURE
RESEARCH
CONTENT
IMAGES
MEDIA
VISUAL_GROUNDING
INTERACTIONS
PREVIEW
PERFORMANCE
PUBLICATION

```

---

# 88. BLOCKERS

Example:

```text
2 required image variables unresolved
Visual coverage 58%
1 invalid interaction target
Preview not regenerated after image update

```

---

# 89. WARNINGS

Example:

```text
Low character asset diversity
3 optional image variables missing
One asset reused 6 times

```

Warnings do not necessarily block publication.

---

# 90. PREVIEW INVALIDATION

If text, images, layout or interactions change after the last preview:

mark:

```text
PREVIEW_STALE

```

The user must regenerate/reload preview before final validation.

---

# 91. PREVIEW VERSION

Preview should identify:

```text
Revision
Content version
Image resolution version
Interaction version

```

so that the user knows what they are viewing.

---

# 92. PREVIEW ERROR ISOLATION

If one component fails:

- show local error
- keep rest of preview running

Do not blank the full preview.

---

# 93. IMAGE FAILURE

If an image fails:

- hide/degrade that element
- report failure
- do not generate fake replacement

---

# 94. RESEARCH FAILURE

If research partially fails:

- preserve validated local information
- mark incomplete
- continue other stages when possible

---

# 95. AI CREATIVE DIRECTOR

Continue as optional.

It may assist with:

- page composition
- image-variable planning
- section visual balance
- interaction ideas
- visual coverage improvement
- asset diversity

---

# 96. AI MUST NOT GENERATE AUTHENTICITY

AI must not invent game assets and present them as real.

---

# 97. LOCAL AI

Preserve:

```text
LOCAL_FIRST_NO_API_KEY

```

Optional Ollama/Gemma.

No cloud AI required.

---

# 98. DETERMINISTIC FALLBACK

All three Builder systems must remain functional without AI.

---

# 99. NO AI ON STARTUP

Preserve:

```text
NO AI DURING SERVER STARTUP

```

---

# 100. PERFORMANCE

I4 introduces a richer pipeline but must NOT make runtime pages heavier than necessary.

---

# 101. AUTHORING PERFORMANCE VS RUNTIME PERFORMANCE

Separate these concerns.

Universe Builder may perform heavier research during explicit Build actions.

Published game pages must remain optimized.

---

# 102. IMAGE PERFORMANCE

Use:

- optimized variants
- responsive sizing
- lazy loading
- selective preload
- correct dimensions
- caching

---

# 103. RICH PERFORMANCE

Do not interpret RICH as:

```text
load everything

```

Use:

```text
load what is visible
prepare what is near
defer what is far

```

---

# 104. INTERACTIVE PERFORMANCE

Avoid:

- duplicate listeners
- repeated DOM scans
- unnecessary observers
- endless animation loops
- excessive timers

---

# 105. OFFSCREEN BEHAVIOR

Non-essential:

- animations
- interactive ambient effects
- galleries

should pause or remain uninitialized when far offscreen.

---

# 106. MOBILE

Personalized pages must remain visually rich on mobile.

But reduce:

- simultaneous accents
- large overlays
- excessive background assets

without removing identity.

---

# 107. ACCESSIBILITY

Maintain:

- semantic buttons
- labels
- keyboard navigation
- focus states
- tap equivalents
- reduced-motion support where appropriate

---

# 108. GAME / EXPERIENCE ISOLATION

Preserve:

```text
Roblox = GAME

Blox Fruits = EXPERIENCE
DOORS = EXPERIENCE
Fisch = EXPERIENCE
Prison Life = EXPERIENCE
Work at a Pizza Place = EXPERIENCE

```

Each Experience must retain its own:

- research context
- content
- image variables
- assets
- interactions
- preview
- publication state

---

# 109. NO CROSS-ENTITY ASSET LEAK

Fisch assets must not automatically become Blox Fruits assets.

Blox Fruits assets must not automatically become Roblox root identity.

---

# 110. CONTROLLED INHERITANCE

Parent assets may be inherited only when explicitly semantically appropriate.

---

# 111. DATABASE

If necessary, evolve:

```text
schema 36 → schema 37

```

Use additive migrations.

Preserve all schema 36 data.

---

# 112. POSSIBLE NEW DATA CONCEPTS

I4 may require:

```text
image_variables
image_variable_bindings
preview_snapshots
page_composition_records
visual_gap_metrics
builder_stage_status

```

Do not create duplicate tables when current structures can be safely extended.

---

# 113. PERSISTENCE

Persist:

- research results
- verified facts
- page plans
- text
- image variables
- image resolutions
- approved assets
- composition
- interactions
- preview status
- validation
- publication state

---

# 114. LEGACY SYSTEMS

Do not delete:

- Legacy Content Manifest
- legacy recovery
- existing Blueprint
- old structured content

Clarify their role.

---

# 115. CURRENT VS LEGACY

Builder should label areas:

```text
CURRENT I4 PIPELINE
LEGACY COMPATIBILITY

```

Avoid UI confusion.

---

# 116. PRIMARY BUILDER EXPERIENCE

Desired top-to-bottom interface:

```text
------------------------------------------------
UNIVERSE BUILDER 2.0
Blox Fruits · EXPERIENCE

Research READY
Content READY
Images PARTIAL
Preview READY
Publication BLOCKED

[ Build / Refresh ] [ Preview ] [ PUBLISH ]
------------------------------------------------

RESEARCH & CONTENT

Sources
Facts
Pages
Sections
Image variables

------------------------------------------------

IMAGES

Variables
Candidates
Approval
Resolved assets

------------------------------------------------

INTERACTIVE PREVIEW

[ Desktop ] [ Tablet ] [ Mobile ]

<REAL RUNNING PREVIEW>

------------------------------------------------

FINAL REPORT

Research
Content
Images
Visual
Interactions
Performance
Publication

Blockers
Warnings

[ Technical details ]
------------------------------------------------

```

---

# 117. REMOVE VISUAL NOISE FROM BUILDER UI

The Builder itself should be cleaner.

Avoid compressed labels such as:

```text
Element keyRoleINTERACTIVE...

```

Use proper spacing, grouping and panels.

---

# 118. ERROR UX

Errors must explain:

```text
what failed
where
why
what action is possible

```

---

# 119. IMAGE VARIABLE UX

Make image placeholders understandable.

Example:

```text
Gameplay Primary Image

Status: Missing

Intent:
Recognizable active gameplay scene.

[ Search ]
[ Assign asset ]

```

---

# 120. PREVIEW MUST SHOW ACTUAL FINAL DENSITY

If user chooses:

```text
RICH

```

Preview must visibly look RICH.

If not:

Validation should fail or warn.

---

# 121. PERSONALIZED PAGE ACCEPTANCE

I4 must NOT be approved if:

- Hero is customized but body is generic
- visual elements remain rare
- several major sections have no game-specific grounding
- RICH still looks sparse
- real assets exist but are not distributed
- small characteristic details are absent
- pages all use identical composition
- image variables remain unresolved without clear status
- preview differs significantly from publication

---

# 122. BLOX FRUITS TEST TARGET

Blox Fruits should be a major I4 acceptance entity.

Research engine should produce:

- factual content
- pages
- sections
- image variables

Image Engine should resolve those variables using real approved Blox Fruits imagery.

Preview should display:

- actual game-sourced assets
- richer page composition
- repeated identity
- no fake Jolly Roger
- no generic fake fruits
- meaningful section imagery
- real item/environment/character references where available

---

# 123. FISCH TEST TARGET

Fisch must verify:

- no generated fish
- no generated hooks as identity
- real game imagery
- enough section-level grounding
- RICH does not look empty

---

# 124. DOORS TEST TARGET

DOORS must verify:

- no generic fake door identity
- real recognizable imagery
- contextual section visuals
- actual game-sourced environmental references

---

# 125. VISUAL DENSITY ACCEPTANCE

For RICH:

A typical long page should not contain long sequences of visually generic major sections.

The exact layout may vary, but visual identity must remain continuously perceivable.

---

# 126. COMPOSITION VARIATION

Do not use:

```text
TEXT LEFT
IMAGE RIGHT

```

for every section.

Support a controlled composition library:

```text
TEXT_LEFT_VISUAL_RIGHT
VISUAL_LEFT_TEXT_RIGHT
FULL_BLEED_VISUAL
CENTERED_FEATURE
CARD_CLUSTER
MEDIA_STRIP
CHARACTER_FOCUS
ENVIRONMENT_FOCUS
ITEM_GRID
TIMELINE_VISUAL
GALLERY_SECTION
INTERACTIVE_FEATURE

```

Use appropriate patterns based on content.

---

# 127. COMPOSITION MUST REMAIN GAMEINDEX

Do not turn every game page into a completely unrelated website.

GameIndex shell and usability remain consistent.

---

# 128. USER APPEARANCE VS GAME IDENTITY

Preserve:

```text
USER APPEARANCE
≠
GAME IDENTITY

```

Both coexist.

---

# 129. SOCIAL

Only fix regressions.

No Social rewrite.

---

# 130. MUSIC

No music rewrite.

Preserve:

- one global player
- mute
- volume
- track switching
- cleanup
- lazy behavior

---

# 131. SECURITY

No:

```text
eval
new Function
arbitrary user JS
unvalidated asset URLs
unsafe HTML injection

```

---

# 132. SOURCE PROVENANCE

Preserve useful source information for discovered visual assets.

---

# 133. IMAGE TRUST

Discovery does not equal approval.

Never auto-promote every candidate to production identity.

---

# 134. AUTOMATIC APPROVAL

Only automatically approve assets when the existing architecture can strongly validate the source/ownership according to project rules.

Otherwise require review.

---

# 135. PUBLICATION RULE

A build can exist with incomplete images.

A complete RICH publication cannot claim success with insufficient visual grounding.

---

# 136. PARTIAL BUILDS

Allow:

```text
PARTIAL_BUILD

```

but label clearly.

---

# 137. BUILD VALIDATION

A structured draft may be valid while publication remains blocked.

Do not confuse:

```text
STRUCTURALLY VALID

```

with:

```text
READY TO PUBLISH

```

---

# 138. FINAL REPORT EXAMPLE

```text
GAMEINDEX BETA 0.99 I4

Entity:
Blox Fruits

Research
VALIDATED
22 facts

Content
VALIDATED
5 pages
18 sections

Images
PARTIAL
14 variables
11 resolved
3 missing

Visual
ACCEPTABLE
76% coverage

Interactions
VALIDATED
5 interactions

Preview
READY

Performance
READY

Publication
BLOCKED

BLOCKERS
- 2 required image variables missing
- RICH visual coverage below 80%

WARNINGS
- One asset reused 5 times

```

---

# 139. TECHNICAL TRACE

Keep detailed technical stages available separately.

Do not dominate the primary report.

---

# 140. I4 DEVELOPMENT PHASES

## I4-A

### BUILDER PIPELINE RESTRUCTURE

Implement:

- three-system architecture
- shared stage state
- new Builder layout
- top Publish control
- bottom report

---

## I4-B

### RESEARCH & CONTENT ENGINE

Implement:

- research state cleanup
- factual validation
- structured text
- image variables
- page planning

---

## I4-C

### GAME-SOURCED IMAGE ENGINE

Implement:

- variable resolution
- candidate discovery
- review workflow
- asset binding
- Image Manager integration

---

## I4-D

### PERSONALIZED PAGE COMPOSITION 2.0

Implement:

- richer section composition
- visual anchors
- small characteristic details
- composition variation
- visual gap detection
- page-level customization
- RICH density enforcement

---

## I4-E

### INTERACTIVE PREVIEW ENGINE

Implement:

- real runtime preview
- responsive modes
- interaction execution
- preview stale/version behavior
- isolated errors

---

## I4-F

### REPORT + VALIDATION + PUBLICATION

Implement:

- bottom report
- top Publish
- validation domains
- blockers
- warnings
- publication gate

---

## I4-G

### PERFORMANCE + REGRESSION

Verify:

- startup
- memory
- image loading
- scroll performance
- mobile
- previous universes
- Azure compatibility

---

# 141. P0

Highest priority:

- 3-stage Builder pipeline
- Research/Text with image variables
- Game-Sourced Image Engine
- Interactive Preview Engine
- Publish at top
- Report at bottom
- Personalized Page Composition 2.0
- fix rarefied pages
- real RICH density
- no fake game assets

---

# 142. P1

- visual gap metrics
- image review UX
- preview modes
- better reports
- composition variation
- coverage improvements

---

# 143. P2

- minor visual polish
- legacy labels
- developer trace cleanup
- secondary performance improvements

---

# 144. REGRESSION REQUIREMENTS

Before I4 completion test:

- Home
- Games catalog
- Experiences catalog
- Game pages
- Experience pages
- existing I3 universes
- Image Manager
- crop
- URL preview
- asset approval
- Visual Asset Registry
- image variables
- variable resolution
- content persistence
- page composition
- interactions
- preview
- Publish gate
- music
- mute
- volume
- Social
- Appearance
- Creator Appearance
- local AI fallback
- no AI startup
- SQLite migration
- Azure startup compatibility

---

# 145. I4 MUST NOT BE MARKED COMPLETE IF

Do NOT mark I4 complete if:

- Research and Images remain mixed into one opaque stage
- content cannot declare image variables
- image variables do not resolve to real assets
- script-generated fake game art returns
- Preview is only a diagnostic card
- Preview does not execute interactions
- Publish remains buried
- report is not at the bottom
- Builder still shows contradictory states
- RICH remains visually sparse
- personalized pages remain mostly generic
- visual dead zones remain excessive
- real approved assets exist but are barely used
- all pages use the same layout
- missing images silently receive fake substitutes
- site performance materially regresses
- AI becomes mandatory

---

# 146. IMPLEMENTATION PHILOSOPHY

Use:

```text
PRESERVE
→ SEPARATE RESPONSIBILITIES
→ BUILD PIPELINE
→ GROUND CONTENT
→ RESOLVE REAL IMAGES
→ COMPOSE
→ PREVIEW
→ VALIDATE
→ PUBLISH

```

Do not use:

```text
GENERATE EVERYTHING AT ONCE
→ HOPE IT LOOKS RIGHT

```

---

# 147. REQUIRED IMPLEMENTATION PROCESS

Before coding:

1. Inspect Beta 0.99 I3 completely.
2. Identify all current Builder routes/services.
3. Identify research pipeline.
4. Identify structured content storage.
5. Identify image/media discovery.
6. Identify Visual Asset Registry.
7. Identify Image Manager.
8. Identify composition/rendering logic.
9. Identify interaction runtime.
10. Identify preview implementation.
11. Identify validation.
12. Identify publication flow.
13. Identify reporting UI.
14. Identify schema 36 migration state.

Then extend existing architecture.

Do not create parallel duplicate systems unnecessarily.

---

# 148. DATABASE MIGRATION

If required:

```text
36 → 37

```

Migration must be additive.

Existing I3 data must survive.

---

# 149. DELIVERY

When implementation is requested, deliver:

```text
FULL
UPDATE_ONLY

```

Versioned as:

```text
GameIndex Beta 0.99 I4

```

---

# 150. IMPLEMENTATION REPORT

Include:

- files changed
- files created
- schema changes
- migration
- Research Engine changes
- Content Engine changes
- image variable system
- Image Engine changes
- Visual Asset Registry changes
- Page Composition changes
- Preview Engine changes
- interaction changes
- report changes
- Publish flow
- validation changes
- performance changes
- tests
- known limitations

---

# 151. FINAL TARGET

The new Universe Builder workflow should feel like:

```text
RESEARCH

What is this game?
What is verified?
What pages should exist?

↓

CONTENT

Write the actual page.
Declare where visuals are needed.

↓

IMAGES

Find actual visual material from the game.
Review it.
Approve it.
Resolve image variables.

↓

COMPOSITION

Build visually dense, game-specific pages.

↓

INTERACTIVE PREVIEW

Actually experience the page.

↓

VALIDATION

Know exactly what is wrong.

↓

PUBLISH

```

---

# 152. FINAL BUILDER RULE

Universe Builder must stop behaving like one giant opaque generator.

It must become a transparent production system.

Each stage must have a clear responsibility.

---

# 153. FINAL CONTENT RULE

The Research Engine decides:

```text
WHAT MUST BE SAID

```

and:

```text
WHAT VISUAL IS NEEDED

```

---

# 154. FINAL IMAGE RULE

The Image Engine decides:

```text
WHICH REAL GAME-SOURCED ASSET
FULFILLS THAT VISUAL NEED

```

---

# 155. FINAL PREVIEW RULE

The Interactive Preview Engine answers:

```text
DOES THE FINAL UNIVERSE
ACTUALLY LOOK AND WORK RIGHT?

```

---

# 156. FINAL PERSONALIZATION RULE

A personalized page cannot be considered successful when personalization exists only in the Hero.

The entire page must carry the entity's identity.

---

# 157. CORE I4 PRINCIPLES

```text
RESEARCH FIRST

```

```text
TEXT + IMAGE VARIABLES

```

```text
REAL GAME IMAGES SECOND

```

```text
COMPOSITION AFTER GROUNDING

```

```text
INTERACTIVE PREVIEW BEFORE PUBLICATION

```

```text
PUBLISH AT THE TOP

```

```text
REPORT AT THE BOTTOM

```

```text
RICH MUST ACTUALLY LOOK RICH

```

```text
REAL GAME DETAILS
NOT SCRIPT-GENERATED IMITATIONS

```

```text
PERSONALIZATION ACROSS THE WHOLE PAGE
NOT ONLY THE HERO

```

---

# 158. FINAL RULE

GameIndex Beta 0.99 I4 must transform Universe Builder 2.0 into a clear production pipeline composed of:

# RESEARCH & CONTENT ENGINE

which researches the entity, builds the pages, writes grounded text and defines contextual image variables;

# GAME-SOURCED IMAGE ENGINE

which resolves those variables using real, approved and optimized game-sourced visuals;

# INTERACTIVE PREVIEW ENGINE

which assembles the actual personalized universe and runs a faithful interactive preview before publication.

The final Builder interface must place:

```text
PUBLISH

```

near the top,

the three production systems through the main body,

and:

```text
FINAL REPORT

```

at the bottom.

Most importantly:

**I4 must finally eliminate rarefied personalized pages.**

The page must remain unmistakably connected to its Game or Experience throughout the full scroll, using real game-sourced material, richer section composition, varied layouts, recurring visual anchors and controlled density.

The result should no longer merely describe a game.

It should visibly and interactively feel like that game's GameIndex universe.