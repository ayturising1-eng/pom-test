(function () {
  'use strict';
  window.confirm = () => false;
  window.alert = () => {};
  window.jspdf = { jsPDF: class MockJsPdf {} };

  const user = { id: 'user-1', email: 'admin@local.invalid' };
  let activeSession = null;
  const authListeners = [];
  const profile = {
    id: 'user-1', organization_id: 'org-1', username: 'admin', full_name: 'System Admin',
    role: 'system_admin', is_active: true, session_revoked_at: null
  };
  const organization = {
    id: 'org-1', name: 'PLMR Test', slug: 'plmr-test', company_code: '0001', is_active: true,
    license_start: '2026-01-01', license_end: '2030-12-31', max_users: 10, enabled_products: ['PERGO_RISE']
  };

  function tableResult(table, mode) {
    if (table === 'profiles') return mode === 'array' ? [profile] : profile;
    if (table === 'organizations') return mode === 'array' ? [organization] : organization;
    if (table === 'projects' || table === 'project_revisions' || table === 'activity_logs') return mode === 'array' ? [] : null;
    return mode === 'array' ? [] : null;
  }

  function query(table) {
    const state = { mode: 'array' };
    const api = {
      select() { return api; }, eq() { return api; }, neq() { return api; }, is() { return api; }, in() { return api; },
      order() { return api; }, limit() { return api; }, range() { return api; }, filter() { return api; },
      insert() { return api; }, update() { return api; }, upsert() { return api; }, delete() { return api; },
      single() { state.mode = 'single'; return Promise.resolve({ data: tableResult(table, 'single'), error: null }); },
      maybeSingle() { state.mode = 'single'; return Promise.resolve({ data: tableResult(table, 'single'), error: null }); },
      then(resolve, reject) { return Promise.resolve({ data: tableResult(table, state.mode), error: null }).then(resolve, reject); }
    };
    return api;
  }

  const client = {
    auth: {
      onAuthStateChange(callback) { authListeners.push(callback); return { data: { subscription: { unsubscribe() {} } } }; },
      async getSession() { return { data: { session: activeSession }, error: null }; },
      async getUser() { return { data: { user: activeSession ? user : null }, error: null }; },
      async setSession(tokens) {
        activeSession = { access_token: tokens.access_token, refresh_token: tokens.refresh_token, user };
        queueMicrotask(() => authListeners.forEach(listener => listener('SIGNED_IN', activeSession)));
        return { data: { session: activeSession }, error: null };
      },
      async signOut() { activeSession = null; queueMicrotask(() => authListeners.forEach(listener => listener('SIGNED_OUT', null))); return { error: null }; }
    },
    from(table) { return query(table); },
    async rpc(name) {
      if (name === 'get_effective_app_limits_v1') {
        return { data: null, error: { code: 'PGRST202', message: 'Could not find the function public.get_effective_app_limits_v1 in the schema cache' } };
      }
      return { data: true, error: null };
    }
  };
  window.supabase = { createClient: () => client };

  const originalFetch = window.fetch.bind(window);
  window.fetch = async (input, init = {}) => {
    const url = String(typeof input === 'string' ? input : input && input.url || '');
    if (!url.includes('/functions/v1/admin-users')) return originalFetch(input, init);
    let body = {};
    try { body = JSON.parse(String(init.body || '{}')); } catch (_) {}
    const payload = body.action === 'health'
      ? { ok: true, version: '10.4', function: 'admin-users', capabilities: { backend_version: null, schema_stage: 2, migration_required: true, rate_limit_mode: 'memory-fallback', central_limits: false, optimistic_locking: false, session_revocation: false } }
      : body.action === 'login'
        ? { ok: true, user_id: 'user-1', username: 'admin', rate_limit_mode: 'memory-fallback', backend_warning: 'STAGE3_RATE_LIMIT_MIGRATION_MISSING', session: { access_token: 'test-access-token', refresh_token: 'test-refresh-token' } }
        : { ok: true };
    return new Response(JSON.stringify(payload), { status: 200, headers: { 'Content-Type': 'application/json' } });
  };
})();
