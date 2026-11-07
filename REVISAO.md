# Revisão do Protocolo Kairo — 6 de novembro de 2026

## Referência narrativa adotada

- Final mundial em 15/11/2026, às 18h.
- Último contato visual com Kairo: 14/11, às 22h.
- Última entrada registrada na ala: 14/11, às 23h41. Ausência de registro de saída não prova que ele permaneceu no local.
- Ausência no treino: 15/11, às 6h. Verificação solicitada às 9h; entrada de manutenção às 9h02.
- A credencial permite entrar para manutenção, mas não substitui a permissão interna do morador. Essa diferença explica o início da contenção.
- Os cinco ambientes continuam conectados. A imagem mostra a entrada principal pelo quarto; a saída de serviço é outra porta, acessível pela sala de servidores. O painel dessa saída exige um PIN de seis dígitos.
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

- Porta substituída por uma ilustração PNG no estilo de quadrinhos dos cenários: madeira castanha, contornos escuros, paredes creme e azuis, placa KAIRO e leitor vermelho. Gerada pela ferramenta nativa de imagens a partir de referências visuais do próprio jogo. Prompt registrado em assets/historia/porta-kairo.prompt.txt.
- Trilha instrumental original de 64 segundos, criada por síntese, sem amostras externas. Acordes lentos, sem vozes, sirenes ou ataques repentinos.
- Mesmo arquivo de áudio na página A História e nos controles opcionais dentro do jogo. Sem reprodução automática; o som não pausa a partida.
- WAV PCM mono de 16 bits e 22.050 Hz, com início e fim em zero e sem saturação nas amostras.

## Regras verificadas

- 300 segundos de contagem ativa, com início apenas ao terminar ou pular a introdução. A calculadora binária é uma exceção pedagógica: enquanto aberta, pausa a contagem; recolher o apoio ou fechar o painel retoma o tempo.
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
- Nova arte da porta inspecionada visualmente e dimensões PNG conferidas (1672 × 941). Estrutura e duração do WAV verificadas.
- A inspeção visual no Firefox foi interrompida pela ferramenta, que não oferece suporte à política de URLs nesse navegador. Não foi possível confirmar visualmente o layout nem avaliar a trilha por audição nesta sessão.

## Conferência manual recomendada após abrir a nova versão

1. Recarregar a página para obter os arquivos atualizados.
2. Ler o briefing e avançar pela introdução: o contador de falas deve estar ausente e o relógio deve começar somente ao terminar.
3. Abrir Som ambiente (opcional), iniciar a trilha e ajustar o volume conforme a preferência.
4. Conferir a nova porta e a cronologia em A História.
5. Examinar a lixeira, recolher o bilhete e reprogramar a saída para verificar o final secreto.

## Segunda conferência — imagem e coerência

- Releitura dos textos principais das 12 páginas, confrontados com os dados e as interações do JavaScript e os textos nas ilustrações.
- PIN: pares concatenados na ordem terminal, rack e cofre. Sinais de soma retirados do quadrinho; orientação explícita adicionada ao painel da fechadura.
- Bilhete: comprova que a saída foi voluntária, mas não informa a motivação nem a localização de Kairo. Descrições que prometiam esclarecer esse motivo foram ajustadas.
- Condição de Fuga com Sequelas apresentada com os limites exatos de tempo e erros.
- Novo percurso completo e final secreto aprovados em ambiente simulado; a soma 154 foi rejeitada e o PIN concatenado 264781 foi aceito.
- Cinco ambientes, onze objetos interativos e todas as conexões de ida e volta conferidos contra os dados do jogo.
- Links e âncoras locais das 12 páginas validados novamente.
- Não foram identificadas outras divergências nesta segunda leitura cruzada. Isso não substitui uma validação de toda a interface no navegador.

## Leitura e pausa pedagógica

- Entrada principal e saída de serviço diferenciadas na legenda da imagem, no prólogo, nos cenários e nas falas. Não são representações da mesma porta.
- Pausa da calculadora implementada com cancelamento do intervalo e retomada de uma única contagem, sem cobrar o período de consulta. A pausa não se estende ao PC com o apoio recolhido, ao diário ou aos demais painéis.
- Indicador textual de estado junto ao relógio: aguardando início, em andamento, pausado para o cálculo ou partida encerrada. O aviso não é reescrito a cada segundo, evitando anúncios repetitivos para leitores de tela.
- Painéis de interação ampliados para até 48rem, com margens internas maiores, altura limitada e rolagem. Campos e botões com texto maior e foco visível.
- Textos corridos, botões e diário usam fonte de sistema. A fonte decorativa permanece nos títulos e na identidade visual. Diário sem fonte manuscrita e sem linhas rígidas atrás dos parágrafos.
- Adaptação para telas pequenas: painéis próximos à largura disponível, diário com margem reduzida e retrato separado do texto introdutório.
- Nove grupos de testes simulados aprovados para pausa prolongada, retomada, fechamento com botão ou Esc, ausência de cronômetros duplicados, encerramento durante a pausa, 16 conversões, percurso completo, final secreto e captura após retomar.
- A inspeção visual de arquivos locais foi bloqueada pela política de URLs do navegador integrado. As alterações de layout não foram confirmadas visualmente no navegador nesta etapa.

## Diário como registro de investigação

- Visual de caderno substituído por painel escuro com identidade do Protocolo Kairo, cabeçalho, resumo e rodapé separado.
- Registros em cartões, da descoberta mais recente para a mais antiga. Cada registro informa a categoria (Anotação ou Falha), o ambiente e o tempo restante no momento da ocorrência.
- Contagem de registros e falhas, com mensagem inicial para partidas ainda sem anotações. Nenhuma pista é antecipada pelo diário.
- Fonte de sistema para leitura, texto principal de 1,0625rem e entrelinha 1,8. Metadados destacados e erros identificados por texto, além da cor.
- Área de leitura com foco e rolagem por teclado. Cabeçalho e rodapé permanecem separados da lista; em janelas baixas, o diálogo inteiro pode rolar para preservar todos os conteúdos.
- Contraste dos sete pares principais de texto e fundo calculado e superior a 4,5:1. Esse teste não constitui uma auditoria completa de acessibilidade.
- Testes simulados: diário vazio, ordem dos registros, ambiente, tempo restante, categorias, resumo de falhas, abertura, fechamento, contagem ativa durante a consulta e percurso completo aprovados.
- Alterações locais; sem commit, push ou publicação nesta etapa.

## Robustez antes da publicação

- Cronômetro passou a considerar o tempo decorrido e a preservar frações de segundo durante a pausa pedagógica.
- Bloqueadas ações após o prazo; fechamento de painéis e efeitos corrigido no encerramento.
- Adicionados setas por clique/toque, lista acessível de objetos e painéis alternativos para ausência de dialog nativo.
- Tela cheia tornou-se estritamente opcional e protegida contra falhas de API.
- Carregamento incompleto e JavaScript desativado agora têm mensagens e controles seguros.
- Formulário demonstrativo protegido contra duplicação e respostas atrasadas após limpar.
- Aplicadas alternativas de CSS e correções para janelas estreitas ou baixas.
- Suíte reproduzível em tests/regressao.cjs: 31 testes automatizados aprovados, com DOM e APIs simulados.
- XML dos 17 SVGs conferido.
- Cobertura, limites e matriz de testes visuais pendentes documentados em COMPATIBILIDADE.md. Não foi declarada homologação de navegadores ou sistemas operacionais reais.
- Nenhum commit, push ou deploy executado nesta etapa.

## Português, inglês e apresentação de portfólio

- Escopo aprovado: dois idiomas com seletor, README, créditos claros e apresentação das tecnologias e do aprendizado.
- Criadas 12 páginas equivalentes em inglês em en/, com metadados e rótulos traduzidos. As 12 páginas em português receberam seletores e links de idioma alternativo.
- Introdução, enigmas, mensagens, inventário, diário, calculadora e quatro finais traduzidos, mantendo um único código para as regras.
- Criadas 11 variantes SVG com textos em inglês. Arte da porta e trilha instrumental compartilhadas; nenhuma resposta dos enigmas foi alterada.
- Seletor informa que a troca de idioma reinicia a partida. Não foi adicionado salvamento de progresso.
- Apresentação do desenvolvedor registra o segundo ano de um curso de quatro anos, as tecnologias usadas e os estudos de Python, C e PHP sem atribuir seu uso ao site.
- README.md, README.pt-BR.md e CREDITOS.md documentam execução, estrutura, autoria, apoio de IA, aprendizado e limites de validação.
- 42 verificações automatizadas aprovadas com DOM e APIs simulados; sintaxe dos quatro scripts de produção e da suíte válida; 28 SVGs com XML válido; referências locais, âncoras e metadados das 24 páginas conferidos.
- A validação visual em navegadores e sistemas reais continua pendente, conforme COMPATIBILIDADE.md.
- Todas as alterações desta etapa permanecem locais, sem commit, push ou deploy.
