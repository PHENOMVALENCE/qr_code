# QR Studio — Production Readiness

## Release status
The static QR generator is designed to be production-deployable without authentication or a database. The optional PHP persistence API is isolated from the core generator and can be disabled without breaking QR creation or export.

## Production capabilities
- URL, text, phone, SMS, WhatsApp, email, Wi-Fi, vCard, location and calendar-event QR payloads.
- Design presets plus purpose-built website, social, WhatsApp, Wi-Fi, business-card, event, menu and payment-link templates.
- Live preview, gradients, dot/corner styles, logo placement controls and QR frames/CTA labels.
- PNG, SVG, PDF and framed-PNG exports, clipboard, print and Web Share support.
- Local project history, rename/delete, JSON design import/export and keyboard shortcuts.
- QR readiness diagnostics plus in-browser decode verification.
- Batch CSV generation with ZIP export, capped at 100 records per batch.
- Installable PWA shell, app manifest, service worker, offline state indicator and Web Share Target intake.
- Optional hardened PHP file persistence.

## Pre-deployment checklist

### Runtime
- Serve over HTTPS.
- Use PHP 8.2+ if server-side design persistence is enabled.
- Ensure `data/designs` exists and is writable by the web-server user only.
- Keep `data/designs/.htaccess` in place on Apache/shared hosting.
- Confirm `mod_headers` and `mod_mime` are enabled where `.htaccess` is used.

### Security
- Do not expose `data/designs` directly.
- Retain request-size limits and PNG signature validation in `api/save-design.php`.
- Retain strict design-ID validation in `api/get-design.php`.
- Keep security headers enabled.
- Review the CSP whenever runtime CDN dependencies change.
- Do not add unrestricted file uploads or arbitrary URL fetches to the PHP API.

### Functional QA
Run:

```bash
node tests/content-types.test.js
npm install
npx playwright install chromium
npm run test:e2e
```

The PR CI performs syntax checks, PHP linting, manifest validation, payload tests, asset smoke tests, browser workflows and responsive checks at 320, 375, 768, 1024 and 1440 px.

### PWA QA
- Load the site once online and confirm the service worker reaches the `activated` state.
- Confirm installability in Chromium-based browsers.
- Reload while offline and confirm the app shell opens.
- Generate a QR offline after the critical QR rendering dependency has been cached.
- Confirm online/offline indicator behavior.

### Export QA
Test at least:
- plain URL QR;
- high-density text QR;
- Wi-Fi QR;
- vCard QR;
- QR with logo + H error correction;
- framed PNG;
- PDF;
- batch ZIP.

Test generated codes with at least two physical devices when producing printable assets.

## Deployment targets

### Static hosting
Core creation/export works on static hosting. Server-side design persistence will be unavailable.

### Apache/shared hosting
Recommended when the optional PHP save/load API is required. Keep the root `.htaccess` and `data/designs/.htaccess` files.

### Reverse proxy/CDN
Replicate the repository security headers at the proxy layer if `.htaccess` is not processed.

## Operational boundaries
The current product intentionally does not provide dynamic QR redirection, scan analytics, authenticated team workspaces or hosted user files. Those capabilities require a persistent application backend, privacy policy decisions, abuse controls and monitoring and should be treated as a separate SaaS architecture rather than silently added to this static-first product.

## Release gate
A production release should only be merged when:
1. PR CI is green.
2. No unresolved browser-test regressions remain.
3. The production domain is HTTPS.
4. Security headers are verified in the deployed environment.
5. At least one real-device scan test passes for plain and logo-based QR codes.
