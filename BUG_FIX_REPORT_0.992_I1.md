# Relatório — GameIndex 0.992 I1

Data: 25/09/2026. Base: `b350bb48c382330bfa60aa91de6aff1e7f16cdd1` (GameIndex 0.992). Branch local: `update/0.992-i1-stability-ux-dexter`. Versão pública 0.992, schema 47. Sem deploy ou alteração manual do banco de produção.

## 1. Escopo e método

Inventário do repositório, leitura dos contratos e READMEs vigentes, inspeção dos fluxos críticos, verificação de sintaxe e regressões com banco temporário. A versão mais recente prevalece. O inventário classifica responsabilidades por caminho; não equivale a uma prova de revisão manual de cada linha nem garante ausência de todos os bugs.

ACTIVE: servidor, módulos em uso, páginas, scripts, ativos e testes atuais. COMPATIBILITY: camadas anteriores ainda usadas pela interface ou contratos antigos. LEGACY BUT REQUIRED: migrações, regressões e documentação histórica necessárias para atualização e rastreabilidade. DUPLICATED: versões sobrepostas do estilo do cabeçalho, preservadas para não quebrar páginas antigas; uma regra final específica resolve o conflito. DEAD: função local `legacyPlainIssue`, substituída sem referências restantes, removida. Não houve exclusão especulativa de arquivos legados.

## 2. Bugs e correções

| ID / nível | Sintoma e causa | Correção / arquivos principais | Validação |
|---|---|---|---|
| AUTH-01 / P0 relatado | Botão de login sem efeito. A ocorrência original do deploy não foi reproduzida; inicialização dependente de evento e campos ocultos exigiam robustez. | `auth.js`: inicialização antes/depois do DOM pronto, desabilita campos de cadastro no login, validação visível, bloqueio de envio repetido, timeout e confirmação da sessão. | Formulário DOM real conectado ao servidor: campos inválidos, cadastro, senha errada, relogin e sessão. |
| AUTH-02 / P1 | Parâmetro return permitia destino externo. | Redirecionamento limitado à mesma origem, evitando também retorno à tela de login. | Inspeção da validação de URL; navegação completa requer navegador. |
| SHELL-01 / P1 | Cabeçalho com contratos flex/grid conflitantes. | `stability-0992-i1.css`, carregado por último nas páginas; grade específica, pesquisa móvel expansível, alvos de toque e foco. | Sintaxe e análise de seletores; visual pendente. |
| SHELL-02 / P1 | Acesso ao storage pode lançar exceção e impedir scripts comuns. | `theme-bootstrap.js`, `shell-0986.js`: adaptador com fallback em memória. | DOM com localStorage/sessionStorage bloqueados. |
| MOBILE-01 / P1 | Capa presa a coluna de 100 px e interfaces compactadas. | Grade de capa empilhada, controles e ações reorganizados, modais limitados à tela. | Inspeção CSS; visual pendente. |
| UB-01 / P1 | Aprimorar repetia pesquisa sem evidência útil e sem recuperação concreta. | Fonte de wiki adicional validada, ação de salvar/retomar, orientação explícita ao faltar pesquisa; `registered-sources.mjs`, adapters e Builder. | Testes de endereço privado, fonte inválida, persistência sem duplicação; builds com fixtures validadas. |
| UB-02 / P1 | Automação podia sobrescrever conteúdo manual. | Guarda de propriedade e bloqueios no upsert de página, aba e seção. | Teste de preservação de conteúdo manual e regressão de aprimoramento com seção protegida. |
| UB-03 / P1 | Execução de aprimoramento podia permanecer RUNNING após reinício. | Recuperação marca execução interrompida como falha recuperável. | Inspeção e testes gerais do Builder; reinício em produção não simulado. |
| UB-04 / P2 | Status tardio podia atualizar o jogo selecionado depois da troca. | Polling descarta retorno cujo build deixou de ser o atual. | Inspeção; outras requisições de abertura ainda exigem teste de troca rápida. |
| UB-05 / P2 | Códigos técnicos, mensagens contraditórias e conteúdo avançado aparente. | Rótulos e pendências em linguagem simples; regra explícita para details fechado/hidden. | Regressões do Builder; homologação visual pendente. |
| DEX-01 / P1 | Memória sem claims hidratadas prejudicava respostas e fontes. | Recupera claims e exige confiança, status e fontes. | Resposta com fato e fonte de fixture, sem nova pesquisa desnecessária. |
| DEX-02 / P1 | Ausência de continuidade e risco de confundir jogo, franquia e Experience. | Jogo explícito tem prioridade, contexto por conversa/usuário, parent da Experience e pergunta para franquia ambígua. | Blox Fruits/Roblox, troca explícita para Minecraft e isolamento entre donos. |
| DEX-03 / P1 | Dados vencidos podiam responder perguntas atuais. | Verificação de validade e data, inclusive data inválida; pesquisa adicional ou aviso sem inventar conteúdo. | Memória vencida + fonte offline não retorna o fato antigo. |
| DEX-04 / P1 | Prompt explícito excluía o input estruturado enviado ao modelo. | `dexter-service.mjs`: inclui pergunta/evidência junto ao prompt e valida formato da resposta. | Inspeção e sintaxe; modelo Ollama real não disponível para homologação. |
| DEX-05 / P1 | Teste novo revelou tentativa de salvar objeto de intenção em campo SQLite textual. | Usa `resolveIntent(...).intent`. | Consulta seguida de continuação persistida passa. |
| DEX-06 / P2 | Sem cancelamento, repetição ou estado claro. | `ai.js`, `ai.html`: cancelar, tentar novamente, nova conversa, fontes e mensagens simples. Diagnóstico interno removido da resposta pública. | Backend e inspeção; interações visuais ainda pendentes. |
| PUB-01 / P1 | Quatro endpoints públicos aceitavam jogo em rascunho. | Universe/identity/technical/experiences exigem PUBLISHED. | HTTP retorna 404 para os quatro endpoints de jogo DRAFT. |
| MEDIA-01 / P2 | Ajustar imagem deixava barras vazias. | Fundo desfocado no editor e exportação canvas; logos preservam transparência. | Inspeção; imagem exportada e interação de crop precisam de conferência visual. |
| CIN-01 / P2 | Controles distantes; retomar podia usar seleção anterior. | Controles próximos à prévia, parar, retomar só com seleção correspondente e tempo válido. | Sintaxe/inspeção; playback renderizado pendente. |
| BRAND-01 / P2 | Logo e avatares provisórios repetidos. | Emblema vetorial e 25 avatares originais, cinco por papel, catálogo idempotente que mantém uploads personalizados. | Teste de cinco ativos distintos por papel, sem placeholder e instalação repetida. |
| DOC-01 / P3 | README principal ainda anunciava release anterior. | Novo bloco vigente, release interna e notas públicas consistentes. | Sintaxe, teste de release e documentação. |

## 3. Pedidos anteriores preservados

Música da home em perfil/configurações e demais rotas do menu, retomada da posição, pausa voluntária e bloqueio de autoplay: sete regressões I2 passam. Boas-vindas com username por sessão e novo evento em relogin também passam. DEV acessa ferramentas autorizadas sem ganhar administração de usuários ou publicação. Home perde blocos redundantes de categorias e manifesto; catálogo permanece. Esses fluxos já integravam a base 0.992 e não foram reimplementados desnecessariamente.

## 4. Neon e persistência

A arquitetura vigente executa SQLite e replica snapshots duráveis no Neon; não é um conjunto de tabelas relacionais do aplicativo no Postgres. Consulta de metadados da produção nesta execução encontrou dois snapshots completos recentes, ambos com 31 chunks e 15.974.400 bytes, schema 47, release base BETA_0_992_DELIVERY. Não foram baixados dados pessoais nem executadas mutações na produção.

Restauração verifica quantidade, ordem, tamanho, hash e integridade SQLite antes da troca atômica. Snapshot incompleto não é promovido. O processo falha de modo explícito se o último snapshot completo estiver corrompido; não escolhe silenciosamente dados antigos. A retenção permanece em dois snapshots. Testes de persistência concorrente e upload em fila passaram. A aplicação continua exigindo operação com escritor único: esta atualização não cria coordenação multi-instância.

## 5. Dexter

A consulta prioriza memória verificável, pesquisa quando falta evidência e preserva a hierarquia de Experience. Contexto é isolado pelo servidor e só é reutilizado por até 24 horas; a configuração de salvar histórico é respeitada. O contexto armazena a pergunta limitada, não mensagens de outros usuários. Fontes públicas são deduplicadas. Recusa resposta factual quando não existe evidência suficiente. Ollama é opcional: sem modelo, retorna os fatos verificados em vez de simular uma geração.

Limites: qualidade semântica do modelo real não homologada; não há poda nova dos registros antigos de contexto; a janela de 24 horas limita uso, não é exclusão física. A pesquisa depende da disponibilidade e permissões das fontes externas. Cancelar fecha a consulta e impede persistência posterior no fluxo principal, mas não garante cancelamento imediato de todo provedor subjacente.

## 6. Responsividade e apresentação

CSS cobre layout até 760 px, tablet até 1024 px e redução de links até 1180 px; desktop limitado a 1440 px. Alvos pedidos: 360, 390, 412, 430, 768, 1024, 1366 e 1440 px. Reorganização do cabeçalho, capa, Builder, Dexter e Test Lab foi implementada.

**Não há evidência de screenshots renderizadas nessas larguras.** O navegador disponível não conseguiu acessar o servidor local desta sessão. JSDOM foi usado para funcionalidade do formulário e storage, não como substituto de layout real. Aprovação visual, toque, teclado móvel, temas e animações ainda precisam ser conferidos no ambiente de homologação.

## 7. Testes executados

- `npm run check`: sintaxe de todos os JS/MJS verificados pelo script.
- `npm run test:i1`: nove cenários novos, incluindo formulário DOM com servidor real, Dexter, fontes, avatares, conteúdo manual e rascunhos privados.
- `npm run test:0992`: oito cenários de integração mais navegação/transições do menu.
- `npm run test:i2`: sete cenários de sessão, música e retomada.
- `npm run test:hf3`: sete cenários de pesquisa, Builder, prévia e runtime.
- `npm run test:audit`: onze regressões mais persistência concorrente.
- `npm run smoke`: saúde HTTP, release, acesso protegido e Experiences.
- `npm test`: contratos de cinematics e migração idempotente.

Pesquisa de testes usa páginas sintéticas explicitamente identificadas; não comprova disponibilidade atual da wiki do Blox Fruits. Bancos de testes foram temporários e não substituem os dados existentes. Logs acompanham `qa/0992-i1/`.

## 8. Entrega e pendências

UPDATE ONLY sobre a base indicada, sem segredos, DB ou node_modules. Arquivos removidos: nenhum. Implementação organizada em commits locais; nada publicado automaticamente.

Pendências concretas: homologação visual nas oito larguras, música/autoplay em Android e iOS reais, cutscene e crop renderizados, fluxo completo de fonte externa disponível até publicação autorizada, Ollama real e troca rápida de jogos durante requisições do editor. Idiomas secundários ainda têm trechos novos em português. Não se declara o repositório livre de todos os bugs nem a aceitação visual concluída.
