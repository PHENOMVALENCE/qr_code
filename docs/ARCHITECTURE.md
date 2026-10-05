# Architecture

## Overview
QR Studio is intentionally lightweight. The core product runs entirely in the browser and uses an optional PHP backend only for persisted designs. This allows the generator, preview and export workflow to remain usable on static hosting.

## Runtime layers

### Presentation
- `index.html`
- `css/styles.css`
- `css/studio-refresh.css`

Responsibilities:
- semantic structure;
- responsive layout;
- themes and visual hierarchy;
- form controls and export UI.

### Application orchestration
- `js/app.js`

Responsibilities:
- DOM references;
- event binding;
- state collection;
- undo state;
- logo upload state;
- QR refresh lifecycle;
- export/copy/print actions;
- optional design persistence calls;
- dark mode.

### Payload/domain formatting
- `js/content-types.js`

Responsibilities:
- convert user input into standards-compatible QR payload strings;
- URL, text, phone, SMS, email, WiFi, vCard, location and event formats;
- basic content validation.

New QR content types should be added here rather than assembled directly inside UI event handlers.

### QR rendering adapter
- `js/qr-generator.js`

Responsibilities:
- map application options to `qr-code-styling`;
- create/update QR render instances;
- centralize third-party library-specific configuration.

### Optional persistence API
- `api/save-design.php`
- `api/get-design.php`
- `data/designs/`

Responsibilities:
- persist/retrieve design metadata;
- optionally persist generated image data;
- keep backend requirements optional for the core product.

## Third-party runtime dependencies
Current browser dependencies are CDN-loaded:
- `qr-code-styling`
- `jsPDF`
- Google Fonts / DM Sans

Future production hardening may pin/integrity-check assets or vendor critical dependencies where appropriate.

## State model
The current application uses DOM-backed state plus small in-memory state such as the active QR instance, uploaded logo and undo history.

Planned evolution:
- create a normalized design-state object;
- serialize that object for history/presets/import/export;
- preserve compatibility with existing UI controls;
- avoid introducing a large state-management dependency.

## Planned modules
As the codebase grows, preferred modular extraction is:
- `js/design-state.js` — normalized design serialization.
- `js/presets.js` — curated style templates.
- `js/history.js` — local project/history store.
- `js/scanability.js` — contrast/data-density heuristics.
- `js/import-export.js` — JSON design exchange.
- `js/batch.js` — CSV parsing and batch QR jobs.

This modularization should happen incrementally, not as a full rewrite.

## Dynamic QR architecture — later phase
Dynamic QR codes require a server-managed redirect identifier rather than direct destination encoding.

Conceptual flow:

```text
QR payload -> https://qr.example.com/r/{slug}
             -> redirect service
             -> current target URL
             -> analytics event
```

That later architecture will require authenticated management, storage, redirect safety, analytics privacy decisions and operational monitoring. It should remain separate from the static generator until intentionally introduced.

## Non-functional requirements
- Core QR generation works without login.
- Static generation should continue without PHP.
- Responsive from narrow mobile to desktop.
- Accessible keyboard workflow.
- Safe file/payload handling.
- QR styling must not silently compromise practical scanability.
- Export must be deterministic enough for professional use.

## Architectural decision rule
Before adding a dependency or framework, ask whether it materially improves maintainability, testing or product capability. Do not migrate the existing stack solely for novelty.
