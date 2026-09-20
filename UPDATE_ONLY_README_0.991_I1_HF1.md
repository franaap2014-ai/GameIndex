# GameIndex Beta 0.991 I1 HF1 — UPDATE ONLY

This UPDATE_ONLY package intentionally contains **the complete Beta 0.991 I1 plus HF1**. Use it even if the previous I1 deploy failed.

## Before pushing to GitHub

In **Render → GameIndex → Environment**, create the secret environment variable:

```
DATABASE_URL
```

Its value must be the PostgreSQL connection string from the **GameIndex** project in Neon.

Do not place the connection string in a file and do not commit it to GitHub.

## Install

1. Extract the UPDATE_ONLY ZIP.
2. Open the extracted folder.
3. Copy every file and folder into the root of your existing local GameIndex repository.
4. Preserve the directory structure.
5. Confirm replacement of existing files.
6. Open GitHub Desktop.
7. Review the changed files.
8. Commit as `GameIndex Beta 0.991 I1 HF1`.
9. Push to GitHub.
10. Let Render Auto-Deploy the new commit.

## Expected startup

On the first successful HF1 production start:

1. Render connects to Neon using `DATABASE_URL`.
2. HF1 checks/creates the remote snapshot control tables.
3. If Neon already has a complete GameIndex snapshot, it is verified and restored.
4. If Neon is empty, GameIndex starts from its normal SQLite seed/migrations.
5. SQLite migrates through schema 43.
6. GameIndex uploads the first durable snapshot to Neon.
7. Only then does the web server begin listening for normal traffic.

## Verification

After Render shows a successful deploy:

- Open the GameIndex.
- Open **ADM → System**.
- Account Storage should show **Persistent / Safe**.
- Provider should show **NEON_REMOTE_SQLITE_SNAPSHOT**.
- Create or recover the owner account through the normal secure setup flow.
- Wait a few seconds after important account changes.
- Restart/redeploy once and confirm the same account can still log in.

If startup says `GAMEINDEX_PERSISTENT_STORAGE_REQUIRED`, Render does not have a valid Neon `DATABASE_URL` yet.

If startup says `GAMEINDEX_NEON_RESTORE_FAILED`, do not bypass the safety check. Review the Render log and Neon connection configuration.
