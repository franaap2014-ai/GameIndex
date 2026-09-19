# Migration Report — 0.985 HF3

Schema: 26 → 27.

Preserved: users, authentication, roles, themes, Social, games, entities, knowledge, pages, Universe jobs/state, subscriptions and legacy rollback tables.

Invalidated intentionally: Image Engine 3 HF2 asset/revision/candidate/attempt cache. This prevents already persisted wrong-context covers from surviving the new strict media policy. Images are rediscovered on demand under HF3 policy.

New meta markers:
- `beta_0985_hf3=1`
- `image_engine3_policy=HF3_STRICT_DIGITAL_CONTEXT_V1`
- `image_engine3_cache_reset=HF2_VISUALS_INVALIDATED`
- `audio_runtime=GAMEINDEX_ORIGINAL_MUSIC_2`
- `rebirth_theme_engine=THEME_AWARE_V3`
