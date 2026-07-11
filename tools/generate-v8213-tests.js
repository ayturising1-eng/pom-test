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
  ['single-bottom-sync', { ...geo.SAMPLE_INPUT, opening:'4500', rearHeight:'3200', frontHeight:'2600', customer:'DENEME', project:'DENEME', version:'01', drawnBy:'AYETULLAH KILINC' }],
  ['long-bottom-sync', { ...geo.SAMPLE_INPUT, opening:'4500', rearHeight:'3200', frontHeight:'2600', customer:'DENEME UZUN MUSTERI ADI TABLO ICINDE KIRILMALI VE SIGMALI', project:'DENEME PROJESI UZUN PROJE ADI TABLO ICINDE KIRILMALI VE SATIR YUKSEKLIGI BUYUMELI', version:'REVIZYON 01 UZUN', drawnBy:'AYETULLAH KILINC / PULUMUR AUTOMATION STUDIO', date:'2026-07-08' }],
  ['long-top-bottom-sync', { ...geo.SAMPLE_INPUT, opening:'4500', rearHeight:'3200', frontHeight:'2600', structureColor:'RAL 7016 TEXTURED SPECIAL LONG COLOR DESCRIPTION', fabric:'C 1602 - M (8116-1622) / EXTRA LONG FABRIC NAME TEST VALUE', fabricProfiles:'RAL 1013 MATTE PROFILE COLOR LONG TEXT', motor:'RISING MOTOR WITH RIGHT SIDE DIRECTION', remote:'RISING 6 CHANNELS REMOTE CONTROL', extras:'THE MOTOR IS ON RIGHT AND THIS EXTRA NOTE MUST STAY INSIDE ITS TABLE CELL', customer:'CUSTOMER LONG NAME SAME FONT SIZE AS TOP TABLE', project:'PROJECT LONG NAME SAME FONT SIZE AND ROW HEIGHT AUTO', drawnBy:'AYETULLAH KILINC' }]
];
for (const [name,input] of cases) {
  const drawing = geo.buildDrawing(input);
  const text = dxf.toDxf(drawing);
  const file = path.join(outDir, `pergo-rise-v8_2_13-${name}.dxf`);
  fs.writeFileSync(file, text);
  console.log(name, drawing.entities.length, fs.statSync(file).size, /\n0\r?\nEOF\r?\n?$/.test(text) ? 'EOF_OK' : 'EOF_MISSING');
}
