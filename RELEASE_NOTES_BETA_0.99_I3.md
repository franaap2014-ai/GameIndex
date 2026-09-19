# GameIndex Beta 0.99 I3 — Release Notes

## Release identity
- Version: 0.99-I3 / npm package 0.99.3
- Database target schema: 36
- Visual engine: GAME_SOURCED_VISUAL_COMPOSITION_ENGINE_2_1
- Architecture: LOCAL_FIRST_NO_API_KEY
- Update class: Intermediate (improvements + additions + bug fixes + polish)

## Root cause fixed
I2 still rendered semantic motifs through script-generated SVG artwork and then redistributed those generated visuals. That could produce an incorrect Jolly Roger, generic fish, generic doors and other visuals that described the game without actually belonging to the game.

I3 removes that behavior from the active game runtime. Semantic motifs remain search/classification metadata only. Production visual grounding resolves to approved real image assets.

## Visual Asset Registry
New schema-36 registry stores:
- entity ownership
- asset key
- semantic motif metadata
- semantic role / visual family
- source type and source reference
- image URL / Image Engine linkage
- approval status
- confidence and dimensions
- optimized variants and provenance

Approval states: DISCOVERED, REVIEWED, APPROVED, REJECTED and ARCHIVED.

## Game-sourced visual pipeline
Universe Builder visual research now:
1. performs demand-driven real-image discovery through Image Engine 3 for COVER/ARTWORK when appropriate;
2. syncs existing GameIndex media/Image Engine/content-media records into the Visual Asset Registry;
3. separates discovered/reviewed assets from production-approved identity assets;
4. uses only approved assets for current runtime grounding;
5. reports incomplete/failed grounding instead of creating fake visual replacements.

No visual research is run during basic server startup or normal public page viewing.

## Visual Grounding Engine 2.1
- New current renderer: `public/js/visual-grounding-099i3.js`.
- I1/I2 generated visual renderers are no longer loaded by `game.html`.
- Renders real `<img>` assets only.
- Broken image loads are hidden/degraded and never replaced with generated game artwork.
- Density remains SPARSE / BALANCED / RICH / IMMERSIVE.
- RICH increases real-asset distribution while maintaining repetition caps and adaptive performance.
- Existing interaction bindings can target `ASSET:<assetKey>`; legacy `MOTIF:<semanticMotif>` bindings can resolve to a real matching approved asset without rendering the motif itself.

## Visual Coverage
Visual Coverage is separate from Visual Density and measures:
- Hero coverage
- Major section coverage
- Asset diversity
- Game specificity
- Real-asset grounding
- Generic fallback ratio
- Interactive visual coverage

Coverage classifications: FAILED, INCOMPLETE, ACCEPTABLE, GROUNDED and HIGHLY_GROUNDED.

A RICH build with no approved game-sourced assets cannot be visually validated.

## Validation 2.0
Validation now reports independent domains:
- STRUCTURE_STATUS
- RESEARCH_STATUS
- CONTENT_STATUS
- MEDIA_STATUS
- VISUAL_GROUNDING_STATUS
- INTERACTION_STATUS
- PERFORMANCE_STATUS
- PUBLICATION_STATUS

Critical visual failures block full publication. Structural drafts can still be persisted safely so research/build progress is not lost.

## Interaction state unification
Interaction reporting now distinguishes persisted lifecycle states rather than treating preset recommendations as stored interactions:
- PLANNED
- DRAFT
- VALIDATED
- PUBLISHED
- ARCHIVED

This fixes the I2 report contradiction where a revision could show planned interactions while the editor displayed zero stored bindings with no explanation.

## Universe Builder UI
- Visual Asset Registry inspector/editor.
- Asset source, role, family, semantic motif metadata and source reference controls.
- Sync and explicit approval/rejection workflow.
- Validation 2.0 panel.
- Visual Coverage and asset counts in preview.
- Preview displays approved real assets or an explicit missing-asset state.
- Better actionable interaction errors.
- Semantic motif labels explicitly state that they are metadata only.

## Optional local AI Creative Director
- Remains demand-driven and optional.
- Never requires a cloud API key.
- Explicit modes: LOCAL_AI_USED, DETERMINISTIC_FALLBACK, LOCAL_AI_FAILED_THEN_FALLBACK, LOCAL_AI_NOT_AVAILABLE as applicable.
- AI may recommend where real assets should be used but may not fabricate game-specific artwork as authentic identity.

## Data compatibility
Migration 036 is additive and upgrades schema 35 to 36 without deleting I2 data. A migration probe verified preservation of an existing user/meta record.

## Regression
Passed:
- `npm run check`
- `npm test` / 0.99 I3 suite
- 0.99 Final Foundation regression
- 0.99 I1 regression
- 0.99 I2 regression
- HF1.1 Image Manager regression

Not claimed:
- full browser automation
- live Azure deployment
- local HTTP server smoke (dependency installation in the execution container timed out before a complete Express/dotenv install)
