# Relatório de correções — GameIndex 0.992

Data: 24/09/2026. Base: main b58ed20c22df10b233b86760dc80a1dc6d492110 (0.9915 I2). Entrega incremental: código e documentação, sem publicação automática. A varredura priorizou os problemas relatados e seus caminhos dependentes; não constitui garantia de ausência de todos os bugs.

## Correções e escopo

| Item | Gravidade original | Alteração / evidência |
| --- | --- | --- |
| 1. Música nas páginas laterais | MAJOR | Mantém contexto da home em perfil/configurações/social, posição, volume e pausa. Teste I2 em VM passou. |
| 2. Autoplay e falhas de reprodução | MAJOR | Tentativa inicial, retomada por gesto, estado bloqueado/indisponível, limites de espera, fallback e descarte de eventos de players antigos. Reprodução audível real pendente. |
| 3. Boas-vindas após relogin | MAJOR | Preservada correção I2 por sessão e username. HTTP validou sessões distintas e nome correto. |
| 4. DEV no painel | MAJOR | Capability específica admin_panel e página restrita. HTTP validou acesso às ferramentas e negação a usuários, controle Creator e banco. Não concede publicação de animações. |
| 5. Transições laterais | MINOR | Efeito por destino, 700 ms desktop / 500 ms mobile, cancelamento com Escape, respeito à redução de movimento, limpeza e proteção contra cliques duplicados. Teste VM passou. |
| 6. Troca de tema | COSMETIC | Cor antiga preservada durante conexão do cabo; energia usa a cor calculada do próximo tema antes da aplicação. Inspeção de código; avaliação visual pendente. |
| 7. Builder e esquema de conteúdo | MAJOR | Pesquisa e estrutura seguem game_tabs/game_sections existentes, com contexto Roblox para Experiences. Não inventa cinco categorias genéricas. Testes locais com respostas sintéticas para CS2, Blox Fruits e Minecraft passaram. |
| 8. Seleção de evidências | MAJOR | Nome da entidade separado da pergunta; evidências distintas priorizadas antes das repetições de outras fontes. Limiares de validação mantidos. |
| 9. Aprimorar sem gravar conteúdo | MAJOR | Novas evidências aceitas incorporadas às seções editáveis e snapshot da revisão. Teste comprovou texto novo persistido, preservação de nota manual bloqueada e rejeição de revisão de outro jogo. |
| 10. Aprimorar e interação | MAJOR | Início assíncrono, acompanhamento de execução, carregamento/sucesso/erro, prevenção de execução simultânea e resultado associado ao jogo/revisão inicial. Sem fatos novos, informa isso. |
| 11. Cutscene de jogo | MINOR | Cria projeto DRAFT na construção para revisão no editor. Não publica nem associa automaticamente uma animação não aprovada. |
| 12. Mobile | MAJOR | Preserva reorganização I2 e adiciona ajustes de colunas, abas roláveis, alvos de toque e efeitos reduzidos. Layout visual e gestos em aparelhos reais ainda não certificados. |
| 13. Identidade e avatares | MINOR | Preservadas correções I2 de logo/navegação e catálogo/fallback de avatares. Regressões de shell e avatares passaram; não foi possível comparar a imagem antiga ausente. |
| 14. Versão e trilha de atualização | MINOR | Rótulos atuais 0.992, contrato de release, metadados e update log idempotentes; documentação histórica permanece histórica. Sem nova migração estrutural. |

## Validação executada

- `npm run check`: sintaxe de todos os arquivos JS/MJS (363 antes da inclusão do teste de navegação; verificação final inclui esse teste).
- `npm test`: contrato da release, cinemáticas e idempotência.
- `npm run smoke`: aplicação HTTP, saúde e rotas públicas.
- `npm run test:audit`: 11 regressões funcionais/de segurança + 3 verificações de persistência concorrente/timeout.
- `npm run test:hf3`: 7 regressões de pesquisa, Builder, Preview e shell.
- `npm run test:i2`: 7 regressões incluindo identidade de sessão, contexto musical, posição, pausa e retomada de build incompleto.
- `npm run test:0992`: 8 cenários backend/HTTP (papéis, três jogos, Aprimorar, login/saída) e teste VM de navegação lateral.
- `git diff --check`: sem erros de whitespace.
- Conferência do pacote: arquivos comparados byte a byte com o worktree e aplicados sobre a árvore da base I2. Não inclui banco, credenciais ou dependências instaladas.

Os testes de pesquisa usam respostas HTTP sintéticas identificadas como fixtures. Não demonstram descoberta bem-sucedida de fontes externas hoje, riqueza de conteúdo ou aprovação de imagens reais. As páginas dos três jogos respeitaram as abas cadastradas; o Blox Fruits do banco limpo tinha apenas Visão geral. O pipeline pode concluir parcialmente e manter publicação bloqueada por falta de imagens/evidências — comportamento intencional.

## Pendências e limites

| Gravidade | Pendência | Impacto / próximo passo |
| --- | --- | --- |
| MAJOR | QA visual em Android/iOS e desktop real não concluído | Conferir sobreposição, rolagem, teclado, modais, toque e transições no deploy. A tentativa de navegador remoto não completou acesso ao servidor local. |
| MAJOR | Pesquisa e mídia externas não homologadas em produção | Testar Blox Fruits, CS2 e Minecraft com rede do host; revisar fontes aceitas, imagens, Preview e publicação. Fontes bloqueadas podem manter RESEARCH_INCOMPLETE; o código não fabrica conteúdo para contornar isso. |
| MAJOR | Reprodução real YouTube/HTMLAudio não homologada entre navegadores | Validar autoplay, primeiro toque, bloqueio por provedor e retomada. Site multipágina pode interromper brevemente o áudio. |
| MINOR | Não há master musical original | Integração preparada, arquivo de áudio não gerado nem incluído. |
| MINOR | Aprimoramento em memória durante reinício do processo | Reinício pode deixar execução histórica RUNNING; o usuário pode iniciar nova execução após voltar. Recuperação automática completa é próxima melhoria. |
| MINOR | Modo avançado ainda contém termos técnicos/inglês | Localização e simplificação adicionais recomendadas para 0.993. |
| COSMETIC | Cabo, ícones e logo precisam de comparação visual final | A imagem mencionada anteriormente não estava disponível; nenhuma equivalência visual foi certificada. |

Não foi identificado BLOCKER nos cenários automatizados finais. Isso não certifica a entrega como livre de bloqueadores no ambiente publicado: as três validações MAJOR acima continuam abertas.

## 0.993 recomendada

Homologação visual com matriz de aparelhos; recuperação persistente de jobs após reinício; expansão editorial das abas realmente desejadas; validação de fontes/imagens reais; inclusão do master original; completar localização do modo avançado. Transformar o site em SPA para áudio totalmente contínuo exigiria trabalho arquitetural separado.

Neon foi consultado somente para inspeção do snapshot I2/schema 47. Nenhuma consulta de escrita em produção, push ou deploy foi realizada.
