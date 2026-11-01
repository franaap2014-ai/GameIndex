# GameIndex Remaster 0.93 — candidate

Base: GitHub `main` at `a53bcb17b52751fc86fe93a90295f1a19e4bca5d` (GameIndex Beta 0.992 I3).

This is a separate remaster identity branch. It is **not automatically a production deploy**.

## Implemented in this branch

- Reusable geometric GI/D-pad logo asset for all role colors; no role text embedded in the SVG.
- Theme-based asset coloring through the existing brand token mechanism. Header, search, drawer, favicon.
- Cleaner dark header, search focus, side menu with collapsible grouped sections.
- Accessible local command navigation with Ctrl/Cmd+K, using links visible to the user's current capabilities.
- Route-specific short cinematic page transitions, disabled with reduced motion.
- Responsive polish for cards, lobby, search and existing Dexter UI.
- Opt-in server-side OpenAI-compatible chat/completions model provider for Dexter; the current Ollama provider remains the default. The configured provider is used by the existing evidence-gated answer flow.

## Dexter: activation

The existing Ollama route remains the default.

For an OpenAI-compatible HTTPS provider, configure secrets **on the backend only**, without committing values:

```
DEXTER_PROVIDER=openai
DEXTER_API_BASE_URL=https://api.openai.com/v1
DEXTER_MODEL=<a model available in your account>
DEXTER_API_KEY=<secret; configure only in Render>
```

The remote provider is **not considered active** without a working secret, available model, and real request validation. A local-only fallback remains for verified content.

No client-side key storage, no credentials in repository files.

## Preservation

- No SQL schema changes, no Neon writes, no modifications to snapshot codec.
- Existing GameIndex capabilities and role checks are still server-side.
- Existing profile/media/game page/cinematic/language I3 implementations are preserved.
- No dependencies or `package-lock.json` changes.

## Not yet validated

- Full interactive browser QA on the actual Render site.
- Real cloud provider inference and cost; needs account settings.
- All role/theme/resolution variants.
- Final lobby music master from the prior I3 scope.
- Full translation coverage.
- Production deployment and user acceptance.

## Tests

`npm run check`
`npm run test:0992i3`
`npm run test:remaster093`

Keep the remaster on its branch until review. Rollback of this frontend layer is removing its injection from `public/js/shell-0986.js`. Do not reset databases.
