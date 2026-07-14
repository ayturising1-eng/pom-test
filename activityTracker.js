(function () {
  'use strict';

  const SESSION_KEY = 'plmr_usage_session_id';
  const TOUCH_INTERVAL_MS = 3 * 60 * 1000;

  let client = null;
  let sessionId = null;
  let touchTimer = null;
  let started = false;

  function makeUuid() {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') return window.crypto.randomUUID();
    const bytes = new Uint8Array(16);
    if (window.crypto && typeof window.crypto.getRandomValues === 'function') window.crypto.getRandomValues(bytes);
    else for (let i = 0; i < bytes.length; i += 1) bytes[i] = Math.floor(Math.random() * 256);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, value => value.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }

  function getSessionId() {
    if (sessionId) return sessionId;
    try {
      sessionId = sessionStorage.getItem(SESSION_KEY) || '';
      if (!sessionId) {
        sessionId = makeUuid();
        sessionStorage.setItem(SESSION_KEY, sessionId);
      }
    } catch (_) {
      sessionId = makeUuid();
    }
    return sessionId;
  }

  async function rpc(name, args) {
    const activeClient = client || window.PulumurSupabase;
    if (!activeClient || typeof activeClient.rpc !== 'function') return null;
    const result = await activeClient.rpc(name, args || {});
    if (result && result.error) throw result.error;
    return result ? result.data : null;
  }

  async function start() {
    if (started) return;
    started = true;
    try {
      await rpc('start_usage_session_v1', { p_session_id: getSessionId() });
    } catch (error) {
      console.warn('Usage session could not be started.', error);
    }
  }

  async function identify() {
    try {
      await rpc('identify_usage_session_v1', { p_session_id: getSessionId() });
    } catch (error) {
      console.warn('Usage session could not be identified.', error);
    }
  }

  async function touch() {
    if (document.visibilityState === 'hidden') return;
    try {
      await rpc('touch_public_usage_session_v1', { p_session_id: getSessionId() });
    } catch (_) {
      // Tracking must never interrupt the drawing workflow.
    }
  }

  async function end() {
    try {
      await rpc('end_usage_session_v1', { p_session_id: getSessionId() });
    } catch (_) {}
  }

  async function log(action, options) {
    const opts = options || {};
    if (!action) return null;
    try {
      return await rpc('log_activity_v1', {
        p_session_id: getSessionId(),
        p_action: String(action),
        p_project_id: opts.projectId || null,
        p_project_code: opts.projectCode || null,
        p_revision_no: Number.isFinite(Number(opts.revisionNo)) ? Number(opts.revisionNo) : null,
        p_detail: opts.detail && typeof opts.detail === 'object' ? opts.detail : {},
        p_context_organization_id: opts.organizationId || null
      });
    } catch (error) {
      console.warn(`Activity could not be logged: ${action}`, error);
      return null;
    }
  }

  async function init(supabaseClient) {
    client = supabaseClient || window.PulumurSupabase || null;
    await start();
    if (touchTimer) window.clearInterval(touchTimer);
    touchTimer = window.setInterval(touch, TOUCH_INTERVAL_MS);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') void touch();
    });
  }

  window.PulumurActivity = Object.freeze({
    init,
    start,
    identify,
    touch,
    end,
    log,
    getSessionId
  });
})();
