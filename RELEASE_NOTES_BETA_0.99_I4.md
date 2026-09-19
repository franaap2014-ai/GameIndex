# GameIndex Beta 0.99 I4 — Release Notes

## Release identity
- Version: 0.99-I4 / npm package 0.99.4
- Database target schema: 37
- Universe Builder: THREE_STAGE_UNIVERSE_PRODUCTION_PIPELINE
- Runtime composition: PERSONALIZED_PAGE_COMPOSITION_2_0
- Architecture: LOCAL_FIRST_NO_API_KEY
- Update class: Intermediate (improvements + additions + bug fixes + polish)

## Why I4
I3 correctly stopped script-generated game identity, but authoring remained too opaque and personalized pages could still feel visually sparse. I4 restructures Universe Builder into a transparent production pipeline and makes section-level grounding an explicit, measurable contract.

## Three-stage Universe production pipeline
Universe Builder now separates:
1. **Research & Content Engine** — grounded research, structured pages/sections and contextual image variables.
2. **Game-Sourced Image Engine** — resolves those variables only to approved real game-sourced assets.
3. **Interactive Preview Engine** — assembles the real composition model, executes declarative interactions and allows Desktop/Tablet/Mobile preview before publication.

Publication is still explicit and remains gated by validation.

## Research & Content Engine
- Produces structured content first.
- Declares explicit `IMAGE:*` variables for hero/section visual needs.
- Stores image-variable contracts per revision and section.
- Preserves research evidence/status separation.
- Does not generate game-specific artwork.

## Game-Sourced Image Engine
- Image variables have explicit lifecycle state.
- Variables can be resolved only to APPROVED Visual Asset Registry records owned by the correct entity.
- Candidate search remains demand-driven.
- Review/approve/assign flows are available from the Builder.
- Missing required variables remain unresolved and can block publication.
- No fake SVG/game object fallback is created.

## Personalized Page Composition 2.0
- Adds per-section composition records.
- Uses varied layouts instead of one repeated text/image template.
- Section visuals are bound through resolved image variables, not sequential asset scattering.
- RICH/IMMERSIVE composition supports additional real approved accents with reuse control.
- Visual Gap metrics detect long runs of ungrounded sections.
- Published runtime consumes the same image-variable/composition model used by Preview.

## Interactive Preview Engine
- Generates revision-bound preview snapshots.
- Supports Desktop, Tablet and Mobile preview modes.
- Runs the actual structured page/section visual model and safe declarative interactions.
- Preview becomes STALE after content/image/composition/interaction edits and must be regenerated before publication.
- One failing asset degrades locally; it does not trigger fake artwork.

## Builder UX reconstruction
Top-to-bottom flow is now:
- top status + **Build / Refresh · Preview · PUBLISH**
- Research & Content
- Images
- large Interactive Preview
- Final Report at the bottom

The report separates summary, blockers, warnings and developer/technical details.

## Visual Coverage 2.0
I4 coverage is no longer based only on registry metadata. The current score incorporates:
- real approved asset grounding from I3
- required image-variable resolution
- section composition grounding
- Visual Gap quality

For RICH, the normal full-publication target is 80%. Missing required image variables, excessive visual gaps or stale preview can block publication.

## Schema 37
Migration 037 is additive and adds production-pipeline persistence for:
- image variables
- image-variable bindings
- page composition records
- preview snapshots
- Builder stage status

Existing schema-36/I3 data remains preserved.

## Compatibility preserved
- GAME / EXPERIENCE separation
- Visual Asset Registry / real-assets-only I3 rule
- Image Manager HF1.1 crop, URL preview and live resize
- Interactive Universe Engine declarative actions
- single global music player, mute and volume
- Social Beta
- Appearance / Creator Appearance
- optional local Ollama/Gemma
- no AI on basic startup
- Azure App Service deployment model

## Validation performed
Passed:
- `npm run check`
- `npm test` / I4 suite
- `npm run test:099`
- `npm run test:099i1`
- `npm run test:099i2`
- `npm run test:099i3`
- `npm run test:hf1.1`

Not claimed in the generation environment:
- full browser automation
- live Azure deployment
- HTTP server smoke (runtime dependencies such as Express/dotenv are not installed in this sandbox)
