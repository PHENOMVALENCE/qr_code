/* QR Studio readiness diagnostics */
(function () {
  'use strict';

  var timer = null;

  function injectPanel() {
    var preview = document.querySelector('.panel-preview');
    if (!preview || document.getElementById('qr-readiness')) return;
    var panel = document.createElement('div');
    panel.id = 'qr-readiness';
    panel.className = 'qr-readiness';
    panel.innerHTML = '' +
      '<div class="readiness-head">' +
        '<div><span class="readiness-kicker">Quality check</span><h3>QR readiness</h3></div>' +
        '<div class="readiness-score" id="readiness-score"><strong>—</strong><span>/100</span></div>' +
      '</div>' +
      '<div class="readiness-meter" aria-hidden="true"><span id="readiness-meter-fill"></span></div>' +
      '<div id="readiness-findings" class="readiness-findings"><p>Generate a QR code to review scan-readiness.</p></div>';
    preview.appendChild(panel);
  }

  function hexToRgb(hex) {
    var value = String(hex || '').trim().replace('#', '');
    if (value.length === 3) value = value.split('').map(function (c) { return c + c; }).join('');
    if (!/^[0-9a-f]{6}$/i.test(value)) return null;
    return {
      r: parseInt(value.slice(0, 2), 16),
      g: parseInt(value.slice(2, 4), 16),
      b: parseInt(value.slice(4, 6), 16)
    };
  }

  function luminance(rgb) {
    var channels = [rgb.r, rgb.g, rgb.b].map(function (value) {
      var channel = value / 255;
      return channel <= 0.03928 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
  }

  function contrast(a, b) {
    var rgbA = hexToRgb(a);
    var rgbB = hexToRgb(b);
    if (!rgbA || !rgbB) return 0;
    var l1 = luminance(rgbA);
    var l2 = luminance(rgbB);
    var lighter = Math.max(l1, l2);
    var darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  }

  function value(id, fallback) {
    var node = document.getElementById(id);
    return node ? node.value : fallback;
  }

  function checked(id) {
    var node = document.getElementById(id);
    return !!(node && node.checked);
  }

  function currentPayload() {
    var active = document.querySelector('.content-type-btn.active');
    var type = active ? active.getAttribute('data-type') : 'url';
    var map = {
      url: ['content-url'],
      text: ['content-text'],
      phone: ['content-phone'],
      sms: ['content-sms-number', 'content-sms-body'],
      whatsapp: ['content-whatsapp-number', 'content-whatsapp-message'],
      email: ['content-email', 'content-email-subject', 'content-email-body'],
      wifi: ['content-wifi-ssid', 'content-wifi-pass'],
      vcard: ['content-vcard-name', 'content-vcard-tel', 'content-vcard-email', 'content-vcard-org'],
      location: ['content-lat', 'content-lng'],
      event: ['content-event-title', 'content-event-start', 'content-event-end', 'content-event-location', 'content-event-desc']
    };
    return (map[type] || []).map(function (id) { return value(id, ''); }).join('|');
  }

  function analyse() {
    var payload = currentPayload();
    if (!payload.replace(/\|/g, '').trim()) return null;

    var score = 100;
    var findings = [];
    var bg = value('bg-color-text', '#ffffff');
    var fg = checked('use-gradient') ? value('gradient-from', '#6366f1') : value('fg-color-text', '#1a1a2e');
    var ratio = contrast(fg, bg);
    var size = parseInt(value('qr-size', '300'), 10) || 300;
    var ec = value('qr-ec', 'Q');
    var logoInput = document.getElementById('logo-upload');
    var hasLogo = !!(logoInput && logoInput.files && logoInput.files.length);
    var transparent = checked('transparent-bg');
    var length = payload.length;

    if (transparent) {
      score -= 8;
      findings.push({ status: 'warn', text: 'Transparent backgrounds depend on where the QR is placed. Test contrast after placement.' });
    } else if (ratio < 3) {
      score -= 38;
      findings.push({ status: 'bad', text: 'Foreground/background contrast is too low (' + ratio.toFixed(1) + ':1).' });
    } else if (ratio < 4.5) {
      score -= 20;
      findings.push({ status: 'warn', text: 'Contrast is usable but could be stronger (' + ratio.toFixed(1) + ':1).' });
    } else {
      findings.push({ status: 'good', text: 'Strong color contrast (' + ratio.toFixed(1) + ':1).' });
    }

    if (size < 192) {
      score -= 18;
      findings.push({ status: 'warn', text: 'Increase export size for more reliable scanning and print use.' });
    } else {
      findings.push({ status: 'good', text: 'Export size is suitable for common digital use.' });
    }

    if (hasLogo && ec !== 'H') {
      score -= 18;
      findings.push({ status: 'warn', text: 'Use High (H) error correction when placing a logo in the QR.' });
    } else if (hasLogo) {
      findings.push({ status: 'good', text: 'High error correction is enabled for the embedded logo.' });
    }

    if (length > 1200) {
      score -= 22;
      findings.push({ status: 'warn', text: 'Payload is very dense. Prefer a short URL when possible.' });
    } else if (length > 600) {
      score -= 10;
      findings.push({ status: 'warn', text: 'Payload is moderately dense; scanning may require a larger QR.' });
    } else {
      findings.push({ status: 'good', text: 'Payload density is within a comfortable range.' });
    }

    if (ec === 'L') {
      score -= 8;
      findings.push({ status: 'warn', text: 'Low error correction offers minimal damage tolerance.' });
    }

    score = Math.max(0, Math.min(100, score));
    return { score: score, findings: findings };
  }

  function render() {
    var scoreNode = document.getElementById('readiness-score');
    var fill = document.getElementById('readiness-meter-fill');
    var findingsNode = document.getElementById('readiness-findings');
    if (!scoreNode || !fill || !findingsNode) return;

    var result = analyse();
    if (!result) {
      scoreNode.innerHTML = '<strong>—</strong><span>/100</span>';
      fill.style.width = '0%';
      findingsNode.innerHTML = '<p>Enter QR content to review scan-readiness.</p>';
      return;
    }

    scoreNode.innerHTML = '<strong>' + result.score + '</strong><span>/100</span>';
    fill.style.width = result.score + '%';
    scoreNode.setAttribute('data-grade', result.score >= 85 ? 'good' : result.score >= 65 ? 'warn' : 'bad');
    findingsNode.innerHTML = result.findings.map(function (item) {
      return '<div class="readiness-item readiness-' + item.status + '"><span aria-hidden="true"></span><p>' + item.text + '</p></div>';
    }).join('');
  }

  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(render, 120);
  }

  function init() {
    injectPanel();
    document.addEventListener('input', schedule);
    document.addEventListener('change', schedule);
    document.addEventListener('click', function (event) {
      if (event.target.closest && (event.target.closest('.content-type-btn') || event.target.closest('[data-preset]'))) schedule();
    });
    render();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
