import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const baseline = '/mnt/data/plmr_stage0_clean';

function hash(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

const allowedChanged = new Set(['adminPanel.js', 'index.html', 'style.css']);
const baselineFiles = [];
function walk(dir, prefix = '') {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const relative = path.posix.join(prefix, entry.name);
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(absolute, relative);
    else baselineFiles.push(relative);
  }
}
walk(baseline);
for (const relative of baselineFiles) {
  if (allowedChanged.has(relative)) continue;
  assert.equal(hash(path.join(root, relative)), hash(path.join(baseline, relative)), `unexpected source change: ${relative}`);
}

for (const protectedFile of [
  'app.js', 'peri01Geometry.js', 'dxfModernEngine.js', 'modernDxfTemplate.js',
  'blocks/filteredBlocks.js', 'render/renderPipeline.js', 'core/topologyReconcile.js',
  'persistence/schema.js', 'cloudProjects.js', 'adminUsersApi.js',
]) {
  assert.equal(hash(path.join(root, protectedFile)), hash(path.join(baseline, protectedFile)), `protected file changed: ${protectedFile}`);
}

const artifacts = [
  '/mnt/data/pergo-rise-test-3-R01.plmr',
  '/mnt/data/local-test-3-r01-pergo-rise-web-dxf-v10-4-v01.pdf',
  '/mnt/data/local-test-3-r01-pergo-rise-web-dxf-v10-4-v01.dxf',
];
const expected = {
  '/mnt/data/pergo-rise-test-3-R01.plmr': '45e60d1071ce885eb0d4876bd8fae24fddd656fde30350c2d7943d9547333440',
  '/mnt/data/local-test-3-r01-pergo-rise-web-dxf-v10-4-v01.pdf': 'c4429ba7a11cc061b97a4e92044a124e423280ffaf0fee1f9d602d606dec5590',
  '/mnt/data/local-test-3-r01-pergo-rise-web-dxf-v10-4-v01.dxf': '388e558eb34a25087233c79c5f5aa663c61f0aa8c087b5e00a3d3e3b0e628baa',
};
for (const artifact of artifacts) assert.equal(hash(artifact), expected[artifact], `reference artifact changed: ${path.basename(artifact)}`);

const migrationDir = path.join(root, 'supabase', 'migrations');
assert.equal(fs.readdirSync(migrationDir).length, 0, 'Stage 1 must not add a migration');
assert.match(fs.readFileSync(path.join(root, 'app.js'), 'utf8'), /APP_VERSION\s*=\s*['"]10\.4['"]/, 'Stage 1 changed application version unexpectedly');

console.log(`PASS stage1-regression: ${baselineFiles.length - allowedChanged.size} baseline files protected; geometry/DXF/PDF/project references unchanged`);
