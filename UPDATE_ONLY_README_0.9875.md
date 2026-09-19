# GameIndex Beta 0.9875 — UPDATE ONLY

`GameIndex_Beta_0.9875_FULL_PAGE_PERSONALIZATION_UPDATE_ONLY.zip` contains only files added or changed relative to the supplied Beta 0.987 FULL baseline.

The update contains migration code (`033_beta_09875.sql`) but does not contain a database file.

The migration is additive. It records the 0.9875 release/schema level and preserves existing production data and legacy media.

Many public HTML files are included because the static cache marker changed to `09875fullpagepersonalization`, preventing mixed 0.987/0.9875 CSS and JavaScript in browser cache.

For production deployment, the FULL archive is the safer default when there is no dedicated file-diff deployment pipeline.
