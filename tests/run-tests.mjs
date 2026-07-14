import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import crypto from 'node:crypto';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const require = createRequire(import.meta.url);

class MemoryStorage {
  constructor() { this.map = new Map(); }
  getItem(key) { return this.map.has(String(key)) ? this.map.get(String(key)) : null; }
  setItem(key, value) { this.map.set(String(key), String(value)); }
  removeItem(key) { this.map.delete(String(key)); }
  clear() { this.map.clear(); }
}

globalThis.localStorage = new MemoryStorage();
globalThis.dispatchEvent = () => true;
globalThis.CustomEvent = class CustomEvent { constructor(type, init = {}) { this.type = type; this.detail = init.detail; } };

const loaded = file => require(path.join(root, file));
loaded('appLimits.js');
loaded('core/actions.js');
loaded('core/projectModel.js');
loaded('core/topologyReconcile.js');
loaded('core/validation.js');
loaded('core/reducer.js');
loaded('history/historyManager.js');
loaded('persistence/schema.js');
loaded('render/renderPipeline.js');
loaded('blocks/filteredBlocks.js');
const Geometry = loaded('peri01Geometry.js');
const ModernDxf = loaded('dxfModernEngine.js');

const tests = [];
const test = (name, fn) => tests.push({ name, fn });

function read(rel) { return fs.readFileSync(path.join(root, rel), 'utf8'); }
function allSourceFiles(dir = root) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...allSourceFiles(full));
    else out.push(full);
  }
  return out;
}

test('central limits clamp to hard caps and reset to defaults', () => {
  assert.equal(PulumurLimits.get().maxSystems, 30);
  const next = PulumurLimits.set({ maxSystems: 999, maxRaysPerSystem: -4, historySteps: 999 });
  assert.equal(next.maxSystems, 50);
  assert.equal(next.maxRaysPerSystem, 1);
  assert.equal(next.historySteps, 100);
  assert.deepEqual(PulumurLimits.reset(), PulumurLimits.defaults);
});

test('semantic mirror reverses direction tokens and panel order without persistent duplicate state', () => {
  const model = PulumurProjectModel.createEmpty();
  model.topology.systemCount = 3;
  model.sideViews.right.products.sliding.push({
    id: 'S01', motorDirection: 'RIGHT', location: 'INSIDE', panels: [1, 2, 3], panelOrder: ['RIGHT', 'LEFT']
  });
  const mirror = PulumurProjectModel.deriveLastLeftMirror(model);
  assert.equal(mirror.editable, false);
  assert.equal(mirror.derivedFrom, 'right');
  assert.equal(mirror.products.sliding[0].motorDirection, 'LEFT');
  assert.equal(mirror.products.sliding[0].location, 'OUTSIDE');
  assert.deepEqual(mirror.products.sliding[0].panels, [3, 2, 1]);
  assert.deepEqual(mirror.products.sliding[0].panelOrder, ['RIGHT', 'LEFT']);
  assert.equal(model.sideViews.last_left_mirror, undefined);
});

test('reducer/store updates ProjectModel through actions', () => {
  const store = PulumurProjectReducer.createStore(PulumurProjectModel.createEmpty());
  const result = store.dispatch(PulumurProjectActions.TYPES.SET_FORM_FIELD, { field: 'project', value: 'TEST-103' });
  assert.equal(result.metadata.project, 'TEST-103');
  assert.equal(store.debug().lastAction.type, PulumurProjectActions.TYPES.SET_FORM_FIELD);
});

test('topology reconcile preserves removed middle side view in orphan storage', () => {
  const model = PulumurProjectModel.createEmpty();
  model.topology.systemCount = 3;
  model.positions = [0, 1, 2].map(index => ({ id: `position_${index + 1}`, index, width: 4000, opening: 5000, rearHeight: 3000, frontHeight: 2500, rayCount: 2 }));
  model.sideViews.middle.middle_1 = {
    ...PulumurProjectModel.normalize(model).sideViews.left,
    key: 'middle_1', enabled: true, supportPosts: [{ id: 'support-1' }]
  };
  const result = PulumurTopologyReconcile.reconcileProjectTopology(model, {
    systemCount: 1,
    positions: [{ width: 4000, opening: 5000, rearHeight: 3000, frontHeight: 2500, rayCount: 2 }],
    systems: [{ rayCount: 2 }],
    postCount: 2
  });
  assert.equal(result.model.sideViews.middle.middle_1, undefined);
  assert.equal(result.model.orphans.sideViews.middle_1.supportPosts[0].id, 'support-1');
  assert.ok(result.report.orphaned.includes('sideViews.middle_1'));
});

test('history holds at most configured 20 undo steps plus current state and breaks redo chain on new action', () => {
  const history = PulumurHistoryManager.create({ getLimit: () => 20 });
  let model = PulumurProjectModel.createEmpty();
  history.record(model, { force: true });
  for (let index = 1; index <= 25; index += 1) {
    model = PulumurProjectModel.setFormField(model, 'project', `P-${index}`);
    history.record(model, { action: { type: 'SET_FORM_FIELD', index } });
  }
  assert.equal(history.state.entries.length, 21);
  assert.equal(history.entryAt(history.state.index).model.metadata.project, 'P-25');
  history.state.index = 10;
  model = PulumurProjectModel.setFormField(history.entryAt(10).model, 'project', 'BRANCH');
  history.record(model, { action: { type: 'SET_FORM_FIELD' } });
  assert.equal(history.state.index, 11);
  assert.equal(history.state.entries.length, 12);
  assert.equal(history.entryAt(11).model.metadata.project, 'BRANCH');
});

test('schema v2 round-trip validates checksum and rejects corrupt JSON atomically', () => {
  const model = PulumurProjectModel.setFormField(PulumurProjectModel.createEmpty(), 'project', 'SCHEMA-TEST');
  const text = PulumurProjectSchema.serialize(model, { appVersion: '10.4', maxProjectFileMb: 10 });
  const parsed = PulumurProjectSchema.parse(text, { limits: PulumurLimits.get() });
  assert.equal(parsed.schemaVersion, 2);
  assert.equal(parsed.appVersion, '10.4');
  assert.equal(parsed.projectModel.metadata.project, 'SCHEMA-TEST');
  const corrupt = JSON.parse(text);
  corrupt.projectModel.metadata.project = 'TAMPERED';
  assert.throws(() => PulumurProjectSchema.normalizeEnvelope(corrupt), /PROJECT_CHECKSUM_INVALID/);
  assert.throws(() => PulumurProjectSchema.parse('{broken'), /PROJECT_JSON_INVALID/);
});

test('render pipeline validates and uses a single model-derived geometry source', () => {
  const model = PulumurProjectModel.createEmpty();
  model.topology.raw.width = '4000';
  const result = PulumurRenderPipeline.buildFromModel(model, {
    buildGeometry(formData) {
      return { input: { width: Number(formData.width || 0) }, entities: [{ type: 'LINE' }] };
    }
  });
  assert.equal(result.drawing.entities.length, 1);
  assert.equal(result.model.schemaVersion, 2);
});


test('actual single and multi-position geometry/DXF golden references remain stable', () => {
  const single = Geometry.buildDrawing({ ...Geometry.SAMPLE_INPUT, date: '2026-07-14' });
  assert.equal(single.input.systemCount, 1);
  assert.equal(single.entities.length, 72);
  const singleDxf = ModernDxf.toDxf(single);
  assert.match(singleDxf, /AC1027/);
  assert.match(singleDxf, /MESUT-MM/);
  assert.equal(crypto.createHash('sha256').update(singleDxf).digest('hex'), '62ec2af8c571a139aa38db84fdc196e825e6aaf1b19ed3f3db190a83bf7568a0');

  const multi = Geometry.buildDrawing({
    ...Geometry.SAMPLE_INPUT,
    date: '2026-07-14',
    systemCount: 3,
    width: '4000;4200;4500',
    opening: '4500;5200;6000',
    rearHeight: '3200;3300;3400',
    rayCount: '4;4;4',
    postCount: '8'
  });
  assert.deepEqual(multi.input.positions.map(item => item.opening), [4500, 5200, 6000]);
  assert.deepEqual(multi.input.positions.map(item => Math.round(item.rayLength)), [4292, 4998, 5803]);
  assert.equal(multi.entities.length, 286);
  const multiDxf = ModernDxf.toDxf(multi);
  assert.equal(crypto.createHash('sha256').update(multiDxf).digest('hex'), 'b756947c153b6fc4e093d818e06ec27dbaf36b2a449eaa2250da39f5400b56c7');
});

test('actual geometry handles 30 positions × 4 rays without stack overflow and rejects 31st position/5th ray', () => {
  const count = 30;
  const list = value => Array.from({ length: count }, (_, index) => String(typeof value === 'function' ? value(index) : value)).join(';');
  const stress = Geometry.buildDrawing({
    ...Geometry.SAMPLE_INPUT,
    date: '2026-07-14',
    systemCount: count,
    width: list(4000),
    opening: list(index => 4500 + index * 10),
    rearHeight: list(3200),
    rayCount: list(4),
    postCount: '62'
  });
  assert.equal(stress.input.positionCount, 30);
  assert.equal(stress.input.totalRayCount, 120);
  assert.ok(stress.entities.length > 2000);
  assert.throws(() => Geometry.buildDrawing({ ...Geometry.SAMPLE_INPUT, systemCount: 31, width: Array(31).fill('4000').join(';') }), /sınırı aşıldı/);
  assert.throws(() => Geometry.buildDrawing({ ...Geometry.SAMPLE_INPUT, rayCount: '5' }), /ray sınırı/);
});

test('product boundary accepts 200 and rejects 201 persistent products', () => {
  const model = PulumurProjectModel.createEmpty();
  model.products.front.sliding = Array.from({ length: 200 }, (_, index) => ({ id: `S-${index + 1}` }));
  assert.equal(PulumurProjectValidation.validateProjectModel(model).products.front.sliding.length, 200);
  model.products.front.sliding.push({ id: 'S-201' });
  assert.throws(() => PulumurProjectValidation.validateProjectModel(model), /PRODUCT_LIMIT_EXCEEDED/);
});


test('side scopes remain independent; support top section moves inversely and final-left mirror adds no editable triangle copy', () => {
  const base = {
    ...Geometry.SAMPLE_INPUT,
    systemCount: 3,
    width: '4000;4000;4000',
    opening: '4500;5200;6000',
    rearHeight: '3200;3300;3400',
    rayCount: '2;3;4',
    postCount: 4,
    parapet: 'EVET',
    parapetHeight: 500,
    glassTrack: 'EVET',
    triangleJoinery: 'EVET',
    __sideFeatureState: {
      glassTrack: { left: true, right: true, middle: { '1': true } },
      triangle: { left: true, right: true, middle: { '1': true } },
      middleEnabled: { '1': true }
    },
    __triangleDivisionState: { left: 3, right: 4, middle: { '1': 2 } },
    __sidePosts: {
      '0': [{ id: 'left-support', centerX: -5200, profile: { en: 100, boy: 100, et: 2 } }],
      '1': [{ id: 'middle-support', centerX: -5500, profile: { en: 40, boy: 130, et: 2 } }],
      right: [{ id: 'right-support', centerX: -6000, profile: { en: 100, boy: 100, et: 2 } }]
    },
    __backWallState: {
      left: { xOffset: 0, depth: 600, height: 3200 },
      right: { xOffset: 0, depth: 600, height: 3400 },
      middle: { '1': { xOffset: 0, depth: 600, height: 3300 } }
    }
  };
  const drawing = Geometry.buildDrawing(base);
  const glass = drawing.entities.filter(entity => entity.type === 'interaction' && entity.kind === 'glassTrackEditor');
  const supportScopes = glass.filter(entity => entity.data.part === 'support').map(entity => entity.data.scope).sort();
  assert.deepEqual(supportScopes, ['left', 'middle_1', 'right']);

  const triangles = drawing.entities.filter(entity => entity.type === 'interaction' && entity.kind === 'triangleEditor');
  const triangleCounts = triangles.reduce((counts, entity) => {
    const key = entity.data.sideViewKey;
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {});
  assert.deepEqual(triangleCounts, { '0': 2, '1': 2, right: 2 });

  const wallKeys = drawing.entities
    .filter(entity => entity.type === 'interaction' && entity.kind === 'backWallEditor')
    .map(entity => entity.data.sideViewKey)
    .sort();
  assert.deepEqual(wallKeys, ['0', '1', 'right']);

  const firstTopY = drawing.input.sideSupportGeometry['0'].posts[0].topCenterY;
  const moved = Geometry.buildDrawing({
    ...base,
    __sidePosts: {
      ...base.__sidePosts,
      '0': [{ ...base.__sidePosts['0'][0], centerX: -5100 }]
    }
  });
  const movedTopY = moved.input.sideSupportGeometry['0'].posts[0].topCenterY;
  assert.equal(Math.round(movedTopY - firstTopY), -100);
});

test('manual front product dimensions, readable right-side pipe text and product editor identities remain stable', () => {
  const drawing = Geometry.buildDrawing({
    ...Geometry.SAMPLE_INPUT,
    systemCount: 3,
    width: '4000;4000;4000',
    opening: '4500;5200;6000',
    rearHeight: '3200;3300;3400',
    rayCount: '2;3;4',
    postCount: 4,
    parapet: 'EVET',
    parapetHeight: 500,
    waterStandard: 'HAYIR',
    __slidingPlacements: [{ id: 'slide-1', gapIndex: 0, width: 1000, height: 1500, panelCount: 2, pozNo: 'S01' }],
    __guillotinePlacements: [{ id: 'guillotine-1', gapIndex: 1, width: 1100, height: 1600, pozNo: 'G01', motorType: 'SOMFY RTS' }]
  });
  assert.equal(drawing.input.slidingPlacements[0].width, 1000);
  assert.equal(drawing.input.slidingPlacements[0].height, 1500);
  assert.equal(drawing.input.guillotinePlacements[0].width, 1100);
  assert.equal(drawing.input.guillotinePlacements[0].height, 1600);
  const productIds = drawing.entities
    .filter(entity => entity.type === 'interaction' && entity.kind === 'productEditor')
    .map(entity => entity.data.placementId)
    .sort();
  assert.deepEqual(productIds, ['guillotine-1', 'slide-1']);
  const pipeTexts = drawing.entities.filter(entity => (entity.type === 'text' || entity.type === 'mtext') && entity.value === 'Ø70 Pipe 300 mm');
  assert.equal(pipeTexts.length, 4);
  assert.ok(pipeTexts.every(entity => Number(entity.rotation || 0) === 0 && entity.keepReadableOnMirror === true));
  assert.ok(pipeTexts.some(entity => entity.align === 'right'));
});

test('project file, side-support and wall-segment hard limits reject oversized state before active geometry changes', () => {
  assert.throws(
    () => PulumurProjectSchema.parse(' '.repeat(10 * 1024 * 1024 + 1), { maxProjectFileMb: 10, limits: PulumurLimits.get() }),
    /PROJECT_FILE_TOO_LARGE/
  );
  const supports = Array.from({ length: 9 }, (_, index) => ({
    id: `support-${index}`,
    centerX: -6500 + index * 120,
    profile: { en: 40, boy: 130, et: 2 }
  }));
  assert.throws(() => Geometry.buildDrawing({
    ...Geometry.SAMPLE_INPUT,
    glassTrack: 'EVET',
    __sideFeatureState: { glassTrack: { left: true, right: false, middle: {} }, triangle: { left: false, right: false, middle: {} }, middleEnabled: {} },
    __sidePosts: { '0': supports }
  }), /destek dikmesi sınırı/);
  const segments = Array.from({ length: 51 }, (_, index) => ({ id: `wall-${index}`, start: index * 10, end: index * 10 + 10, height: 3000 }));
  assert.throws(() => Geometry.buildDrawing({
    ...Geometry.SAMPLE_INPUT,
    __backWallSegments: { side: { '0': segments } }
  }), /duvar\/parapet parça sınırı/);
});

test('backend compatibility identifies missing RPC/schema errors and activates explicit fallback', () => {
  const context = { console };
  context.window = context;
  vm.runInNewContext(read('core/backendCompatibility.js'), context, { filename: 'backendCompatibility.js' });
  const api = context.PulumurBackendCompatibility;
  assert.equal(api.isMissingFeatureError({ code: 'PGRST202', message: 'Could not find the function' }), true);
  api.applyHealth({ version: '10.4', capabilities: { schema_stage: 2, migration_required: true, rate_limit_mode: 'memory-fallback' } });
  assert.equal(api.get().migrationRequired, true);
  api.markFallback('central_limits', { code: 'PGRST202' });
  assert.equal(api.get().centralLimits, false);
  assert.ok(api.get().warnings.includes('BACKEND_FALLBACK:central_limits'));
});

test('memory PIN limiter locks on fifth failure and clears after successful authentication', async () => {
  const source = read('supabase/functions/admin-users/rateLimiter.js');
  const moduleUrl = `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
  const { createMemoryRateLimiter } = await import(moduleUrl);
  let now = Date.UTC(2026, 6, 14, 9, 0, 0);
  const limiter = createMemoryRateLimiter({ now: () => now });
  for (let i = 0; i < 4; i += 1) {
    const result = limiter.record('user-hash', 'ip-hash', false);
    assert.equal(result.retry_after_seconds, 0);
  }
  const fifth = limiter.record('user-hash', 'ip-hash', false);
  assert.equal(fifth.retry_after_seconds, 60);
  assert.equal(limiter.preflight('user-hash', 'ip-hash').allowed, false);
  now += 61_000;
  assert.equal(limiter.preflight('user-hash', 'ip-hash').allowed, true);
  limiter.record('user-hash', 'ip-hash', true);
  assert.equal(limiter.size(), 0);
});

test('admin login keeps database limiter when available and controlled fallback when Stage 3 RPCs are missing', () => {
  const edge = read('supabase/functions/admin-users/index.ts');
  assert.match(edge, /pin_login_preflight_v1/);
  assert.match(edge, /record_pin_login_attempt_v1/);
  assert.match(edge, /createMemoryRateLimiter/);
  assert.match(edge, /STAGE3_RATE_LIMIT_MIGRATION_MISSING/);
  assert.match(edge, /rate_limit_mode/);
  assert.match(edge, /LOGIN_RATE_LIMIT_UNAVAILABLE/);
  assert.match(edge, /PLMR_ALLOWED_ORIGINS/);
  assert.match(edge, /DEFAULT_ALLOWED_ORIGINS/);
  assert.match(edge, /ORIGIN_NOT_ALLOWED/);
  assert.doesNotMatch(edge, /Access-Control-Allow-Origin'.*'\*'/);
});

test('Stage 3 and Stage 4 SQL are transaction-safe, idempotent at policy boundaries and expose backend capability verification', () => {
  const stage3 = read('supabase/migrations/20260714000100_stage3_security_concurrency.sql');
  const stage4 = read('supabase/migrations/20260714000200_stage4_release_hardening.sql');
  const stage104 = read('supabase/migrations/20260714000300_v10_4_release_metadata.sql');
  const verify = read('supabase/verification/verify_v10_4.sql');
  assert.match(stage3, /^begin;/m);
  assert.match(stage3, /^commit;/m);
  for (const policy of [
    'profiles_select_self_or_company_admin_v2',
    'organizations_select_own_v2',
    'projects_select_own_org_v2',
    'revisions_select_own_org_v2'
  ]) {
    const dropAt = stage3.indexOf(`drop policy if exists ${policy}`);
    const createAt = stage3.indexOf(`create policy ${policy}`);
    assert.ok(dropAt >= 0 && createAt > dropAt, `${policy} must be dropped before recreation`);
  }
  for (const rpc of ['pin_login_preflight_v1', 'record_pin_login_attempt_v1', 'get_effective_app_limits_v1']) assert.ok(stage3.includes(rpc));
  assert.match(stage4, /get_backend_capabilities_v1/);
  assert.match(stage4, /'10\.3'/);
  assert.match(stage104, /'10\.4'/);
  assert.match(stage104, /^begin;/m);
  assert.match(stage104, /^commit;/m);
  assert.match(verify, /pin_login_preflight_v1/);
  assert.match(verify, /server_version/);
  assert.equal((stage3.match(/\$fn\$/g) || []).length % 2, 0);
  assert.equal((stage4.match(/\$fn\$/g) || []).length % 2, 0);
});

test('security and release rules: no global session token, no inline script allowance, no large-array Math spread', () => {
  const index = read('index.html');
  assert.doesNotMatch(index, /script-src[^;]*'unsafe-inline'/);
  assert.match(index, /buildBootstrap\.js\?v=10\.4/);
  assert.match(index, /backendWarningBanner/);
  assert.doesNotMatch(read('cloudProjects.js'), /PulumurCurrentSession/);
  assert.doesNotMatch(read('adminUsersApi.js'), /PulumurCurrentSession/);
  const risky = allSourceFiles().filter(file => /\.(?:js|mjs|ts)$/.test(file)).flatMap(file => {
    const source = fs.readFileSync(file, 'utf8');
    return /Math\.(?:min|max)\s*\(\s*\.\.\./.test(source) ? [path.relative(root, file)] : [];
  });
  assert.deepEqual(risky, []);
});

test('all visible application release markers are V10.4 and service-worker cache is isolated', () => {
  assert.match(read('app.js'), /APP_VERSION = '10\.4'/);
  assert.match(read('buildBootstrap.js'), /const build = '10\.4'/);
  assert.match(read('sw.js'), /pulumur-pwa-/);
  assert.match(read('sw.js'), /v10_4/);
  assert.match(read('supabase/functions/admin-users/index.ts'), /version: '10\.4'/);
  assert.doesNotMatch(read('sw.js'), /caches\.delete\([^)]*name[^)]*\)(?![\s\S]*startsWith)/);
});

let passed = 0;
const failures = [];
for (const item of tests) {
  try {
    await item.fn();
    passed += 1;
    console.log(`✓ ${item.name}`);
  } catch (error) {
    failures.push({ name: item.name, error });
    console.error(`✗ ${item.name}`);
    console.error(error && error.stack || error);
  }
}

console.log(`\n${passed}/${tests.length} tests passed.`);
if (failures.length) process.exitCode = 1;
