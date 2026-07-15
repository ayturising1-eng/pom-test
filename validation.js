(function (global) {
  'use strict';

  const FALLBACK_LIMITS = Object.freeze({
    maxSystems: 30, maxRaysPerSystem: 4, maxFrontPosts: 150,
    maxSideSupportsPerView: 8, maxProducts: 200,
    maxSegmentsPerView: 50, historySteps: 20, maxProjectFileMb: 10
  });

  function modelApi() {
    if (!global.PulumurProjectModel) throw new Error('PROJECT_MODEL_NOT_READY');
    return global.PulumurProjectModel;
  }
  function limits() {
    const api = global.PulumurLimits;
    return api && typeof api.get === 'function' ? api.get() : { ...FALLBACK_LIMITS };
  }
  function array(value) { return Array.isArray(value) ? value : []; }
  function object(value) { return value && typeof value === 'object' && !Array.isArray(value) ? value : {}; }
  function numericTokens(value) {
    return String(value == null ? '' : value).split(';').map(token => Number(token.trim().replace(',', '.'))).filter(Number.isFinite);
  }
  function max(values) { return array(values).reduce((out, value) => Math.max(out, Number(value) || 0), 0); }
  function fail(code, actual, limit) {
    const error = new Error(`${code} (${actual}/${limit})`);
    error.code = code;
    error.actual = actual;
    error.limit = limit;
    throw error;
  }

  function validateProjectModel(rawModel, options) {
    const model = modelApi().normalize(rawModel);
    const active = options && options.limits ? { ...limits(), ...options.limits } : limits();
    if (Number(model.schemaVersion) !== 2) fail('PROJECT_SCHEMA_INVALID', model.schemaVersion, 2);
    const systemCount = Math.max(Number(model.topology.systemCount) || 0, model.positions.length);
    if (systemCount > active.maxSystems) fail('SYSTEM_LIMIT_EXCEEDED', systemCount, active.maxSystems);
    const rayMax = Math.max(max(model.positions.map(position => position.rayCount)), max(numericTokens(model.topology.raw.rayCount)));
    if (rayMax > active.maxRaysPerSystem) fail('RAY_LIMIT_EXCEEDED', rayMax, active.maxRaysPerSystem);
    const frontPosts = max(numericTokens(model.topology.raw.postCount));
    if (frontPosts > active.maxFrontPosts) fail('FRONT_POST_LIMIT_EXCEEDED', frontPosts, active.maxFrontPosts);

    const scopes = [model.sideViews.left, model.sideViews.right, ...Object.values(object(model.sideViews.middle))].filter(Boolean);
    scopes.forEach(scope => {
      const supports = array(scope.supportPosts).length;
      if (supports > active.maxSideSupportsPerView) fail(`SIDE_SUPPORT_LIMIT_EXCEEDED:${scope.key}`, supports, active.maxSideSupportsPerView);
      const segmentCount = Math.max(array(scope.parapetSegments).length, array(object(scope.backWall).segments).length, array(object(object(scope.backWall).grid).cells).length);
      if (segmentCount > active.maxSegmentsPerView) fail(`SEGMENT_LIMIT_EXCEEDED:${scope.key}`, segmentCount, active.maxSegmentsPerView);
      if (scope.key === 'last_left_mirror' || scope.derivedFrom) fail('DERIVED_MIRROR_MUST_NOT_BE_PERSISTED', 1, 0);
    });
    const frontSegments = array(model.frontView.parapetSegments).length;
    if (frontSegments > active.maxSegmentsPerView) fail('FRONT_SEGMENT_LIMIT_EXCEEDED', frontSegments, active.maxSegmentsPerView);
    const frontProducts = array(object(model.products.front).sliding).length + array(object(model.products.front).guillotine).length;
    const sideProducts = scopes.reduce((sum, scope) => sum + array(object(scope.products).sliding).length + array(object(scope.products).guillotine).length, 0);
    if (frontProducts + sideProducts > active.maxProducts) fail('PRODUCT_LIMIT_EXCEEDED', frontProducts + sideProducts, active.maxProducts);
    return model;
  }

  const api = Object.freeze({ fallbackLimits: FALLBACK_LIMITS, validateProjectModel });
  global.PulumurProjectValidation = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
