'use strict';

(() => {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const navigation = performance.getEntriesByType('navigation')[0];
  if (navigation?.type === 'back_forward') return;
  if (navigation?.type === 'navigate' && document.referrer &&
      new URL(document.referrer).origin === location.origin) return;

  function playArrival() {
    if (reducedMotion.matches) return;
    const home = document.body.classList.contains('home-page');
    if (home && (location.hash || window.scrollY > 0)) return;
    const root = document.documentElement;
    const arrival = document.createElement('div');
    arrival.className = 'motion-arrival';
    if (home) arrival.classList.add('motion-arrival-home');
    arrival.setAttribute('aria-hidden', 'true');
    arrival.innerHTML = home ? `
      <div class="motion-arrival-brand">
        <img src="assets/brand/terviora-estates-icon.svg" width="64" height="64" alt="">
        <span class="motion-arrival-name">TERVIORA</span>
        <span class="motion-arrival-caption">ESTATES</span>
      </div>
      <span class="motion-arrival-track"></span>` : `
      <div class="motion-arrival-mark">
        <div class="motion-arrival-frame">
          <img src="assets/brand/terviora-estates-lockup.svg" width="1240" height="642" alt="">
        </div>
        <span class="motion-arrival-rule"></span>
      </div>`;

    const listeners = new AbortController();
    const options = { signal: listeners.signal };
    function finish(interrupted = false) {
      listeners.abort();
      clearTimeout(deadline);
      arrival.remove();
      if (interrupted || !root.classList.contains('motion-ready')) root.classList.remove('motion-opening');
    }

    const deadline = setTimeout(finish, 2200);
    arrival.addEventListener('animationend', event => {
      if (event.animationName === (home ? 'terviora-fade-out' : 'terviora-curtain-top')) finish();
    }, options);
    for (const event of ['keydown', 'pointerdown', 'pagehide']) {
      window.addEventListener(event, () => finish(true), { ...options, capture: true });
    }
    if (home) window.addEventListener('scroll', () => finish(true), { ...options, passive: true });
    reducedMotion.addEventListener('change', () => finish(true), options);
    root.classList.add('motion-opening');
    document.body.prepend(arrival);
  }

  if (document.hidden) document.addEventListener('visibilitychange', playArrival, { once: true });
  else playArrival();
})();
