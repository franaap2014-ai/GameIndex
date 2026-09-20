# Update Only — Beta 0.991 HF1 → Beta 0.991 I1

This update is intended to be applied over the existing HF1 repository.

## Before pushing
The most important step is **persistent account storage**. If production currently stores `gamevault.sqlite` on an ephemeral filesystem, move/configure it on durable storage first. I1 deliberately refuses the unsafe silent fallback.

## Suggested GitHub Desktop flow
1. Keep the existing local GameIndex clone.
2. Apply the I1 changed/new files.
3. Review changes.
4. Commit `GameIndex Beta 0.991 I1`.
5. Push.
6. Deploy only after the production persistent path is configured.

## Post-deploy checks
- account still exists after restart
- Welcome I1 runs once
- Admin → Cinematics previews do not change completion history
- Dark → Light cable is dark before transfer and light after transfer
- new logo returns to Home
- top bar provides context without duplicating the sidebar
- Report a Bug produces an Admin Bug case with sanitized diagnostics
- Developer Report can be generated/copied
