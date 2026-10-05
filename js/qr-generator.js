/**
 * QR Generator Module
 * Wraps qr-code-styling: builds options, updates instances, and provides export helpers.
 */
(function (global) {
  'use strict';

  var QRCodeStyling = global.QRCodeStyling;

  function buildGradient(type, rotationDegrees, colorFrom, colorTo) {
    var rad = (rotationDegrees != null ? parseFloat(rotationDegrees) : 0) * (Math.PI / 180);
    return {
      type: type || 'linear',
      rotation: rad,
      colorStops: [
        { offset: 0, color: colorFrom || '#6366f1' },
        { offset: 1, color: colorTo || '#8b5cf6' }
      ]
    };
  }

  function clamp(value, min, max, fallback) {
    var parsed = parseFloat(value);
    if (!isFinite(parsed)) return fallback;
    return Math.min(max, Math.max(min, parsed));
  }

  function buildOptions(state) {
    state = state || {};
    var opts = {
      width: state.size || 300,
      height: state.size || 300,
      data: state.data || '',
      margin: 10,
      qrOptions: { errorCorrectionLevel: state.ec || 'Q' },
      dotsOptions: {
        color: state.fgColor || '#1a1a2e',
        type: state.dotStyle || 'square'
      },
      cornersSquareOptions: {
        color: state.fgColor || '#1a1a2e',
        type: state.cornerSquare || 'square'
      },
      cornersDotOptions: {
        color: state.fgColor || '#1a1a2e',
        type: state.cornerDot || 'square'
      },
      backgroundOptions: {
        color: state.transparent ? 'transparent' : (state.bgColor || '#ffffff')
      }
    };

    if (state.useGradient && state.gradientFrom && state.gradientTo) {
      var gradient = buildGradient('linear', parseFloat(state.gradientRotation) || 0, state.gradientFrom, state.gradientTo);
      opts.dotsOptions.gradient = gradient;
      opts.cornersSquareOptions.gradient = gradient;
      opts.cornersDotOptions.gradient = gradient;
    }

    if (state.image) {
      opts.image = state.image;
      opts.imageOptions = {
        hideBackgroundDots: true,
        imageSize: clamp(state.logoImageSize, 0.2, 0.45, 0.32),
        margin: clamp(state.logoMargin, 0, 20, 6),
        crossOrigin: 'anonymous'
      };
    }

    return opts;
  }

  function createQR(container, initialState) {
    if (!QRCodeStyling) {
      throw new Error('QRCodeStyling not loaded. Ensure script is included.');
    }
    var options = buildOptions(initialState || {});
    var qr = new QRCodeStyling(options);
    if (container) {
      container.innerHTML = '';
      qr.append(container);
    }
    return {
      qr: qr,
      update: function (state) { qr.update(buildOptions(state || {})); },
      getRawData: function (extension) { return qr.getRawData(extension || 'png'); },
      download: function (opts) { return qr.download(opts || { name: 'qr', extension: 'png' }); }
    };
  }

  global.QRGenerator = {
    buildOptions: buildOptions,
    buildGradient: buildGradient,
    createQR: createQR
  };
})(typeof window !== 'undefined' ? window : this);
