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
      const hasPointer = !target.closest('.hero-screen, .search-section, input, textarea, [contenteditable], [role="combobox"], dialog, .choice-menu');
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

  function installHeroScrubbing() {
    const video = document.querySelector('#hero-video');
    if (!video) return;

    const hero = video.closest('.hero');
    const stage = hero.parentElement;
    const phone = matchMedia('(max-width: 767px)');
    let animationFrame = 0;

    function render() {
      animationFrame = 0;
      if (!stage.classList.contains('is-scrubbable')) return;
      const bounds = stage.getBoundingClientRect();
      // On phones the shot scrolls away while the camera advances.
      const travel = phone.matches ? bounds.height * .75 : bounds.height - hero.offsetHeight;
      if (travel <= 0) return;
      const progress = Math.max(0, Math.min(1, -bounds.top / travel));
      const copyProgress = Math.max(0, Math.min(1, (progress - .08) / .25));
      const followupProgress = Math.max(0, Math.min(1, (progress - .31) / .19));
      hero.style.setProperty('--cinema-copy-progress', copyProgress);
      hero.style.setProperty('--cinema-followup-progress', followupProgress);
      hero.classList.toggle('hero-copy-faded', copyProgress === 1);
      hero.classList.toggle('hero-followup-visible', followupProgress > 0);

      if (!Number.isFinite(video.duration) || !video.seekable.length || video.seeking) return;
      const time = Math.min(video.duration - 1 / 30, progress * video.duration);
      if (Math.abs(video.currentTime - time) >= 1 / 60) video.currentTime = time;
    }

    function scheduleRender() {
      if (!animationFrame) animationFrame = requestAnimationFrame(render);
    }

    function stop() {
      stage.classList.remove('is-scrubbable');
      video.classList.remove('has-frame');
      hero.classList.remove('hero-copy-faded', 'hero-followup-visible');
      hero.style.removeProperty('--cinema-copy-progress');
      hero.style.removeProperty('--cinema-followup-progress');
    }

    function syncPreference() {
      if (reducedMotion.matches) {
        stop();
        video.removeAttribute('src');
        video.load();
        return;
      }
      stage.classList.add('is-scrubbable');
      video.preload = 'auto';
      video.src = phone.matches ? video.dataset.mobileSrc : video.dataset.src;
      scheduleRender();
    }

    video.addEventListener('loadeddata', () => {
      if (!reducedMotion.matches) video.classList.add('has-frame');
      scheduleRender();
    });
    for (const event of ['seeked', 'progress', 'canplay']) {
      video.addEventListener(event, scheduleRender);
    }
    video.addEventListener('error', stop);
    window.addEventListener('scroll', scheduleRender, { passive: true });
    window.addEventListener('resize', scheduleRender);
    reducedMotion.addEventListener('change', syncPreference);
    syncPreference();
  }

  root.classList.add('motion-ready');
  installHeroScrubbing();
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
