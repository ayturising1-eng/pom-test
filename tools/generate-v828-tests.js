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
  ['single-dynamic-table-align', { ...geo.SAMPLE_INPUT, opening:'4500', rearHeight:'3200', frontHeight:'2600', rayCount:'', postCount:'', structureColor:'RAL 7016 TEXT.', fabric:'C 1602 - M (8116-1622)', fabricProfiles:'RAL 1013', motor:'RISING MOTOR', remote:'RISING 6 CHANNELS', extras:'THE MOTOR IS ON RIGHT' }],
  ['long-options-table-align-fit', { ...geo.SAMPLE_INPUT, opening:'4500', rearHeight:'3200', frontHeight:'2600', structureColor:'RAL 7016 TEXTURED SPECIAL LONG COLOR DESCRIPTION', fabric:'C 1602 - M (8116-1622) / EXTRA LONG FABRIC NAME TEST VALUE', fabricProfiles:'RAL 1013 MATTE PROFILE COLOR LONG TEXT', motor:'RISING MOTOR WITH RIGHT SIDE DIRECTION', remote:'RISING 6 CHANNELS REMOTE CONTROL', extras:'THE MOTOR IS ON RIGHT AND THIS EXTRA NOTE MUST STAY INSIDE ITS TABLE CELL' }],
  ['bottom-title-align', { ...geo.SAMPLE_INPUT, customer:'DENEME CUSTOMER LONG NAME', project:'DENEME PROJECT LONG NAME', drawnBy:'AYETULLAH KILINC', opening:'4500', rearHeight:'3200', frontHeight:'2600' }],
  ['side-track-mirror-y-fixed', { ...geo.SAMPLE_INPUT, sideTrack:'EVET', glassTrack:'HAYIR', opening:'4500', rearHeight:'3200', frontHeight:'2600', rayCount:'', postCount:'' }]
];
for (const [name,input] of cases) {
  const drawing=geo.buildDrawing(input);
  const text=dxf.toDxf(drawing);
  const file=path.join(outDir, `pergo-rise-v8_2_9-${name}.dxf`);
  fs.writeFileSync(file,text);
  console.log(name, drawing.entities.length, fs.statSync(file).size);
}
