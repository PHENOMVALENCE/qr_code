# AGENTS.md

## Purpose
This repository is a production-oriented QR creation studio built with vanilla HTML, CSS and JavaScript, with an optional PHP persistence API. Agents working here must preserve the lightweight architecture while improving usability, reliability, accessibility and maintainability.

## Product direction
The application is evolving from a QR generator into a QR Studio with:
- rich QR content types and branded design controls;
- reusable presets and templates;
- local history and design import/export;
- scanability and verification tooling;
- batch generation;
- PWA/offline support;
- optional dynamic QR and analytics capabilities in later phases.

## Engineering rules
1. Make small, cohesive commits.
2. Work on a feature branch and open or update a pull request.
3. Do not commit directly to `main` for feature work.
4. Keep existing functionality working unless a migration is explicitly documented.
5. Prefer progressive enhancement over unnecessary framework migration.
6. Keep frontend generation usable without a backend.
7. Any backend-dependent feature must fail gracefully when PHP endpoints are unavailable.
8. Preserve keyboard accessibility, semantic HTML, useful ARIA and reduced-motion behavior.
9. Never lower QR scan reliability for visual styling.
10. Validate uploads, encoded payloads and server writes defensively.

## Repository map
- `index.html` — main studio interface.
- `css/styles.css` — base visual system.
- `css/studio-refresh.css` — current QR Studio enhancement layer.
- `js/content-types.js` — payload builders/validation.
- `js/qr-generator.js` — qr-code-styling adapter.
- `js/app.js` — application state, events, export and persistence UI.
- `api/` — optional PHP persistence endpoints.
- `data/designs/` — server-side saved design files.
- `docs/` — product, architecture, design and engineering guidance.

## Before changing UI
Read `docs/DESIGN-SYSTEM.md` and verify desktop/mobile behavior. Keep the QR preview prominent, preserve legible hierarchy, and avoid visual effects that interfere with usability.

## Before changing JavaScript
Understand state flow in `js/app.js`, QR option translation in `js/qr-generator.js`, and payload formatting in `js/content-types.js`. Avoid duplicated content-building logic.

## Before changing PHP
Treat all client input as untrusted. Enforce safe paths, MIME/type limits where files are involved, bounded payload sizes, secure generated IDs and JSON responses with suitable HTTP status codes.

## Definition of done
A change is complete when:
- the feature works on desktop and mobile;
- existing QR types still generate successfully;
- exports remain functional where relevant;
- keyboard and focus behavior are acceptable;
- JavaScript parses without syntax errors;
- PHP files pass lint when touched;
- documentation is updated for behavioral or architectural changes;
- the PR explains the change and validation performed.
