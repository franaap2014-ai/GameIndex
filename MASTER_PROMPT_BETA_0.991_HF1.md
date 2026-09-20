# GAME INDEX — MASTER IMPLEMENTATION PROMPT
# BETA 0.991 HF1
# ORIGINAL UI RESTORATION + ADMIN PANEL RECOVERY + CINEMATIC IDENTITY SYSTEM + THEME POWER CUTSCENE REWORK + UNIVERSE BUILDER V3

You are modifying the existing Game Index Beta 0.991 project.

This is a real continuation of the existing Game Index codebase.

DO NOT rebuild Game Index from scratch.
DO NOT create a simplified replacement.
DO NOT remove working systems merely because they are complex.
DO NOT downgrade the project to an older technical version.
DO NOT replace existing architecture with mocks.
DO NOT optimize the scope down.
DO NOT shorten the implementation because of time.
DO NOT skip systems because they are difficult.
DO NOT make a "minimal version" of what is described here.

There is NO TIME LIMIT for this implementation.

Take as much implementation time as necessary.

The purpose of this MASTER prompt is to define the complete behavior expected from Beta 0.991 HF1.

Read the entire repository before making architectural decisions.

The current Beta 0.991 codebase is the technical foundation.

The older Game Index 0.99 I6 interface is the visual reference.

The final result must combine:

GAME INDEX BETA 0.991 TECHNICAL SYSTEMS
+
GAME INDEX 0.99 I6 ORIGINAL INTERFACE
+
RESTORED ADMIN PANEL
+
NEW CINEMATIC SYSTEM
+
IMPROVED THEME-CHANGE POWER CUTSCENE
+
DRASTICALLY IMPROVED UNIVERSE BUILDER
+
CURRENT ONLINE / RENDER-COMPATIBLE ARCHITECTURE

The most important principle of this update is:

THE OLD GAME INDEX INTERFACE RETURNS,
BUT THE MODERN GAME INDEX SYSTEMS REMAIN.

The update must feel like the original Game Index evolved forward.

It must NOT feel like Beta 0.991 was visually replaced by an unrelated rebrand.

======================================================================
SECTION 1 — VERSION AND RELEASE GOAL
======================================================================

Target release:

GAME INDEX BETA 0.991 HF1

This is a major corrective hotfix for Beta 0.991.

Beta 0.991 introduced or preserved major technical improvements, but several important problems now need correction:

1. The visual rebrand changed the identity of Game Index too much.
2. The desired interface is the original Game Index interface from 0.99 I6.
3. Important Admin Panel navigation/menu functionality disappeared.
4. The theme-change electrical cutscene does not physically connect its plug correctly.
5. Game Index needs a real reusable cinematic system.
6. Every account needs a first-login Welcome cinematic.
7. PRO, Tester, Dev and Creator each need their own cinematic identity introduction.
8. Existing accounts must receive the new cinematics after the update.
9. The Universe Builder needs a drastic improvement and must become a serious editor/production environment rather than a sequence of disconnected cards.
10. The current system must continue functioning correctly in an online environment such as Render.
11. Existing Beta 0.991 systems must not regress.

Do not treat this as a cosmetic-only patch.

This update affects:

- shell
- interface
- navigation
- Admin
- appearance
- themes
- cinematics
- account identity presentation
- persistent user event state
- Universe Builder
- Builder orchestration
- live preview
- manual editing
- recovery systems
- Creative Director integration
- validation
- responsive behavior
- production deployment compatibility

======================================================================
SECTION 2 — REPOSITORY AUDIT BEFORE IMPLEMENTATION
======================================================================

Before making modifications, deeply inspect the current Beta 0.991 repository.

Do not assume how a system works from filenames alone.

Trace the actual runtime.

At minimum inspect:

- package.json
- package-lock.json
- server.mjs
- current startup commands
- current production start behavior
- public/
- public/index.html
- public/settings.html
- public/admin.html
- public/universe-builder.html
- public/profile.html
- public/profile-settings.html
- public/social.html
- public/subscriptions.html
- public/creator-control.html
- public/tester-lab.html
- public/ai-control.html
- public/ai-flow.html
- public/database-explorer.html
- public/deployment-monitor.html
- public/release-contract-auditor.html
- public/css/
- public/js/
- src/
- src/access/
- src/admin/
- src/auth/
- src/database/
- src/database/repositories/
- src/themes/
- src/users/
- src/subscriptions/
- src/universe/
- src/interactions/
- src/research/
- src/images/
- src/music/
- src/runtime/
- src/social/
- src/studio/
- tests/
- migrations
- release documentation
- historical version notes

Specifically trace:

- shell initialization
- header construction
- navigation construction
- role/capability-based navigation
- Admin menu generation
- theme state
- theme switching
- current 0.991 theme cutscene
- authentication
- session persistence
- user identity state
- subscription state
- Tester state
- Dev state
- Creator state
- capability resolution
- existing account setup
- first admin setup
- Builder state persistence
- Universe generation
- image generation/search
- visual grounding
- production pipeline
- Creative Director
- interaction generation
- preview rendering
- publish state

Important current/historical files may include systems such as:

public/js/shell-0986.js
public/js/gameindex-0991.js
public/js/settings.js
public/js/admin.js
public/js/universe-builder.js
public/css/gameindex-0986.css
public/css/gameindex-0991.css

src/access/capability-service.mjs
src/admin/*
src/auth/*
src/themes/theme-service.mjs
src/subscriptions/subscription-service.mjs
src/universe/universe-builder-v2.mjs
src/universe/universe-builder-099.mjs
src/universe/universe-builder-experience-099i6.mjs
src/universe/creative-director-099i2.mjs
src/universe/creative-director-099i3.mjs
src/universe/universe-production-pipeline-099i4.mjs
src/universe/universe-production-pipeline-099i5.mjs
src/universe/validation-099i4.mjs
src/universe/validation-099i5.mjs
src/universe/visual-grounding-validation-099i3.mjs
src/interactions/universe-interaction-service.mjs

Do not assume these names are the only implementation locations.

Trace imports and API routes.

======================================================================
SECTION 3 — HISTORICAL INTERFACE REFERENCE
======================================================================

The desired visual identity is:

GAME INDEX 0.99 I6

The interface from this period is the target.

The user does NOT want the later visual rebrand.

This is not a request to make the current interface "similar" to the old one.

The goal is to restore the actual visual language of the old Game Index.

Restore the original interface characteristics as faithfully as possible.

This includes, where applicable:

- main header
- header proportions
- navigation positioning
- navigation style
- sidebar behavior
- menu structure
- visual density
- panel appearance
- page framing
- cards
- typography hierarchy
- spacing
- buttons
- controls
- borders
- shadows
- surfaces
- page backgrounds
- menu transitions
- status elements
- profile elements
- settings appearance
- Admin appearance
- Creator areas
- Tester areas
- system areas
- desktop navigation
- responsive navigation
- old Game Index identity

Do NOT interpret "restore old interface" as only:

- changing colors
- changing the logo
- changing border radius

The entire UI language must return.

======================================================================
SECTION 4 — IMPORTANT REBRAND HISTORY
======================================================================

The historical package named around:

0.99 I6 HF2
LAUNCH VISUAL REBRAND

contains the visual rebrand.

That rebrand is NOT the desired target.

It can be used as evidence to determine which files and components were changed during the rebrand.

The implementation must determine:

WHAT THE HF2 REBRAND CHANGED

and then restore the interface that existed before those visual changes.

Do not blindly copy the HF2 shell.

Do not accidentally preserve the rejected rebrand simply because it exists in a historical package.

When historical versions conflict:

VISUAL REFERENCE:
0.99 I6 ORIGINAL INTERFACE

TECHNICAL REFERENCE:
CURRENT 0.991

======================================================================
SECTION 5 — DO NOT DOWNGRADE BETA 0.991
======================================================================

The visual rollback must not become a technical rollback.

Preserve the working systems introduced between I6 and 0.991.

This includes, where currently functional:

- current authentication
- current account system
- profiles
- public profiles
- Social
- follows
- interests
- activity
- Creator systems
- Tester systems
- Dev systems
- PRO subscription systems
- AI systems
- AI Control
- AI Flow
- construction systems
- search systems
- research systems
- source adapters
- image systems
- image library
- image editing/cropping systems
- music systems
- game media
- current database
- current migrations
- current APIs
- current security
- current rate limiting
- current recovery systems
- current Builder backend
- Universe production pipelines
- visual grounding
- interaction engine
- game experience systems
- performance improvements
- responsive improvements
- localization
- release contract systems
- bug tracker
- deployment systems
- current game page systems

The model should think:

0.991 ENGINE
INSIDE
0.99 I6 BODY

======================================================================
SECTION 6 — ADMIN PANEL MUST BE RESTORED
======================================================================

Beta 0.991 currently has a regression where important Admin Panel menus are no longer visible or accessible through the normal interface.

Restore the Admin Panel navigation.

Do not simply add random links.

Restore the intended organization.

The Admin Panel should once again expose its major areas.

Expected top-level areas include:

OVERVIEW

USERS

CONTENT

SOCIAL

SYSTEM

BUGS

ADVANCED

The exact wording may use the existing localization system.

The navigation must be complete and usable.

The Advanced area should provide access to appropriate existing internal systems such as:

- Database Explorer
- AI Control
- AI Flow
- Release Contract
- Tester Lab
- Creator Control
- Deployment Monitor

Use the actual existing routes.

Do not duplicate existing tools.

Do not create fake placeholder tools.

======================================================================
SECTION 7 — ADMIN SECURITY MUST NOT BE WEAKENED
======================================================================

Restoring the menus does NOT mean exposing everything publicly.

Preserve capability checks.

Sensitive systems must still require the correct capability.

Examples may include:

admin
creator_control
dev
tester controls
database access
deployment access
AI control

Use the repository's real capability definitions.

Frontend menu hiding alone must never be treated as security.

Server-side APIs must continue verifying authorization.

If the UI disappeared because a capability check is wrong, fix the capability/UI mapping.

Do NOT solve the issue by simply returning true for all users.

======================================================================
SECTION 8 — HOSTING-INDEPENDENT PRODUCT LANGUAGE
======================================================================

Game Index was previously running on Azure.

The current project is now being deployed through GitHub + Render.

Game Index should not present itself as being permanently tied to Azure.

Any user-facing instruction such as:

"Configure this in Azure"

must be reviewed.

If the actual requirement is an environment variable, say:

Environment Variable

not Azure.

If the actual requirement is a deployment environment, say:

Deployment Environment

not Azure.

Similarly:

Do not replace all Azure references with Render references.

The application should remain provider-neutral.

It should be possible to run Game Index on:

- Render
- Azure
- local Node environment
- another compatible Node host

without rewriting user-facing messages.

======================================================================
SECTION 9 — CURRENT THEME CUTSCENE PROBLEM
======================================================================

Game Index currently has a cutscene used when the user changes the visual theme.

The concept should remain.

However, the physical animation is wrong.

CURRENT BEHAVIOR:

The cable comes from the left side.

The plug slides toward the socket.

The plug does not convincingly touch/connect to the outlet.

The cable movement feels artificial.

The cable/plug/outlet geometry does not create the impression of a real electrical connection.

The plug currently appears to move horizontally rather than being connected by a believable cable path.

This must be redesigned.

======================================================================
SECTION 10 — NEW THEME POWER CUTSCENE
======================================================================

The new cable must originate BELOW the screen.

Not from the left.

The visual composition should work like this:

A power outlet/connection target exists above the lower cable entry point.

The cable originates outside the viewport underneath the screen.

It rises vertically.

As it approaches the height of the socket:

the cable curves.

It bends naturally toward the outlet.

The final portion becomes horizontally aligned with the plug.

The plug remains physically attached to the cable.

The cable must look continuous.

Do not create:

one vertical rectangle
+
one horizontal rectangle
+
a disconnected plug

and call it a cable.

The curve must visually connect the segments.

Use:

- CSS border radius
- SVG path
- pseudo-elements
- transform geometry
- another lightweight technique

if necessary.

The important part is visual continuity.

======================================================================
SECTION 11 — REAL PLUG INSERTION
======================================================================

The plug must ACTUALLY appear to connect.

This is important.

Before implementation, inspect:

- outlet hole positions
- plug pin positions
- plug orientation
- socket orientation
- scaling
- perspective
- alignment

Make them geometrically compatible.

The plug pins and socket holes must align.

The animation must include a final insertion phase.

For example:

APPROACH
↓
ALIGN
↓
INSERT

During INSERT:

the visible length of the electrical pins should decrease as they enter the socket.

At full connection:

the plug body should reach or nearly reach the socket body.

The viewer should believe the plug is physically connected.

Do not stop the plug several pixels away from the socket.

Do not trigger the theme power-up while the plug is still disconnected.

======================================================================
SECTION 12 — THEME CUTSCENE ORDER
======================================================================

Expected sequence:

1. User chooses a theme.
2. Current Game Index interface begins losing power.
3. Current screen becomes dark.
4. Existing power state shuts down.
5. Cable begins rising from below.
6. Cable bends toward the outlet.
7. Plug approaches the outlet.
8. Plug aligns with the outlet.
9. Plug inserts.
10. Physical connection becomes complete.
11. New theme becomes internally ready.
12. Electrical/power pulse occurs.
13. The new theme starts powering the interface.
14. UI lighting returns.
15. Game Index becomes fully visible in the new theme.
16. Cutscene layer is removed cleanly.

The new theme must not visibly appear before step 11/12.

======================================================================
SECTION 13 — MOBILE THEME CUTSCENE
======================================================================

The cutscene must work responsively.

Desktop:
full animation.

Tablet:
scaled animation.

Mobile:
compact animation.

But the conceptual choreography remains the same.

DO NOT use:

desktop = cable from below
mobile = old cable from left

That is not acceptable.

On small screens:

- shorten travel distance
- scale outlet
- scale plug
- scale cable thickness
- adjust bend position
- reposition composition

while preserving the cable coming from below.

======================================================================
SECTION 14 — REDUCED MOTION
======================================================================

Respect:

prefers-reduced-motion

Do not completely remove meaning.

For reduced motion:

- use shorter fades
- show power-off
- show connection state
- apply theme
- show power-on

without long physical motion.

Do not leave a user staring at a blank black screen.

======================================================================
SECTION 15 — CUTSCENE FAILURE SAFETY
======================================================================

The theme cutscene must never permanently block the UI.

Handle:

- animationend missing
- transitionend missing
- JS exception
- route navigation
- page visibility changes
- user refresh
- slow browser
- mobile interruption

Use a safety timeout.

Always have cleanup logic.

Never leave:

body locked
pointer events disabled
black overlay visible
focus trapped

after a failure.

======================================================================
SECTION 16 — NEW GAME INDEX CINEMATIC ENGINE
======================================================================

Beta 0.991 HF1 must introduce a reusable cinematic system.

Do not write five completely independent systems for:

Welcome
PRO
Tester
Dev
Creator

Create a reusable architecture.

Conceptually something like:

Cinematic Manager

with:

- event definition
- eligibility
- persistent seen state
- queue
- playback
- theme application
- cleanup
- reduced motion behavior
- completion recording

The exact architecture should follow the repository style.

Do not force a class-based architecture if the project uses services/modules.

======================================================================
SECTION 17 — UNIVERSAL WELCOME CINEMATIC
======================================================================

Every user gets a Welcome cinematic.

Text:

BEM-VINDO

Use localized equivalent according to the user's language if localization is active.

For example:

PT-BR:
BEM-VINDO

EN-US:
WELCOME

ES:
appropriate localized equivalent

The visual behavior is similar to the special identity cinematics but neutral.

======================================================================
SECTION 18 — WELCOME CINEMATIC VISUAL SEQUENCE
======================================================================

Sequence:

1. Normal Game Index screen is visible.
2. A circular closing transition begins.
3. The visible world closes into a circle.
4. Circle closes completely.
5. Screen becomes fully black.
6. "BEM-VINDO" appears in the center.
7. The text does not simply fade in.
8. It must look like a light/sign turning ON.
9. Subtle Game Index visual details rise from below.
10. The details remain elegant and not excessively noisy.
11. The Welcome moment holds briefly.
12. The text loses power.
13. It looks like a light turning OFF.
14. The decorative details descend.
15. They disappear below.
16. The circular iris starts opening.
17. Game Index returns.
18. Cinematic completes.

"Turning off" should NOT simply mean:

opacity 1 → opacity 0

It should visually feel like a powered light going out.

Possible techniques include:

- glow reduction
- brightness drop
- tiny light flicker
- bloom collapse
- brief illumination decay

Use good judgment.

Do not create aggressive flashing.

======================================================================
SECTION 19 — WHO GETS THE WELCOME CINEMATIC
======================================================================

NEW ACCOUNTS:

Every newly created account gets the Welcome cinematic on its first proper Game Index entry.

EXISTING ACCOUNTS:

Every account that existed before Beta 0.991 HF1 also gets the Welcome cinematic ONCE after the update.

This is intentional.

Even old accounts should experience the new introduction.

After it has completed successfully:

do not show it every login.

======================================================================
SECTION 20 — GAME INDEX ACCOUNT IDENTITY MODEL
======================================================================

The cinematic system must understand the actual Game Index progression model.

Important:

PRO is NOT the same type of thing as Tester/Dev/Creator.

PRO is a paid account status/tier.

FREE is the normal basic account.

PRO is essentially a FREE account with paid advantages.

However, Game Index progression includes identities whose benefits already contain previous levels.

Important user-defined logic:

DEV already has the benefits/buffs of:

FREE
+
PRO
+
TESTER
+
DEV

Therefore:

A DEV user is simply presented as DEV.

They are NOT presented as:

PRO + TESTER + DEV

They should not receive all lower cinematics.

======================================================================
SECTION 21 — PRIMARY ACCOUNT IDENTITIES
======================================================================

The cinematic identities are:

FREE

PRO

TESTER

DEV

CREATOR

FREE has no special identity cinematic beyond the universal Welcome cinematic.

PRO has its own cinematic.

TESTER has its own cinematic.

DEV has its own cinematic.

CREATOR has its own cinematic.

Do not visually stack inherited lower statuses.

======================================================================
SECTION 22 — PRO DEFINITION
======================================================================

PRO is a paid account status.

It is not a developer function.

It is not an administrative role.

PRO should remain tied to the subscription/account-tier system.

PRO color:

GREEN

PRO has:

- universal Welcome cinematic when appropriate
- PRO cinematic when first becoming PRO or when first receiving the new update as an existing PRO user
- PRO theme applied after the PRO cinematic

Do not call PRO a development role internally if the architecture can cleanly distinguish it.

======================================================================
SECTION 23 — TESTER DEFINITION
======================================================================

TESTER is a Game Index function.

Tester users receive the appropriate benefits already defined by the existing project.

Do not redesign Tester permissions unless required to correct a bug.

Tester visual identity:

BLUE

Tester cinematic:

TESTER

After the cinematic:

apply Tester theme automatically.

A Tester should not separately receive PRO cinematic merely because Tester already includes the benefits intended from lower access.

======================================================================
SECTION 24 — DEV DEFINITION
======================================================================

DEV is a higher function.

DEV includes the intended benefits of:

FREE
PRO
TESTER
DEV

But the user is visually identified simply as:

DEV

DEV color:

RED

DEV cinematic:

DEV

Do NOT play:

PRO cinematic
then TESTER cinematic
then DEV cinematic

for a DEV account.

Only DEV.

======================================================================
SECTION 25 — CREATOR DEFINITION
======================================================================

CREATOR is its own special Game Index function/identity.

Creator color:

GOLD

Creator cinematic:

CREATOR

Creator must use the existing Creator capability model as the technical source of truth.

Do not arbitrarily rewrite Creator inheritance if the repository already has explicit behavior.

Preserve working Creator access.

Creator receives:

Welcome when applicable
then
Creator cinematic

No unnecessary lower identity cinematics.

======================================================================
SECTION 26 — SPECIAL IDENTITY CINEMATIC VISUAL LANGUAGE
======================================================================

The PRO, Tester, Dev and Creator cinematics share the same overall language.

They must still feel individually themed.

Base sequence:

1. Existing Game Index screen visible.
2. Circular iris begins closing.
3. Screen closes completely.
4. Background becomes black.
5. Identity name appears in center.
6. Identity name uses identity color.
7. Name LIGHTS ON.
8. Decorative details of that same identity color rise from below.
9. Identity presentation holds.
10. Name LIGHTS OFF.
11. Decorative details descend.
12. Screen remains black momentarily.
13. Theme transition completes.
14. Circular iris opens.
15. Game Index is now visible using the new identity theme.

======================================================================
SECTION 27 — IDENTITY COLORS
======================================================================

PRO:
GREEN

TESTER:
BLUE

DEV:
RED

CREATOR:
GOLD

Do not use completely unrelated colors.

The exact shade should integrate with the restored Game Index I6 interface.

The colors should behave as accent identities.

Do not replace the entire UI structure.

======================================================================
SECTION 28 — DECORATIVE CINEMATIC ELEMENTS
======================================================================

The user described:

"details of the main color of the theme rise on the screen"

Interpret this as controlled identity details.

Possible forms:

- thin illuminated lines
- geometric fragments
- technological bars
- small energy traces
- subtle vertical accent structures
- minimal particles where appropriate
- angular UI fragments

They rise upward during activation.

Later they descend.

They should feel like Game Index UI technology.

Do not turn the sequence into:

- fireworks
- giant particle explosions
- excessive neon
- random gaming montage
- generic esports animation

Keep it coherent with Game Index.

======================================================================
SECTION 29 — LIGHT-ON / LIGHT-OFF EFFECT
======================================================================

This behavior is mandatory.

The identity text should feel electrically powered.

LIGHT ON:

black
↓
tiny energy activation
↓
colored illumination
↓
glow reaches stable state

LIGHT OFF:

stable illumination
↓
power loss
↓
glow collapses
↓
text darkens
↓
black

Do not use a plain default fade as the only effect.

Avoid dangerous flashing frequencies.

======================================================================
SECTION 30 — EXISTING USERS AFTER THE UPDATE
======================================================================

Users who existed before this update must receive the new cinematic experience.

Rules:

EXISTING FREE USER:

WELCOME

EXISTING PRO USER:

WELCOME
then
PRO

EXISTING TESTER USER:

WELCOME
then
TESTER

EXISTING DEV USER:

WELCOME
then
DEV

EXISTING CREATOR USER:

WELCOME
then
CREATOR

Important:

No inherited lower cinematic chain.

A DEV does NOT see:

WELCOME
PRO
TESTER
DEV

A DEV sees:

WELCOME
DEV

======================================================================
SECTION 31 — NEW USERS AFTER THE UPDATE
======================================================================

A new normal account:

WELCOME

If that account later becomes PRO:

PRO cinematic

If that account later becomes Tester:

TESTER cinematic

If later Dev:

DEV cinematic

If assigned Creator:

CREATOR cinematic

If a special identity is already assigned before the account's first proper Game Index session, queue:

WELCOME
then
the current primary special identity cinematic

======================================================================
SECTION 32 — PROMOTION / STATUS CHANGE CINEMATICS
======================================================================

When an account changes later:

FREE → PRO

show:
PRO

PRO → TESTER

show:
TESTER

TESTER → DEV

show:
DEV

Assignment to Creator:

show:
CREATOR

Do not replay Welcome because of a promotion.

Welcome is first-entry/update onboarding.

Identity cinematics correspond to new identity eligibility.

======================================================================
SECTION 33 — IDENTITY THEME APPLICATION
======================================================================

After each special identity cinematic:

apply its matching appearance automatically.

PRO:
green theme

TESTER:
blue theme

DEV:
red theme

CREATOR:
gold theme

The automatic theme change should happen as part of the cinematic transition.

The user should open out of the circular transition and see the new identity appearance already active.

======================================================================
SECTION 34 — MANUAL THEME CONTROL REMAINS
======================================================================

Automatic identity themes are an introduction.

They must not destroy the existing Appearance system.

Afterward, the user may still manually choose themes where existing Game Index rules allow it.

Do not permanently lock every user to their identity color unless the current product logic already requires that.

The cinematic establishes identity.

The Appearance system still exists.

======================================================================
SECTION 35 — CINEMATIC PERSISTENCE MUST BE ACCOUNT-BASED
======================================================================

Do NOT rely only on:

localStorage
sessionStorage
browser cookies

for "seen" state.

These cinematics belong to the account.

If the user logs in from another browser after already completing a cinematic, it should remain completed.

Persist cinematic events server-side.

======================================================================
SECTION 36 — GENERIC CINEMATIC EVENT STORAGE
======================================================================

Prefer a generic event architecture instead of adding one database boolean column for every future cinematic.

Example event IDs:

welcome_0991_hf1
pro_intro_v1
tester_intro_v1
dev_intro_v1
creator_intro_v1

Possible future IDs:

update_intro_0992
anniversary_2027
creator_upgrade_v2
new_builder_intro
special_launch_event

Suggested data concepts:

user_id
event_key
eligible_at
started_at
completed_at
status
version

Exact schema should match current database conventions.

Do not duplicate records.

Use unique constraints/idempotency where appropriate.

======================================================================
SECTION 37 — CINEMATIC QUEUE
======================================================================

Implement a real queue.

Example:

Old Dev logs in after update.

Eligible events:

welcome_0991_hf1
dev_intro_v1

Queue:

1. Welcome
2. Dev

Play Welcome.

Complete it.

Short transition.

Play Dev.

Complete it.

Return to application.

No overlap.

No two fullscreen cinematic overlays at the same time.

======================================================================
SECTION 38 — CINEMATIC INTERRUPTION RULES
======================================================================

If a cinematic begins but cannot complete due to:

refresh
browser close
network loss
navigation interruption
JavaScript failure

do not create an infinite replay loop.

Distinguish if useful between:

eligible
started
completed

But only mark permanently seen after a valid completion or a deliberate safe recovery state.

Use reasonable idempotent recovery.

======================================================================
SECTION 39 — REPLAY POSSIBILITY / FUTURE ARCHITECTURE
======================================================================

Structure the cinematic engine so that future Game Index versions can expose a "Cinematics" or "Moments" gallery.

You do NOT necessarily have to build a full replay gallery in this release unless it integrates naturally.

However:

do not architect the new cinematic engine in a way that makes replay impossible later.

The system should support:

play event
play preview
play account-triggered cinematic

with clear separation from persistent completion tracking.

======================================================================
SECTION 40 — UNIVERSE BUILDER V3 GOAL
======================================================================

Universe Builder needs a DRASTIC improvement.

Do not interpret this as:

- nicer buttons
- new border radius
- moving existing cards
- recoloring the page

The Builder must become a real creation environment.

The current architecture already has several powerful backend systems.

The problem is that the experience does not sufficiently expose the power of those systems.

Beta 0.991 HF1 should introduce:

UNIVERSE BUILDER V3

V3 is primarily:

BETTER ORCHESTRATION
+
BETTER EDITOR
+
BETTER VISIBILITY
+
BETTER AUTOMATION
+
BETTER MANUAL CONTROL

not a replacement of all Builder engines.

======================================================================
SECTION 41 — PRESERVE EXISTING BUILDER ENGINES
======================================================================

Do not throw away systems such as:

Universe Builder V2
Universe Builder experience
Creative Director
Universe Production Pipeline
Visual Grounding
Validation
Interaction Engine
Research
Image systems
Content generation
Game experience generation

Reuse them.

Refactor only where necessary.

The objective is to make these systems behave like one coherent Builder.

======================================================================
SECTION 42 — CURRENT BUILDER EXPERIENCE PROBLEM
======================================================================

The current Builder feels too much like:

step
card
step
card
button
result
another tool
another panel

The user should instead feel:

"I am inside the universe and building it."

The Builder should become persistent, spatial and interactive.

======================================================================
SECTION 43 — UNIVERSE BUILDER V3 DESKTOP WORKSPACE
======================================================================

Primary desktop layout:

LEFT PANEL:
UNIVERSE TREE

CENTER:
LIVE EXPERIENCE PREVIEW / EDITOR

RIGHT PANEL:
CONTEXTUAL INSPECTOR

This layout should fill the useful workspace.

Do not make the user scroll through a huge vertical list to reach the preview.

======================================================================
SECTION 44 — LEFT PANEL: UNIVERSE TREE
======================================================================

The left panel represents the real content structure.

Example only:

GAME
├── Overview
├── Story
├── Characters
│   ├── Character A
│   ├── Character B
│   └── Character C
├── World
├── Locations
├── Mechanics
├── Items
├── Enemies
└── Additional generated sections

Do NOT hardcode this exact tree.

Use actual generated universe/page/section structure.

The tree should reflect the project.

Each item may show:

- title
- type icon
- status
- warning
- image issue
- source issue
- user-edited lock
- generation status
- unpublished modification

Clicking an item updates the center preview and right inspector.

======================================================================
SECTION 45 — TREE ACTIONS
======================================================================

Where technically safe, allow:

- select
- rename
- create
- duplicate
- hide
- unhide
- reorder
- regenerate
- delete

Deletion must have confirmation for meaningful content.

Do not permit destructive accidental actions.

======================================================================
SECTION 46 — CENTER: LIVE PREVIEW
======================================================================

The center of Universe Builder should show the actual generated Game Index experience.

Not a crude placeholder.

The user should see the real page/section design.

Changes should appear with minimal friction.

Support viewport modes:

DESKTOP

TABLET

MOBILE

The user should be able to inspect how the generated experience works in each layout.

======================================================================
SECTION 47 — DIRECT SELECTION IN LIVE PREVIEW
======================================================================

Where feasible:

clicking an element in the preview should select the corresponding Builder component.

Examples:

click hero
→ Hero selected

click image
→ Image inspector

click text section
→ Content inspector

click interactive component
→ Interaction inspector

The user should not need to identify everything through internal IDs.

======================================================================
SECTION 48 — RIGHT PANEL: CONTEXTUAL INSPECTOR
======================================================================

The Inspector changes based on selected object.

Possible sections/tabs:

CONTENT

IMAGE

LAYOUT

IDENTITY

INTERACTIONS

SOURCES

QUALITY

Do not always show every control.

Context matters.

======================================================================
SECTION 49 — CONTENT INSPECTOR
======================================================================

For text/content components, provide useful controls such as:

- edit title
- edit subtitle
- edit body
- regenerate
- expand
- shorten
- source review
- lock manual edit
- allow automatic changes
- content state
- validation state

Do not expose hidden AI chain-of-thought.

======================================================================
SECTION 50 — IMAGE INSPECTOR
======================================================================

For image components:

- current image
- image source
- image relevance
- replace image
- search alternative
- use generated alternative if supported
- crop/reposition
- visual grounding state
- image warnings
- duplicate-use warning
- lock image
- allow automatic replacement

Use existing image systems.

======================================================================
SECTION 51 — LAYOUT INSPECTOR
======================================================================

Allow layout adjustments supported by the current page architecture.

Examples:

- section variant
- alignment
- media position
- density
- emphasis
- visibility
- responsive behavior
- order

Do not expose controls that the runtime cannot actually support.

======================================================================
SECTION 52 — INTERACTION INSPECTOR
======================================================================

For interactive components:

- interaction type
- state
- preview
- regenerate
- remove
- replace
- configure
- validation
- mobile behavior

Use the existing interaction engine.

======================================================================
SECTION 53 — BUILD PIPELINE MUST BE VISIBLE
======================================================================

When building a universe, users should understand what is happening.

Expose high-level stages.

Possible stages:

RESEARCHING

STRUCTURING

WRITING

FINDING IMAGES

BUILDING VISUAL IDENTITY

BUILDING INTERACTIONS

VALIDATING

READY

Use actual system state.

Do not fake progress.

======================================================================
SECTION 54 — STRUCTURED LIVE BUILD STATUS
======================================================================

Useful progress messages:

"Searching sources..."

"18 sources found"

"7 content sections structured"

"Writing section 4 of 7"

"Resolving images 18 / 23"

"Creating interaction 3 / 6"

"Checking mobile layout"

"Validating visual identity"

"2 decisions require your input"

These are acceptable.

Do NOT expose:

private reasoning
hidden chain-of-thought
raw internal AI deliberation

======================================================================
SECTION 55 — BUILDER SHOULD FEEL ALIVE
======================================================================

During a build, the workspace should progressively populate.

Example:

tree begins empty
↓
sections appear
↓
content fills
↓
preview improves
↓
images resolve
↓
interactions activate
↓
validation finishes

Do not necessarily force users to wait for an all-or-nothing final response before seeing anything.

Use the current architecture where feasible.

======================================================================
SECTION 56 — AUTO-RECOVERY SYSTEM
======================================================================

The Builder must become more autonomous when something fails.

Example:

Primary image search fails.

Do not immediately stop and say:

"Image not found."

Instead:

Attempt 1:
primary search

Attempt 2:
query variation

Attempt 3:
alternative trusted source

Attempt 4:
different image discovery strategy

Attempt 5:
generated/fallback strategy where appropriate and allowed

Validate result.

Only then escalate if unresolved.

======================================================================
SECTION 57 — AUTO-RECOVERY MUST APPLY TO MORE THAN IMAGES
======================================================================

Where safe, use recovery for:

- image search
- page structure generation
- interaction generation
- source retrieval
- missing metadata
- visual grounding
- layout validation
- recoverable Builder jobs

Do not automatically "fix" genuine factual conflicts by inventing data.

======================================================================
SECTION 58 — NEEDS YOU CENTER
======================================================================

Create a clear system for unresolved decisions.

Name may be localized.

Concept:

NEEDS YOU

Example:

3 decisions need you

IMAGE
Two strong image candidates exist.
[Review]

SOURCE CONFLICT
Two sources disagree on this detail.
[Review]

INTERACTION
This content can become an interactive timeline.
[Review]

MISSING INPUT
A decision cannot be safely automated.
[Resolve]

The Builder should handle routine work itself.

Only meaningful choices should interrupt the user.

======================================================================
SECTION 59 — NEEDS YOU PRIORITY
======================================================================

Categorize appropriately.

Examples:

BLOCKING
must resolve before publish

RECOMMENDED
quality improvement

OPTIONAL
creative enhancement

Do not create dozens of fake warnings.

======================================================================
SECTION 60 — CREATIVE DIRECTOR MUST BECOME VISIBLE
======================================================================

The project already contains Creative Director systems.

The user should actually feel their value.

Create a visible Creative Director recommendation surface inside Universe Builder.

Examples:

"This section repeats the same image several times."

Action:
Find alternatives

"This page has weak visual balance."

Action:
Improve composition

"This content is suited to a timeline."

Action:
Create timeline

"This section lacks interaction."

Action:
Generate interaction

"This area is visually empty."

Action:
Improve visual composition

Do not expose chain-of-thought.

Only show:

finding
reason summary
recommended action

======================================================================
SECTION 61 — CREATIVE DIRECTOR ACTIONS
======================================================================

Recommendations should be actionable.

Avoid useless text-only advice.

If the Builder can safely perform the change:

offer:

APPLY

or

PREVIEW CHANGE

When appropriate:

APPLY ALL SAFE IMPROVEMENTS

But never silently overwrite important manual edits.

======================================================================
SECTION 62 — MANUAL EDITING MUST BE FIRST CLASS
======================================================================

The Builder must not be only automatic.

The user should be able to directly edit.

Actions may include:

EDIT TEXT

REPLACE IMAGE

REORDER SECTION

HIDE

DUPLICATE

REGENERATE

CHANGE LAYOUT

ADD INTERACTION

REMOVE INTERACTION

REFRESH SOURCES

REBUILD VISUALS

======================================================================
SECTION 63 — PROTECT MANUAL EDITS
======================================================================

This is critical.

When the user manually edits content:

the system must know.

Do not let the next automatic Builder pass silently overwrite the work.

Use a state concept such as:

user_modified
locked
protected_from_auto

Exact naming should match architecture.

Allow explicit user control:

ALLOW AUTOMATIC CHANGES

LOCK MY VERSION

======================================================================
SECTION 64 — REGENERATION GRANULARITY
======================================================================

Do not force the user to rebuild the entire universe just to fix one section.

Support targeted actions where possible:

Regenerate text only.

Regenerate image only.

Regenerate this section.

Regenerate interaction.

Rebuild this page.

Full rebuild should be separate and clearly destructive.

======================================================================
SECTION 65 — HISTORY SYSTEM
======================================================================

Universe Builder needs useful history.

Record meaningful checkpoints.

Examples:

INITIAL BUILD

IMAGE REFRESH

CREATIVE DIRECTOR IMPROVEMENT

MANUAL EDIT

INTERACTION UPDATE

LAYOUT CHANGE

PUBLISH PREPARATION

Do not create useless snapshots for every mouse click.

======================================================================
SECTION 66 — UNDO / RESTORE
======================================================================

Where feasible provide:

UNDO

REDO

RESTORE SNAPSHOT

Before destructive operations:

create appropriate recoverable state.

Do not unnecessarily duplicate entire huge projects if the repository can store deltas efficiently.

Choose an architecture appropriate to the current database.

======================================================================
SECTION 67 — BEFORE / AFTER IMPROVEMENT VIEW
======================================================================

When a major automated improvement runs:

show what changed.

Example:

BEFORE

Images:
14

Interactions:
2

Unresolved decisions:
8

AFTER

Images:
22

Interactions:
7

Unresolved decisions:
2

Also identify which sections were modified.

Do not fabricate quality scores.

======================================================================
SECTION 68 — QUALITY CENTER
======================================================================

Create a structured Quality Center.

Avoid one meaningless score like:

QUALITY: 93%

unless there is a truly defensible calculation already present.

Prefer dimensions:

CONTENT
COMPLETE

SOURCES
18 VERIFIED

IMAGES
21 / 23 RESOLVED

IDENTITY
READY

INTERACTIONS
6 ACTIVE

MOBILE
VALIDATED

PERFORMANCE
OK

PENDING DECISIONS
2

This explains the project condition.

======================================================================
SECTION 69 — PUBLISH READINESS
======================================================================

The user should know if the universe is actually ready.

Examples:

READY TO PUBLISH

or:

NOT READY

Blockers:

- 2 unresolved required images
- 1 factual source conflict
- mobile validation incomplete

Differentiate:

BLOCKERS

WARNINGS

OPTIONAL IMPROVEMENTS

======================================================================
SECTION 70 — PREVIEW VS PUBLISHED STATE
======================================================================

Editing should not unintentionally corrupt a published universe.

Where current architecture supports it, maintain separation between:

draft/build state

and

published state

Allow previewing changes before publishing.

Do not cause partially generated content to instantly replace the public experience unless that is intentionally how the current architecture works.

======================================================================
SECTION 71 — EXISTING UNIVERSES MUST KEEP WORKING
======================================================================

Do not invalidate existing projects.

Old universes must still load.

If new fields are required:

create safe migration/default behavior.

Do not tell users:

"Recreate your universe."

Legacy universes should be adapted automatically where possible.

======================================================================
SECTION 72 — BUILDER RESPONSIVE DESIGN
======================================================================

Desktop:

LEFT TREE
CENTER PREVIEW
RIGHT INSPECTOR

Tablet:

tree may collapse
inspector may become drawer
preview remains central

Mobile:

do NOT squeeze 3 columns together.

Use modes/tabs such as:

STRUCTURE

PREVIEW

INSPECTOR

Allow easy switching.

Preserve actual functionality.

======================================================================
SECTION 73 — BUILDER PERFORMANCE
======================================================================

The current site previously became heavy on the user's PC.

Universe Builder V3 must not worsen this carelessly.

Review:

- duplicate renders
- continuous hidden preview updates
- event listeners
- polling
- large DOM trees
- image memory
- iframe usage
- large JSON cloning
- repeated API calls
- expensive observers
- unmounted panels
- animations

Use targeted efficient rendering.

This does NOT mean reducing features.

It means implement the full feature correctly.

======================================================================
SECTION 74 — SITE-WIDE PERFORMANCE
======================================================================

Because the update also restores the old UI and adds cinematics:

audit startup cost.

Do not load the entire Universe Builder implementation on normal public pages.

Do not load Admin-only code for normal users where avoidable.

Do not preload every cinematic asset unnecessarily.

Do not duplicate old and new shells simultaneously.

======================================================================
SECTION 75 — ACCOUNT DATA MUST REMAIN PERSISTENT
======================================================================

Game Index is now treated as an online platform.

Critical user data must not depend on ephemeral local server files.

Persistent data includes:

- accounts
- roles/functions
- subscription status
- profiles
- cinematic completion
- Builder state
- important settings

Use existing persistent database architecture.

======================================================================
SECTION 76 — RENDER COMPATIBILITY
======================================================================

The project currently runs through GitHub + Render.

Ensure production runtime works correctly there.

Review:

process.env.PORT

production start command

package scripts

environment variables

database connection

startup migrations

static assets

uploads

server startup

Do not introduce Azure-only assumptions.

Do not hardcode Render-specific assumptions either.

======================================================================
SECTION 77 — EPHEMERAL FILESYSTEM WARNING
======================================================================

Render instances may restart and local filesystem content may be ephemeral depending on deployment configuration.

Audit any user-generated files such as:

avatars
uploaded images
generated files

Do not silently treat local server storage as guaranteed permanent.

If persistent storage is not yet implemented for a category:

do not fake persistence.

Preserve current behavior where necessary and document the limitation.

======================================================================
SECTION 78 — SECRET MANAGEMENT
======================================================================

Never commit secrets.

Do not commit:

.env

database passwords

API keys

mail passwords

setup codes

admin recovery secrets

third-party credentials

tokens

private URLs containing credentials

.env.example must contain only:

variable names
safe placeholders
documentation

======================================================================
SECTION 79 — FIRST ADMIN SETUP
======================================================================

Preserve the first-admin bootstrap system.

The system may use something like:

GAMEINDEX_SETUP_CODE

Do not expose its value.

Remove Azure-specific wording from setup pages.

Use provider-neutral wording such as:

"Set the GAMEINDEX_SETUP_CODE environment variable in your deployment environment."

Preserve one-time setup behavior.

Do not make bootstrap permanently accessible.

======================================================================
SECTION 80 — RESTORED UI + NEW THEMES
======================================================================

The special PRO / Tester / Dev / Creator themes must integrate with the restored I6 interface.

Do not reintroduce the rejected 0.991 visual rebrand under a new name.

The themes should be variations of Game Index.

They may change:

accent color
glow
selected navigation state
small technological details
active indicators
special borders
identity highlights

But the interface remains recognizably Game Index I6.

======================================================================
SECTION 81 — CREATOR THEME
======================================================================

Creator:

primary identity color:
GOLD

The Creator theme may use:

subtle gold technological details
small premium identity accents
controlled highlights

Do not make the entire screen bright gold.

Preserve readability.

======================================================================
SECTION 82 — DEV THEME
======================================================================

Dev:

primary identity color:
RED

Use:

controlled red technological accents
development/system identity

Do not turn all backgrounds red.

======================================================================
SECTION 83 — TESTER THEME
======================================================================

Tester:

primary identity color:
BLUE

Use:

controlled blue testing/lab identity accents

Keep it connected to Game Index.

======================================================================
SECTION 84 — PRO THEME
======================================================================

PRO:

primary identity color:
GREEN

Use:

controlled premium green accents.

PRO is a paid status.

Do not make its UI resemble an administrative role.

======================================================================
SECTION 85 — WELCOME CINEMATIC THEME
======================================================================

The Welcome cinematic should be neutral.

It represents:

GAME INDEX

not:

PRO
Tester
Dev
Creator

Use the restored Game Index visual identity.

======================================================================
SECTION 86 — ACCESSIBILITY
======================================================================

Maintain:

keyboard navigation

focus visibility

semantic controls

screen-reader labels

sufficient contrast

reduced-motion behavior

Do not allow cinematic overlays to permanently trap focus.

During fullscreen cinematic playback:

temporarily manage focus appropriately.

After completion:

restore usable focus to the application.

======================================================================
SECTION 87 — LOCALIZATION
======================================================================

Do not hardcode every new UI string in one language if the existing application uses localization.

Add translations for major new strings where appropriate.

Examples:

Welcome
Needs You
Quality
Ready to Publish
Not Ready
Restore
Preview Change
Allow Automatic Changes
Locked
Researching
Structuring
Writing
Finding Images
Validating

Preserve PT-BR as an important supported language.

======================================================================
SECTION 88 — DATABASE MIGRATIONS
======================================================================

If this update requires database changes:

create a new migration.

Do not edit old production migrations as though they never shipped.

Possible new persistent requirements include:

cinematic account events
Builder edit-lock metadata
Builder snapshot/history metadata
Builder issue state

Use additive migration where possible.

Migration must be safe for existing databases.

======================================================================
SECTION 89 — MIGRATION SAFETY
======================================================================

Never:

DROP all users

reset passwords

truncate profiles

remove existing universes

reseed production destructively

delete subscription data

delete role/function data

Existing users must survive.

Existing Builder projects must survive.

======================================================================
SECTION 90 — RELEASE DETECTION FOR EXISTING USERS
======================================================================

The system must be able to distinguish users who should receive the post-update Welcome cinematic.

Do not manually tag each existing user.

Design a generic mechanism.

For example:

If event:

welcome_0991_hf1

does not exist for the user:

they are eligible.

That naturally works for both old and new users when combined with account creation/first session logic.

Avoid fragile global browser flags.

======================================================================
SECTION 91 — IDENTITY RESOLUTION
======================================================================

Create one reliable server-side or shared source of truth for:

current primary identity.

Avoid different pages independently deciding:

this user is PRO
this user is Tester
this user is Dev

with conflicting logic.

Respect current capability/subscription architecture.

Conceptually:

resolvePrimaryIdentity(user)

may return:

FREE
PRO
TESTER
DEV
CREATOR

Exact function name is not required.

But identity calculation should be coherent.

======================================================================
SECTION 92 — DO NOT CONFUSE BENEFITS WITH DISPLAY IDENTITY
======================================================================

Important:

A DEV may inherit benefits equivalent to lower tiers.

That does NOT mean display:

DEV
PRO
TESTER

simultaneously for this cinematic system.

The cinematic system uses primary identity.

Permissions can still use inherited capabilities internally.

======================================================================
SECTION 93 — PROFILE / BADGE CONSISTENCY
======================================================================

Review account badges and profile identity presentation.

Do not create contradictions such as:

cinematic says DEV

profile prominently says PRO

Admin says Tester

settings says Dev

Primary identity should be coherent.

Inherited benefits can remain internal.

======================================================================
SECTION 94 — FIRST POST-CINEMATIC EXPERIENCE
======================================================================

After an identity cinematic finishes:

the user must land in a fully functional interface.

No reload should be necessary.

Theme should already be active.

Navigation should already reflect the user's actual capability.

Do not leave the app in an intermediate state.

======================================================================
SECTION 95 — ADMIN MENU + OLD UI INTERACTION
======================================================================

When restoring the old UI:

make sure the Admin Panel menu restoration works inside that interface.

Do not restore an old shell that cannot expose new 0.991 tools.

The restored shell must accommodate current routes.

This is one of the most important compatibility tasks.

======================================================================
SECTION 96 — NO DUPLICATED SHELLS
======================================================================

Do not maintain:

old shell
+
new shell
+
special admin shell

if one coherent shell architecture can support the restored UI.

Avoid long-term duplication.

Refactor carefully.

======================================================================
SECTION 97 — CSS STRATEGY
======================================================================

Do not solve the rollback by stacking hundreds of !important overrides over 0.991 CSS.

Determine:

which 0.991 visual rules belong to the rejected rebrand

which rules belong to necessary new features

which old interface rules should be restored

Build a maintainable result.

Use a clearly scoped HF1 stylesheet only where appropriate.

Avoid cascading chaos.

======================================================================
SECTION 98 — JAVASCRIPT STRATEGY
======================================================================

Do not create duplicate event listeners.

Do not attach the cinematic manager multiple times.

Do not execute identity checks on every DOM mutation.

Initialize systems intentionally.

Use clear lifecycle.

======================================================================
SECTION 99 — ERROR HANDLING
======================================================================

New systems should report actionable failures.

Examples:

Could not load cinematic eligibility.

Do not block app forever.

Could not restore Builder snapshot.

Keep current state and inform user.

Could not regenerate image.

Offer retry/alternative.

Avoid raw stack traces in normal user UI.

======================================================================
SECTION 100 — LOGGING
======================================================================

Use structured technical logs where appropriate.

Do not log:

passwords
tokens
setup codes
secret environment values

Useful cinematic events may log:

event eligible
event started
event completed
event skipped due to reduced motion
event recovery timeout

Useful Builder logs:

job started
stage transition
recovery attempt
blocking issue
publish validation

======================================================================
SECTION 101 — TEST STRATEGY
======================================================================

Do not declare the update complete after the page "looks okay".

Run real tests.

Start by running the existing Beta 0.991 test suite.

Then add HF1 coverage.

Historical tests should continue to pass when still relevant.

Do not weaken tests globally merely because the new UI is different.

======================================================================
SECTION 102 — VISUAL RESTORATION TESTS
======================================================================

Verify:

- restored I6-style shell loads
- rejected rebrand is removed
- new 0.991 functionality remains
- navigation works
- header works
- desktop works
- mobile works
- public pages work
- authenticated pages work
- profile works
- Social works
- settings works
- special themes work

======================================================================
SECTION 103 — ADMIN TESTS
======================================================================

Test:

Admin page loads for authorized account.

Overview exists.

Users exists.

Content exists.

Social exists.

System exists.

Bugs exists.

Advanced exists.

Advanced tools route correctly.

Unauthorized account remains blocked.

Public user cannot access internal APIs by directly typing URLs.

======================================================================
SECTION 104 — THEME CUTSCENE TESTS
======================================================================

Verify:

- cable starts below viewport
- cable moves upward
- bend is visually continuous
- plug stays attached
- plug aligns with socket
- pins match outlet orientation
- plug approaches
- plug inserts
- pins visually enter
- power event occurs after insertion
- new theme appears after connection
- overlay cleans up
- responsive mode works
- reduced motion works
- timeout recovery works

======================================================================
SECTION 105 — WELCOME TESTS
======================================================================

NEW FREE USER:

first entry:
Welcome plays

second entry:
does not replay

EXISTING FREE USER AFTER UPDATE:

first entry after update:
Welcome plays

next login:
does not replay

Refresh after completion:
does not replay.

======================================================================
SECTION 106 — PRO TESTS
======================================================================

Existing PRO:

Welcome
then
PRO

Future login:
no repeat.

FREE → PRO:

PRO cinematic occurs once.

Theme becomes green.

PRO does not gain inappropriate Admin/Dev capability.

======================================================================
SECTION 107 — TESTER TESTS
======================================================================

Existing Tester:

Welcome
then
Tester

No PRO cinematic.

Tester intro blue.

Theme changes correctly.

Future login:
no repeat.

======================================================================
SECTION 108 — DEV TESTS
======================================================================

Existing Dev:

Welcome
then
Dev

DO NOT show:

PRO
Tester

Dev intro red.

Dev remains Dev.

All expected Dev capabilities remain.

======================================================================
SECTION 109 — CREATOR TESTS
======================================================================

Existing Creator:

Welcome
then
Creator

Creator intro gold.

Existing Creator permissions remain functional.

Creator Control works.

Do not accidentally replace Creator access with Dev access.

======================================================================
SECTION 110 — CINEMATIC QUEUE TESTS
======================================================================

Test:

one event
two events
failed event
page refresh
slow network
reduced motion
mobile
route navigation

No overlapping full-screen layers.

No duplicate completion records.

No permanent blackout.

======================================================================
SECTION 111 — UNIVERSE BUILDER EXISTING PROJECT TEST
======================================================================

Open universe created before HF1.

Verify:

structure loads

content loads

images load

interactions load

preview works

new V3 tree represents old data

Inspector works

publishing still works

No forced recreation.

======================================================================
SECTION 112 — NEW UNIVERSE BUILDER TEST
======================================================================

Create a new universe.

Verify pipeline:

research

structure

content

images

identity

interactions

validation

readiness

Verify live stage state.

Verify preview populates.

Verify user can intervene.

======================================================================
SECTION 113 — BUILDER MANUAL EDIT TEST
======================================================================

Manually modify a section.

Run automatic improvement.

The manual edit must not be silently destroyed.

Test unlocking automatic changes.

Test targeted regeneration.

======================================================================
SECTION 114 — BUILDER AUTO-RECOVERY TEST
======================================================================

Simulate recoverable failure.

Confirm:

primary attempt fails

recovery starts

alternative strategy runs

success continues pipeline

User is only interrupted if still unresolved.

======================================================================
SECTION 115 — BUILDER NEEDS YOU TEST
======================================================================

Create unresolved issue.

Confirm:

issue appears

priority is correct

resolution UI works

resolution updates Builder state

publish readiness updates.

======================================================================
SECTION 116 — BUILDER HISTORY TEST
======================================================================

Perform:

initial build

manual edit

image change

interaction change

Verify history.

Restore previous snapshot/state.

Verify preview and data return consistently.

======================================================================
SECTION 117 — MOBILE BUILDER TEST
======================================================================

Test actual mobile layout.

Do not only resize CSS mentally.

Verify:

Structure mode

Preview mode

Inspector mode

navigation between them

controls remain usable

no tiny 3-column desktop layout.

======================================================================
SECTION 118 — AUTH REGRESSION TEST
======================================================================

Important because previous versions experienced authentication regressions.

Verify public homepage does not unexpectedly return:

401
403

Verify public game pages.

Verify login.

Verify authenticated pages.

Verify restricted tools remain restricted.

======================================================================
SECTION 119 — PRODUCTION START TEST
======================================================================

Test:

npm install
or appropriate clean dependency install

production start command

PORT environment variable

startup on a clean environment

database connection

migrations

static pages

API routes

No development-only assumptions.

======================================================================
SECTION 120 — GITHUB SAFETY
======================================================================

Repository is now used through GitHub.

Ensure git status before packaging does not include:

.env

secret database file

private credential

generated sensitive file

API keys

setup code

Do not add secrets to documentation.

======================================================================
SECTION 121 — DOCUMENTATION REQUIRED
======================================================================

Create/update complete documentation for this release.

At minimum:

MASTER_PROMPT_BETA_0.991_HF1.md

RELEASE_NOTES_BETA_0.991_HF1.md

MIGRATION_REPORT_BETA_0.991_HF1.md

TEST_REPORT_BETA_0.991_HF1.md

PACKAGE_VALIDATION_BETA_0.991_HF1.md

UPDATE_ONLY_README_0.991_HF1.md

FULL_DEPLOY_README_BETA_0.991_HF1.md

BETA_0.991_HF1_CHANGED_FILES.txt

If the project's current naming convention differs slightly, remain consistent.

======================================================================
SECTION 122 — RELEASE NOTES CONTENT
======================================================================

Release notes must clearly describe:

ORIGINAL INTERFACE RESTORED

ADMIN PANEL RECOVERED

THEME POWER CUTSCENE REBUILT

WELCOME CINEMATIC

PRO CINEMATIC

TESTER CINEMATIC

DEV CINEMATIC

CREATOR CINEMATIC

AUTOMATIC IDENTITY THEMES

CINEMATIC PERSISTENCE

CINEMATIC QUEUE

UNIVERSE BUILDER V3

BUILDER LIVE PREVIEW

BUILDER INSPECTOR

BUILDER AUTO-RECOVERY

NEEDS YOU CENTER

CREATIVE DIRECTOR INTEGRATION

MANUAL EDIT PROTECTION

BUILDER HISTORY

QUALITY CENTER

PUBLISH READINESS

RENDER/HOSTING COMPATIBILITY IMPROVEMENTS

======================================================================
SECTION 123 — MIGRATION REPORT
======================================================================

Migration report must state:

database migration added or not

new tables/columns if any

compatibility with old users

compatibility with old Builder projects

how existing users become eligible for cinematics

how existing roles are preserved

how current themes migrate

how no account data is reset.

======================================================================
SECTION 124 — TEST REPORT
======================================================================

Report actual results.

Do not say:

"All tests should pass."

Run them.

Record:

command

number passed

number failed

known warnings

manual validation

If something fails:

fix it before declaring completion unless the failure is proven unrelated and documented.

======================================================================
SECTION 125 — FULL PACKAGE
======================================================================

Generate a FULL package containing the complete deployable Beta 0.991 HF1 project.

It should be usable for a clean deployment.

Do not include:

node_modules

.env

credentials

temporary files

local caches

unnecessary logs

======================================================================
SECTION 126 — UPDATE ONLY PACKAGE
======================================================================

Generate an UPDATE_ONLY package.

It should contain:

only files needed to move from Beta 0.991 to Beta 0.991 HF1

plus:

migration files
instructions
changed file list

Do not omit a dependency change if package.json/package-lock changed.

======================================================================
SECTION 127 — DO NOT DELETE HISTORY CARELESSLY
======================================================================

Preserve historical release files where they are intentionally part of the repository.

Do not delete old documentation just to "clean" the project unless it is clearly obsolete runtime garbage.

Historical files are useful for Game Index development continuity.

======================================================================
SECTION 128 — NO FAKE FEATURES
======================================================================

Do not create UI buttons that do nothing.

Do not create:

"Undo"
without undo.

Do not create:

"Creative Director"
that only prints generic text.

Do not create:

"Quality Center"
with random values.

Do not create:

"Live Preview"
that is just a screenshot.

Every new UI surface must correspond to actual system behavior.

======================================================================
SECTION 129 — NO HIDDEN CHAIN OF THOUGHT
======================================================================

Game Index AI systems may expose:

status
sources
stage
decision summary
result
failure reason
trace identifiers

They must NOT expose private hidden chain-of-thought.

Builder progress should be structured technical progress.

======================================================================
SECTION 130 — UI QUALITY EXPECTATION
======================================================================

Do not make the restored UI look unfinished.

The old interface should return intentionally.

Do not produce obvious patchwork where:

one page looks old
one page looks rebranded
one page looks default HTML
one page uses different spacing

The application should have one coherent Game Index identity.

======================================================================
SECTION 131 — CINEMATIC QUALITY EXPECTATION
======================================================================

The cinematics should feel like part of the product.

They should not feel like:

cheap modal popups
PowerPoint transitions
random CSS demos

They must use:

good timing
depth
controlled lighting
clear choreography
coherent colors
smooth cleanup

But remain performant.

======================================================================
SECTION 132 — THEME CUTSCENE SPECIFIC VISUAL EXPECTATION
======================================================================

The plug animation is especially important.

The user explicitly noticed:

THE CABLE CURRENTLY COMES FROM THE LEFT AND DOES NOT TOUCH THE PLUG/SOCKET CORRECTLY.

The corrected version MUST visibly fix this.

Cable:

comes from bottom

bends

stays connected

plug:

moves with cable

aligns

physically inserts

socket:

matches geometry

power:

starts after insertion

This must be visually testable.

======================================================================
SECTION 133 — WELCOME CINEMATIC SPECIFIC EXPECTATION
======================================================================

The user specifically wants:

screen closes with a circle

black background

BEM-VINDO lights up

details rise

text light turns off

details descend

screen opens again

Do not replace this with a completely different artistic interpretation.

======================================================================
SECTION 134 — ROLE / STATUS CINEMATIC SPECIFIC EXPECTATION
======================================================================

The user specifically wants:

screen closes with a circle

role/status name lights up

role/status color details rise

role/status text is same color

name powers off

details descend

screen opens

new theme is visible

Colors:

PRO = GREEN
TESTER = BLUE
DEV = RED
CREATOR = GOLD

Preserve exactly this conceptual sequence.

======================================================================
SECTION 135 — EXISTING ACCOUNT SPECIFIC EXPECTATION
======================================================================

The user specifically wants users who already had an identity before the update to experience the cinematic.

For them:

WELCOME
+
CURRENT IDENTITY CINEMATIC

Example:

old Dev user:

Welcome
Dev

Not:

Welcome
Pro
Tester
Dev

======================================================================
SECTION 136 — PRODUCT IDENTITY PRINCIPLE
======================================================================

Beta 0.991 HF1 should repair the relationship between:

Game Index history
and
Game Index future.

The project should not feel rebooted.

The user wants the interface they already identified with.

Therefore:

restore the original interface

while making the systems underneath more advanced than before.

======================================================================
SECTION 137 — UNIVERSE BUILDER PRODUCT PRINCIPLE
======================================================================

Universe Builder V3 should make the user feel:

"I am directing and editing the generated universe."

Not:

"I am filling out forms and waiting for a result."

The system should combine:

automation
visibility
manual control
AI assistance
recovery
live preview
quality
publishing

in one workspace.

======================================================================
SECTION 138 — CREATIVE DIRECTOR PRODUCT PRINCIPLE
======================================================================

Creative Director should behave like a production assistant.

It should observe the generated experience and identify:

weak visual areas
repetition
missing interactions
poor composition
content opportunities
source issues

It should not replace user control.

======================================================================
SECTION 139 — AUTO-RECOVERY PRODUCT PRINCIPLE
======================================================================

Game Index should try to fix reasonable problems before asking the user.

The user should be asked only when:

a real choice exists
a conflict exists
automation cannot safely continue
manual approval is meaningful

======================================================================
SECTION 140 — FINAL REGRESSION PASS
======================================================================

Before packaging:

Run:

current Beta 0.991 tests

new Beta 0.991 HF1 tests

historical relevant tests

general check script

HTTP smoke tests

authentication checks

database migration checks

Builder tests

cinematic tests

Admin tests

responsive tests

production start test

Do not skip previous regression groups simply because the new features work.

======================================================================
SECTION 141 — FINAL MANUAL CHECK
======================================================================

Manually inspect:

Homepage

Login

First account entry

Welcome cinematic

PRO cinematic

Tester cinematic

Dev cinematic

Creator cinematic

theme switching

new plug cutscene

Profile

Settings

Social

Admin

Admin advanced tools

Universe Builder desktop

Universe Builder mobile

published game page

Creator tools

Tester tools

AI tools

No visual page should obviously remain in the rejected rebrand unless a deliberate exception is documented.

======================================================================
SECTION 142 — FINAL EXPECTED EXPERIENCE
======================================================================

When Beta 0.991 HF1 launches:

An existing user logs in.

The original Game Index interface is back.

The screen closes into a circular iris.

Black.

BEM-VINDO powers on.

Game Index details rise.

The light powers off.

Details descend.

If the user has a special current identity:

another cinematic begins.

Example DEV:

black screen

DEV powers on in red

red technological details rise

DEV powers off

details descend

screen opens

Game Index is now using the Dev identity theme.

The user enters the familiar old Game Index interface.

Admin users again see the complete Admin navigation.

The user changes appearance.

Game Index powers down.

A cable rises from the bottom.

The cable bends.

The plug aligns.

The plug physically enters the socket.

Only then does power return.

The selected theme activates.

The user enters Universe Builder.

Instead of a long disconnected checklist:

there is a real workspace.

Left:

universe structure.

Center:

live experience.

Right:

context-aware controls.

The Builder visibly researches, structures, writes, resolves images, creates interactions and validates.

Problems are automatically recovered when possible.

Real unresolved decisions appear in Needs You.

Creative Director provides actionable production improvements.

Manual edits are protected.

History allows recovery.

Quality and publish readiness are understandable.

That is the expected product.

======================================================================
SECTION 143 — ABSOLUTE DO-NOT LIST
======================================================================

DO NOT:

rewrite Game Index from zero

delete working 0.991 backend systems

downgrade database functionality

remove authentication

weaken capability security

expose Admin tools publicly

hardcode admin access

hardcode @Franchesco01 or any individual user into permission logic

commit secrets

commit setup codes

commit API keys

commit .env

reset users

reset passwords

reset roles

reset universes

destroy Builder projects

remove Social

remove AI systems

remove current APIs without migration

replace the old interface with another redesign

retain the rejected launch rebrand as the main visual target

make the cable come from the left

leave the plug disconnected

activate the theme before plug insertion

replace cinematics with basic alert/modal windows

show every inherited lower cinematic

show PRO cinematic to DEV just because DEV includes PRO benefits

depend only on localStorage for cinematic state

create fake Builder progress

create random quality scores

show AI chain-of-thought

silently overwrite manual Builder edits

make mobile Builder a tiny three-column desktop layout

hardcode Render

hardcode Azure

leave provider-specific setup instructions where unnecessary

declare success without regression testing

reduce the requested scope because it is large

stop after only implementing visual changes

stop after only implementing cinematics

stop after only implementing Universe Builder

======================================================================
SECTION 144 — IMPLEMENTATION ORDER
======================================================================

Recommended implementation order:

PHASE 1
Repository audit and regression baseline.

PHASE 2
Identify exact 0.99 I6 pre-rebrand UI state.

PHASE 3
Restore shell/interface while preserving 0.991 functionality.

PHASE 4
Restore Admin Panel menus and validate permissions.

PHASE 5
Make environment/deployment wording hosting-neutral.

PHASE 6
Build reusable cinematic infrastructure.

PHASE 7
Add server-side cinematic event persistence.

PHASE 8
Implement Welcome cinematic.

PHASE 9
Implement PRO cinematic.

PHASE 10
Implement Tester cinematic.

PHASE 11
Implement Dev cinematic.

PHASE 12
Implement Creator cinematic.

PHASE 13
Implement identity resolution and automatic theme application.

PHASE 14
Rebuild manual theme-change cable/socket cutscene.

PHASE 15
Implement Builder V3 workspace shell.

PHASE 16
Connect Universe Tree to real Builder data.

PHASE 17
Connect Live Preview.

PHASE 18
Connect Inspector.

PHASE 19
Expose pipeline state.

PHASE 20
Implement auto-recovery orchestration.

PHASE 21
Implement Needs You.

PHASE 22
Integrate Creative Director visibly.

PHASE 23
Implement manual edit protection.

PHASE 24
Implement history/snapshot/undo functionality.

PHASE 25
Implement Quality Center and publish readiness.

PHASE 26
Responsive Builder.

PHASE 27
Performance validation.

PHASE 28
Full tests.

PHASE 29
Documentation.

PHASE 30
FULL + UPDATE_ONLY packaging.

The implementation may reorder internally when dependencies require it, but no major scope item may be silently omitted.

======================================================================
SECTION 145 — COMPLETION CRITERIA
======================================================================

This release is complete only when all of the following are true:

[ ] Beta 0.99 I6 interface identity has been restored.

[ ] Rejected Beta 0.991 launch rebrand is no longer the main site identity.

[ ] Beta 0.991 technical systems remain intact.

[ ] Admin Panel menus are restored.

[ ] Admin permissions remain secure.

[ ] Theme-change cable comes from below.

[ ] Theme cable bends naturally.

[ ] Plug physically aligns and inserts into socket.

[ ] Theme power-up happens only after connection.

[ ] Welcome cinematic exists.

[ ] Existing users receive Welcome once.

[ ] New users receive Welcome once.

[ ] PRO cinematic exists and is green.

[ ] Tester cinematic exists and is blue.

[ ] Dev cinematic exists and is red.

[ ] Creator cinematic exists and is gold.

[ ] Cinematic text behaves like a powered light.

[ ] Decorative identity elements rise and descend.

[ ] Circular close/open transition works.

[ ] Identity theme is applied automatically.

[ ] DEV does not receive PRO + Tester cinematics.

[ ] Cinematic completion persists with the account.

[ ] Cinematic queue works.

[ ] Cinematic failures cannot permanently block the site.

[ ] Universe Builder V3 exists.

[ ] Builder has Universe Tree.

[ ] Builder has live central preview.

[ ] Builder has contextual Inspector.

[ ] Build pipeline status is visible.

[ ] Auto-recovery works.

[ ] Needs You exists.

[ ] Creative Director is meaningfully integrated.

[ ] Manual editing works.

[ ] Manual edits are protected.

[ ] History/recovery exists.

[ ] Quality Center exists.

[ ] Publish readiness exists.

[ ] Existing universes still open.

[ ] Mobile Builder is usable.

[ ] Site works on current Render deployment architecture.

[ ] No secrets are committed.

[ ] Authentication regression tests pass.

[ ] Current 0.991 tests pass or are specifically updated only where intentional behavior changed.

[ ] New HF1 tests pass.

[ ] Documentation is complete.

[ ] FULL package is generated.

[ ] UPDATE_ONLY package is generated.

======================================================================
SECTION 146 — FINAL DIRECTIVE
======================================================================

Do not produce a superficial patch.

Do not produce only mockups.

Do not produce only documentation.

Implement the full Beta 0.991 HF1 release.

Study the actual repository first.

Preserve everything valuable already built.

Restore the identity that was lost.

Repair the Admin experience.

Build the cinematic system as a reusable Game Index feature.

Make the theme-change cutscene physically convincing.

Transform Universe Builder into a serious production/editor environment.

Protect existing users, data, permissions and projects.

Keep the project compatible with its current online deployment model.

Test the complete system.

Then package and document the release.

The final result should communicate one thing clearly:

THE ORIGINAL GAME INDEX IS BACK —
BUT IT IS MORE ADVANCED THAN BEFORE.