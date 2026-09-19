# GameIndex Beta 0.99 I2 — Release Notes

## Release identity
- Version: 0.99-I2 / npm package 0.99.2
- Database target schema: 35
- Classification: INTELLIGENT_PROCEDURAL_EXPERIENCE_ENGINE
- Architecture: LOCAL_FIRST_NO_API_KEY

## Main implementation
Beta 0.99 I2 evolves the I1 foundation rather than replacing it. Universe Builder 2.0 now combines deterministic procedural construction, a declarative Interactive Universe Engine, Visual Grounding 2.0 and an optional local AI Creative Director.

### Interactive Universe Engine
- Persistent interaction bindings are stored in SQLite.
- Model: element -> event -> action -> target/parameters.
- Events: CLICK, HOVER, FOCUS, ENTER_SECTION and LEAVE_SECTION.
- Actions: OPEN, REVEAL, HIDE, NAVIGATE, PLAY_ANIMATION, PLAY_SOUND, CHANGE_STATE, SHOW_INFO, OPEN_CHARACTER, OPEN_LOCATION, OPEN_MEDIA, OPEN_GALLERY and SCROLL_TO.
- Bindings may be DRAFT, PUBLISHED, ARCHIVED or INVALID.
- Safe presets are available for the Roblox Experience identity families already present in I1.
- Runtime interactions use predefined actions. Arbitrary user JavaScript, eval and executable configuration are not accepted.

### Visual Grounding 2.0
- Visual density levels: SPARSE, BALANCED, RICH and IMMERSIVE.
- RICH is the target/default I2 density.
- Thematic motifs are distributed across major page sections instead of being concentrated only in the Hero.
- Visual continuity and section reinforcement are configurable.
- Density can reduce non-essential effects under low-power/save-data/reduced-motion conditions without removing core content.
- Existing I1 motif generation remains the SVG source/fallback, reducing regression risk.

### Universe Builder 2.0 editor
- Visual Density controls.
- Visual Continuity and adaptive-performance controls.
- Animated motif budget.
- Interaction editor for element/event/action/target.
- Identity-specific interaction presets.
- Draft/publish/archive workflow.
- Preview exposes visual density and interaction count.
- Existing universes remain editable.

### Optional AI Creative Director
- Explicit, demand-driven action only.
- Uses the existing local Ollama/Gemma path when local AI is enabled and available.
- Deterministic fallback works when local AI is disabled or unavailable.
- AI output is advisory and sanitized; it is not injected as arbitrary HTML/JavaScript/CSS.
- No cloud AI API or API key is required.

### Runtime and performance
- Interactive runtime uses cleanup via AbortController/observer cleanup.
- Contextual sound uses one lightweight effect player and respects global GameIndex mute.
- No AI is contacted on server startup or normal public page view.
- Offscreen/reduced-motion behavior limits visual cost.
- Existing single global music system remains authoritative.

### Data compatibility
Migration 035 is additive. It adds visual-density policy fields to identity profiles and a new universe interaction bindings table. Existing entity IDs, relationships and I1 universe data are preserved.
