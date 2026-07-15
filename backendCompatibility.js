(function () {
  'use strict';

  const listeners = new Set();
  let state = Object.freeze({
    functionVersion: null,
    backendVersion: null,
    schemaStage: null,
    migrationRequired: false,
    rateLimitMode: 'unknown',
    optimisticLocking: null,
    centralLimits: null,
    sessionRevocation: null,
    warnings: []
  });

  function text(value) {
    if (value == null) return '';
    if (typeof value === 'string') return value;
    if (value.message) return String(value.message);
    if (value.error) return String(value.error);
    try { return JSON.stringify(value); } catch (_) { return String(value); }
  }

  function isMissingFeatureError(error) {
    const raw = text(error);
    return /PGRST202|42883|42703|Could not find the function|function .* does not exist|column .* does not exist|schema cache|not found in the schema cache/i.test(raw);
  }

  function notify() {
    listeners.forEach(listener => {
      try { listener(state); } catch (_) {}
    });
  }

  function update(patch) {
    const next = { ...state, ...(patch || {}) };
    next.warnings = Array.from(new Set([...(state.warnings || []), ...((patch && patch.warnings) || [])].filter(Boolean)));
    state = Object.freeze(next);
    notify();
    return state;
  }

  function applyHealth(payload) {
    const source = payload || {};
    const capabilities = source.capabilities || source;
    return update({
      functionVersion: source.version || state.functionVersion,
      backendVersion: capabilities.backend_version || capabilities.backendVersion || state.backendVersion,
      schemaStage: Number(capabilities.schema_stage ?? capabilities.schemaStage ?? state.schemaStage) || null,
      migrationRequired: Boolean(capabilities.migration_required ?? capabilities.migrationRequired),
      rateLimitMode: capabilities.rate_limit_mode || capabilities.rateLimitMode || state.rateLimitMode,
      optimisticLocking: capabilities.optimistic_locking ?? capabilities.optimisticLocking ?? state.optimisticLocking,
      centralLimits: capabilities.central_limits ?? capabilities.centralLimits ?? state.centralLimits,
      sessionRevocation: capabilities.session_revocation ?? capabilities.sessionRevocation ?? state.sessionRevocation,
      warnings: Array.isArray(source.warnings) ? source.warnings : []
    });
  }

  function markFallback(feature, error) {
    const warning = feature ? `BACKEND_FALLBACK:${feature}` : 'BACKEND_FALLBACK';
    const patch = { migrationRequired: true, warnings: [warning] };
    if (feature === 'central_limits') patch.centralLimits = false;
    if (feature === 'pin_rate_limit') patch.rateLimitMode = 'memory-fallback';
    if (feature === 'optimistic_locking') patch.optimisticLocking = false;
    if (feature === 'session_revocation') patch.sessionRevocation = false;
    if (error && !isMissingFeatureError(error)) patch.warnings.push('BACKEND_FEATURE_ERROR');
    return update(patch);
  }

  function get() {
    return { ...state, warnings: [...state.warnings] };
  }

  function subscribe(listener) {
    if (typeof listener !== 'function') return () => {};
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  window.PulumurBackendCompatibility = Object.freeze({
    get,
    update,
    applyHealth,
    markFallback,
    isMissingFeatureError,
    subscribe
  });
})();
