# QR Studio

A modern, privacy-first web application for creating, styling, checking and exporting QR codes. Core generation runs entirely in the browser with no account and no paid API requirement. An optional PHP backend can persist generated designs.

## Features

### QR content types
Create QR codes for:
- Website URLs
- Plain text
- Phone calls
- SMS
- WhatsApp click-to-chat with an optional pre-filled message
- Email
- Wi-Fi credentials
- vCard contacts
- Geographic coordinates
- Calendar events

### Customization
- Foreground/background colors
- Linear foreground gradients
- 128–1024 px output sizing
- Error correction levels L, M, Q and H
- Multiple corner-square, corner-dot and data-dot styles
- Optional text label
- Center logo/image
- Transparent background
- Five quick visual presets: Classic, Indigo Flow, Ocean, Editorial and Neon Night

### QR Studio workspace
- Responsive studio layout with sticky desktop preview
- Horizontal content-mode selector on smaller screens
- Recent local project history stored in the browser
- Restore previously generated projects
- Export a design configuration as JSON
- Import a QR Studio JSON design on another browser/device
- Keyboard shortcuts:
  - `Ctrl/Cmd + S` — save the current project locally
  - `Ctrl/Cmd + Enter` — generate immediately

### QR readiness diagnostics
QR Studio provides a non-authoritative readiness score using practical heuristics including:
- foreground/background contrast;
- output size;
- payload density;
- logo usage;
- selected error correction level;
- transparent-background risk.

The score is guidance, not a guarantee that every camera/device will decode the QR. In-browser decode verification is planned separately.

### Validation and payload safety
- URL normalization and HTTP/HTTPS validation
- Phone and WhatsApp digit-length validation
- Email format validation
- Latitude/longitude range checks
- Event start/end ordering checks
- Safer escaping for Wi-Fi, vCard and iCalendar payloads

### Export & output
- PNG
- SVG
- PDF via jsPDF
- Clipboard image copy where supported
- Print
- Optional server-side design persistence

### User experience
- Live preview
- Reset and undo
- Dark mode with persisted preference
- Mobile-friendly responsive controls
- Keyboard focus states and reduced-motion support
- No authentication required for the core generator

## Technology stack

- **Frontend:** HTML5, CSS3 and vanilla JavaScript
- **QR rendering:** `qr-code-styling`
- **PDF export:** `jsPDF`
- **Optional backend:** PHP 7.4+
- **Persistence:** browser `localStorage` for local projects; optional file-based PHP persistence in `data/designs/`
- **CI:** GitHub Actions on pull requests

## Setup

### Frontend-only development

1. Clone the repository.
2. Serve the project through an HTTP server:
   - XAMPP: place under `htdocs/qr_code`
   - PHP: `php -S localhost:8080`
   - Node: `npx serve .`
3. Open the served URL in a modern browser.

Generation, presets, local history, diagnostics and exports work without the PHP backend. The server-side **Save design** action requires PHP.

### Optional PHP design persistence

Create a writable design directory:

```bash
mkdir -p data/designs
chmod 755 data/designs
```

Saved server designs use:
- `data/designs/{id}.json`
- `data/designs/{id}.png` when image data is supplied

### Shared hosting

Upload the project to the desired web root and ensure `data/designs/` is writable if server persistence is enabled. Static QR creation does not require a database.

## Project structure

```text
qr_code/
├── index.html
├── AGENTS.md
├── css/
│   ├── styles.css
│   ├── studio-refresh.css
│   └── studio-tools.css
├── js/
│   ├── app.js
│   ├── content-types.js
│   ├── qr-generator.js
│   ├── studio-tools.js
│   └── qr-diagnostics.js
├── api/
│   ├── save-design.php
│   └── get-design.php
├── data/designs/
├── docs/
│   ├── AGENT-GUIDE.md
│   ├── ARCHITECTURE.md
│   ├── DESIGN-SYSTEM.md
│   ├── GIT-WORKFLOW.md
│   └── PRODUCT-ROADMAP.md
├── .github/workflows/ci.yml
├── README.md
└── SETUP.md
```

## Design exchange format

Local JSON export uses a versioned payload:

```json
{
  "schema": "qr-studio-design",
  "version": 1,
  "name": "Example project",
  "contentType": "url",
  "fields": {},
  "savedAt": "2026-10-05T00:00:00.000Z"
}
```

Future schema changes should retain compatibility or provide an explicit migration path.

## Privacy

Core QR generation, presets, readiness analysis and local project history operate in the browser. Local projects are not uploaded by the local-history feature. Data leaves the browser only when the user explicitly uses an external destination/service or the optional PHP save endpoint.

## Accessibility & performance

- Semantic HTML and ARIA where useful
- Keyboard focus visibility
- Responsive layouts from mobile to desktop
- `prefers-reduced-motion` support
- Debounced QR rendering during typing
- Progressive enhancement: the base generator remains the primary runtime path

## Documentation

See:
- `docs/DESIGN-SYSTEM.md` for visual and responsive rules
- `docs/ARCHITECTURE.md` for module boundaries
- `docs/GIT-WORKFLOW.md` for branching, commits and PR discipline
- `docs/AGENT-GUIDE.md` and root `AGENTS.md` for coding-agent conventions
- `docs/PRODUCT-ROADMAP.md` for upcoming features

## Browser support

Modern Chrome, Edge, Firefox and Safari with Canvas/SVG support. Clipboard image copy requires HTTPS/localhost and browser support for `navigator.clipboard.write` and `ClipboardItem`.

## License

Use and modify freely. `qr-code-styling` is MIT licensed. jsPDF is distributed under its own license; consult the respective upstream projects for details.
