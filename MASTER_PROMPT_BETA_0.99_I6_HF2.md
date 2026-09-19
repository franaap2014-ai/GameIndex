# GAMEINDEX — BETA 0.99 I6 HF2

## LAUNCH VISUAL REBRAND

## APPEARANCE TRANSITION CUTSCENES

## CLASSIFICATION BRANDING

## AUTOMATIC PROFILE IMAGES

## TEMPORARY MAKER PRESENTATION CREDITS

## FINAL PRE-LAUNCH HOTFIX

---

# 1. MISSION

Create the final visual hotfix for GameIndex Beta 0.99 before launch.

Internal release:

```text
0.99-I6-HF2

```

Public release:

```text
Beta 0.99

```

This is NOT I7.

This is NOT a new architecture cycle.

This is a small, visual, launch-focused hotfix built on top of the verified:

```text
GameIndex Beta 0.99 I6 HF1

```

HF1 must remain functionally intact.

---

# 2. TIME LIMIT

The implementation must be designed for approximately:

```text
2 HOURS MAXIMUM

```

Prioritize visible impact over architectural ambition.

Do not start anything that cannot reasonably be completed, tested and packaged inside this window.

---

# 3. HARD SCOPE FREEZE

Do NOT change:

- Universe Builder architecture
- persistent build jobs
- Research pipeline
- Image Resolver architecture
- Interaction Engine architecture
- database ownership model
- authentication architecture
- Social architecture
- Admin architecture
- Music architecture
- APIs unrelated to this hotfix
- publication architecture
- core routing
- storage architecture

Do not add a new large database migration unless absolutely necessary.

Prefer:

```text
NO SCHEMA CHANGE

```

if possible.

---

# 4. HF2 PRIORITIES

Strict priority:

```text
P0 — DO NOT BREAK HF1
P0 — THE SITE MUST STILL LOAD FAST
P0 — APPEARANCE SWITCH MUST ALWAYS COMPLETE

P1 — VISUAL REBRAND
P1 — APPEARANCE CUTSCENE
P1 — CLASSIFICATION-SPECIFIC LOGOS
P1 — AUTOMATIC PROFILE IMAGES

P2 — TEMPORARY MAKER CREDITS
P2 — SMALL VISUAL POLISH

```

---

# PART I

# VISUAL REBRAND

---

# 5. DESIGN DIRECTION

GameIndex should visually move away from:

```text
generic gaming dashboard
generic neon gaming site
blue-purple sci-fi stereotype

```

and toward:

```text
INTERACTIVE GAME WIKI
+
DIGITAL GAME INDEX
+
PREMIUM INTERACTIVE ARCHIVE

```

The visual identity should feel:

- organized
- interactive
- game-focused
- modern
- polished
- recognizable
- information-rich
- less generic
- more editorial
- more like a living interactive wiki

---

# 6. REBRAND PRINCIPLE

The interface should visually support the GameIndex idea:

```text
DISCOVER
INDEX
EXPLORE
READ
INTERACT

```

Do not turn it into a flashy effects demo.

The content must remain the focus.

---

# 7. VISUAL IMPROVEMENTS

Within the existing structure, improve:

- header
- navigation
- cards
- content hierarchy
- spacing
- borders
- hover states
- focus states
- buttons
- surfaces
- section separation
- profile presentation
- appearance selector
- theme identity
- loading states
- empty states

---

# 8. DEPTH

Use subtle depth through:

- layered surfaces
- soft borders
- restrained shadows
- background layers
- subtle gradients
- controlled accent lighting

Avoid excessive glow.

---

# 9. DO NOT MAKE THE SITE HEAVY

Do NOT add:

- autoplay background videos
- huge texture files
- large WebGL scenes
- heavy particle engines
- unnecessary canvas render loops
- massive animation libraries

Prefer:

```text
CSS
DOM
existing assets
small SVG
small raster assets

```

---

# PART II

# APPEARANCE SWITCH CUTSCENE

---

# 10. MAIN FEATURE

Switching the GameIndex Appearance must trigger a short visual cutscene.

The cutscene should communicate:

```text
OLD SYSTEM POWERING DOWN
↓
NEW THEME CONNECTING
↓
NEW SYSTEM POWERING UP

```

---

# 11. EXACT TRANSITION IDEA

The sequence should approximately be:

```text
CURRENT THEME
↓
SHORT FLASH IN CURRENT THEME COLOR
↓
SCREEN / UI POWERS DOWN
↓
NEW COLOR WIRES BEGIN TO RISE
↓
WIRES TRAVEL THROUGH THE SCREEN
↓
WIRES CONNECT INTO VISUAL PLUGS / NODES
↓
CONNECTION COMPLETE
↓
NEW THEME COLOR ACTIVATES
↓
GAMEINDEX LIGHTS BACK UP
↓
NEW APPEARANCE IS ACTIVE

```

---

# 12. FIRST FLASH

When Appearance changes:

Use a very short flash based on the CURRENT appearance accent.

Example:

```text
CURRENT ACCENT FLASH
80–180 ms

```

Do not make it uncomfortable or excessively bright.

---

# 13. POWER DOWN

After the flash:

The current interface should quickly dim.

Possible behavior:

```text
brightness decreases
accent lighting turns off
major surfaces darken

```

Keep this extremely short.

---

# 14. WIRES

Then display several thin animated wires/lines using the NEW appearance accent color.

The wires should:

- originate near the bottom or edges
- move upward
- have slightly different paths
- look technological
- remain elegant
- not cover important content for too long

---

# 15. PLUGS / CONNECTION NODES

The wires should connect to several visual plugs/nodes.

Possible positions:

```text
header
navigation
main content frame
profile area
footer

```

Do NOT alter actual layout structure just to support the animation.

These plugs are purely visual.

---

# 16. CONNECTION EFFECT

When a wire reaches its target:

```text
small pulse
↓
plug activates
↓
corresponding UI area gains the new accent

```

This creates the illusion that the new Appearance is being connected to the site.

---

# 17. FINAL POWER-UP

After the final connection:

```text
NEW THEME FLASH / PULSE
↓
INTERFACE RETURNS TO FULL BRIGHTNESS
↓
NEW LOGO APPEARS
↓
CUTSCENE ENDS

```

---

# 18. LENGTH

Target cutscene duration:

```text
~1.2 to 2.2 seconds

```

Do NOT create a long cinematic interruption.

---

# 19. NEVER BLOCK THE USER

The transition system MUST contain a safety timeout.

Example:

```text
MAX_TRANSITION_DURATION = 2500ms

```

If animation fails:

```text
apply new appearance immediately
remove overlay
restore interaction

```

The user must never become stuck behind the cutscene.

---

# 20. RAPID THEME SWITCHING

If the user selects another Appearance while a transition is already running:

Do NOT stack multiple cutscenes.

Use:

```text
LATEST SELECTION WINS

```

or safely complete/cancel the existing transition before starting the next.

---

# 21. REDUCED MOTION

Respect:

```css
prefers-reduced-motion

```

For reduced motion:

Use a very short fade instead of the full wire cutscene.

---

# 22. MUTE

Appearance cutscene must respect the existing GameIndex:

```text
MUTE

```

If the transition later uses a sound:

MUTE must disable it.

Do not require sound for the cutscene.

For HF2, visual-only is acceptable and preferred.

---

# PART III

# THEME + CLASSIFICATION IDENTITY

---

# 23. IMPORTANT DISTINCTION

Separate:

```text
APPEARANCE

```

from:

```text
USER CLASSIFICATION / PLAN / STATUS

```

Appearance determines the site's selected visual theme.

Classification determines the user's persistent GameIndex identity.

---

# 24. CLASSIFICATION MUST PERSIST

Example:

A PRO user may choose:

```text
Default
Creator
Dark
another appearance

```

but remains:

```text
PRO

```

The classification logo identity must not disappear merely because Appearance changes.

---

# PART IV

# GAMEINDEX LOGO SYSTEM

---

# 25. LOGO REBRAND

Create a flexible GameIndex logo system instead of one fixed logo.

Every classification can have its own GameIndex logo variant.

However:

```text
ALL VARIANTS MUST CLEARLY BELONG TO THE SAME BRAND

```

Do not make them feel like unrelated brands.

---

# 26. CORE WORDMARK

Primary structure:

```text
GAME INDEX

```

or existing accepted GameIndex typography depending on implementation constraints.

Keep the brand recognizable.

---

# 27. CLASSIFICATION LINE

For classified accounts, support a secondary centered classification marker.

Concept:

```text
GAME INDEX
──── PRO ────

```

or:

```text
GAME INDEX
─── CREATOR ───

```

The classification appears visually between divider lines.

---

# 28. FREE USERS

Free users should NOT display a classification subtitle.

Example:

```text
GAME INDEX

```

No:

```text
FREE

```

below it.

---

# 29. FREE LOGO

The Free identity should be intentionally simpler.

Direction:

```text
BLACK
WHITE
NEUTRAL
MINIMAL

```

It should still look polished.

Do not intentionally make it ugly.

The idea is:

```text
simple base identity

```

not:

```text
punishment for free users

```

---

# 30. PRO LOGO

PRO should have a distinctive persistent identity.

Primary classification color:

```text
GREEN

```

Example:

```text
GAME INDEX
──── PRO ────

```

Use a refined green.

Avoid aggressive fluorescent green unless the current design specifically requires it.

---

# 31. PRO + DIFFERENT APPEARANCE

Critical behavior:

If a PRO user changes Appearance:

```text
PRO classification remains
PRO logo remains identifiable
PRO green identity remains present

```

The selected Appearance can modify:

- background
- surfaces
- additional accents
- effects
- supporting colors

But it must not erase the PRO classification identity.

---

# 32. CREATOR

Preserve the existing Creator visual direction.

Creator currently uses:

```text
RED DETAILS
GOLD DETAILS
SUBTLE TECHNOLOGICAL GOLD EFFECTS

```

Create a matching GameIndex Creator logo variant.

Example:

```text
GAME INDEX
── CREATOR ──

```

Do not overuse gold.

---

# 33. FUTURE CLASSIFICATIONS

Do not hard-code the logo architecture exclusively around Free/PRO/Creator.

Create a small classification logo resolver.

Conceptually:

```js
classificationBrand = {
  FREE: {...},
  PRO: {...},
  CREATOR: {...}
}

```

Future classifications should be easy to add.

---

# 34. LOGO FALLBACK

If a classification does not have a custom logo:

Use the default GameIndex logo.

Never show:

- broken image
- missing logo
- empty header
- raw classification key

---

# 35. APPEARANCE CUTSCENE + LOGO

The logo should participate in the final activation.

Sequence:

```text
WIRES CONNECT
↓
NEW APPEARANCE ACTIVATES
↓
CORRECT CLASSIFICATION LOGO RESOLVES
↓
LOGO FADES / POWERS IN

```

---

# PART V

# LOGO ASSET STRATEGY

---

# 36. DO NOT REQUIRE MANY HEAVY IMAGES

Prefer:

- SVG variants
- CSS-adjustable logo parts
- lightweight transparent PNGs only where needed

Avoid huge assets.

---

# 37. LOGO RESOLUTION

Create a centralized resolver.

Example concept:

```text
resolveGameIndexBrand({
  classification,
  appearance
})

```

Return:

```text
logo
classification
primary color
secondary color
variant

```

---

# 38. IMPORTANT

Classification should have higher priority than Appearance for brand identity.

Concept:

```text
CLASSIFICATION
=
WHO THE USER IS

APPEARANCE
=
HOW THE SITE CURRENTLY LOOKS

```

---

# PART VI

# AUTOMATIC PROFILE IMAGES

---

# 39. PURPOSE

Avoid empty, generic or broken profile images.

If a user has no custom profile picture:

GameIndex should automatically provide one.

---

# 40. DO NOT USE GENERATED AI REQUESTS AT RUNTIME

Do NOT call an external image-generation API every time a user is created or loads the site.

This HF2 must remain:

```text
LOCAL-FIRST
FAST
NO API KEY REQUIRED

```

---

# 41. AUTOMATIC AVATAR SYSTEM

Prefer a deterministic avatar generator.

Possible ingredients:

```text
initials
geometric shapes
GameIndex symbols
classification colors
appearance accents
simple procedural backgrounds

```

---

# 42. DETERMINISTIC

The same user should normally receive the same auto-avatar.

Use a stable input such as:

```text
user ID
username
profile seed

```

Do not randomly change avatar every reload.

---

# 43. EXAMPLE

Free:

```text
black / white
simple geometric icon

```

PRO:

```text
PRO green
slightly richer framing

```

Creator:

```text
red + restrained gold
creator framing

```

---

# 44. USER CUSTOM IMAGE

If the user already has a custom profile image:

```text
CUSTOM IMAGE WINS

```

Do not overwrite it.

---

# 45. FALLBACK

If avatar generation fails:

Use a safe default GameIndex avatar.

Never display broken-image UI.

---

# PART VII

# ABOUT / DESCRIPTION

---

# 46. DO NOT DUPLICATE EXISTING SYSTEM

The GameIndex project already contains:

- brief description
- About information
- game metadata

Do NOT create another duplicate About/summary feature in HF2.

Preserve the existing implementation.

Only visually improve it if necessary as part of the rebrand.

---

# PART VIII

# TEMPORARY PRESENTATION CREDITS

---

# 47. PRESENTATION-ONLY CHANGE

For the Maker presentation, temporarily replace the current Credits content.

The visible Credits section must become exactly:

```text
Criado por

Francisco, Murilo, Victor, Samuel Fernandes e Alberto

Criado para a aula de Maker

```

---

# 48. IMPORTANT

Do not add insults, contribution rankings or commentary.

Only display the names and presentation context.

---

# 49. TEMPORARY MARKER

In source code, clearly mark this as temporary.

Example:

```js
// TEMPORARY_LAUNCH_PRESENTATION_CREDITS
// Remove or replace after Maker presentation.

```

or equivalent.

---

# 50. DO NOT EXPOSE MARKER

The temporary-development marker must not appear in normal user UI.

---

# PART IX

# VISUAL COMPONENT REBRAND

---

# 51. HEADER

Improve the header so the GameIndex brand feels more prominent.

Include:

- correct classification logo
- coherent navigation
- profile identity
- Appearance access
- MUTE access if currently located there

Avoid making the header excessively tall.

---

# 52. CARDS

Cards should feel like interactive wiki modules.

Improve:

```text
title hierarchy
metadata
hover
borders
spacing
status indicators

```

Do not add excessive animation to every card.

---

# 53. BUTTONS

Buttons should feel more intentional.

Support states:

```text
DEFAULT
HOVER
ACTIVE
FOCUS
DISABLED
LOADING

```

---

# 54. NAVIGATION

Improve active navigation clarity.

The user should always understand:

```text
WHERE AM I?

```

---

# 55. PROFILES

Profile surfaces should display:

- avatar
- name
- classification when applicable
- classification branding

Do not expose raw role/status keys.

---

# PART X

# PERFORMANCE

---

# 56. PERFORMANCE BUDGET

The HF2 rebrand must not noticeably increase startup time.

The appearance cutscene assets should be lightweight.

---

# 57. ANIMATION PERFORMANCE

Prefer animating:

```text
transform
opacity
filter when limited

```

Avoid repeatedly animating expensive layout properties.

---

# 58. NO LISTENER LEAKS

Appearance switching may happen repeatedly.

Ensure:

```text
NO DUPLICATE LISTENERS
NO STACKED TIMERS
NO ORPHAN OVERLAYS
NO ACCUMULATING DOM NODES

```

---

# 59. CLEANUP

Every cutscene must clean up after itself.

Remove:

```text
wire elements
overlay
temporary plugs
timers
transition classes

```

after completion.

---

# PART XI

# SAFETY / FALLBACKS

---

# 60. CUTSCENE FAILURE

If the effect throws or fails:

```text
APPLY THE APPEARANCE ANYWAY

```

Visual transition failure must never prevent theme change.

---

# 61. LOGO FAILURE

If custom classification logo fails:

```text
DEFAULT GAMEINDEX LOGO

```

---

# 62. AVATAR FAILURE

If auto avatar fails:

```text
DEFAULT PROFILE IMAGE

```

---

# 63. CSS FAILURE

Do not make base readability depend on advanced effects.

Text must remain readable without animation.

---

# PART XII

# RESPONSIVENESS

---

# 64. DESKTOP

Full wire cutscene can be used.

---

# 65. TABLET

Reduce number of animated wires if needed.

---

# 66. MOBILE

Keep cutscene simpler.

Example:

```text
flash
2–3 wires
connections
power-up

```

Do not cover the screen for too long.

---

# PART XIII

# ACCESSIBILITY

---

# 67. CONTRAST

All logo/classification variants must maintain usable contrast.

---

# 68. KEYBOARD

Appearance selection remains keyboard accessible.

---

# 69. FOCUS

Do not remove visible focus indication.

---

# 70. REDUCED MOTION

Mandatory fallback:

```text
short crossfade

```

instead of wire animation.

---

# PART XIV

# CLASSIFICATION BRAND MODEL

---

# 71. FREE

Visual identity:

```text
BLACK
WHITE
MINIMAL
CLEAN

```

Logo:

```text
GAME INDEX

```

No subtitle.

---

# 72. PRO

Visual identity:

```text
GREEN
PREMIUM
REFINED

```

Logo:

```text
GAME INDEX
──── PRO ────

```

---

# 73. CREATOR

Visual identity:

```text
RED
GOLD
SUBTLE TECH DETAILS

```

Logo:

```text
GAME INDEX
── CREATOR ──

```

---

# 74. DO NOT USE CLASSIFICATION TO BREAK THEMES

A classification must complement Appearance, not completely overwrite it.

Example:

```text
PRO + CREATOR APPEARANCE

```

can use:

```text
Creator surfaces
+
persistent PRO green brand marker
+
PRO logo/classification

```

---

# PART XV

# APPEARANCE ENGINE CONTRACT

---

# 75. TARGET FLOW

```text
USER SELECTS APPEARANCE
↓
VALIDATE APPEARANCE
↓
LOCK TRANSITION INPUT
↓
CURRENT COLOR FLASH
↓
POWER DOWN
↓
LOAD NEW APPEARANCE VARIABLES
↓
ANIMATE NEW COLOR WIRES
↓
CONNECT PLUGS
↓
RESOLVE CLASSIFICATION BRAND
↓
POWER UP
↓
SAVE APPEARANCE
↓
UNLOCK INPUT
↓
CLEAN TEMPORARY DOM

```

---

# 76. PERSISTENCE

The Appearance selected before reload must still be active after reload.

Do not regress existing persistence.

---

# 77. NO CUTSCENE ON EVERY LOAD

Do NOT replay the full cutscene every time the page reloads.

Use it primarily when the user actively changes Appearance.

Initial page load may use a simple fade.

---

# PART XVI

# TEMPORARY PRESENTATION MODE

---

# 78. PRESENTATION FLAG

If useful, create a tiny configuration flag such as:

```text
MAKER_PRESENTATION_MODE = true

```

Only if it simplifies temporary behavior.

Do not create a large feature-flag architecture.

---

# 79. PRESENTATION MODE MAY CONTROL

Only small presentation-specific things such as:

```text
temporary Credits copy

```

Do not make the entire site dependent on it.

---

# PART XVII

# DO NOT TOUCH HF1

---

# 80. CRITICAL REGRESSION RULE

The following HF1 systems are frozen:

```text
persistent Universe builds
resume
cancel
build state consistency
Research fact revision linking
Preview validity
current vs last-valid revision
Interaction Preview
Approve / Rebuild / Discard
authorization
publication gate

```

Do not refactor these systems for the visual rebrand.

---

# PART XVIII

# TEST PLAN

---

# 81. APPEARANCE TEST

Test:

```text
Default → Creator
Creator → Default
Default → another available appearance
rapid repeated switching
reload after changing appearance

```

Verify:

```text
correct appearance
correct classification
correct logo
no frozen overlay
no duplicate cutscenes

```

---

# 82. FREE TEST

Free user:

```text
simple black/white GameIndex brand
no FREE subtitle
automatic avatar if no custom picture

```

---

# 83. PRO TEST

PRO user:

```text
green classification identity
GAME INDEX
──── PRO ────

```

Change Appearance.

Verify:

```text
PRO classification remains
PRO logo remains
new Appearance still applies

```

---

# 84. CREATOR TEST

Creator identity:

Verify:

```text
red/gold details
classification branding
logo variant
cutscene uses selected Appearance correctly

```

---

# 85. PROFILE TEST

Test:

```text
user without avatar
user with custom avatar

```

Expected:

```text
without → automatic deterministic avatar
with → existing custom image preserved

```

---

# 86. CUTSCENE FAILURE TEST

Artificially force transition failure.

Expected:

```text
new Appearance still applies
overlay disappears
site remains usable

```

---

# 87. REDUCED MOTION TEST

With:

```text
prefers-reduced-motion: reduce

```

Expected:

```text
no full wire cutscene
short safe transition

```

---

# PART XIX

# EXISTING REGRESSION

---

# 88. REQUIRED

At minimum run:

```text
HF2 tests
HF1 tests
I6 regression
static JS/MJS check

```

If time permits, retain the full historical regression chain already used by HF1.

---

# 89. DO NOT WEAKEN TESTS

Version-identity assertions may be updated to recognize HF2 as the successor.

Do not remove behavioral assertions merely to get green tests.

---

# PART XX

# PACKAGE

---

# 90. INTERNAL VERSION

Use:

```text
0.99-I6-HF2

```

---

# 91. PUBLIC VERSION

Remain:

```text
Beta 0.99

```

---

# 92. DELIVER

Create:

```text
GameIndex Beta 0.99 I6 HF2 FULL

```

and:

```text
GameIndex Beta 0.99 I6 HF2 UPDATE_ONLY

```

---

# 93. BASELINE

UPDATE\_ONLY should preferably apply over:

```text
GameIndex Beta 0.99 I6 HF1 FULL

```

because HF2 is an incremental launch hotfix.

---

# 94. EQUIVALENCE

Require:

```text
HF1 FULL
+
HF2 UPDATE_ONLY
=
HF2 FULL

```

with:

```text
0 missing
0 extra
0 different

```

---

# 95. SHA-256

Generate hashes for both packages.

---

# PART XXI

# PRIORITY IF TIME RUNS SHORT

---

# 96. TWO-HOUR FALLBACK ORDER

If time becomes critical:

Finish in this exact order:

```text
1. TEMPORARY MAKER CREDITS

2. CLASSIFICATION LOGO RESOLVER

3. FREE / PRO / CREATOR LOGO STATES

4. APPEARANCE SWITCH CUTSCENE

5. AUTOMATIC PROFILE AVATAR

6. HEADER / CARD VISUAL REBRAND

7. EXTRA POLISH

```

---

# 97. WHAT MAY BE CUT

If necessary, reduce:

```text
number of animated wires
number of logo variants
extra decorative effects
complex avatar artwork
micro-animations

```

---

# 98. WHAT MAY NOT BE CUT

Do not cut:

```text
theme switch reliability
classification persistence
logo fallback
cutscene timeout
reduced-motion fallback
HF1 regression
Credits change

```

---

# PART XXII

# FINAL VISUAL EXPERIENCE

---

# 99. TARGET FEEL

After HF2, GameIndex should feel less like:

```text
A PROJECT WITH MANY FEATURES

```

and more like:

```text
A REAL PRODUCT WITH A COHERENT IDENTITY

```

---

# 100. FINAL APPEARANCE EXPERIENCE

The intended moment is:

```text
USER OPENS APPEARANCE

SELECTS NEW THEME

CURRENT COLOR FLASHES

GAMEINDEX POWERS DOWN

NEW COLOR WIRES RISE

THEY CONNECT TO THE SITE

NEW COLOR FLOWS THROUGH THE UI

THE CORRECT GAMEINDEX CLASSIFICATION LOGO ACTIVATES

THE SITE POWERS BACK ON

THE NEW APPEARANCE IS LIVE

```

---

# 101. BRAND RULE

GameIndex should have one brand system with multiple identities.

Not:

```text
different unrelated logos

```

but:

```text
ONE GAMEINDEX BRAND
+
CLASSIFICATION VARIANTS
+
APPEARANCE VARIANTS

```

---

# 102. FREE PRINCIPLE

Free:

```text
simple
black and white
clean
no classification subtitle

```

---

# 103. PRO PRINCIPLE

PRO:

```text
green identity
premium treatment
classification always visible

```

even when Appearance changes.

---

# 104. CREATOR PRINCIPLE

Creator:

```text
red + restrained gold
technology-inspired details
creator classification

```

---

# 105. PROFILE PRINCIPLE

No profile should look unfinished only because the user has not uploaded an image.

Use a deterministic GameIndex-generated avatar.

---

# 106. PRESENTATION PRINCIPLE

For the Maker presentation, Credits display:

```text
Criado por

Francisco, Murilo, Victor, Samuel Fernandes e Alberto

Criado para a aula de Maker

```

This is temporary and must be easy to remove afterward.

---

# 107. FINAL RULES

```text
DO NOT CREATE I7

```

```text
DO NOT TOUCH STABLE HF1 ARCHITECTURE

```

```text
DO NOT MAKE THE SITE HEAVIER

```

```text
DO NOT LET THE CUTSCENE BLOCK THE SITE

```

```text
CLASSIFICATION PERSISTS ACROSS APPEARANCES

```

```text
APPEARANCE CHANGES THE SITE
CLASSIFICATION IDENTIFIES THE USER

```

```text
FREE HAS NO CLASSIFICATION SUBTITLE

```

```text
PRO KEEPS ITS GREEN BRAND IDENTITY

```

```text
AUTOMATIC AVATARS MUST BE FAST AND LOCAL

```

```text
ONE GAMEINDEX BRAND
MANY COHERENT VARIANTS

```

---

# 108. FINAL OBJECTIVE

Complete a visually meaningful pre-launch rebrand without destabilizing GameIndex.

The site must retain all HF1 functionality while gaining:

- a stronger interactive-wiki identity
- a cleaner and more intentional visual system
- classification-aware GameIndex logos
- Free / PRO / Creator brand variants
- a cinematic but lightweight Appearance transition
- wire-to-plug theme activation
- automatic profile images
- temporary Maker presentation Credits

The result should feel significantly more polished at first glance while remaining technically almost the same underneath.

The implementation mindset is:

# MAXIMUM VISUAL IMPACT.

# MINIMUM ARCHITECTURAL RISK.

# FINISH WITHIN THE LAUNCH WINDOW.