# Deploy — GameIndex Beta 0.986 Production Consolidation

## 1. Back up first

Keep the current Azure persistent data directory. Do not delete `%HOME%\data\GameIndex` and do not replace its production SQLite file with a packaged database. Schema 29 is additive.

## 2. Extract the FULL

Extract `GameIndex_Beta_0.986_PRODUCTION_CONSOLIDATION_FULL.zip` into a clean local directory. The extracted root must directly contain:

- `server.mjs`
- `package.json`
- `package-lock.json`
- `web.config`
- `iis-start.cjs`
- `public/`
- `src/`

Do not deploy a parent folder around those files.

## 3. Install and validate locally

Node.js 22.13 or newer is required.

```powershell
npm.cmd ci
npm.cmd run check
npm.cmd test
npm.cmd run smoke
```

`npm run smoke` starts an isolated temporary schema-29 server, checks `/health`, `/api/health`, Home, Games, pagination and protected-route behavior, then removes the temporary database.

## 4. Azure environment

Recommended core settings:

```text
NODE_ENV=production
PERFORMANCE_MODE=true
DEV_TOOLS=false
AI_MODE=LOCAL_FIRST
OLLAMA_ENABLED=true
OLLAMA_MODEL=gemma3:4b
MAX_CONCURRENT_AI_TASKS=1
GAMEINDEX_BACKGROUND_WORKERS=false
SCM_DO_BUILD_DURING_DEPLOYMENT=true
```

Do not add `OPENAI_API_KEY` or `YOUTUBE_API_KEY` for this release.

Optional email 2FA requires SMTP only when you enable the feature:

```text
GAMEINDEX_SMTP_HOST=
GAMEINDEX_SMTP_PORT=587
GAMEINDEX_SMTP_SECURE=false
GAMEINDEX_SMTP_USER=
GAMEINDEX_SMTP_PASS=
GAMEINDEX_SMTP_FROM=
```

Keep SMTP credentials only in Azure environment settings, never in the ZIP/repository.

## 5. Deploy

Deploy the extracted project root to the existing App Service `gameindex-ffbaaae6fvcpavet`. Preserve the existing Azure persistent data directory.

## 6. Live smoke test

After deployment verify:

- `/health` returns `version: 0.986`.
- `/api/health` returns the current 0.986 runtime.
- Home and Games load and the header search is constrained.
- The Home slogan is centered relative to the viewport.
- Game pages do not show `Criar conteúdo`, `Criar páginas` or `Pesquisar imagem`.
- Roblox top music controls work; only one track plays; main and OG loop; volume/mute work.
- There is no bottom/floating YouTube panel.
- Creator/DEV accounts with an active Admin Connection see the retractable Admin Panel below Configurações.
- Universe Builder, Image Manager and Music Manager open according to capabilities.
- Image Manager can store a local/URL image and the public page uses the manual override.
- Password change invalidates old sessions/password use as designed.
- If email 2FA is enabled, test code delivery before relying on it.
- Ollama offline does not break the public site or the basic Universe overview.

Only call the release `AZURE LIVE PASS` after these checks have actually passed on the deployed site.
