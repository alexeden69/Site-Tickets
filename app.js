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

    // Scroll reveal — observe cards and sections as they enter viewport
    const REVEAL_SELECTOR = '.event-card, .category-card, .step-card, .review-card, .sub-event-card, .soldout-card, .fade-in-up';
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    function observeAll() {
      document.querySelectorAll(REVEAL_SELECTOR).forEach(el => {
        if (!el.classList.contains('visible')) io.observe(el);
      });
    }

    observeAll();

    // Re-run when new cards are injected dynamically
    const domWatcher = new MutationObserver(observeAll);
    domWatcher.observe(document.body, { childList: true, subtree: true });
  });
})();

