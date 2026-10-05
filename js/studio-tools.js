/*
 * QR Studio tools
 * Adds a lightweight studio layer without introducing a framework:
 * - WhatsApp QR mode
 * - Design presets
 * - Local project history
 * - JSON import/export
 * - Keyboard shortcuts
 * - Quality diagnostics bootstrap
 */
(function () {
  'use strict';

  var HISTORY_KEY = 'qr-studio-history-v1';
  var HISTORY_LIMIT = 8;
  var refreshTimer = null;

  var trackedIds = [
    'content-url', 'content-text', 'content-phone', 'content-sms-number', 'content-sms-body',
    'content-whatsapp-number', 'content-whatsapp-message',
    'content-email', 'content-email-subject', 'content-email-body',
    'content-wifi-ssid', 'content-wifi-pass', 'content-wifi-type',
    'content-vcard-name', 'content-vcard-tel', 'content-vcard-email', 'content-vcard-org',
    'content-lat', 'content-lng', 'content-event-title', 'content-event-start', 'content-event-end',
    'content-event-location', 'content-event-desc', 'qr-size', 'qr-ec', 'fg-color', 'fg-color-text',
    'bg-color', 'bg-color-text', 'transparent-bg', 'use-gradient', 'gradient-from', 'gradient-to',
    'gradient-rotation', 'corner-square', 'corner-dot', 'dot-style', 'label-text', 'label-inside'
  ];

  var presets = {
    classic: {
      name: 'Classic',
      values: {
        'fg-color': '#111827', 'fg-color-text': '#111827', 'bg-color': '#ffffff', 'bg-color-text': '#ffffff',
        'use-gradient': false, 'corner-square': 'square', 'corner-dot': 'square', 'dot-style': 'square', 'qr-ec': 'Q'
      }
    },
    indigo: {
      name: 'Indigo Flow',
      values: {
        'fg-color': '#4f46e5', 'fg-color-text': '#4f46e5', 'bg-color': '#ffffff', 'bg-color-text': '#ffffff',
        'use-gradient': true, 'gradient-from': '#4f46e5', 'gradient-to': '#8b5cf6', 'gradient-rotation': '45',
        'corner-square': 'extra-rounded', 'corner-dot': 'dot', 'dot-style': 'rounded', 'qr-ec': 'H'
      }
    },
    ocean: {
      name: 'Ocean',
      values: {
        'fg-color': '#0369a1', 'fg-color-text': '#0369a1', 'bg-color': '#f8fafc', 'bg-color-text': '#f8fafc',
        'use-gradient': true, 'gradient-from': '#0284c7', 'gradient-to': '#14b8a6', 'gradient-rotation': '45',
        'corner-square': 'extra-rounded', 'corner-dot': 'dot', 'dot-style': 'classy-rounded', 'qr-ec': 'H'
      }
    },
    mono: {
      name: 'Editorial',
      values: {
        'fg-color': '#09090b', 'fg-color-text': '#09090b', 'bg-color': '#fafafa', 'bg-color-text': '#fafafa',
        'use-gradient': false, 'corner-square': 'square', 'corner-dot': 'square', 'dot-style': 'classy', 'qr-ec': 'Q'
      }
    },
    neon: {
      name: 'Neon Night',
      values: {
        'fg-color': '#22c55e', 'fg-color-text': '#22c55e', 'bg-color': '#020617', 'bg-color-text': '#020617',
        'use-gradient': true, 'gradient-from': '#22c55e', 'gradient-to': '#06b6d4', 'gradient-rotation': '90',
        'corner-square': 'extra-rounded', 'corner-dot': 'dot', 'dot-style': 'dots', 'qr-ec': 'H'
      }
    }
  };

  function ensureStylesheet() {
    if (document.querySelector('link[data-qr-studio-tools]')) return;
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'css/studio-tools.css';
    link.setAttribute('data-qr-studio-tools', 'true');
    document.head.appendChild(link);
  }

  function loadDiagnostics() {
    if (document.querySelector('script[data-qr-diagnostics]')) return;
    var script = document.createElement('script');
    script.src = 'js/qr-diagnostics.js';
    script.setAttribute('data-qr-diagnostics', 'true');
    document.head.appendChild(script);
  }

  function injectWhatsappMode() {
    var tabs = document.getElementById('content-type-tabs');
    if (!tabs || document.querySelector('[data-type="whatsapp"]')) return;

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'content-type-btn';
    btn.setAttribute('data-type', 'whatsapp');
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-selected', 'false');
    btn.title = 'WhatsApp chat';
    btn.textContent = 'WhatsApp';

    var emailBtn = tabs.querySelector('[data-type="email"]');
    tabs.insertBefore(btn, emailBtn || null);

    var panel = document.createElement('div');
    panel.className = 'content-panel';
    panel.id = 'panel-whatsapp';
    panel.setAttribute('data-content-type', 'whatsapp');
    panel.setAttribute('role', 'tabpanel');
    panel.hidden = true;
    panel.innerHTML = '' +
      '<label for="content-whatsapp-number">WhatsApp number</label>' +
      '<input type="tel" id="content-whatsapp-number" placeholder="255753000000" aria-label="WhatsApp number with country code">' +
      '<p class="hint">Use the international number with country code, for example 255…</p>' +
      '<label for="content-whatsapp-message">Pre-filled message (optional)</label>' +
      '<textarea id="content-whatsapp-message" rows="3" maxlength="1000" placeholder="Hello, I am interested in your service." aria-label="WhatsApp pre-filled message"></textarea>';

    var emailPanel = document.getElementById('panel-email');
    var section = tabs.closest('.section-input');
    if (emailPanel && emailPanel.parentNode) emailPanel.parentNode.insertBefore(panel, emailPanel);
    else if (section) section.appendChild(panel);
  }

  function injectStudioPanel() {
    var layout = document.querySelector('.layout-two');
    if (!layout || document.getElementById('studio-tools')) return;

    var section = document.createElement('section');
    section.id = 'studio-tools';
    section.className = 'card studio-tools';
    section.setAttribute('aria-labelledby', 'studio-tools-heading');
    section.innerHTML = '' +
      '<div class="studio-tools-head">' +
        '<div><p class="studio-eyebrow">Workspace</p><h2 id="studio-tools-heading" class="section-title">Quick design & projects</h2>' +
        '<p class="studio-subtitle">Apply a preset, save a local project, or move a design between browsers with JSON.</p></div>' +
        '<div class="studio-file-actions">' +
          '<button type="button" id="studio-save" class="btn btn-secondary">Save locally</button>' +
          '<button type="button" id="studio-export" class="btn btn-secondary">Export JSON</button>' +
          '<button type="button" id="studio-import" class="btn btn-secondary">Import JSON</button>' +
          '<input id="studio-import-file" type="file" accept="application/json,.json" hidden>' +
        '</div>' +
      '</div>' +
      '<div class="studio-grid">' +
        '<div><h3 class="studio-mini-title">Design presets</h3><div class="preset-grid" id="preset-grid">' +
          presetButton('classic') + presetButton('indigo') + presetButton('ocean') + presetButton('mono') + presetButton('neon') +
        '</div></div>' +
        '<div><div class="history-title-row"><h3 class="studio-mini-title">Recent projects</h3><button type="button" id="studio-clear-history" class="text-button">Clear</button></div>' +
          '<div id="studio-history" class="studio-history" aria-live="polite"></div></div>' +
      '</div>';

    layout.parentNode.insertBefore(section, layout);
  }

  function presetButton(key) {
    var preset = presets[key];
    return '<button type="button" class="preset-card" data-preset="' + key + '">' +
      '<span class="preset-swatch preset-' + key + '" aria-hidden="true"></span>' +
      '<span><strong>' + preset.name + '</strong><small>Apply design</small></span></button>';
  }

  function switchContentType(type) {
    var tabs = document.getElementById('content-type-tabs');
    if (!tabs) return;
    tabs.querySelectorAll('.content-type-btn').forEach(function (button) {
      var active = button.getAttribute('data-type') === type;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    document.querySelectorAll('.content-panel').forEach(function (panel) {
      var active = panel.getAttribute('data-content-type') === type;
      panel.hidden = !active;
      panel.classList.toggle('active', active);
    });
  }

  function dispatchField(node) {
    if (!node) return;
    node.dispatchEvent(new Event('input', { bubbles: true }));
    node.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function applyValues(values) {
    Object.keys(values).forEach(function (id) {
      var node = document.getElementById(id);
      if (!node) return;
      if (node.type === 'checkbox') node.checked = !!values[id];
      else node.value = values[id];
      dispatchField(node);
    });
    scheduleGenerate();
  }

  function applyPreset(key) {
    var preset = presets[key];
    if (!preset) return;
    applyValues(preset.values);
    notify(preset.name + ' preset applied.');
  }

  function captureSnapshot() {
    var active = document.querySelector('.content-type-btn.active');
    var fields = {};
    trackedIds.forEach(function (id) {
      var node = document.getElementById(id);
      if (!node) return;
      fields[id] = node.type === 'checkbox' ? !!node.checked : node.value;
    });
    return {
      schema: 'qr-studio-design',
      version: 1,
      name: deriveProjectName(),
      contentType: active ? active.getAttribute('data-type') : 'url',
      fields: fields,
      savedAt: new Date().toISOString()
    };
  }

  function deriveProjectName() {
    var active = document.querySelector('.content-type-btn.active');
    var type = active ? active.getAttribute('data-type') : 'qr';
    var label = document.getElementById('label-text');
    var labelValue = label && label.value.trim();
    if (labelValue) return labelValue.slice(0, 40);

    var candidateIds = {
      url: 'content-url', text: 'content-text', phone: 'content-phone', sms: 'content-sms-number',
      whatsapp: 'content-whatsapp-number', email: 'content-email', wifi: 'content-wifi-ssid',
      vcard: 'content-vcard-name', location: 'content-lat', event: 'content-event-title'
    };
    var candidate = document.getElementById(candidateIds[type]);
    var value = candidate && candidate.value.trim();
    return value ? value.slice(0, 40) : type.charAt(0).toUpperCase() + type.slice(1) + ' QR';
  }

  function applySnapshot(snapshot) {
    if (!snapshot || snapshot.schema !== 'qr-studio-design' || !snapshot.fields) {
      notify('This file is not a valid QR Studio design.', true);
      return;
    }
    switchContentType(snapshot.contentType || 'url');
    applyValues(snapshot.fields);
    notify('Design restored.');
  }

  function loadHistory() {
    try {
      var parsed = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      return [];
    }
  }

  function saveHistory(snapshot, silent) {
    try {
      var history = loadHistory();
      var serialized = JSON.stringify(snapshot.fields);
      history = history.filter(function (item) { return JSON.stringify(item.fields) !== serialized; });
      history.unshift(snapshot);
      history = history.slice(0, HISTORY_LIMIT);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
      renderHistory();
      if (!silent) notify('Project saved on this device.');
    } catch (err) {
      if (!silent) notify('Could not save locally. Browser storage may be unavailable.', true);
    }
  }

  function renderHistory() {
    var host = document.getElementById('studio-history');
    if (!host) return;
    var history = loadHistory();
    if (!history.length) {
      host.innerHTML = '<div class="history-empty">No saved projects yet. Your latest designs can live here.</div>';
      return;
    }
    host.innerHTML = history.map(function (item, index) {
      var date = item.savedAt ? new Date(item.savedAt) : null;
      var when = date && !isNaN(date.getTime()) ? date.toLocaleDateString() : 'Saved';
      return '<button type="button" class="history-item" data-history-index="' + index + '">' +
        '<span class="history-icon">' + escapeHtml((item.contentType || 'QR').slice(0, 2).toUpperCase()) + '</span>' +
        '<span><strong>' + escapeHtml(item.name || 'QR project') + '</strong><small>' + escapeHtml(when) + ' · ' + escapeHtml(item.contentType || 'QR') + '</small></span>' +
      '</button>';
    }).join('');
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>'"]/g, function (char) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char];
    });
  }

  function exportJson() {
    var snapshot = captureSnapshot();
    var blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'qr-studio-design.json';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 0);
    notify('Design JSON exported.');
  }

  function importJson(file) {
    if (!file) return;
    if (file.size > 1024 * 1024) {
      notify('Design file is too large.', true);
      return;
    }
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var snapshot = JSON.parse(reader.result);
        applySnapshot(snapshot);
      } catch (err) {
        notify('Could not read that JSON design file.', true);
      }
    };
    reader.readAsText(file);
  }

  function notify(message, isError) {
    var host = document.getElementById('export-message');
    if (!host) return;
    host.textContent = message;
    host.hidden = false;
    host.style.color = isError ? 'var(--error)' : 'var(--success)';
    clearTimeout(host._studioTimeout);
    host._studioTimeout = setTimeout(function () { host.hidden = true; }, 3200);
  }

  function scheduleGenerate() {
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(function () {
      var generate = document.getElementById('generate-btn');
      if (generate) generate.click();
    }, 180);
  }

  function bindUnifiedTabs() {
    var tabs = document.getElementById('content-type-tabs');
    if (!tabs) return;
    tabs.addEventListener('click', function (event) {
      var button = event.target.closest('.content-type-btn');
      if (!button) return;
      switchContentType(button.getAttribute('data-type'));
      scheduleGenerate();
    }, true);
  }

  function bindWhatsappInputs() {
    ['content-whatsapp-number', 'content-whatsapp-message'].forEach(function (id) {
      var node = document.getElementById(id);
      if (!node) return;
      node.addEventListener('input', scheduleGenerate);
      node.addEventListener('change', scheduleGenerate);
    });
  }

  function clearWhatsappOnReset() {
    var reset = document.getElementById('reset-btn');
    if (!reset) return;
    reset.addEventListener('click', function () {
      ['content-whatsapp-number', 'content-whatsapp-message'].forEach(function (id) {
        var node = document.getElementById(id);
        if (node) node.value = '';
      });
    });
  }

  function bindStudioActions() {
    var grid = document.getElementById('preset-grid');
    if (grid) grid.addEventListener('click', function (event) {
      var button = event.target.closest('[data-preset]');
      if (button) applyPreset(button.getAttribute('data-preset'));
    });

    var save = document.getElementById('studio-save');
    if (save) save.addEventListener('click', function () { saveHistory(captureSnapshot(), false); });

    var exportBtn = document.getElementById('studio-export');
    if (exportBtn) exportBtn.addEventListener('click', exportJson);

    var importBtn = document.getElementById('studio-import');
    var importFile = document.getElementById('studio-import-file');
    if (importBtn && importFile) importBtn.addEventListener('click', function () { importFile.click(); });
    if (importFile) importFile.addEventListener('change', function () {
      importJson(importFile.files && importFile.files[0]);
      importFile.value = '';
    });

    var historyHost = document.getElementById('studio-history');
    if (historyHost) historyHost.addEventListener('click', function (event) {
      var button = event.target.closest('[data-history-index]');
      if (!button) return;
      var history = loadHistory();
      var item = history[parseInt(button.getAttribute('data-history-index'), 10)];
      if (item) applySnapshot(item);
    });

    var clear = document.getElementById('studio-clear-history');
    if (clear) clear.addEventListener('click', function () {
      localStorage.removeItem(HISTORY_KEY);
      renderHistory();
      notify('Local project history cleared.');
    });

    var generate = document.getElementById('generate-btn');
    if (generate) generate.addEventListener('click', function () {
      var snapshot = captureSnapshot();
      var activePanel = document.querySelector('.content-panel.active');
      var hasValue = activePanel && Array.prototype.some.call(activePanel.querySelectorAll('input,textarea'), function (node) {
        return !!String(node.value || '').trim();
      });
      if (hasValue) saveHistory(snapshot, true);
    });

    document.addEventListener('keydown', function (event) {
      var mod = event.ctrlKey || event.metaKey;
      if (mod && event.key.toLowerCase() === 's') {
        event.preventDefault();
        saveHistory(captureSnapshot(), false);
      }
      if (mod && event.key === 'Enter') {
        event.preventDefault();
        var generateButton = document.getElementById('generate-btn');
        if (generateButton) generateButton.click();
      }
    });
  }

  function init() {
    ensureStylesheet();
    injectWhatsappMode();
    injectStudioPanel();
    bindUnifiedTabs();
    bindWhatsappInputs();
    clearWhatsappOnReset();
    bindStudioActions();
    renderHistory();
    loadDiagnostics();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
