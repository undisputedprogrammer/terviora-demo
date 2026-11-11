'use strict';

(() => {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const root = document.documentElement;

  for (const event of ['pageswap', 'pagereveal']) {
    window.addEventListener(event, ({ viewTransition }) => {
      // Native navigation can skip a crossfade when the motion preference changes.
      viewTransition?.ready.catch(() => {});
    });
  }

  function playArrival() {
    const brand = document.querySelector('.site-header .brand-logo img');
    const visit = performance.getEntriesByType('navigation')[0];
    if (!brand || reducedMotion.matches || location.hash || window.scrollY || document.hidden ||
        document.activeElement !== document.body || (visit && visit.type !== 'navigate')) return;

    try {
      if (sessionStorage.getItem('terviora-arrived')) return;
      sessionStorage.setItem('terviora-arrived', '1');
    } catch {
      // Keep the opener on the landing page when session storage is unavailable.
      if (!document.querySelector('.hero-screen')) return;
    }

    const arrival = document.createElement('div');
    arrival.className = 'motion-arrival';
    arrival.setAttribute('aria-hidden', 'true');
    arrival.innerHTML = '<div class="motion-arrival-mark"><div class="motion-arrival-frame"></div><span class="motion-arrival-rule"></span></div>';
    const logo = brand.cloneNode();
    logo.alt = '';
    arrival.querySelector('.motion-arrival-frame').append(logo);

    const listeners = new AbortController();
    function finish(interrupted = false) {
      listeners.abort();
      clearTimeout(deadline);
      arrival.remove();
      if (interrupted) root.classList.remove('motion-opening');
    }

    const deadline = setTimeout(() => finish(), 1500);
    const options = { signal: listeners.signal };
    arrival.addEventListener('animationend', event => {
      if (event.animationName === 'terviora-curtain-top') finish();
    }, options);
    for (const event of ['keydown', 'pointerdown']) {
      window.addEventListener(event, () => finish(true), { ...options, capture: true });
    }
    window.addEventListener('pagehide', () => finish(true), options);
    reducedMotion.addEventListener('change', () => finish(true), options);
    root.classList.add('motion-opening');
    document.body.prepend(arrival);
  }

  function installPointerMotion() {
    const finePointer = matchMedia('(hover: hover) and (pointer: fine) and (forced-colors: none)');
    const hero = document.querySelector('.hero-screen');
    const media = hero?.querySelector('.hero-media');
    const pointer = document.createElement('div');
    pointer.className = 'motion-pointer';
    pointer.setAttribute('aria-hidden', 'true');
    document.body.append(pointer);

    let frame = 0;
    let latest;
    const reset = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      pointer.classList.remove('is-visible');
      hero?.classList.remove('is-tracking');
    };

    function draw() {
      frame = 0;
      const { clientX: x, clientY: y, target } = latest;
      if (!(target instanceof Element)) {
        reset();
        return;
      }
      const hasPointer = !target.closest('input, textarea, [contenteditable], [role="combobox"], dialog, .choice-menu');
      pointer.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      pointer.classList.toggle('is-visible', hasPointer);
      pointer.classList.toggle('is-action', Boolean(target.closest('a[href], button:not(:disabled), summary')));

      if (!media) return;
      const tracking = hero.contains(target);
      hero.classList.toggle('is-tracking', tracking);
      if (!tracking) return;
      const rect = media.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const lightX = Math.min(rect.width, Math.max(0, x - rect.left));
      const lightY = Math.min(rect.height, Math.max(0, y - rect.top));
      media.style.setProperty('--hero-light-x', `${lightX}px`);
      media.style.setProperty('--hero-light-y', `${lightY}px`);
      media.style.setProperty('--hero-depth-x', lightX / rect.width - .5);
      media.style.setProperty('--hero-depth-y', lightY / rect.height - .5);
    }

    window.addEventListener('pointermove', event => {
      if (reducedMotion.matches || !finePointer.matches || event.pointerType !== 'mouse') return;
      latest = event;
      if (!frame) frame = requestAnimationFrame(draw);
    }, { passive: true });
    window.addEventListener('pointerout', event => { if (!event.relatedTarget) reset(); });
    window.addEventListener('blur', reset);
    window.addEventListener('scroll', () => hero?.classList.remove('is-tracking'), { passive: true });
    window.addEventListener('keydown', reset);
    finePointer.addEventListener('change', reset);
    reducedMotion.addEventListener('change', reset);
  }

  function installHeroVideo() {
    const video = document.querySelector('#hero-video');
    if (!video) return;
    const toggle = document.querySelector('.hero-video-toggle');
    let pausedByVisitor = false;
    const play = () => video.play().catch(() => {});
    const updateLabel = () => { toggle.textContent = video.paused ? 'Play video' : 'Pause video'; };
    video.addEventListener('play', updateLabel);
    video.addEventListener('pause', updateLabel);
    video.addEventListener('error', () => { toggle.hidden = true; });
    toggle.addEventListener('click', () => {
      pausedByVisitor = !video.paused;
      if (pausedByVisitor) video.pause();
      else play();
    });
    reducedMotion.addEventListener('change', () => {
      if (reducedMotion.matches) video.pause();
      else if (!pausedByVisitor) play();
    });
    toggle.hidden = false;
    if (!reducedMotion.matches) play();
  }

  playArrival();
  root.classList.add('motion-ready');
  installHeroVideo();
  installPointerMotion();

  if (!window.IntersectionObserver) return;
  const observer = new IntersectionObserver(entries => {
    for (const { target, isIntersecting } of entries) {
      if (!isIntersecting) continue;
      observer.unobserve(target);
      if (!reducedMotion.matches && !target.contains(document.activeElement)) {
        target.classList.add('motion-reveal');
      }
    }
  }, { rootMargin: '0px 0px 24px' });

  const observe = (elements, effect) => {
    for (const [index, element] of Array.from(elements).entries()) {
      element.dataset.motion = effect;
      element.style.setProperty('--motion-step', index % 3);
      observer.observe(element);
    }
  };

  const blocks = {
    heading: 'main > section .section-heading, .detail-related-heading, .footer-top',
    slide: '.guide-story, .process-panel, .owner-copy, .alerts-section > div, .faq-section > div:first-child',
    photo: '.process-photo, .owner-section figure, .sell-prep',
    row: '.guide-item, .faq-list details, .footer-columns > div',
    measure: '.trust-grid article',
    rise: '.collection-footer, .alerts-section > form, .detail-about, .enquiry-related, .footer-bottom'
  };
  for (const [effect, selector] of Object.entries(blocks)) observe(document.querySelectorAll(selector), effect);

  for (const grid of document.querySelectorAll('.property-grid, .latest-grid, .category-grid')) {
    observe(grid.children, 'card');
    if (grid.matches('#results-grid, #latest-grid')) {
      new MutationObserver(records => {
        for (const { addedNodes, removedNodes } of records) {
          for (const node of removedNodes) {
            if (node instanceof Element) observer.unobserve(node);
          }
          observe([...addedNodes].filter(node => node instanceof Element), 'card');
        }
      }).observe(grid, { childList: true });
    }
  }

  for (const eventName of ['animationend', 'animationcancel']) {
    document.addEventListener(eventName, event => {
      if (event.target.matches('.motion-reveal') && !event.pseudoElement) {
        event.target.classList.remove('motion-reveal');
      }
    });
  }
})();
