(function (global) {
  'use strict';

  const FORMAT = 'PULUMUR_PROJECT';
  const SCHEMA_VERSION = 2;

  function dependencies() {
    if (!global.PulumurProjectModel || !global.PulumurProjectValidation) throw new Error('PROJECT_SCHEMA_DEPENDENCY_MISSING');
    return { model: global.PulumurProjectModel, validation: global.PulumurProjectValidation };
  }
  function checksumForModel(model) {
    const json = JSON.stringify(model);
    let hash = 2166136261;
    for (let index = 0; index < json.length; index += 1) {
      hash ^= json.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return `fnv1a32:${(hash >>> 0).toString(16).padStart(8, '0')}:${json.length}`;
  }

  function createEnvelope(rawModel, options) {
    const { model, validation } = dependencies();
    const projectModel = validation.validateProjectModel(rawModel, options);
    projectModel.lastAction = null;
    const createdAt = projectModel.metadata.createdAt || new Date().toISOString();
    const updatedAt = new Date().toISOString();
    projectModel.metadata.createdAt = createdAt;
    projectModel.metadata.updatedAt = updatedAt;
    return {
      format: FORMAT,
      schemaVersion: SCHEMA_VERSION,
      appVersion: String(options && options.appVersion || ''),
      createdAt,
      updatedAt,
      checksum: checksumForModel(projectModel),
      projectModel: model.clone(projectModel)
    };
  }

  function normalizeEnvelope(raw, options) {
    const { model, validation } = dependencies();
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new Error('PROJECT_FILE_NOT_OBJECT');
    if (raw.format !== FORMAT) throw new Error('PROJECT_FORMAT_INVALID');
    if (Number(raw.schemaVersion) !== SCHEMA_VERSION) throw new Error(`PROJECT_SCHEMA_UNSUPPORTED:${raw.schemaVersion}`);
    if (!raw.projectModel || typeof raw.projectModel !== 'object' || Array.isArray(raw.projectModel)) throw new Error('PROJECT_MODEL_MISSING');
    const projectModel = validation.validateProjectModel(model.clone(raw.projectModel), options);
    if (raw.checksum && String(raw.checksum) !== checksumForModel(projectModel)) throw new Error('PROJECT_CHECKSUM_INVALID');
    return {
      format: FORMAT,
      schemaVersion: SCHEMA_VERSION,
      appVersion: String(raw.appVersion || ''),
      createdAt: String(raw.createdAt || projectModel.metadata.createdAt || ''),
      updatedAt: String(raw.updatedAt || projectModel.metadata.updatedAt || ''),
      checksum: checksumForModel(projectModel),
      projectModel
    };
  }

  function serialize(rawModel, options) {
    const envelope = createEnvelope(rawModel, options);
    const text = JSON.stringify(envelope, null, 2);
    const maxMb = Math.max(1, Number(options && options.maxProjectFileMb) || 10);
    const bytes = typeof Blob !== 'undefined' ? new Blob([text]).size : (typeof Buffer !== 'undefined' ? Buffer.byteLength(text, 'utf8') : text.length * 2);
    if (bytes > maxMb * 1024 * 1024) throw new Error(`PROJECT_FILE_TOO_LARGE:${bytes}:${maxMb}`);
    return text;
  }

  function parse(text, options) {
    let raw;
    try { raw = JSON.parse(String(text == null ? '' : text)); }
    catch (_) { throw new Error('PROJECT_JSON_INVALID'); }
    return normalizeEnvelope(raw, options);
  }

  const api = Object.freeze({
    format: FORMAT, schemaVersion: SCHEMA_VERSION,
    checksumForModel, createEnvelope, normalizeEnvelope, serialize, parse
  });
  global.PulumurProjectSchema = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
