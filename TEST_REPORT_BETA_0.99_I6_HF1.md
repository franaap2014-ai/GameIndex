# Test Report — GameIndex Beta 0.99 I6 HF1

Date: 2026-09-16

## Final regression result

All commands below passed on the final working tree:

- `npm test` — HF1 build reliability suite
- `npm run test:099i6`
- `npm run test:099i5`
- `npm run test:099i4`
- `npm run test:099i3`
- `npm run test:099i2`
- `npm run test:099i1`
- `npm run test:099`
- `npm run test:hf1`
- `npm run test:hf1.1`
- `npm run check`

`npm run check` validated syntax for 317 JavaScript/MJS files.

## HF1 assertions

The HF1 suite verifies:

- internal release `0.99-I6-HF1`
- public version remains `0.99`
- schema 40
- persistent job/recovery structures
- resume/recovery contract
- centralized button dispatcher
- current Preview validity rules
- revision consistency
- real schema migration/data preservation

## Historical compatibility

I6, I5, I4, I3, I2, I1 and Beta 0.99 regressions all pass. Legacy HF1 and HF1.1 image/UI regressions also pass.

## Environment limitations

The suites explicitly report `azureLive: false` / `browserAutomation: false` where applicable. No claim of Azure live or full browser E2E validation is made by this report.
