# GameIndex Beta 0.99 I6 HF2 — Package Validation

Internal release: `0.99-I6-HF2`
Public release: `Beta 0.99`
Schema: `40` (unchanged from HF1)
Baseline: verified `GameIndex Beta 0.99 I6 HF1 FULL`

## Automated validation
- HF2-specific suite: PASS
- I6 HF1 build-reliability regression: PASS
- I6 regression: PASS
- I5/I4/I3/I2/I1/Beta 0.99 regressions: PASS
- 0.9875 HF1/HF1.1 regressions: PASS
- Static JS/MJS check: PASS (318 files)

## Package contract
HF2 introduces no file removals and no schema migration.

The release build must satisfy:

`HF1 FULL + HF2 UPDATE_ONLY = HF2 FULL`

with:
- missing files: 0
- extra files: 0
- different files: 0

The final ZIP extraction verification and SHA-256 values are recorded in the external release manifest generated alongside the packages.

## Validation boundary
No live Azure smoke test or full browser automation is claimed by this package build.
