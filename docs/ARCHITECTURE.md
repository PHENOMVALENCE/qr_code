# Architecture

## Overview
QR Studio is intentionally lightweight. The core product runs entirely in the browser and uses an optional PHP backend only for persisted designs. This allows the generator, preview and export workflow to remain usable on static hosting.

## Runtime layers

### Presentation
- `index.html`
- `css/styles.css`
- `css/studio-refresh.css`
- `css/studio-tools.css`

Responsibilities:
- semantic structure;
- responsive layout;
- themes and visual hierarchy;
- form controls and export UI;
- studio project/preset/history presentation;
- readiness diagnostics presentation.

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

### Studio workspace tools
- `js/studio-tools.js`

Responsibilities:
- progressive enhancement of the core generator;
- WhatsApp content-mode UI;
- curated visual presets;
- local project history using `localStorage`;
- JSON design import/export;
- keyboard shortcuts;
- restore/apply design snapshots;
- bootstrap quality diagnostics.

This module is intentionally independent of the QR renderer. It operates through stable DOM controls and the existing Generate action so the core application remains usable if the studio layer fails to load.

### Quality diagnostics
- `js/qr-diagnostics.js`

Responsibilities:
- estimate color contrast;
- check export size;
- warn about dense payloads;
- recommend suitable error correction when a logo is used;
- provide a non-authoritative QR readiness score.

The readiness score is a heuristic and must not be presented as proof that a QR will scan on every device. Actual encode/decode verification remains a separate planned feature.

### Payload/domain formatting
- `js/content-types.js`

Responsibilities:
- convert user input into standards-compatible QR payload strings;
- URL, text, phone, SMS, WhatsApp, email, Wi-Fi, vCard, location and event formats;
- normalize URLs and WhatsApp click-to-chat links;
- validate phone/email/location/event input;
- escape special characters for Wi-Fi, vCard and iCalendar payloads.

New QR content types should be implemented here rather than assembled directly inside UI event handlers.

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
The core application still uses DOM-backed state plus small in-memory state such as the active QR instance, uploaded logo and undo history.

The studio enhancement serializes a controlled set of DOM fields into a versioned snapshot:

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

This format backs local history and JSON exchange. Future schema changes must preserve backwards compatibility or provide an explicit migration path.

## Preferred future modularization
As complexity grows, the current studio module can be split further into:
- `js/design-state.js` — normalized design serialization;
- `js/presets.js` — curated style templates;
- `js/history.js` — local project/history store;
- `js/import-export.js` — JSON design exchange;
- `js/batch.js` — CSV parsing and batch QR jobs;
- `js/verification.js` — in-browser decode verification.

This modularization should happen incrementally, not as a full rewrite.

## Progressive enhancement rule
The base generator must remain functional without studio-specific JavaScript or the optional PHP API. Studio functionality should enhance, not replace, the core QR generation path.

## Dynamic QR architecture — later phase
Dynamic QR codes require a server-managed redirect identifier rather than direct destination encoding.

```text
QR payload -> https://qr.example.com/r/{slug}
             -> redirect service
             -> current target URL
             -> analytics event
```

That later architecture will require authenticated management, storage, redirect safety, analytics privacy decisions and operational monitoring. It should remain separate from the static generator until intentionally introduced.

## Non-functional requirements
- Core QR generation works without login.
- Static generation continues without PHP.
- Responsive from narrow mobile to desktop.
- Accessible keyboard workflow.
- Safe file/payload handling.
- QR styling must not silently compromise practical scanability.
- Export must be deterministic enough for professional use.
- Local project data remains browser-local unless the user explicitly exports or uses the optional backend.

## Architectural decision rule
Before adding a dependency or framework, ask whether it materially improves maintainability, testing or product capability. Do not migrate the existing stack solely for novelty.
