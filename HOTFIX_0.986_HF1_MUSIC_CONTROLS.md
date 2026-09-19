# GameIndex Beta 0.986 HF1 — Music Controls

## Root causes fixed

1. `.gv-global-ui` intentionally uses `pointer-events:none`, but the music popover did not opt back into pointer events. The popover rendered but its slider/buttons could not receive input.
2. `Number(localStorage.getItem("gi_audio_volume"))` converted a missing value (`null`) to `0`, overriding the configured/default volume with silence.
3. The YouTube iframe received player commands only once immediately after load; HF1 repeats the initial sync shortly after load and makes PLAY state handling deterministic.
4. Critical shell/CSS URLs are cache-busted with `0986hf1`.

## Scope

- No database reset.
- No schema migration.
- No API key.
- Music remains one global YouTube player with loop enabled.
- No bottom/floating Now Playing dock is restored.

## Verification

After deployment, `/health` must report `hotfix: "HF1_MUSIC_CONTROLS"`.
