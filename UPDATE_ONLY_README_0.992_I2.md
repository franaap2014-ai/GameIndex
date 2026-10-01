# GameIndex 0.992 I2 — UPDATE ONLY cumulativo

01/10/2026. Base: **GameIndex 0.992 I1**, commit GitHub `228ade3e13ae464232239014ee1e774d17acd5a4`.
Versão pública e package: **0.992 / 0.992.0**. Release interna: **0.992 I2**, código `BETA_0_992_I2_BANDWIDTH`. Schema: **47**.

Este README prevalece sobre os anteriores. O ZIP contém todos os 113 arquivos do projeto entregues no UPDATE ONLY I1, com suas versões mais recentes, o manifesto histórico da I1 e os acréscimos da I2. O hotfix de tráfego I1 HF1 está incorporado. O manifesto vigente é `UPDATE_MANIFEST_0.992_I2.json`; os hashes do manifesto I1 são apenas históricos.

## Aplicação sobre a I1

1. Preserve os dados, uploads, `.env` e demais configurações. Extraia os arquivos do ZIP sobre a raiz da I1, substituindo os caminhos correspondentes. Não apague os demais arquivos do projeto: este ZIP não é uma instalação completa.
2. Com Node.js >=22.13, execute `npm ci` para instalar as versões do lockfile, inclusive a nova dependência `compression`.
3. Execute `npm run check`, `npm run test:0992i2`, `npm run test:audit`, `npm run test:i1`, `npm run smoke` e `npm test`.
4. Faça o deploy pelo fluxo habitual quando a hospedagem permitir. Este pacote não realiza deploy automático.
5. Confira `/api/health`, a restauração no Neon e o consumo de tráfego após a reativação. Não há SQL manual, alteração de DATABASE_URL ou nova variável obrigatória.

Nenhum arquivo precisa ser apagado. O pacote não leva banco, `.env` real, credenciais, node_modules ou uploads de usuários. `.env.example` é apenas uma referência; não o copie por cima da configuração real.

## O que muda

- Compressão de arquivos estáticos e JSON em gzip/Brotli, mantendo downloads parciais, ETags e streams de eventos.
- Snapshots com compressão por bloco e reutilização de blocos idênticos dentro do Neon. Cada snapshot permanece completo e independente dos anteriores.
- Espera progressiva nas falhas de sincronização; o agendamento crítico não é adiado por escritas comuns.
- Escritas sem alteração e flushes de banco idêntico não geram uploads redundantes.
- Registro transacional da I2, preservando notas manuais e evitando novas gravações de metadados idênticos na inicialização.
- Os ajustes de login, mobile, Builder, avatares e Dexter da I1 continuam incluídos. As limitações já documentadas da pesquisa externa e do autoplay continuam válidas.

## Restauração e rollback

A I2 lê snapshots antigos em base64 e os novos blocos `gzip1:`, inclusive mistos. A restauração valida tamanho, ordem, SHA-256 e integridade SQLite antes de trocar o arquivo local.

**Depois do primeiro snapshot compactado, um módulo de persistência antigo não consegue restaurá-lo.** Se reverter outras partes do aplicativo, preserve juntos `src/database/neon-snapshot-persistence.mjs` e `src/database/snapshot-codec.mjs` desta atualização. Não apague snapshots para contornar a incompatibilidade. A aplicação continua exigindo um único escritor por chave de snapshot.

## Render e Neon

O código reduz novos envios; não remove consumo faturado nem desbloqueia uma suspensão de conta. O status atual da Render não foi validado porque o conector exige confirmação explícita do workspace. Não houve alteração de plano, pagamento ou deploy.

A branch Neon de auditoria existente está sem endpoint; a consulta retornou HTTP 404. Os testes de persistência usaram o protocolo simulado e não alteraram dados de produção. A homologação do ciclo real de upload/restauração continua necessária no ambiente autorizado.

Consulte `BUG_FIX_REPORT_0.992_I2.md` para os resultados e limites da validação.
