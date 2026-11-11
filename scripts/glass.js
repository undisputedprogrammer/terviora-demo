'use strict';

(() => {
  const nav = document.querySelector('.nav-glass');

  const syncNav = () => {
    const threshold = nav.classList.contains('is-scrolled') ? 24 : 40;
    nav.classList.toggle('is-scrolled', window.scrollY >= threshold);
  };
  syncNav();
  window.addEventListener('scroll', syncNav, { passive: true });
})();
