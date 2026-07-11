const fs = require('fs');
const path = require('path');
require('../blocks/filteredBlocks.js');
const Geometry = require('../peri01Geometry.js');
const DXF = require('../dxfModernEngine.js');

function buildGuillotine(rawPlacement) {
  const raw = {
    ...Geometry.SAMPLE_INPUT,
    project: 'V8.3.6 GUILLOTINE TEST',
    systemCount: 1,
    width: '6800',
    opening: '4500',
    rearHeight: '3200',
    frontHeight: '2650',
    rayCount: '3',
    postCount: '4',
    __frontPostCenters: [350, 2400, 5000, 7038],
    __guillotinePlacements: [rawPlacement]
  };
  return Geometry.buildDrawing(raw);
}

const drawing = buildGuillotine({
  gapIndex: 1,
  series: 'A SERIES',
  type: 'STANDARD',
  mechanism: 'CHAIN',
  glassThickness: '8 MM',
  glassColor: 'TRANSPARENT',
  panelCount: '1+1',
  motorDirection: 'RIGHT',
  view: 'INSIDE VIEW',
  motorType: 'SOMFY RTS',
  remoteControl: '1 CHANNEL',
  height: 2595,
  pozNo: 'G01'
});

const placement = drawing.input.guillotinePlacements[0];
if (!placement) throw new Error('Guillotine placement normalize edilmedi.');
if (!drawing.blocks.GUILLOTINE_POZ_G01) throw new Error('Guillotine block üretilmedi.');
const block = drawing.blocks.GUILLOTINE_POZ_G01;
if (block.entities.some(e => e.layer === 'TABLE' || /SERIES|QUANTITY|SIZE/.test(String(e.value || '')))) {
  throw new Error('Guillotine bilgi tablosu ürün bloğuna girmiş.');
}
if (block.entities.some(e => e.trueColor != null)) throw new Error('R12 ürün bloğunda True Color kalmış.');
if (Geometry.LAYER_STYLE['Ürün Yerleşimi - Giyotin'].stroke !== '#293189') throw new Error('Önizleme RGB 41,49,137 korunmadı.');
if (Number(Geometry.LAYER_STYLE['Ürün Yerleşimi - Giyotin'].aci) !== 167) throw new Error('Giyotin ACI 167 uygulanmadı.');
const insert = drawing.entities.find(e => e.type === 'insert' && e.name === 'GUILLOTINE_POZ_G01');
if (!insert) throw new Error('Guillotine insert üretilmedi.');
const dims = drawing.entities.filter(e => e.type === 'dimension' && e.layer === 'Ölçüler - Detay');
if (dims.length < 2) throw new Error('Guillotine iç ölçüleri üretilmedi.');
const [wDim, hDim] = dims.slice(-2);
if (!(wDim.dimLine.y > insert.y && wDim.dimLine.y < insert.y + placement.height)) throw new Error('Genişlik ölçüsü ürünün içinde değil.');
if (!(hDim.dimLine.x > insert.x && hDim.dimLine.x < insert.x + placement.width)) throw new Error('Yükseklik ölçüsü ürünün içinde değil.');
const dxf = DXF.toDxf(drawing);
if (!dxf.includes('GUILLOTINE_POZ_G01')) throw new Error('DXF Guillotine block içermiyor.');
if (/\r?\n420\r?\n/.test(dxf)) throw new Error('R12 DXF içinde geçersiz group 420 kaldı.');
if (!/\r?\n62\r?\n167\r?\n/.test(dxf)) throw new Error('DXF ACI 167 kaydı yok.');
const out = path.join(__dirname, '..', 'samples', 'v8_3_6-guillotine-test.dxf');
fs.writeFileSync(out, dxf, 'utf8');

const kDrawing = buildGuillotine({
  gapIndex: 0,
  series: 'K SERIES',
  type: 'UPWARD COLLECTING',
  mechanism: 'CHAIN',
  glassThickness: '8 MM',
  glassColor: 'LOW-E GLASS',
  panelCount: '1+2',
  motorDirection: 'LEFT',
  view: 'OUTSIDE VIEW',
  motorType: 'RISING',
  remoteControl: '6 CHANNELS',
  height: 2595,
  pozNo: 'G02'
});
const k = kDrawing.input.guillotinePlacements[0];
if (k.glassThickness !== 'INSULATED GLASS') throw new Error('K Series cam kuralı uygulanmadı.');
if (k.mechanism !== 'BELT') throw new Error('K Series mekanizma kuralı uygulanmadı.');
if (k.type !== 'STANDARD') throw new Error('K Series Upward Collecting kuralı uygulanmadı.');

console.log(`OK v8.3.6 Guillotine: ${drawing.entities.length} entity, ${block.entities.length} block entity, ${Buffer.byteLength(dxf)} bytes`);
