(function () {
  'use strict';

  const config = window.PulumurSupabaseConfig || {};
  const baseUrl = String(config.url || '').replace(/\/+$/, '');
  const publishableKey = String(config.publishableKey || '');
  const endpoint = `${baseUrl}/functions/v1/admin-users`;

  function normalizeError(payload, status) {
    const code = payload && (payload.error || payload.code || payload.message);
    const detail = code ? String(code) : `HTTP_${status}`;
    const error = new Error(detail);
    error.code = detail;
    error.status = status;
    error.payload = payload || null;
    return error;
  }

  async function getAccessToken() {
    // 1) Prefer the session already held in memory by cloudProjects.js.
    const bridgeToken = window.PulumurCloudAuth && typeof window.PulumurCloudAuth.getAccessToken === 'function'
      ? window.PulumurCloudAuth.getAccessToken()
      : '';
    if (bridgeToken) return String(bridgeToken);

    const directToken = window.PulumurCurrentSession && window.PulumurCurrentSession.access_token
      ? String(window.PulumurCurrentSession.access_token)
      : '';
    if (directToken) return directToken;

    // 2) Fall back to the active Supabase browser client.
    const client = window.PulumurSupabase || null;
    if (!client || !client.auth) return '';
    const result = await client.auth.getSession();
    if (result && result.error) throw result.error;
    return String(result && result.data && result.data.session && result.data.session.access_token || '');
  }

  async function invoke(action, body, options) {
    if (!baseUrl || !publishableKey) throw normalizeError({ error: 'SUPABASE_CONFIG_MISSING' }, 0);
    const opts = options || {};
    const headers = {
      'Content-Type': 'application/json',
      'apikey': publishableKey
    };
    if (opts.auth !== false) {
      const accessToken = await getAccessToken();
      if (!accessToken) throw normalizeError({ error: 'AUTH_REQUIRED' }, 401);
      headers.Authorization = `Bearer ${accessToken}`;
    }

    let response;
    try {
      response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(Object.assign({}, body || {}, { action }))
      });
    } catch (networkError) {
      const error = normalizeError({ error: 'FUNCTION_NETWORK_ERROR' }, 0);
      error.cause = networkError;
      throw error;
    }

    let payload = null;
    const raw = await response.text();
    if (raw) {
      try { payload = JSON.parse(raw); }
      catch (_) { payload = { error: raw.slice(0, 500) }; }
    }
    if (!response.ok || (payload && payload.error)) throw normalizeError(payload, response.status);
    return payload || { ok: true };
  }

  async function health() {
    return invoke('health', {}, { auth: false });
  }

  async function diagnostics() {
    const accessToken = await getAccessToken();
    return {
      endpoint,
      hasAccessToken: Boolean(accessToken),
      tokenLength: accessToken.length,
      build: '8.9.11'
    };
  }

  window.PulumurAdminUsersApi = Object.freeze({ invoke, health, diagnostics, endpoint });
})();
