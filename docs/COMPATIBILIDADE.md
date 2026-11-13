# Robustez e compatibilidade do Protocolo Kairo

Revisão local atualizada em 7 de novembro de 2026. Esta revisão não inclui commit, push ou publicação.

## O que pode ser afirmado

- A suíte de regressão passou em 56 testes automatizados de lógica e estrutura.
- Foram simuladas presença e ausência de dialog nativo, indisponibilidade e falha de tela cheia, temporizadores atrasados, uso por teclado e botões de toque.
- Os 28 SVGs do projeto foram analisados como XML sem erro.
- As referências e âncoras locais das 24 páginas (12 em português e 12 em inglês) foram conferidas, sem IDs duplicados ou meta descriptions repetidas.
- Os testes simulados não equivalem a uma homologação visual. A seção de verificação publicada registra os fluxos adicionais conferidos no navegador integrado; não há homologação de todos os sistemas operacionais.

## Correções aplicadas

1. **Tempo decorrido:** o jogo calcula o tempo que passou, em vez de apenas contar chamadas de setInterval. Ao voltar de uma aba suspensa ou do histórico, a contagem é reconciliada. Uma interação recebida depois do prazo não entrega itens nem libera a saída.
2. **Pausa pedagógica:** as frações de segundo são preservadas. A calculadora não concede tempo extra por ser aberta e fechada repetidamente. Recolher o apoio, usar Fechar ou Esc retoma uma única contagem.
3. **Encerramento:** os painéis são fechados antes do final; ações e efeitos não continuam alterando a partida encerrada. A falha fatal do terminal não acrescenta um bloqueio da gaveta após a captura.
4. **Dispositivos de toque:** o painel de comandos inclui setas clicáveis. Uma lista textual alternativa oferece botões para objetos e passagens, reduzindo a dependência de alvos pequenos na ilustração.
5. **Dialog:** browsers com showModal usam o recurso nativo. Quando ele não existe, há painel alternativo com fundo, fechamento por Esc, retorno de foco e circulação de Tab dentro dos controles. Esc não dispensa o final.
6. **Tela cheia:** recurso opcional, oculto quando indisponível. Ausência de métodos, retorno sem Promise e erro síncrono são tratados. A falha do recurso não interrompe o jogo.
7. **Carregamento:** Começar e Diário só são habilitados quando a inicialização conclui. Uma mensagem permanece se o script não carregar; com JavaScript desativado, o site informa como continuar pelas páginas estáticas.
8. **Contato:** múltiplos envios não criam respostas concorrentes. Os campos ficam bloqueados durante a simulação. Limpar cancela a resposta pendente e devolve os controles. A confirmação não desaparece com o reset interno.
9. **Layout:** alternativas para proporção do cenário, largura do conteúdo e altura de painéis; cenário em tela cheia sem largura calculada negativa; campos e cartões com largura mínima flexível; atalho Jogar integrado ao rodapé, sem sobrepor conteúdo em qualquer largura; cabeçalho não fica fixo em janelas baixas.
10. **Desempenho:** o calendário não duplica indefinidamente uma pista já consultada. A lista completa do diário só é reconstruída quando necessária. Fontes externas continuam com alternativas locais de leitura.

## Idiomas e apresentação de portfólio

- Seletor Português / English nas 24 páginas. A troca no jogo reinicia a partida; o aviso aparece no briefing.
- As regras, os códigos e as condições dos finais são compartilhados pelo mesmo JavaScript. A introdução, os erros, o inventário, o diário, a calculadora e os finais recebem tradução.
- Onze variantes SVG traduzem as placas e legendas; a porta e a trilha sem vozes são compartilhadas.
- O nome digitado no contato é preservado, sem passar pelo dicionário de tradução.
- Metadados, idioma do documento e links de alternância conferidos. Seletores funcionam como links mesmo sem JavaScript.
- README em português e inglês e créditos de autoria e IA preparados, com apresentação das tecnologias utilizadas no projeto.

## Revisão do rodapé e cabeçalho — 7 de novembro

- Retirada a posição fixa do atalho Jogar. Nas 20 páginas que oferecem esse atalho, ele está dentro do rodapé e acompanha o fluxo do documento.
- Removido o preenchimento inferior de 5rem que deixava espaço extra inclusive nas páginas sem atalho.
- Rodapé com texto e botão em colunas no desktop, empilhados em larguras de até 700px.
- Marca com quebra de linha e colunas flexíveis; seletor permite reorganização quando falta espaço. Layout compacto do cabeçalho aplicado até 700px.
- Atualizadas as versões das URLs de CSS e JavaScript para evitar reutilização de recursos antigos após a publicação.
- Após os ajustes: 42 testes simulados aprovados; fechamento e aninhamento de elementos, IDs e referências locais das 24 páginas conferidos; cinco arquivos JavaScript com sintaxe válida e 28 SVGs com XML válido.
- Estas conferências de estrutura e lógica não renderizam o layout. A matriz visual abaixo continua pendente.

## Como repetir os testes de lógica

Com Node.js instalado, execute na pasta do projeto:

~~~sh
node tests/regressao.cjs
~~~

A suíte usa apenas módulos nativos do Node.js. Os testes foram executados pelo runtime Node disponibilizado nesta sessão. Na conferência mais recente, o comando node também estava disponível no terminal e executou a suíte diretamente.

O DOM, os eventos close, o relógio e as APIs opcionais são simulados. A suíte não renderiza CSS, não reproduz áudio, não emula um leitor de tela e não substitui os mecanismos de Chromium, Gecko ou WebKit.

## Matriz visual que ainda precisa ser executada

| Plataforma | Navegador | Situação |
| --- | --- | --- |
| Windows | Chrome, Edge e Firefox atuais | Não executado nesta etapa |
| macOS | Safari, Chrome e Firefox atuais | Não executado nesta etapa |
| Linux | Chromium/Chrome e Firefox atuais | Não executado nesta etapa |
| Android | Chrome e Firefox atuais | Não executado nesta etapa |
| iOS/iPadOS | Safari atual, com e sem teclado físico | Não executado nesta etapa |

A política do navegador integrado bloqueou a abertura de arquivos locais na sessão anterior. Não foi contornada essa restrição nem declarada aprovação visual sem execução real.

## Critérios para a conferência visual

- Abrir todas as páginas nos dois idiomas e verificar menu, seletores, links, imagens e controles de áudio.
- Usar larguras de 320, 375, 768 e 1280 pixels; testar zoom de 200%, orientação horizontal e teclado virtual aberto.
- Conferir ausência de rolagem horizontal da página; tabelas podem ter rolagem horizontal própria.
- Completar uma partida com teclado e outra com toque, incluindo minigames, diário, calculadora e bilhete.
- Entrar e sair de tela cheia quando o navegador disponibilizar o recurso.
- Abrir a calculadora por um minuto, fechar com botão e Esc e conferir a retomada.
- Deixar a aba em segundo plano e retornar depois do prazo: deve aparecer o final Capturado.
- Conferir contraste, foco visível, leitura dos rótulos e anúncio das mensagens em um leitor de tela.
- Simular fontes externas indisponíveis; o conteúdo deve continuar legível com a fonte do sistema.
- Enviar e cancelar a simulação de contato; não deve haver navegação, envio real ou confirmação atrasada após limpar.

## Limites do suporte

O alvo é um navegador atualizado com JavaScript moderno e CSS flex/grid, em um sistema operacional capaz de executá-lo. Browsers obsoletos ou com JavaScript desativado não recebem garantia de jogo completo. O site estático e as mensagens de carregamento oferecem uma alternativa legível.

Não existe garantia de ausência absoluta de bugs em qualquer navegador, extensão, dispositivo ou sistema operacional. Problemas de rede, conteúdo bloqueado por extensões, restrições do sistema e mudanças futuras dos navegadores exigem validação contínua. A abordagem adotada é detectar recursos, oferecer alternativas, testar regressões e documentar a cobertura real.

## Referências técnicas consultadas

- [MDN: elemento dialog](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog) — modalidade, foco e comportamento nativo.
- [MDN: temporizadores](https://developer.mozilla.org/en-US/docs/Web/API/Window/setTimeout) — atrasos e restrições em abas inativas.
- [MDN: Fullscreen API](https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API) — disponibilidade, permissões e falhas de tela cheia.

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

## Conferência com o enunciado do professor

- Criado AUDITORIA-REQUISITOS.md, com matriz dos requisitos do professor e dos objetivos do projeto, evidências e validações pendentes.
- Confirmadas 12 páginas em português, 24 páginas alcançáveis por links, 11 objetos com estado e método interagir, cinco cenários e quatro finais.
- Corrigido contraste dos textos dos fios vermelho e azul; indicação luminosa preserva as cores de fundo. Recuo de texto explícito aplicado na abertura da história.
- Acrescentado roteiro proposto de demonstração ao guia, ainda dependente de ensaio cronometrado. A contagem ativa de cinco minutos não equivale a um limite de cinco minutos de sessão com pausas.
- Permanecem pendentes validação formal HTML5, leitor de tela, inspeção visual real e confirmação remota da publicação. A sessão não conseguiu acessar os hosts da Vercel e do validador.
- Sem commit ou push nesta etapa.

## Verificação dos três ajustes aprovados

Base funcional: commit d56e102, já presente no início desta revisão. Nesta etapa foram atualizados comentários e documentação, sem duplicar a implementação.

- **Menu:** 24 páginas com details/summary e scripts/menu.js. Links abertos no HTML como alternativa sem JavaScript; em telas de até 700px, o script recolhe o menu. Escape devolve o foco ao controle e não interfere nos diálogos.
- **Briefing e painel:** controles e inventário ficam ocultos durante briefing e introdução; iniciar() revela o painel. Instruções detalhadas ficam recolhidas. Em telas pequenas, o painel usa espaçamentos menores.
- **Fusíveis:** repetição preserva a mesma sequência e cancela a animação anterior. O avanço manual revela um sinal por clique; os fios permanecem desabilitados até Iniciar tentativa, quando as luzes são apagadas. O cronômetro continua e erros mantêm a penalidade.
- **Regressão:** 52 testes simulados aprovados, incluindo menu, mudanças de largura, foco, início da partida, repetição, leitura por etapas, idioma, erro, fechamento e prazo.

### Verificação publicada no navegador integrado

- Abertas as rotas jogo.html e en/jogo.html da Vercel; recursos de jogo/menu identificados pela versão 20261107-acessibilidade.
- Em viewport de 375 × 812: menu inicialmente recolhido, painel oculto no briefing e ausência de largura excedente da página. Cabeçalho medido em aproximadamente 181px; o briefing começa em aproximadamente 302px, comparado a 1226px na verificação anterior.
- Em viewport de 1280 × 900: menu completo e controle móvel oculto.
- Menu aberto e fechado com Escape, com retorno de foco ao summary.
- Entrada na partida revela tempo, inventário e controles. No teste móvel em inglês, painel vazio medido em aproximadamente 283px de altura.
- Fusíveis concluídos em português e inglês pelo modo manual. Confirmados repetição da sequência, bloqueio dos fios durante leitura, limpeza das luzes na tentativa e continuidade da contagem.
- Nenhum erro apareceu no console durante esses fluxos. Viewports restaurados ao concluir a verificação.

Esses testes usam o navegador integrado e viewports controlados. Não equivalem a teste em aparelhos físicos, em todos os mecanismos de navegador ou com leitor de tela. A matriz de sistemas operacionais e a validação formal HTML5 continuam pendentes. A tentativa anterior no validador externo encontrou uma verificação de segurança, que não foi contornada.

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


## Rótulos dos objetos com zoom — 07/11/2026

- O autor informou ter concluído uma partida, navegação e testes nos dois idiomas sem erros; no teste com zoom de 200%, encontrou o nome do painel de comandos quebrando letra por letra sobre a imagem. Este é um relato do autor, não uma nova homologação de todos os ambientes.
- A causa era o texto dentro da pequena área percentual do botão. Os nomes agora aparecem na faixa `rotulo-cenario`, abaixo da ilustração, com largura de conteúdo e quebra por palavras. Os botões conservam seus nomes acessíveis e o destaque visual; a faixa visual não duplica o anúncio pelo leitor de tela.
- Eventos de mouse e foco usam propriedades `on...` e delegação. O foco tem prioridade; sair com o mouse não apaga o nome de um objeto focado. Trocar de sala limpa a identificação anterior.
- 56 testes simulados aprovados, incluindo esses fluxos nos dois idiomas. Versões de CSS e JavaScript renovadas nas duas páginas do jogo. A renderização com 200% deve ser reconferida após publicar; os testes de DOM não comprovam dimensões reais.
- Nenhuma opção de gratificação foi adicionada. A prioridade indicada pelo autor é a entrega avaliativa até 18/11/2026 às 20h; monetização será considerada em uma etapa posterior. Sem commit ou push nesta revisão.


## Validação formal completa — 07/11/2026

- Os 24 HTMLs locais (12 PT e 12 EN) foram enviados ao serviço oficial Nu HTML Checker: **zero erros e zero avisos**. Execução encerrada às 21h36 de Brasília (08/11/2026 às 00h36 UTC). Isso resolve a pendência de validação HTML registrada nas etapas anteriores deste histórico.
- Evidência: [validacao-html.json](validacao-html.json), com resultado por arquivo e hash SHA-256 do conteúdo enviado. O relatório refere-se ao HTML local; não certifica que um deploy posterior usa os mesmos arquivos.
- Repetição: `node tests/validar-html.cjs`, na raiz, com Node.js 18+ e acesso à internet. O script envia apenas os HTMLs públicos ao serviço externo, salva o relatório e sinaliza erro de validação. Falha de rede interrompe a execução; não é considerada aprovação. O validador é uma ferramenta de desenvolvimento, não uma dependência do jogo.
- Conferência estática adicional: 24 páginas com idioma e atalho para o conteúdo, 24 imagens com atributo alt (vazio quando decorativo), 14 campos de formulário com label associado e nenhum tabindex positivo. Não foram encontradas falhas nesses critérios específicos. Os diálogos, rótulos dinâmicos e avisos de status também foram revisados no código.
- Os 56 testes de regressão passaram novamente, incluindo foco alternativo, teclado, controles por toque, pausa, finais e nomes dos objetos nos dois idiomas. A busca nos scripts e testes não encontrou os métodos proibidos pela avaliação.
- A execução real com leitor de tela continua pendente. Marcação e foco simulados não comprovam anúncios falados, ordem de leitura ou ritmo de interação. Nenhuma homologação com NVDA, Narrador, VoiceOver ou TalkBack foi declarada.
- Sem alteração de interface, regras, commit ou push nesta etapa.


## Ícone e documentação — 13/11/2026

- A imagem fornecida pelo autor foi copiada sem alteração para `assets/favicon.png`; os 24 HTMLs usam o novo ícone com versão na URL para renovar o cache. A mudança afeta o ícone do navegador, não os títulos ou as artes das cenas.
- Comentários por blocos descrevem regiões do HTML, regras de layout no CSS e responsabilidades de funções no JavaScript. Não houve mudança nas regras ou nos enigmas.
- Os READMEs foram ajustados para apresentar uso, arquitetura e verificações de forma direta; a contagem antiga de 52 testes foi corrigida para 56. `tests/README.md` explica a simulação, os módulos nativos usados e a separação entre ferramentas de desenvolvimento e aplicação.
- O enunciado fornecido proíbe frameworks e bibliotecas auxiliares de DOM/estado. A suíte usa código próprio e módulos nativos do Node.js, não é carregada por HTML e não acrescenta dependências ao jogo; por isso foi preservada. A restrição adicional de métodos informada pelo autor continua atendida. Isso não substitui a decisão de avaliação do professor.
- Verificação: 56 testes aprovados, sintaxe JavaScript válida e nova rodada do Nu HTML Checker com zero erros e zero avisos nos 24 HTMLs. O relatório `validacao-html.json` foi atualizado. O teste prático com leitor de tela permanece pendente. Sem commit ou push nesta etapa.


## Limpeza de recursos substituídos — 13/11/2026

- Removidos cinco arquivos sem referências de uso no site, nos scripts e nos testes: `assets/favicon.svg`, `assets/ambiente.mp3`, `assets/historia/porta.svg`, `assets/cenas/cozinha-pagina.svg` e `assets/en/cenas/cozinha-pagina.svg`.
- Recursos atuais preservados: `assets/favicon.png`, `assets/ambiente-kairo.wav`, `assets/historia/porta-kairo.png` e as artes de cozinha usadas no CSS. Os retratos da introdução e as variantes inglesas foram conferidos também pelos caminhos montados no JavaScript. O prompt da imagem foi mantido como documentação do recurso.
- 56 testes aprovados após a limpeza. Os 24 HTMLs não mudaram e seus hashes continuam correspondendo ao relatório de validação com zero erros e zero avisos; não foi necessária outra submissão ao validador. Nenhuma regra ou interface foi alterada.
- Os arquivos retirados permanecem recuperáveis no histórico do Git após registrar a mudança. Sem commit ou push nesta etapa.

## Destaque do sistema de acesso — 13/11/2026

- Ajuste autorizado pelo autor após análise das gravações de Chrome e Firefox: o painel estava visível, mas o piscar não ficou perceptível nos quadros observados.
- O realce agora usa dois ciclos suaves de dois segundos, totalizando quatro segundos, com borda vermelha e brilho estáticos. A preferência de movimento reduzido continua desativando apenas a animação.
- A imagem permanece até o jogador avançar a fala. Não há atraso obrigatório, avanço automático ou alteração do cronômetro da partida. A mudança é compartilhada por português e inglês.
- 56 testes aprovados. Os 24 HTMLs foram revalidados: zero erros e zero avisos; relatório atualizado. A versão do CSS foi renovada nas duas páginas para evitar cache antigo. A aparência desta revisão ainda deve ser conferida após publicar. Sem commit ou push.


## Exceção autorizada para o alerta — 13/11/2026

- O autor autorizou explicitamente que somente o painel de contenção anime mesmo com movimento reduzido. Três ciclos lentos de dois segundos totalizam seis segundos; borda e brilho permanecem após a animação.
- A regra específica tem prioridade sobre os bloqueios gerais do CSS. As demais animações continuam desativadas quando há preferência de movimento reduzido. A fala avança manualmente; o cronômetro não mudou.
- 56 testes aprovados. A prévia local não foi acessível pelo navegador integrado; a aparência desta revisão precisa de conferência após publicar.
- O serviço limitou a rodada completa de validação com HTTP 429. Em seguida, os dois HTMLs alterados foram revalidados individualmente, sem erros ou avisos; os outros 22 mantêm os hashes da validação anterior. O relatório foi atualizado e os 24 hashes foram conferidos. Sem commit ou push.
