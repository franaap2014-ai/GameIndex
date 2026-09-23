# UPDATE ONLY — GameIndex 0.9915 I1 HF2

Base exata: `27882cccf2f899d5c2e73538b9991ed4eeb61068` (0.9915 I1 HF1). Este ZIP contém apenas arquivos novos ou alterados; não é uma instalação completa. Extraia na raiz da cópia dessa versão, mantendo a estrutura de pastas. Se houver alterações posteriores próprias, revise os conflitos antes de substituir arquivos.

1. Faça backup do banco, arquivos de upload e configuração atuais.
2. Aplique os arquivos do ZIP sobre a base indicada. Nenhum arquivo precisa ser excluído. Não remova `.env`, dados ou uploads.
3. Execute `npm ci`, `npm run check`, `npm test`, `npm run test:09915hf1`, `npm run test:audit` e `npm run smoke` em ambiente de validação.
4. Mantenha a conexão Neon e demais variáveis existentes ao reiniciar sua hospedagem. A inicialização aplica a migração aditiva 46 → 47 e incorpora uploads locais ainda disponíveis. Não execute SQL manual no Neon: o modelo atual persiste snapshots do SQLite.
5. Confira login, perfil/avatar, favoritos, comunidade, Universe Builder e Cinematic Test Lab no navegador, inclusive em celular. Faça essa validação antes da entrega pública.

A versão pública continua 0.9915. Identidade interna: `BETA_0_9915_I1_HF2_AUDIT`. O relatório está em `BUG_AUDIT_0.9915_I1_HF2.md`. O manifesto SHA256 permite conferir os arquivos do pacote.

Esta entrega não foi publicada e não alterou o banco de produção. Testes usam banco descartável. Para rollback, reverta o código e restaure o backup consistente se necessário; não apague tabelas de uploads para tentar reduzir o schema.
