# GameIndex Beta 0.991 — Package Validation

Baseline: GameIndex Beta 0.99 I6 HF2 FULL.

The release is packaged as:
- `GameIndex_Beta_0.991_FULL.zip`
- `GameIndex_Beta_0.991_UPDATE_ONLY.zip`

The UPDATE_ONLY package contains only files added or modified relative to the verified HF2 baseline. No baseline files are removed by Beta 0.991.

Final equivalence is verified by applying UPDATE_ONLY over a copy of the HF2 baseline and comparing every packaged file by SHA-256 against FULL.

Expected/required result:
- missing: 0
- extra: 0
- different: 0

Runtime dependencies are intentionally not bundled as `node_modules`; deployment should install from `package-lock.json`/`package.json`.
