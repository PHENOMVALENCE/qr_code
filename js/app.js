/**
 * QR Code Generator — Main application
 * Handles UI, validation, live preview, export (PNG/SVG/PDF), clipboard, reset/undo, dark mode.
 */
(function () {
  'use strict';

  var QRGenerator = window.QRGenerator;
  var ContentTypes = window.ContentTypes;
  var qrInstance = null;
  var logoDataUrl = null;
  var undoStack = [];
  var UNDO_LIMIT = 20;

  // --- DOM refs (set in init) ---
  var el = {};

  /**
   * Collect current form/UI state for QR options. Uses ContentTypes to build encoded data from selected type.
   */
  function getState() {
    var fg = (el.fgColorText && el.fgColorText.value) || '#1a1a2e';
    var bg = (el.bgColorText && el.bgColorText.value) || '#ffffff';
    var transparent = !!(el.transparentBg && el.transparentBg.checked);
    var data = ContentTypes ? ContentTypes.buildContentData(el) : '';
    return {
      data: data || '',
      size: parseInt(el.qrSize && el.qrSize.value, 10) || 300,
      ec: (el.qrEc && el.qrEc.value) || 'Q',
      fgColor: fg,
      bgColor: bg,
      transparent: transparent,
      useGradient: !!(el.useGradient && el.useGradient.checked),
      gradientFrom: (el.gradientFrom && el.gradientFrom.value) || '#6366f1',
      gradientTo: (el.gradientTo && el.gradientTo.value) || '#8b5cf6',
      gradientRotation: (el.gradientRotation && el.gradientRotation.value) || '0',
      cornerSquare: (el.cornerSquare && el.cornerSquare.value) || 'square',
      cornerDot: (el.cornerDot && el.cornerDot.value) || 'square',
      dotStyle: (el.dotStyle && el.dotStyle.value) || 'square',
      image: logoDataUrl || undefined,
      labelText: (el.labelText && el.labelText.value.trim()) || ''
    };
  }

  /**
   * Push current state to undo stack (clone, limit size).
   */
  function pushUndo() {
    var state = getState();
    var clone = JSON.parse(JSON.stringify({
      data: state.data,
      size: state.size,
      ec: state.ec,
      fgColor: state.fgColor,
      bgColor: state.bgColor,
      transparent: state.transparent,
      useGradient: state.useGradient,
      gradientFrom: state.gradientFrom,
      gradientTo: state.gradientTo,
      gradientRotation: state.gradientRotation,
      cornerSquare: state.cornerSquare,
      cornerDot: state.cornerDot,
      dotStyle: state.dotStyle,
      labelText: state.labelText
    }));
    undoStack.push(clone);
    if (undoStack.length > UNDO_LIMIT) undoStack.shift();
  }

  /**
   * Restore state from last undo and refresh UI + QR.
   */
  function undo() {
    if (undoStack.length === 0) return;
    var prev = undoStack.pop();
    // Undo restores design options only; content fields are not reverted
    if (el.qrSize) el.qrSize.value = String(prev.size || 300);
    if (el.qrEc) el.qrEc.value = prev.ec || 'Q';
    if (el.fgColorText) { el.fgColorText.value = prev.fgColor || '#1a1a2e'; syncColorInput('fg', prev.fgColor); }
    if (el.bgColorText) { el.bgColorText.value = prev.bgColor || '#ffffff'; syncColorInput('bg', prev.bgColor); }
    if (el.transparentBg) el.transparentBg.checked = !!prev.transparent;
    if (el.useGradient) el.useGradient.checked = !!prev.useGradient;
    if (el.gradientFrom) el.gradientFrom.value = prev.gradientFrom || '#6366f1';
    if (el.gradientTo) el.gradientTo.value = prev.gradientTo || '#8b5cf6';
    if (el.gradientRotation) el.gradientRotation.value = String(prev.gradientRotation || '0');
    if (el.cornerSquare) el.cornerSquare.value = prev.cornerSquare || 'square';
    if (el.cornerDot) el.cornerDot.value = prev.cornerDot || 'square';
    if (el.dotStyle) el.dotStyle.value = prev.dotStyle || 'square';
    if (el.labelText) el.labelText.value = prev.labelText || '';
    refreshQR();
  }

  /**
   * Sync color picker with text input.
   */
  function syncColorInput(which, hex) {
    var picker = which === 'fg' ? el.fgColor : el.bgColor;
    var text = which === 'fg' ? el.fgColorText : el.bgColorText;
    if (picker && hex) picker.value = hex.startsWith('#') ? hex : '#' + hex;
    if (text && hex) text.value = hex.startsWith('#') ? hex : '#' + hex;
  }

  /**
   * Show/hide preview empty message and label; enable/disable export buttons.
   */
  function setPreviewState(hasContent) {
    if (el.previewEmpty) el.previewEmpty.hidden = hasContent;
    if (el.previewLabel) {
      var state = getState();
      if (state.labelText && hasContent) {
        el.previewLabel.textContent = state.labelText;
        el.previewLabel.hidden = false;
      } else {
        el.previewLabel.hidden = true;
      }
    }
    var btns = [el.exportPng, el.exportSvg, el.exportPdf, el.copyClipboard, el.printBtn, el.saveDesignBtn];
    btns.forEach(function (b) { if (b) b.disabled = !hasContent; });
  }

  /**
   * Run validation and build/update QR preview (called by Generate button or debounced from input).
   */
  function doRefreshQR() {
    var validation = ContentTypes ? ContentTypes.validateContent(el) : { valid: false, message: 'Content types not loaded.' };
    var state = getState();
    if (el.inputError) {
      el.inputError.hidden = validation.valid;
      el.inputError.textContent = validation.message || '';
    }
    var hasContent = validation.valid && state.data.length > 0;
    setPreviewState(hasContent);
    if (!hasContent) {
      if (qrInstance && el.qrContainer) {
        el.qrContainer.innerHTML = '';
        qrInstance = null;
      }
      return;
    }
    try {
      if (!qrInstance) {
        if (!QRGenerator || !el.qrContainer) return;
        qrInstance = QRGenerator.createQR(el.qrContainer, state);
      } else {
        qrInstance.update(state);
      }
    } catch (err) {
      if (el.inputError) {
        el.inputError.hidden = false;
        el.inputError.textContent = err.message || 'Failed to generate QR code.';
      }
      setPreviewState(false);
    }
  }

  /**
   * Build QR and refresh preview (no reload). Debounced for typing.
   */
  var refreshTimeout;
  function refreshQR() {
    clearTimeout(refreshTimeout);
    refreshTimeout = setTimeout(doRefreshQR, 150);
  }

  /**
   * Generate QR code now (used by Generate button).
   */
  function generateQR() {
    clearTimeout(refreshTimeout);
    doRefreshQR();
  }

  /**
   * Show temporary message in export area.
   */
  function showExportMessage(msg, isError) {
    if (!el.exportMessage) return;
    el.exportMessage.textContent = msg;
    el.exportMessage.hidden = false;
    el.exportMessage.style.color = isError ? 'var(--error)' : 'var(--success)';
    setTimeout(function () { el.exportMessage.hidden = true; }, 3000);
  }

  function downloadPng() {
    if (!qrInstance) return;
    pushUndo();
    qrInstance.download({ name: 'qr-code', extension: 'png' })
      .then(function () { showExportMessage('PNG downloaded.'); })
      .catch(function () { showExportMessage('Download failed.', true); });
  }

  function downloadSvg() {
    if (!qrInstance) return;
    pushUndo();
    qrInstance.download({ name: 'qr-code', extension: 'svg' })
      .then(function () { showExportMessage('SVG downloaded.'); })
      .catch(function () { showExportMessage('Download failed.', true); });
  }

  function downloadPdf() {
    if (!qrInstance || typeof jspdf === 'undefined') {
      showExportMessage('PDF export requires jsPDF.', true);
      return;
    }
    pushUndo();
    qrInstance.getRawData('png').then(function (blob) {
      var reader = new FileReader();
      reader.onload = function () {
        var dataUrl = reader.result;
        var JsPDF = window.jspdf.jsPDF;
        var doc = new JsPDF({ orientation: 'portrait', unit: 'px', format: [getState().size + 40, getState().size + 80] });
        doc.addImage(dataUrl, 'PNG', 20, 20, getState().size, getState().size);
        var label = getState().labelText;
        if (label) doc.setFontSize(12).text(label, 20, getState().size + 48, { maxWidth: getState().size });
        doc.save('qr-code.pdf');
        showExportMessage('PDF downloaded.');
      };
      reader.readAsDataURL(blob);
    }).catch(function () { showExportMessage('PDF export failed.', true); });
  }

  function copyToClipboard() {
    if (!qrInstance) return;
    qrInstance.getRawData('png').then(function (blob) {
      if (navigator.clipboard && navigator.clipboard.write) {
        var item = new ClipboardItem({ 'image/png': blob });
        return navigator.clipboard.write([item]);
      }
      return Promise.reject(new Error('Clipboard API not available'));
    }).then(function () { showExportMessage('Image copied to clipboard.'); })
      .catch(function () { showExportMessage('Copy failed. Try downloading PNG.', true); });
  }

  function printQR() {
    if (!qrInstance) return;
    qrInstance.getRawData('png').then(function (blob) {
      var url = URL.createObjectURL(blob);
      var w = window.open('', '_blank');
      w.document.write('<html><head><title>QR Code</title></head><body style="margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;"><img src="' + url + '" alt="QR Code" /></body></html>');
      w.document.close();
      w.onload = function () { w.print(); w.onafterprint = function () { w.close(); URL.revokeObjectURL(url); }; };
    }).catch(function () { showExportMessage('Print failed.', true); });
  }

  function resetForm() {
    if (el.qrData) el.qrData.value = '';
    if (el.qrSize) el.qrSize.value = '300';
    if (el.qrEc) el.qrEc.value = 'Q';
    if (el.fgColor) el.fgColor.value = '#1a1a2e';
    if (el.fgColorText) el.fgColorText.value = '#1a1a2e';
    if (el.bgColor) el.bgColor.value = '#ffffff';
    if (el.bgColorText) el.bgColorText.value = '#ffffff';
    if (el.transparentBg) el.transparentBg.checked = false;
    if (el.useGradient) el.useGradient.checked = false;
    if (el.gradientFrom) el.gradientFrom.value = '#6366f1';
    if (el.gradientTo) el.gradientTo.value = '#8b5cf6';
    if (el.gradientRotation) el.gradientRotation.value = '0';
    if (el.cornerSquare) el.cornerSquare.value = 'square';
    if (el.cornerDot) el.cornerDot.value = 'square';
    if (el.dotStyle) el.dotStyle.value = 'square';
    if (el.labelText) el.labelText.value = '';
    if (el.labelInside) el.labelInside.checked = false;
    logoDataUrl = null;
    if (el.logoUpload) el.logoUpload.value = '';
    if (el.logoActions) el.logoActions.hidden = true;
    undoStack = [];
    updateCharCount();
    if (el.inputError) el.inputError.hidden = true;
    setPreviewState(false);
    if (qrInstance && el.qrContainer) {
      el.qrContainer.innerHTML = '';
      qrInstance = null;
    }
    showExportMessage('Form reset.');
  }

  function initDarkMode() {
    var stored = localStorage.getItem('qr-theme');
    var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    var dark = stored === 'dark' || (!stored && prefersDark);
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    if (el.darkModeToggle) el.darkModeToggle.setAttribute('aria-pressed', dark);
  }

  function toggleDarkMode() {
    var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    var next = isDark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('qr-theme', next);
    if (el.darkModeToggle) el.darkModeToggle.setAttribute('aria-pressed', next === 'dark');
  }

  function onLogoUpload(e) {
    var file = (e && e.target && e.target.files && e.target.files[0]) || null;
    if (!file || !file.type.startsWith('image/')) return;
    var reader = new FileReader();
    reader.onload = function (ev) {
      logoDataUrl = ev.target.result;
      if (el.logoActions) el.logoActions.hidden = false;
      refreshQR();
    };
    reader.readAsDataURL(file);
  }

  function removeLogo() {
    logoDataUrl = null;
    if (el.logoUpload) el.logoUpload.value = '';
    if (el.logoActions) el.logoActions.hidden = true;
    refreshQR();
  }

  // Map HTML ids (hyphenated) to el keys (camelCase) — design options only
  var inputIdToKey = [
    { id: 'qr-size', key: 'qrSize' },
    { id: 'qr-ec', key: 'qrEc' },
    { id: 'fg-color', key: 'fgColor' },
    { id: 'fg-color-text', key: 'fgColorText' },
    { id: 'bg-color', key: 'bgColor' },
    { id: 'bg-color-text', key: 'bgColorText' },
    { id: 'transparent-bg', key: 'transparentBg' },
    { id: 'use-gradient', key: 'useGradient' },
    { id: 'gradient-from', key: 'gradientFrom' },
    { id: 'gradient-to', key: 'gradientTo' },
    { id: 'gradient-rotation', key: 'gradientRotation' },
    { id: 'corner-square', key: 'cornerSquare' },
    { id: 'corner-dot', key: 'cornerDot' },
    { id: 'dot-style', key: 'dotStyle' },
    { id: 'label-text', key: 'labelText' },
    { id: 'label-inside', key: 'labelInside' }
  ];

  function bindInputs() {
    inputIdToKey.forEach(function (item) {
      var node = document.getElementById(item.id);
      if (node) {
        el[item.key] = node;
        node.addEventListener('input', refreshQR);
        node.addEventListener('change', refreshQR);
      }
    });
    if (el.fgColor && el.fgColorText) {
      el.fgColor.addEventListener('input', function () { el.fgColorText.value = el.fgColor.value; refreshQR(); });
      el.fgColorText.addEventListener('input', function () { syncColorInput('fg', el.fgColorText.value); refreshQR(); });
    }
    if (el.bgColor && el.bgColorText) {
      el.bgColor.addEventListener('input', function () { el.bgColorText.value = el.bgColor.value; refreshQR(); });
      el.bgColorText.addEventListener('input', function () { syncColorInput('bg', el.bgColorText.value); refreshQR(); });
    }
  }

  function init() {
    el.qrContainer = document.getElementById('qr-container');
    el.previewEmpty = document.getElementById('preview-empty');
    el.previewLabel = document.getElementById('preview-label');
    el.inputError = document.getElementById('input-error');
    el.charCount = document.getElementById('char-count');
    el.exportMessage = document.getElementById('export-message');
    el.exportPng = document.getElementById('export-png');
    el.exportSvg = document.getElementById('export-svg');
    el.exportPdf = document.getElementById('export-pdf');
    el.copyClipboard = document.getElementById('copy-clipboard');
    el.printBtn = document.getElementById('print-btn');
    el.darkModeToggle = document.getElementById('dark-mode-toggle');
    el.resetBtn = document.getElementById('reset-btn');
    el.undoBtn = document.getElementById('undo-btn');
    el.logoUpload = document.getElementById('logo-upload');
    el.logoActions = document.getElementById('logo-actions');
    el.removeLogo = document.getElementById('remove-logo');
    el.saveDesignBtn = document.getElementById('save-design-btn');
    el.generateBtn = document.getElementById('generate-btn');

    bindInputs();
    updateCharCount();
    initDarkMode();

    if (el.darkModeToggle) el.darkModeToggle.addEventListener('click', toggleDarkMode);
    if (el.resetBtn) el.resetBtn.addEventListener('click', resetForm);
    if (el.undoBtn) el.undoBtn.addEventListener('click', undo);
    if (el.generateBtn) el.generateBtn.addEventListener('click', generateQR);
    if (el.exportPng) el.exportPng.addEventListener('click', downloadPng);
    if (el.exportSvg) el.exportSvg.addEventListener('click', downloadSvg);
    if (el.exportPdf) el.exportPdf.addEventListener('click', downloadPdf);
    if (el.copyClipboard) el.copyClipboard.addEventListener('click', copyToClipboard);
    if (el.printBtn) el.printBtn.addEventListener('click', printQR);
    if (el.logoUpload) el.logoUpload.addEventListener('change', onLogoUpload);
    if (el.removeLogo) el.removeLogo.addEventListener('click', removeLogo);
    if (el.saveDesignBtn) el.saveDesignBtn.addEventListener('click', saveDesign);

    setPreviewState(false);
  }

  /**
   * Optional: save design to server (api/save-design.php). No-op if endpoint missing.
   */
  function saveDesign() {
    if (!qrInstance) return;
    var state = getState();
    qrInstance.getRawData('png').then(function (blob) {
      var reader = new FileReader();
      reader.onload = function () {
        var body = {
          data: state.data,
          options: {
            size: state.size,
            ec: state.ec,
            fgColor: state.fgColor,
            bgColor: state.bgColor,
            transparent: state.transparent,
            useGradient: state.useGradient,
            gradientFrom: state.gradientFrom,
            gradientTo: state.gradientTo,
            gradientRotation: state.gradientRotation,
            cornerSquare: state.cornerSquare,
            cornerDot: state.cornerDot,
            dotStyle: state.dotStyle,
            labelText: state.labelText
          },
          imageBase64: reader.result
        };
        fetch('api/save-design.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        }).then(function (r) { return r.json(); }).then(function (res) {
          if (res.success) showExportMessage('Design saved. ID: ' + res.id);
          else showExportMessage(res.error || 'Save failed', true);
        }).catch(function () { showExportMessage('Save failed (server may be offline)', true); });
      };
      reader.readAsDataURL(blob);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
