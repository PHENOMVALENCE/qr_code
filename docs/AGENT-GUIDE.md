# Agent Guide

This guide is for AI coding agents and human contributors using agent-assisted workflows on QR Studio.

## Start here
Read, in order:
1. `AGENTS.md`
2. `docs/ARCHITECTURE.md`
3. `docs/DESIGN-SYSTEM.md` for UI work
4. `docs/GIT-WORKFLOW.md` before committing
5. `docs/PRODUCT-ROADMAP.md` for scope
6. `docs/PRODUCTION-READINESS.md` for release work

## Operating mode
Work in small, reviewable increments. Avoid broad rewrites when a focused change achieves the same result. Keep the frontend framework-free unless a documented architectural decision explicitly changes that direction.

The current product is deliberately static-first. Do not mix future SaaS concerns (authentication, analytics, hosted files, dynamic redirect management) into the static generator without an explicit backend architecture.

## Change planning
Before implementation:
- identify affected files/modules;
- identify behavior that must remain intact;
- define acceptance criteria;
- decide whether the feature belongs in core, studio, pro or production enhancement layers;
- identify PWA/CSP implications for new runtime dependencies;
- note mobile, accessibility, privacy and QR scanability implications;
- define tests before calling the work complete.

## Implementation sequence
Preferred order:
1. payload/data model;
2. renderer/business logic;
3. UI controls;
4. visual styling;
5. validation/error states;
6. unit/browser checks;
7. security/PWA review where relevant;
8. documentation.

## Module ownership
- Payload generation/validation: `js/content-types.js`
- QR renderer options: `js/qr-generator.js`
- Core events/export/persistence UI: `js/app.js`
- Presets/history/JSON exchange: `js/studio-tools.js`
- Readiness heuristics: `js/qr-diagnostics.js`
- Logo/frame/decode/PWA bootstrap: `js/pro-tools.js`
- Compatibility/final bootstrap: `js/pro-tools-fixes.js`
- Templates/batch/share/install/offline: `js/production-tools.js`
- PWA share intake: `js/share-target.js`
- Offline caching: `sw.js`
- Optional server persistence: `api/`

Do not duplicate logic across these boundaries without a documented reason.

## Commit discipline
Use cohesive Conventional Commit-style messages. Examples:
- `feat(templates): add business card workflow`
- `feat(batch): export CSV rows as QR ZIP`
- `fix(qr): preserve logo clear-space setting`
- `security(api): bound persisted PNG uploads`
- `test(e2e): verify mobile overflow`
- `docs(prod): update deployment gate`

## Pull requests
Every feature branch should have one active PR. Keep the description current. Include:
- user-facing outcome;
- technical implementation;
- security/privacy implications;
- validation performed;
- known limitations/scope boundaries;
- screenshots for substantial UI work when available.

## Frontend guardrails
- Do not duplicate QR payload construction outside `js/content-types.js`.
- Renderer-specific configuration belongs in `js/qr-generator.js`.
- Keep new CSS responsive and compatible with both themes.
- Avoid page-level horizontal overflow; horizontal scrolling is only intentional inside content/preset strips.
- Never present a readiness score as guaranteed physical-device scan success.
- Preserve progressive enhancement: failure of a studio/pro module must not destroy the base generator.

## Runtime dependency guardrails
When adding/changing browser CDN dependencies:
1. pin a version;
2. update `.htaccess` CSP;
3. update `sw.js` if the dependency is needed offline;
4. update docs;
5. add CI/browser validation.

Do not add a runtime dependency for functionality that can be safely implemented in a small local module.

## Persistence/security guardrails
Local-only functionality should prefer `localStorage` or downloadable JSON. The PHP API remains optional.

Never trust:
- upload names or MIME declarations;
- unbounded base64 content;
- arbitrary option keys;
- design IDs supplied by users;
- encoded text inserted into HTML;
- filesystem paths supplied by clients.

Keep `data/designs` inaccessible directly from the web server.

## Test expectations
For payload changes:
```bash
node tests/content-types.test.js
```

For production UI/PWA changes:
```bash
npm install
npx playwright install chromium
npm run test:e2e
```

CI is the merge gate and additionally runs JavaScript syntax checks, PHP lint, manifest validation and static asset smoke tests.

## Documentation responsibilities
Update documentation when changing:
- repository structure/module ownership;
- payload formats;
- API behavior;
- runtime dependencies/CSP;
- PWA/offline behavior;
- design patterns;
- CI/release process;
- product scope boundaries.

## Completion report
When finishing an agent task, report:
- commits created;
- files changed;
- checks performed and CI state;
- PR number/link;
- deployment-only validation still required, if any.
