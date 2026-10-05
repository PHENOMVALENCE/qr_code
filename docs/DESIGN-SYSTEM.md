# QR Studio Design System

## Design intent
QR Studio should feel like a focused creator tool: modern, calm, fast and professional. The interface must prioritize the sequence **choose content → configure → verify → export**.

## Principles
- Keep the generated QR visible whenever practical.
- Use progressive disclosure; advanced options should not overwhelm first-time users.
- Maintain strong contrast and visible focus states.
- Prefer clear labels over icon-only controls for primary actions.
- Avoid decorative effects that reduce readability or scan confidence.
- Mobile is a first-class layout, not a compressed desktop view.

## Visual hierarchy
1. Product/header actions.
2. Content type and payload fields.
3. Live QR preview.
4. Design controls.
5. Export actions.
6. Secondary information and developer credit.

## Layout
### Desktop
- Maximum working width: approximately 1200–1240px.
- Content entry spans the primary workspace width.
- Customization and preview use a two-column layout.
- Preview remains sticky where viewport size allows.

### Tablet
- Collapse the studio to a single column before controls become cramped.
- Preview may appear before long customization controls.

### Mobile
- Single-column flow.
- Content type selector scrolls horizontally.
- Primary actions should be full-width or easy to reach.
- Target minimum touch size: ~44px.
- Future direction: `Content / Design / Preview / Export` step navigation.

## Tokens
Base tokens live in `css/styles.css`; refinement tokens live in `css/studio-refresh.css`.

Core semantic token categories:
- `--bg` / background canvas.
- `--surface` / cards and controls.
- `--text` / high-emphasis content.
- `--text-muted` / supporting copy.
- `--border` / low-emphasis separation.
- `--primary` / main brand and action color.
- `--accent` / supporting highlight.
- `--error` / destructive or invalid state.
- `--success` / confirmation and validation state.

Do not hard-code new brand colors throughout components. Add or reuse semantic tokens.

## Typography
Primary family: DM Sans with system fallbacks.

Guidelines:
- Product title: bold, compact tracking.
- Section titles: 600 weight.
- Body and form copy: 400–500.
- Labels must remain readable at mobile sizes.
- Avoid excessive uppercase; reserve it for small badges/status markers.

## Cards and surfaces
- Rounded corners should feel consistent across cards and controls.
- Use restrained shadows; avoid heavy floating-card aesthetics.
- Hover elevation must be subtle and must not shift layout.
- Dark mode must preserve surface separation.

## Forms
- Labels appear above controls unless a compact paired layout is clearly superior.
- Inputs need strong focus rings.
- Validation messages should be close to the failing control or section.
- Use native input types where possible.
- Never rely only on color to communicate state.

## QR preview
The preview is the product's visual anchor.
- Keep generous whitespace around the QR.
- Use a neutral/checkerboard preview treatment for transparency.
- Do not place decorative overlays on the generated QR itself.
- Show future scanability warnings outside the QR area.

## Buttons
Primary actions:
- Generate
- Download/export

Secondary actions:
- Copy
- Print
- Reset
- Undo
- Save design

Destructive actions should receive distinct treatment when introduced.

## Motion
- Keep transitions around 100–250ms for common UI states.
- Respect `prefers-reduced-motion`.
- Motion should explain state change, not decorate routine interactions.

## Accessibility baseline
- Semantic landmarks and headings.
- Keyboard reachable controls.
- `:focus-visible` treatment.
- ARIA only where native semantics are insufficient.
- Useful live regions for generation/export status.
- Contrast targets aligned with WCAG AA for normal UI text.

## New feature patterns
### Presets
Present as compact visual cards with name, miniature QR treatment and Apply action.

### History
Show name/type, date, small preview and actions: Open, Duplicate, Delete.

### Scanability score
Use a score plus plain-language diagnostics. Never claim guaranteed scan success.

### Batch generation
Separate setup from results. Results should support select-all and ZIP export.

## Review checklist
Before merging UI changes, verify:
- desktop at 1440px and 1024px;
- mobile near 390px and 360px;
- light and dark themes;
- long labels/URLs;
- horizontal content-type overflow;
- keyboard tab order;
- preview stays usable while editing;
- no QR cropping or control overlap.
