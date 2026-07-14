(function () {
  'use strict';

  const DB_NAME = 'pulumur-recovery-v1';
  const STORE_NAME = 'snapshots';
  const LOCAL_PREFIX = 'plmr_recovery_v1:';
  const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
  const MAX_BYTES = 10 * 1024 * 1024;
  let timer = null;
  let pending = null;

  function validUserId(value) {
    return String(value || '').trim().slice(0, 128);
  }

  function validateSnapshot(snapshot) {
    if (!snapshot || snapshot.format !== 'PULUMUR_PROJECT' || Number(snapshot.schemaVersion) !== 2 || !snapshot.projectModel) {
      throw new Error('RECOVERY_SNAPSHOT_INVALID');
    }
    const serialized = JSON.stringify(snapshot);
    const bytes = new Blob([serialized]).size;
    if (bytes > MAX_BYTES) throw new Error('RECOVERY_SNAPSHOT_TOO_LARGE');
    return { serialized, bytes };
  }

  function openDb() {
    return new Promise((resolve, reject) => {
      if (!('indexedDB' in window)) return reject(new Error('INDEXEDDB_UNAVAILABLE'));
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME, { keyPath: 'userId' });
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('INDEXEDDB_OPEN_FAILED'));
    });
  }

  async function idbPut(record) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      transaction.objectStore(STORE_NAME).put(record);
      transaction.oncomplete = () => { db.close(); resolve(); };
      transaction.onerror = () => { const error = transaction.error; db.close(); reject(error || new Error('INDEXEDDB_WRITE_FAILED')); };
    });
  }

  async function idbGet(userId) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const request = transaction.objectStore(STORE_NAME).get(userId);
      request.onsuccess = () => { const value = request.result || null; db.close(); resolve(value); };
      request.onerror = () => { const error = request.error; db.close(); reject(error || new Error('INDEXEDDB_READ_FAILED')); };
    });
  }

  async function idbDelete(userId) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      transaction.objectStore(STORE_NAME).delete(userId);
      transaction.oncomplete = () => { db.close(); resolve(); };
      transaction.onerror = () => { const error = transaction.error; db.close(); reject(error || new Error('INDEXEDDB_DELETE_FAILED')); };
    });
  }

  function localKey(userId) {
    return `${LOCAL_PREFIX}${userId}`;
  }

  async function writeRecord(record) {
    try { await idbPut(record); return 'indexeddb'; }
    catch (_) {
      if (record.bytes > 4 * 1024 * 1024) throw new Error('RECOVERY_STORAGE_UNAVAILABLE');
      localStorage.setItem(localKey(record.userId), JSON.stringify(record));
      return 'localstorage';
    }
  }

  async function readRecord(userId) {
    let record = null;
    try { record = await idbGet(userId); }
    catch (_) {
      try { record = JSON.parse(localStorage.getItem(localKey(userId)) || 'null'); } catch (_) { record = null; }
    }
    if (!record) return null;
    const created = Date.parse(record.updatedAt || '');
    if (!Number.isFinite(created) || Date.now() - created > MAX_AGE_MS) {
      await clear(userId);
      return null;
    }
    try {
      const snapshot = JSON.parse(record.serialized);
      validateSnapshot(snapshot);
      return { ...record, snapshot };
    } catch (_) {
      await clear(userId);
      return null;
    }
  }

  async function saveNow(userId, snapshot, meta) {
    const normalizedUserId = validUserId(userId);
    if (!normalizedUserId) return false;
    const checked = validateSnapshot(snapshot);
    const record = {
      userId: normalizedUserId,
      serialized: checked.serialized,
      bytes: checked.bytes,
      updatedAt: new Date().toISOString(),
      projectCode: String(meta && meta.projectCode || '').slice(0, 64),
      revisionNo: Math.max(1, Number(meta && meta.revisionNo) || 1),
      appVersion: String(snapshot.appVersion || window.PULUMUR_BUILD || '10.4')
    };
    await writeRecord(record);
    return true;
  }

  function schedule(userId, snapshot, meta, delay = 1500) {
    pending = { userId, snapshot, meta };
    if (timer) clearTimeout(timer);
    timer = window.setTimeout(() => {
      const next = pending;
      timer = null;
      pending = null;
      if (!next) return;
      saveNow(next.userId, next.snapshot, next.meta).catch(error => {
        if (window.PulumurRuntimeMonitor) window.PulumurRuntimeMonitor.record('recovery.save', error);
      });
    }, Math.max(250, Number(delay) || 1500));
  }

  async function flush() {
    if (!pending) return false;
    if (timer) clearTimeout(timer);
    timer = null;
    const next = pending;
    pending = null;
    return saveNow(next.userId, next.snapshot, next.meta);
  }

  async function clear(userId) {
    const normalizedUserId = validUserId(userId);
    if (!normalizedUserId) return;
    try { await idbDelete(normalizedUserId); } catch (_) {}
    try { localStorage.removeItem(localKey(normalizedUserId)); } catch (_) {}
  }

  function cancel() {
    if (timer) clearTimeout(timer);
    timer = null;
    pending = null;
  }

  window.PulumurRecovery = Object.freeze({
    schedule,
    flush,
    latest: userId => readRecord(validUserId(userId)),
    clear,
    cancel,
    saveNow
  });
})();
