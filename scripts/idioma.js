'use strict';

// O idioma vem da página. As regras do jogo são compartilhadas entre PT e EN.
const idiomaIngles = (document.documentElement.getAttribute('lang') || '').indexOf('en') === 0;
const dicionarioIngles = window.KAIRO_INGLES || {};
// Frases maiores vêm primeiro para evitar substituir apenas uma parte de uma expressão conhecida.
const trechosTraduziveis = Object.keys(dicionarioIngles)
  .filter(function (chave) { return chave.length >= 4 && chave !== dicionarioIngles[chave]; })
  .sort(function (a, b) { return b.length - a.length; });

// Em português, devolve o texto original. Em inglês, procura uma tradução exata primeiro.
// Os casos abaixo tratam mensagens com números e trechos compostos durante a partida.
function traduzir(texto) {
  if (!idiomaIngles) return texto;
  texto = String(texto);
  const chave = texto.trim();
  if (Object.prototype.hasOwnProperty.call(dicionarioIngles, chave)) {
    return texto.replace(chave, dicionarioIngles[chave]);
  }

  const resumo = chave.match(/^(\d+) registros? nesta partida · (\d+) falhas?$/);
  if (resumo) {
    return resumo[1] + (resumo[1] === '1' ? ' entry' : ' entries') +
      ' in this run · ' + resumo[2] + (resumo[2] === '1' ? ' mistake' : ' mistakes');
  }
  const fio = chave.match(/^Fio (\d+): (.+)$/);
  if (fio) return 'Wire ' + fio[1] + ': ' + traduzir(fio[2]);

  // Frases compostas combinam nomes de itens e mensagens já traduzidos.
  for (const trecho of trechosTraduziveis) {
    const padrao = trecho.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const limite = new RegExp('(^|[^A-Za-zÀ-ÿ])' + padrao + '(?=$|[^A-Za-zÀ-ÿ])', 'g');
    texto = texto.replace(limite, function (correspondencia, inicio) {
      return inicio + dicionarioIngles[trecho];
    });
  }
  return texto;
}

// Recebe marcação criada pelo próprio jogo; não é um sanitizador para HTML de usuários.
function traduzirHTML(html) {
  if (!idiomaIngles) return html;
  // Somente textos e rótulos: IDs, classes, códigos e eventos não são traduzidos.
  html = html.replace(/>([^<>]+)</g, function (trecho, conteudo) {
    return '>' + traduzir(conteudo) + '<';
  });
  return html.replace(/\b(alt|aria-label|title|placeholder)="([^"]*)"/g, function (trecho, atributo, valor) {
    const traducao = traduzir(valor).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
    return atributo + '="' + traducao + '"';
  });
}

// A página inglesa fica uma pasta abaixo da raiz, por isso usa '../'.
// Apenas ilustrações com texto recebem uma variante em assets/en; retratos e áudio são compartilhados.
function recursoLocal(caminho) {
  if (!idiomaIngles) return caminho;
  const partes = caminho.split('?');
  const arteTraduzida = /^(assets\/(cenas|finais)\/|assets\/historia\/impacto\.svg)/.test(partes[0]);
  let arquivo = partes[0];
  if (arteTraduzida) arquivo = arquivo.replace('assets/', 'assets/en/');
  return '../' + arquivo + (partes[1] ? '?' + partes[1] : '');
}
