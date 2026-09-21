# GameIndex Beta 0.9915 — UPDATE ONLY

Este pacote contém **somente os arquivos alterados/adicionados** pela Beta 0.9915 Cinematic Update em relação ao `main` de baseline.

- Baseline main: `cfaa9d952b3e09af221582360e35592fde842975`
- Source branch: `beta-0.9915-cinematic-update`
- Source HEAD: `f7d11f1a542cba6826e3247efa7ab872dde235c7`
- Schema alvo: **45**
- Persistência de produção no Render: **Neon via DATABASE_URL**
- Este pacote **não é um repositório standalone**. Aplique os arquivos por cima da instalação atual do GameIndex.
- Não apague arquivos existentes que não aparecem neste ZIP.
- O pacote inclui a migration `045_beta_09915_cinematic_update.sql` e o teste `tests/beta09915-cinematic-update.mjs`.
- Antes do deploy, mantenha `DATABASE_URL` configurada no Render. O runtime de produção bloqueia inicialização no Render sem Neon.

## Aplicação

1. Faça backup da versão atual.
2. Extraia este UPDATE ONLY na raiz do projeto e permita substituir os arquivos existentes.
3. Preserve variáveis de ambiente e segredos; não copie segredos para o repositório.
4. Execute `npm install` ou `npm ci` conforme seu fluxo.
5. Execute `npm test`.
6. Faça o deploy.
7. Confirme que o schema chegou a 45 e que a persistência Neon está ativa.

## Escopo principal

Cinematic Editor e Test Lab, cutscenes curtas de entrada dos jogos, novo perfil, jogos favoritos, biblioteca de avatares por classe, Social renovado, comunidades, Update Log público da 0.9915, relato de problemas simplificado e polimento visual geral.

## Observação de validação

O código-fonte e os contratos estáticos foram revisados no branch da release. Neste ambiente do ChatGPT não foi possível clonar o GitHub para executar o runtime completo por falha de resolução DNS; portanto, o teste final deve ser executado no seu ambiente/CI antes do deploy.
