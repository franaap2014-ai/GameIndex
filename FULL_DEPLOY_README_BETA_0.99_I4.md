# GameIndex Beta 0.99 I4 — Full Package Deployment

This FULL package is a complete Beta 0.99 I4 tree evolved from Beta 0.99 I3.

## Requirements
- Node.js >= 22.13
- npm
- existing Node/Express + SQLite deployment model
- Azure App Service remains supported
- no OpenAI API key or other paid AI API is required

## Deployment
1. Back up the deployed application and production SQLite database.
2. Deploy the contents of this FULL package while preserving production persistent data/media.
3. Run `npm ci` in the target environment.
4. Run `npm run check`.
5. Run `npm test`.
6. Start with `npm start` or the existing Azure startup command.
7. The migration system advances schema 36 to schema 37 when required.

## Database
Do not replace the production database. Migration `037_beta_099_i4.sql` is additive.

## New Universe Builder flow
The current Builder is intentionally ordered as:
1. Research & Content Engine
2. Game-Sourced Image Engine
3. Interactive Preview Engine
4. Final Report

The main Publish control is near the top. Publication remains explicit and may be blocked by unresolved required images, low RICH visual coverage, excessive visual gaps, invalid interactions or stale Preview.

## Real-asset rule
I4 preserves the I3 rule: missing game identity is never replaced by a script-generated fish, Jolly Roger, door, fruit or other imitation. Image variables resolve only to approved real assets. Neutral GameIndex UI fallback may remain neutral; it must not pretend to be game artwork.

## Post-deploy regression priorities
Verify on staging:
- open Universe Builder for Blox Fruits, Fisch and DOORS
- run FULL_ENTITY_BUILD
- inspect Research & Content image variables
- review/approve/assign real image candidates
- confirm RICH composition fills major sections without long generic gaps
- regenerate Desktop/Tablet/Mobile Preview
- confirm interactions run in Preview
- verify Preview becomes stale after an edit
- confirm Publish is blocked until the current Preview/validation is ready
- publish a validated revision and compare public page to Preview
- verify HF1.1 Image Manager
- verify music/mute/volume
- verify mobile and Azure startup

## Validation note
Syntax and automated I4/0.99/I1/I2/I3/HF1.1 regressions passed during package generation. Browser automation, live Azure deployment and HTTP smoke with installed dependencies are not claimed by the generation environment.
