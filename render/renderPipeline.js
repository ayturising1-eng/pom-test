(function (global) {
  'use strict';

  function buildFromModel(rawModel, options) {
    if (!global.PulumurProjectModel) throw new Error('PROJECT_MODEL_NOT_READY');
    if (!options || typeof options.buildGeometry !== 'function') throw new Error('GEOMETRY_BUILDER_MISSING');
    const model = global.PulumurProjectValidation
      ? global.PulumurProjectValidation.validateProjectModel(rawModel, options)
      : global.PulumurProjectModel.normalize(rawModel);
    const formData = global.PulumurProjectModel.geometryInputFromModel(model);
    if (typeof options.validateInput === 'function') options.validateInput(formData);
    const drawing = options.buildGeometry(formData);
    if (!drawing || !drawing.input || !Array.isArray(drawing.entities)) throw new Error('GEOMETRY_BUILD_INVALID');
    if (typeof options.validateDrawing === 'function') options.validateDrawing(drawing);
    return { model, formData, drawing };
  }

  const api = Object.freeze({ buildFromModel });
  global.PulumurRenderPipeline = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
