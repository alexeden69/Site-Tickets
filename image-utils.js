// Image utilities: local-first with fallbacks

function getDefaultImageForCategory(category) {
  const cat = String(category || '').toLowerCase();
  if (cat === 'concert') return 'assets/images/defaults/default-concert.svg';
  if (cat === 'sport') return 'assets/images/defaults/default-sport.svg';
  return 'assets/images/defaults/default-group.svg';
}

function buildLocalImagePaths({ kind, id, variant }) {
  // kind: 'event' | 'group'
  // variant: 'card' | 'hero'
  // 16:9 everywhere; we provide common sizes for srcset
  const cleanId = id.startsWith(kind + '-') ? id.slice(kind.length + 1) : id;
  const base = `assets/images/${kind === 'group' ? 'groups' : 'events'}/${kind}-${cleanId}-${variant}`;
  return {
    src480: `${base}-480.webp`,
    src960: `${base}-960.webp`,
    src1600: `${base}-1600.webp`
  };
}

function applyResponsiveImage(imgEl, opts) {
  // opts: { kind, id, variant, category, remoteFallback, eager }
  if (!imgEl) return;

  const { kind, id, variant, eager } = opts || {};
  const local = buildLocalImagePaths({ kind, id, variant });

  imgEl.loading = eager ? 'eager' : 'lazy';
  imgEl.decoding = 'async';
  imgEl.referrerPolicy = 'no-referrer';

  imgEl.src = local.src960;

  imgEl.onerror = () => {
    imgEl.onerror = null;
    imgEl.src = 'assets/images/events/event-roland-garros-24mai-card-960.webp';
  };
}

window.TicketHubImages = {
  applyResponsiveImage,
  getDefaultImageForCategory,
  buildLocalImagePaths
};

