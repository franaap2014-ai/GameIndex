# GameIndex 0.992 I3 — relatório técnico

## Identificação da entrega

- Base exata: `d5027e3b80e1671154853414e0aafeec5bfa6061` (0.992 I2). Os 141 arquivos do ZIP I2 fornecido foram comparados byte a byte com essa revisão.
- Repositório: `franaap2014-ai/GameIndex`. Trabalho em branch local `work/0992-i3`.
- O commit resultante, a lista exata de arquivos, seus estados e hashes SHA-256 constam de `_UPDATE/manifest.json`, gerado depois do commit.
- Pacote incremental; não contém a aplicação completa. Nenhum push, deploy ou alteração no banco de produção foi efetuado.
- Estado: implementação entregue para revisão; aceitação integral da I3 ainda não comprovada. As pendências abaixo não são testes aprovados.

## Implementação e preservação

O contrato de CSS do cabeçalho limita os seletores ao shell; a marca mantém a mesma geometria e recebe cores por classificação. A biblioteca de avatares troca somente assets nativos conhecidos e preserva IDs, seleções e substituições manuais. O layout limita avatar e busca em telas pequenas.

O Image Manager distingue CARD/COVER, LOGO e BANNER. A capa do catálogo usa COVER; o logo da experiência principal usa LOGO. A apresentação preserva `fitMode`, dimensões e atualização. O editor grava o recorte nos pixels enviados e a interface relê o estado autoritativo após salvar ou remover. A página do jogo diferencia um logo real da capa usada como fallback.

A barra contextual foi restaurada e encaminha ações aos controles já existentes, respeitando as capabilities recebidas. O Cinematic Lab reúne os seletores, a prévia e os controles, mantendo opções avançadas separadas.

O runtime de idiomas usa os três catálogos existentes e um catálogo de frases, observa alterações do DOM e atualiza atributos acessíveis. Preserva texto do usuário marcado como tal. A preferência pode ser salva sem reload; a transição usa Brasil/Portugal, Reino Unido/EUA e Espanha, com suporte a movimento reduzido. Há lacunas de cobertura de strings legadas: não se afirma tradução integral.

Dexter resolve aliases e perguntas compostas sobre metadados, usa contexto de conversa por proprietário e oferece ações reais de navegação. O servidor fornece as capabilities e a preferência de pesquisa, sem confiar em permissões enviadas pelo cliente. A saída estruturada do provedor deve referenciar evidências; JSON acima do limite é rejeitado sem truncamento inválido. Cancelamento é verificado ao entrar e sair da fila, mas não foi validada remoção imediata enquanto a chamada aguarda a fila.

O limite público das APIs sanitiza erros internos, protege resumos técnicos de versões e remove campos sensíveis conhecidos de payloads de diagnóstico. `/health` usa o health check existente. A personalização pública deixa de enviar o inspector. Essas medidas foram verificadas em casos específicos, não constituem auditoria exaustiva de todas as rotas legadas.

A música original usa o player existente e só é ativada por configuração com arquivo real presente. O áudio original não está no ZIP; a direção criativa e os critérios de audição estão em `I3_ORIGINAL_MUSIC.md`. A configuração musical anterior continua em uso enquanto o master não é fornecido e ativado.

## Banco e migrações

- Schema continua em **47**. Nenhuma migração SQL nova.
- O instalador de conteúdo é transacional e idempotente, com marcador `content_0992_i3`.
- Atualiza os assets nativos dos 25 avatares e URLs correspondentes nas seleções existentes, preservando overrides manuais.
- Altera somente a entrada `grand-theft-auto-iii` de PUBLIC para UNLISTED, preservando seu ID, relações, histórico e mídia. Não reutiliza registros de GTA III para RDR2.
- Insere RDR2, aliases, fonte e conhecimento inicial se ainda não existir; preserva a entrada já existente.
- Registra as notas e o marcador da I3 sem sobrescrever notas personalizadas.
- Transações aninhadas passam a usar savepoints, com rollback da unidade completa quando necessário.
- Codec, chunks, reaproveitamento de blocos, backoff e mídia durável da I2 foram preservados. Não acompanha banco local, snapshot ou credenciais.

## Testes e resultados reais

| Verificação | Resultado | Limite da evidência |
|---|---|---|
| Sintaxe final via `node --check` | 377 arquivos JS/MJS aprovados | Verifica sintaxe, não comportamento. O wrapper `npm run check` encontrou EPERM ao criar subprocesso; a mesma verificação foi executada diretamente pelo shell, sem elevação. |
| `node tests/quality-0992-i3.mjs` | 10 casos aprovados, repetidos após os ajustes finais | Instalação idempotente, rollback aninhado, catálogo, avatares, framing, Dexter, permissões, erros e tradução em jsdom. |
| `npm run test:i1` | 9 casos aprovados | Inclui login HTTP/DOM, sessões, contexto Dexter, conteúdo manual, SSRF e catálogo público; não equivale à revisão visual completa. |
| `node tests/release-0992-i2.mjs` | 5 casos aprovados | Instalação, notas, rollback, idempotência e preservação. A expectativa da versão interna foi ampliada para aceitar a I3. |
| `node tests/bandwidth-0992-i1-hf1.mjs` | 9 casos aprovados | Compressão, restauração, hashes, reuso, falhas e backoff dos snapshots. |
| `node tests/bandwidth-http-0992-i1-hf1.mjs` | 9 verificações aprovadas | gzip, Brotli, identidade, ETag/304, ranges, SSE, no-transform, rota protegida e compressão JSON. |
| Auditoria Chromium de layouts | 85 combinações sem overflow horizontal e com barra contextual visível | Houve um erro de personalização, corrigido depois e coberto pelo teste do resolver. A matriz inteira não foi repetida após a correção. |
| Última bateria de interações no navegador | **Não executada** | A revisão automática de aprovação não pôde concluir por limite de uso. Não se contornou o bloqueio. |
| `git diff --check` | Aprovado | Sem erros de whitespace no delta. |

Na auditoria visual, cinco páginas públicas foram verificadas em 12 larguras de 360 a 1920 px; cinco páginas autenticadas em cinco larguras de 360 a 1366 px. Não foi uma matriz completa de todas as páginas, temas e cargos. Os ajustes finais de cache, contraste da marca clara e traduções adicionais passaram por sintaxe e testes de unidade, mas não por nova inspeção visual.

O teste HTTP de compressão mediu um recurso de 98.112 bytes em 25.351 bytes com gzip e 25.807 bytes com Brotli. São valores de fixture local, não métricas de tráfego de produção.

## Pendências conhecidas e homologação

1. Completar o inventário e tradução de descrições legadas, telas staff e strings dinâmicas ainda fora do catálogo. A troca de idioma funciona nos casos testados, mas a cobertura não é 100%.
2. Produzir e aprovar auditivamente o master de “Enter the Index”, integrar o arquivo e validar os loops e autoplay nos navegadores alvo.
3. Reexecutar a bateria final de interações reais: persistência de idioma e avatar após reload; salvar recorte e conferir catálogo/jogo; play, pause e replay; ações da barra por cargo; respostas de Dexter pela UI.
4. Homologar a saída do provedor LLM/Ollama configurado e pesquisas externas reais; os testes de Dexter validaram principalmente o caminho local determinístico.
5. Repetir a matriz visual com os arquivos finais, incluindo todos os temas, cargos e páginas que não participaram da amostra.
6. Validar a atualização e restauração em staging com cópia controlada dos dados reais antes de publicar. Não houve validação pós-deploy.

## Aplicação e rollback

Siga `_UPDATE/LEIA-ME.md`. Confirme a revisão I2, mantenha backup recuperável dos dados e aplique os caminhos do ZIP na raiz do projeto. As dependências não mudaram; o lockfile existente permanece válido. O primeiro startup registra as alterações de conteúdo. O pacote não configura nem publica serviços.

Para rollback de código, restaure a revisão-base. Para rollback completo dos efeitos no catálogo e perfis, restaure também o backup anterior da base persistente; reverter apenas o código não desfaz o conteúdo instalado. Não apague o marcador manualmente para forçar reinstalação.
