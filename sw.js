const CACHE_PREFIX = 'pulumur-pwa-';
const CACHE_NAME = `${CACHE_PREFIX}v10_4_r12_12_9`;
const NETWORK_TIMEOUT_MS = 8000;
const CORE_ASSETS = [
  './',
  './index.html',
  './buildBootstrap.js?v=10.4-r12.12.9',
  './core/backendCompatibility.js?v=10.4-r12.12.9',
  './diagnostics/runtimeMonitor.js?v=10.4-r12.12.9',
  './recovery/recoveryManager.js?v=10.4-r12.12.9',
  './style.css?v=10.4-r12.12.9',
  './appLimits.js?v=10.4-r12.12.9',
  './core/actions.js?v=10.4-r12.12.9',
  './core/projectModel.js?v=10.4-r12.12.9',
  './core/topologyReconcile.js?v=10.4-r12.12.9',
  './core/validation.js?v=10.4-r12.12.9',
  './core/reducer.js?v=10.4-r12.12.9',
  './history/historyManager.js?v=10.4-r12.12.9',
  './persistence/schema.js?v=10.4-r12.12.9',
  './render/renderPipeline.js?v=10.4-r12.12.9',
  './app.js?v=10.4-r12.12.9',
  './supabaseConfig.js?v=10.4-r12.12.9',
  './cloudProjects.js?v=10.4-r12.12.9',
  './adminUsersApi.js?v=10.4-r12.12.9',
  './activityTracker.js?v=10.4-r12.12.9',
  './adminPanel.js?v=10.4-r12.12.9',
  './peri01ExcelBridge.js?v=10.4-r12.12.9',
  './peri01Geometry.js?v=10.4-r12.12.9',
  './modernDxfTemplate.js?v=10.4-r12.12.9',
  './dxfModernEngine.js?v=10.4-r12.12.9',
  './blocks/filteredBlocks.js?v=10.4-r12.12.9',
  './assets/plmr-logo-header.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-64.png'
];

async function cacheCoreAssets() {
  const cache = await caches.open(CACHE_NAME);
  const results = await Promise.allSettled(CORE_ASSETS.map(async asset => {
    const request = new Request(asset, { cache: 'reload' });
    const response = await fetch(request);
    if (!response || !response.ok) throw new Error(`CACHE_FETCH_FAILED:${asset}`);
    await cache.put(request, response.clone());
  }));
  const criticalAssets = new Set([
    './index.html', './buildBootstrap.js?v=10.4-r12.12.9', './core/backendCompatibility.js?v=10.4-r12.12.9',
    './diagnostics/runtimeMonitor.js?v=10.4-r12.12.9', './recovery/recoveryManager.js?v=10.4-r12.12.9', './appLimits.js?v=10.4-r12.12.9', './core/actions.js?v=10.4-r12.12.9', './core/projectModel.js?v=10.4-r12.12.9',
    './core/topologyReconcile.js?v=10.4-r12.12.9', './core/validation.js?v=10.4-r12.12.9', './core/reducer.js?v=10.4-r12.12.9',
    './history/historyManager.js?v=10.4-r12.12.9', './persistence/schema.js?v=10.4-r12.12.9', './render/renderPipeline.js?v=10.4-r12.12.9',
    './app.js?v=10.4-r12.12.9', './peri01Geometry.js?v=10.4-r12.12.9', './blocks/filteredBlocks.js?v=10.4-r12.12.9'
  ]);
  const failures = results.map((result, index) => ({ result, asset: CORE_ASSETS[index] }))
    .filter(item => criticalAssets.has(item.asset) && item.result.status === 'rejected');
  if (failures.length) throw new Error(`PULUMUR_CRITICAL_CACHE_FAILED:${failures.map(item => item.asset).join(',')}`);
}

self.addEventListener('install', event => {
  event.waitUntil(cacheCoreAssets().then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

function fetchWithTimeout(request, timeoutMs = NETWORK_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(request, { cache: 'no-store', signal: controller.signal }).finally(() => clearTimeout(timer));
}

async function networkFirst(request) {
  try {
    const response = await fetchWithTimeout(request);
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
  try {
    const response = await fetchWithTimeout(request);
    if (response && response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone()).catch(() => {});
    }
    return response;
  } catch (_) {
    return Response.error();
  }
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
