# GAMEINDEX — BETA 0.99 I2

## INTELLIGENT PROCEDURAL EXPERIENCE ENGINE

## INTERACTIVE UNIVERSE BUILDER 2.0

## VISUAL GROUNDING 2.0

## PERFORMANCE, RELIABILITY AND FINAL-FOUNDATION STABILIZATION

---

# 1. MISSION

Upgrade the existing GameIndex Beta 0.99 I1 codebase into **GameIndex Beta 0.99 I2**.

This is NOT a rewrite.

This is NOT a new architecture from scratch.

This is NOT permission to remove working systems and rebuild them unnecessarily.

Beta 0.99 I2 must evolve the current I1 foundation while preserving all working functionality, especially:

- Game / Experience separation
- Universe Builder
- Image Manager / HF1.1 behavior
- Global music player
- Mute and volume persistence
- Social Beta
- Appearance system
- Creator appearance
- AI Control Center
- LOCAL\_FIRST\_NO\_API\_KEY architecture
- SQLite
- Node.js / Express
- Azure App Service compatibility
- Ollama / Gemma local AI compatibility
- Existing routes
- Existing database data
- Existing user-created universes
- Existing images and media
- Existing GameIndex visual identity

The primary objective of I2 is to transform the Universe Builder from a mostly structural and visual builder into a much more advanced:

# UNIVERSE BUILDER 2.0

## INTELLIGENT PROCEDURAL EXPERIENCE ENGINE

It must be capable of building:

- visual identity
- page structure
- recurring visual grounding
- interactive elements
- contextual navigation
- dynamic sections
- media behavior
- transitions
- universe-specific interactions

while remaining deterministic, controllable, performant and usable without any AI model.

---

# 2. NON-NEGOTIABLE ARCHITECTURE

GameIndex remains:

```text
LOCAL_FIRST_NO_API_KEY

```

The application must function correctly with:

- no cloud AI API
- no OpenAI API key
- no Anthropic API key
- no Gemini API key
- no external paid AI service

Local Ollama / Gemma support may remain available.

However:

```text
AI MUST NEVER BE REQUIRED FOR BASIC SITE OPERATION.

```

If Ollama is:

- unavailable
- stopped
- slow
- missing
- misconfigured
- timing out

GameIndex must continue working.

The Universe Builder itself must remain usable without AI.

---

# 3. UNIVERSE BUILDER CLASSIFICATION CHANGE

The Universe Builder must no longer be treated internally as a simple page builder.

Its architectural classification for I2 is:

# UNIVERSE BUILDER 2.0

## INTELLIGENT PROCEDURAL EXPERIENCE ENGINE

The system should conceptually contain four major layers.

---

## 3.1 PROCEDURAL BUILDER ENGINE

Responsible for deterministic construction of:

- sections
- components
- layout
- visual elements
- media
- backgrounds
- overlays
- cards
- navigation
- containers
- content regions
- responsive behavior
- universe structure

This is the real execution engine.

It must NOT depend on AI.

---

## 3.2 INTERACTIVE UNIVERSE ENGINE

Responsible for user interactions inside generated universes.

This is one of the most important additions in I2.

Universe Builder must no longer create only static visual pages.

It must be capable of creating interactive experiences.

---

## 3.3 VISUAL GROUNDING ENGINE 2.0

Responsible for ensuring that each Game or Experience has a persistent, recognizable visual identity throughout the full page.

It must solve the current problem where visual thematic elements exist but are too rare, isolated or concentrated in only one section.

---

## 3.4 AI CREATIVE DIRECTOR

Optional AI assistance.

The AI Creative Director may:

- analyze available game metadata
- analyze universe metadata
- suggest visual motifs
- suggest interactive elements
- suggest section organization
- suggest decorative themes
- suggest contextual navigation
- suggest appropriate visual density
- suggest character or location placement
- suggest presentation improvements

But AI output must be treated as:

```text
SUGGESTION

```

not direct unrestricted DOM generation.

The deterministic engines must validate and execute allowed actions.

AI must not directly inject arbitrary HTML, JavaScript or unsafe code.

---

# 4. GAME / EXPERIENCE / UNIVERSE MODEL

Preserve and strengthen the I1 separation.

The system must clearly understand:

```text
GAME
EXPERIENCE
UNIVERSE

```

---

## GAME

A complete game or platform-level game entity.

Examples:

- Minecraft
- Marvel's Spider-Man 2
- Roblox
- Cyberpunk 2077

---

## EXPERIENCE

A playable experience existing under another Game/platform when appropriate.

For Roblox:

```text
Roblox = GAME

Blox Fruits = EXPERIENCE
DOORS = EXPERIENCE
Fisch = EXPERIENCE
Work at a Pizza Place = EXPERIENCE
Prison Life = EXPERIENCE

```

These Experiences must NOT incorrectly appear as independent top-level Games in global Game catalogs.

---

## UNIVERSE

The GameIndex presentation layer built around a Game or Experience.

A Universe can include:

- visual identity
- information
- interactive content
- images
- music
- lore
- characters
- locations
- media
- ratings
- AI-related content
- user-created elements

---

# 5. UNIVERSE BUILDER 2.0

The Universe Builder needs a major capability upgrade.

Do NOT simply add more fields.

Improve the actual building system.

The Builder should behave more like an experience construction engine.

It should allow a Universe to contain:

- visual structure
- contextual decoration
- responsive layout
- interactive objects
- actions
- transitions
- contextual navigation
- sound interactions
- information reveals
- character interactions
- dynamic visual states

The result must still feel like GameIndex.

Do NOT transform GameIndex into a generic Wix-like website editor.

The Builder exists specifically for gaming universes.

---

# 6. INTERACTIVE UNIVERSE ENGINE

Add a formal interaction system.

An interaction should be conceptually modeled as:

```text
ELEMENT
↓
EVENT
↓
ACTION
↓
TARGET / PARAMETERS

```

Example:

```text
Jolly Roger
→ On Click
→ Open Section
→ Pirates

```

Example:

```text
DOORS Door #001
→ On Click
→ Reveal
→ Room Information

```

Example:

```text
Fish Decoration
→ On Hover
→ Play Animation
→ Swim

```

Example:

```text
Character Card
→ On Click
→ Open Character Profile
→ Peter Parker

```

---

# 7. INITIAL SUPPORTED EVENTS

At minimum support a controlled event set such as:

```text
CLICK
HOVER
FOCUS
ENTER_SECTION
LEAVE_SECTION

```

Do not expose arbitrary JavaScript event code.

Interactions must use validated predefined behaviors.

---

# 8. INITIAL SUPPORTED ACTIONS

At minimum support controlled actions such as:

```text
OPEN
REVEAL
HIDE
NAVIGATE
PLAY_ANIMATION
PLAY_SOUND
CHANGE_STATE
SHOW_INFO
OPEN_CHARACTER
OPEN_LOCATION
OPEN_MEDIA
OPEN_GALLERY
SCROLL_TO

```

Actions must support appropriate targets and configuration.

---

# 9. CLICKABLE VISUAL ELEMENTS

Visual decorations may optionally become interactive.

Possible uses:

- open lore
- open character information
- open location information
- reveal trivia
- navigate to another section
- open media
- reveal hidden content
- trigger animations
- play contextual sound
- change visual state

Decorative elements must NOT automatically become interactive.

The Builder must explicitly know whether an element is:

```text
DECORATIVE
INTERACTIVE
NAVIGATION
CONTENT

```

---

# 10. HOTSPOTS

Add hotspot support.

A hotspot is a defined interaction zone connected to:

- image
- background
- character
- item
- visual object
- location
- section

Hotspots should support visual editing inside the Builder.

They must be responsive.

They must NOT rely on absolute desktop-only coordinates that break on mobile.

---

# 11. CHARACTER INTERACTIONS

Character elements should support interactions.

Possible character actions:

- open character page
- open biography
- show relationships
- reveal lore
- open image gallery
- show quotes where legally and technically appropriate
- show related locations
- show related games or Experiences
- show timeline information

Do not create duplicate character systems if an existing GameIndex character architecture already exists.

Integrate with existing data.

---

# 12. INTERACTIVE GALLERIES

Universe Builder should support richer media galleries.

Possible features:

- selectable images
- expanded view
- character galleries
- location galleries
- item galleries
- universe-specific galleries
- context captions
- smooth transitions

Do not preload every high-resolution image.

---

# 13. DYNAMIC SECTIONS

Sections should be capable of changing state without a complete page reload.

Examples:

- collapsed / expanded
- tabbed content
- alternate content states
- revealed content
- contextual panels
- selected character
- selected location
- selected media

Use lightweight client-side state.

Avoid unnecessary full-page rerenders.

---

# 14. CONTEXTUAL NAVIGATION

Universe navigation may become part of the universe itself.

Example:

For DOORS:

- door-themed navigation
- room-number indicators
- corridor-inspired transitions

For Blox Fruits:

- map-inspired navigation
- pirate symbols
- island-related navigation

For Spider-Man:

- web-related visual navigation
- city / district structure where appropriate

However:

Navigation must remain understandable and accessible.

Never sacrifice usability for decoration.

---

# 15. SOUND INTERACTIONS

Support optional small contextual sounds.

These sounds must be independent from the main music track.

Examples:

- interface click
- door
- page reveal
- small thematic effect
- environment accent

Rules:

```text
GLOBAL MUTE MUST APPLY.

```

If the user mutes GameIndex:

- music stops
- contextual sounds stop

Do not create uncontrolled autoplay.

Do not play multiple effects excessively.

Do not preload every effect.

---

# 16. GLOBAL MUSIC PLAYER

Preserve the global single-player architecture.

There must still be only one authoritative music playback system.

Requirements:

- one global player
- persistent volume
- persistent mute
- track switches correctly between universes
- no duplicated `<audio>` elements
- no overlapping music
- no uncontrolled autoplay
- graceful missing-track fallback
- lazy media loading
- correct cleanup when navigating

Do not regress the existing I1 music fixes.

---

# 17. VISUAL GROUNDING 2.0

This is a P0/P1-level I2 feature.

The current thematic visual elements are too sparse.

This must be fixed.

A Universe must visually remain recognizable throughout the page.

Do NOT place one themed object in the Hero and then allow the remaining 70% of the page to become generic.

Visual identity must recur.

---

# 18. VISUAL CONTINUITY RULE

Introduce a formal Visual Continuity concept.

The page should continuously reinforce the identity of the current Game or Experience.

Visual grounding may appear through:

- section dividers
- backgrounds
- subtle patterns
- icons
- decorative objects
- card framing
- borders
- typography accents
- contextual illustrations
- symbols
- environmental elements
- navigation details
- transition details

The thematic elements should recur naturally.

---

# 19. VISUAL DENSITY CONTROLLER

Add a concept similar to:

```text
SPARSE
BALANCED
RICH
IMMERSIVE

```

GameIndex's default should move away from the current sparse feeling.

Recommended default:

```text
RICH

```

---

## SPARSE

Minimal thematic elements.

Useful for low-power modes or very simple universes.

---

## BALANCED

Moderate decoration.

---

## RICH

Default GameIndex I2 target.

The universe identity should remain clearly visible across the page.

---

## IMMERSIVE

Highest visual density.

Use carefully.

Must NOT create:

- unreadable interfaces
- excessive animation
- excessive GPU use
- large page weight
- dozens of simultaneous moving objects

---

# 20. VISUAL DENSITY IS NOT RANDOM OBJECT COUNT

Do NOT solve density by randomly duplicating PNGs everywhere.

Visual richness should come from meaningful composition.

For example:

## BLOX FRUITS

Possible motifs:

- pirate symbols
- stylized fruits
- oceanic details
- maps
- island motifs
- treasure-related elements
- Jolly Roger
- nautical visual language

These can appear in:

- section dividers
- title accents
- cards
- background patterns
- navigation
- interactive elements

---

## DOORS

Possible motifs:

- doors
- room numbers
- hotel framing
- corridors
- lamps
- dark interior patterns
- environmental symbols
- subtle entity-related references

---

## FISCH

Possible motifs:

- fish
- hooks
- lines
- water
- fishing equipment
- aquatic patterns
- waves
- underwater accents

---

## WORK AT A PIZZA PLACE

Possible motifs:

- pizzas
- pizza boxes
- delivery graphics
- kitchen-related forms
- classic Roblox visual references

---

## PRISON LIFE

Possible motifs:

- prison architecture
- bars
- concrete
- institutional signs
- old Roblox-era visual references
- prison-related symbols

---

# 21. VISUAL GROUNDING MUST BE GAME-SPECIFIC

Do NOT use generic color swapping as the main identity system.

Bad:

```text
Blox Fruits = blue theme
DOORS = brown theme
Fisch = cyan theme

```

Good:

```text
Blox Fruits = pirate / ocean / fruits / islands / treasure visual language
DOORS = hotel / rooms / doors / corridors visual language
Fisch = fishing / fish / water / equipment visual language

```

Color is secondary.

Recognition must come from visual vocabulary.

---

# 22. VISUAL DISTRIBUTION

The visual engine should distribute thematic elements across the universe.

Avoid:

- all decoration at the top
- huge empty generic middle sections
- one isolated game symbol every several screens

The Builder should understand visual distribution.

Conceptually, each major section should contain at least one appropriate thematic reinforcement when the chosen density allows it.

Do NOT enforce crude fixed object counts.

Use composition rules.

---

# 23. PERFORMANCE BUDGET

I2 must NOT make the site heavier than I1 in a harmful way.

This is a critical requirement.

Every new visual or interactive feature must respect a performance budget.

The site previously showed serious performance problems.

Do not repeat them.

---

# 24. IMAGE PERFORMANCE

Implement or strengthen:

- lazy loading
- responsive images
- correct thumbnail sizes
- reduced unnecessary image resolution
- image decoding control
- optimized image output
- caching where appropriate
- deferred offscreen loading

Never use a giant source image for a tiny card when an optimized derivative can be used.

---

# 25. ANIMATION PERFORMANCE

Animations must:

- stop or pause outside viewport where appropriate
- avoid excessive JavaScript animation loops
- prefer efficient CSS transforms / opacity
- respect reduced-motion settings when appropriate
- not create dozens of simultaneous animated objects
- not trigger unnecessary layout thrashing
- not block page load

---

# 26. INTERACTION PERFORMANCE

Avoid:

- duplicate event listeners
- excessive global listeners
- uncontrolled MutationObservers
- unnecessary IntersectionObservers
- repeated DOM scans
- full page rerender after minor state changes

Interactions should update only the necessary components.

---

# 27. LAZY INTERACTIVE INITIALIZATION

Complex interactions should initialize when needed.

Examples:

- galleries
- interactive media
- heavy animations
- optional sound
- character panels

Do not initialize everything on startup.

---

# 28. ZERO AI ON STARTUP

This remains mandatory.

Do NOT contact Ollama during basic application startup.

Do NOT wait for AI before rendering pages.

Do NOT preload AI models just because the server started.

AI must initialize only when required by an AI-specific action.

---

# 29. AI CONTROL CENTER

Preserve the AI Control Center.

It may expose:

- agent status
- request timing
- search state
- recovery state
- structured technical traces
- errors
- orchestration status
- model availability
- fallback usage

Never expose private chain-of-thought.

Technical traces must remain structured and safe.

---

# 30. AI STABILIZATION

Do NOT perform another unnecessary full AI architecture rewrite.

Instead:

- correct outdated references to old AI versions
- remove references to obsolete 5.x behavior where 7.x is expected
- improve timeouts
- improve fallback handling
- prevent agent loops
- prevent endless research loops
- prevent repeated identical requests
- improve failure recovery
- keep AI optional

---

# 31. IMAGE MANAGER — HF1.2 EVOLUTION

Preserve all working HF1.1 functionality.

Do not regress:

- crop
- crop handles
- drag
- pointer events
- URL preview
- image selection
- resize interaction
- existing Image Manager workflow

I2 may evolve this into HF1.2.

Possible additions:

- output compression
- output size display
- dimension presets
- media type presets

Suggested presets:

```text
COVER
BACKGROUND
LOGO
CHARACTER
GALLERY
DECORATION

```

The system should prevent extremely large assets from accidentally degrading site performance.

---

# 32. ORIGINAL IMAGE QUALITY

Do not unnecessarily destroy uploaded image quality.

Use appropriate compression.

Preserve originals when required by the current architecture.

Use optimized derivatives for display.

---

# 33. APPEARANCE ENGINE

Normalize GameIndex appearances.

User appearance and Game visual identity must remain separate concepts.

Example:

```text
USER APPEARANCE = Creator
GAME VISUAL GROUNDING = DOORS

```

Both must coexist.

The Game should influence universe environment.

The user's selected Appearance should influence GameIndex UI styling.

Neither should completely erase the other.

---

# 34. CREATOR APPEARANCE

Preserve Creator.

Its identity remains:

- subtle red details
- subtle gold details
- discreet technological gold accents

Do NOT turn the entire application bright red and gold.

The visual effect must remain controlled and premium.

---

# 35. SOCIAL BETA

Preserve and stabilize the Social Beta.

Do NOT turn I2 into a full social-network rewrite.

Focus on:

- working buttons
- persistent states
- profile correctness
- UI consistency
- interaction reliability
- integration with appearances
- integration with universes when relevant

Remove dead buttons or make them clearly disabled.

Do not leave clickable UI with no action.

---

# 36. UNIVERSE BUILDER PREVIEW

Improve Builder preview accuracy.

Preview should more closely represent the final universe.

The preview should reflect:

- selected visual density
- sections
- images
- theme
- decorative distribution
- interactive objects
- navigation
- music metadata
- major responsive behavior

Do not require saving the universe just to understand what it will look like.

---

# 37. UNIVERSE EDITING

Existing universes should remain editable.

Do not force users to recreate a universe from zero to modify it.

Support editing of:

- content
- images
- sections
- visual density
- interaction definitions
- music
- decorative elements
- media
- navigation

Preserve compatibility with universes created before I2.

---

# 38. MIGRATION SAFETY

If database changes are required:

- use migrations
- preserve existing records
- use safe defaults
- support missing new fields
- never assume all old records contain I2 data

Existing I1 universes must load without crashing.

---

# 39. INTERACTION DATA MODEL

Prefer declarative interaction data.

Example conceptual structure:

```json
{
  "event": "click",
  "action": "open_character",
  "target": "peter-parker",
  "options": {}
}

```

Do not store arbitrary executable JavaScript in the database.

Validate allowed event/action types server-side when appropriate.

---

# 40. SECURITY

Interactive Builder features must not create a new injection path.

Sanitize and validate:

- text
- URLs
- media references
- action targets
- user-defined labels
- metadata
- uploaded filenames
- Builder interaction payloads

No arbitrary script injection.

No unsafe `eval`.

No dynamic Function constructors.

No unrestricted inline JavaScript supplied by users.

---

# 41. RELIABILITY

One failing component must not destroy the entire page.

Introduce or strengthen isolated failure boundaries where practical.

Examples:

If music fails:

```text
PAGE CONTINUES.

```

If one image fails:

```text
USE FALLBACK.

```

If local AI fails:

```text
NON-AI PAGE CONTINUES.

```

If one interactive component fails:

```text
OTHER COMPONENTS CONTINUE.

```

---

# 42. FALLBACKS

Ensure proper fallback behavior for:

- missing game images
- missing Experience images
- missing music
- invalid media
- unavailable AI
- failed animation
- missing optional metadata
- unknown visual motif
- old universe data
- unavailable local service

Fallbacks should look intentional.

---

# 43. ERROR UX

Avoid blank screens.

Avoid generic silent failures.

Provide concise, useful errors.

Development mode may expose structured technical information.

Production should not expose sensitive internals.

---

# 44. RESPONSIVE DESIGN

All new Builder and Universe interactions must support:

- desktop
- laptop
- tablet
- mobile

Do not design interactions only around mouse hover.

Anything essential available through hover must also be accessible by tap/click.

Hotspots must adapt responsively.

---

# 45. ACCESSIBILITY

Interactive visual elements should have meaningful accessibility behavior where appropriate.

Use:

- buttons for actions
- keyboard focus
- accessible labels
- proper semantic controls
- visible focus states

Do not make essential navigation depend on decorative `<div>` click handlers only.

---

# 46. VISUAL HIERARCHY

Rich visual grounding must NOT reduce readability.

Priority:

```text
CONTENT
↓
INTERACTION
↓
VISUAL IDENTITY
↓
DECORATION

```

Decoration should reinforce content, not obscure it.

---

# 47. PAGE STRUCTURE REFINEMENT

Game / Experience pages may be reorganized where necessary to improve clarity.

Important information should appear earlier.

Secondary systems may move deeper into the page.

Possible hierarchy:

```text
Hero / Identity

Primary Information

Core Game / Experience Details

Characters / Locations / Content

Media

Interactive Universe Content

Community / Social

AI / Research / Advanced Systems

Additional Information

```

Do not blindly apply this exact order if existing page structure already has a better context-specific organization.

---

# 48. REDUCE INITIAL RENDER COST

Do not render every heavy secondary system immediately.

Prefer progressive activation.

Especially consider deferring:

- large galleries
- advanced AI panels
- long social sections
- deep lore
- heavy interactive decorations
- large media collections

---

# 49. UNIVERSE-SPECIFIC INTERACTIONS

Games and Experiences may define interaction styles appropriate to their identity.

Example:

DOORS:

- doors can reveal room information
- room labels may act as contextual navigation
- corridor elements may transition between content sections

Blox Fruits:

- map elements may navigate between universe regions
- fruits may reveal information
- pirate symbols may open related content

Fisch:

- fish may trigger contextual reveals
- fishing-themed elements may act as navigation or media triggers

Do NOT make every universe use identical interactive behavior.

---

# 50. REUSABLE INTERACTION PRESETS

Create reusable interaction presets where useful.

Examples:

```text
REVEAL_CARD
OPEN_PROFILE
OPEN_GALLERY
SCROLL_TO_SECTION
PLAY_DECORATION_ANIMATION
SHOW_LORE
SHOW_ITEM
OPEN_LOCATION

```

This keeps Universe Builder simple while preserving power.

---

# 51. BUILDER UX

The interaction editor should conceptually feel like:

```text
SELECT ELEMENT

Interaction

Event:
[ Click ]

Action:
[ Open Character ]

Target:
[ Peter Parker ]

```

Avoid exposing implementation internals to normal users.

The system may provide an advanced developer view separately if such a developer system already exists.

---

# 52. BUILDER VALIDATION

Before saving a Universe, validate critical configuration.

Detect:

- missing Game/Experience
- invalid interaction target
- missing required media
- broken references
- impossible navigation target
- empty required section
- unsupported action type

Do not block saving for harmless optional omissions.

---

# 53. PERFORMANCE-AWARE BUILDER

The Builder should warn against extreme visual configurations.

Examples:

- excessive animated elements
- very large image assets
- too many simultaneous audio elements
- excessive galleries
- extremely dense backgrounds

Do not simply allow a configuration that obviously destroys page performance.

---

# 54. VISUAL DENSITY PERFORMANCE ADAPTATION

If feasible within the existing architecture, allow visual density to adapt to performance conditions.

For example:

```text
RICH

```

may reduce certain non-essential effects on lower capability devices.

Do NOT change core content.

Do NOT remove important visual identity.

Reduce only expensive decoration or animation.

---

# 55. NO RANDOM DECORATION

The engine must not blindly scatter symbols.

Visual grounding must consider:

- section type
- available space
- hierarchy
- current density
- nearby elements
- repetition
- semantic relevance

Avoid visual clutter.

---

# 56. REPETITION CONTROL

Recurring identity is required.

Exact repetitive duplication is not.

Avoid:

- same icon repeated 30 times
- same image copied through every section
- identical decoration patterns with no variation

Use a coherent motif family.

---

# 57. VISUAL MOTIF LIBRARY

Introduce or strengthen a visual motif concept.

A Universe can have motif categories such as:

```text
PRIMARY_SYMBOL
SECONDARY_SYMBOL
BACKGROUND_PATTERN
DIVIDER
CARD_ACCENT
NAVIGATION_ACCENT
INTERACTIVE_OBJECT
ENVIRONMENT_ELEMENT

```

This allows richer distribution without random duplication.

---

# 58. BUILDER GENERATED EXPERIENCE MUST REMAIN EDITABLE

Procedural construction must not result in an opaque generated blob.

The final Universe structure should remain inspectable and editable.

Users should be able to change:

- sections
- assets
- interactions
- visual density
- motifs
- navigation
- content

---

# 59. AI CREATIVE DIRECTOR SAFETY

When AI is available:

AI may recommend:

```text
"Use recurring door-number motifs across section headers."

```

Then the deterministic Builder decides how to represent that recommendation using supported components.

AI should NOT respond with unrestricted code that is directly inserted into the page.

---

# 60. AI CREATIVE DIRECTOR FALLBACK

If AI is unavailable:

Use:

- existing metadata
- predefined game rules
- motif presets
- deterministic templates
- existing visual grounding configuration

Universe Builder must still create a usable universe.

---

# 61. DATA PERSISTENCE

All important Builder state must survive:

- save
- refresh
- server restart
- navigation
- later editing

Do not keep critical universe configuration only in volatile client memory.

---

# 62. PERFORMANCE OBSERVABILITY

Where the existing developer tools allow it, expose useful metrics such as:

- initial render timing
- image load count
- image bytes where available
- active animations
- active interactions
- music state
- lazy-loaded modules
- failed assets

Do not create a massive monitoring framework.

Use lightweight diagnostics.

---

# 63. CLEANUP

When changing universes or routes:

clean up:

- event listeners
- timers
- animation frames
- observers
- audio effects
- unused state

Avoid memory leaks.

---

# 64. FIRST LOAD PRIORITY

The first meaningful GameIndex screen must appear quickly.

Do not delay the page for:

- AI
- secondary galleries
- hidden interactive content
- music metadata
- non-essential visual decorations
- analytics-like developer systems

Load essentials first.

---

# 65. SERVER STARTUP

Keep server startup lightweight.

No expensive scans of every universe.

No AI initialization.

No pre-rendering all universe pages.

No media processing of the entire library during startup.

---

# 66. AZURE COMPATIBILITY

Preserve Azure App Service deployment compatibility.

Respect the current application environment.

Do not introduce infrastructure that requires:

- Docker-only deployment unless already supported
- GPU
- external Redis
- external database
- paid API
- new mandatory cloud service

unless the existing project already contains that dependency.

---

# 67. NODE VERSION

Preserve compatibility with the existing modern Node.js target.

Current project direction expects modern Node, including Node 22-class environments.

Do not unnecessarily downgrade runtime requirements.

---

# 68. SQLITE

Continue using the current SQLite foundation unless a migration is absolutely required.

Do NOT replace SQLite with PostgreSQL, MongoDB or another database simply for I2.

---

# 69. DO NOT BREAK EXISTING ROUTES

Existing deep links should continue working.

If internal routing changes are needed:

- provide compatibility
- redirect where appropriate
- preserve old identifiers

---

# 70. NO MASSIVE DEPENDENCY EXPLOSION

Avoid installing large frameworks solely for minor effects.

Prefer existing project tools and lightweight code.

Every new dependency must have a concrete reason.

---

# 71. NO FRAMEWORK REWRITE

Do not convert the entire project into:

- Next.js
- React
- Vue
- Angular
- Svelte

unless the project already uses such architecture.

I2 is an evolution of the existing implementation.

---

# 72. I2 INTERNAL DEVELOPMENT PHASES

Implement in controlled phases.

---

## I2-A

### GAME / EXPERIENCE / UNIVERSE ARCHITECTURE STABILIZATION

Focus:

- entity classification
- relationship integrity
- catalog behavior
- migration safety
- Builder selection integrity

---

## I2-B

### UNIVERSE BUILDER 2.0

### INTERACTIVE UNIVERSE ENGINE

### VISUAL GROUNDING 2.0

Focus:

- Builder engine
- interactions
- visual motifs
- visual density
- recurring thematic identity
- preview
- editing

This is the main I2 feature phase.

---

## I2-C

### PERFORMANCE + IMAGE + AUDIO

Focus:

- image optimization
- lazy loading
- music reliability
- sound interactions
- animations
- rendering performance
- cleanup
- memory use

---

## I2-D

### AI + SOCIAL + APPEARANCE STABILIZATION

Focus:

- AI Creative Director
- AI reliability
- Social Beta
- Creator appearance
- Appearance Engine
- system integration

---

## I2-E

### REGRESSION + 0.99 FINAL READINESS

Focus:

- regression testing
- performance testing
- compatibility
- error recovery
- visual consistency
- final release blockers

---

# 73. FEATURE FREEZE DIRECTION

I2 should move GameIndex toward a feature freeze.

After I2, Beta 0.99 should ideally require mostly:

- bug fixes
- polish
- regression fixes
- performance fixes
- release blockers

Avoid introducing additional massive systems after I2 unless absolutely necessary.

---

# 74. REGRESSION CHECKLIST

Before considering I2 complete, verify:

- Home loads
- game catalog loads
- Experiences do not incorrectly leak into global Games
- Roblox remains a Game
- Roblox Experiences remain Experiences
- Universe Builder selector works
- existing universes load
- existing universes remain editable
- Universe Builder saves
- Universe Builder preview works
- interactions save
- interactions reload
- interactions work after refresh
- mobile interaction works
- visual density works
- visual grounding remains present through the page
- Image Manager works
- crop works
- pointer interactions work
- URL image preview works
- music works
- only one global music player exists
- mute persists
- volume persists
- missing music does not crash
- AI unavailable does not block site
- Social Beta loads
- Creator appearance loads
- appearances persist
- SQLite migration preserves existing data
- server restarts cleanly
- Azure production startup works

---

# 75. PERFORMANCE REGRESSION CHECK

I2 must be compared against I1.

Check:

- first meaningful render
- page responsiveness
- scroll smoothness
- image request volume
- unnecessary asset size
- active timers
- duplicate listeners
- unnecessary observers
- music duplication
- memory behavior after navigation

If an I2 feature creates a major regression, optimize it before considering the feature complete.

---

# 76. DEVELOPMENT MODE VS PRODUCTION MODE

Developer diagnostics may be richer in development.

Production should remain clean.

Do not show internal technical tools to normal users unless explicitly part of the existing GameIndex developer interface.

---

# 77. PRESERVE WORKING I1 FIXES

Do not accidentally undo fixes already achieved in Beta 0.99 I1.

Particularly preserve:

- Universe selection corrections
- Game / Experience distinction
- visual grounding foundation
- Image Manager behavior
- performance hot fixes
- music system
- AI architecture safeguards

---

# 78. IMPLEMENTATION PHILOSOPHY

Follow:

```text
PRESERVE
→ STABILIZE
→ EXTEND
→ OPTIMIZE
→ VERIFY

```

Do NOT follow:

```text
DELETE
→ REWRITE
→ HOPE

```

---

# 79. CODE QUALITY

Keep implementation:

- modular
- readable
- documented where needed
- testable
- recoverable
- compatible with existing patterns

Avoid giant monolithic files if the architecture already supports modularization.

Do not over-engineer trivial features.

---

# 80. FINAL TARGET EXPERIENCE

When I2 is complete, opening a Game or Experience should immediately feel like entering that specific universe.

The page should no longer feel like:

```text
Generic GameIndex page
+ different background color
+ one themed image

```

It should feel like:

```text
GameIndex
+
that game's own recognizable visual language
+
recurring thematic elements
+
interactive objects
+
contextual navigation
+
responsive media
+
controlled visual richness

```

while still clearly being part of GameIndex.

---

# 81. CORE I2 QUALITY BAR

The Universe Builder should progress from:

```text
STATIC PAGE BUILDER

```

toward:

```text
INTELLIGENT PROCEDURAL EXPERIENCE ENGINE

```

but retain deterministic execution.

The engine must be:

- visually rich
- interactive
- predictable
- editable
- performant
- local-first
- AI-optional
- safe

---

# 82. IMPORTANT DESIGN PRINCIPLE

The new I2 visual goal is:

```text
MORE IDENTITY
NOT MORE CLUTTER

```

The new I2 interaction goal is:

```text
MORE LIFE
NOT MORE CHAOS

```

The new I2 AI goal is:

```text
MORE INTELLIGENCE
NOT MORE DEPENDENCY

```

The new I2 performance goal is:

```text
MORE EXPERIENCE
WITHOUT A HEAVIER SITE

```

---

# 83. DO NOT CONSIDER I2 COMPLETE IF

Do not mark I2 complete if:

- visual elements are still rare
- only the Hero looks thematic
- interactions exist only as fake UI
- interaction buttons do nothing
- Builder preview differs drastically from output
- old universes break
- AI is required
- site startup becomes slower because of AI
- music duplicates
- mobile interactions break
- image loading becomes excessive
- Experiences appear as top-level Games incorrectly
- Universe Builder cannot edit existing content
- visual density simply duplicates random images
- interactive elements rely on arbitrary user JavaScript
- the site becomes noticeably heavier than I1

---

# 84. REQUIRED DELIVERY

When implementing this Master Prompt:

1. Analyze the existing Beta 0.99 I1 codebase first.
2. Preserve working architecture.
3. Identify existing systems before creating replacements.
4. Implement I2 incrementally.
5. Perform database migrations safely.
6. Verify regressions.
7. Verify local-first behavior.
8. Verify performance.
9. Verify Azure compatibility.
10. Report what was changed.

The implementation report should include:

- files changed
- files created
- database changes
- Universe Builder changes
- interaction engine changes
- Visual Grounding changes
- performance changes
- image changes
- audio changes
- AI changes
- Social changes
- Appearance changes
- compatibility considerations
- tests performed
- known limitations
- remaining release blockers

---

# 85. FINAL RULE

GameIndex Beta 0.99 I2 is not a cosmetic patch.

It is the update that should make the Universe Builder finally behave like a real **GameIndex Experience Engine**.

The finished result must make each Game and Experience:

- more recognizable
- more visually present
- more interactive
- more coherent
- more immersive

without sacrificing:

- loading speed
- stability
- usability
- local-first operation
- compatibility
- maintainability

Build on Beta 0.99 I1.

Do not replace it.

Do not weaken it.

Upgrade it.