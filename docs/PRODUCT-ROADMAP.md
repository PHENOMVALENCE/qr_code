# QR Studio — Product Roadmap

## Product direction
QR Studio is now a production-focused, privacy-first QR creation studio that remains fast and useful without an account. Core generation is browser-side; the optional PHP persistence API is isolated from the generator.

## Production feature set
- Ten QR payload types: URL, text, phone, SMS, WhatsApp, email, Wi-Fi, vCard, location and calendar event.
- Live styling with colors, gradients, dot/corner styles, center logo and logo sizing/clear-space controls.
- PNG, SVG, PDF and framed-PNG exports, clipboard, print, Web Share, undo and dark mode.
- Five reusable visual presets plus website, social, WhatsApp, Wi-Fi, business-card, event, menu and payment templates.
- Local project history with restore/rename/delete plus JSON design import/export.
- QR readiness diagnostics and in-browser decode verification.
- CSV batch generation with ZIP export for up to 100 QR codes.
- Installable PWA, app icon, service worker, cached runtime dependencies, Share Target intake and online/offline UX.
- Hardened optional PHP design persistence.
- Automated payload tests, browser smoke tests and responsive QA in PR CI.

## Phase 1 — UX refresh
- [x] Studio-style responsive workspace with sticky preview on desktop.
- [x] Horizontally scrollable content-type selector on small screens.
- [x] Stronger hierarchy, spacing, form states and export controls.
- [x] Automated responsive QA at 320, 375, 768, 1024 and 1440 px widths.
- [x] Preserve keyboard navigation, reduced-motion behavior and contrast foundations.

## Phase 2 — Creator features
- [x] Reusable visual design presets.
- [x] Recent QR project history stored locally.
- [x] Save/load design JSON locally, independent of the PHP backend.
- [x] Dedicated WhatsApp click-to-chat QR payload with optional pre-filled message.
- [x] Rename/delete actions for individual local history items.
- [x] Logo sizing and clear-space controls.
- [x] Frame styles and CTA captions such as “Scan me”.
- [x] Framed PNG export.
- [x] Purpose-built website, social, Wi-Fi, WhatsApp, business-card, event, menu and payment-link templates.
- [x] Batch QR generation from CSV with ZIP export.

## Phase 3 — Quality and safety
- [x] QR readiness indicator for contrast, export size, payload density, logo use and error correction.
- [x] URL normalization and stronger validation for phone/email/location/event fields.
- [x] Escape Wi-Fi, vCard and iCalendar special characters more safely.
- [x] Actual encode/decode verification in-browser before export.
- [x] Validate uploaded logo MIME type, maximum file size and pixel dimensions.
- [x] Security headers and stricter PHP persistence validation.
- [x] Automated unit tests for every payload builder.
- [x] Browser smoke tests covering generation, templates, local history and production workspace loading.
- [x] Static asset and manifest checks in PR CI.

## Phase 4 — Installable web app
- [x] Web app manifest and app icon.
- [x] Service worker and offline application shell.
- [x] Critical QR runtime dependency caching for repeat offline use.
- [x] Install-prompt UX where supported.
- [x] Web Share support where available.
- [x] PWA Share Target intake for links/text shared into QR Studio.
- [x] Online/offline status indicator.

## Production gate
The static-first QR Studio feature track is complete when PR CI is green and the deployment checklist in `docs/PRODUCTION-READINESS.md` is satisfied on the target domain.

## Separate SaaS track
The following capabilities are intentionally **not part of the static QR Studio release** because they require authenticated persistent infrastructure, privacy/retention policies, abuse prevention and operational monitoring:
- Dynamic QR destinations that can be edited without reprinting.
- Scan analytics and campaign dashboards.
- Expiration rules and scan limits.
- Password-protected hosted destinations.
- Smart device redirects.
- Hosted file QR codes.
- Event check-in/ticket validation systems.
- Team workspaces and authenticated cloud project syncing.

These should be developed as a separate backend product rather than weakening the security and privacy model of the static generator.

## Engineering rules
- Keep core generation client-side and privacy-first.
- Avoid requiring authentication for basic generation/export.
- Prefer progressive enhancement over framework migration unless complexity justifies it.
- Keep dependencies minimal and pinned.
- Run CI on pull requests before merge.
- New modules should remain independently testable and should not tightly couple to the QR renderer.
