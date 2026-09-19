# GameIndex Beta 0.99 I6 HF2 — Release Notes

Internal release: `0.99-I6-HF2`
Public release: `Beta 0.99`
Schema: `40` (unchanged from HF1)

## Scope
HF2 is the pre-launch visual hotfix built on the verified I6 HF1 release. It does not change the Universe Builder persistence/recovery architecture, research pipeline, interaction engine architecture, publication gate, or database schema.

## Added / changed
- Launch visual rebrand with a cleaner interactive-wiki / digital-index direction.
- Classification-aware GameIndex branding with a shared core wordmark.
- Free identity: neutral black/white treatment and no `FREE` subtitle.
- PRO identity: persistent green classification identity and `PRO` subtitle.
- Creator identity: restrained red/gold treatment and `CREATOR` subtitle.
- Appearance switching cutscene: current-accent flash, power-down, new-color wires/plugs, power-up.
- 2.5 s safety timeout and reduced-motion fallback for appearance transitions.
- Deterministic local SVG profile avatars; existing custom avatar remains preferred.
- Profile/header/drawer avatar fallback integration.
- Temporary Maker presentation credits.
- Small header/card/focus/hover visual polish and HF2 cache-busting.

## Temporary presentation credits
Visible for the Maker presentation:

Criado por

Francisco, Murilo, Victor, Samuel Fernandes e Alberto

Criado para a aula de Maker

The source contains an explicit temporary marker so this presentation copy can be removed after the presentation.

## Known validation boundary
Automated local regression/static tests were run. No claim is made for live Azure deployment validation or full browser automation in this package build.
