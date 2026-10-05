# AGENTS.md

## Purpose
This repository is a production-oriented, static-first QR creation studio built with vanilla HTML, CSS and JavaScript, with an optional PHP persistence API. Agents must preserve the privacy-first architecture while improving usability, reliability, accessibility, security and maintainability.

## Product boundary
The production QR Studio includes:
- ten QR payload types;
- visual presets and purpose-built templates;
- local project history and JSON import/export;
- QR readiness diagnostics and decode verification;
- logo controls and CTA/frame exports;
- CSV batch generation to ZIP;
- PWA install/offline/share-target capabilities;
- optional hardened PHP design persistence.

Dynamic managed redirects, scan analytics, cloud team workspaces, hosted files, protected destinations and ticketing belong to a **separate authenticated SaaS backend**. Do not bolt those features onto the static generator without an explicit architecture/migration plan.

## Engineering rules
1. Make small, cohesive commits.
2. Work on a feature branch and open/update a pull request.
3. Do not commit feature work directly to `main`.
4. Preserve the core generator path unless a migration is explicitly documented.
5. Prefer progressive enhancement over framework migration.
6. Keep QR generation/export usable without PHP.
7. Backend-dependent functionality must fail gracefully when PHP is unavailable.
8. Preserve keyboard accessibility, semantic HTML, useful ARIA and reduced-motion behavior.
9. Do not trade scan reliability for visual styling without a warning/verification path.
10. Treat file uploads, payloads and persistence requests as untrusted input.
11. Keep browser-local data local unless the user explicitly exports or saves server-side.
12. Pin new third-party runtime dependencies and update CSP/service-worker rules together.
13. Any production feature must receive unit/browser coverage where practical.

## Repository map
- `index.html` — core studio interface and bootstrap.
- `css/styles.css` — base visual system.
- `css/studio-refresh.css` — primary studio layout refresh.
- `css/studio-tools.css` — workspace, history, presets and readiness UI.
- `css/pro-tools.css` — logo/frame/verification UI.
- `css/production-tools.css` — templates, batch and production UX.
- `js/content-types.js` — payload builders and validation.
- `js/qr-generator.js` — `qr-code-styling` adapter.
- `js/app.js` — core application state/events/export/persistence UI.
- `js/studio-tools.js` — presets, local history and JSON exchange.
- `js/qr-diagnostics.js` — readiness heuristics.
- `js/pro-tools.js` — logo controls, frames, decode verification and PWA bootstrap.
- `js/pro-tools-fixes.js` — compatibility/bootstrap bridge.
- `js/production-tools.js` — templates, batch, sharing, install/offline UX and health checks.
- `js/share-target.js` — installed-PWA share intake.
- `manifest.webmanifest`, `sw.js` — PWA metadata/offline behavior.
- `api/` — optional PHP persistence endpoints.
- `data/designs/` — protected server-side design files.
- `tests/` — unit and Playwright browser/responsive coverage.
- `docs/` — product, architecture, design, production and engineering guidance.

## Before changing UI
Read `docs/DESIGN-SYSTEM.md`. Verify desktop/mobile behavior at 320, 375, 768, 1024 and 1440 px. Keep the preview prominent and do not create page-level horizontal overflow.

## Before changing JavaScript
Understand the progressive chain:

```text
content-types.js
  -> studio-tools.js
  -> qr-diagnostics.js
  -> pro-tools.js
  -> pro-tools-fixes.js
  -> production-tools.js / share-target.js
```

Do not duplicate payload construction outside `js/content-types.js`. Renderer-specific behavior belongs in `js/qr-generator.js`.

## Before changing PWA/runtime dependencies
If adding/changing a CDN dependency:
- pin a version;
- update root CSP in `.htaccess`;
- update `REMOTE_RUNTIME` in `sw.js` if offline availability is important;
- update architecture/README when materially relevant;
- add/adjust CI checks.

## Before changing PHP
Treat all client input as untrusted. Preserve:
- method restrictions;
- request-size limits;
- bounded design data/options;
- strict generated IDs;
- safe storage paths;
- PNG validation;
- protected `data/designs` access;
- correct HTTP status codes and JSON responses.

## Definition of done
A change is complete when:
- the feature works at relevant mobile/desktop widths;
- existing QR types continue to generate;
- readiness/verification behavior remains coherent;
- exports remain functional where relevant;
- keyboard/focus behavior is acceptable;
- JavaScript syntax checks pass;
- PHP lint passes when PHP is touched;
- unit/browser tests are updated where behavior changed;
- documentation is updated for behavior/architecture/security changes;
- PR CI is green;
- the PR explains implementation and validation performed.

For release validation, also read `docs/PRODUCTION-READINESS.md`.
