# Beta 0.986 HF2 — UPDATE ONLY

Use this package only when the deployed source is already **GameIndex Beta 0.986 HF1 Music Controls**.

Copy the package contents over the application source while preserving the production SQLite database and persistent `HOME/data/GameIndex` user-content. Restart/redeploy the App Service so schema 30 and schema 31 migrations run once.

Do not apply HF7/R2/R3 packages after HF2.

After deploy:
1. Open `/health` and confirm `version: 0.986` and `hotfix: HF2_AI_SLIM_GAME_EXPERIENCES`.
2. Confirm the browser loads critical assets with `?v=0986hf2final`.
3. Test MUSIC, PLAY, MUTE, volume and automatic loop.
4. Open Roblox and switch Modern / OG 2009.
5. Open Blox Fruits, DOORS, Fisch, Work at a Pizza Place and Prison Life directly and by refresh.
6. In Image Manager, choose an experience scope and configure independent Logo/Hero/Background/Card images.
7. Configure child songs manually in Music Manager; HF2 intentionally does not invent them.
8. Confirm normal browsing does not start Ollama/Gemma.
