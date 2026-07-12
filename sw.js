const CACHE_NAME = 'pulumur-pwa-v8_9_4';
const CORE_ASSETS = [
  './',
  './index.html',
  './style.css?v=8.9.4',
  './app.js?v=8.9.4',
  './supabaseConfig.js?v=8.9.4',
  './cloudProjects.js?v=8.9.4',
  './adminUsersApi.js?v=8.9.4',
  './adminPanel.js?v=8.9.4',
  './peri01ExcelBridge.js?v=8.9.4',
  './peri01Geometry.js?v=8.9.4',
  './modernDxfTemplate.js?v=8.9.4',
  './dxfModernEngine.js?v=8.9.4',
  './blocks/filteredBlocks.js?v=8.9.4',
  './assets/plmr-logo-header.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-64.png',
  'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.110.2'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
      const cloned = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(event.request, cloned)).catch(() => {});
      return response;
    }).catch(() => caches.match('./index.html')))
  );
});
