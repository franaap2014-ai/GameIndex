# GAMEINDEX — BETA 0.99 I6

## UNIVERSE BUILDER EXPERIENCE 4.0

## INTERACTIVE EXPERIENCE DISCOVERY ENGINE

## INTERACTIVE PREVIEW & REFINEMENT

## VISUAL IDENTITY MOTIF ENGINE

## AUTHORIZATION INBOX

## MULTI-PASS ENHANCEMENT ENGINE

## BUILD STATE CONSISTENCY

## SIMPLE-FIRST AUTHORING

---

# 1. VERSION

Target internal release:

```text
GameIndex Beta 0.99 I6

```

Public version remains:

```text
Beta 0.99

```

Do NOT expose:

```text
I6
I5
HF
schema version
internal release classification

```

to normal public users.

Internal technical areas may display:

```text
0.99-I6

```

This is an Intermediate Update, not a Hot Fix.

I6 substantially changes:

- Universe Builder UX
- interaction creation
- interaction discovery
- preview workflow
- approval workflow
- enhancement workflow
- visual identity system
- stage synchronization
- build revision state

---

# 2. BASELINE

Upgrade:

```text
GameIndex Beta 0.99 I5

```

into:

```text
GameIndex Beta 0.99 I6

```

Do NOT rewrite GameIndex.

Preserve all working I5 systems.

---

# 3. PRESERVE

Preserve:

- Node.js >= 22.13
- Express
- SQLite
- Azure App Service compatibility
- LOCAL\_FIRST\_NO\_API\_KEY
- optional local Ollama/Gemma
- GAME / EXPERIENCE model
- Research Quality Engine 2.0
- Semantic Image Resolver 2.0
- Asset Diversity Engine
- Visual Gap Auto-Healing
- Personalized Page Composition
- Visual Asset Registry
- image variables
- image candidate pools
- Auto Fix
- Preview/Publish consistency
- Admin Control Center 2.0
- Social 2.0
- Bug Tracker 2.0
- Regression Center
- Image Manager
- Appearance system
- Creator appearance
- global music
- MUTE
- volume persistence
- existing users
- permissions
- content
- universes
- bugs
- Social data
- existing interactions
- migration history

---

# 4. WHY I6 EXISTS

I5 introduced the correct intelligence and consolidation architecture.

However, real use of Universe Builder still exposes too much complexity and does not provide a simple enough workflow for interactive content.

Current Builder still forces the user to understand technical concepts such as:

```text
Element Key
Role
Event
Action
Target Type
Target
Animation
State
internal image variables
registry records
stage traces
hashes
technical validation codes

```

These concepts must remain available internally.

They must NOT define the normal Builder experience.

---

# 5. I6 PRIMARY GOAL

The normal Universe Builder should answer only:

```text
What is ready?

What is missing?

What can I improve?

What needs my approval?

What interactive experiences were discovered?

How does the page currently look?

Can I publish?

```

Everything else belongs to Advanced Mode.

---

# PART I

# UNIVERSE BUILDER EXPERIENCE 4.0

---

# 6. MAIN BUILDER STRUCTURE

The default Universe Builder must be significantly simpler.

Recommended primary structure:

```text
UNIVERSE BUILDER

Entity
Build status

[ BUILD ]
[ ENHANCE ]
[ PREVIEW ]
[ PUBLISH ]

CONTENT

IMAGES

VISUAL IDENTITY

APPEARANCE

INTERACTIONS

PENDING AUTHORIZATION

PREVIEW

PUBLICATION

```

---

# 7. REMOVE TECHNICAL NOISE FROM DEFAULT MODE

Do NOT display in normal mode:

- raw image variable IDs
- semantic role enums
- raw interaction schema
- target types
- internal revision hashes
- Visual Asset Registry
- raw provenance
- stage trace
- old legacy coverage
- internal database IDs
- low-level build modes
- raw validation domain codes

Move them into:

```text
Advanced Mode

```

---

# 8. BUILD TYPE SIMPLIFICATION

Current options such as:

```text
FULL_ENTITY_BUILD
RESEARCH_REFRESH
CONTENT_REFRESH
IMAGE_REFRESH
INTERACTION_REFRESH
STRUCTURE_REVIEW
TRANSLATION_REFRESH
IDENTITY_RESEARCH
TECHNICAL_REFRESH
TOPIC_REFRESH
MEDIA_REFRESH

```

must not dominate normal mode.

Normal user should see:

```text
Build Everything
Update Content
Update Images
Update Interactions

```

or simply:

```text
BUILD

```

with intelligent automatic selection.

Detailed build modes remain in Advanced Mode.

---

# 9. MAIN STATUS CARDS

Normal interface:

```text
CONTENT
5 pages ready
68 useful facts

IMAGES
8 of 9 ready

VISUAL IDENTITY
17 motifs discovered
14 ready

APPEARANCE
84%
Good

INTERACTIONS
3 approved
2 suggestions

PENDING AUTHORIZATION
4 decisions

PREVIEW
Ready

```

---

# 10. STATE CONSISTENCY

The current Builder may display contradictory values such as:

```text
Research: VALIDATED

0 facts

68 useful facts

Content: FAILED

Preview: READY

0 pages

0/0 images resolved

```

This must be fixed.

---

# 11. SINGLE REVISION STATE

Every visible normal-mode metric must belong to one explicit revision.

Maintain concepts such as:

```text
CURRENT_BUILD_REVISION
LAST_VALID_REVISION
PREVIEW_REVISION
PUBLISHED_REVISION

```

Never mix data between revisions.

---

# 12. BUILD-IN-PROGRESS STATE

While a new build is running, show:

```text
CURRENT BUILD
Researching...

Last valid build
Available

```

Do not replace valid old metrics with partially initialized values.

---

# 13. NO FALSE SUCCESS

Do NOT display:

```text
All required images are resolved

```

when:

```text
0 of 0

```

exists only because content has not generated visual needs yet.

Instead show:

```text
Waiting for Content

```

---

# 14. PREVIEW VALIDITY

Preview must not show:

```text
READY

```

for an empty current revision unless it explicitly means:

```text
Preview of last valid revision

```

Normal UI must clearly differentiate:

```text
Current Preview

Previous Valid Preview

```

---

# PART II

# VISUAL IDENTITY MOTIF ENGINE

---

# 15. VISUAL IDENTITY IS NOT THE SAME AS CONTENT IMAGES

Separate:

```text
CONTENT VISUALS

```

from:

```text
VISUAL IDENTITY MOTIFS

```

---

# 16. CONTENT VISUALS

Examples:

- Hero
- gameplay screenshot
- character image
- location
- collection visual
- update visual
- gallery image

---

# 17. VISUAL IDENTITY MOTIFS

These are smaller recognizable visual elements that make the page feel specific to the Game or Experience.

Examples may include:

- symbols
- faction marks
- items
- objects
- weapons
- collectibles
- UI fragments
- icons
- environmental details
- emblems
- patterns
- vehicles
- creatures
- ability symbols
- architectural details
- recognizable props

---

# 18. UNIVERSAL SYSTEM

The system must work for ALL Games and Experiences.

Never hard-code:

```text
JOLLY_ROGER
BLOX_FRUIT
CREEPER
DOOR
FISH

```

as required global motifs.

Those are entity-specific discoveries.

---

# 19. GENERIC MOTIF CATEGORIES

Use generic internal categories such as:

```text
SYMBOL
ITEM
WEAPON
CHARACTER
CREATURE
VEHICLE
LOCATION
ENVIRONMENT
FACTION
ABILITY
UI_ELEMENT
OBJECT
COLLECTIBLE
PATTERN
ARCHITECTURAL_DETAIL
ICONOGRAPHY
LOGO_MARK
PROP

```

---

# 20. ENTITY-SPECIFIC DISCOVERY

Research should discover actual motifs for the current entity.

Example:

Blox Fruits may discover:

```text
Jolly Roger
Blox Fruit
Sword
Boat
Island
Crew Symbol
Ability Icon
Inventory UI

```

Minecraft may discover:

```text
Creeper
Diamond
Crafting Table
Pickaxe
Grass Block
Torch
Redstone
Ender Pearl

```

DOORS may discover:

```text
Door number
Key
Hotel corridor detail
Entity iconography
Room signage
UI fragment

```

These are examples only.

Do not hard-code these outputs.

---

# 21. MOTIF POOLS

Each motif may contain multiple real approved assets.

Example concept:

```text
Motif: Jolly Roger

Candidate 1
Candidate 2
Candidate 3

```

---

# 22. REAL-ASSET REQUIREMENT

Visual Identity Motifs must follow the same grounding rule as the rest of GameIndex.

Never create fake entity-specific artwork and present it as authentic.

Use:

- approved official assets
- approved screenshots
- approved existing GameIndex media
- approved real reference assets
- approved user assets

---

# 23. MOTIF COUNT MUST BE DYNAMIC

Do not use a fixed number globally.

Suggested adaptive behavior:

```text
Small entity
6–10 motifs

Medium entity
10–20 motifs

Large/high-content entity
20–40+ motifs

```

These are guidance ranges, not hard limits.

---

# 24. MOTIF PRIORITY

Classify discovered motifs by importance:

```text
PRIMARY
SECONDARY
SUPPORTING

```

Primary motifs should represent highly recognizable entity identity.

---

# 25. VISUAL IDENTITY USAGE

Composition Engine may use approved motifs as:

- title accents
- card decorations
- small thumbnails
- section edge elements
- subtle backgrounds
- dividers
- micro illustrations
- contextual interactive objects
- navigation accents
- gallery details

---

# 26. PERFORMANCE

Motifs should use:

- optimized thumbnails
- responsive variants
- lazy loading
- compressed crops
- cached media
- small display dimensions

Do not load full-size source images for tiny decoration.

---

# PART III

# INTERACTIVE EXPERIENCE DISCOVERY ENGINE

---

# 27. CORE CHANGE

Interactions must no longer begin with:

```text
Element Key
Event
Action
Target

```

for normal users.

Interactions should begin with:

```text
What interesting interactive experience can this Game or Experience offer?

```

---

# 28. RESEARCH-DRIVEN INTERACTION DISCOVERY

After Research & Content understands the entity, it should identify interactive opportunities based on actual supported gameplay concepts.

The suggestions must appear in the current site language.

---

# 29. EXAMPLES

For Blox Fruits, research may produce suggestions such as:

```text
Roletar Fruta
Loja de Frutas
Explorar Ilhas
Estilos de Luta

```

For Fisch:

```text
Mini game de pesca
Descobrir peixe
Equipamentos de pesca

```

For DOORS:

```text
Abrir Porta 50
Abrir Porta 100
Descobrir entidades

```

For Work at a Pizza Place:

```text
Monte uma pizza
Escolha um trabalho
Prepare um pedido

```

These are examples only.

The system must discover appropriate topics dynamically.

---

# 30. NO HARDCODED GAME INTERACTIONS

Do NOT implement:

```text
if game == Blox Fruits → Roll Fruit

```

Instead:

```text
Research
↓
Gameplay concepts
↓
Interaction opportunities
↓
Interaction category
↓
Localized title
↓
Prototype

```

---

# 31. GENERIC INTERACTION CATEGORIES

Internally classify opportunities using generic concepts such as:

```text
ROLL
RANDOMIZE
BUILD
ASSEMBLE
CHOOSE
EXPLORE
UNLOCK
OPEN
CRAFT
FISH
TIME
MATCH
COLLECT
SHOP
COMPARE
NAVIGATE
DISCOVER
SIMULATE
CUSTOMIZE
PROGRESS
QUIZ
MAP
GALLERY
INSPECT

```

---

# 32. INTERACTION TITLE LOCALIZATION

Suggestions must use the active GameIndex language.

Example:

```text
pt-BR:
Roletar Fruta

en-US:
Roll a Fruit

es-ES:
Girar una Fruta

```

Do not expose internal category names.

---

# 33. INTERACTION SUGGESTION CARD

Normal Builder:

```text
INTERACTIVE IDEAS

Roletar Fruta
Suggested from gameplay research

[ PREVIEW ]
[ APPROVE ]
[ REBUILD ]
[ DISCARD ]

```

---

# 34. MULTIPLE SUGGESTIONS

Research may generate multiple candidates.

Example:

```text
5 suggestions discovered

Roletar Fruta
Loja de Frutas
Explorar Ilhas
Comparar Frutas
Estilos de Luta

```

The user chooses which are worth generating.

---

# PART IV

# INTERACTIVE PREVIEW GENERATOR

---

# 35. INTERACTION PREVIEW IS REQUIRED

Selecting an interactive topic must generate a functional Preview before approval.

Do not ask the user to approve only from a text description.

---

# 36. PREVIEW EXAMPLE — RANDOMIZATION

Conceptually:

```text
Roletar Fruta

[ ROLL ]

Result:
<approved fruit visual>
Fruit name
Relevant information

```

---

# 37. PREVIEW EXAMPLE — ASSEMBLY

For a food/building interaction:

```text
Monte uma pizza

Base
Sauce
Cheese
Toppings

[ COMPLETE ]

Result preview

```

---

# 38. PREVIEW EXAMPLE — OPEN / UNLOCK

For progression:

```text
Porta 50

[ OPEN ]

↓
Reveal contextual information

```

---

# 39. NOT A FULL GAME CLONE

Interactive components are GameIndex informational experiences.

Do NOT attempt to reproduce full copyrighted gameplay systems.

They should:

- explain
- demonstrate
- simulate lightly
- contextualize
- visualize
- allow simple interaction

while remaining a GameIndex content experience.

---

# 40. INTERACTIVE PREVIEW USES REAL PAGE SYSTEM

Whenever possible, interaction Preview should use the same renderer/component model that will appear on the published Universe.

Avoid separate throwaway preview implementations.

---

# PART V

# INTERACTION APPROVAL & REBUILD LOOP

---

# 41. USER APPROVAL

After Preview:

```text
[ APPROVE ]
[ REBUILD ]
[ DISCARD ]

```

---

# 42. REBUILD

If user selects:

```text
REBUILD

```

the system must create another version.

Do not merely reset the same state.

---

# 43. WHAT REBUILD MAY IMPROVE

Rebuild may adjust:

- interaction layout
- information density
- sequence
- wording
- visual hierarchy
- approved assets
- motif use
- animation
- controls
- presentation
- feedback
- contextual information

---

# 44. REBUILD MUST PRESERVE INTENT

If user selected:

```text
Roletar Fruta

```

Rebuild should still be:

```text
Roletar Fruta

```

unless the user explicitly changes the idea.

It should improve implementation, not silently switch topics.

---

# 45. ITERATION HISTORY

Maintain:

```text
Interaction Concept

Version 1
Rejected

Version 2
Rejected

Version 3
Approved

```

Do not lose prior revisions.

---

# 46. OPTIONAL FEEDBACK

The user may optionally indicate:

```text
Too simple
Too confusing
Does not look enough like the game
Too much text
Not interactive enough
Try another layout

```

But feedback must NOT be mandatory.

A simple:

```text
REBUILD

```

must work automatically.

---

# 47. APPROVED INTERACTION

After approval:

```text
APPROVED

```

The interaction enters the current Universe composition.

It should no longer appear in Pending Authorization.

---

# PART VI

# SIMPLE INTERACTION BUILDER

---

# 48. NORMAL MODE

Normal Interaction section should show:

```text
INTERACTIONS

3 approved
2 suggestions
1 awaiting approval

Suggestions

[ cards ]

Approved

[ cards ]

```

---

# 49. REMOVE RAW DECLARATIVE EDITOR FROM NORMAL MODE

Do NOT show normal users:

```text
Element Key
Role
Event
Action
Target Type
Save As
Animation State

```

---

# 50. ADVANCED INTERACTION EDITOR

Preserve declarative model internally:

```text
ELEMENT
→ EVENT
→ ACTION
→ TARGET

```

Expose it only under:

```text
Advanced Mode
→ Interaction Editor

```

---

# 51. PREVIEW ELEMENT SELECTION

For manual interaction creation, allow:

```text
Select element in Preview

```

The user clicks directly on an element.

Then show simple options:

```text
What should happen?

Open information
Go to section
Open gallery
Play animation
Play sound
Reveal content

```

---

# PART VII

# AUTHORIZATION INBOX

---

# 52. NEW MAIN MENU

Add a prominent main Builder section:

```text
PENDING AUTHORIZATION

```

or localized equivalent such as:

```text
Pendentes de autorização

```

---

# 53. PURPOSE

This is the user's decision inbox.

It must contain everything the system cannot safely decide alone.

---

# 54. AUTHORIZATION TYPES

May include:

```text
CONTENT
IMAGE
VISUAL_IDENTITY
INTERACTION
APPEARANCE

```

---

# 55. DO NOT PUT INTERNAL TASKS HERE

Never include:

```text
Sync variables
Revalidate
Recalculate
Refresh registry
Run migration
Rebuild hashes

```

Those are system responsibilities.

---

# 56. EXAMPLE

```text
PENDING AUTHORIZATION · 5

IMAGES · 2

Main image
3 candidates
[ REVIEW ]

Collections image
2 candidates
[ REVIEW ]


VISUAL IDENTITY · 1

Jolly Roger
3 real assets found
[ REVIEW ]


INTERACTIONS · 2

Roletar Fruta
[ PREVIEW ]

Loja de Frutas
[ PREVIEW ]

```

---

# 57. PREVIEW FROM AUTHORIZATION

Any visual or interaction authorization should support:

```text
VIEW IN PREVIEW

```

when technically relevant.

---

# 58. BATCH APPROVAL

If several items have high-confidence recommendations:

```text
4 safe recommendations available

[ APPROVE 4 RECOMMENDATIONS ]

```

Only allow this when confidence thresholds are satisfied.

Never bulk-approve ambiguous content.

---

# 59. AUTHORIZATION COUNT

Display prominently:

```text
Pending Authorization · 4

```

in the Builder header.

---

# PART VIII

# MULTI-PASS ENHANCEMENT ENGINE

---

# 60. NEW PRIMARY BUTTON

Add:

```text
ENHANCE

```

to the main Builder toolbar.

Example:

```text
[ BUILD ]
[ ENHANCE ]
[ PREVIEW ]
[ PUBLISH ]

```

---

# 61. ENHANCEMENT PURPOSE

Enhancement is NOT the same as starting the build from zero.

It should improve an existing Universe.

---

# 62. ENHANCEMENT DIALOG

On click:

```text
ENHANCE UNIVERSE

How many additional research passes?

1 2 3 4 5

Focus:

Smart
Everything
Content
Images
Visual Identity
Interactions

[ START ENHANCEMENT ]

```

---

# 63. PASS COUNT

The user chooses how many additional research passes to execute.

Do not silently choose a fixed number.

---

# 64. SMART ENHANCEMENT

Default:

```text
SMART

```

Each pass must inspect what is still weak.

---

# 65. DO NOT REPEAT IDENTICAL SEARCHES

Enhancement must NOT simply execute the same query N times.

Each pass should consider previous results.

---

# 66. PASS LOGIC

Conceptually:

```text
PASS 1
Inspect current weaknesses
Research missing coverage

PASS 2
Inspect remaining gaps
Search different sources / topics

PASS 3
Target unresolved images, motifs or interactions

PASS 4
Improve diversity and depth

PASS 5
Final targeted quality pass

```

---

# 67. RESEARCH DELTA

Every pass should calculate:

```text
new useful facts
new sources
new approved/reviewable assets
new motifs
new interaction opportunities
duplicates rejected
boilerplate rejected

```

---

# 68. STOP DUPLICATE ACCUMULATION

Do not allow Enhancement to endlessly inflate the database with repeated content.

Deduplicate:

- facts
- sources
- image candidates
- motifs
- interactions

---

# 69. ENHANCEMENT FOCUS — CONTENT

Search for:

- unsupported topics
- thin sections
- weak facts
- missing entity context
- recent/structured information where available

---

# 70. ENHANCEMENT FOCUS — IMAGES

Search for:

- unresolved variables
- poor semantic matches
- over-reused assets
- Hero alternatives
- missing section coverage

---

# 71. ENHANCEMENT FOCUS — VISUAL IDENTITY

Search for:

- additional motifs
- missing motif categories
- better real assets
- more recognizable details
- asset diversity

---

# 72. ENHANCEMENT FOCUS — INTERACTIONS

Search for:

- additional gameplay concepts
- interactive opportunities
- weak existing interaction ideas
- richer informational simulations

---

# 73. ENHANCEMENT RESULT

Example:

```text
ENHANCEMENT COMPLETE

3 passes

BEFORE

68 useful facts
5/7 images
9 visual motifs
3 interaction ideas
61% visual quality

AFTER

91 useful facts
9/9 images
18 visual motifs
7 interaction ideas
87% visual quality

NEW

+23 useful facts
+4 image assets
+9 motifs
+4 interaction ideas
+3 sources

REJECTED

14 duplicates
7 boilerplate fragments
3 irrelevant assets

```

---

# 74. NEW AUTHORIZATION AFTER ENHANCEMENT

If Enhancement discovers uncertain items:

```text
6 improvements applied automatically

4 items require authorization

[ REVIEW PENDING ]

```

---

# PART IX

# AUTO FIX VS ENHANCE

---

# 75. KEEP BOTH

Do NOT merge:

```text
AUTO FIX

```

and:

```text
ENHANCE

```

They serve different purposes.

---

# 76. AUTO FIX

Purpose:

```text
Repair known blockers using currently available data.

```

Examples:

- rebind better approved asset
- reduce reuse
- fix layout
- refresh Preview
- heal Visual Gap

---

# 77. ENHANCE

Purpose:

```text
Go back to research/discovery and obtain MORE or BETTER material.

```

---

# 78. SIMPLE USER LANGUAGE

Normal UI:

```text
Fix automatically

```

and:

```text
Enhance

```

Advanced explanations can expose the underlying pipeline.

---

# PART X

# PREVIEW AS THE CENTER OF THE BUILDER

---

# 79. LARGE PREVIEW

Preview must remain a major visible part of the Builder.

Support:

```text
Desktop
Tablet
Mobile

```

---

# 80. EDIT FROM PREVIEW

Allow selecting a section in Preview.

Simple contextual actions may include:

```text
Edit text
Change image
Change layout
Add interaction
View identity details

```

---

# 81. INTERACTION TESTING

Approved and pending interactions must be testable directly inside Preview.

---

# 82. TEMPORARY PREVIEW

Pending changes can be rendered temporarily without becoming saved/published state.

Example:

```text
PREVIEWING CANDIDATE

```

Then:

```text
Approve
Rebuild
Cancel

```

---

# 83. PUBLISHED CONSISTENCY

Continue I5 rule:

Preview and published Universe must use the same fundamental renderer.

---

# PART XI

# PUBLISH FLOW

---

# 84. SIMPLE PUBLICATION STATE

Normal user sees:

```text
READY TO PUBLISH

```

or:

```text
CAN'T PUBLISH YET

```

---

# 85. SIMPLE BLOCKERS

Example:

```text
Still needed:

- approve main image
- approve 1 interaction
- update Preview

```

Do not show raw technical codes unless Advanced Mode is opened.

---

# 86. INTERACTION REQUIREMENT

Do not require every suggested interaction to be approved.

Rejected/discarded suggestions should not block publishing.

Only interactions explicitly included in the current Universe must validate.

---

# PART XII

# CURRENT BLOX FRUITS FAILURE CASE

---

# 87. FIX CURRENT CONTRADICTIONS

The following kind of state must not happen again:

```text
Research VALIDATED
0 facts

Content FAILED
68 useful facts

Images FAILED
0/0
"all required images resolved"

Preview READY
0 pages

Visual Gap 0%
Visual Quality 2%

```

---

# 88. EXPECTED DURING BUILD

Instead:

```text
RESEARCH
RUNNING

Current build:
0 sources processed yet

Last valid revision:
68 useful facts

```

---

# 89. DOWNSTREAM STAGES

While Research for current revision is incomplete:

```text
CONTENT
Waiting for Research

IMAGES
Waiting for Content

VISUAL IDENTITY
Waiting for Research

INTERACTIONS
Waiting for Research

PREVIEW
Last valid Preview available

```

---

# PART XIII

# INTERACTION VALIDATION

---

# 90. INVALID TARGETS

Current blockers such as:

```text
Interaction target GAMEPLAY is invalid.
Interaction target COLLECTIONS is invalid.

```

must not appear in simple mode as raw errors.

---

# 91. SIMPLE MESSAGE

Show:

```text
2 interactions reference sections that no longer exist.

[ FIX AUTOMATICALLY ]
[ REVIEW ]

```

---

# 92. AUTOMATIC TARGET REPAIR

If section IDs changed but semantic equivalents exist, try safe remapping.

Example:

```text
GAMEPLAY
→ gameplay-mechanics

```

Only when confidence is high.

Otherwise require authorization.

---

# PART XIV

# PERFORMANCE

---

# 93. DO NOT MAKE BUILDER HEAVIER

I6 adds richer workflows but must not return to the previous performance problem.

---

# 94. LAZY ADVANCED MODE

Do not render expensive Advanced sections until opened.

---

# 95. INTERACTION PREVIEWS

Load only the selected interactive Preview.

Do not render all interaction prototypes simultaneously.

---

# 96. MOTIF POOLS

Use paginated/lazy candidate pools.

---

# 97. ENHANCEMENT

Enhancement passes should be sequential and bounded.

Do not create parallel uncontrolled scraping/fetch loops.

---

# PART XV

# SECURITY

---

# 98. INTERACTION SAFETY

Continue to prohibit:

```text
eval
new Function
arbitrary stored JavaScript
unsafe HTML execution

```

Interactive components must be declarative and renderer-controlled.

---

# 99. EXTERNAL CONTENT

Never execute scripts from discovered websites.

---

# PART XVI

# DATABASE

---

# 100. SCHEMA

I5 uses schema 38.

If new persistent structures are required:

```text
38 → 39

```

Additive migration only.

---

# 101. POSSIBLE NEW CONCEPTS

Reuse current tables where possible.

Potential concepts:

```text
visual_identity_motifs
visual_identity_assets
interaction_concepts
interaction_prototypes
interaction_revisions
authorization_queue
enhancement_runs
enhancement_passes
build_revision_state

```

Do not create redundant persistence if equivalent I5 structures already exist.

---

# 102. PRESERVE DATA

Migration must preserve:

- Games
- Experiences
- users
- roles
- universes
- research
- sources
- pages
- sections
- images
- registry assets
- compositions
- interactions
- Preview snapshots
- Social
- bugs
- audit history

---

# PART XVII

# ACCEPTANCE TEST — BLOX FRUITS

---

# 103. RESEARCH

Expected:

```text
Useful facts available
No legal boilerplate in content
No state contradictions

```

---

# 104. VISUAL IDENTITY

System should dynamically discover Blox Fruits-specific visual motifs.

Examples may include:

```text
Jolly Roger
Fruit
Sword
Boat
Island
Crew symbol
UI detail

```

but test must validate discovery architecture, not hard-coded names.

---

# 105. INTERACTION DISCOVERY

Research should produce relevant localized interactive ideas.

Possible expected examples:

```text
Roletar Fruta
Loja de Frutas

```

Exact suggestions may vary based on supported research.

---

# 106. INTERACTION PREVIEW

Selecting a suggestion must produce a working Preview.

---

# 107. REBUILD

User can:

```text
REBUILD

```

and receive another implementation of the same interaction concept.

---

# 108. APPROVAL

Approved interaction enters current Universe.

Rejected interaction does not.

---

# PART XVIII

# ACCEPTANCE TEST — FISCH

---

# 109. EXPECTED

Research discovers entity-specific interaction opportunities.

Possible example:

```text
Mini game de pesca

```

Do not hard-code it.

Preview must be functional.

Visual identity must use real Fisch-related assets.

No fake generated fish as authentic game imagery.

---

# PART XIX

# ACCEPTANCE TEST — DOORS

---

# 110. EXPECTED

Possible research-derived interactions:

```text
Abrir Porta 50
Abrir Porta 100

```

Do not hard-code.

Use real entity-specific visual grounding.

No fake DOORS assets.

---

# PART XX

# ACCEPTANCE TEST — WORK AT A PIZZA PLACE

---

# 111. EXPECTED

Possible interaction:

```text
Monte uma pizza

```

Research should justify the concept.

Interaction Preview should allow a lightweight informational assembly experience.

Do not recreate the complete game.

---

# PART XXI

# ACCEPTANCE TEST — OTHER GAMES

---

# 112. UNIVERSAL TEST

Test at least several structurally different Games:

- Minecraft
- Counter-Strike 2
- Marvel's Spider-Man
- GTA V
- Sonic
- Roblox Experience

Ensure interaction discovery is not Roblox-specific.

---

# PART XXII

# SIMPLE BUILDER TARGET

---

# 113. FINAL NORMAL UI

Target experience:

```text
GAMEINDEX · Beta 0.99

UNIVERSE BUILDER

Blox Fruits
Experience

[ BUILD ]
[ ENHANCE ]
[ PREVIEW ]
[ PUBLISH ]

────────────────

CONTENT
✓ Ready
68 useful facts
5 pages

IMAGES
⚠ 1 missing
8/9

VISUAL IDENTITY
✓ Good
17 motifs

APPEARANCE
84%
Good

INTERACTIONS
3 approved
2 suggestions

[ VIEW SUGGESTIONS ]

PENDING AUTHORIZATION
4 items

[ REVIEW ]

────────────────

PREVIEW

[ Desktop ] [ Tablet ] [ Mobile ]

< REAL WORKING PAGE >

────────────────

PUBLICATION
Needs 2 decisions

[ REVIEW PENDING ]

────────────────

Advanced Mode

```

---

# PART XXIII

# INTERACTION SCREEN TARGET

---

# 114. SIMPLE INTERACTION UI

```text
INTERACTIONS

Suggested from research

Roletar Fruta
Interactive gameplay concept
[ PREVIEW ]

Loja de Frutas
Interactive information concept
[ PREVIEW ]

Explorar Ilhas
Navigation concept
[ PREVIEW ]

────────────────

Approved

Roletar Fruta
✓ Approved

[ TEST ]
[ EDIT ]

```

---

# PART XXIV

# PREVIEW APPROVAL TARGET

---

# 115. AFTER GENERATION

```text
PREVIEWING

Roletar Fruta

< FUNCTIONAL INTERACTION PREVIEW >

Does this look good?

[ APPROVE ]
[ REBUILD ]
[ DISCARD ]

```

---

# PART XXV

# ENHANCEMENT TARGET

---

# 116. ENHANCE UI

```text
ENHANCE UNIVERSE

Research passes

[-] 3 [+]

Focus

● Smart
○ Everything
○ Content
○ Images
○ Visual Identity
○ Interactions

[ START ]

```

---

# PART XXVI

# PENDING AUTHORIZATION TARGET

---

# 117. AUTHORIZATION UI

```text
PENDING AUTHORIZATION · 4

Main Image
3 candidates
[ REVIEW ]

Jolly Roger
Visual Identity
2 candidates
[ REVIEW ]

Roletar Fruta
Interaction
Preview ready
[ PREVIEW ]

Update information
Medium confidence
[ REVIEW ]

```

---

# PART XXVII

# ADVANCED MODE

---

# 118. KEEP TECHNICAL POWER

Advanced Mode must still provide:

- Research & Content internals
- raw image variables
- candidate scoring
- Visual Asset Registry
- motif records
- declarative interaction editor
- raw interaction lifecycle
- hashes
- revision state
- validation domains
- performance data
- legacy compatibility
- stage trace

---

# 119. ADVANCED MODE MUST NOT LOAD BY DEFAULT

Heavy technical panels should be lazy-loaded.

---

# PART XXVIII

# TESTING

---

# 120. REQUIRED REGRESSIONS

Run:

- I5 regression
- I4 regression
- I3 regression
- I2 regression
- I1 regression
- Beta 0.99 base regression
- existing HF regressions

---

# 121. I6 SPECIFIC TESTS

Test:

- build revision consistency
- no contradictory counters
- interaction discovery
- localized interaction titles
- interaction Preview
- interaction rebuild
- interaction approval
- interaction discard
- authorization queue
- batch safe approval
- Enhancement 1 pass
- Enhancement multiple passes
- duplicate rejection
- motif discovery
- motif real-asset grounding
- motif usage
- Preview candidate mode
- published renderer consistency
- Advanced Mode lazy loading

---

# PART XXIX

# FAILURE CONDITIONS

---

# 122. DO NOT MARK I6 COMPLETE IF

- Builder still exposes raw interaction schema by default
- user must understand Element Key to create an interaction
- interaction ideas are hard-coded per game
- interaction titles ignore current language
- interaction suggestion has no Preview
- REBUILD simply reloads the same result
- Visual Identity is hard-coded for Blox Fruits
- fake entity-specific motifs are generated
- Pending Authorization mixes internal system tasks with user decisions
- Enhancement repeats identical searches
- Enhancement creates uncontrolled duplicates
- current and previous revision metrics are mixed
- Preview says READY for an invalid empty current revision without clarification
- 0/0 images is described as complete before visual needs exist
- performance materially regresses
- API key becomes mandatory

---

# PART XXX

# IMPLEMENTATION ORDER

---

# 123. I6-A

## BUILD STATE CONSISTENCY

First fix:

- current revision
- last valid revision
- Preview revision
- counters
- stage synchronization
- contradictory UI states

---

# 124. I6-B

## BUILDER UX SIMPLIFICATION

Implement:

- simple default Builder
- reduced controls
- primary status cards
- Advanced Mode isolation

---

# 125. I6-C

## VISUAL IDENTITY MOTIF ENGINE

Implement:

- universal motif discovery
- categories
- candidate pools
- real asset grounding
- composition integration

---

# 126. I6-D

## INTERACTIVE EXPERIENCE DISCOVERY

Implement:

- research-driven opportunities
- generic categories
- localization
- suggestion ranking

---

# 127. I6-E

## INTERACTIVE PREVIEW + REBUILD

Implement:

- prototype generation
- Preview
- approval
- rejection
- rebuilding
- iteration history

---

# 128. I6-F

## AUTHORIZATION INBOX

Implement:

- unified decision queue
- counts
- categories
- Preview integration
- safe bulk approval

---

# 129. I6-G

## MULTI-PASS ENHANCEMENT

Implement:

- user-selected pass count
- Smart strategy
- targeted subsequent passes
- deltas
- duplicate prevention
- authorization output

---

# 130. I6-H

## REGRESSION + PERFORMANCE

Verify all existing and new behavior.

---

# PART XXXI

# DELIVERY

---

# 131. WHEN IMPLEMENTATION IS REQUESTED

Deliver:

```text
FULL
UPDATE_ONLY

```

for:

```text
GameIndex Beta 0.99 I6

```

---

# 132. UPDATE\_ONLY

UPDATE\_ONLY must apply cleanly over verified I5 FULL baseline.

After applying:

```text
I5 + I6 UPDATE_ONLY

```

must reconstruct the exact I6 FULL tree.

---

# 133. TEST REPORT

Include:

- files changed
- files created
- schema migration
- state consistency changes
- Builder UX changes
- Visual Identity Motif Engine
- Interaction Discovery Engine
- interaction Preview
- rebuild lifecycle
- Authorization Inbox
- Enhancement Engine
- Preview consistency
- performance tests
- regression results
- known limitations

---

# 134. PACKAGE VALIDATION

Validate:

```text
FULL extraction
UPDATE_ONLY extraction
I5 + UPDATE_ONLY equivalence
syntax
tests
migration

```

Do not claim browser/Azure live testing unless actually executed.

---

# PART XXXII

# FINAL PRINCIPLES

```text
DISCOVER INTERACTIONS FROM THE GAME
DO NOT MAKE THE USER PROGRAM THEM

```

```text
SHOW A WORKING PREVIEW
BEFORE ASKING FOR APPROVAL

```

```text
REBUILD WHEN REJECTED
DO NOT FORCE MANUAL TECHNICAL EDITING

```

```text
VISUAL IDENTITY MUST BE UNIVERSAL
NOT BLOX-FRUITS-SPECIFIC

```

```text
JOLLY ROGER IS A DISCOVERED MOTIF
NOT A GLOBAL HARDCODED FEATURE

```

```text
REAL GAME-SOURCED IDENTITY
NOT FAKE AUTHENTIC-LOOKING ART

```

```text
PENDING AUTHORIZATION IS THE USER'S DECISION INBOX
NOT A SYSTEM TASK QUEUE

```

```text
ENHANCEMENT MEANS NEW INTELLIGENT RESEARCH
NOT THE SAME SEARCH REPEATED N TIMES

```

```text
CURRENT BUILD AND LAST VALID BUILD
MUST NEVER BE MIXED

```

```text
PREVIEW IS THE CENTER OF AUTHORING

```

```text
SIMPLE BY DEFAULT
TECHNICAL WHEN REQUESTED

```

---

# 135. FINAL TARGET

GameIndex Beta 0.99 I6 must turn Universe Builder from a technical orchestration dashboard into an intelligent authoring environment.

The system should research the Game or Experience, understand its content, discover its real visual identity, identify meaningful interactive opportunities, generate working interactive previews, and ask the user only for decisions that genuinely require human approval.

The user should be able to:

```text
BUILD
↓
REVIEW
↓
ENHANCE
↓
CHOOSE INTERACTIVE IDEAS
↓
TEST THEM IN PREVIEW
↓
APPROVE OR REBUILD
↓
RESOLVE PENDING AUTHORIZATIONS
↓
PREVIEW THE COMPLETE UNIVERSE
↓
PUBLISH

```

without needing to understand:

```text
Element Keys
Event schemas
Target types
revision hashes
image registry IDs
raw validation codes
internal lifecycle mechanics

```

The underlying technical architecture must remain powerful.

The normal experience must become substantially simpler.

The final objective is:

# GAMEINDEX SHOULD DISCOVER THE EXPERIENCE, BUILD IT, SHOW IT, IMPROVE IT, AND ASK THE USER ONLY FOR THE DECISIONS THAT MATTER.