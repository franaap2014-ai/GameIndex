# GameIndex Beta 0.991 I1 HF2 — Package Validation

The HF2 UPDATE_ONLY package is generated against the Beta 0.991 HF1 baseline commit so it carries the complete required update chain rather than only the final HF2 delta.

It includes:

- all files introduced/changed by Beta 0.991 I1;
- all I1 HF1 Neon persistence files;
- the HF1.1 Render persistence corrections from current main;
- all new HF2 Creator authority and Animation Editor files.

The package preserves repository-relative paths.

It must not contain:

- `.git`;
- `node_modules`;
- a real `.env`;
- a real `DATABASE_URL`;
- Neon credentials;
- setup/recovery codes;
- a production SQLite database.

The package is safe to overlay on the existing local GameIndex repository and then review/commit through GitHub Desktop.

HF2 does not require or support a persistent Render SQLite disk as its production persistence solution.
