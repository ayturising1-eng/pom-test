import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const require = createRequire(import.meta.url);

function walk(dir = root) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.git') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}
function read(rel) { return fs.readFileSync(path.join(root, rel), 'utf8'); }
function cleanAsset(value) { return String(value).split('#')[0].split('?')[0].replace(/^\.\//, ''); }

const files = walk();
const relative = files.map(file => path.relative(root, file).replaceAll(path.sep, '/'));
const forbidden = relative.filter(name =>
  /(^|\/)(?:node_modules|\.git|coverage|dist-temp|tmp|temp)(\/|$)/i.test(name) ||
  /(?:\.bak|\.old|\.orig|\.rej|\.log)$/i.test(name) ||
  /(?:test[_ -]?raporu|diff[_ -]?raporu|release[_ -]?notes?)/i.test(name) ||
  /(^|\/)\.env(?:\.|$)/i.test(name) ||
  /pulumur-automation-studio-v10\.[012](?:\/|$)/i.test(name)
);
assert.deepEqual(forbidden, [], `Forbidden release files: ${forbidden.join(', ')}`);

assert.equal(read('VERSION').trim(), '10.4');
const pkg = JSON.parse(read('package.json'));
assert.equal(pkg.version, '10.4.0');

const index = read('index.html');
const localAssets = new Set();
for (const match of index.matchAll(/(?:src|href)="([^"]+)"/g)) {
  const ref = match[1];
  if (/^(?:https?:|data:|#|mailto:|tel:)/i.test(ref)) continue;
  const cleaned = cleanAsset(ref);
  if (cleaned) localAssets.add(cleaned);
}
for (const asset of localAssets) assert.ok(fs.existsSync(path.join(root, asset)), `Missing index asset: ${asset}`);

const sw = read('sw.js');
const swAssets = new Set([...sw.matchAll(/['"](\.\/[^'"]+)['"]/g)].map(match => cleanAsset(match[1])));
for (const asset of swAssets) assert.ok(fs.existsSync(path.join(root, asset)), `Missing service-worker asset: ${asset}`);
assert.match(sw, /CACHE_PREFIX\s*=\s*['"]pulumur-pwa-['"]/);
assert.match(sw, /(?:name|key)\.startsWith\(CACHE_PREFIX\)/);

const jsFiles = files.filter(file => /\.js$/i.test(file));
for (const file of jsFiles) execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' });

const globalModules = execFileSync('npm', ['root', '-g'], { encoding: 'utf8' }).trim();
const ts = require(path.join(globalModules, 'typescript/lib/typescript.js'));
const edgeFile = path.join(root, 'supabase/functions/admin-users/index.ts');
const transpiled = ts.transpileModule(fs.readFileSync(edgeFile, 'utf8'), {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
  reportDiagnostics: true,
  fileName: edgeFile
});
const syntaxDiagnostics = (transpiled.diagnostics || []).filter(item => item.category === ts.DiagnosticCategory.Error);
assert.deepEqual(syntaxDiagnostics.map(item => ts.flattenDiagnosticMessageText(item.messageText, '\n')), []);

const markers = [
  ['app.js', /APP_VERSION = '10\.4'/],
  ['buildBootstrap.js', /const build = '10\.4'/],
  ['sw.js', /v10_4/],
  ['index.html', /\?v=10\.4/],
  ['supabase/functions/admin-users/index.ts', /version: '10\.4'/],
  ['supabase/migrations/20260714000300_v10_4_release_metadata.sql', /'10\.4'/]
];
for (const [file, pattern] of markers) assert.match(read(file), pattern, `Version mismatch in ${file}`);

const textFiles = files.filter(file => /\.(?:js|mjs|ts|html|css|sql|json|webmanifest|yml|yaml|md|txt)$/i.test(file));
for (const file of textFiles) {
  const source = fs.readFileSync(file, 'utf8');
  assert.doesNotMatch(source, /SUPABASE_SERVICE_ROLE_KEY\s*=\s*['"][^'"]+['"]/i, `Embedded service role key: ${path.relative(root, file)}`);
  assert.doesNotMatch(source, /PLMR_PIN_PEPPER\s*=\s*['"][^'"]+['"]/i, `Embedded PIN pepper: ${path.relative(root, file)}`);
}

console.log(`Release verification passed: ${relative.length} files, ${jsFiles.length} JavaScript syntax checks, ${localAssets.size} index assets, ${swAssets.size} cached assets.`);
