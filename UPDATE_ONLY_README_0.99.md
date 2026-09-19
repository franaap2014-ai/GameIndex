# UPDATE ONLY — GameIndex Beta 0.99 Final Foundation

## Package
`GameIndex_Beta_0.99_FINAL_FOUNDATION_UPDATE_ONLY.zip`

This archive contains only files added or changed relative to the Beta 0.9875 HF1.1 baseline, plus `BETA_0_99_CHANGED_FILES.txt`.

## Important
- Do not delete the production database.
- Do not replace `%HOME%\data\GameIndex`.
- Do not run broad wildcard deletion against backup folders.
- Migration 034 is additive and should be allowed to run normally on startup.
- Preserve the existing App Service persistent data path and environment configuration.

## Upgrade semantics
- Roblox remains GAME.
- Blox Fruits, DOORS, Fisch, Work at a Pizza Place and Prison Life become EXPERIENCE records under Roblox using in-place classification.
- Experiences leave the top-level Games catalog but remain searchable and routable.
- Universe Builder 2.0 Final Foundation, revisioned dynamic structures, Content Media, identity/technical profiles and safe interactive component infrastructure are added.

## After update
Verify:
- `/api/health`
- global Games page has Roblox but not its five Experiences as top-level cards
- Search finds the five Experiences
- `/game/roblox/<experience>` routes
- Roblox parent Experience list
- Creator Universe Builder entity context
- Image Manager LOGO+BANNER and HF1.1 crop/URL behavior
- music MUTE/loop behavior

Browser automation and Azure live deployment are not claimed by this package validation.
