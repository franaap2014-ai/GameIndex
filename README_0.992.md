# GameIndex Beta 0.992 — update only

Atualização sobre 0.9915 I2, commit b58ed20c22df10b233b86760dc80a1dc6d492110.
Este README prevalece sobre instruções contraditórias das versões anteriores para os recursos aqui alterados. Consulte docs/RELATORIO_0.992.md para escopo, resultados e limitações.

## Aplicar

1. Faça backup do código e do armazenamento persistente atual.
2. Extraia o ZIP na raiz do projeto I2, substituindo os arquivos correspondentes. O pacote contém somente arquivos alterados/adicionados; não substitui o repositório inteiro. Nenhum arquivo precisa ser excluído.
3. Preserve as variáveis de ambiente, uploads e banco existentes. Execute `npm ci` com Node >=22.13.
4. Execute `npm run check`, `npm run test:0992`, `npm run test:i2`, `npm run test:hf3` e `npm run smoke` no ambiente de teste.
5. Publique pelo fluxo habitual e confira login, perfil/configurações, áudio, mobile e Builder. Reinicie uma única instância escritora com a configuração Neon existente.

Schema permanece 47; inicialização registra a versão e a entrada de atualização de forma idempotente. Não execute SQL de substituição de snapshots. Nenhum banco, segredo, node_modules ou dado pessoal está neste pacote.

O site permanece multipágina: a música retoma a posição entre páginas; pode existir uma pequena interrupção durante a navegação. Autoplay com som depende do navegador e pode exigir uma interação.

A faixa original Enter the Index NÃO está incluída. O ponto de integração só é ativado com arquivo real em public/audio/enter-the-index.mp3 e GAMEINDEX_ORIGINAL_HOME_MUSIC=1. Na ausência deles, permanece o perfil musical configurado.

Builder pesquisa as abas existentes do jogo/Experience. Se o cadastro tem apenas Visão geral, não inventa outras abas. Fontes indisponíveis, ausência de fatos ou imagens aprovadas continuam bloqueando publicação. Novas cutscenes de jogos são rascunhos para revisão, não publicadas automaticamente.

Não houve push, deploy ou alteração no banco de produção nesta entrega.
