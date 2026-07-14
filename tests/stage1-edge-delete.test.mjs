import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';

const require = createRequire(import.meta.url);
const npmRoot = execFileSync('npm', ['root', '-g'], { encoding: 'utf8' }).trim();
const ts = require(`${npmRoot}/typescript/lib/typescript.js`);

class Query {
  constructor(state, table) {
    this.state = state;
    this.table = table;
    this.filters = [];
    this.operation = 'select';
    this.values = null;
    this.options = {};
    this.singleMode = '';
  }
  select(_columns = '*', options = {}) { this.options = options || {}; return this; }
  delete() { this.operation = 'delete'; return this; }
  insert(values) { this.operation = 'insert'; this.values = Array.isArray(values) ? values : [values]; return this; }
  eq(key, value) { this.filters.push(row => row[key] === value); return this; }
  neq(key, value) { this.filters.push(row => row[key] !== value); return this; }
  single() { this.singleMode = 'single'; return this.execute(); }
  maybeSingle() { this.singleMode = 'maybe'; return this.execute(); }
  then(resolve, reject) { return this.execute().then(resolve, reject); }
  async execute() {
    const rows = this.state.db[this.table];
    if (!rows) return { data: null, error: { message: `relation ${this.table} does not exist` }, count: null };
    const matched = rows.filter(row => this.filters.every(filter => filter(row)));
    if (this.operation === 'select') {
      if (this.options.head) return { data: null, error: null, count: matched.length };
      if (this.singleMode === 'single') {
        return matched.length === 1
          ? { data: { ...matched[0] }, error: null, count: 1 }
          : { data: null, error: { message: 'single row expected' }, count: matched.length };
      }
      if (this.singleMode === 'maybe') {
        return matched.length <= 1
          ? { data: matched[0] ? { ...matched[0] } : null, error: null, count: matched.length }
          : { data: null, error: { message: 'multiple rows returned' }, count: matched.length };
      }
      return { data: matched.map(row => ({ ...row })), error: null, count: matched.length };
    }
    if (this.operation === 'delete') {
      const deleted = [];
      for (let i = rows.length - 1; i >= 0; i -= 1) {
        if (this.filters.every(filter => filter(rows[i]))) deleted.unshift(...rows.splice(i, 1));
      }
      return { data: deleted, error: null, count: deleted.length };
    }
    if (this.operation === 'insert') {
      if (this.table === 'activity_logs' && this.state.failActivityLog) {
        return { data: null, error: { message: 'activity log unavailable' }, count: 0 };
      }
      const inserted = this.values.map(row => ({ ...row }));
      rows.push(...inserted);
      return { data: inserted, error: null, count: inserted.length };
    }
    return { data: null, error: null, count: null };
  }
}

function makeState() {
  return {
    actorId: 'sys-1',
    failActivityLog: false,
    db: {
      profiles: [
        { id: 'sys-1', organization_id: 'org-system', role: 'system_admin', is_active: true, username: 'root', full_name: 'Root Admin' },
        { id: 'sys-2', organization_id: 'org-system', role: 'system_admin', is_active: true, username: 'root2', full_name: 'Root Two' },
        { id: 'admin-1', organization_id: 'org-1', role: 'company_admin', is_active: true, username: 'sibel', full_name: 'Sibel' },
        { id: 'designer-1', organization_id: 'org-1', role: 'designer', is_active: true, username: 'designer', full_name: 'Designer' },
        { id: 'designer-2', organization_id: 'org-2', role: 'designer', is_active: true, username: 'other', full_name: 'Other' },
      ],
      organizations: [
        { id: 'org-system', name: 'System', company_code: 'SYS' },
        { id: 'org-1', name: 'Pulumur', company_code: 'PLMR' },
        { id: 'org-2', name: 'Other', company_code: 'OTHR' },
      ],
      projects: [
        { id: 'project-admin', organization_id: 'org-1', created_by: 'admin-1' },
        { id: 'project-designer', organization_id: 'org-1', created_by: 'designer-1' },
      ],
      activity_logs: [],
    },
    authUsers: new Set(['sys-1', 'sys-2', 'admin-1', 'designer-1', 'designer-2']),
  };
}

function makeClients(state) {
  const adminClient = {
    from: table => new Query(state, table),
    rpc: async name => ({ data: null, error: { message: `unexpected rpc ${name}` } }),
    auth: {
      admin: {
        deleteUser: async id => {
          if (!state.authUsers.has(id)) return { error: { message: 'user not found' } };
          state.authUsers.delete(id);
          state.db.profiles = state.db.profiles.filter(row => row.id !== id);
          for (const project of state.db.projects) {
            if (project.created_by === id) project.created_by = null;
          }
          return { error: null };
        },
      },
    },
  };
  const userClient = {
    auth: {
      getUser: async () => ({ data: { user: { id: state.actorId } }, error: null }),
    },
  };
  const authClient = { auth: {} };
  return { adminClient, userClient, authClient };
}

async function loadHandler(state) {
  const clients = makeClients(state);
  const createClient = (_url, key, options) => {
    if (key === 'service-role') return clients.adminClient;
    if (options?.global?.headers?.Authorization) return clients.userClient;
    return clients.authClient;
  };
  let source = fs.readFileSync(new URL('../supabase/functions/admin-users/index.ts', import.meta.url), 'utf8');
  source = source.replace(/^import[^\n]+\n/, '');
  source = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
  }).outputText;
  let handler = null;
  const context = vm.createContext({
    console,
    Request,
    Response,
    Headers,
    TextEncoder,
    Uint8Array,
    crypto,
    createClient,
    Deno: {
      env: {
        get: key => ({
          SUPABASE_URL: 'https://example.supabase.co',
          SUPABASE_ANON_KEY: 'anon',
          SUPABASE_SERVICE_ROLE_KEY: 'service-role',
          PLMR_PIN_PEPPER: 'pepper',
        })[key] || '',
      },
      serve: fn => { handler = fn; },
    },
  });
  vm.runInContext(source, context, { filename: 'admin-users/index.ts' });
  assert.equal(typeof handler, 'function');
  return handler;
}

async function call(handler, body, auth = true) {
  const headers = { 'content-type': 'application/json' };
  if (auth) headers.Authorization = 'Bearer test-token';
  const response = await handler(new Request('https://example.test/admin-users', {
    method: 'POST', headers, body: JSON.stringify({ action: 'delete_user', ...body }),
  }));
  const payload = await response.json();
  return { status: response.status, payload };
}

async function scenario(testFn) {
  const state = makeState();
  const handler = await loadHandler(state);
  await testFn({ state, handler });
}

await scenario(async ({ state, handler }) => {
  const result = await call(handler, { userId: 'sys-1' });
  assert.equal(result.status, 409);
  assert.equal(result.payload.error, 'SELF_DELETE_NOT_ALLOWED');
  assert.ok(state.authUsers.has('sys-1'));
});

await scenario(async ({ state, handler }) => {
  const result = await call(handler, { userId: 'sys-2' });
  assert.equal(result.status, 409);
  assert.equal(result.payload.error, 'SYSTEM_ADMIN_PROTECTED');
  assert.ok(state.authUsers.has('sys-2'));
});

await scenario(async ({ state, handler }) => {
  state.actorId = 'admin-1';
  const result = await call(handler, {
    userId: 'designer-1',
    confirmLastCompanyAdmin: true,
    confirmationUsername: 'designer',
  });
  assert.equal(result.status, 403);
  assert.equal(result.payload.error, 'SYSTEM_ADMIN_REQUIRED');
  assert.ok(state.authUsers.has('designer-1'));
});

await scenario(async ({ state, handler }) => {
  let result = await call(handler, { userId: 'admin-1', deleteProjects: false });
  assert.equal(result.status, 409);
  assert.equal(result.payload.error, 'LAST_COMPANY_ADMIN_CONFIRMATION_REQUIRED');
  assert.ok(state.authUsers.has('admin-1'));

  result = await call(handler, {
    userId: 'admin-1', deleteProjects: false,
    confirmLastCompanyAdmin: true, confirmationUsername: 'wrong',
  });
  assert.equal(result.status, 409);
  assert.equal(result.payload.error, 'LAST_COMPANY_ADMIN_CONFIRMATION_REQUIRED');
  assert.ok(state.authUsers.has('admin-1'));

  result = await call(handler, {
    userId: 'admin-1', deleteProjects: false,
    confirmLastCompanyAdmin: true, confirmationUsername: '  SIBEL  ',
  });
  assert.equal(result.status, 200);
  assert.equal(result.payload.lastCompanyAdminOverride, true);
  assert.equal(result.payload.activityLogRecorded, true);
  assert.ok(!state.authUsers.has('admin-1'));
  const project = state.db.projects.find(row => row.id === 'project-admin');
  assert.ok(project);
  assert.equal(project.created_by, null);
  const log = state.db.activity_logs.at(-1);
  assert.equal(log.action, 'user_delete');
  assert.equal(log.detail.last_company_admin_override, true);
  assert.equal(log.detail.confirmation_method, 'exact_username');
  assert.equal(log.detail.delete_projects, false);
});

await scenario(async ({ state, handler }) => {
  state.db.profiles.push({
    id: 'admin-2', organization_id: 'org-1', role: 'company_admin', is_active: true,
    username: 'second.admin', full_name: 'Second Admin',
  });
  state.authUsers.add('admin-2');
  const result = await call(handler, { userId: 'admin-1', deleteProjects: false });
  assert.equal(result.status, 200);
  assert.equal(result.payload.lastCompanyAdminOverride, false);
});

await scenario(async ({ state, handler }) => {
  const result = await call(handler, { userId: 'designer-1', deleteProjects: true });
  assert.equal(result.status, 200);
  assert.equal(result.payload.deletedProjectCount, 1);
  assert.equal(state.db.projects.some(row => row.id === 'project-designer'), false);
  const log = state.db.activity_logs.at(-1);
  assert.equal(log.detail.delete_projects, true);
  assert.equal(log.detail.deleted_project_count, 1);
  assert.equal(log.detail.last_company_admin_override, false);
});

await scenario(async ({ state, handler }) => {
  state.failActivityLog = true;
  const result = await call(handler, { userId: 'designer-1', deleteProjects: false });
  assert.equal(result.status, 200);
  assert.equal(result.payload.activityLogRecorded, false);
  assert.equal(result.payload.activityLogError, 'ACTIVITY_LOG_WRITE_FAILED');
  assert.ok(!state.authUsers.has('designer-1'));
});

console.log('PASS stage1-edge-delete: authorization, last-admin confirmation, project modes and audit behavior');
