const CACHE_NAME = 'qr-studio-v2';
const APP_SHELL = [
  './',
  './index.html',
  './css/styles.css',
  './css/studio-refresh.css',
  './css/studio-tools.css',
  './css/pro-tools.css',
  './js/qr-generator.js',
  './js/content-types.js',
  './js/app.js',
  './js/studio-tools.js',
  './js/qr-diagnostics.js',
  './js/pro-tools.js',
  './js/pro-tools-fixes.js',
  './manifest.webmanifest',
  './assets/qr-studio-icon.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (!response || response.status !== 200 || response.type !== 'basic') return response;
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        return response;
      }).catch(() => caches.match('./index.html'));
    })
  );
});
