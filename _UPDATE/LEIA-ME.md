# GameIndex 0.992 I3 — UPDATE ONLY

Este ZIP contém 116 arquivos novos/alterados e três arquivos de metadados de entrega. Não é uma instalação completa.

Base obrigatória: `d5027e3b80e1671154853414e0aafeec5bfa6061` (0.992 I2).
Commit resultante local: `ec23e9d8d255663c79b73d297727eea8dce41fd0`. Nenhum push ou deploy foi feito.

## Estado

Código entregue para revisão. A aceitação integral da I3 permanece pendente: cobertura de tradução legada, áudio original, rodada final de interações no navegador e homologação do provedor LLM/produção. Consulte `docs/I3_TECHNICAL_REPORT.md` antes de publicar.

## Aplicar

1. Confirme que o projeto está na base I2 indicada. Se houver alterações locais ou uma revisão diferente, reconcilie o delta antes de sobrescrever arquivos.
2. Faça backup recuperável do banco persistente e dos assets enviados pelos usuários. Preserve as configurações e variáveis de ambiente existentes.
3. Extraia os caminhos deste ZIP na raiz do projeto, substituindo os arquivos correspondentes. A pasta `_UPDATE` é somente documentação e não participa da aplicação. Não há arquivos a excluir.
4. Use Node.js >=22.13. As dependências não foram alteradas; `npm ci` continua usando o lockfile da I2.
5. Em staging, execute `npm run check`, `npm run test:0992i3`, `npm run test:i1` e `npm run test:0992i2`; reinicie a aplicação com `npm start` no fluxo habitual. Execute testes com dados isolados.
6. Confirme as mudanças idempotentes de conteúdo e faça a homologação pendente descrita no relatório antes de promover a atualização.

Schema 47, sem migração SQL nova. O primeiro startup atualiza assets nativos de avatares, registra as notas I3, retira GTA III da listagem pública sem apagar seu histórico e adiciona RDR2 caso ausente. Conteúdo manual existente é preservado nos casos cobertos.

## Música

O master original não está incluído. A especificação e a ativação opcional estão em `docs/I3_ORIGINAL_MUSIC.md`. Sem o arquivo e a configuração de ativação, a música existente permanece em uso.

## Integridade e rollback

`manifest.json` lista os caminhos exatos, estado, tamanho e SHA-256 do arquivo novo e do anterior quando aplicável. `sha256sums.txt` cobre os arquivos do pacote, inclusive manifesto e este documento, exceto a própria lista de hashes. Não contém segredos, `.env`, `node_modules`, banco ou logs de depuração.

Para rollback completo, restaure o código I2 e o backup dos dados anterior à aplicação; reverter somente os arquivos não desfaz alterações já instaladas no catálogo.

## Documentação

- `docs/I3_RELEASE_NOTES.md`: notas públicas.
- `docs/I3_TECHNICAL_REPORT.md`: implementação, testes, resultados, limitações e aplicação.
- `docs/I3_AUDIT.md`: auditoria da base.
- `docs/I3_ASSET_SOURCES.md`: procedência dos assets.
- `docs/I3_ORIGINAL_MUSIC.md`: especificação musical.
