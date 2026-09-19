# Release Notes — GameIndex Beta 0.99 I6

## Universe Builder Experience 4.0
The normal Builder is now organized around user decisions instead of internal pipeline mechanics. Primary actions are Build, Enhance, Preview and Publish. Content, Images, Visual Identity, Appearance, Interactions and Pending Authorization are first-class status areas; technical IDs and raw declarative controls remain available in Advanced Mode.

## Build State Consistency
I6 adds explicit persisted state for current build/revision, last valid revision, Preview revision and published revision. An in-progress build no longer needs to overwrite valid previous metrics, and `0/0` images is treated as **waiting for content** rather than false success.

## Visual Identity Motif Engine
I6 discovers entity-specific visual motifs using universal categories such as symbols, items, weapons, characters, creatures, vehicles, locations, factions, abilities, UI elements, collectibles, patterns and props. Motif labels are discoveries, not global hard-coded game features. Published motif decoration requires approved real visual assets.

## Interactive Experience Discovery
Accepted research can produce localized interactive ideas. The engine classifies generic actions such as roll/randomize, shop, fish, open/unlock, assemble/craft, explore, collect, choose, compare and customize. The Game/Experience is never selected through a game-name `if` branch.

## Interactive Preview / Refinement
A suggestion can generate a functional declarative Preview. The user can:
- Approve it;
- Rebuild another version of the same concept;
- Discard it.

Rebuild preserves the concept intent while varying the renderer-controlled prototype configuration. Approved concepts are attached to the Universe through the existing safe interaction binding model.

## Pending Authorization
The Authorization Inbox records user decisions rather than internal maintenance tasks. It supports interaction and visual-identity review and high-confidence safe batch approval where permitted.

## Enhancement
The new **Enhance / Aprimorar** action accepts 1–5 passes and a focus of Smart, Everything, Content, Images, Visual Identity or Interactions. Passes run sequentially, inspect previous results, use different targeted research queries, reject low-quality duplicates and report deltas.

## Version consistency
- Public: `Beta 0.99`
- Internal: `0.99-I6`
- Target schema: 39

Active deployment/admin metadata was also updated so current diagnostics do not report obsolete 0.987/0.9875 labels.

## Preserved I5 systems
Research Quality 2.0, Semantic Image Resolver 2.0, Asset Diversity, Visual Gap Auto-Healing, Admin Control Center 2.0, Social 2.0, Bug Tracker 2.0, Regression Center, Image Manager, music controls and LOCAL_FIRST_NO_API_KEY remain intact.
