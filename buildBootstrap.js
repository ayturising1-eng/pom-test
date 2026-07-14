(function () {
  'use strict';

  const build = '10.4';
  const key = 'plmr_loaded_build';
  const cachePrefix = 'pulumur-pwa-';

  try {
    if (localStorage.getItem(key) !== build) {
      localStorage.setItem(key, build);
      if ('caches' in window) {
        caches.keys()
          .then(keys => Promise.all(keys.filter(name => name.startsWith(cachePrefix)).map(name => caches.delete(name))))
          .catch(() => {});
      }
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations()
          .then(registrations => Promise.all(registrations.map(registration => registration.update())))
          .catch(() => {});
      }
    }
  } catch (_) {}

  window.PULUMUR_BUILD = build;
})();
