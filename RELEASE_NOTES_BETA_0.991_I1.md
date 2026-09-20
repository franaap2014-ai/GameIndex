# GameIndex Beta 0.991 I1

Incremental reliability, navigation, cinematic and diagnostics release built on Beta 0.991 HF1.

## Included
- Production account-storage guard: production no longer silently starts on an unconfigured ephemeral SQLite path.
- Schema 42 with structured bug diagnostics and audited cinematic administrative actions.
- Welcome event versioned as `welcome_0991_i1`.
- Welcome/identity cinematic choreography now clears title and technological details before the iris reopens.
- Welcome decorations use rails, nodes, brackets and scan accents instead of loose wire-like lines.
- Admin Cinematics Center with real-engine preview, queue/event state and controlled eligibility reset.
- Theme power cutscene now derives cable color from source and target themes: Dark → Light begins dark and ends light; Light → Dark begins light and ends dark.
- New adaptive Game Index header mark with identity accent support and Home navigation.
- Context-aware top-bar compass with a small number of relevant shortcuts while the sidebar remains the full navigation source.
- Public bug reports attach bounded, sanitized client/runtime diagnostics.
- Admin Bug Tracker can generate and copy a developer-oriented Markdown report.
- Expanded compatible bug workflow states while preserving legacy statuses.

## Persistence requirement
In production, configure a genuinely persistent path through `GAMEINDEX_DATA_DIR` or `GAMEINDEX_DB`. GameIndex intentionally refuses to boot on an unconfigured ephemeral production filesystem unless the explicit emergency override is enabled. The override is not appropriate for real production data.

## Security
No password, auth cookie/token, setup code or credential is intentionally collected by the diagnostics pipeline. Server-side capabilities continue to guard Admin/Cinematics/Bug APIs.
