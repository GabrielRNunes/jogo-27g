# Verificação do projeto

Esta pasta contém ferramentas de desenvolvimento. Nenhum HTML carrega estes arquivos; o site e o jogo funcionam sem Node.js, instalação de pacotes ou execução dos testes.

## Testes de regressão

Na raiz do projeto, com Node.js instalado:

```sh
node tests/regressao.cjs
```

Os 56 testes verificam se comportamentos existentes continuam funcionando após uma alteração: percurso entre salas, inventário, condições dos finais, tempo, pausa binária, teclado, eventos de clique, idiomas e referências locais.

O arquivo usa apenas módulos nativos do Node.js. `fs` lê arquivos, `path` resolve caminhos, `vm` executa os scripts em um contexto separado e `assert` compara os resultados com os valores esperados. As funções do próprio teste simulam elementos, eventos e relógio. Essa simulação não é uma biblioteca externa de manipulação de DOM ou estado.

O enunciado fornecido proíbe frameworks e bibliotecas auxiliares. A aplicação usa as APIs nativas do navegador; os testes não acrescentam dependências ao jogo. As restrições adicionais de métodos informadas pelo autor continuam sendo respeitadas no código atual. Esse enquadramento descreve a implementação; a avaliação cabe ao professor.

Para ler o arquivo, siga três etapas:

1. `criarAmbiente()` prepara uma página e um relógio simulados, sem alterar o navegador aberto.
2. `resolverRota()` percorre os enigmas com respostas conhecidas para verificar a integração.
3. `executarTestes()` reúne situações e confere os resultados. Uma falha interrompe a execução com uma mensagem.

Essa estrutura permite testar o fim dos cinco minutos sem esperar cinco minutos reais. Os casos usam respostas conhecidas porque verificam as regras; não são dicas exibidas ao jogador.

## Validação HTML

Com Node.js 18 ou superior e acesso à internet:

```sh
node tests/validar-html.cjs
```

O comando envia somente os HTMLs públicos ao Nu HTML Checker e grava o resultado em [validacao-html.json](../docs/validacao-html.json), com um hash por arquivo. Uma falha de rede não conta como aprovação. Após alterar os HTMLs, execute novamente para atualizar a evidência.

## Limites

Os testes não reproduzem todos os recursos do navegador, não renderizam CSS nem ouvem anúncios de leitor de tela. A validação HTML verifica marcação; ela não comprova acessibilidade completa. Partidas reais, zoom, áudio, telas e tecnologias assistivas exigem conferência prática. Resultados e pendências estão em [COMPATIBILIDADE.md](../docs/COMPATIBILIDADE.md).
