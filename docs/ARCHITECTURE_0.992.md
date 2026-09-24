# Inspeção e dependências — 0.992

Base inspecionada: GitHub main b58ed20 (0.9915 I2). Neon confirmou snapshot completo I2/schema 47; consultas somente leitura. Implementação isolada em worktree.

- Express / server.mjs registra páginas protegidas antes dos arquivos estáticos; APIs são módulos em src/api. Frontend multipágina HTML/CSS/JS, shell-0986.js monta navegação, autenticação, tema e música. Navegar recarrega o documento; manter posição musical é menos invasivo que converter para SPA.
- Auth: cookie HttpOnly gv_session → auth-service → sessions SQLite → accessSnapshot. Capabilities consideram cargo, suspensão, Admin Connection e concessões explícitas. APIs administrativas mantêm seus guards próprios.
- Temas: data-theme + variáveis CSS; shell aplica identidade. Cutscene de troca atualmente aplica o tema antes de transferir energia e escolhe cabo apenas por claro/escuro.
- Música: /api/music/home e /api/games/:slug/music → youtube-music-service → player global do shell. I2 persiste posição, pausa e volume; falta autoplay inicial e tratamento limitado de falhas.
- Jogo: games → game_tabs/game_sections → menu do game-repository → game.js. Esta é a fonte de verdade das abas. Builder ainda consulta cinco tópicos genéricos e gera estrutura própria.
- Builder: research/orchestrator → evidências/fontes → research-quality → revisões e estrutura → imagens → interações → Preview → validation/publication. Aprimorar salva contadores de qualidade, mas não escreve os novos fatos nas seções: falha funcional além do botão.
- Cinematics: eventos por sessão (WELCOME I2), animation-editor-service, game-cutscene-service e animation-runtime. Publicação tem capability distinta de edição.
- Avatares: catálogo filtra placeholders duplicados; fallback deriva do perfil. Preserve esse comportamento.
- Persistência: SQLite local em execução; snapshots Neon duráveis. Schema 47. Uma instância escritora. Não tratar Neon como tabelas individuais da aplicação.
- Mobile: mobile-i2 + gameindex-mobile-i2; preservar reorganização e melhorar game/admin/overlays.
- Testes: check, teste da release, recovery, audit, hf3, i2 e smoke. Testes antigos conservam contratos históricos, não são todos gates atuais.

Alterações críticas serão feitas nesses pontos, mantendo auth, URLs, conteúdo manual, guards administrativos e persistência. Nenhuma migração destrutiva ou reescrita de frontend.
