(function () {
  'use strict';

  const STORAGE_KEY = 'plmr_runtime_errors_v1';
  const MAX_ENTRIES = 20;
  const MAX_TEXT = 1200;
  const startedAt = Date.now();
  let lastAction = null;
  let backendStatus = null;
  let entries = [];

  function sanitizeText(value) {
    let raw = String(value == null ? '' : value).slice(0, MAX_TEXT);
    raw = raw.replace(/eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}/g, '[REDACTED_JWT]');
    raw = raw.replace(/(access_token|refresh_token|service_role|password|pin|pepper)\s*[:=]\s*[^\s,;]+/gi, '$1=[REDACTED]');
    return raw;
  }

  function safeAction(action) {
    if (!action || typeof action !== 'object') return null;
    return {
      type: sanitizeText(action.type || ''),
      source: sanitizeText(action.meta && action.meta.source || ''),
      timestamp: Number(action.timestamp) || null
    };
  }

  function loadStored() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      if (Array.isArray(parsed)) entries = parsed.slice(-MAX_ENTRIES);
    } catch (_) { entries = []; }
  }

  function persist() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(-MAX_ENTRIES))); } catch (_) {}
  }

  function record(kind, error, extra) {
    const message = error && error.message ? error.message : error;
    const stack = error && error.stack ? error.stack : '';
    const entry = {
      id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      kind: sanitizeText(kind || 'error'),
      message: sanitizeText(message || 'UNKNOWN_ERROR'),
      stack: sanitizeText(stack),
      build: String(window.PULUMUR_BUILD || '10.4'),
      path: sanitizeText(location.pathname),
      userAgent: sanitizeText(navigator.userAgent),
      online: navigator.onLine,
      lastAction: safeAction(lastAction),
      backend: backendStatus ? { ...backendStatus, warnings: Array.isArray(backendStatus.warnings) ? backendStatus.warnings.slice(0, 10) : [] } : null,
      extra: extra && typeof extra === 'object' ? JSON.parse(JSON.stringify(extra, (_key, value) => {
        if (typeof value === 'string') return sanitizeText(value);
        return value;
      })) : null,
      createdAt: new Date().toISOString()
    };
    entries.push(entry);
    entries = entries.slice(-MAX_ENTRIES);
    persist();
    return entry.id;
  }

  function report() {
    const memory = performance && performance.memory ? {
      usedJsHeapSize: performance.memory.usedJSHeapSize,
      totalJsHeapSize: performance.memory.totalJSHeapSize,
      jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
    } : null;
    return {
      build: String(window.PULUMUR_BUILD || '10.4'),
      generatedAt: new Date().toISOString(),
      sessionAgeMs: Date.now() - startedAt,
      path: location.pathname,
      userAgent: navigator.userAgent,
      online: navigator.onLine,
      memory,
      lastAction: safeAction(lastAction),
      backend: backendStatus,
      errors: entries.slice()
    };
  }

  function downloadReport() {
    const blob = new Blob([JSON.stringify(report(), null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `PLMR-diagnostics-${String(window.PULUMUR_BUILD || '10_4').replace(/\./g, '_')}.json`;
    anchor.rel = 'noopener';
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  loadStored();
  window.addEventListener('error', event => {
    record('window.error', event.error || event.message, { filename: event.filename, line: event.lineno, column: event.colno });
  });
  window.addEventListener('unhandledrejection', event => {
    record('unhandledrejection', event.reason || 'UNHANDLED_REJECTION');
  });
  window.addEventListener('load', () => {
    try {
      const navigation = performance.getEntriesByType('navigation')[0];
      if (navigation && navigation.loadEventEnd > 0) {
        localStorage.setItem('plmr_last_load_metrics_v1', JSON.stringify({
          build: String(window.PULUMUR_BUILD || '10.4'),
          domContentLoadedMs: Math.round(navigation.domContentLoadedEventEnd),
          loadMs: Math.round(navigation.loadEventEnd),
          transferSize: Number(navigation.transferSize) || 0,
          recordedAt: new Date().toISOString()
        }));
      }
    } catch (_) {}
  }, { once: true });

  window.PulumurRuntimeMonitor = Object.freeze({
    record,
    getEntries: () => entries.slice(),
    clear: () => { entries = []; persist(); },
    report,
    downloadReport,
    setLastAction: action => { lastAction = safeAction(action); },
    setBackendStatus: status => { backendStatus = status ? { ...status } : null; }
  });
})();
