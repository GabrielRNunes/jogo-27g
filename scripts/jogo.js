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
  diario: [],
  selecionado: null,
  fala: 0, // posição atual no diálogo da história
  energia: false,
  rodando: false,
  fim: false,
  cronometro: null
};

function buscarElemento(seletor) {
  return document.querySelector(seletor);
}

function formatarTempo(segundosTotais) {
  const minutos = Math.floor(segundosTotais / 60);
  const segundos = segundosTotais % 60;
  const segundosFormatados = String(segundos).padStart(2, '0');
  return minutos + ':' + segundosFormatados;
}

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
  buscarElemento('#mensagem').textContent = texto;
}

function registrar(texto, tipo = 'nota') {
  estado.diario.push({ quando: formatarTempo(estado.tempo), texto, tipo });
  mensagem(texto);
  atualizarDiario();
  atualizarMarcas();
}

function erro(motivo) {
  if (estado.fim) return;
  estado.erros++;
  estado.tempo = Math.max(0, estado.tempo - PENALIDADE_ERRO);
  buscarElemento('#erros').textContent = String(estado.erros);
  atualizarRelogio();
  registrar(`Erro: ${motivo} (-${PENALIDADE_ERRO} s)`, 'erro');
  if (estado.tempo === 0) finalizar('capturado');
}

function atualizarDiario() {
  let conteudo = '';
  for (const registro of estado.diario) {
    conteudo += `<li class="${registro.tipo}"><span class="hora">${registro.quando}</span> ${registro.texto}</li>`;
  }
  buscarElemento('#lista-log').innerHTML = conteudo;
}

/* ---------- Inventário ---------- */
function adicionarItem(id) {
  if (!estado.inventario.includes(id)) estado.inventario.push(id);
  atualizarInventario();
}

function atualizarInventario() {
  let conteudo = '<li>Vazio.</li>';
  if (estado.inventario.length > 0) {
    conteudo = '';
    for (const idItem of estado.inventario) {
      const item = ITENS[idItem];
      const selecionado = estado.selecionado === idItem;
      conteudo += `<li><button type="button" data-item="${idItem}" aria-pressed="${selecionado}">${item.nome}</button></li>`;
    }
  }
  buscarElemento('#inventario').innerHTML = conteudo;
}

// Um único evento atende todos os botões, inclusive após atualizar o inventário.
function selecionarItem(evento) {
  const botao = evento.target.closest('[data-item]');
  if (!botao) return;

  const idItem = botao.dataset.item;
  if (estado.selecionado === idItem) {
    estado.selecionado = null;
    mensagem('Item desselecionado.');
  } else {
    estado.selecionado = idItem;
    const item = ITENS[idItem];
    mensagem(`${item.nome} selecionado. ${item.descricao} Clique em um objeto para usá-lo.`);
  }

  atualizarInventario();
  // O botão foi recriado: devolvemos o foco para continuar usando o teclado.
  const botaoAtualizado = buscarElemento(`[data-item="${idItem}"]`);
  if (botaoAtualizado) botaoAtualizado.focus();
}

buscarElemento('#inventario').onclick = selecionarItem;

/* ---------- Painel (dialog nativo = acessível, Esc fecha) ---------- */
let painelAtual = {}; // funções do painel aberto: aoEnviar, aoClicar, aoTecla, aoFechar

function abrirPainel(titulo, corpo, funcoes = {}) {
  painelAtual = funcoes;
  buscarElemento('#painel-titulo').textContent = titulo;
  buscarElemento('#painel-corpo').innerHTML = corpo;
  document.onkeydown = funcoes.aoTecla || null;
  buscarElemento('#painel').showModal();
}

function limparPainel() {
  if (painelAtual.aoFechar) painelAtual.aoFechar();
  document.onkeydown = null;
  painelAtual = {};
}

function fecharPainel() {
  const painel = buscarElemento('#painel');
  if (painel.open) painel.close();
  limparPainel();
}

// Esc fecha o dialog sem passar por fecharPainel(): limpa aqui também
function aoFecharPainel() {
  if (!buscarElemento('#painel').open) limparPainel();
}

buscarElemento('#painel').onclose = aoFecharPainel;

// Formulário de código (HTML em texto)
function criarFormularioCodigo(rotulo, tamanho) {
  return `
    <form>
      <label>${rotulo} <input type="text" required autocomplete="off" maxlength="${tamanho}"></label>
      <button type="submit">Confirmar</button>
      <p role="alert"></p>
    </form>`;
}

// submit sobe (bubbles) até o container do painel
function enviarCodigo(evento) {
  evento.preventDefault();
  if (!painelAtual.aoEnviar) return;

  const formulario = evento.target;
  const campo = formulario.querySelector('input');
  const aviso = formulario.querySelector('[role="alert"]');
  const codigoDigitado = campo.value.trim().toUpperCase();
  const resposta = painelAtual.aoEnviar(codigoDigitado);

  // Uma resposta vazia significa que o código foi aceito.
  // Se o erro zerou o tempo, finalizar() já fechou o painel.
  if (estado.fim) return;
  aviso.textContent = resposta || '';
  if (!resposta) {
    fecharPainel();
  } else {
    campo.select();
  }
}

function clicarNoFio(evento) {
  const botaoFio = evento.target.closest('[data-fio]');
  if (botaoFio && painelAtual.aoClicar) {
    const indiceFio = Number(botaoFio.dataset.fio);
    painelAtual.aoClicar(indiceFio);
  }
}

buscarElemento('#painel-corpo').onsubmit = enviarCodigo;
buscarElemento('#painel-corpo').onclick = clicarNoFio;

/* ---------- Calculadora opcional: mostra a conta digitada pelo jogador ---------- */
function abrirCalculadoraBinaria() {
  buscarElemento('#calculadora-binaria').showModal();
  buscarElemento('#numero-binario').focus();
}

function fecharCalculadoraBinaria() {
  const calculadora = buscarElemento('#calculadora-binaria');
  if (calculadora.open) calculadora.close();
}

function calcularBinario(evento) {
  evento.preventDefault();
  const numeroBinario = buscarElemento('#numero-binario').value.trim();
  const resultado = buscarElemento('#resultado-binario');
  if (!/^[01]{4}$/.test(numeroBinario)) {
    resultado.textContent = 'Digite exatamente quatro bits, usando apenas 0 e 1.';
    return;
  }

  const pesos = [8, 4, 2, 1];
  const etapas = [];
  const parcelas = [];
  let total = 0;
  for (let posicao = 0; posicao < pesos.length; posicao++) {
    const bit = Number(numeroBinario[posicao]);
    const peso = pesos[posicao];
    const valor = bit * peso;
    etapas.push(bit + ' × ' + peso + ' = ' + valor);
    parcelas.push(valor);
    total += valor;
  }

  // Só os valores validados acima entram no HTML; o código do cofre não é preenchido.
  resultado.innerHTML = '<p>' + etapas.join('<br>') + '</p>' +
    '<p><strong>Soma: ' + parcelas.join(' + ') + ' = ' + total + '</strong></p>' +
    '<p>O grupo <code>' + numeroBinario + '</code> representa <strong>' + total + '</strong> em decimal.</p>';
  if (total > 9) {
    resultado.innerHTML += '<p>Este resultado tem dois dígitos. No arquivo do PC, cada grupo representa um único dígito de 0 a 9; confira os bits que você digitou.</p>';
  }
}

function limparCalculoBinario() {
  buscarElemento('#resultado-binario').textContent = '';
}

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
      this.inspecionado = true;
      this.resolvido = true;
      registrar('Calendário: a final é dia 15/11. Um post-it colado diz: "senha do terminal = ORBITA".');
    }
  },

  // 2 - Gaveta com cadeado numérico (pode ser travada pelo terminal)
  gaveta: {
    cenario: 'quarto', nome: 'Gaveta com cadeado', pos: [60.0, 48.9, 22.5, 21.1],
    resolvido: false, liberaEm: null,
    bloqueada() {
      // O relógio é regressivo: a gaveta libera quando chega ao tempo marcado.
      return this.liberaEm !== null && estado.tempo > this.liberaEm;
    },
    bloquear() {
      this.liberaEm = estado.tempo - 45;
      registrar('A gaveta eletrônica travou por 45 segundos (erros no terminal).');
    },
    interagir() {
      const gaveta = this;
      if (this.resolvido) return mensagem('A gaveta está vazia.');
      if (this.bloqueada()) return mensagem('Gaveta travada pelo sistema. Aguarde alguns segundos.');
      abrirPainel('Gaveta com cadeado', criarFormularioCodigo('Código de 4 dígitos:', 4), {
        aoEnviar: function (codigoDigitado) {
          if (codigoDigitado !== CODIGOS.gaveta) {
            erro('código da gaveta incorreto');
            return 'Código incorreto.';
          }
          gaveta.resolvido = true;
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
      const terminal = this;
      if (this.resolvido) return mensagem('Terminal já liberado. Veja o diário de bordo.');
      abrirPainel('Terminal do quarto', criarFormularioCodigo('Senha:', 12), {
        aoEnviar: function (codigoDigitado) {
          if (codigoDigitado !== CODIGOS.terminal) {
            terminal.falhas++;
            erro('senha do terminal incorreta');
            if (terminal.falhas % 2 === 0) objetos.gaveta.bloquear();
            return 'Senha incorreta.';
          }
          terminal.resolvido = true;
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
      const painelComandos = this;
      const teclas = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
      const setas = { ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→' };
      const sequencia = [];
      for (let quantidade = 0; quantidade < 5; quantidade++) {
        const indiceSorteado = Math.floor(Math.random() * teclas.length);
        sequencia.push(teclas[indiceSorteado]);
      }
      let passoAtual = 0;

      function mostrarSetas() {
        const partes = [];
        for (let indice = 0; indice < sequencia.length; indice++) {
          if (indice < passoAtual) {
            partes.push('OK');
          } else {
            partes.push(setas[sequencia[indice]]);
          }
        }
        buscarElemento('#painel-corpo .sequencia').textContent = partes.join(' ');
      }

      function verificarTecla(evento) {
        if (!teclas.includes(evento.key)) return;
        evento.preventDefault();
        if (evento.key === sequencia[passoAtual]) {
          passoAtual++;
          mostrarSetas();
          if (passoAtual === sequencia.length) {
            painelComandos.resolvido = true;
            fecharPainel();
            registrar('Painel de comandos liberado: o PC do setup agora aceita mídia.');
          }
        } else {
          passoAtual = 0;
          mostrarSetas();
        }
      }

      abrirPainel('Painel de comandos', `
        <p>Digite a sequência usando as setas do teclado. Errou uma tecla, recomeça.</p>
        <p class="sequencia" role="status"></p>`, { aoTecla: verificarTecla });
      mostrarSetas();
    }
  },

  // 5 - PC: usa o pen drive e mostra mensagem em binário
  pc: {
    cenario: 'treino', nome: 'PC do setup', pos: [35.0, 28.9, 33.1, 33.3],
    resolvido: false,
    mostrar() {
      abrirPainel('PC do setup', `
        <p>Arquivo "cofre.txt" (cada grupo de 4 bits é um dígito, de 0 a 9):</p>
        <pre>0111  0011  1001</pre>
        <button type="button" id="btn-calculadora-pc">Abrir calculadora binária</button>
        <details class="ajuda-binaria">
          <summary>Precisa de ajuda para ler o binário?</summary>
          <p>Abra as dicas conforme precisar. O exemplo usa outro número para você aprender o caminho e resolver o arquivo.</p>

          <details>
            <summary>1. Entenda o valor de cada posição</summary>
            <p>Em um grupo de quatro bits, as posições valem <strong>8, 4, 2 e 1</strong>, da esquerda para a direita. Lendo da direita para a esquerda, cada valor é o dobro do anterior.</p>
            <p>O bit <strong>1</strong> significa “some o valor desta posição”. O bit <strong>0</strong> significa “ignore esta posição”.</p>
          </details>

          <details>
            <summary>2. Veja um exemplo diferente do arquivo</summary>
            <table>
              <caption>Exemplo: 0101. Pesos no cabeçalho, bits na linha abaixo.</caption>
              <thead>
                <tr><th scope="col">8</th><th scope="col">4</th><th scope="col">2</th><th scope="col">1</th></tr>
              </thead>
              <tbody>
                <tr><td>0</td><td>1</td><td>0</td><td>1</td></tr>
              </tbody>
            </table>
            <p>Os bits 1 estão nas posições de valor 4 e 1. Portanto, <strong>4 + 1 = 5</strong>: o grupo <code>0101</code> representa o dígito 5.</p>
          </details>

          <details>
            <summary>3. Aplique o método ao arquivo</summary>
            <p>Alinhe cada grupo do arquivo com os pesos <strong>8 · 4 · 2 · 1</strong>. Some apenas os pesos que têm um bit 1 abaixo deles. Você pode anotar as somas em um papel.</p>
            <p>Converta um grupo por vez. Depois, junte os três dígitos na ordem em que aparecem, da esquerda para a direita. Não some os resultados dos grupos entre si.</p>
          </details>
        </details>`);
      buscarElemento('#btn-calculadora-pc').onclick = abrirCalculadoraBinaria;
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
      const geladeira = this;
      if (this.resolvido) return mensagem('A geladeira está aberta. Só sobrou energético.');
      abrirPainel('Geladeira', criarFormularioCodigo('Código de 3 dígitos:', 3), {
        aoEnviar: function (codigoDigitado) {
          if (codigoDigitado !== CODIGOS.geladeira) {
            erro('código da geladeira incorreto');
            return 'Código incorreto.';
          }
          geladeira.resolvido = true;
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
      const quadroFusiveis = this;
      const cores = ['vermelho', 'verde', 'azul', 'amarelo'];
      const sequencia = [];
      for (let quantidade = 0; quantidade < 4; quantidade++) {
        sequencia.push(Math.floor(Math.random() * cores.length));
      }
      let passoAtual = 0;
      let podeClicar = false;
      const temporizadores = [];

      function mostrarStatus(texto) {
        buscarElemento('#painel-corpo [role="status"]').textContent = texto;
      }

      function buscarFio(indiceFio) {
        return buscarElemento(`#painel-corpo [data-fio="${indiceFio}"]`);
      }

      function mostrarSequencia() {
        podeClicar = false;
        passoAtual = 0;
        mostrarStatus('Memorize a ordem dos fios...');
        for (let passo = 0; passo < sequencia.length; passo++) {
          const indiceFio = sequencia[passo];
          const momentoDeAcender = 800 * (passo + 1);
          const acender = setTimeout(function () {
            buscarFio(indiceFio).classList.add('aceso');
            mostrarStatus(`Fio ${passo + 1}: ${cores[indiceFio]}`);
          }, momentoDeAcender);
          const apagar = setTimeout(function () {
            buscarFio(indiceFio).classList.remove('aceso');
          }, momentoDeAcender + 450);
          temporizadores.push(acender, apagar);
        }
        const liberarCliques = setTimeout(function () {
          podeClicar = true;
          mostrarStatus('Sua vez: clique na mesma ordem.');
        }, 800 * sequencia.length + 900);
        temporizadores.push(liberarCliques);
      }

      function verificarFio(indiceFio) {
        if (!podeClicar) return;
        if (indiceFio === sequencia[passoAtual]) {
          passoAtual++;
          if (passoAtual === sequencia.length) {
            quadroFusiveis.resolvido = true;
            estado.energia = true;
            fecharPainel();
            registrar('Energia restabelecida na sala de servidores.');
          }
        } else {
          podeClicar = false;
          erro('fio errado no quadro de fusíveis');
          if (!estado.fim) mostrarSequencia();
        }
      }

      function cancelarTemporizadores() {
        // Fechar o painel também deve interromper as luzes da sequência.
        for (const temporizador of temporizadores) {
          clearTimeout(temporizador);
        }
      }

      let botoes = '';
      for (let indiceFio = 0; indiceFio < cores.length; indiceFio++) {
        const cor = cores[indiceFio];
        botoes += `<button type="button" class="fio fio-${cor}" data-fio="${indiceFio}">${cor}</button>`;
      }
      abrirPainel('Quadro de fusíveis', `<p role="status"></p><div class="fios">${botoes}</div>`, {
        aoClicar: verificarFio,
        aoFechar: cancelarTemporizadores
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
      const cofre = this;
      if (this.resolvido) return mensagem('O cofre está aberto. O troféu falso brilha lá dentro.');
      abrirPainel('Cofre do troféu', criarFormularioCodigo('Código de 3 dígitos:', 3), {
        aoEnviar: function (codigoDigitado) {
          if (codigoDigitado !== CODIGOS.cofre) {
            erro('código do cofre incorreto');
            return 'Código incorreto.';
          }
          cofre.resolvido = true;
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
      const fechadura = this;
      abrirPainel('Fechadura programável', criarFormularioCodigo('PIN de 6 dígitos:', 6), {
        aoEnviar: function (codigoDigitado) {
          if (codigoDigitado !== CODIGOS.fechadura) {
            erro('PIN incorreto na fechadura');
            return 'PIN incorreto.';
          }
          fechadura.resolvido = true;
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
// Guarda o identificador em cada objeto para montar os botões do cenário.
for (const idObjeto of Object.keys(objetos)) {
  objetos[idObjeto].id = idObjeto;
}

/* =========================================================
   CENÁRIO (hotspots são <button>: funcionam com teclado)
   ========================================================= */
function criarBotaoCenario(rotulo, posicao, classe, dados) {
  const [esquerda, topo, largura, altura] = posicao;
  return `<button type="button" class="hotspot ${classe}" ${dados}
    style="left:${esquerda}%;top:${topo}%;width:${largura}%;height:${altura}%"
    aria-label="${rotulo}"><span>${rotulo}</span></button>`;
}

function atualizarCenario() {
  const cenarioAtual = CENARIOS[estado.cenario];
  let conteudo = '';

  for (const porta of cenarioAtual.portas) {
    const rotulo = 'Ir para: ' + CENARIOS[porta.destino].nome;
    conteudo += criarBotaoCenario(rotulo, porta.pos, 'porta', `data-destino="${porta.destino}"`);
  }
  for (const objeto of Object.values(objetos)) {
    if (objeto.cenario !== estado.cenario) continue;
    let classe = 'objeto';
    if (objeto.oculto) classe = 'oculto';
    conteudo += criarBotaoCenario(objeto.nome, objeto.pos, classe, `data-obj="${objeto.id}"`);
  }

  const areaCenario = buscarElemento('#cenario');
  areaCenario.className = `cenario cena-${estado.cenario}`;
  areaCenario.innerHTML = conteudo;
  buscarElemento('#nome-cenario').textContent = cenarioAtual.nome;
  atualizarMarcas();
}

function irPara(destino) {
  estado.cenario = destino;
  atualizarCenario();
  const { nome, dica } = CENARIOS[destino];
  mensagem(`Você entrou em: ${nome}. ${dica && !objetos.adesivo.resolvido ? dica : ''}`);
  if (dica && !objetos.adesivo.resolvido && !objetos.adesivo.dicaNoDiario) {
    objetos.adesivo.dicaNoDiario = true; // a dica também fica no diário, para reler depois
    registrar(`${nome}: ${dica}`);
  }
  buscarElemento('#nome-cenario').focus();
}

// Delegação: um único onclick para portas e objetos de qualquer cenário
function interagirComCenario(evento) {
  const botao = evento.target.closest('button');
  if (!botao || estado.fim) return;
  if (botao.dataset.destino) irPara(botao.dataset.destino);
  else if (botao.dataset.obj) objetos[botao.dataset.obj].interagir();
}

buscarElemento('#cenario').onclick = interagirComCenario;

function atualizarMarcas() {
  const botoes = document.querySelectorAll('#cenario [data-obj]');
  for (const botao of botoes) {
    const objeto = objetos[botao.dataset.obj];
    botao.classList.toggle('feito', Boolean(objeto.resolvido));
  }
}

/* ---------- Relógio ---------- */
function atualizarRelogio() {
  const relogio = buscarElemento('#relogio');
  relogio.textContent = formatarTempo(estado.tempo);
  relogio.classList.toggle('urgente', estado.tempo <= 60);
}

function iniciar() {
  if (estado.rodando || estado.fim) return;
  estado.rodando = true;
  buscarElemento('#intro').hidden = true;
  buscarElemento('#jogo').hidden = false;
  atualizarCenario();
  atualizarInventario();
  registrar('Lockdown ativado. Você tem 5 minutos para reprogramar a fechadura antes da segurança chegar.');
  estado.cronometro = setInterval(contarSegundo, 1000);
}

function contarSegundo() {
  estado.tempo = Math.max(0, estado.tempo - 1);
  atualizarRelogio();
  if (estado.tempo === 0) finalizar('capturado');
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
  buscarElemento('#dialogo-nome').textContent = fala.nome;
  buscarElemento('#dialogo-nome').className = `falante falante-${fala.quem}`;
  buscarElemento('#dialogo-texto').textContent = fala.texto;
  buscarElemento('#dialogo-retrato').src = `assets/historia/${fala.quem}.svg`;
  buscarElemento('#dialogo-cena').hidden = !fala.cena; // quadro de impacto só na fala do lockdown
  buscarElemento('#dialogo-progresso').textContent = `${estado.fala + 1} / ${HISTORIA.length}`;
  buscarElemento('#btn-proxima').textContent = ultima ? 'Começar o lockdown' : 'Próxima';
}

function comecarHistoria() {
  buscarElemento('#intro').hidden = true;
  buscarElemento('#dialogo').hidden = false;
  estado.fala = 0;
  mostrarFala();
  buscarElemento('#btn-proxima').focus();
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
  buscarElemento('#dialogo').hidden = true;
  iniciar();
  buscarElemento('#nome-cenario').focus();
}

/* =========================================================
   TELA CHEIA (a página inteira, para os painéis continuarem visíveis)
   ========================================================= */
function alternarTelaCheia() {
  const pedido = document.fullscreenElement
    ? document.exitFullscreen()
    : document.documentElement.requestFullscreen();
  pedido.catch(function () {
    mensagem('O navegador bloqueou a tela cheia.');
  });
}

function atualizarBotaoTelaCheia() {
  buscarElemento('#btn-tela-cheia').textContent = document.fullscreenElement ? 'Sair da tela cheia' : 'Tela cheia';
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
  estado.rodando = false;
  clearInterval(estado.cronometro);
  fecharCalculadoraBinaria();
  fecharPainel();
  buscarElemento('#final-titulo').textContent = FINAIS[tipo].titulo;
  buscarElemento('#final').dataset.tipo = tipo; // o CSS muda a cor da borda por final
  buscarElemento('#final-imagem').src = FINAIS[tipo].imagem;
  buscarElemento('#final-imagem').alt = FINAIS[tipo].alt;
  buscarElemento('#final-texto').textContent = FINAIS[tipo].texto;
  buscarElemento('#final-resumo').textContent = `Tempo restante: ${formatarTempo(estado.tempo)} | Erros: ${estado.erros}`;
  buscarElemento('#final').showModal();
}

/* =========================================================
   EVENTOS (botões fixos da página)
   ========================================================= */
buscarElemento('#btn-iniciar').onclick = comecarHistoria;
buscarElemento('#btn-proxima').onclick = proximaFala;
buscarElemento('#btn-pular').onclick = terminarHistoria;
buscarElemento('#btn-tela-cheia').onclick = alternarTelaCheia;
buscarElemento('#btn-tela-cheia').hidden = !document.fullscreenEnabled; // some onde o navegador não suporta
document.onfullscreenchange = atualizarBotaoTelaCheia;     // também reage ao Esc
function abrirDiario() {
  const diario = buscarElemento('#diario');
  diario.showModal();
  diario.scrollTop = diario.scrollHeight; // abre na anotação mais recente
}

function fecharDiario() {
  buscarElemento('#diario').close();
}

function reiniciarJogo() {
  location.reload();
}

function manterFinalAberto(evento) {
  evento.preventDefault();
}

buscarElemento('#btn-diario').onclick = abrirDiario;
buscarElemento('#btn-calculadora').onclick = abrirCalculadoraBinaria;
buscarElemento('#btn-fechar-calculadora').onclick = fecharCalculadoraBinaria;
buscarElemento('#form-binario').onsubmit = calcularBinario;
buscarElemento('#form-binario').onreset = limparCalculoBinario;
buscarElemento('#btn-fechar-diario').onclick = fecharDiario;
buscarElemento('#btn-fechar-painel').onclick = fecharPainel;
buscarElemento('#btn-reiniciar').onclick = reiniciarJogo;
buscarElemento('#final').oncancel = manterFinalAberto;
atualizarRelogio();
