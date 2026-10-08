'use strict';

/* =========================================================
   PROTOCOLO KAIRO - Escape Room 
   Estrutura: estado global > dados > objetos interativos > UI > fim
   ========================================================= */

const TEMPO_TOTAL = 300; // 5 minutos
const PENALIDADE_ERRO = 10; // segundos perdidos por erro

// Respostas (ficam aqui para facilitar o balanceamento)
const CODIGOS = {
  gaveta: '1511',
  terminal: 'ORBITA',
  geladeira: '042',
  cofre: '739',
  fechadura: '264781' // 26 (terminal) + 47 (rack) + 81 (cofre)
};

const estado = {
  tempo: TEMPO_TOTAL,
  erros: 0,
  cenario: 'quarto',
  inventario: [],
  log: [],
  selecionado: null,
  energia: false,
  rodando: false,
  fim: false,
  timer: null
};

const $ = (seletor) => document.querySelector(seletor);
const formatarTempo = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

/* ---------- Itens (vetor/objeto de textos) ---------- */
const ITENS = {
  pendrive: { nome: 'Pen drive', descricao: 'Pen drive preto com a etiqueta "treino". Deve abrir em algum PC.' },
  cartao: { nome: 'Cartão de acesso', descricao: 'Cartão magnético com a sigla SRV. Parece servir para a sala de servidores.' },
  bilhete: { nome: 'Bilhete do Kairo', descricao: 'Bilhete dobrado: "Fui por vontade própria. Se achar isto, não chame a segurança."' }
};

/* ---------- Cenários ---------- */
const CENARIOS = {
  quarto: {
    nome: 'Quarto do Kairo',
    portas: [{ destino: 'treino', pos: [88, 30, 10, 50] }]
  },
  treino: {
    nome: 'Sala de Treino',
    portas: [
      { destino: 'quarto', pos: [1, 10, 8, 40] },
      { destino: 'cozinha', pos: [88, 8, 10, 40] },
      { destino: 'servidores', pos: [44, 78, 18, 18] }
    ]
  },
  cozinha: {
    nome: 'Cozinha',
    dica: 'Algo reflete uma luz fraca perto do rodapé...',
    portas: [{ destino: 'treino', pos: [88, 10, 10, 45] }]
  },
  servidores: {
    nome: 'Sala de Servidores',
    portas: [
      { destino: 'treino', pos: [1, 78, 18, 18] },
      { destino: 'corredor', pos: [86, 15, 12, 50] }
    ]
  },
  corredor: {
    nome: 'Corredor de Saída',
    portas: [{ destino: 'servidores', pos: [2, 20, 12, 50] }]
  }
};

/* ---------- Mensagens, log, erros ---------- */
function mensagem(texto) {
  $('#mensagem').textContent = texto;
}

function registrar(texto) {
  estado.log.push({ quando: formatarTempo(estado.tempo), texto });
  mensagem(texto);
  renderLog();
  atualizarMarcas();
}

function erro(motivo) {
  if (estado.fim) return;
  estado.erros++;
  estado.tempo = Math.max(0, estado.tempo - PENALIDADE_ERRO);
  $('#erros').textContent = String(estado.erros);
  atualizarRelogio();
  registrar(`Erro: ${motivo} (-${PENALIDADE_ERRO} s)`);
  if (estado.tempo === 0) finalizar('capturado');
}

function renderLog() {
  const lista = $('#lista-log');
  lista.replaceChildren();
  estado.log.forEach((item) => {
    const li = document.createElement('li');
    li.textContent = `[${item.quando}] ${item.texto}`;
    lista.append(li);
  });
}

/* ---------- Inventário ---------- */
function adicionarItem(id) {
  if (!estado.inventario.includes(id)) estado.inventario.push(id);
  renderInventario();
}

function renderInventario() {
  const ul = $('#inventario');
  ul.replaceChildren();
  if (estado.inventario.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'Vazio.';
    ul.append(li);
    return;
  }
  estado.inventario.forEach((id) => {
    const li = document.createElement('li');
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = ITENS[id].nome;
    b.setAttribute('aria-pressed', String(estado.selecionado === id));
    b.addEventListener('click', () => {
      estado.selecionado = estado.selecionado === id ? null : id;
      mensagem(estado.selecionado
        ? `${ITENS[id].nome} selecionado. ${ITENS[id].descricao} Clique em um objeto para usá-lo.`
        : 'Item desselecionado.');
      renderInventario();
    });
    li.append(b);
    ul.append(li);
  });
}

/* ---------- Painel (dialog nativo = acessível, Esc fecha) ---------- */
let aoFecharPainel = null;

function abrirPainel(titulo, conteudo, aoFechar) {
  $('#painel-titulo').textContent = titulo;
  $('#painel-corpo').replaceChildren(conteudo);
  aoFecharPainel = aoFechar || null;
  $('#painel').showModal();
}

function fecharPainel() {
  const p = $('#painel');
  if (p.open) p.close();
}

function formularioCodigo(rotulo, tamanho, aoEnviar) {
  const form = document.createElement('form');
  const label = document.createElement('label');
  const campo = document.createElement('input');
  campo.type = 'text';
  campo.required = true;
  campo.autocomplete = 'off';
  campo.maxLength = tamanho;
  label.append(`${rotulo} `, campo);
  const enviar = document.createElement('button');
  enviar.type = 'submit';
  enviar.textContent = 'Confirmar';
  const fb = document.createElement('p');
  fb.setAttribute('role', 'alert');
  form.append(label, enviar, fb);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const resposta = aoEnviar(campo.value.trim().toUpperCase());
    fb.textContent = resposta || '';
    if (!resposta) fecharPainel();
    else campo.select();
  });
  return form;
}

/* =========================================================
   OBJETOS INTERATIVOS (10 enigmas + 1 oculto)
   pos = [left%, top%, largura%, altura%]
   ========================================================= */
const objetos = {
  // 1 - Calendário: pista da data e da senha do terminal
  calendario: {
    cenario: 'quarto', nome: 'Calendário da final', pos: [6, 12, 16, 26],
    inspecionado: false, resolvido: false,
    interagir() {
      this.inspecionado = this.resolvido = true;
      registrar('Calendário: a final é dia 15/11. Um post-it colado diz: "senha do terminal = ORBITA".');
    }
  },

  // 2 - Gaveta com cadeado numérico (pode ser travada pelo terminal)
  gaveta: {
    cenario: 'quarto', nome: 'Gaveta com cadeado', pos: [60, 62, 22, 18],
    resolvido: false, liberaEm: null,
    bloqueada() { return this.liberaEm !== null && estado.tempo > this.liberaEm; },
    bloquear() {
      this.liberaEm = estado.tempo - 45;
      registrar('A gaveta eletrônica travou por 45 segundos (erros no terminal).');
    },
    interagir() {
      if (this.resolvido) return mensagem('A gaveta está vazia.');
      if (this.bloqueada()) return mensagem('Gaveta travada pelo sistema. Aguarde alguns segundos.');
      abrirPainel('Gaveta com cadeado', formularioCodigo('Código de 4 dígitos:', 4, (v) => {
        if (v !== CODIGOS.gaveta) { erro('código da gaveta incorreto'); return 'Código incorreto.'; }
        this.resolvido = true;
        adicionarItem('pendrive');
        registrar('Gaveta aberta. Você pegou um pen drive.');
        return null;
      }));
    }
  },

  // 3 - Terminal: errar 2x trava a gaveta
  terminal: {
    cenario: 'quarto', nome: 'Terminal do quarto', pos: [38, 38, 18, 24],
    resolvido: false, falhas: 0,
    interagir() {
      if (this.resolvido) return mensagem('Terminal já liberado. Veja o diário de bordo.');
      abrirPainel('Terminal do quarto', formularioCodigo('Senha:', 12, (v) => {
        if (v !== CODIGOS.terminal) {
          this.falhas++;
          erro('senha do terminal incorreta');
          if (this.falhas % 2 === 0) objetos.gaveta.bloquear();
          return 'Senha incorreta.';
        }
        this.resolvido = true;
        registrar('Terminal liberado. Log: "cadeado da geladeira = 042". Fragmento de PIN: 26.');
        return null;
      }));
    }
  },

  // 4 - Minigame de TECLADO: sequência aleatória de setas
  combo: {
    cenario: 'treino', nome: 'Painel de comandos', pos: [8, 55, 20, 22],
    resolvido: false,
    interagir() {
      if (this.resolvido) return mensagem('O painel já está liberado.');
      const teclas = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
      const setas = { ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→' };
      const alvo = Array.from({ length: 5 }, () => teclas[Math.floor(Math.random() * teclas.length)]);
      let i = 0;
      const instr = document.createElement('p');
      instr.textContent = 'Digite a sequência usando as setas do teclado. Errou uma tecla, recomeça.';
      const seq = document.createElement('p');
      seq.className = 'sequencia';
      seq.setAttribute('role', 'status');
      const desenhar = () => {
        seq.textContent = alvo.map((t, n) => (n < i ? 'OK' : setas[t])).join(' ');
      };
      const aoTecla = (e) => {
        if (!teclas.includes(e.key)) return;
        e.preventDefault();
        if (e.key === alvo[i]) {
          i++;
          desenhar();
          if (i === alvo.length) {
            this.resolvido = true;
            fecharPainel();
            registrar('Painel de comandos liberado: o PC do setup agora aceita mídia.');
          }
        } else {
          i = 0;
          desenhar();
        }
      };
      desenhar();
      document.addEventListener('keydown', aoTecla);
      const caixa = document.createElement('div');
      caixa.append(instr, seq);
      abrirPainel('Painel de comandos', caixa, () => document.removeEventListener('keydown', aoTecla));
    }
  },

  // 5 - PC: usa o pen drive e mostra mensagem em binário
  pc: {
    cenario: 'treino', nome: 'PC do setup', pos: [38, 30, 24, 30],
    resolvido: false,
    mostrar() {
      const caixa = document.createElement('div');
      const p1 = document.createElement('p');
      p1.textContent = 'Arquivo "cofre.txt" (cada grupo de 4 bits é um dígito, de 0 a 9):';
      const bin = document.createElement('pre');
      bin.textContent = '0111  0011  1001';
      caixa.append(p1, bin);
      abrirPainel('PC do setup', caixa);
    },
    interagir() {
      if (!objetos.combo.resolvido) return mensagem('O PC está bloqueado. O painel de comandos ao lado parece controlá-lo.');
      if (this.resolvido) return this.mostrar();
      if (estado.selecionado !== 'pendrive') return mensagem('O PC pede uma mídia. Selecione um item no inventário e use-o aqui.');
      this.resolvido = true;
      registrar('PC aberto com o pen drive: um arquivo em binário (0111 0011 1001).');
      this.mostrar();
    }
  },

  // 6 - Geladeira: cadeado de 3 dígitos
  geladeira: {
    cenario: 'cozinha', nome: 'Geladeira com cadeado', pos: [10, 15, 22, 60],
    resolvido: false,
    interagir() {
      if (this.resolvido) return mensagem('A geladeira está aberta. Só sobrou energético.');
      abrirPainel('Geladeira', formularioCodigo('Código de 3 dígitos:', 3, (v) => {
        if (v !== CODIGOS.geladeira) { erro('código da geladeira incorreto'); return 'Código incorreto.'; }
        this.resolvido = true;
        adicionarItem('cartao');
        registrar('Geladeira aberta. Dentro de uma marmita, um cartão de acesso.');
        return null;
      }));
    }
  },

  // 7 - Minigame de CLIQUE: memória de fios (ordem aleatória)
  fusiveis: {
    cenario: 'servidores', nome: 'Quadro de fusíveis', pos: [8, 20, 22, 40],
    resolvido: false,
    interagir() {
      if (this.resolvido) return mensagem('A energia já foi restabelecida.');
      const cores = ['vermelho', 'verde', 'azul', 'amarelo'];
      const alvo = Array.from({ length: 4 }, () => Math.floor(Math.random() * cores.length));
      let i = 0;
      let aceitando = false;
      const timers = [];
      const status = document.createElement('p');
      status.setAttribute('role', 'status');
      const grade = document.createElement('div');
      grade.className = 'fios';
      const botoes = cores.map((cor, n) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = `fio fio-${cor}`;
        b.textContent = cor;
        b.addEventListener('click', () => clicar(n));
        return b;
      });
      grade.append(...botoes);

      const mostrarSequencia = () => {
        aceitando = false;
        i = 0;
        status.textContent = 'Memorize a ordem dos fios...';
        alvo.forEach((n, k) => {
          timers.push(setTimeout(() => {
            botoes[n].classList.add('aceso');
            status.textContent = `Fio ${k + 1}: ${cores[n]}`;
          }, 800 * (k + 1)));
          timers.push(setTimeout(() => botoes[n].classList.remove('aceso'), 800 * (k + 1) + 450));
        });
        timers.push(setTimeout(() => {
          aceitando = true;
          status.textContent = 'Sua vez: clique na mesma ordem.';
        }, 800 * alvo.length + 900));
      };

      const clicar = (n) => {
        if (!aceitando) return;
        if (n === alvo[i]) {
          i++;
          if (i === alvo.length) {
            this.resolvido = true;
            estado.energia = true;
            fecharPainel();
            registrar('Energia restabelecida na sala de servidores.');
          }
        } else {
          aceitando = false;
          erro('fio errado no quadro de fusíveis');
          if (!estado.fim) mostrarSequencia();
        }
      };

      const caixa = document.createElement('div');
      caixa.append(status, grade);
      abrirPainel('Quadro de fusíveis', caixa, () => timers.forEach(clearTimeout));
      mostrarSequencia();
    }
  },

  // 8 - Rack: precisa de energia e do cartão selecionado
  rack: {
    cenario: 'servidores', nome: 'Rack de servidores', pos: [40, 15, 26, 55],
    resolvido: false,
    interagir() {
      if (this.resolvido) return mensagem('O rack já entregou o que tinha.');
      if (!estado.energia) return mensagem('O rack está sem energia. Há um quadro de fusíveis na sala.');
      if (estado.selecionado !== 'cartao') return mensagem('O leitor pede um cartão. Selecione-o no inventário e use-o aqui.');
      this.resolvido = true;
      registrar('Rack acessado. Na tela: "fragmento de PIN: 47".');
    }
  },

  // 9 - Cofre do troféu: código vem do binário
  cofre: {
    cenario: 'treino', nome: 'Cofre do troféu', pos: [70, 55, 18, 26],
    resolvido: false,
    interagir() {
      if (this.resolvido) return mensagem('O cofre está aberto. O troféu falso brilha lá dentro.');
      abrirPainel('Cofre do troféu', formularioCodigo('Código de 3 dígitos:', 3, (v) => {
        if (v !== CODIGOS.cofre) { erro('código do cofre incorreto'); return 'Código incorreto.'; }
        this.resolvido = true;
        registrar('Cofre aberto. Um papel: "fragmento de PIN: 81".');
        return null;
      }));
    }
  },

  // 10 - Fechadura final: PIN = 26 + 47 + 81
  fechadura: {
    cenario: 'corredor', nome: 'Fechadura programável', pos: [40, 18, 20, 40],
    resolvido: false,
    interagir() {
      abrirPainel('Fechadura programável', formularioCodigo('PIN de 6 dígitos:', 6, (v) => {
        if (v !== CODIGOS.fechadura) { erro('PIN incorreto na fechadura'); return 'PIN incorreto.'; }
        this.resolvido = true;
        registrar('Fechadura reprogramada. A porta se abre.');
        decidirFinal();
        return null;
      }));
    }
  },

  // Objeto oculto (final secreto)
  adesivo: {
    cenario: 'cozinha', nome: 'Adesivo suspeito atrás da lixeira', pos: [86, 86, 4, 6],
    oculto: true, resolvido: false,
    interagir() {
      if (this.resolvido) return mensagem('Só restou a marca do adesivo.');
      this.resolvido = true;
      adicionarItem('bilhete');
      registrar('Atrás do adesivo havia um bilhete: "Fui por vontade própria. Se achar isto, não chame a segurança."');
    }
  }
};
Object.entries(objetos).forEach(([id, o]) => { o.id = id; });

/* =========================================================
   CENÁRIO (hotspots são <button>: funcionam com teclado)
   ========================================================= */
function criarHotspot(rotulo, pos, classe, dataId, acao) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = `hotspot ${classe}`;
  b.style.left = `${pos[0]}%`;
  b.style.top = `${pos[1]}%`;
  b.style.width = `${pos[2]}%`;
  b.style.height = `${pos[3]}%`;
  b.setAttribute('aria-label', rotulo);
  if (dataId) b.dataset.obj = dataId;
  const span = document.createElement('span');
  span.textContent = rotulo;
  b.append(span);
  b.addEventListener('click', acao);
  return b;
}

function renderCenario() {
  const c = CENARIOS[estado.cenario];
  const area = $('#cenario');
  area.className = `cenario cena-${estado.cenario}`;
  $('#nome-cenario').textContent = c.nome;
  area.replaceChildren();

  c.portas.forEach((p) => {
    area.append(criarHotspot(`Ir para: ${CENARIOS[p.destino].nome}`, p.pos, 'porta', null, () => {
      if (estado.fim) return;
      estado.cenario = p.destino;
      renderCenario();
      const dica = CENARIOS[p.destino].dica;
      const achado = objetos.adesivo.resolvido;
      mensagem(`Você entrou em: ${CENARIOS[p.destino].nome}. ${dica && !achado ? dica : ''}`);
      $('#nome-cenario').focus();
    }));
  });

  Object.values(objetos)
    .filter((o) => o.cenario === estado.cenario)
    .forEach((o) => {
      area.append(criarHotspot(o.nome, o.pos, o.oculto ? 'oculto' : 'objeto', o.id, () => {
        if (!estado.fim) o.interagir();
      }));
    });
  atualizarMarcas();
}

function atualizarMarcas() {
  document.querySelectorAll('#cenario [data-obj]').forEach((b) => {
    b.classList.toggle('feito', Boolean(objetos[b.dataset.obj].resolvido));
  });
}

/* ---------- Relógio ---------- */
function atualizarRelogio() {
  const el = $('#relogio');
  el.textContent = formatarTempo(estado.tempo);
  el.classList.toggle('urgente', estado.tempo <= 60);
}

function iniciar() {
  estado.rodando = true;
  $('#intro').hidden = true;
  $('#jogo').hidden = false;
  renderCenario();
  renderInventario();
  registrar('Lockdown ativado. Você tem 5 minutos para reprogramar a fechadura antes da segurança chegar.');
  estado.timer = setInterval(() => {
    estado.tempo--;
    atualizarRelogio();
    if (estado.tempo <= 0) finalizar('capturado');
  }, 1000);
}

/* =========================================================
   FINAIS
   ========================================================= */
const FINAIS = {
  perfeito: {
    titulo: 'Final: Fuga Perfeita',
    texto: 'Você reprogramou a fechadura com tempo de sobra, saiu sem acionar nada e a segurança chegou a um corredor vazio.'
  },
  sequelas: {
    titulo: 'Final: Fuga com Sequelas',
    texto: 'Você saiu, mas os erros e a demora dispararam o alarme parcial. Câmeras gravaram seu rosto e a organização vai pedir explicações.'
  },
  capturado: {
    titulo: 'Final: Capturado',
    texto: 'O relógio zerou. A segurança abriu a porta e encontrou um técnico de TI, um quarto revirado e nenhuma explicação.'
  },
  secreto: {
    titulo: 'Final Secreto: Ele Quis Sumir',
    texto: 'Com o bilhete em mãos você entende: Kairo fugiu por vontade própria. Você sai e apaga os registros da fechadura. Ninguém jamais saberá onde ele está.'
  }
};

function decidirFinal() {
  if (estado.inventario.includes('bilhete')) return finalizar('secreto');
  if (estado.tempo >= 120 && estado.erros <= 1) return finalizar('perfeito');
  return finalizar('sequelas');
}

function finalizar(tipo) {
  if (estado.fim) return;
  estado.fim = true;
  clearInterval(estado.timer);
  fecharPainel();
  $('#final-titulo').textContent = FINAIS[tipo].titulo;
  $('#final-texto').textContent = FINAIS[tipo].texto;
  $('#final-resumo').textContent = `Tempo restante: ${formatarTempo(estado.tempo)} | Erros: ${estado.erros}`;
  $('#final').showModal();
}

/* =========================================================
   EVENTOS
   ========================================================= */
$('#btn-iniciar').addEventListener('click', iniciar);
$('#btn-diario').addEventListener('click', () => $('#diario').showModal());
$('#btn-fechar-diario').addEventListener('click', () => $('#diario').close());
$('#btn-fechar-painel').addEventListener('click', fecharPainel);
$('#btn-reiniciar').addEventListener('click', () => location.reload());
$('#painel').addEventListener('close', () => {
  if (aoFecharPainel) {
    aoFecharPainel();
    aoFecharPainel = null;
  }
});
$('#final').addEventListener('cancel', (e) => e.preventDefault());
atualizarRelogio();