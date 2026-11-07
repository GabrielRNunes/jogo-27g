// Execute com: node tests/regressao.cjs
// Testes de lógica com DOM, relógio e APIs opcionais simulados, sem dependências.
// Não substituem testes visuais em navegadores e dispositivos reais.
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const raiz = path.resolve(__dirname, '..');

function criarAmbiente(arquivo = 'jogo', opcoes = {}) {
  let agora = 0;
  let proximoId = 1;
  const tarefas = new Map();
  const consultaMedia = { matches: Boolean(opcoes.menuPequeno) };
  let documento;

  function combina(elemento, seletor) {
    if (seletor[0] === '#') return elemento.id === seletor.slice(1);
    if (seletor[0] === '.') return elemento.classList.contains(seletor.slice(1));
    const partes = seletor.match(/^(\w+)?(?:\[([^=\]]+)(?:="([^"]*)")?\])?$/);
    if (!partes) return false;
    if (partes[1] && elemento.tag !== partes[1]) return false;
    return !partes[2] || (elemento.hasAttribute(partes[2]) &&
      (partes[3] === undefined || elemento.getAttribute(partes[2]) === partes[3]));
  }

  function descendentes(elemento) {
    return elemento.children.flatMap(filho => [filho, ...descendentes(filho)]);
  }

  function procurar(elemento, seletor) {
    const encontrados = [];
    for (const grupo of seletor.split(',')) {
      const passos = grupo.trim().split(/\s+/);
      let pais = [elemento];
      for (const passo of passos) {
        pais = pais.flatMap(pai => descendentes(pai).filter(filho => combina(filho, passo)));
      }
      for (const filho of pais) if (!encontrados.includes(filho)) encontrados.push(filho);
    }
    // querySelector retorna a ordem do documento, mesmo com uma lista de seletores.
    return descendentes(elemento).filter(filho => encontrados.includes(filho));
  }

  function agendar(fn, atraso, intervalo = 0) {
    const id = proximoId++;
    tarefas.set(id, { fn, quando: agora + atraso, intervalo });
    return id;
  }

  function elemento(tag, atributos = '') {
    const atributosLidos = {};
    for (const parte of atributos.matchAll(/([\w-]+)(?:="([^"]*)")?/g)) {
      atributosLidos[parte[1]] = parte[2] === undefined ? '' : parte[2];
    }
    const el = {
      tag, atributos: atributosLidos, children: [], parent: null, dataset: {},
      value: '', disabled: 'disabled' in atributosLidos,
      textContent: '', scrollTop: 0, scrollHeight: 100,
      setAttribute(nome, valor) { this.atributos[nome] = String(valor); },
      getAttribute(nome) { return this.atributos[nome] ?? null; },
      hasAttribute(nome) { return nome in this.atributos; },
      removeAttribute(nome) { delete this.atributos[nome]; },
      querySelector(seletor) { return procurar(this, seletor)[0] || null; },
      querySelectorAll(seletor) { return procurar(this, seletor); },
      closest(seletor) { return combina(this, seletor) ? this : this.parent?.closest(seletor) || null; },
      contains(filho) { return filho === this || descendentes(this).includes(filho); },
      focus() { documento.activeElement = this; },
      select() { this.selecionado = true; },
      getClientRects() {
        for (let pai = this; pai; pai = pai.parent) {
          if (pai.hidden || (pai.tag === 'dialog' && !pai.open)) return [];
        }
        return [{}];
      },
      checkValidity() { return opcoes.formularioValido !== false; },
      reportValidity() { this.validadeInformada = true; },
      reset() {
        if (this.onreset) this.onreset();
        for (const campo of descendentes(this)) campo.value = '';
      }
    };
    for (const nome in atributosLidos) {
      if (nome.startsWith('data-')) el.dataset[nome.slice(5)] = atributosLidos[nome];
    }
    const classes = () => new Set((el.atributos.class || '').split(' ').filter(Boolean));
    el.classList = {
      contains(nome) { return classes().has(nome); },
      add(nome) { const lista = classes(); lista.add(nome); el.atributos.class = [...lista].join(' '); },
      remove(nome) { const lista = classes(); lista.delete(nome); el.atributos.class = [...lista].join(' '); },
      toggle(nome, ativo) { if (ativo) this.add(nome); else this.remove(nome); }
    };
    Object.defineProperties(el, {
      id: { get() { return el.atributos.id; } },
      className: { get() { return el.atributos.class || ''; }, set(valor) { el.atributos.class = valor; } },
      open: {
        get() { return el.hasAttribute('open'); },
        set(valor) { if (valor) el.setAttribute('open', ''); else el.removeAttribute('open'); }
      },
      hidden: {
        get() { return el.hasAttribute('hidden'); },
        set(valor) { if (valor) el.setAttribute('hidden', ''); else el.removeAttribute('hidden'); }
      },
      isConnected: { get() { let pai = el; while (pai.parent) pai = pai.parent; return pai === documento; } },
      innerHTML: {
        get() { return el.markup || ''; },
        set(valor) {
          el.markup = valor;
          for (const filho of el.children) filho.parent = null;
          el.children = [];
          analisarHTML(valor, el);
        }
      }
    });
    if (tag === 'dialog' && !opcoes.semDialogoNativo) {
      el.showModal = function () { this.setAttribute('open', ''); };
      el.close = function () {
        this.removeAttribute('open');
        agendar(() => { if (this.onclose) this.onclose(); }, 0);
      };
    }
    return el;
  }

  function analisarHTML(html, pai) {
    const pilha = [pai];
    const semFilhos = new Set(['meta', 'link', 'input', 'img', 'source', 'br', 'hr', 'path', 'rect', 'line', 'circle', 'ellipse', 'stop']);
    for (const parte of html.matchAll(/<(\/)?([\w-]+)\b([^>]*)>/g)) {
      if (parte[1]) {
        if (pilha.length > 1 && pilha[pilha.length - 1].tag === parte[2]) pilha.pop();
        continue;
      }
      const filho = elemento(parte[2], parte[3]);
      filho.parent = pilha[pilha.length - 1];
      filho.parent.children.push(filho);
      if (!semFilhos.has(filho.tag) && !parte[3].endsWith('/')) pilha.push(filho);
    }
  }

  documento = elemento('document');
  analisarHTML(fs.readFileSync(path.join(raiz, opcoes.idioma === 'en' ? 'en' : '', arquivo + '.html'), 'utf8'), documento);
  documento.body = documento.querySelector('body');
  documento.activeElement = documento.body;
  documento.documentElement = documento.querySelector('html');
  documento.fullscreenEnabled = !opcoes.semTelaCheia;
  if (!opcoes.semTelaCheia) {
    documento.documentElement.requestFullscreen = () => {
      if (opcoes.telaCheiaLancaErro) throw new Error('Recurso não permitido');
      documento.fullscreenElement = documento.documentElement;
      return opcoes.telaCheiaSemPromise ? undefined : Promise.resolve();
    };
    documento.exitFullscreen = () => { documento.fullscreenElement = null; return Promise.resolve(); };
  }
  class RelogioFalso extends Date {
    constructor(...args) { super(...(args.length ? args : [1700000000000 + agora])); }
    static now() { return 1700000000000 + agora; }
  }
  const matematica = Object.create(Math);
  let numeroSorteio = 0;
  matematica.random = () => opcoes.sorteios ? opcoes.sorteios[numeroSorteio++ % opcoes.sorteios.length] : 0;
  const janela = {
    matchMedia: opcoes.semMatchMedia ? undefined : () => consultaMedia
  };
  const contexto = vm.createContext({
    document: documento, window: janela,
    Date: RelogioFalso, Math: matematica, console,
    setTimeout: (fn, ms) => agendar(fn, ms), clearTimeout: id => tarefas.delete(id),
    setInterval: (fn, ms) => agendar(fn, ms, ms), clearInterval: id => tarefas.delete(id),
    location: { reload() {} }
  });
  // A fixture respeita a mesma ordem dos scripts defer das páginas.
  const scripts = opcoes.idioma === 'en' ? ['dados/ingles', 'idioma'] : ['idioma'];
  for (const script of scripts) {
    new vm.Script(fs.readFileSync(path.join(raiz, 'scripts', script + '.js'), 'utf8'),
      { filename: script + '.js' }).runInContext(contexto);
  }
  const fonte = fs.readFileSync(path.join(raiz, 'scripts', arquivo + '.js'), 'utf8');
  new vm.Script(fonte, { filename: arquivo + '.js' }).runInContext(contexto);
  new vm.Script(fs.readFileSync(path.join(raiz, 'scripts/menu.js'), 'utf8'),
    { filename: 'menu.js' }).runInContext(contexto);
  const executar = texto => vm.runInContext(texto, contexto);
  const buscar = seletor => documento.querySelector(seletor);
  function avancar(ms) {
    const destino = agora + ms;
    while (true) {
      let proxima;
      for (const [id, tarefa] of tarefas) {
        if (tarefa.quando <= destino && (!proxima || tarefa.quando < proxima[1].quando)) proxima = [id, tarefa];
      }
      if (!proxima) break;
      const [id, tarefa] = proxima;
      agora = Math.max(agora, tarefa.quando);
      if (!tarefa.intervalo) tarefas.delete(id);
      tarefa.fn();
      if (tarefa.intervalo && tarefas.has(id)) tarefa.quando = agora + tarefa.intervalo;
    }
    agora = destino;
  }
  function enviar(valor) {
    const formulario = buscar('#painel-corpo form');
    formulario.querySelector('input').value = valor;
    buscar('#painel-corpo').onsubmit({ preventDefault() {}, target: formulario });
  }
  function clicarObjeto(id) { executar(`objetos[${JSON.stringify(id)}].interagir()`); }
  function clicarItem(id) {
    buscar('#inventario').onclick({ target: buscar(`#inventario [data-item="${id}"]`) });
  }
  return {
    executar, buscar, avancar, enviar, clicarObjeto, clicarItem, documento, tarefas,
    atrasar(ms) { agora += ms; },
    // Simula a propagação usada pelo projeto: document antes de window.
    // Cancelar o comportamento padrão não interrompe a propagação da tecla.
    evento(tipo, dados = {}) {
      const evento = { defaultPrevented: false, ...dados };
      const prevenirOriginal = evento.preventDefault;
      evento.preventDefault = function () {
        this.defaultPrevented = true;
        if (prevenirOriginal) prevenirOriginal.call(this);
      };
      const nomeEvento = 'on' + tipo;
      if (documento[nomeEvento]) documento[nomeEvento](evento);
      if (janela[nomeEvento]) janela[nomeEvento](evento);
    },
    redimensionarMenu(pequeno) {
      consultaMedia.matches = pequeno;
      if (!opcoes.semEventoMedia && consultaMedia.onchange) consultaMedia.onchange();
      if (janela.onresize) janela.onresize();
    }
  };
}

function partida(opcoes) {
  const a = criarAmbiente('jogo', opcoes);
  a.buscar('#btn-iniciar').onclick();
  a.buscar('#btn-pular').onclick();
  return a;
}

function resolverRota(a, toque = false) {
  a.clicarObjeto('calendario');
  a.clicarObjeto('gaveta'); a.enviar('1511');
  a.clicarObjeto('terminal'); a.enviar(' orbita ');
  a.executar("irPara('treino')");
  a.clicarObjeto('combo');
  for (let i = 0; i < 5; i++) {
    if (toque) a.buscar('#painel-corpo').onclick({ target: a.buscar('[data-tecla="ArrowUp"]') });
    else a.documento.onkeydown({ key: 'ArrowUp', preventDefault() {} });
  }
  a.clicarItem('pendrive'); a.clicarObjeto('pc'); a.executar('fecharPainel()');
  a.clicarObjeto('cofre'); a.enviar('739');
  a.executar("irPara('cozinha')"); a.clicarObjeto('geladeira'); a.enviar('042'); a.clicarItem('cartao');
  a.executar("irPara('servidores')"); a.clicarObjeto('fusiveis'); a.avancar(4200);
  for (let i = 0; i < 4; i++) a.executar('painelAtual.aoClicar(0)');
  a.clicarObjeto('rack'); a.executar("irPara('corredor')");
  a.clicarObjeto('fechadura'); a.enviar('264781');
}

function executarTestes() {
  const aprovados = [];
  function teste(nome, fn) { fn(); aprovados.push(nome); }
  teste('Introdução não consome tempo', () => {
    const a = criarAmbiente(); a.buscar('#btn-iniciar').onclick(); a.avancar(30000);
    assert.equal(a.executar('estado.tempo'), 300); assert.equal(a.tarefas.size, 0);
    for (let i = 0; i < a.executar('HISTORIA.length'); i++) a.buscar('#btn-proxima').onclick();
    assert.equal(a.executar('estado.rodando'), true);
  });
  for (const semDialogoNativo of [false, true]) {
    for (const toque of [false, true]) teste(`Percurso completo: dialog nativo=${!semDialogoNativo}, toque=${toque}`, () => {
      const a = partida({ semDialogoNativo }); resolverRota(a, toque); a.avancar(0);
      assert.equal(a.buscar('#final').dataset.tipo, 'perfeito'); assert.equal(a.tarefas.size, 0);
    });
  }
  teste('Aba atrasada reconcilia tempo decorrido', () => {
    const a = partida(); a.atrasar(61500); a.evento('visibilitychange');
    assert.equal(a.executar('estado.tempoRestanteMs'), 238500); assert.equal(a.executar('estado.tempo'), 239);
  });
  teste('Nenhum código é aceito depois do prazo em uma aba suspensa', () => {
    const a = partida(); a.clicarObjeto('gaveta'); a.atrasar(300001); a.enviar('1511');
    assert.equal(a.buscar('#final').dataset.tipo, 'capturado');
    assert.equal(a.executar("estado.inventario.includes('pendrive')"), false);
  });
  teste('Pausa preserva inclusive frações de segundo', () => {
    const a = partida(); a.avancar(550); a.executar('objetos.pc.mostrar()');
    a.buscar('#btn-calculadora-pc').onclick(); a.avancar(60000);
    assert.equal(a.executar('estado.tempoRestanteMs'), 299450);
    a.buscar('#btn-calculadora-pc').onclick(); a.avancar(450);
    a.executar('contarSegundo()'); assert.equal(a.executar('estado.tempo'), 299);
  });
  teste('Repetir abertura e fechamento não cria cronômetros duplicados', () => {
    const a = partida(); a.executar('objetos.pc.mostrar()');
    for (let i = 0; i < 20; i++) { a.buscar('#btn-calculadora-pc').onclick(); a.buscar('#btn-calculadora-pc').onclick(); }
    assert.equal(a.tarefas.size, 1); a.avancar(1000); assert.equal(a.executar('estado.tempo'), 299);
  });
  teste('Esc no painel alternativo libera a pausa e preserva o foco', () => {
    const a = partida({ semDialogoNativo: true }); a.buscar('#btn-diario').focus();
    a.executar('objetos.pc.mostrar()'); a.buscar('#btn-calculadora-pc').onclick();
    a.evento('keydown', { key: 'Escape', preventDefault() {} });
    assert.equal(a.executar('estado.pausaCalculo'), false); assert.equal(a.tarefas.size, 1);
    assert.equal(a.buscar('#fundo-dialogo').hidden, true);
    assert.equal(a.documento.activeElement.id, 'btn-diario');
  });
  teste('Tab permanece dentro do painel alternativo', () => {
    const a = partida({ semDialogoNativo: true }); a.executar('abrirDiario()');
    a.buscar('#btn-fechar-diario').focus(); a.evento('keydown', { key: 'Tab', preventDefault() {} });
    assert.equal(a.documento.activeElement.id, 'diario-registros');
    a.evento('keydown', { key: 'Tab', shiftKey: true, preventDefault() {} });
    assert.equal(a.documento.activeElement.id, 'btn-fechar-diario');
  });
  teste('Encerramento fecha diário e não mantém camadas pendentes', () => {
    const a = partida(); a.executar('abrirDiario()'); a.atrasar(300001); a.evento('pageshow'); a.avancar(0);
    assert.equal(a.buscar('#diario').open, false); assert.equal(a.buscar('#final').open, true); assert.equal(a.tarefas.size, 0);
  });
  teste('Falha fatal do terminal não bloqueia a gaveta após o fim', () => {
    const a = partida(); a.executar('estado.tempoRestanteMs = 15000');
    a.clicarObjeto('terminal'); a.enviar('x'); a.enviar('x');
    assert.equal(a.buscar('#final').dataset.tipo, 'capturado'); assert.equal(a.executar('objetos.gaveta.liberaEm'), null);
  });
  teste('Bilhete exige coleta; escapar com ele leva ao secreto', () => {
    const a = partida(); a.clicarObjeto('lixeira'); assert.equal(a.executar('estado.inventario.length'), 0);
    a.buscar('#btn-recolher-bilhete').onclick(); resolverRota(a); assert.equal(a.buscar('#final').dataset.tipo, 'secreto');
  });
  teste('Condições numéricas dos finais', () => {
    for (const [tempo, erros, esperado] of [[120000, 1, 'perfeito'], [119000, 0, 'sequelas'], [300000, 2, 'sequelas']]) {
      const a = partida(); a.executar(`estado.tempoRestanteMs=${tempo};estado.erros=${erros}`);
      a.clicarObjeto('fechadura'); a.enviar('264781'); assert.equal(a.buscar('#final').dataset.tipo, esperado);
    }
  });
  teste('Calculadora aceita os 16 grupos e rejeita entradas inválidas', () => {
    const a = partida(); a.executar('objetos.pc.mostrar()'); a.buscar('#btn-calculadora-pc').onclick();
    for (let n = 0; n < 16; n++) {
      a.buscar('#numero-binario').value = n.toString(2).padStart(4, '0');
      a.buscar('#form-binario').onsubmit({ preventDefault() {}, stopPropagation() {} });
      assert.ok(a.buscar('#resultado-binario').innerHTML.includes(`representa <strong>${n}</strong>`));
    }
    for (const invalido of ['', '01', '01010', '0121', '<script>']) {
      a.buscar('#numero-binario').value = invalido;
      a.buscar('#form-binario').onsubmit({ preventDefault() {}, stopPropagation() {} });
      assert.match(a.buscar('#resultado-binario').textContent, /exatamente quatro bits/);
    }
    a.avancar(10000); assert.equal(a.executar('estado.tempo'), 300);
  });
  teste('Fios cancelam animações ao fechar, inclusive eventos close atrasados', () => {
    const a = partida(); a.clicarObjeto('fusiveis'); a.executar('fecharPainel()'); a.clicarObjeto('gaveta'); a.avancar(5000);
    assert.equal(a.buscar('#painel').open, true); assert.ok(a.executar('painelAtual.aoEnviar'));
  });
  for (const opcoes of [{ semTelaCheia: true }, { telaCheiaLancaErro: true }, { telaCheiaSemPromise: true }]) {
    teste('Tela cheia opcional: ' + JSON.stringify(opcoes), () => { const a = partida(opcoes); a.executar('alternarTelaCheia()'); });
  }
  teste('Objetos e passagens também funcionam pela lista textual', () => {
    const a = partida(); const lista = a.buscar('#lista-acoes-cenario');
    lista.onclick({ target: a.buscar('#lista-acoes-cenario [data-obj="calendario"]') });
    assert.equal(a.executar('objetos.calendario.resolvido'), true);
    lista.onclick({ target: a.buscar('#lista-acoes-cenario [data-destino="treino"]') });
    assert.equal(a.executar('estado.cenario'), 'treino');
  });
  teste('Diário preserva texto, ambiente e ordem das descobertas', () => {
    const a = partida(); a.clicarObjeto('calendario'); a.executar("irPara('cozinha')");
    a.clicarObjeto('geladeira'); a.enviar('000'); a.executar('fecharPainel();abrirDiario()');
    const texto = a.buscar('#lista-log').innerHTML;
    assert.ok(texto.indexOf('geladeira incorreto') < texto.indexOf('Calendário:'));
    assert.match(texto, />Cozinha<\/p>/); assert.match(a.buscar('#diario-resumo').textContent, /1 falha$/);
  });
  teste('Sequências variadas de setas e fios preservam cada etapa', () => {
    const a = partida({ sorteios: [0, 0.25, 0.5, 0.99] }); a.clicarObjeto('combo');
    for (const tecla of ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowUp']) {
      a.buscar('#painel-corpo').onclick({ target: a.buscar(`[data-tecla="${tecla}"]`) });
    }
    assert.equal(a.executar('objetos.combo.resolvido'), true);
    a.clicarObjeto('fusiveis');
    for (const indice of [1, 2, 3, 0]) {
      a.avancar(800); assert.equal(a.buscar(`[data-fio="${indice}"]`).classList.contains('aceso'), true);
    }
    a.avancar(1000);
    for (const indice of [1, 2, 3, 0]) {
      a.buscar('#painel-corpo').onclick({ target: a.buscar(`[data-fio="${indice}"]`) });
    }
    assert.equal(a.executar('estado.energia'), true);
  });
  teste('Alternar rapidamente a calculadora não concede frações de tempo extras', () => {
    const a = partida(); a.executar('objetos.pc.mostrar()');
    for (let i = 0; i < 20; i++) {
      a.avancar(25); a.buscar('#btn-calculadora-pc').onclick();
      a.avancar(1000); a.buscar('#btn-calculadora-pc').onclick();
    }
    assert.equal(a.executar('estado.tempoRestanteMs'), 299500);
  });
  teste('Repetir o calendário não duplica pistas no diário', () => {
    const a = partida();
    for (let i = 0; i < 100; i++) a.clicarObjeto('calendario');
    assert.equal(a.executar('estado.diario.length'), 2);
  });
  teste('Carregamento concluído habilita controles e remove o aviso', () => {
    const a = criarAmbiente();
    assert.equal(a.buscar('#btn-iniciar').disabled, false);
    assert.equal(a.buscar('#btn-diario').disabled, false);
    assert.equal(a.buscar('#estado-carregamento').hidden, true);
  });
  teste('Geometria dos objetos e destinos das passagens são válidos', () => {
    const a = partida();
    const dados = JSON.parse(a.executar('JSON.stringify({cenarios: CENARIOS, objetos: objetos})'));
    for (const [id, sala] of Object.entries(dados.cenarios)) {
      for (const porta of sala.portas) {
        assert.ok(dados.cenarios[porta.destino]);
        assert.ok(dados.cenarios[porta.destino].portas.some(volta => volta.destino === id));
      }
    }
    for (const objeto of Object.values(dados.objetos)) {
      assert.ok(dados.cenarios[objeto.cenario]);
      const [x, y, largura, altura] = objeto.pos;
      assert.ok(x >= 0 && y >= 0 && largura > 0 && altura > 0 && x + largura <= 100 && y + altura <= 100);
    }
  });
  teste('Contato impede duplicação e permite cancelar sem resposta atrasada', () => {
    const a = criarAmbiente('contato'); a.buscar('#nome').value = 'Gabriel';
    a.buscar('#form-contato').onsubmit({ preventDefault() {} }); a.buscar('#form-contato').onsubmit({ preventDefault() {} });
    assert.equal(a.tarefas.size, 1); assert.equal(a.buscar('#enviar-contato').disabled, true);
    a.buscar('#form-contato').reset(); a.avancar(2000);
    assert.equal(a.buscar('#retorno').textContent, ''); assert.equal(a.buscar('#enviar-contato').disabled, false);
  });
  teste('Contato conclui a simulação e informa que não envia mensagens', () => {
    const a = criarAmbiente('contato'); a.buscar('#nome').value = ' Gabriel ';
    a.buscar('#mensagem').value = 'Teste'; a.buscar('#mensagem').oninput();
    a.buscar('#form-contato').onsubmit({ preventDefault() {} }); a.avancar(1200);
    assert.match(a.buscar('#retorno').textContent, /Obrigado, Gabriel!/);
    assert.match(a.buscar('#retorno').textContent, /Nenhuma mensagem foi enviada/);
    assert.equal(a.buscar('#contador').textContent, '0/500'); assert.equal(a.buscar('#enviar-contato').disabled, false);
  });
  teste('Contato respeita campos inválidos e nome vazio após remover espaços', () => {
    for (const opcoes of [{ formularioValido: false }, {}]) {
      const a = criarAmbiente('contato', opcoes); a.buscar('#nome').value = '   ';
      a.buscar('#form-contato').onsubmit({ preventDefault() {} }); assert.equal(a.tarefas.size, 0);
    }
  });
  teste('Arquivos locais, âncoras, IDs, metadados e SVGs referenciados', () => {
    const paginas = ['', 'en'].flatMap(pasta => fs.readdirSync(path.join(raiz, pasta))
      .filter(nome => nome.endsWith('.html')).map(nome => path.join(pasta, nome)));
    const descricoes = [];
    for (const arquivo of paginas) {
      const html = fs.readFileSync(path.join(raiz, arquivo), 'utf8');
      const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(p => p[1]);
      assert.equal(ids.length, new Set(ids).size, arquivo + ': ID repetido');
      const metas = [...html.matchAll(/<meta name="description" content="([^"]+)"/g)];
      assert.equal(metas.length, 1); descricoes.push(metas[0][1]);
      for (const referencia of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
        if (/^(https?:|mailto:|data:)/.test(referencia[1])) continue;
        const [destino, ancora] = referencia[1].split('#');
        const local = destino ? path.join(path.dirname(arquivo), destino.split('?')[0]) : arquivo;
        assert.ok(fs.existsSync(path.join(raiz, local)), arquivo + ': ' + local);
        if (ancora && local.endsWith('.html')) assert.ok(fs.readFileSync(path.join(raiz, local), 'utf8').includes(`id="${ancora}"`));
      }
    }
    assert.equal(descricoes.length, new Set(descricoes).size);
  });

  for (const semDialogoNativo of [false, true]) {
    for (const toque of [false, true]) teste('EN: percurso completo, dialog=' + !semDialogoNativo + ', toque=' + toque, () => {
      const a = partida({ idioma: 'en', semDialogoNativo });
      resolverRota(a, toque); a.avancar(0);
      assert.equal(a.buscar('#final').dataset.tipo, 'perfeito');
      assert.match(a.buscar('#final-titulo').textContent, /Perfect Escape/);
      assert.match(a.buscar('#final-resumo').textContent, /Time remaining: .*Mistakes: 0/);
      assert.ok(a.buscar('#final-imagem').src.startsWith('../assets/en/finais/'));
      assert.equal(a.tarefas.size, 0);
    });
  }
  teste('EN: introdução, nomes de cenários e pistas conservam códigos', () => {
    const a = criarAmbiente('jogo', { idioma: 'en' });
    a.buscar('#btn-iniciar').onclick();
    const falas = JSON.parse(a.executar('JSON.stringify(HISTORIA)'));
    for (let i = 0; i < falas.length; i++) {
      assert.notEqual(a.buscar('#dialogo-texto').textContent, falas[i].texto);
      assert.ok(a.buscar('#dialogo-retrato').src.startsWith('../assets/historia/'));
      a.buscar('#btn-proxima').onclick();
    }
    a.clicarObjeto('calendario');
    assert.match(a.buscar('#mensagem').textContent, /November 15.*ORBITA/);
    assert.equal(a.buscar('#nome-cenario').textContent, 'Kairo’s Bedroom');
    a.executar("irPara('cozinha')");
    assert.equal(a.buscar('#nome-cenario').textContent, 'Kitchen');
  });
  teste('EN: calculadora explica 16 grupos, valida entrada e pausa o tempo', () => {
    const a = partida({ idioma: 'en' }); a.executar('objetos.pc.mostrar()');
    assert.match(a.buscar('#painel-corpo').innerHTML, /File "safe.txt"/);
    assert.match(a.buscar('#painel-corpo').innerHTML, /0111  0011  1001/);
    assert.match(a.buscar('#painel-corpo').innerHTML, /Calculate and learn/);
    a.buscar('#btn-calculadora-pc').onclick();
    for (let n = 0; n < 16; n++) {
      a.buscar('#numero-binario').value = n.toString(2).padStart(4, '0');
      a.buscar('#form-binario').onsubmit({ preventDefault() {}, stopPropagation() {} });
      assert.ok(a.buscar('#resultado-binario').innerHTML.includes('represents <strong>' + n + '</strong> in decimal.'));
    }
    a.buscar('#numero-binario').value = '0121';
    a.buscar('#form-binario').onsubmit({ preventDefault() {}, stopPropagation() {} });
    assert.match(a.buscar('#resultado-binario').textContent, /exactly four bits/);
    a.avancar(60000); assert.equal(a.executar('estado.tempo'), 300);
    a.executar('fecharPainel()'); a.avancar(1000);
    assert.equal(a.executar('estado.tempo'), 299);
  });
  teste('EN: erros e diário traduzidos preservam as descobertas', () => {
    const a = partida({ idioma: 'en' }); a.clicarObjeto('calendario');
    a.clicarObjeto('gaveta'); a.enviar('0000');
    assert.equal(a.buscar('#painel-corpo [role="alert"]').textContent, 'Incorrect code.');
    a.enviar('1511');
    assert.match(a.buscar('#inventario').innerHTML, /USB drive/);
    a.executar('atualizarDiario()');
    const log = a.buscar('#lista-log').innerHTML;
    assert.match(log, /Mistake: incorrect drawer code/);
    assert.match(log, /Calendar:.*ORBITA/);
    assert.match(log, /Time remaining:/);
    assert.doesNotMatch(log, /Anotação|Tempo restante|Calendário|Gaveta/);
    assert.match(a.buscar('#diario-resumo').textContent, /entries in this run · 1 mistake$/);
  });
  teste('EN: coleta do bilhete leva ao final secreto traduzido', () => {
    const a = partida({ idioma: 'en' }); a.clicarObjeto('lixeira');
    assert.match(a.buscar('#painel-corpo').innerHTML, /Collect and read the note/);
    assert.equal(a.executar('estado.inventario.length'), 0);
    a.buscar('#btn-recolher-bilhete').onclick(); resolverRota(a);
    assert.equal(a.buscar('#final').dataset.tipo, 'secreto');
    assert.match(a.buscar('#final-titulo').textContent, /Secret/);
    assert.doesNotMatch(a.buscar('#final-texto').textContent, /Você|bilhete|segurança/);
  });
  teste('EN: os finais por falha e prazo continuam traduzidos', () => {
    const sequelas = partida({ idioma: 'en' });
    sequelas.executar('estado.erros=2'); resolverRota(sequelas);
    assert.equal(sequelas.buscar('#final').dataset.tipo, 'sequelas');
    assert.match(sequelas.buscar('#final-titulo').textContent, /Consequences/);
    const capturado = partida({ idioma: 'en' }); capturado.atrasar(300001); capturado.evento('pageshow');
    assert.equal(capturado.buscar('#final').dataset.tipo, 'capturado');
    assert.match(capturado.buscar('#final-titulo').textContent, /Caught/);
  });
  teste('EN: contato não traduz o nome digitado e informa a simulação', () => {
    const a = criarAmbiente('contato', { idioma: 'en' });
    a.buscar('#nome').value = 'Cozinha Gabriel';
    a.buscar('#form-contato').onsubmit({ preventDefault() {} });
    assert.equal(a.buscar('#retorno').textContent, 'Sending...');
    a.avancar(1200);
    assert.match(a.buscar('#retorno').textContent, /Thank you, Cozinha Gabriel!/);
    assert.match(a.buscar('#retorno').textContent, /No message was sent/);
  });
  teste('PT e EN: seletor, idioma declarado e ordem dos scripts', () => {
    for (const arquivo of fs.readdirSync(raiz).filter(nome => nome.endsWith('.html'))) {
      for (const ingles of [false, true]) {
        const html = fs.readFileSync(path.join(raiz, ingles ? 'en' : '', arquivo), 'utf8');
        assert.ok(html.includes('<html lang="' + (ingles ? 'en' : 'pt-BR') + '">'));
        const seletor = html.match(/<nav class="seletor-idioma"[\s\S]*?<\/nav>/)[0];
        assert.equal((seletor.match(/aria-current="true"/g) || []).length, 1);
        assert.ok(seletor.includes('href="' + (ingles ? '../' : 'en/') + arquivo + '"'));
        if (['jogo.html', 'contato.html'].includes(arquivo)) {
          const scripts = [...html.matchAll(/<script src="([^"?]+)/g)].map(parte => path.basename(parte[1]));
          assert.deepEqual(scripts, ingles ? ['ingles.js', 'idioma.js', arquivo.replace('.html', '.js'), 'menu.js'] :
            ['idioma.js', arquivo.replace('.html', '.js'), 'menu.js']);
        }
      }
    }
  });


  teste('Menu inicia recolhido no celular e aberto no desktop', () => {
    for (const idioma of ['pt', 'en']) {
      const celular = criarAmbiente('contato', { idioma, menuPequeno: true });
      assert.equal(celular.buscar('.menu-navegacao').open, false);
      const desktop = criarAmbiente('contato', { idioma });
      assert.equal(desktop.buscar('.menu-navegacao').open, true);
    }
  });
  teste('Menu fecha com Escape e preserva foco ao mudar de largura', () => {
    const a = criarAmbiente('contato', { menuPequeno: true });
    const menu = a.buscar('.menu-navegacao');
    menu.open = true; menu.querySelector('a').focus();
    a.evento('keydown', { key: 'Escape' });
    assert.equal(menu.open, false);
    assert.equal(a.documento.activeElement, menu.querySelector('summary'));
    a.redimensionarMenu(false); assert.equal(menu.open, true);
    menu.querySelector('a').focus(); a.redimensionarMenu(true);
    assert.equal(menu.open, false);
    assert.equal(a.documento.activeElement, menu.querySelector('summary'));
  });
  teste('Menu mantém links disponíveis sem matchMedia e usa redimensionamento como alternativa', () => {
    const semAPI = criarAmbiente('contato', { semMatchMedia: true });
    assert.equal(semAPI.buscar('.menu-navegacao').open, true);
    const legado = criarAmbiente('contato', { menuPequeno: true, semEventoMedia: true });
    assert.equal(legado.buscar('.menu-navegacao').open, false);
    legado.redimensionarMenu(false); assert.equal(legado.buscar('.menu-navegacao').open, true);
  });
  teste('Briefing e história não exibem painel; início revela controles e inventário', () => {
    const a = criarAmbiente();
    assert.equal(a.buscar('.status').hidden, true);
    a.buscar('#btn-iniciar').onclick();
    assert.equal(a.buscar('.status').hidden, true);
    assert.equal(a.tarefas.size, 0);
    a.buscar('#btn-pular').onclick();
    assert.equal(a.buscar('.status').hidden, false);
    assert.ok(a.buscar('.interface-jogo').classList.contains('em-partida'));
    assert.ok(a.buscar('#inventario').closest('.status'));
    assert.equal(a.tarefas.size, 1);
  });
  for (const idioma of ['pt', 'en']) teste('Fios por etapas preservam memória, tempo e idioma: ' + idioma, () => {
    const a = partida({ idioma, sorteios: [0.25, 0.5, 0.5, 0] });
    a.clicarObjeto('fusiveis');
    a.buscar('#btn-passo-fios').onclick();
    const status = a.buscar('#painel-corpo [role="status"]');
    assert.match(status.textContent, idioma === 'en' ? /^Wire 1: green$/ : /^Fio 1: verde$/);
    a.avancar(10000);
    assert.equal(a.executar('estado.tempo'), 290);
    assert.match(status.textContent, idioma === 'en' ? /^Wire 1: green$/ : /^Fio 1: verde$/);
    assert.equal(a.buscar('[data-fio="1"]').disabled, true);
    a.executar('painelAtual.aoClicar(1)');
    assert.equal(a.executar('estado.energia'), false);
    for (let i = 0; i < 3; i++) a.buscar('#btn-passo-fios').onclick();
    assert.equal(a.buscar('#btn-passo-fios').textContent, idioma === 'en' ? 'Start attempt' : 'Iniciar tentativa');
    assert.equal(a.executar('estado.energia'), false);
    a.buscar('#btn-passo-fios').onclick();
    assert.equal(a.buscar('#btn-passo-fios').disabled, true);
    assert.equal(a.buscar('#painel-corpo .aceso'), null);
    assert.doesNotMatch(status.textContent, /Fio 4|Wire 4/);
    assert.equal(a.documento.activeElement, a.buscar('[data-fio="0"]'));
    for (const indice of [1, 2, 2, 0]) a.executar('painelAtual.aoClicar(' + indice + ')');
    assert.equal(a.executar('estado.energia'), true);
  });
  teste('Repetir fios cancela animação anterior e reinicia a tentativa', () => {
    const a = partida(); a.clicarObjeto('fusiveis'); a.avancar(900);
    a.buscar('#btn-repetir-fios').onclick(); a.avancar(500);
    assert.equal(a.buscar('#painel-corpo .aceso'), null);
    assert.match(a.buscar('#painel-corpo [role="status"]').textContent, /Memorize/);
    a.avancar(3700);
    assert.equal(a.buscar('[data-fio="0"]').disabled, false);
    a.executar('painelAtual.aoClicar(0)');
    a.buscar('#btn-repetir-fios').onclick();
    assert.equal(a.buscar('[data-fio="0"]').disabled, true);
    assert.equal(a.executar('estado.energia'), false);
  });
  teste('Erro no modo por etapas mantém o modo e aplica a penalidade', () => {
    const a = partida(); a.clicarObjeto('fusiveis');
    for (let i = 0; i < 5; i++) a.buscar('#btn-passo-fios').onclick();
    a.executar('painelAtual.aoClicar(1)');
    assert.equal(a.executar('estado.erros'), 1);
    assert.equal(a.executar('estado.tempo'), 290);
    assert.equal(a.buscar('#btn-passo-fios').textContent, 'Próximo sinal');
    a.avancar(5000);
    assert.match(a.buscar('#painel-corpo [role="status"]').textContent, /Avance um sinal/);
    assert.equal(a.buscar('[data-fio="0"]').disabled, true);
  });
  teste('Fechamento e prazo encerram a consulta dos fios com segurança', () => {
    const a = partida(); a.clicarObjeto('fusiveis'); a.buscar('#btn-passo-fios').onclick();
    a.executar('fecharPainel()'); a.avancar(0);
    assert.equal(a.tarefas.size, 1);
    a.clicarObjeto('fusiveis'); a.buscar('#btn-passo-fios').onclick();
    a.atrasar(300001); a.buscar('#btn-repetir-fios').onclick(); a.avancar(0);
    assert.equal(a.buscar('#final').dataset.tipo, 'capturado');
    assert.equal(a.executar('estado.energia'), false);
    assert.equal(a.tarefas.size, 0);
  });


  teste('Escape do diálogo não transfere o foco para o menu ao fundo', () => {
    const a = partida({ menuPequeno: true });
    const menu = a.buscar('.menu-navegacao'); menu.open = true;
    a.clicarObjeto('gaveta');
    a.buscar('#painel-corpo input').focus();
    a.evento('keydown', { key: 'Escape', defaultPrevented: false });
    assert.equal(menu.open, true);
    assert.equal(a.documento.activeElement, a.buscar('#painel-corpo input'));
  });

  teste('Teclado continua atendendo diário e menu depois do minigame', () => {
    const a = partida({ semDialogoNativo: true, menuPequeno: true });
    const menu = a.buscar('.menu-navegacao');
    menu.open = true;
    a.clicarObjeto('combo');
    for (let i = 0; i < 5; i++) a.evento('keydown', { key: 'ArrowUp' });
    assert.equal(a.executar('objetos.combo.resolvido'), true);
    a.executar('abrirDiario()');
    a.buscar('#btn-fechar-diario').focus();
    a.evento('keydown', { key: 'Tab' });
    assert.equal(a.documento.activeElement.id, 'diario-registros');
    a.evento('keydown', { key: 'Escape' });
    assert.equal(a.buscar('#diario').open, false);
    assert.equal(menu.open, true);
    a.evento('keydown', { key: 'Escape' });
    assert.equal(menu.open, false);
    assert.equal(a.documento.activeElement, menu.querySelector('summary'));
  });
  teste('Redimensionar dentro da mesma faixa preserva a escolha de abrir o menu', () => {
    const a = criarAmbiente('contato', { menuPequeno: true });
    const menu = a.buscar('.menu-navegacao');
    menu.open = true;
    a.redimensionarMenu(true);
    assert.equal(menu.open, true);
    a.redimensionarMenu(false);
    a.redimensionarMenu(true);
    assert.equal(menu.open, false);
  });

  return { total: aprovados.length, aprovados };
}

module.exports = { executarTestes, criarAmbiente, partida, resolverRota };
if (require.main === module) console.log(JSON.stringify(executarTestes(), null, 2));
