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

  function installPointerMotion() {
    const finePointer = matchMedia('(hover: hover) and (pointer: fine) and (forced-colors: none)');
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
    };

    function draw() {
      frame = 0;
      const { clientX: x, clientY: y, target } = latest;
      if (!(target instanceof Element)) {
        reset();
        return;
      }
      const hasPointer = !target.closest('.hero-screen, input, textarea, [contenteditable], [role="combobox"], dialog, .choice-menu');
      pointer.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      pointer.classList.toggle('is-visible', hasPointer);
      pointer.classList.toggle('is-action', Boolean(target.closest('a[href], button:not(:disabled), summary')));
    }

    window.addEventListener('pointermove', event => {
      if (reducedMotion.matches || !finePointer.matches || event.pointerType !== 'mouse') return;
      latest = event;
      if (!frame) frame = requestAnimationFrame(draw);
    }, { passive: true });
    window.addEventListener('pointerout', event => { if (!event.relatedTarget) reset(); });
    window.addEventListener('blur', reset);
    window.addEventListener('scroll', reset, { passive: true });
    window.addEventListener('keydown', reset);
    finePointer.addEventListener('change', reset);
    reducedMotion.addEventListener('change', reset);
  }

  function installHeroVideo() {
    const video = document.querySelector('#hero-video');
    if (!video) return;
    const play = () => video.play().catch(() => {});
    reducedMotion.addEventListener('change', () => {
      if (reducedMotion.matches) video.pause();
      else play();
    });
    if (!reducedMotion.matches) play();
  }

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
