# GameIndex Beta 0.99 I6 HF1 — Release Notes

Internal release: `0.99-I6-HF1`  
Public release: `Beta 0.99`  
Schema: `40`  
Date: 2026-09-16

## Purpose

Hot fix for Universe Builder launch reliability. No I7 features were added.

## Fixed

- Persistent Universe Builder job/checkpoint state for refresh/restart recovery.
- Resume and cancel flows with job ownership checks.
- Duplicate-build prevention for the same active entity/build context.
- Research facts persisted before revision creation are linked to the current revision; safe `build_id` fallback is retained.
- Resume reuses useful persisted research instead of repeating the network research stage unnecessarily.
- A build with zero useful research facts stops as `RESEARCH_INCOMPLETE` before downstream pages/images/composition/Preview can be marked ready.
- Planned pages are separated from built/validated content.
- `0/0` image variables no longer means visual success when content has not declared visual needs.
- Current revision, last valid revision, Preview revision and published state are kept separate in the Builder flow.
- Current Preview is unavailable when the current revision is not actually previewable; last valid Preview is exposed separately.
- Main Builder controls use one delegated `data-ub-action` dispatcher, including dynamically rendered interaction/authorization actions.
- Prerequisites disable downstream actions instead of leaving apparently clickable dead controls.
- Enhance requires a useful baseline revision.
- Publish requires a completed/current valid build state.
- Root-cause UI collapses downstream failures when Research is the actual blocking stage.
- pt-BR placeholder leakage in the simple Preview flow was corrected.
- Advanced legacy renderers remain preserved for I3/I4/I5/I6 compatibility.

## Compatibility

All historical functional regression suites from Beta 0.99 through I6 plus legacy HF1/HF1.1 pass. Historical tests were updated only where required to recognize the HF1 successor release identity.

## Not claimed

- Azure live deployment was not executed in this build environment.
- Full real-browser automation was not executed.
- A live online Blox Fruits full-research acceptance build was not executed here; the build/state/recovery paths are covered by local regression tests and should still receive a final deployed smoke test.
