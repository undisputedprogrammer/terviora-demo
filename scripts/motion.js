'use strict';

(() => {
  if (!window.IntersectionObserver) return;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const observer = new IntersectionObserver(entries => {
    for (const { target, isIntersecting } of entries) {
      if (!isIntersecting) continue;
      observer.unobserve(target);
      if (!reducedMotion.matches && !target.contains(document.activeElement)) {
        target.classList.add('motion-reveal');
      }
    }
  }, { rootMargin: '0px 0px 24px' });

  const observe = elements => {
    for (const [index, element] of Array.from(elements).entries()) {
      element.style.setProperty('--motion-step', index % 3);
      observer.observe(element);
    }
  };

  const blocks = [
    'main > section .section-heading', '.guide-story', '.guide-list', '.trust-grid article',
    '.process-layout > *', '.owner-section > *', '.alerts-section > *', '.faq-section > *',
    '.sell-prep', '.detail-about', '.detail-related-heading', '.footer-top', '.footer-columns'
  ];
  for (const selector of blocks) observe(document.querySelectorAll(selector));

  for (const grid of document.querySelectorAll('.property-grid, .latest-grid, .category-grid')) {
    observe(grid.children);
    if (grid.matches('#results-grid, #latest-grid')) {
      new MutationObserver(records => {
        for (const { addedNodes, removedNodes } of records) {
          for (const node of removedNodes) {
            if (node instanceof Element) observer.unobserve(node);
          }
          observe([...addedNodes].filter(node => node instanceof Element));
        }
      }).observe(grid, { childList: true });
    }
  }

  for (const eventName of ['animationend', 'animationcancel']) {
    document.addEventListener(eventName, event => {
      if (event.animationName === 'terviora-rise') event.target.classList.remove('motion-reveal');
    });
  }
})();
