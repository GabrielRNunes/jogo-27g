# Guia do código — Protocolo Kairo

Material de consulta para compreender e apresentar o projeto. Os nomes abaixo correspondem às funções e aos arquivos reais. A apresentação pode alternar entre o navegador e o editor, usando a busca pelo nome da função.

Este guia inclui soluções dos enigmas. Ele é documentação técnica, não uma página de dicas para o jogador.

## 1. Visão geral

O Protocolo Kairo é um jogo e site estáticos, criados com HTML, CSS e JavaScript puro. O HTML define os elementos; o CSS define a apresentação; o JavaScript reage às ações e controla a partida. Não há framework, banco de dados ou servidor de aplicação.

| Arquivo | O que explicar |
| --- | --- |
| [jogo.html](jogo.html) | Painel de controles, inventário, introdução, área da cena e diálogos |
| [css/style.css](css/style.css) | Cores, fontes, regras básicas e foco visível |
| [css/paginas.css](css/paginas.css) | Componentes comuns do site, navegação e rodapé |
| [css/jogo.css](css/jogo.css) | Cena, botões interativos, painel lateral e adaptação às telas |
| [css/dialogo.css](css/dialogo.css) | Retratos, diário e tela de final |
| [scripts/jogo.js](scripts/jogo.js) | Regras, estado e interações |
| [scripts/idioma.js](scripts/idioma.js) | Tradução da interface e caminhos das imagens |
| [scripts/dados/ingles.js](scripts/dados/ingles.js) | Dicionário de textos em inglês |
| [scripts/contato.js](scripts/contato.js) | Formulário demonstrativo, sem envio real |
| [tests/regressao.cjs](tests/regressao.cjs) | Verificações automatizadas com DOM e relógio simulados |

## 2. Sequência de demonstração

1. **Apresentar a proposta:** investigar o desaparecimento de Kairo em cinco ambientes, com cinco minutos e quatro finais possíveis.
2. **Mostrar o HTML:** localizar `interface-jogo`, `inventario`, `cenario` e os elementos `dialog`. O cenário recebe botões pelo JavaScript.
3. **Mostrar o início:** clicar em Começar e relacionar `comecarHistoria()`, `proximaFala()`, `terminarHistoria()` e `iniciar()`. O relógio só começa em `iniciar()`.
4. **Inspecionar o calendário e abrir a gaveta:** acompanhar a mudança de `objetos.gaveta.resolvido`, a inclusão do pen drive em `estado.inventario` e a atualização dos botões.
5. **Selecionar o pen drive e trocar de sala:** explicar a diferença entre possuir um item e selecioná-lo para uso.
6. **Demonstrar o apoio binário:** no PC, abrir a calculadora e converter `0101`. Explicar os pesos 8, 4, 2 e 1, a pausa e a retomada. O apoio não preenche a resposta do cofre.
7. **Mostrar diário e final:** relacionar uma pista com `registrar()` e explicar a prioridade das condições em `decidirFinal()`.
8. **Concluir com a organização:** demonstrar o seletor de idioma, a adaptação de tela e a execução dos testes, descrevendo seus limites.

Não é necessário percorrer todos os enigmas para explicar um conceito. A gaveta exemplifica validação e inventário; o quadro de fusíveis exemplifica sequência, tempo e callbacks.

## 3. Dados e estado: onde ficam as informações

No início de `scripts/jogo.js`:

- `TEMPO_TOTAL` e `PENALIDADE_ERRO` definem valores comuns às regras.
- `CODIGOS` guarda as respostas como strings. O código `042` precisa manter o zero inicial.
- `ITENS` guarda nomes e descrições; o inventário guarda chaves como `pendrive`.
- `CENARIOS` guarda nomes e conexões entre salas.
- `objetos` reúne os dados e métodos de cada elemento interativo.
- `estado` registra a situação da partida: tempo, erros, sala, itens, seleção, diário e flags de execução.

`const estado` impede substituir a referência do objeto; não impede alterar propriedades como `estado.erros`. A indicação `resolvido` pertence a cada objeto, enquanto informações gerais ficam em `estado`.

## 4. Um clique completo, do HTML à resposta

Use o exemplo da gaveta:

1. `atualizarCenario()` cria um botão com `data-obj="gaveta"`.
2. O clique chega ao evento do contêiner `cenario`.
3. `interagirComCenario()` identifica o destino e chama `objetos.gaveta.interagir()`.
4. A gaveta abre o painel e fornece a função `aoEnviar`.
5. `enviarCodigo()` evita o envio tradicional, lê o campo e chama essa função.
6. Se o código estiver errado, `erro()` desconta tempo e registra a falha.
7. Se estiver correto, o objeto é marcado como resolvido, `adicionarItem()` entrega o pen drive e `registrar()` guarda a descoberta.

Essa organização permite reutilizar o mesmo painel para vários enigmas. Um **callback** é a função passada para ser chamada depois; neste exemplo, `aoEnviar` só executa quando o jogador envia o formulário.

`const gaveta = this` mantém a referência à gaveta disponível no callback. `this` corresponde ao objeto quando o método é chamado como `objetos.gaveta.interagir()`.

## 5. Inventário, DOM e eventos

O DOM é a representação da página em objetos acessíveis pelo JavaScript. `buscarElemento()` usa `document.querySelector()` para encontrar um deles.

`atualizarInventario()` lê os IDs do estado e cria os botões. `selecionarItem()` muda `estado.selecionado`, informa o item escolhido e reconstrói a interface. Como os botões são recriados, o código devolve o foco ao botão selecionado.

O evento fica no contêiner do inventário. Isso se chama **delegação de eventos**: não é preciso cadastrar um evento para cada botão novo. O cenário e a lista textual também compartilham o mesmo tratamento de interação.

`textContent` insere texto. `innerHTML` insere marcação criada pelo próprio projeto. O conteúdo digitado na calculadora é validado antes de compor os passos exibidos; `traduzirHTML()` não deve ser confundida com uma função para tornar HTML arbitrário de usuários seguro.

## 6. Relógio e pausa pedagógica

| Função | Responsabilidade |
| --- | --- |
| `iniciar()` | Prepara a partida e cria o intervalo de atualização |
| `sincronizarTempo()` | Desconta a diferença entre o instante atual e a última atualização |
| `atualizarRelogio()` | Exibe o tempo e o estado da contagem |
| `contarSegundo()` | Sincroniza, exibe e verifica o esgotamento do prazo |
| `partidaAtiva()` | Confere o tempo antes de permitir uma ação |
| `definirPausaCalculo()` | Cancela ou recria um único intervalo, preservando o restante |

O intervalo pede uma atualização a cada 250 milissegundos. Ele não é a fonte da medição: `Date.now()` permite calcular o tempo decorrido, inclusive quando uma aba atrasa atualizações. O valor em milissegundos preserva precisão; `Math.ceil()` produz os segundos exibidos.

Na calculadora, `sincronizarTempo()` é chamada antes de pausar. Ao retomar, uma nova referência de instante evita cobrar o período da consulta. Os demais painéis e o diário não pausam o jogo.

## 7. Binário e minigames

`calcularBinario()` aceita quatro caracteres formados por 0 e 1. O laço multiplica cada bit pelo peso correspondente em `[8, 4, 2, 1]` e acumula as parcelas. Exemplo: `0101 = 0×8 + 1×4 + 0×2 + 1×1 = 5`.

O painel de setas compara cada entrada com uma posição da sequência. Uma seta errada reinicia a tentativa; não aplica a penalidade de dez segundos dos códigos e fios errados.

O quadro de fusíveis usa `setTimeout()` para agendar luzes e liberar os cliques depois da demonstração. As funções internas conservam acesso a `sequencia`, `passoAtual` e `podeClicar`: esse acesso ao contexto é chamado **closure**. Os identificadores dos temporizadores são guardados para que o fechamento do painel cancele as animações.

## 8. Percurso e finais — consulta técnica

O percurso principal inclui:

1. Calendário: data `15/11` e senha `ORBITA`.
2. Gaveta: `1511`, entregando o pen drive.
3. Terminal: `ORBITA`, revelando `042` e o par `26`.
4. Painel de setas: libera o uso de mídia no PC.
5. PC com pen drive selecionado: grupos `0111 0011 1001`, que formam `739`.
6. Cofre: `739`, revelando o par `81`.
7. Geladeira: `042`, entregando o cartão.
8. Quadro de fusíveis: restaura a energia.
9. Rack com energia e cartão selecionado: revela o par `47`.
10. Fechadura: concatena terminal, rack e cofre em `264781`.

O bilhete é opcional: examinar a lixeira abre a interação; somente clicar para recolher adiciona o item.

- **Capturado:** o prazo acaba antes de a saída ser reprogramada.
- **Secreto:** o jogador reprograma a saída dentro do prazo e possui o bilhete.
- **Fuga Perfeita:** sem bilhete, com pelo menos 120 segundos restantes e no máximo uma falha.
- **Fuga com Sequelas:** sem bilhete, sai antes do prazo, mas não atende aos dois limites da fuga perfeita.

`decidirFinal()` escolhe entre as fugas. `finalizar()` cancela o relógio, fecha painéis e mostra o resultado uma única vez. A captura é acionada pelo esgotamento do tempo.

## 9. Idiomas, layout e acessibilidade

As páginas portuguesas ficam na raiz; as inglesas ficam em `en/`. O seletor usa links. As duas versões carregam o mesmo `jogo.js`; o dicionário inglês entra antes de `idioma.js` e do jogo. A tradução altera a apresentação e os caminhos das artes com texto, preservando as regras.

No CSS, variáveis definem cores e famílias de fontes. Grid organiza cena e painel; media queries reorganizam a interface quando a largura diminui. As posições dos objetos são percentuais sobre uma ilustração de proporção fixa.

Exemplos concretos de apoio à acessibilidade: botões nativos para objetos, lista textual alternativa, setas clicáveis, `aria-pressed` na seleção de itens, rótulos dos controles, foco visível e diálogos com alternativa à API nativa. Esses recursos não equivalem a uma auditoria completa com leitores de tela.

## 10. Contato, testes e autoria

O contato é uma demonstração. `preventDefault()` evita o envio tradicional; `setTimeout()` simula a espera, e não uma conexão de rede. O ID em `envioPendente` impede duplicação e permite cancelar a resposta ao limpar o formulário.

Para os testes, com Node.js disponível:

```sh
node tests/regressao.cjs
```

A suíte atual reúne 42 verificações de lógica e estrutura. O DOM, o relógio e as APIs são simulados. Ela verifica, por exemplo, percursos, finais, pausa, itens, idiomas e referências locais; não confirma renderização, áudio ou comportamento de todos os navegadores e sistemas. Os limites estão em [COMPATIBILIDADE.md](COMPATIBILIDADE.md).

O projeto é de Gabriel e recebeu assistência de IA, registrada em [CREDITOS.md](CREDITOS.md). A apresentação técnica deve refletir esse processo e explicar os comportamentos que podem ser demonstrados no código.
