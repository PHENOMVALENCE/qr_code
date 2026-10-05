# Architecture

## Overview
QR Studio is a lightweight, static-first QR creation application. Core generation, styling, verification and export run in the browser. PHP is optional and used only for persisted designs.

This split keeps the primary generator usable on static hosting, reduces data exposure and avoids forcing authentication or a database onto users who only need QR creation/export.

## Runtime layers

### Presentation
- `index.html`
- `css/styles.css`
- `css/studio-refresh.css`
- `css/studio-tools.css`
- `css/pro-tools.css`
- `css/production-tools.css`

Responsibilities:
- semantic application structure;
- responsive layout and visual hierarchy;
- theme/dark-mode presentation;
- creator workspace, templates, presets and local projects;
- QR readiness and verification UI;
- frame/CTA controls;
- batch-generation UI;
- install/share/offline UX.

### Core application orchestration
- `js/app.js`

Responsibilities:
- DOM references and event binding;
- core state collection;
- undo history;
- logo data lifecycle;
- QR refresh lifecycle;
- PNG/SVG/PDF, clipboard and print actions;
- optional server design persistence;
- dark mode.

### Payload/domain formatting
- `js/content-types.js`

Responsibilities:
- URL, text, phone, SMS, WhatsApp, email, Wi-Fi, vCard, location and event payloads;
- standards-oriented escaping/normalization;
- field validation and payload-length safety limits;
- bootstrap the progressive studio layer.

New QR payload formats belong here rather than in click handlers.

### QR rendering adapter
- `js/qr-generator.js`

Responsibilities:
- translate normalized application state into `qr-code-styling` options;
- create/update QR renderer instances;
- isolate third-party renderer configuration.

### Studio workspace
- `js/studio-tools.js`

Responsibilities:
- WhatsApp mode UI;
- visual presets;
- local project history;
- versioned JSON import/export;
- keyboard shortcuts;
- design snapshot restore;
- bootstrap diagnostics.

### Quality diagnostics
- `js/qr-diagnostics.js`

Responsibilities:
- contrast heuristic;
- output-size guidance;
- payload-density guidance;
- logo/error-correction recommendations;
- QR readiness score;
- bootstrap professional tools.

The score is advisory; actual decoding is handled separately.

### Professional creator tools
- `js/pro-tools.js`
- `js/pro-tools-fixes.js`

Responsibilities:
- logo size and clear-space controls;
- logo MIME/file-size validation;
- frame/CTA preview and framed PNG export;
- local-project rename/delete;
- `jsQR` encode/decode verification;
- PWA bootstrap;
- compatibility around progressive history rendering;
- bootstrap the final production layer.

### Production tools
- `js/production-tools.js`
- `js/share-target.js`

Responsibilities:
- purpose-built QR templates;
- CSV batch parsing and ZIP generation via `JSZip`;
- logo pixel-dimension validation;
- Web Share and install-prompt UX;
- online/offline status;
- application health check (`window.QRStudioHealth`);
- Web Share Target intake for links/text shared into the installed app.

### PWA/runtime resilience
- `manifest.webmanifest`
- `sw.js`
- `assets/qr-studio-icon.svg`

Responsibilities:
- installability metadata;
- application identity/icon;
- offline application shell;
- critical runtime dependency caching;
- stale cache cleanup;
- navigation fallback when offline.

### Optional persistence API
- `api/save-design.php`
- `api/get-design.php`
- `data/designs/.htaccess`

Responsibilities:
- save/retrieve explicit user-requested design metadata;
- optional PNG preview storage;
- bounded request/image handling;
- strict design identifiers;
- protected storage directory.

The backend is not required for local history, JSON import/export, generation or export.

## Third-party browser dependencies
Pinned runtime dependencies currently include:
- `qr-code-styling@1.6.0-rc.1` — QR renderer;
- `jsPDF@2.5.1` — PDF export;
- `jsQR@1.4.0` — decode verification;
- `JSZip@3.10.1` — batch ZIP export;
- DM Sans via Google Fonts (non-critical; system font fallback remains available).

Critical QR dependencies are cached by the service worker after installation/first availability for repeat offline use.

## State model
The legacy generator uses DOM-backed state plus small in-memory values such as the active QR instance, uploaded logo and undo history.

Studio project state is serialized into a controlled versioned snapshot:

```json
{
  "schema": "qr-studio-design",
  "version": 1,
  "name": "Project name",
  "contentType": "url",
  "fields": {},
  "savedAt": "ISO-8601 timestamp"
}
```

The format backs local history and JSON exchange. Schema changes must preserve backwards compatibility or introduce an explicit migration.

## Batch architecture
Batch input is intentionally client-side:

```text
CSV -> parser -> payload builder -> QRCodeStyling -> PNG blob -> JSZip -> ZIP download
```

Production limits:
- maximum 100 records per batch;
- maximum uploaded CSV size 1 MB;
- supported batch types: URL, text, phone, WhatsApp and email;
- no batch data is sent to the persistence API.

## Security boundaries
- Root `.htaccess` supplies browser security headers on Apache deployments.
- `data/designs/.htaccess` blocks direct persisted-file access.
- PHP endpoints validate request method, content size, identifiers, option keys and PNG signatures.
- The app does not proxy arbitrary URLs or fetch user-supplied remote files server-side.
- Browser-local projects remain local unless the user explicitly exports or invokes the optional save API.

## Testing architecture
### Unit
`tests/content-types.test.js` covers every payload builder and major validation branch.

### Browser
`tests/e2e/qr-studio.spec.js` uses Playwright/Chromium for:
- full production workspace boot;
- QR generation;
- templates;
- local project persistence;
- batch UI;
- page-level responsive overflow checks at 320, 375, 768, 1024 and 1440 px.

### CI
PR CI performs:
- required-file validation;
- JavaScript syntax checks;
- PHP linting;
- manifest JSON validation;
- unit tests;
- production-asset reference checks;
- static server smoke tests;
- Playwright browser/responsive QA.

## Progressive enhancement rule
The base generator must remain functional even if optional studio/pro/production enhancement modules fail to load. Enhancements should layer on stable controls rather than replacing the core QR generation path.

## Separate SaaS architecture
Dynamic QR redirects, analytics, expiration policies, hosted files, protected destinations, event-ticket validation and cloud team workspaces are not implemented inside this static-first architecture. They require authenticated persistent infrastructure, abuse controls, privacy/retention policy and monitoring.

Conceptually:

```text
QR -> managed redirect slug -> policy/auth checks -> analytics event -> destination
```

That system should be deployed as a separate backend product/API rather than weakening the static generator's privacy/security model.

## Non-functional requirements
- QR generation works without login.
- Static generation works without PHP.
- Responsive from 320 px through desktop widths.
- Keyboard-accessible editing workflow.
- Safe bounded file/payload handling.
- QR styling includes quality warnings and decode verification.
- Local project data is browser-local by default.
- HTTPS is required for production PWA/service-worker behavior.
