'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const code = fs.readFileSync('js/content-types.js', 'utf8');
const context = { URL, console, setTimeout, clearTimeout };
vm.createContext(context);
vm.runInContext(code, context, { filename: 'js/content-types.js' });

const ContentTypes = context.ContentTypes;
assert.ok(ContentTypes, 'ContentTypes should be exposed by content-types.js');

function node(value) { return { value: value == null ? '' : String(value) }; }
function validate(type, fields) { return ContentTypes.validateContent(fields || {}, type); }

// Builders
assert.equal(ContentTypes.buildUrl('example.com'), 'https://example.com');
assert.equal(ContentTypes.buildUrl('https://example.com/path'), 'https://example.com/path');
assert.equal(ContentTypes.buildPhone('+255 753 123 456'), 'tel:+255753123456');
assert.equal(ContentTypes.buildSms('+255 753 123 456', 'Hello'), 'smsto:+255753123456:Hello');
assert.equal(ContentTypes.buildSms('+255753123456', ''), 'sms:+255753123456');
assert.equal(ContentTypes.buildWhatsapp('+255 753 123 456', 'Hello there'), 'https://wa.me/255753123456?text=Hello%20there');
assert.equal(ContentTypes.buildEmail('hello@example.com', 'Hi', 'Body text'), 'mailto:hello%40example.com?subject=Hi&body=Body%20text');
assert.equal(ContentTypes.buildWifi('Office;Guest', 'pass:word', 'WPA'), 'WIFI:T:WPA;S:Office\\;Guest;P:pass\\:word;;');
assert.equal(ContentTypes.buildWifi('Open Network', '', 'nopass'), 'WIFI:T:nopass;S:Open Network;;');
assert.match(ContentTypes.buildVcard('Jane Doe', '+255700000000', 'jane@example.com', 'Acme'), /^BEGIN:VCARD[\s\S]*FN:Jane Doe[\s\S]*TEL:\+255700000000[\s\S]*END:VCARD$/);
assert.equal(ContentTypes.buildLocation('-6.7924', '39.2083'), 'geo:-6.7924,39.2083');
assert.match(ContentTypes.buildEvent('Launch', '2026-10-05T12:00', '2026-10-05T13:00', 'Dar es Salaam', 'Welcome'), /^BEGIN:VCALENDAR[\s\S]*SUMMARY:Launch[\s\S]*END:VCALENDAR$/);

// Validation objects originate inside a vm context. Compare primitives rather than object prototypes.
assert.equal(validate('url', { contentUrl: node('https://example.com') }).valid, true);
assert.equal(validate('url', { contentUrl: node('ftp://example.com') }).valid, false);
assert.equal(validate('text', { contentText: node('Hello') }).valid, true);
assert.equal(validate('phone', { contentPhone: node('+255700000000') }).valid, true);
assert.equal(validate('phone', { contentPhone: node('123') }).valid, false);
assert.equal(validate('sms', { contentSmsNumber: node('+255700000000'), contentSmsBody: node('Hi') }).valid, true);
assert.equal(validate('sms', { contentSmsNumber: node('12'), contentSmsBody: node('Hi') }).valid, false);
assert.equal(validate('email', { contentEmail: node('hello@example.com'), contentEmailSubject: node(''), contentEmailBody: node('') }).valid, true);
assert.equal(validate('email', { contentEmail: node('not-an-email') }).valid, false);
assert.equal(validate('wifi', { contentWifiSsid: node('Office'), contentWifiPass: node('secret'), contentWifiType: node('WPA') }).valid, true);
assert.equal(validate('vcard', { contentVcardName: node('Jane Doe'), contentVcardTel: node(''), contentVcardEmail: node(''), contentVcardOrg: node('') }).valid, true);
assert.equal(validate('location', { contentLat: node('-6.7924'), contentLng: node('39.2083') }).valid, true);
assert.equal(validate('location', { contentLat: node('-91'), contentLng: node('39') }).valid, false);
assert.equal(validate('location', { contentLat: node('0'), contentLng: node('181') }).valid, false);
assert.equal(validate('event', {
  contentEventTitle: node('Meeting'), contentEventStart: node('2026-10-05T12:00'), contentEventEnd: node('2026-10-05T13:00'),
  contentEventLocation: node('Office'), contentEventDesc: node('')
}).valid, true);
assert.equal(validate('event', {
  contentEventTitle: node('Meeting'), contentEventStart: node('2026-10-05T12:00'), contentEventEnd: node('2026-10-05T11:00'),
  contentEventLocation: node(''), contentEventDesc: node('')
}).valid, false);

const whatsappFields = {
  contentTypeContainer: null,
  contentWhatsappNumber: node('255753123456'),
  contentWhatsappMessage: node('Hi')
};
assert.equal(ContentTypes.buildContentData(whatsappFields, 'whatsapp'), 'https://wa.me/255753123456?text=Hi');
assert.equal(validate('whatsapp', whatsappFields).valid, true);
assert.equal(validate('whatsapp', { contentWhatsappNumber: node('123'), contentWhatsappMessage: node('') }).valid, false);

// Payload length safety limit.
assert.equal(validate('text', { contentText: node('x'.repeat(2001)) }).valid, false);

console.log('content-types tests passed');
