# GameIndex 0.992 I3 — auditoria de implementação

Base: `d5027e3b80e1671154853414e0aafeec5bfa6061` (I2). Os 141 arquivos do ZIP fornecido são idênticos à base. Render: deploy da mesma revisão, live. Neon: snapshot completo da I2, schema 47, confirmado por consulta somente leitura.

| Classificação | Sistema | Evidência e decisão |
|---|---|---|
| KEEP | Persistência | SQLite em execução, snapshot compactado no Neon; preservar codec, chunks, backoff e mídia durável. |
| KEEP | Permissões | Capabilities no servidor; DEV tem subconjunto próprio, tema não concede acesso. |
| FIX | Cabeçalho | CSS de quatro releases disputa grid, avatar e tamanhos. Consolidar contrato com seletores limitados ao shell. |
| FIX | Mídia | Image Manager mapeia LOGO para COVER; `public-visual` perde fitMode; capa vira logo de 3:1. Separar capa e logo nos slots existentes e transmitir apresentação. |
| FIX | Jogo | `experience-engine` aplica classe de logo mesmo à capa de fallback; preservar proporção e ampliar geometria real do hero. |
| FIX | Navegação | `upgradeCompass()` remove o próprio componente. Recuperar contexto, ações existentes e capabilities. |
| FIX | Dexter | Ignora aliases, catálogo e navegação; pesquisa mesmo para perguntas locais; provedor opcional não pode ser pré-requisito para contexto local. |
| FIX | Tradução | Somente `data-i18n` é atualizado; textos dinâmicos, atributos e página de idiomas ficam fora. Centralizar runtime e inventariar strings. |
| FIX | Avatares | Cinco variações do mesmo emblema por cargo. Manter IDs/seleções e trocar apenas assets nativos com desenhos distintos. |
| FIX | Cinematic Lab | Seletores e preview ficam em colunas separadas e mudam de ordem no mobile. Juntar seleção, preview e reprodução, manter avançado separado. |
| REMOVE/ISOLATE | Status legados | `/health` e `/api/beta*/status` expõem schema, runtime e versões históricas. Resumo público e capacidade técnica no servidor. |
| LEGACY BUT SAFE | Rotas/estilos antigos | Preservar sistemas ativos de Universe Builder, música, Social, temas e animação; não atualizar apenas pelo número da versão. |

Nenhum dado de produção foi editado. Mudanças de conteúdo de instalação devem ser transacionais e idempotentes, usando schema 47, preservando registros históricos e conteúdo manual.
