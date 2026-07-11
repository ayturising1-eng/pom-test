
const fs = require('fs');
const path = require('path');
require('../blocks/filteredBlocks.js');
const dxf = require('../dxfModernEngine.js');
const blocks = globalThis.PulumurFilteredBlocks.blocks;
const names = Object.keys(blocks);
const entities = [];
const layers = ['BLOCKREF', 'TEXT', 'OUTLINE'];
let col = 0, row = 0;
const gapX = 1200, gapY = 900;
for (let i=0;i<names.length;i++) {
  const name = names[i];
  const x = col * gapX;
  const y = -row * gapY;
  entities.push({ type:'insert', name, x, y, layer:'BLOCKREF', rotation:0, scaleX:1, scaleY:1, previewW:300, previewH:180 });
  entities.push({ type:'text', x, y:y-300, height:35, value:String(i+1)+' '+name, align:'center', layer:'TEXT' });
  col++;
  if (col >= 4) { col=0; row++; }
}
const drawing = { input:{ project:'BLOCK_LIBRARY', product:'PERGORISE', version:'V7.2' }, entities, layers, blocks };
const text = dxf.toDxf(drawing);
const out = path.join(__dirname, '..', 'samples', 'pergorise-v8-block-library-preview.dxf');
fs.writeFileSync(out, text, 'utf8');
console.log(out, 'blocks', names.length, 'bytes', Buffer.byteLength(text));
