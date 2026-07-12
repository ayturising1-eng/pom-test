const CACHE_NAME = 'pulumur-pwa-v8_9_9';
const CORE_ASSETS = [
  './',
  './index.html',
  './style.css?v=8.9.9',
  './app.js?v=8.9.9',
  './supabaseConfig.js?v=8.9.9',
  './cloudProjects.js?v=8.9.9',
  './adminUsersApi.js?v=8.9.9',
  './activityTracker.js?v=8.9.9',
  './adminPanel.js?v=8.9.9',
  './peri01ExcelBridge.js?v=8.9.9',
  './peri01Geometry.js?v=8.9.9',
  './modernDxfTemplate.js?v=8.9.9',
  './dxfModernEngine.js?v=8.9.9',
  './blocks/filteredBlocks.js?v=8.9.9',
  './assets/plmr-logo-header.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-64.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

async function networkFirst(request) {
  try {
    const response = await fetch(request, { cache: 'no-store' });
    if (response && response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone()).catch(() => {});
    }
    return response;
  } catch (_) {
    return (await caches.match(request)) || (request.mode === 'navigate' ? caches.match('./index.html') : Response.error());
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response && response.ok) {
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone()).catch(() => {});
  }
  return response;
}

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  const sameOrigin = url.origin === self.location.origin;
  const dynamicAsset = sameOrigin && (
    event.request.mode === 'navigate' ||
    /\.(?:html|js|css|json|webmanifest)$/i.test(url.pathname)
  );
  event.respondWith(dynamicAsset ? networkFirst(event.request) : cacheFirst(event.request));
});
