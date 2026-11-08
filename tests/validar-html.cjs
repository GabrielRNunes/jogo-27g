// Execute na raiz: node tests/validar-html.cjs
// Requer Node.js 18+ e internet. Envia somente os HTMLs públicos do projeto
// ao Nu HTML Checker; não envia scripts, arquivos pessoais ou dados do Git.
'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');
const { createHash } = require('node:crypto');
const raiz = path.resolve(__dirname, '..');
const servico = 'https://validator.w3.org/nu/?out=json';

async function validarPagina(arquivo) {
  const html = await fs.readFile(path.join(raiz, arquivo), 'utf8');
  const resposta = await fetch(servico, {
    method: 'POST',
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
    body: html,
    signal: AbortSignal.timeout(30000)
  });
  if (!resposta.ok) throw new Error(arquivo + ': HTTP ' + resposta.status);
  const resultado = await resposta.json();
  if (!Array.isArray(resultado.messages)) throw new Error(arquivo + ': resposta inválida');
  return {
    arquivo,
    sha256: createHash('sha256').update(html).digest('hex'),
    erros: resultado.messages.filter(function (mensagem) { return mensagem.type === 'error'; }).length,
    avisos: resultado.messages.filter(function (mensagem) { return mensagem.subType === 'warning'; }).length,
    mensagens: resultado.messages
  };
}

async function executar() {
  const arquivos = [];
  for (const pasta of ['', 'en']) {
    const nomes = await fs.readdir(path.join(raiz, pasta));
    for (const nome of nomes.sort()) {
      if (nome.endsWith('.html')) arquivos.push(pasta ? pasta + '/' + nome : nome);
    }
  }
  const paginas = [];
  // Dois pedidos por vez mantêm o processo curto sem sobrecarregar o serviço.
  for (let indice = 0; indice < arquivos.length; indice += 2) {
    const lote = await Promise.all(arquivos.slice(indice, indice + 2).map(validarPagina));
    paginas.push(...lote);
    for (const pagina of lote) console.log(pagina.arquivo + ': ' + pagina.erros + ' erros, ' + pagina.avisos + ' avisos');
  }
  const relatorio = {
    executadoEm: new Date().toISOString(),
    servico,
    totalPaginas: paginas.length,
    erros: paginas.reduce(function (total, pagina) { return total + pagina.erros; }, 0),
    avisos: paginas.reduce(function (total, pagina) { return total + pagina.avisos; }, 0),
    paginas
  };
  await fs.writeFile(path.join(raiz, 'docs', 'validacao-html.json'), JSON.stringify(relatorio, null, 2) + '\n');
  console.log('Total: ' + relatorio.totalPaginas + ' páginas; ' + relatorio.erros + ' erros; ' + relatorio.avisos + ' avisos.');
  if (relatorio.erros) process.exitCode = 1;
}

executar().catch(function (erro) {
  console.error('Validação interrompida: ' + erro.message);
  process.exitCode = 1;
});
