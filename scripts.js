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

/* ========= CONTACT BUBBLE ========= */
document.addEventListener("DOMContentLoaded", () => {
  if (document.querySelector(".contact-bubble")) return;

  const bubble = document.createElement("div");
  bubble.className = "contact-bubble";

  bubble.innerHTML = `
    <a class="bubble-btn" href="https://wa.me/447000000000" target="_blank" rel="noreferrer">
      WhatsApp
    </a>
    <a class="bubble-btn secondary" href="mailto:support@yourdomain.com">
      Email
    </a>
  `;

  document.body.appendChild(bubble);
});
