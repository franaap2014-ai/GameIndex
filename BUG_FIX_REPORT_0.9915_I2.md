# Relatório — GameIndex 0.9915 I2

23/09/2026. Base: I1 HF3; versão pública 0.9915; schema 47. Escopo: interface mobile, música entre páginas, boas-vindas e recuperação do Builder. Não representa garantia de ausência de todos os bugs.

## Diagnóstico e correções

| Problema | Causa/constatação | Correção |
| --- | --- | --- |
| Música desaparecia no perfil/configurações | O contexto musical das páginas gerais retornava vazio | Fallback para a música da home, mantendo contexto próprio dos jogos |
| Música reiniciava na navegação | A posição do player não era persistida | Checkpoint na mesma aba, ao sair da página e a cada 5 segundos; retomada para a mesma faixa, válida por até 8 horas |
| Pausa manual desfeita ao voltar para a aba | A intenção de reprodução continuava habilitada | Pausar desabilita a retomada automática até novo Play |
| Bloqueio de autoplay sem instrução clara | Evento do player não era tratado | Estado explícito com instrução para tocar em Play |
| Boas-vindas não repetiam ao relogar/outro dispositivo | Evento único vinculado à conta | Evento vinculado à sessão autenticada; não repete ao navegar na mesma sessão |
| Username ausente abaixo do Bem-vindo | Payload e apresentação não incluíam o nome público | Username do perfil, escapado contra HTML, agrupado abaixo do título |
| Construir devolvia a tentativa incompleta sem trabalhar | `startFoundationBuild` retornava imediatamente o registro existente | Pesquisa incompleta/interrompida é reenfileirada, mantendo o ID e evitando job duplicado |
| Interface mobile compactada | Controles e áreas densas de desktop disputavam a tela | Navegação inferior, pesquisa expansível, alvos de toque maiores, formulários em coluna, tabelas com rolagem local, ajustes de diálogo, editor e Test Lab |
| Builder exigia rolar por muitos painéis | Qualidade, histórico e cutscene permaneciam todos expandidos | Seções recolhíveis no mobile; desktop preserva acesso expandido e botões existentes |
| Inspector e aba mobile divergiam | Seleção da árvore alterava apenas o painel | Aba visual e `aria-pressed` sincronizados; Preview inicia em Mobile em telas pequenas |

## Evidências do ambiente real

GitHub: main confirmado em `8c622feb3edc36410d3074232425f8b52026d7b5` (I1 HF3).

Neon: consulta somente leitura confirmou snapshot completo HF3, schema 47. Na cópia consultada, Blox Fruits tinha uma tentativa PARTIAL/RESEARCH_INCOMPLETE com zero fontes aceitas, fatos e páginas. Os eventos conservavam o formato anterior ao HF3; isso não comprova falha de uma nova pesquisa executada após o HF3. A investigação identificou o retorno sem reenfileiramento no código atual. Nenhum dado de produção foi alterado.

Os bloqueios de conteúdo/imagem/publicação são mantidos quando a pesquisa não produz evidência válida. Corrigir o acionamento do Builder não garante disponibilidade de wikis, buscadores, imagens ou outros provedores externos.

## Validação executada

- `npm run check`: verificação sintática dos arquivos JS/MJS.
- `npm test` e `npm run test:09915hf1`: contratos da release atual e recuperação.
- `npm run test:audit`: 11 casos de regressão mais 3 de persistência.
- `npm run test:hf3`: 7 casos, incluindo pipeline com evidências sintéticas, Preview vazio bloqueado e Aprimorar retomando construção inválida.
- `npm run test:i2`: 7 casos para username, duas sessões distintas, isolamento dos eventos, contexto musical, posição, pausa/autoplay e reenfileiramento real com banco descartável.
- `npm run smoke`: rotas HTTP e proteções de acesso com banco descartável.
- Ensaio DOM separado com jsdom: navegação única, botão Menu, pesquisa/Escape, foco de formulário, delegação de ações preservada, painel oculto, retorno ao desktop, tabela dinâmica e username escapado abaixo do título.
- Verificação de diferenças e integridade do pacote UPDATE ONLY contra a base HF3.

As pesquisas dos testes usam respostas sintéticas, não fatos publicáveis sobre Blox Fruits. O ensaio DOM não mede layout renderizado, sobreposição ou comportamento real do YouTube. Não foi feita publicação/deploy desta atualização.

## Limitações e acompanhamento

A música atravessa recargas com retomada de posição, não com áudio contínuo sem interrupção; políticas do navegador podem exigir Play. O checkpoint é por aba/dispositivo. As apresentações de identidade PRO/TESTER/DEV/CREATOR mantêm seu comportamento anterior; somente WELCOME passa a usar sessão.

Após aplicar o pacote, validar visualmente em aparelhos reais e refazer a pesquisa do Blox Fruits no servidor. O relatório não afirma que conteúdo/imagens de produção já foram gerados ou aprovados. O pacote conserva as correções do HF3 para Aprimorar, fontes e Preview, porque é um complemento a essa base.
