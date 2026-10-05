# QR Studio

QR Studio is a production-focused, privacy-first web application for creating, styling, validating, verifying and exporting QR codes. Core generation runs entirely in the browser with no account requirement. An optional hardened PHP API can persist explicit user-requested designs.

## Production feature set

### QR payloads
- Website URL
- Plain text
- Phone
- SMS
- WhatsApp click-to-chat
- Email
- Wi-Fi
- vCard contact
- Geographic coordinates
- Calendar event

### Templates and visual design
- Website
- Social profile
- WhatsApp
- Wi-Fi card
- Business card
- Event
- Menu
- Payment link
- Five reusable visual presets: Classic, Indigo Flow, Ocean, Editorial and Neon Night
- Foreground/background colors
- Gradients
- Multiple data-dot and corner styles
- Output sizes from 128–1024 px
- Error correction L/M/Q/H
- Center logo with size and clear-space controls
- QR frames and CTA labels including custom CTA text
- Transparent background support

### Project workflow
- Live preview
- Sticky desktop preview layout
- Local project history
- Restore, rename and delete saved local projects
- JSON design export/import
- Reset and undo
- Dark mode
- Keyboard shortcuts:
  - `Ctrl/Cmd + S` — save locally
  - `Ctrl/Cmd + Enter` — generate immediately

### Quality and verification
- QR readiness score
- Contrast diagnostics
- Payload-density warnings
- Export-size guidance
- Logo/error-correction guidance
- Transparent-background warnings
- In-browser decode verification with `jsQR`
- URL, phone, WhatsApp, email, coordinate and event validation
- Wi-Fi/vCard/iCalendar escaping
- Logo MIME, file-size and pixel-dimension validation

### Export
- PNG
- SVG
- PDF
- Framed PNG
- Clipboard image copy
- Print
- Web Share where supported
- CSV batch generation to ZIP, up to 100 QR codes per batch

### PWA/offline
- Installable web app manifest
- App icon
- Service worker
- Offline application shell
- Critical QR dependency caching for repeat offline use
- Install prompt where supported
- Online/offline status indicator
- Web Share Target for links/text shared into the installed app

### Optional PHP persistence
- Explicit Save Design action only
- Bounded request sizes
- Allowed-option filtering
- Strong random design IDs
- PNG signature/size validation
- Protected `data/designs` storage
- Strict retrieval ID validation

## Technology

- HTML5
- CSS3
- Vanilla JavaScript
- PHP 8.2+ for optional persistence
- `qr-code-styling@1.6.0-rc.1`
- `jsPDF@2.5.1`
- `jsQR@1.4.0`
- `JSZip@3.10.1`
- Playwright for browser/responsive QA
- GitHub Actions for PR CI

## Run locally

### Basic app

```bash
php -S 127.0.0.1:8080
```

Then open `http://127.0.0.1:8080`.

The generator, local history, templates, diagnostics and exports work without the PHP persistence API being configured separately.

### Automated tests

```bash
node tests/content-types.test.js
npm install
npx playwright install chromium
npm run test:e2e
```

## Optional PHP persistence

Create a writable directory owned appropriately by the web-server user:

```bash
mkdir -p data/designs
chmod 750 data/designs
```

On Apache/shared hosting, keep both repository `.htaccess` files in place.

Persisted files are intentionally not directly web-accessible; retrieval goes through `api/get-design.php`.

## Batch CSV format

```csv
name,type,data
Homepage,url,https://example.com
Support,whatsapp,255700000000
Hotline,phone,+255700000000
Greeting,text,Hello world
```

Supported batch types are `url`, `text`, `phone`, `whatsapp` and `email`.

## Project structure

```text
qr_code/
├── index.html
├── AGENTS.md
├── .htaccess
├── manifest.webmanifest
├── sw.js
├── package.json
├── playwright.config.js
├── assets/
│   └── qr-studio-icon.svg
├── css/
│   ├── styles.css
│   ├── studio-refresh.css
│   ├── studio-tools.css
│   ├── pro-tools.css
│   └── production-tools.css
├── js/
│   ├── app.js
│   ├── content-types.js
│   ├── qr-generator.js
│   ├── studio-tools.js
│   ├── qr-diagnostics.js
│   ├── pro-tools.js
│   ├── pro-tools-fixes.js
│   ├── production-tools.js
│   └── share-target.js
├── api/
│   ├── save-design.php
│   └── get-design.php
├── data/designs/
│   └── .htaccess
├── tests/
│   ├── content-types.test.js
│   └── e2e/qr-studio.spec.js
├── docs/
│   ├── AGENT-GUIDE.md
│   ├── ARCHITECTURE.md
│   ├── DESIGN-SYSTEM.md
│   ├── GIT-WORKFLOW.md
│   ├── PRODUCT-ROADMAP.md
│   └── PRODUCTION-READINESS.md
└── .github/workflows/ci.yml
```

## Design exchange format

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

## Privacy model

Core QR content stays in the browser. Local project history uses browser storage. Batch input is processed locally. QR content is sent to the optional PHP endpoint only when the user explicitly invokes the server-side Save Design action.

Dynamic QR redirects, scan analytics, cloud team workspaces and hosted user files are intentionally outside this static-first release because they require authenticated persistent infrastructure and separate privacy/retention controls.

## CI / release gate

Every pull request runs:
- required-file validation;
- JavaScript syntax checks;
- PHP linting;
- manifest validation;
- payload unit tests;
- static asset smoke tests;
- Playwright browser workflow checks;
- responsive page-overflow checks at 320, 375, 768, 1024 and 1440 px.

See `docs/PRODUCTION-READINESS.md` before deploying.

## Browser support

Target: current Chrome, Edge, Firefox and Safari. PWA install, Web Share and clipboard capabilities vary by browser and require HTTPS in production.

## License

Use and modify freely. Third-party libraries remain subject to their upstream licenses.
