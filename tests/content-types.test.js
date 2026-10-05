'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const code = fs.readFileSync('js/content-types.js', 'utf8');
const context = {
  URL,
  console,
  setTimeout,
  clearTimeout
};
vm.createContext(context);
vm.runInContext(code, context, { filename: 'js/content-types.js' });

const ContentTypes = context.ContentTypes;
assert.ok(ContentTypes, 'ContentTypes should be exposed by content-types.js');

function node(value) {
  return { value: value == null ? '' : String(value) };
}

function validate(type, fields) {
  return ContentTypes.validateContent(fields || {}, type);
}

assert.equal(ContentTypes.buildUrl('example.com'), 'https://example.com');
assert.equal(ContentTypes.buildPhone('+255 753 123 456'), 'tel:+255753123456');
assert.equal(ContentTypes.buildSms('+255 753 123 456', 'Hello'), 'smsto:+255753123456:Hello');
assert.equal(
  ContentTypes.buildWhatsapp('+255 753 123 456', 'Hello there'),
  'https://wa.me/255753123456?text=Hello%20there'
);
assert.equal(
  ContentTypes.buildEmail('hello@example.com', 'Hi', 'Body text'),
  'mailto:hello%40example.com?subject=Hi&body=Body%20text'
);
assert.equal(
  ContentTypes.buildWifi('Office;Guest', 'pass:word', 'WPA'),
  'WIFI:T:WPA;S:Office\\;Guest;P:pass\\:word;;'
);
assert.equal(ContentTypes.buildLocation('-6.7924', '39.2083'), 'geo:-6.7924,39.2083');

// Validation objects originate inside a vm context. Compare primitives rather than
// object prototypes so the test remains correct across JavaScript realms.
assert.equal(validate('url', { contentUrl: node('https://example.com') }).valid, true);
assert.equal(validate('url', { contentUrl: node('ftp://example.com') }).valid, false);
assert.equal(validate('email', { contentEmail: node('not-an-email') }).valid, false);
assert.equal(validate('phone', { contentPhone: node('123') }).valid, false);
assert.equal(validate('location', { contentLat: node('-91'), contentLng: node('39') }).valid, false);
assert.equal(
  validate('event', {
    contentEventTitle: node('Meeting'),
    contentEventStart: node('2026-10-05T12:00'),
    contentEventEnd: node('2026-10-05T11:00'),
    contentEventLocation: node(''),
    contentEventDesc: node('')
  }).valid,
  false
);

const whatsappFields = {
  contentTypeContainer: null,
  contentWhatsappNumber: node('255753123456'),
  contentWhatsappMessage: node('Hi')
};
assert.equal(ContentTypes.buildContentData(whatsappFields, 'whatsapp'), 'https://wa.me/255753123456?text=Hi');
assert.equal(validate('whatsapp', whatsappFields).valid, true);

console.log('content-types tests passed');
