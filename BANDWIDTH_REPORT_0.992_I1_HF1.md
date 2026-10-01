# Auditoria de tráfego — GameIndex 0.992 I1 HF1

26/09/2026. Base GitHub: `228ade3e13ae464232239014ee1e774d17acd5a4`. Branch local: `fix/0.992-i1-hf1-bandwidth`. Sem deploy, alteração de plano ou mutação de dados de produção.

## Causa confirmada e limites da evidência

O aviso apresentado pelo usuário confirma suspensão do workspace Render por atingir **5 GB de bandwidth gratuito**. Esta é uma restrição da conta de hospedagem; código novo não apaga consumo já registrado.

A consulta de metadados no Neon encontrou dois snapshots completos, cada um com **15.974.400 bytes**, **31 blocos**, criados em **25/09/2026 às 00:49:46.771Z e 00:49:57.168Z** (10,397 segundos de diferença). Ambos identificam a release BETA_0_992_DELIVERY. Não foi lido o conteúdo dos bancos de produção.

Antes da correção, uma alteração no SQLite causava retransmissão integral em base64: aproximadamente **21.299.200 bytes de payload** por snapshot desse tamanho, fora SQL e cabeçalhos. O código confirma amplificação do tráfego, mas não foi possível atribuir uma porcentagem dos 5 GB a ela. Só existem dois snapshots retidos; eles não demonstram uma frequência contínua durante o mês.

O Render retornou `no workspace selected` e exige que o usuário confirme qual workspace usar. A lista retornou **My Workspace**. A exigência não foi contornada por outra credencial ou ferramenta. Métricas de consumo, logs e estado atual do serviço permanecem sem consulta.

## Problemas corrigidos

| Problema | Correção | Arquivos |
|---|---|---|
| Banco inteiro retransmitido após pequenas alterações | SHA por bloco; blocos iguais são copiados dentro do Postgres com INSERT SELECT, sem retornar ao Render. Cada snapshot recebe suas próprias linhas, sem cadeia de dependências. | neon-snapshot-persistence.mjs |
| Payload em base64 sem compactação | Gzip por bloco somente quando reduz o tamanho. Dados incompressíveis permanecem em base64 bruto. | snapshot-codec.mjs |
| Envios forçados repetiam banco idêntico | Hash integral continua impedindo duplicação, inclusive no flush de desligamento. | neon-snapshot-persistence.mjs |
| Escritas vazias disparavam sincronização | Statement.run só sinaliza alteração quando SQLite informa changes > 0. Exemplo: limpeza de sessões expiradas sem nenhuma sessão a remover. | connection.mjs |
| Escrita não crítica podia adiar sincronização crítica já agendada | O agendamento mais cedo é preservado; escritas novas respeitam o intervalo de retry. | neon-snapshot-persistence.mjs |
| Falha persistente repetia envios em intervalo curto | Retry automático exponencial de 5 segundos até 5 minutos; flush explícito de recuperação/desligamento continua disponível. | neon-snapshot-persistence.mjs |
| Compactação HTTP só interceptava res.send | Middleware de streams cobre express.static/sendFile e JSON. Brotli com qualidade moderada e gzip; preserva SSE, Range, no-transform e negociação de conteúdo. | performance-runtime.mjs, package.json, package-lock.json |
| Exemplo de ambiente ainda limitava schema a 46 | Exemplo atualizado para 47, sem alterar a configuração real de produção. | .env.example |

A rotina de persistência continua ativa; não foram retiradas garantias de validação para economizar tráfego. O formato e contadores de payload de uploads completos aparecem no diagnóstico existente da persistência. Contadores reiniciam com o processo e não equivalem à fatura do Render: não incluem SQL, cabeçalhos, falhas parciais nem demais tráfegos.

## Compatibilidade e integridade

- Leitura de snapshots legados, compactados e mistos.
- Verificação de ordem/quantidade de blocos, tamanho descompactado, SHA integral e integridade SQLite antes da troca do arquivo.
- Limite de saída descompactada de 1 MiB por bloco para impedir expansão ilimitada.
- Snapshot permanece incompleto até que todos os blocos estejam disponíveis.
- Falha na cópia remota não publica snapshot incompleto; retry pode reenviar os blocos compactados por completo.
- Gravações concorrentes continuam enfileiradas; chamadores aguardam o flush que inclui a atualização seguinte.
- Retenção de snapshots anteriores e modelo de escritor único preservados. Não há migração de schema Postgres.
- Rollback de código de persistência anterior ao hotfix não lê `gzip1:`; preserve o leitor novo conforme README.

Foi criada a branch Neon `audit-bandwidth-0992-i1-hf1` (`br-late-glade-akht05zk`), sem compute. Nenhuma mutação ou execução de testes foi feita na produção ou nessa branch. Os testes de protocolo usaram um servidor simulado em memória; a instrução INSERT SELECT ainda precisa de homologação com o serviço real. A branch foi mantida, sem exclusão automática.

## Resultados dos testes

1. **Persistência nova: 9 cenários.** Formato antigo/novo, bytes aleatórios, payload inválido e expansão excessiva, reaproveitamento remoto, snapshot independente após remover o anterior na simulação, flush idêntico sem tráfego, restauração por nova instância, hash inválido, falha/retry, origem de cópia ausente, crescimento e redução do arquivo.
2. **Concorrência existente:** atualização durante upload e espera dos chamadores; timeout em cada requisição Neon.
3. **HTTP: 9 verificações.** Gzip, Brotli, identity, ETag 304, Range 206, SSE, no-transform, rota protegida e JSON.
4. **Regressões:** `npm run check`, `npm run smoke`, `npm run test:audit`, `npm run test:i1` e `npm test` passaram.

Medições locais:

| Cenário | Antes / sem compactação | Depois |
|---|---:|---:|
| JavaScript real do Universe Builder | 98.112 bytes | 25.351 bytes gzip; 25.807 bytes Brotli |
| Snapshot sintético altamente repetitivo de 16 MiB, uma mudança em um bloco | 22.369.624 bytes base64 | 758 bytes de payload enviados; 31 blocos copiados no Neon simulado |
| Arquivo aleatório de 4 MiB, mudança em um bloco | 8 blocos enviados | 1 bloco enviado, 7 reutilizados; abaixo de 13% do payload integral |

O cenário de 758 bytes é deliberadamente sintético e muito compressível; **não é previsão de consumo real do GameIndex**. A economia depende de quais blocos mudam e do conteúdo do banco. O hotfix não garante permanência abaixo de 5 GB/mês. Logs ficam em `qa/bandwidth-hf1/`.

## O que falta para concluir na hospedagem

1. Confirmar **My Workspace**, exigência expressa do conector Render, para consultar métricas e serviço.
2. Resolver a suspensão de conta pelo fluxo de cobrança apresentado no painel ou aguardar a renovação mensal. Nenhuma cobrança foi autorizada por esta tarefa.
3. Aplicar o UPDATE ONLY sobre 0.992 I1, instalar dependências e fazer deploy quando a plataforma permitir.
4. Confirmar boot/restauração, upload e reinício no ambiente real; comparar Outbound Bandwidth separando respostas HTTP e tráfego iniciado pelo serviço.

Documentação consultada: https://expressjs.com/en/resources/middleware/compression/ ; https://render.com/docs/outbound-bandwidth .
