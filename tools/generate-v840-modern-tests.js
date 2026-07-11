const fs = require('fs');
const path = require('path');
require('../blocks/filteredBlocks.js');
require('../modernDxfTemplate.js');
const Geometry = require('../peri01Geometry.js');
const ModernDXF = require('../dxfModernEngine.js');

function build(rawExtra={}) {
  return Geometry.buildDrawing({
    ...Geometry.SAMPLE_INPUT,
    project: 'V8.4.0 MODERN DXF TEST',
    systemCount: 1,
    width: '6800', opening: '4500', rearHeight: '3200', frontHeight: '2650',
    rayCount: '3', postCount: '4',
    __frontPostCenters: [350, 2400, 5000, 7038],
    ...rawExtra,
  });
}

const guillotine = build({
  __guillotinePlacements: [{gapIndex:1,series:'A SERIES',type:'STANDARD',mechanism:'CHAIN',glassThickness:'8 MM',glassColor:'TRANSPARENT',panelCount:'1+1',motorDirection:'RIGHT',view:'INSIDE VIEW',motorType:'SOMFY RTS',remoteControl:'1 CHANNEL',height:2595,pozNo:'G01'}]
});
const sliding = build({
  __slidingPlacements: [{gapIndex:0,series:'A SERIES',type:'WITH THRESHOLD',openingType:'SIDE OPENING',glassThickness:'10 MM',glassColor:'TRANSPARENT',height:2595,pozNo:'S01'}]
});
for (const [name,drawing] of [['guillotine',guillotine],['sliding',sliding]]) {
  drawing.hiddenLayers={'Ölçüler - Ana':false,'Ölçüler - Detay':false};
  const dxf=ModernDXF.toDxf(drawing);
  if (!dxf.includes('AC1027')) throw new Error('AC1027 missing');
  if (!/\r\n420\r\n2699657\r\n/.test(dxf) && name==='guillotine') throw new Error('Guillotine true color missing');
  if (!dxf.includes('Türkçe') && false) throw new Error('Unicode missing');
  const out=path.join(__dirname,'..','samples',`v8_4_0-modern-${name}.dxf`);
  fs.writeFileSync(out,dxf,'utf8');
  console.log(out,Buffer.byteLength(dxf));
}
