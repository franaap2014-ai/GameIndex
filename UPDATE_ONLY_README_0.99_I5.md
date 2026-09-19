# UPDATE_ONLY — GameIndex Beta 0.99 I5

This package contains only files created or modified relative to the exact GameIndex Beta 0.99 I4 FULL baseline used for this implementation.

## Required baseline
Apply only over Beta 0.99 I4 matching the supplied I4 FULL baseline. Do not apply over an older I1/I2/I3 deployment.

## Database
Do not overwrite the production database. The included migration `038_beta_099_i5.sql` advances schema 37 → 38 through the normal migration system.

## Deployment rule
Overlay the UPDATE_ONLY contents over the I4 application tree, preserve production data, install dependencies from the project lockfile as normal, then restart the app.

The package verification process reconstructs I5 by overlaying UPDATE_ONLY on a clean I4 baseline and compares it byte-for-byte with the I5 FULL source tree for all release files.
