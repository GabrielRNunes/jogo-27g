'use strict';

// O HTML começa com os links abertos: a navegação também funciona sem JavaScript.
// A função é executada uma vez ao carregar a página; seus eventos seguem ativos.
// matchMedia acompanha o mesmo limite de largura usado no CSS.
(function prepararMenu() {
  const menu = document.querySelector('.menu-navegacao');
  if (!menu || typeof window.matchMedia !== 'function') return;
  const telaPequena = window.matchMedia('(max-width: 700px)');
  const botaoMenu = menu.querySelector('summary');

  function ajustarMenu() {
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
  if (typeof telaPequena.addEventListener === 'function') {
    telaPequena.addEventListener('change', ajustarMenu);
  } else if (typeof telaPequena.addListener === 'function') {
    telaPequena.addListener(ajustarMenu);
  }
  document.addEventListener('keydown', fecharComEscape);
})();
