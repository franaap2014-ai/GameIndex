# Enter the Index — especificação da música original

Estado: integração pronta; composição e master final ainda não fornecidos. Nenhum tom sintético é apresentado como trilha final.

## Direção de composição

- Instrumental, aproximadamente 2 minutos, 96 BPM, compasso 4/4.
- Motivo original de quatro notas: Ré4–Lá4–Mi4–Fá♯4, ritmos semínima, colcheia pontuada, semicolcheia, mínima; variar a resposta na segunda repetição. É uma proposta para o compositor, não gravação concluída.
- Piano felt ou instrumento acústico percutido suave como voz principal; baixo limpo e redondo, bateria eletrônica discreta com dinâmica humana, texturas digitais leves. Harmonia aberta em Ré maior com passagens em Si menor.
- 0:00–0:15: introdução atmosférica com espaço. 0:15–0:40: apresentação do motivo. 0:40–1:10: pulso leve. 1:10–1:35: seção central um pouco mais forte. 1:35–2:00: retorno à textura inicial.
- Sem voz, drops EDM, orquestra de trailer, glitch excessivo ou imitação de trilhas existentes. A melodia precisa continuar reconhecível em volume baixo e não cansar em repetição.

## Entrega e integração

Master de arquivo sem silêncio inicial/final, loop nos mesmos limites de compasso e reverb circular. Exportar WAV estéreo 48 kHz/24 bit para arquivo mestre; OGG estéreo para publicação, com pico verdadeiro até −1 dBTP e referência de −16 LUFS integrados. Medir e ouvir; números são alvos, não resultados medidos.

Adicionar `public/audio/enter-the-index.ogg` (preferido), `.mp3` ou `.wav`, após revisão auditiva e confirmação dos direitos. Ativar `GAMEINDEX_ORIGINAL_HOME_MUSIC=1`. Sem arquivo real ou sem ativação explícita, mantém a configuração existente do lobby. Arquivos vazios não são anunciados. O arquivo não deve ser colocado no banco.

A implementação reutiliza o único player do shell, pausa/destrói a instância anterior, pré-carrega o áudio, mantém mute/volume/posição e aguarda interação se o navegador bloquear autoplay. O slot só se aplica à Home; música de jogos e cinematics permanecem independentes. Loop usa o próprio arquivo preparado e `audio.loop`; MP3 pode ter espaçamento devido ao encoder, portanto OGG é preferido.

## Aceitação pendente do master

Ouvir três loops com fones e caixas, confirmar ausência de clique/interrupção, volume confortável e identidade reconhecível. Validar OGG em Chrome/Firefox e o formato escolhido em Safari real. A transição do último compasso para o primeiro deve funcionar musicalmente sem depender de crossfade artificial. A arte musical não pode ser aprovada apenas por teste automatizado.
