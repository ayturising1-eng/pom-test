(function (root) {
  'use strict';

  const TEMPLATE = root.PulumurModernDxfTemplate || (typeof require !== 'undefined' ? require('./modernDxfTemplate.js') : '');
  const MODEL_SPACE_RECORD = '17';
  const LAYER_TABLE_HANDLE = '1';
  const BLOCK_RECORD_TABLE_HANDLE = '9';
  const PLOT_STYLE_HANDLE = '13';
  const MATERIAL_HANDLE = '21';

  function pair(code, value) { return `${code}\n${value}`; }
  function append(out, arr) { for (const item of arr) out.push(item); return out; }
  function fixed(value, decimals = 6) {
    const n = Number(value);
    if (!Number.isFinite(n)) return '0';
    return Number(n.toFixed(Math.max(0, decimals))).toString();
  }
  function fixedScale(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return '1';
    return Number(n.toFixed(8)).toString();
  }
  function cleanSingleLine(value) {
    return String(value ?? '')
      .replace(/\r\n/g, ' ')
      .replace(/[\r\n\t]+/g, ' ')
      .replace(/[\u0000-\u001F\u007F]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
  function cleanMText(value) {
    return String(value ?? '')
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
      .replace(/\n/g, '\\P');
  }
  function sanitizeTableName(value, fallback, allowAnonymous = false) {
    const raw = String(value ?? '').trim();
    if (allowAnonymous && /^\*D\d+$/i.test(raw)) return raw.toUpperCase();
    const safe = raw
      .replace(/[<>/\\":;?*|=,]/g, '_')
      .replace(/[\u0000-\u001F\u007F]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    return (safe || fallback).slice(0, 255);
  }
  function modernLayerName(value) { return sanitizeTableName(value, 'LAYER_0', false); }
  function modernBlockName(value) { return sanitizeTableName(value, 'BLOCK', true); }
  function nameHash(value) {
    let hash = 2166136261;
    const text = String(value || '');
    for (let i = 0; i < text.length; i += 1) {
      hash ^= text.charCodeAt(i);
      hash = Math.imul(hash, 16777619) >>> 0;
    }
    return hash.toString(36).toUpperCase();
  }
  function createUniqueNameMap(values, sanitizer) {
    const result = new Map();
    const used = new Map();
    for (const original of values) {
      if (result.has(original)) continue;
      let name = sanitizer(original);
      const key = name.toLocaleUpperCase('tr-TR');
      if (used.has(key) && used.get(key) !== original) {
        const suffix = `_${nameHash(original).slice(-7)}`;
        name = `${name.slice(0, Math.max(1, 255 - suffix.length))}${suffix}`;
      }
      used.set(name.toLocaleUpperCase('tr-TR'), original);
      result.set(original, name);
    }
    return result;
  }
  function hexToTrueColor(value) {
    const match = /^#?([0-9a-f]{6})$/i.exec(String(value || '').trim());
    return match ? parseInt(match[1], 16) : null;
  }
  function rgbToTrueColor(value) {
    if (Number.isFinite(Number(value))) return Number(value);
    if (Array.isArray(value) && value.length >= 3) {
      return ((Number(value[0]) & 255) << 16) | ((Number(value[1]) & 255) << 8) | (Number(value[2]) & 255);
    }
    if (value && typeof value === 'object') {
      const r = Number(value.r ?? value.red);
      const g = Number(value.g ?? value.green);
      const b = Number(value.b ?? value.blue);
      if ([r, g, b].every(Number.isFinite)) return ((r & 255) << 16) | ((g & 255) << 8) | (b & 255);
    }
    return null;
  }
  function aciColor(value, fallback = 7) {
    const n = Number(value);
    return Number.isFinite(n) && n >= 1 && n <= 255 ? Math.round(n) : fallback;
  }
  function entityColorPairs(entity) {
    const trueColor = rgbToTrueColor(entity && (entity.trueColor ?? entity.rgb ?? entity.hexColor));
    if (Number.isFinite(trueColor)) return [pair(420, trueColor)];
    if (entity && Number.isFinite(Number(entity.color))) return [pair(62, aciColor(entity.color))];
    return [];
  }
  function getLayerStyle(drawing, originalName) {
    return (drawing && drawing.layerStyle && drawing.layerStyle[originalName]) || {};
  }
  function layerAci(drawing, originalName) {
    const style = getLayerStyle(drawing, originalName);
    if (Number.isFinite(Number(style.aci))) return aciColor(style.aci);
    if (/ölç|dim/i.test(originalName)) return 42;
    return 7;
  }
  function layerTrueColor(drawing, originalName) {
    const style = getLayerStyle(drawing, originalName);
    return hexToTrueColor(style.stroke);
  }

  function handleAllocator(start = 0x1000) {
    let current = start;
    return () => (current++).toString(16).toUpperCase();
  }

  function dimensionLayer(entity) {
    const type = String((entity && entity.edit && entity.edit.dimensionType) || (entity && entity.dimensionFilterType) || 'main').toLowerCase();
    return type === 'detail' ? 'Ölçüler - Detay' : 'Ölçüler - Ana';
  }
  function prepareDrawing(drawing) {
    const next = { ...(drawing || {}) };
    next.layers = Array.from(new Set([...(drawing.layers || []), 'Ölçüler - Ana', 'Ölçüler - Detay']));
    next.entities = (drawing.entities || []).map(entity => {
      if (!entity) return entity;
      if (entity.type === 'dimension') {
        const layer = dimensionLayer(entity);
        return { ...entity, layer, graphics: (entity.graphics || []).map(ge => ({ ...ge, layer })) };
      }
      if ((entity.type === 'text' || entity.type === 'mtext') && entity.dimensionFilterType) {
        return { ...entity, layer: dimensionLayer(entity) };
      }
      return { ...entity };
    });
    return next;
  }
  function getBlocks(drawing) {
    if (drawing && drawing.blocks) return drawing.blocks;
    if (root.PulumurFilteredBlocks && root.PulumurFilteredBlocks.blocks) return root.PulumurFilteredBlocks.blocks;
    return {};
  }
  function isHeavyDisabledBlockName(name) {
    return ['Duvar Tarama Block', 'Trapez Tarama', 'RISING LOGO'].includes(String(name || ''));
  }
  function mirrorBlockEntityX(entity) {
    if (entity.type === 'line') return { ...entity, x1: -Number(entity.x1 || 0), x2: -Number(entity.x2 || 0) };
    if (entity.type === 'polyline') return { ...entity, points: (entity.points || []).map(p => [-Number(p[0] || 0), Number(p[1] || 0)]).reverse() };
    if (entity.type === 'circle') return { ...entity, x: -Number(entity.x || 0) };
    if (entity.type === 'text' || entity.type === 'mtext') return { ...entity, x: -Number(entity.x || 0) };
    return { ...entity };
  }
  function mirroredBlockFrom(src) {
    return { ...src, entities: (src.entities || []).map(mirrorBlockEntityX) };
  }
  function collectUsedBlocks(drawing, sourceBlocks) {
    const used = new Map();
    for (const e of drawing.entities || []) {
      if (e.type !== 'insert' || !sourceBlocks[e.name] || isHeavyDisabledBlockName(e.name)) continue;
      if (e.mirrorX) used.set(`${e.name}__MIRROR`, mirroredBlockFrom(sourceBlocks[e.name]));
      else used.set(e.name, sourceBlocks[e.name]);
    }
    let index = 1;
    for (const e of drawing.entities || []) {
      if (e.type !== 'dimension') continue;
      const name = e.blockName || `*D${index++}`;
      e.blockName = name;
      used.set(name, { dxfName: name, entities: e.graphics || [], anonymousDimension: true });
    }
    return used;
  }
  function collectLayerNames(drawing, blocks) {
    const names = new Set(['0', 'Defpoints', ...(drawing.layers || []), 'Ölçüler - Ana', 'Ölçüler - Detay']);
    for (const e of drawing.entities || []) if (e && e.layer) names.add(e.layer);
    for (const block of blocks.values()) for (const e of block.entities || []) if (e && e.layer) names.add(e.layer);
    return Array.from(names);
  }

  function commonEntityPrefix(type, handle, owner, layerName, entity) {
    return [pair(0, type), pair(5, handle), pair(330, owner), pair(100, 'AcDbEntity'), pair(8, layerName), ...entityColorPairs(entity)];
  }
  function lineEntity(e, ctx) {
    return [...commonEntityPrefix('LINE', ctx.nextHandle(), ctx.owner, ctx.layerName(e.layer), e), pair(100, 'AcDbLine'), pair(10, fixed(e.x1)), pair(20, fixed(e.y1)), pair(30, 0), pair(11, fixed(e.x2)), pair(21, fixed(e.y2)), pair(31, 0)];
  }
  function circleEntity(e, ctx) {
    return [...commonEntityPrefix('CIRCLE', ctx.nextHandle(), ctx.owner, ctx.layerName(e.layer), e), pair(100, 'AcDbCircle'), pair(10, fixed(e.x)), pair(20, fixed(e.y)), pair(30, 0), pair(40, fixed(e.r))];
  }
  function polyEntity(e, ctx) {
    const points = e.points || [];
    const out = [...commonEntityPrefix('LWPOLYLINE', ctx.nextHandle(), ctx.owner, ctx.layerName(e.layer), e), pair(100, 'AcDbPolyline'), pair(90, points.length), pair(70, e.closed ? 1 : 0)];
    for (const p of points) out.push(pair(10, fixed(p[0])), pair(20, fixed(p[1])));
    return out;
  }
  function textEntity(e, ctx) {
    const align = e.align === 'center' ? 1 : (e.align === 'right' ? 2 : 0);
    const vertical = align ? 2 : 0;
    const out = [...commonEntityPrefix('TEXT', ctx.nextHandle(), ctx.owner, ctx.layerName(e.layer), e), pair(100, 'AcDbText'), pair(10, fixed(e.x)), pair(20, fixed(e.y)), pair(30, 0), pair(40, fixed(e.height || 80)), pair(1, cleanSingleLine(e.value)), pair(50, fixed(e.rotation || 0)), pair(7, 'Standard')];
    if (align) out.push(pair(72, align), pair(11, fixed(e.x)), pair(21, fixed(e.y)), pair(31, 0));
    out.push(pair(100, 'AcDbText'));
    if (vertical) out.push(pair(73, vertical));
    return out;
  }
  function mtextEntity(e, ctx) {
    const attachment = e.align === 'center' ? 5 : (e.align === 'right' ? 3 : 1);
    const out = [...commonEntityPrefix('MTEXT', ctx.nextHandle(), ctx.owner, ctx.layerName(e.layer), e), pair(100, 'AcDbMText'), pair(10, fixed(e.x)), pair(20, fixed(e.y)), pair(30, 0), pair(40, fixed(e.height || 80)), pair(41, fixed(Math.max(1, Number(e.width) || 1000))), pair(71, attachment), pair(72, 1), pair(1, cleanMText(e.value)), pair(7, 'Standard'), pair(44, fixed(e.lineSpacing || 1.15))];
    if (Number(e.rotation)) out.push(pair(50, fixed(e.rotation)));
    return out;
  }
  function insertEntity(e, ctx, blockKey) {
    const out = [...commonEntityPrefix('INSERT', ctx.nextHandle(), ctx.owner, ctx.layerName(e.layer), e), pair(100, 'AcDbBlockReference'), pair(2, ctx.blockName(blockKey)), pair(10, fixed(e.x)), pair(20, fixed(e.y)), pair(30, 0), pair(41, fixedScale(Math.abs(e.scaleX || 1))), pair(42, fixedScale(e.scaleY || 1)), pair(43, 1)];
    if (Number(e.rotation)) out.push(pair(50, fixed(e.rotation)));
    return out;
  }
  function dimensionEntity(e, ctx) {
    const p1 = e.p1 || { x: 0, y: 0 };
    const p2 = e.p2 || { x: 0, y: 0 };
    const dl = e.dimLine || { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
    const tx = e.text || dl;
    const angle = Math.atan2(Number(p2.y) - Number(p1.y), Number(p2.x) - Number(p1.x)) * 180 / Math.PI;
    return [
      ...commonEntityPrefix('DIMENSION', ctx.nextHandle(), ctx.owner, ctx.layerName(e.layer), e),
      pair(100, 'AcDbDimension'), pair(280, 0), pair(2, ctx.blockName(e.blockName || '*D0')), pair(3, 'MESUT-MM'),
      pair(10, fixed(dl.x)), pair(20, fixed(dl.y)), pair(30, 0),
      pair(11, fixed(tx.x)), pair(21, fixed(tx.y)), pair(31, 0),
      pair(70, 32), pair(71, 5), pair(1, e.textOverride == null ? '<>' : String(e.textOverride)),
      pair(100, 'AcDbAlignedDimension'),
      pair(13, fixed(p1.x)), pair(23, fixed(p1.y)), pair(33, 0),
      pair(14, fixed(p2.x)), pair(24, fixed(p2.y)), pair(34, 0), pair(50, fixed(angle)),
      pair(100, 'AcDbRotatedDimension')
    ];
  }
  function entityOut(e, ctx, sourceBlocks) {
    if (!e) return [];
    if (e.type === 'line') return lineEntity(e, ctx);
    if (e.type === 'polyline') return polyEntity(e, ctx);
    if (e.type === 'circle') return circleEntity(e, ctx);
    if (e.type === 'text') return textEntity(e, ctx);
    if (e.type === 'mtext') return mtextEntity(e, ctx);
    if (e.type === 'dimension') return dimensionEntity(e, ctx);
    if (e.type === 'insert') {
      if (isHeavyDisabledBlockName(e.name)) return [];
      if (!sourceBlocks[e.name]) return [];
      return insertEntity(e, ctx, e.mirrorX ? `${e.name}__MIRROR` : e.name);
    }
    return [];
  }

  function layerRecords(drawing, layerOriginals, layerMap, hiddenLayers, nextHandle) {
    const out = [];
    for (const original of layerOriginals) {
      if (original === '0' || original === 'Defpoints') continue;
      const name = layerMap.get(original);
      const aci = layerAci(drawing, original);
      const isHidden = !!(hiddenLayers && hiddenLayers[original]);
      out.push(pair(0, 'LAYER'), pair(5, nextHandle()), pair(330, LAYER_TABLE_HANDLE), pair(100, 'AcDbSymbolTableRecord'), pair(100, 'AcDbLayerTableRecord'), pair(2, name), pair(70, 0), pair(62, isHidden ? -aci : aci));
      const trueColor = layerTrueColor(drawing, original);
      if (Number.isFinite(trueColor)) out.push(pair(420, trueColor));
      out.push(pair(6, 'Continuous'), pair(370, -3), pair(390, PLOT_STYLE_HANDLE), pair(347, MATERIAL_HANDLE));
    }
    return out.join('\n');
  }
  function blockRecord(blockInfo) {
    return [pair(0, 'BLOCK_RECORD'), pair(5, blockInfo.recordHandle), pair(330, BLOCK_RECORD_TABLE_HANDLE), pair(100, 'AcDbSymbolTableRecord'), pair(100, 'AcDbBlockTableRecord'), pair(2, blockInfo.name), pair(340, 0), pair(70, 0), pair(280, 1), pair(281, 0)].join('\n');
  }
  function blockSection(blockInfo, ctx, sourceBlocks) {
    const anonymous = /^\*D\d+$/i.test(blockInfo.name) || blockInfo.block.anonymousDimension;
    const out = [pair(0, 'BLOCK'), pair(5, blockInfo.beginHandle), pair(330, blockInfo.recordHandle), pair(100, 'AcDbEntity'), pair(8, '0'), pair(100, 'AcDbBlockBegin'), pair(2, blockInfo.name), pair(70, anonymous ? 1 : 0), pair(10, 0), pair(20, 0), pair(30, 0), pair(3, blockInfo.name), pair(1, '')];
    const blockCtx = { ...ctx, owner: blockInfo.recordHandle };
    for (const e of blockInfo.block.entities || []) append(out, entityOut(e, blockCtx, sourceBlocks));
    out.push(pair(0, 'ENDBLK'), pair(5, blockInfo.endHandle), pair(330, blockInfo.recordHandle), pair(100, 'AcDbEntity'), pair(8, '0'), pair(100, 'AcDbBlockEnd'));
    return out.join('\n');
  }

  function toDxf(drawing) {
    if (!TEMPLATE) throw new Error('Modern DXF template could not be loaded.');
    drawing = prepareDrawing(drawing || {});
    const sourceBlocks = getBlocks(drawing);
    const usedBlocks = collectUsedBlocks(drawing, sourceBlocks);
    const layerOriginals = collectLayerNames(drawing, usedBlocks);
    const layerMap = createUniqueNameMap(layerOriginals, modernLayerName);
    const blockKeys = Array.from(usedBlocks.keys());
    const blockMap = createUniqueNameMap(blockKeys.map(key => {
      if (/^\*D\d+$/i.test(key)) return key;
      return key;
    }), modernBlockName);
    const nextHandle = handleAllocator();
    const blockInfos = blockKeys.map(key => ({
      key,
      name: blockMap.get(key),
      block: usedBlocks.get(key),
      recordHandle: nextHandle(),
      beginHandle: nextHandle(),
      endHandle: nextHandle()
    }));
    const blockInfoMap = new Map(blockInfos.map(info => [info.key, info]));
    const ctx = {
      nextHandle,
      owner: MODEL_SPACE_RECORD,
      layerName: original => layerMap.get(original || '0') || modernLayerName(original || '0'),
      blockName: key => (blockInfoMap.get(key) && blockInfoMap.get(key).name) || modernBlockName(key)
    };
    const hiddenLayers = drawing.hiddenLayers || drawing.dxfHiddenLayers || {};
    const customLayerRecords = layerRecords(drawing, layerOriginals, layerMap, hiddenLayers, nextHandle);
    const customBlockRecords = blockInfos.map(blockRecord).join('\n');
    const customBlocks = blockInfos.map(info => blockSection(info, ctx, sourceBlocks)).join('\n');
    const entityLines = [];
    for (const e of drawing.entities || []) append(entityLines, entityOut(e, ctx, sourceBlocks));
    const modern = TEMPLATE
      .replace('__LAYER_COUNT__', String(2 + layerOriginals.filter(n => n !== '0' && n !== 'Defpoints').length))
      .replace('__CUSTOM_LAYER_RECORDS__', customLayerRecords)
      .replace('__BLOCK_RECORD_COUNT__', String(2 + blockInfos.length))
      .replace('__CUSTOM_BLOCK_RECORDS__', customBlockRecords)
      .replace('__CUSTOM_BLOCKS__', customBlocks)
      .replace('__ENTITIES__', entityLines.join('\n'));
    return modern.replace(/\n/g, '\r\n');
  }

  function safeFileName(value) {
    return cleanSingleLine(value)
      .replace(/ğ/g, 'g').replace(/Ğ/g, 'G')
      .replace(/ü/g, 'u').replace(/Ü/g, 'U')
      .replace(/ş/g, 's').replace(/Ş/g, 'S')
      .replace(/ı/g, 'i').replace(/İ/g, 'I')
      .replace(/ö/g, 'o').replace(/Ö/g, 'O')
      .replace(/ç/g, 'c').replace(/Ç/g, 'C')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'pergo-rise';
  }

  const api = { toDxf, safeFileName, modernLayerName, modernBlockName, version: 'AC1027' };
  root.PulumurModernDXF = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
