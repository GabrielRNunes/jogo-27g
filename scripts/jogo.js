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
  fala: 0, // posição atual no diálogo da história
  energia: false,
  rodando: false,
  fim: false,
  timer: null
};

// Busca o primeiro elemento da página que corresponde ao seletor CSS informado.
function selecionarElemento(seletor) {
  return document.querySelector(seletor);
}
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
    portas: [{ destino: 'treino', pos: [87.5, 27.8, 10.0, 40.0] }]
  },
  treino: {
    nome: 'Sala de Treino',
    portas: [
      { destino: 'quarto', pos: [2.5, 27.8, 10.0, 40.0] },
      { destino: 'cozinha', pos: [87.5, 27.8, 10.0, 40.0] },
      { destino: 'servidores', pos: [47.5, 79.6, 15.0, 14.4] }
    ]
  },
  cozinha: {
    nome: 'Cozinha',
    dica: 'Algo reflete uma luz fraca perto do rodapé...',
    portas: [{ destino: 'treino', pos: [87.5, 27.8, 10.0, 40.0] }]
  },
  servidores: {
    nome: 'Sala de Servidores',
    portas: [
      { destino: 'treino', pos: [1.0, 77.8, 18.0, 18.2] },
      { destino: 'corredor', pos: [87.5, 26.7, 10.0, 41.1] }
    ]
  },
  corredor: {
    nome: 'Corredor de Saída',
    portas: [{ destino: 'servidores', pos: [2.5, 27.8, 10.0, 40.0] }]
  }
};

/* ---------- Mensagens, log, erros ---------- */
function mensagem(texto) {
  selecionarElemento('#mensagem').textContent = texto;
}

function registrar(texto, tipo = 'nota') {
  estado.log.push({ quando: formatarTempo(estado.tempo), texto, tipo });
  mensagem(texto);
  renderLog();
  atualizarMarcas();
}

function erro(motivo) {
  if (estado.fim) return;
  estado.erros++;
  estado.tempo = Math.max(0, estado.tempo - PENALIDADE_ERRO);
  selecionarElemento('#erros').textContent = String(estado.erros);
  atualizarRelogio();
  registrar(`Erro: ${motivo} (-${PENALIDADE_ERRO} s)`, 'erro');
  if (estado.tempo === 0) finalizar('capturado');
}

function renderLog() {
  selecionarElemento('#lista-log').innerHTML = estado.log
    .map((item) => `<li class="${item.tipo}"><span class="hora">${item.quando}</span> ${item.texto}</li>`)
    .join('');
}

/* ---------- Inventário ---------- */
function adicionarItem(id) {
  if (!estado.inventario.includes(id)) estado.inventario.push(id);
  renderInventario();
}

function renderInventario() {
  selecionarElemento('#inventario').innerHTML = estado.inventario.length === 0
    ? '<li>Vazio.</li>'
    : estado.inventario
      .map((id) => `<li><button type="button" data-item="${id}" aria-pressed="${estado.selecionado === id}">${ITENS[id].nome}</button></li>`)
      .join('');
}

// Delegação: um único onclick para todos os botões do inventário
selecionarElemento('#inventario').onclick = (e) => {
  const botao = e.target.closest('[data-item]');
  if (!botao) return;
  const id = botao.dataset.item;
  estado.selecionado = estado.selecionado === id ? null : id;
  mensagem(estado.selecionado
    ? `${ITENS[id].nome} selecionado. ${ITENS[id].descricao} Clique em um objeto para usá-lo.`
    : 'Item desselecionado.');
  renderInventario();
  const de_novo = selecionarElemento(`[data-item="${id}"]`);
  if (de_novo) de_novo.focus(); // mantém o foco para quem usa teclado
};

/* ---------- Painel (dialog nativo = acessível, Esc fecha) ---------- */
let painelAtual = {}; // funções do painel aberto: aoEnviar, aoClicar, aoTecla, aoFechar

function abrirPainel(titulo, corpo, funcoes = {}) {
  painelAtual = funcoes;
  selecionarElemento('#painel-titulo').textContent = titulo;
  selecionarElemento('#painel-corpo').innerHTML = corpo;
  document.onkeydown = funcoes.aoTecla || null;
  selecionarElemento('#painel').showModal();
}

function limparPainel() {
  if (painelAtual.aoFechar) painelAtual.aoFechar();
  document.onkeydown = null;
  painelAtual = {};
}

function fecharPainel() {
  const painel = selecionarElemento('#painel');
  if (painel.open) painel.close();
  limparPainel();
}

// Esc fecha o dialog sem passar por fecharPainel(): limpa aqui também
selecionarElemento('#painel').onclose = () => {
  if (!selecionarElemento('#painel').open) limparPainel();
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
selecionarElemento('#painel-corpo').onsubmit = (e) => {
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
selecionarElemento('#painel-corpo').onclick = (e) => {
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
    cenario: 'quarto', nome: 'Calendário da final', pos: [6.2, 13.3, 15.0, 25.6],
    inspecionado: false, resolvido: false,
    interagir() {
      this.inspecionado = this.resolvido = true;
      registrar('Calendário: a final é dia 15/11. Um post-it colado diz: "senha do terminal = ORBITA".');
    }
  },

  // 2 - Gaveta com cadeado numérico (pode ser travada pelo terminal)
  gaveta: {
    cenario: 'quarto', nome: 'Gaveta com cadeado', pos: [60.0, 48.9, 22.5, 21.1],
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
    cenario: 'quarto', nome: 'Terminal do quarto', pos: [35.0, 36.7, 20.0, 23.3],
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
    cenario: 'treino', nome: 'Painel de comandos', pos: [14.8, 48.7, 15.9, 21.3],
    resolvido: false,
    interagir() {
      if (this.resolvido) return mensagem('O painel já está liberado.');
      const teclas = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
      const setas = { ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→' };
      const alvo = Array.from({ length: 5 }, () => teclas[Math.floor(Math.random() * teclas.length)]);
      let i = 0;

      const desenhar = () => {
        selecionarElemento('#painel-corpo .sequencia').textContent =
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
    cenario: 'treino', nome: 'PC do setup', pos: [35.0, 28.9, 33.1, 33.3],
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
    cenario: 'cozinha', nome: 'Geladeira com cadeado', pos: [6.2, 15.1, 20.6, 54.9],
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
    cenario: 'servidores', nome: 'Quadro de fusíveis', pos: [6.9, 18.9, 20.6, 38.9],
    resolvido: false,
    interagir() {
      if (this.resolvido) return mensagem('A energia já foi restabelecida.');
      const cores = ['vermelho', 'verde', 'azul', 'amarelo'];
      const alvo = Array.from({ length: 4 }, () => Math.floor(Math.random() * cores.length));
      let i = 0;
      let aceitando = false;
      const timers = [];
      const status = () => selecionarElemento('#painel-corpo [role="status"]');
      const fio = (n) => selecionarElemento(`#painel-corpo [data-fio="${n}"]`);

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
    cenario: 'servidores', nome: 'Rack de servidores', pos: [38.0, 13.0, 38.2, 54.4],
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
    cenario: 'treino', nome: 'Cofre do troféu', pos: [72.4, 46.3, 12.5, 23.7],
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
    cenario: 'corredor', nome: 'Fechadura programável', pos: [37.5, 15.6, 25.0, 52.2],
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
    cenario: 'cozinha', nome: 'Adesivo suspeito atrás da lixeira', pos: [85.1, 82.9, 7.2, 9.1],
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

  selecionarElemento('#cenario').className = `cenario cena-${estado.cenario}`;
  selecionarElemento('#nome-cenario').textContent = c.nome;
  selecionarElemento('#cenario').innerHTML = [...portas, ...itens].join('');
  atualizarMarcas();
}

function irPara(destino) {
  estado.cenario = destino;
  renderCenario();
  const { nome, dica } = CENARIOS[destino];
  mensagem(`Você entrou em: ${nome}. ${dica && !objetos.adesivo.resolvido ? dica : ''}`);
  if (dica && !objetos.adesivo.resolvido && !objetos.adesivo.dicaNoDiario) {
    objetos.adesivo.dicaNoDiario = true; // a dica também fica no diário, para reler depois
    registrar(`${nome}: ${dica}`);
  }
  selecionarElemento('#nome-cenario').focus();
}

// Delegação: um único onclick para portas e objetos de qualquer cenário
selecionarElemento('#cenario').onclick = (e) => {
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
  const el = selecionarElemento('#relogio');
  el.textContent = formatarTempo(estado.tempo);
  el.classList.toggle('urgente', estado.tempo <= 60);
}

function iniciar() {
  estado.rodando = true;
  selecionarElemento('#intro').hidden = true;
  selecionarElemento('#jogo').hidden = false;
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
   HISTÓRIA (diálogo antes do lockdown)
   O relógio só começa quando o diálogo termina.
   ========================================================= */
const HISTORIA = [
  { quem: 'narrador', nome: 'Narrador', texto: 'Gaming house da organização, 9h02 da manhã da final. O ar-condicionado zumbe, os corredores estão vazios e há uma notícia que ninguém quer dar: o jogador favorito sumiu.' },
  { quem: 'seguranca', nome: 'Central de Segurança (rádio)', texto: 'Técnico, aqui é a Central. O quarto do Kairo está trancado por dentro e ninguém o vê desde as 22h de ontem. A final começa às 18h. Preciso dessa porta aberta.' },
  { quem: 'voce', nome: 'Você', texto: 'A fechadura programável é do meu sistema, eu mesmo a configurei no mês passado. Dá para abrir sem arrombar a porta.' },
  { quem: 'voce', nome: 'Você', texto: 'Alguém tentou ligar para ele?' },
  { quem: 'seguranca', nome: 'Central de Segurança (rádio)', texto: 'Dezenas de vezes. Celular desligado. A última coisa que ele pediu foi para não ser incomodado, e o registro da fechadura mostra a entrada dele às 23h41. Saída, nenhuma.' },
  { quem: 'seguranca', nome: 'Central de Segurança (rádio)', texto: 'Faça isso rápido e sem barulho. Se a imprensa descobrir que o favorito sumiu horas antes da final, a organização perde patrocinador antes do almoço.' },
  { quem: 'narrador', nome: 'Narrador', texto: 'Você respira fundo e encosta o crachá no leitor. A luz fica verde por meio segundo. Depois, vermelha.' },
  { quem: 'sistema', nome: 'Sistema da fechadura', texto: 'Credencial reconhecida. Verificando permissão de acesso ao quarto...' },
  { quem: 'sistema', nome: 'Sistema da fechadura', texto: 'ACESSO NÃO AUTORIZADO. LOCKDOWN ATIVADO. ALARME E SEGURANÇA EM 5 MINUTOS.', cena: true },
  { quem: 'voce', nome: 'Você', texto: 'Não, não, não. Eu tenho autorização, isso devia abrir!' },
  { quem: 'seguranca', nome: 'Central de Segurança (rádio)', texto: 'Técnico? O alerta apareceu aqui na Central. O protocolo isola tudo por dentro e a equipe chega em cinco minutos. Dê um jeito de sair antes disso.' },
  { quem: 'voce', nome: 'Você', texto: 'Se me encontrarem dentro do quarto dele, ninguém vai acreditar que eu só vim abrir a porta.' },
  { quem: 'narrador', nome: 'Narrador', texto: 'A única saída é reprogramar a fechadura pelo painel do corredor, antes do alarme. Cada sala guarda uma peça e cada erro custa dez segundos. O relógio começa agora.' }
];

function mostrarFala() {
  const fala = HISTORIA[estado.fala];
  const ultima = estado.fala === HISTORIA.length - 1;
  selecionarElemento('#dialogo-nome').textContent = fala.nome;
  selecionarElemento('#dialogo-nome').className = `falante falante-${fala.quem}`;
  selecionarElemento('#dialogo-texto').textContent = fala.texto;
  selecionarElemento('#dialogo-retrato').src = `assets/historia/${fala.quem}.svg`;
  selecionarElemento('#dialogo-cena').hidden = !fala.cena; // quadro de impacto só na fala do lockdown
  selecionarElemento('#dialogo-progresso').textContent = `${estado.fala + 1} / ${HISTORIA.length}`;
  selecionarElemento('#btn-proxima').textContent = ultima ? 'Começar o lockdown' : 'Próxima';
}

function comecarHistoria() {
  selecionarElemento('#intro').hidden = true;
  selecionarElemento('#dialogo').hidden = false;
  estado.fala = 0;
  mostrarFala();
  selecionarElemento('#btn-proxima').focus();
}

function proximaFala() {
  if (estado.fala < HISTORIA.length - 1) {
    estado.fala++;
    mostrarFala();
  } else {
    terminarHistoria();
  }
}

function terminarHistoria() {
  selecionarElemento('#dialogo').hidden = true;
  iniciar();
  selecionarElemento('#nome-cenario').focus();
}

/* =========================================================
   TELA CHEIA (a página inteira, para os painéis continuarem visíveis)
   ========================================================= */
function alternarTelaCheia() {
  const pedido = document.fullscreenElement
    ? document.exitFullscreen()
    : document.documentElement.requestFullscreen();
  pedido.catch(() => mensagem('O navegador bloqueou a tela cheia.'));
}

function atualizarBotaoTelaCheia() {
  selecionarElemento('#btn-tela-cheia').textContent = document.fullscreenElement ? 'Sair da tela cheia' : 'Tela cheia';
}

/* =========================================================
   FINAIS
   ========================================================= */
const FINAIS = {
  perfeito: {
    titulo: 'Final: Fuga Perfeita',
    texto: 'Você reprogramou a fechadura com tempo de sobra, saiu sem acionar nada e a segurança chegou a um corredor vazio.',
    imagem: 'assets/finais/perfeito.svg',
    alt: 'Tira de quadrinhos em três quadros: sua mão digita o PIN no teclado, e o aviso BIP confirma; a porta destrava com um CLAC; você, aliviado e de fone no pescoço, vê o corredor vazio e livre diante do amanhecer.'
  },
  sequelas: {
    titulo: 'Final: Fuga com Sequelas',
    texto: 'Você saiu, mas os erros e a demora dispararam o alarme parcial. Câmeras gravaram seu rosto e a organização vai pedir explicações.',
    imagem: 'assets/finais/sequelas.svg',
    alt: 'Tira de quadrinhos em três quadros: o teclado mostra ERRO e faz BZZT; uma câmera de segurança com olho vermelho e a marca REC vigia você; você, assustado, foge sob a luz vermelha do alarme.'
  },
  capturado: {
    titulo: 'Final: Capturado',
    texto: 'O relógio zerou. A segurança abriu a porta e encontrou um técnico de TI, um quarto revirado e nenhuma explicação.',
    imagem: 'assets/finais/capturado.svg',
    alt: 'Tira de quadrinhos em três quadros: um relógio digital marca 0:00 com o alarme tocando; dois guardas em silhueta abrem a porta com um CLAC; você, assustado, ergue as mãos. Game over.'
  },
  secreto: {
    titulo: 'Final Secreto: Ele Quis Sumir',
    texto: 'Com o bilhete em mãos você entende: Kairo fugiu por vontade própria. Você sai e apaga os registros da fechadura. Ninguém jamais saberá onde ele está.',
    imagem: 'assets/finais/secreto.svg',
    alt: 'Tira de quadrinhos em três quadros: você lê o bilhete do Kairo, que diz que ele foi por vontade própria; o painel da fechadura apaga os registros até 100 por cento; ao longe, a silhueta de Kairo caminha por uma estrada sob a lua.'
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
  selecionarElemento('#final-titulo').textContent = FINAIS[tipo].titulo;
  selecionarElemento('#final').dataset.tipo = tipo; // o CSS muda a cor da borda por final
  selecionarElemento('#final-imagem').src = FINAIS[tipo].imagem;
  selecionarElemento('#final-imagem').alt = FINAIS[tipo].alt;
  selecionarElemento('#final-texto').textContent = FINAIS[tipo].texto;
  selecionarElemento('#final-resumo').textContent = `Tempo restante: ${formatarTempo(estado.tempo)} | Erros: ${estado.erros}`;
  selecionarElemento('#final').showModal();
}

/* =========================================================
   EVENTOS (botões fixos da página)
   ========================================================= */
selecionarElemento('#btn-iniciar').onclick = comecarHistoria;
selecionarElemento('#btn-proxima').onclick = proximaFala;
selecionarElemento('#btn-pular').onclick = terminarHistoria;
selecionarElemento('#btn-tela-cheia').onclick = alternarTelaCheia;
selecionarElemento('#btn-tela-cheia').hidden = !document.fullscreenEnabled; // some onde o navegador não suporta
document.onfullscreenchange = atualizarBotaoTelaCheia;     // também reage ao Esc
selecionarElemento('#btn-diario').onclick = () => {
  selecionarElemento('#diario').showModal();
  selecionarElemento('#diario').scrollTop = selecionarElemento('#diario').scrollHeight; // abre na anotação mais recente
};
selecionarElemento('#btn-fechar-diario').onclick = () => selecionarElemento('#diario').close();
selecionarElemento('#btn-fechar-painel').onclick = fecharPainel;
selecionarElemento('#btn-reiniciar').onclick = () => location.reload();
selecionarElemento('#final').oncancel = (e) => e.preventDefault();
atualizarRelogio();
