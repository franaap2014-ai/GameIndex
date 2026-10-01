# GameIndex 0.992 I1 HF1 — redução de tráfego

Base obrigatória: **0.992 I1**, commit `228ade3e13ae464232239014ee1e774d17acd5a4`.
Versão pública: **0.992**. Release interna: **0.992 I1 HF1**. Schema SQLite: **47**.

## Aplicação

1. Preserve banco, uploads, configurações e DATABASE_URL. Copie o conteúdo do UPDATE ONLY sobre o projeto existente, mantendo os caminhos.
2. Execute `npm ci` (nova dependência: compression) e `npm run check`.
3. Execute `npm run test:bandwidth`, `npm run test:audit`, `npm run test:i1`, `npm run smoke` e `npm test`.
4. Faça o deploy usando o fluxo existente quando o workspace Render puder voltar a executar serviços. Os arquivos deste pacote, isoladamente, não são uma aplicação completa.
5. Confira `/api/health` e as métricas de tráfego após a reativação. Nenhuma variável nova é obrigatória e não há SQL manual a executar no Neon.

Nenhum arquivo precisa ser apagado. O pacote não inclui banco, segredos, uploads pessoais ou node_modules.

## Compatibilidade e rollback

O leitor novo restaura snapshots antigos (base64 bruto) e novos (blocos `gzip1:` ou mistos). O SHA-256 continua sendo calculado sobre o banco original, após descompactação. Os blocos mantêm limites de tamanho; a restauração valida a integridade antes de substituir o banco local.

**Depois do primeiro snapshot compactado, não volte diretamente a um release antigo do módulo de persistência.** Ele não entende o formato `gzip1:`. Se precisar reverter outras alterações do aplicativo, mantenha juntos `src/database/neon-snapshot-persistence.mjs` e `src/database/snapshot-codec.mjs` deste hotfix. Cada snapshot novo é autossuficiente; remover um snapshot anterior pela retenção normal não quebra o seguinte.

## Suspensão já aplicada pelo Render

A alteração reduz novos envios, mas não remove os 5 GB já contabilizados nem reativa o workspace. O aviso fornecido pelo usuário pede adicionar meio de pagamento ou aguardar a renovação mensal. Não foi contratado plano nem cadastrada forma de pagamento. Não é necessário mudar para Pro apenas para aplicar este código.

O conector Render exige confirmação explícita do workspace **My Workspace** antes de consultar serviços e métricas. Essa confirmação permanece pendente; nenhum comando de retomada ou deploy foi executado.

Detalhes e resultados em `BANDWIDTH_REPORT_0.992_I1_HF1.md`.
