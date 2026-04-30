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
  const base = `assets/images/${kind === 'group' ? 'groups' : 'events'}/${kind}-${id}-${variant}`;
  return {
    src480: `${base}-480.webp`,
    src960: `${base}-960.webp`,
    src1600: `${base}-1600.webp`
  };
}

function applyResponsiveImage(imgEl, opts) {
  // opts: { kind, id, variant, category, remoteFallback, eager }
  if (!imgEl) return;

  const { kind, id, variant, category, remoteFallback, eager } = opts || {};
  const local = buildLocalImagePaths({ kind, id, variant });
  const defaultImg = getDefaultImageForCategory(category);

  // Use local images; if missing (404), fallback to remote, then to default svg.
  imgEl.loading = eager ? 'eager' : 'lazy';
  imgEl.decoding = 'async';
  imgEl.referrerPolicy = 'no-referrer';

  imgEl.src = local.src960;

  let stage = 0;
  imgEl.onerror = () => {
    stage += 1;
    if (stage === 1 && remoteFallback) {
      imgEl.removeAttribute('srcset');
      imgEl.removeAttribute('sizes');
      imgEl.src = remoteFallback;
      return;
    }
    imgEl.removeAttribute('srcset');
    imgEl.removeAttribute('sizes');
    imgEl.src = defaultImg;
  };
}

window.TicketHubImages = {
  applyResponsiveImage,
  getDefaultImageForCategory,
  buildLocalImagePaths
};

