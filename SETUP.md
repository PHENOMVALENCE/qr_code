# Setup Instructions

## Quick start (no server)

1. Open the project folder in a browser or serve it with any HTTP server.
2. **XAMPP:** Copy the `qr_code` folder to `htdocs`, then visit:  
   `http://localhost/qr_code/`
3. Enter a URL or text in **Content**, customize options, and use **Download PNG** or **Download SVG**.

No backend is required for generation and export.

## Optional: Save design (PHP)

1. Ensure PHP is installed and the app is served via a URL (e.g. `http://localhost/qr_code/`).
2. Create the data directory and make it writable:
   ```bash
   mkdir -p data/designs
   chmod 755 data/designs
   ```
3. Use the **Save design** button in the app. Designs are stored in `data/designs/` as JSON + PNG.

## Deploy on shared hosting

1. Upload the entire `qr_code` folder to your host (e.g. `public_html/qr_code`).
2. Create `data/designs` and set permissions to 755 (or 775 if required).
3. Open `https://yourdomain.com/qr_code/` in a browser.

No database or extra PHP extensions are needed.
