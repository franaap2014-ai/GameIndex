# GameIndex Beta 0.99 I1 — UPDATE ONLY

Apply only over the official **Beta 0.99 Final Foundation** baseline.

## Safety

- No file deletions are required.
- No schema migration is required.
- Do not delete or replace production SQLite.
- Do not use wildcard deletion in Azure persistent directories.

## Apply

Overlay the files in this package over the Beta 0.99 application files, preserving Azure persistent data folders.

After deployment, restart the App Service/application so the new release and static assets load. The relevant browser cache marker is `099i1visualgrounding`.

## Main fixes

- Universe Builder selector population/boot order.
- Top-level Games catalog no longer includes Experiences.
- Search continues to include Experiences.
- Direct game-grounded identity decorations for Blox Fruits, DOORS, Fisch, Work at a Pizza Place and Prison Life.

See `BETA_0_99_I1_CHANGED_FILES.txt` for the exact overlay manifest.
