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
