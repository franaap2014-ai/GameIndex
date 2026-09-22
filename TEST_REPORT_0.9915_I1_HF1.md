# Test Report — GameIndex 0.9915 I1 HF1

## Status

**Automated execution: PASS in GitHub Actions before merge.**

Workflow: `GameIndex 0.9915 HF1 Recovery`

Validated stages:

- `npm run check`
- `npm run test:09915hf1`
- `npm run test:09915`
- `npm run smoke`

The CI run validates Node 22.13.1, syntax across the JavaScript/MJS tree, the HF1 source regression contract, the 0.9915 cinematic migration contract, and a production-mode HTTP smoke against a temporary schema 46 database.

## Verified recovery behavior

- public version remains 0.9915;
- internal recovery release identity is 0.9915 I1 HF1;
- migration 045 executes successfully and creates the avatar catalog;
- target schema reaches 46 on a fresh database;
- profile endpoints remain protected without producing a server crash;
- protected Creator/Admin pages retain backend authorization;
- the Roblox hub exposes Blox Fruits, DOORS, Fisch, Work at a Pizza Place and Prison Life;
- each planned Roblox child route resolves successfully;
- medium header/form/Test Lab/Admin source regressions are covered by the HF1 contract.

## Historical failures found by CI

The first CI passes exposed stale test expectations plus two real initialization defects: the 045 avatar insert column mismatch and the first-boot migration-before-seed ordering for Roblox starter experiences. Both were corrected before merge.

## Merge condition

Only a green workflow for the current PR head should be used as the final merge gate.
