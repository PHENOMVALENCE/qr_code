# Agent Guide

This guide is for AI coding agents and human contributors using agent-assisted workflows.

## Start here
Read, in order:
1. `AGENTS.md`
2. `docs/ARCHITECTURE.md`
3. `docs/DESIGN-SYSTEM.md` for UI work
4. `docs/GIT-WORKFLOW.md` before committing
5. `docs/PRODUCT-ROADMAP.md` for feature priority

## Operating mode
Work in small, reviewable increments. Avoid broad rewrites when a focused change can achieve the same result. Keep the frontend framework-free unless a documented architectural decision explicitly changes that direction.

## Change planning
Before implementation:
- identify affected files;
- identify existing behavior that must remain intact;
- define acceptance criteria;
- decide whether the feature is frontend-only or backend-dependent;
- note mobile, accessibility and QR scanability implications.

## Implementation sequence
Preferred order:
1. data/payload model;
2. business logic;
3. UI controls;
4. visual styling;
5. validation/error states;
6. tests/checks;
7. documentation.

## Commit discipline
Use cohesive commits. Examples:
- `feat(ui): add preset selector`
- `feat(history): persist recent designs locally`
- `fix(qr): escape wifi payload delimiters`
- `docs(design): document preview behavior`
- `test(smoke): verify required assets load`

Do not combine unrelated refactors, docs and feature behavior into a single large commit when they can be safely separated.

## Pull requests
Every feature branch should have one active PR. Keep its description current as new commits are added. Include:
- user-facing outcome;
- technical implementation;
- validation performed;
- known limitations;
- screenshots for substantial UI work when available.

## Frontend guardrails
- Do not duplicate QR payload construction outside `js/content-types.js`.
- Do not manipulate qr-code-styling directly from multiple modules if the behavior belongs in `js/qr-generator.js`.
- Keep application orchestration in `js/app.js` until modularization is intentionally introduced.
- Keep new CSS token-driven and responsive.
- Do not introduce a visual option that produces obviously unreliable QR contrast without warning the user.

## Persistence guardrails
Local-only functionality should prefer `localStorage` or downloadable JSON where appropriate. Server persistence remains optional. Features should not make the core generator unusable when the PHP API is unavailable.

## Security guardrails
Never trust:
- uploaded file names;
- MIME declarations from the client;
- design IDs supplied by a user;
- encoded text used in HTML output;
- paths sent to PHP endpoints.

Avoid injecting untrusted values with `innerHTML`.

## Documentation responsibilities
Update documentation when changing:
- repository structure;
- state ownership;
- content payload formats;
- API behavior;
- design tokens/patterns;
- CI rules;
- contributor workflow.

## Completion report
When finishing an agent task, report:
- commits created;
- files changed;
- checks performed;
- PR number/link;
- next logical implementation step.
