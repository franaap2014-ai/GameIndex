# GameIndex Beta 0.9915 — I1 HF2

Atualização de auditoria e confiabilidade de 23/09/2026. Versão pública **0.9915**, pacote **0.9915.0**, release interna `BETA_0_9915_I1_HF2_AUDIT`, schema **47**.

Este README e `UPDATE_ONLY_README_0.9915_I1_HF2.md` substituem instruções conflitantes de releases anteriores. Os READMEs históricos continuam como registro das decisões daquela época. A arquitetura vigente usa SQLite em execução e snapshots duráveis no Neon; em hospedagem com disco efêmero, o arquivo local não é a fonte durável.

## Instalação e verificação

Requer Node.js >=22.13. Preserve configurações, banco e uploads existentes ao atualizar.

```bash
npm ci
npm run check
npm test
npm run test:09915hf1
npm run test:audit
npm run smoke
npm start
```

`test:09915hf1` mantém o nome por compatibilidade e verifica a recuperação acumulada com a identidade HF2. Scripts de releases antigas preservam expectativas históricas; não são todos gates da versão atual.

## Persistência

Configure `DATABASE_URL` ou `GAMEINDEX_DATABASE_URL` com a conexão Neon na hospedagem. Não inclua credenciais no repositório. Preserve as demais variáveis de produção. A migração 047 é aditiva, mantém os dados existentes e guarda os bytes de avatares e mídias locais no SQLite para inclusão nos snapshots. Arquivos antigos ainda presentes e referenciados são incorporados na inicialização; arquivos já perdidos não podem ser recuperados desta forma.

Use uma única instância escritora. Snapshots são assíncronos; não equivalem a replicação transacional síncrona. O limite padrão de snapshot é 64 MiB, configurável até 256 MiB. O volume de uploads deve ser acompanhado.

## Entrega

- `BUG_AUDIT_0.9915_I1_HF2.md`: achados, correções, testes e limites.
- `UPDATE_ONLY_README_0.9915_I1_HF2.md`: aplicação do pacote sobre a base correta.
- `UPDATE_ONLY_FILES_0.9915_I1_HF2.txt`: arquivos alterados incluídos.

A arte definitiva dos 50 avatares continua pendente: os SVGs atuais são placeholders, conforme o README de `public/assets/profile-avatars`.
