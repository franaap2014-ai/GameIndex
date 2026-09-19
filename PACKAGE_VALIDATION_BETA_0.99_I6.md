# Package Validation — Beta 0.99 I6

## Source validation
- JavaScript/MJS syntax check: **PASS** — 316 files.
- Dedicated I6 regression: **PASS**.
- I5 regression: **PASS**.
- I4 regression: **PASS**.
- I3 regression: **PASS**.
- I2 regression: **PASS**.
- I1 regression: **PASS**.
- Beta 0.99 base regression: **PASS**.
- HF1 regression: **PASS**.
- HF1.1 regression: **PASS**.

## Baseline delta
Compared with the verified I5 FULL baseline:
- I5 files: **491**
- I6 FULL files: **504**
- New files: **13**
- Changed files: **24**
- Deleted files: **0**
- UPDATE_ONLY files: **37**

## Overlay equivalence
A clean I5 FULL tree was copied, the I6 UPDATE_ONLY delta was overlaid, and the result was compared byte-for-byte against the I6 FULL source tree:
- only in FULL: **0**
- only in I5 + UPDATE_ONLY: **0**
- different file contents: **0**

## Archive validation contract
After final archive creation, FULL and UPDATE_ONLY are extracted independently. UPDATE_ONLY is applied over a fresh I5 baseline and both reconstructed trees are rechecked with the I6 syntax and dedicated regression suite. Hashes are reported outside the archive after the final immutable ZIPs are produced.

## Not claimed
- Live Azure deployment: not executed.
- Browser automation: not executed.
- HTTP smoke with installed dependencies: not executed because `node_modules` is not present in the generation environment.
