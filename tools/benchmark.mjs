import path from 'node:path';
import { createRequire } from 'node:module';
import { performance } from 'node:perf_hooks';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const require = createRequire(import.meta.url);
globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
globalThis.dispatchEvent = () => true;
globalThis.CustomEvent = class CustomEvent { constructor(type, init = {}) { this.type = type; this.detail = init.detail; } };

require(path.join(root, 'appLimits.js'));
require(path.join(root, 'blocks/filteredBlocks.js'));
const Geometry = require(path.join(root, 'peri01Geometry.js'));
const ModernDxf = require(path.join(root, 'dxfModernEngine.js'));

function stats(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const sum = sorted.reduce((total, value) => total + value, 0);
  const at = p => sorted[Math.min(sorted.length - 1, Math.floor((sorted.length - 1) * p))];
  return {
    iterations: sorted.length,
    meanMs: Number((sum / sorted.length).toFixed(2)),
    p50Ms: Number(at(0.50).toFixed(2)),
    p95Ms: Number(at(0.95).toFixed(2)),
    maxMs: Number(sorted[sorted.length - 1].toFixed(2))
  };
}

function measure(name, input, iterations) {
  const buildTimes = [];
  const dxfTimes = [];
  let last = null;
  for (let index = 0; index < iterations; index += 1) {
    const start = performance.now();
    const drawing = Geometry.buildDrawing(input);
    buildTimes.push(performance.now() - start);
    const dxfStart = performance.now();
    const dxf = ModernDxf.toDxf(drawing);
    dxfTimes.push(performance.now() - dxfStart);
    last = { entityCount: drawing.entities.length, dxfBytes: Buffer.byteLength(dxf, 'utf8') };
  }
  return { name, geometry: stats(buildTimes), dxf: stats(dxfTimes), ...last };
}

const before = process.memoryUsage();
const cases = [
  measure('single_position', { ...Geometry.SAMPLE_INPUT, date: '2026-07-14' }, 20),
  measure('three_positions_mixed_opening', {
    ...Geometry.SAMPLE_INPUT,
    systemCount: 3,
    width: '4000;4000;4000',
    opening: '4500;5200;6000',
    rayCount: '2;3;4',
    rearHeight: '3000;3100;3200',
    frontHeight: '2500;2500;2500',
    date: '2026-07-14'
  }, 10),
  measure('stress_30_positions_4_rays', {
    ...Geometry.SAMPLE_INPUT,
    systemCount: 30,
    width: Array(30).fill('4000').join(';'),
    opening: Array.from({ length: 30 }, (_, index) => String(4500 + (index % 4) * 250)).join(';'),
    rayCount: Array(30).fill('4').join(';'),
    rearHeight: Array(30).fill('3000').join(';'),
    frontHeight: Array(30).fill('2500').join(';'),
    date: '2026-07-14'
  }, 3)
];
if (global.gc) global.gc();
const after = process.memoryUsage();
const report = {
  build: '10.4',
  node: process.version,
  generatedAt: new Date().toISOString(),
  memory: {
    beforeHeapUsedMb: Number((before.heapUsed / 1024 / 1024).toFixed(2)),
    afterHeapUsedMb: Number((after.heapUsed / 1024 / 1024).toFixed(2)),
    rssMb: Number((after.rss / 1024 / 1024).toFixed(2))
  },
  cases
};
console.log(JSON.stringify(report, null, 2));
