'use strict';

(() => {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const navigation = performance.getEntriesByType('navigation')[0];
  if (navigation?.type === 'back_forward') return;
  if (navigation?.type === 'navigate' && document.referrer &&
      new URL(document.referrer).origin === location.origin) return;

  function playArrival() {
    if (reducedMotion.matches) return;
    const root = document.documentElement;
    const arrival = document.createElement('div');
    arrival.className = 'motion-arrival';
    arrival.setAttribute('aria-hidden', 'true');
    arrival.innerHTML = `
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
      if (event.animationName === 'terviora-curtain-top') finish();
    }, options);
    for (const event of ['keydown', 'pointerdown', 'pagehide']) {
      window.addEventListener(event, () => finish(true), { ...options, capture: true });
    }
    reducedMotion.addEventListener('change', () => finish(true), options);
    root.classList.add('motion-opening');
    document.body.prepend(arrival);
  }

  if (document.hidden) document.addEventListener('visibilitychange', playArrival, { once: true });
  else playArrival();
})();
