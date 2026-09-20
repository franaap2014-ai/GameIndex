# Update Only — Beta 0.991 HF1 → Beta 0.991 I1

This update is intended to be applied over the existing HF1 repository.

## Before pushing
This I1 document is retained for release history, but the current package is **Beta 0.991 I1 HF1**. On Render, do not move `gamevault.sqlite` to a persistent local path or configure a persistent Render disk. Configure the Neon `DATABASE_URL` and follow `UPDATE_ONLY_README_0.991_I1_HF1.md`.

## Suggested GitHub Desktop flow
1. Keep the existing local GameIndex clone.
2. Apply the I1 changed/new files.
3. Review changes.
4. Commit `GameIndex Beta 0.991 I1`.
5. Push.
6. For the HF1 Render deployment, deploy only after the Neon `DATABASE_URL` is configured.

## Post-deploy checks
- account still exists after restart
- Welcome I1 runs once
- Admin → Cinematics previews do not change completion history
- Dark → Light cable is dark before transfer and light after transfer
- new logo returns to Home
- top bar provides context without duplicating the sidebar
- Report a Bug produces an Admin Bug case with sanitized diagnostics
- Developer Report can be generated/copied
