# UPDATE-ONLY — GameIndex Beta 0.987

The UPDATE-ONLY package contains files changed or added relative to the official Beta 0.986 HF2 FULL package used as the baseline.

Important:
- It includes migration `032_beta_0987.sql` and database runtime changes.
- It does **not** contain a SQLite database.
- It must not be used to replace `%HOME%\data\GameIndex\data\gamevault.sqlite`.
- Existing production data is migrated in place at startup.
- Backup retention defaults to 5 and only targets strict migration-backup filenames.

For the safest deployment when the deployed tree is uncertain, prefer the FULL package.
