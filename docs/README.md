# Documentação do Protocolo Kairo

Os READMEs da raiz apresentam o portfólio. Esta pasta reúne o material técnico e de consulta:

- [Guia do código](GUIA-DO-CODIGO.md): conceitos, funções e sequência de apresentação. Inclui soluções dos enigmas.
- [Requisitos](AUDITORIA-REQUISITOS.md): comparação com o enunciado e os objetivos do projeto.
- [Compatibilidade](COMPATIBILIDADE.md): verificações realizadas, resultados e limites.
- [Créditos](CREDITOS.md): autoria e recursos utilizados.
- [Histórico de revisão](REVISAO.md): registro das alterações e das verificações de cada etapa.

## Organização dos arquivos

```text
README.md / README.pt-BR.md  Apresentação do repositório
*.html                      Páginas em português
en/                         Páginas equivalentes em inglês
css/                        Estilos compartilhados e do jogo
scripts/                    Eventos, regras, idiomas e navegação
scripts/dados/              Dicionário em inglês
assets/                     Imagens e áudio
tests/                      Testes de regressão
docs/                       Guias, créditos e relatórios
```

As páginas portuguesas permanecem na raiz para preservar endereços como `/jogo.html`, os links já divulgados e a abertura local sem configuração de rotas. As páginas inglesas ficam separadas em `en/`. Criar outra pasta apenas para os HTMLs acrescentaria mudanças de caminhos sem uma necessidade funcional neste site estático.

Ao acrescentar uma página, atualize a navegação e o mapa do site nos dois idiomas. Ao mover um arquivo, confira os links que apontam para ele. Execute `node tests/regressao.cjs` na raiz e consulte a cobertura real no relatório de compatibilidade.
