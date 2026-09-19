# GameIndex Beta 0.99 I3 — UPDATE_ONLY

Apply this package only over an existing **Beta 0.99 I2** installation.

## Procedure
1. Back up application code and the production SQLite database.
2. Copy the UPDATE_ONLY files over the I2 installation, preserving unrelated persistent media/data.
3. Run the normal dependency install step (`npm ci`). No new third-party dependency was introduced by I3.
4. Run `npm run check` and `npm test`.
5. Start the application. Migration 036 advances schema 35 to 36 automatically through the existing migration system.

## Critical behavior change
The active game page no longer loads the I1/I2 script-generated visual identity renderers. I3 uses approved real game-sourced assets through Visual Grounding Engine 2.1. Missing assets remain explicitly incomplete rather than being replaced by generated game-specific drawings.

## Data safety
Migration 036 is additive. Do not replace/delete the existing production database.

## No API key
No OpenAI or paid AI API key is required. Local AI remains optional and demand-driven.
