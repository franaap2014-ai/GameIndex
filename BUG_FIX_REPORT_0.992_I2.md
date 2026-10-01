# Relatório — GameIndex 0.992 I2

01/10/2026. Base confirmada no GitHub: `franaap2014-ai/GameIndex`, main `228ade3e13ae464232239014ee1e774d17acd5a4` (GameIndex 0.992 I1). Implementação local em `update/0.992-i2-bandwidth`. Sem push ou deploy.

## Conteúdo cumulativo

A entrega conserva todos os caminhos do ZIP I1: 113 arquivos de projeto e seu manifesto histórico. Arquivos alterados recebem o conteúdo atual da I2; os demais permanecem iguais. Acrescenta o trabalho de tráfego anteriormente preparado como I1 HF1, o registro transacional da I2, testes, logs e instruções. A versão pública permanece 0.992 e o schema permanece 47.

Os ajustes de login, cabeçalho e mobile, avatares, Dexter, proteção de conteúdo manual e recuperação de fontes do Builder da I1 estão incluídos. Esta entrega não afirma eliminar todos os bugs nem substitui homologação visual em dispositivos reais.

## Correções incorporadas

| Problema | Correção na I2 | Validação |
|---|---|---|
| Pequenas alterações reenviavam todo o SQLite em base64 | SHA por bloco; cópia dos blocos idênticos dentro do Postgres; gzip quando reduz o tamanho | Restauração byte a byte, dados compressíveis e incompressíveis, crescimento e redução |
| Flush forçado repetia conteúdo idêntico | Hash integral evita reenvio redundante | Flush normal e forçado sem payload adicional |
| Escritas vazias acionavam sincronização | Dirty apenas quando Statement.run informa changes > 0 | Regressões de persistência e auditoria |
| Falhas persistentes provocavam novas tentativas frequentes | Retry automático exponencial de 5 segundos até 5 minutos | Falha simulada, espera e retomada; novas escritas respeitam a espera |
| Escritas comuns adiavam uma sincronização crítica já agendada | Preservação do agendamento mais cedo | Cenários de agendamento e concorrência |
| Cópia remota incompleta poderia produzir backup inválido | Conferência da quantidade copiada, falha sem publicar, reenvio integral no retry | Origem ausente, snapshot anterior preservado e recuperação |
| Arquivos estáticos não recebiam a compressão anterior | Middleware de compressão de streams para GET/HEAD | gzip, Brotli, identity, ETag 304, Range 206, SSE, no-transform, proteção e JSON |
| Metadados idênticos eram regravados no boot | Comparação antes de gravar; registro idempotente da release | Duas chamadas consecutivas com zero alterações SQLite |
| Notas e marcador da versão podiam ficar divergentes após falha | Transação conjunta e deduplicação | Falha forçada com rollback e nova tentativa sem duplicação |
| Notas manuais precisavam sobreviver à atualização | Preservação de seções extras e texto legado | Upgrade I1 com notas personalizadas e registro malformado |
| Exemplo de ambiente ainda indicava schema 46 | Referência atualizada para 47 | Check e inicialização local |

Cada snapshot novo contém suas próprias linhas, mantendo-se restaurável depois da retenção dos anteriores. Não houve mudança de schema Postgres nem desativação da persistência. O leitor aceita base64 legado e `gzip1:`, limita a expansão por bloco e valida tamanho, ordem, hash integral e integridade SQLite.

**Rollback:** após o primeiro snapshot compactado, preserve os módulos novos de persistência e codec ao reverter outras partes do app; o leitor antigo não entende `gzip1:`.

## Testes executados nesta I2

Ambiente: Node.js 24.19.0; bases SQLite temporárias e dados sintéticos. Todos os comandos abaixo terminaram com código 0. Logs em `qa/0992-i2/`.

| Comando | Resultado |
|---|---|
| `npm run check` | Sintaxe válida em 372 arquivos JavaScript/MJS |
| `npm run test:0992i2` | 5 cenários de release, 9 de persistência e 9 verificações HTTP |
| `npm run test:audit` | 11 cenários de auditoria; concorrência de uploads e timeout Neon |
| `npm run test:i1` | 9 cenários: avatares, Dexter, fontes, storage, conteúdo manual, login real via DOM e restrição de rascunhos |
| `npm run smoke` | Servidor local e rotas públicas/protegidas respondendo conforme o teste |
| `npm test` | Contratos e migrações da suíte principal; identificadores internos atualizados para I2 |

A suíte principal ainda exibe o nome histórico 0.9915 no resumo; suas asserções da configuração da release foram atualizadas para I2. O teste da tela de login usa DOM simulado com servidor HTTP real; não é evidência de renderização visual.

Medição local do arquivo JavaScript real do Universe Builder: **98.112 bytes sem compressão, 25.351 bytes gzip, 25.807 bytes Brotli**. O teste de dados aleatórios mudou 1 de 8 blocos, transmitindo apenas esse bloco. O benchmark de 16 MiB altamente repetitivo enviou 758 bytes de payload e reutilizou 31 blocos. Este último é deliberadamente sintético: não prevê a economia real nem garante consumo inferior à cota mensal.

Os contadores de payload contam uploads completos e reiniciam com o processo; não incluem todo o tráfego faturado, cabeçalhos ou falhas parciais. Evidência histórica adicional: `BANDWIDTH_REPORT_0.992_I1_HF1.md` e `qa/bandwidth-hf1/`.

## Verificação da entrega

O empacotamento confere a presença de todos os caminhos do ZIP I1, calcula SHA-256 de cada arquivo e testa o CRC do ZIP. Também aplica o pacote a uma cópia limpa do commit I1 e compara seus arquivos com a árvore final da I2. O manifesto atual é `UPDATE_MANIFEST_0.992_I2.json`; o manifesto I1 foi mantido apenas como histórico. Nenhum banco, segredo, node_modules ou upload pessoal foi incluído.

## Limites externos

- O aviso fornecido pelo usuário documentou suspensão da Render por limite de tráfego. O código identifica amplificação pelos snapshots integrais, mas não permite atribuir a eles uma porcentagem dos 5 GB usados.
- A consulta Render retornou `no workspace selected`; o conector exige confirmação explícita de workspace antes de inspecionar serviços. Portanto, não houve confirmação de status atual, consumo, logs ou reativação.
- A branch Neon de auditoria `br-late-glade-akht05zk`, projeto `small-silence-16701159`, está sem endpoint; a consulta desta etapa retornou HTTP 404. Não houve nova mutação no Neon nem alteração de dados de produção.
- A cópia por `INSERT SELECT` e o protocolo de snapshots foram testados com simulação em memória. Falta homologar a integração em um endpoint Neon disponível, incluindo upload e restauração após reinício.
- A atualização reduz consumo futuro, mas não desfaz suspensão de conta. Nenhum plano, cartão, configuração de cobrança ou deploy foi alterado.
