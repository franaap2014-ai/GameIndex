# Package Validation — GameIndex Beta 0.99 I6 HF1

Date: 2026-09-16

## Source-tree composition

- I6 baseline files: 504
- HF1 FULL files: 514
- New files: 10
- Modified files: 19
- Removed files: 0
- UPDATE_ONLY files: 29

## Exact overlay equivalence

A fresh verified I6 FULL tree was overlaid with the HF1 UPDATE_ONLY tree and compared by relative path plus SHA-256 for every file.

Result:

- only in HF1 FULL: `0`
- only in I6 + UPDATE_ONLY: `0`
- differing files: `0`

Therefore:

`I6 FULL + HF1 UPDATE_ONLY = HF1 FULL`

## Regression validation before packaging

Passed:

- HF1 final suite
- I6
- I5
- I4
- I3
- I2
- I1
- Beta 0.99
- legacy HF1
- legacy HF1.1
- syntax/static check: 317 JavaScript/MJS files

## Archive validation

The final packaging procedure additionally extracts the FULL ZIP and a fresh I6 FULL + UPDATE_ONLY overlay and runs the HF1 suite, I6 regression and syntax check on both trees. Final archive SHA-256 values are reported alongside the downloadable artifacts because embedding a ZIP's own hash inside that ZIP would change the hash.

## Limitations

Azure live deployment and full real-browser automation were not performed in this build environment. A final deployed Blox Fruits smoke build remains recommended before public traffic is opened.
