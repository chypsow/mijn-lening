const CACHE_NAME = 'my-loan-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './main.js',
  './lening.js',
  './calculator.js',
  './default.css',
  './calculator.css',
  './lening.css',
  './circle.css',
  './media.css',
  './images/icons/icon-192.png',
  './images/icons/icon-512.png',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => {
        if (key !== CACHE_NAME) return caches.delete(key);
      })
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // Network-first for HTML, cache-first for other assets
  if (event.request.mode === 'navigate' || (event.request.method === 'GET' && event.request.headers.get('accept')?.includes('text/html'))) {
    event.respondWith(
      fetch(event.request).then(res => {
        const resClone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, resClone));
        return res;
      }).catch(() => caches.match('./index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
