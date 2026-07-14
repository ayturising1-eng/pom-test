(function (global) {
  'use strict';

  const STORAGE_KEY = 'plmr_application_limits_v1';
  const DEFAULTS = Object.freeze({
    maxSystems: 30,
    maxRaysPerSystem: 4,
    maxFrontPosts: 150,
    maxSideSupportsPerView: 8,
    maxProducts: 200,
    maxSegmentsPerView: 50,
    historySteps: 20,
    maxProjectFileMb: 10
  });
  const HARD_CAPS = Object.freeze({
    maxSystems: 50,
    maxRaysPerSystem: 8,
    maxFrontPosts: 300,
    maxSideSupportsPerView: 20,
    maxProducts: 500,
    maxSegmentsPerView: 100,
    historySteps: 100,
    maxProjectFileMb: 25
  });
  const MINIMUMS = Object.freeze({
    maxSystems: 1,
    maxRaysPerSystem: 1,
    maxFrontPosts: 2,
    maxSideSupportsPerView: 0,
    maxProducts: 0,
    maxSegmentsPerView: 1,
    historySteps: 1,
    maxProjectFileMb: 1
  });

  function clampInteger(value, key) {
    const number = Math.round(Number(value));
    const fallback = DEFAULTS[key];
    const safe = Number.isFinite(number) ? number : fallback;
    return Math.min(HARD_CAPS[key], Math.max(MINIMUMS[key], safe));
  }

  function sanitize(source) {
    const raw = source && typeof source === 'object' ? source : {};
    const output = {};
    Object.keys(DEFAULTS).forEach(key => { output[key] = clampInteger(raw[key], key); });
    return output;
  }

  function read() {
    try {
      const raw = global.localStorage ? global.localStorage.getItem(STORAGE_KEY) : null;
      return raw ? sanitize(JSON.parse(raw)) : { ...DEFAULTS };
    } catch (_) {
      return { ...DEFAULTS };
    }
  }

  let current = read();
  const listeners = new Set();

  function notify() {
    const snapshot = get();
    listeners.forEach(listener => {
      try { listener(snapshot); } catch (error) { console.error('Pulumur limit listener failed', error); }
    });
    try { global.dispatchEvent(new CustomEvent('pulumur:limits-changed', { detail: snapshot })); } catch (_) {}
  }

  function get() { return { ...current }; }

  function set(next) {
    current = sanitize({ ...current, ...(next || {}) });
    try {
      if (global.localStorage) global.localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    } catch (_) {}
    notify();
    return get();
  }

  function reset() {
    current = { ...DEFAULTS };
    try {
      if (global.localStorage) global.localStorage.removeItem(STORAGE_KEY);
    } catch (_) {}
    notify();
    return get();
  }

  function subscribe(listener) {
    if (typeof listener !== 'function') return function () {};
    listeners.add(listener);
    return function () { listeners.delete(listener); };
  }

  global.PulumurLimits = Object.freeze({
    storageKey: STORAGE_KEY,
    defaults: { ...DEFAULTS },
    hardCaps: { ...HARD_CAPS },
    minimums: { ...MINIMUMS },
    get,
    set,
    reset,
    sanitize,
    subscribe
  });
})(typeof window !== 'undefined' ? window : globalThis);
