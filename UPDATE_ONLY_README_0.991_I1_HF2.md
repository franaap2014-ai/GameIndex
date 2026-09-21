# GameIndex Beta 0.991 I1 HF2 — UPDATE ONLY

This package intentionally contains the **complete update chain from the Beta 0.991 HF1 baseline**:

```
Beta 0.991 I1
+ Beta 0.991 I1 HF1
+ Beta 0.991 I1 HF1.1
+ Beta 0.991 I1 HF2
```

It does not depend on the earlier I1 deployment having completed successfully.

## Before deployment

Render must already contain the secret environment variable:

```
DATABASE_URL
```

Use the connection string for the Neon **GameIndex** project / `gameindex` database.

Do not commit the connection string to GitHub.

Do **not** configure a Render Persistent Disk for the GameIndex SQLite database. On Render, SQLite is temporary runtime storage; Neon is the durable snapshot authority.

## Install

1. Extract the UPDATE_ONLY ZIP.
2. Copy every file/folder from the extracted package into the root of the existing GameIndex repository.
3. Preserve the directory structure and replace existing files when asked.
4. Review the changes in GitHub Desktop.
5. Commit the update as **GameIndex Beta 0.991 I1 HF2**.
6. Push to GitHub.
7. Let Render Auto Deploy the new commit.

## Expected first HF2 startup

The current production snapshot is schema 43. A successful HF2 boot should:

1. connect to Neon;
2. restore the latest complete SQLite snapshot;
3. open the restored SQLite runtime;
4. run additive migration 044;
5. repair missing Creator/DEV Admin Connections;
6. create the Animation Editor tables;
7. start the server at schema 44;
8. upload future durable snapshots back to Neon.

## Verification after deploy

Log in as the primary Creator and verify:

- the sidebar ends with the collapsible **ADMIN PANEL**;
- Admin → Sistema shows CREATOR with an active Admin Connection;
- the capability count is full for Creator;
- Animation Editor opens;
- a draft can be created and saved.

Then restart/redeploy Render once and confirm that the same Creator account and animation draft still exist.

That restart test is the final production persistence acceptance test.
