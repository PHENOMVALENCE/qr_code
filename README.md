# QR Code Generator

A modern, responsive web application for creating **customizable QR codes** that redirect to a user-defined link or encode any text. No account required, no paid APIs — runs entirely in the browser (with optional PHP backend for saving designs).

## Features

### Core
- **URL or text input** — Encode any URL or plain text (up to 2000 characters)
- **Instant generation** — QR code updates live as you type (no page reload)
- **Live preview** — See changes immediately while editing content and options

### Customization
- **Colors** — Foreground and background (hex or color picker)
- **Gradient** — Linear gradient for foreground with angle (0°, 45°, 90°, 135°, 180°)
- **Size & resolution** — 128–1024 px in 32 px steps
- **Error correction** — L, M, Q, H (higher = more durable, larger code)
- **Corner style** — Square, extra-rounded, dot, rounded, dots, classy, classy-rounded
- **Dot style** — Square, rounded, dots, classy, classy-rounded, extra-rounded
- **Label** — Optional text below (or “inside” option for layout) the QR code
- **Logo / image** — Upload an image to embed in the center
- **Transparent background** — Toggle for PNG/SVG export

### User experience
- Clean, intuitive UI with clear sections
- Mobile-friendly layout
- Form validation for content length and URLs
- **Reset** — Clear all fields and preview
- **Undo** — Restore previous state (last 20 steps)
- **Dark mode** — Toggle; respects `prefers-color-scheme` and persists in `localStorage`

### Export & output
- **Download PNG** — High-quality raster image
- **Download SVG** — Scalable vector
- **Download PDF** — Print-ready (via jsPDF)
- **Copy to clipboard** — Copy QR image (where Clipboard API is supported)
- **Print** — Open print dialog with QR image
- **Save design** (optional) — Persist design + image on server via `api/save-design.php`

## Technology stack

- **Frontend:** HTML5, CSS3, JavaScript (vanilla, no framework)
- **Libraries:**
  - [qr-code-styling](https://github.com/kozakdenys/qr-code-styling) — QR generation and styling (CDN)
  - [jsPDF](https://github.com/parallax/jsPDF) — PDF export (CDN)
- **Optional backend:** PHP 7.4+ (for Save design API)
- **No database required** — Save design uses file-based storage in `data/designs/`

## Setup instructions

### 1. Run locally (frontend only)

1. Clone or copy the project into a folder (e.g. `qr_code`).
2. Serve the folder with any HTTP server:
   - **XAMPP:** Place under `htdocs/qr_code` and open `http://localhost/qr_code/`
   - **PHP built-in:** From project root run `php -S localhost:8080` and open `http://localhost:8080`
   - **Node:** e.g. `npx serve .` and open the URL shown
3. Open `index.html` in a browser (or via the server URL).  
   Export and preview work without a backend. **Save design** will fail until the PHP API is available.

### 2. Optional: Enable “Save design” (PHP)

1. Ensure PHP is available (e.g. XAMPP Apache + PHP).
2. Ensure the project is served from a URL (e.g. `http://localhost/qr_code/`).
3. Create a writable directory for saved designs:
   ```bash
   mkdir -p data/designs
   chmod 755 data/designs   # or 775 if your server user is different
   ```
4. Call the save API from the app (button “Save design”).  
   Designs are stored as:
   - `data/designs/{id}.json` — design metadata and options
   - `data/designs/{id}.png` — exported PNG (if provided)

### 3. Deploy on shared hosting

1. Upload the project (e.g. via FTP) to a folder under your domain (e.g. `public_html/qr_code`).
2. Create `data/designs` and make it writable (e.g. 755 or 775).
3. Open `https://yourdomain.com/qr_code/` (or the path you used).  
   No database or extra extensions are required; only PHP and write access to `data/designs` for saving.

## Project structure

```
qr_code/
├── index.html          # Main app
├── css/
│   └── styles.css      # Layout, theming, responsive, dark mode
├── js/
│   ├── app.js          # UI, validation, export, clipboard, reset/undo, dark mode
│   └── qr-generator.js # QR options builder, qr-code-styling wrapper
├── api/                 # Optional PHP backend
│   ├── save-design.php # POST: save design + optional PNG
│   └── get-design.php  # GET ?id=xxx: return saved design JSON
├── data/
│   └── designs/        # Saved designs (created by save-design.php)
├── README.md
└── .gitignore
```

## Example QR code

To generate an example QR code:

1. Open the app.
2. In **Content**, enter: `https://example.com`
3. Optionally set size (e.g. 300 px), colors, and corner/dot style.
4. Use **Download PNG** or **Download SVG** to export.

The same URL (`https://example.com`) is used in the README as the example target; the generated QR will point to that page.

## Accessibility & performance

- Semantic HTML and ARIA where helpful (e.g. `aria-label`, `aria-live` for messages).
- Keyboard focus and `:focus-visible` styles.
- `prefers-reduced-motion` respected in CSS.
- Preview updates are debounced (~150 ms) to avoid excessive redraws while typing.
- No external paid services; all generation and export run in the browser (except optional save).

## Browser support

- Modern browsers with ES5+ and Canvas/SVG support (Chrome, Firefox, Safari, Edge).
- Clipboard copy requires a secure context (HTTPS or localhost) and support for `navigator.clipboard.write` and `ClipboardItem`.

## License

Use and modify freely. QR generation uses [qr-code-styling](https://github.com/kozakdenys/qr-code-styling) (MIT). jsPDF has its own license; see the library documentation.
