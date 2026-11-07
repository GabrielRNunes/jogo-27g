# Revisão do Protocolo Kairo — 6 de novembro de 2026

## Referência narrativa adotada

- Final mundial em 15/11/2026, às 18h.
- Último contato visual com Kairo: 14/11, às 22h.
- Última entrada registrada na ala: 14/11, às 23h41. Ausência de registro de saída não prova que ele permaneceu no local.
- Ausência no treino: 15/11, às 6h. Verificação solicitada às 9h; entrada de manutenção às 9h02.
- A credencial permite entrar para manutenção, mas não substitui a permissão interna do morador. Essa diferença explica o início da contenção.
- Os cinco ambientes continuam conectados. O painel do corredor permite recuperar a saída com um PIN de seis dígitos.
- A Central acompanha remotamente; a equipe de intervenção assume o local quando a contagem termina.

## Alterações de conteúdo

- Briefing reescrito com contexto, missão, limite de tempo, consequências e controles.
- Introdução com 11 falas mais objetivas e sérias. Contador de falas removido a pedido do autor.
- Prólogo, cronologia, personagens e significado do título reorganizados em A História.
- Descrições de finais alinhadas às condições do JavaScript. O alerta inicial foi distinguido do alarme geral ao final da contagem.
- Quadrinho de Fuga com Sequelas ajustado: o final também pode ocorrer por pouco tempo, sem PIN incorreto.
- Cenários: conexão dos servidores corrigida; cozinha contabiliza geladeira e lixeira; ambas as páginas usam a arte da cozinha sem bilhete visível.
- Itens: pistas diferenciadas de requisitos; cartão associado ao rack, não à entrada da sala; descoberta especial condicionada a escapar.
- Rodapés esclarecem que personagens e enredo são fictícios, preservando a identificação real das ferramentas e do desenvolvedor.
- Formulário reforça nas respostas que se trata de uma simulação e que nenhum e-mail é enviado.
- FAQ: retiradas as perguntas sobre tela cheia, pausa e som; mantida a pergunta sobre teclado. As instruções relevantes permanecem nas seções de regras, controles e áudio.

## Arte e som

- Porta recriada em SVG: acesso reforçado à ala privativa, identificação KAIRO e terminal de contenção. Sem a antiga placa rosa de hotel.
- Trilha instrumental original de 64 segundos, criada por síntese, sem amostras externas. Acordes lentos, sem vozes, sirenes ou ataques repentinos.
- Mesmo arquivo de áudio na página A História e nos controles opcionais dentro do jogo. Sem reprodução automática; o som não pausa a partida.
- WAV PCM mono de 16 bits e 22.050 Hz, com início e fim em zero e sem saturação nas amostras.

## Regras verificadas

- 300 segundos, com início apenas ao terminar ou pular a introdução.
- Código inválido ou fio errado: menos 10 segundos. Seta errada reinicia a sequência sem penalidade.
- Duas falhas no terminal bloqueiam a gaveta por 45 segundos de contagem.
- Fuga Perfeita: ao menos 120 segundos restantes e no máximo uma falha, sem a descoberta especial.
- Fuga com Sequelas: escapar com menos de 120 segundos ou mais de uma falha, sem a descoberta especial.
- Final Secreto: recolher o bilhete e reprogramar a saída antes do fim da contagem.
- Capturado: contagem esgotada, inclusive quando o jogador já recolheu o bilhete.

## Validação e limites

- Sintaxe dos dois arquivos JavaScript validada com o parser do Node.js.
- 12 grupos de testes com DOM e temporizadores simulados: introdução, reinício da contagem, percurso completo, quatro finais, condições de limite, penalidades, bloqueio da gaveta, minigames, calculadora e formulário.
- A calculadora foi verificada para os 16 grupos possíveis de quatro bits.
- Links e âncoras locais das 12 páginas conferidos; IDs sem duplicação e uma meta description única por página.
- SVG da porta validado como XML; estrutura e duração do WAV verificadas.
- A inspeção visual no Firefox foi interrompida pela ferramenta, que não oferece suporte à política de URLs nesse navegador. Não foi possível confirmar visualmente o layout nem avaliar a trilha por audição nesta sessão.

## Conferência manual recomendada após abrir a nova versão

1. Recarregar a página para obter os arquivos atualizados.
2. Ler o briefing e avançar pela introdução: o contador de falas deve estar ausente e o relógio deve começar somente ao terminar.
3. Abrir Som ambiente (opcional), iniciar a trilha e ajustar o volume conforme a preferência.
4. Conferir a nova porta e a cronologia em A História.
5. Examinar a lixeira, recolher o bilhete e reprogramar a saída para verificar o final secreto.
