'use strict';

// O idioma vem da página. As regras do jogo são compartilhadas entre PT e EN.
const idiomaIngles = (document.documentElement.getAttribute('lang') || '').indexOf('en') === 0;
const dicionarioIngles = window.KAIRO_INGLES || {};
const trechosTraduziveis = Object.keys(dicionarioIngles)
  .filter(function (chave) { return chave.length >= 4 && chave !== dicionarioIngles[chave]; })
  .sort(function (a, b) { return b.length - a.length; });

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

function recursoLocal(caminho) {
  if (!idiomaIngles) return caminho;
  const partes = caminho.split('?');
  const arteTraduzida = /^(assets\/(cenas|finais)\/|assets\/historia\/impacto\.svg)/.test(partes[0]);
  let arquivo = partes[0];
  if (arteTraduzida) arquivo = arquivo.replace('assets/', 'assets/en/');
  return '../' + arquivo + (partes[1] ? '?' + partes[1] : '');
}
