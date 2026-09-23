# Correção após deploy — GameIndex 0.9915 I1 HF3

23/09/2026. Incremental sobre o HF2. Schema 47 mantido.

## Confirmações no site publicado

A imagem enviada foi aberta e comparada com a navegação real em https://gameindex.onrender.com/. Em sessão visitante, o menu lateral abriu, a pesquisa por “blox fruits” retornou a experiência correta e o botão Música abriu os controles. A interface informou que não havia música configurada. Portanto, não foi reproduzida uma falha universal desses três controles; o estado autenticado Creator do usuário não foi testado.

Foi confirmada a versão antiga `BETA 0.991 I1` no header. O script de diagnóstico substituía a logo criada pelo shell, inseria um indicador de contexto fora das três colunas e reconstruía os atalhos conforme a página. Isso explica a diferença entre o header esperado e o renderizado. O HF3 preserva o shell como único responsável por logo e navegação.

## Correções

| Problema | Tratamento |
| --- | --- |
| Logo substituída por desenho antigo e versão incorreta | Removida a substituição feita pelo runtime antigo; monograma GI único e legível, sem máscaras/pseudoelementos sobrepostos; versão pública 0.9915 preservada. |
| “Home” solto abaixo da barra e atalhos variando | Runtime deixa de inserir uma quarta região e de reconstruir a navegação. |
| Eventos duplicados na logo | Handler de navegação instalado uma única vez, mantendo confirmação de edição não salva. |
| Menu/busca aguardavam download de traduções | Eventos básicos são ligados antes da espera pelas traduções. |
| Itens com hidden apareciam por conflito de CSS | Regra explícita para respeitar hidden na interface global. |
| Aprimorar desativado com pesquisa incompleta | Retoma a construção existente ou inicia uma construção; abre o diálogo de aprimoramento quando há base válida. |
| Erro de aprimoramento invisível atrás do diálogo | Mensagem também aparece dentro do diálogo. |
| Busca de fontes dependia da ordem de atributos HTML | Parser aceita href antes/depois de class, aspas simples/duplas e classes adicionais. |
| URL de resultado era decodificada duas vezes | Preserva escapes legítimos do destino. |
| Blox Fruits dependia somente do buscador | Incluídas entradas diretas para wikis do jogo; as páginas são buscadas e continuam sujeitas aos mesmos filtros de evidência. Nenhum fato foi pré-preenchido. |
| Erros externos viravam apenas zero fontes | Diagnósticos de descoberta e fetch acompanham a pesquisa e ficam registrados nos eventos técnicos da construção. |
| Domínio parecido com fandom.com podia ser aceito | Validação exige domínio ou subdomínio real. |
| Termo interno “research pass N” contaminava consultas | Removido do texto enviado às fontes. |
| Preview vazia era salva como READY | Geradores I4/I5 recusam estrutura sem páginas; leitura de snapshots vazios antigos também deixa de retornar READY. |
| Falta de conteúdo exibida como falha independente de imagens | Etapa fica NOT_STARTED enquanto não há páginas. |
| Mensagens anunciavam conteúdo pronto ou construção concluída após falha | Mensagens passam a refletir pesquisa incompleta, interrupção e cancelamento. |
| Publicar podia ser reativado por conteúdo válido sem prontidão | Exige também status de publicação READY/PUBLISHED. |
| Notas de revisão se acumulavam a cada atualização | Substituição da nota anterior. |
| Erro antigo persistia durante uma nova tentativa | Limpa estado de erro ao iniciar/retomar pesquisa. |

## Validação executada

- `npm run check`: 354 arquivos JavaScript/MJS sem erro sintático.
- `npm test`, `npm run test:09915hf1`, `npm run test:audit` e `npm run smoke`: aprovados.
- `npm run test:hf3`: sete regressões aprovadas: parser de busca; fonte direta com buscador vazio; Preview vazia I4/I5; construção real do pipeline de Blox Fruits com documentos simulados; indisponibilidade externa; comportamento do botão Aprimorar; preservação do shell pelo runtime.
- A integração usa SQLite descartável e respostas HTTP sintéticas explicitamente destinadas a teste. Gerou fatos/páginas estruturadas sem status FAILED. Não prova acesso às wikis a partir do Render nem qualidade final de uma página pública.
- Pacote aplicado sobre a cópia exata do HF2 e comparado byte a byte com os arquivos corrigidos.

## Limites e próximos passos na hospedagem

Não foi executada pesquisa autenticada no banco de produção, e não houve deploy. O ambiente local retornou falha DNS ao tentar acessar o buscador; por isso a conectividade real das fontes no Render permanece sem confirmação. As entradas de wiki foram verificadas por busca pública, não por uma construção completa na hospedagem. Não há garantia de que as fontes aceitem todas as requisições ou forneçam cobertura suficiente de todos os tópicos.

Após aplicar, retome Blox Fruits e confira conteúdo, imagens e pendências. A publicação continua exigindo imagens e conteúdo adequados. Se as fontes falharem, os eventos da construção agora registram a diferença entre busca vazia, desafio do buscador, erro de rede e página inacessível. Não foi implementada evasão de bloqueios de fontes.

A aparência final das alterações precisa ser conferida no navegador após deploy. Os testes interativos descritos acima foram feitos na versão publicada anterior ao HF3; não são uma aprovação visual do novo pacote. As limitações de arquitetura e arte de avatares do relatório HF2 continuam válidas.

Entradas verificadas em 23/09/2026: https://blox-fruits.fandom.com/wiki/Blox_Fruits_Wiki ; https://blox-fruits.fandom.com/wiki/Fruit_Spawn_Locations ; https://bloxfruitswiki.org/wiki/blox-fruits-wiki/ ; https://bloxfruitswiki.org/wiki/fruit-spawn-locations/ . São fontes comunitárias; não são documentação dos desenvolvedores do jogo.
