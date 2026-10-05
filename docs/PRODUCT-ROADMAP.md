# QR Studio — Product Roadmap

## Product direction
Transform the project from a basic generator into a polished, privacy-first QR creation studio that remains fast and useful without an account.

## Current strengths
- Nine QR payload types: URL, text, phone, SMS, email, Wi-Fi, vCard, location and calendar event.
- Live styling with colors, gradients, dot/corner styles and center logo.
- PNG, SVG and PDF exports, clipboard, print, undo and dark mode.
- Optional lightweight PHP design persistence.

## Phase 1 — UX refresh
- Studio-style responsive workspace with sticky preview on desktop.
- Horizontally scrollable content-type selector on small screens.
- Stronger hierarchy, spacing, form states and export controls.
- Mobile-first QA at 320, 375, 768, 1024 and 1440px widths.
- Preserve keyboard navigation, reduced-motion behavior and contrast.

## Phase 2 — Creator features
- Reusable presets/templates for social links, Wi-Fi cards, business cards, events and payments.
- Recent QR history stored locally with duplicate, rename and delete actions.
- Save/load design JSON locally, independent of the PHP backend.
- Logo sizing, margin and background controls.
- Frame styles and CTA captions such as “Scan me”.
- Batch QR generation from CSV with ZIP export.

## Phase 3 — Quality and safety
- QR scanability/contrast indicator before export.
- URL normalization and stronger validation for phone/email/location/event fields.
- Escape vCard/iCalendar special characters correctly.
- File type and file-size validation for uploaded logos.
- Security headers and stricter PHP persistence validation.
- Automated smoke tests for every payload builder.

## Phase 4 — Installable web app
- Web app manifest, icons and offline shell.
- Share Target / Web Share support where available.
- Install prompt and offline generation.

## Engineering rules
- Keep core generation client-side and privacy-first.
- Avoid requiring authentication for basic generation/export.
- Prefer progressive enhancement over framework migration unless complexity justifies it.
- Keep dependencies minimal and pinned.
- Run CI on pull requests before merge.
