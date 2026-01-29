/**
 * QR Generator Module
 * Wraps qr-code-styling: builds options, updates instance, and provides export helpers.
 * No external paid services; runs in browser.
 */
(function (global) {
  'use strict';

  // QRCodeStyling is loaded from CDN (global)
  var QRCodeStyling = global.QRCodeStyling;

  /**
   * Build gradient object for qr-code-styling.
   * @param {string} type - 'linear' or 'radial'
   * @param {number} rotationDegrees - rotation in degrees (0, 45, 90, etc.)
   * @param {string} colorFrom - hex color
   * @param {string} colorTo - hex color
   * @returns {object} gradient config
   */
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

  /**
   * Build full options object for QRCodeStyling from UI state.
   * @param {object} state - { data, size, ec, fgColor, bgColor, transparent, gradient, cornerSquare, cornerDot, dotStyle, image, labelText }
   * @returns {object} options for new QRCodeStyling(options) or .update(options)
   */
  function buildOptions(state) {
    var opts = {
      width: state.size || 300,
      height: state.size || 300,
      data: state.data || '',
      margin: 10,
      qrOptions: {
        errorCorrectionLevel: state.ec || 'Q'
      },
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
        imageSize: 0.4,
        margin: 5,
        crossOrigin: 'anonymous'
      };
    }

    return opts;
  }

  /**
   * Create and return a QRCodeStyling instance; append to container and keep reference.
   * @param {HTMLElement} container - element to append QR into
   * @param {object} initialState - same shape as state for buildOptions
   * @returns {object} { qr, update, getRawData, download }
   */
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
      update: function (state) {
        var newOpts = buildOptions(state);
        qr.update(newOpts);
      },
      getRawData: function (extension) {
        return qr.getRawData(extension || 'png');
      },
      download: function (opts) {
        return qr.download(opts || { name: 'qr', extension: 'png' });
      }
    };
  }

  // Export for use in app.js
  global.QRGenerator = {
    buildOptions: buildOptions,
    buildGradient: buildGradient,
    createQR: createQR
  };
})(typeof window !== 'undefined' ? window : this);
