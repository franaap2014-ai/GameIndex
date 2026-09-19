# GameIndex Beta 0.99 I1

**Release:** `BETA_0_99_I1_FOUNDATION_CORRECTION_VISUAL_GROUNDING`  
**Package:** `0.99.1`  
**Baseline:** Beta 0.99 Final Foundation  
**Schema:** 34 (unchanged)

## Fixed

- Universe Builder Game / Experience selector now waits for the shared shell runtime, exposes loading/empty/error states, and groups real entities under `GAMES` and `EXPERIENCES`.
- Public Games discovery/recommendation paths now exclude `EXPERIENCE` entities at the data/domain layer rather than hiding them in the client.
- Game-only counts and related-franchise results no longer incorrectly inflate/mix Roblox Experiences.
- Search continues to return Experiences with parent-aware routing and type metadata.

## Direct game visual grounding

Beta 0.99 I1 adds a profile-driven decorative renderer. It does not inject arbitrary AI CSS/JS and does not place page decorations in Image Manager.

- **Blox Fruits:** Jolly Roger, fruit, compass/map and katana/naval motifs.
- **DOORS:** door frame, room number, corridor and elevator motifs.
- **Fisch:** characteristic fish, hook, fishing line, water wave and boat motifs.
- **Work at a Pizza Place:** repeated pizza, pizza box and workplace-counter motifs across the page.
- **Prison Life:** prison bars/signage, security light and classic Roblox block motifs; 2016-era music inheritance remains unchanged.

The renderer is generic. Experience-specific behavior lives in identity-profile data.

## Preserved

- Universe Builder 2.0 research sources: game-specific Wiki, Fandom, Trello and YouTube.
- Dynamic page/tab/section creation.
- Interactive Component Registry and Blox Fruits weighted wheel architecture.
- Content Media remains separate from LOGO/BANNER Image Manager.
- HF1.1 Image Manager crop/URL/resize fixes.
- Roblox OG contrast protection.
- One global music runtime.
- `CREATOR > DEV > TESTER > PRO > FREE` capability foundation and future `TESTER+` submission rule.
- No required API key or paid service.

## Migration

No database migration is required. Schema remains **34**. Existing Beta 0.99 identity rows are enriched at runtime through reviewed I1 visual-grounding profiles, preserving existing IDs and data.

## Validation limits

Browser automation was not available. Azure live deployment was not performed. No Browser PASS or Azure PASS is claimed.
