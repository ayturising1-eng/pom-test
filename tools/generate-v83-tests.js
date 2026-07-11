const fs = require('fs');
const path = require('path');
require('../blocks/filteredBlocks.js');
const Geometry = require('../peri01Geometry.js');
const DXF = require('../dxfModernEngine.js');

const raw = {
  ...Geometry.SAMPLE_INPUT,
  project: 'V8.3 TEST',
  systemCount: 1,
  width: '6800',
  opening: '4500',
  rearHeight: '3200',
  frontHeight: '2650',
  rayCount: '3',
  postCount: '4',
  __frontPostCenters: [350, 2400, 5000, 7038],
  __slidingPlacements: [{
    gapIndex: 0,
    series: 'A SERIES',
    type: 'WITH THRESHOLD',
    openingType: 'CENTER OPENING',
    glassThickness: '10 MM',
    glassColor: 'TRANSPARENT',
    height: 2645,
    quantity: 1,
    pozNo: 'S01'
  }]
};

const drawing = Geometry.buildDrawing(raw);
if (drawing.input.postCenterXs[0] !== drawing.input.solX) throw new Error('D1 sabit değil.');
if (drawing.input.postCenterXs.at(-1) !== drawing.input.sagX) throw new Error('DS sabit değil.');
if (!drawing.blocks.SLIDING_POZ_S01) throw new Error('Sliding block üretilmedi.');
if (drawing.input.slidingPlacements[0].panelCount % 2 !== 0) throw new Error('Center opening panel sayısı çift değil.');
const insert = drawing.entities.find(e => e.type === 'insert' && e.name === 'SLIDING_POZ_S01');
if (!insert) throw new Error('Sliding insert üretilmedi.');
const dxf = DXF.toDxf(drawing);
if (!dxf.includes('SLIDING_POZ_S01')) throw new Error('DXF sliding block içermiyor.');
if (!dxf.includes('SLIDING POZ S01')) throw new Error('DXF sliding tablosunu içermiyor.');
const out = path.join(__dirname, '..', 'samples', 'v8_3_6-sliding-test.dxf');
fs.writeFileSync(out, dxf, 'utf8');
console.log(`OK v8.3.6: ${drawing.entities.length} entity, ${drawing.input.slidingPlacements[0].panelCount} panel, ${Buffer.byteLength(dxf)} bytes`);
