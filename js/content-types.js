/**
 * Content types for QR Studio.
 * Builds encoded strings and validates input for URL, text, phone, SMS,
 * WhatsApp, email, Wi-Fi, vCard, location and event QR codes.
 */
(function (global) {
  'use strict';

  function buildUrl(value) {
    var v = (value || '').trim();
    if (!v) return '';
    if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(v)) v = 'https://' + v;
    return v;
  }

  function cleanPhone(value) {
    return (value || '').trim().replace(/[^0-9+]/g, '');
  }

  function digitsOnly(value) {
    return (value || '').replace(/\D/g, '');
  }

  function fieldValue(el, key, id) {
    var node = (el && el[key]) || (typeof document !== 'undefined' && document.getElementById(id));
    return node ? node.value : '';
  }

  function buildPhone(value) {
    var v = cleanPhone(value);
    if (!v) return '';
    return 'tel:' + v;
  }

  function buildSms(number, body) {
    var num = cleanPhone(number);
    if (!num) return '';
    var b = (body || '').trim();
    if (b) return 'smsto:' + num + ':' + b;
    return 'sms:' + num;
  }

  /**
   * Build an official WhatsApp click-to-chat URL.
   * wa.me requires an international number without +, spaces or punctuation.
   */
  function buildWhatsapp(number, message) {
    var num = digitsOnly(number);
    if (!num) return '';
    var url = 'https://wa.me/' + num;
    var msg = (message || '').trim();
    if (msg) url += '?text=' + encodeURIComponent(msg);
    return url;
  }

  function buildEmail(email, subject, body) {
    var e = (email || '').trim();
    if (!e) return '';
    var url = 'mailto:' + encodeURIComponent(e);
    var params = [];
    if ((subject || '').trim()) params.push('subject=' + encodeURIComponent(subject.trim()));
    if ((body || '').trim()) params.push('body=' + encodeURIComponent(body.trim()));
    if (params.length) url += '?' + params.join('&');
    return url;
  }

  function buildWifi(ssid, password, enc) {
    var s = (ssid || '').trim();
    if (!s) return '';
    var t = (enc === 'WEP' ? 'WEP' : enc === 'nopass' ? 'nopass' : 'WPA');
    var out = 'WIFI:T:' + t + ';S:' + escapeWifi(s) + ';';
    if (t !== 'nopass' && (password || '').trim()) out += 'P:' + escapeWifi((password || '').trim()) + ';';
    out += ';';
    return out;
  }

  function escapeWifi(s) {
    return s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/"/g, '\\"').replace(/,/g, '\\,').replace(/:/g, '\\:');
  }

  function escapeIcal(value) {
    return (value || '')
      .replace(/\\/g, '\\\\')
      .replace(/\n/g, '\\n')
      .replace(/,/g, '\\,')
      .replace(/;/g, '\\;');
  }

  function buildVcard(name, tel, email, org) {
    var n = (name || '').trim();
    if (!n) return '';
    var lines = ['BEGIN:VCARD', 'VERSION:3.0', 'FN:' + escapeIcal(n), 'N:' + escapeIcal(n)];
    if ((tel || '').trim()) lines.push('TEL:' + cleanPhone(tel));
    if ((email || '').trim()) lines.push('EMAIL:' + (email || '').trim());
    if ((org || '').trim()) lines.push('ORG:' + escapeIcal((org || '').trim()));
    lines.push('END:VCARD');
    return lines.join('\n');
  }

  function buildLocation(lat, lng) {
    var la = parseFloat((lat || '').trim(), 10);
    var lo = parseFloat((lng || '').trim(), 10);
    if (isNaN(la) || isNaN(lo)) return '';
    return 'geo:' + la + ',' + lo;
  }

  function buildEvent(title, startDt, endDt, location, desc) {
    var t = (title || '').trim();
    if (!t) return '';
    var lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'BEGIN:VEVENT', 'SUMMARY:' + escapeIcal(t)];
    if ((startDt || '').trim()) lines.push('DTSTART:' + formatIcalDate(startDt.trim()));
    if ((endDt || '').trim()) lines.push('DTEND:' + formatIcalDate(endDt.trim()));
    if ((location || '').trim()) lines.push('LOCATION:' + escapeIcal((location || '').trim()));
    if ((desc || '').trim()) lines.push('DESCRIPTION:' + escapeIcal((desc || '').trim()));
    lines.push('END:VEVENT', 'END:VCALENDAR');
    return lines.join('\n');
  }

  function formatIcalDate(s) {
    if (!s) return '';
    var d = new Date(s);
    if (isNaN(d.getTime())) return s;
    var pad = function (n) { return (n < 10 ? '0' : '') + n; };
    return d.getUTCFullYear() + pad(d.getUTCMonth() + 1) + pad(d.getUTCDate()) + 'T' +
      pad(d.getUTCHours()) + pad(d.getUTCMinutes()) + pad(d.getUTCSeconds()) + 'Z';
  }

  function getCurrentType(el) {
    var btn = el.contentTypeContainer && el.contentTypeContainer.querySelector('.content-type-btn.active');
    return (btn && btn.getAttribute('data-type')) || 'url';
  }

  function buildContentData(el, contentType) {
    var type = contentType || getCurrentType(el);
    switch (type) {
      case 'url':
        return buildUrl(el.contentUrl && el.contentUrl.value);
      case 'text':
        return (el.contentText && el.contentText.value.trim()) || '';
      case 'phone':
        return buildPhone(el.contentPhone && el.contentPhone.value);
      case 'sms':
        return buildSms(
          el.contentSmsNumber && el.contentSmsNumber.value,
          el.contentSmsBody && el.contentSmsBody.value
        );
      case 'whatsapp':
        return buildWhatsapp(
          fieldValue(el, 'contentWhatsappNumber', 'content-whatsapp-number'),
          fieldValue(el, 'contentWhatsappMessage', 'content-whatsapp-message')
        );
      case 'email':
        return buildEmail(
          el.contentEmail && el.contentEmail.value,
          el.contentEmailSubject && el.contentEmailSubject.value,
          el.contentEmailBody && el.contentEmailBody.value
        );
      case 'wifi':
        return buildWifi(
          el.contentWifiSsid && el.contentWifiSsid.value,
          el.contentWifiPass && el.contentWifiPass.value,
          el.contentWifiType && el.contentWifiType.value
        );
      case 'vcard':
        return buildVcard(
          el.contentVcardName && el.contentVcardName.value,
          el.contentVcardTel && el.contentVcardTel.value,
          el.contentVcardEmail && el.contentVcardEmail.value,
          el.contentVcardOrg && el.contentVcardOrg.value
        );
      case 'location':
        return buildLocation(
          el.contentLat && el.contentLat.value,
          el.contentLng && el.contentLng.value
        );
      case 'event':
        return buildEvent(
          el.contentEventTitle && el.contentEventTitle.value,
          el.contentEventStart && el.contentEventStart.value,
          el.contentEventEnd && el.contentEventEnd.value,
          el.contentEventLocation && el.contentEventLocation.value,
          el.contentEventDesc && el.contentEventDesc.value
        );
      default:
        return buildUrl(el.contentUrl && el.contentUrl.value);
    }
  }

  function isValidPhone(value) {
    var digits = digitsOnly(value);
    return digits.length >= 7 && digits.length <= 15;
  }

  function isValidEmail(value) {
    var email = (value || '').trim();
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function validateContent(el, contentType) {
    var type = contentType || getCurrentType(el);
    var data = buildContentData(el, type);
    var msg = {
      url: 'Enter a website URL.',
      text: 'Enter some text.',
      phone: 'Enter a phone number.',
      sms: 'Enter a phone number.',
      whatsapp: 'Enter a WhatsApp number including country code.',
      email: 'Enter an email address.',
      wifi: 'Enter the network name (SSID).',
      vcard: 'Enter at least a name.',
      location: 'Enter latitude and longitude.',
      event: 'Enter an event title.'
    };

    if (!data || data.length === 0) {
      return { valid: false, message: msg[type] || 'Please fill in the required fields.' };
    }

    if (type === 'url') {
      try {
        var parsed = new URL(data);
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
          return { valid: false, message: 'Use a valid http:// or https:// URL.' };
        }
      } catch (err) {
        return { valid: false, message: 'Enter a valid website URL.' };
      }
    }

    if (type === 'phone' && !isValidPhone(el.contentPhone && el.contentPhone.value)) {
      return { valid: false, message: 'Enter a valid phone number (7–15 digits).' };
    }
    if (type === 'sms' && !isValidPhone(el.contentSmsNumber && el.contentSmsNumber.value)) {
      return { valid: false, message: 'Enter a valid SMS phone number (7–15 digits).' };
    }
    if (type === 'whatsapp' && !isValidPhone(fieldValue(el, 'contentWhatsappNumber', 'content-whatsapp-number'))) {
      return { valid: false, message: 'Enter a valid WhatsApp number with country code (7–15 digits).' };
    }
    if (type === 'email' && !isValidEmail(el.contentEmail && el.contentEmail.value)) {
      return { valid: false, message: 'Enter a valid email address.' };
    }
    if (type === 'location') {
      var lat = parseFloat(el.contentLat && el.contentLat.value, 10);
      var lng = parseFloat(el.contentLng && el.contentLng.value, 10);
      if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        return { valid: false, message: 'Latitude must be -90 to 90 and longitude -180 to 180.' };
      }
    }
    if (type === 'event' && el.contentEventStart && el.contentEventEnd && el.contentEventStart.value && el.contentEventEnd.value) {
      if (new Date(el.contentEventEnd.value).getTime() < new Date(el.contentEventStart.value).getTime()) {
        return { valid: false, message: 'Event end time must be after the start time.' };
      }
    }

    if (data.length > 2000) return { valid: false, message: 'Content is too long (max 2000 characters).' };
    return { valid: true };
  }

  global.ContentTypes = {
    buildContentData: buildContentData,
    validateContent: validateContent,
    getCurrentType: getCurrentType,
    buildUrl: buildUrl,
    buildPhone: buildPhone,
    buildSms: buildSms,
    buildWhatsapp: buildWhatsapp,
    buildEmail: buildEmail,
    buildWifi: buildWifi,
    buildVcard: buildVcard,
    buildLocation: buildLocation,
    buildEvent: buildEvent
  };
})(typeof window !== 'undefined' ? window : this);
