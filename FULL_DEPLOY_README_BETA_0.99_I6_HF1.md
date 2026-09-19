# FULL Deploy — GameIndex Beta 0.99 I6 HF1

This package is the complete deployable GameIndex tree for internal release `0.99-I6-HF1` while preserving public display `Beta 0.99`.

## Runtime requirements

- Node.js >= 22.13
- Express / SQLite dependencies from `package-lock.json`
- no mandatory external AI API key
- optional local AI remains supported

## Database

Startup migration target is schema `40`. Migration 040 is additive and preserves existing application data.

## Main HF1 changes

- recoverable Universe Builder job state
- resume/cancel/duplicate prevention
- research fact-to-revision consistency
- truthful current Preview state
- no `0 facts → READY` downstream pipeline
- centralized reliable Builder action dispatcher
- predecessor-stage gating
- root-cause blocker UX

## Recommended deployment validation

After deployment, open Universe Builder and run a real Game/Experience build (Blox Fruits is the primary acceptance entity), then verify Build, Resume/Cancel, Enhance, Preview, Visual Identity, Interaction suggestions, authorization decisions and Publish gating.

The packaged automated regressions passed before packaging; Azure live/browser validation is deployment-specific and is not represented as completed here.
