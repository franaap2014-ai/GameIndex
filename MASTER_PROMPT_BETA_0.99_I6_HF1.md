# GAMEINDEX — BETA 0.99 I6 HF1

## FINAL LAUNCH STABILIZATION

## UNIVERSE BUILDER FINALIZATION

## INTERACTIVE MENU FINALIZATION

## BUILD RELIABILITY

## BUTTON RELIABILITY

## PREVIEW CONSISTENCY

## RELEASE READINESS

---

# 1. MISSION

Finish GameIndex Beta 0.99 for public release.

This is the final stabilization sprint before launch.

Do NOT create I7.

Do NOT introduce major new features.

Do NOT redesign systems that already exist.

Do NOT expand scope.

The goal is:

```text
MAKE THE CURRENT I6 HF1 RELIABLE,
USABLE,
FAST,
CONSISTENT,
AND READY TO PUBLISH.

```

---

# 2. BASELINE

Use the latest existing:

```text
GameIndex Beta 0.99 I6 HF1

```

work tree as the baseline.

Preserve all already implemented I6 systems:

- Universe Builder Experience 4.0
- Research Quality Engine
- Content pipeline
- Semantic Image Resolver
- Visual Identity Motif Engine
- Interactive Experience Discovery
- Interactive Preview
- Approve / Rebuild / Discard
- Authorization Inbox
- Multi-Pass Enhancement
- Auto Fix
- Preview renderer
- published Universe renderer
- Admin
- Social
- Bug Tracker
- Image Manager
- Appearance
- Creator appearance
- Music
- MUTE
- local-first AI
- no mandatory API key

---

# 3. PUBLIC VERSION

Public-facing version:

```text
Beta 0.99

```

Normal users must NOT see:

```text
I6
HF1
schema version
internal release suffix

```

Technical DEV/Admin/Advanced areas may show:

```text
0.99-I6-HF1

```

---

# 4. SCOPE FREEZE

From this point forward, do NOT add:

- new social features
- new Admin architecture
- new AI subsystems
- new theme systems
- new music systems
- new content categories
- new large database models unless required to fix current behavior
- experimental visual effects
- new GameIndex-wide architecture
- unnecessary animations
- decorative features unrelated to release readiness

Only work on:

```text
UNIVERSE BUILDER
INTERACTIVE MENU
BUILD RELIABILITY
BUTTONS
PREVIEW
STATE CONSISTENCY
PERFORMANCE
BUGS
RELEASE

```

---

# 5. PRIORITY ORDER

Strict implementation priority:

```text
P0 — BUTTONS WORK
P0 — BUILD COMPLETES RELIABLY
P0 — STATE IS CONSISTENT
P0 — PREVIEW IS TRUTHFUL

P1 — INTERACTIVE MENU WORKS
P1 — VISUAL IDENTITY WORKS
P1 — AUTHORIZATION WORKS
P1 — ENHANCE WORKS

P2 — UX POLISH
P2 — LOCALIZATION
P2 — PERFORMANCE POLISH

```

Do not spend time on P2 while any P0 remains broken.

---

# PART I

# UNIVERSE BUILDER FINAL STRUCTURE

---

# 6. NORMAL MODE

The default Universe Builder must remain simple.

Target structure:

```text
GAMEINDEX · Beta 0.99

UNIVERSE BUILDER

<Game / Experience>

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

Advanced Mode

```

---

# 7. REMOVE TECHNICAL NOISE

Normal mode must not expose:

- raw image variable IDs
- raw element keys
- raw target IDs
- raw interaction schema
- internal hashes
- database IDs
- registry internals
- semantic enum names
- raw lifecycle statuses
- migration data
- legacy diagnostics
- raw validation codes

Move all of this to:

```text
Advanced Mode

```

---

# 8. SIMPLE STATUS LANGUAGE

Prefer:

```text
Ready
Waiting
Needs review
Building
Interrupted
Blocked

```

instead of internal status vocabulary where possible.

---

# PART II

# BUILD RELIABILITY

---

# 9. BUILD MUST NOT DEPEND ON ONE LONG HTTP REQUEST

The build must run as a persistent server-side job.

Expected flow:

```text
USER CLICKS BUILD
↓
CREATE JOB
↓
RETURN JOB ID QUICKLY
↓
SERVER CONTINUES BUILD
↓
UI READS JOB STATUS
↓
STAGES PROGRESS
↓
BUILD COMPLETES

```

---

# 10. BUILD STAGES

Track:

```text
RESEARCH
CONTENT
IMAGES
VISUAL_IDENTITY
COMPOSITION
INTERACTIONS
PREVIEW
VALIDATION

```

---

# 11. BUILD JOB STATES

Support:

```text
QUEUED
RUNNING
INTERRUPTED
FAILED
COMPLETED
CANCELLED

```

---

# 12. TIMEOUT

A client/browser timeout must NOT automatically equal:

```text
BUILD FAILED

```

If server processing continues:

show:

```text
The build is still running.
Your progress is saved.

```

---

# 13. REFRESH RECOVERY

If the user refreshes Universe Builder during a running build:

Expected:

```text
Active build found.
Restoring progress...

```

The UI must reconnect to the existing job.

Do not create another build.

---

# 14. NO DUPLICATE BUILD

If Build is clicked while one is already active:

```text
A build is already running.

[ VIEW PROGRESS ]
[ CANCEL ]

```

Do not create another full build.

---

# 15. RESUME

If interrupted:

```text
BUILD INTERRUPTED

Your progress was saved.

[ RESUME BUILD ]

```

Resume from the latest safe incomplete stage.

Example:

```text
Research = READY
Content = PARTIAL
Images = WAITING

```

Resume at:

```text
Content

```

Do not restart Research unnecessarily.

---

# 16. CANCEL

Cancel must:

- stop future stages
- preserve valid persisted work
- not destroy last valid revision
- update the job to CANCELLED
- immediately update UI

---

# PART III

# STATE CONSISTENCY

---

# 17. NEVER MIX REVISIONS

Strictly separate:

```text
CURRENT_BUILD_REVISION
LAST_VALID_REVISION
PREVIEW_REVISION
PUBLISHED_REVISION

```

---

# 18. NO CONTRADICTORY COUNTERS

Never show combinations like:

```text
0 facts
5 pages ready

```

unless the pages are explicitly described as planned/template pages.

---

# 19. PLANNED VS BUILT

Use:

```text
PLANNED
GENERATED
VALIDATED

```

A structural page template is:

```text
PLANNED

```

not:

```text
READY

```

---

# 20. CONTENT WITH ZERO FACTS

Wrong:

```text
CONTENT
Ready

5 pages
0 useful facts

```

Correct:

```text
CONTENT
Waiting for Research

5 pages planned
0 pages filled

```

---

# 21. FACT REVISION LINKING

Fix research persistence completely.

Facts discovered before revision creation must not remain invisible because:

```text
revision_id = NULL

```

Ensure facts are correctly linked to the newly created revision.

Maintain safe fallback via:

```text
build_id

```

where needed.

---

# 22. IMAGES 0/0

Never interpret:

```text
0 / 0

```

as:

```text
ALL IMAGES RESOLVED

```

when Content has not declared visual needs.

Correct state:

```text
Waiting for Content

```

---

# 23. MOTIFS

If Research is incomplete:

```text
VISUAL IDENTITY
Waiting for Research

```

Do not show:

```text
FAILED

```

unless the Motif Engine itself failed.

---

# 24. INTERACTIONS

If Research is incomplete:

```text
INTERACTIONS
Waiting for Research

```

Do not count legacy interactions in this card.

---

# 25. LEGACY INTERACTIONS

Normal mode:

```text
CURRENT I6 CONCEPTS ONLY

```

Advanced Mode:

```text
LEGACY DECLARATIVE INTERACTIONS

```

Never combine both counts.

---

# PART IV

# BUTTON RELIABILITY

---

# 26. ABSOLUTE RULE

No visible button may silently do nothing.

If a button exists:

```text
IT MUST WORK

```

or:

```text
IT MUST BE DISABLED WITH AN EXPLANATION

```

---

# 27. CENTRAL ACTION SYSTEM

Prefer:

```text
data-ub-action

```

with delegated handling.

Example:

```text
data-ub-action="build"
data-ub-action="enhance"
data-ub-action="preview"
data-ub-action="identity-discover"
data-ub-action="interaction-discover"

```

---

# 28. BUTTON CONTRACT

Every button:

```text
CLICK
↓
PRECONDITION
↓
LOADING STATE
↓
SERVICE / API
↓
RESULT
↓
STATE UPDATE
↓
RENDER
↓
SUCCESS / ERROR MESSAGE

```

---

# 29. AUDIT ALL PRIMARY BUTTONS

Verify:

```text
OPEN
BUILD
RESUME
CANCEL
ENHANCE
VIEW PREVIEW
PUBLISH

VIEW CONTENT
RESOLVE IMAGES
DISCOVER IDENTITY
AUTO FIX

GENERATE INTERACTIONS
VIEW SUGGESTIONS

REVIEW AUTHORIZATIONS
SAFE BULK APPROVE

REFRESH PREVIEW
RELOAD DATA
ADVANCED MODE

```

---

# 30. INTERACTION BUTTONS

Verify:

```text
PREVIEW
APPROVE
REBUILD
DISCARD
TEST
EDIT

```

---

# 31. DYNAMIC BUTTONS

Buttons created after asynchronous rendering must work.

Use event delegation or reliable post-render binding.

---

# 32. DUPLICATE IDS

Fail tests if duplicate HTML IDs exist.

---

# 33. OVERLAYS

Audit:

```text
pointer-events
z-index
loading masks
absolute overlays
disabled

```

No invisible element may block user clicks.

---

# 34. IMMEDIATE FEEDBACK

BUILD:

```text
BUILDING...
Starting Research...

```

ENHANCE:

```text
ENHANCING...
Pass 1 of 3

```

INTERACTIONS:

```text
FINDING INTERACTIVE IDEAS...

```

IDENTITY:

```text
DISCOVERING VISUAL IDENTITY...

```

AUTO FIX:

```text
FIXING...

```

---

# PART V

# INTERACTIVE MENU FINALIZATION

---

# 35. PURPOSE

The interactive system must feel like:

```text
RESEARCH
↓
DISCOVER GAME-SPECIFIC INTERACTIVE TOPICS
↓
USER CHOOSES
↓
GENERATE FUNCTIONAL PREVIEW
↓
APPROVE / REBUILD / DISCARD

```

---

# 36. RESEARCH-DRIVEN

Never hard-code interaction lists by game.

Do NOT do:

```text
if Blox Fruits → Roll Fruit

```

Use:

```text
Research
↓
Gameplay concepts
↓
Interaction opportunities
↓
Category
↓
Localized title
↓
Prototype

```

---

# 37. EXAMPLE RESULTS

Possible research-derived results:

Blox Fruits:

```text
Roletar Fruta
Loja de Frutas
Explorar Ilhas

```

Fisch:

```text
Mini game de pesca
Descobrir peixe
Equipamentos

```

DOORS:

```text
Abrir Porta 50
Abrir Porta 100
Descobrir entidades

```

Work at a Pizza Place:

```text
Monte uma pizza
Escolha um trabalho
Prepare um pedido

```

Examples only.

Never hard-code.

---

# 38. INTERACTION SCREEN

Target:

```text
INTERACTIONS

Suggested from Research

Roletar Fruta
[ PREVIEW ]

Loja de Frutas
[ PREVIEW ]

Explorar Ilhas
[ PREVIEW ]

────────────────

Approved

Roletar Fruta
✓ Approved

[ TEST ]

```

---

# 39. INTERACTION PREVIEW

When Preview is clicked:

```text
PREVIEWING

Roletar Fruta

< FUNCTIONAL PROTOTYPE >

[ APPROVE ]
[ REBUILD ]
[ DISCARD ]

```

---

# 40. REBUILD

Rebuild must create a genuinely new iteration.

Preserve concept intent.

Example:

```text
Version 1
Rejected

Version 2
Rejected

Version 3
Approved

```

---

# 41. NO MANUAL PROGRAMMING IN SIMPLE MODE

Normal user must not need:

```text
Element Key
Event
Action
Target
State

```

Keep those in Advanced Mode.

---

# PART VI

# VISUAL IDENTITY

---

# 42. PRESERVE MOTIF ENGINE

Visual Identity must continue working universally.

No game-specific architecture.

---

# 43. REAL-ASSET GROUNDING

Motifs may include:

```text
SYMBOL
ITEM
WEAPON
CHARACTER
CREATURE
VEHICLE
LOCATION
UI_ELEMENT
OBJECT
COLLECTIBLE
PATTERN
FACTION
ABILITY
PROP

```

Specific entity motifs are discovered dynamically.

---

# 44. EXAMPLE

Blox Fruits may discover:

```text
Jolly Roger
Fruit
Sword
Boat
Crew symbol

```

but these names must come from Research.

---

# 45. NO FAKE GAME IDENTITY

Never generate generic fake game art and present it as authentic.

---

# PART VII

# AUTHORIZATION INBOX

---

# 46. PURPOSE

Pending Authorization is the user decision inbox.

It may contain:

```text
CONTENT
IMAGE
VISUAL IDENTITY
INTERACTION
APPEARANCE

```

---

# 47. DO NOT SHOW INTERNAL TASKS

Never include:

```text
Sync variables
Recalculate
Refresh registry
Run migration

```

---

# 48. TARGET UI

```text
PENDING AUTHORIZATION · 4

Main image
3 candidates
[ REVIEW ]

Visual Identity
Jolly Roger
2 candidates
[ REVIEW ]

Interaction
Roletar Fruta
Preview ready
[ PREVIEW ]

```

---

# PART VIII

# ENHANCEMENT

---

# 49. BUTTON

Keep:

```text
ENHANCE

```

in the main toolbar.

---

# 50. VALID BASELINE REQUIRED

Do not run Enhancement over:

```text
0 useful facts
invalid/incomplete base revision

```

Instead:

```text
Complete or resume the build before enhancing.

```

---

# 51. ENHANCEMENT FLOW

```text
ENHANCE UNIVERSE

Research passes

1 2 3 4 5

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

# 52. SMART MODE

Each pass targets remaining weaknesses.

Never repeat identical research N times.

---

# PART IX

# PREVIEW FINALIZATION

---

# 53. PREVIEW MUST TELL THE TRUTH

A Preview can only be:

```text
READY

```

when the current revision is actually previewable.

---

# 54. INVALID REVISION

If:

```text
0 useful facts
Content incomplete
Composition unavailable

```

then:

```text
CURRENT PREVIEW
UNAVAILABLE

```

---

# 55. LAST VALID PREVIEW

If previous valid Preview exists:

```text
Current Preview
Unavailable

Last valid Preview
Available

[ VIEW LAST VALID PREVIEW ]

```

---

# 56. DO NOT SHOW PLACEHOLDER AS READY

Do not present:

```text
No verified content in this section yet.

```

inside something labeled:

```text
READY

```

---

# 57. SAME RENDERER

Preview and published Universe must continue using the same fundamental renderer.

---

# PART X

# ROOT-CAUSE BLOCKERS

---

# 58. NORMAL MODE

Do not flood user with downstream blockers.

If:

```text
Research incomplete

```

causes:

```text
No images
No motifs
No interactions
No composition
Low visual score

```

show:

```text
MAIN PROBLEM

Research did not finish successfully.

This is preventing:
- Content
- Images
- Visual Identity
- Interactions
- Appearance

[ RESUME ]

```

---

# 59. ADVANCED MODE

Keep all detailed raw blockers there.

---

# PART XI

# LOCALIZATION

---

# 60. NORMAL MODE

All normal-mode copy must respect:

```text
pt-BR
en-US
es-ES

```

---

# 61. NO ENGLISH LEAK IN PT-BR

Wrong:

```text
No verified content in this section yet.

```

Correct:

```text
Ainda não há conteúdo verificado nesta seção.

```

---

# 62. TECHNICAL TEXT

Raw technical diagnostics may remain in English under Advanced Mode.

---

# PART XII

# PERFORMANCE

---

# 63. FINAL PERFORMANCE RULE

Do NOT make the Builder heavier while fixing it.

---

# 64. POLLING

Use one bounded poller per active build.

Stop polling on:

```text
COMPLETED
FAILED
CANCELLED

```

---

# 65. LISTENERS

Do not accumulate duplicate event listeners after rerenders.

---

# 66. PREVIEW

Only load selected interaction Preview.

Do not render all prototypes simultaneously.

---

# 67. ADVANCED

Remain lazy-loaded.

---

# PART XIII

# RELEASE ACCEPTANCE TEST

---

# 68. PRIMARY FINAL TEST — BLOX FRUITS

This is the primary release acceptance entity.

Run:

```text
Blox Fruits
FULL BUILD
pt-BR

```

---

# 69. EXPECTED PIPELINE

Must successfully progress through:

```text
RESEARCH
↓
CONTENT
↓
IMAGES
↓
VISUAL IDENTITY
↓
COMPOSITION
↓
INTERACTIONS
↓
PREVIEW
↓
VALIDATION

```

---

# 70. BLOX FRUITS RESEARCH

Require:

```text
> 0 useful validated facts

```

No boilerplate-only success.

---

# 71. BLOX FRUITS CONTENT

Require:

```text
pages built from real research

```

not only placeholders.

---

# 72. BLOX FRUITS IMAGES

Must declare actual visual needs.

No:

```text
0 / 0

```

false success.

---

# 73. BLOX FRUITS IDENTITY

Motif Engine must execute.

Expected architecture may discover motifs such as:

```text
Fruit
Jolly Roger
Sword
Boat
Island
UI details

```

Exact output may vary.

---

# 74. BLOX FRUITS INTERACTIONS

Interaction discovery must execute.

Expected architecture may produce concepts such as:

```text
Roletar Fruta
Loja de Frutas
Explorar Ilhas

```

Exact wording/output may vary.

---

# 75. BLOX FRUITS PREVIEW

At least one discovered interaction must support:

```text
PREVIEW
REBUILD
APPROVE
DISCARD

```

---

# 76. BUTTON WALKTHROUGH

Manually or via reliable E2E automation test:

```text
Open
Build
Cancel
Resume
Enhance
Preview
Discover Identity
Generate Suggestions
Review
Approve
Rebuild
Discard
Refresh Preview
Advanced

```

No dead control.

---

# PART XIV

# SECOND FINAL TEST

---

# 77. SECOND ENTITY

After Blox Fruits passes, test one structurally different entity.

Preferred:

```text
DOORS

```

or:

```text
Minecraft

```

Do not spend time testing every catalog entry before launch.

---

# 78. SECOND TEST PURPOSE

Confirm that:

- Interaction Discovery is not Blox Fruits-specific
- Motif Discovery is not Blox Fruits-specific
- Research pipeline generalizes
- Builder state remains consistent
- Preview works

---

# PART XV

# BUTTON CONTRACT TEST SUITE

---

# 79. REQUIRED

Run:

```text
OPEN_BUTTON
BUILD_BUTTON
RESUME_BUTTON
CANCEL_BUTTON
ENHANCE_BUTTON
PREVIEW_BUTTON
AUTO_FIX_BUTTON
IMAGE_RESOLVE_BUTTON
IDENTITY_DISCOVERY_BUTTON
INTERACTION_DISCOVERY_BUTTON
AUTHORIZATION_REVIEW_BUTTON
SAFE_BULK_APPROVE_BUTTON
PREVIEW_REFRESH_BUTTON
ADVANCED_MODE_BUTTON

```

---

# 80. INTERACTIVE BUTTONS

Run:

```text
INTERACTION_PREVIEW
INTERACTION_APPROVE
INTERACTION_REBUILD
INTERACTION_DISCARD

```

---

# 81. VERIFY

Each must verify:

```text
element exists
correct state
click received
dispatcher receives action
handler exists
precondition checked
loading state shown
request/service executed
response handled
UI updated
error handled

```

---

# PART XVI

# REGRESSION

---

# 82. REQUIRED HISTORICAL REGRESSIONS

Run:

```text
I6 HF1
I6
I5
I4
I3
I2
I1
Beta 0.99
HF1
HF1.1

```

Update historical version assertions only where necessary to recognize the successor release.

Do NOT weaken behavioral tests.

---

# 83. CHECK

Run syntax/static validation over all JS/MJS.

---

# PART XVII

# BUG POLICY

---

# 84. DO NOT CHASE NON-BLOCKING POLISH

If an issue:

- does not break build
- does not break Preview
- does not break publication
- does not break buttons
- does not corrupt data
- does not cause severe performance problems

it may remain as a documented post-launch issue.

---

# 85. MUST FIX BEFORE RELEASE

Must fix:

```text
dead buttons
build corruption
lost progress
wrong revision mixing
false READY
false publication state
broken Preview
broken interaction Preview
broken Approve/Rebuild
critical console/runtime errors
major performance lockups

```

---

# PART XVIII

# NO NEW FEATURE RULE

---

# 86. IF A NEW IDEA APPEARS

Do NOT implement it now.

Register it as:

```text
POST-BETA-0.99

```

or backlog.

---

# 87. EXAMPLES

Do not add now:

```text
new Social redesign
new Admin layout
new AI agent
new image architecture
new game categories
new profile systems
new appearance themes
new interaction categories unless required by current engine

```

---

# PART XIX

# FINAL RELEASE UI

---

# 88. TARGET

Normal user experience should approximately feel like:

```text
GAMEINDEX · Beta 0.99

UNIVERSE BUILDER

Blox Fruits
Experience

[ BUILD ]
[ ENHANCE ]
[ PREVIEW ]
[ PUBLISH ]

────────────────────

CONTENT
✓ Ready
68 useful facts
5 pages

IMAGES
✓ 9 / 9

VISUAL IDENTITY
✓ 16 motifs

APPEARANCE
✓ Good

INTERACTIONS
3 suggestions
1 approved

[ VIEW SUGGESTIONS ]

PENDING AUTHORIZATION
3

[ REVIEW ]

────────────────────

PREVIEW

Desktop | Tablet | Mobile

< REAL CURRENT PAGE >

────────────────────

PUBLICATION

Ready
or
Needs 2 decisions

```

---

# PART XX

# FAILURE UX

---

# 89. IF RESEARCH FAILS

Show:

```text
BUILD INTERRUPTED

Research could not finish.

Your progress was saved.

[ RESUME ]

```

Dependent stages:

```text
Content
Waiting for Research

Images
Waiting for Content

Visual Identity
Waiting for Research

Interactions
Waiting for Research

Preview
Unavailable for current revision

```

---

# 90. NEVER SHOW AGAIN

Do not produce states like:

```text
Research PARTIAL
0 facts
Content READY
5 pages
Images FAILED
0/0
Preview READY

```

for the same current revision.

---

# PART XXI

# FINAL PACKAGING

---

# 91. DELIVER

Create:

```text
GameIndex Beta 0.99 I6 HF1 FULL

```

and:

```text
GameIndex Beta 0.99 I6 HF1 UPDATE_ONLY

```

---

# 92. UPDATE BASELINE

UPDATE\_ONLY applies over:

```text
verified GameIndex Beta 0.99 I6 FULL

```

---

# 93. EXACT TREE EQUIVALENCE

Require:

```text
I6 FULL
+
HF1 UPDATE_ONLY
=
HF1 FULL

```

with:

```text
0 missing
0 extra
0 different

```

---

# 94. ZIP VALIDATION

Extract both ZIPs.

Run at minimum:

```text
syntax check
HF1 tests
I6 regression

```

on extracted packages.

---

# 95. HASHES

Generate SHA-256 for:

```text
FULL
UPDATE_ONLY

```

---

# PART XXII

# DELIVERY REPORT

---

# 96. FINAL REPORT MUST INCLUDE

```text
Internal version
Public version

Schema version

Files added
Files modified
Files removed

Build reliability status
Button reliability status
Preview consistency status
Interaction menu status
Visual Identity status
Enhancement status
Authorization status

Regression results

FULL ↔ UPDATE_ONLY equivalence

SHA-256

Known non-blocking limitations

```

---

# PART XXIII

# RELEASE DECISION

---

# 97. RELEASE GATE

GameIndex Beta 0.99 is READY FOR RELEASE only if:

```text
Blox Fruits full build completes or safely recovers
Buttons work
State is coherent
Preview is truthful
Interaction Preview works
Approve/Rebuild works
No critical runtime error
No major performance freeze
Regression suite passes
Packages validate

```

---

# 98. DO NOT BLOCK RELEASE FOR

Do not block release only because:

```text
a game has fewer motifs than ideal
interaction suggestions could be richer
visual score is not perfect
some Advanced diagnostics remain ugly
minor UI spacing is imperfect

```

provided core functionality is reliable.

---

# PART XXIV

# FINAL PRIORITY PRINCIPLES

```text
WORKING > NEW

```

```text
RELIABLE > CLEVER

```

```text
NO DEAD BUTTONS

```

```text
NO FALSE READY

```

```text
NO REVISION MIXING

```

```text
NO LOST BUILDS

```

```text
NO NEW FEATURES BEFORE LAUNCH

```

```text
PREVIEW MUST REPRESENT REAL STATE

```

```text
INTERACTIONS MUST BE TESTABLE BEFORE APPROVAL

```

```text
IF REJECTED, REBUILD THE SAME CONCEPT

```

```text
MOTIFS COME FROM THE GAME
NOT FROM HARDCODED TEMPLATES

```

```text
SIMPLE MODE FOR USERS
ADVANCED MODE FOR TECHNICAL DETAILS

```

---

# 99. EXECUTION STRATEGY

Do not perform broad speculative refactors.

Use this order:

```text
1. Fix dead buttons
2. Fix persistent build / resume
3. Fix current revision state
4. Fix Preview validity
5. Verify Interaction Discovery
6. Verify Interaction Preview / Rebuild / Approve
7. Verify Visual Identity
8. Verify Authorization
9. Verify Enhance
10. Run Blox Fruits end-to-end
11. Run second entity
12. Run regressions
13. Package
14. Release

```

If one stage fails:

```text
FIX THE FAILURE
RE-RUN ITS TEST
CONTINUE

```

Do not restart unrelated architecture.

---

# 100. FINAL OBJECTIVE

This is not the time to make GameIndex larger.

This is the time to make GameIndex work.

By the end of this sprint, the user must be able to open Universe Builder, choose a Game or Experience, click Build, see real progress, recover from interruption, receive researched content, images, Visual Identity motifs and interactive suggestions, test interactions in Preview, approve or rebuild them, resolve pending decisions, view the actual final Preview and publish.

No major button should fail.

No current revision should display contradictory data.

No client timeout should destroy the build.

No invalid revision should pretend its Preview is ready.

No interaction should require the user to manually program technical schemas.

No additional large feature should be introduced before release.

The release target is:

# A SMALLER NUMBER OF WORKING SYSTEMS IS BETTER THAN A LARGER NUMBER OF UNFINISHED SYSTEMS.

And the final launch rule is:

# FINISH GAMEINDEX BETA 0.99. FREEZE IT. TEST IT. PUBLISH IT.