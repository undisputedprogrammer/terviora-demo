'use strict';

(() => {
  const nav = document.querySelector('.nav-glass');
  const search = document.querySelector('.search-shell');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');

  const syncNav = () => {
    const threshold = nav.classList.contains('is-scrolled') ? 24 : 40;
    nav.classList.toggle('is-scrolled', window.scrollY >= threshold);
  };
  syncNav();
  window.addEventListener('scroll', syncNav, { passive: true });
  if (!search) return;

  let sheenFrame = 0;
  let pointerX, pointerY;
  search.addEventListener('pointermove', event => {
    if (reducedMotion.matches || !finePointer.matches || event.pointerType !== 'mouse') return;
    pointerX = event.clientX;
    pointerY = event.clientY;
    if (sheenFrame) return;
    sheenFrame = requestAnimationFrame(() => {
      sheenFrame = 0;
      const panel = search.getBoundingClientRect();
      search.style.setProperty('--x', `${pointerX - panel.left}px`);
      search.style.setProperty('--y', `${pointerY - panel.top}px`);
      search.classList.add('has-sheen');
    });
  });

  const clearSheen = () => {
    cancelAnimationFrame(sheenFrame);
    sheenFrame = 0;
    search.classList.remove('has-sheen');
  };
  search.addEventListener('pointerleave', clearSheen);
  finePointer.addEventListener('change', clearSheen);

  reducedMotion.addEventListener('change', clearSheen);
})();
