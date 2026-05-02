// TicketHub app shell: PWA + small UX helpers

(() => {
  // Service worker registration (PWA / offline)
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(() => {
        // ignore
      });
    });
  }

  // Keep <meta name="theme-color"> in sync with dark mode
  function syncThemeColor() {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) return;
    const isDark = document.body.classList.contains('dark-mode');
    meta.setAttribute('content', isDark ? '#0a0a0a' : '#fafafa');
  }

  document.addEventListener('DOMContentLoaded', () => {
    syncThemeColor();

    // If dark-mode toggles later, resync
    const observer = new MutationObserver(() => syncThemeColor());
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    // Scroll reveal — cards + sections avec stagger
    const REVEAL_SELECTOR = '.event-card, .category-card, .step-card, .review-card, .sub-event-card, .soldout-card, .fade-in-up';
    const SECTION_SELECTOR = '.how-it-works .section-header, .events-section .section-header, .section-header';

    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        // Stagger delay based on sibling index within same parent
        const siblings = [...e.target.parentElement.children].filter(c => c.matches && c.matches(REVEAL_SELECTOR));
        const idx = siblings.indexOf(e.target);
        if (idx >= 0) e.target.style.transitionDelay = (idx * 0.08) + 's';
        e.target.classList.add('visible');
        io.unobserve(e.target);
      });
    }, { threshold: 0.08 });

    const ioSection = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        e.target.classList.add('visible');
        ioSection.unobserve(e.target);
      });
    }, { threshold: 0.2 });

    function observeAll() {
      document.querySelectorAll(REVEAL_SELECTOR).forEach(el => {
        if (!el.classList.contains('visible')) io.observe(el);
      });
      document.querySelectorAll(SECTION_SELECTOR).forEach(el => {
        if (!el.classList.contains('visible')) {
          el.classList.add('fade-in-up');
          ioSection.observe(el);
        }
      });
    }

    observeAll();

    // Re-run when new cards are injected dynamically (sheets-loader)
    const domWatcher = new MutationObserver(observeAll);
    domWatcher.observe(document.body, { childList: true, subtree: true });

    // Fallback: make everything visible after 3s
    setTimeout(() => {
      document.querySelectorAll(REVEAL_SELECTOR + ', ' + SECTION_SELECTOR).forEach(el => {
        el.classList.add('visible');
        el.style.transitionDelay = '0s';
      });
    }, 3000);
  });
})();

