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
for (const f of fs.readdirSync(outDir)) {
  if (f.toLowerCase().endsWith('.dxf')) fs.unlinkSync(path.join(outDir, f));
}
const cases = [
  ['pergo-rise-v8_2_25-hatch-single.dxf', {
    ...geo.SAMPLE_INPUT,
    parapet: 'EVET',
    parapetHeight: 500,
    opening: '4500',
    rearHeight: '3200',
    frontHeight: '2600',
    rayCount: '2'
  }],
  ['pergo-rise-v8_2_25-hatch-multi.dxf', {
    ...geo.SAMPLE_INPUT,
    systemCount: '3',
    width: '3000;2500;2800',
    opening: '4500;5200;4800',
    rearHeight: '3200;3400;3100',
    frontHeight: '2600',
    rayCount: '3;2;4',
    postCount: '',
    parapet: 'EVET',
    parapetHeight: 500,
    triangleJoinery: 'EVET'
  }]
];
for (const [name,input] of cases) {
  const drawing = geo.buildDrawing(input);
  const text = dxf.toDxf(drawing);
  const file = path.join(outDir, name);
  fs.writeFileSync(file, text);
  console.log(name, drawing.entities.length, fs.statSync(file).size);
}
