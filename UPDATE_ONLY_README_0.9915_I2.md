# GameIndex 0.9915 I2 — UPDATE ONLY

Data: 23/09/2026. Base: **0.9915 I1 HF3**, confirmada no GitHub em `8c622feb3edc36410d3074232425f8b52026d7b5`.

Este pacote contém somente arquivos novos/alterados desde o HF3. Copie seu conteúdo para a raiz do repositório, preservando os caminhos e substituindo os arquivos correspondentes. Não substitua por este ZIP uma instalação vazia ou uma versão anterior ao HF3.

## Aplicação

1. Guarde uma cópia da versão HF3 para reversão.
2. Extraia os arquivos na raiz do projeto. Não exclua arquivos que não estão no pacote.
3. Execute `npm run check`, `npm test`, `npm run test:09915hf1`, `npm run test:audit`, `npm run test:hf3` e `npm run test:i2`. `npm run smoke` verifica as rotas em um banco descartável.
4. Faça o deploy pelo fluxo habitual. Em caso de cache antigo, recarregue a página.
5. No Blox Fruits, clique em **Construir** ou **Retomar construção**. A tentativa incompleta passa a ser enfileirada novamente. Se fontes externas continuarem indisponíveis, consulte os diagnósticos da pesquisa; o sistema não publica conteúdo sem validação.

Versão pública: **0.9915**. Release interna: **0.9915 I2 / BETA_0_9915_I2_MOBILE**. Schema: **47**. Não há dependência de runtime nova, SQL manual, alteração de credenciais ou troca do banco. O ZIP não contém dados de produção.

## O que muda

- Mobile: navegação inferior, pesquisa expansível, controles maiores, formulários e painéis em coluna, rolagem local de tabelas, painéis recolhíveis do Builder e ajustes de editor/Test Lab.
- Música: páginas gerais usam a faixa da home e recuperam sua posição na mesma aba. Pausa manual é preservada. Jogos mantêm contexto musical próprio.
- Boas-vindas: username abaixo do título e nova apresentação após novo login/sessão, inclusive em outro dispositivo.
- Builder: **Construir** retoma pesquisa incompleta em vez de apenas devolver o registro parado; seleção do Inspector mantém as abas mobile sincronizadas.

## Conferência após deploy

Confira home, pesquisa, menu, perfil, configurações, Builder e editor em 320, 390, 768 e 1280 px. Teste também rotação e teclado. A validação local de interação usou DOM simulado; não equivale a teste visual em Safari/Chrome de aparelhos reais.

Ative a música e navegue da home para configurações/perfil. Existe recarga de página, portanto pode haver uma breve interrupção; se o navegador bloquear autoplay, toque em Play. Faça novo login para conferir o username. Reexecute o Builder para verificar a conectividade das fontes a partir do servidor de produção.

Para reverter, restaure os arquivos HF3 e remova somente os arquivos introduzidos por este pacote, conforme o manifesto. Os registros de boas-vindas por sessão são compatíveis com o schema existente.

Estas instruções são mais recentes que os READMEs HF3 e anteriores. Consulte o relatório para evidências e limites de validação.
