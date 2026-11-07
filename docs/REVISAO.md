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
- Apresentação do desenvolvedor concentra-se no projeto, nas tecnologias utilizadas e no processo de desenvolvimento.
- README.md, README.pt-BR.md e CREDITOS.md documentam execução, estrutura, autoria, apoio de IA, aprendizado e limites de validação.
- 42 verificações automatizadas aprovadas com DOM e APIs simulados; sintaxe dos quatro scripts de produção e da suíte válida; 28 SVGs com XML válido; referências locais, âncoras e metadados das 24 páginas conferidos.
- A validação visual em navegadores e sistemas reais continua pendente, conforme COMPATIBILIDADE.md.
- Todas as alterações desta etapa permanecem locais, sem commit, push ou deploy.

## Ajuste de apresentação

- Retiradas das duas versões do site e dos READMEs as informações de contexto pessoal que não se destinavam à publicação.
- Mantidas a apresentação técnica, a autoria e a transparência sobre o apoio de IA.

## Posição do seletor de idioma

- Seletor PT / EN integrado ao canto superior direito do cabeçalho, sem uma linha adicional abaixo do menu no desktop.
- Em telas pequenas, o seletor divide a linha com o subtítulo, preservando o espaço do título.
- Links com nomes completos para leitores de tela, foco visível, indicação do idioma atual e áreas de toque de pelo menos 44 × 44 pixels.
- Aviso de reinício transferido para o briefing. Seletores conferidos nas 24 páginas quanto a rótulos, ordem no documento e referências locais; validação visual em navegador continua pendente.

## Revisão após ajustes de interface — 7 de novembro de 2026

- Eliminada a reserva inferior excessiva do rodapé; atalho Jogar inserido no próprio rodapé em 20 páginas, sem posição fixa sobre o conteúdo.
- Cabeçalho com título flexível, quebra de linha e seletor reorganizável; disposição compacta até 700px.
- Atualizadas as versões dos recursos para publicação.
- Repetidos os 42 testes simulados após os ajustes; estrutura das 24 páginas, referências locais, sintaxe dos scripts e XML dos 28 SVGs conferidos.
- Conferência visual real permanece pendente; não há declaração de ausência absoluta de bugs nem homologação universal de browsers ou sistemas operacionais.
- Sem commit, push ou publicação executados nesta etapa.

## Inventário e tipografia — 7 de novembro de 2026

- Inventário, relógio, erros, diário e áudio reunidos em um painel, separado da lista opcional de objetos.
- Em larguras a partir de 1000px, painel ao lado da cena; em telas menores, painel antes da cena e itens distribuídos em botões que quebram linha.
- Em desktop com pelo menos 700px de altura, painel acompanha a rolagem dentro da área do jogo, com altura limitada e rolagem própria quando necessária. Em janelas baixas, usa o fluxo normal.
- Cabeçalho do jogo deixa de ficar preso ao topo, liberando espaço para a investigação. Não há duplicação de inventário nem de relógio.
- Relógio com algarismos maiores, monoespaçados e de largura fixa, sem depender de fonte externa. Menus, botões e textos usam fontes do sistema; a identidade decorativa permanece nos títulos.
- Mantidos os mesmos IDs e eventos, as regras, os códigos dos enigmas e a pausa pedagógica.
- Percursos em português e inglês, uso dos itens e demais verificações continuam aprovados nos 42 testes simulados. Validação visual em navegadores reais permanece pendente.
- Alterações locais, sem commit ou push nesta etapa.

## Diário compacto e apresentação atual do projeto

- Cabeçalho do diário reduzido a título e resumo; orientação de ordem mantida em uma frase para leitores de tela.
- Ambiente e tempo reunidos na mesma linha de cada registro, sem repetir o rótulo Anotação nem a expressão Tempo restante no conteúdo visual. Falhas continuam identificadas por texto; horários preservam rótulos acessíveis.
- Reduzidos espaçamentos dos cartões e do rodapé sem diminuir a fonte principal das pistas. Mantidos o foco, a navegação por teclado, a ordem dos registros e o comportamento do relógio.
- Removida dos READMEs a seção opcional de distribuição futura; apresentação identifica o projeto como portfólio principal atual.
- 42 testes simulados aprovados nesta revisão. Validação visual em navegador real continua pendente.
- Sem commit ou push executados nesta etapa.

## Explicações do código e guia técnico

- Acrescentados comentários em português aos três scripts principais, às duas versões do HTML do jogo e a dois arquivos CSS.
- Comentários destacam estado, eventos, callbacks, inventário, relógio, pausa, cálculo binário, finais, idiomas e responsividade.
- Criado GUIA-DO-CODIGO.md com mapa dos arquivos, sequência de demonstração, conceitos e consulta técnica dos enigmas; vinculado nos dois READMEs.
- Verificada a preservação exata das sete fontes anteriores ao reverter somente as inserções explicativas. Os 42 testes simulados passaram e os links do guia foram conferidos.
- Nenhuma publicação futura foi anunciada na interface ou no README. Sem commit ou push nesta etapa.

## Conferência com o enunciado do professor

- Criado AUDITORIA-REQUISITOS.md, com matriz dos requisitos do professor e dos objetivos do projeto, evidências e validações pendentes.
- Confirmadas 12 páginas em português, 24 páginas alcançáveis por links, 11 objetos com estado e método interagir, cinco cenários e quatro finais.
- Corrigido contraste dos textos dos fios vermelho e azul; indicação luminosa preserva as cores de fundo. Recuo de texto explícito aplicado na abertura da história.
- Acrescentado roteiro proposto de demonstração ao guia, ainda dependente de ensaio cronometrado. A contagem ativa de cinco minutos não equivale a um limite de cinco minutos de sessão com pausas.
- Permanecem pendentes validação formal HTML5, leitor de tela, inspeção visual real e confirmação remota da publicação. A sessão não conseguiu acessar os hosts da Vercel e do validador.
- Sem commit ou push nesta etapa.

## Conferência dos três ajustes aprovados — 7 de novembro de 2026

- Confirmada a implementação no commit d56e102: menu nativo recolhível, briefing com painel oculto e fusíveis com repetição e leitura por etapas.
- Executados 52 testes simulados com aprovação. Testados os novos fluxos na Vercel em português e inglês, com viewports de 375 × 812 e 1280 × 900; nenhum erro de console nos percursos verificados.
- Atualizados comentários, guia técnico, READMEs, matriz de requisitos e cobertura de testes.
- A verificação publicada não substitui teste com leitor de tela, validação formal HTML5 ou homologação em aparelhos/sistemas reais.
- Nenhum commit ou push executado nesta revisão.

## Revisão geral de largura e organização — 7 de novembro de 2026

- Conferidas no navegador integrado as 24 páginas publicadas, em 320, 768 e 1280px. No jogo, o menu também foi medido em 375, 458, 700, 701 e 900px. Nenhum link do menu ultrapassou a janela nessas condições; o corte lateral relatado não foi reproduzido.
- Encontrada largura excedente em Tecnologias PT/EN a 320px: a tabela rolava no seu contêiner, mas descrições absolutas visualmente ocultas podiam ampliar o documento. O CSS local agora torna tabela-rolagem um bloco de referência posicionado, limitando também esses elementos ao contêiner.
- Reforçada a capacidade de encolher e quebrar linha dos links, itens e contêineres do menu. Não foi usado overflow-x: hidden no corpo para esconder conteúdo.
- O Nu Html Checker retornou zero erros para jogo.html, en/jogo.html, index.html, historia.html e cenarios.html. Houve um aviso de aria-hidden redundante nas duas páginas do jogo; o atributo foi retirado localmente, preservando hidden.
- A validação externa foi interrompida ao consultar itens.html, pois o serviço voltou a apresentar uma verificação de segurança. As outras 19 páginas não receberam validação formal nesta rodada.
- Mantidos HTMLs portugueses na raiz e ingleses em en/, preservando URLs. Guias, créditos e relatórios movidos para docs/; READMEs permanecem na raiz e os links foram atualizados.
- Cabeçalhos e blocos head das 24 páginas tiveram indentação padronizada; acrescentadas explicações da navegação e da contenção da tabela.
- A inspeção visual desta rodada se refere à versão já publicada. O navegador não alcançou o servidor local temporário de teste; ele foi encerrado. A renderização do CSS corrigido deve ser reconferida após a publicação.
- Validação formal completa, leitor de tela e matriz de sistemas reais continuam pendentes. Não foi declarada ausência universal de bugs.
- Alterações locais, sem commit ou push nesta revisão.
- Conferência final local: 52 testes de regressão aprovados, 24 HTMLs com estrutura e conteúdo preservados, 37 referências locais da documentação válidas, seis arquivos JavaScript com sintaxe válida e 28 SVGs com XML válido. A comparação com o commit anterior confirmou que o HTML mudou somente em indentação, comentários, versão do CSS e atributo redundante do fundo.

## Correção do alinhamento do título Jogar

- Identificada diferença entre a largura do main do jogo (1320px) e a das outras páginas (1000px). O problema relatado era o título, não o menu.
- Criada largura de conteúdo compartilhada, aplicada ao main informativo e aos h2. Títulos usam 1,5rem e margem horizontal automática.
- Reservado espaço da barra de rolagem vertical, com alternativa para navegadores sem scrollbar-gutter.
- Atualizadas as URLs das folhas de estilo alteradas nas páginas correspondentes. Briefing e introdução também seguem a coluna compartilhada. Mantidos os HTMLs na raiz e em en/ e a documentação em docs/.
- Os 52 testes simulados passaram; a reconferência visual da correção depende da publicação. Sem commit ou push nesta etapa.


## Regra adicional de eventos — 07/11/2026

- Eventos do jogo e menu usam propriedades `on...`; o simulador segue a mesma organização. A busca no código atual não encontrou os métodos proibidos de criação de elementos e registro de ouvintes.
- O teclado do jogo mantém um tratamento central para foco dos diálogos e callbacks dos minigames; o menu respeita as teclas já tratadas. Mudanças de largura dentro da mesma faixa preservam a abertura manual do menu.
- Comentários no JavaScript e mapas de leitura nos quatro CSS explicam as responsabilidades; o guia detalha atribuição de funções, delegação, montagem do HTML e propagação do teclado.
- 54 testes simulados aprovados, incluindo a transição do minigame para o diário/menu e redimensionamento sem mudança de faixa. As versões dos scripts foram atualizadas nos 24 HTMLs para renovar o cache após a publicação.
- Esta alteração ainda precisa de reconferência no navegador após publicar. Não representa garantia em todos os navegadores ou sistemas. Sem commit ou push nesta etapa.
