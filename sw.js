// TicketHub Service Worker (simple cache-first for static assets)
const CACHE_NAME = 'tickethub-v4';

const PRECACHE_URLS = [
  './',
  './index.html',
  './concerts.html',
  './sports.html',
  './event.html',
  './group.html',
  './styles.css',
  './dark-mode.js',
  './language.js',
  './sheets-loader.js',
  './checkout-handler.js',
  './app.js',
  './manifest.webmanifest',
  './icon.svg',
  './drake.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((keys) =>
        Promise.all(keys.map((key) => (key === CACHE_NAME ? Promise.resolve() : caches.delete(key))))
      ),
      self.clients.claim()
    ])
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  const isHTML = req.headers.get('accept')?.includes('text/html') || req.url.endsWith('.html');

  if (isHTML) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(req).then((c) => c || caches.match('./index.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match('./index.html'));
    })
  );
});
