// scripts.js

// ====== CONFIG (CHANGE THESE) ======
const WHATSAPP_NUMBER = "33658789658"; // TODO: replace
const SUPPORT_EMAIL = "ticketsupply@gmail.com"; // TODO: replace

// ====== HELPERS ======
function escapeHtml(str) {
  return String(str ?? "").replace(/[&<>"']/g, (m) => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[m]));
}

function normalize(s){ return String(s||"").toLowerCase().trim(); }

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function parseDate(iso){
  const t = Date.parse(iso);
  return Number.isNaN(t) ? null : t;
}

function getMinPrice(ticketTypes) {
  if (!Array.isArray(ticketTypes) || ticketTypes.length === 0) return null;
  const nums = ticketTypes.map(t => Number(t.price)).filter(n => !Number.isNaN(n));
  return nums.length ? Math.min(...nums) : null;
}

function getStatus(ev){
  return normalize(ev.status || "available");
}

function hasGenre(ev, genre){
  if (!genre || genre === "all") return true;
  const g = ev.genres || ev.genre || [];
  const arr = Array.isArray(g) ? g : [g];
  return arr.map(normalize).includes(normalize(genre));
}

// ====== NAV DROPDOWNS (mobile click support) ======
document.querySelectorAll("[data-dd]").forEach((dd) => {
  const btn = dd.querySelector(".tm-dd__btn");
  const menu = dd.querySelector(".tm-dd__menu");
  if (!btn || !menu) return;

  btn.addEventListener("click", (e) => {
    // allow desktop hover to work; this helps mobile
    e.stopPropagation();

    const isOpen = menu.style.display === "block";
    document.querySelectorAll(".tm-dd__menu").forEach((m) => (m.style.display = "none"));
    menu.style.display = isOpen ? "none" : "block";
  });
});

document.addEventListener("click", (e) => {
  const inside = e.target.closest("[data-dd]");
  if (!inside) {
    document.querySelectorAll(".tm-dd__menu").forEach((m) => (m.style.display = "none"));
  }
});

// ====== PAGE: CONCERTS LIST ======
function renderConcertsList() {
  const grid = document.getElementById("concertsGrid");
  if (!grid || !window.EVENTS) return;

  const qEl = document.getElementById("q");
  const statusEl = document.getElementById("status");
  const sortEl = document.getElementById("sort");
  const empty = document.getElementById("emptyState");

  const activeGenreBtn = document.querySelector("#genreChips .chip.is-active");
  const activeGenre = activeGenreBtn ? activeGenreBtn.dataset.genre : "all";

  const q = normalize(qEl?.value);
  const status = normalize(statusEl?.value || "all");
  const sort = normalize(sortEl?.value || "soonest");

  let concerts = window.EVENTS.filter(e => e.category === "music");

  // Search filter
  if (q) {
    concerts = concerts.filter(ev => {
      const hay = normalize(`${ev.title} ${ev.city} ${ev.country} ${ev.venue} ${(ev.genres||[]).join(" ")}`);
      return hay.includes(q);
    });
  }

  // Genre filter
  concerts = concerts.filter(ev => hasGenre(ev, activeGenre));

  // Status filter
  if (status !== "all") {
    concerts = concerts.filter(ev => getStatus(ev) === status);
  }

  // Sorting
  const byFeatured = (a,b) => (b.featured === true) - (a.featured === true);
  const bySoonest = (a,b) => (parseDate(a.date)||Infinity) - (parseDate(b.date)||Infinity);
  const byCheapest = (a,b) => (getMinPrice(a.ticketTypes) ?? Infinity) - (getMinPrice(b.ticketTypes) ?? Infinity);
  const byRecent = (a,b) => (parseDate(b.updatedAt)||0) - (parseDate(a.updatedAt)||0);

  if (sort === "featured") concerts.sort((a,b)=> byFeatured(a,b) || bySoonest(a,b));
  else if (sort === "cheapest") concerts.sort((a,b)=> byCheapest(a,b) || bySoonest(a,b));
  else if (sort === "recent") concerts.sort((a,b)=> byRecent(a,b) || bySoonest(a,b));
  else concerts.sort(bySoonest);

  grid.innerHTML = concerts.map(ev => {
    const minPrice = getMinPrice(ev.ticketTypes);
    const currency = ev.ticketTypes?.[0]?.currency || "";
    const st = getStatus(ev);

    const highlights = (ev.highlights || []).slice(0, 2)
      .map(b => `<span class="badge">${escapeHtml(b)}</span>`).join("");

    return `
      <a class="card event-card" href="event.html?id=${encodeURIComponent(ev.id)}">
        <img class="event-img" src="${escapeHtml(ev.image)}" alt="${escapeHtml(ev.title)}" />
        <div class="event-body">
          <div class="event-title">${escapeHtml(ev.title)}</div>
          <div class="event-meta">${escapeHtml(formatDate(ev.date))} • ${escapeHtml(ev.venue)}</div>

          <div class="badge-row">
            <span class="badge-status ${escapeHtml(st)}">${escapeHtml(st.toUpperCase())}</span>
            ${ev.featured ? `<span class="badge-status soon">FEATURED</span>` : ""}
            ${highlights}
          </div>

          <div class="event-price">${minPrice !== null ? `From ${minPrice} ${escapeHtml(currency)}` : ""}</div>
        </div>
      </a>
    `;
  }).join("");

  const hasAny = concerts.length > 0;
  if (empty) empty.style.display = hasAny ? "none" : "block";
}

// ====== PAGE: EVENT DETAIL (optional but included) ======
function renderEventPage() {
  const root = document.getElementById("eventPage");
  if (!root || !window.EVENTS) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const ev = window.EVENTS.find(e => e.id === id);

  if (!ev) {
    root.innerHTML = `<h1>Event not found</h1><p>This event doesn’t exist.</p>`;
    return;
  }

  document.title = ev.title;

  const minPrice = getMinPrice(ev.ticketTypes);
  const currency = ev.ticketTypes?.[0]?.currency || "";

  const waText = encodeURIComponent(
    `Hi! I want tickets for:\n${ev.title}\nDate: ${formatDate(ev.date)}\nQty:\nTicket type:\nBudget:\n`
  );
  const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${waText}`;

  const mailSubject = encodeURIComponent(`Ticket request — ${ev.title}`);
  const mailBody = encodeURIComponent(
    `Hi!\n\nI want tickets for:\n${ev.title}\nDate: ${formatDate(ev.date)}\nQty:\nTicket type:\nBudget:\n\nThanks!`
  );
  const mailto = `mailto:${SUPPORT_EMAIL}?subject=${mailSubject}&body=${mailBody}`;

  const ticketRows = (ev.ticketTypes || []).map(t => `
    <div class="ticket-row">
      <div>
        <div class="ticket-name">${escapeHtml(t.name)}</div>
        <div class="ticket-availability">${escapeHtml(t.availability || "")}</div>
      </div>
      <div class="ticket-price">${escapeHtml(t.price)} ${escapeHtml(t.currency || "")}</div>
    </div>
  `).join("");

  const st = getStatus(ev);
  const badges = (ev.highlights || []).map(b => `<span class="badge">${escapeHtml(b)}</span>`).join("");

  root.innerHTML = `
    <div class="event-hero">
      <img class="event-hero-img" src="${escapeHtml(ev.image)}" alt="${escapeHtml(ev.title)}" />
      <div class="event-hero-info">
        <h1>${escapeHtml(ev.title)}</h1>
        <div class="event-meta">${escapeHtml(formatDate(ev.date))} • ${escapeHtml(ev.venue)} • ${escapeHtml(ev.city)}, ${escapeHtml(ev.country)}</div>

        <div class="badge-row">
          <span class="badge-status ${escapeHtml(st)}">${escapeHtml(st.toUpperCase())}</span>
          ${ev.featured ? `<span class="badge-status soon">FEATURED</span>` : ""}
          ${badges}
        </div>

        <p class="event-desc">${escapeHtml(ev.description || "")}</p>
        <div class="event-price">${minPrice !== null ? `From ${minPrice} ${escapeHtml(currency)}` : ""}</div>

        <div class="cta-row">
          <a class="btn" href="${waLink}" target="_blank" rel="noreferrer">Request on WhatsApp</a>
          <a class="btn secondary" href="${mailto}">Request by Email</a>
        </div>
      </div>
    </div>

    <h2>Ticket options</h2>
    <div class="tickets-box">
      ${ticketRows || "<p>No ticket types listed yet.</p>"}
    </div>

    <h2>Info</h2>
    <div class="info-box">
      <div><strong>Delivery:</strong> ${escapeHtml(ev.delivery || "—")}</div>
      <div><strong>Payment:</strong> ${escapeHtml(ev.payment || "—")}</div>
      <div><strong>Notes:</strong> ${escapeHtml(ev.notes || "—")}</div>
    </div>
  `;
}

// ====== INIT ======
document.addEventListener("DOMContentLoaded", () => {
  renderConcertsList();
  renderEventPage();

  const qEl = document.getElementById("q");
  const statusEl = document.getElementById("status");
  const sortEl = document.getElementById("sort");

  qEl?.addEventListener("input", () => renderConcertsList());
  statusEl?.addEventListener("change", () => renderConcertsList());
  sortEl?.addEventListener("change", () => renderConcertsList());

  document.querySelectorAll("#genreChips .chip").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#genreChips .chip").forEach(b => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      renderConcertsList();
    });
  });
});


  menus.forEach(menu => {
    const link = menu.querySelector(":scope > a");
    if(!link) return;

    link.addEventListener("click", (e) => {
      if(isDesktop()) return; // desktop uses hover
      e.preventDefault();
      const willOpen = !menu.classList.contains("open");
      closeAll();
      if(willOpen) menu.classList.add("open");
    });
  });

  document.addEventListener("click", (e) => {
    if(isDesktop()) return;
    if(!e.target.closest("[data-menu]")) closeAll();
  });

  window.addEventListener("resize", () => closeAll());

  // Contact widget
  const bubble = document.getElementById('contactBubble');
  const closeBtn = document.getElementById('contactClose');
  const fab = document.getElementById('contactFab');

  if(bubble && closeBtn && fab){
    closeBtn.addEventListener('click', () => {
      bubble.classList.add('contact-hidden');
      fab.classList.remove('contact-hidden');
    });

    fab.addEventListener('click', () => {
      fab.classList.add('contact-hidden');
      bubble.classList.remove('contact-hidden');
    });
  }
})();
// Mobile dropdown toggle
document.querySelectorAll("[data-dd]").forEach((dd) => {
  const btn = dd.querySelector(".tm-dd__btn");
  const menu = dd.querySelector(".tm-dd__menu");

  btn.addEventListener("click", () => {
    const isOpen = menu.style.display === "block";

    // close others
    document.querySelectorAll(".tm-dd__menu").forEach((m) => (m.style.display = "none"));

    // toggle current
    menu.style.display = isOpen ? "none" : "block";
  });
});

// Close dropdowns when clicking outside
document.addEventListener("click", (e) => {
  const inside = e.target.closest("[data-dd]");
  if (!inside) {
    document.querySelectorAll(".tm-dd__menu").forEach((m) => (m.style.display = "none"));
  }
});

function getMinPrice(ticketTypes) {
  if (!Array.isArray(ticketTypes) || ticketTypes.length === 0) return null;
  return Math.min(...ticketTypes.map(t => Number(t.price)).filter(n => !Number.isNaN(n)));
}

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function escapeHtml(str) {
  return String(str ?? "").replace(/[&<>"']/g, (m) => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[m]));
}

/* ====== PAGE LISTE: concerts.html ====== */
function renderConcertsList() {
  const grid = document.getElementById("concertsGrid");
  if (!grid || !window.EVENTS) return;

  const concerts = window.EVENTS.filter(e => e.category === "music");

  grid.innerHTML = concerts.map(ev => {
    const minPrice = getMinPrice(ev.ticketTypes);
    const currency = ev.ticketTypes?.[0]?.currency || "";
    const badges = (ev.highlights || []).slice(0, 3).map(b => `<span class="badge">${escapeHtml(b)}</span>`).join("");

    return `
      <a class="card event-card" href="event.html?id=${encodeURIComponent(ev.id)}">
        <img class="event-img" src="${escapeHtml(ev.image)}" alt="${escapeHtml(ev.title)}" />
        <div class="event-body">
          <div class="event-title">${escapeHtml(ev.title)}</div>
          <div class="event-meta">${escapeHtml(formatDate(ev.date))} • ${escapeHtml(ev.venue)}</div>
          <div class="event-desc">${escapeHtml(ev.description)}</div>
          <div class="event-badges">${badges}</div>
          <div class="event-price">${minPrice !== null ? `From ${minPrice} ${escapeHtml(currency)}` : ""}</div>
        </div>
      </a>
    `;
  }).join("");
}

/* ====== PAGE DETAIL: event.html?id=... ====== */
function renderEventPage() {
  const root = document.getElementById("eventPage");
  if (!root || !window.EVENTS) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const ev = window.EVENTS.find(e => e.id === id);

  if (!ev) {
    root.innerHTML = `<h1>Event not found</h1><p>This event doesn’t exist.</p>`;
    return;
  }

  document.title = ev.title;

  const minPrice = getMinPrice(ev.ticketTypes);
  const currency = ev.ticketTypes?.[0]?.currency || "";

  // ✅ Mets TON numéro WhatsApp + TON email ici
  const whatsappNumber = "447000000000";
  const supportEmail = "support@yourdomain.com";

  const waText = encodeURIComponent(
    `Hi! I want tickets for:\n${ev.title}\nDate: ${formatDate(ev.date)}\nQty:\nTicket type:\nBudget:\n`
  );
  const waLink = `https://wa.me/${whatsappNumber}?text=${waText}`;

  const mailSubject = encodeURIComponent(`Ticket request — ${ev.title}`);
  const mailBody = encodeURIComponent(
    `Hi!\n\nI want tickets for:\n${ev.title}\nDate: ${formatDate(ev.date)}\nQty:\nTicket type:\nBudget:\n\nThanks!`
  );
  const mailto = `mailto:${supportEmail}?subject=${mailSubject}&body=${mailBody}`;

  const ticketRows = (ev.ticketTypes || []).map(t => `
    <div class="ticket-row">
      <div>
        <div class="ticket-name">${escapeHtml(t.name)}</div>
        <div class="ticket-availability">${escapeHtml(t.availability || "")}</div>
      </div>
      <div class="ticket-price">${escapeHtml(t.price)} ${escapeHtml(t.currency || "")}</div>
    </div>
  `).join("");

  const badges = (ev.highlights || []).map(b => `<span class="badge">${escapeHtml(b)}</span>`).join("");

  root.innerHTML = `
    <div class="event-hero">
      <img class="event-hero-img" src="${escapeHtml(ev.image)}" alt="${escapeHtml(ev.title)}" />
      <div class="event-hero-info">
        <h1>${escapeHtml(ev.title)}</h1>
        <div class="event-meta">${escapeHtml(formatDate(ev.date))} • ${escapeHtml(ev.venue)} • ${escapeHtml(ev.city)}, ${escapeHtml(ev.country)}</div>
        <div class="event-badges">${badges}</div>
        <p class="event-desc">${escapeHtml(ev.description)}</p>
        <div class="event-price">${minPrice !== null ? `From ${minPrice} ${escapeHtml(currency)}` : ""}</div>

        <div class="cta-row">
          <a class="btn" href="${waLink}" target="_blank" rel="noreferrer">Request on WhatsApp</a>
          <a class="btn secondary" href="${mailto}">Request by Email</a>
        </div>
      </div>
    </div>

    <h2>Ticket options</h2>
    <div class="tickets-box">
      ${ticketRows || "<p>No ticket types listed yet.</p>"}
    </div>

    <h2>Info</h2>
    <div class="info-box">
      <div><strong>Delivery:</strong> ${escapeHtml(ev.delivery || "—")}</div>
      <div><strong>Payment:</strong> ${escapeHtml(ev.payment || "—")}</div>
      <div><strong>Notes:</strong> ${escapeHtml(ev.notes || "—")}</div>
    </div>
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  renderConcertsList();
  renderEventPage();
});
