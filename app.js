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
  });
})();

