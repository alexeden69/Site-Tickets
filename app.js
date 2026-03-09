// TicketHub app shell: PWA + small UX helpers

(() => {
  const CONTACT = {
    whatsapp: '33652051917',
    email: 'dzb67291@gmail.com'
  };

  function syncContactLinks() {
    const whatsappHref = `https://wa.me/${CONTACT.whatsapp}`;
    const emailHref = `mailto:${CONTACT.email}`;

    document.querySelectorAll('.contact-btn.whatsapp-btn').forEach((link) => {
      link.setAttribute('href', whatsappHref);
      link.setAttribute('rel', 'noopener noreferrer');
    });

    document.querySelectorAll('.contact-btn.email-btn').forEach((link) => {
      link.setAttribute('href', emailHref);
    });
  }

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
    syncContactLinks();
    syncThemeColor();

    // If dark-mode toggles later, resync
    const observer = new MutationObserver(() => syncThemeColor());
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  });
})();
