# Test Report — GameIndex 0.9915 I1 HF1

## Status

**Automated execution:** NOT RUN in the GitHub connector editing environment at the time this report was created.

No PASS claim is made without execution.

## Added regression command

```
npm run test:09915hf1
```

This runs:

```
node tests/beta09915-i1-hf1-full-recovery.mjs
```

## Source assertions covered

- public version remains 0.9915;
- internal recovery release identity is 0.9915 I1 HF1;
- target schema is 46;
- favorite/profile-avatar schema guards exist;
- Roblox parent hub resolves child experiences;
- medium header no longer contains the forced row-2 regression;
- form recovery tokens exist;
- Cinematic Test Lab contains the simplified workflow;
- migration 046 includes all five starter Roblox experiences and uses additive insertion;
- migration 46 is registered;
- Admin navigation contains the new grouped information architecture.

## Required before merge/deploy

Run at minimum:

```
npm run check
npm run test:09915hf1
npm run test:09915
npm run smoke
```

Then perform authenticated profile, public profile, Roblox child-route, Cinematic Test Lab and Admin capability smoke tests against a migrated test database.

Production readiness must not be declared until those commands and smoke flows are actually executed.
