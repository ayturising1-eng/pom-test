(function (global) {
  'use strict';

  function api() {
    if (!global.PulumurProjectModel) throw new Error('PROJECT_MODEL_NOT_READY');
    return global.PulumurProjectModel;
  }
  function clone(value) { return api().clone(value); }
  function array(value) { return Array.isArray(value) ? value : []; }
  function object(value) { return value && typeof value === 'object' && !Array.isArray(value) ? value : {}; }
  function integer(value, fallback = 0) { const n = Math.round(Number(value)); return Number.isFinite(n) ? n : fallback; }

  function dimensionPositionIndex(rawKey) {
    const key = String(rawKey || '');
    let match = /^top_ray_spacing_(\d+)_/.exec(key);
    if (match) return integer(match[1], -1);
    match = /^top_system_(\d+)_width$/.exec(key);
    if (match) return integer(match[1], 0) - 1;
    match = /^top_system_gap_(\d+)$/.exec(key);
    if (match) return integer(match[1], 0);
    match = /^side_parapet_width_(\d+)_/.exec(key);
    if (match) return integer(match[1], -1);
    match = /^side_(?:gap|glass_track_to_wall|parapet_height|gutter_to_parapet)_[^_]+_(\d+)(?:_|$)/.exec(key);
    if (match) return integer(match[1], -1);
    match = /_pos_(\d+)$/.exec(key);
    return match ? integer(match[1], 0) - 1 : null;
  }

  function remapRightDimensionKey(rawKey, previousCount, nextCount) {
    const key = String(rawKey || '');
    const oldIndex = Math.max(0, previousCount - 1);
    const nextIndex = Math.max(0, nextCount - 1);
    return key
      .replace(new RegExp(`^(side_parapet_width_)${oldIndex}(_.*)$`), `$1${nextIndex}$2`)
      .replace(new RegExp(`^(side_(?:gap|glass_track_to_wall|parapet_height|gutter_to_parapet)_right_)${oldIndex}(_.*|$)`), `$1${nextIndex}$2`)
      .replace(new RegExp(`^(side_(?:opening|rear_height|front_height)_right_pos_)${previousCount}$`), `$1${nextCount}`);
  }

  function remapRightDimensionOffsets(next, previousCount, positionCount, report) {
    if (previousCount === positionCount) return;
    const right = next.sideViews.right;
    const remapped = {};
    Object.entries(object(right.dimensionOffsets)).forEach(([key, value]) => {
      const nextKey = remapRightDimensionKey(key, previousCount, positionCount);
      remapped[nextKey] = clone(value);
      if (nextKey !== key) {
        delete next.dimensions.offsets[key];
        next.dimensions.offsets[nextKey] = clone(value);
        report.remapped.push(`dimensions.offsets:${key}->${nextKey}`);
      }
    });
    right.dimensionOffsets = remapped;
  }

  function reconcileDimensionOffsets(next, positionCount, report) {
    const offsets = object(next.dimensions.offsets);
    Object.entries(offsets).forEach(([key, value]) => {
      const index = dimensionPositionIndex(key);
      if (index === null || index < positionCount) return;
      next.orphans.notes.push({ type: 'dimensionOffset', key, positionIndex: index, reason: 'position-removed', value: clone(value) });
      delete offsets[key];
      report.orphaned.push(`dimensions.offsets.${key}`);
    });
    const retainedNotes = [];
    array(next.orphans.notes).forEach(note => {
      if (!note || note.type !== 'dimensionOffset' || integer(note.positionIndex, -1) >= positionCount || !note.key) {
        retainedNotes.push(note);
        return;
      }
      if (offsets[note.key] === undefined) {
        offsets[note.key] = clone(note.value);
        report.remapped.push(`dimensions.offsets.${note.key}`);
      }
    });
    next.orphans.notes = retainedNotes;
    next.dimensions.offsets = offsets;
  }

  function reconcileProjectTopology(previousModel, normalizedInput) {
    const modelApi = api();
    const previous = modelApi.normalize(previousModel);
    const next = modelApi.withNormalizedInput(previous, normalizedInput);
    const report = { kept: [], remapped: [], orphaned: [], removed: [], warnings: [] };
    const positionCount = Math.max(1, integer(next.topology.systemCount, next.positions.length || 1));
    const previousCount = Math.max(1, integer(previous.topology.systemCount, previous.positions.length || 1));
    const validMiddle = new Set();
    for (let index = 1; index < positionCount - 1; index += 1) validMiddle.add(`middle_${index}`);

    Object.entries(next.sideViews.middle).forEach(([name, scope]) => {
      if (validMiddle.has(name)) {
        report.kept.push(`sideViews.${name}`);
        return;
      }
      Object.keys(object(scope.dimensionOffsets)).forEach(key => { delete next.dimensions.offsets[key]; });
      next.orphans.sideViews[name] = clone(scope);
      delete next.sideViews.middle[name];
      report.orphaned.push(`sideViews.${name}`);
    });

    validMiddle.forEach(name => {
      if (next.sideViews.middle[name]) return;
      const restored = next.orphans.sideViews[name];
      if (restored) {
        next.sideViews.middle[name] = clone(restored);
        Object.assign(next.dimensions.offsets, clone(object(restored.dimensionOffsets)) || {});
        delete next.orphans.sideViews[name];
        report.remapped.push(`sideViews.${name}`);
      }
    });

    remapRightDimensionOffsets(next, previousCount, positionCount, report);
    reconcileDimensionOffsets(next, positionCount, report);

    const postCount = Math.max(0, integer(normalizedInput && normalizedInput.postCount, 0));
    if (Array.isArray(next.frontView.postCenters) && next.frontView.postCenters.length !== postCount) {
      next.orphans.notes.push({ type: 'frontPostCenters', reason: 'post-count-changed', value: clone(next.frontView.postCenters) });
      next.frontView.postCenters = null;
      report.orphaned.push('frontView.postCenters');
    }
    if (next.frontView.postProfiles.length > postCount) {
      next.orphans.notes.push({ type: 'frontPostProfiles', reason: 'post-count-reduced', value: clone(next.frontView.postProfiles.slice(postCount)) });
      next.frontView.postProfiles = next.frontView.postProfiles.slice(0, postCount);
      report.orphaned.push('frontView.postProfiles');
    }
    if (next.frontView.postExtensions.length > postCount) {
      next.orphans.notes.push({ type: 'frontPostExtensions', reason: 'post-count-reduced', value: clone(next.frontView.postExtensions.slice(postCount)) });
      next.frontView.postExtensions = next.frontView.postExtensions.slice(0, postCount);
      report.orphaned.push('frontView.postExtensions');
    }

    const validSystemIndexes = new Set(array(normalizedInput && normalizedInput.systems).map((_, index) => String(index)));
    if (next.frontView.rayPositions && typeof next.frontView.rayPositions === 'object') {
      Object.keys(next.frontView.rayPositions).forEach(key => {
        const system = normalizedInput && normalizedInput.systems && normalizedInput.systems[Number(key)];
        const positions = next.frontView.rayPositions[key];
        if (validSystemIndexes.has(String(key)) && system && Array.isArray(positions) && positions.length === Number(system.rayCount)) return;
        next.orphans.notes.push({ type: 'rayPositions', key, reason: 'ray-topology-changed', value: clone(positions) });
        delete next.frontView.rayPositions[key];
        report.orphaned.push(`frontView.rayPositions.${key}`);
      });
      if (!Object.keys(next.frontView.rayPositions).length) next.frontView.rayPositions = null;
    }

    const maxGap = Math.max(0, postCount - 2);
    ['sliding', 'guillotine'].forEach(type => {
      const kept = [];
      array(next.products.front[type]).forEach(product => {
        const gap = integer(product && product.gapIndex, -1);
        if (gap >= 0 && gap <= maxGap) kept.push(product);
        else {
          next.orphans.frontProducts.push({ type, reason: 'front-gap-removed', value: clone(product) });
          report.orphaned.push(`products.front.${type}:${product && product.id || gap}`);
        }
      });
      next.products.front[type] = kept;
    });

    next.topology.rightMaster = true;
    next.sideViews.right.master = true;
    next.sideViews.right.editable = true;
    next.sideViews.left.master = false;
    next.metadata.updatedAt = new Date().toISOString();
    if (report.orphaned.length) report.warnings.push(`${report.orphaned.length} topology item(s) preserved in orphan storage.`);
    return { model: modelApi.normalize(next), report };
  }

  const exported = Object.freeze({ reconcileProjectTopology });
  global.PulumurTopologyReconcile = exported;
  if (typeof module !== 'undefined') module.exports = exported;
})(typeof window !== 'undefined' ? window : globalThis);
