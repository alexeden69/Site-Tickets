/* ========= NAV DROPDOWNS (mobile) ========= */
document.querySelectorAll("[data-dd]").forEach(dd => {
  const btn = dd.querySelector(".tm-dd__btn");
  const menu = dd.querySelector(".tm-dd__menu");
  if (!btn || !menu) return;

  btn.addEventListener("click", e => {
    e.stopPropagation();
    const open = menu.style.display === "block";
    document.querySelectorAll(".tm-dd__menu").forEach(m => m.style.display = "none");
    menu.style.display = open ? "none" : "block";
  });
});

document.addEventListener("click", () => {
  document.querySelectorAll(".tm-dd__menu").forEach(m => m.style.display = "none");
});


/* ========= FLOATING CONTACT ICONS ========= */
document.addEventListener("DOMContentLoaded", () => {
  if (document.querySelector(".contact-bubble")) return;

  const bubble = document.createElement("div");
  bubble.className = "contact-bubble";

  bubble.innerHTML = `
    <a
      class="contact-icon whatsapp"
      href="https://wa.me/447000000000"
      target="_blank"
      rel="noreferrer"
      aria-label="Contact on WhatsApp"
    >
      <!-- WhatsApp icon -->
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <path fill="currentColor" d="M16.02 3C9.39 3 4 8.39 4 15.02c0 2.65.87 5.1 2.34 7.1L4 29l7.1-2.27a11.9 11.9 0 0 0 4.92 1.06h.01c6.63 0 12.02-5.39 12.02-12.02C28.05 8.39 22.66 3 16.02 3zm0 21.78c-1.56 0-3.09-.42-4.43-1.21l-.32-.19-4.22 1.35 1.38-4.11-.21-.34a9.8 9.8 0 1 1 7.8 4.5zm5.37-7.34c-.29-.14-1.7-.84-1.96-.94-.26-.1-.45-.14-.64.14-.19.29-.74.94-.9 1.13-.17.19-.33.22-.62.07-.29-.14-1.21-.45-2.3-1.44-.85-.76-1.42-1.7-1.59-1.98-.17-.29-.02-.44.13-.58.13-.13.29-.33.43-.5.14-.17.19-.29.29-.48.1-.19.05-.36-.02-.5-.07-.14-.64-1.55-.88-2.13-.23-.55-.47-.48-.64-.49h-.55c-.19 0-.5.07-.76.36-.26.29-1 1-1 2.44s1.03 2.84 1.17 3.04c.14.19 2.02 3.09 4.89 4.33.68.29 1.21.46 1.62.59.68.22 1.29.19 1.78.12.54-.08 1.7-.69 1.94-1.36.24-.67.24-1.25.17-1.36-.07-.12-.26-.19-.55-.33z"/>
      </svg>
    </a>

    <a
      class="contact-icon email"
      href="mailto:support@yourdomain.com"
      aria-label="Contact by email"
    >
      <!-- Email icon -->
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M2 6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6zm2 0 8 5 8-5H4zm16 12V8l-8 5-8-5v10h16z"/>
      </svg>
    </a>
  `;

  document.body.appendChild(bubble);
});
