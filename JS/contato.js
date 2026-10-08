'use strict';

/* Formulário FAKE: nada é enviado. Demonstra eventos, tempo e dados aleatórios. */
const form = document.querySelector('#form-contato');
const retorno = document.querySelector('#retorno');
const campoMensagem = document.querySelector('#mensagem');
const contador = document.querySelector('#contador');

// Vetor de textos
const RESPOSTAS = [
  'A equipe analisou seu relato com a atenção de um técnico de TI em lockdown.',
  'Mensagem recebida. O Kairo mandou lembranças, mas não disse de onde.',
  'Obrigado! Sua mensagem foi arquivada no diário de bordo da organização.',
  'Recebido. A segurança foi avisada, mas está demorando para chegar.'
];

// Evento input: contador de caracteres
campoMensagem.addEventListener('input', () => {
  contador.textContent = `${campoMensagem.value.length}/500`;
});

// Evento submit + controle de tempo + dados aleatórios
form.addEventListener('submit', (evento) => {
  evento.preventDefault();
  const nome = document.querySelector('#nome').value.trim();
  retorno.textContent = 'Enviando...';

  setTimeout(() => {
    const protocolo = `KRO-${Math.floor(1000 + Math.random() * 9000)}`;
    const resposta = RESPOSTAS[Math.floor(Math.random() * RESPOSTAS.length)];
    const hora = new Date().toLocaleTimeString('pt-BR');
    retorno.textContent = `Obrigado, ${nome}! Protocolo ${protocolo} às ${hora}. ${resposta}`;
    form.reset();
    contador.textContent = '0/500';
  }, 1200);
});