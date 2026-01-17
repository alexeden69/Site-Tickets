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
