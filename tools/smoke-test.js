const fs = require('fs');
const path = require('path');
require('../blocks/filteredBlocks.js');
const Geometry = require('../peri01Geometry.js');
const DXF = require('../dxfModernEngine.js');

const tests = [
  Geometry.SAMPLE_INPUT,
  { ...Geometry.SAMPLE_INPUT, systemCount: 3, width: '3000;2500;2800', opening: '4500;5200;4800', rearHeight: '3200;3400;3100', rayCount: '2;3;2', postCount: 4, glassTrack: 'EVET', parapet: 'EVET', parapetHeight: 500, triangleJoinery: 'EVET', waterStandard: 'HAYIR' },
  { ...Geometry.SAMPLE_INPUT, systemCount: 3, width: '3000;100;2500;150;2800;NO', opening: '4500;5200;4800', rearHeight: '3200;3400;3100', rayCount: '2;3;2', postCount: 4 },
];
tests.forEach((sample, i) => {
  const drawing = Geometry.buildDrawing(sample);
  const dxf = DXF.toDxf(drawing);
  if (!dxf.includes('AC1009')) throw new Error('R12 AC1009 missing');
  if (!dxf.includes('SECTION')) throw new Error('DXF section missing');
  const outPath = path.join(__dirname, '..', 'samples', `smoke-v7-${i + 1}.dxf`);
  fs.writeFileSync(outPath, dxf, 'utf8');
  console.log(`OK ${i + 1}: ${drawing.entities.length} entities, ${Object.keys(drawing.blocks || {}).length} source blocks, ${Buffer.byteLength(dxf)} bytes`);
});
