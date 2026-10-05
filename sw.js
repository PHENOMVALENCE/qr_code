const CACHE_NAME = 'qr-studio-v3';
const APP_SHELL = [
  './',
  './index.html',
  './css/styles.css',
  './css/studio-refresh.css',
  './css/studio-tools.css',
  './css/pro-tools.css',
  './css/production-tools.css',
  './js/qr-generator.js',
  './js/content-types.js',
  './js/app.js',
  './js/studio-tools.js',
  './js/qr-diagnostics.js',
  './js/pro-tools.js',
  './js/pro-tools-fixes.js',
  './js/production-tools.js',
  './manifest.webmanifest',
  './assets/qr-studio-icon.svg'
];

const REMOTE_RUNTIME = [
  'https://unpkg.com/qr-code-styling@1.6.0-rc.1/lib/qr-code-styling.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js',
  'https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js'
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(APP_SHELL);
    await Promise.all(REMOTE_RUNTIME.map(async url => {
      try {
        const response = await fetch(url, { mode: 'no-cors', cache: 'no-cache' });
        await cache.put(url, response);
      } catch (error) {
        // Remote prefetch is best-effort; the app shell must still install.
      }
    }));
  })());
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
  const isSameOrigin = url.origin === self.location.origin;
  const isRuntimeDependency = REMOTE_RUNTIME.includes(url.href);
  if (!isSameOrigin && !isRuntimeDependency) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(event.request, { ignoreSearch: false });
    if (cached) return cached;
    try {
      const response = await fetch(event.request);
      if (response && (response.status === 200 || response.type === 'opaque')) {
        cache.put(event.request, response.clone());
      }
      return response;
    } catch (error) {
      if (isSameOrigin && event.request.mode === 'navigate') return cache.match('./index.html');
      throw error;
    }
  })());
});
