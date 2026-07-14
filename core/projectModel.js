(function (global) {
  'use strict';

  const SCHEMA_VERSION = 2;
  const META_FIELDS = new Set(['product', 'moduleName', 'engine', 'customer', 'project', 'version', 'drawnBy', 'date']);
  const TOPOLOGY_FIELDS = new Set(['systemCount', 'width', 'opening', 'rearHeight', 'frontHeight', 'rayCount', 'postCount']);
  const DEFAULT_FORM = Object.freeze({
    product: 'Pergo Rise', moduleName: 'Module 1', engine: 'Web DXF', customer: '', project: '', version: '01', drawnBy: 'AYETULLAH KILINC', date: '',
    systemCount: '1', width: '', opening: '', rearHeight: '', frontHeight: '', rayCount: '', postCount: '',
    parapet: 'HAYIR', parapetHeight: '-', glassTrack: 'HAYIR', sideTrack: 'HAYIR', structureColor: '-', fabric: '-', fabricProfiles: '-', motor: '-', remote: '-', led: '-', dimmer: '-', extras: '-', triangleJoinery: 'HAYIR', waterStandard: 'EVET'
  });

  function clone(value) {
    if (value === undefined) return undefined;
    return JSON.parse(JSON.stringify(value));
  }

  function object(value) { return value && typeof value === 'object' && !Array.isArray(value) ? value : {}; }
  function array(value) { return Array.isArray(value) ? value : []; }
  function text(value, fallback = '') { return value === undefined || value === null ? fallback : String(value); }
  function positiveInteger(value, fallback = 1) {
    const number = Math.round(Number(value));
    return Number.isFinite(number) && number > 0 ? number : fallback;
  }
  function finite(value, fallback = 0) { const number = Number(value); return Number.isFinite(number) ? number : fallback; }

  function legacyKeyToScopeName(rawKey) {
    const key = text(rawKey).trim().toLowerCase();
    if (key === 'right') return 'right';
    if (key === 'left' || key === '0' || key === '') return 'left';
    const index = Math.max(1, positiveInteger(key.replace(/^middle[_:-]?/, ''), 1));
    return `middle_${index}`;
  }

  function scopeNameToLegacyKey(scopeName) {
    const name = text(scopeName).trim().toLowerCase();
    if (name === 'right') return 'right';
    if (name === 'left') return '0';
    return String(Math.max(1, positiveInteger(name.replace(/^middle_?/, ''), 1)));
  }

  function emptyScope(name, enabled) {
    return {
      key: name,
      enabled: enabled !== false,
      editable: true,
      master: name === 'right',
      glassTrack: { enabled: null, lengthOffset: 0, supportProfile: null },
      triangle: { enabled: null, divisionCount: null },
      supportCenters: null,
      supportPosts: [],
      parapetSegments: [],
      backWall: { xOffset: 0, depth: 600, height: 0, segments: [] },
      products: { sliding: [], guillotine: [] },
      dimensionOffsets: {}
    };
  }

  function dimensionOffsetBelongsToScope(rawKey, scopeName) {
    const key = text(rawKey).toLowerCase();
    const legacyKey = scopeNameToLegacyKey(scopeName);
    const identifiers = scopeName === 'left' ? ['0', 'left'] : scopeName === 'right' ? ['right'] : [legacyKey];
    return identifiers.some(identifier => [
      `side_parapet_width_${identifier}_`,
      `side_gap_${identifier}_`,
      `side_glass_track_to_wall_${identifier}_`,
      `side_parapet_height_${identifier}_`,
      `side_gutter_to_parapet_${identifier}_`,
      `side_opening_${identifier}_`,
      `side_rear_height_${identifier}_`,
      `side_front_height_${identifier}_`
    ].some(prefix => key.startsWith(prefix)));
  }

  function scopedDimensionOffsets(allOffsets, scopeName) {
    return Object.fromEntries(Object.entries(object(allOffsets))
      .filter(([key]) => dimensionOffsetBelongsToScope(key, scopeName))
      .map(([key, value]) => [key, clone(value)]));
  }

  function normalizeScope(rawScope, name, enabled) {
    const base = emptyScope(name, enabled);
    const source = object(rawScope);
    const glassTrack = object(source.glassTrack);
    const triangle = object(source.triangle);
    const backWall = object(source.backWall);
    const products = object(source.products);
    return {
      ...base,
      ...clone(source),
      key: name,
      enabled: name === 'left' || name === 'right' ? true : source.enabled === true,
      editable: source.editable !== false,
      master: name === 'right',
      glassTrack: {
        enabled: glassTrack.enabled === undefined ? base.glassTrack.enabled : glassTrack.enabled,
        lengthOffset: finite(glassTrack.lengthOffset, 0),
        supportProfile: clone(glassTrack.supportProfile) || null
      },
      triangle: {
        enabled: triangle.enabled === undefined ? base.triangle.enabled : triangle.enabled,
        divisionCount: triangle.divisionCount === undefined ? base.triangle.divisionCount : triangle.divisionCount
      },
      supportCenters: source.supportCenters === null || source.supportCenters === undefined ? null : finite(source.supportCenters, 0),
      supportPosts: clone(array(source.supportPosts)),
      parapetSegments: clone(array(source.parapetSegments)),
      backWall: {
        xOffset: finite(backWall.xOffset, 0),
        depth: Math.max(1, finite(backWall.depth, 600)),
        height: Math.max(0, finite(backWall.height, 0)),
        segments: clone(array(backWall.segments))
      },
      products: {
        sliding: clone(array(products.sliding)),
        guillotine: clone(array(products.guillotine))
      },
      dimensionOffsets: clone(object(source.dimensionOffsets))
    };
  }

  function createEmpty() {
    const now = new Date().toISOString();
    return {
      schemaVersion: SCHEMA_VERSION,
      metadata: {
        product: DEFAULT_FORM.product, moduleName: DEFAULT_FORM.moduleName, engine: DEFAULT_FORM.engine,
        customer: '', project: '', version: '01', drawnBy: DEFAULT_FORM.drawnBy, date: '',
        createdAt: now, updatedAt: now
      },
      topology: {
        systemCount: 1,
        raw: { systemCount: '1', width: '', opening: '', rearHeight: '', frontHeight: '', rayCount: '', postCount: '' },
        systems: [],
        rightMaster: true
      },
      positions: [],
      frontView: {
        manualPostPlacementMode: 'standard',
        glassTrackProfile: { mode: 'standard', en: 100, boy: 100, et: 2 },
        postCenters: null,
        rayPositions: null,
        postProfiles: [],
        postExtensions: [],
        parapetSegments: []
      },
      sideViews: { left: emptyScope('left', true), right: emptyScope('right', true), middle: {} },
      products: { front: { sliding: [], guillotine: [] } },
      dimensions: {
        filter: { main: true, all: false, preset: 'main', horizontal: true, vertical: true, editable: true, readonly: true, positions: null },
        offsets: {}
      },
      drawingOptions: Object.fromEntries(Object.entries(DEFAULT_FORM).filter(([key]) => !META_FIELDS.has(key) && !TOPOLOGY_FIELDS.has(key))),
      revisionInfo: { projectId: null, projectCode: null, revisionNo: 1 },
      manualInputFlags: { rayCount: false, postCount: false },
      language: 'tr',
      orphans: { sideViews: {}, frontProducts: [], notes: [] },
      lastAction: null
    };
  }

  function normalizeFormData(raw) {
    const source = object(raw);
    const out = { ...DEFAULT_FORM };
    Object.keys(DEFAULT_FORM).forEach(key => {
      if (source[key] !== undefined && source[key] !== null) out[key] = text(source[key]);
    });
    out.systemCount = String(positiveInteger(out.systemCount, 1));
    return out;
  }

  function normalizePositions(input, formData) {
    const normalized = object(input);
    if (Array.isArray(normalized.positions) && normalized.positions.length) {
      return normalized.positions.map((position, index) => ({
        id: `position_${index + 1}`,
        index,
        width: finite(position.width, 0),
        opening: finite(position.opening, 0),
        rearHeight: finite(position.rearHeight, 0),
        frontHeight: finite(position.frontHeight, finite(normalized.frontHeight, 0)),
        rayCount: positiveInteger(position.rayCount || normalized.systems && normalized.systems[index] && normalized.systems[index].rayCount, 1)
      }));
    }
    const split = value => text(value).split(';').map(token => token.trim()).filter(token => token && token.toLocaleUpperCase('tr-TR') !== 'NO');
    const width = split(formData.width);
    const opening = split(formData.opening);
    const rearHeight = split(formData.rearHeight);
    const frontHeight = split(formData.frontHeight);
    const rayCount = split(formData.rayCount);
    const count = Math.max(1, positiveInteger(formData.systemCount, 1), width.length, opening.length, rearHeight.length, rayCount.length);
    const at = (list, index, fallback = 0) => finite(list[index] === undefined ? list[list.length - 1] : list[index], fallback);
    return Array.from({ length: count }, (_, index) => ({
      id: `position_${index + 1}`, index,
      width: at(width, index), opening: at(opening, index), rearHeight: at(rearHeight, index),
      frontHeight: at(frontHeight, index), rayCount: positiveInteger(at(rayCount, index, 1), 1)
    }));
  }

  function sideMapValue(source, scopeName, fallback) {
    const map = object(source);
    if (scopeName === 'left') return map.left !== undefined ? map.left : fallback;
    if (scopeName === 'right') return map.right !== undefined ? map.right : fallback;
    const key = scopeNameToLegacyKey(scopeName);
    return object(map.middle)[key] !== undefined ? object(map.middle)[key] : fallback;
  }

  function keyedValue(source, scopeName, fallback) {
    const map = object(source);
    const key = scopeNameToLegacyKey(scopeName);
    return map[key] !== undefined ? map[key] : fallback;
  }

  function scopeNamesFromState(state) {
    const names = new Set(['left', 'right']);
    const addLegacyKey = key => {
      const name = legacyKeyToScopeName(key);
      if (name.startsWith('middle_')) names.add(name);
    };
    const keyedSources = [state.sidePosts, state.sideSupportCenters, object(state.parapetSegments).side, object(state.backWallSegments).side];
    keyedSources.forEach(source => Object.keys(object(source)).forEach(addLegacyKey));
    ['middleEnabled'].forEach(key => Object.keys(object(object(state.sideFeatureState)[key])).forEach(addLegacyKey));
    ['glassTrack', 'triangle'].forEach(key => Object.keys(object(object(object(state.sideFeatureState)[key]).middle)).forEach(addLegacyKey));
    Object.keys(object(object(state.glassTrackLengthOffsets).middle)).forEach(addLegacyKey);
    Object.keys(object(object(state.triangleDivisionState).middle)).forEach(addLegacyKey);
    Object.keys(object(object(state.backWallState).middle)).forEach(addLegacyKey);
    array(state.sideSlidingPlacements).concat(array(state.sideGuillotinePlacements)).forEach(item => addLegacyKey(item.sideViewKey === undefined ? item.sideIndex : item.sideViewKey));
    return Array.from(names).sort((a, b) => {
      if (a === 'left') return -1;
      if (b === 'left') return 1;
      if (a === 'right') return 1;
      if (b === 'right') return -1;
      return positiveInteger(a.replace('middle_', ''), 1) - positiveInteger(b.replace('middle_', ''), 1);
    });
  }

  function scopeFromLegacy(scopeName, state) {
    const scope = emptyScope(scopeName, scopeName === 'left' || scopeName === 'right');
    const key = scopeNameToLegacyKey(scopeName);
    const sideFeatures = object(state.sideFeatureState);
    const middleEnabled = object(sideFeatures.middleEnabled);
    scope.enabled = scopeName === 'left' || scopeName === 'right' ? true : !!middleEnabled[key];
    scope.glassTrack.enabled = sideMapValue(object(sideFeatures.glassTrack), scopeName, null);
    scope.glassTrack.lengthOffset = finite(sideMapValue(object(state.glassTrackLengthOffsets), scopeName, 0), 0);
    const supportProfiles = object(state.glassTrackSupportProfiles);
    scope.glassTrack.supportProfile = clone(scopeName === 'left' ? supportProfiles.left : scopeName === 'right' ? supportProfiles.right : null);
    scope.triangle.enabled = sideMapValue(object(sideFeatures.triangle), scopeName, null);
    scope.triangle.divisionCount = sideMapValue(object(state.triangleDivisionState), scopeName, null);
    scope.supportCenters = keyedValue(state.sideSupportCenters, scopeName, null);
    scope.supportPosts = clone(keyedValue(state.sidePosts, scopeName, [])) || [];
    scope.parapetSegments = clone(keyedValue(object(state.parapetSegments).side, scopeName, [])) || [];
    const wall = clone(sideMapValue(object(state.backWallState), scopeName, { xOffset: 0, depth: 600, height: 0 })) || {};
    scope.backWall = {
      xOffset: finite(wall.xOffset, 0), depth: Math.max(1, finite(wall.depth, 600)), height: Math.max(0, finite(wall.height, 0)),
      segments: clone(keyedValue(object(state.backWallSegments).side, scopeName, [])) || []
    };
    const matches = item => legacyKeyToScopeName(item && (item.sideViewKey === undefined ? item.sideIndex : item.sideViewKey)) === scopeName;
    scope.products.sliding = clone(array(state.sideSlidingPlacements).filter(matches)) || [];
    scope.products.guillotine = clone(array(state.sideGuillotinePlacements).filter(matches)) || [];
    scope.dimensionOffsets = scopedDimensionOffsets(state.previewDimensionOffsets, scopeName);
    return scope;
  }

  function fromLegacy(legacy, previousModel, normalizedInput) {
    const source = object(legacy);
    const state = object(source.drawingState);
    const formData = normalizeFormData(source.formData);
    const previous = object(previousModel);
    const model = createEmpty();
    const previousMetadata = object(previous.metadata);
    model.metadata = {
      product: formData.product, moduleName: formData.moduleName, engine: formData.engine,
      customer: formData.customer, project: formData.project, version: formData.version,
      drawnBy: formData.drawnBy, date: formData.date,
      createdAt: previousMetadata.createdAt || source.createdAt || source.savedAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    model.topology.raw = Object.fromEntries(Array.from(TOPOLOGY_FIELDS).map(key => [key, formData[key]]));
    model.topology.systemCount = positiveInteger(formData.systemCount, 1);
    const input = object(normalizedInput);
    model.topology.systems = clone(array(input.systems)) || [];
    model.positions = normalizePositions(input, formData);
    model.topology.systemCount = Math.max(model.topology.systemCount, model.positions.length);
    model.frontView = {
      manualPostPlacementMode: text(state.manualPostPlacementMode, 'standard'),
      glassTrackProfile: clone(state.glassTrackProfile) || { mode: 'standard', en: 100, boy: 100, et: 2 },
      postCenters: Array.isArray(state.frontPostCenters) ? state.frontPostCenters.map(value => finite(value, 0)) : null,
      rayPositions: clone(state.customRayPositions) || null,
      postProfiles: clone(array(state.frontPostProfiles)) || [],
      postExtensions: array(state.frontPostExtensions).map(value => Math.max(0, finite(value, 0))),
      parapetSegments: clone(array(object(state.parapetSegments).front)) || []
    };
    model.sideViews = { left: null, right: null, middle: {} };
    scopeNamesFromState(state).forEach(name => {
      const scope = scopeFromLegacy(name, state);
      if (name === 'left' || name === 'right') model.sideViews[name] = scope;
      else model.sideViews.middle[name] = scope;
    });
    model.sideViews.left = model.sideViews.left || emptyScope('left', true);
    model.sideViews.right = model.sideViews.right || emptyScope('right', true);
    model.products.front = {
      sliding: clone(array(state.slidingPlacements)) || [],
      guillotine: clone(array(state.guillotinePlacements)) || []
    };
    model.dimensions = {
      filter: clone(object(object(source.uiSettings).dimensions)) || clone(createEmpty().dimensions.filter),
      offsets: clone(object(state.previewDimensionOffsets)) || {}
    };
    model.drawingOptions = Object.fromEntries(Object.entries(formData).filter(([key]) => !META_FIELDS.has(key) && !TOPOLOGY_FIELDS.has(key)));
    const record = object(source.record || source.revisionInfo);
    model.revisionInfo = {
      projectId: record.projectId ? text(record.projectId) : null,
      projectCode: record.projectCode ? text(record.projectCode) : null,
      revisionNo: positiveInteger(record.revisionNo, 1)
    };
    model.manualInputFlags = {
      rayCount: !!object(state.manualInputFlags).rayCount,
      postCount: !!object(state.manualInputFlags).postCount
    };
    model.language = object(source.uiSettings).language === 'en' ? 'en' : 'tr';
    model.orphans = clone(object(previous.orphans)) || { sideViews: {}, frontProducts: [], notes: [] };
    model.lastAction = clone(source.lastAction || previous.lastAction) || null;
    return normalize(model);
  }

  function formDataFromModel(rawModel) {
    const model = normalize(rawModel);
    return {
      ...DEFAULT_FORM,
      ...clone(model.drawingOptions),
      product: model.metadata.product, moduleName: model.metadata.moduleName, engine: model.metadata.engine,
      customer: model.metadata.customer, project: model.metadata.project, version: model.metadata.version,
      drawnBy: model.metadata.drawnBy, date: model.metadata.date,
      ...clone(model.topology.raw),
      systemCount: String(model.topology.systemCount)
    };
  }

  function writeSideMap(target, scopeName, value) {
    if (scopeName === 'left') target.left = clone(value);
    else if (scopeName === 'right') target.right = clone(value);
    else target.middle[scopeNameToLegacyKey(scopeName)] = clone(value);
  }

  function toLegacy(rawModel) {
    const model = normalize(rawModel);
    const sideFeatureState = { glassTrack: { left: null, right: null, middle: {} }, triangle: { left: null, right: null, middle: {} }, middleEnabled: {} };
    const glassTrackLengthOffsets = { left: 0, right: 0, middle: {} };
    const triangleDivisionState = { left: null, right: null, middle: {} };
    const backWallState = { left: { xOffset: 0, depth: 600, height: 0 }, right: { xOffset: 0, depth: 600, height: 0 }, middle: {} };
    const backWallSegments = { side: {} };
    const parapetSegments = { front: clone(model.frontView.parapetSegments) || [], side: {} };
    const sidePosts = {};
    const sideSupportCenters = {};
    const sideSlidingPlacements = [];
    const sideGuillotinePlacements = [];
    const previewDimensionOffsets = clone(model.dimensions.offsets) || {};
    const allScopes = [model.sideViews.left, ...Object.values(model.sideViews.middle), model.sideViews.right].filter(Boolean);
    allScopes.forEach(scope => {
      const name = scope.key;
      const key = scopeNameToLegacyKey(name);
      if (name.startsWith('middle_')) sideFeatureState.middleEnabled[key] = !!scope.enabled;
      writeSideMap(sideFeatureState.glassTrack, name, scope.glassTrack.enabled);
      writeSideMap(sideFeatureState.triangle, name, scope.triangle.enabled);
      writeSideMap(glassTrackLengthOffsets, name, finite(scope.glassTrack.lengthOffset, 0));
      writeSideMap(triangleDivisionState, name, scope.triangle.divisionCount);
      writeSideMap(backWallState, name, { xOffset: finite(scope.backWall.xOffset, 0), depth: Math.max(1, finite(scope.backWall.depth, 600)), height: Math.max(0, finite(scope.backWall.height, 0)) });
      sidePosts[key] = clone(scope.supportPosts) || [];
      if (scope.supportCenters !== null && scope.supportCenters !== undefined) sideSupportCenters[key] = finite(scope.supportCenters, 0);
      parapetSegments.side[key] = clone(scope.parapetSegments) || [];
      backWallSegments.side[key] = clone(scope.backWall.segments) || [];
      Object.assign(previewDimensionOffsets, clone(scope.dimensionOffsets) || {});
      array(scope.products.sliding).forEach(item => sideSlidingPlacements.push({ ...clone(item), sideViewKey: key, placementView: key === 'right' ? 'side-right' : 'side-left' }));
      array(scope.products.guillotine).forEach(item => sideGuillotinePlacements.push({ ...clone(item), sideViewKey: key, placementView: key === 'right' ? 'side-right' : 'side-left' }));
    });
    return {
      formData: formDataFromModel(model),
      drawingState: {
        manualPostPlacementMode: model.frontView.manualPostPlacementMode,
        glassTrackProfile: clone(model.frontView.glassTrackProfile),
        glassTrackSupportProfiles: { left: clone(model.sideViews.left.glassTrack.supportProfile), right: clone(model.sideViews.right.glassTrack.supportProfile) },
        frontPostCenters: clone(model.frontView.postCenters), customRayPositions: clone(model.frontView.rayPositions),
        sideSupportCenters, sidePosts,
        frontPostProfiles: clone(model.frontView.postProfiles), frontPostExtensions: clone(model.frontView.postExtensions),
        parapetSegments, sideFeatureState, glassTrackLengthOffsets, triangleDivisionState, backWallState, backWallSegments,
        previewDimensionOffsets,
        slidingPlacements: clone(model.products.front.sliding), sideSlidingPlacements,
        guillotinePlacements: clone(model.products.front.guillotine), sideGuillotinePlacements,
        manualInputFlags: clone(model.manualInputFlags)
      },
      uiSettings: { language: model.language, dimensions: clone(model.dimensions.filter) },
      record: clone(model.revisionInfo)
    };
  }

  function geometryInputFromModel(rawModel) {
    const legacy = toLegacy(rawModel);
    const state = legacy.drawingState;
    return {
      ...legacy.formData,
      __manualPostPlacementMode: state.manualPostPlacementMode,
      __glassTrackProfile: clone(state.glassTrackProfile),
      __glassTrackSupportProfiles: clone(state.glassTrackSupportProfiles),
      __frontPostCenters: clone(state.frontPostCenters),
      __customRayPositions: clone(state.customRayPositions),
      __sideSupportCenters: clone(state.sideSupportCenters),
      __sidePosts: clone(state.sidePosts),
      __frontPostProfiles: clone(state.frontPostProfiles),
      __frontPostExtensions: clone(state.frontPostExtensions),
      __parapetSegments: clone(state.parapetSegments),
      __sideFeatureState: clone(state.sideFeatureState),
      __glassTrackLengthOffsets: clone(state.glassTrackLengthOffsets),
      __triangleDivisionState: clone(state.triangleDivisionState),
      __backWallState: clone(state.backWallState),
      __backWallSegments: clone(state.backWallSegments),
      __previewDimensionOffsets: clone(state.previewDimensionOffsets),
      __slidingPlacements: clone(state.slidingPlacements),
      __sideSlidingPlacements: clone(state.sideSlidingPlacements),
      __guillotinePlacements: clone(state.guillotinePlacements),
      __sideGuillotinePlacements: clone(state.sideGuillotinePlacements)
    };
  }

  function setFormField(rawModel, field, value) {
    const model = normalize(rawModel);
    const key = text(field);
    if (META_FIELDS.has(key)) model.metadata[key] = text(value);
    else if (TOPOLOGY_FIELDS.has(key)) {
      model.topology.raw[key] = text(value);
      if (key === 'systemCount') model.topology.systemCount = positiveInteger(value, 1);
    } else model.drawingOptions[key] = text(value);
    model.metadata.updatedAt = new Date().toISOString();
    return model;
  }

  function withNormalizedInput(rawModel, input) {
    const model = normalize(rawModel);
    const normalized = object(input);
    const formData = formDataFromModel(model);
    model.positions = normalizePositions(normalized, formData);
    model.topology.systemCount = Math.max(1, positiveInteger(normalized.systemCount, model.positions.length || model.topology.systemCount));
    model.topology.systems = clone(array(normalized.systems)) || [];
    model.metadata.updatedAt = new Date().toISOString();
    return model;
  }

  function mirrorToken(value) {
    if (typeof value !== 'string') return value;
    const placeholders = { RIGHT: '__PLMR_RIGHT__', LEFT: '__PLMR_LEFT__', INSIDE: '__PLMR_INSIDE__', OUTSIDE: '__PLMR_OUTSIDE__' };
    return value
      .replace(/RIGHT/gi, placeholders.RIGHT).replace(/LEFT/gi, placeholders.LEFT)
      .replace(/INSIDE/gi, placeholders.INSIDE).replace(/OUTSIDE/gi, placeholders.OUTSIDE)
      .replaceAll(placeholders.RIGHT, 'LEFT').replaceAll(placeholders.LEFT, 'RIGHT')
      .replaceAll(placeholders.INSIDE, 'OUTSIDE').replaceAll(placeholders.OUTSIDE, 'INSIDE');
  }

  function mirrorValue(value) {
    if (Array.isArray(value)) return value.map(mirrorValue);
    if (!value || typeof value !== 'object') return mirrorToken(value);
    const out = {};
    Object.entries(value).forEach(([key, item]) => { out[key] = mirrorValue(item); });
    if (Array.isArray(out.panels)) out.panels.reverse();
    if (Array.isArray(out.panelOrder)) out.panelOrder.reverse();
    return out;
  }

  function deriveLastLeftMirror(rawModel) {
    const model = normalize(rawModel);
    const mirror = mirrorValue(model.sideViews.right);
    mirror.key = 'last_left_mirror';
    mirror.enabled = model.topology.systemCount > 1;
    mirror.editable = false;
    mirror.master = false;
    mirror.derivedFrom = 'right';
    return mirror;
  }

  function normalize(rawModel) {
    const source = object(rawModel);
    const model = createEmpty();
    model.schemaVersion = SCHEMA_VERSION;
    model.metadata = { ...model.metadata, ...clone(object(source.metadata)) };
    model.topology = { ...model.topology, ...clone(object(source.topology)), raw: { ...model.topology.raw, ...clone(object(object(source.topology).raw)) }, systems: clone(array(object(source.topology).systems)) || [] };
    model.topology.systemCount = positiveInteger(model.topology.systemCount, 1);
    model.positions = clone(array(source.positions)) || [];
    model.frontView = { ...model.frontView, ...clone(object(source.frontView)) };
    model.frontView.postProfiles = clone(array(model.frontView.postProfiles));
    model.frontView.postExtensions = clone(array(model.frontView.postExtensions));
    model.frontView.parapetSegments = clone(array(model.frontView.parapetSegments));
    const side = object(source.sideViews);
    model.sideViews.left = normalizeScope(side.left, 'left', true);
    model.sideViews.right = normalizeScope(side.right, 'right', true);
    model.sideViews.middle = {};
    Object.entries(object(side.middle)).forEach(([name, scope]) => {
      const canonical = legacyKeyToScopeName(name);
      if (!canonical.startsWith('middle_')) return;
      model.sideViews.middle[canonical] = normalizeScope(scope, canonical, false);
    });
    model.products = { front: { sliding: clone(array(object(object(source.products).front).sliding)), guillotine: clone(array(object(object(source.products).front).guillotine)) } };
    model.dimensions = { filter: { ...model.dimensions.filter, ...clone(object(object(source.dimensions).filter)) }, offsets: clone(object(object(source.dimensions).offsets)) };
    model.drawingOptions = { ...model.drawingOptions, ...clone(object(source.drawingOptions)) };
    model.revisionInfo = { ...model.revisionInfo, ...clone(object(source.revisionInfo)), revisionNo: positiveInteger(object(source.revisionInfo).revisionNo, 1) };
    model.manualInputFlags = { ...model.manualInputFlags, ...clone(object(source.manualInputFlags)) };
    model.language = source.language === 'en' ? 'en' : 'tr';
    model.orphans = { ...model.orphans, ...clone(object(source.orphans)), sideViews: clone(object(object(source.orphans).sideViews)), frontProducts: clone(array(object(source.orphans).frontProducts)), notes: clone(array(object(source.orphans).notes)) };
    model.lastAction = clone(source.lastAction) || null;
    return model;
  }

  const api = Object.freeze({
    schemaVersion: SCHEMA_VERSION,
    defaultForm: { ...DEFAULT_FORM },
    createEmpty, normalize, clone, fromLegacy, toLegacy, formDataFromModel, geometryInputFromModel,
    setFormField, withNormalizedInput, legacyKeyToScopeName, scopeNameToLegacyKey,
    deriveLastLeftMirror
  });

  global.PulumurProjectModel = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
