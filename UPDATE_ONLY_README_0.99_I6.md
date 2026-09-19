# UPDATE_ONLY — GameIndex Beta 0.99 I6

Apply this package only over the verified **GameIndex Beta 0.99 I5 FULL** baseline.

The package contains only files created or changed by I6, preserving the directory structure. It includes the additive schema-39 migration and all I6 runtime/UI/tests/documentation required to reconstruct the I6 FULL tree.

## Recommended process
1. Back up the production SQLite database/data directory.
2. Start from the verified I5 application tree.
3. Overlay this UPDATE_ONLY package.
4. Run `npm.cmd ci` if dependencies are not already installed.
5. Run `npm.cmd run check`.
6. Run `npm.cmd test`.
7. Start in staging and verify the Builder before production promotion.

Public users still see **Beta 0.99**. `0.99-I6` is internal technical metadata.
