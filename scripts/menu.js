'use strict';

// O HTML começa com os links abertos: a navegação também funciona sem JavaScript.
// A função é executada uma vez ao carregar a página; seus eventos seguem ativos.
// matchMedia acompanha o mesmo limite de largura usado no CSS.
(function prepararMenu() {
  const menu = document.querySelector('.menu-navegacao');
  if (!menu || typeof window.matchMedia !== 'function') return;
  const telaPequena = window.matchMedia('(max-width: 700px)');
  const botaoMenu = menu.querySelector('summary');
  let estavaEmTelaPequena = null;

  function ajustarMenu() {
    // Só muda a abertura ao cruzar o limite. Redimensionar dentro da mesma
    // faixa não deve fechar um menu que a pessoa abriu manualmente.
    if (estavaEmTelaPequena === telaPequena.matches) return;
    estavaEmTelaPequena = telaPequena.matches;
    const focoDentro = menu.contains(document.activeElement);
    menu.open = !telaPequena.matches;
    // Ao recolher por mudança de largura, o foco não deve ficar em um link oculto.
    if (!menu.open && focoDentro) botaoMenu.focus();
  }

  function fecharComEscape(evento) {
    if (evento.defaultPrevented || document.querySelector('dialog[open]')) return;
    if (evento.key !== 'Escape' || !telaPequena.matches || !menu.open) return;
    menu.open = false;
    botaoMenu.focus();
  }

  ajustarMenu();
  telaPequena.onchange = ajustarMenu;
  // O redimensionamento também cobre navegadores que não avisam a mudança da consulta.
  window.onresize = ajustarMenu;
  // Teclas sobem do elemento para document e depois para window. O jogo trata
  // seus diálogos em document; o menu só age se a tecla ainda estiver disponível.
  window.onkeydown = fecharComEscape;
})();
