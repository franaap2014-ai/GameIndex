# FULL deploy — GameIndex Beta 0.9875 HF1.1

Deploy the contents of `GameIndex_Beta_0.9875_HF1_1_IMAGE_INTERACTION_FIX_FULL.zip` to the Azure App Service application root.

## Preserve persistent data
Do not delete or replace:

`%HOME%\data\GameIndex\data\gamevault.sqlite`

The package contains no production database.

## Expected health marker
After startup, `/health` and `/api/health` should identify:

- version: `0.9875-HF1.1`
- release: `BETA_0_9875_HF1_1_IMAGE_INTERACTION_FIX`

## Manual checks after deploy
1. Open Image Manager.
2. Select Roblox OG -> Banner.
3. Confirm buttons/fields are readable.
4. Choose Imagem própria -> URL.
5. Paste an `https://` image URL and load preview.
6. Drag the image.
7. Drag all four corner handles and confirm live proportional resizing.
8. Apply/save and reload.
9. Repeat for Logo and one Roblox child game.
10. Confirm Modern/OG personalization and music still behave normally.

No Azure Live PASS is claimed until these checks are performed on the deployed service.
