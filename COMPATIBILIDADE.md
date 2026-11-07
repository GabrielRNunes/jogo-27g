# Robustez e compatibilidade do Protocolo Kairo

Revisão local atualizada em 7 de novembro de 2026. Esta revisão não inclui commit, push ou publicação.

## O que pode ser afirmado

- A suíte de regressão passou em 42 testes automatizados de lógica e estrutura.
- Foram simuladas presença e ausência de dialog nativo, indisponibilidade e falha de tela cheia, temporizadores atrasados, uso por teclado e botões de toque.
- Os 28 SVGs do projeto foram analisados como XML sem erro.
- As referências e âncoras locais das 24 páginas (12 em português e 12 em inglês) foram conferidas, sem IDs duplicados ou meta descriptions repetidas.
- Nenhum desses resultados equivale a uma homologação visual em navegadores reais ou em todos os sistemas operacionais.

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

A suíte usa apenas módulos nativos do Node.js. Os testes atuais foram executados pelo runtime Node disponibilizado nesta sessão. O comando node não está disponível no PATH do terminal deste computador; para usar o comando acima diretamente, é necessário que a instalação local esteja acessível no terminal.

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
