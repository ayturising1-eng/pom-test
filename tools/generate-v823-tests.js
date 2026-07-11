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
  ['single-clearance', { ...geo.SAMPLE_INPUT, opening:'1500', rearHeight:'2800', frontHeight:'2400', rayCount:'', postCount:'' }],
  ['triangle-clearance', { ...geo.SAMPLE_INPUT, triangleJoinery:'EVET', opening:'4500', rearHeight:'3200', frontHeight:'2600', rayCount:'', postCount:'' }],
  ['side-track-mirror-align', { ...geo.SAMPLE_INPUT, sideTrack:'EVET', glassTrack:'HAYIR', opening:'4500', rearHeight:'3200', frontHeight:'2600', rayCount:'', postCount:'' }],
  ['multi-last-mirror-align', { ...geo.SAMPLE_INPUT, systemCount:'3', width:'3000;2500;2800', opening:'4500;5200;4800', rearHeight:'3200;3400;3100', frontHeight:'2600', rayCount:'3;2;4', postCount:'' }]
];
for (const [name,input] of cases) {
  const drawing=geo.buildDrawing(input);
  const text=dxf.toDxf(drawing);
  const file=path.join(outDir, `pergo-rise-v8_2_3-${name}.dxf`);
  fs.writeFileSync(file,text);
  console.log(name, drawing.entities.length, fs.statSync(file).size);
}
