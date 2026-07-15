(function (global) {
  'use strict';

  const MEMORY_BUDGET_BYTES = 24 * 1024 * 1024;

  function modelApi() {
    if (!global.PulumurProjectModel) throw new Error('PROJECT_MODEL_NOT_READY');
    return global.PulumurProjectModel;
  }

  function compactSignature(rawModel) {
    const model = modelApi().normalize(rawModel);
    delete model.lastAction;
    if (model.metadata) delete model.metadata.updatedAt;
    const json = JSON.stringify(model);
    let hash = 2166136261;
    for (let index = 0; index < json.length; index += 1) {
      hash ^= json.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return { signature: `${json.length}:${(hash >>> 0).toString(16)}`, bytes: json.length * 2 };
  }

  function create(options) {
    const state = { entries: [], index: -1, restoring: false, suspendDepth: 0, dirtyWhileSuspended: false, pendingAction: null };
    const getLimit = options && typeof options.getLimit === 'function' ? options.getLimit : () => 20;
    const memoryBudget = Math.max(1024 * 1024, Number(options && options.memoryBudgetBytes) || MEMORY_BUDGET_BYTES);

    function trim() {
      const maxEntries = Math.max(2, Math.round(Number(getLimit()) || 20) + 1);
      while (state.entries.length > maxEntries) {
        state.entries.shift();
        state.index -= 1;
      }
      let totalBytes = state.entries.reduce((sum, entry) => sum + Math.max(0, Number(entry.bytes) || 0), 0);
      while (state.entries.length > 2 && totalBytes > memoryBudget) {
        const removed = state.entries.shift();
        totalBytes -= Math.max(0, Number(removed && removed.bytes) || 0);
        state.index -= 1;
      }
      state.index = state.entries.length ? Math.max(0, Math.min(state.index, state.entries.length - 1)) : -1;
      return { entries: state.entries.length, bytes: totalBytes };
    }

    function createEntry(rawModel, action) {
      const model = modelApi().normalize(rawModel);
      const compact = compactSignature(model);
      return { model, signature: compact.signature, bytes: compact.bytes, action: modelApi().clone(action) || null };
    }

    function record(rawModel, recordOptions) {
      if (state.restoring) return false;
      if (state.suspendDepth > 0) {
        state.dirtyWhileSuspended = true;
        state.pendingAction = modelApi().clone(recordOptions && recordOptions.action) || state.pendingAction;
        return false;
      }
      const entry = createEntry(rawModel, recordOptions && recordOptions.action);
      const current = state.entries[state.index];
      if (!(recordOptions && recordOptions.force) && current && current.signature === entry.signature) return false;
      if (state.index < state.entries.length - 1) state.entries.splice(state.index + 1);
      state.entries.push(entry);
      state.index = state.entries.length - 1;
      trim();
      return true;
    }

    function reset() {
      state.entries = [];
      state.index = -1;
      state.suspendDepth = 0;
      state.dirtyWhileSuspended = false;
      state.pendingAction = null;
    }

    function begin(action) {
      state.suspendDepth += 1;
      if (action) state.pendingAction = modelApi().clone(action);
    }

    function end(rawModel, commit) {
      if (state.suspendDepth > 0) state.suspendDepth -= 1;
      if (state.suspendDepth > 0) return false;
      const shouldRecord = commit !== false && state.dirtyWhileSuspended;
      state.dirtyWhileSuspended = false;
      const action = state.pendingAction;
      state.pendingAction = null;
      return shouldRecord ? record(rawModel, { action }) : false;
    }

    function entryAt(index) {
      const entry = state.entries[index];
      return entry ? { ...entry, model: modelApi().clone(entry.model), action: modelApi().clone(entry.action) } : null;
    }

    return Object.freeze({ state, compactSignature, createEntry, record, reset, begin, end, trim, entryAt });
  }

  const api = Object.freeze({ memoryBudgetBytes: MEMORY_BUDGET_BYTES, compactSignature, create });
  global.PulumurHistoryManager = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
