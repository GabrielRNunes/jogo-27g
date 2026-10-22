'use strict';

/* =========================================================
   PROTOCOLO KAIRO - Escape Room (JS puro)
   Estrutura: estado global > dados > objetos interativos > UI > fim

   Telas montadas com template literals + innerHTML.
   Eventos com propriedades on... (onclick, onsubmit, onkeydown,
   onclose) e delegação de eventos nos containers.
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

/* ---------- Itens (objeto de textos) ---------- */
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
  $('#lista-log').innerHTML = estado.log
    .map((item) => `<li>[${item.quando}] ${item.texto}</li>`)
    .join('');
}

/* ---------- Inventário ---------- */
function adicionarItem(id) {
  if (!estado.inventario.includes(id)) estado.inventario.push(id);
  renderInventario();
}

function renderInventario() {
  $('#inventario').innerHTML = estado.inventario.length === 0
    ? '<li>Vazio.</li>'
    : estado.inventario
      .map((id) => `<li><button type="button" data-item="${id}" aria-pressed="${estado.selecionado === id}">${ITENS[id].nome}</button></li>`)
      .join('');
}

// Delegação: um único onclick para todos os botões do inventário
$('#inventario').onclick = (e) => {
  const botao = e.target.closest('[data-item]');
  if (!botao) return;
  const id = botao.dataset.item;
  estado.selecionado = estado.selecionado === id ? null : id;
  mensagem(estado.selecionado
    ? `${ITENS[id].nome} selecionado. ${ITENS[id].descricao} Clique em um objeto para usá-lo.`
    : 'Item desselecionado.');
  renderInventario();
  const de_novo = $(`[data-item="${id}"]`);
  if (de_novo) de_novo.focus(); // mantém o foco para quem usa teclado
};

/* ---------- Painel (dialog nativo = acessível, Esc fecha) ---------- */
let painelAtual = {}; // funções do painel aberto: aoEnviar, aoClicar, aoTecla, aoFechar

function abrirPainel(titulo, corpo, funcoes = {}) {
  painelAtual = funcoes;
  $('#painel-titulo').textContent = titulo;
  $('#painel-corpo').innerHTML = corpo;
  document.onkeydown = funcoes.aoTecla || null;
  $('#painel').showModal();
}

function limparPainel() {
  if (painelAtual.aoFechar) painelAtual.aoFechar();
  document.onkeydown = null;
  painelAtual = {};
}

function fecharPainel() {
  const painel = $('#painel');
  if (painel.open) painel.close();
  limparPainel();
}

// Esc fecha o dialog sem passar por fecharPainel(): limpa aqui também
$('#painel').onclose = () => {
  if (!$('#painel').open) limparPainel();
};

// Formulário de código (HTML em texto)
function formCodigo(rotulo, tamanho) {
  return `
    <form>
      <label>${rotulo} <input type="text" required autocomplete="off" maxlength="${tamanho}"></label>
      <button type="submit">Confirmar</button>
      <p role="alert"></p>
    </form>`;
}

// submit sobe (bubbles) até o container do painel
$('#painel-corpo').onsubmit = (e) => {
  e.preventDefault();
  if (!painelAtual.aoEnviar) return;
  const campo = e.target.querySelector('input');
  const aviso = e.target.querySelector('[role="alert"]');
  const resposta = painelAtual.aoEnviar(campo.value.trim().toUpperCase());
  aviso.textContent = resposta || '';
  if (!resposta) fecharPainel();
  else campo.select();
};

// Cliques dentro do painel (minigame dos fios)
$('#painel-corpo').onclick = (e) => {
  const fio = e.target.closest('[data-fio]');
  if (fio && painelAtual.aoClicar) painelAtual.aoClicar(Number(fio.dataset.fio));
};

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
      abrirPainel('Gaveta com cadeado', formCodigo('Código de 4 dígitos:', 4), {
        aoEnviar: (v) => {
          if (v !== CODIGOS.gaveta) { erro('código da gaveta incorreto'); return 'Código incorreto.'; }
          this.resolvido = true;
          adicionarItem('pendrive');
          registrar('Gaveta aberta. Você pegou um pen drive.');
          return null;
        }
      });
    }
  },

  // 3 - Terminal: errar 2x trava a gaveta
  terminal: {
    cenario: 'quarto', nome: 'Terminal do quarto', pos: [38, 38, 18, 24],
    resolvido: false, falhas: 0,
    interagir() {
      if (this.resolvido) return mensagem('Terminal já liberado. Veja o diário de bordo.');
      abrirPainel('Terminal do quarto', formCodigo('Senha:', 12), {
        aoEnviar: (v) => {
          if (v !== CODIGOS.terminal) {
            this.falhas++;
            erro('senha do terminal incorreta');
            if (this.falhas % 2 === 0) objetos.gaveta.bloquear();
            return 'Senha incorreta.';
          }
          this.resolvido = true;
          registrar('Terminal liberado. Log: "cadeado da geladeira = 042". Fragmento de PIN: 26.');
          return null;
        }
      });
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

      const desenhar = () => {
        $('#painel-corpo .sequencia').textContent =
          alvo.map((t, n) => (n < i ? 'OK' : setas[t])).join(' ');
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

      abrirPainel('Painel de comandos', `
        <p>Digite a sequência usando as setas do teclado. Errou uma tecla, recomeça.</p>
        <p class="sequencia" role="status"></p>`, { aoTecla });
      desenhar();
    }
  },

  // 5 - PC: usa o pen drive e mostra mensagem em binário
  pc: {
    cenario: 'treino', nome: 'PC do setup', pos: [38, 30, 24, 30],
    resolvido: false,
    mostrar() {
      abrirPainel('PC do setup', `
        <p>Arquivo "cofre.txt" (cada grupo de 4 bits é um dígito, de 0 a 9):</p>
        <pre>0111  0011  1001</pre>`);
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
      abrirPainel('Geladeira', formCodigo('Código de 3 dígitos:', 3), {
        aoEnviar: (v) => {
          if (v !== CODIGOS.geladeira) { erro('código da geladeira incorreto'); return 'Código incorreto.'; }
          this.resolvido = true;
          adicionarItem('cartao');
          registrar('Geladeira aberta. Dentro de uma marmita, um cartão de acesso.');
          return null;
        }
      });
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
      const status = () => $('#painel-corpo [role="status"]');
      const fio = (n) => $(`#painel-corpo [data-fio="${n}"]`);

      const mostrarSequencia = () => {
        aceitando = false;
        i = 0;
        status().textContent = 'Memorize a ordem dos fios...';
        alvo.forEach((n, k) => {
          timers.push(setTimeout(() => {
            fio(n).classList.add('aceso');
            status().textContent = `Fio ${k + 1}: ${cores[n]}`;
          }, 800 * (k + 1)));
          timers.push(setTimeout(() => fio(n).classList.remove('aceso'), 800 * (k + 1) + 450));
        });
        timers.push(setTimeout(() => {
          aceitando = true;
          status().textContent = 'Sua vez: clique na mesma ordem.';
        }, 800 * alvo.length + 900));
      };

      const aoClicar = (n) => {
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

      const botoes = cores
        .map((cor, n) => `<button type="button" class="fio fio-${cor}" data-fio="${n}">${cor}</button>`)
        .join('');
      abrirPainel('Quadro de fusíveis', `<p role="status"></p><div class="fios">${botoes}</div>`, {
        aoClicar,
        aoFechar: () => timers.forEach(clearTimeout)
      });
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
      abrirPainel('Cofre do troféu', formCodigo('Código de 3 dígitos:', 3), {
        aoEnviar: (v) => {
          if (v !== CODIGOS.cofre) { erro('código do cofre incorreto'); return 'Código incorreto.'; }
          this.resolvido = true;
          registrar('Cofre aberto. Um papel: "fragmento de PIN: 81".');
          return null;
        }
      });
    }
  },

  // 10 - Fechadura final: PIN = 26 + 47 + 81
  fechadura: {
    cenario: 'corredor', nome: 'Fechadura programável', pos: [40, 18, 20, 40],
    resolvido: false,
    interagir() {
      abrirPainel('Fechadura programável', formCodigo('PIN de 6 dígitos:', 6), {
        aoEnviar: (v) => {
          if (v !== CODIGOS.fechadura) { erro('PIN incorreto na fechadura'); return 'PIN incorreto.'; }
          this.resolvido = true;
          registrar('Fechadura reprogramada. A porta se abre.');
          decidirFinal();
          return null;
        }
      });
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
function hotspot(rotulo, pos, classe, dados) {
  return `<button type="button" class="hotspot ${classe}" ${dados}
    style="left:${pos[0]}%;top:${pos[1]}%;width:${pos[2]}%;height:${pos[3]}%"
    aria-label="${rotulo}"><span>${rotulo}</span></button>`;
}

function renderCenario() {
  const c = CENARIOS[estado.cenario];
  const portas = c.portas.map((p) =>
    hotspot(`Ir para: ${CENARIOS[p.destino].nome}`, p.pos, 'porta', `data-destino="${p.destino}"`));
  const itens = Object.values(objetos)
    .filter((o) => o.cenario === estado.cenario)
    .map((o) => hotspot(o.nome, o.pos, o.oculto ? 'oculto' : 'objeto', `data-obj="${o.id}"`));

  $('#cenario').className = `cenario cena-${estado.cenario}`;
  $('#nome-cenario').textContent = c.nome;
  $('#cenario').innerHTML = [...portas, ...itens].join('');
  atualizarMarcas();
}

function irPara(destino) {
  estado.cenario = destino;
  renderCenario();
  const { nome, dica } = CENARIOS[destino];
  mensagem(`Você entrou em: ${nome}. ${dica && !objetos.adesivo.resolvido ? dica : ''}`);
  $('#nome-cenario').focus();
}

// Delegação: um único onclick para portas e objetos de qualquer cenário
$('#cenario').onclick = (e) => {
  const botao = e.target.closest('button');
  if (!botao || estado.fim) return;
  if (botao.dataset.destino) irPara(botao.dataset.destino);
  else if (botao.dataset.obj) objetos[botao.dataset.obj].interagir();
};

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
   EVENTOS (botões fixos da página)
   ========================================================= */
$('#btn-iniciar').onclick = iniciar;
$('#btn-diario').onclick = () => $('#diario').showModal();
$('#btn-fechar-diario').onclick = () => $('#diario').close();
$('#btn-fechar-painel').onclick = fecharPainel;
$('#btn-reiniciar').onclick = () => location.reload();
$('#final').oncancel = (e) => e.preventDefault();
atualizarRelogio();
