# Regression Report — GameIndex 0.9915 I1 HF1

## PROFILE_HTTP_500

**Symptom:** profile requests could fail after the 0.9915 update.

**Root cause:** migration 045 declared 14 columns for `profile_avatar_catalog` but supplied only 13 values per avatar row. On a real migration run this aborted the 0.9915 schema step before the new profile tables were fully available. The new favorite/avatar repositories then exposed the incomplete schema as profile failures.

**Fix:** repaired all 50 avatar rows in migration 045 by restoring the missing `placeholder` value, kept guarded optional read paths as defense in depth, and retained schema 46 as the recovery target.

## HEADER_LAYOUT_REGRESSION

**Symptom:** medium desktop widths produced an unintended second header row.

**Root cause:** the 0.9915 media query explicitly assigned the search box to grid row 2 below 980px.

**Fix:** medium layout now remains a three-column single row and progressively hides secondary navigation. Dedicated compact behavior remains for smaller mobile widths.

## FORM_CONTRAST / SELECT_RENDERING

**Symptom:** some controls could become unreadable under inherited/theme styles.

**Root cause:** control styling was inconsistent across old and new page families.

**Fix:** scoped semantic control tokens and readable option/placeholder/focus states without applying a universal rule to the whole document.

## CINEMATIC_TEST_LAB_UX

**Symptom:** normal preview and sequence-testing controls competed in the same primary flow.

**Fix:** basic flow is now Cinematic → Context → Preview. Sequence testing is an advanced collapsible section.

## ROBLOX_EXPERIENCES_EMPTY

**Symptom:** Roblox could show no useful child experiences.

**Root cause:** parent game related-content lookup fell back to franchise games while EXPERIENCE entities are intentionally excluded from that query. On a brand-new database, migrations also run before the curated game seed, so migration 046 could execute before the Roblox parent existed.

**Fix:** parent hubs prefer child EXPERIENCE entities; migration 046 creates/repairs the starter rows for existing databases; and the idempotent recovery is reapplied after the initial seed so first-boot databases also receive Blox Fruits, DOORS, Fisch, Work at a Pizza Place and Prison Life.

## ADMIN_INFORMATION_ARCHITECTURE

**Symptom:** unrelated tools were mixed under broad Content / Visual / System buckets.

**Fix:** regrouped navigation while retaining the same capability attributes and server-side route protection.
