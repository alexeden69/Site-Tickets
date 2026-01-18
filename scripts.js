// Mobile dropdown toggles + contact widget open/close
(function(){
  // Dropdowns
  const menus = document.querySelectorAll("[data-menu]");
  const isDesktop = () => window.matchMedia("(min-width: 860px)").matches;

  function closeAll(except){
    menus.forEach(m => { if(m !== except) m.classList.remove("open"); });
  }

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
