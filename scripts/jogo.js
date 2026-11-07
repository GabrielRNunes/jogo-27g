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
  fechadura: '264781' // Pares concatenados: terminal (26), rack (47), cofre (81).
};

const estado = {
  tempo: TEMPO_TOTAL,
  tempoRestanteMs: TEMPO_TOTAL * 1000,
  ultimaAtualizacao: null,
  erros: 0,
  cenario: 'quarto',
  inventario: [],
  diario: [],
  selecionado: null,
  fala: 0, // posição atual no diálogo da história
  energia: false,
  rodando: false,
  pausaCalculo: false,
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
  cartao: { nome: 'Cartão de acesso', descricao: 'Cartão magnético com a sigla SRV. Parece servir para o leitor do rack de servidores.' },
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
    dica: 'Nem toda pista fica sobre uma mesa. Vale olhar perto do chão...',
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
  buscarElemento('#mensagem').textContent = traduzir(texto);
}

function registrar(texto, tipo = 'nota') {
  estado.diario.push({
    quando: formatarTempo(estado.tempo),
    texto,
    tipo,
    cenario: CENARIOS[estado.cenario].nome
  });
  mensagem(texto);
  if (dialogoAberto(buscarElemento('#diario'))) atualizarDiario();
  atualizarMarcas();
}

function erro(motivo) {
  if (!partidaAtiva()) return;
  estado.erros++;
  estado.tempoRestanteMs = Math.max(0, estado.tempoRestanteMs - PENALIDADE_ERRO * 1000);
  estado.tempo = Math.ceil(estado.tempoRestanteMs / 1000);
  buscarElemento('#erros').textContent = String(estado.erros);
  atualizarRelogio();
  registrar(`Erro: ${motivo} (-${PENALIDADE_ERRO} s)`, 'erro');
  if (estado.tempo === 0) finalizar('capturado');
}

function atualizarDiario() {
  let conteudo = '';
  let falhas = 0;
  for (let indice = estado.diario.length - 1; indice >= 0; indice--) {
    const registro = estado.diario[indice];
    const ehFalha = registro.tipo === 'erro';
    let categoria = 'Anotação';
    if (ehFalha) {
      categoria = 'Falha';
      falhas++;
    }
    conteudo += `<li class="registro-diario ${registro.tipo}">
      <div class="registro-cabecalho">
        <span class="registro-categoria">${categoria}</span>
        <span class="hora">Tempo restante: ${registro.quando}</span>
      </div>
      <p class="registro-local">${registro.cenario}</p>
      <p class="registro-texto">${registro.texto}</p>
    </li>`;
  }

  if (estado.diario.length === 0) {
    conteudo = '<li class="diario-vazio">Sua investigação ainda não começou. Ao explorar os ambientes, as descobertas e falhas serão registradas aqui.</li>';
  }

  const quantidade = estado.diario.length;
  let resumo = 'Nenhum registro nesta partida.';
  if (quantidade > 0) {
    const unidadeRegistro = quantidade === 1 ? 'registro' : 'registros';
    const unidadeFalha = falhas === 1 ? 'falha' : 'falhas';
    resumo = `${quantidade} ${unidadeRegistro} nesta partida · ${falhas} ${unidadeFalha}`;
  }
  buscarElemento('#diario-resumo').textContent = traduzir(resumo);
  buscarElemento('#lista-log').innerHTML = traduzirHTML(conteudo);
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
  buscarElemento('#inventario').innerHTML = traduzirHTML(conteudo);
}

// Um único evento atende todos os botões, inclusive após atualizar o inventário.
function selecionarItem(evento) {
  if (!partidaAtiva()) return;
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
// Navegadores com dialog nativo usam seus recursos de foco e modalidade.
// A alternativa abaixo mantém os painéis utilizáveis quando showModal não existe.
let dialogoAlternativo = null;
let focoAntesDoDialogo = null;

function dialogoAberto(dialogo) {
  return dialogo.hasAttribute('open');
}

function abrirDialogo(dialogo) {
  if (dialogoAberto(dialogo)) return;
  if (typeof dialogo.showModal === 'function') {
    dialogo.showModal();
    return;
  }
  focoAntesDoDialogo = document.activeElement;
  dialogoAlternativo = dialogo;
  dialogo.setAttribute('open', '');
  dialogo.setAttribute('role', 'dialog');
  dialogo.setAttribute('aria-modal', 'true');
  dialogo.classList.add('dialogo-alternativo');
  document.body.classList.add('painel-alternativo-aberto');
  buscarElemento('#fundo-dialogo').hidden = false;
  const primeiroControle = dialogo.querySelector('input, button, summary, [tabindex="0"], a[href]');
  if (primeiroControle) primeiroControle.focus();
}

function fecharDialogo(dialogo) {
  if (!dialogoAberto(dialogo)) return;
  if (typeof dialogo.close === 'function') {
    dialogo.close();
    return;
  }
  dialogo.removeAttribute('open');
  dialogo.removeAttribute('aria-modal');
  dialogo.classList.remove('dialogo-alternativo');
  buscarElemento('#fundo-dialogo').hidden = true;
  document.body.classList.remove('painel-alternativo-aberto');
  dialogoAlternativo = null;
  if (focoAntesDoDialogo && focoAntesDoDialogo.isConnected) focoAntesDoDialogo.focus();
  focoAntesDoDialogo = null;
}

function navegarNoDialogoAlternativo(evento) {
  if (!dialogoAlternativo) return;
  if (evento.key === 'Escape') {
    evento.preventDefault();
    if (dialogoAlternativo.id === 'painel') fecharPainel();
    else if (dialogoAlternativo.id === 'diario') fecharDiario();
    return;
  }
  if (evento.key !== 'Tab') return;
  const controles = Array.from(dialogoAlternativo.querySelectorAll('button, input, summary, a[href], [tabindex="0"]'))
    .filter(function (controle) { return !controle.disabled && controle.getClientRects().length > 0; });
  if (controles.length === 0) return;
  const primeiro = controles[0];
  const ultimo = controles[controles.length - 1];
  if (evento.shiftKey && document.activeElement === primeiro) {
    evento.preventDefault();
    ultimo.focus();
  } else if (!evento.shiftKey && document.activeElement === ultimo) {
    evento.preventDefault();
    primeiro.focus();
  }
}

document.addEventListener('keydown', navegarNoDialogoAlternativo);

let painelAtual = {}; // funções do painel aberto: aoEnviar, aoClicar, aoTecla, aoFechar

function abrirPainel(titulo, corpo, funcoes = {}) {
  if (estado.fim) return;
  fecharPainel();
  painelAtual = funcoes;
  buscarElemento('#painel-titulo').textContent = traduzir(titulo);
  buscarElemento('#painel-corpo').innerHTML = traduzirHTML(corpo);
  document.onkeydown = funcoes.aoTecla || null;
  abrirDialogo(buscarElemento('#painel'));
}

function limparPainel() {
  if (painelAtual.aoFechar) painelAtual.aoFechar();
  definirPausaCalculo(false);
  document.onkeydown = null;
  painelAtual = {};
}

function fecharPainel() {
  const painel = buscarElemento('#painel');
  fecharDialogo(painel);
  limparPainel();
}

// Esc fecha o dialog sem passar por fecharPainel(): limpa aqui também
function aoFecharPainel() {
  if (!dialogoAberto(buscarElemento('#painel'))) limparPainel();
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
  if (!partidaAtiva() || !painelAtual.aoEnviar) return;

  const formulario = evento.target;
  const campo = formulario.querySelector('input');
  const aviso = formulario.querySelector('[role="alert"]');
  const codigoDigitado = campo.value.trim().toUpperCase();
  const resposta = painelAtual.aoEnviar(codigoDigitado);

  // Uma resposta vazia significa que o código foi aceito.
  // Se o erro zerou o tempo, finalizar() já fechou o painel.
  if (estado.fim) return;
  aviso.textContent = traduzir(resposta || '');
  if (!resposta) {
    fecharPainel();
  } else {
    campo.select();
  }
}

function clicarNoPainel(evento) {
  if (!partidaAtiva()) return;
  const botaoSeta = evento.target.closest('[data-tecla]');
  if (botaoSeta && painelAtual.aoSeta) {
    painelAtual.aoSeta(botaoSeta.dataset.tecla);
    return;
  }
  const botaoFio = evento.target.closest('[data-fio]');
  if (botaoFio && painelAtual.aoClicar) {
    const indiceFio = Number(botaoFio.dataset.fio);
    painelAtual.aoClicar(indiceFio);
  }
}

buscarElemento('#painel-corpo').onsubmit = enviarCodigo;
buscarElemento('#painel-corpo').onclick = clicarNoPainel;

/* ---------- Calculadora opcional: mostra a conta digitada pelo jogador ---------- */
function alternarCalculadoraBinaria() {
  if (!partidaAtiva()) return;
  const calculadora = buscarElemento('#calculadora-binaria');
  const botao = buscarElemento('#btn-calculadora-pc');
  calculadora.hidden = !calculadora.hidden;
  definirPausaCalculo(!calculadora.hidden);
  botao.setAttribute('aria-expanded', String(!calculadora.hidden));
  if (calculadora.hidden) {
    botao.textContent = traduzir('Abrir calculadora binária');
    botao.focus();
  } else {
    botao.textContent = traduzir('Recolher calculadora binária');
    buscarElemento('#numero-binario').focus();
  }
}

function definirPausaCalculo(pausar) {
  const devePausar = pausar && estado.rodando && !estado.fim;
  if (estado.pausaCalculo === devePausar) return;

  sincronizarTempo();
  estado.pausaCalculo = devePausar;
  clearInterval(estado.cronometro);
  estado.cronometro = null;

  // Ao sair do apoio, retoma uma única contagem, a partir do segundo seguinte.
  if (estado.rodando && !estado.fim && !devePausar) {
    estado.ultimaAtualizacao = Date.now();
    estado.cronometro = setInterval(contarSegundo, 250);
  }
  atualizarRelogio();
}

function calcularBinario(evento) {
  evento.preventDefault();
  evento.stopPropagation();
  const numeroBinario = buscarElemento('#numero-binario').value.trim();
  const resultado = buscarElemento('#resultado-binario');
  if (!/^[01]{4}$/.test(numeroBinario)) {
    resultado.textContent = traduzir('Digite exatamente quatro bits, usando apenas 0 e 1.');
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
  resultado.innerHTML = traduzirHTML(resultado.innerHTML);
}

function limparCalculoBinario() {
  buscarElemento('#resultado-binario').textContent = '';
}

/* =========================================================
   OBJETOS INTERATIVOS (10 enigmas + lixeira com o bilhete secreto)
   pos = [left%, top%, largura%, altura%]
   ========================================================= */
const objetos = {
  // 1 - Calendário: pista da data e da senha do terminal
  calendario: {
    cenario: 'quarto', nome: 'Calendário da final', pos: [6.2, 13.3, 15.0, 25.6],
    inspecionado: false, resolvido: false,
    interagir() {
      if (this.inspecionado) return mensagem('Calendário já consultado. A data e a senha estão no diário de bordo.');
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
            if (!estado.fim && terminal.falhas % 2 === 0) objetos.gaveta.bloquear();
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
        verificarSeta(evento.key);
      }

      function verificarSeta(tecla) {
        if (!partidaAtiva()) return;
        if (tecla === sequencia[passoAtual]) {
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
        <p>Repita a sequência com as setas do teclado ou os botões abaixo. Uma seta incorreta reinicia a sequência.</p>
        <p class="sequencia" role="status"></p>
        <div class="setas-toque" role="group" aria-label="Setas do painel de comandos">
          <button type="button" data-tecla="ArrowUp">↑ Cima</button>
          <button type="button" data-tecla="ArrowLeft">← Esquerda</button>
          <button type="button" data-tecla="ArrowDown">↓ Baixo</button>
          <button type="button" data-tecla="ArrowRight">→ Direita</button>
        </div>`, { aoTecla: verificarTecla, aoSeta: verificarSeta });
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
        <button type="button" id="btn-calculadora-pc" aria-expanded="false" aria-controls="calculadora-binaria">Abrir calculadora binária</button>
        <section id="calculadora-binaria" aria-label="Apoio para converter binário" hidden>
          <p>Use se precisar: digite um grupo de quatro bits para ver como a conta funciona. Os pesos são <strong>8, 4, 2 e 1</strong>, da esquerda para a direita.</p>
          <form id="form-binario">
            <label for="numero-binario">Grupo de quatro bits</label>
            <input id="numero-binario" type="text" inputmode="numeric" pattern="[01]{4}" minlength="4" maxlength="4" placeholder="Ex.: 0101" aria-describedby="orientacao-binaria" required>
            <p id="orientacao-binaria">Use apenas 0 e 1. Cada 1 inclui o peso da posição; cada 0 vale zero na soma.</p>
            <button type="submit">Calcular e entender</button>
            <button type="reset">Limpar conta</button>
          </form>
          <div id="resultado-binario" role="status" aria-live="polite" aria-atomic="true"></div>
          <p>Converta cada grupo separadamente e mantenha a ordem dos dígitos. A contagem fica pausada enquanto este apoio estiver aberto e volta ao recolher a calculadora ou fechar o painel.</p>

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
        </details>
        </section>`);
      buscarElemento('#btn-calculadora-pc').onclick = alternarCalculadoraBinaria;
      buscarElemento('#form-binario').onsubmit = calcularBinario;
      buscarElemento('#form-binario').onreset = limparCalculoBinario;
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
        buscarElemento('#painel-corpo [role="status"]').textContent = traduzir(texto);
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
        if (!partidaAtiva() || !podeClicar) return;
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
      if (this.resolvido) return mensagem('O cofre está aberto. O fragmento de PIN já foi registrado no diário de bordo.');
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

  // 10 - Fechadura final: junte os pares do terminal, rack e cofre, nessa ordem.
  fechadura: {
    cenario: 'corredor', nome: 'Fechadura programável', pos: [37.5, 15.6, 25.0, 52.2],
    resolvido: false,
    interagir() {
      const fechadura = this;
      abrirPainel('Fechadura programável', `
        <p>Junte os pares encontrados no terminal do quarto, no rack de servidores e no cofre do troféu, nessa ordem. O PIN tem seis dígitos; não some os valores.</p>
        ${criarFormularioCodigo('PIN de 6 dígitos:', 6)}`, {
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

  // A lixeira precisa ser examinada, e o bilhete deve ser recolhido pelo jogador.
  lixeira: {
    cenario: 'cozinha', nome: 'Lixeira', pos: [83.4, 78.2, 9.0, 18.0],
    resolvido: false,
    interagir() {
      if (this.resolvido) return mensagem('Você já recolheu o bilhete. Só restaram embalagens na lixeira.');
      const lixeira = this;
      abrirPainel('Lixeira', `
        <p>Você afasta algumas embalagens e encontra um papel dobrado no fundo da lixeira. Há um nome escrito nele: Kairo.</p>
        <button type="button" id="btn-recolher-bilhete">Recolher e ler o bilhete</button>`);

      function recolherBilhete() {
        if (!partidaAtiva() || lixeira.resolvido) return;
        lixeira.resolvido = true;
        adicionarItem('bilhete');
        registrar('Bilhete encontrado na lixeira: "Fui por vontade própria. Se achar isto, não chame a segurança."');
        fecharPainel();
      }

      buscarElemento('#btn-recolher-bilhete').onclick = recolherBilhete;
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

  let acoes = '';
  for (const porta of cenarioAtual.portas) {
    acoes += `<button type="button" data-destino="${porta.destino}">Ir para: ${CENARIOS[porta.destino].nome}</button>`;
  }
  for (const objeto of Object.values(objetos)) {
    if (objeto.cenario === estado.cenario) {
      acoes += `<button type="button" data-obj="${objeto.id}">${objeto.nome}</button>`;
    }
  }
  buscarElemento('#lista-acoes-cenario').innerHTML = traduzirHTML(acoes);
  const areaCenario = buscarElemento('#cenario');
  areaCenario.className = `cenario cena-${estado.cenario}`;
  areaCenario.innerHTML = traduzirHTML(conteudo);
  buscarElemento('#nome-cenario').textContent = traduzir(cenarioAtual.nome);
  atualizarMarcas();
}

function irPara(destino) {
  estado.cenario = destino;
  atualizarCenario();
  const { nome, dica } = CENARIOS[destino];
  mensagem(`Você entrou em: ${nome}. ${dica && !objetos.lixeira.resolvido ? dica : ''}`);
  if (dica && !objetos.lixeira.resolvido && !objetos.lixeira.dicaNoDiario) {
    objetos.lixeira.dicaNoDiario = true; // a dica também fica no diário, para reler depois
    registrar(`${nome}: ${dica}`);
  }
  buscarElemento('#nome-cenario').focus();
}

// Delegação: um único onclick para portas e objetos de qualquer cenário
function interagirComCenario(evento) {
  const botao = evento.target.closest('button');
  if (!botao || !partidaAtiva()) return;
  if (botao.dataset.destino) irPara(botao.dataset.destino);
  else if (botao.dataset.obj) objetos[botao.dataset.obj].interagir();
}

buscarElemento('#cenario').onclick = interagirComCenario;
buscarElemento('#lista-acoes-cenario').onclick = interagirComCenario;

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
  const tempoFormatado = formatarTempo(estado.tempo);
  if (relogio.textContent !== tempoFormatado) relogio.textContent = tempoFormatado;
  relogio.classList.toggle('urgente', estado.tempo <= 60);
  relogio.classList.toggle('pausado', estado.pausaCalculo);

  let aviso = 'Aguardando início';
  if (estado.fim) aviso = 'Partida encerrada';
  else if (estado.pausaCalculo) aviso = 'Pausado para o cálculo';
  else if (estado.rodando) aviso = 'Em andamento';
  const status = buscarElemento('#status-cronometro');
  aviso = traduzir(aviso);
  if (status.textContent !== aviso) status.textContent = aviso;
}

function iniciar() {
  if (estado.rodando || estado.fim) return;
  estado.rodando = true;
  buscarElemento('#intro').hidden = true;
  buscarElemento('#jogo').hidden = false;
  atualizarCenario();
  atualizarInventario();
  registrar('Contenção ativa. Você tem 5 minutos para reunir as pistas e reprogramar a fechadura do corredor de saída.');
  estado.ultimaAtualizacao = Date.now();
  estado.cronometro = setInterval(contarSegundo, 250);
  atualizarRelogio();
}

// Usa o tempo decorrido, pois temporizadores podem atrasar em abas em segundo plano.
function sincronizarTempo() {
  if (!estado.rodando || estado.fim || estado.pausaCalculo) return;
  const agora = Date.now();
  const decorrido = Math.max(0, agora - estado.ultimaAtualizacao);
  estado.ultimaAtualizacao = agora;
  estado.tempoRestanteMs = Math.max(0, estado.tempoRestanteMs - decorrido);
  estado.tempo = Math.ceil(estado.tempoRestanteMs / 1000);
}

function contarSegundo() {
  if (!estado.rodando || estado.fim || estado.pausaCalculo) return;
  sincronizarTempo();
  atualizarRelogio();
  if (estado.tempo === 0) finalizar('capturado');
}

function partidaAtiva() {
  contarSegundo();
  return estado.rodando && !estado.fim;
}

/* =========================================================
   HISTÓRIA (diálogo antes do lockdown)
   O relógio só começa quando o diálogo termina.
   ========================================================= */
const HISTORIA = [
  {
    "quem": "narrador",
    "nome": "Narrador",
    "texto": "15 de novembro de 2026, 9h02. A final mundial começa às 18h. Kairo não compareceu ao treino das 6h e não responde às tentativas de contato. A última entrada registrada na ala privativa dele foi às 23h41 da noite anterior. Não há registro de saída."
  },
  {
    "quem": "seguranca",
    "nome": "Central de Segurança",
    "texto": "Precisamos verificar a ala e preservar os registros. Você tem autorização para a manutenção, mas o acesso aos ambientes privativos depende da permissão do morador."
  },
  {
    "quem": "voce",
    "nome": "Técnico de TI",
    "texto": "Configurei esse sistema no mês passado. Minha credencial permite entrar para manutenção. Vou verificar o terminal do quarto e procurar indícios do que aconteceu."
  },
  {
    "quem": "seguranca",
    "nome": "Central de Segurança",
    "texto": "O último contato visual com Kairo foi às 22h, depois do treino. O registro das 23h41 confirma que ele voltou à ala, mas não esclarece o que ocorreu depois. Não trate a ausência de um registro como prova de que ele continua aí."
  },
  {
    "quem": "narrador",
    "nome": "Narrador",
    "texto": "A credencial libera a entrada. Assim que você cruza a porta, a fechadura se fecha atrás de você. O indicador de acesso muda de verde para vermelho."
  },
  {
    "quem": "sistema",
    "nome": "Sistema de acesso",
    "texto": "Credencial de manutenção reconhecida. Permissão do morador ausente. Protocolo de contenção ativado. Alarme geral e intervenção da segurança em cinco minutos.",
    "cena": true
  },
  {
    "quem": "voce",
    "nome": "Técnico de TI",
    "texto": "A entrada foi aceita, mas a permissão interna não foi liberada. A porta principal está bloqueada. Ainda há uma saída de serviço no corredor acessível pela sala de servidores. Posso reprogramar sua fechadura com o PIN de recuperação."
  },
  {
    "quem": "seguranca",
    "nome": "Central de Segurança",
    "texto": "Recebemos o alerta. A equipe vai assumir o local quando a contagem terminar. Até lá, reúna as pistas e tente reverter o bloqueio. Depois da intervenção, sua investigação será encerrada."
  },
  {
    "quem": "sistema",
    "nome": "Sistema de acesso",
    "texto": "Códigos inválidos e falhas no quadro de fusíveis antecipam a intervenção em dez segundos por ocorrência. O acesso de manutenção permanece sob registro."
  },
  {
    "quem": "voce",
    "nome": "Técnico de TI",
    "texto": "Vou seguir as pistas entre os ambientes, recuperar o PIN e sair antes da intervenção. O que Kairo deixou aqui pode esclarecer por que ele desapareceu."
  },
  {
    "quem": "narrador",
    "nome": "Narrador",
    "texto": "À sua frente estão cinco ambientes interligados. Observe os objetos, confronte as pistas e decida o que vale investigar. Quando você avançar, começa a contagem de cinco minutos."
  }
];

function mostrarFala() {
  const fala = HISTORIA[estado.fala];
  const ultima = estado.fala === HISTORIA.length - 1;
  buscarElemento('#dialogo-nome').textContent = traduzir(fala.nome);
  buscarElemento('#dialogo-nome').className = `falante falante-${fala.quem}`;
  buscarElemento('#dialogo-texto').textContent = traduzir(fala.texto);
  buscarElemento('#dialogo-retrato').src = recursoLocal(`assets/historia/${fala.quem}.svg`);
  buscarElemento('#dialogo-cena').hidden = !fala.cena; // quadro de impacto só na fala do lockdown
  buscarElemento('#btn-proxima').textContent = traduzir(ultima ? 'Começar o lockdown' : 'Próxima');
}

function comecarHistoria() {
  if (estado.rodando || estado.fim) return;
  buscarElemento('#intro').hidden = true;
  buscarElemento('#dialogo').hidden = false;
  estado.fala = 0;
  mostrarFala();
  buscarElemento('#btn-proxima').focus();
}

function proximaFala() {
  if (estado.rodando || estado.fim) return;
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
  try {
    let pedido;
    if (document.fullscreenElement && typeof document.exitFullscreen === 'function') {
      pedido = document.exitFullscreen();
    } else if (typeof document.documentElement.requestFullscreen === 'function') {
      pedido = document.documentElement.requestFullscreen();
    } else {
      mensagem('A tela cheia não está disponível neste navegador. Você pode continuar jogando nesta janela.');
      return;
    }
    if (pedido && typeof pedido.catch === 'function') {
      pedido.catch(function () {
        mensagem('A tela cheia não foi autorizada. Você pode continuar jogando nesta janela.');
      });
    }
  } catch (falhaTelaCheia) {
    mensagem('Não foi possível abrir a tela cheia. Você pode continuar jogando nesta janela.');
  }
}

function atualizarBotaoTelaCheia() {
  buscarElemento('#btn-tela-cheia').textContent = traduzir(document.fullscreenElement ? 'Sair da tela cheia' : 'Tela cheia');
}

/* =========================================================
   FINAIS
   ========================================================= */
const FINAIS = {
  perfeito: {
    titulo: 'Final: Fuga Perfeita',
    texto: 'Você reprogramou a fechadura com pelo menos dois minutos restantes e no máximo uma falha. Saiu antes do alarme geral; quando a segurança assumiu a ala, o corredor estava vazio.',
    imagem: 'assets/finais/perfeito.svg?v=20261106-pin-concatenado',
    alt: 'Tira de quadrinhos em três quadros: sua mão digita o PIN no teclado, e o aviso BIP confirma; a porta destrava com um CLAC; você, aliviado e de fone no pescoço, vê o corredor vazio sob a luz da manhã.'
  },
  sequelas: {
    titulo: 'Final: Fuga com Sequelas',
    texto: 'Você reprogramou a fechadura antes de a contagem terminar, mas com menos de dois minutos restantes ou mais de uma falha. Os registros de acesso e as câmeras identificam sua passagem; a segurança vai pedir esclarecimentos.',
    imagem: 'assets/finais/sequelas.svg?v=20261106-revisao-narrativa',
    alt: 'Tira de quadrinhos em três quadros: o teclado confirma o acesso com um BIP; uma câmera de segurança com olho vermelho e a marca REC vigia você; você, assustado, foge sob uma luz vermelha de alerta.'
  },
  capturado: {
    titulo: 'Final: Capturado',
    texto: 'A contagem terminou antes de você reprogramar a fechadura. A segurança assumiu a ala e interrompeu a investigação. Você foi retido para prestar esclarecimentos sobre o acesso de manutenção.',
    imagem: 'assets/finais/capturado.svg',
    alt: 'Tira de quadrinhos em três quadros: um relógio digital marca 0:00 com o alarme tocando; dois guardas em silhueta abrem a porta com um CLAC; você, assustado, ergue as mãos. Game over.'
  },
  secreto: {
    titulo: 'Final Secreto: Ele Quis Sumir',
    texto: 'O bilhete revela que Kairo saiu por vontade própria. Com a fechadura reprogramada antes do fim da contagem, você apaga os registros locais da sua passagem e deixa a ala. Você descobriu que a ausência foi uma escolha; a motivação e o paradeiro dele continuam desconhecidos.',
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
  estado.cronometro = null;
  fecharDiario();
  fecharPainel();
  atualizarRelogio();
  buscarElemento('#final-titulo').textContent = traduzir(FINAIS[tipo].titulo);
  buscarElemento('#final').dataset.tipo = tipo; // o CSS muda a cor da borda por final
  buscarElemento('#final-imagem').src = recursoLocal(FINAIS[tipo].imagem);
  buscarElemento('#final-imagem').alt = traduzir(FINAIS[tipo].alt);
  buscarElemento('#final-texto').textContent = traduzir(FINAIS[tipo].texto);
  buscarElemento('#final-resumo').textContent = traduzir(`Tempo restante: ${formatarTempo(estado.tempo)} | Erros: ${estado.erros}`);
  abrirDialogo(buscarElemento('#final'));
}

/* =========================================================
   EVENTOS (botões fixos da página)
   ========================================================= */
buscarElemento('#btn-iniciar').onclick = comecarHistoria;
buscarElemento('#btn-proxima').onclick = proximaFala;
buscarElemento('#btn-pular').onclick = terminarHistoria;
buscarElemento('#btn-tela-cheia').onclick = alternarTelaCheia;
buscarElemento('#btn-tela-cheia').hidden = !document.fullscreenEnabled || typeof document.documentElement.requestFullscreen !== 'function'; // some onde o navegador não suporta
document.onfullscreenchange = atualizarBotaoTelaCheia;     // também reage ao Esc
function abrirDiario() {
  if (estado.fim) return;
  contarSegundo();
  if (estado.fim) return;
  atualizarDiario();
  const diario = buscarElemento('#diario');
  abrirDialogo(diario);
  buscarElemento('#diario-registros').scrollTop = 0; // a descoberta mais recente aparece primeiro
}

function fecharDiario() {
  fecharDialogo(buscarElemento('#diario'));
}

function reiniciarJogo() {
  location.reload();
}

function manterFinalAberto(evento) {
  evento.preventDefault();
}

buscarElemento('#btn-diario').onclick = abrirDiario;
buscarElemento('#btn-fechar-diario').onclick = fecharDiario;
buscarElemento('#btn-fechar-painel').onclick = fecharPainel;
buscarElemento('#btn-reiniciar').onclick = reiniciarJogo;
buscarElemento('#final').oncancel = manterFinalAberto;
atualizarRelogio();

// Reconcilia a contagem ao voltar de uma aba oculta ou do histórico do navegador.
document.addEventListener('visibilitychange', contarSegundo);
window.addEventListener('pageshow', contarSegundo);
buscarElemento('#btn-iniciar').disabled = false;
buscarElemento('#btn-diario').disabled = false;
buscarElemento('#estado-carregamento').hidden = true;
