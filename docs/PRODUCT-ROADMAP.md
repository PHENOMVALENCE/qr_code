# QR Studio — Product Roadmap

## Product direction
Transform the project from a basic generator into a polished, privacy-first QR creation studio that remains fast and useful without an account.

## Current strengths
- Ten QR payload types: URL, text, phone, SMS, WhatsApp, email, Wi-Fi, vCard, location and calendar event.
- Live styling with colors, gradients, dot/corner styles and center logo.
- PNG, SVG and PDF exports, clipboard, print, undo and dark mode.
- Five reusable visual design presets.
- Local project history plus JSON design import/export.
- QR readiness diagnostics for contrast, size, payload density, error correction and logo usage.
- Optional lightweight PHP design persistence.

## Phase 1 — UX refresh
- [x] Studio-style responsive workspace with sticky preview on desktop.
- [x] Horizontally scrollable content-type selector on small screens.
- [x] Stronger hierarchy, spacing, form states and export controls.
- [ ] Complete visual QA at 320, 375, 768, 1024 and 1440px widths.
- [x] Preserve keyboard navigation, reduced-motion behavior and contrast foundations.

## Phase 2 — Creator features
- [x] Reusable visual design presets.
- [x] Recent QR project history stored locally.
- [x] Save/load design JSON locally, independent of the PHP backend.
- [x] Dedicated WhatsApp click-to-chat QR payload with optional pre-filled message.
- [ ] Add purpose-built templates for social links, Wi-Fi cards, business cards, events and payments.
- [ ] Add rename/delete actions for individual local history items.
- [ ] Logo sizing, margin and background controls.
- [ ] Frame styles and CTA captions such as “Scan me”.
- [ ] Batch QR generation from CSV with ZIP export.

## Phase 3 — Quality and safety
- [x] QR readiness indicator for contrast, export size, payload density, logo use and error correction.
- [x] URL normalization and stronger validation for phone/email/location/event fields.
- [x] Escape Wi-Fi, vCard and iCalendar special characters more safely.
- [ ] Add actual encode/decode verification in-browser before export.
- [ ] File type, pixel dimension and file-size validation for uploaded logos.
- [ ] Security headers and stricter PHP persistence validation.
- [ ] Automated unit tests for every payload builder.
- [ ] Browser smoke tests covering generation, preset restore, local history and JSON import/export.

## Phase 4 — Installable web app
- [ ] Web app manifest, icons and offline shell.
- [ ] Share Target / Web Share support where available.
- [ ] Install prompt and offline generation.

## Later SaaS track
These features require a persistent backend and are intentionally separated from the privacy-first static generator:
- Dynamic QR destinations that can be edited without reprinting the QR.
- Scan analytics and campaign dashboards.
- Expiration rules and scan limits.
- Smart device redirects.
- Hosted file QR codes.
- Team workspaces and authenticated project syncing.

## Engineering rules
- Keep core generation client-side and privacy-first.
- Avoid requiring authentication for basic generation/export.
- Prefer progressive enhancement over framework migration unless complexity justifies it.
- Keep dependencies minimal and pinned.
- Run CI on pull requests before merge.
- New product modules should remain independently testable and should not tightly couple to the QR renderer.
