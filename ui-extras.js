(function () {
    // ── Floating request button (bottom-left, ne chevauche pas les boutons WhatsApp/Email) ──
    const page = window.location.pathname.split('/').pop();
    if (page !== 'request.html') {
        const btn = document.createElement('a');
        btn.href = 'request.html';
        btn.className = 'float-request-btn';
        btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg> Billet introuvable ?';
        document.body.appendChild(btn);
    }

    // ── Compteur dynamique "billets vendus ce mois" (~18/jour) ──
    function calcSoldCount() {
        var now = new Date();
        var day = now.getDate();
        var hour = now.getHours();
        var minute = now.getMinutes();
        // Jours complets écoulés × 18
        var base = (day - 1) * 18;
        // Progression d'aujourd'hui (0 → 18 sur 24h)
        var todayProgress = Math.round(((hour * 60 + minute) / 1440) * 18);
        // Bruit pseudo-aléatoire basé sur l'heure (−3 à +3) pour simuler la fluctuation
        var seed = hour * 13 + day * 7;
        var noise = (seed % 7) - 3;
        return Math.max(0, base + todayProgress + noise);
    }

    function updateSoldCount() {
        var count = calcSoldCount();
        document.querySelectorAll('.trust-strip span').forEach(function (span) {
            if (span.textContent.includes('billets vendus')) {
                span.textContent = '🔥 ' + count + ' billets vendus ce mois';
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', updateSoldCount);
    } else {
        updateSoldCount();
    }

    // ── Exit intent popup (une seule fois par session) ──
    var SESSION_KEY = 'th_exit_shown';
    if (!sessionStorage.getItem(SESSION_KEY)) {
        var triggered = false;
        document.addEventListener('mouseleave', function handler(e) {
            if (e.clientY > 5 || triggered) return;
            triggered = true;
            sessionStorage.setItem(SESSION_KEY, '1');
            document.removeEventListener('mouseleave', handler);
            var overlay = document.createElement('div');
            overlay.className = 'exit-popup-overlay';
            overlay.innerHTML =
                '<div class="exit-popup">' +
                '<button class="exit-popup-close" onclick="this.closest(\'.exit-popup-overlay\').remove()">×</button>' +
                '<div class="exit-popup-icon">🎫</div>' +
                '<h3>Vous partez déjà ?</h3>' +
                '<p>Vous ne trouvez pas votre billet ? Décrivez ce que vous cherchez, on s\'en occupe sous 24h.</p>' +
                '<a href="request.html" class="exit-popup-btn">Faire une demande →</a>' +
                '<button class="exit-popup-skip" onclick="this.closest(\'.exit-popup-overlay\').remove()">Non merci</button>' +
                '</div>';
            overlay.addEventListener('click', function (e) { if (e.target === overlay) overlay.remove(); });
            document.body.appendChild(overlay);
        });
    }

    // ── Scroll to top button ──
    var scrollBtn = document.createElement('button');
    scrollBtn.className = 'scroll-top-btn';
    scrollBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>';
    scrollBtn.setAttribute('aria-label', 'Retour en haut');
    scrollBtn.onclick = function() { window.scrollTo({ top: 0, behavior: 'smooth' }); };
    document.body.appendChild(scrollBtn);
    window.addEventListener('scroll', function() {
        scrollBtn.classList.toggle('visible', window.scrollY > 400);
    });

    // ── Cookie banner ──
    if (!localStorage.getItem('cf_cookies_ok')) {
        var banner = document.createElement('div');
        banner.className = 'cookie-banner';
        banner.innerHTML =
            '<p>🍪 Ce site utilise des cookies pour améliorer votre expérience. <a href="cgv.html">En savoir plus</a></p>' +
            '<button class="cookie-accept" onclick="this.closest(\'.cookie-banner\').remove();localStorage.setItem(\'cf_cookies_ok\',\'1\')">Accepter</button>';
        document.body.appendChild(banner);
    }

    // ── Scroll animations ──
    var animObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                animObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.addEventListener('DOMContentLoaded', function() {
        document.querySelectorAll('.event-card, .step-card, .review-card, .trust-counter, .category-card, .faq-item').forEach(function(el) {
            el.classList.add('fade-in-up');
            animObserver.observe(el);
        });
    });
})();
