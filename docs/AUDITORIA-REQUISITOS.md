# Conferência dos requisitos — Protocolo Kairo

Revisão de 7 de novembro de 2026, baseada no enunciado fornecido e no código do repositório. Base funcional atual: commit `d56e102`, com atualização local da documentação nesta revisão. Este documento distingue implementação de validação; não atribui uma nota nem substitui a avaliação do professor.

## Resultado geral

Os requisitos funcionais centrais estão implementados. Há 12 páginas em português, 11 objetos interativos modelados, cinco ambientes e quatro finais. As 12 versões inglesas são adicionais e não foram usadas para inflar a contagem mínima de páginas.

Persistem verificações importantes: validação formal de HTML, teste com leitor de tela, conferência visual em navegadores reais, conferência completa da publicação e ensaio cronometrado da experiência. A lista exata de tags vistas em aula também não foi fornecida.

## Site — HTML e CSS

| Requisito | Evidência no projeto | Situação |
| --- | --- | --- |
| Pelo menos dez arquivos HTML, com jogo e páginas de apoio | 12 arquivos portugueses: jogo e 11 páginas de apoio; história, contato, desenvolvedor, cenários e itens incluídos | Implementado |
| Acessar as páginas por links | Percorrendo os links desde `index.html`, são alcançáveis as 24 páginas dos dois idiomas | Conferido localmente |
| Maioria das tags da aula | Há ampla variedade: `article`, `aside`, `section`, `nav`, `figure`, `details`, `form`, listas, tabelas, mídia e outras | Comparar com a lista da aula |
| Links internos, locais e externos | Âncoras como `#topo`, links entre arquivos e referências externas | Implementado; referências locais conferidas |
| Listas e tabelas | Navegação, instruções, inventário; tabelas em itens e tecnologias, além do exemplo binário | Implementado |
| Multimídia | Ilustrações SVG/PNG e áudio WAV com controles nativos e reprodução opcional | Implementado; audição e reprodução real precisam de conferência |
| Tags semânticas | `header`, `nav`, `main`, `section`, `article`, `aside`, `footer`, entre outras | Implementado |
| Formulário de contato fake | `contato.html` e `scripts/contato.js`: validação, contador e resposta simulada sem envio | Implementado e testado em simulação |
| HTML válido | IDs, referências e estrutura foram conferidos por verificações locais | Cinco páginas publicadas consultadas sem erros; validação das demais e da revisão local ainda pendente |
| Acessível a pessoas com deficiência visual | Botões nativos, nomes acessíveis, foco, atalhos, lista textual das cenas, status, inventário selecionável e diálogos | Recursos implementados; teste completo com leitor de tela pendente |
| CSS externo | Quatro folhas em `css/` | Implementado |
| Seletores avançados e hover | Seletores de atributos, `:not()`, `:nth-child()`, `:first-of-type`, `:focus-visible` e `:hover` | Implementado |
| Bordas e fundos | Painéis, cartões, cenas com imagens e cores de fundo | Implementado |
| Indentação e formatação de texto | Código indentado; tipografia e entrelinha; `text-indent` na abertura da história | Implementado |
| Google Fonts/custom fonts | Orbitron nos títulos, com alternativas locais; textos e controles usam fontes do sistema | Implementado |
| Position, flex e grid | Cena relativa, objetos absolutos, fundo alternativo fixo, painéis flex e layout grid | Implementado |
| Variáveis e media queries | Variáveis em `:root`; regras por largura, altura e preferência por movimento reduzido | Implementado; aparência real precisa de conferência |

## JavaScript e implementação técnica

| Requisito | Evidência no projeto | Situação |
| --- | --- | --- |
| Vanilla JS sem frameworks ou auxiliares de DOM/estado | Scripts próprios; não há React, Vue, jQuery ou biblioteca equivalente no jogo | Implementado |
| Objetos | `estado`, `ITENS`, `CENARIOS`, `objetos` e `FINAIS` | Implementado |
| Vetores de textos | `RESPOSTAS` no contato; textos organizados em `HISTORIA` e registros em `estado.diario` | Implementado |
| Manipulação de estado | Tempo, erros, ambiente, inventário, seleção, energia e estado dos enigmas | Implementado |
| Aleatoriedade | Sequências de setas e fios; protocolo e resposta do contato | Implementado |
| Controle de tempo | `Date.now()`, `setInterval()`, `setTimeout()` e cancelamento dos temporizadores | Implementado e testado em simulação |
| Eventos | Cliques, teclado, formulários, fechamento de diálogos e retorno à aba | Implementado |
| Modelagem dos elementos interativos | Todos os 11 elementos possuem método `interagir()` e propriedades de estado | Conferido no código executado |
| Pelo menos dez objetos/enigmas distintos | Calendário, gaveta, terminal, painel de comandos, PC, geladeira, fusíveis, rack, cofre, fechadura e lixeira | 11 elementos implementados |
| Interdependência | Terminal bloqueia gaveta após dois erros; painel libera PC; energia e cartão permitem usar rack; fragmentos compõem o PIN | Implementado e coberto por testes de lógica |
| Diário visível | Botão abre histórico das descobertas e falhas, da mais recente para a mais antiga | Implementado e testado em simulação |
| Pelo menos cinco cenários | Quarto, treino, cozinha, servidores e corredor | Cinco implementados; atende tanto ao título “5” quanto ao corpo “4” do enunciado |
| Inventário: coletar, inspecionar e combinar ou utilizar | Pen drive no PC, cartão no rack e bilhete opcional; seleção mostra descrição | Implementado; atende pela utilização, sem exigir um sistema de combinação |
| Minigame de teclado e minigame de clique | Sequência de setas por teclado, também com botões; memória dos fios por clique/toque | Implementado e testado em simulação |
| Pelo menos três finais condicionais | Perfeito, sequelas, capturado e secreto | Quatro implementados e testados |
| Git com commits descritivos | Histórico local inclui revisões de narrativa, interface, idiomas e documentação | Evidência local presente; o site identifica desenvolvimento solo |
| Deploy funcional na Vercel | URL configurada e usada no projeto: `https://jogo-27g.vercel.app/` | Jogo PT/EN acessado e fluxos novos conferidos no navegador integrado; conferência completa ainda pendente |

O enunciado aceita objetos ou puzzles. Não se trata de onze cadeados: há leitura de pista, validação de códigos, sequência de teclado, memória, uso de itens, condições de energia e coleta opcional. A avaliação da variedade e da dificuldade é qualitativa.

## Ambientação e ritmo

Narrativa, ilustrações, transições, finais ilustrados e trilha opcional estão presentes. A avaliação de diversão, suspense e acabamento depende da experiência real.

O relógio possui **300 segundos de contagem ativa**. A leitura da introdução ocorre antes do início e a calculadora pausa a contagem, conforme o requisito pedagógico do projeto. Portanto, o tempo total de uma sessão pode passar de cinco minutos. Conhecendo as respostas, também é possível terminar em menos de dois minutos.

O intervalo de 2 a 5 minutos é uma meta de ritmo a ensaiar, não uma duração comprovada pelos testes automatizados. O [guia do código](GUIA-DO-CODIGO.md) contém um roteiro proposto de aproximadamente 3 minutos e 20 segundos de demonstração do jogo. Ele precisa ser cronometrado na prática. A explicação posterior do código é uma etapa separada da jogatina.

## Objetivos definidos para o portfólio

| Objetivo | Situação atual |
| --- | --- |
| Projeto acadêmico apresentado como portfólio principal | README, página de desenvolvedor, tecnologias e créditos preparados |
| Código mais compreensível | Função `buscarElemento`, nomes em português, comentários e guia técnico |
| Português e inglês | 24 páginas, seletor, tradução da interface e das ilustrações com texto; regras compartilhadas |
| Apoio pedagógico ao binário dentro do jogo | Calculadora opcional no PC, pesos, exemplo e dicas; não preenche a solução do cofre |
| Pausa durante a consulta à calculadora | Implementada, preservando frações de segundo e uma única contagem |
| Lixeira e final secreto | Examinar abre a interação; recolher adiciona o bilhete; escapar dentro do prazo permite o secreto |
| Remover o bilhete visual exposto | Arte da cozinha revisada nas alterações anteriores; coleta depende da interação |
| Coerência entre história, briefing, regras e finais | Revisões cruzadas realizadas; entrada principal e saída de serviço diferenciadas; PIN concatenado |
| Diário mais limpo e leitura acessível | Cabeçalho e metadados compactos, pistas preservadas e texto legível |
| Inventário próximo da cena e tipografia consistente | Painel lateral em telas largas e anterior à cena em telas menores; relógio com dígitos de largura fixa |
| Seletor discreto e rodapé sem sobreposição | Seletor compacto; atalho Jogar integrado ao rodapé |
| Evitar publicação de contexto pessoal desnecessário | Retirados os detalhes sobre ano de estudo, linguagens futuras e planos pessoais da apresentação |
| Distribuição futura | Continua como possibilidade de evolução, sem anúncio de plataforma, data ou pagamentos |
| Ausência de bugs em qualquer navegador/SO | Não pode ser certificada universalmente; cobertura real e limites estão em `COMPATIBILIDADE.md` |

## Ajustes desta auditoria

1. **Contraste dos fios:** texto branco nos fundos vermelho e azul. Contrastes calculados passaram de aproximadamente 3,25:1 para 6,47:1 no vermelho e de 3,55:1 para 5,92:1 no azul. Verde e amarelo mantêm texto preto, com aproximadamente 6,03:1 e 8,23:1. O brilho da sequência usa contorno/sombra, sem clarear o fundo do texto. Esses cálculos de pares de cores não constituem uma auditoria completa de acessibilidade.
2. **Indentação de texto:** recuo de primeira linha explícito na abertura da história, usando `text-indent` e o seletor `:first-of-type`.
3. **Demonstração:** roteiro de ensaio adicionado ao guia; duração proposta, ainda não medida.

## O que falta comprovar antes da entrega

1. **Validação HTML5:** cinco páginas publicadas foram consultadas no [Nu HTML Checker](https://validator.w3.org/nu/) sem erros. Foram corrigidos localmente dois avisos redundantes. Falta validar as demais páginas e reconferir a revisão publicada; o serviço voltou a apresentar uma verificação de segurança.
2. **Acessibilidade prática:** completar uma partida por teclado e com leitor de tela, principalmente sequência de fios, painel de setas, diálogos e inventário. Conferir se a ordem dos fios é anunciada com tempo suficiente.
3. **Interface real:** verificar tela pequena, zoom de 200%, tela cheia, diálogos longos e seleção de itens nos navegadores usados na avaliação. A matriz mais ampla está em [COMPATIBILIDADE.md](COMPATIBILIDADE.md).
4. **Publicação:** abrir as duas versões na Vercel após o deploy e verificar navegação, imagens, áudio e uma partida completa. A verificação pelo navegador integrado confirmou o acesso às duas versões do jogo e os novos fluxos de menu, painel e fusíveis. Continuam pendentes a conferência completa das demais páginas e os testes indicados em COMPATIBILIDADE.md.
5. **Ritmo e apresentação:** cronometrar uma demonstração entre 2 e 5 minutos e explicar os trechos centrais pelo editor. Comparar a variedade de tags com a lista efetivamente vista em aula.

## Evidência automatizada

A suíte `node tests/regressao.cjs` reúne 52 testes de lógica e estrutura com DOM, relógio e APIs simulados. A auditoria também percorreu a navegação local e conferiu contagens e métodos dos objetos. Esses resultados não comprovam renderização real, HTML formalmente válido, reprodução de áudio, acessibilidade completa ou nota final.

## Ajustes de acessibilidade e fluidez aprovados

Os três ajustes foram conferidos: menu recolhível móvel com links completos no desktop, briefing sem painel antes do jogo e fusíveis com repetição e avanço individual dos sinais. A revisão incluiu 52 testes simulados e testes publicados em português e inglês, nas dimensões documentadas em COMPATIBILIDADE.md. A introdução, as instruções detalhadas e os controles do jogo foram reorganizados sem alterar o total de cenários, objetos ou finais.

## Resultado da revisão geral

As 24 páginas foram inspecionadas no navegador integrado em três larguras. O menu não apresentou corte nas condições verificadas. Foi corrigida localmente uma causa de largura excedente na tabela de tecnologias; a reconferência visual dessa correção depende da publicação. Os documentos técnicos foram reunidos nesta pasta, com referências atualizadas e HTMLs públicos mantidos nos mesmos endereços. O registro detalhado está em [COMPATIBILIDADE.md](COMPATIBILIDADE.md).

## Alinhamento do título e prioridades de conclusão

O deslocamento relatado era do título Jogar. O main do jogo utiliza até 1320px para comportar cena e painel, enquanto as páginas informativas utilizam até 1000px. O título agora usa a mesma largura de conteúdo e o mesmo tamanho de fonte das outras páginas, sem reduzir a área jogável. O espaço da barra vertical é estabilizado para evitar mudanças de posição entre páginas curtas e longas. A correção é local e deve ser reconferida no navegador após a publicação.

### Para concluir a avaliação

Os requisitos funcionais centrais estão implementados; não é necessário acrescentar enigmas para atingir as quantidades pedidas. Faltam comprovar os critérios abaixo:

- Concluir a validação formal HTML5 das 24 páginas e da versão revisada. A rodada anterior validou cinco páginas publicadas sem erros, não todas.
- Completar uma partida com leitor de tela e teclado, incluindo fios, setas, inventário e diálogos. Os controles acessíveis e testes simulados não substituem essa experiência.
- Cronometrar a demonstração em 2–5 minutos de tempo total. A contagem ativa tem cinco minutos; introdução e pausa binária podem alongar a sessão.
- Conferir a publicação final, recursos de mídia e telas no navegador usado pelo professor. A comparação com as tags vistas em aula depende da lista dessa aula.

### Para comprovar o nível desejado para o portfólio principal

- Uniformidade visual: conferir títulos, margens, fontes, menus, painéis e rodapés nas duas versões depois de publicar as correções.
- Cobertura prática: completar os percursos e conferir zoom, orientação e telas estreitas nos navegadores e dispositivos declarados como suportados. Não prometer funcionamento sem falhas em qualquer sistema.
- Fluidez: observar pessoas jogando sem explicar as soluções e registrar dificuldades de leitura, navegação, inventário e pistas; ajustar somente com aprovação do autor.
- Desempenho: medir o carregamento no celular antes de decidir otimizações. A imagem da porta tem aproximadamente 3MB; o WAV opcional, aproximadamente 2,7MB, usa preload=none. Esses tamanhos não significam que todo esse conteúdo seja baixado na abertura de todas as páginas.
- Apresentação: manter demonstração e README fáceis de entender, guia técnico coerente com o código e registros claros de autoria, decisões e validações.

A documentação está em docs/, os estilos em css/, a lógica em scripts/, os recursos em assets/ e os testes em tests/. Os HTMLs públicos continuam na raiz e em en/ para preservar endereços. Otimizações de mídia, mudanças de regras e novos recursos não foram aplicados nesta correção; precisam de aprovação específica.
