/* QR Studio Pro Tools — progressive enhancement layer */
(function () {
  'use strict';

  var HISTORY_KEY = 'qr-studio-history-v1';
  var VERIFY_DELAY = 450;
  var verificationTimer = null;

  function notify(message, isError) {
    var host = document.getElementById('export-message');
    if (!host) return;
    host.textContent = message;
    host.hidden = false;
    host.style.color = isError ? 'var(--error)' : 'var(--success)';
    clearTimeout(host._proTimeout);
    host._proTimeout = setTimeout(function () { host.hidden = true; }, 3500);
  }

  function ensureStyles() {
    if (document.querySelector('link[data-pro-tools]')) return;
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'css/pro-tools.css';
    link.setAttribute('data-pro-tools', 'true');
    document.head.appendChild(link);
  }

  function enhanceLogoControls() {
    var upload = document.getElementById('logo-upload');
    if (!upload || document.getElementById('logo-pro-controls')) return;
    var fieldset = upload.closest('fieldset');
    if (!fieldset) return;

    var controls = document.createElement('div');
    controls.id = 'logo-pro-controls';
    controls.className = 'logo-pro-controls';
    controls.innerHTML = '' +
      '<div class="row"><label for="logo-size">Logo size</label><div class="range-line"><input type="range" id="logo-size" min="20" max="45" value="32" step="1"><output id="logo-size-output">32%</output></div></div>' +
      '<div class="row"><label for="logo-margin">Logo clear space</label><div class="range-line"><input type="range" id="logo-margin" min="0" max="20" value="6" step="1"><output id="logo-margin-output">6px</output></div></div>' +
      '<p class="hint">PNG, JPEG, WebP or SVG. Maximum 2 MB. High error correction is recommended for logos.</p>';
    fieldset.insertBefore(controls, document.getElementById('logo-actions'));

    bindRange('logo-size', 'logo-size-output', '%');
    bindRange('logo-margin', 'logo-margin-output', 'px');
  }

  function bindRange(id, outputId, suffix) {
    var input = document.getElementById(id);
    var output = document.getElementById(outputId);
    if (!input || !output) return;
    input.addEventListener('input', function () {
      output.textContent = input.value + suffix;
      clickGenerate();
    });
  }

  function validateLogoUpload() {
    var input = document.getElementById('logo-upload');
    if (!input) return;
    input.addEventListener('change', function (event) {
      var file = event.target.files && event.target.files[0];
      if (!file) return;
      var allowed = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];
      if (allowed.indexOf(file.type) === -1) {
        event.stopImmediatePropagation();
        input.value = '';
        notify('Unsupported logo format. Use PNG, JPEG, WebP or SVG.', true);
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        event.stopImmediatePropagation();
        input.value = '';
        notify('Logo is too large. Maximum size is 2 MB.', true);
        return;
      }
      if (document.getElementById('qr-ec') && document.getElementById('qr-ec').value !== 'H') {
        document.getElementById('qr-ec').value = 'H';
        document.getElementById('qr-ec').dispatchEvent(new Event('change', { bubbles: true }));
        notify('Logo accepted. Error correction was raised to High (H).');
      }
    }, true);
  }

  function augmentState(state) {
    var copy = {};
    Object.keys(state || {}).forEach(function (key) { copy[key] = state[key]; });
    var size = document.getElementById('logo-size');
    var margin = document.getElementById('logo-margin');
    copy.logoImageSize = size ? Math.max(0.2, Math.min(0.45, parseInt(size.value, 10) / 100)) : 0.32;
    copy.logoMargin = margin ? Math.max(0, Math.min(20, parseInt(margin.value, 10))) : 6;
    return copy;
  }

  function patchGenerator() {
    if (!window.QRGenerator || window.QRGenerator.__proPatched) return;
    var originalCreate = window.QRGenerator.createQR;
    var originalBuildOptions = window.QRGenerator.buildOptions;

    window.QRGenerator.buildOptions = function (state) {
      var enhanced = augmentState(state || {});
      var opts = originalBuildOptions(enhanced);
      if (opts.imageOptions && enhanced.image) {
        opts.imageOptions.imageSize = enhanced.logoImageSize;
        opts.imageOptions.margin = enhanced.logoMargin;
      }
      return opts;
    };

    window.QRGenerator.createQR = function (container, state) {
      var instance = originalCreate(container, augmentState(state || {}));
      var originalUpdate = instance.update;
      instance.update = function (nextState) { return originalUpdate(augmentState(nextState || {})); };
      return instance;
    };
    window.QRGenerator.__proPatched = true;
  }

  function injectFrameControls() {
    var labelFieldset = document.getElementById('label-text');
    labelFieldset = labelFieldset && labelFieldset.closest('fieldset');
    if (!labelFieldset || document.getElementById('frame-style')) return;
    var block = document.createElement('div');
    block.className = 'frame-controls';
    block.innerHTML = '' +
      '<div class="row"><label for="frame-style">QR frame</label><select id="frame-style"><option value="none">No frame</option><option value="scan">Scan me</option><option value="website">Visit website</option><option value="menu">View menu</option><option value="wifi">Connect Wi-Fi</option><option value="contact">Save contact</option><option value="custom">Custom CTA</option></select></div>' +
      '<div class="row" id="custom-cta-row" hidden><label for="custom-cta">CTA text</label><input type="text" id="custom-cta" maxlength="40" placeholder="Scan to continue"></div>';
    labelFieldset.appendChild(block);

    document.getElementById('frame-style').addEventListener('change', applyFrame);
    document.getElementById('custom-cta').addEventListener('input', applyFrame);
    applyFrame();
  }

  function frameText() {
    var style = document.getElementById('frame-style');
    var value = style ? style.value : 'none';
    var labels = { scan: 'SCAN ME', website: 'VISIT WEBSITE', menu: 'VIEW MENU', wifi: 'CONNECT WI-FI', contact: 'SAVE CONTACT' };
    if (value === 'custom') {
      var custom = document.getElementById('custom-cta');
      return (custom && custom.value.trim()) || 'SCAN TO CONTINUE';
    }
    return labels[value] || '';
  }

  function applyFrame() {
    var wrap = document.getElementById('preview-wrap');
    var select = document.getElementById('frame-style');
    var customRow = document.getElementById('custom-cta-row');
    if (!wrap || !select) return;
    wrap.setAttribute('data-frame', select.value);
    wrap.setAttribute('data-frame-label', frameText());
    if (customRow) customRow.hidden = select.value !== 'custom';
  }

  function injectFramedExport() {
    var buttons = document.querySelector('.export-buttons');
    if (!buttons || document.getElementById('export-framed-png')) return;
    var button = document.createElement('button');
    button.type = 'button';
    button.id = 'export-framed-png';
    button.className = 'btn btn-secondary';
    button.textContent = 'Download framed PNG';
    button.addEventListener('click', downloadFramedPng);
    buttons.appendChild(button);
  }

  function previewCanvas() {
    var source = document.querySelector('#qr-container canvas');
    if (!source) return null;
    var canvas = document.createElement('canvas');
    canvas.width = source.width;
    canvas.height = source.height;
    canvas.getContext('2d').drawImage(source, 0, 0);
    return canvas;
  }

  function downloadFramedPng() {
    var source = previewCanvas();
    if (!source) {
      notify('Generate a QR code before exporting a framed PNG.', true);
      return;
    }
    var style = document.getElementById('frame-style');
    var hasFrame = style && style.value !== 'none';
    var label = frameText();
    var padding = Math.max(24, Math.round(source.width * 0.08));
    var footer = hasFrame ? Math.max(64, Math.round(source.width * 0.2)) : padding;
    var out = document.createElement('canvas');
    out.width = source.width + padding * 2;
    out.height = source.height + padding * 2 + footer;
    var ctx = out.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, out.width, out.height);
    ctx.fillStyle = '#111827';
    roundRect(ctx, 0, 0, out.width, out.height, Math.max(18, padding * 0.8));
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    roundRect(ctx, padding * 0.4, padding * 0.4, out.width - padding * 0.8, out.height - padding * 0.8, Math.max(14, padding * 0.55));
    ctx.fill();
    ctx.drawImage(source, padding, padding, source.width, source.height);
    if (hasFrame && label) {
      ctx.fillStyle = '#111827';
      ctx.font = '700 ' + Math.max(16, Math.round(source.width * 0.055)) + 'px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, out.width / 2, source.height + padding * 2 + footer / 2, out.width - padding * 2);
    }
    var a = document.createElement('a');
    a.href = out.toDataURL('image/png');
    a.download = 'qr-code-framed.png';
    document.body.appendChild(a);
    a.click();
    a.remove();
    notify('Framed PNG downloaded.');
  }

  function roundRect(ctx, x, y, w, h, r) {
    var radius = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
  }

  function loadHistory() {
    try {
      var data = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
      return Array.isArray(data) ? data : [];
    } catch (err) { return []; }
  }

  function saveHistory(history) {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }

  function enhanceHistoryActions() {
    var host = document.getElementById('studio-history');
    if (!host) return;
    Array.prototype.slice.call(host.querySelectorAll('.history-item')).forEach(function (item) {
      if (item.parentNode && item.parentNode.classList && item.parentNode.classList.contains('history-row')) return;
      var index = parseInt(item.getAttribute('data-history-index'), 10);
      var row = document.createElement('div');
      row.className = 'history-row';
      item.parentNode.insertBefore(row, item);
      row.appendChild(item);
      var actions = document.createElement('div');
      actions.className = 'history-actions';
      actions.innerHTML = '<button type="button" data-rename-project="' + index + '" aria-label="Rename project">Rename</button><button type="button" data-delete-project="' + index + '" aria-label="Delete project">Delete</button>';
      row.appendChild(actions);
    });
  }

  function bindHistoryActions() {
    var host = document.getElementById('studio-history');
    if (!host) return;
    host.addEventListener('click', function (event) {
      var rename = event.target.closest('[data-rename-project]');
      var del = event.target.closest('[data-delete-project]');
      if (!rename && !del) return;
      event.preventDefault();
      event.stopPropagation();
      var index = parseInt((rename || del).getAttribute(rename ? 'data-rename-project' : 'data-delete-project'), 10);
      var history = loadHistory();
      if (!history[index]) return;
      if (rename) {
        var next = window.prompt('Project name', history[index].name || 'QR project');
        if (next && next.trim()) {
          history[index].name = next.trim().slice(0, 60);
          saveHistory(history);
          rerenderHistory();
          notify('Project renamed.');
        }
      } else if (window.confirm('Delete this saved QR project?')) {
        history.splice(index, 1);
        saveHistory(history);
        rerenderHistory();
        notify('Project deleted.');
      }
    }, true);

    var observer = new MutationObserver(function () { enhanceHistoryActions(); });
    observer.observe(host, { childList: true, subtree: false });
    enhanceHistoryActions();
  }

  function rerenderHistory() {
    var host = document.getElementById('studio-history');
    if (!host) return;
    var clear = document.getElementById('studio-clear-history');
    if (clear) {
      clear.click();
      var history = loadHistory();
      if (history.length) saveHistory(history);
    }
    location.reload();
  }

  function injectVerificationPanel() {
    var readiness = document.getElementById('qr-readiness');
    if (!readiness || document.getElementById('qr-verification')) return;
    var div = document.createElement('div');
    div.id = 'qr-verification';
    div.className = 'qr-verification';
    div.innerHTML = '<span class="verification-dot"></span><div><strong>QR verification</strong><p id="qr-verification-text">Generate a QR code to verify its encoded payload.</p></div>';
    readiness.appendChild(div);
  }

  function loadJsQr(callback) {
    if (window.jsQR) { callback(); return; }
    var existing = document.querySelector('script[data-jsqr]');
    if (existing) { existing.addEventListener('load', callback, { once: true }); return; }
    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js';
    script.setAttribute('data-jsqr', 'true');
    script.onload = callback;
    document.head.appendChild(script);
  }

  function expectedPayload() {
    if (!window.ContentTypes) return '';
    var refs = { contentTypeContainer: document.getElementById('content-type-tabs') };
    var map = {
      contentUrl: 'content-url', contentText: 'content-text', contentPhone: 'content-phone',
      contentSmsNumber: 'content-sms-number', contentSmsBody: 'content-sms-body',
      contentWhatsappNumber: 'content-whatsapp-number', contentWhatsappMessage: 'content-whatsapp-message',
      contentEmail: 'content-email', contentEmailSubject: 'content-email-subject', contentEmailBody: 'content-email-body',
      contentWifiSsid: 'content-wifi-ssid', contentWifiPass: 'content-wifi-pass', contentWifiType: 'content-wifi-type',
      contentVcardName: 'content-vcard-name', contentVcardTel: 'content-vcard-tel', contentVcardEmail: 'content-vcard-email', contentVcardOrg: 'content-vcard-org',
      contentLat: 'content-lat', contentLng: 'content-lng', contentEventTitle: 'content-event-title', contentEventStart: 'content-event-start',
      contentEventEnd: 'content-event-end', contentEventLocation: 'content-event-location', contentEventDesc: 'content-event-desc'
    };
    Object.keys(map).forEach(function (key) { refs[key] = document.getElementById(map[key]); });
    return window.ContentTypes.buildContentData(refs);
  }

  function scheduleVerification() {
    clearTimeout(verificationTimer);
    verificationTimer = setTimeout(function () { loadJsQr(verifyQr); }, VERIFY_DELAY);
  }

  function verifyQr() {
    injectVerificationPanel();
    var text = document.getElementById('qr-verification-text');
    var panel = document.getElementById('qr-verification');
    var canvas = document.querySelector('#qr-container canvas');
    if (!text || !panel || !canvas || !window.jsQR) return;
    try {
      var ctx = canvas.getContext('2d');
      var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      var result = window.jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'attemptBoth' });
      var expected = expectedPayload();
      if (result && result.data === expected) {
        panel.setAttribute('data-status', 'good');
        text.textContent = 'Verified — decoded payload matches the current QR content.';
      } else if (result) {
        panel.setAttribute('data-status', 'warn');
        text.textContent = 'Decoded, but the payload differs from the current form. Regenerate before export.';
      } else {
        panel.setAttribute('data-status', 'bad');
        text.textContent = 'Could not decode the preview. Increase contrast, size or error correction.';
      }
    } catch (err) {
      panel.setAttribute('data-status', 'warn');
      text.textContent = 'Verification is unavailable for this preview renderer.';
    }
  }

  function bindVerification() {
    var generate = document.getElementById('generate-btn');
    if (generate) generate.addEventListener('click', scheduleVerification);
    document.addEventListener('change', function (event) {
      if (event.target.closest && event.target.closest('.panel-customize')) scheduleVerification();
    });
  }

  function installPwa() {
    if (!document.querySelector('link[rel="manifest"]')) {
      var manifest = document.createElement('link');
      manifest.rel = 'manifest';
      manifest.href = 'manifest.webmanifest';
      document.head.appendChild(manifest);
    }
    if (!document.querySelector('meta[name="theme-color"]')) {
      var meta = document.createElement('meta');
      meta.name = 'theme-color';
      meta.content = '#5b21b6';
      document.head.appendChild(meta);
    }
    if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
      navigator.serviceWorker.register('sw.js').catch(function () { /* PWA is optional */ });
    }
  }

  function clickGenerate() {
    var button = document.getElementById('generate-btn');
    if (button) button.click();
  }

  function init() {
    ensureStyles();
    patchGenerator();
    enhanceLogoControls();
    validateLogoUpload();
    injectFrameControls();
    injectFramedExport();
    bindHistoryActions();
    injectVerificationPanel();
    bindVerification();
    installPwa();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
