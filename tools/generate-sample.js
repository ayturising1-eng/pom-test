const fs = require('fs');
const path = require('path');
require('../blocks/filteredBlocks.js');
require('../peri01ExcelBridge.js');
const geom = require('../peri01Geometry.js');
const dxf = require('../dxfModernEngine.js');

const samples = [
  ['pergo-rise-v8-peri01-excel-bridge-single-test.dxf', geom.SAMPLE_INPUT],
  ['pergo-rise-v8-peri01-excel-bridge-multi-test.dxf', { ...geom.SAMPLE_INPUT, systemCount: 3, width: '3000;2500;2800', opening: '4500;5200;4800', rearHeight: '3200;3400;3100', rayCount: '2;3;2', postCount: 4, glassTrack: 'EVET', parapet: 'EVET', parapetHeight: 500, triangleJoinery: 'EVET', waterStandard: 'HAYIR' }],
  ['pergo-rise-v8-peri01-excel-bridge-nogap-test.dxf', { ...geom.SAMPLE_INPUT, systemCount: 3, width: '3000;100;2500;150;2800;NO', opening: '4500;5200;4800', rearHeight: '3200;3400;3100', rayCount: '2;3;2', postCount: 4 }],
];
for (const [name, input] of samples) {
  const drawing = geom.buildDrawing(input);
  const text = dxf.toDxf(drawing);
  const out = path.join(__dirname, '..', 'samples', name);
  fs.writeFileSync(out, text, 'utf8');
  console.log(`${name}: entities=${drawing.entities.length}, bytes=${Buffer.byteLength(text)}`);
}
