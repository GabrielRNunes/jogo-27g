'use strict';

/* Formulário fictício: simula uma resposta sem enviar dados.
   Os eventos abaixo cuidam do contador, da limpeza e do envio simulado. */
const formulario = document.querySelector('#form-contato');
const retorno = document.querySelector('#retorno');
const campoNome = document.querySelector('#nome');
const campoMensagem = document.querySelector('#mensagem');
const contador = document.querySelector('#contador');

const RESPOSTAS = [
  'A equipe analisou seu relato com a atenção de um técnico de TI em lockdown.',
  'Mensagem recebida. O Kairo mandou lembranças, mas não disse de onde.',
  'Obrigado! Sua mensagem foi arquivada no diário de bordo da organização.',
  'Recebido. A segurança foi avisada, mas está demorando para chegar.'
];

function atualizarContador() {
  contador.textContent = campoMensagem.value.length + '/500';
}

function limparContador() {
  // O evento reset acontece antes de o navegador esvaziar os campos.
  contador.textContent = '0/500';
}

function enviarMensagem(evento) {
  evento.preventDefault();
  const nome = campoNome.value.trim();
  retorno.textContent = 'Enviando...';

  // A espera de 1,2 segundo simula o tempo de uma resposta.
  setTimeout(function () {
    const numeroProtocolo = Math.floor(1000 + Math.random() * 9000);
    const protocolo = 'KRO-' + numeroProtocolo;
    const indiceResposta = Math.floor(Math.random() * RESPOSTAS.length);
    const resposta = RESPOSTAS[indiceResposta];
    const hora = new Date().toLocaleTimeString('pt-BR');
    retorno.textContent = `Obrigado, ${nome}! Protocolo ${protocolo} às ${hora}. ${resposta}`;
    formulario.reset();
  }, 1200);
}

campoMensagem.oninput = atualizarContador;
formulario.onreset = limparContador;
formulario.onsubmit = enviarMensagem;
