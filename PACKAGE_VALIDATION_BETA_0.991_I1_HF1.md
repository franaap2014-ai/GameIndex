# GameIndex Beta 0.991 I1 HF1 — Package Validation

The HF1 UPDATE_ONLY package is built from the pre-I1 Beta 0.991 HF1 baseline through the complete I1 + I1 HF1 branch.

This is intentional because the first I1 production attempt was blocked before a usable deployment. The package therefore includes every I1 file again, plus the HF1 persistence files.

## Expected package characteristics

- preserves the original directory structure;
- contains modified and newly added files only;
- does not contain `.git`;
- does not contain a real `DATABASE_URL`;
- does not contain Neon passwords or connection credentials;
- includes schema 42 from I1;
- includes schema 43 from I1 HF1;
- includes all I1 UI/cinematic/navigation/diagnostic changes;
- includes the Neon durable snapshot runtime;
- includes the HF1 deployment guide.

## Required external configuration

The package alone cannot supply a secret database credential.

Before production startup, configure the Render environment variable:

```
DATABASE_URL=<connection string copied from the Neon GameIndex project>
```

The connection string must remain outside GitHub.
