# Relatório de bugs — GameIndex 0.9915 I1 HF2

Data: 23/09/2026. Base: `27882cccf2f899d5c2e73538b9991ed4eeb61068`.

## Escopo e resultado

Varredura do inventário de 621 arquivos versionados, leitura da documentação de releases, verificações sintáticas e de referências, revisão dirigida dos fluxos de autenticação, segurança, persistência, uploads, perfil, favoritos, social, Universe Builder e cinematics. As instruções recentes prevaleceram sobre documentação histórica. Não se afirma que todos os caminhos possíveis foram executados ou que não restam bugs.

As correções abaixo estão no UPDATE ONLY. Nenhum deploy, push ou alteração de dados de produção foi realizado nesta entrega.

## Achados tratados

| Área | Problema encontrado | Correção |
| --- | --- | --- |
| Autenticação | Cookie com escape inválido podia interromper leitura | Decodificação protegida por cookie |
| Cadastro | Senha sem limite superior no servidor | Limite de 256 caracteres |
| Rate limit | X-Forwarded-For fornecido pelo cliente mudava a chave | Usa IP resolvido pelo Express e adiciona Retry-After |
| URLs externas | Faixas privadas/mapeadas não eram todas bloqueadas | Rejeita IPv4 mapeado, CGNAT, benchmark, IPv6 local/multicast e credenciais na URL |
| Downloads | Binário inteiro era alocado antes do limite | Leitura limitada durante streaming e cancelamento de redirects |
| Neon | Requisição sem prazo limite | Timeout HTTP de 15 segundos |
| Neon | Flush concorrente podia retornar sem salvar escrita nova | Fila serializada e espera pelo upload solicitado |
| Neon | Assinatura pós-upload podia ocultar escrita concorrente | Captura assinatura do arquivo correspondente ao snapshot |
| Neon | Falha de upload podia ficar sem nova tentativa | Reagendamento de sincronização |
| Neon | Falha de checkpoint era ignorada | Checkpoint verificado antes de ler snapshot |
| Neon | Restore podia usar WAL/SHM antigos | Limpeza antes da substituição e limites de metadados |
| Encerramento | Timeout de persistência encerrava como sucesso | Prazo maior e status de falha quando não salva |
| Avatares | Upload dependia apenas de disco efêmero | Bytes persistidos em tabela e servidos com fallback durável |
| Mídias | Uploads locais de jogos tinham a mesma perda | Tabela de bytes duráveis, incorporação de arquivos referenciados existentes |
| Mídias | Exclusão podia apagar arquivo ainda compartilhado | Verifica referências nas três tabelas de overrides |
| WebP | Dimensões de VP8L eram calculadas incorretamente | Corrigida interpretação dos bits e assinatura |
| Avatar selecionado | Catálogo e perfil podiam ficar divergentes | Alterações na mesma transação |
| Catálogo de avatar | Dez opções idênticas por classe | Deduplicação visual de placeholders, preservando as 50 chaves |
| Identidade | Staff suspenso ainda recebia elegibilidade de staff | Elegibilidade considera suspensão |
| Upload no perfil | Leitura antiga podia substituir seleção nova | Validação MIME, limpeza e proteção contra corrida do FileReader |
| Perfil | Erro genérico redirecionava para login/exibia detalhes | Login somente para falha de autenticação; mensagem e tentativa novamente |
| Social | Rotas antigas permitiam seguir/amigar bloqueados | Validação de bloqueio nos dois sentidos |
| Social | Bloquear não removia follows existentes | Remove relações de follow recíprocas |
| Comunidades | autoJoin contornava aprovação de comunidade fechada | Exige comunidade ativa e OPEN |
| Comunidades | Dono/membro ativo podia virar PENDING ao entrar de novo | Preserva associação ativa; impede entrada de banido |
| Favoritos | Paginação fracionária e lista inválida geravam erros | Normalização numérica e validação da lista |
| DELETE | Ação sem corpo era rejeitada por Content-Type | Aceita DELETE vazio mantendo proteção de origem |
| CSRF | Requisições explicitamente cross-site não eram barradas cedo | Rejeita Sec-Fetch-Site cross-site |
| Compressão | q=0 podia ser ignorado e Vary sobrescrito | Negociação de encoding e combinação de Vary |
| Cinematic público | Consulta podia expor cinematic de jogo rascunho | Exige jogo publicado |
| Universe Builder | Chamada de função inexistente quebrava progresso | Usa renderFoundationBuild e mantém estado |
| Universe Builder | Job interrompido continuava em polling | INTERRUPTED tratado como terminal |
| Cinematic Test Lab | Respostas antigas substituíam preview atual | Tokens invalidam carregamentos anteriores |
| Cinematic Test Lab | Play/Restart e sequência concorriam | Cancelamento de sequência e inscrição antes do play |
| Cinematic Test Lab | Relógio de preview comum não atualizava | Assinatura de atualizações de tempo |
| Cinematic Test Lab | Estilo absoluto desprendia palco do card | Posicionamento relativo no palco do laboratório |
| Cinematic Test Lab | Reduced motion vazava para página inteira | Estado limitado ao palco local |
| Interface | Controles distantes, header/search sobrepostos | Controles junto ao preview, layout do header e regras móveis ajustados |
| Interface | Texto técnico de arquitetura e erros internos apareciam ao usuário | Texto público revisado e erros técnicos genéricos na interface |
| Documentação | README principal orientava schema 41 e versão antiga | Atualizado para 0.9915/HF2/schema 47 e arquitetura Neon vigente |

## Evidências e testes

- `npm run check`: checagem sintática do projeto.
- `npm test`: suíte corrente de cinematics, avatares, favoritos e migração.
- `npm run test:09915hf1`: recuperação acumulada e identidade interna atual.
- `npm run test:audit`: 11 regressões específicas, incluindo upgrade 46 → 47 com preservação/integridade, cookies inválidos, IP falsificado, DELETE/origem, URLs privadas, limite de download, bloqueios sociais, comunidades, favoritos, placeholders e WebP/avatar durável. Mais três verificações de persistência com Neon simulado: escrita concorrente, espera do flush e timeout.
- `npm run smoke`: inicialização e rotas HTTP com banco descartável, schema 47 e experiências Roblox recuperadas.
- Inventário de referências literais a assets locais: sem caminhos faltantes detectados.
- Análise estática encontrou chamadas inexistentes de renderFoundationProgress, corrigidas. A referência global de GameIndexCropEditor corresponde ao componente existente.
- A consulta somente leitura ao Neon encontrou dois snapshots completos, schema 46, com 23 chunks e 11.988.992 bytes cada; contagem/ordem e soma dos bytes eram consistentes. Isso verifica metadados, não simula recuperação de produção nem prova conteúdo funcional de todos os registros.
- Suítes históricas também foram tentadas; há falhas por expectativas de releases antigas e ausência de banco pré-empacotado. Elas não foram apresentadas como aprovadas nem reescritas em massa para mascarar falhas.

## Limitações e pendências para entrega

1. Não houve validação visual interativa: o navegador disponível bloqueou o acesso ao servidor local. Header mobile, preview, temas e fluxos autenticados precisam de conferência visual na hospedagem antes da entrega.
2. Persistência é assíncrona e de uma instância escritora. Múltiplas instâncias podem disputar snapshots; perda abrupta pode perder escritas ainda não sincronizadas. Não foi implementada replicação síncrona.
3. O limite padrão de snapshot é 64 MiB (configurável até 256 MiB). Guardar uploads aumenta o banco; acompanhar capacidade e planejar armazenamento próprio de objetos se crescer. Arquivos perdidos antes desta atualização não são recuperáveis sem backup.
4. A restauração consulta o snapshot completo mais recente; fallback automático para snapshot anterior corrompido não foi implementado.
5. Proteções de URL foram reforçadas, mas a conexão não fixa o IP validado pelo DNS; risco residual de DNS rebinding permanece.
6. Os 50 avatares finais ainda usam cinco artes placeholder. A duplicação da escolha foi mitigada; a arte definitiva não foi produzida.
7. Os testes de concorrência Neon usam simulação; não executam falhas reais na infraestrutura de produção. A entrega não garante ausência de outros bugs.

## Aplicação

Siga `UPDATE_ONLY_README_0.9915_I1_HF2.md`. O pacote é verificado por aplicação sobre o commit base e comparação dos bytes com os arquivos corrigidos. Nenhum banco, segredo ou node_modules faz parte do ZIP.
