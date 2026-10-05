/* QR Studio production tools */
(function () {
  'use strict';

  var deferredInstallPrompt = null;
  var MAX_BATCH = 100;
  var MAX_LOGO_DIMENSION = 4096;
  var MAX_LOGO_PIXELS = 16000000;

  function notify(message, isError) {
    var host = document.getElementById('export-message');
    if (!host) return;
    host.textContent = message;
    host.hidden = false;
    host.style.color = isError ? 'var(--error)' : 'var(--success)';
    clearTimeout(host._productionTimeout);
    host._productionTimeout = setTimeout(function () { host.hidden = true; }, 3500);
  }

  function ensureStyles() {
    if (document.querySelector('link[data-production-tools]')) return;
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'css/production-tools.css';
    link.setAttribute('data-production-tools', 'true');
    document.head.appendChild(link);
  }

  function dispatch(node) {
    if (!node) return;
    node.dispatchEvent(new Event('input', { bubbles: true }));
    node.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function setValue(id, value) {
    var node = document.getElementById(id);
    if (!node) return;
    if (node.type === 'checkbox') node.checked = !!value;
    else node.value = value;
    dispatch(node);
  }

  function switchType(type) {
    var button = document.querySelector('.content-type-btn[data-type="' + type + '"]');
    if (button) button.click();
  }

  var templates = {
    website: {
      title: 'Website', icon: 'WEB', description: 'Branded website or landing-page QR', type: 'url',
      values: { 'content-url': 'https://example.com', 'label-text': 'Visit our website', 'frame-style': 'website', 'qr-ec': 'Q' }
    },
    social: {
      title: 'Social Profile', icon: 'SOC', description: 'Instagram, LinkedIn, TikTok or portfolio link', type: 'url',
      values: { 'content-url': 'https://instagram.com/yourprofile', 'label-text': 'Follow us', 'frame-style': 'custom', 'custom-cta': 'FOLLOW US', 'qr-ec': 'Q' }
    },
    whatsapp: {
      title: 'WhatsApp', icon: 'WA', description: 'Open a chat with a ready message', type: 'whatsapp',
      values: { 'content-whatsapp-number': '255700000000', 'content-whatsapp-message': 'Hello, I would like to know more.', 'label-text': 'Chat with us', 'frame-style': 'custom', 'custom-cta': 'CHAT ON WHATSAPP', 'qr-ec': 'Q' }
    },
    wifi: {
      title: 'Wi-Fi Card', icon: 'WF', description: 'Connect guests to a wireless network', type: 'wifi',
      values: { 'content-wifi-ssid': 'Guest WiFi', 'content-wifi-pass': 'change-me', 'content-wifi-type': 'WPA', 'label-text': 'Guest Wi-Fi', 'frame-style': 'wifi', 'qr-ec': 'H' }
    },
    business: {
      title: 'Business Card', icon: 'VC', description: 'Share contact details as a vCard', type: 'vcard',
      values: { 'content-vcard-name': 'Your Name', 'content-vcard-tel': '+255700000000', 'content-vcard-email': 'hello@example.com', 'content-vcard-org': 'Your Company', 'label-text': 'Save my contact', 'frame-style': 'contact', 'qr-ec': 'H' }
    },
    event: {
      title: 'Event', icon: 'EV', description: 'Calendar-ready event QR', type: 'event',
      values: { 'content-event-title': 'Event name', 'content-event-location': 'Venue', 'content-event-desc': 'Event details', 'label-text': 'Add event', 'frame-style': 'scan', 'qr-ec': 'Q' }
    },
    menu: {
      title: 'Menu', icon: 'MN', description: 'Restaurant, café or service menu link', type: 'url',
      values: { 'content-url': 'https://example.com/menu', 'label-text': 'View menu', 'frame-style': 'menu', 'qr-ec': 'Q' }
    },
    payment: {
      title: 'Payment Link', icon: 'PAY', description: 'Payment page, donation or checkout URL', type: 'url',
      values: { 'content-url': 'https://example.com/pay', 'label-text': 'Pay securely', 'frame-style': 'custom', 'custom-cta': 'PAY NOW', 'qr-ec': 'H' }
    }
  };

  function injectTemplates() {
    var anchor = document.getElementById('studio-tools');
    if (!anchor || document.getElementById('template-library')) return;
    var section = document.createElement('section');
    section.id = 'template-library';
    section.className = 'card template-library';
    section.innerHTML = '<div class="production-head"><div><p class="studio-eyebrow">Templates</p><h2 class="section-title">Start from a proven QR workflow</h2><p class="studio-subtitle">Choose a use case, then replace the sample details with your own.</p></div></div><div class="template-grid">' +
      Object.keys(templates).map(function (key) {
        var item = templates[key];
        return '<button type="button" class="template-card" data-template="' + key + '"><span class="template-icon">' + item.icon + '</span><span><strong>' + item.title + '</strong><small>' + item.description + '</small></span></button>';
      }).join('') + '</div>';
    anchor.parentNode.insertBefore(section, anchor);
    section.addEventListener('click', function (event) {
      var button = event.target.closest('[data-template]');
      if (!button) return;
      applyTemplate(button.getAttribute('data-template'));
    });
  }

  function applyTemplate(key) {
    var template = templates[key];
    if (!template) return;
    switchType(template.type);
    Object.keys(template.values).forEach(function (id) { setValue(id, template.values[id]); });
    var generate = document.getElementById('generate-btn');
    if (generate) generate.click();
    notify(template.title + ' template loaded. Replace the sample details before export.');
    var content = document.querySelector('.section-input');
    if (content && content.scrollIntoView) content.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function injectBatchTools() {
    var anchor = document.getElementById('studio-tools');
    if (!anchor || document.getElementById('batch-studio')) return;
    var section = document.createElement('section');
    section.id = 'batch-studio';
    section.className = 'card batch-studio';
    section.innerHTML = '' +
      '<div class="production-head"><div><p class="studio-eyebrow">Batch</p><h2 class="section-title">Generate QR codes in bulk</h2><p class="studio-subtitle">Paste CSV or upload a file with <code>name,type,data</code>. Up to ' + MAX_BATCH + ' QR codes per batch.</p></div></div>' +
      '<div class="batch-layout"><div class="batch-input"><label for="batch-csv">CSV data</label><textarea id="batch-csv" rows="8" spellcheck="false" placeholder="name,type,data\nHomepage,url,https://example.com\nSupport,whatsapp,255700000000\nWelcome,text,Hello world"></textarea><div class="batch-actions"><label class="btn btn-secondary batch-file-label" for="batch-file">Upload CSV</label><input id="batch-file" type="file" accept=".csv,text/csv" hidden><button type="button" id="batch-generate" class="btn btn-primary">Generate ZIP</button></div><p id="batch-status" class="batch-status" aria-live="polite"></p></div>' +
      '<div class="batch-guide"><h3>Supported types</h3><p>url, text, phone, whatsapp, email</p><h3>Example</h3><pre>name,type,data\nStore,url,https://example.com\nCall,phone,+255700000000</pre><p class="hint">Batch exports use the current QR visual style and High error correction when a logo is present.</p></div></div>';
    anchor.parentNode.insertBefore(section, anchor.nextSibling);

    var file = document.getElementById('batch-file');
    var textarea = document.getElementById('batch-csv');
    if (file && textarea) file.addEventListener('change', function () {
      var selected = file.files && file.files[0];
      if (!selected) return;
      if (selected.size > 1024 * 1024) { notify('CSV is too large. Maximum file size is 1 MB.', true); file.value = ''; return; }
      var reader = new FileReader();
      reader.onload = function () { textarea.value = String(reader.result || ''); };
      reader.readAsText(selected);
    });
    var button = document.getElementById('batch-generate');
    if (button) button.addEventListener('click', generateBatchZip);
  }

  function parseCsv(text) {
    var rows = [];
    var row = [], field = '', quoted = false;
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      if (quoted) {
        if (ch === '"' && text[i + 1] === '"') { field += '"'; i++; }
        else if (ch === '"') quoted = false;
        else field += ch;
      } else if (ch === '"') quoted = true;
      else if (ch === ',') { row.push(field); field = ''; }
      else if (ch === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
      else if (ch !== '\r') field += ch;
    }
    row.push(field);
    if (row.some(function (v) { return v.trim(); })) rows.push(row);
    if (!rows.length) return [];
    var headers = rows.shift().map(function (h) { return h.trim().toLowerCase(); });
    return rows.map(function (values) {
      var result = {};
      headers.forEach(function (header, index) { result[header] = String(values[index] || '').trim(); });
      return result;
    }).filter(function (item) { return item.name || item.data; });
  }

  function batchPayload(type, data) {
    var t = String(type || 'url').toLowerCase();
    var value = String(data || '').trim();
    if (!value) return '';
    if (!window.ContentTypes) return value;
    if (t === 'url') return window.ContentTypes.buildUrl(value);
    if (t === 'phone') return window.ContentTypes.buildPhone(value);
    if (t === 'whatsapp' && window.ContentTypes.buildWhatsapp) return window.ContentTypes.buildWhatsapp(value, '');
    if (t === 'email') return window.ContentTypes.buildEmail(value, '', '');
    return value;
  }

  function safeName(name, index) {
    var cleaned = String(name || ('qr-' + (index + 1))).trim().replace(/[^a-z0-9-_]+/gi, '-').replace(/^-+|-+$/g, '');
    return (cleaned || ('qr-' + (index + 1))).slice(0, 70);
  }

  function currentStyleState(data) {
    function val(id, fallback) { var n = document.getElementById(id); return n ? n.value : fallback; }
    function check(id) { var n = document.getElementById(id); return !!(n && n.checked); }
    return {
      data: data,
      size: Math.max(256, parseInt(val('qr-size', '300'), 10) || 300),
      ec: val('qr-ec', 'Q'),
      fgColor: val('fg-color-text', '#1a1a2e'),
      bgColor: val('bg-color-text', '#ffffff'),
      transparent: check('transparent-bg'),
      useGradient: check('use-gradient'),
      gradientFrom: val('gradient-from', '#6366f1'),
      gradientTo: val('gradient-to', '#8b5cf6'),
      gradientRotation: val('gradient-rotation', '0'),
      cornerSquare: val('corner-square', 'square'),
      cornerDot: val('corner-dot', 'square'),
      dotStyle: val('dot-style', 'square')
    };
  }

  function loadScript(src, marker, callback) {
    if (marker === 'jszip' && window.JSZip) { callback(); return; }
    var existing = document.querySelector('script[data-' + marker + ']');
    if (existing) { existing.addEventListener('load', callback, { once: true }); return; }
    var script = document.createElement('script');
    script.src = src;
    script.setAttribute('data-' + marker, 'true');
    script.onload = callback;
    script.onerror = function () { notify('Could not load the batch export dependency.', true); };
    document.head.appendChild(script);
  }

  function generateBatchZip() {
    var textarea = document.getElementById('batch-csv');
    var status = document.getElementById('batch-status');
    var button = document.getElementById('batch-generate');
    if (!textarea || !status || !button) return;
    var items = parseCsv(textarea.value || '');
    if (!items.length) { status.textContent = 'Add CSV rows before generating.'; return; }
    if (items.length > MAX_BATCH) { status.textContent = 'Maximum ' + MAX_BATCH + ' QR codes per batch.'; return; }
    var invalid = items.filter(function (item) { return !batchPayload(item.type, item.data); });
    if (invalid.length) { status.textContent = 'Every row needs valid data.'; return; }
    if (!window.QRCodeStyling) { status.textContent = 'QR renderer is unavailable.'; return; }

    button.disabled = true;
    status.textContent = 'Preparing ' + items.length + ' QR codes…';
    loadScript('https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js', 'jszip', function () {
      var zip = new window.JSZip();
      var index = 0;
      function next() {
        if (index >= items.length) {
          zip.generateAsync({ type: 'blob' }).then(function (blob) {
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url; a.download = 'qr-studio-batch.zip';
            document.body.appendChild(a); a.click(); a.remove();
            setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
            status.textContent = 'Batch complete: ' + items.length + ' QR codes exported.';
            button.disabled = false;
          }).catch(function () { status.textContent = 'Could not create ZIP archive.'; button.disabled = false; });
          return;
        }
        var item = items[index];
        status.textContent = 'Generating ' + (index + 1) + ' of ' + items.length + '…';
        var payload = batchPayload(item.type, item.data);
        var options = window.QRGenerator ? window.QRGenerator.buildOptions(currentStyleState(payload)) : currentStyleState(payload);
        var qr = new window.QRCodeStyling(options);
        qr.getRawData('png').then(function (blob) {
          zip.file(safeName(item.name, index) + '.png', blob);
          index++;
          next();
        }).catch(function () { status.textContent = 'Failed while generating row ' + (index + 1) + '.'; button.disabled = false; });
      }
      next();
    });
  }

  function validateLogoDimensions() {
    var input = document.getElementById('logo-upload');
    if (!input || input.__dimensionChecked) return;
    input.__dimensionChecked = true;
    input.addEventListener('change', function () {
      var file = input.files && input.files[0];
      if (!file || !/^image\//.test(file.type)) return;
      if (file.type === 'image/svg+xml') return;
      var url = URL.createObjectURL(file);
      var image = new Image();
      image.onload = function () {
        URL.revokeObjectURL(url);
        var pixels = image.naturalWidth * image.naturalHeight;
        if (image.naturalWidth < 64 || image.naturalHeight < 64) {
          rejectLogo('Logo is too small. Use at least 64 × 64 pixels.');
        } else if (image.naturalWidth > MAX_LOGO_DIMENSION || image.naturalHeight > MAX_LOGO_DIMENSION || pixels > MAX_LOGO_PIXELS) {
          rejectLogo('Logo dimensions are too large. Maximum is 4096 px per side and 16 megapixels.');
        }
      };
      image.onerror = function () { URL.revokeObjectURL(url); rejectLogo('Could not read the uploaded image.', true); };
      image.src = url;
    }, true);
  }

  function rejectLogo(message) {
    var input = document.getElementById('logo-upload');
    if (input) input.value = '';
    var remove = document.getElementById('remove-logo');
    if (remove) remove.click();
    notify(message, true);
  }

  function injectAppActions() {
    var actions = document.querySelector('.header-actions');
    if (!actions || document.getElementById('share-qr-btn')) return;
    var share = document.createElement('button');
    share.type = 'button'; share.id = 'share-qr-btn'; share.className = 'btn btn-secondary'; share.textContent = 'Share';
    share.addEventListener('click', shareQr);
    var install = document.createElement('button');
    install.type = 'button'; install.id = 'install-app-btn'; install.className = 'btn btn-secondary install-app-btn'; install.textContent = 'Install'; install.hidden = true;
    install.addEventListener('click', installApp);
    actions.insertBefore(share, actions.firstChild);
    actions.insertBefore(install, actions.firstChild);
  }

  function shareQr() {
    var canvas = document.querySelector('#qr-container canvas');
    if (!canvas) { notify('Generate a QR code before sharing.', true); return; }
    canvas.toBlob(function (blob) {
      if (!blob) { notify('Could not prepare the QR image.', true); return; }
      var file = new File([blob], 'qr-code.png', { type: 'image/png' });
      var data = { title: 'QR Code', text: 'Created with QR Studio', files: [file] };
      if (navigator.share && (!navigator.canShare || navigator.canShare(data))) {
        navigator.share(data).catch(function (err) { if (err && err.name !== 'AbortError') notify('Sharing was not completed.', true); });
      } else if (navigator.share) {
        navigator.share({ title: 'QR Studio', text: 'QR Studio', url: location.href }).catch(function () {});
      } else if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(location.href).then(function () { notify('Page link copied. Image sharing is not supported in this browser.'); });
      } else notify('Sharing is not supported in this browser.', true);
    }, 'image/png');
  }

  function installApp() {
    if (!deferredInstallPrompt) { notify('Use your browser menu to install QR Studio on this device.'); return; }
    deferredInstallPrompt.prompt();
    deferredInstallPrompt.userChoice.finally(function () {
      deferredInstallPrompt = null;
      var button = document.getElementById('install-app-btn');
      if (button) button.hidden = true;
    });
  }

  function bindInstallPrompt() {
    window.addEventListener('beforeinstallprompt', function (event) {
      event.preventDefault();
      deferredInstallPrompt = event;
      var button = document.getElementById('install-app-btn');
      if (button) button.hidden = false;
    });
    window.addEventListener('appinstalled', function () {
      deferredInstallPrompt = null;
      var button = document.getElementById('install-app-btn');
      if (button) button.hidden = true;
      notify('QR Studio installed.');
    });
  }

  function injectNetworkStatus() {
    if (document.getElementById('network-status')) return;
    var badge = document.createElement('div');
    badge.id = 'network-status';
    badge.className = 'network-status';
    badge.setAttribute('role', 'status');
    document.body.appendChild(badge);
    function update() {
      var online = navigator.onLine;
      badge.textContent = online ? 'Online' : 'Offline — saved tools still work';
      badge.setAttribute('data-online', online ? 'true' : 'false');
      clearTimeout(badge._hide);
      badge.classList.add('is-visible');
      if (online) badge._hide = setTimeout(function () { badge.classList.remove('is-visible'); }, 1800);
    }
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    if (!navigator.onLine) update();
  }

  function exposeHealthCheck() {
    window.QRStudioHealth = {
      version: '1.0.0',
      check: function () {
        return {
          contentTypes: !!window.ContentTypes,
          renderer: !!window.QRCodeStyling,
          generator: !!window.QRGenerator,
          serviceWorker: 'serviceWorker' in navigator,
          storage: (function () { try { localStorage.setItem('__qr_health', '1'); localStorage.removeItem('__qr_health'); return true; } catch (e) { return false; } })(),
          online: navigator.onLine
        };
      }
    };
  }

  function init() {
    ensureStyles();
    injectTemplates();
    injectBatchTools();
    validateLogoDimensions();
    injectAppActions();
    bindInstallPrompt();
    injectNetworkStatus();
    exposeHealthCheck();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
