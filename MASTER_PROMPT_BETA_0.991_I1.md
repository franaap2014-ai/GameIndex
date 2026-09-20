# GAME INDEX — MASTER IMPLEMENTATION PROMPT
# BETA 0.991 I1
# ACCOUNT PERSISTENCE + CINEMATICS CONTROL CENTER + CINEMATIC REWORK + THEME POWER FIX + ADAPTIVE BRANDING + CONTEXT-AWARE NAVIGATION + INTEGRATED BUG DIAGNOSTICS

You are modifying the existing Game Index Beta 0.991 HF1 codebase.

This is NOT a rewrite.

This is NOT a simplified replacement.

This is NOT a visual prototype.

This is NOT a mock implementation.

This is the next real incremental release:

GAME INDEX BETA 0.991 I1

The current Beta 0.991 HF1 is the technical and product foundation.

Beta 0.991 I1 is a refinement/update focused on several smaller but important areas that affect reliability, navigation, cinematics, branding, administration, diagnostics and daily use.

DO NOT rebuild Game Index from scratch.

DO NOT remove the systems implemented in Beta 0.991 HF1.

DO NOT revert the restored Game Index I6 identity.

DO NOT reintroduce the rejected Launch Visual Rebrand.

DO NOT replace working systems with mock systems.

DO NOT reduce the requested scope.

DO NOT skip difficult parts.

DO NOT implement only the visual changes.

DO NOT implement only the persistence fix.

DO NOT implement only the cinematic changes.

DO NOT create fake buttons.

DO NOT create fake diagnostics.

DO NOT report tests as passing unless they were actually executed.

There is NO TIME LIMIT for this implementation.

Take as much implementation time as necessary.

The current codebase must be deeply inspected before implementation.

The final release must preserve everything valuable already implemented in Beta 0.991 HF1 while improving the areas defined in this document.

======================================================================
SECTION 1 — RELEASE IDENTITY
======================================================================

Target release:

GAME INDEX BETA 0.991 I1

This is an incremental improvement release after:

GAME INDEX BETA 0.991 HF1

The I1 release exists to improve several smaller but important product areas without changing the overall direction established by HF1.

The main goals are:

1. Permanently solve account persistence across deployments/restarts/updates.
2. Officially absorb the previous cinematic visibility fix into the main codebase.
3. Create a dedicated Cinematics area inside the Admin Panel.
4. Allow administrators to manually preview and inspect cinematics.
5. Rework the Welcome cinematic choreography.
6. Replace the current "wire-like" cinematic decorations with real technological Game Index visual elements.
7. Correct the theme-change power cinematic source/destination cable colors.
8. Replace the current header "Game Index" text + old G symbol with a new adaptive Game Index logo.
9. Make the new logo react to the current theme and identity.
10. Make clicking the new logo return directly to Home.
11. Make the top navigation adapt to the current area without duplicating the entire sidebar.
12. Turn the top bar into a navigation compass.
13. Transform "Report a Bug" into a structured reporting pipeline.
14. Send bug reports into the Admin Panel.
15. Automatically attach useful technical diagnostics to bug reports.
16. Generate developer-friendly bug reports that make future fixes significantly easier.
17. Preserve all current security, roles, capabilities, Builder systems, Social systems and existing features.

======================================================================
SECTION 2 — CURRENT FOUNDATION THAT MUST REMAIN
======================================================================

Beta 0.991 HF1 already introduced or restored major systems.

Do not regress them.

Preserve, where currently functional:

- restored Game Index 0.99 I6 visual identity
- current shell
- current navigation architecture
- current authentication
- current sessions
- current users
- current profiles
- public profiles
- Social
- follow systems
- account settings
- Appearance
- theme system
- PRO status
- Tester function
- Dev function
- Creator function
- capability checks
- Admin Panel
- restored Admin navigation
- Database Explorer
- AI Control
- AI Flow
- Release Contract systems
- Tester Lab
- Creator Control
- Deployment systems
- cinematic engine
- cinematic persistent event architecture
- cinematic queue
- Welcome cinematic
- PRO cinematic
- Tester cinematic
- DEV cinematic
- Creator cinematic
- identity theme application
- theme-change electrical cutscene
- Universe Builder V3
- Universe Tree
- Live Preview
- Inspector
- Builder pipeline visibility
- auto-recovery
- Needs You
- Creative Director integration
- manual edit protection
- Builder history
- Quality Center
- publish readiness
- current API routes
- current database architecture
- current migrations
- existing universes
- localization
- responsive behavior
- accessibility
- production startup architecture
- provider-neutral deployment language

Do not solve I1 problems by removing existing systems.

======================================================================
SECTION 3 — REPOSITORY AUDIT BEFORE IMPLEMENTATION
======================================================================

Before modifying anything, inspect the real Beta 0.991 HF1 repository.

Do not assume implementation locations only from filenames.

Trace imports, startup flows, event listeners, routes and persistence.

At minimum inspect:

- package.json
- package-lock.json
- server.mjs
- public/
- public/index.html
- public/login.html
- public/settings.html
- public/social.html
- public/profile.html
- public/profile-settings.html
- public/admin.html
- public/universe-builder.html
- public/css/
- public/js/
- src/
- src/auth/
- src/users/
- src/access/
- src/database/
- src/database/repositories/
- src/themes/
- src/subscriptions/
- src/admin/
- src/social/
- src/universe/
- src/runtime/
- migrations/
- tests/
- current release documentation

Specifically trace:

- database initialization
- database path resolution
- production database behavior
- Render deployment behavior
- authentication storage
- user creation
- session storage
- account loading
- profiles
- roles
- functions
- subscriptions
- cinematic account events
- theme persistence
- Admin bugs system
- current "Report a Bug" behavior
- header generation
- top navigation generation
- sidebar generation
- route/context detection
- theme transition
- cinematic manager
- shell-ready lifecycle
- cinematic CSS loading
- identity resolution
- reduced-motion behavior

Do not make architectural decisions before understanding the current runtime.

======================================================================
SECTION 4 — ABSORB THE CINEMATIC VISIBILITY HOTFIX
======================================================================

A small post-HF1 cinematic fix was necessary because the cinematic visual stylesheet was not reliably loaded by all relevant pages.

Beta 0.991 I1 must absorb that fix into the official release.

The I1 codebase must not depend on a separate manual Cinematic Fix package after deployment.

Make the fix part of the normal runtime.

Ensure:

- cinematic CSS is loaded on every page where cinematics can execute
- cinematic initialization is reliable
- cinematic initialization does not depend only on one fragile shell event
- duplicate initialization cannot occur
- a cinematic cannot be recorded as successfully seen while its visual layer never appeared
- failure recovery works
- queue behavior remains idempotent

The previous fix becomes part of I1.

Do not preserve it as an external patch dependency.

======================================================================
SECTION 5 — ACCOUNT PERSISTENCE IS THE HIGHEST PRIORITY
======================================================================

The current production deployment has demonstrated a critical problem:

accounts can disappear after a deployment/restart because the database may be stored in an ephemeral filesystem.

This must be solved properly.

Account persistence is the highest-priority reliability requirement in I1.

The system must preserve:

- users
- passwords/password hashes
- profiles
- account metadata
- roles
- functions
- capabilities
- subscription status
- PRO status
- Tester status/function
- Dev status/function
- Creator status/function
- theme preferences
- cinematic completion state
- social state
- important account settings
- Builder ownership references
- any other account-critical data

across:

- deploy
- redeploy
- application restart
- host restart
- service spin-down
- new application instance
- version update
- migration

======================================================================
SECTION 6 — NEVER SILENTLY USE EPHEMERAL PRODUCTION STORAGE
======================================================================

The application must not silently start production using a temporary SQLite file that can disappear.

Local SQLite can remain valid for:

- development
- automated tests
- local demos
- explicitly configured local environments

But production must distinguish persistent storage from ephemeral storage.

If production does not have a valid persistent data configuration:

DO NOT quietly create a fresh empty production database and continue as if everything is fine.

Instead use a safe production behavior.

Possible acceptable behavior:

- fail startup with a clear configuration error
- enter a clearly identified maintenance/configuration mode
- require an explicitly configured persistent database backend

The exact approach should follow the current architecture.

The key rule is:

AN EMPTY TEMPORARY DATABASE MUST NOT MASQUERADE AS THE REAL PRODUCTION DATABASE.

======================================================================
SECTION 7 — PRODUCTION DATABASE STRATEGY
======================================================================

Audit the existing database architecture before choosing the final implementation.

If the current architecture already supports a persistent external database, use it properly.

If the project currently only supports SQLite, introduce a safe storage architecture that preserves local SQLite while supporting persistent production data.

Do not unnecessarily rewrite every repository.

Prefer adapting the existing repository layer.

The production storage solution should remain hosting-neutral.

Do not hardcode Render.

Do not hardcode Azure.

A valid production persistence architecture should support deployment environments such as:

- Render
- Azure
- another compatible Node host
- local persistent server environments

The implementation must be documented.

======================================================================
SECTION 8 — CURRENT SQLITE DATA MUST NOT BE DESTROYED
======================================================================

Do not treat account persistence as permission to reset the database.

Never:

- truncate users
- drop users
- regenerate passwords
- recreate all users
- reseed production users destructively
- reset account roles
- reset cinematic history
- reset profiles
- reset Builder ownership
- reset subscriptions

If an existing persistent database exists:

migrate it safely.

If the deployment currently contains a usable SQLite database and a persistent external database is being introduced, provide a safe migration/import path where practical.

Do not automatically overwrite a populated destination database without explicit safety checks.

======================================================================
SECTION 9 — DATA STORAGE HEALTH STATUS
======================================================================

Introduce a clear internal production storage health state.

The system should be able to determine and report concepts such as:

- storage mode
- persistent / non-persistent
- database connected
- schema version
- migration state

Do not expose credentials.

The Admin/System or Deployment area may show safe information such as:

Storage:
Persistent

Backend:
Configured database provider

Schema:
42

Connection:
Healthy

Do not display passwords, database URLs containing credentials, tokens or secrets.

======================================================================
SECTION 10 — ACCOUNT PERSISTENCE TEST
======================================================================

A persistence test is mandatory.

Test:

1. Start application.
2. Create a real test account.
3. Record its internal ID.
4. Set profile/theme/account state.
5. Stop the application.
6. Restart.
7. Confirm account still exists.
8. Confirm login still works.
9. Confirm role/function state remains.
10. Confirm theme remains.
11. Confirm cinematic state remains.
12. Simulate migration/redeploy conditions where feasible.
13. Confirm account still exists.

A release with account loss is not acceptable.

======================================================================
SECTION 11 — ADMIN CINEMATICS CENTER
======================================================================

Create a dedicated Cinematics area inside the Admin Panel.

The Admin Panel currently includes sections such as:

- Overview
- Users
- Content
- Social
- System
- Bugs
- Advanced

Integrate Cinematics in an appropriate location.

It may be:

ADMIN
→ CINEMATICS

or placed inside an appropriate Admin group if the current navigation architecture strongly prefers that.

However, it must be clearly discoverable.

Do not hide it inside unrelated debug tools.

======================================================================
SECTION 12 — PURPOSE OF THE CINEMATICS CENTER
======================================================================

The Cinematics Center exists so administrators/developers can inspect, preview, test and diagnose cinematics without creating new accounts every time.

It must expose the real cinematic engine.

Do not create a separate fake animation demo.

Available cinematic previews must include at minimum:

- Welcome
- PRO
- Tester
- DEV
- Creator
- Theme Change / Power Cutscene

Use the actual production cinematic implementation.

======================================================================
SECTION 13 — CINEMATICS CENTER MODES
======================================================================

Separate testing from persistent account state.

At minimum support concepts such as:

PREVIEW

Runs the cinematic visually.

Does NOT mark it completed.

Does NOT change permanent account eligibility.

Does NOT modify the real cinematic queue.

SIMULATION

Runs the cinematic using a simulated context.

Examples:

- Dark → Light
- Light → Dark
- FREE → PRO
- PRO → Tester
- Tester → DEV
- Creator
- reduced-motion mode

ACCOUNT EVENT / REAL REPLAY

Where appropriate, allow controlled execution against the administrator's current account/event system.

This must be clearly distinguished from preview.

======================================================================
SECTION 14 — CINEMATIC STATE DEBUGGING
======================================================================

The Admin Cinematics Center should provide useful technical state.

Examples:

Current account:
Primary identity

Current cinematic queue

Pending events

Completed events

Started but incomplete events

Current theme

Reduced-motion status

Cinematic engine status

Do not expose private authentication information.

Do not expose secrets.

======================================================================
SECTION 15 — CINEMATIC ELIGIBILITY RESET
======================================================================

Administrators should have a controlled way to reset one selected cinematic event for testing.

Example:

Reset eligibility:
welcome_0991_i1

This is a real persistent action.

Therefore:

- require Admin authorization
- require confirmation
- clearly show which account/event is being changed
- do not provide a generic "delete all cinematic history" button without strong safeguards
- log the administrative action

Preview mode should remain the preferred testing method.

======================================================================
SECTION 16 — CINEMATIC EVENT VERSIONING
======================================================================

I1 modifies the Welcome cinematic significantly.

Do not let a broken or old visual completion state permanently prevent users from seeing the corrected I1 experience if the product requires the updated intro.

Use the existing generic cinematic event versioning architecture.

Create an appropriate event/version key for the I1 Welcome experience.

For example conceptually:

welcome_0991_i1

Do not hardcode this exact string if the repository uses another version convention.

The important part is that I1 eligibility can be distinguished from the previous broken/older Welcome presentation.

======================================================================
SECTION 17 — WELCOME CINEMATIC REWORK
======================================================================

The current Welcome cinematic choreography is not correct.

The I1 Welcome cinematic must be rebuilt/refined.

The desired experience is very specific.

Do not replace it with another artistic interpretation.

======================================================================
SECTION 18 — CORRECT WELCOME SEQUENCE
======================================================================

The exact conceptual order must be:

1. Normal Game Index interface is visible.
2. Circular iris begins closing.
3. The visible interface disappears behind the closing iris.
4. Iris closes completely.
5. Screen is fully black.
6. Only now does the Welcome presentation begin.
7. "BEM-VINDO" / localized Welcome text powers ON.
8. Technological Game Index details rise from below.
9. Welcome presentation holds briefly.
10. Welcome text begins losing power.
11. Glow collapses.
12. Welcome text becomes fully OFF / invisible.
13. Technological details descend.
14. Technological details fully leave the visible area.
15. Screen remains clean/black.
16. Only now does the iris begin opening.
17. Normal Game Index interface becomes visible again.
18. No Welcome text remains.
19. No cinematic decoration remains.
20. Overlay cleans up completely.

======================================================================
SECTION 19 — IMPORTANT WELCOME BUG TO PREVENT
======================================================================

The following behavior is WRONG:

iris opens
↓
normal interface returns
↓
BEM-VINDO is still visible
↓
BEM-VINDO disappears afterward

This must never happen.

The correct rule:

THE WELCOME TEXT MUST BE COMPLETELY POWERED OFF BEFORE THE IRIS REOPENS.

The decorative elements must also be gone before the application becomes visible again.

======================================================================
SECTION 20 — WELCOME TEXT POWER EFFECT
======================================================================

"BEM-VINDO" must behave like a powered sign/light.

LIGHT ON:

black
↓
tiny electrical activation
↓
brightness begins
↓
glow grows
↓
stable illuminated text

LIGHT OFF:

stable illumination
↓
power interruption
↓
glow collapses
↓
brightness dies
↓
text goes dark
↓
text disappears

Do not use a generic opacity-only fade.

Do not use aggressive flashing.

Avoid dangerous flicker frequencies.

======================================================================
SECTION 21 — WELCOME DECORATIVE ELEMENTS
======================================================================

The current rising visual elements can resemble random wires.

That is not the desired aesthetic.

Replace them with controlled Game Index technological details.

Possible visual vocabulary:

- thin luminous circuit lines
- segmented interface traces
- geometric fragments
- subtle angular rails
- small illuminated nodes
- controlled energy lines
- minimal vertical structures
- digital grid fragments
- HUD-like elements
- short technological bars
- tiny scanning accents

They should:

- rise during activation
- frame the Welcome text
- feel intentional
- remain subtle
- descend during shutdown
- fully leave before iris reopening

They must NOT look like:

- random electrical cables
- spaghetti wires
- fireworks
- giant particles
- esports explosions
- unrelated cyberpunk decoration

======================================================================
SECTION 22 — WELCOME LOCALIZATION
======================================================================

Use the existing localization system.

Examples:

PT-BR:
BEM-VINDO

EN:
WELCOME

Other supported languages:
appropriate localized equivalent

Do not hardcode only Portuguese if localization already exists.

======================================================================
SECTION 23 — SPECIAL IDENTITY CINEMATICS REMAIN
======================================================================

Do not remove the current special identity cinematics.

Preserve:

PRO = GREEN

TESTER = BLUE

DEV = RED

CREATOR = GOLD

Preserve the current progression model:

FREE:
Welcome only.

PRO:
Welcome where eligible + PRO intro.

Tester:
Welcome where eligible + Tester intro.

Dev:
Welcome where eligible + DEV intro.

Creator:
Welcome where eligible + Creator intro.

Do not reintroduce inherited lower cinematic chains.

A DEV must NOT see:

PRO
Tester
DEV

A DEV sees:

DEV

for the special identity portion.

======================================================================
SECTION 24 — SPECIAL CINEMATICS SHOULD RECEIVE THE SAME TIMING QUALITY
======================================================================

Review special identity cinematics for the same sequencing problem.

The app must not become visible while identity text/decorations are still hanging over the normal interface.

For every special identity cinematic:

- close iris
- black screen
- identity powers on
- details rise
- hold
- identity powers off
- details descend
- clear black state
- iris opens
- application visible

Do not let the identity name disappear after the main interface has already returned.

======================================================================
SECTION 25 — THEME POWER CUTSCENE COLOR BUG
======================================================================

The current theme-change cinematic has the source and destination cable colors reversed at the wrong moment.

Example bug:

Dark → Light

Current incorrect behavior:

the cable starts WHITE
then later becomes BLACK

This is conceptually backwards.

The cable initially belongs to the CURRENT theme.

After the new power connection completes, it belongs to the TARGET theme.

======================================================================
SECTION 26 — THEME POWER CUTSCENE COLOR RULE
======================================================================

Mandatory rule:

INITIAL CABLE COLOR = CURRENT THEME

FINAL CABLE COLOR = TARGET THEME

For standard Dark → Light:

START:
BLACK cable

connection completes

END:
WHITE cable

For standard Light → Dark:

START:
WHITE cable

connection completes

END:
BLACK cable

This same source/destination logic should work for other theme identities where applicable.

Do not hardcode only two arbitrary classes if the current theme engine has real design tokens.

Derive appropriate source and target styling from the actual theme state.

======================================================================
SECTION 27 — COLOR TRANSITION TIMING
======================================================================

The cable must NOT receive the target color before the physical/electrical transition has actually happened.

Expected conceptual sequence:

CURRENT THEME
↓
power-down
↓
source-colored cable appears
↓
cable rises
↓
cable bends
↓
plug approaches
↓
plug aligns
↓
plug inserts
↓
physical connection complete
↓
energy transition
↓
target color propagates
↓
target theme activates
↓
interface powers on

The power story must make visual sense.

======================================================================
SECTION 28 — PRESERVE THE PHYSICAL PLUG IMPROVEMENTS
======================================================================

Do not regress the HF1 physical connection work.

Preserve:

- cable originates from below
- cable remains continuous
- cable curves toward outlet
- plug remains attached to cable
- pins align with socket
- plug approaches
- plug inserts
- pins visually enter socket
- power event occurs only after insertion
- mobile retains bottom-origin concept
- reduced-motion remains understandable
- failure timeout removes overlay safely

I1 changes the color logic.

It must not break the physical choreography.

======================================================================
SECTION 29 — NEW GAME INDEX HEADER LOGO
======================================================================

The current top-left brand area contains:

- "Game Index" text
- an old G-like symbol with a line passing through it

The user now wants this replaced.

Create a new official Game Index header logo.

The old G symbol should no longer be the primary header brand.

======================================================================
SECTION 30 — LOGO DESIGN DIRECTION
======================================================================

The new logo should feel compatible with:

- Game Index
- games
- universes
- indexing/discovery
- system technology
- the restored I6 interface
- current theme engine

The logo should be:

- recognizable
- clean
- scalable
- readable at small sizes
- suitable for navigation
- suitable for dark and light themes
- suitable for PRO/Tester/Dev/Creator accents
- visually stronger than the old G mark
- not excessively detailed

Prefer a vector implementation.
SVG is strongly preferred where appropriate.

Do not depend on a large raster asset for the core navigation brand.

======================================================================
SECTION 31 — LOGO ARCHITECTURE
======================================================================

Create a single coherent Game Index brand identity.

Do NOT create unrelated logos for every theme.

The geometry remains consistent.

Theme/identity may modify:

- foreground color
- accent color
- small glow
- subtle technological highlight
- border/detail illumination

Do not completely redesign the logo when switching theme.

======================================================================
SECTION 32 — FULL AND COMPACT LOGO MODES
======================================================================

Support responsive brand presentation.

Desktop / sufficient width:

full Game Index logo/lockup may be shown.

Mobile / constrained width:

compact symbol may be shown.

Both versions must clearly belong to the same identity.

Do not use the old G symbol as the compact fallback.

======================================================================
SECTION 33 — LOGO THEME ADAPTATION
======================================================================

The logo must adapt to the active appearance.

Examples:

LIGHT THEME

- darker foreground where needed
- clean contrast
- controlled accent

DARK THEME

- lighter foreground where needed
- subtle illuminated accents

PRO

- green identity accent

TESTER

- blue identity accent

DEV

- red identity accent

CREATOR

- gold identity accent

The logo must remain readable.

Do not make the entire mark neon.

======================================================================
SECTION 34 — LOGO CLICK ALWAYS RETURNS HOME
======================================================================

The new Game Index logo is a global navigation anchor.

Clicking it should take the user directly to Home.

This behavior applies across:

- Settings
- Social
- Profile
- Admin
- Cinematics Center
- Universe Builder
- Creator areas
- Tester areas
- Dev areas
- internal tools
- normal authenticated pages

If already on Home:

the click may simply scroll/focus to the main Home state instead of performing an unnecessary destructive reload.

======================================================================
SECTION 35 — UNSAVED WORK PROTECTION
======================================================================

The logo-to-Home rule must not silently destroy unsaved work.

Example:

Universe Builder has unsaved manual edits.

User clicks Game Index logo.

If current architecture already tracks dirty state:

show the appropriate leave confirmation.

Do not create inconsistent custom confirmation logic when the project already has a shared unsaved-change system.

The default navigation rule remains:

LOGO → HOME

but destructive data loss must be prevented.

======================================================================
SECTION 36 — CONTEXT-AWARE TOP BAR
======================================================================

The top bar should become context-aware.

However:

DO NOT TURN IT INTO A SECOND COMPLETE SIDEBAR.

The intended rule is:

SIDEBAR
=
complete structural navigation

TOP BAR
=
navigation compass + context + a few high-value shortcuts

======================================================================
SECTION 37 — PURPOSE OF THE TOP BAR
======================================================================

The top bar should help answer:

1. Where am I?
2. What area am I working in?
3. What are the few most relevant destinations/actions from here?

It should provide orientation.

It should not contain everything.

======================================================================
SECTION 38 — TOP BAR INFORMATION ARCHITECTURE
======================================================================

A context-aware top bar may contain:

LEFT:

- Game Index adaptive logo

CONTEXT:

- current area
- current subsection when useful
- project/profile/context name where relevant

ACTIONS/NAVIGATION:

- a limited set of high-value shortcuts

Do not overload it.

======================================================================
SECTION 39 — HOME TOP BAR
======================================================================

On Home, global navigation remains appropriate.

Example conceptual structure:

[GAME INDEX LOGO]

Games
Dexter
Creator

and other truly important global destinations already present in the product.

Do not mechanically copy every sidebar item.

======================================================================
SECTION 40 — SETTINGS TOP BAR
======================================================================

Inside Settings, the top bar should orient the user to Settings.

Example:

[LOGO] Settings / Appearance

Useful contextual destinations/actions may include:

Themes
Preview
Reset

depending on actual existing Settings functionality.

Do not invent features just to fill the bar.

======================================================================
SECTION 41 — SOCIAL TOP BAR
======================================================================

Inside Social:

[LOGO] Social

or:

[LOGO] Social / Profile

Show only a few useful contextual destinations/actions that actually exist.

Examples may include:

Feed
Following
Profile

but use the repository's real Social architecture.

======================================================================
SECTION 42 — ADMIN TOP BAR
======================================================================

Inside Admin:

[LOGO] Admin / Current Section

Useful shortcuts may include the current high-level Admin context.

When inside Cinematics:

[LOGO] Admin / Cinematics

Possible quick actions:

Preview
Queue
Events

Do not duplicate the complete Admin sidebar.

======================================================================
SECTION 43 — UNIVERSE BUILDER TOP BAR
======================================================================

Inside Universe Builder:

[LOGO] Universe Builder / Project Name

Useful contextual shortcuts may include:

Preview
History
Publish

depending on actual Builder state.

Do not move the complete Builder Inspector/tree into the top bar.

The top bar remains a compass.

======================================================================
SECTION 44 — PROFILE TOP BAR
======================================================================

Inside Profile:

[LOGO] Social / Profile

or the most coherent current hierarchy.

Possible contextual actions:

Edit Profile
Activity
Share

only if these functions truly exist.

Do not add dead UI.

======================================================================
SECTION 45 — TOP BAR ITEM LIMIT
======================================================================

Keep the top bar restrained.

Conceptual maximum:

Desktop:
approximately 3–4 primary contextual actions.

Tablet:
approximately 2–3.

Mobile:
approximately 1–2 visible actions plus compact overflow/menu if required.

This is a design guideline, not a reason to hide critical navigation.

The sidebar remains the complete navigation source.

======================================================================
SECTION 46 — DO NOT DUPLICATE THE SIDEBAR
======================================================================

Avoid situations such as:

Sidebar:
10 destinations

Top bar:
same 10 destinations

That defeats the purpose.

The top bar should surface the most useful context.

The sidebar should contain the complete structure.

======================================================================
SECTION 47 — CONTEXT RESOLUTION
======================================================================

Do not hardcode independent random navigation logic in every page.

Prefer a shared context-aware navigation configuration.

Conceptually:

resolveNavigationContext(route, user, pageState)

may produce:

area
subsection
title
breadcrumbs/context
quick actions

Exact implementation must follow project style.

Avoid duplicated route maps scattered across many files.

======================================================================
SECTION 48 — TOP BAR TRANSITIONS
======================================================================

When switching major areas, contextual top bar content may transition subtly.

Example:

Home
→
Social

Old contextual items may fade/slide out briefly.

New context appears.

Keep transitions short.

Approximately:

150–250 ms

where appropriate.

This is NOT a cinematic.

Do not block interaction unnecessarily.

Respect reduced motion.

======================================================================
SECTION 49 — MOBILE TOP BAR
======================================================================

On mobile:

do not squeeze desktop navigation into a tiny horizontal row.

Possible composition:

[Logo] Social        [⋯]

or:

[←] Settings / Appearance    [action]

Use current project navigation patterns.

The logo should remain usable as Home navigation where space allows.

Contextual actions may move into a compact menu/drawer.

======================================================================
SECTION 50 — REPORT A BUG REWORK
======================================================================

The existing "Report a Bug" feature/menu should become a real integrated bug reporting pipeline.

The user-facing action must remain easy.

The administrator-facing result must become technically useful.

Core flow:

USER
↓
REPORT A BUG
↓
simple report form
↓
Game Index automatically collects safe diagnostics
↓
report is submitted
↓
ADMIN PANEL
↓
BUGS
↓
new structured bug case

======================================================================
SECTION 51 — NORMAL USERS MUST NOT ENTER ADMIN
======================================================================

Important security rule:

"Report a Bug" does NOT mean normal users are redirected into the Admin Panel.

Normal users must never gain Admin access because they reported a bug.

Instead:

the report is sent TO the Admin Bugs system.

The reporter remains in the normal product.

An authorized Admin can later view the report.

If an Admin submits a bug themselves, the interface may optionally provide a direct Admin link after submission.

======================================================================
SECTION 52 — USER-FACING BUG FORM
======================================================================

Keep the report form simple.

Possible fields:

TITLE

Short description of the problem.

DESCRIPTION

What happened?

EXPECTED BEHAVIOR

What did the user expect?

STEPS / WHAT WERE YOU DOING?

Optional reproduction information.

SCREENSHOT

Optional where current upload architecture safely supports it.

Do not force users to provide technical information that Game Index can collect automatically.

======================================================================
SECTION 53 — AUTOMATIC BUG DIAGNOSTICS
======================================================================

Automatically attach safe technical context where available.

Possible diagnostic groups:

APPLICATION

- Game Index release
- build identifier
- schema version
- route
- previous route
- current interface area
- current subsection

ACCOUNT CONTEXT

- internal user ID
- primary identity
- relevant capability summary
- subscription state
- theme
- locale

CLIENT

- browser family
- browser version where reliably available
- operating system/platform where safely detectable
- viewport size
- device class
- reduced-motion state

RUNTIME

- recent frontend errors
- relevant failed API requests
- HTTP status codes
- trace/request IDs
- feature state
- cinematic state if relevant
- Builder job state if relevant

REPORT

- report ID
- timestamp
- user-entered title
- description
- expected behavior
- reproduction information
- attachments

======================================================================
SECTION 54 — STRICT BUG REPORT PRIVACY
======================================================================

Never collect or expose:

- passwords
- password hashes
- session cookies
- auth tokens
- API keys
- setup codes
- environment secrets
- database passwords
- credential-bearing URLs
- private third-party tokens

Implement redaction.

If runtime logs can contain secrets, sanitize them before attaching them to a report.

Never assume a log line is safe just because it came from the application.

======================================================================
SECTION 55 — BUG IDs
======================================================================

Every report should receive a stable bug/case identifier.

Conceptual example:

GI-184

Use a format consistent with the current project.

Do not rely only on array position.

The identifier must remain stable across reloads.

======================================================================
SECTION 56 — ADMIN BUG DETAIL PAGE
======================================================================

Inside:

ADMIN
→ BUGS
→ BUG REPORT

show a complete report.

Conceptual structure:

BUG #GI-184

Title:
Welcome cinematic does not appear

Status:
NEW

Reported:
timestamp

Game Index:
Beta 0.991 I1

Area:
Cinematics

Route:
/profile.html

Reporter:
internal account reference

Primary identity:
FREE

Theme:
Dark

Browser:
Chrome

Viewport:
1920×1080

Then show:

- user report
- reproduction details
- automatic diagnostics
- related runtime errors
- request/trace references
- attachments
- history
- technical report

======================================================================
SECTION 57 — BUG STATUS WORKFLOW
======================================================================

Introduce or improve a real bug lifecycle.

Suggested statuses:

NEW

TRIAGED

REPRODUCED

CONFIRMED

FIXING

FIXED

VERIFIED

CLOSED

Additional useful states:

DUPLICATE

CANNOT REPRODUCE

NEEDS INFORMATION

Use the existing issue/bug architecture if it already has equivalents.

Do not duplicate status systems unnecessarily.

======================================================================
SECTION 58 — BUG HISTORY
======================================================================

Record meaningful bug events.

Example:

10:31
Report created

10:31
Automatic diagnostics attached

11:02
Admin marked REPRODUCED

11:08
Admin marked CONFIRMED

13:47
Fix reference added

14:20
Marked FIXED

16:10
Marked VERIFIED

Store:

- timestamp
- action
- authorized actor where appropriate
- safe metadata

Do not record secrets.

======================================================================
SECTION 59 — GENERATE DEVELOPER REPORT
======================================================================

Inside Admin Bugs, provide:

GENERATE DEVELOPER REPORT

This must generate a clean structured technical report suitable for development/debugging.

The report should be based on actual collected evidence.

Do not generate fictional diagnostics.

======================================================================
SECTION 60 — DEVELOPER REPORT FORMAT
======================================================================

A generated developer report may look conceptually like:

GAME INDEX BUG REPORT
GI-184

SUMMARY

Welcome cinematic failed to become visible after first login.

ENVIRONMENT

Game Index:
Beta 0.991 I1

Schema:
42

Browser:
Chrome

Platform:
Windows

Viewport:
1920×1080

Theme:
Dark

Primary identity:
FREE

LOCATION

/profile.html

USER ACTION

Created an account and entered Game Index.

EXPECTED

Welcome cinematic should play once.

OBSERVED

No visible Welcome cinematic appeared.

TECHNICAL EVIDENCE

- eligibility response
- cinematic event state
- asset loading state
- relevant client error
- relevant request status
- trace identifiers

POSSIBLE AFFECTED AREA

Only if evidence supports it.

Examples:

Cinematic Manager
Shell lifecycle
Cinematic stylesheet loader

REPRODUCTION

1. Create account.
2. Sign in.
3. Enter Game Index.
4. Observe first entry.

ATTACHMENTS

...

======================================================================
SECTION 61 — FACT VS HYPOTHESIS IN BUG REPORTS
======================================================================

The diagnostic system must distinguish:

CONFIRMED FACT

from:

POSSIBLE CAUSE

Do not write:

"CSS loader caused the issue"

unless evidence proves it.

Instead, if uncertain:

"Possible affected area: cinematic asset loading"

or:

"Potential correlation: stylesheet request failed"

This distinction is important.

======================================================================
SECTION 62 — COPY DEVELOPER REPORT
======================================================================

Provide:

COPY DEVELOPER REPORT

The report should be copied as clean Markdown or similarly portable structured text.

This allows the developer/user to paste a complete bug case into a development conversation without manually reconstructing the environment.

Do not include hidden secrets.

======================================================================
SECTION 63 — BUG SCREENSHOT SUPPORT
======================================================================

If screenshot attachments already exist or can be implemented safely:

support them.

But account for production storage persistence.

Do not save important report attachments only to ephemeral filesystem storage.

If persistent attachment storage is not available:

do not pretend screenshots are permanently stored.

Either implement persistent storage or clearly constrain the feature.

======================================================================
SECTION 64 — FRONTEND ERROR BUFFER
======================================================================

Consider maintaining a small bounded client-side diagnostic buffer for bug reporting.

It may contain only recent relevant technical events such as:

- uncaught application error summaries
- failed Game Index requests
- feature error codes
- trace IDs

Do NOT create huge continuous logs.

Do NOT log sensitive form values.

Do NOT record passwords.

Do NOT record private tokens.

Keep the buffer bounded and privacy-safe.

======================================================================
SECTION 65 — SERVER TRACE CORRELATION
======================================================================

Where the current backend already provides request IDs or trace IDs:

preserve and attach them to bug diagnostics.

If a lightweight trace ID system is appropriate and not already available, implement one consistently.

The goal is to correlate:

client report
↔
server logs

without exposing server internals to normal users.

======================================================================
SECTION 66 — BUG REPORT AUTHORIZATION
======================================================================

Normal authenticated users may submit bug reports.

Guest submission should follow current product rules.

Admin-only actions include:

- viewing full reports
- changing status
- seeing account references
- generating internal developer report
- resetting/replaying technical state where appropriate
- deleting/archiving reports if supported

Server-side authorization is mandatory.

Frontend hiding is not security.

======================================================================
SECTION 67 — BUG REPORT RATE LIMITING
======================================================================

Use existing rate limiting/security infrastructure.

Prevent easy spam.

Do not make the reporting flow so restrictive that legitimate users cannot report issues.

If an anti-spam system already exists, integrate with it.

======================================================================
SECTION 68 — ADMIN CINEMATICS + BUGS INTEGRATION
======================================================================

The new systems should work together.

Example:

A Welcome cinematic bug report arrives.

Admin opens the bug.

The diagnostic report indicates:

Area:
Cinematics

Cinematic event:
welcome_0991_i1

Admin can navigate to:

Admin → Cinematics

and preview that cinematic.

Do not create insecure automatic deep links that bypass capabilities.

Use normal authorized Admin navigation.

======================================================================
SECTION 69 — SHARED PRIMARY IDENTITY
======================================================================

Continue using a coherent primary identity resolver.

Do not allow:

cinematic = DEVprofile = PRO
header = Tester
Admin = Creator

because separate pages use separate logic.

Reuse the HF1 source of truth for account identity.

Primary visual identity must remain consistent.

======================================================================
SECTION 70 — HEADER IDENTITY + THEME CONSISTENCY
======================================================================

The new logo and top bar should respect:

- current theme
- current primary identity
- current section

but those concepts must not be confused.

Example:

User:
DEV

Manual selected theme:
Light

Header context:
Admin / Bugs

Then:

- logo remains readable in Light theme
- DEV identity may contribute controlled red accent
- navigation context says Admin / Bugs

Do not make identity override every visual rule.

======================================================================
SECTION 71 — DO NOT TURN PRO INTO A FUNCTION
======================================================================

Preserve the product model:

PRO is a paid account status/tier.

PRO is not a development function.

Tester, Dev and Creator remain functions/identities according to current project logic.

Do not rewrite permissions unnecessarily.

======================================================================
SECTION 72 — PERFORMANCE
======================================================================

I1 adds:

- adaptive top bar
- adaptive logo
- Admin Cinematics Center
- bug diagnostics
- persistence safeguards

Do not make the site unnecessarily heavier.

Audit:

- duplicate shell listeners
- duplicate route listeners
- cinematic initialization
- bug logging listeners
- MutationObservers
- navigation re-renders
- repeated theme calculations
- repeated identity calculations
- large error buffers
- Admin-only code loaded on public pages
- heavy diagnostic code loaded unnecessarily

Lazy-load Admin-specific systems where appropriate.

======================================================================
SECTION 73 — NEW LOGO PERFORMANCE
======================================================================

Prefer lightweight SVG/CSS.

Do not load multiple large assets for each theme.

Use shared geometry with theme variables where possible.

Avoid expensive infinite logo animations.

The header is always visible, so it must remain cheap.

======================================================================
SECTION 74 — ACCESSIBILITY
======================================================================

Maintain:

- keyboard navigation
- visible focus
- semantic buttons/links
- screen-reader labels
- sufficient contrast
- reduced motion
- responsive controls

The Game Index logo must be an accessible Home navigation control.

Example accessible name:

"Game Index — Home"

Do not make it a clickable div without semantics if a link is appropriate.

======================================================================
SECTION 75 — REDUCED MOTION
======================================================================

Cinematics must retain meaning in reduced-motion mode.

Welcome reduced-motion sequence may be:

- short close/fade
- black state
- Welcome illumination
- short hold
- illumination off
- return

Theme change reduced-motion sequence must still communicate:

old theme
→
connection/change
→
new theme

Do not leave users on long black screens.

======================================================================
SECTION 76 — ERROR HANDLING
======================================================================

New systems must fail safely.

If Cinematics Center cannot load:

show actionable Admin error.

Do not break whole Admin.

If bug diagnostics cannot collect one field:

submit the report with available data.

Do not block reporting because browser version detection failed.

If persistent database is unavailable:

do not silently create a fake clean production database.

If contextual navigation configuration fails:

fall back to a safe basic header.

Never permanently block the site.

======================================================================
SECTION 77 — LOGGING
======================================================================

Useful safe logs may include:

Account storage:

- database mode
- migration start/end
- persistent storage validation
- connection failure

Cinematics:

- event eligibility
- preview started
- event started
- event completed
- timeout recovery

Bug reporting:

- report created
- report diagnostic collection completed
- report status changed
- report export generated

Navigation:

Avoid noisy logs for every mouse movement or every top-bar render.

Never log:

- passwords
- tokens
- setup codes
- database credentials
- secret environment variables

======================================================================
SECTION 78 — DATABASE MIGRATION
======================================================================

I1 will likely require a new migration.

Do not edit already-shipped migrations as if they never existed.

Potential new persistent requirements include:

- improved bug report records
- bug status/history
- diagnostic metadata
- attachment metadata
- cinematic event version changes if needed
- persistent storage configuration metadata if architecture requires it

Use additive migration where possible.

Migration must be safe for HF1 databases.

======================================================================
SECTION 79 — MIGRATION SAFETY
======================================================================

Never:

DROP all users

TRUNCATE accounts

reset passwords

delete profiles

delete roles

delete subscriptions

delete cinematic history

delete Builder projects

delete Social data

delete existing bug reports

Existing production data must survive.

======================================================================
SECTION 80 — VERSION / SCHEMA
======================================================================

Determine the next schema number from the repository's actual current migration state.

Do not guess blindly.

If HF1 production is schema 41, the next migration would normally be schema 42.

But verify before implementation.

Visible release identity remains:

Beta 0.991 I1

Package semantic version should follow the repository's current package-version convention.

Do not create an inconsistent versioning scheme.

======================================================================
SECTION 81 — ACCOUNT PERSISTENCE ADMIN VISIBILITY
======================================================================

Authorized Admin/System interfaces should make it obvious whether production storage is safe.

Example:

Account Storage
Persistent

Database
Connected

Schema
42

Do not expose connection credentials.

This prevents future situations where the site appears healthy while accounts are stored in temporary storage.

======================================================================
SECTION 82 — PRODUCTION STARTUP VALIDATION
======================================================================

At startup in production, validate:

- database configuration
- storage persistence mode
- database connection
- schema compatibility
- migrations
- required environment configuration

Do not expose secrets in startup errors.

Do not proceed into a dangerous empty production state silently.

======================================================================
SECTION 83 — PROVIDER-NEUTRAL STORAGE LANGUAGE
======================================================================

Continue the HF1 rule:

Do not write:

"Configure this in Render"

throughout product UI unless the information is specifically about Render deployment docs.

Prefer:

Persistent Database
Deployment Environment
Environment Variable
Persistent Storage

Game Index should remain portable.

======================================================================
SECTION 84 — ENVIRONMENT DOCUMENTATION
======================================================================

Document exactly what production administrators must configure.

Examples of concepts:

DATABASE_URL

GAMEINDEX_DB

GAMEINDEX_DATA_DIR

or new provider-specific adapter configuration

depending on actual implementation.

Do not invent environment variables if existing names already solve the problem.

Document only the real implemented configuration.

.env.example must contain safe placeholders only.

======================================================================
SECTION 85 — NO SECRETS IN PACKAGES
======================================================================

Do not include:

.env

production DB

SQLite user database

database credentials

API keys

setup codes

mail credentials

session secrets

private tokens

credential-bearing URLs

in FULL or UPDATE_ONLY package.

======================================================================
SECTION 86 — AUTHENTICATION REGRESSION
======================================================================

Account persistence work must not break authentication.

Test:

- registration
- login
- logout
- session persistence
- protected page
- unauthorized page
- account reload after restart
- password verification after restart
- Admin authorization
- Creator authorization
- Tester authorization
- Dev authorization
- PRO subscription behavior

======================================================================
SECTION 87 — CINEMATIC CENTER SECURITY TEST
======================================================================

Test:

Normal user:
cannot access Admin Cinematics routes/APIs.

Admin:
can preview.

Preview:
does not mark event complete.

Reset eligibility:
requires authorized account and confirmation.

Direct API access by unauthorized user:
403 or correct authorization failure.

======================================================================
SECTION 88 — WELCOME CINEMATIC TEST
======================================================================

Test the complete I1 sequence.

Verify:

- interface initially visible
- iris closes
- black state exists
- Welcome appears only after close
- Welcome powers on
- technological details rise
- details are not random wires
- Welcome powers off
- Welcome is completely gone
- details descend
- details are completely gone
- iris opens
- interface returns
- no Welcome overlay remains
- focus restored
- overlay removed
- cinematic completion recorded
- no replay on normal next login unless event intentionally reset

======================================================================
SECTION 89 — WELCOME TIMELINE ASSERTION
======================================================================

Explicitly test:

At the first frame where the normal app becomes visible again:

Welcome text opacity/visibility must already be OFF.

Decorative cinematic layer must already be cleared.

Do not rely only on human visual inspection.

Where practical, add DOM/state assertions.

======================================================================
SECTION 90 — IDENTITY CINEMATIC TEST
======================================================================

Test:

PRO:
green

Tester:
blue

Dev:
red

Creator:
gold

For each:

- iris closes
- black state
- identity lights on
- correct decorations
- identity lights off
- decorations leave
- iris opens
- target theme active
- overlay cleaned
- event persisted correctly

======================================================================
SECTION 91 — THEME COLOR TRANSITION TEST
======================================================================

Mandatory tests:

DARK → LIGHT

Initial cable:
dark/black

After completed power transfer:
light/white

LIGHT → DARK

Initial cable:
light/white

After completed power transfer:
dark/black

Assert target color is not applied too early.

======================================================================
SECTION 92 — THEME PHYSICAL TEST
======================================================================

Also preserve HF1 tests:

- cable originates below
- continuous bend
- plug attached
- pin alignment
- insertion
- power after insertion
- responsive
- reduced motion
- timeout recovery

======================================================================
SECTION 93 — HEADER LOGO TEST
======================================================================

Test:

- old G mark no longer primary
- new logo loads
- logo works in Dark
- logo works in Light
- PRO accent
- Tester accent
- Dev accent
- Creator accent
- desktop full presentation
- mobile compact presentation
- keyboard activation
- accessible label
- logo click from Settings → Home
- logo click from Social → Home
- logo click from Admin → Home
- logo click from Builder → Home with unsaved-change protection

======================================================================
SECTION 94 — TOP BAR CONTEXT TEST
======================================================================

Test representative areas:

Home

Settings

Settings / Appearance

Social

Profile

Admin

Admin / Cinematics

Admin / Bugs

Universe Builder

Creator area

Tester area

Verify:

- correct context
- appropriate limited actions
- sidebar not duplicated
- route updates correctly
- no stale context after navigation
- mobile layout remains usable

======================================================================
SECTION 95 — TOP BAR SECURITY
======================================================================

The contextual top bar must never surface unauthorized tools merely because a route configuration contains them.

Respect capability checks.

Example:

Normal user should not receive:

Admin
Database Explorer
Creator Control

quick actions.

Server-side APIs remain protected regardless of UI.

======================================================================
SECTION 96 — BUG REPORT SUBMISSION TEST
======================================================================

Test normal user flow:

1. User opens Report a Bug.
2. Completes simple form.
3. Sends report.
4. Receives success confirmation/reference ID.
5. Remains outside Admin.
6. Admin opens Bugs.
7. New report exists.
8. Technical metadata exists.
9. No secrets exist.
10. Reporter account is not modified.

======================================================================
SECTION 97 — BUG REPORT PRIVACY TEST
======================================================================

Inject/prepare logs containing sensitive-looking test values.

Confirm developer report does NOT expose:

- test password
- Authorization header
- cookies
- API key
- setup secret
- DB credential

Test redaction.

======================================================================
SECTION 98 — BUG REPORT DEVELOPER EXPORT TEST
======================================================================

Generate developer report.

Verify:

- report ID
- summary
- environment
- route
- expected behavior
- observed behavior
- technical evidence
- trace IDs where available
- reproduction
- attachments metadata
- no secrets

Verify Copy Developer Report works.

======================================================================
SECTION 99 — BUG STATUS/HISTORY TEST
======================================================================

Create report.

Move:

NEW
→
TRIAGED
→
REPRODUCED
→
CONFIRMED
→
FIXING
→
FIXED
→
VERIFIED
→
CLOSED

Verify history timestamps and state.

Test:

DUPLICATE
NEEDS INFORMATION
CANNOT REPRODUCE

if implemented.

======================================================================
SECTION 100 — EXISTING BUG DATA
======================================================================

If the current Game Index already stores bug reports:

preserve them.

Migrate old reports into the new structure where possible.

Do not delete them because the schema improved.

Legacy reports may have less diagnostic data.

Display that honestly.

======================================================================
SECTION 101 — EXISTING USERS AFTER I1
======================================================================

Existing users must remain existing users.

The I1 deployment must NOT require account recreation.

Existing login credentials should continue working.

Existing account identity should continue working.

Existing cinematic state should migrate safely.

If I1 introduces a new Welcome cinematic version intended to be shown once after the update:

eligibility must be determined by event versioning, not by deleting account history.

======================================================================
SECTION 102 — NEW USERS AFTER I1
======================================================================

A new account must:

- be stored persistently
- survive restart/deploy
- receive Welcome cinematic once
- receive appropriate primary identity intro if already eligible
- preserve completed cinematic state across browsers/instances according to current account event architecture

======================================================================
SECTION 103 — SOCIAL / PROFILE REGRESSION
======================================================================

Verify:

- Social loads
- profile loads
- follow state works
- activity works where applicable
- top bar context does not break Social
- new header logo does not break profile layout
- account persistence does not break social ownership references

======================================================================
SECTION 104 — UNIVERSE BUILDER REGRESSION
======================================================================

I1 is not a Builder rewrite.

Do not regress V3.

Test:

- project load
- Universe Tree
- Live Preview
- Inspector
- manual edit protection
- history
- auto-recovery
- Needs You
- Creative Director
- Quality Center
- publish readiness
- mobile Builder
- existing universe compatibility

======================================================================
SECTION 105 — BUILDER TOP BAR INTEGRATION
======================================================================

The new contextual top bar should enhance Builder orientation.

Do not compete with:

Universe Tree
Inspector
Builder workspace navigation

Use top bar only for high-value Builder context/actions.

======================================================================
SECTION 106 — HOME BRAND EXPERIENCE
======================================================================

The new adaptive logo must feel like the official Game Index brand.

The Home header should no longer look like:

old G icon
+
plain text "Game Index"

It should feel like one intentional brand system.

Do not overdecorate.

======================================================================
SECTION 107 — CSS STRATEGY
======================================================================

Do not stack endless !important rules.

Audit current HF1 CSS.

Create I1 styles with clear scope.

Refactor shared header/cinematic variables where necessary.

Prefer reusable CSS variables for:

- logo foreground
- logo accent
- theme cable source
- theme cable target
- identity accent
- top-bar context states

Do not create cascading chaos.

======================================================================
SECTION 108 — JAVASCRIPT STRATEGY
======================================================================

Avoid:

- duplicate route listeners
- duplicate cinematic managers
- repeated event handlers after SPA/context changes
- global polling for current route
- repeated expensive capability fetches
- repeated identity fetches

Use the existing lifecycle architecture.

If navigation is not SPA-based, adapt correctly to page loads.

If it is partially dynamic, handle lifecycle cleanly.

======================================================================
SECTION 109 — BUG DIAGNOSTIC DATA MODEL
======================================================================

Use a structured data model.

Do not store one giant uncontrolled string if structured fields are practical.

Possible concepts:

bug_report

- id
- reporter_user_id
- title
- description
- expected_behavior
- reproduction
- status
- route
- area
- app_version
- schema_version
- theme
- primary_identity
- locale
- created_at
- updated_at

bug_diagnostic

- bug_id
- category
- key
- sanitized_value

bug_history

- bug_id
- actor_user_id
- action
- old_state
- new_state
- created_at

attachment metadata if supported.

Exact schema must follow current database conventions.

======================================================================
SECTION 110 — DIAGNOSTIC SIZE LIMITS
======================================================================

Do not attach megabytes of logs to every bug.

Use limits.

Examples:

- recent errors only
- recent relevant requests only
- bounded textual fields
- no entire localStorage dump
- no entire database dump
- no full HTML document dump

The report should be useful, not enormous.

======================================================================
SECTION 111 — DO NOT EXPOSE PRIVATE AI CHAIN OF THOUGHT
======================================================================

Bug reports may include:

- subsystem status
- structured AI errors
- job state
- trace identifiers
- failure reason
- public/structured reasoning summary if already designed for exposure

Do NOT include private hidden chain-of-thought.

This continues the existing Game Index AI safety architecture.

======================================================================
SECTION 112 — ADMIN NAVIGATION
======================================================================

Do not lose the restored Admin navigation from HF1.

The new Cinematics area and improved Bugs area must integrate into the existing Admin information architecture.

Do not create an entirely separate Admin application.

======================================================================
SECTION 113 — ADMIN RESPONSIVE DESIGN
======================================================================

Cinematics Center and Bugs detail pages must remain usable on tablet/mobile where Admin currently supports them.

Do not compress desktop layouts into unreadable three-column views.

Use drawers/tabs/stacked panels where necessary.

======================================================================
SECTION 114 — CINEMATICS PREVIEW UI
======================================================================

A useful Cinematics Center could conceptually present:

CINEMATICS

Preview

Welcome
PRO
Tester
DEV
Creator
Theme Change

Simulation
Current Theme → Light
Current Theme → Dark
FREE → PRO
PRO → Tester
Tester → DEV
Creator

Debug

Primary identity
Current theme
Pending events
Completed events
Queue
Reduced motion

Do not create controls that cannot function.

======================================================================
SECTION 115 — CINEMATIC PREVIEW MUST NOT SAVE
======================================================================

This rule is mandatory:

PREVIEW ≠ COMPLETION

When an Admin previews Welcome:

do not insert a completed Welcome event.

When an Admin previews DEV:

do not change account identity to DEV.

When an Admin previews Theme Change:

do not permanently overwrite theme unless explicitly using a separate real-action mode.

======================================================================
SECTION 116 — THEME CHANGE SIMULATION
======================================================================

Theme Change preview should support choosing:

FROM:
current/source theme

TO:
target theme

This will make the source/target cable-color bug easy to test.

Allow at minimum:

Dark → Light
Light → Dark

and actual available identity themes if compatible.

======================================================================
SECTION 117 — CINEMATIC DEBUG VISIBILITY
======================================================================

Cinematics Center may expose safe debug details such as:

Event key
State
Eligible
Started
Completed
Theme source
Theme target
Primary identity
Reduced motion
Last error
Last timeout recovery

Do not expose secrets.

======================================================================
SECTION 118 — USER EXPERIENCE AFTER CINEMATIC
======================================================================

After any cinematic:

- normal UI is fully usable
- no stale overlay
- no pointer-events lock
- body scrolling restored
- focus restored
- theme correct
- top bar correct
- logo correct
- sidebar correct

No reload should be necessary.

======================================================================
SECTION 119 — HOME NAVIGATION CONSISTENCY
======================================================================

The new logo becomes the universal Home anchor.

Do not add inconsistent behavior such as:

Settings logo → Home
Social logo → Social root
Admin logo → Admin root

The logo means:

GAME INDEX HOME

Context breadcrumbs/labels handle section navigation separately.

======================================================================
SECTION 120 — BREADCRUMB / CONTEXT STYLE
======================================================================

The top bar may show compact hierarchy such as:

Settings / Appearance

Admin / Cinematics

Admin / Bugs

Social / Profile

Universe Builder / Project Name

Do not show huge breadcrumb chains.

The purpose is orientation.

======================================================================
SECTION 121 — TOP BAR SHOULD NOT BECOME CLUTTER
======================================================================

Do not fill the header with:

logo
breadcrumbs
8 tabs
profile
search
notifications
music
admin tools
Builder controls

all simultaneously.

Prioritize.

Preserve visual breathing room.

The header should feel more useful, not more crowded.

======================================================================
SECTION 122 — BRAND + CONTEXT BALANCE
======================================================================

The new logo must remain visually stable while the contextual text/actions change.

The user should always recognize:

"This is Game Index"

while also seeing:

"I am currently in Admin / Bugs"

Do not change the logo itself into the name of every section.

======================================================================
SECTION 123 — CURRENT THEME AS SOURCE OF VISUAL TOKENS
======================================================================

Do not duplicate theme colors manually across many systems.

Whenever possible, derive:

- logo appearance
- header accent
- theme cinematic cable
- identity highlight

from shared theme tokens.

This prevents another source/target inversion bug.

======================================================================
SECTION 124 — MANUAL THEME CONTROL REMAINS
======================================================================

Do not remove Appearance.

Identity cinematics may introduce a theme.

Users may still manually select themes according to existing product rules.

The new logo follows the current selected theme.

======================================================================
SECTION 125 — DEPLOYMENT WORKFLOW
======================================================================

The release should remain compatible with the user's simple workflow:

UPDATE_ONLY
↓
copy over local GameIndex repository
↓
GitHub Desktop
↓
Commit
↓
Push
↓
GitHub
↓
deployment environment

Do not require the user to manually edit dozens of files after applying UPDATE_ONLY.

If new environment configuration is required for persistent storage, document it very clearly.

======================================================================
SECTION 126 — UPDATE_ONLY SAFETY
======================================================================

Generate an UPDATE_ONLY package that upgrades:

Beta 0.991 HF1
→
Beta 0.991 I1

Include:

- changed files
- new files
- migrations
- package changes if needed
- clear README
- environment/storage migration instructions

Do not include production secrets.

======================================================================
SECTION 127 — FULL PACKAGE
======================================================================

Also generate a complete deployable FULL package:

GAME INDEX BETA 0.991 I1 FULL

Do not include:

- node_modules
- .env
- production database
- credentials
- caches
- temp files
- local logs

======================================================================
SECTION 128 — DOCUMENTATION REQUIRED
======================================================================

Create/update:

MASTER_PROMPT_BETA_0.991_I1.md

RELEASE_NOTES_BETA_0.991_I1.md

MIGRATION_REPORT_BETA_0.991_I1.md

TEST_REPORT_BETA_0.991_I1.md

PACKAGE_VALIDATION_BETA_0.991_I1.md

UPDATE_ONLY_README_0.991_I1.md

FULL_DEPLOY_README_BETA_0.991_I1.md

BETA_0.991_I1_CHANGED_FILES.txt

Also document:

- production persistence configuration
- database migration procedure
- rollback considerations
- Admin Cinematics Center
- bug reporting flow
- new header/navigation behavior

======================================================================
SECTION 129 — RELEASE NOTES CONTENT
======================================================================

Release notes must clearly mention:

ACCOUNT PERSISTENCE

PRODUCTION STORAGE SAFETY

CINEMATIC VISIBILITY FIX INTEGRATED

ADMIN CINEMATICS CENTER

WELCOME CINEMATIC REWORK

TECHNOLOGICAL CINEMATIC DETAILS

THEME POWER CUTSCENE SOURCE/TARGET COLOR FIX

NEW ADAPTIVE GAME INDEX LOGO

LOGO → HOME NAVIGATION

CONTEXT-AWARE TOP BAR

NAVIGATION COMPASS

INTEGRATED BUG REPORTING

AUTOMATIC BUG DIAGNOSTICS

ADMIN BUG WORKFLOW

DEVELOPER BUG REPORT EXPORT

PRIVACY/SECRET REDACTION

======================================================================
SECTION 130 — MIGRATION REPORT CONTENT
======================================================================

State:

- previous schema
- new schema
- new tables/columns/indexes
- persistent storage changes
- compatibility with existing users
- compatibility with existing cinematics
- compatibility with old bug reports
- no account reset
- no password reset
- no role reset
- no Builder reset

If a database backend migration is introduced:

document exact migration behavior.

======================================================================
SECTION 131 — TEST REPORT CONTENT
======================================================================

Report actual test commands.

Report:

passed
failed
warnings
manual checks
production-storage validation

Do not write:

"should pass."

Run the tests.

======================================================================
SECTION 132 — REGRESSION BASELINE
======================================================================

Before I1 changes:

run the current HF1 test baseline.

After implementation:

run I1 tests plus relevant historical regression tests.

Do not weaken unrelated tests merely to make the suite green.

======================================================================
SECTION 133 — HTTP SMOKE TEST
======================================================================

Run a real server smoke test when environment/dependencies permit.

Test:

GET /
login page
registration
API health
static CSS
static JS
Admin authorization
cinematic endpoints
bug report submission endpoint
database connectivity

Do not mark HTTP smoke PASS if it was not actually executed.

======================================================================
SECTION 134 — PRODUCTION RESTART TEST
======================================================================

This release specifically requires restart validation.

Production-like test:

Start.
Create account.
Stop.
Start again.
Login.

If account disappears:

release is not complete.

======================================================================
SECTION 135 — PRODUCTION EMPTY-DATABASE SAFETY TEST
======================================================================

Simulate production with missing/invalid persistent DB configuration.

The application must NOT silently create a temporary database and look healthy.

Confirm safe failure/maintenance behavior.

======================================================================
SECTION 136 — TOP BAR VISUAL QUALITY
======================================================================

The adaptive top bar must feel native to the restored I6 interface.

Do not make it look like an unrelated dashboard framework.

Maintain:

- existing spacing language
- panel rhythm
- typography hierarchy
- current theme system
- Game Index identity

======================================================================
SECTION 137 — LOGO VISUAL QUALITY
======================================================================

The new logo should not feel like:

- generic letter icon
- random AI startup logo
- esports badge
- cryptocurrency symbol
- overcomplicated emblem

It should feel like Game Index.

The visual design should be simple enough to remain recognizable at navigation size.

======================================================================
SECTION 138 — BUG CENTER VISUAL QUALITY
======================================================================

Admin Bugs should prioritize readability.

A bug report can be complex.

Use clear grouping:

Summary

User Report

Environment

Runtime Evidence

History

Developer Report

Attachments

Avoid one giant raw JSON dump as the main interface.

Raw structured data may exist in an expandable technical view if useful.

======================================================================
SECTION 139 — BUG REPORT USER SUCCESS STATE
======================================================================

After successful submission:

show a concise confirmation.

Example concept:

Bug reported.
Reference: GI-184

Do not expose Admin details.

The user may optionally copy the reference ID.

======================================================================
SECTION 140 — BUG FOLLOW-UP
======================================================================

If the current architecture supports showing a user's own report status safely, it may be integrated.

However, do not expand scope into a full public issue tracker unless it fits naturally.

The core I1 requirement is:

user reports
→
Admin receives complete case.

======================================================================
SECTION 141 — NO FAKE ROOT CAUSE
======================================================================

Automatic diagnostics must never fabricate a cause.

This is critical.

Allowed:

"Request /api/... returned 500."

Allowed:

"Cinematic stylesheet request was not observed."

Allowed:

"Possible affected subsystem: Cinematic Manager."

Not allowed:

"The Cinematic Manager is definitely broken."

unless supported by real evidence.

======================================================================
SECTION 142 — NO RAW STACK TRACES TO NORMAL USERS
======================================================================

Normal user report UI should remain understandable.

Internal stack traces can be stored/admin-visible if safely sanitized.

Do not dump developer internals to the reporter.

======================================================================
SECTION 143 — BUG DUPLICATES
======================================================================

If implementing duplicate detection:

use it only as an aid.

Do not automatically discard a user's report because another title sounds similar.

At most:

suggest possible duplicate to Admin.

Preserve evidence.

======================================================================
SECTION 144 — CINEMATIC QUEUE PRESERVATION
======================================================================

Do not break the HF1 cinematic queue.

Existing user after relevant I1 eligibility may conceptually receive:

Welcome I1
then
current special identity intro

if product eligibility/versioning requires it.

Do not overlap fullscreen layers.

======================================================================
SECTION 145 — CINEMATIC INTERRUPTION
======================================================================

Preserve safe interruption handling:

- refresh
- route navigation
- JS error
- page hidden
- slow browser
- animation event missing

No permanent blackout.

======================================================================
SECTION 146 — STORAGE + CINEMATICS
======================================================================

Cinematic completion state is account data.

It must use the new persistent account-safe storage.

Do not fix account persistence but leave cinematic history on an ephemeral local file.

======================================================================
SECTION 147 — STORAGE + BUG REPORTS
======================================================================

Bug reports are important product data.

They must also use persistent storage.

Do not save them only to temporary filesystem files.

======================================================================
SECTION 148 — STORAGE + ATTACHMENTS
======================================================================

If attachments cannot be persistently stored:

either implement durable storage

or explicitly disable/present them as temporary.

Do not promise permanent screenshots that disappear on redeploy.

======================================================================
SECTION 149 — STORAGE + BUILDER
======================================================================

Ensure persistence changes do not disconnect Builder ownership/data.

Existing universes must still belong to the correct accounts.

Do not regenerate ownership IDs.

======================================================================
SECTION 150 — STORAGE + SOCIAL
======================================================================

Preserve:

- profiles
- follows
- social state
- activities

through the persistence migration.

======================================================================
SECTION 151 — FIRST ADMIN BOOTSTRAP
======================================================================

Preserve the secure first-admin setup system.

Do not reset Admin because storage architecture changes.

Do not expose setup codes.

Do not make bootstrap available permanently.

Provider-neutral wording remains.

======================================================================
SECTION 152 — DEVELOPMENT DATABASE
======================================================================

Local development should remain convenient.

A developer should still be able to use local SQLite if that is the current architecture.

Do not require a paid/cloud database just to run unit tests locally.

The production safety requirement should be environment-aware.

======================================================================
SECTION 153 — TEST DATABASE
======================================================================

Tests must use isolated database data.

Do not accidentally connect test suite to production.

Do not include a production database in test fixtures.

======================================================================
SECTION 154 — ADMIN CINEMATICS AUDIT LOG
======================================================================

Real persistent Admin actions such as:

Reset cinematic eligibility

should be auditable.

Preview-only actions need not necessarily create noisy permanent audit records unless current Admin audit architecture already does.

Use judgment.

======================================================================
SECTION 155 — BUG ADMIN AUDIT
======================================================================

Status changes and destructive report actions should record actor/timestamp where appropriate.

Do not allow unauthorized users to modify bug state.

======================================================================
SECTION 156 — HEADER CACHE / STALE STATE
======================================================================

Ensure context-aware navigation does not show stale state after:

login
logout
role change
theme change
route change
language change

Recalculate only when needed.

Avoid unnecessary continuous polling.

======================================================================
SECTION 157 — LOGO LIVE THEME UPDATE
======================================================================

When the user changes Appearance:

the logo should update to the new theme without requiring a reload.

During the theme cinematic:

source logo/theme state should remain coherent.

After power transition:

target logo style should be active.

======================================================================
SECTION 158 — LOGO DURING CINEMATIC
======================================================================

Do not leave the header logo visible above a fullscreen cinematic due to z-index errors.

Fullscreen cinematic layers must properly cover the normal interface.

After cinematic cleanup:

logo returns normally.

======================================================================
SECTION 159 — CONTEXT BAR DURING CINEMATIC
======================================================================

Same rule for contextual top bar.

It must not visually leak over fullscreen cinematic overlays.

======================================================================
SECTION 160 — Z-INDEX ARCHITECTURE
======================================================================

Review z-index layers for:

header
sidebar
menus
modals
cinematics
theme cutscene
Admin overlays
Builder overlays

Avoid random extremely high z-index values scattered across files.

Use a coherent layering model where feasible.

======================================================================
SECTION 161 — MANUAL CINEMATIC PREVIEW ESCAPE
======================================================================

Admin preview should include a safe way to exit if testing fails.

For example:

Escape key
or safe timeout

Do not trap Admin in a broken fullscreen preview.

Production account-triggered cinematic behavior can remain automatic according to current rules.

======================================================================
SECTION 162 — THEME CUTSCENE ADMIN PREVIEW
======================================================================

The Cinematics Center is the ideal place to test the source-color bug.

Provide clear source/target indicators.

Example:

Source:
Dark

Target:
Light

Expected cable:

Start:
Black

After transfer:
White

This makes future regressions easier to detect.

======================================================================
SECTION 163 — CINEMATIC TEST MODE INDICATOR
======================================================================

When running an Admin preview, consider a subtle debug/test indicator outside the core cinematic or before execution.

Do not contaminate the cinematic itself with giant "TEST MODE" text.

The preview should visually match production.

======================================================================
SECTION 164 — BUG REPORT AREA DETECTION
======================================================================

Automatically categorize area based on actual context where possible.

Examples:

Cinematics
Appearance
Social
Profile
Admin
Universe Builder
Authentication
Home
Games
Dexter
Creator
Tester
System

Do not force users to know internal module names.

======================================================================
SECTION 165 — BUG REPORT RELEVANT STATE
======================================================================

Attach feature-specific state only when relevant.

Example:

If bug occurs in Cinematics:

include cinematic queue/event state.

If bug occurs in Builder:

include Builder stage/job/state.

If bug occurs in Social:

do not attach a huge Builder snapshot.

Keep reports focused.

======================================================================
SECTION 166 — BUG REPORT ROUTE HISTORY
======================================================================

A very short recent route history may help reproduction.

Example:

/login
→
/
/profile

Keep it bounded.

Do not build invasive browsing history tracking.

======================================================================
SECTION 167 — BUG REPORT EVENT TIMING
======================================================================

Include timestamps around relevant failures where available.

This helps correlate with server logs.

Use consistent timestamp format.

======================================================================
SECTION 168 — BUG REPORT CLIENT TIME VS SERVER TIME
======================================================================

Where useful, store server receive time as canonical.

Client timestamp may be included as supplemental metadata.

Do not rely only on client clock.

======================================================================
SECTION 169 — BUG REPORT USER ID PRIVACY
======================================================================

Normal reporter success page should not expose internal numeric IDs unnecessarily.

Admin may see internal account reference.

Developer export should use safe account reference.

Do not expose credentials.

======================================================================
SECTION 170 — BUG ATTACHMENT SECURITY
======================================================================

If image upload exists:

validate type
validate size
sanitize filename
prevent executable upload
store safely
serve with correct content type

Do not allow arbitrary HTML/JS execution from attachments.

======================================================================
SECTION 171 — NAVIGATION UNSAVED STATE
======================================================================

Contextual quick actions and logo Home link must respect unsaved-state guards consistently.

Do not protect only the logo while other top-bar shortcuts bypass the same guard.

======================================================================
SECTION 172 — KEYBOARD NAVIGATION
======================================================================

Users must be able to navigate:

logo
context actions
overflow menu
Admin Cinematics controls
bug report form
Admin bug status controls

using keyboard.

======================================================================
SECTION 173 — RESPONSIVE CINEMATICS CENTER
======================================================================

Desktop:

preview list + details/debug may use multi-panel layout.

Mobile:

use stacked views/tabs.

Do not shrink everything.

======================================================================SECTION 174 — RESPONSIVE BUG CENTER
======================================================================

Desktop:

bug list + bug details can use a split layout if current Admin supports it.

Mobile:

bug list and detail should become navigable separate states.

No horizontal overflow required for basic use.

======================================================================
SECTION 175 — RELEASE SCOPE PRINCIPLE
======================================================================

Beta 0.991 I1 is a refinement release.

Do not use it to redesign unrelated Game Index systems.

However:

do not leave major correctness defects in directly affected systems merely because they are inconvenient.

Focus on:

reliability
cinematics
branding
navigation
bug diagnostics

======================================================================
SECTION 176 — IMPLEMENTATION ORDER
======================================================================

Recommended implementation order:

PHASE 1
Repository audit and HF1 regression baseline.

PHASE 2
Audit current production database path and storage behavior.

PHASE 3
Implement production-safe account persistence architecture.

PHASE 4
Create/migrate required database schema.

PHASE 5
Test account persistence across restart.

PHASE 6
Absorb Cinematic Visibility Fix into official runtime.

PHASE 7
Implement Admin Cinematics Center.

PHASE 8
Rework Welcome cinematic choreography.

PHASE 9
Review identity cinematic shutdown/open timing.

PHASE 10
Fix theme power cutscene source/target colors.

PHASE 11
Create new adaptive Game Index logo.

PHASE 12
Integrate logo into header.

PHASE 13
Implement logo Home navigation.

PHASE 14
Implement context-aware navigation compass.

PHASE 15
Integrate contexts for Home, Settings, Social, Profile, Admin, Builder and other major areas.

PHASE 16
Rework Report a Bug user flow.

PHASE 17
Implement persistent bug report data model.

PHASE 18
Implement safe automatic diagnostics.

PHASE 19
Implement Admin Bugs detail/report workflow.

PHASE 20
Implement developer report generation/copy.

PHASE 21
Security/privacy/redaction validation.

PHASE 22
Responsive/accessibility pass.

PHASE 23
Full regression testing.

PHASE 24
Documentation.

PHASE 25
FULL + UPDATE_ONLY packaging.

The implementation may reorder dependent tasks when necessary.

No major scope item may be silently omitted.

======================================================================
SECTION 177 — COMPLETION CRITERIA
======================================================================

This release is complete only when:

[ ] Existing accounts survive application restart.

[ ] Existing accounts survive deployment-like restart conditions.

[ ] Production cannot silently use unsafe ephemeral account storage.

[ ] Existing passwords remain valid.

[ ] Existing profiles remain.

[ ] Existing roles/functions remain.

[ ] Existing cinematic history remains.

[ ] Cinematic Visibility Fix is officially integrated.

[ ] Admin Cinematics Center exists.

[ ] Admin can preview Welcome.

[ ] Admin can preview PRO.

[ ] Admin can preview Tester.

[ ] Admin can preview DEV.

[ ] Admin can preview Creator.

[ ] Admin can preview Theme Change.

[ ] Preview does not modify persistent completion state.

[ ] Controlled cinematic eligibility reset exists.

[ ] Welcome iris closes correctly.

[ ] Welcome appears on black only.

[ ] Welcome powers on.

[ ] Technological details rise.

[ ] Details no longer look like random wires.

[ ] Welcome powers off before iris reopening.

[ ] Details descend before iris reopening.

[ ] Interface returns with no cinematic text remaining.

[ ] PRO intro remains green.

[ ] Tester intro remains blue.

[ ] DEV intro remains red.

[ ] Creator intro remains gold.

[ ] DEV does not receive lower inherited intros.

[ ] Dark → Light cable begins dark/black.

[ ] Dark → Light cable becomes light/white only after transfer.

[ ] Light → Dark cable begins light/white.

[ ] Light → Dark cable becomes dark/black only after transfer.

[ ] Cable still comes from below.

[ ] Cable still bends naturally.

[ ] Plug still physically inserts.

[ ] New Game Index logo exists.

[ ] Old G-with-line is no longer the primary header brand.

[ ] Logo adapts to theme.

[ ] Logo adapts to identity accents.

[ ] Logo has responsive compact presentation.

[ ] Clicking logo goes Home.

[ ] Unsaved work is protected.

[ ] Top bar adapts to current area.

[ ] Top bar acts as navigation compass.

[ ] Top bar does not duplicate entire sidebar.

[ ] Home context works.

[ ] Settings context works.

[ ] Social context works.

[ ] Profile context works.

[ ] Admin context works.

[ ] Cinematics context works.

[ ] Bugs context works.

[ ] Builder context works.

[ ] Report a Bug works for normal users.

[ ] Normal users are not sent into Admin.

[ ] Bug appears in Admin → Bugs.

[ ] Bug receives stable ID.

[ ] Safe technical diagnostics are attached.

[ ] Secrets are redacted.

[ ] Admin bug status workflow works.

[ ] Bug history works.

[ ] Generate Developer Report works.

[ ] Copy Developer Report works.

[ ] Developer report distinguishes evidence from hypothesis.

[ ] Existing bug data is preserved.

[ ] Existing universes still work.

[ ] Social still works.

[ ] Admin capabilities remain secure.

[ ] Creator/Tester/Dev/PRO behavior remains correct.

[ ] Authentication regression tests pass.

[ ] Production startup validation passes.

[ ] Database migration passes.

[ ] I1 tests pass.

[ ] Relevant HF1 regression tests pass.

[ ] FULL package generated.

[ ] UPDATE_ONLY package generated.

[ ] No secrets included.

[ ] Documentation complete.

======================================================================
SECTION 178 — ABSOLUTE DO-NOT LIST
======================================================================

DO NOT:

rewrite Game Index from scratch

remove HF1 systems

reintroduce the rejected rebrand

reset users

reset passwords

reset profiles

reset roles

reset subscriptions

reset cinematic events

destroy universes

destroy Social data

silently start production on temporary empty storage

pretend an ephemeral database is persistent

hardcode Render into the product architecture

hardcode Azure into the product architecture

commit database credentials

commit .env

commit setup codes

commit API keys

commit production databases

give normal users Admin access through Report a Bug

store passwords inside bug reports

store auth tokens inside bug reports

store cookies inside bug reports

dump full localStorage into bug reports

invent technical evidence

invent root cause

expose AI chain-of-thought

create fake bug diagnostics

create fake Cinematics controls

let Preview alter real account cinematic history

show the normal interface before Welcome has powered off

leave cinematic decorations over the normal interface

use random wire decorations for Welcome

start Dark → Light with a white target cable

start Light → Dark with a black target cable

apply target cable color before the power transfer

break physical plug insertion

keep the old G-with-line as the primary logo

make every theme use an unrelated logo

make the header into a complete duplicate sidebar

fill the top bar with every available action

break mobile header layout

break Builder because of top bar changes

break authentication because of persistence changes

break Admin authorization

break Creator permissions

break Tester permissions

break Dev permissions

turn PRO into an Admin/Dev role

claim tests passed without execution

ship without persistence restart testing

======================================================================
SECTION 179 — FINAL EXPECTED EXPERIENCE
======================================================================

A user opens Game Index Beta 0.991 I1.

Their account still exists even after previous deployments/restarts because production account storage is truly persistent.

They log in.

On first eligible I1 entry:

the existing interface is visible.

A circular iris closes.

The screen becomes completely black.

BEM-VINDO powers on.

Clean Game Index technological elements rise from below.

The scene holds.

BEM-VINDO loses power.

Its glow collapses.

The Welcome text disappears completely.

The technological elements descend and disappear.

Only after the black scene is clean does the iris reopen.

The normal Game Index interface returns.

There is no Welcome text left over the interface.

If an identity cinematic is eligible:

it follows the same clean choreography.

The user sees the new Game Index logo in the header.

The old G-with-line + separate plain text branding is gone.

The new logo automatically matches the active theme.

If the account is Dev, the brand may receive a controlled red identity accent.

If Creator, gold.

If Tester, blue.

If PRO, green.

Clicking the logo from anywhere returns to Home.

The user opens Settings.

The top bar no longer wastes most of its space repeating unrelated Home links.

It now acts as a navigation compass:

Game Index logo
Settings / Appearance
a few useful actions

The complete Settings structure remains in the sidebar.

The top bar does not try to become another sidebar.

The user enters Social.

The header context changes naturally.

The user enters Admin.

The header now reflects Admin context.

Inside Admin, there is a dedicated Cinematics area.

An administrator can preview:

Welcome
PRO
Tester
DEV
Creator
Theme Change

without creating new accounts.

Preview does not corrupt real cinematic history.

The administrator tests:

Dark → Light

The cable starts black because Dark is the source.

The cable rises from below.

It bends.

The plug aligns.

The plug physically inserts.

Only after connection does the energy transition occur.

The cable transitions to white.

The Light interface powers on.

The color story now makes sense.

A normal user later encounters a problem.

They click:

Report a Bug.

They see a simple form.

They explain what happened.

They send it.

They do not enter Admin.

Game Index automatically collects safe relevant technical context.

Inside Admin → Bugs:

a new case appears.

Example:

GI-184

The administrator opens it.

They can see:

what the user expected

what actually happened

Game Index version

schema version

route

theme

identity

browser

viewport

relevant errors

failed requests

trace IDs

feature-specific state

history

attachments

No passwords.

No tokens.

No secrets.

The Admin clicks:

GENERATE DEVELOPER REPORT.

Game Index produces a clean technical Markdown report.

The administrator clicks:

COPY DEVELOPER REPORT.

That report can now be pasted directly into the development workflow.

The next bug becomes significantly easier to reproduce and fix.

That is the expected Game Index Beta 0.991 I1 experience.

======================================================================
SECTION 180 — FINAL DIRECTIVE
======================================================================

Implement the complete Game Index Beta 0.991 I1 release.

Study the real Beta 0.991 HF1 repository first.

Preserve the restored Game Index identity.

Preserve HF1 technical systems.

Make account persistence truly reliable.

Never silently depend on ephemeral production account storage.

Absorb the cinematic visibility fix.

Create the Admin Cinematics Center.

Rebuild the Welcome cinematic timing correctly.

Replace random wire-like Welcome decorations with coherent technological Game Index details.

Fix theme power cable source/destination colors.

Create a new adaptive official Game Index logo.

Make the logo a universal Home anchor.

Transform the top bar into a contextual navigation compass without duplicating the sidebar.

Transform Report a Bug into a complete, privacy-safe diagnostic pipeline.

Make Admin Bugs genuinely useful for future development.

Preserve users.

Preserve data.

Preserve security.

Preserve universes.

Preserve Social.

Preserve roles and capabilities.

Test the actual system.

Validate production persistence through restart.

Generate the FULL package.

Generate the UPDATE_ONLY package.

Document the release completely.

The final result should make Game Index feel:

MORE RELIABLE

MORE COHERENT

EASIER TO NAVIGATE

EASIER TO TEST

EASIER TO DEBUG

AND MORE READY TO EVOLVE.