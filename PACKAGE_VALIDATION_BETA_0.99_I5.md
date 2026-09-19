# Package Validation — Beta 0.99 I5

## Release contract
- Public version: `Beta 0.99`
- Internal release: `0.99-I5`
- npm version: `0.99.5`
- Target schema: `38`
- Required architecture: `LOCAL_FIRST_NO_API_KEY`

## Source-tree validation
Before packaging, the release tree passed syntax check and dedicated/regression suites for Beta 0.99, I1, I2, I3, I4, HF1 and HF1.1.

## Packaging validation procedure
The delivery process must verify both artifacts independently:
1. Extract FULL to a clean directory and run `npm run check` plus the I5 dedicated suite.
2. Start from the exact clean I4 baseline, overlay UPDATE_ONLY, compare the reconstructed tree with the I5 release tree, and run `npm run check` plus the I5 dedicated suite.
3. Confirm migration 038 and I5 runtime files are present in both reconstructed trees.

## Exclusions
Packages intentionally exclude `node_modules`, temporary databases, VCS metadata and temporary verification directories.

Browser automation, live Azure deployment and HTTP smoke are not represented as package-generation passes unless run separately in the deployment environment.
