(function (root) {
  'use strict';

  const LAYER_STYLE = {
    // Preview/PDF renkleri DXF ACI renkleriyle eşleştirildi.
    OUTLINE: { stroke: '#000000', width: 1.2, aci: 7 },
    PROFILE: { stroke: '#ff0000', width: 1.25, aci: 1 },
    FABRIC: { stroke: '#ffbf00', width: 0.9, dash: '14 10', aci: 42 },
    RAY: { stroke: '#0000ff', width: 1.15, aci: 5 },
    'Ray - Yan Görünüş': { stroke: '#0000ff', width: 1.15, aci: 5 },
    'Ray - Üst Görünüş': { stroke: '#0000ff', width: 1.15, aci: 5 },
    'Ray - Ön Görünüş': { stroke: '#0000ff', width: 1.15, aci: 5 },
    POST: { stroke: '#ff00ff', width: 1.15, aci: 6 },
    'Dikme - Yan Görünüş': { stroke: '#ff00ff', width: 1.15, aci: 6 },
    WALL: { stroke: '#808080', width: 0.65, dash: '18 12', aci: 8 },
    'Duvar - Yan Görünüş': { stroke: '#808080', width: 0.65, dash: '18 12', aci: 8 },
    'Blok - Yan Görünüş': { stroke: '#808080', width: 0.75, dash: '10 8', aci: 8 },
    TOPWALL: { stroke: '#808080', width: 0.65, dash: '18 12', aci: 8 },
    HATCH_WALL: { stroke: '#808080', width: 0.45, aci: 8 },
    HATCH_FABRIC: { stroke: '#ffbf00', width: 0.45, aci: 42 },
    GLASS: { stroke: '#ff00ff', width: 1.05, aci: 6 },
    TRIANGLE: { stroke: '#00bf00', width: 1.05, aci: 130 },
    WATER: { stroke: '#0000ff', width: 1.05, aci: 5 },
    DIM: { stroke: '#ffbf00', width: 0.75, aci: 42 },
    TEXT: { stroke: '#000000', width: 0.6, aci: 7 },
    TABLE: { stroke: '#000000', width: 0.7, aci: 7 },
    TITLE: { stroke: '#000000', width: 0.7, aci: 7 },
    BLOCKREF: { stroke: '#808080', width: 0.75, dash: '10 8', aci: 8 },

    // V8.2.66: Akıllı ölçü/zone ve görünüş bazlı DXF layer altyapısı
    'Dikme - Üst Görünüş': { stroke: '#ff00ff', width: 1.15, aci: 6 },
    'Dikme - Ön Görünüş': { stroke: '#ff00ff', width: 1.15, aci: 6 },
    'Oluk - Yan Görünüş': { stroke: '#000000', width: 1.2, aci: 7 },
    'Oluk - Üst Görünüş': { stroke: '#000000', width: 1.2, aci: 7 },
    'Oluk - Ön Görünüş': { stroke: '#000000', width: 1.2, aci: 7 },
    'Duvar - Üst Görünüş': { stroke: '#808080', width: 0.65, dash: '18 12', aci: 8 },
    'Ölçüler - Yan Görünüş': { stroke: '#ffbf00', width: 0.75, aci: 42 },
    'Ölçüler - Üst Görünüş': { stroke: '#ffbf00', width: 0.75, aci: 42 },
    'Ölçüler - Ön Görünüş': { stroke: '#ffbf00', width: 0.75, aci: 42 },
    'Ölçüler - Sağ Görünüş': { stroke: '#ffbf00', width: 0.75, aci: 42 },
    'Ölçüler - Ana': { stroke: '#ffbf00', width: 0.75, aci: 42 },
    'Ölçüler - Detay': { stroke: '#ffbf00', width: 0.75, aci: 42 },
    'Bloklar - Sabit': { stroke: '#808080', width: 0.75, dash: '10 8', aci: 8 },
    'Bloklar - Ray Uçları': { stroke: '#808080', width: 0.75, dash: '10 8', aci: 8 },
    'Ürün Yerleşimi - Sürme': { stroke: '#00a0c8', width: 1.05, aci: 4 },
    'Ürün Yerleşimi - Zipper': { stroke: '#00bf00', width: 1.05, aci: 130 },
    'Ürün Yerleşimi - Giyotin': { stroke: '#293189', width: 1.05, aci: 167 },
    'Profil - Yan Kayıt - Yan Görünüş': { stroke: '#d35400', width: 1.05, aci: 30 },
    'Profil - Yan Kayıt - Üst Görünüş': { stroke: '#d35400', width: 1.05, aci: 30 },
    'Profil - Yan Kayıt - Ön Görünüş': { stroke: '#d35400', width: 1.05, aci: 30 },
    'Zone - Önizleme Kontrol': { stroke: '#b00000', width: 0.65, dash: '8 8', aci: 1 }
  };
  // PERI01 LISP'ten web tabanına taşınan ana sabitler.
  const K = {
    showDimensions: true,
    systemStartX: 300,
    gutterX: 250,
    sideBaseX: -1450,
    rayW: 80,
    postSize: 100,
    defaultSystemGap: 25,
    noGapExtra: 12,
    nominalDeduct: 12,
    glassOffsetEachSide: 66,
    topWallInset: 6,
    topWallH: 800,
    topGutterH: 145,
    topGutterInnerH: 35.5,
    topGutterLipH: 12.7,
    frontGutterH: 135,
    topRayEndExtra: 3,
    rayLengthFrontDeduct: 212,
    frontViewExtraDrop: 500,
    onRayHCorrection: 133,
    onPostTopDrop: 3,
    onPostHeightCorrection: 49,
    altBlockCorrection: 46,
    sideWallDepth: 600,
    sideRayStartOffsetX: 250,
    sideRayStartOffsetY: 12,
    sideRayH: 131,
    sideInnerRayOffsetY: 64.7,
    sideInnerRayH: 10,
    sideArkaMekOffsetX: 71.6416842,
    sideArkaMekOffsetY: -128.50988141,
    slopeOpeningCorrection: 71.1,
    slopeHeightCorrection: 278,
    rayLenHeightCorrection: 265,
    catiProfilY: -400,
    catiProfilH: 30,
    catiProfilRayRatioBase: 490,
    catiProfilRayRatioMove: 47,
    catiProfilExtraOffset: 120,
    pergoTextMaxH: 220,
    pergoTextMinH: 60,
    pergoTextRatio: 8.5,
    pergoTextOffset: 250,
    sideViewGapY: 800
  };

  // V8.2.66: Ölçü -> Zone -> Profil / Ürün -> Görünüşler arası ilişki -> DXF layer altyapısı.
  const DIMENSION_ACTIONS = {
    main_resize: { canResize: true, canAddSameProfile: false, canAddDifferentProfile: false, canPlaceProduct: false, canRemoveElement: false },
    gap_between_posts: { canResize: true, canAddSameProfile: false, canAddDifferentProfile: false, canPlaceProduct: true, canRemoveElement: false },
    wall_to_post_gap: { canResize: false, canAddSameProfile: false, canAddDifferentProfile: true, canPlaceProduct: true, canRemoveElement: false },
    system_width: { canResize: true, canAddSameProfile: false, canAddDifferentProfile: false, canPlaceProduct: true, canRemoveElement: false },
    fixed_block_size: { canResize: false, canAddSameProfile: false, canAddDifferentProfile: false, canPlaceProduct: false, canRemoveElement: false, passiveReason: 'Bu blok sabit parçadır. Ölçüsü değiştirilemez.' },
    info_only: { canResize: false, canAddSameProfile: false, canAddDifferentProfile: false, canPlaceProduct: false, canRemoveElement: false, passiveReason: 'Bu ölçü şu an sadece bilgi amaçlıdır.' }
  };

  const DIMENSION_EDIT_RULES = {
    side_opening: { editable: true, actionType: 'main_resize', dimensionType: 'main' },
    side_rear_height: { editable: true, actionType: 'main_resize', dimensionType: 'height' },
    side_front_height: { editable: true, actionType: 'main_resize', dimensionType: 'height' },
    top_opening: { editable: true, actionType: 'main_resize', dimensionType: 'main' },
    top_total_width: { editable: true, actionType: 'system_width', dimensionType: 'main' },
    top_system_width: { editable: true, actionType: 'system_width', dimensionType: 'main' },
    front_total_width: { editable: true, actionType: 'system_width', dimensionType: 'main' },
    front_front_height: { editable: true, actionType: 'main_resize', dimensionType: 'height' },
    front_post_gap: { editable: true, actionType: 'gap_between_posts', dimensionType: 'detail' },
    side_wall_to_post_gap: { editable: true, actionType: 'wall_to_post_gap', dimensionType: 'detail' },
    parapet_height_info: { editable: false, actionType: 'info_only', dimensionType: 'info', passiveReason: 'Parapet ölçüsü bu aşamada form alanından yönetilir.' },
    fixed_block_size: { editable: false, actionType: 'fixed_block_size', dimensionType: 'info', passiveReason: 'Bu blok sabit parçadır. Ölçüsü değiştirilemez. Sistem ölçüsü değiştiğinde konumu otomatik güncellenir.' },
    triangle_info: { editable: false, actionType: 'info_only', dimensionType: 'info' }
  };

  const PROFILE_LIBRARY = {
    side_register_100: { id: 'side_register_100', name: 'Yan Kayıt Profili 100', sectionA: 100, sectionB: 100, category: 'side_register', material: 'aluminum', viewRepresentation: { side: { visibleWidth: 100 }, top: { visibleWidth: 100 }, front: { visibleWidth: 100 }, right: { visibleWidth: 100 } } },
    side_register_40x130: { id: 'side_register_40x130', name: 'Yan Kayıt Profili 40x130', sectionA: 40, sectionB: 130, category: 'side_register', material: 'aluminum', viewRepresentation: { side: { visibleWidth: 40, visibleDepth: null }, top: { visibleWidth: 130, visibleDepth: 40 }, front: { visibleWidth: 40, visibleDepth: null }, right: { visibleWidth: 40, visibleDepth: 130 } } },
    post_100x100: { id: 'post_100x100', name: 'Dikme Profili 100x100', sectionA: 100, sectionB: 100, category: 'post', material: 'aluminum', viewRepresentation: { side: { visibleWidth: 100 }, top: { visibleWidth: 100 }, front: { visibleWidth: 100 }, right: { visibleWidth: 100 } } }
  };

  const PRODUCT_LIBRARY = {
    sliding_glass: { id: 'sliding_glass', name: 'Sürme Cam', layer: 'Ürün Yerleşimi - Sürme' },
    guillotine_glass: { id: 'guillotine_glass', name: 'Giyotin Cam', layer: 'Ürün Yerleşimi - Giyotin' },
    zipper: { id: 'zipper', name: 'Zipper Perde', layer: 'Ürün Yerleşimi - Zipper' },
    fixed_glass: { id: 'fixed_glass', name: 'Sabit Cam', layer: 'GLASS' },
    door: { id: 'door', name: 'Kapı', layer: 'GLASS' },
    empty: { id: 'empty', name: 'Boş Alan', layer: 'Zone - Önizleme Kontrol' }
  };

  function dimSlug(value) {
    return String(value || '').toLowerCase().replace(/[ğ]/g, 'g').replace(/[ü]/g, 'u').replace(/[ş]/g, 's').replace(/[ı]/g, 'i').replace(/[ö]/g, 'o').replace(/[ç]/g, 'c').replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'dim';
  }

  function enrichDimensionEdit(edit, measured) {
    const src = edit || {};
    const ruleKey = src.ruleKey || src.dimId || `${src.view || 'dim'}_${src.field || 'value'}`;
    const rule = DIMENSION_EDIT_RULES[ruleKey] || {};
    const action = DIMENSION_ACTIONS[rule.actionType || src.actionType || 'main_resize'] || DIMENSION_ACTIONS.main_resize;
    const dimId = src.dimId || `${dimSlug(src.view || 'view')}_${dimSlug(src.label || src.field || 'value')}_${src.index || 0}`;
    const editable = src.editable !== undefined ? !!src.editable : (rule.editable !== undefined ? !!rule.editable : !!action.canResize);
    return {
      ...src,
      dimId,
      ruleKey,
      editable,
      actionType: rule.actionType || src.actionType || 'main_resize',
      dimensionType: src.dimensionType || rule.dimensionType || 'main',
      passiveReason: src.passiveReason || rule.passiveReason || action.passiveReason || null,
      measuredValue: Math.round(Math.abs(Number(measured) || 0)),
      canResize: src.canResize !== undefined ? !!src.canResize : !!action.canResize,
      canAddSameProfile: src.canAddSameProfile !== undefined ? !!src.canAddSameProfile : !!action.canAddSameProfile,
      canAddDifferentProfile: src.canAddDifferentProfile !== undefined ? !!src.canAddDifferentProfile : !!action.canAddDifferentProfile,
      canPlaceProduct: src.canPlaceProduct !== undefined ? !!src.canPlaceProduct : !!action.canPlaceProduct,
      canRemoveElement: src.canRemoveElement !== undefined ? !!src.canRemoveElement : !!action.canRemoveElement
    };
  }

  const BUILD_LABEL = 'WEB DXF V8.9.5 - ADMIN API SESSION TOKEN FIX - 12.07.2026';
  function bridge() { return root.PulumurExcelBridge || null; }

  const SAMPLE_INPUT = {
    product: 'Pergo Rise',
    moduleName: 'Module 1',
    engine: 'Web DXF',
    customer: 'DENEME',
    project: 'DENEME',
    version: '01',
    drawnBy: 'AYETULLAH KILINC',
    date: new Date().toISOString().slice(0, 10),
    systemCount: 1,
    width: '4000',
    opening: '4500',
    rearHeight: '3200',
    frontHeight: 2600,
    rayCount: '',
    postCount: '',
    parapet: 'HAYIR',
    parapetHeight: 0,
    glassTrack: 'HAYIR',
    sideTrack: 'HAYIR',
    structureColor: 'RAL 7016 TEXT.',
    fabric: 'C 1602 - M (8116-1622)',
    fabricProfiles: 'RAL 1013',
    motor: 'RISING MOTOR',
    remote: 'RISING 6 CHANNELS',
    led: 'YES',
    dimmer: 'NO',
    extras: 'THE MOTOR IS ON RIGHT',
    triangleJoinery: 'HAYIR',
    waterStandard: 'EVET'
  };

  function splitSemi(value) {
    return String(value ?? '').split(';').map(s => s.trim()).filter(s => s.length > 0);
  }
  function firstSemi(value) { return splitSemi(value)[0] ?? ''; }
  function numFromToken(value, fallback = 0) {
    const n = Number(String(value ?? '').trim().replace(',', '.'));
    return Number.isFinite(n) ? n : fallback;
  }
  function realList(value, fallback) {
    const parts = splitSemi(value);
    if (!parts.length) return [fallback];
    return parts.filter(p => !isNoToken(p)).map(p => numFromToken(p, fallback));
  }
  function intList(value, fallback) {
    return realList(value, fallback).map(v => Math.max(1, Math.round(v || fallback)));
  }
  function numberValue(value, fallback) { return numFromToken(firstSemi(value), fallback); }
  function intValue(value, fallback) { return Math.max(0, Math.round(numberValue(value, fallback))); }
  function textValue(value, fallback = '-') { const out = String(value ?? '').trim(); return out.length ? out : fallback; }
  function yes(value) { return String(value ?? '').trim().toLocaleUpperCase('tr-TR') === 'EVET'; }
  function isNoToken(value) { return String(value ?? '').trim().toLocaleUpperCase('tr-TR') === 'NO'; }
  function nthOrLast(list, idx) { if (!list || !list.length) return undefined; return idx < list.length ? list[idx] : list[list.length - 1]; }
  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
  function formatMm(value) { return `${Math.round(value)} mm`; }
  function formatDeg(value) { return `${Number(value).toFixed(2)}°`; }
  function normDeg(value) { return ((value % 360) + 360) % 360; }

  function noGapModeActive(raw) {
    const parts = splitSemi(raw);
    const clean = parts.filter(p => !isNoToken(p));
    return parts.length > 0 && isNoToken(parts[parts.length - 1]) && clean.length >= 3 && clean.length % 2 === 1;
  }
  function noGapWidths(raw) {
    const clean = splitSemi(raw).filter(p => !isNoToken(p));
    return clean.filter((_, i) => i % 2 === 0).map(p => numFromToken(p, 0));
  }
  function noGapGaps(raw) {
    const clean = splitSemi(raw).filter(p => !isNoToken(p));
    return clean.filter((_, i) => i % 2 === 1).map(p => numFromToken(p, 0));
  }

  function rayLenFor(opening, rearH, frontH) {
    return Math.max(1, Math.floor(Math.sqrt(Math.pow(rearH - frontH - K.rayLenHeightCorrection, 2) + Math.pow(opening, 2)) - 220));
  }
  function sideAngleRadFor(opening, rearH, frontH) {
    const denom = opening - K.slopeOpeningCorrection;
    return -Math.atan((rearH - frontH - K.slopeHeightCorrection) / (Math.abs(denom) < 1e-9 ? 1 : denom));
  }

  function buildSystems(d, raw) {
    const noMode = noGapModeActive(raw.width);
    const sayfa1Mode = !!(raw && raw.sayfa1);
    let nominalWidths = noMode ? noGapWidths(raw.width) : realList(raw.width, SAMPLE_INPUT.width);
    const rayList = intList(raw.rayCount, SAMPLE_INPUT.rayCount);
    let explicitWidth = nominalWidths.length > 1 || noMode;
    let explicitRay = rayList.length > 1;
    let sysCount = Math.max(1, Math.round(Number(raw.systemCount) || 1));
    if (explicitWidth) sysCount = Math.max(sysCount, nominalWidths.length);
    if (explicitRay) sysCount = Math.max(sysCount, rayList.length);

    let gapRaw = noMode ? noGapGaps(raw.width) : [];
    let systems = [];
    if (!explicitWidth && sysCount > 1) {
      // PERI01 Sayfa1 akışında B1 zaten optimize/net değerdir.
      // Eski web ham G8 akışında ise 12 mm düşüm uygulanıyordu.
      const totalExternal = Math.max(500, nominalWidths[0] || SAMPLE_INPUT.width);
      const totalNet = Math.max(80, sayfa1Mode ? totalExternal : totalExternal - K.nominalDeduct);
      const usable = Math.max(80, totalNet - K.defaultSystemGap * (sysCount - 1));
      nominalWidths = Array.from({ length: sysCount }, () => sayfa1Mode ? usable / sysCount : usable / sysCount + K.nominalDeduct);
    }

    let x = K.systemStartX;
    let totalNet = 0;
    let totalNominal = 0;
    for (let s = 0; s < sysCount; s += 1) {
      const externalW = Math.max(80, nthOrLast(nominalWidths, s) || nominalWidths[0] || SAMPLE_INPUT.width);
      const w = Math.max(80, sayfa1Mode ? externalW : externalW - K.nominalDeduct);
      const gapAfter = s < sysCount - 1 ? (noMode ? (Math.max(0, nthOrLast(gapRaw, s) || 0) + K.noGapExtra) : K.defaultSystemGap) : 0;
      const rc = Math.max(1, nthOrLast(rayList, s) || rayList[0] || 1);
      totalNet += w + gapAfter;
      totalNominal += externalW + gapAfter;
      systems.push({ index: s, startX: x, endX: x + w, nominalWidth: externalW, width: w, gapAfter, rayCount: rc, rays: [] });
      x += w + gapAfter;
    }
    if (systems.length) {
      totalNet -= systems[systems.length - 1].gapAfter;
      totalNominal -= systems[systems.length - 1].gapAfter;
    }

    systems.forEach((sys, s) => {
      const areaStartX = sys.startX + (yes(d.glassTrack) && s === 0 ? K.glassOffsetEachSide : 0);
      const areaEndX = sys.endX - (yes(d.glassTrack) && s === systems.length - 1 ? K.glassOffsetEachSide : 0);
      const areaW = Math.max(K.rayW, areaEndX - areaStartX);
      const pitch = sys.rayCount > 1 ? (areaW - K.rayW) / (sys.rayCount - 1) : 0;
      sys.rayAreaStartX = areaStartX;
      sys.rayAreaEndX = areaEndX;
      sys.raySystemW = areaW;
      sys.rayPitch = pitch;
      for (let r = 0; r < sys.rayCount; r += 1) sys.rays.push(areaStartX + r * pitch);
    });
    return { systems, systemCount: sysCount, noGapMode: noMode, explicitWidth, explicitRay, totalNet, totalNominal };
  }

  function normalizeSlidingPlacement(item, index = 0) {
    const raw = item || {};
    const gapIndex = Math.max(0, Math.round(Number(raw.gapIndex) || 0));
    const width = Math.max(1, Number(raw.width) || 1);
    const height = Math.max(1, Number(raw.height) || 1);
    let panelCount = Math.max(2, Math.round(Number(raw.panelCount) || 2));
    const openingType = String(raw.openingType || 'SIDE OPENING').trim().toUpperCase() === 'CENTER OPENING' ? 'CENTER OPENING' : 'SIDE OPENING';
    if (openingType === 'CENTER OPENING') {
      panelCount = Math.max(4, panelCount);
      if (panelCount % 2 !== 0) panelCount += 1;
    }
    const pozNo = String(raw.pozNo || `S${String(index + 1).padStart(2, '0')}`).trim().toUpperCase();
    return {
      id: String(raw.id || `sliding_${pozNo}_${gapIndex}`),
      gapIndex,
      series: String(raw.series || 'A SERIES').trim().toUpperCase(),
      type: String(raw.type || 'WITH THRESHOLD').trim().toUpperCase(),
      openingType,
      glassThickness: String(raw.glassThickness || '10 MM').trim().toUpperCase(),
      glassColor: String(raw.glassColor || 'TRANSPARENT').trim().toUpperCase(),
      width,
      height,
      panelCount,
      quantity: Math.max(1, Math.round(Number(raw.quantity) || 1)),
      pozNo,
      leftPostStandard: raw.leftPostStandard !== false
    };
  }


  function normalizeGuillotinePlacement(item, index = 0) {
    const raw = item || {};
    const gapIndex = Math.max(0, Math.round(Number(raw.gapIndex) || 0));
    const series = String(raw.series || 'A SERIES').trim().toUpperCase() === 'K SERIES' ? 'K SERIES' : 'A SERIES';
    let type = String(raw.type || 'STANDARD').trim().toUpperCase();
    if (!['STANDARD', 'CLEANABLE', 'UPWARD COLLECTING'].includes(type)) type = 'STANDARD';
    if (series === 'K SERIES' && type === 'UPWARD COLLECTING') type = 'STANDARD';
    let mechanism = String(raw.mechanism || 'CHAIN').trim().toUpperCase();
    if (!['CHAIN', 'BELT'].includes(mechanism)) mechanism = 'CHAIN';
    if (series === 'K SERIES') mechanism = 'BELT';
    let glassThickness = String(raw.glassThickness || '8 MM').trim().toUpperCase();
    if (!['8 MM', 'INSULATED GLASS'].includes(glassThickness)) glassThickness = '8 MM';
    if (series === 'K SERIES') glassThickness = 'INSULATED GLASS';
    const panelCount = String(raw.panelCount || '1+1').trim() === '1+2' ? '1+2' : '1+1';
    const pozNo = String(raw.pozNo || `G${String(index + 1).padStart(2, '0')}`).trim().toUpperCase();
    return {
      id: String(raw.id || `guillotine_${pozNo}_${gapIndex}`),
      gapIndex, series, type, mechanism, glassThickness,
      glassColor: String(raw.glassColor || 'TRANSPARENT').trim().toUpperCase(),
      panelCount,
      motorDirection: String(raw.motorDirection || 'RIGHT').trim().toUpperCase() === 'LEFT' ? 'LEFT' : 'RIGHT',
      view: String(raw.view || 'INSIDE VIEW').trim().toUpperCase() === 'OUTSIDE VIEW' ? 'OUTSIDE VIEW' : 'INSIDE VIEW',
      motorType: String(raw.motorType || 'SOMFY RTS').trim().toUpperCase(),
      remoteControl: String(raw.remoteControl || '1 CHANNEL').trim().toUpperCase(),
      width: Math.max(1, Number(raw.width) || 1),
      height: Math.max(1, Number(raw.height) || 1),
      quantity: 1,
      pozNo,
      leftPostStandard: raw.leftPostStandard !== false
    };
  }

  function normalizeInput(raw) {
    const d = { ...SAMPLE_INPUT, ...(raw || {}) };

    // PERI01 Excel akışı:
    // Ana sayfadaki değerler önce gizli Sayfa1'e dönüştürülür, LISP da çizimi Sayfa1 üzerinden yapar.
    // WebDXF artık bu detayı aynen izler.
    d.formRaw = { ...d };
    const br = bridge();
    d.sayfa1 = br ? br.buildSayfa1Data(d) : null;
    if (d.sayfa1) {
      d.width = d.sayfa1.B1_width;
      d.opening = d.sayfa1.B2_opening;
      d.rearHeight = d.sayfa1.B3_rearHeight;
      d.frontHeight = d.sayfa1.B4_frontHeight;
      d.rayCount = d.sayfa1.B7_rayCount;
      d.postCount = d.sayfa1.B8_postCount;
      d.parapet = d.sayfa1.B5_parapet;
      d.parapetHeight = d.sayfa1.B6_parapetHeight;
      d.glassTrack = d.sayfa1.B9_glassTrack;
      d.sideTrack = d.sayfa1.B9b_sideTrack || d.formRaw.sideTrack || 'HAYIR';
      d.waterStandard = d.sayfa1.B10_waterStandard;
      d.structureColor = d.sayfa1.B12_structureColor;
      d.fabric = d.sayfa1.B13_fabric;
      d.fabricProfiles = d.sayfa1.B14_fabricProfiles;
      d.motor = d.sayfa1.B15_motor;
      d.remote = d.sayfa1.B16_remote;
      d.led = d.sayfa1.B17_led;
      d.dimmer = d.sayfa1.B18_dimmer;
      d.extras = d.sayfa1.B19_extras;
      d.customer = d.sayfa1.B21_customer;
      d.project = d.sayfa1.B22_project;
      d.version = d.sayfa1.B23_version;
      d.drawnBy = d.sayfa1.B24_drawnBy;
      d.date = d.sayfa1.B25_date;
      d.systemCount = d.sayfa1.B27_systemCount;
      d.triangleJoinery = d.sayfa1.B29_triangleJoinery;
    }

    d.systemCount = Math.max(1, intValue(d.systemCount, 1));
    d.openingList = realList(d.opening, SAMPLE_INPUT.opening).map(v => Math.max(500, v));
    d.rearHeightList = realList(d.rearHeight, SAMPLE_INPUT.rearHeight).map(v => Math.max(500, v));
    d.opening = d.openingList[0];
    d.rearHeight = d.rearHeightList[0];
    d.frontHeight = Math.max(0, numberValue(d.frontHeight, SAMPLE_INPUT.frontHeight));
    // Ray sayısı noktalı virgüllü olabilir (örn. 3;2;4).
    // Burada ilk değere indirgemiyoruz; buildSystems tüm listeyi okuyacak.
    d.rayCountText = String(d.rayCount ?? '').trim();
    d.postCount = Math.max(0, intValue(d.postCount, SAMPLE_INPUT.postCount));
    d.manualPostPlacementMode = String((raw && raw.__manualPostPlacementMode) || 'standard').trim().toLowerCase() === 'equal' ? 'equal' : 'standard';
    d.parapetHeight = yes(d.parapet) ? Math.max(0, numberValue(d.parapetHeight, 0)) : 0;
    d.customer = textValue(d.customer, '-');
    d.project = textValue(d.project, '-');
    d.version = textValue(d.version, '01');
    d.drawnBy = textValue(d.drawnBy, 'AYETULLAH KILINC');
    d.date = textValue(d.date, SAMPLE_INPUT.date);
    d.structureColor = textValue(d.structureColor);
    d.fabric = textValue(d.fabric);
    d.fabricProfiles = textValue(d.fabricProfiles);
    d.motor = textValue(d.motor);
    d.remote = textValue(d.remote);
    d.led = textValue(d.led);
    d.dimmer = textValue(d.dimmer);
    d.extras = textValue(d.extras);
    d.sideTrack = textValue(d.sideTrack, 'HAYIR');
    d.glassTrackProfile = normalizeGlassTrackProfile(raw && raw.__glassTrackProfile);
    d.glassTrackSupportProfiles = {
      left: normalizeGlassTrackProfile(raw && raw.__glassTrackSupportProfiles && raw.__glassTrackSupportProfiles.left ? raw.__glassTrackSupportProfiles.left : d.glassTrackProfile),
      right: normalizeGlassTrackProfile(raw && raw.__glassTrackSupportProfiles && raw.__glassTrackSupportProfiles.right ? raw.__glassTrackSupportProfiles.right : d.glassTrackProfile)
    };
    d.customFrontPostCenters = Array.isArray(raw && raw.__frontPostCenters)
      ? raw.__frontPostCenters.map(Number).filter(Number.isFinite)
      : null;
    d.slidingPlacements = Array.isArray(raw && raw.__slidingPlacements)
      ? raw.__slidingPlacements.map((item, index) => normalizeSlidingPlacement(item, index)).filter(Boolean)
      : [];
    d.guillotinePlacements = Array.isArray(raw && raw.__guillotinePlacements)
      ? raw.__guillotinePlacements.map((item, index) => normalizeGuillotinePlacement(item, index)).filter(Boolean)
      : [];

    const sys = buildSystems(d, d);
    d.systems = sys.systems;
    d.systemCount = sys.systemCount;
    d.noGapMode = sys.noGapMode;
    d.explicitWidth = sys.explicitWidth;
    d.explicitRay = sys.explicitRay;
    d.totalRayCount = d.systems.reduce((a, sys) => a + (Number(sys.rayCount) || 0), 0);
    d.rayCount = d.systems.length === 1 ? (d.systems[0].rayCount || 0) : d.totalRayCount;
    d.width = sys.totalNet;
    d.nominalWidth = sys.totalNominal;
    d.systemStartX = K.systemStartX;
    d.systemEndX = K.systemStartX + d.width;
    d.rayAreaStartX = d.systems[0].rayAreaStartX;
    d.rayAreaEndX = d.systems[d.systems.length - 1].rayAreaEndX;
    d.raySystemW = Math.max(K.rayW, d.rayAreaEndX - d.rayAreaStartX);

    d.positionCount = Math.max(d.systemCount, d.openingList.length, d.rearHeightList.length);
    d.sidePositionCount = Math.max(1, d.openingList.length);
    d.positions = [];
    for (let i = 0; i < d.positionCount; i += 1) {
      const opening = nthOrLast(d.openingList, i) || d.opening;
      const rearHeight = nthOrLast(d.rearHeightList, i) || d.rearHeight;
      d.positions.push({ index: i, opening, rearHeight, rayLength: rayLenFor(opening, rearHeight, d.frontHeight), angleRad: sideAngleRadFor(opening, rearHeight, d.frontHeight) });
    }
    d.maxOpening = Math.max(...d.positions.map(p => p.opening));
    d.lastOpening = d.positions[d.positions.length - 1].opening;
    d.maxRearHeight = Math.max(...d.positions.map(p => p.rearHeight));
    // Çoklu ve farklı açılımlı sistemlerde üst görünüşün en alt kotu, en büyük açılıma göre oluşur.
    // Ön görünüş bu yüzden maxOpening referansına göre aşağı alınır. Aynı global kayma,
    // yan görünüş grubuna da uygulanır ki ön/yan görünüşler aynı yatay referans sisteminde kalsın.
    d.frontRayTopRefY = -d.maxOpening - K.frontViewExtraDrop;
    d.commonFrontRectStartY = d.frontRayTopRefY - d.maxRearHeight + d.frontHeight;
    // Yan görünüş Poz 1 birleşik oluk bloğu taban/base referansı, ön görünüş oluk profilinin -Y ucu ile aynı kotta olmalı.
    // Bu değer, Poz 1 yan görünüş rectStartY değerini doğrudan commonFrontRectStartY kotuna kilitler.
    d.sideGlobalShiftY = d.commonFrontRectStartY - (-(d.opening + (d.rearHeight - d.frontHeight) + K.frontViewExtraDrop));
    d.rectStartY = d.commonFrontRectStartY;
    d.solX = K.gutterX + K.postSize;
    d.sagX = K.gutterX + d.width;
    d.posY = -d.opening;
    d.rayWidth = K.rayW;
    d.postSize = K.postSize;
    d.angleRad = sideAngleRadFor(d.opening, d.rearHeight, d.frontHeight);
    d.angle = Math.abs(d.angleRad) * 180 / Math.PI;
    d.rayLength = rayLenFor(d.opening, d.rearHeight, d.frontHeight);
    d.uzunluk = d.opening - K.rayLengthFrontDeduct;
    d.postCenterXs = postCenterXs(d);
    d.slidingPlacements = (d.slidingPlacements || []).filter(item => item.gapIndex < d.postCenterXs.length - 1).map(item => {
      const clearGap = Math.max(1, d.postCenterXs[item.gapIndex + 1] - d.postCenterXs[item.gapIndex] - K.postSize);
      const width = Math.max(1, clearGap - 5);
      let panelCount = Math.max(2, Math.ceil(width / 1200));
      if (item.openingType === 'CENTER OPENING') {
        panelCount = Math.max(4, panelCount);
        if (panelCount % 2 !== 0) panelCount += 1;
      }
      return { ...item, width, panelCount };
    });
    d.guillotinePlacements = (d.guillotinePlacements || []).filter(item => item.gapIndex < d.postCenterXs.length - 1).map(item => {
      const clearGap = Math.max(1, d.postCenterXs[item.gapIndex + 1] - d.postCenterXs[item.gapIndex] - K.postSize);
      return { ...item, width: Math.max(1, clearGap - 5) };
    });
    return d;
  }

  function makeEntitySink() {
    const entities = [];
    function push(e) { entities.push(e); return e; }
    return {
      entities,
      line(x1, y1, x2, y2, layer = 'OUTLINE') { return push({ type: 'line', x1, y1, x2, y2, layer }); },
      rect(x, y, w, h, layer = 'OUTLINE') {
        const x2 = x + w, y2 = y + h;
        return push({ type: 'polyline', points: [[x, y], [x2, y], [x2, y2], [x, y2]], closed: true, layer });
      },
      poly(points, closed = false, layer = 'OUTLINE') { return push({ type: 'polyline', points, closed, layer }); },
      text(x, y, value, height = 90, layer = 'TEXT', align = 'left', rotation = 0) { return push({ type: 'text', x, y, value: String(value ?? ''), height, layer, align, rotation }); },
      mtext(x, y, value, height = 90, width = 1000, layer = 'TEXT', align = 'left', rotation = 0, lineSpacing = 1.15) { return push({ type: 'mtext', x, y, value: String(value ?? ''), height, width, layer, align, rotation, lineSpacing }); },
      dimension(data) { return push({ type: 'dimension', layer: 'DIM', style: 'MESUT-MM', ...(data || {}) }); },
      insert(name, x, y, options = {}) { return push({ type: 'insert', name: String(name ?? ''), x, y, layer: options.layer || 'BLOCKREF', rotation: options.rotation || 0, scaleX: options.scaleX || 1, scaleY: options.scaleY || 1, previewW: options.previewW || 120, previewH: options.previewH || 80 }); }
    };
  }

  function dimMeasuredText(value) {
    const n = Number(value);
    return Number.isFinite(n) ? String(Math.round(Math.abs(n))) : '<>';
  }

  function dimArrowPoly(x, y, angle, size = 100, layer = 'DIM') {
    const ux = Math.cos(angle), uy = Math.sin(angle);
    const nx = -uy, ny = ux;
    const tailX = x + ux * size;
    const tailY = y + uy * size;
    const hw = size * 0.34;
    return { type: 'polyline', layer, closed: true, points: [[x, y], [tailX + nx * hw, tailY + ny * hw], [tailX - nx * hw, tailY - ny * hw]], color: 42 };
  }

  function dimGraphicsAligned(x1, y1, x2, y2, q1x, q1y, q2x, q2y, textX, textY, textValue, textRot = 0, options = {}) {
    const layer = options.layer || 'DIM';
    const dx = q2x - q1x, dy = q2y - q1y;
    const ang = Math.atan2(dy, dx);
    const scale = Number(options.scale || 1) > 0 ? Number(options.scale || 1) : 1;
    const textH = 180 * scale;
    const arrowSize = 100 * scale;
    const lineColor = Number.isFinite(Number(options.color)) ? Number(options.color) : 42;
    const textColor = Number.isFinite(Number(options.textColor)) ? Number(options.textColor) : 1;
    const a1 = dimArrowPoly(q1x, q1y, ang, arrowSize, layer);
    const a2 = dimArrowPoly(q2x, q2y, ang + Math.PI, arrowSize, layer);
    a1.color = lineColor;
    a2.color = lineColor;
    return [
      { type: 'line', layer, x1, y1, x2: q1x, y2: q1y, color: lineColor },
      { type: 'line', layer, x1: x2, y1: y2, x2: q2x, y2: q2y, color: lineColor },
      { type: 'line', layer, x1: q1x, y1: q1y, x2: q2x, y2: q2y, color: lineColor },
      a1,
      a2,
      { type: 'text', layer: options.textLayer || layer, x: textX, y: textY, value: textValue, height: textH, align: 'center', rotation: textRot, color: textColor }
    ];
  }

  function addDimAlignedEntity(g, x1, y1, x2, y2, q1x, q1y, q2x, q2y, textX, textY, measured, rotationDeg = 0, options = {}) {
    if (K.showDimensions === false) return;
    const textValue = dimMeasuredText(measured);
    const ent = {
      dimKind: 'aligned',
      p1: { x: x1, y: y1 },
      p2: { x: x2, y: y2 },
      dimLine: { x: (q1x + q2x) / 2, y: (q1y + q2y) / 2 },
      text: { x: textX, y: textY },
      textOverride: '<>',
      measuredValue: Math.abs(Number(measured) || 0),
      graphics: dimGraphicsAligned(x1, y1, x2, y2, q1x, q1y, q2x, q2y, textX, textY, textValue, rotationDeg, options)
    };
    if (options && options.edit) ent.edit = enrichDimensionEdit(options.edit, measured);
    if (options && options.dimensionFilterType) ent.dimensionFilterType = String(options.dimensionFilterType);
    if (options && options.layer) ent.layer = options.layer;
    if (options && Number.isFinite(Number(options.entityColor))) ent.color = Number(options.entityColor);
    g.dimension(ent);
  }

  function addDimH(g, x1, x2, yRef, yDim, label, options = {}) {
    const measured = Math.abs(x2 - x1);
    const scale = Number(options.scale || 1) > 0 ? Number(options.scale || 1) : 1;
    const textX = (x1 + x2) / 2;
    const textY = yDim + 140 * scale;
    addDimAlignedEntity(g, x1, yRef, x2, yRef, x1, yDim, x2, yDim, textX, textY, measured, 0, options);
  }

  function addDimV(g, y1, y2, xRef, xDim, label, options = {}) {
    const measured = Math.abs(y2 - y1);
    const scale = Number(options.scale || 1) > 0 ? Number(options.scale || 1) : 1;
    const textX = xDim - 150 * scale;
    const textY = (y1 + y2) / 2;
    addDimAlignedEntity(g, xRef, y1, xRef, y2, xDim, y1, xDim, y2, textX, textY, measured, 90, options);
  }

  function addDimAligned(g, x1, y1, x2, y2, xLoc, yLoc, label, options = {}) {
    if (K.showDimensions === false) return;
    const dx = x2 - x1, dy = y2 - y1;
    const len = Math.max(1, Math.sqrt(dx * dx + dy * dy));
    const ux = dx / len, uy = dy / len;
    const nx = -uy, ny = ux;
    const off = ((xLoc - x1) * nx + (yLoc - y1) * ny);
    const q1x = x1 + nx * off, q1y = y1 + ny * off;
    const q2x = x2 + nx * off, q2y = y2 + ny * off;
    const textX = (q1x + q2x) / 2 + nx * 120;
    const textY = (q1y + q2y) / 2 + ny * 120;
    addDimAlignedEntity(g, x1, y1, x2, y2, q1x, q1y, q2x, q2y, textX, textY, len, Math.atan2(dy, dx) * 180 / Math.PI, options);
  }
  function rotatePoint(px, py, bx, by, ang) { const dx = px - bx, dy = py - by, ca = Math.cos(ang), sa = Math.sin(ang); return [bx + dx * ca - dy * sa, by + dx * sa + dy * ca]; }
  function getBlocks() { return (root.PulumurFilteredBlocks && root.PulumurFilteredBlocks.blocks) ? root.PulumurFilteredBlocks.blocks : {}; }
  function transformLocalPoint(px, py, ins) {
    const sx = Math.abs(Number(ins.scaleX) || 1), sy = Number(ins.scaleY) || 1;
    const lx = ins.mirrorX ? -px : px;
    const a = (Number(ins.rotation) || 0) * Math.PI / 180;
    const x = lx * sx, y = py * sy, ca = Math.cos(a), sa = Math.sin(a);
    return [ins.x + x * ca - y * sa, ins.y + x * sa + y * ca];
  }
  function transformBlockBounds(block, ins) { const b = block.bounds || { minX: -50, minY: -50, maxX: 50, maxY: 50 }; const pts = [[b.minX, b.minY], [b.maxX, b.minY], [b.maxX, b.maxY], [b.minX, b.maxY]].map(p => transformLocalPoint(p[0], p[1], ins)); const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]); return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)]; }

  function mirrorEntityX(e, midX) {
    const mx = x => 2 * midX - x;
    const readableRot = rot => {
      const r = normDeg(Number(rot) || 0);
      return (r > 90 && r < 270) ? normDeg(r + 180) : r;
    };
    if (e.type === 'line') return { ...e, x1: mx(e.x1), x2: mx(e.x2) };
    if (e.type === 'polyline') return { ...e, points: (e.points || []).map(p => [mx(p[0]), p[1]]) };
    if (e.type === 'circle') return { ...e, x: mx(e.x) };
    if (e.type === 'text') {
      const mirroredRot = normDeg(180 - (Number(e.rotation) || 0));
      const nextRot = e.keepReadableOnMirror ? readableRot(mirroredRot) : mirroredRot;
      return { ...e, x: mx(e.x), rotation: nextRot };
    }
    if (e.type === 'dimension') {
      const mapPt = p => p ? ({ x: mx(p.x), y: p.y }) : p;
      const mirrorDimGraphic = ge => {
        if (ge && ge.type === 'text') {
          // Ayna yan görünüşte ölçü bloğu yansırken yazı okunur kalsın.
          // Geometri X yönünde aynalanır; ölçü yazısının dönüşü ters çevrilmez.
          return { ...ge, x: mx(ge.x), rotation: readableRot(ge.rotation) };
        }
        return mirrorEntityX(ge, midX);
      };
      return {
        ...e,
        p1: mapPt(e.p1),
        p2: mapPt(e.p2),
        dimLine: mapPt(e.dimLine),
        text: mapPt(e.text),
        graphics: (e.graphics || []).map(mirrorDimGraphic)
      };
    }
    if (e.type === 'insert') return { ...e, x: mx(e.x), rotation: normDeg(-(Number(e.rotation) || 0)), scaleX: Math.abs(Number(e.scaleX) || 1), mirrorX: !e.mirrorX };
    if (e.type === 'interaction') {
      const x1 = Number(e.x) || 0;
      const x2 = x1 + (Number(e.w) || 0);
      const nx1 = mx(Math.max(x1, x2));
      const nx2 = mx(Math.min(x1, x2));
      return { ...e, x: Math.min(nx1, nx2), w: Math.abs(nx2 - nx1) };
    }
    return { ...e };
  }

  function mirrorNewEntitiesX(g, startIndex, midX) {
    const made = g.entities.slice(startIndex);
    made.forEach(e => g.entities.push(mirrorEntityX(e, midX)));
  }
  function entityMinY(e) {
    const b = entityBounds(e);
    return b ? b[1] : 0;
  }

  function entityIsPostLike(e) {
    if (!e) return false;
    if (e.layer === 'POST') return true;
    const n = String(e.name || '').toLocaleUpperCase('tr-TR');
    return n.includes('DIKME');
  }

  function rangeMinYForPostLike(g, startIndex, endIndex) {
    // PERI01 hizalama kuralı: ayna yan görünüşün kotu dikme gövdesinin -Y uç noktasına göre alınır.
    // Alt bağlantı bloklarının base point / bbox farkı yaklaşık 46 mm yanıltma yapıyordu;
    // bu yüzden önce sadece gerçek POST layer gövdeleri dikkate alınır.
    const postVals = [];
    for (let i = startIndex; i < endIndex; i += 1) {
      if (g.entities[i] && g.entities[i].layer === 'POST') postVals.push(entityMinY(g.entities[i]));
    }
    if (postVals.length) return Math.min(...postVals);
    const vals = [];
    for (let i = startIndex; i < endIndex; i += 1) {
      if (entityIsPostLike(g.entities[i])) vals.push(entityMinY(g.entities[i]));
    }
    if (!vals.length) {
      for (let i = startIndex; i < endIndex; i += 1) vals.push(entityMinY(g.entities[i]));
    }
    return vals.length ? Math.min(...vals) : 0;
  }
  function moveEntityY(e, dy) {
    if (e.type === 'line') { e.y1 += dy; e.y2 += dy; }
    else if (e.type === 'polyline') { e.points = (e.points || []).map(p => [p[0], p[1] + dy]); }
    else if (e.type === 'circle') { e.y += dy; }
    else if (e.type === 'text') { e.y += dy; }
    else if (e.type === 'dimension') {
      if (e.p1) e.p1.y += dy;
      if (e.p2) e.p2.y += dy;
      if (e.dimLine) e.dimLine.y += dy;
      if (e.text) e.text.y += dy;
      (e.graphics || []).forEach(ge => moveEntityY(ge, dy));
    }
    else if (e.type === 'insert') { e.y += dy; }
  }
  function moveEntityRangeY(g, startIndex, endIndex, dy) {
    for (let i = startIndex; i < endIndex; i += 1) moveEntityY(g.entities[i], dy);
  }
  function frontViewMinY(d) {
    // PERI01: sağ/ayna yan görünüş, karşı görünüşteki gerçek dikme gövdesinin -Y uç hattına hizalanır.
    // Ön görünüş dikme gövdesi: rectStartY - onPostTopDrop noktasından başlar,
    // yüksekliği frontHeight - onPostHeightCorrection - parapetHeight kadardır.
    // Bu nedenle alt uç = rectStartY - frontHeight + 46 + parapetHeight.
    return d.commonFrontRectStartY - d.frontHeight + K.onPostHeightCorrection - K.onPostTopDrop + d.parapetHeight;
  }


  function sideMirrorNeeded(d, p) {
    const differentOpening = d.openingList.length > 1;
    if (differentOpening) return p.index === d.sidePositionCount - 1;
    return yes(d.glassTrack) || yes(d.sideTrack);
  }
  function rotatedRect(g, x, y, w, h, bx, by, ang, layer) { const pts = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]].map(p => rotatePoint(p[0], p[1], bx, by, ang)); g.poly(pts, true, layer); return pts; }
  function blockRef(g, name, x, y, w, h, layer = 'BLOCKREF', rotation = 0, scaleX = 1, scaleY = 1) { return g.insert(name, x, y, { layer, rotation, scaleX, scaleY, previewW: w, previewH: h }); }

  function normalizeGlassTrackProfile(src) {
    const raw = src || {};
    let mode = String(raw.mode || raw.id || 'standard').trim().toLowerCase();
    let en = Number(raw.en ?? raw.side ?? raw.width ?? 100);
    let boy = Number(raw.boy ?? raw.top ?? raw.depth ?? 100);
    let et = Number(raw.et ?? raw.thickness ?? 2);
    if (mode === '40x130' || mode === '40x130x2' || mode === 'side_register_40x130') { en = 40; boy = 130; et = 2; mode = '40x130x2'; }
    else if (mode !== 'other') { en = 100; boy = 100; et = 2; mode = 'standard'; }
    en = Math.max(5, Number.isFinite(en) ? en : 100);
    boy = Math.max(5, Number.isFinite(boy) ? boy : 100);
    et = Math.max(0, Number.isFinite(et) ? et : 2);
    const maxEt = Math.max(0, Math.min(en, boy) / 2 - 0.1);
    et = Math.min(et, maxEt);
    return { mode, en, boy, et };
  }

  function drawHollowRect(g, x, y, w, h, layer, et = 0) {
    g.rect(x, y, w, h, layer);
    const t = Math.max(0, Number(et) || 0);
    const left = Math.min(x, x + w), right = Math.max(x, x + w);
    const bottom = Math.min(y, y + h), top = Math.max(y, y + h);
    const iw = right - left - 2 * t;
    const ih = top - bottom - 2 * t;
    if (iw > 0.5 && ih > 0.5) g.rect(left + t, top - t, iw, -ih, layer);
  }

  function addGlassTrackInteraction(g, x, y, w, h, profile, part = 'track', scope = 'global') {
    g.entities.push({
      type: 'interaction',
      kind: 'glassTrackEditor',
      x, y, w, h,
      data: { part, scope, profileMode: profile.mode, en: profile.en, boy: profile.boy, et: profile.et }
    });
  }

  function supportProfileFor(d, scope = 'left') {
    if (d && d.glassTrackSupportProfiles && d.glassTrackSupportProfiles[scope]) return d.glassTrackSupportProfiles[scope];
    return d && d.glassTrackProfile ? d.glassTrackProfile : normalizeGlassTrackProfile();
  }

  function rayXs(d) { return d.systems.flatMap(s => s.rays); }
  function raySystemInfos(d) { return d.systems.map(s => ({ ...s })); }
  function rayIntervals(d) { const out = []; d.systems.forEach(sys => { for (let i = 0; i < sys.rays.length - 1; i += 1) { const x1 = sys.rays[i]; const x2 = sys.rays[i + 1]; out.push({ system: sys.index, x: x1 + K.rayW, len: x2 - (x1 + K.rayW) }); } }); return out; }
  function systemRanges(d) { return d.systems.map(sys => { const rays = sys.rays; const x1 = rays.length ? rays[0] - 6 : sys.startX; const x2 = rays.length ? rays[rays.length - 1] + 86 : sys.endX; return { system: sys.index, x1, x2, mid: (x1 + x2) / 2 }; }); }
  function systemGapRanges(d) { const out = []; for (let i = 0; i < d.systems.length - 1; i += 1) { const left = d.systems[i], right = d.systems[i + 1]; const x1 = left.rays[left.rays.length - 1] + 80; const x2 = right.rays[0]; out.push({ x1, x2, mid: (x1 + x2) / 2 }); } return out; }


  function topSideTrackTotalRange(d) {
    // V8.2.32: Çoklu pozda yan/cam kayıt profili çiziliyorsa toplam üst ölçü,
    // ray arka mekanizma bloklarından değil yan kayıt profillerinin dış X uçlarından alınır.
    // Üst görünüşte bu profil drawTopGlassTrack içinde GLASS katmanında 100 mm genişliğinde çizilir.
    if (!yes(d.glassTrack)) return null;
    const x1 = d.solX - 50;       // Poz 1 sol yan kayıt profilinin -X dış ucu
    const x2 = d.sagX + 50;       // Son poz sağ yan kayıt profilinin +X dış ucu
    if (!Number.isFinite(x1) || !Number.isFinite(x2) || x2 <= x1) return null;
    return { x1, x2, mid: (x1 + x2) / 2 };
  }

  function dikmeAraAxes(d) {
    const out = [];
    if (d.systems.length <= 1) return out;
    d.systems.forEach((sys, s) => {
      sys.rays.forEach((x, r) => {
        if (s === 0 && r === 0) return;
        if (s === d.systems.length - 1 && r === sys.rays.length - 1) return;
        if (r === sys.rays.length - 1 && s < d.systems.length - 1) {
          const next = d.systems[s + 1];
          out.push(next && next.rays.length ? ((x + 80 + next.rays[0]) / 2) : (x + 92.5));
          return;
        }
        if (r === 0 && s > 0) return;
        out.push(x + 40);
      });
    });
    return out;
  }
  function axisPick(list, idx, total) { const n = list.length; if (n <= 0) return null; if (total <= 1) return list[Math.floor(n / 2)]; if (n === 1) return list[0]; let k = Math.floor(0.5 + idx * ((n - 1) / (total - 1))); return list[clamp(k, 0, n - 1)]; }
  function dikmeXEski(d, i) { if (i === 0) return d.solX; if (i === d.postCount - 1) return d.sagX; if (d.postCount === d.rayCount && d.rayCount > 1) return K.systemStartX + ((d.width - K.rayW) / (d.rayCount - 1)) * i + 40; return d.postCount > 1 ? d.solX + ((d.width - K.postSize) / (d.postCount - 1)) * i : K.systemStartX + d.width / 2; }
  function postCenterXs(d) {
    if (d.postCount <= 0) return [];
    if (d.postCount === 1) return [K.systemStartX + d.width / 2];
    if (Array.isArray(d.customFrontPostCenters) && d.customFrontPostCenters.length === d.postCount) {
      const custom = d.customFrontPostCenters.map(Number);
      const valid = custom.every(Number.isFinite) && custom.every((x, i) => i === 0 || x > custom[i - 1] + K.postSize);
      if (valid) {
        custom[0] = d.solX;
        custom[custom.length - 1] = d.sagX;
        if (custom.every((x, i) => i === 0 || x > custom[i - 1] + K.postSize)) return custom;
      }
    }
    if (d.manualPostPlacementMode === 'equal') {
      return Array.from({ length: d.postCount }, (_, i) => d.solX + ((d.sagX - d.solX) / Math.max(1, d.postCount - 1)) * i);
    }
    const out = [];
    const ax = dikmeAraAxes(d);
    for (let i = 0; i < d.postCount; i += 1) {
      let x = null;
      if (d.systemCount > 1) {
        if (i === 0) x = d.solX;
        else if (i === d.postCount - 1) x = d.sagX;
        else if (d.postCount > 2) {
          const midCount = d.postCount - 2;
          if (ax.length > 0 && ax.length === midCount) x = ax[i - 1];
          else if (ax.length > 0 && !yes(d.glassTrack) && d.rayCount === d.postCount) x = axisPick(ax, i - 1, midCount);
          else x = d.solX + ((d.sagX - d.solX) / (d.postCount - 1)) * i;
        }
      }
      out.push(Number.isFinite(x) ? x : dikmeXEski(d, i));
    }
    return out;
  }


  function customHatchBlocks() {
    // V8.4.5: Bu bloklar geometri yer tutucusudur; önizleme/PDF sabit model-uzayı desenini doğrudan üretir, Modern DXF motoru gerçek HATCH'e dönüştürür.
    const brick = [];
    const brickCourse = 190.5;
    const brickWidth = 381;
    for (let y = brickCourse; y < 1000; y += brickCourse) {
      brick.push({ type: 'line', layer: 'HATCH_WALL', color: 8, x1: 0, y1: y, x2: 1000, y2: y });
    }
    for (let row = 0; row <= Math.ceil(1000 / brickCourse); row += 1) {
      const y1 = row * brickCourse;
      const y2 = Math.min(1000, y1 + brickCourse);
      const rowOffset = row % 2 === 0 ? 0 : brickWidth / 2;
      for (let x = rowOffset; x <= 1000; x += brickWidth) {
        if (x > 0 && x < 1000) brick.push({ type: 'line', layer: 'HATCH_WALL', color: 8, x1: x, y1, x2: x, y2 });
      }
    }

    const trapez = [];
    for (let x = 0; x < 1000; x += 150) {
      trapez.push({ type: 'line', layer: 'HATCH_FABRIC', color: 42, x1: x, y1: 0, x2: x, y2: 1000 });
      if (x + 42 < 1000) trapez.push({ type: 'line', layer: 'HATCH_FABRIC', color: 42, x1: x + 42, y1: 0, x2: x + 42, y2: 1000 });
    }

    return {
      'PULUMUR WALL BRICK SAFE HATCH': { dxfName: 'PULUMUR_WALL_BRICK_HATCH', bounds: { minX: 0, minY: 0, maxX: 1000, maxY: 1000 }, entities: brick },
      'PULUMUR TRAPEZ SAFE HATCH': { dxfName: 'PULUMUR_TRAPEZ_SAFE_HATCH', bounds: { minX: 0, minY: 0, maxX: 1000, maxY: 1000 }, entities: trapez }
    };
  }

  function safeHatchBlock(g, name, x, y, w, h, layer) {
    const ww = Number(w) || 0;
    const hh = Number(h) || 0;
    if (Math.abs(ww) < 50 || Math.abs(hh) < 50) return;
    // Çizim modelinde tarama alanı hafif bir INSERT taşıyıcısıyla tutulur.
    // Modern DXF motoru bunu gerçek HATCH'e, önizleme/PDF motoru ise aynı ölçekli kesilmiş çizgi desenine dönüştürür.
    // X referansı normalize edilerek aynalı sağ görünüşte taramanın duvar dışına taşması engellenir.
    const insX = ww >= 0 ? x : x + ww;
    const scaleX = Math.abs(ww) / 1000;
    const scaleY = hh / 1000;
    g.insert(name, insX, y, { layer, rotation: 0, scaleX, scaleY, previewW: Math.abs(ww), previewH: Math.abs(hh) });
  }

  function topWallYAt(d, idx) { return -(d.openingList[0] - (nthOrLast(d.openingList, idx) || d.opening)); }
  function topWallHAt(d, idx) { return K.topWallH + (d.maxOpening - (nthOrLast(d.openingList, idx) || d.opening)); }
  function topCatiProfilYAt(d, idx) { return topWallYAt(d, idx) - 400; }
  function onRayTopYForPosition(d, idx) { const rear = nthOrLast(d.rearHeightList, idx) || d.rearHeight; return d.frontRayTopRefY - (d.maxRearHeight - rear); }
  function frontRectStartYForPosition(d, idx) { const rear = nthOrLast(d.rearHeightList, idx) || d.rearHeight; return onRayTopYForPosition(d, idx) - rear + d.frontHeight; }

  function drawTopWall(g, d) {
    d.systems.forEach(sys => {
      const y = topWallYAt(d, sys.index);
      const h = topWallHAt(d, sys.index);
      const wx = sys.startX - K.topWallInset;
      const ww = sys.width + K.topWallInset * 2;
      g.rect(wx, y, ww, h, 'TOPWALL');
      safeHatchBlock(g, 'PULUMUR WALL BRICK SAFE HATCH', wx, y, ww, h, 'HATCH_WALL');
    });
  }

  function drawTopRays(g, d) {
    d.systems.forEach(sys => {
      const p = d.positions[sys.index] || d.positions[0];
      const rayEndY = -(d.opening + K.topRayEndExtra);
      const rayStartY = rayEndY + (p.opening - K.rayLengthFrontDeduct);
      sys.rays.forEach(x => {
        g.rect(x, rayStartY, K.rayW, -(p.opening - K.rayLengthFrontDeduct), 'Ray - Üst Görünüş');
        g.rect(x + 33.5, rayStartY, 13, -(p.opening - K.rayLengthFrontDeduct), 'Ray - Üst Görünüş');
        blockRef(g, 'PergoRise Ray Arka Mekanizma Üst Görünüş', x + 40, rayStartY, 95, 72);
        blockRef(g, 'PergoRise Ray Kafası Üst Görünüş', x + 40, rayEndY, 100, 80);
      });
    });
  }

  function drawTopGutter(g, d) { const y = -d.opening; g.rect(K.gutterX, y, d.width + 100, K.topGutterH, 'PROFILE'); g.rect(K.gutterX, y, d.width + 100, K.topGutterInnerH, 'PROFILE'); g.rect(K.gutterX, y + K.topGutterH, d.width + 100, -K.topGutterLipH, 'PROFILE'); /* V8.2.2: Üst görünüşte PergoRise Oluk bloğu çizilmez; çizgisel oluk profili kalır. */ }
  function drawTopPosts(g, d) { postCenterXs(d).forEach(x => { blockRef(g, 'PergoRise Dikme Üst Görünüş', x, d.posY, 100, 100, 'POST'); blockRef(g, 'PergoRise Dikme Oluk Bağlantı Üst Görünüş', x, d.posY, 135, 95); }); }

  function drawTopGlassTrack(g, d) {
    if (!yes(d.glassTrack)) return;
    const profile = d.glassTrackProfile || normalizeGlassTrackProfile();
    const sideH = profile.en;
    const topW = profile.boy;
    const et = profile.et;
    const leftSupportProfile = supportProfileFor(d, 'left');
    const rightSupportProfile = supportProfileFor(d, 'right');
    const firstA = nthOrLast(d.openingList, 0) || d.opening;
    const lastIdx = Math.max(0, d.systemCount - 1);
    const lastA = nthOrLast(d.openingList, lastIdx) || firstA;
    const firstL = Math.max(1, firstA - 100);
    const lastL = Math.max(1, lastA - 100);
    const baseY = -firstA + 100;

    // Sol yan kayıt: -X dış ucu sabit, +X yönüne doğru genişler.
    const leftX = d.solX - 50;
    // Sağ yan kayıt: +X dış ucu sabit, -X yönüne doğru genişler.
    const rightOuterX = d.sagX + 50;
    const rightX = rightOuterX - topW;

    const items = [
      { baseX: leftX, camL: firstL, by: baseY, side: 'left' },
      { baseX: rightX, camL: lastL, by: baseY, side: 'right' }
    ];

    items.forEach(({ baseX, camL, by, side }) => {
      // V8.2.79: Cam kaydı uzun profillerinde et/ofset çizilmez; sadece dış kontur görünür.
      // Et kalınlığı yalnızca destek dikmesinin üst kesit görünüşünde gösterilir.
      g.rect(baseX, by, topW, camL, 'GLASS');
      if (camL > 5000) {
        const sp = side === 'left' ? leftSupportProfile : rightSupportProfile;
        const supTopW = sp.boy;
        const supSideH = sp.en;
        const supEt = sp.et;
        // V8.2.81: Destek kesiti ana cam kaydından farklıysa merkezler değil dış kenarlar hizalanır.
        // İlk pozda destek -X dış ucu cam kaydı -X dış ucuna, son pozda +X dış uçlar birbirine kilitlenir.
        const centerY = by + camL / 2;
        const sx = side === 'left' ? baseX : (baseX + topW - supTopW);
        const sy = centerY - supSideH / 2;
        drawHollowRect(g, sx, sy, supTopW, supSideH, 'GLASS', supEt);
      }
    });
  }

  function drawTopRoofProfiles(g, d) {
    rayIntervals(d).forEach(interval => {
      if (interval.len <= 1) return;
      const p = d.positions[interval.system] || d.positions[0];
      const y = topCatiProfilYAt(d, interval.system);
      const shift = (p.rayLength / K.catiProfilRayRatioBase) * K.catiProfilRayRatioMove + K.catiProfilExtraOffset;
      g.rect(interval.x, y, interval.len, K.catiProfilH, 'FABRIC');
      g.rect(interval.x, y - shift, interval.len, K.catiProfilH, 'FABRIC');
    });
  }

  function drawTopTrapezSafeHatch(g, d) {
    d.systems.forEach(sys => {
      const p = d.positions[sys.index] || d.positions[0];
      const firstRayX = sys.rays && sys.rays.length ? sys.rays[0] : sys.rayAreaStartX;
      const lastRayX = sys.rays && sys.rays.length ? sys.rays[sys.rays.length - 1] : sys.rayAreaEndX;
      const x = firstRayX;
      const w = Math.max(1, lastRayX - firstRayX); // V8.2.26: son raydan +X yönünde K.rayW/76-80 mm taşma yok
      const wallY = topWallYAt(d, sys.index);
      const roofY = topCatiProfilYAt(d, sys.index);
      const shift = (p.rayLength / K.catiProfilRayRatioBase) * K.catiProfilRayRatioMove + K.catiProfilExtraOffset;
      const bottomY = roofY - shift;
      safeHatchBlock(g, 'PULUMUR TRAPEZ SAFE HATCH', x, wallY, w, bottomY - wallY, 'HATCH_FABRIC');
    });
  }

  function drawTopTrapez(g, d) {
    d.systems.forEach(sys => {
      const p = d.positions[sys.index] || d.positions[0];
      const profilKaydirY = ((p.rayLength / K.catiProfilRayRatioBase) * K.catiProfilRayRatioMove + K.catiProfilExtraOffset) + 400;
      const trapX = sys.rayAreaStartX;
      const trapW = sys.rayAreaEndX - sys.rayAreaStartX;
      const trapY = topWallYAt(d, sys.index);
      if (trapW > 1) blockRef(g, 'Trapez Tarama', trapX, trapY, trapW, profilKaydirY, 'BLOCKREF', 0, trapW / 100, profilKaydirY / 100);
    });
  }

  function pergoRiseTextFitForSystem(d, sys, label) {
    // PERI01 kuralı: PERGO RISE yazısı, her pozda ilk ve son ray arasında kalır.
    // İlk rayın iç kenarından +400, son rayın iç kenarından -400 boşluk bırakılır.
    const rays = sys && sys.rays ? sys.rays : [];
    let leftLimit = sys ? sys.startX + 400 : K.systemStartX + 400;
    let rightLimit = sys ? sys.endX - 400 : K.systemStartX + d.width - 400;
    if (rays.length >= 2) {
      leftLimit = rays[0] + K.rayW + 400;
      rightLimit = rays[rays.length - 1] - 400;
    } else if (rays.length === 1) {
      leftLimit = (sys ? sys.startX : rays[0]) + 400;
      rightLimit = (sys ? sys.endX : rays[0] + K.rayW) - 400;
    }
    if (rightLimit <= leftLimit) {
      leftLimit = sys ? sys.startX + 80 : K.systemStartX;
      rightLimit = sys ? sys.endX - 80 : K.systemStartX + d.width;
    }
    const available = Math.max(1, rightLimit - leftLimit);
    // R12 TEXT çıktısında çoklu poz yazısı tek satır görünür; hesabı da o satıra göre yapıyoruz.
    const textLen = Math.max(1, String(label || '').replace(/\s+/g, ' ').trim().length);
    const height = clamp(available / (textLen * 0.68), 32, K.pergoTextMaxH);
    return { x: (leftLimit + rightLimit) / 2, h: height };
  }

  function drawTopPergoText(g, d) {
    const textY = -d.opening / 2;
    d.systems.forEach((sys, i) => {
      const label = d.systemCount > 1 ? `PERGO RISE POZ ${i + 1}` : 'PERGO RISE';
      const fit = pergoRiseTextFitForSystem(d, sys, label);
      const ent = g.text(fit.x, textY, label, fit.h, 'TITLE', 'center');
      ent.color = 3; // PERI01 pergoPozYaz: (col "3")
    });
  }

  function drawTopView(g, d) {
    drawTopWall(g, d);
    drawTopRays(g, d);
    drawTopGutter(g, d);
    drawTopPosts(g, d);
    drawTopGlassTrack(g, d);
    drawTopRoofProfiles(g, d);
    drawTopTrapezSafeHatch(g, d);
    /* drawTopTrapez disabled for no-polyline-simplify lightweight DXF */
    drawTopPergoText(g, d);

    // V8.4.5: Üst görünüşte açılım ölçüsü gösterilmez.
    // Açılım ölçüsü yan görünüşte poz bazlı olarak korunur.

    if (d.systemCount === 1) {
      addDimH(g, d.rayAreaStartX - 6, d.rayAreaStartX + d.raySystemW + 6, 0, 800, `GENİŞLİK ${formatMm(d.nominalWidth)}`, { layer: 'Ölçüler - Üst Görünüş', edit: { dimId: 'top_total_width', ruleKey: 'top_total_width', field: 'width', index: 0, label: 'Toplam Genişlik', view: 'Top', relatedZoneId: 'top_total_width_zone' } });
      return;
    }

    // Çoklu poz üst görünüş genişlik ölçüleri:
    // Ölçü çizgisi, oluk profilinin iç kenarından +Y yönüne 500 mm içeride konumlanır.
    const gutterInnerY = -d.opening + K.topGutterH;
    const topWidthDimY = gutterInnerY + 500;
    systemRanges(d).forEach(r => addDimH(g, r.x1, r.x2, gutterInnerY, topWidthDimY, `SİSTEM ${r.system + 1} ${formatMm(r.x2 - r.x1)}`, { layer: 'Ölçüler - Üst Görünüş', edit: { dimId: `top_system_${r.system + 1}_width`, ruleKey: 'top_system_width', field: 'width', index: r.system, label: `Sistem ${r.system + 1} Genişlik`, view: 'Top', relatedZoneId: `top_system_${r.system + 1}_zone` } }));
    systemGapRanges(d).forEach((gap, gi) => addDimH(g, gap.x1, gap.x2, gutterInnerY, topWidthDimY, `${formatMm(gap.x2 - gap.x1)}`, { layer: 'Ölçüler - Üst Görünüş', edit: { dimId: `top_system_gap_${gi + 1}`, ruleKey: 'info_only', field: '__info__', index: gi, label: 'Sistem Ara Boşluk', view: 'Top', relatedZoneId: `top_system_gap_zone_${gi + 1}`, editable: false } }));

    // Çoklu poz toplam üst genişlik:
    // PERI01 yerleşiminde ray arka mekanizma blokları ray merkezinden +40 ile yerleşir.
    // Bu ölçü, 1. poz 1. rayın arka mekanizma bloğu -X ucu ile son poz son rayın +X ucu arasındadır.
    // Ölçü çizgisi tüm duvar çizimlerinin +Y yönündeki en uç noktasından +50 mm yukarı alınır; ;NO ara boşlukları korunur.
    const ranges = systemRanges(d);
    const firstRange = ranges[0];
    const lastRange = ranges[ranges.length - 1];
    if (firstRange && lastRange) {
      const sideTrackRange = topSideTrackTotalRange(d);
      const totalMeasureX1 = sideTrackRange ? sideTrackRange.x1 : firstRange.x1;
      const totalMeasureX2 = sideTrackRange ? sideTrackRange.x2 : lastRange.x2;
      const wallTopMaxY = Math.max(...d.systems.map(sys => Math.max(topWallYAt(d, sys.index), topWallYAt(d, sys.index) + topWallHAt(d, sys.index))));
      const totalDimY = wallTopMaxY + 50;
      addDimH(g, totalMeasureX1, totalMeasureX2, wallTopMaxY, totalDimY, `TOPLAM GENİŞLİK ${formatMm(totalMeasureX2 - totalMeasureX1)}`, { layer: 'Ölçüler - Üst Görünüş', edit: { dimId: 'top_total_measure_width', ruleKey: 'top_total_width', field: 'width', index: 0, label: 'Toplam Genişlik', view: 'Top', relatedZoneId: 'top_total_width_zone' } });
    }
  }

  function slidingBlockName(placement) {
    const poz = String((placement && placement.pozNo) || 'S01').toUpperCase().replace(/[^A-Z0-9_-]+/g, '_');
    return `SLIDING_POZ_${poz}`;
  }

  // V8.4.3: Sliding iç bilgi tablosu kodda korunur fakat varsayılan olarak çizilmez.
  // İleride başka bir yerleşim modunda placement.showInternalTable=true ile yeniden kullanılabilir.
  const SLIDING_INTERNAL_TABLE_ENABLED = false;

  function slidingTextHeight(value, cellW, baseH, minH = 12) {
    const text = String(value || '');
    const len = Math.max(1, text.length);
    const maxByWidth = Math.floor(Math.max(1, cellW - 18) / (len * 0.60));
    return Math.max(minH, Math.min(baseH, maxByWidth));
  }

  function slidingArrowEntity(panel, direction, y, color = 4) {
    const inset = 30;
    const x1 = panel.x1 + inset;
    const x2 = panel.x2 - inset;
    const height = 400;
    const headLen = height / 2;
    const halfHead = height / 2.4;
    const points = direction === 'RIGHT'
      ? [[x1, y], [x2, y], [x2 - headLen, y + halfHead], [x2, y], [x2 - headLen, y - halfHead]]
      : [[x2, y], [x1, y], [x1 + headLen, y + halfHead], [x1, y], [x1 + headLen, y - halfHead]];
    return { type: 'polyline', layer: 'Ürün Yerleşimi - Sürme', color, closed: false, points };
  }

  function chooseSlidingTablePanel(panels, occupied) {
    const defaultIndex = Math.min(1, Math.max(0, panels.length - 1));
    if (!occupied.has(defaultIndex)) return { index: defaultIndex, greyArrowPanel: null };
    const empty = panels.map((_, i) => i).filter(i => !occupied.has(i));
    if (empty.length) {
      empty.sort((a, b) => Math.abs(a - defaultIndex) - Math.abs(b - defaultIndex) || a - b);
      return { index: empty[0], greyArrowPanel: null };
    }
    return { index: defaultIndex, greyArrowPanel: defaultIndex };
  }

  function addSlidingTableEntities(entities, panel, placement) {
    const layer = 'Ürün Yerleşimi - Sürme';
    const color = 4;
    const x = panel.x1 + 30;
    const y = panel.y1 + 30;
    const w = Math.max(50, panel.x2 - panel.x1 - 60);
    const h = Math.max(100, panel.y2 - panel.y1 - 60);
    const rows = [
      [`SLIDING POZ ${placement.pozNo}`, ''],
      ['POZ NO', placement.pozNo],
      ['SERIES', placement.series],
      ['TYPE', placement.type],
      ['OPENING TYPE', placement.openingType],
      ['GLASS THICKNESS', placement.glassThickness],
      ['GLASS COLOR', placement.glassColor],
      ['QUANTITY', String(placement.quantity)],
      ['SIZE', `${Math.round(placement.width)} X ${Math.round(placement.height)} MM`],
      ['PANEL COUNT', String(placement.panelCount)]
    ];
    const rowH = h / rows.length;
    const topY = y + h;
    const splitX = x + w * 0.50;
    const leftW = splitX - x;
    const rightW = x + w - splitX;
    entities.push({ type: 'polyline', layer, color, closed: true, points: [[x, y], [x + w, y], [x + w, topY], [x, topY]] });
    entities.push({ type: 'line', layer, color, x1: splitX, y1: y, x2: splitX, y2: topY - rowH });
    for (let i = 1; i < rows.length; i += 1) {
      const yy = topY - i * rowH;
      entities.push({ type: 'line', layer, color, x1: x, y1: yy, x2: x + w, y2: yy });
    }
    rows.forEach((row, i) => {
      const cy = topY - i * rowH - rowH / 2;
      if (i === 0) {
        const th = slidingTextHeight(row[0], w, Math.min(28, rowH * 0.55), 12);
        entities.push({ type: 'text', layer, color, x: x + w / 2, y: cy, value: row[0], height: th, width: Math.max(1, w - 16), align: 'center', rotation: 0 });
      } else {
        const leftH = slidingTextHeight(row[0], leftW, Math.min(24, rowH * 0.48), 10);
        const rightH = slidingTextHeight(row[1], rightW, Math.min(24, rowH * 0.48), 10);
        entities.push({ type: 'text', layer, color, x: x + 8, y: cy, value: row[0], height: leftH, width: Math.max(1, leftW - 16), align: 'left', rotation: 0 });
        entities.push({ type: 'text', layer, color, x: x + w - 8, y: cy, value: row[1], height: rightH, width: Math.max(1, rightW - 16), align: 'right', rotation: 0 });
      }
    });
  }

  function buildSlidingBlockDefinition(placement) {
    const layer = 'Ürün Yerleşimi - Sürme';
    const color = 4;
    const width = Math.max(1, Number(placement.width) || 1);
    const height = Math.max(1, Number(placement.height) || 1);
    const offset = 50;
    const mullionW = 50;
    const innerX = offset;
    const innerY = offset;
    const innerW = Math.max(1, width - offset * 2);
    const innerH = Math.max(1, height - offset * 2);
    const panelCount = Math.max(2, Math.round(Number(placement.panelCount) || 2));
    const clearW = Math.max(1, (innerW - (panelCount - 1) * mullionW) / panelCount);
    const entities = [
      { type: 'polyline', layer, color, closed: true, points: [[0, 0], [width, 0], [width, height], [0, height]] },
      { type: 'polyline', layer, color, closed: true, points: [[innerX, innerY], [innerX + innerW, innerY], [innerX + innerW, innerY + innerH], [innerX, innerY + innerH]] }
    ];
    const panels = [];
    let cursor = innerX;
    for (let i = 0; i < panelCount; i += 1) {
      const x1 = cursor;
      const x2 = x1 + clearW;
      panels.push({ x1, x2, y1: innerY, y2: innerY + innerH });
      cursor = x2;
      if (i < panelCount - 1) {
        entities.push({ type: 'polyline', layer, color, closed: true, points: [[cursor, innerY], [cursor + mullionW, innerY], [cursor + mullionW, innerY + innerH], [cursor, innerY + innerH]] });
        cursor += mullionW;
      }
    }

    const arrowDefs = [];
    const occupied = new Set();
    const arrowY = height / 2;
    if (placement.openingType === 'CENTER OPENING') {
      const leftIndex = Math.max(0, panelCount / 2 - 1);
      const rightIndex = Math.min(panelCount - 1, panelCount / 2);
      occupied.add(leftIndex);
      occupied.add(rightIndex);
      arrowDefs.push({ panelIndex: leftIndex, direction: 'LEFT' });
      arrowDefs.push({ panelIndex: rightIndex, direction: 'RIGHT' });
    } else {
      occupied.add(0);
      occupied.add(panelCount - 1);
      arrowDefs.push({ panelIndex: 0, direction: 'RIGHT' });
      arrowDefs.push({ panelIndex: panelCount - 1, direction: 'LEFT' });
    }
    const showInternalTable = placement.showInternalTable === true || SLIDING_INTERNAL_TABLE_ENABLED;
    const tableChoice = showInternalTable ? chooseSlidingTablePanel(panels, occupied) : null;
    arrowDefs.forEach(def => {
      const arrowColor = tableChoice && tableChoice.greyArrowPanel === def.panelIndex ? 8 : 4;
      entities.push(slidingArrowEntity(panels[def.panelIndex], def.direction, arrowY, arrowColor));
    });
    if (showInternalTable && tableChoice) addSlidingTableEntities(entities, panels[tableChoice.index], placement);
    return {
      dxfName: slidingBlockName(placement),
      entities,
      bounds: { minX: 0, minY: 0, maxX: width, maxY: height }
    };
  }

  function slidingBlocksFor(d) {
    const blocks = {};
    (d.slidingPlacements || []).forEach(placement => {
      const name = slidingBlockName(placement);
      blocks[name] = buildSlidingBlockDefinition(placement);
    });
    return blocks;
  }

  function drawSlidingPlacements(g, d, postXs, rectStartY, onDikmeH) {
    if (!Array.isArray(d.slidingPlacements) || !d.slidingPlacements.length || postXs.length < 2) return;
    const postBottomY = rectStartY - K.onPostTopDrop - onDikmeH;
    d.slidingPlacements.forEach(placement => {
      const gapIndex = Math.max(0, Math.min(postXs.length - 2, Number(placement.gapIndex) || 0));
      const leftCenter = postXs[gapIndex];
      const rightCenter = postXs[gapIndex + 1];
      const clearGap = Math.max(1, rightCenter - leftCenter - K.postSize);
      const width = Math.max(1, Math.min(Number(placement.width) || clearGap - 5, clearGap - 5));
      const height = Math.max(1, Number(placement.height) || (d.frontHeight - d.parapetHeight - 5));
      const baseX = leftCenter + K.postSize / 2;
      const baseY = postBottomY - (placement.leftPostStandard !== false ? K.onPostHeightCorrection : 0);
      const name = slidingBlockName(placement);
      g.insert(name, baseX, baseY, { layer: 'Ürün Yerleşimi - Sürme', previewW: width, previewH: height });
      const dimScale = 0.32;
      addDimH(g, baseX, baseX + width, baseY, baseY + 90, String(Math.round(width)), {
        layer: 'Ölçüler - Detay',
        scale: dimScale,
        color: 1,
        textColor: 1,
        entityColor: 1,
        dimensionFilterType: 'detail'
      });
      addDimV(g, baseY, baseY + height, baseX + width, baseX + width - 85, String(Math.round(height)), {
        layer: 'Ölçüler - Detay',
        scale: dimScale,
        color: 1,
        textColor: 1,
        entityColor: 1,
        dimensionFilterType: 'detail'
      });
    });
  }


  function guillotineBlockName(placement) {
    const poz = String((placement && placement.pozNo) || 'G01').toUpperCase().replace(/[^A-Z0-9_-]+/g, '_');
    return `GUILLOTINE_POZ_${poz}`;
  }

  function guillotineArrowEntity(panel, direction, x) {
    const y1 = panel.y1 + 30;
    const y2 = panel.y2 - 30;
    const headWidth = Math.min(400, Math.max(120, (panel.x2 - panel.x1) * 0.35));
    const halfW = headWidth / 2;
    const headH = Math.min(Math.abs(y2 - y1) * 0.22, 170);
    const points = direction === 'UP'
      ? [[x, y1], [x, y2], [x - halfW, y2 - headH], [x, y2], [x + halfW, y2 - headH]]
      : [[x, y2], [x, y1], [x - halfW, y1 + headH], [x, y1], [x + halfW, y1 + headH]];
    return { type: 'polyline', layer: 'Ürün Yerleşimi - Giyotin', closed: false, points };
  }

  function guillotineMotorTextHeight(width, viewText) {
    let h = Math.min(62, Math.max(24, width / 58));
    const motorW = () => 5 * h * 0.58;
    const viewW = () => Math.max(1, String(viewText || '').length) * h * 0.58;
    while (h > 18 && width / 2 - viewW() / 2 - motorW() < 100) h -= 1;
    return h;
  }

  function buildGuillotineBlockDefinition(placement) {
    const layer = 'Ürün Yerleşimi - Giyotin';
    const width = Math.max(151, Number(placement.width) || 151);
    const height = Math.max(251, Number(placement.height) || 251);
    const innerX = 50;
    const innerY = 50;
    const innerW = Math.max(1, width - 100);
    const innerH = Math.max(1, height - 200);
    const panelTotal = placement.panelCount === '1+2' ? 3 : 2;
    const separatorH = 50;
    const clearPanelH = Math.max(1, (innerH - (panelTotal - 1) * separatorH) / panelTotal);
    const entities = [
      { type: 'polyline', layer, closed: true, points: [[0, 0], [width, 0], [width, height], [0, height]] },
      { type: 'polyline', layer, closed: true, points: [[innerX, innerY], [innerX + innerW, innerY], [innerX + innerW, innerY + innerH], [innerX, innerY + innerH]] }
    ];
    const panels = [];
    let cursorY = innerY;
    for (let i = 0; i < panelTotal; i += 1) {
      const y1 = cursorY;
      const y2 = y1 + clearPanelH;
      panels.push({ x1: innerX, x2: innerX + innerW, y1, y2 });
      cursorY = y2;
      if (i < panelTotal - 1) {
        entities.push({ type: 'polyline', layer, closed: true, points: [[innerX, cursorY], [innerX + innerW, cursorY], [innerX + innerW, cursorY + separatorH], [innerX, cursorY + separatorH]] });
        cursorY += separatorH;
      }
    }
    const type = String(placement.type || 'STANDARD').toUpperCase();
    const arrowPanel = type === 'UPWARD COLLECTING' ? panels[0] : panels[panels.length - 1];
    const direction = type === 'UPWARD COLLECTING' ? 'UP' : 'DOWN';
    entities.push(guillotineArrowEntity(arrowPanel, direction, innerX + innerW / 2));
    if (type === 'CLEANABLE') {
      const bottom = panels[0];
      const topY = bottom.y2 - 10;
      const mid = [innerX + innerW / 2, bottom.y1 + 10];
      entities.push({ type: 'polyline', layer, closed: false, points: [[innerX + 10, topY], mid, [innerX + innerW - 10, topY]] });
    }
    const viewText = String(placement.view || 'INSIDE VIEW').toUpperCase();
    const textH = guillotineMotorTextHeight(width, viewText);
    const bandY = height - 75;
    const motorRight = String(placement.motorDirection || 'RIGHT').toUpperCase() !== 'LEFT';
    entities.push({ type: 'text', layer, x: motorRight ? width - 10 : 10, y: bandY, height: textH, value: 'MOTOR', align: motorRight ? 'right' : 'left', rotation: 0 });
    entities.push({ type: 'text', layer, x: width / 2, y: bandY, height: textH, value: viewText, align: 'center', rotation: 0 });
    return { dxfName: guillotineBlockName(placement), entities, bounds: { minX: 0, minY: 0, maxX: width, maxY: height } };
  }

  function guillotineBlocksFor(d) {
    const blocks = {};
    (d.guillotinePlacements || []).forEach(placement => {
      const name = guillotineBlockName(placement);
      blocks[name] = buildGuillotineBlockDefinition(placement);
    });
    return blocks;
  }

  function drawGuillotinePlacements(g, d, postXs, rectStartY, onDikmeH) {
    if (!Array.isArray(d.guillotinePlacements) || !d.guillotinePlacements.length || postXs.length < 2) return;
    const postBottomY = rectStartY - K.onPostTopDrop - onDikmeH;
    d.guillotinePlacements.forEach(placement => {
      const gapIndex = Math.max(0, Math.min(postXs.length - 2, Number(placement.gapIndex) || 0));
      const leftCenter = postXs[gapIndex];
      const rightCenter = postXs[gapIndex + 1];
      const clearGap = Math.max(1, rightCenter - leftCenter - K.postSize);
      const width = Math.max(1, Math.min(Number(placement.width) || clearGap - 5, clearGap - 5));
      const height = Math.max(1, Number(placement.height) || (d.frontHeight - d.parapetHeight - 5));
      const baseX = leftCenter + K.postSize / 2;
      const baseY = postBottomY - (placement.leftPostStandard !== false ? K.onPostHeightCorrection : 0);
      const name = guillotineBlockName(placement);
      g.insert(name, baseX, baseY, { layer: 'Ürün Yerleşimi - Giyotin', previewW: width, previewH: height });
      const dimScale = 0.32;
      addDimH(g, baseX, baseX + width, baseY, baseY + 90, String(Math.round(width)), {
        layer: 'Ölçüler - Detay', scale: dimScale, color: 1, textColor: 1, entityColor: 1, dimensionFilterType: 'detail'
      });
      addDimV(g, baseY, baseY + height, baseX + width, baseX + width - 85, String(Math.round(height)), {
        layer: 'Ölçüler - Detay', scale: dimScale, color: 1, textColor: 1, entityColor: 1, dimensionFilterType: 'detail'
      });
    });
  }

  function drawFrontView(g, d) {
    const postXs = Array.isArray(d.postCenterXs) ? d.postCenterXs : postCenterXs(d);
    const rectStartY = d.commonFrontRectStartY;
    const onDikmeH = Math.max(1, d.frontHeight - K.onPostHeightCorrection - d.parapetHeight);
    const altBlokY = rectStartY - d.frontHeight + K.altBlockCorrection + d.parapetHeight;
    g.rect(K.gutterX, rectStartY, d.width + 100, K.frontGutterH, 'PROFILE');
    if (yes(d.parapet) && d.parapetHeight > 0) { const pBaseY = rectStartY - d.frontHeight; const pTopY = pBaseY + d.parapetHeight; g.rect(K.systemStartX, pTopY, d.width, -d.parapetHeight, 'WALL'); safeHatchBlock(g, 'PULUMUR WALL BRICK SAFE HATCH', K.systemStartX, pTopY, d.width, -d.parapetHeight, 'HATCH_WALL'); }
    d.systems.forEach(sys => {
      const p = d.positions[sys.index] || d.positions[0];
      const rayTopY = onRayTopYForPosition(d, sys.index);
      const rayH = Math.max(1, p.rearHeight - d.frontHeight - K.onRayHCorrection);
      const onRayY = rayTopY - rayH;
      sys.rays.forEach(x => { g.rect(x, rayTopY, K.rayW, -rayH, 'Ray - Ön Görünüş'); blockRef(g, 'PergoRise Ray Kafası Ön Görünüş', x + 40, onRayY, 110, 70); });
    });
    postXs.forEach((x, idx) => {
      blockRef(g, 'PergoRise Dikme Oluk Bağlantı Karşı Görünüş', x, rectStartY, 135, 85);
      g.rect(x - 50, rectStartY - K.onPostTopDrop, K.postSize, -onDikmeH, 'POST');
      blockRef(g, 'PergoRise Dikme Alt Bağlantı Karşı Görünüş', x, altBlokY, 125, 70);
      {
        const hitTopY = rectStartY + 24;
        const hitBottomY = rectStartY - K.onPostTopDrop - onDikmeH - 24;
        g.entities.push({ type: 'interaction', kind: 'postEditor', x: x - 62, y: hitBottomY, w: 124, h: hitTopY - hitBottomY, data: { postIndex: idx, postCount: d.postCount, totalRayCount: d.totalRayCount, placementMode: d.manualPostPlacementMode || 'standard' } });
      }
    });
    drawSlidingPlacements(g, d, postXs, rectStartY, onDikmeH);
    drawGuillotinePlacements(g, d, postXs, rectStartY, onDikmeH);
    addDimH(g, K.systemStartX, K.systemStartX + d.nominalWidth, rectStartY - d.frontHeight - 80, rectStartY - d.frontHeight - 350, `GENİŞLİK ${formatMm(d.nominalWidth)}`, { layer: 'Ölçüler - Ön Görünüş', edit: { dimId: 'front_total_width', ruleKey: 'front_total_width', field: 'width', index: 0, label: 'Ön Genişlik', view: 'Front', relatedZoneId: 'front_total_width_zone' } });
    if (!(yes(d.parapet) && d.parapetHeight > 0)) {
      addDimV(g, rectStartY, rectStartY - d.frontHeight, K.systemStartX - 100, K.systemStartX - 360, `ÖN ${formatMm(d.frontHeight)}`, { layer: 'Ölçüler - Ön Görünüş', edit: { dimId: 'front_height', ruleKey: 'front_front_height', field: 'frontHeight', index: 0, label: 'Ön H', view: 'Front', relatedZoneId: 'front_height_zone' } });
    }

    // PERI01 LISP v32/v30 parapet mantığı:
    // Parapet varsa karşı görünüşte iki ek düşey ölçü çizilir.
    // 1) Parapet alt kotu -> parapet üst kotu
    // 2) Parapet üst kotu -> oluk altı/dikme üst referansı
    // Ölçülen referans X'i karşı görünüş başlangıcıdır; ölçü aksları üst görünüş açılım ölçüsüyle aynı sol aksa alınır.
    if (yes(d.parapet) && d.parapetHeight > 0) {
      const onParapetBaseY = rectStartY - d.frontHeight;
      const onParapetTopY = onParapetBaseY + d.parapetHeight;
      const onOlukAltiY = rectStartY;
      const onOlcuGeomX = K.systemStartX;
      const onOlcuAksX = 100;
      const onOlcuAksX2 = -130;
      const smallDim = { scale: 0.82 };
      addDimV(g, onParapetBaseY, onParapetTopY, onOlcuGeomX, onOlcuAksX, `PARAPET ${formatMm(d.parapetHeight)}`, { ...smallDim, layer: 'Ölçüler - Ön Görünüş', edit: { dimId: 'front_parapet_height_info', ruleKey: 'parapet_height_info', field: 'parapetHeight', index: 0, label: 'Parapet H', view: 'Front', relatedZoneId: 'front_parapet_zone', editable: false } });
      addDimV(g, onParapetTopY, onOlukAltiY, onOlcuGeomX, onOlcuAksX2, `DİKME ${formatMm(onOlukAltiY - onParapetTopY)}`, { ...smallDim, layer: 'Ölçüler - Ön Görünüş', edit: { dimId: 'front_post_height_info', ruleKey: 'info_only', field: '__info__', index: 0, label: 'Dikme H', view: 'Front', relatedZoneId: 'front_post_height_zone', editable: false } });
    }

    if (postXs.length > 1) { const midY = rectStartY - onDikmeH / 2; for (let i = 0; i < postXs.length - 1; i += 1) addDimH(g, postXs[i] + 50, postXs[i + 1] - 50, midY, midY, formatMm(postXs[i + 1] - postXs[i] - 100), { layer: 'Ölçüler - Ön Görünüş', edit: { dimId: `front_post_gap_${i + 1}`, ruleKey: 'front_post_gap', field: '__zone__', index: i, label: `Dikme ${i + 1} - Dikme ${i + 2} Arası`, view: 'Front', relatedZoneId: `front_gap_post_${i + 1}_post_${i + 2}` } }); }

  }

  function triangleDogramaTopY(baseX, baseY, AD, slope, topOff, x) {
    return baseY + AD - slope * (x - baseX) - topOff;
  }

  function triangleDogramaAraDikmeSay(AB) {
    return Math.max(0, Math.floor((AB - 0.000001) / 2000));
  }

  function triangleDogramaKapaliCiz(g, pA, pB, pC, pD, layer = 'TRIANGLE') {
    const ent = g.poly([pA, pB, pC, pD], true, layer);
    // V8.4.3: Önizleme ve DXF aynı üçgen doğrama rengini kullanır.
    ent.color = 130;
    ent.trueColor = 0x00BF00;
    return ent;
  }

  function triangleDogramaUrunCiz(g, baseX, baseY, AB, BC, AD, slope, off = 41.7, memberW = 41.7) {
    const topOff = off * Math.sqrt(1 + slope * slope);
    const pA = [baseX, baseY];
    const pB = [baseX + AB, baseY];
    const pC = [baseX + AB, baseY + BC];
    const pD = [baseX, baseY + AD];
    triangleDogramaKapaliCiz(g, pA, pB, pC, pD);

    if (AB > 2.5 * off) {
      const inA = [baseX + off, baseY + off];
      const inB = [baseX + AB - off, baseY + off];
      const inC = [baseX + AB - off, triangleDogramaTopY(baseX, baseY, AD, slope, topOff, baseX + AB - off)];
      const inD = [baseX + off, triangleDogramaTopY(baseX, baseY, AD, slope, topOff, baseX + off)];
      triangleDogramaKapaliCiz(g, inA, inB, inC, inD);

      const innerW = AB - 2 * off;
      const n = triangleDogramaAraDikmeSay(AB);
      if (n > 0) {
        let clear = (innerW - n * memberW) / (n + 1);
        if (clear < 1) clear = 1;
        for (let k = 1; k <= n; k += 1) {
          const xL = baseX + off + clear * k + memberW * (k - 1);
          const xR = xL + memberW;
          const yBot = baseY + off;
          const yTopL = triangleDogramaTopY(baseX, baseY, AD, slope, topOff, xL);
          const yTopR = triangleDogramaTopY(baseX, baseY, AD, slope, topOff, xR);
          triangleDogramaKapaliCiz(g, [xL, yBot], [xR, yBot], [xR, yTopR], [xL, yTopL]);
        }
      }
    }
  }

  function triangleDogramaDisOlcuCiz(g, baseX, baseY, AB, BC, AD) {
    const dimOff = 300;
    addDimH(g, baseX, baseX + AB, baseY, baseY - dimOff, formatMm(AB), { layer: 'Ölçüler - Yan Görünüş', edit: { dimId: 'triangle_ab_info', ruleKey: 'triangle_info', field: '__info__', index: 0, label: 'Üçgen AB', view: 'Side', editable: false } });
    addDimV(g, baseY, baseY + BC, baseX + AB, baseX + AB + dimOff, formatMm(BC), { layer: 'Ölçüler - Yan Görünüş', edit: { dimId: 'triangle_bc_info', ruleKey: 'triangle_info', field: '__info__', index: 0, label: 'Üçgen BC', view: 'Side', editable: false } });
    addDimV(g, baseY, baseY + AD, baseX, baseX - dimOff, formatMm(AD), { layer: 'Ölçüler - Yan Görünüş', edit: { dimId: 'triangle_ad_info', ruleKey: 'triangle_info', field: '__info__', index: 0, label: 'Üçgen AD', view: 'Side', editable: false } });
    addDimAligned(g, baseX, baseY + AD, baseX + AB, baseY + BC, baseX + AB / 2, baseY + AD + dimOff, formatMm(Math.sqrt(AB * AB + Math.pow(AD - BC, 2))), { layer: 'Ölçüler - Yan Görünüş', edit: { dimId: 'triangle_slope_info', ruleKey: 'triangle_info', field: '__info__', index: 0, label: 'Üçgen Eğim', view: 'Side', editable: false } });
  }

  function drawOneSideView(g, d, p, stackShiftY) {
    const globalSideShiftY = Number(d.sideGlobalShiftY) || 0;
    const rectStartY = -(p.opening + (p.rearHeight - d.frontHeight) + K.frontViewExtraDrop) + globalSideShiftY + stackShiftY;
    const dikH = Math.max(1, d.frontHeight - K.onPostHeightCorrection - d.parapetHeight);
    const yanPostUstY = rectStartY - K.onPostTopDrop;
    const yanUstY = rectStartY;
    const yanAltY = yanPostUstY - dikH;
    const yanX = K.sideBaseX;
    const duvarX = K.systemStartX - (1750 + p.opening);
    const duvarY = yanAltY - K.altBlockCorrection - d.parapetHeight;
    const bagX = duvarX;
    const bagY = duvarY + p.rearHeight;
    const arkaMekX = bagX + K.sideArkaMekOffsetX;
    const arkaMekY = bagY + K.sideArkaMekOffsetY;
    const startRayX = bagX + K.sideRayStartOffsetX;
    const startRayY = bagY - K.sideRayStartOffsetY;
    const rayLen = p.rayLength;
    const aci = p.angleRad;
    let sideSupport = null;
    if (d.postCount > 0) { g.rect(yanX, yanPostUstY, -K.postSize, -dikH, 'Dikme - Yan Görünüş'); blockRef(g, 'PergoRise Dikme Oluk Bağlantı Yan Görünüş', yanX, yanPostUstY, 130, 80, 'Blok - Yan Görünüş', 270); blockRef(g, 'PergoRise Dikme Alt Bağlantı Yan Görünüş', yanX - 50, yanAltY, 120, 70, 'Blok - Yan Görünüş'); }
    blockRef(g, 'PergoRise Oluk Yan Görünüş Birleştirilmiş', yanX, yanUstY, 220, 135, 'Blok - Yan Görünüş');
    if (yes(d.glassTrack) && (!d.farkliAcilim || p.index === 0 || p.index === d.sidePositionCount - 1)) {
      const profile = d.glassTrackProfile || normalizeGlassTrackProfile();
      const sideH = profile.en;
      const supportScope = p.index === 0 ? 'left' : 'right';
      const supportProfile = supportProfileFor(d, supportScope);
      const supportSideH = supportProfile.en;
      const camBaseX = yanX - 100, camBaseY = yanUstY - 3, camW = Math.max(1, p.opening - 100);
      // V8.2.79: Yan görünüş cam kaydı profilinde iç ofset çizilmez.
      // Profilin +Y üst referansı sabit, -Y alt ucu seçilen En değerine göre çalışır.
      g.rect(camBaseX, camBaseY, -camW, -sideH, 'GLASS');
      if (p.index === 0) addGlassTrackInteraction(g, camBaseX - camW, camBaseY - sideH, camW, sideH, profile, 'track', 'global');
      if (camW > 5000) {
        const supportCenterX = camBaseX - camW / 2;
        const destekX = supportCenterX - supportSideH / 2;
        // V8.2.82: Destek boyu ana cam kaydı profilinin En değerine bağlıdır.
        // Ana cam kaydı değişirse destek boyu uzar/kısalır; sadece destek profili düzenlenirse boy sabit kalır, kesit değişir.
        const standardSupportTopY = camBaseY - 100;
        const standardSupportH = Math.max(1, d.frontHeight - 103 - d.parapetHeight);
        const destekBottomY = standardSupportTopY - standardSupportH;
        const destekY = camBaseY - sideH;
        const destekH = Math.max(1, destekY - destekBottomY);
        g.rect(destekX, destekY, supportSideH, -destekH, 'GLASS');
        addGlassTrackInteraction(g, destekX, destekY - destekH, supportSideH, destekH, supportProfile, 'support', supportScope);
        sideSupport = { left: destekX, right: destekX + supportSideH };
      }
    }
    if (yes(d.parapet) && d.parapetHeight > 0) { g.rect(duvarX + p.opening, duvarY + d.parapetHeight, -200, -d.parapetHeight, 'Duvar - Yan Görünüş'); safeHatchBlock(g, 'PULUMUR WALL BRICK SAFE HATCH', duvarX + p.opening, duvarY + d.parapetHeight, -200, -d.parapetHeight, 'HATCH_WALL'); }
    g.rect(duvarX, duvarY, -K.sideWallDepth, p.rearHeight, 'Duvar - Yan Görünüş');
    safeHatchBlock(g, 'PULUMUR WALL BRICK SAFE HATCH', duvarX, duvarY, -K.sideWallDepth, p.rearHeight, 'HATCH_WALL');
    blockRef(g, 'PergoRise Ray Duvar Bağlantı Set', bagX, bagY, 120, 95, 'Blok - Yan Görünüş'); blockRef(g, 'PergoRise Ray Arka Mekanizma Yan Görünüş', arkaMekX, arkaMekY, 135, 90, 'Blok - Yan Görünüş', normDeg(aci * 180 / Math.PI));
    rotatedRect(g, startRayX, startRayY, rayLen, -K.sideRayH, arkaMekX, arkaMekY, aci, 'Ray - Yan Görünüş'); rotatedRect(g, startRayX, startRayY - K.sideInnerRayOffsetY, rayLen, -K.sideInnerRayH, arkaMekX, arkaMekY, aci, 'Ray - Yan Görünüş');
    const kafa = rotatePoint(startRayX + rayLen, startRayY, arkaMekX, arkaMekY, aci); const rotDeg = normDeg(aci * 180 / Math.PI); blockRef(g, 'PergoRise Ray Kafası Yan Görünüş', kafa[0], kafa[1], 130, 90, 'Blok - Yan Görünüş', rotDeg);
    // V8.2.1: Yan görünüşte çatı kayıt profili ve ray çekici araba setleri çizilmez.
    if (K.showDimensions !== false) {
      const anglePt = rotatePoint(startRayX + rayLen / 2, startRayY, arkaMekX, arkaMekY, aci);
      const angleText = g.text(anglePt[0], anglePt[1] + 140, `${formatDeg(Math.abs(aci) * 180 / Math.PI)}  POZ ${p.index + 1}`, 170, 'TEXT', 'center');
      angleText.keepReadableOnMirror = true;
      angleText.dimensionFilterType = 'main';
    }
    if (!yes(d.waterStandard)) { const basX = yanX - 35.5; const basY = yanUstY + 13.9; g.rect(basX, basY, 300, 70, 'WATER'); g.text(basX + 310, basY + 35, 'Ø70 Pipe 300 mm', 60, 'WATER', 'left'); }
    p._triangleRange = null;
    if (yes(d.triangleJoinery) && (!d.farkliAcilim || p.index === 0 || p.index === d.sidePositionCount - 1)) {
      const triStart = g.entities.length;
      const denom = Math.abs(p.opening - K.slopeOpeningCorrection) < 1e-9 ? 1 : (p.opening - K.slopeOpeningCorrection);
      const slope = Math.abs((p.rearHeight - d.frontHeight - K.slopeHeightCorrection) / denom);
      const AB = Math.max(1, p.opening - 150);
      const BC = 165 + 150 * slope;
      const AD = BC + AB * slope;
      const off = 41.7;
      const memberW = 41.7;
      const aX = duvarX;
      const aY = yanUstY - 3;
      const copyX = duvarX;
      const copyY = bagY + 600;
      // PERI01: asil ürün yan kayıt/duvar referansından başlar; ikinci kopya duvardan +Y 600'e alınır.
      triangleDogramaUrunCiz(g, aX, aY, AB, BC, AD, slope, off, memberW);
      triangleDogramaUrunCiz(g, copyX, copyY, AB, BC, AD, slope, off, memberW);
      triangleDogramaDisOlcuCiz(g, copyX, copyY, AB, BC, AD);
      p._triangleRange = { start: triStart, end: g.entities.length };
    }
    const postMidY = yanAltY + dikH / 2;
    const frontPostRearFace = yanX - K.postSize;
    if (sideSupport) {
      if (sideSupport.left - duvarX > 150) addDimH(g, duvarX, sideSupport.left, postMidY, postMidY, formatMm(sideSupport.left - duvarX), { scale: 0.72, layer: 'Ölçüler - Yan Görünüş', edit: { dimId: `side_wall_to_support_${p.index}`, ruleKey: 'side_wall_to_post_gap', field: '__zone__', index: p.index, label: 'Duvar - Destek Arası', view: 'Side', relatedZoneId: `side_wall_to_support_zone_${p.index}`, dimensionType: 'detail' } });
      if (frontPostRearFace - sideSupport.right > 150) addDimH(g, sideSupport.right, frontPostRearFace, postMidY, postMidY, formatMm(frontPostRearFace - sideSupport.right), { scale: 0.72, layer: 'Ölçüler - Yan Görünüş', edit: { dimId: `side_support_to_post_${p.index}`, ruleKey: 'side_wall_to_post_gap', field: '__zone__', index: p.index, label: 'Destek - Dikme Arası', view: 'Side', relatedZoneId: `side_support_to_post_zone_${p.index}`, dimensionType: 'detail' } });
    } else {
      if (frontPostRearFace - duvarX > 150) addDimH(g, duvarX, frontPostRearFace, postMidY, postMidY, formatMm(frontPostRearFace - duvarX), { scale: 0.72, layer: 'Ölçüler - Yan Görünüş', edit: { dimId: `side_wall_to_post_${p.index}`, ruleKey: 'side_wall_to_post_gap', field: '__zone__', index: p.index, label: 'Duvar - Dikme Arası', view: 'Side', relatedZoneId: `side_wall_to_post_zone_${p.index}`, dimensionType: 'detail' } });
    }
    if (yes(d.glassTrack) && (!d.farkliAcilim || p.index === 0 || p.index === d.sidePositionCount - 1)) {
      const profile = d.glassTrackProfile || normalizeGlassTrackProfile();
      const camBottomY = yanUstY - 3 - profile.en;
      // V8.2.74: Cam kaydı alt kot ölçüsü, yan görünüş dikmesinden duvara doğru 600 mm içeride gösterilir.
      // V8.2.77: Alt kot, seçilen profilin yan görünüş yüksekliğine göre otomatik değişir.
      const camTrackDimRefX = yanX;
      const camTrackDimLineX = yanX - 600;
      if (camBottomY - duvarY > 150) addDimV(g, duvarY, camBottomY, camTrackDimRefX, camTrackDimLineX, formatMm(camBottomY - duvarY), { scale: 0.72, layer: 'Ölçüler - Yan Görünüş', edit: { dimId: `side_glass_track_to_wall_${p.index}`, ruleKey: 'info_only', field: '__info__', index: p.index, label: 'Cam Kaydı - Alt Kot', view: 'Side', relatedZoneId: `side_glass_track_zone_${p.index}`, editable: false, dimensionType: 'detail', passiveReason: 'Cam kaydı ile duvar alt kotu arasındaki bilgi ölçüsüdür.' } });
    }
    addDimH(g, duvarX, yanX, duvarY, duvarY, `AÇILIM ${formatMm(p.opening)}`, { layer: 'Ölçüler - Yan Görünüş', edit: { dimId: `side_opening_pos_${p.index + 1}`, ruleKey: 'side_opening', field: 'opening', index: p.index, label: 'Açılım', view: 'Side', relatedZoneId: `side_opening_zone_${p.index + 1}` } });
    addDimV(g, duvarY, duvarY + p.rearHeight, duvarX - K.sideWallDepth - 80, duvarX - K.sideWallDepth - 360, `ARKA ${formatMm(p.rearHeight)}`, { layer: 'Ölçüler - Yan Görünüş', edit: { dimId: `side_rear_height_pos_${p.index + 1}`, ruleKey: 'side_rear_height', field: 'rearHeight', index: p.index, label: 'Arka H', view: 'Side', relatedZoneId: `side_rear_height_zone_${p.index + 1}` } });
    // PERI01: yan görünüş ön yükseklik ölçüsü, parapet aktifken de toplam ön kotu verir.
    // Referans alt kotu duvar/parapet alt kotu, üst kotu oluk altı referansıdır.
    addDimV(g, duvarY, duvarY + d.frontHeight, yanX, yanX + 350, `ÖN ${formatMm(d.frontHeight)}`, { layer: 'Ölçüler - Yan Görünüş', edit: { dimId: `side_front_height_pos_${p.index + 1}`, ruleKey: 'side_front_height', field: 'frontHeight', index: 0, label: 'Ön H', view: 'Side', relatedZoneId: `side_front_height_zone_${p.index + 1}` } });
  }

  function triangleFrameAllowance(d, idx) {
    if (!yes(d.triangleJoinery)) return 0;
    const differentOpening = d.openingList.length > 1;
    if (differentOpening && idx !== 0 && idx !== d.sidePositionCount - 1) return 0;
    const p = d.positions[idx] || d.positions[0];
    if (!p) return 0;
    const denom = Math.abs(p.opening - K.slopeOpeningCorrection) < 1e-9 ? 1 : (p.opening - K.slopeOpeningCorrection);
    const slope = Math.abs((p.rearHeight - d.frontHeight - K.slopeHeightCorrection) / denom);
    const AB = Math.max(1, p.opening - 150);
    const BC = 165 + 150 * slope;
    const AD = BC + AB * slope;
    return 600 + AD + 300;
  }

  function sideViewTopLimitY(d) {
    // PERI01 kuralı: sol yan görünüşün +Y yönündeki en uç noktası ile üst tablo arasında
    // her zaman boşluk kalmalı. Üçgen doğrama varsa en üst referans üçgenin ölçü çizgisi,
    // yoksa arka duvarın +Y yönündeki en uç noktasıdır.
    let best = null;
    let shiftY = 0;
    const globalSideShiftY = Number(d.sideGlobalShiftY) || 0;
    for (let i = 0; i < d.sidePositionCount; i += 1) {
      const p = d.positions[i] || d.positions[0];
      const wallTopY = -p.opening - K.frontViewExtraDrop + globalSideShiftY + shiftY;
      let topY = wallTopY;
      const triangleVisible = yes(d.triangleJoinery) && (!d.farkliAcilim || i === 0);
      if (triangleVisible) {
        const denom = Math.abs(p.opening - K.slopeOpeningCorrection) < 1e-9 ? 1 : (p.opening - K.slopeOpeningCorrection);
        const slope = Math.abs((p.rearHeight - d.frontHeight - K.slopeHeightCorrection) / denom);
        const AB = Math.max(1, p.opening - 150);
        const BC = 165 + 150 * slope;
        const AD = BC + AB * slope;
        const triangleTopY = wallTopY + 600 + AD + 300; // ürün + üst ölçü payı
        topY = Math.max(topY, triangleTopY);
      }
      best = best == null ? topY : Math.max(best, topY);
      shiftY -= (p.opening + K.sideViewGapY);
    }
    return best == null ? null : best + 300; // tablo ile çizim arasında güvenli boşluk
  }

  function triangleTableLimitY(d) {
    if (!yes(d.triangleJoinery)) return null;
    const idxs = [];
    for (let i = 0; i < d.sidePositionCount; i += 1) if (!d.farkliAcilim || i === 0) idxs.push(i);
    if (!idxs.length) return null;
    let best = null;
    let shiftY = 0;
    const globalSideShiftY = Number(d.sideGlobalShiftY) || 0;
    for (let i = 0; i < d.sidePositionCount; i += 1) {
      const p = d.positions[i] || d.positions[0];
      if (idxs.includes(i)) {
        const rectStartY = -(p.opening + K.frontViewExtraDrop) - p.rearHeight + d.frontHeight + globalSideShiftY + shiftY;
        const bagY = rectStartY - 3;
        const baseY = bagY + 600;
        const denom = Math.abs(p.opening - K.slopeOpeningCorrection) < 1e-9 ? 1 : (p.opening - K.slopeOpeningCorrection);
        const slope = Math.abs((p.rearHeight - d.frontHeight - K.slopeHeightCorrection) / denom);
        const AB = Math.max(1, p.opening - 150);
        const BC = 165 + 150 * slope;
        const AD = BC + AB * slope;
        const topY = baseY + AD + 300; // triangle üst çapraz ölçü payı dahil yaklaşık limit
        best = best == null ? topY : Math.max(best, topY);
      }
      shiftY -= (p.opening + K.sideViewGapY);
    }
    return best == null ? null : best + 200;
  }

  function drawSideView(g, d) {
    d.farkliAcilim = d.openingList.length > 1;
    d.leftSideRanges = [];
    let shiftY = 0;
    let lastMirrorRange = null;
    let firstRectStartY = null;
    const globalSideShiftY = Number(d.sideGlobalShiftY) || 0;
    for (let i = 0; i < d.sidePositionCount; i += 1) {
      const p = { ...d.positions[i], index: i };
      const thisRectStartY = -(p.opening + (p.rearHeight - d.frontHeight) + K.frontViewExtraDrop) + globalSideShiftY + shiftY;
      if (firstRectStartY == null) firstRectStartY = thisRectStartY;
      const start = g.entities.length;
      drawOneSideView(g, d, p, shiftY);
      let end = g.entities.length;
      const removeLeftTriangle = d.farkliAcilim && p.index === d.sidePositionCount - 1 && p._triangleRange && sideMirrorNeeded(d, p);
      if (sideMirrorNeeded(d, p)) {
        const midX = K.systemStartX + d.width / 2;
        let mirrorStart = g.entities.length;
        mirrorNewEntitiesX(g, start, midX);
        let mirrorEnd = g.entities.length;
        if (removeLeftTriangle) {
          const removeCount = p._triangleRange.end - p._triangleRange.start;
          g.entities.splice(p._triangleRange.start, removeCount);
          end -= removeCount;
          mirrorStart -= removeCount;
          mirrorEnd -= removeCount;
        }
        if (firstRectStartY != null) {
          const deltaY = firstRectStartY - thisRectStartY;
          if (Math.abs(deltaY) > 0.001) moveEntityRangeY(g, mirrorStart, mirrorEnd, deltaY);
        }
        lastMirrorRange = { start: mirrorStart, end: mirrorEnd, index: p.index };
      }
      d.leftSideRanges.push({ start, end, index: i });
      shiftY -= (p.opening + K.sideViewGapY);
    }
    if (lastMirrorRange) {
      // mirrored right side view is already kept on the same Y axis as the first left side gutter block
    }
  }

  function computeFrame(d) {
    const x = -(d.maxOpening + 2900);
    const y = 800 + (d.maxOpening - d.opening) + 450;
    let w = d.systemCount > 1 ? d.width + d.lastOpening + 3500 : d.width + d.maxOpening + 3800;
    const needsMirror = (d.openingList.length > 1) || yes(d.glassTrack) || yes(d.sideTrack);
    if (needsMirror) w = Math.max(w, d.width + 2 * d.maxOpening + 5200);
    const triExtra = yes(d.triangleJoinery) ? Math.max(0, triangleFrameAllowance(d, d.sidePositionCount - 1)) : 0;
    const h = Math.max(5000, d.maxOpening + d.maxRearHeight + 2750 + triExtra + (d.sidePositionCount - 1) * (d.maxOpening + K.sideViewGapY));
    return { x, y, w, h, bottomY: y - h };
  }

  function ensureFrame(d) {
    if (!d.frame) d.frame = computeFrame(d);
    return d.frame;
  }

  function entityBoundsArray(e) {
    if (!e) return [0, 0, 0, 0];
    if (e.type === 'line') return [Math.min(e.x1, e.x2), Math.min(e.y1, e.y2), Math.max(e.x1, e.x2), Math.max(e.y1, e.y2)];
    if (e.type === 'text' || e.type === 'mtext') return [e.x, e.y - e.height, e.x + Math.max(1, String(e.value || '').length) * e.height * 0.65, e.y + e.height];
    if (e.type === 'polyline') { const xs = e.points.map(p => p[0]), ys = e.points.map(p => p[1]); return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)]; }
    if (e.type === 'circle') return [e.x - e.r, e.y - e.r, e.x + e.r, e.y + e.r];
    if (e.type === 'insert') {
      const block = getBlocks()[e.name];
      if (block) return transformBlockBounds(block, e);
      const w = Math.abs(e.previewW || 120), h = Math.abs(e.previewH || 80);
      return [e.x - w / 2, e.y - h / 2, e.x + w / 2, e.y + h / 2];
    }
    if (e.type === 'dimension') {
      const gs = (e.graphics || []).map(entityBoundsArray);
      if (gs.length) return [Math.min(...gs.map(b => b[0])), Math.min(...gs.map(b => b[1])), Math.max(...gs.map(b => b[2])), Math.max(...gs.map(b => b[3]))];
    }
    if (e.type === 'interaction') return [Math.min(e.x, e.x + e.w), Math.min(e.y, e.y + e.h), Math.max(e.x, e.x + e.w), Math.max(e.y, e.y + e.h)];
    return [0, 0, 0, 0];
  }

  function rangeBounds(entities, start, end) {
    if (!Array.isArray(entities) || start == null || end == null || end <= start) return null;
    let out = null;
    for (let i = start; i < end; i += 1) {
      const b = entityBoundsArray(entities[i]);
      if (!out) out = { minX: b[0], minY: b[1], maxX: b[2], maxY: b[3] };
      else {
        out.minX = Math.min(out.minX, b[0]);
        out.minY = Math.min(out.minY, b[1]);
        out.maxX = Math.max(out.maxX, b[2]);
        out.maxY = Math.max(out.maxY, b[3]);
      }
    }
    return out;
  }

  function leftSideViewMinY(d, entities) {
    const ranges = Array.isArray(d.leftSideRanges) ? d.leftSideRanges : [];
    let minY = null;
    ranges.forEach(r => {
      const b = rangeBounds(entities, r.start, r.end);
      if (b) minY = minY == null ? b.minY : Math.min(minY, b.minY);
    });
    return minY;
  }

  function adjustFrameToContent(d, entities) {
    // PERI01 mantığı: dış çerçeve çizimi çevrelemeli; görünüşler tablo dışına taşmamalı.
    // V8.2.17: Üçgen doğrama varken çerçevenin alt sınırı, alt tablonun üstü ile
    // sol yan görünüşün (ölçüler dahil) en alt noktası arasında tam 800 mm boşluk
    // bırakacak şekilde ayarlanır.
    const f = ensureFrame(d);
    const viewEnts = (entities || []).filter(e => !['TABLE', 'TITLE'].includes(e.layer));
    if (!viewEnts.length) return f;
    const b = bounds(viewEnts);
    const padX = 450;
    const padTop = 650;
    const padBottom = 450;
    const minX = Math.min(f.x, b.minX - padX);
    const maxX = Math.max(f.x + f.w, b.maxX + padX);
    const topY = Math.max(f.y, b.maxY + padTop);
    let bottomY = Math.min(f.bottomY, b.minY - padBottom);
    if (yes(d.triangleJoinery)) {
      const sideMinY = leftSideViewMinY(d, entities);
      if (Number.isFinite(sideMinY)) bottomY = sideMinY - 800;
    }
    d.frame = { x: minX, y: topY, w: maxX - minX, h: topY - bottomY, bottomY };
    return d.frame;
  }

  function pergoTextH(d) {
    const ranges = systemRanges(d);
    const minInner = Math.min(...ranges.map(r => Math.max(1, r.x2 - r.x1 - 2 * K.pergoTextOffset)));
    return clamp(minInner / K.pergoTextRatio, K.pergoTextMinH, K.pergoTextMaxH);
  }

  function repeatCharCountText(s) {
    return String(s ?? '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  }

  function wrapTextForWidth(value, width, h, pad, factor = 0.95) {
    const usable = Math.max(h, width - 2 * pad);
    const maxChars = Math.max(1, Math.floor(usable / (h * factor)));
    const raw = repeatCharCountText(value).split('\n');
    const out = [];
    raw.forEach(line => {
      const words = String(line).trim().split(/\s+/).filter(Boolean);
      if (!words.length) { out.push(''); return; }
      let cur = '';
      words.forEach(w => {
        if (!cur) cur = w;
        else if ((cur + ' ' + w).length <= maxChars) cur += ' ' + w;
        else { out.push(cur); cur = w; }
      });
      if (cur) out.push(cur);
    });
    return out.length ? out : [''];
  }

  function textMaxLineLen(value) {
    return Math.max(1, ...repeatCharCountText(value).split('\n').map(x => x.length));
  }

  function fitCellText(value, w, rowH, baseH, padX, options = {}) {
    const mode = options.mode || 'upper';
    const widthFactor = options.widthFactor || 0.72; // Arial yaklaşık karakter genişliği
    const raw = repeatCharCountText(value).replace(/\n/g, '\n').trim() || '-';
    const usable = Math.max(1, Number(w || 0) - 2 * Number(padX || 0));
    const usableH = Math.max(1, Number(rowH || 0) - 2 * Math.max(6, Number(padX || 0) * 0.35));
    const base = Number(baseH) || 60;
    const minH = Math.max(16, base * 0.34);

    function wrapAtHeight(hh) {
      if (mode === 'bottom') return [raw.replace(/\s+/g, ' ')];
      return wrapTextForWidth(raw, usable + 2 * padX, hh, padX, widthFactor).filter(Boolean);
    }

    let hh = base;
    let lines = wrapAtHeight(hh);
    for (let step = 0; step < 40; step += 1) {
      const maxLine = Math.max(1, ...lines.map(x => String(x).length));
      const byWidth = usable / (maxLine * widthFactor);
      const byHeight = usableH / Math.max(1, lines.length * 1.22);
      const next = clamp(Math.min(base, byWidth, byHeight), minH, base);
      if (Math.abs(next - hh) < 0.05) { hh = next; break; }
      hh = next;
      lines = wrapAtHeight(hh);
    }
    if (mode === 'bottom') lines = [raw.replace(/\s+/g, ' ')];
    return { h: hh, lines };
  }

  function drawCellLines(g, x, yTop, w, rowH, h, padX, value, layer = 'TEXT', mode = 'upper') {
    const fit = fitCellText(value, w, rowH, h, padX, { mode });
    const lineStep = fit.h * 1.18;
    const textBlockH = fit.h + Math.max(0, fit.lines.length - 1) * lineStep;
    const centerY = yTop - rowH / 2;
    // PERI01 tablo mantığı: metin bloğu hücrenin düşey merkezine oturur.
    // TEXT entity baseline verdiği için ilk satır baseline'ı optik merkeze göre ayarlanır.
    const firstBaseline = centerY + textBlockH / 2 - fit.h * 0.72;
    const textX = x + padX;
    const mtextCellWidth = Math.max(1, w - 2 * padX);
    fit.lines.forEach((line, i) => {
      const ent = g.text(textX, firstBaseline - i * lineStep, line, fit.h, layer, 'left');
      // Modern DXF'te MTEXT genişliği hücrenin kullanılabilir genişliği kadar olsun.
      // Böylece CAD tarafında beklenmeyen otomatik satır kırımları oluşmaz.
      ent.width = mtextCellWidth;
      ent.cellWidth = mtextCellWidth;
    });
  }

  function upperTableStyle(d) {
    // PERI01 mantığına yakın tablo: yazı boyu PERGO RISE yazısıyla aynı oranda büyümez.
    // Aksi halde büyük sistemlerde tablo yazıları hücre dışına taşar. Tablo solda sabit bir
    // teknik bilgi bloğu gibi davranır; hücre içindeki metinler sığmazsa kırılır/küçülür.
    const h = clamp(pergoTextH(d) * 0.34, 42, 78);
    return {
      rowH: Math.max(150, h * 2.25),
      col1: 1460,
      col2: 2140,
      txtX: Math.max(35, h * 0.55),
      txtY: Math.max(28, h * 0.45),
      txtH: h
    };
  }

  function bottomTableStyle(d, frame) {
    // V8.2.13: Alt tablo yazı boyu, üst tablonun ölçeklenmiş yazı boyuyla aynıdır.
    // Hücre yükseklikleri ise bu yazı boyu sabit kalacak şekilde içerik satır sayısına göre büyür/küçülür.
    const upper = upperTableScaledStyle(d);
    const h = upper.txtH;
    // V8.2.16: Kullanıcı tanımlı alt tablo kolon oranı.
    const base = [13, 40, 10, 19, 7, 11];
    const sum = base.reduce((a,b)=>a+b,0);
    const cols = base.map(v => frame.w * (v / sum));
    return {
      rowH: Math.max(165, h * 2.15),
      cols,
      txtX: upper.txtX,
      txtY: upper.txtY,
      txtH: h
    };
  }

  function fitTextHSingleLine(value, w, h, pad) {
    const usable = Math.max(1, w - 2 * pad);
    const n = textMaxLineLen(value);
    const fitH = usable / (n * 0.95);
    const minH = h * 0.35;
    return Math.max(minH, Math.min(h, fitH));
  }

  function upperTableScaledStyle(d) {
    const frame = ensureFrame(d);
    const base = upperTableStyle(d);
    const tableX = frame.x + 50;
    const topViewLeftX = Math.min(K.gutterX, d.systemStartX, d.rayAreaStartX || d.systemStartX);
    const tableRightLimitX = topViewLeftX - 500;
    const baseTableW = base.col1 + base.col2;
    const availableW = Math.max(baseTableW, tableRightLimitX - tableX);
    const tableScale = clamp(availableW / baseTableW, 0.72, 3.25);
    return {
      ...base,
      tableScale,
      col1: base.col1 * tableScale,
      col2: base.col2 * tableScale,
      rowH: base.rowH * tableScale,
      txtX: base.txtX * tableScale,
      txtY: base.txtY * tableScale,
      txtH: base.txtH * tableScale
    };
  }

  function requiredWrappedCellHeight(value, w, st) {
    const lines = wrapTextForWidth(value, w, st.txtH, st.txtX, 0.72).filter(Boolean);
    const lineCount = Math.max(1, lines.length);
    return Math.max(st.rowH, 2 * st.txtY + st.txtH + Math.max(0, lineCount - 1) * st.txtH * 1.18);
  }

  function upperTableValueWrapInfo(raw) {
    const d = raw && raw.positions ? raw : normalizeInput(raw || SAMPLE_INPUT);
    const base = upperTableStyle(d);
    const scaled = upperTableScaledStyle(d);
    // Form tarafında sanal değer sütunu 2130 kabul edilir. DXF tarafında tablo
    // büyüse/küçülse bile yazı ve sütun aynı oranda ölçeklendiği için karakter
    // kırılımı baz ölçüden hesaplanır.
    const virtualMaxW = 2130;
    const usable = Math.max(base.txtH, virtualMaxW - 2 * base.txtX);
    const maxChars = Math.max(1, Math.floor(usable / (base.txtH * 0.72)));
    return {
      maxChars,
      virtualMaxW,
      col2: scaled.col2,
      baseCol2: base.col2,
      txtH: scaled.txtH,
      baseTxtH: base.txtH,
      txtX: scaled.txtX,
      baseTxtX: base.txtX,
      tableScale: scaled.tableScale
    };
  }

  function wrapTextForUpperInput(value, raw) {
    const info = upperTableValueWrapInfo(raw);
    const rawText = String(value ?? '').replace(/\r\n/g, ' ').replace(/\r/g, ' ').replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
    if (!rawText) return '';
    const out = [];
    rawText.split(' ').filter(Boolean).forEach(word => {
      const last = out[out.length - 1] || '';
      if (!last) out.push(word);
      else if ((last + ' ' + word).length <= info.maxChars) out[out.length - 1] = last + ' ' + word;
      else out.push(word);
    });
    return out.join('\n');
  }

  function drawUpperOptionsTable(g, d) {
    const frame = ensureFrame(d);
    const st = upperTableStyle(d);
    let tableX = frame.x + 50;
    let tableY = frame.y - 50;

    const scaledSt = upperTableScaledStyle(d);
    let col1 = scaledSt.col1;
    let col2 = scaledSt.col2;

    const rows = [
      ['STRUCTURE COLOR', d.structureColor],
      ['FABRIC', d.fabric],
      ['FABRIC PROFILES COLOR', d.fabricProfiles],
      ['MOTOR', d.motor],
      ['REMOTE', d.remote],
      ['LED', d.led],
      ['DIMMER', d.dimmer],
      ['EXTRAS', d.extras]
    ];

    let rowHeights = rows.map(row => {
      const labLines = wrapTextForWidth(row[0], col1, scaledSt.txtH, scaledSt.txtX);
      const valLines = wrapTextForWidth(row[1], col2, scaledSt.txtH, scaledSt.txtX);
      const lineCount = Math.max(labLines.length, valLines.length);
      const need = 2 * scaledSt.txtY + (lineCount - 1) * scaledSt.txtH * 1.25 + scaledSt.txtH;
      return Math.max(scaledSt.rowH, need);
    });
    let tableH = rowHeights.reduce((a, b) => a + b, 0);
    const triLimitY = triangleTableLimitY(d);
    const sideLimitY = sideViewTopLimitY(d);
    const limitCandidates = [triLimitY, sideLimitY].filter(v => v !== null && Number.isFinite(v));
    const tableLimitY = limitCandidates.length ? Math.max(...limitCandidates) : null;
    if (tableLimitY !== null) {
      const allowedH = tableY - tableLimitY;
      if (allowedH > scaledSt.txtH && tableH > allowedH) {
        // PERI01 tablo sıkıştırma mantığı: tablo, sol yan görünüşün üst sınırına yaklaşırsa
        // satır yükseklikleri küçültülür. 0.22 altına inmiyoruz; okunurluk çok bozulursa
        // çerçeve büyütme sonraki revizyonda yapılır.
        const k = Math.max(0.55, allowedH / tableH);
        rowHeights = rowHeights.map(h => h * k);
        tableH = rowHeights.reduce((a, b) => a + b, 0);
      }
    }
    const tableW = col1 + col2;

    g.rect(tableX, tableY, tableW, -tableH, 'TABLE');
    g.line(tableX + col1, tableY, tableX + col1, tableY - tableH, 'TABLE');
    let y = tableY;
    for (let i = 0; i < rowHeights.length - 1; i += 1) {
      y -= rowHeights[i];
      g.line(tableX, y, tableX + tableW, y, 'TABLE');
    }
    y = tableY;
    rows.forEach((row, i) => {
      drawCellLines(g, tableX, y, col1, rowHeights[i], scaledSt.txtH, scaledSt.txtX, row[0]);
      drawCellLines(g, tableX + col1, y, col2, rowHeights[i], scaledSt.txtH, scaledSt.txtX, row[1]);
      y -= rowHeights[i];
    });
  }

  function drawBottomTitleTable(g, d) {
    const frame = ensureFrame(d);
    const st = bottomTableStyle(d, frame);
    const x = frame.x;
    const y = frame.bottomY;
    const [c1, c2, c3, c4, c5, c6] = st.cols;
    const ax1 = x + c1, ax2 = ax1 + c2, ax3 = ax2 + c3, ax4 = ax3 + c4, ax5 = ax4 + c5;
    const row1Cells = [
      ['CUSTOMER', c1], [d.customer, c2], ['VERSION', c3], [d.version, c4], ['DATE', c5], [d.date, c6]
    ];
    const row2Cells = [
      ['PROJECT', c1], [d.project, c2], ['DRAWN BY', c3], [d.drawnBy, c4]
    ];
    const cellH = (val, w) => requiredWrappedCellHeight(val, w, st);
    const row1H = Math.max(st.rowH, ...row1Cells.map(c => cellH(c[0], c[1])));
    const row2H = Math.max(st.rowH, ...row2Cells.map(c => cellH(c[0], c[1])));
    const totalH = row1H + row2H;

    g.rect(x, y, frame.w, -totalH, 'TITLE');
    [ax1, ax2, ax3, ax4, ax5].forEach(ax => g.line(ax, y, ax, y - totalH, 'TITLE'));
    g.line(x, y - row1H, x + frame.w, y - row1H, 'TITLE');

    const drawSingle = (x0, yTop, w, hRow, value) => {
      drawCellLines(g, x0, yTop, w, hRow, st.txtH, st.txtX, value, 'TEXT', 'upper');
    };
    drawSingle(x, y, c1, row1H, 'CUSTOMER');
    drawSingle(ax1, y, c2, row1H, d.customer);
    drawSingle(ax2, y, c3, row1H, 'VERSION');
    drawSingle(ax3, y, c4, row1H, d.version);
    drawSingle(ax4, y, c5, row1H, 'DATE');
    drawSingle(ax5, y, c6, row1H, d.date);

    const y2 = y - row1H;
    drawSingle(x, y2, c1, row2H, 'PROJECT');
    drawSingle(ax1, y2, c2, row2H, d.project);
    drawSingle(ax2, y2, c3, row2H, 'DRAWN BY');
    drawSingle(ax3, y2, c4, row2H, d.drawnBy);
  }

  function drawFrame(g, d) {
    const f = ensureFrame(d);
    g.rect(f.x, f.y, f.w, -f.h, 'OUTLINE');
  }

  function buildSmartMetadata(entities, d) {
    const dimensions = [];
    const zones = {};
    (entities || []).forEach(e => {
      if (!e || e.type !== 'dimension' || !e.edit) return;
      const edit = e.edit;
      dimensions.push({ ...edit });
      const zoneId = edit.relatedZoneId || edit.zoneId;
      if (zoneId && !zones[zoneId]) {
        zones[zoneId] = {
          id: zoneId,
          view: edit.view || '',
          dimensionId: edit.dimId,
          distance: Number(edit.measuredValue || e.measuredValue || 0),
          editable: edit.editable !== false,
          canAddProfile: !!(edit.canAddSameProfile || edit.canAddDifferentProfile),
          canPlaceProduct: !!edit.canPlaceProduct,
          allowedProfiles: edit.canAddSameProfile ? ['same_post', 'custom_profile'] : (edit.canAddDifferentProfile ? ['custom_profile'] : []),
          allowedProducts: edit.canPlaceProduct ? ['sliding_glass', 'guillotine_glass'] : [],
          placedProduct: null
        };
      }
    });
    return {
      dimensions,
      zones: Object.values(zones),
      profileInstances: [
        { id: 'side_register_reference', profileTypeId: 'side_register_100', relatedViews: ['side', 'top', 'front'], orientation: { side: 'A_visible', top: 'B_visible', front: 'A_visible' } }
      ]
    };
  }

  function applyByBlockPresentation(entities) {
    (entities || []).forEach(e => {
      if (!e) return;
      if (e.type === 'text' || e.type === 'mtext') {
        // Normal yazılar ve açı yazısı BYBLOCK. Ölçü entity grafiklerine dokunulmaz.
        e.color = 0;
        delete e.trueColor;
        delete e.rgb;
        delete e.hexColor;
        return;
      }
      if ((e.type === 'line' || e.type === 'polyline' || e.type === 'circle') && ['OUTLINE', 'TABLE', 'TITLE'].includes(e.layer)) {
        e.color = 0;
        delete e.trueColor;
        delete e.rgb;
        delete e.hexColor;
      }
    });
    return entities;
  }

  function byBlockBlockLibrary(blocks) {
    const out = {};
    Object.entries(blocks || {}).forEach(([name, block]) => {
      out[name] = {
        ...block,
        entities: (block.entities || []).map(e => {
          const next = { ...e };
          if (next.type === 'text' || next.type === 'mtext') {
            next.color = 0;
            delete next.trueColor;
            delete next.rgb;
            delete next.hexColor;
          }
          return next;
        })
      };
    });
    return out;
  }

  function buildDrawing(raw) {
    const d = normalizeInput(raw);
    const g = makeEntitySink();
    ensureFrame(d);
    drawTopView(g, d);
    drawFrontView(g, d);
    drawSideView(g, d);
    adjustFrameToContent(d, g.entities);
    drawFrame(g, d);
    drawUpperOptionsTable(g, d);
    drawBottomTitleTable(g, d);
    applyByBlockPresentation(g.entities);
    const smart = buildSmartMetadata(g.entities, d);
    const blocks = byBlockBlockLibrary({ ...getBlocks(), ...customHatchBlocks(), ...slidingBlocksFor(d), ...guillotineBlocksFor(d) });
    return { input: d, entities: g.entities, layers: Object.keys(LAYER_STYLE), layerStyle: LAYER_STYLE, blocks, smartDimensions: smart.dimensions, zones: smart.zones, profileInstances: smart.profileInstances, dimensionEditRules: DIMENSION_EDIT_RULES, dimensionActions: DIMENSION_ACTIONS, profileLibrary: PROFILE_LIBRARY, productLibrary: PRODUCT_LIBRARY };
  }

  function entityBounds(e, blockLib) {
    const blocks = blockLib || getBlocks();
    if (e.type === 'line') return [Math.min(e.x1, e.x2), Math.min(e.y1, e.y2), Math.max(e.x1, e.x2), Math.max(e.y1, e.y2)];
    if (e.type === 'text') return [e.x, e.y, e.x + String(e.value || '').length * e.height * 0.55, e.y + e.height];
    if (e.type === 'mtext') {
      const lines = String(e.value || '').split('\\P');
      const width = Number(e.width || 0);
      const height = (Number(e.height) || 0) * Math.max(1, lines.length) * 1.2;
      return [e.x, e.y - height, e.x + width, e.y];
    }
    if (e.type === 'polyline') { const xs = e.points.map(p => p[0]), ys = e.points.map(p => p[1]); return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)]; }
    if (e.type === 'circle') return [e.x - e.r, e.y - e.r, e.x + e.r, e.y + e.r];
    if (e.type === 'insert') { const block = blocks[e.name]; if (block) return transformBlockBounds(block, e); const w = Math.abs(e.previewW || 120), h = Math.abs(e.previewH || 80); return [e.x - w / 2, e.y - h / 2, e.x + w / 2, e.y + h / 2]; }
    if (e.type === 'dimension') { const gs = (e.graphics || []).map(ge => entityBounds(ge, blocks)); if (gs.length) return [Math.min(...gs.map(b => b[0])), Math.min(...gs.map(b => b[1])), Math.max(...gs.map(b => b[2])), Math.max(...gs.map(b => b[3]))]; }
    return [0, 0, 0, 0];
  }
  function bounds(entities, blockLib) { const b = entities.map(e => entityBounds(e, blockLib)); const minX = Math.min(...b.map(x => x[0])), minY = Math.min(...b.map(x => x[1])), maxX = Math.max(...b.map(x => x[2])), maxY = Math.max(...b.map(x => x[3])); return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY }; }
  function escXml(s) { return String(s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch])); }

  const ACI_HEX = {
    1: '#ff0000',
    2: '#ffff00',
    3: '#00ff00',
    4: '#00ffff',
    5: '#0000ff',
    6: '#ff00ff',
    7: '#000000',
    8: '#808080',
    9: '#c0c0c0',
    10: '#ff0000',
    42: '#ffbf00',
    130: '#00bf00',
    167: '#293189',
    256: null
  };

  function aciColorToHex(color, fallback = '#000000') {
    const n = Number(color);
    if (!Number.isFinite(n) || n === 256 || n === 0) return fallback;
    return ACI_HEX[n] || fallback;
  }

  function entityTrueColorHex(e) {
    if (!e) return null;
    if (typeof e.hexColor === 'string' && /^#?[0-9a-f]{6}$/i.test(e.hexColor)) return e.hexColor.startsWith('#') ? e.hexColor : `#${e.hexColor}`;
    const tc = Number(e.trueColor);
    if (Number.isFinite(tc) && tc >= 0) return `#${(tc & 0xFFFFFF).toString(16).padStart(6, '0')}`;
    if (Array.isArray(e.rgb) && e.rgb.length >= 3) return `#${e.rgb.slice(0,3).map(v => Math.max(0, Math.min(255, Number(v)||0)).toString(16).padStart(2,'0')).join('')}`;
    return null;
  }

  function entityStroke(e, st) {
    const trueHex = entityTrueColorHex(e);
    if (trueHex) return trueHex;
    return aciColorToHex(e && e.color, (st && st.stroke) || '#000000');
  }

  function previewStrokeWidth(value, minimum = 0.55) {
    return Math.max(minimum, (Number(value) || 1) * 0.85);
  }

  function svgPointString(points, isClosed, sx, sy) {
    const pts = Array.isArray(points) ? points.slice() : [];
    if (isClosed && pts.length > 2) {
      const first = pts[0];
      const last = pts[pts.length - 1];
      if (!last || first[0] !== last[0] || first[1] !== last[1]) pts.push(first);
    }
    return pts.map(p => `${sx(p[0])},${sy(p[1])}`).join(' ');
  }

  function previewMTextLines(e) {
    const explicit = String(e.value || '').split('\\P');
    const width = Math.max(1, Number(e.width) || 1000);
    const height = Math.max(1, Number(e.height) || 80);
    const maxChars = Math.max(1, Math.floor(width / (height * 0.62)));
    const result = [];
    explicit.forEach(part => {
      const words = String(part).split(/\s+/).filter(Boolean);
      if (!words.length) { result.push(''); return; }
      let line = '';
      words.forEach(word => {
        const candidate = line ? `${line} ${word}` : word;
        if (candidate.length <= maxChars || !line) line = candidate;
        else { result.push(line); line = word; }
      });
      result.push(line);
    });
    return result.length ? result : [''];
  }


  // V8.4.5: Önizleme/PDF taramaları DXF HATCH ile aynı model-uzayı ölçeğinde üretilir.
  // Önceki 1000x1000 blok yaklaşımı bölgeye non-uniform ölçeklendiği için tuğla ve kumaş
  // desenleri sınır dikdörtgeninin en/boy oranına göre esniyor, DXF ile uyuşmuyordu.
  function legacyHatchInfo(entity) {
    if (!entity || entity.type !== 'insert') return null;
    const name = String(entity.name || '');
    const isWall = name === 'PULUMUR WALL BRICK SAFE HATCH';
    const isFabric = name === 'PULUMUR TRAPEZ SAFE HATCH';
    if (!isWall && !isFabric) return null;
    const sxv = Math.abs(Number(entity.scaleX) || 1);
    const syv = Number(entity.scaleY) || 1;
    const x1 = Number(entity.x) || 0;
    const y1 = Number(entity.y) || 0;
    const x2 = x1 + (entity.mirrorX ? -1 : 1) * 1000 * sxv;
    const y2 = y1 + 1000 * syv;
    return {
      kind: isWall ? 'brick' : 'fabric',
      minX: Math.min(x1, x2), maxX: Math.max(x1, x2),
      minY: Math.min(y1, y2), maxY: Math.max(y1, y2)
    };
  }

  function hatchSegmentsForRect(info) {
    if (!info) return [];
    const minX = Number(info.minX) || 0;
    const maxX = Number(info.maxX) || 0;
    const minY = Number(info.minY) || 0;
    const maxY = Number(info.maxY) || 0;
    if (!(maxX > minX) || !(maxY > minY)) return [];
    const segments = [];
    const eps = 1e-7;
    if (info.kind === 'fabric') {
      const repeat = 150;
      const pairOffset = 42;
      const startN = Math.floor((minX - pairOffset) / repeat) - 1;
      const endN = Math.ceil(maxX / repeat) + 1;
      for (let n = startN; n <= endN; n += 1) {
        const xa = n * repeat;
        const xb = xa + pairOffset;
        if (xa >= minX - eps && xa <= maxX + eps) segments.push({ x1: xa, y1: minY, x2: xa, y2: maxY });
        if (xb >= minX - eps && xb <= maxX + eps) segments.push({ x1: xb, y1: minY, x2: xb, y2: maxY });
      }
      return segments;
    }

    const course = 190.5;
    const brickWidth = 381;
    const firstCourse = Math.ceil((minY - eps) / course);
    const lastCourse = Math.floor((maxY + eps) / course);
    for (let n = firstCourse; n <= lastCourse; n += 1) {
      const y = n * course;
      if (y > minY + eps && y < maxY - eps) segments.push({ x1: minX, y1: y, x2: maxX, y2: y });
    }
    const firstRow = Math.floor(minY / course);
    const lastRow = Math.ceil(maxY / course) - 1;
    for (let row = firstRow; row <= lastRow; row += 1) {
      const y1 = Math.max(minY, row * course);
      const y2 = Math.min(maxY, (row + 1) * course);
      if (!(y2 > y1 + eps)) continue;
      const parity = ((row % 2) + 2) % 2;
      const offset = parity ? course : 0;
      let x = Math.ceil((minX - offset - eps) / brickWidth) * brickWidth + offset;
      for (; x <= maxX + eps; x += brickWidth) {
        if (x > minX + eps && x < maxX - eps) segments.push({ x1: x, y1, x2: x, y2 });
      }
    }
    return segments;
  }

  function renderSvg(drawing) {
    const ents = drawing.entities;
    const blockLib = drawing.blocks || { ...getBlocks(), ...customHatchBlocks() };
    const b = bounds(ents, blockLib);
    const pad = 450;
    const minX = b.minX - pad;
    const maxY = b.maxY + pad;
    const viewW = b.width + pad * 2;
    const viewH = b.height + pad * 2;
    const sx = x => x - minX;
    const sy = y => maxY - y;
    const parts = [];
    let hatchSeq = 0;
    parts.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewW} ${viewH}" preserveAspectRatio="xMidYMid meet">`);
    parts.push('<rect x="0" y="0" width="100%" height="100%" fill="white"/>');
    for (const e of ents) {
      const st = drawing.layerStyle[e.layer] || drawing.layerStyle.OUTLINE;
      const stroke = entityStroke(e, st);
      const sw = previewStrokeWidth(st.width);
      const dash = st.dash ? ` stroke-dasharray="${st.dash}"` : '';
      const hatchInfo = legacyHatchInfo(e);
      if (hatchInfo) {
        const clipId = `pulumur-hatch-${hatchSeq++}`;
        const rx = sx(hatchInfo.minX);
        const ry = sy(hatchInfo.maxY);
        const rw = Math.max(0, hatchInfo.maxX - hatchInfo.minX);
        const rh = Math.max(0, hatchInfo.maxY - hatchInfo.minY);
        const hatchSw = hatchInfo.kind === 'brick' ? 0.52 : 0.58;
        parts.push(`<defs><clipPath id="${clipId}"><rect x="${rx}" y="${ry}" width="${rw}" height="${rh}"/></clipPath></defs>`);
        const hatchLines = hatchSegmentsForRect(hatchInfo).map(seg => `<line x1="${sx(seg.x1)}" y1="${sy(seg.y1)}" x2="${sx(seg.x2)}" y2="${sy(seg.y2)}" vector-effect="non-scaling-stroke"/>`).join('');
        parts.push(`<g clip-path="url(#${clipId})" stroke="${stroke}" stroke-width="${hatchSw}" fill="none">${hatchLines}</g>`);
        continue;
      }
      if (e.type === 'line') parts.push(`<line x1="${sx(e.x1)}" y1="${sy(e.y1)}" x2="${sx(e.x2)}" y2="${sy(e.y2)}" stroke="${stroke}" stroke-width="${sw}"${dash} fill="none"/>`);
      else if (e.type === 'polyline') {
        const points = svgPointString(e.points, e.closed, sx, sy);
        parts.push(`<polyline points="${points}" stroke="${stroke}" stroke-width="${sw}"${dash} fill="none"/>`);
      } else if (e.type === 'text') {
        const anchor = e.align === 'center' ? 'middle' : (e.align === 'right' ? 'end' : 'start');
        const rot = e.rotation ? ` transform="rotate(${-e.rotation} ${sx(e.x)} ${sy(e.y)})"` : '';
        const dimType = e.dimensionFilterType ? String(e.dimensionFilterType) : '';
        const cls = dimType ? 'dxf-text preview-dimension-plain' : 'dxf-text';
        const dimAttr = dimType ? ` data-dimension-type="${escXml(dimType)}"` : '';
        parts.push(`<text class="${cls}"${dimAttr} x="${sx(e.x)}" y="${sy(e.y)}" font-size="${e.height}" text-anchor="${anchor}" fill="${stroke}"${rot}>${escXml(e.value)}</text>`);
      } else if (e.type === 'mtext') {
        const lines = previewMTextLines(e);
        const anchor = e.align === 'center' ? 'middle' : (e.align === 'right' ? 'end' : 'start');
        const rot = e.rotation ? ` transform="rotate(${-e.rotation} ${sx(e.x)} ${sy(e.y)})"` : '';
        const tspans = lines.map((ln, ii) => `<tspan x="${sx(e.x)}" dy="${ii===0?0:e.height*(e.lineSpacing||1.15)}">${escXml(ln)}</tspan>`).join('');
        parts.push(`<text class="dxf-text" x="${sx(e.x)}" y="${sy(e.y)}" font-size="${e.height}" text-anchor="${anchor}" fill="${stroke}"${rot}>${tspans}</text>`);
      } else if (e.type === 'circle') parts.push(`<circle cx="${sx(e.x)}" cy="${sy(e.y)}" r="${Math.abs(e.r)}" stroke="${stroke}" stroke-width="${sw}"${dash} fill="none"/>`);
      else if (e.type === 'interaction') {
        const data = e.data || {};
        const attrs = [
          ['class', 'preview-interaction-hit'],
          ['data-interaction-type', e.kind || ''],
          ['data-post-index', data.postIndex ?? ''],
          ['data-current-post-count', data.postCount ?? ''],
          ['data-total-ray-count', data.totalRayCount ?? ''],
          ['data-placement-mode', data.placementMode || 'standard'],
          ['data-profile-mode', data.profileMode || ''],
          ['data-profile-part', data.part || ''],
          ['data-profile-scope', data.scope || ''],
          ['data-en', data.en ?? ''],
          ['data-boy', data.boy ?? ''],
          ['data-et', data.et ?? '']
        ].map(([k,v]) => `${k}="${escXml(v)}"`).join(' ');
        const rx = sx(e.x), ry = sy(e.y + e.h), rw = Math.abs(e.w), rh = Math.abs(e.h);
        const isGlass = (e.kind || '') === 'glassTrackEditor';
        const isSupport = isGlass && (data.part || '') === 'support';
        const postTag = Number.isFinite(Number(data.postIndex)) ? `D${Number(data.postIndex) + 1}` : 'D';
        const tag = isGlass ? (isSupport ? ((data.scope || '').toLowerCase() === 'right' ? 'SD-R' : 'SD-L') : 'CK') : postTag;
        const groupClass = isGlass ? 'preview-glass-zone' : 'preview-post-zone';
        const titleText = isGlass ? (isSupport ? `Destek dikmesi profili düzenle ${(data.scope || '').toLowerCase() === 'right' ? '(sağ)' : '(sol)'}` : 'Cam kaydı profili düzenle') : `Dikme düzenle ${postTag}`;
        parts.push(`<g class="${groupClass}"><rect ${attrs} x="${rx}" y="${ry}" width="${rw}" height="${rh}" fill="transparent" stroke="transparent" stroke-width="1.2" stroke-dasharray="6 4" pointer-events="all" rx="6" ry="6"><title>${escXml(titleText)}</title></rect><text x="${rx + rw / 2}" y="${Math.max(14, ry - 6)}" text-anchor="middle" font-size="12" font-weight="700" fill="${isGlass ? '#0b8043' : '#1a73e8'}">${tag}</text></g>`);
      }
      else if (e.type === 'dimension') {
        const edit = e.edit || null;
        const filterType = String(e.dimensionFilterType || (edit && edit.dimensionType) || '').toLowerCase();
        const plainGroup = !edit && !!filterType;
        if (edit) {
          const attrs = [
            ['class', 'editable-dimension'],
            ['data-dim-id', edit.dimId || ''],
            ['data-edit-field', edit.field || ''],
            ['data-edit-index', edit.index ?? 0],
            ['data-edit-label', edit.label || ''],
            ['data-edit-value', edit.measuredValue ?? e.measuredValue ?? ''],
            ['data-view', edit.view || ''],
            ['data-zone-id', edit.relatedZoneId || edit.zoneId || ''],
            ['data-editable', edit.editable === false ? 'false' : 'true'],
            ['data-dimension-type', edit.dimensionType || 'main'],
            ['data-action-type', edit.actionType || 'main_resize'],
            ['data-can-resize', edit.canResize ? 'true' : 'false'],
            ['data-can-add-same-profile', edit.canAddSameProfile ? 'true' : 'false'],
            ['data-can-add-different-profile', edit.canAddDifferentProfile ? 'true' : 'false'],
            ['data-can-place-product', edit.canPlaceProduct ? 'true' : 'false'],
            ['data-can-remove-element', edit.canRemoveElement ? 'true' : 'false'],
            ['data-passive-reason', edit.passiveReason || ''],
            ['data-profile-instance-id', edit.profileInstanceId || ''],
            ['data-layer', e.layer || 'DIM']
          ].map(([k,v]) => `${k}="${escXml(v)}"`).join(' ');
          parts.push(`<g ${attrs}>`);
        } else if (plainGroup) {
          parts.push(`<g class="preview-dimension-plain" data-dimension-type="${escXml(filterType)}">`);
        }
        (e.graphics || []).forEach(ge => {
          const gst = drawing.layerStyle[ge.layer] || drawing.layerStyle.DIM;
          const gstroke = entityStroke(ge, gst);
          const gsw = previewStrokeWidth(gst.width || sw, 0.24);
          if (ge.type === 'line') parts.push(`<line x1="${sx(ge.x1)}" y1="${sy(ge.y1)}" x2="${sx(ge.x2)}" y2="${sy(ge.y2)}" stroke="${gstroke}" stroke-width="${gsw}" fill="none"/>`);
          else if (ge.type === 'polyline') {
            const points = svgPointString(ge.points, ge.closed, sx, sy);
            parts.push(`<polyline points="${points}" stroke="${gstroke}" stroke-width="${gsw}" fill="none"/>`);
          } else if (ge.type === 'text') {
            const anchor = ge.align === 'center' ? 'middle' : (ge.align === 'right' ? 'end' : 'start');
            const rot = ge.rotation ? ` transform="rotate(${-ge.rotation} ${sx(ge.x)} ${sy(ge.y)})"` : '';
            parts.push(`<text class="dxf-text" x="${sx(ge.x)}" y="${sy(ge.y)}" font-size="${ge.height}" text-anchor="${anchor}" fill="${gstroke}"${rot}>${escXml(ge.value)}</text>`);
          }
        });
        if (edit) {
          const eb = entityBounds(e, blockLib);
          const hitPad = 90;
          const hx = sx(eb[0]) - hitPad, hy = sy(eb[3]) - hitPad;
          const hw = Math.max(40, Math.abs(eb[2] - eb[0]) + hitPad * 2);
          const hh = Math.max(40, Math.abs(eb[3] - eb[1]) + hitPad * 2);
          parts.push(`<rect class="editable-dimension-hit" x="${hx}" y="${hy}" width="${hw}" height="${hh}" fill="transparent" stroke="none" pointer-events="all"><title>${escXml(edit.editable === false ? (edit.passiveReason || 'Bilgi amaçlı ölçü') : ((edit.label || 'Ölçü') + ' değiştir'))}</title></rect></g>`);
        } else if (plainGroup) {
          parts.push('</g>');
        }
      } else if (e.type === 'insert') {
        const block = blockLib[e.name];
        if (block) {
          const group = [];
          (block.entities || []).forEach(be => {
            const insertStyle = drawing.layerStyle[e.layer] || drawing.layerStyle.BLOCKREF;
            const ownStyle = drawing.layerStyle[be.layer] || insertStyle;
            const byBlock = Number(be.color) === 0;
            const bst = byBlock ? insertStyle : ownStyle;
            const inheritedStroke = entityStroke(e, insertStyle);
            const bstroke = byBlock ? inheritedStroke : entityStroke(be, ownStyle);
            const bsw = previewStrokeWidth(bst.width || 2, 0.24);
            if (be.type === 'line') {
              const p1 = transformLocalPoint(be.x1, be.y1, e), p2 = transformLocalPoint(be.x2, be.y2, e);
              group.push(`<line x1="${sx(p1[0])}" y1="${sy(p1[1])}" x2="${sx(p2[0])}" y2="${sy(p2[1])}" stroke="${bstroke}" stroke-width="${bsw}" fill="none"/>`);
            } else if (be.type === 'polyline') {
              const points = svgPointString((be.points || []).map(p => transformLocalPoint(p[0], p[1], e)), be.closed, sx, sy);
              group.push(`<polyline points="${points}" stroke="${bstroke}" stroke-width="${bsw}" fill="none"/>`);
            } else if (be.type === 'circle') {
              const p = transformLocalPoint(be.x, be.y, e);
              const rr = Math.abs(be.r * ((Number(e.scaleX || 1) + Number(e.scaleY || 1)) / 2));
              group.push(`<circle cx="${sx(p[0])}" cy="${sy(p[1])}" r="${rr}" stroke="${bstroke}" stroke-width="${bsw}" fill="none"/>`);
            } else if (be.type === 'text' || be.type === 'mtext') {
              const p = transformLocalPoint(be.x || 0, be.y || 0, e);
              const anchor = be.align === 'center' ? 'middle' : (be.align === 'right' ? 'end' : 'start');
              const rotDeg = Number(be.rotation || 0) + Number(e.rotation || 0);
              const rot = rotDeg ? ` transform="rotate(${-rotDeg} ${sx(p[0])} ${sy(p[1])})"` : '';
              const scaleAvg = ((Math.abs(Number(e.scaleX || 1)) + Math.abs(Number(e.scaleY || 1))) / 2);
              const h = Math.abs((Number(be.height) || 24) * scaleAvg);
              const lines = be.type === 'mtext' ? previewMTextLines(be) : [String(be.value || '')];
              const tspans = lines.map((ln, ii) => `<tspan x="${sx(p[0])}" dy="${ii===0?0:h*(be.lineSpacing||1.15)}">${escXml(ln)}</tspan>`).join('');
              group.push(`<text class="dxf-text" x="${sx(p[0])}" y="${sy(p[1])}" font-size="${h}" text-anchor="${anchor}" fill="${bstroke}"${rot}>${tspans}</text>`);
            }
          });
          parts.push(`<g data-block="${escXml(e.name)}">${group.join('')}</g>`);
        } else {
          const w = Math.abs(e.previewW || 120), h = Math.abs(e.previewH || 80), cx = sx(e.x), cy = sy(e.y);
          const rot = e.rotation ? ` transform="rotate(${-e.rotation} ${cx} ${cy})"` : '';
          parts.push(`<g${rot}><rect x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}" stroke="${stroke}" stroke-width="${sw}"${dash} fill="none"/></g>`);
        }
      }
    }
    parts.push('</svg>');
    return parts.join('\n');
  }


  function flattenDrawingForExport(drawing) {
    const blockLib = drawing.blocks || { ...getBlocks(), ...customHatchBlocks() };
    const out = [];
    const push = e => out.push(e);
    const expand = (e, inheritedLayer) => {
      if (!e) return;
      const layer = e.layer || inheritedLayer || 'OUTLINE';
      if (e.type === 'dimension') {
        (e.graphics || []).forEach(ge => expand(ge, layer));
        return;
      }
      if (e.type === 'insert') {
        const hatchInfo = legacyHatchInfo(e);
        if (hatchInfo) {
          hatchSegmentsForRect(hatchInfo).forEach(seg => push({ type: 'line', layer, color: e.color, x1: seg.x1, y1: seg.y1, x2: seg.x2, y2: seg.y2 }));
          return;
        }
        const block = blockLib[e.name];
        if (!block) {
          const w = Math.abs(e.previewW || 120), h = Math.abs(e.previewH || 80);
          push({ type: 'polyline', layer, closed: true, points: [[e.x - w / 2, e.y - h / 2], [e.x + w / 2, e.y - h / 2], [e.x + w / 2, e.y + h / 2], [e.x - w / 2, e.y + h / 2]] });
          return;
        }
        (block.entities || []).forEach(be => {
          const beLayer = layer || be.layer || 'BLOCKREF';
          if (be.type === 'line') {
            const p1 = transformLocalPoint(be.x1, be.y1, e), p2 = transformLocalPoint(be.x2, be.y2, e);
            push({ type: 'line', layer: beLayer, color: be.color, x1: p1[0], y1: p1[1], x2: p2[0], y2: p2[1] });
          } else if (be.type === 'polyline') {
            const pts = (be.points || []).map(p => transformLocalPoint(p[0], p[1], e));
            push({ type: 'polyline', layer: beLayer, color: be.color, closed: !!be.closed, points: pts });
          } else if (be.type === 'circle') {
            const p = transformLocalPoint(be.x, be.y, e);
            const rr = Math.abs(be.r * ((Number(e.scaleX || 1) + Number(e.scaleY || 1)) / 2));
            push({ type: 'circle', layer: beLayer, color: be.color, x: p[0], y: p[1], r: rr });
          } else if (be.type === 'text' || be.type === 'mtext') {
            const p = transformLocalPoint(be.x || 0, be.y || 0, e);
            push({ ...be, layer: beLayer, color: be.color, x: p[0], y: p[1], height: Math.abs((Number(be.height) || 100) * ((Number(e.scaleX || 1) + Math.abs(Number(e.scaleY || 1))) / 2)), rotation: (Number(be.rotation || 0) + Number(e.rotation || 0)) });
          }
        });
        return;
      }
      if (e.type === 'line') push({ type: 'line', layer, color: e.color, x1: e.x1, y1: e.y1, x2: e.x2, y2: e.y2 });
      else if (e.type === 'polyline') push({ type: 'polyline', layer, color: e.color, closed: !!e.closed, points: (e.points || []).map(p => [p[0], p[1]]) });
      else if (e.type === 'circle') push({ type: 'circle', layer, color: e.color, x: e.x, y: e.y, r: e.r });
      else if (e.type === 'text' || e.type === 'mtext') push({ ...e, layer });
    };
    (drawing.entities || []).forEach(e => expand(e));
    return { entities: out, bounds: bounds(out), layerStyle: drawing.layerStyle || LAYER_STYLE };
  }

  const api = { SAMPLE_INPUT, LAYER_STYLE, K, BUILD_LABEL, DIMENSION_EDIT_RULES, DIMENSION_ACTIONS, PROFILE_LIBRARY, PRODUCT_LIBRARY, normalizeInput, buildDrawing, renderSvg, flattenDrawingForExport, bounds, formatMm, formatDeg, rayLenFor, sideAngleRadFor, getBlocks, upperTableValueWrapInfo, wrapTextForUpperInput, aciColorToHex };
  root.PulumurGeometry = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
