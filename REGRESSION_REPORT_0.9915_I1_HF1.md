# Regression Report — GameIndex 0.9915 I1 HF1

## PROFILE_HTTP_500

**Symptom:** profile requests could fail after the 0.9915 update.

**Root cause:** new favorite/avatar repositories assumed migration 045 tables were always present. Profile composition calls favorite queries directly, so a missing/partially-restored schema could turn optional profile features into a full profile failure.

**Fix:** guarded optional read paths; writes return explicit service-unavailable errors until schema exists. Schema 46 remains the normal production target.

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

**Root cause:** parent game related-content lookup fell back to franchise games while EXPERIENCE entities are intentionally excluded from that query. Starter child rows also were not guaranteed to exist.

**Fix:** parent hubs prefer child EXPERIENCE entities; migration 046 creates missing starter rows and repairs classification for Blox Fruits, DOORS, Fisch, Work at a Pizza Place and Prison Life.

## ADMIN_INFORMATION_ARCHITECTURE

**Symptom:** unrelated tools were mixed under broad Content / Visual / System buckets.

**Fix:** regrouped navigation while retaining the same capability attributes and server-side route protection.
