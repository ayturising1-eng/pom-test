(function (global) {
  'use strict';

  const TYPES = Object.freeze({
    REPLACE_MODEL: 'REPLACE_MODEL',
    SYNC_LEGACY_STATE: 'SYNC_LEGACY_STATE',
    SET_FORM_FIELD: 'SET_FORM_FIELD',
    SET_LANGUAGE: 'SET_LANGUAGE',
    SET_REVISION_INFO: 'SET_REVISION_INFO',
    RECONCILE_TOPOLOGY: 'RECONCILE_TOPOLOGY',
    PATCH_DRAWING_OPTIONS: 'PATCH_DRAWING_OPTIONS'
  });

  let sequence = 0;

  function create(type, payload, meta) {
    if (!Object.values(TYPES).includes(type)) throw new Error(`UNKNOWN_PROJECT_ACTION:${type}`);
    sequence += 1;
    return Object.freeze({
      type,
      payload: payload === undefined ? null : payload,
      meta: Object.freeze({
        id: sequence,
        createdAt: new Date().toISOString(),
        source: 'ui',
        transaction: null,
        ...(meta && typeof meta === 'object' ? meta : {})
      })
    });
  }

  const api = Object.freeze({ TYPES, create });
  global.PulumurProjectActions = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
