# GameIndex 0.9915 I1 HF3 — UPDATE ONLY

Aplique SOBRE o HF2 entregue anteriormente (`GameIndex_Beta_0.9915_I1_HF2_AUDIT_UPDATE_ONLY.zip`). Este pacote contém somente diferenças em relação ao HF2; não é uma instalação completa. Base local de verificação: `5697990`.

Extraia na raiz do projeto, preservando as pastas, `.env`, banco e uploads. Depois faça o deploy como de costume e recarregue a página com Ctrl+F5. Não há nova migração: o schema permanece 47 e a versão pública 0.9915. A release interna passa a `BETA_0_9915_I1_HF3_BUILDER`.

Verificações antes de publicar:

```sh
npm ci
npm run check
npm test
npm run test:09915hf1
npm run test:audit
npm run test:hf3
npm run smoke
```

No Universe Builder, selecione Blox Fruits e clique em Abrir. Use Aprimorar ou Retomar construção: sem uma base válida, Aprimorar agora retoma a pesquisa/construção. Quando já existe conteúdo válido, abre as rodadas de aprimoramento normalmente. Se as fontes externas continuarem indisponíveis, a construção continua bloqueada e registra os diagnósticos; não inventa páginas para liberar publicação.

O relatório `BUG_FIX_REPORT_0.9915_I1_HF3.md` descreve o que foi testado e o que ainda depende da hospedagem. Esta entrega não executou uma construção no banco de produção e não fez deploy.
