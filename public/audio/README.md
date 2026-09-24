# Enter the Index

Slot para a música original: `public/audio/enter-the-index.mp3`.
Nenhum áudio original foi criado ou incluído nesta release.

Coloque aqui o master final autorizado, instrumental, com duração sugerida de 2:30–3:00 e transição de loop. Ative `GAMEINDEX_ORIGINAL_HOME_MUSIC=1` no ambiente e reinicie. O backend só anuncia o arquivo se ele realmente existir; caso contrário mantém a faixa configurada no Music Manager. Sem nenhuma faixa configurada, mostra estado indisponível, sem requisição a arquivo inexistente.

O player usa áudio HTML nativo para esse slot, preserva volume/mute/posição e tenta autoplay. Se o arquivo falhar durante reprodução, tenta a faixa YouTube configurada, quando houver. Configure/valide a faixa original antes da apresentação. Não imitar composições existentes.
