# Git Workflow

## Branching model
`main` is the protected production branch conceptually, even if repository settings do not yet enforce protection.

Create short-lived branches using:
- `feat/<scope>` for features
- `fix/<scope>` for bug fixes
- `docs/<scope>` for documentation-only work
- `refactor/<scope>` for non-functional restructuring
- `chore/<scope>` for tooling/maintenance

Examples:
- `feat/qr-presets`
- `feat/batch-generation`
- `fix/wifi-escaping`
- `docs/architecture`

## Pull request policy
Feature work should be merged through a PR. CI is intended to run on PR open/update events. Keep one focused PR per logical workstream.

A PR should explain:
- what changed;
- why it changed;
- user impact;
- validation completed;
- follow-up work or known limitations.

## Commit style
Use Conventional Commit style where practical:

```text
feat(ui): add QR template cards
fix(api): reject unsafe design ids
docs(agent): document repository workflow
test(ci): add static JavaScript checks
refactor(qr): isolate preset mapping
```

### Rules
- Use imperative wording.
- Keep commits small enough to review.
- Do not mix unrelated changes.
- Documentation updates may be separate commits when they describe a broader contract.
- Avoid noisy formatting-only commits mixed with behavioral changes.

## Recommended feature cycle
1. Sync with `main`.
2. Create feature branch.
3. Implement one cohesive unit.
4. Run local checks.
5. Commit with clear message.
6. Repeat in small increments.
7. Push branch.
8. Open/update PR.
9. Review CI and fix failures.
10. Merge only when the PR is coherent and validated.

## Conflict handling
Prefer rebasing or merging current `main` into a long-lived feature branch before final review. Resolve conflicts intentionally; do not blindly choose one side when files contain parallel product work.

## CI expectation
PR CI should check at minimum:
- JavaScript syntax;
- PHP syntax when PHP is available/configured;
- required production files;
- basic HTML asset references;
- repository documentation presence.

Future phases should add browser smoke tests, Lighthouse/accessibility checks and QR encode/decode verification.

## Release discipline
For this project, Vercel/static deployment may follow `main`. Therefore treat merging as a production action. Avoid merging experimental UI directly without at least basic mobile and desktop verification.
