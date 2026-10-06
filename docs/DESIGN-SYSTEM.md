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
- No application-level horizontal scrolling is allowed at supported widths.

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
- Preview appears before long customization controls.
- Template and workspace grids reduce progressively rather than squeezing cards.

### Mobile
- Single-column flow.
- Content type selector scrolls horizontally inside its own container; the page itself must never overflow horizontally.
- Preview stays above customization so users can see output before entering long design controls.
- Primary actions are full-width or arranged in compact two-column grids where the labels remain readable.
- Target minimum touch size: 44px for primary controls.
- Form controls use at least 16px text on narrow screens to avoid iOS Safari focus zoom.
- QR canvases/SVGs must shrink to the available preview width without cropping.
- Long URLs, labels, filenames, status text and history names must wrap or truncate safely.
- Code/CSV examples may scroll inside their own surface, never the whole page.

### Small-screen breakpoints
Responsive QA uses these practical ranges:
- **≤ 1100px:** reduce workspace gutters and multi-column density.
- **≤ 980px:** collapse creator/production grids and disable sticky preview behavior.
- **≤ 760px:** preview-first single-column workspace; export/header actions become grid-based.
- **≤ 600px:** phone layout, 16px form text, single-column export and template flows.
- **≤ 420px:** reduce internal card/preview padding and compact secondary controls.
- **≤ 340px:** extreme narrow-device fallback; header actions become one column and QR preview is further constrained.

The automated suite additionally checks widths of **280, 320, 340, 360, 375, 390, 412, 430, 600, 768, 1024 and 1440px**.

## Tokens
Base tokens live in `css/styles.css`; refinement tokens live in `css/studio-refresh.css`. The final production-responsive override layer is in `css/production-tools.css` because it loads after the progressive enhancement styles.

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
- Interactive form text must remain at least 16px on phone breakpoints where browser zoom behavior would otherwise degrade usability.

## Cards and surfaces
- Rounded corners should feel consistent across cards and controls.
- Use restrained shadows; avoid heavy floating-card aesthetics.
- Hover elevation must be subtle and must not shift layout.
- Dark mode must preserve surface separation.
- Grid/flex children must use `min-width: 0` where content could otherwise force overflow.

## Forms
- Labels appear above controls unless a compact paired layout is clearly superior.
- Inputs need strong focus rings.
- Validation messages should be close to the failing control or section.
- Use native input types where possible.
- Never rely only on color to communicate state.
- Inputs, selects, textareas and file controls must stay within their card at 280px and wider.
- Color and gradient controls must reflow rather than force a fixed desktop width.

## QR preview
The preview is the product's visual anchor.
- Keep generous whitespace around the QR.
- Use a neutral/checkerboard preview treatment for transparency.
- Do not place decorative overlays on the generated QR itself.
- Show scanability warnings outside the QR area.
- Canvas/SVG output must use `max-width: 100%` and automatic height.
- CTA frames must remain inside the viewport at narrow widths.

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

Destructive actions should receive distinct treatment when introduced. On touch devices, primary controls should be approximately 44px high or larger.

## Motion
- Keep transitions around 100–250ms for common UI states.
- Respect `prefers-reduced-motion`.
- Motion should explain state change, not decorate routine interactions.
- Avoid hover-only layout movement on coarse-pointer/touch devices.

## Accessibility baseline
- Semantic landmarks and headings.
- Keyboard reachable controls.
- `:focus-visible` treatment.
- ARIA only where native semantics are insufficient.
- Useful live regions for generation/export status.
- Contrast targets aligned with WCAG AA for normal UI text.
- Touch targets remain usable on narrow screens.

## New feature patterns
### Presets
Present as compact visual cards with name, miniature QR treatment and Apply action. On phones they may use an internally scrollable horizontal row.

### History
Show name/type, date, small preview and actions: Open, Duplicate, Delete. Action rows must collapse below content on phones.

### Scanability score
Use a score plus plain-language diagnostics. Never claim guaranteed scan success.

### Batch generation
Separate setup from results. Results should support select-all and ZIP export. CSV/code samples may scroll within their own panel.

## Review checklist
Before merging UI changes, verify:
- desktop at 1440px and 1024px;
- tablet at 768px and 600px;
- phones at 430, 412, 390, 375, 360, 340, 320 and 280px;
- light and dark themes;
- long labels/URLs;
- content selector/preset internal scrolling;
- keyboard tab order;
- touch target sizes;
- preview stays usable while editing;
- QR/frame is never cropped;
- no page-level horizontal overflow before or after generation/template application.
