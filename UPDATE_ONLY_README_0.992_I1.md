# GameIndex Beta 0.992 — I1

Este documento prevalece sobre READMEs anteriores. Versão pública: **0.992**. Release interna: **0.992 I1**. Schema: **47**, sem migração manual no Neon.

## Aplicação

1. Use a base **GameIndex 0.992**, commit `b350bb48c382330bfa60aa91de6aff1e7f16cdd1`.
2. Faça backup das configurações, uploads e dados atuais. Copie os arquivos do ZIP sobre a raiz do projeto, mantendo os caminhos. Não substitua o projeto inteiro pelo ZIP: ele contém somente alterações.
3. Execute `npm ci`, `npm run check`, `npm run test:i1`, `npm run test:0992`, `npm run test:i2`, `npm run test:hf3`, `npm run test:audit` e `npm run smoke`. Node.js >=22.13.
4. Reinicie a aplicação. Não altere DATABASE_URL nem apague os snapshots. A atualização dos avatares e das notas da versão é idempotente na inicialização.
5. Confira login, menu, pesquisa, música, perfil, Builder e Dexter no navegador. A homologação visual em dispositivos reais ainda está pendente; veja o relatório.

Nenhum arquivo precisa ser apagado. Não há banco, credenciais, node_modules ou uploads pessoais no pacote. Não houve deploy automático.

## Uso após atualizar

- **Builder:** se a pesquisa não encontrar fatos úteis, abra **Fontes da pesquisa**, informe uma página HTTPS da wiki do jogo e use **Salvar fonte e retomar**. Fontes indisponíveis continuam sendo um bloqueio legítimo; conteúdo vazio não pode ser publicado.
- **Dexter:** indique o jogo ou deixe identificar pela pergunta. Perguntas de continuação usam o contexto da conversa; **Nova conversa** o reinicia. Consulta cancelável e opção de buscar fontes atualizadas.
- **Conta:** cinco avatares por papel; uploads personalizados são preservados.
- **Música:** a continuidade e a retomada existentes são mantidas. Restrições de autoplay do navegador ainda podem exigir um gesto do usuário.

Detalhes, limitações e evidências: `BUG_FIX_REPORT_0.992_I1.md`. Inventário: `AUDIT_INVENTORY_0.992_I1.json`.
