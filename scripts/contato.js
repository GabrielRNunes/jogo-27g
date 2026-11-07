'use strict';

/* Formulário fictício: simula uma resposta sem enviar dados.
   Os eventos abaixo cuidam do contador, da limpeza e do envio simulado. */
const formulario = document.querySelector('#form-contato');
const retorno = document.querySelector('#retorno');
const campoNome = document.querySelector('#nome');
const campoMensagem = document.querySelector('#mensagem');
const contador = document.querySelector('#contador');
const botaoEnviar = document.querySelector('#enviar-contato');
const gruposDeCampos = formulario.querySelectorAll('fieldset');
let envioPendente = null;

function bloquearCampos(bloquear) {
  botaoEnviar.disabled = bloquear;
  for (const grupo of gruposDeCampos) grupo.disabled = bloquear;
}

const RESPOSTAS = [
  'Simulação concluída. Nenhuma mensagem foi enviada ao desenvolvedor.',
  'Este protocolo é demonstrativo e não corresponde a um atendimento real.',
  'Relato de teste processado apenas nesta página. Nenhum e-mail foi enviado.',
  'Demonstração concluída. Para um contato real, utilize o e-mail informado abaixo.'
];

function atualizarContador() {
  contador.textContent = campoMensagem.value.length + '/500';
}

function limparContador() {
  // O evento reset acontece antes de o navegador esvaziar os campos.
  contador.textContent = '0/500';
  if (envioPendente !== null) clearTimeout(envioPendente);
  envioPendente = null;
  bloquearCampos(false);
  retorno.textContent = '';
}

function enviarMensagem(evento) {
  evento.preventDefault();
  if (envioPendente !== null) return;
  if (!formulario.checkValidity()) {
    formulario.reportValidity();
    return;
  }
  const nome = campoNome.value.trim();
  if (!nome) {
    retorno.textContent = traduzir('Preencha seu nome para continuar.');
    campoNome.focus();
    return;
  }
  bloquearCampos(true);
  retorno.textContent = traduzir('Enviando...');

  // A espera de 1,2 segundo simula o tempo de uma resposta.
  envioPendente = setTimeout(function () {
    envioPendente = null;
    bloquearCampos(false);
    const numeroProtocolo = Math.floor(1000 + Math.random() * 9000);
    const protocolo = 'KRO-' + numeroProtocolo;
    const indiceResposta = Math.floor(Math.random() * RESPOSTAS.length);
    const resposta = RESPOSTAS[indiceResposta];
    const hora = new Date().toLocaleTimeString(idiomaIngles ? 'en-US' : 'pt-BR');
    formulario.reset();
    retorno.textContent = traduzir('Obrigado, ') + nome + '! ' + traduzir('Protocolo ') + protocolo + ' ' + traduzir('às ') + hora + '. ' + traduzir(resposta);
  }, 1200);
}

campoMensagem.oninput = atualizarContador;
formulario.onreset = limparContador;
formulario.onsubmit = enviarMensagem;

// Só libera o envio depois de os eventos da simulação estarem instalados.
bloquearCampos(false);
