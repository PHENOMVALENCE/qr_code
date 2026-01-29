/**
 * Content types for QR Code Generator
 * Builds the encoded string and validates input for each type (URL, Phone, SMS, WiFi, vCard, etc.).
 */
(function (global) {
  'use strict';

  /**
   * Build encoded string for URL type. Ensures scheme if missing.
   */
  function buildUrl(value) {
    var v = (value || '').trim();
    if (!v) return '';
    if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(v)) v = 'https://' + v;
    return v;
  }

  /**
   * Build tel: URI for phone.
   */
  function buildPhone(value) {
    var v = (value || '').trim().replace(/\s/g, '');
    if (!v) return '';
    return 'tel:' + v;
  }

  /**
   * Build SMS URI (smsto: for pre-filled body, sms: for number only).
   */
  function buildSms(number, body) {
    var num = (number || '').trim().replace(/\s/g, '');
    if (!num) return '';
    var b = (body || '').trim();
    if (b) return 'smsto:' + num + ':' + b;
    return 'sms:' + num;
  }

  /**
   * Build mailto: URI.
   */
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

  /**
   * Build WiFi config string. Format: WIFI:T:WPA;S:ssid;P:password;;
   */
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
    return s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/"/g, '\\"').replace(/,/g, '\\,');
  }

  /**
   * Build vCard 3.0 string.
   */
  function buildVcard(name, tel, email, org) {
    var n = (name || '').trim();
    if (!n) return '';
    var lines = ['BEGIN:VCARD', 'VERSION:3.0', 'FN:' + n, 'N:' + n];
    if ((tel || '').trim()) lines.push('TEL:' + (tel || '').trim().replace(/\s/g, ''));
    if ((email || '').trim()) lines.push('EMAIL:' + (email || '').trim());
    if ((org || '').trim()) lines.push('ORG:' + (org || '').trim());
    lines.push('END:VCARD');
    return lines.join('\n');
  }

  /**
   * Build geo: URI for location.
   */
  function buildLocation(lat, lng) {
    var la = parseFloat((lat || '').trim(), 10);
    var lo = parseFloat((lng || '').trim(), 10);
    if (isNaN(la) || isNaN(lo)) return '';
    return 'geo:' + la + ',' + lo;
  }

  /**
   * Build simple event text (iCal SUMMARY + DTSTART + DTEND + LOCATION + DESCRIPTION).
   */
  function buildEvent(title, startDt, endDt, location, desc) {
    var t = (title || '').trim();
    if (!t) return '';
    var lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'BEGIN:VEVENT', 'SUMMARY:' + t];
    if ((startDt || '').trim()) lines.push('DTSTART:' + formatIcalDate(startDt.trim()));
    if ((endDt || '').trim()) lines.push('DTEND:' + formatIcalDate(endDt.trim()));
    if ((location || '').trim()) lines.push('LOCATION:' + (location || '').trim());
    if ((desc || '').trim()) lines.push('DESCRIPTION:' + (desc || '').trim());
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

  /**
   * Get current content type from UI (from active tab).
   */
  function getCurrentType(el) {
    var btn = el.contentTypeContainer && el.contentTypeContainer.querySelector('.content-type-btn.active');
    return (btn && btn.getAttribute('data-type')) || 'url';
  }

  /**
   * Build encoded data string from current type and form values. el = refs to content inputs.
   */
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

  /**
   * Validate current type and return { valid: boolean, message?: string }.
   */
  function validateContent(el, contentType) {
    var type = contentType || getCurrentType(el);
    var data = buildContentData(el, type);
    if (!data || data.length === 0) {
      var msg = {
        url: 'Enter a website URL.',
        text: 'Enter some text.',
        phone: 'Enter a phone number.',
        sms: 'Enter a phone number.',
        email: 'Enter an email address.',
        wifi: 'Enter the network name (SSID).',
        vcard: 'Enter at least a name.',
        location: 'Enter latitude and longitude.',
        event: 'Enter an event title.'
      };
      return { valid: false, message: msg[type] || 'Please fill in the required fields.' };
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
    buildEmail: buildEmail,
    buildWifi: buildWifi,
    buildVcard: buildVcard,
    buildLocation: buildLocation,
    buildEvent: buildEvent
  };
})(typeof window !== 'undefined' ? window : this);
