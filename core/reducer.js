(function (global) {
  'use strict';

  function dependencies() {
    const model = global.PulumurProjectModel;
    const actions = global.PulumurProjectActions;
    if (!model || !actions) throw new Error('PROJECT_REDUCER_DEPENDENCY_MISSING');
    return { model, actions };
  }

  function reducer(currentState, action) {
    const { model, actions } = dependencies();
    const state = model.normalize(currentState);
    const payload = action && action.payload;
    let next = state;
    let reconcileReport = null;
    switch (action && action.type) {
      case actions.TYPES.REPLACE_MODEL:
        next = model.normalize(payload);
        break;
      case actions.TYPES.SYNC_LEGACY_STATE:
        next = model.fromLegacy(payload && payload.legacy, state, payload && payload.normalizedInput);
        break;
      case actions.TYPES.SET_FORM_FIELD:
        next = model.setFormField(state, payload && payload.field, payload && payload.value);
        break;
      case actions.TYPES.SET_LANGUAGE:
        next = model.normalize(state);
        next.language = payload === 'en' ? 'en' : 'tr';
        break;
      case actions.TYPES.SET_REVISION_INFO:
        next = model.normalize(state);
        next.revisionInfo = { ...next.revisionInfo, ...(payload && typeof payload === 'object' ? model.clone(payload) : {}) };
        next.revisionInfo.revisionNo = Math.max(1, Math.round(Number(next.revisionInfo.revisionNo) || 1));
        break;
      case actions.TYPES.PATCH_DRAWING_OPTIONS:
        next = model.normalize(state);
        next.drawingOptions = { ...next.drawingOptions, ...(payload && typeof payload === 'object' ? model.clone(payload) : {}) };
        break;
      case actions.TYPES.RECONCILE_TOPOLOGY: {
        if (!global.PulumurTopologyReconcile) throw new Error('TOPOLOGY_RECONCILE_NOT_READY');
        const result = global.PulumurTopologyReconcile.reconcileProjectTopology(state, payload && payload.normalizedInput);
        next = result.model;
        reconcileReport = result.report;
        break;
      }
      default:
        throw new Error(`UNKNOWN_PROJECT_ACTION:${action && action.type}`);
    }
    next.lastAction = action ? { type: action.type, meta: model.clone(action.meta) } : null;
    return { state: model.normalize(next), reconcileReport };
  }

  function createStore(initialState, options) {
    const { model, actions } = dependencies();
    let state = model.normalize(initialState || model.createEmpty());
    let lastAction = null;
    let lastReconcileReport = null;
    const listeners = new Set();
    const actionLog = [];

    function getState() { return model.clone(state); }
    function replaceSilently(nextState) { state = model.normalize(nextState); return getState(); }
    function dispatch(input, payload, meta) {
      const action = typeof input === 'string' ? actions.create(input, payload, meta) : input;
      const result = reducer(state, action);
      const validator = options && options.validate;
      const skipValidation = action && action.meta && action.meta.allowInvalid === true;
      state = !skipValidation && typeof validator === 'function' ? validator(result.state) : result.state;
      lastAction = action;
      lastReconcileReport = result.reconcileReport;
      actionLog.push({ id: action.meta.id, type: action.type, createdAt: action.meta.createdAt, source: action.meta.source, transaction: action.meta.transaction });
      if (actionLog.length > 100) actionLog.splice(0, actionLog.length - 100);
      listeners.forEach(listener => {
        try { listener(getState(), action, model.clone(lastReconcileReport)); }
        catch (error) { console.error('Project store listener failed', error); }
      });
      return getState();
    }
    function subscribe(listener) {
      if (typeof listener !== 'function') return function () {};
      listeners.add(listener);
      return () => listeners.delete(listener);
    }
    function debug() { return { lastAction: model.clone(lastAction), lastReconcileReport: model.clone(lastReconcileReport), actions: model.clone(actionLog) }; }
    return Object.freeze({ getState, dispatch, subscribe, replaceSilently, debug });
  }

  const api = Object.freeze({ reducer, createStore });
  global.PulumurProjectReducer = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
