---
id: T-026
title: Move lean validation to product outcomes and consequential choices
status: done
profile: solo
harness: 0.12.0
goal: Let agents close routine work with evidence while humans validate product behavior and approve consequential choices and releases.
decisions: [D-036]
implements: [FR-14, FR-15, FR-16, FR-17]
---

## Sources

- `docs/project/brief.md` — low ceremony and user-facing value
- `docs/sdd/HARNESS.md`, `docs/sdd/ROLES.md` — current gates and responsibilities
- `pilot/contract.md`, `scripts/harness-lint.mjs` — lean task and executable closure
- User direction, 2026-09-26 — test the product; govern stack, deployment, and resource cost

## Scope

- Add risk-based lean validation and human-readable previews or decision summaries.
- Require human choice evidence for new lean foundation decisions while retaining old decisions.
- Assess resource impact at task start and record before/after checks for affected runtime paths.
- Document a deployment policy with approval for first and high-risk production releases.
- Preserve standard and lean 0.11 closure behavior; keep changes inside record budgets.

## Out of Scope

- Authenticating the identity behind a Markdown approval line.
- Deploying an adopter project or configuring its hosting provider.
- Claiming the new workflow saves tokens before T-024's real-project measurements.

## Acceptance Criteria

- [x] WHEN a current lean routine task closes THE SYSTEM SHALL require checks and resource
  classification without requiring human acceptance on that technical task.
- [x] WHEN a product or consequential lean task closes THE SYSTEM SHALL require human acceptance;
  product work supplies a usable preview and consequential work an independent verifier.
- [x] WHEN a lean task affects runtime consumption THE SYSTEM SHALL record before/after resource
  commands and their bounded observations before closure.
- [x] WHEN a new lean project settles foundation choices THE SYSTEM SHALL require a recorded human
  choice, including an approved production release policy for deployment.
- [x] WHEN standard or a lean 0.11 task closes THE SYSTEM SHALL retain its earlier rules.

## Verification

- Baseline: `npm run check`
- Final: `npm run check`
- Task-specific: install new lean fixtures, close each validation class, reject missing resource
  measurements or foundation choice, and verify legacy standard and lean closure tests.

## Outcome

- Lean 0.12 classifies routine, product, and consequential work. Agents close routine tasks with
  executed checks; product tasks include a preview for human acceptance; consequential tasks add
  independent review and a recorded human choice.
- Runtime paths classified as measured need comparable before/after command records. New foundation
  decisions record a human choice and production release policy, with controls for guarded automation.
- Verified: `npm run check` passed, 127/127 tests and lint clean, including new lean, legacy lean,
  and standard cases; `docs/sdd/` is 587 lines, below the 600-line project budget.
- Residual risk: Markdown approval records do not prove identity, and hosting controls must enforce
  release approval. T-024 still needs real-project measurements of tokens, time, and resource results.

## Trace

- 2026-09-26 — read: STATUS, harness config, current contracts and gates · did: scoped the
  approved risk-based change · checks: baseline 121/121 and lint clean · assumption: file records
  can show an approval claim but cannot authenticate the human who made it.
- 2026-09-26 — read: installed templates, source rules, decision and pilot records · did: implemented
  risk-based lean closure, resource evidence, foundation and release choices, and regression tests
  · checks: 127/127 and lint clean · follow-up: T-024 measures results in real projects.
