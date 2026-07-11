globalThis.window = globalThis;
const path = require('path');
const fs = require('fs');
const root = path.resolve(__dirname, '..');
require(path.join(root, 'peri01ExcelBridge.js'));
globalThis.PulumurFilteredBlocks = require(path.join(root, 'blocks/filteredBlocks.js'));
const geo = require(path.join(root, 'peri01Geometry.js'));
const dxf = require(path.join(root, 'dxfModernEngine.js'));
const outDir = path.join(root, 'samples');
fs.mkdirSync(outDir, { recursive: true });
const cases = [
  ['single', { ...geo.SAMPLE_INPUT, rayCount:'', postCount:'' }],
  ['manual-ray-3-2-4', { ...geo.SAMPLE_INPUT, systemCount:'3', width:'3000;2500;2800', opening:'4500;5200;4800', rearHeight:'3200;3400;3100', frontHeight:'2600', rayCount:'3;2;4', postCount:'' }],
  ['auto-multi', { ...geo.SAMPLE_INPUT, systemCount:'3', width:'3000;5000;9000', opening:'4500', rearHeight:'3200', frontHeight:'2600', rayCount:'', postCount:'' }],
  ['nogap-auto', { ...geo.SAMPLE_INPUT, systemCount:'3', width:'2000;50;2500;80;6000;NO', opening:'4500', rearHeight:'3200', frontHeight:'2600', rayCount:'', postCount:'' }],
];
for (const [name, input] of cases) {
  const drawing = geo.buildDrawing(input);
  const text = dxf.toDxf(drawing);
  const file = path.join(outDir, `pergo-rise-v8_2-${name}.dxf`);
  fs.writeFileSync(file, text);
  const unwanted = [
    text.includes('PERGORISE_CATI_KAYIT_PROFILI') && 'CATI_BLOCK',
    text.includes('UST GORUNUS') && 'UST_TEXT',
    text.includes('ON / KARSI') && 'ON_TEXT',
    text.includes('YAN GORUNUS') && 'YAN_TEXT'
  ].filter(Boolean);
  console.log(name, 'rays=', drawing.input.systems.map(s=>s.rayCount).join(';'), 'post=', drawing.input.postCount, 'size=', fs.statSync(file).size, 'unwanted=', unwanted.join(',') || '-');
}
